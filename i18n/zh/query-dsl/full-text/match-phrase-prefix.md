---
title: Match 短语前缀
---

# Match 短语前缀查询

使用 `match_phrase_prefix` 查询（Query）可以指定一个按顺序匹配的短语，并返回包含该短语的文档（Document）。短语中最后一个不完整的词项（Term）会被解释为前缀，因此所有包含以该短语和最后一个词项的前缀开头的短语的文档都会被返回。

与 [match phrase](/query-dsl/full-text/match-phrase) 类似，但会根据查询字符串中的最后一个词项创建一个[前缀查询](https://lucene.apache.org/core/8_9_0/core/org/apache/lucene/search/PrefixQuery.html)。

有关 `match_phrase_prefix` 查询与 `match_bool_prefix` 查询之间的区别，请参阅 [`match_bool_prefix` 查询与 `match_phrase_prefix` 查询](/query-dsl/full-text/match-bool-prefix#the-match_bool_prefix-and-match_phrase_prefix-queries)。

以下示例展示了一个基本的 `match_phrase_prefix` 查询：

```json
GET _search
{
  "query": {
    "match_phrase_prefix": {
      "title": "the wind"
    }
  }
}
```

如需传递其他参数，可以使用展开语法：

```json
GET _search
{
  "query": {
    "match_phrase_prefix": {
      "title": {
        "query": "the wind",
        "analyzer": "stop"
      }
    }
  }
}
```

## 示例

例如，假设某个索引（Index）包含以下文档：

```json
PUT testindex/_doc/1
{
  "title": "The wind rises"
}
```

```json
PUT testindex/_doc/2
{
  "title": "Gone with the wind"
  
}
```

以下 `match_phrase_prefix` 查询搜索完整单词 `wind`，且其后紧跟一个以 `ri` 开头的单词：

```json
GET testindex/_search
{
  "query": {
    "match_phrase_prefix": {
      "title": "wind ri"
    }
  }
}
```

响应中包含匹配的文档：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 6,
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
    "max_score": 0.92980814,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 0.92980814,
        "_source": {
          "title": "The wind rises"
        }
      }
    ]
  }
}
```
</details>

## 参数

该查询接受字段名称（`<field>`）作为顶级参数：

```json
GET _search
{
  "query": {
    "match_phrase": {
      "<field>": {
        "query": "text to search for",
        ... 
      }
    }
  }
}
```

`<field>` 接受以下参数。除 `query` 外，所有参数均为可选。

参数 | 数据类型 | 描述
:--- | :--- | :---
`query` | String | 用于搜索的查询字符串。必需。
`analyzer` | String | 用于对查询进行分词的[分析器](/analyzers/)（Analyzer）。 
`max_expansions` | Positive integer |  查询最多可以扩展到的词项数。模糊查询会“扩展到”在 `fuzziness` 指定距离内的若干个匹配词项，然后 OpenSearch 尝试匹配这些词项。默认值为 `50`。
`slop` | `0` (default) or a positive integer | 控制查询中的单词在顺序错乱到何种程度时仍可视为匹配。引自 [Lucene 文档](https://lucene.apache.org/core/8_9_0/core/org/apache/lucene/search/PhraseQuery.html#getSlop--)：“查询短语中各单词之间允许出现的其他单词数。例如，调换两个单词的顺序需要移动两次（第一次移动使两个单词重叠），因此若要允许短语重新排序，slop 至少为 2。值为 0 时要求精确匹配。”
