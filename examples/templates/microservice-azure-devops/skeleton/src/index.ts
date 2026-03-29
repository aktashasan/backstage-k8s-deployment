{%- if values.language == 'nodejs' %}
import express, { Request, Response } from 'express';
{%- if values.enableObservability %}
import promClient from 'prom-client';
{%- endif %}

const app = express();
const PORT = process.env.PORT || {{ values.containerPort }};

// Middleware
app.use(express.json());

{%- if values.enableObservability %}
// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});
{%- endif %}

// Health endpoints
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    service: '{{ values.component_id }}',
    timestamp: Date.now()
  });
});

app.get('/ready', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    ready: true
  });
});

{%- if values.enableObservability %}
// Metrics endpoint
app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
{%- endif %}

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to {{ values.component_id }}',
    description: '{{ values.description }}',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`{{ values.component_id }} is running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  {%- if values.enableObservability %}
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
  {%- endif %}
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
{%- endif %}
