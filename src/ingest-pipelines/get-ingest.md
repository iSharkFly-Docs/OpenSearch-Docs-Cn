---
title: Get pipeline
---

# Get pipeline
<Badge type="tip" text="Introduced 1.0" />

Use the get ingest pipeline API operation to retrieve all the information about the pipeline.

## Retrieving information about all pipelines

The following example request returns information about all ingest pipelines:

```json
GET _ingest/pipeline/
```

## Retrieving information about a specific pipeline

The following example request returns information about a specific pipeline, which for this example is `my-pipeline`: 

```json
GET _ingest/pipeline/my-pipeline
```

The response contains the pipeline information:

```json
{
  "my-pipeline": {
    "description": "This pipeline processes student data",
    "processors": [
      {
        "set": {
          "description": "Sets the graduation year to 2023",
          "field": "grad_year",
          "value": 2023
        }
      },
      {
        "set": {
          "description": "Sets graduated to true",
          "field": "graduated",
          "value": true
        }
      },
      {
        "uppercase": {
          "field": "name"
        }
      }
    ]
  }
}
```
