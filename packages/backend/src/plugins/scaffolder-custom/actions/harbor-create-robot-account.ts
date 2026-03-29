/**
 * Harbor Create Robot Account Action
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';

export function createHarborRobotAccountAction(options: { config: Config }) {
  const { config } = options;

  return createTemplateAction({
    id: 'harbor:create-robot-account',
    schema: {
      input: z => z.object({
        projectName: z.string().describe('Harbor Project Name'),
        robotName: z.string().describe('Robot Account Name'),
        description: z.string().default('CI/CD robot account').optional(),
        expiresAt: z.number().default(-1).optional(),
      }),
      output: z => z.object({
        robotId: z.number(),
        robotName: z.string(),
        robotSecret: z.string(),
      }),
    },
    async handler(ctx) {
      const { projectName, robotName, description, expiresAt } = ctx.input;

      const harborUrl = config.getOptionalString('harbor.url') || 'https://harbor.company.com';
      const harborUsername = config.getOptionalString('harbor.username');
      const harborPassword = config.getOptionalString('harbor.password');

      if (!harborUsername || !harborPassword) {
        ctx.logger.warn('Warning: Harbor credentials not configured. Skipping robot account creation.');
        ctx.output('robotId', 0);
        ctx.output('robotName', robotName);
        ctx.output('robotSecret', '');
        return;
      }

      try {
        const apiUrl = `${harborUrl}/api/v2.0/projects/${projectName}/robots`;
        const auth = Buffer.from(`${harborUsername}:${harborPassword}`).toString('base64');

        const createResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: robotName,
            description: description || 'CI/CD robot account',
            expires_at: expiresAt || -1,
            access: [
              {
                resource: '/project',
                action: 'pull',
              },
              {
                resource: '/project',
                action: 'push',
              },
            ],
          }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.text();
          throw new InputError(`Failed to create Harbor robot account: ${error}`);
        }

        const robot = await createResponse.json();
        ctx.output('robotId', robot.id);
        ctx.output('robotName', robot.name);
        ctx.output('robotSecret', robot.secret);

        ctx.logger.info(`Harbor robot account created: ${robotName} (ID: ${robot.id})`);
        ctx.logger.warn(`Robot secret: ${robot.secret} - Store it securely!`);
      } catch (error: any) {
        ctx.logger.error(`Failed to create Harbor robot account: ${error.message}`);
        ctx.output('robotId', 0);
        ctx.output('robotName', robotName);
        ctx.output('robotSecret', '');
      }
    },
  });
}
