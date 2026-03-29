/**
 * Custom Scaffolder Action: Trigger Azure DevOps Pipeline
 * 
 * This action triggers an Azure DevOps pipeline after template creation
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';

export function createAzurePipelineTriggerAction(options: {
  config: Config;
}) {
  const { config } = options;

  return createTemplateAction({
    id: 'azure:pipeline:trigger',
    schema: {
      input: {
        required: ['organization', 'project', 'pipelineId', 'branch'],
        type: 'object',
        properties: {
          organization: {
            type: 'string',
            title: 'Azure DevOps Organization',
          },
          project: {
            type: 'string',
            title: 'Azure DevOps Project',
          },
          pipelineId: {
            type: 'number',
            title: 'Pipeline Definition ID',
          },
          branch: {
            type: 'string',
            title: 'Branch Name',
            default: 'dev',
          },
          parameters: {
            type: 'object',
            title: 'Pipeline Parameters',
            additionalProperties: true,
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          buildId: {
            type: 'number',
          },
          buildUrl: {
            type: 'string',
          },
          status: {
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      const { organization, project, pipelineId, branch, parameters } = ctx.input;

      const token = config.getString('azureDevOps.auth.pat');
      const baseUrl = `https://dev.azure.com/${organization}/${project}`;
      const apiUrl = `${baseUrl}/_apis/pipelines/${pipelineId}/runs?api-version=7.1`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`:${token}`).toString('base64')}`,
          },
          body: JSON.stringify({
            resources: {
              repositories: {
                self: {
                  refName: `refs/heads/${branch}`,
                },
              },
            },
            templateParameters: parameters || {},
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new InputError(`Failed to trigger pipeline: ${error}`);
        }

        const result = await response.json();
        
        ctx.output('buildId', result.id);
        ctx.output('buildUrl', `${baseUrl}/_build/results?buildId=${result.id}`);
        ctx.output('status', result.state);

        ctx.logger.info(`Pipeline triggered successfully: ${result.id}`);
      } catch (error) {
        ctx.logger.error(`Failed to trigger pipeline: ${error}`);
        throw error;
      }
    },
  });
}
