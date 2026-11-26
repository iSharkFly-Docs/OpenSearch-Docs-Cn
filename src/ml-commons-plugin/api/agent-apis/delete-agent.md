---
title: Delete agent
---

# Delete an agent
<Badge type="tip" text="Introduced 2.12" />

::: danger WARNING
This is an experimental feature and is not recommended for use in a production environment. For updates on the progress of the feature or if you want to leave feedback, see the associated [GitHub issue](https://github.com/opensearch-project/ml-commons/issues/1161).    
:::

You can use this API to delete an agent based on the `agent_id`.

## Path and HTTP methods

```json
DELETE /_plugins/_ml/agents/<agent_id>
```

#### Example request

```json
DELETE /_plugins/_ml/agents/MzcIJX8BA7mbufL6DOwl
```

#### Example response

```json
{
  "_index" : ".plugins-ml-agent",
  "_id" : "MzcIJX8BA7mbufL6DOwl",
  "_version" : 2,
  "result" : "deleted",
  "_shards" : {
    "total" : 2,
    "successful" : 2,
    "failed" : 0
  },
  "_seq_no" : 27,
  "_primary_term" : 18
}
```
