/**
 * Custom Scaffolder Action: Request Deployment Approval
 * 
 * This action requests approval for production deployments
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';

export function createDeploymentApprovalAction(options: {
  config: Config;
}) {
  const { config } = options;

  return createTemplateAction({
    id: 'deployment:approval:request',
    schema: {
      input: {
        required: ['componentId', 'environment', 'version'],
        type: 'object',
        properties: {
          componentId: {
            type: 'string',
            title: 'Component ID',
          },
          environment: {
            type: 'string',
            title: 'Environment',
            enum: ['dev', 'test', 'prod'],
          },
          version: {
            type: 'string',
            title: 'Version/Image Tag',
          },
          approvers: {
            type: 'array',
            title: 'Required Approvers',
            items: {
              type: 'string',
            },
          },
          reason: {
            type: 'string',
            title: 'Deployment Reason',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          approvalId: {
            type: 'string',
          },
          approvalUrl: {
            type: 'string',
          },
          status: {
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      const { componentId, environment, version, approvers, reason } = ctx.input;

      // Only require approval for production
      if (environment !== 'prod') {
        ctx.logger.info(`No approval required for ${environment} environment`);
        ctx.output('approvalId', 'auto-approved');
        ctx.output('status', 'approved');
        return;
      }

      const requiredApprovers = approvers || 
        config.getStringArray('deployment.approvals.requiredApprovers') || 
        ['team-lead'];

      try {
        // Create approval request
        const approvalRequest = {
          componentId,
          environment,
          version,
          requestedBy: ctx.user?.entity?.metadata.name || 'unknown',
          requestedAt: new Date().toISOString(),
          reason,
          requiredApprovers,
          status: 'pending',
        };

        // Store approval request (in real implementation, use database)
        const approvalId = `approval-${Date.now()}`;
        
        // Send notifications to approvers
        const notificationService = config.getOptionalString('notifications.service');
        if (notificationService) {
          // Send email/Slack notifications
          ctx.logger.info(`Sending approval notifications to: ${requiredApprovers.join(', ')}`);
        }

        ctx.output('approvalId', approvalId);
        ctx.output('approvalUrl', `${config.getString('app.baseUrl')}/approvals/${approvalId}`);
        ctx.output('status', 'pending');

        ctx.logger.info(`Deployment approval requested: ${approvalId}`);
        ctx.logger.info(`Waiting for approval from: ${requiredApprovers.join(', ')}`);
        
        // In real implementation, wait for approval or timeout
        // For now, just create the request
      } catch (error) {
        ctx.logger.error(`Failed to request deployment approval: ${error}`);
        throw error;
      }
    },
  });
}
