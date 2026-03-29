/**
 * Custom Scaffolder Action: Create Harbor Robot Account
 * 
 * This action creates a Harbor robot account for CI/CD pipelines
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';

export function createHarborRobotAccountAction(options: {
  config: Config;
}) {
  const { config } = options;

  return createTemplateAction({
    id: 'harbor:create-robot-account',
    schema: {
      input: {
        required: ['projectName', 'robotName'],
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            title: 'Harbor Project Name',
          },
          robotName: {
            type: 'string',
            title: 'Robot Account Name',
            description: 'Name for the robot account (e.g., ci-cd-robot)',
          },
          description: {
            type: 'string',
            title: 'Description',
            description: 'Description of the robot account',
            default: 'CI/CD robot account',
          },
          permissions: {
            type: 'array',
            title: 'Permissions',
            description: 'List of permissions for the robot account',
            items: {
              type: 'object',
              properties: {
                resource: {
                  type: 'string',
                  enum: ['repository', 'artifact', 'helm-chart', 'scan'],
                },
                action: {
                  type: 'string',
                  enum: ['pull', 'push', 'read', 'write', 'delete'],
                },
              },
            },
            default: [
              { resource: 'repository', action: 'pull' },
              { resource: 'repository', action: 'push' },
              { resource: 'artifact', action: 'read' },
            ],
          },
          expiresAt: {
            type: 'number',
            title: 'Expires At (Unix timestamp)',
            description: 'Expiration timestamp (-1 for never)',
            default: -1,
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          robotId: {
            type: 'number',
          },
          robotName: {
            type: 'string',
          },
          robotSecret: {
            type: 'string',
          },
          robotUrl: {
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      const { projectName, robotName, description, permissions, expiresAt } = ctx.input;

      const harborUrl = config.getString('harbor.url');
      const harborUsername = config.getString('harbor.username');
      const harborPassword = config.getString('harbor.password');

      if (!harborUrl || !harborUsername || !harborPassword) {
        throw new InputError('Harbor configuration missing');
      }

      try {
        // Harbor API v2.0 endpoint for robot accounts
        const apiUrl = `${harborUrl}/api/v2.0/projects/${projectName}/robots`;

        const createResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${harborUsername}:${harborPassword}`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: robotName,
            description: description || 'CI/CD robot account',
            expires_at: expiresAt || -1,
            access: permissions || [
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
          const errorText = await createResponse.text();
          throw new InputError(`Failed to create Harbor robot account: ${errorText}`);
        }

        const robot = await createResponse.json();

        // Robot secret is only returned once during creation
        ctx.output('robotId', robot.id);
        ctx.output('robotName', robot.name);
        ctx.output('robotSecret', robot.secret);
        ctx.output('robotUrl', `${harborUrl}/harbor/projects/${projectName}/robots`);

        ctx.logger.info(`Harbor robot account created: ${robotName} (ID: ${robot.id})`);
        ctx.logger.warn(`⚠️ Robot secret saved. Store it securely!`);
      } catch (error) {
        ctx.logger.error(`Failed to create Harbor robot account: ${error}`);
        throw error;
      }
    },
  });
}
