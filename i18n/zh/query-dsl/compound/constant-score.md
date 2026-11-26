---
title: 常量评分
---

# 常量评分查询

如果需要返回包含某个单词的文档（Document），而不关心该单词出现的次数，可以使用 `constant_score` 查询（Query）。`constant_score` 查询包装一个 filter 查询，并为结果中的所有文档分配一个等于 `boost` 参数值的相关性评分（Relevance Score）。因此，所有返回的文档都具有相同的相关性评分，并且不考虑词频/逆文档频率（TF/IDF）。filter 查询不计算相关性评分。此外，OpenSearch 会缓存常用的 filter 查询以提升性能。 

## 示例

使用以下查询返回 `shakespeare` 索引中包含单词 "Hamlet" 的文档：

```json
GET shakespeare/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "match": {
          "text_entry": "Hamlet"
        }
      },
      "boost": 1.2
    }
  }
}
```

结果中的所有文档都被分配了 1.2 的相关性评分：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 8,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 96,
      "relation": "eq"
    },
    "max_score": 1.2,
    "hits": [
      {
        "_index": "shakespeare",
        "_id": "32535",
        "_score": 1.2,
        "_source": {
          "type": "line",
          "line_id": 32536,
          "play_name": "Hamlet",
          "speech_number": 48,
          "line_number": "1.1.97",
          "speaker": "HORATIO",
          "text_entry": "Dared to the combat; in which our valiant Hamlet--"
        }
      },
      {
        "_index": "shakespeare",
        "_id": "32546",
        "_score": 1.2,
        "_source": {
          "type": "line",
          "line_id": 32547,
          "play_name": "Hamlet",
          "speech_number": 48,
          "line_number": "1.1.108",
          "speaker": "HORATIO",
          "text_entry": "His fell to Hamlet. Now, sir, young Fortinbras,"
        }
      },
      {
        "_index": "shakespeare",
        "_id": "32625",
        "_score": 1.2,
        "_source": {
          "type": "line",
          "line_id": 32626,
          "play_name": "Hamlet",
          "speech_number": 59,
          "line_number": "1.1.184",
          "speaker": "HORATIO",
          "text_entry": "Unto young Hamlet; for, upon my life,"
        }
      },
      {
        "_index": "shakespeare",
        "_id": "32633",
        "_score": 1.2,
        "_source": {
          "type": "line",
          "line_id": 32634,
          "play_name": "Hamlet",
          "speech_number": 60,
          "line_number": "",
          "speaker": "MARCELLUS",
          "text_entry": "Enter KING CLAUDIUS, QUEEN GERTRUDE, HAMLET,  POLONIUS, LAERTES, VOLTIMAND, CORNELIUS, Lords, and Attendants"
        }
      },
      {
        "_index": "shakespeare",
        "_id": "32634",
        "_score": 1.2,
        "_source": {
          "type": "line",
          "line_id": 32635,
          "play_name": "Hamlet",
          "speech_number": 1,
          "line_number": "1.2.1",
          "speaker": "KING CLAUDIUS",
          "text_entry": "Though yet of Hamlet our dear brothers death"
        }
      },
      {
        "_index": "shakespeare",
        "_id": "32699",
        "_score": 1.2,
        "_source": {
          "type": "line",
          "line_id": 32700,
          "play_name": "Hamlet",
          "speech_number": 8,
          "line_number": "1.2.65",
          "speaker": "KING CLAUDIUS",
          "text_entry": "But now, my cousin Hamlet, and my son,--"
        }
      },
      {
        "_index": "shakespeare",
        "_id": "32703",
        "_score": 1.2,
        "_source": {
          "type": "line",
          "line_id": 32704,
          "play_name": "Hamlet",
          "speech_number": 12,
          "line_number": "1.2.69",
          "speaker": "QUEEN GERTRUDE",
          "text_entry": "Good Hamlet, cast thy nighted colour off,"
        }
      },
      {
        "_index": "shakespeare",
        "_id": "32723",
        "_score": 1.2,
        "_source": {
          "type": "line",
          "line_id": 32724,
          "play_name": "Hamlet",
          "speech_number": 16,
          "line_number": "1.2.89",
          "speaker": "KING CLAUDIUS",
          "text_entry": "Tis sweet and commendable in your nature, Hamlet,"
        }
      },
      {
        "_index": "shakespeare",
        "_id": "32754",
        "_score": 1.2,
        "_source": {
          "type": "line",
          "line_id": 32755,
          "play_name": "Hamlet",
          "speech_number": 17,
          "line_number": "1.2.120",
          "speaker": "QUEEN GERTRUDE",
          "text_entry": "Let not thy mother lose her prayers, Hamlet:"
        }
      },
      {
        "_index": "shakespeare",
        "_id": "32759",
        "_score": 1.2,
        "_source": {
          "type": "line",
          "line_id": 32760,
          "play_name": "Hamlet",
          "speech_number": 19,
          "line_number": "1.2.125",
          "speaker": "KING CLAUDIUS",
          "text_entry": "This gentle and unforced accord of Hamlet"
        }
      }
    ]
  }
}
```
</details>

## 参数

下表列出了 `constant_score `查询支持的所有顶级参数。

参数 | 描述
:--- | :---
`filter` | 文档要在结果中返回所必须匹配的 filter 查询。必需。
`boost` | 一个浮点值，作为相关性评分分配给所有返回的文档。可选。默认值为 1.0。
