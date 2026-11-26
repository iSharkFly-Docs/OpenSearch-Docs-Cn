---
title: 限制
---

# 限制

SQL 插件（plugin）有以下限制：

## 不支持对表达式进行聚合

只能对字段（Field）应用聚合（Aggregation）。聚合不能接受表达式作为参数。例如，不支持 `avg(log(age))`。

## FROM 子句中的子查询

`FROM` 子句中采用 `SELECT outer FROM (SELECT inner)` 格式的子查询，只有在能够合并为一个查询时才受支持。例如，以下查询是受支持的：

```sql
SELECT t.f, t.d
FROM (
    SELECT FlightNum as f, DestCountry as d
    FROM opensearch_dashboards_sample_data_flights
    WHERE OriginCountry = 'US') t
```

但如果外层查询包含 `GROUP BY` 或 `ORDER BY`，则不受支持。

## JOIN 不支持对连接结果进行聚合

`join` 查询不支持对连接结果进行聚合。
例如，不支持 `SELECT depo.name, avg(empo.age) FROM empo JOIN depo WHERE empo.id == depo.id GROUP BY depo.name`。

## 分页仅支持基本查询

分页（pagination）查询可以返回分页的响应。

目前，分页仅支持基本查询。例如，以下查询会返回带有游标（cursor）ID 的数据。

```json
POST _plugins/_sql/
{
  "fetch_size" : 5,
  "query" : "SELECT OriginCountry, DestCountry FROM opensearch_dashboards_sample_data_flights ORDER BY OriginCountry ASC"
}
```

带有游标 ID 的 JDBC 格式响应如下。

```json
{
  "schema": [
    {
      "name": "OriginCountry",
      "type": "keyword"
    },
    {
      "name": "DestCountry",
      "type": "keyword"
    }
  ],
  "cursor": "d:eyJhIjp7fSwicyI6IkRYRjFaWEo1UVc1a1JtVjBZMmdCQUFBQUFBQUFCSllXVTJKVU4yeExiWEJSUkhsNFVrdDVXVEZSYkVKSmR3PT0iLCJjIjpbeyJuYW1lIjoiT3JpZ2luQ291bnRyeSIsInR5cGUiOiJrZXl3b3JkIn0seyJuYW1lIjoiRGVzdENvdW50cnkiLCJ0eXBlIjoia2V5d29yZCJ9XSwiZiI6MSwiaSI6ImtpYmFuYV9zYW1wbGVfZGF0YV9mbGlnaHRzIiwibCI6MTMwNTh9",
  "total": 13059,
  "datarows": [[
    "AE",
    "CN"
  ]],
  "size": 1,
  "status": 200
}
```

目前，带有 `aggregation` 和 `join` 的查询不支持分页。

## 查询处理引擎

SQL 插件有两个查询处理引擎：`V1` 和 `V2`。大多数功能两个引擎都支持，但只有新引擎还在积极开发中。查询会先在 `V2` 引擎上执行，失败时回退到 `V1` 引擎。如果某个查询在 `V2` 中受支持但 `V1` 中没有，则该查询会失败并返回错误响应。

### V1 引擎的限制

* 不支持不带 `FROM` 子句的字面量 select 表达式。例如，不支持 `SELECT 1`。
* `WHERE` 子句不支持表达式。例如，不支持 `SELECT FlightNum FROM opensearch_dashboards_sample_data_flights where (AvgTicketPrice + 100) <= 1000`。
* 大多数[相关性搜索函数](/search-plugins/sql/full-text)仅在 `V2` 引擎中实现。

除非包含 `V1` 特有的函数，否则这类查询都能由 `V2` 引擎成功执行。你很可能永远不会遇到这些限制。

### V2 引擎的限制

* [游标功能](#pagination-only-supports-basic-queries)仅由 `V1` 引擎支持。
  * 关于 `V2` 引擎对 `cursor`/`pagination` 的支持，请关注 [GitHub issue #656](https://github.com/opensearch-project/sql/issues/656)。
* `json` 格式的输出仅由 `V1` 引擎支持。 
* `V2` 引擎不跟踪查询执行时间，因此不会报告慢查询。
* `V2` 查询引擎不仅在 OpenSearch 引擎中运行查询，还支持对复杂查询进行后处理。因此，`explain` 的输出不再只是 OpenSearch 领域特定语言（DSL），还包含来自 `V2` 查询引擎的查询计划信息。
Suggested change
* `V2` 查询引擎不支持 `histogram`、`date_histogram`、`percentiles`、`topHits`、`stats`、`extended_stats`、`terms` 或 `range` 等聚合查询。
* 不支持 JOIN 和子查询。如需了解 JOIN 和子查询的最新开发进展，请关注 [GitHub issue #1441](https://github.com/opensearch-project/sql/issues/1441) 和 [GitHub issue #892](https://github.com/opensearch-project/sql/issues/892)。
* 不支持 `nested` 查询的 PartiQL 语法。此外，对象数组和基本类型数组会返回数组的第一个元素，而在 `V1` 中会以 JSON 对象的形式返回整个数组。
