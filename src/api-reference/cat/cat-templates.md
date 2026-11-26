---
title: CAT templates
---

# CAT templates
<Badge type="tip" text="Introduced 1.0" />

The CAT templates operation lists the names, patterns, order numbers, and version numbers of index templates.

## Example

```
GET _cat/templates?v
```

If you want to get information for a specific template or pattern:

```
GET _cat/templates/<template_name_or_pattern>
```

## Path and HTTP methods

```
GET _cat/templates
```

## URL parameters

All CAT templates URL parameters are optional.

In addition to the [common URL parameters](/api-reference/cat/), you can specify the following parameters:

Parameter | Type | Description
:--- | :--- | :---
local | Boolean | Whether to return information from the local node only instead of from the cluster manager node. Default is false.
cluster_manager_timeout | Time | The amount of time to wait for a connection to the cluster manager node. Default is 30 seconds.

## Response

```
name | index_patterns order version composed_of
tenant_template | [opensearch-dashboards*] | 0  |    
```

To learn more about index templates, see [Index templates](/im-plugin/index-templates).
