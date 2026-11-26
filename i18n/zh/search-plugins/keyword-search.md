---
title: 关键词搜索
---

# 关键词搜索

默认情况下，OpenSearch 使用 [Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25) 算法计算文档评分。BM25 是一种基于关键词的算法，它针对查询中出现的词执行词法搜索。

在确定文档的相关性时，BM25 会考虑[词频/逆文档频率（TF/IDF）](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)：

- *词频*（term frequency）规定，搜索词出现频率越高的文档相关性越高。

- *逆文档频率*（inverse document frequency）会降低在语料库所有文档中普遍出现的词（例如 "the" 这样的冠词）的权重。

## 示例

以下示例查询在 `shakespeare` 索引中搜索词 `long live king`：

```json
GET shakespeare/_search
{
  "query": {
    "match": {
      "text_entry": "long live king"
    }
  }
}
```

响应中包含匹配的文档，每个文档的相关性评分（relevance score）位于 `_score` 字段中：

```json
{
  "took": 113,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2352,
      "relation": "eq"
    },
    "max_score": 18.781435,
    "hits": [
      {
        "_index": "shakespeare",
        "_id": "32437",
        "_score": 18.781435,
        "_source": {
          "type": "line",
          "line_id": 32438,
          "play_name": "Hamlet",
          "speech_number": 3,
          "line_number": "1.1.3",
          "speaker": "BERNARDO",
          "text_entry": "Long live the king!"
        }
      },
      {
        "_index": "shakespeare",
        "_id": "83798",
        "_score": 16.523308,
        "_source": {
          "type": "line",
          "line_id": 83799,
          "play_name": "Richard III",
          "speech_number": 42,
          "line_number": "3.7.242",
          "speaker": "BUCKINGHAM",
          "text_entry": "Long live Richard, Englands royal king!"
        }
      },
      {
        "_index": "shakespeare",
        "_id": "82994",
        "_score": 15.588365,
        "_source": {
          "type": "line",
          "line_id": 82995,
          "play_name": "Richard III",
          "speech_number": 24,
          "line_number": "3.1.80",
          "speaker": "GLOUCESTER",
          "text_entry": "live long."
        }
      },
      {
        "_index": "shakespeare",
        "_id": "7199",
        "_score": 15.586321,
        "_source": {
          "type": "line",
          "line_id": 7200,
          "play_name": "Henry VI Part 2",
          "speech_number": 12,
          "line_number": "2.2.64",
          "speaker": "BOTH",
          "text_entry": "Long live our sovereign Richard, Englands king!"
        }
      }
      ...
    ]
  }
}
```

## 相似度算法

下表列出了支持的相似度算法。

算法 | 描述
`BM25` | OpenSearch 默认的 [Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25) 相似度算法。
`boolean` | 为词项分配与其权重提升（boost）值相等的评分。如果希望文档评分仅基于词项是否匹配这一二元值，请使用 `boolean` 相似度。

## 指定相似度

在字段级别配置映射（mapping）时，可以在 `similarity` 参数中指定相似度算法。

例如，以下查询为 `boolean_field` 指定 `boolean` 相似度，而 `bm25_field` 使用默认的 `BM25` 相似度：

```json
PUT /testindex
{
  "mappings": {
    "properties": {
      "bm25_field": { 
        "type": "text"
      },
      "boolean_field": {
        "type": "text",
        "similarity": "boolean" 
      }
    }
  }
}
```

## 配置 BM25 相似度

你可以按如下方式在索引级别配置 BM25 相似度参数：

```json
PUT /testindex
{
  "settings": {
    "index": {
      "similarity": {
        "custom_similarity": {
          "type": "BM25",
          "k1": 1.2,
          "b": 0.75,
          "discount_overlaps": "true"
        }
      }
    }
  }
}
```

`BM25` 相似度支持以下参数。

参数 | 数据类型 | 描述
`k1` | Float | 决定非线性词频归一化（饱和）的特性。默认值为 `1.2`。
`b` | Float | 决定文档长度对 TF 值进行归一化的程度。默认值为 `0.75`。
`discount_overlaps` | Boolean | 决定在计算范数时是否忽略重叠词元（位置增量为零的词元）。默认值为 `true`（计算范数时不计入重叠词元）。

---

## 后续步骤

- 了解[查询上下文和过滤上下文](/query-dsl/query-filter-context)。
- 了解 OpenSearch 支持的[查询类型](/query-dsl/)。
