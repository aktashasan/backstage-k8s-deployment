const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: '${{ values.name }}' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello from ${{ values.name }}', namespace: '${{ values.namespace }}' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`${{ values.name }} listening on port ${PORT}`);
});
