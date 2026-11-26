---
title: 布尔
---

# 布尔字段类型

布尔（Boolean）字段类型接受 `true` 或 `false` 值，或者 `"true"` 或 `"false"` 字符串。你也可以传入空字符串（`""`）来代替 `false` 值。

## 示例

创建一个映射，其中 a、b 和 c 都是布尔字段：

```json
PUT testindex
{
  "mappings" : {
    "properties" :  {
      "a" : {
        "type" : "boolean"
      },
      "b" : {
        "type" : "boolean"
      },
      "c" : {
        "type" : "boolean"
      }
    }
  }
}
```

索引一个包含布尔值的文档：

```json
PUT testindex/_doc/1 
{
  "a" : true,
  "b" : "true",
  "c" : ""
}
```

结果是，`a` 和 `b` 会被设置为 `true`，`c` 会被设置为 `false`。

搜索 `c` 为 false 的所有文档：

```json
GET testindex/_search 
{
  "query": {
      "term" : {
        "c" : false
    }
  }
}
```

## 参数

下表列出了布尔字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`boost` | 一个浮点值，指定该字段对相关性评分（Relevance Score）的权重。大于 1.0 的值会提高该字段的相关性，介于 0.0 和 1.0 之间的值会降低该字段的相关性。默认值为 1.0。
`doc_values` | 一个布尔值，指定是否应将该字段存储在磁盘上，以便用于聚合、排序或脚本。默认值为 `true`。
`index` | 一个布尔值，指定该字段是否可搜索。默认值为 `true`。 
`meta` | 接受该字段的元数据。
[`null_value`](/field-types/supported-field-types/#null-value) | 用于代替 `null` 的值，必须与该字段的类型相同。如果未指定此参数，当字段值为 `null` 时，该字段被视为缺失。默认值为 `null`。
`store` | 一个布尔值，指定是否应存储该字段值，使其可以独立于 _source 字段单独检索。默认值为 `false`。 

## 聚合和脚本中的布尔值

在对布尔字段进行的聚合（Aggregation）中，`key` 返回数值（`true` 为 1，`false` 为 0），`key_as_string` 返回字符串（`"true"` 或 `"false"`）。脚本对布尔值返回 `true` 和 `false`。

### 示例 {#example-1}

对字段 `a` 运行 terms 聚合查询：

```json
GET testindex/_search
{
  "aggs": {
    "agg1": {
      "terms": {
        "field": "a"
      }
    }
  },
  "script_fields": {
    "a": {
      "script": {
        "lang": "painless",
        "source": "doc['a'].value"
      }
    }
  }
}
```

脚本返回的 `a` 的值为 `true`，`key` 返回的 `a` 的值为 `1`，`key_as_string` 返回的 `a` 的值为 `"true"`：

```json
{
  "took" : 1133,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "testindex",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 1.0,
        "fields" : {
          "a" : [
            true
          ]
        }
      }
    ]
  },
  "aggregations" : {
    "agg1" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : 1,
          "key_as_string" : "true",
          "doc_count" : 1
        }
      ]
    }
  }
}
```
