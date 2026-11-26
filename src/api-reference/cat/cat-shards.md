---
title: CAT shards
---

# CAT shards
<Badge type="tip" text="Introduced 1.0" />

The CAT shards operation lists the state of all primary and replica shards and how they are distributed.

## Example

```
GET _cat/shards?v
```

To see only the information about shards of a specific index, add the index name after your query.

```
GET _cat/shards/<index>?v
```

If you want to get information for more than one index, separate the indexes with commas:

```
GET _cat/shards/index1,index2,index3
```

## Path and HTTP methods

```
GET _cat/shards
```

## URL parameters

All cat shards URL parameters are optional.

In addition to the [common URL parameters](/api-reference/cat/), you can specify the following parameters:

Parameter | Type | Description
:--- | :--- | :---
bytes | Byte size | Specify the units for byte size. For example, `7kb` or `6gb`. For more information, see [Supported units](/api-reference/units).
local | Boolean | Whether to return information from the local node only instead of from the cluster_manager node. Default is false.
cluster_manager_timeout | Time | The amount of time to wait for a connection to the cluster_manager node. Default is 30 seconds.
time | Time | Specify the units for time. For example, `5d` or `7h`. For more information, see [Supported units](/api-reference/units).

## Response

```json
index | shard | prirep | state   | docs | store | ip |       | node
plugins | 0   |   p    | STARTED |   0  |  208b | 172.18.0.4 | odfe-node1
plugins | 0   |   r    | STARTED |   0  |  208b | 172.18.0.3 |  odfe-node2          
```
