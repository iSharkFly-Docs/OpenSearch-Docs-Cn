---
title: Delete pipeline
---

# Delete pipeline
<Badge type="tip" text="Introduced 1.0" />

Use the following request to delete a pipeline. 

To delete a specific pipeline, pass the pipeline ID as a parameter:

```json
DELETE /_ingest/pipeline/<pipeline-id>
```

To delete all pipelines in a cluster, use the wildcard character (`*`):

```json
DELETE /_ingest/pipeline/*
```
