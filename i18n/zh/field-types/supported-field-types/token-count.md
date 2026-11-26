---
title: 词元计数
---

# Token count 字段类型

token count 字段类型存储字符串中经过分析的词元（Token）数量。

## 示例

创建一个包含 token count 字段的映射（Mapping）：

```json
PUT testindex
{
  "mappings": {
    "properties": {
      "sentence": { 
        "type": "text",
        "fields": {
          "num_words": { 
            "type":     "token_count",
            "analyzer": "english"
          }
        }
      }
    }
  }
}
```

索引三个包含 text 字段的文档（Document）：

```json
PUT testindex/_doc/1
{ "sentence": "To be, or not to be: that is the question." }
```

```json
PUT testindex/_doc/2
{ "sentence": "All the world’s a stage, and all the men and women are merely players." }
```

```json
PUT testindex/_doc/3
{ "sentence": "Now is the winter of our discontent." }
```

搜索单词数少于 10 个的句子：

```json
GET testindex/_search
{
  "query": {
    "range": {
      "sentence.num_words": {
        "lt": 10
      }
    }
  }
}
```

响应中包含一个匹配的句子：

```json
{
  "took" : 8,
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
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "sentence" : "Now is the winter of our discontent."
        }
      }
    ]
  }
}
```

## 参数

下表列出了 token count 字段类型接受的参数。`analyzer` 参数为必需参数，其他参数均为可选。

参数 | 描述 
:--- | :--- 
`analyzer` | 用于该字段的分析器（Analyzer）。为获得最佳性能，请指定不带词元过滤器（Token Filter）的分析器。必需。
`boost` | 一个浮点值，指定该字段在相关性评分（Relevance Score）中的权重。大于 1.0 的值会提高该字段的相关性，介于 0.0 和 1.0 之间的值会降低该字段的相关性。默认值为 1.0。
`doc_values` | 一个布尔值，指定是否将该字段存储到磁盘上，以便用于聚合、排序或脚本。默认值为 `false`。
`enable_position_increments` | 一个布尔值，指定是否计入位置增量。为避免去除停用词，请将该字段设置为 `false`。默认值为 `true`。
`index` | 一个布尔值，指定该字段是否可搜索。默认值为 `true`。
[`null_value`](/field-types/supported-field-types/#null-value) | 用于替代 `null` 的值，必须与字段类型相同。如果未指定此参数，当字段值为 `null` 时，该字段被视为缺失。默认值为 `null`。
`store` | 一个布尔值，指定是否存储该字段值，以便能够独立于 _source 字段单独检索。默认值为 `false`。
