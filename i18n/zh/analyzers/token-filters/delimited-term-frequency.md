---
title: 分隔词频
---

# 分隔词频词元过滤器

`delimited_term_freq` 词元过滤器（Token Filter）根据提供的分隔符，将词元流拆分为词元及其对应的词频。分隔符之前的所有字符构成词元，分隔符之后的整数为词频。例如，如果分隔符为 `|`，那么对于字符串 `foo|5`，`foo` 是词元，`5` 是它的词频。如果没有分隔符，该词元过滤器不会修改词频。 

你可以使用预配置的 `delimited_term_freq` 词元过滤器，也可以创建自定义的过滤器。

## 预配置的 `delimited_term_freq` 词元过滤器

预配置的 `delimited_term_freq` 词元过滤器使用默认分隔符 `|`。要使用预配置的词元过滤器分析文本，请向 `_analyze` 端点发送以下请求：

```json
POST /_analyze
{
  "text": "foo|100",
  "tokenizer": "keyword",
  "filter": ["delimited_term_freq"],
  "attributes": ["termFrequency"],
  "explain": true
}
```

`attributes` 数组表示你希望过滤 `explain` 参数的输出，只返回 `termFrequency`。响应中既包含原始词元，也包含该词元过滤器解析后的输出（其中包括词频）：

```json
{
  "detail": {
    "custom_analyzer": true,
    "charfilters": [],
    "tokenizer": {
      "name": "keyword",
      "tokens": [
        {
          "token": "foo|100",
          "start_offset": 0,
          "end_offset": 7,
          "type": "word",
          "position": 0,
          "termFrequency": 1
        }
      ]
    },
    "tokenfilters": [
      {
        "name": "delimited_term_freq",
        "tokens": [
          {
            "token": "foo",
            "start_offset": 0,
            "end_offset": 7,
            "type": "word",
            "position": 0,
            "termFrequency": 100
          }
        ]
      }
    ]
  }
}
```

## 自定义 `delimited_term_freq` 词元过滤器

要配置自定义 `delimited_term_freq` 词元过滤器，首先在映射请求中指定分隔符，本例中为 `^`：

```json
PUT /testindex
{
  "settings": {
    "analysis": {
      "filter": {
        "my_delimited_term_freq": {
          "type": "delimited_term_freq",
          "delimiter": "^"
        }
      }
    }
  }
}
```

然后使用你创建的自定义词元过滤器分析文本：

```json
POST /testindex/_analyze
{
  "text": "foo^3",
  "tokenizer": "keyword",
  "filter": ["my_delimited_term_freq"],
  "attributes": ["termFrequency"],
  "explain": true
}
```

响应中既包含原始词元，也包含解析后带有词频的版本：

```json
{
  "detail": {
    "custom_analyzer": true,
    "charfilters": [],
    "tokenizer": {
      "name": "keyword",
      "tokens": [
        {
          "token": "foo|100",
          "start_offset": 0,
          "end_offset": 7,
          "type": "word",
          "position": 0,
          "termFrequency": 1
        }
      ]
    },
    "tokenfilters": [
      {
        "name": "delimited_term_freq",
        "tokens": [
          {
            "token": "foo",
            "start_offset": 0,
            "end_offset": 7,
            "type": "word",
            "position": 0,
            "termFrequency": 100
          }
        ]
      }
    ]
  }
}
```

## 将 `delimited_token_filter` 与脚本结合使用

你可以编写 Painless 脚本，为结果中的文档计算自定义评分。

首先，创建一个索引并提供以下映射和设置：

```json
PUT /test
{
  "settings": {
    "number_of_shards": 1,
    "analysis": {
      "tokenizer": {
        "keyword_tokenizer": {
          "type": "keyword"
        }
      },
      "filter": {
        "my_delimited_term_freq": {
          "type": "delimited_term_freq",
          "delimiter": "^"
        }
      },
      "analyzer": {
        "custom_delimited_analyzer": {
          "tokenizer": "keyword_tokenizer",
          "filter": ["my_delimited_term_freq"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "f1": {
        "type": "keyword"
      },
      "f2": {
        "type": "text",
        "analyzer": "custom_delimited_analyzer",
        "index_options": "freqs"
      }
    }
  }
}
```

`test` 索引使用了一个 keyword 分词器、一个分隔词频词元过滤器（分隔符为 `^`），以及一个包含 keyword 分词器和分隔词频词元过滤器的自定义分析器。映射指定字段 `f1` 为 keyword 字段，字段 `f2` 为 text 字段。字段 `f2` 使用设置中定义的自定义分析器进行文本分析。此外，指定 `index_options` 会通知 OpenSearch 将词频添加到倒排索引中。你将使用这些词频为包含重复词项的文档赋予更高的评分。

接下来，使用批量上传索引两个文档：

```json
POST /_bulk?refresh=true
{"index": {"_index": "test", "_id": "doc1"}}
{"f1": "v0|100", "f2": "v1^30"}
{"index": {"_index": "test", "_id": "doc2"}}
{"f2": "v2|100"}
```

以下查询会搜索索引中的所有文档，并将字段 `f2` 中词项 `v1` 的词频作为文档评分：

```json
GET /test/_search
{
  "query": {
    "function_score": {
      "query": {
        "match_all": {}
      },
      "script_score": {
        "script": {
          "source": "termFreq(params.field, params.term)",
          "params": {
            "field": "f2",
            "term": "v1"
          }
        }
      }
    }
  }
}
```

在响应中，文档 1 的评分为 30，因为字段 `f2` 中词项 `v1` 的词频为 30。文档 2 的评分为 0，因为词项 `v1` 没有出现在 `f2` 中：

```json
{
  "took": 4,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 30,
    "hits": [
      {
        "_index": "test",
        "_id": "doc1",
        "_score": 30,
        "_source": {
          "f1": "v0|100",
          "f2": "v1^30"
        }
      },
      {
        "_index": "test",
        "_id": "doc2",
        "_score": 0,
        "_source": {
          "f2": "v2|100"
        }
      }
    ]
  }
}
```

## 参数

下表列出了 `delimited_term_freq` 支持的所有参数。

参数 | 必需/可选 | 描述
:--- | :--- | :---
`delimiter` | 可选 | 用于将词元与词频分隔开的分隔符。必须是单个非空字符。默认值为 `|`。
