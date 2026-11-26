---
title: Query DSL
---

# Query DSL

OpenSearch 提供了一种名为 *查询领域特定语言（Query Domain-Specific Language，DSL）* 的搜索语言，你可以用它来搜索数据。Query DSL 是一种灵活的语言，采用 JSON 接口。

使用 Query DSL 时，需要在搜索的 `query` 参数中指定查询（Query）。OpenSearch 中最简单的搜索之一是使用 `match_all` 查询，它会匹配索引（Index）中的所有文档（Document）：

```json
GET testindex/_search
{
  "query": {
     "match_all": { 
     }
  }
}
```

一个查询可以由多个查询子句组成。你可以组合查询子句来构造复杂的查询。 

总体而言，查询可以分为两类——*叶查询（Leaf Query）* 和 *复合查询（Compound Query）*：

- **叶查询**：叶查询在某个或某些字段中搜索指定的值。叶查询可以单独使用，包括以下查询类型：

    - [全文查询](/query-dsl/full-text/)：使用全文查询（Full-text Query）搜索文本文档。对于经过分析的文本字段，全文查询会使用索引该字段时所用的同一个分析器（Analyzer）将查询字符串拆分为词项。对于精确值搜索，全文查询会查找指定的值，而不进行文本分析。 

    - [词项级查询](/query-dsl/term/)：使用词项级查询（Term-level Query）在文档中搜索精确的词项，例如 ID 或值范围。词项级查询不会分析搜索词项，也不会按相关性评分（Relevance Score）对结果排序。

    - [地理和 xy 查询](/query-dsl/geo-and-xy/)：使用地理查询搜索包含地理数据的文档。使用 xy 查询搜索包含二维坐标系中的点和形状的文档。 

    - 连接查询：使用连接查询搜索嵌套字段，或返回与特定查询匹配的父文档和子文档。连接查询的类型包括 `nested`、`has_child`、`has_parent` 和 `parent_id` 查询。

    - [跨度查询](/query-dsl/span-query)：使用跨度查询（Span Query）执行精确的位置搜索。跨度查询是底层的特定查询，可以控制指定查询词项的顺序和邻近程度。它们主要用于搜索法律文档。 

    - [专用查询](/query-dsl/specialized/)：专用查询包括所有其他查询类型（`distance_feature`、`more_like_this`、`percolate`、`rank_feature`、`script`、`script_score` 和 `wrapper`）。

- **复合查询**：复合查询是多个叶子句或复合子句的包装器，用于组合它们的结果或修改它们的行为。复合查询包括 Boolean、disjunction max、constant score、function score 和 boosting 查询类型。更多信息，请参阅[复合查询](/query-dsl/compound/)。

## 关于文本字段中的 Unicode 特殊字符

由于 Unicode 特殊字符会形成词边界，当 [text 字段类型](/field-types/supported-field-types/text)的值包含这类特殊字符时，Unicode 标准分析器无法将其作为一个完整的值进行索引。因此，包含特殊字符的 text 字段值会被标准分析器解析为以该特殊字符分隔的多个值，实际上就是把特殊字符两侧的不同部分分别切分成词元。这可能导致文档被意外过滤，并可能削弱对文档访问的控制。 

以下示例展示了包含特殊字符、会被标准分析器错误解析的值。在此示例中，值中的连字符/减号导致分析器无法区分 `user.id` 的两个不同用户，而将它们视为同一个用户：

```json
{
  "bool": {
    "must": {
      "match": {
        "user.id": "User-1"
      }
    }
  }
}
```

```json
{
  "bool": {
    "must": {
      "match": {
        "user.id": "User-2"
      }
    }
  }
}
```

为了在使用 Query DSL 或 REST API 时避免这种情况，你可以使用自定义分析器，或者将字段映射为 `keyword`，以执行精确匹配搜索。关于后一种方式，请参阅 [Keyword 字段类型](/field-types/supported-field-types/keyword)。

关于使用 `text` 字段类型时应避免的字符列表，请参阅 [Word Boundaries](https://unicode.org/reports/tr29/#Word_Boundaries)。

## 开销较大的查询

开销较大的查询（Expensive Query）可能会消耗大量内存，导致集群性能下降。以下查询可能会消耗较多资源：

- [`fuzzy`](/query-dsl/term/fuzzy) 查询 
- [`prefix`](/query-dsl/term/prefix) 查询
- 针对 [`text`](/field-types/supported-field-types/text) 和 [`keyword`](/field-types/supported-field-types/keyword) 字段的 [`range`](/query-dsl/term/range) 查询
- [`regexp`](/query-dsl/term/regexp) 查询 
- [`wildcard`](/query-dsl/term/wildcard) 查询 
- 在内部被转换为前缀查询的 [`query_string`](/query-dsl/full-text/query-string) 查询

要禁止开销较大的查询，可以按如下方式禁用 `search.allow_expensive_queries` 集群设置：

```json
PUT _cluster/settings
{
  "persistent": {
    "search.allow_expensive_queries": false
  }
}
```

::: tip 提示
要跟踪开销较大的查询，请启用[分片慢日志](/install-and-configure/configuring-opensearch/logs#shard-slow-logs)。
:::
