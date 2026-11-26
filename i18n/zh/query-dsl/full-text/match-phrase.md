---
title: Match 短语
---

# Match 短语查询

使用 `match_phrase` 查询（Query）可以匹配按指定顺序包含某个精确短语的文档（Document）。通过提供 `slop` 参数，可以让短语匹配更加灵活。

`match_phrase` 查询会创建一个匹配词项（Term）序列的[短语查询](https://lucene.apache.org/core/8_9_0/core/org/apache/lucene/search/PhraseQuery.html)。

以下示例展示了一个基本的 `match_phrase` 查询：

```json
GET _search
{
  "query": {
    "match_phrase": {
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
    "match_phrase": {
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

以下 `match_phrase` 查询搜索短语 `wind rises`，即单词 `wind` 后紧跟单词 `rises`：

```json
GET testindex/_search
{
  "query": {
    "match_phrase": {
      "title": "wind rises"
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
  "took": 30,
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

## 分析器

默认情况下，对 `text` 字段运行查询时，搜索文本会使用与该字段关联的索引分析器（Analyzer）进行分析。你可以在 `analyzer` 参数中指定其他搜索分析器。例如，以下查询使用 `english` 分析器：

```json
GET testindex/_search
{
  "query": {
    "match_phrase": {
      "title": {
        "query": "the winds",
        "analyzer": "english"
      }
    }
  }
}
```

`english` 分析器会移除停用词 `the` 并执行词干提取，生成词元（Token）`wind`。两个文档都与该词元匹配，因此都会在结果中返回：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 2,
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
    "max_score": 0.19363807,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 0.19363807,
        "_source": {
          "title": "The wind rises"
        }
      },
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 0.17225474,
        "_source": {
          "title": "Gone with the wind"
        }
      }
    ]
  }
}
```
</details>

## Slop

如果提供了 `slop` 参数，查询会容许搜索词项的顺序发生变化。slop 指定查询短语中各单词之间允许出现的其他单词数。例如，在以下查询中，搜索文本的单词顺序与文档文本不同：

```json
GET _search
{
  "query": {
    "match_phrase": {
      "title": {
        "query": "wind rises the",
        "slop": 3
      }
    }
  }
}
```

查询仍然会返回匹配的文档：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 2,
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
    "max_score": 0.44026947,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 0.44026947,
        "_source": {
          "title": "The wind rises"
        }
      }
    ]
  }
}
```
</details>

## 空查询

有关可能出现的空查询，请参阅 [match 查询中的相应章节](/query-dsl/full-text/match#empty-query)。

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
`analyzer` | String | 用于对查询字符串文本进行分词的[分析器](/analyzers/)。默认值为 `default_field` 指定的索引时分析器。如果没有为 `default_field` 指定分析器，则 `analyzer` 为该索引的默认分析器。
`slop` | `0` (default) or a positive integer | 控制查询中的单词在顺序错乱到何种程度时仍可视为匹配。引自 [Lucene 文档](https://lucene.apache.org/core/8_9_0/core/org/apache/lucene/search/PhraseQuery.html#getSlop--)：“查询短语中各单词之间允许出现的其他单词数。例如，调换两个单词的顺序需要移动两次（第一次移动使两个单词重叠），因此若要允许短语重新排序，slop 至少为 2。值为 0 时要求精确匹配。”
`zero_terms_query` | String | 在某些情况下，分析器会移除查询字符串中的所有词项。例如，`stop` 分析器会移除字符串 `an but this` 中的所有词项。在这种情况下，`zero_terms_query` 指定是不匹配任何文档（`none`）还是匹配所有文档（`all`）。有效值为 `none` 和 `all`。默认值为 `none`。
