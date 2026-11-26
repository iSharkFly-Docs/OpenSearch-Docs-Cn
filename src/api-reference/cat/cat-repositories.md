---
title: CAT repositories
---

# CAT repositories
<Badge type="tip" text="Introduced 1.0" />

The CAT repositories operation lists all snapshot repositories for a cluster.

## Example

```
GET _cat/repositories?v
```

## Path and HTTP methods

```
GET _cat/repositories
```

## URL parameters

All CAT repositories URL parameters are optional.

In addition to the [common URL parameters](/api-reference/cat/), you can specify the following parameters:

Parameter | Type | Description
:--- | :--- | :---
local | Boolean | Whether to return information from the local node only instead of from the cluster_manager node. Default is false.
cluster_manager_timeout | Time | The amount of time to wait for a connection to the cluster_manager node. Default is 30 seconds.

## Response

```json
id    type
repo1   fs
repo2   s3
```
