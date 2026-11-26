---
title: 嵌套
---

# 嵌套聚合

`nested` 聚合（Aggregation）可以让你对嵌套对象中的字段进行聚合。`nested` 类型是 object 数据类型的一个特殊版本，它允许以一种可以彼此独立查询的方式来索引对象数组

使用 `object` 类型时，所有数据都存储在同一个文档（Document）中，因此搜索匹配可能会跨越子文档。例如，假设有一个 `logs` 索引（Index），其中 `pages` 被映射为 `object` 数据类型：

```json
PUT logs/_doc/0
{
  "response": "200",
  "pages": [
    {
      "page": "landing",
      "load_time": 200
    },
    {
      "page": "blog",
      "load_time": 500
    }
  ]
}
```

OpenSearch 会合并实体关系的所有子属性，结果大致如下：

```json
{
  "logs": {
    "pages": ["landing", "blog"],
    "load_time": ["200", "500"]
  }
}
```

因此，如果你想使用 `pages=landing` 和 `load_time=500` 搜索此索引，即使 landing 的 `load_time` 值为 200，该文档也会匹配条件。

如果你想确保不会出现这种跨对象匹配，请将该字段映射为 `nested` 类型：

```json
PUT logs
{
  "mappings": {
    "properties": {
      "pages": {
        "type": "nested",
        "properties": {
          "page": { "type": "text" },
          "load_time": { "type": "double" }
        }
      }
    }
  }
}
```

嵌套文档允许你索引同一个 JSON 文档，但会将各个页面保存在单独的 Lucene 文档中，从而只有 `pages=landing` 和 `load_time=200` 这样的搜索才会返回预期结果。在内部，嵌套对象会将数组中的每个对象索引为一个单独的隐藏文档，这意味着每个嵌套对象都可以独立于其他对象进行查询。

你必须指定一个相对于父级的嵌套路径，该路径包含嵌套文档：

```json
GET logs/_search
{
  "query": {
    "match": { "response": "200" }
  },
  "aggs": {
    "pages": {
      "nested": {
        "path": "pages"
      },
      "aggs": {
        "min_load_time": { "min": { "field": "pages.load_time" } }
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "pages" : {
    "doc_count" : 2,
    "min_price" : {
      "value" : 200.0
    }
  }
 }
}
```
