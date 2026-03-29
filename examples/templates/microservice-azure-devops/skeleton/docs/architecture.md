# Architecture

- **Service type:** ${{ values.component_id }} ({{ values.language }}/{{ values.framework }})
- **Inbound:** Document public APIs or message topics.
- **Outbound:** List dependencies (DB, queues, other services).
- **Data stores:** ${{ values.database != 'none' and values.database or 'None' }}.
- **Observability:** Prometheus annotations are set; add dashboards/alerts here.

Add a simple diagram or sequence here (Mermaid supported).
