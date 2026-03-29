/**
 * Pipeline Status Card Component
 * 
 * Displays real-time Azure DevOps pipeline status
 */

import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Box,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import {
  CheckCircle,
  Error,
  Pending,
  Refresh,
  OpenInNew,
} from '@material-ui/icons';
import { useApi } from '@backstage/core-plugin-api';
import { pipelineMonitorApiRef } from '../api';

interface PipelineStatusCardProps {
  componentId: string;
  pipelineId: number;
  organization: string;
  project: string;
}

export const PipelineStatusCard: React.FC<PipelineStatusCardProps> = ({
  componentId,
  pipelineId,
  organization,
  project,
}) => {
  const pipelineApi = useApi(pipelineMonitorApiRef);
  const [status, setStatus] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const pipelineStatus = await pipelineApi.getPipelineStatus(
          organization,
          project,
          pipelineId
        );
        setStatus(pipelineStatus);
      } catch (error) {
        console.error('Failed to fetch pipeline status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    
    return () => clearInterval(interval);
  }, [componentId, pipelineId, organization, project, pipelineApi]);

  const getStatusIcon = () => {
    if (!status) return <Pending />;
    
    switch (status.state) {
      case 'completed':
        return status.result === 'succeeded' ? (
          <CheckCircle style={{ color: '#4caf50' }} />
        ) : (
          <Error style={{ color: '#f44336' }} />
        );
      case 'inProgress':
        return <Pending style={{ color: '#ff9800' }} />;
      default:
        return <Pending />;
    }
  };

  const getStatusColor = () => {
    if (!status) return 'default';
    
    switch (status.state) {
      case 'completed':
        return status.result === 'succeeded' ? 'primary' : 'secondary';
      case 'inProgress':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    if (!status) return 'Unknown';
    
    if (status.state === 'completed') {
      return status.result === 'succeeded' ? 'Succeeded' : 'Failed';
    }
    return status.state;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Pipeline Status"
        action={
          <Box>
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={() => {
                  setLoading(true);
                  // Trigger refresh
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in Azure DevOps">
              <IconButton
                size="small"
                href={`https://dev.azure.com/${organization}/${project}/_build/results?buildId=${status?.id}`}
                target="_blank"
              >
                <OpenInNew />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {getStatusIcon()}
          <Typography variant="h6">{getStatusText()}</Typography>
          <Chip
            label={`Build #${status?.buildNumber || 'N/A'}`}
            color={getStatusColor()}
            size="small"
          />
        </Box>
        
        {status && (
          <>
            <Typography variant="body2" color="textSecondary">
              Branch: {status.sourceBranch}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Commit: {status.sourceVersion?.substring(0, 7)}
            </Typography>
            {status.finishTime && (
              <Typography variant="body2" color="textSecondary">
                Duration: {calculateDuration(status.startTime, status.finishTime)}
              </Typography>
            )}
          </>
        )}
        
        {status?.state === 'inProgress' && (
          <Box mt={2}>
            <LinearProgress />
            <Typography variant="caption" color="textSecondary">
              {status.currentStage || 'Running...'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

function calculateDuration(start: string, end: string): string {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const duration = Math.floor((endTime - startTime) / 1000);
  
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  
  return `${minutes}m ${seconds}s`;
}
