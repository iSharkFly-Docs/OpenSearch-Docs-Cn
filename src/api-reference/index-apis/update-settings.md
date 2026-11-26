---
title: Update settings
---

# Update settings
<Badge type="tip" text="Introduced 1.0" />

You can use the update settings API operation to update index-level settings. You can change dynamic index settings at any time, but static settings cannot be changed after index creation. For more information about static and dynamic index settings, see [Create index](/api-reference/index-apis/create-index).

Aside from the static and dynamic index settings, you can also update individual plugins' settings. To get the full list of updatable settings, run `GET <target-index>/_settings?include_defaults=true`.

## Example

```json
PUT /sample-index1/_settings
{
  "index.plugins.index_state_management.rollover_skip": true,
  "index": {
    "number_of_replicas": 4
  }
}
```

## Path and HTTP methods

```
PUT /<target-index>/_settings
```

## Query parameters

All update settings parameters are optional.

Parameter | Data type | Description
:--- | :--- | :---
allow_no_indices | Boolean | Whether to ignore wildcards that don’t match any indexes. Default is `true`.
expand_wildcards | String | Expands wildcard expressions to different indexes. Combine multiple values with commas. Available values are `all` (match all indexes), `open` (match open indexes), `closed` (match closed indexes), `hidden` (match hidden indexes), and `none` (do not accept wildcard expressions), which must be used with `open`, `closed`, or both. Default is `open`.
cluster_manager_timeout | Time | How long to wait for a connection to the cluster manager node. Default is `30s`.
preserve_existing | Boolean | Whether to preserve existing index settings. Default is false.
timeout | Time | How long to wait for a connection to return. Default is `30s`.

## Request body

The request body must all of the index settings that you want to update.

```json
{
  "index.plugins.index_state_management.rollover_skip": true,
  "index": {
    "number_of_replicas": 4
  }
}
```

## Response

```json
{
    "acknowledged": true
}
```
