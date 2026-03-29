/**
 * Harbor Create Project Action
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';

export function createHarborProjectAction(options: { config: Config }) {
  const { config } = options;

  return createTemplateAction({
    id: 'harbor:create-project',
    schema: {
      input: z => z.object({
        projectName: z.string().describe('Harbor Project Name'),
        public: z.boolean().default(false).optional(),
        autoScan: z.boolean().default(true).optional(),
        storageLimit: z.number().default(-1).optional(),
      }),
      output: z => z.object({
        projectId: z.number(),
        projectUrl: z.string(),
        registryUrl: z.string(),
      }),
    },
    async handler(ctx) {
      const { projectName, public: isPublic, autoScan, storageLimit } = ctx.input;

      const harborUrl = config.getOptionalString('harbor.url') || 'https://harbor.company.com';
      const harborUsername = config.getOptionalString('harbor.username');
      const harborPassword = config.getOptionalString('harbor.password');

      if (!harborUsername || !harborPassword) {
        ctx.logger.warn('Warning: Harbor credentials not configured. Skipping project creation.');
        ctx.output('projectId', 0);
        ctx.output('projectUrl', `${harborUrl}/harbor/projects`);
        ctx.output('registryUrl', harborUrl);
        return;
      }

      try {
        const apiUrl = `${harborUrl}/api/v2.0/projects`;
        const auth = Buffer.from(`${harborUsername}:${harborPassword}`).toString('base64');

        // Check if project exists
        const checkResponse = await fetch(`${apiUrl}?project_name=${encodeURIComponent(projectName)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        });

        if (checkResponse.ok) {
          const projects = await checkResponse.json();
          const existing = Array.isArray(projects) 
            ? projects.find((p: any) => p.name === projectName)
            : null;
          
          if (existing) {
            ctx.logger.info(`Harbor project already exists: ${projectName}`);
            ctx.output('projectId', existing.project_id);
            ctx.output('projectUrl', `${harborUrl}/harbor/projects/${existing.project_id}`);
            ctx.output('registryUrl', harborUrl);
            return;
          }
        }

        // Create project
        const createResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            project_name: projectName,
            metadata: {
              public: isPublic ? 'true' : 'false',
              auto_scan: autoScan ? 'true' : 'false',
            },
            storage_limit: storageLimit,
          }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.text();
          if (createResponse.status === 409) {
            ctx.logger.warn(`Warning: Harbor project '${projectName}' already exists`);
            ctx.output('projectId', 0);
            ctx.output('projectUrl', `${harborUrl}/harbor/projects`);
            ctx.output('registryUrl', harborUrl);
            return;
          }
          throw new InputError(`Failed to create Harbor project: ${error}`);
        }

        const project = await createResponse.json();
        ctx.output('projectId', project.project_id);
        ctx.output('projectUrl', `${harborUrl}/harbor/projects/${project.project_id}`);
        ctx.output('registryUrl', harborUrl);

        ctx.logger.info(`Harbor project created: ${projectName} (ID: ${project.project_id})`);
      } catch (error: any) {
        ctx.logger.error(`Failed to create Harbor project: ${error.message}`);
        // Don't fail the template execution
        ctx.output('projectId', 0);
        ctx.output('projectUrl', `${harborUrl}/harbor/projects`);
        ctx.output('registryUrl', harborUrl);
      }
    },
  });
}
