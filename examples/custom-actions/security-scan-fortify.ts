/**
 * Custom Scaffolder Action: Fortify Security Scan
 * 
 * This action triggers a Fortify SAST scan and enforces security policies
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';

export function createFortifyScanAction(options: {
  config: Config;
}) {
  const { config } = options;

  return createTemplateAction({
    id: 'security:scan:fortify',
    schema: {
      input: {
        required: ['projectName', 'sourceCodeUrl'],
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            title: 'Project Name',
          },
          sourceCodeUrl: {
            type: 'string',
            title: 'Source Code Repository URL',
          },
          scanType: {
            type: 'string',
            title: 'Scan Type',
            enum: ['incremental', 'full'],
            default: 'full',
          },
          failOnCritical: {
            type: 'boolean',
            title: 'Fail on Critical Vulnerabilities',
            default: true,
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          scanId: {
            type: 'string',
          },
          scanUrl: {
            type: 'string',
          },
          vulnerabilities: {
            type: 'object',
            properties: {
              critical: { type: 'number' },
              high: { type: 'number' },
              medium: { type: 'number' },
              low: { type: 'number' },
            },
          },
          passed: {
            type: 'boolean',
          },
        },
      },
    },
    async handler(ctx) {
      const { projectName, sourceCodeUrl, scanType, failOnCritical } = ctx.input;

      const fortifyUrl = config.getString('security.fortify.url');
      const apiKey = config.getString('security.fortify.apiKey');
      const maxHighSeverity = config.getNumber('security.fortify.policies.maxHighSeverity') || 5;

      try {
        // Trigger Fortify scan
        const scanResponse = await fetch(`${fortifyUrl}/api/v1/scans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            projectName,
            sourceCodeUrl,
            scanType,
            options: {
              failOnCritical,
              maxHighSeverity,
            },
          }),
        });

        if (!scanResponse.ok) {
          const error = await scanResponse.text();
          throw new InputError(`Failed to trigger Fortify scan: ${error}`);
        }

        const scanResult = await scanResponse.json();
        
        // Wait for scan to complete (polling)
        let scanStatus = 'running';
        let finalResult = scanResult;
        
        while (scanStatus === 'running') {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          
          const statusResponse = await fetch(`${fortifyUrl}/api/v1/scans/${scanResult.scanId}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          });
          
          finalResult = await statusResponse.json();
          scanStatus = finalResult.status;
        }

        // Check if scan passed policy
        const passed = 
          (!failOnCritical || finalResult.vulnerabilities.critical === 0) &&
          finalResult.vulnerabilities.high <= maxHighSeverity;

        if (!passed) {
          ctx.logger.warn(`Security scan failed policy check`);
          if (failOnCritical && finalResult.vulnerabilities.critical > 0) {
            throw new InputError(
              `Security scan failed: ${finalResult.vulnerabilities.critical} critical vulnerabilities found`
            );
          }
        }

        ctx.output('scanId', finalResult.scanId);
        ctx.output('scanUrl', `${fortifyUrl}/scans/${finalResult.scanId}`);
        ctx.output('vulnerabilities', finalResult.vulnerabilities);
        ctx.output('passed', passed);

        ctx.logger.info(`Fortify scan completed: ${finalResult.scanId}`);
      } catch (error) {
        ctx.logger.error(`Failed to run Fortify scan: ${error}`);
        throw error;
      }
    },
  });
}
