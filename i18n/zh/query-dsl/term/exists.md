---
title: Exists
---

# Exists 查询

使用 `exists` 查询搜索包含特定字段的文档（Document）。

在以下任一情况下，文档字段不存在已索引的值：

- 映射（Mapping）中为该字段指定了 `"index" : false`。
- 源 JSON 中该字段为 `null` 或 `[]`。
- 字段值的长度超过了映射中的 `ignore_above` 设置。
- 字段值格式错误，且映射中定义了 `ignore_malformed`。

在以下任一情况下，文档字段存在已索引的值：

- 该值是一个数组，其中包含一个或多个 null 元素以及一个或多个非 null 元素（例如 `["one", null]`）。
- 该值是空字符串（`""` 或 `"-"`）。
- 该值是字段映射中定义的自定义 `null_value`。

## 示例

例如，假设一个索引（Index）包含以下两个文档：

```json
PUT testindex/_doc/1
{
  "title": "The wind rises"
}
```

```json
PUT testindex/_doc/2
{
  "title": "Gone with the wind",
  "description": "A 1939 American epic historical film"
}
```

以下查询搜索包含 `description` 字段的文档：

```json
GET testindex/_search
{
  "query": {
    "exists": {
      "field": "description"
    }
  }
}
```

响应中包含匹配的文档：

```json
{
  "took": 3,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 1,
        "_source": {
          "title": "Gone with the wind",
          "description": "A 1939 American epic historical film"
        }
      }
    ]
  }
}
```

## 查找缺少已索引值的文档

要查找缺少已索引值的文档，可以使用带有内部 `exists` 查询的 `must_not` [Boolean 查询](/query-dsl/compound/bool)。例如，以下请求搜索缺少 `description` 字段的文档：

```json
GET testindex/_search
{
  "query": {
    "bool": {
      "must_not": {
        "exists": {
          "field": "description"
        }
      }
    }
  }
}
```

响应中包含匹配的文档：

```json
{
  "took": 19,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 0,
        "_source": {
          "title": "The wind rises"
        }
      }
    ]
  }
}
```

## 参数

该查询接受字段名称（`<field>`）作为顶层参数。
