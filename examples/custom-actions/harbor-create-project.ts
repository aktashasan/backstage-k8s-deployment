/**
 * Custom Scaffolder Action: Create Harbor Project
 * 
 * This action creates a Harbor project and optionally configures it
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';

export function createHarborProjectAction(options: {
  config: Config;
}) {
  const { config } = options;

  return createTemplateAction({
    id: 'harbor:create-project',
    schema: {
      input: {
        required: ['projectName'],
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            title: 'Harbor Project Name',
            description: 'Name of the Harbor project to create',
          },
          public: {
            type: 'boolean',
            title: 'Public Project',
            description: 'Whether the project should be public',
            default: false,
          },
          autoScan: {
            type: 'boolean',
            title: 'Auto Scan',
            description: 'Enable automatic vulnerability scanning',
            default: true,
          },
          storageLimit: {
            type: 'number',
            title: 'Storage Limit (GB)',
            description: 'Storage limit in GB (-1 for unlimited)',
            default: -1,
          },
          registryUrl: {
            type: 'string',
            title: 'Harbor Registry URL',
            description: 'Override default Harbor URL',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          projectId: {
            type: 'number',
          },
          projectUrl: {
            type: 'string',
          },
          registryUrl: {
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      const { projectName, public: isPublic, autoScan, storageLimit, registryUrl } = ctx.input;

      // Get Harbor configuration
      const harborUrl = registryUrl || config.getString('harbor.url');
      const harborUsername = config.getString('harbor.username');
      const harborPassword = config.getString('harbor.password');

      if (!harborUrl || !harborUsername || !harborPassword) {
        throw new InputError(
          'Harbor configuration missing. Please set harbor.url, harbor.username, and harbor.password in app-config.yaml'
        );
      }

      try {
        // Harbor API v2.0 endpoint
        const apiUrl = `${harborUrl}/api/v2.0/projects`;

        // Check if project already exists
        const checkResponse = await fetch(`${apiUrl}?project_name=${encodeURIComponent(projectName)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${harborUsername}:${harborPassword}`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        });

        if (checkResponse.ok) {
          const existingProjects = await checkResponse.json();
          const existingProject = existingProjects.find((p: any) => p.name === projectName);

          if (existingProject) {
            ctx.logger.info(`Harbor project already exists: ${projectName}`);
            ctx.output('projectId', existingProject.project_id);
            ctx.output('projectUrl', `${harborUrl}/harbor/projects/${existingProject.project_id}`);
            ctx.output('registryUrl', harborUrl);
            return;
          }
        }

        // Create Harbor project
        const createResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${harborUsername}:${harborPassword}`).toString('base64')}`,
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
          const errorText = await createResponse.text();
          let errorMessage = `Failed to create Harbor project: ${errorText}`;

          // Handle specific error cases
          if (createResponse.status === 409) {
            errorMessage = `Harbor project '${projectName}' already exists`;
          } else if (createResponse.status === 401) {
            errorMessage = 'Harbor authentication failed. Check username and password.';
          } else if (createResponse.status === 403) {
            errorMessage = 'Harbor permission denied. Check user permissions.';
          }

          throw new InputError(errorMessage);
        }

        const project = await createResponse.json();

        ctx.output('projectId', project.project_id);
        ctx.output('projectUrl', `${harborUrl}/harbor/projects/${project.project_id}`);
        ctx.output('registryUrl', harborUrl);

        ctx.logger.info(`Harbor project created successfully: ${projectName} (ID: ${project.project_id})`);
      } catch (error) {
        ctx.logger.error(`Failed to create Harbor project: ${error}`);
        throw error;
      }
    },
  });
}
