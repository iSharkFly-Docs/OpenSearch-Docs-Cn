---
title: Delete memory
---

# Delete a memory
<Badge type="tip" text="Introduced 2.12" />

Use this API to delete a memory based on the `memory_id`.

::: warning IMPORTANT
When the Security plugin is enabled, all memories exist in a `private` security mode. Only the user who created a memory can interact with that memory and its messages.
:::

## Path and HTTP methods

```json
DELETE /_plugins/_ml/memory/<memory_id>
```

## Path parameters

The following table lists the available path parameters.

Parameter | Data type | Description
:--- | :--- | :---
`memory_id` | String | The ID of the memory to be deleted. 

#### Example request

```json
DELETE /_plugins/_ml/memory/MzcIJX8BA7mbufL6DOwl
```

#### Example response

```json
{
  "success": true
}
```
