---
title: Delete model group
---

# Delete a model group

::: warning IMPORTANT
You can only delete a model group if it does not contain any model versions. 
:::

If model access control is enabled on your cluster, only the owner or users with matching backend roles can delete the model group. Any users can delete any public model group.

If model access control is disabled on your cluster, users with the `delete model group API` permission can delete any model group. 

::: info NOTE
Admin users can delete any model group.
:::

::: warning IMPORTANT
When you delete the last model version in a model group, that model group is automatically deleted from the index.
:::

For more information, see [Model access control](/ml-commons-plugin/model-access-control).

#### Example request

```json
DELETE _plugins/_ml/model_groups/<model_group_id>
```

#### Example response

```json
{
  "_index": ".plugins-ml-model-group",
  "_id": "l8nnQogByXnLJ-QNpEk2",
  "_version": 5,
  "result": "deleted",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "_seq_no": 70,
  "_primary_term": 23
}
```
