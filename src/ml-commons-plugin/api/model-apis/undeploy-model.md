---
title: Undeploy model
---

# Undeploy a model

To undeploy a model from memory, use the undeploy operation.

For information about user access for this API, see [Model access control considerations](/ml-commons-plugin/api/model-apis/#model-access-control-considerations).

### Path and HTTP methods

```json
POST /_plugins/_ml/models/<model_id>/_undeploy
```

#### Example request: Undeploying a model from all ML nodes

```json
POST /_plugins/_ml/models/MGqJhYMBbbh0ushjm8p_/_undeploy
```

#### Example request: Undeploying specific models from specific nodes

```json
POST /_plugins/_ml/models/_undeploy
{
  "node_ids": ["sv7-3CbwQW-4PiIsDOfLxQ"],
  "model_ids": ["KDo2ZYQB-v9VEDwdjkZ4"]
}
```

#### Example request: Undeploying specific models from all nodes

```json
{
  "model_ids": ["KDo2ZYQB-v9VEDwdjkZ4"]
}
```

#### Example response

```json
{
  "sv7-3CbwQW-4PiIsDOfLxQ" : {
    "stats" : {
      "KDo2ZYQB-v9VEDwdjkZ4" : "UNDEPLOYED"
    }
  }
}
```
