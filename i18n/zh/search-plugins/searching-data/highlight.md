---
title: 高亮显示查询匹配项
---

# 高亮显示查询匹配项

高亮（highlighting）会在结果中突出显示搜索词，从而强调查询匹配项。

要高亮显示搜索词，请在查询块之外添加 `highlight` 参数：

```json
GET shakespeare/_search
{
  "query": {
    "match": {
      "text_entry": "life"
    }
  },
  "size": 3,
  "highlight": {
    "fields": {
      "text_entry": {}
    }
  }
}
```

结果中的每个文档都包含一个 `highlight` 对象，其中显示的搜索词被 `em` 标签包裹：

```json
{
  "took" : 3,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 805,
      "relation" : "eq"
    },
    "max_score" : 7.450247,
    "hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "33765",
        "_score" : 7.450247,
        "_source" : {
          "type" : "line",
          "line_id" : 33766,
          "play_name" : "Hamlet",
          "speech_number" : 60,
          "line_number" : "2.2.233",
          "speaker" : "HAMLET",
          "text_entry" : "my life, except my life."
        },
        "highlight" : {
          "text_entry" : [
            "my <em>life</em>, except my <em>life</em>."
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "51877",
        "_score" : 6.873042,
        "_source" : {
          "type" : "line",
          "line_id" : 51878,
          "play_name" : "King Lear",
          "speech_number" : 18,
          "line_number" : "4.6.52",
          "speaker" : "EDGAR",
          "text_entry" : "The treasury of life, when life itself"
        },
        "highlight" : {
          "text_entry" : [
            "The treasury of <em>life</em>, when <em>life</em> itself"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "39245",
        "_score" : 6.6167283,
        "_source" : {
          "type" : "line",
          "line_id" : 39246,
          "play_name" : "Henry V",
          "speech_number" : 7,
          "line_number" : "4.7.31",
          "speaker" : "FLUELLEN",
          "text_entry" : "mark Alexanders life well, Harry of Monmouths life"
        },
        "highlight" : {
          "text_entry" : [
            "mark Alexanders <em>life</em> well, Harry of Monmouths <em>life</em>"
          ]
        }
      }
    ]
  }
}
```

高亮功能作用于字段（field）的实际内容。OpenSearch 会从存储字段（映射中设为 `true` 的字段）中获取这些内容；如果字段未存储，则从 `_source` 字段中获取。可以将 `force_source` 参数设为 `true`，强制从 `_source` 字段获取字段内容。

::: info 注意
即使搜索本身使用了同义词或词干提取，`highlight` 参数也会高亮显示原始词项。
:::

## 获取偏移量的方法

要高亮显示搜索词，高亮器（highlighter）需要知道每个词项的起始和结束字符偏移量。偏移量标记了词项在原始文本中的位置。高亮器可以从以下来源获取偏移量：

- **倒排记录（Postings）**：在索引文档时，OpenSearch 会创建倒排搜索索引&mdash;&mdash;这是用于搜索文档的核心数据结构。倒排记录代表倒排搜索索引，存储每个经过分析的词项与其所在文档列表之间的映射。如果在映射[文本字段](/field-types/supported-field-types/text)时将 `index_options` 参数设为 `offsets`，OpenSearch 会将每个词项的起始和结束字符偏移量添加到倒排索引中。在高亮过程中，高亮器会直接在倒排记录上重新运行原始查询，以定位每个词项。因此，对于大字段，存储偏移量可以提高高亮效率，因为不需要重新分析文本。存储词项偏移量需要额外的磁盘空间，但占用的磁盘空间少于存储词向量。

- [**词向量（Term vectors）**]：如果在映射文本字段时将 [`term_vector` 参数](/field-types/supported-field-types/text#term-vector-parameter)设为 `with_positions_offsets`，高亮器会使用 `term_vector` 来高亮字段。存储词向量需要的磁盘空间最多。不过，对于大于 1 MB 的字段以及前缀或通配符之类的多词项查询，它可以加快高亮速度，因为词向量提供了对每个文档的词项字典的访问。

- **文本重新分析（Text reanalysis）**：如果既没有倒排记录也没有词向量，高亮器会重新分析文本以进行高亮。对于每个需要高亮的文档和字段，高亮器都会创建一个小型内存索引，并通过 Lucene 的查询执行规划器重新运行原始查询，以获取当前文档的底层匹配信息。重新分析文本适用于大多数用例。不过，对于大字段，这种方法会消耗更多的内存和时间。

## 高亮器类型

OpenSearch 支持三种高亮器实现：`plain`、`unified` 和 `fvh`（Fast Vector Highlighter）。

下表列出了每种高亮器获取偏移量的方法。

高亮器 | 获取偏移量的方法
:--- | :---
[`unified`](#the-unified-highlighter) | 如果 `term_vector` 设为 `with_positions_offsets`，使用词向量；<br> 如果 `index_options` 设为 `offsets`，使用倒排记录；<br> 否则使用文本重新分析。
[`fvh`](#the-fvh-highlighter) | 词向量。
[`plain`](#the-plain-highlighter) | 文本重新分析。

### 设置高亮器类型

要设置高亮器类型，请在 `type` 字段中指定：

```json
GET shakespeare/_search
{
  "query": {
    "match": {
      "text_entry": "life"
    }
  },
  "highlight": {
    "fields": {
      "text_entry": { "type": "plain"}
    }
  }
}
```

### `unified` 高亮器

`unified` 高亮器基于 Lucene Unified Highlighter，是 OpenSearch 的默认高亮器。它将文本拆分为句子，并将这些句子视为单独的文档，使用 BM25 算法根据相似度为其评分。`unified` 高亮器既支持精确短语高亮，也支持多词项高亮，包括模糊、前缀和正则表达式。如果使用复杂查询在多个文档中高亮多个字段，建议在 `postings` 或 `term_vector` 字段上使用 `unified` 高亮器。

### `fvh` 高亮器

`fvh` 高亮器基于 Lucene Fast Vector Highlighter。要使用此高亮器，需要存储带有位置偏移量的词向量，这会增加索引大小。`fvh` 高亮器可以将多个字段中匹配的词项合并到一个结果中。它还可以根据匹配项的位置为其分配权重；因此，在高亮一个对短语匹配的权重提升高于词项匹配的查询时，可以将短语匹配排在词项匹配之前。此外，还可以配置 `fvh` 高亮器来选择所返回文本片段的边界，并且可以使用不同的标签高亮多个单词。

### `plain` 高亮器

`plain` 高亮器基于标准 Lucene 高亮器。它要求被高亮的字段单独存储或存储在 `_source` 字段中。`plain` 高亮器会模拟查询匹配逻辑，尤其是短语查询中单词的重要性和位置。它适用于大多数用例，但对于大字段可能较慢，因为它必须重新分析要高亮的文本。

## 高亮选项

下表介绍了可以在全局级别或字段级别指定的高亮选项。字段级设置会覆盖全局设置。

选项 | 描述
:--- | :---
type | 指定要使用的高亮器。有效值为 `unified`、`fvh` 和 `plain`。默认值为 `unified`。
fields | 指定要在其中搜索待高亮文本的字段。支持通配符表达式。如果使用通配符，则只会高亮 `text` 和 `keyword` 字段。例如，可以将 `fields` 设为 `my_field*`，以包含所有以前缀 `my_field` 开头的 `text` 和 `keyword` 字段。
force_source | 指定用于高亮的字段值应从 `_source` 字段获取，而不是从存储的字段值获取。默认值为 `false`。
require_field_match | 指定是否只高亮包含搜索查询匹配项的字段。默认值为 `true`。要高亮所有字段，请将此选项设为 `false`。
pre_tags | 以字符串数组的形式指定高亮文本的 HTML 起始标签。
post_tags | 以字符串数组的形式指定高亮文本的 HTML 结束标签。
tags_schema | 如果将此选项设为 `styled`，OpenSearch 会使用内置的标签模式。在该模式中，`pre_tags` 为 `<em class="hlt1">`、`<em class="hlt2">`、`<em class="hlt3">`、`<em class="hlt4">`、`<em class="hlt5">`、`<em class="hlt6">`、`<em class="hlt7">`、`<em class="hlt8">`、`<em class="hlt9">` 和 `<em class="hlt10">`，`post_tags` 为 `</em>`。
boundary_chars | 合并在一个字符串中的所有边界字符。<br> 默认值为 `".,!? \t\n"`。
boundary_scanner | 仅对 `unified` 和 `fvh` 高亮器有效。指定是将高亮片段按句子、单词还是字符进行拆分。有效值如下：<br>- `sentence`：按 [BreakIterator](https://docs.oracle.com/javase/8/docs/api/java/text/BreakIterator.html) 定义的句子边界拆分高亮片段。可以在 `boundary_scanner_locale` 选项中指定 BreakIterator 的区域设置。<br>- `word`：按 [BreakIterator](https://docs.oracle.com/javase/8/docs/api/java/text/BreakIterator.html) 定义的单词边界拆分高亮片段。可以在 `boundary_scanner_locale` 选项中指定 BreakIterator 的区域设置。<br>- `chars`：在 `boundary_chars` 中列出的任意字符处拆分高亮片段。仅对 `fvh` 高亮器有效。
boundary_scanner_locale | 为 `boundary_scanner` 提供[区域设置（locale）](https://docs.oracle.com/javase/8/docs/api/java/util/Locale.html)。有效值为语言标签（例如 `"en-US"`）。默认值为 [Locale.ROOT](https://docs.oracle.com/javase/8/docs/api/java/util/Locale.html#ROOT)。
boundary_max_scan | 当 `fvh` 高亮器的 `boundary_scanner` 参数设为 `chars` 时，控制扫描边界字符的范围。默认值为 20。
encoder | 指定在返回高亮片段之前是否对其进行 HTML 编码。有效值为 `default`（不编码）或 `html`（先转义 HTML 文本，再插入高亮标签）。例如，如果字段文本为 `<h3>Hamlet</h3>` 且 `encoder` 设为 `html`，则高亮后的文本为 `"&lt;h3&gt;<em>Hamlet</em>&lt;&#x2F;h3&gt;"`。
fragmenter | 指定如何将文本拆分为高亮片段。仅对 `plain` 高亮器有效。有效值如下：<br>- `span`（默认）：将文本拆分为大小相同的片段，但尽量不在高亮词项之间拆分文本。<br>- `simple`：将文本拆分为大小相同的片段。
fragment_offset | 指定开始高亮的字符偏移量。仅对 `fvh` 高亮器有效。
fragment_size | 高亮片段的大小，以字符数表示。如果 `number_of_fragments` 设为 0，则忽略 `fragment_size`。默认值为 100。
number_of_fragments| 返回片段的最大数量。如果 `number_of_fragments` 设为 0，OpenSearch 会返回整个字段的高亮内容。默认值为 5。
order | 高亮片段的排序顺序。将 `order` 设为 `score` 可按相关性对片段排序。每种高亮器计算相关性评分（relevance score）的算法各不相同。默认值为 `none`。
highlight_query | 指定高亮搜索查询以外的另一个查询的匹配项。当使用较快的查询获取文档匹配项，再使用较慢的查询（例如 `rescore_query`）优化结果时，`highlight_query` 选项非常有用。建议将搜索查询包含在 `highlight_query` 中。
matched_fields | 合并来自不同字段的匹配项来高亮一个字段。此功能最常见的用例是高亮以不同方式分析并保存在多字段（multi-field）中的文本。`matched_fields` 列表中的所有字段都必须将 `term_vector` 字段设为 `with_positions_offsets`。合并匹配项的字段是唯一被加载的字段，因此最好将其 `store` 选项设为 `yes`。仅对 `fvh` 高亮器有效。
no_match_size | 指定没有可高亮的匹配片段时，从字段开头起返回的字符数。默认值为 0。
phrase_limit | 文档中会被考虑的匹配短语的数量。限制 `fvh` 高亮器要分析的短语数量，以避免消耗大量内存。如果使用了 `matched_fields`，`phrase_limit` 指定每个匹配字段的短语数量。`phrase_limit` 越大，查询时间越长，内存消耗也越多。仅对 `fvh` 高亮器有效。默认值为 256。
max_analyzer_offset | 指定高亮请求要分析的最大字符数，其余文本不会被处理。如果要高亮的文本超过此偏移量，则返回空的高亮结果。高亮请求分析的最大字符数由 `index.highlight.max_analyzed_offset` 定义，达到此限制时会返回错误。请将 `max_analyzer_offset` 设为低于 `index.highlight.max_analyzed_offset` 的值，以避免出现该错误。

::: info 注意
unified 高亮器的句子扫描器会在达到 `fragment_size` 之后的第一个单词边界处拆分长度超过 `fragment_size` 的句子。要返回完整的句子而不进行拆分，请将 `fragment_size` 设为 0。
:::

## 更改高亮标签

在设计应用程序代码时，可以解析 `highlight` 对象中的结果，并对搜索词执行某种操作，例如更改其颜色、加粗、设为斜体等。

要更改默认的 `em` 标签，请在 `pretag` 和 `posttag` 参数中指定新标签：

```json
GET shakespeare/_search
{
  "query": {
    "match": {
      "play_name": "Henry IV"
    }
  },
  "size": 3,
  "highlight": {
    "pre_tags": [
      "<strong>"
    ],
    "post_tags": [
      "</strong>"
    ],
    "fields": {
      "play_name": {}
    }
  }
}
```

响应中的剧名会被新标签高亮显示：

```json
{
  "took" : 2,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 3205,
      "relation" : "eq"
    },
    "max_score" : 3.548232,
    "hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "0",
        "_score" : 3.548232,
        "_source" : {
          "type" : "act",
          "line_id" : 1,
          "play_name" : "Henry IV",
          "speech_number" : "",
          "line_number" : "",
          "speaker" : "",
          "text_entry" : "ACT I"
        },
        "highlight" : {
          "play_name" : [
            "<strong>Henry IV</strong>"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "1",
        "_score" : 3.548232,
        "_source" : {
          "type" : "scene",
          "line_id" : 2,
          "play_name" : "Henry IV",
          "speech_number" : "",
          "line_number" : "",
          "speaker" : "",
          "text_entry" : "SCENE I. London. The palace."
        },
        "highlight" : {
          "play_name" : [
            "<strong>Henry IV</strong>"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "2",
        "_score" : 3.548232,
        "_source" : {
          "type" : "line",
          "line_id" : 3,
          "play_name" : "Henry IV",
          "speech_number" : "",
          "line_number" : "",
          "speaker" : "",
          "text_entry" : "Enter KING HENRY, LORD JOHN OF LANCASTER, the EARL of WESTMORELAND, SIR WALTER BLUNT, and others"
        },
        "highlight" : {
          "play_name" : [
            "<strong>Henry IV</strong>"
          ]
        }
      }
    ]
  }
}
```

## 指定高亮查询

默认情况下，OpenSearch 只考虑搜索查询来进行高亮。如果使用较快的查询获取文档匹配项，再使用 `rescore_query` 之类较慢的查询来优化结果，那么高亮优化后的结果会很有用。可以通过添加 `highlight_query` 来实现：

```json
GET shakespeare/_search
{
  "query": {
    "match": {
      "text_entry": {
        "query": "thats my name"
      }
    }
  },
  "rescore": {
    "window_size": 20,
    "query": {
      "rescore_query": {
        "match_phrase": {
          "text_entry": {
            "query": "thats my name",
            "slop": 1
          }
        }
      },
      "rescore_query_weight": 5
    }
  },
  "_source": false,
  "highlight": {
    "order": "score",
    "fields": {
      "text_entry": {
        "highlight_query": {
          "bool": {
            "must": {
              "match": {
                "text_entry": {
                  "query": "thats my name"
                }
              }
            },
            "should": {
              "match_phrase": {
                "text_entry": {
                  "query": "that is my name",
                  "slop": 1,
                  "boost": 10.0
                }
              }
            },
            "minimum_should_match": 0
          }
        }
      }
    }
  }
}
```

## 合并来自不同字段的匹配项来高亮一个字段

使用 `fvh` 高亮器，可以合并来自不同字段的匹配项来高亮一个字段。此功能最常见的用例是高亮以不同方式分析并保存在多字段中的文本。`matched_fields` 列表中的所有字段都必须将 `term_vector` 字段设为 `with_positions_offsets`。合并匹配项的字段是唯一被加载的字段，因此最好将其 `store` 选项设为 `yes`。

### 示例

为 `shakespeare` 索引创建映射，其中 `text_entry` 字段使用 `standard` 分析器（analyzer）进行分析，并且有一个使用 `english` 分析器进行分析的 `english` 子字段：

```json
PUT shakespeare
{
  "mappings" : {
    "properties" : {
      "text_entry" : {
        "type" :  "text",
        "term_vector": "with_positions_offsets",
        "fields": {
          "english": { 
            "type":     "text",
            "analyzer": "english",
            "term_vector": "with_positions_offsets"
          }
        }
      }
    }
  }
}
```

`standard` 分析器会将 `text_entry` 字段拆分为单个单词。可以使用 analyze API 操作来确认这一点：

```json
GET shakespeare/_analyze
{
  "text": "bragging of thine",
  "field": "text_entry"
}
```

响应中包含按空白拆分后的原始字符串：

```json
{
  "tokens" : [
    {
      "token" : "bragging",
      "start_offset" : 0,
      "end_offset" : 8,
      "type" : "<ALPHANUM>",
      "position" : 0
    },
    {
      "token" : "of",
      "start_offset" : 9,
      "end_offset" : 11,
      "type" : "<ALPHANUM>",
      "position" : 1
    },
    {
      "token" : "thine",
      "start_offset" : 12,
      "end_offset" : 17,
      "type" : "<ALPHANUM>",
      "position" : 2
    }
  ]
}
```

`english` 分析器不仅会将字符串拆分为单词，还会对词元（token）进行词干提取并删除停用词。可以对 `text_entry.english` 字段使用 analyze API 操作来确认这一点：

```json
GET shakespeare/_analyze
{
  "text": "bragging of thine",
  "field": "text_entry.english"
}
```

响应中包含经过词干提取的单词：

```json
{
  "tokens" : [
    {
      "token" : "brag",
      "start_offset" : 0,
      "end_offset" : 8,
      "type" : "<ALPHANUM>",
      "position" : 0
    },
    {
      "token" : "thine",
      "start_offset" : 12,
      "end_offset" : 17,
      "type" : "<ALPHANUM>",
      "position" : 2
    }
  ]
}
```

要搜索单词 `bragging` 的所有形式，请使用以下查询：

```json
GET shakespeare/_search
{
  "query": {
    "query_string": {
      "query": "text_entry.english:bragging",
      "fields": [
        "text_entry"
      ]
    }
  },
  "highlight": {
    "order": "score",
    "fields": {
      "text_entry": {
        "matched_fields": [
          "text_entry",
          "text_entry.english"
        ],
        "type": "fvh"
      }
    }
  }
}
```

响应在 `text_entry` 字段中高亮显示了单词 "bragging" 的所有形式：

```json
{
  "took" : 5,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 26,
      "relation" : "eq"
    },
    "max_score" : 10.153671,
    "hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "56666",
        "_score" : 10.153671,
        "_source" : {
          "type" : "line",
          "line_id" : 56667,
          "play_name" : "macbeth",
          "speech_number" : 34,
          "line_number" : "2.3.118",
          "speaker" : "MACBETH",
          "text_entry" : "Is left this vault to brag of."
        },
        "highlight" : {
          "text_entry" : [
            "Is left this vault to <em>brag</em> of."
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "71445",
        "_score" : 9.284528,
        "_source" : {
          "type" : "line",
          "line_id" : 71446,
          "play_name" : "Much Ado about nothing",
          "speech_number" : 18,
          "line_number" : "5.1.65",
          "speaker" : "LEONATO",
          "text_entry" : "As under privilege of age to brag"
        },
        "highlight" : {
          "text_entry" : [
            "As under privilege of age to <em>brag</em>"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "86782",
        "_score" : 9.284528,
        "_source" : {
          "type" : "line",
          "line_id" : 86783,
          "play_name" : "Romeo and Juliet",
          "speech_number" : 8,
          "line_number" : "2.6.31",
          "speaker" : "JULIET",
          "text_entry" : "Brags of his substance, not of ornament:"
        },
        "highlight" : {
          "text_entry" : [
            "<em>Brags</em> of his substance, not of ornament:"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "44531",
        "_score" : 8.552448,
        "_source" : {
          "type" : "line",
          "line_id" : 44532,
          "play_name" : "King John",
          "speech_number" : 15,
          "line_number" : "3.1.124",
          "speaker" : "CONSTANCE",
          "text_entry" : "A ramping fool, to brag and stamp and swear"
        },
        "highlight" : {
          "text_entry" : [
            "A ramping fool, to <em>brag</em> and stamp and swear"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "63208",
        "_score" : 8.552448,
        "_source" : {
          "type" : "line",
          "line_id" : 63209,
          "play_name" : "Merchant of Venice",
          "speech_number" : 11,
          "line_number" : "3.4.79",
          "speaker" : "PORTIA",
          "text_entry" : "A thousand raw tricks of these bragging Jacks,"
        },
        "highlight" : {
          "text_entry" : [
            "A thousand raw tricks of these <em>bragging</em> Jacks,"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "73026",
        "_score" : 8.552448,
        "_source" : {
          "type" : "line",
          "line_id" : 73027,
          "play_name" : "Othello",
          "speech_number" : 75,
          "line_number" : "2.1.242",
          "speaker" : "IAGO",
          "text_entry" : "but for bragging and telling her fantastical lies:"
        },
        "highlight" : {
          "text_entry" : [
            "but for <em>bragging</em> and telling her fantastical lies:"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "85974",
        "_score" : 8.552448,
        "_source" : {
          "type" : "line",
          "line_id" : 85975,
          "play_name" : "Romeo and Juliet",
          "speech_number" : 20,
          "line_number" : "1.5.70",
          "speaker" : "CAPULET",
          "text_entry" : "And, to say truth, Verona brags of him"
        },
        "highlight" : {
          "text_entry" : [
            "And, to say truth, Verona <em>brags</em> of him"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "96800",
        "_score" : 8.552448,
        "_source" : {
          "type" : "line",
          "line_id" : 96801,
          "play_name" : "Titus Andronicus",
          "speech_number" : 60,
          "line_number" : "1.1.311",
          "speaker" : "SATURNINUS",
          "text_entry" : "Agree these deeds with that proud brag of thine,"
        },
        "highlight" : {
          "text_entry" : [
            "Agree these deeds with that proud <em>brag</em> of thine,"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "18189",
        "_score" : 7.9273787,
        "_source" : {
          "type" : "line",
          "line_id" : 18190,
          "play_name" : "As you like it",
          "speech_number" : 12,
          "line_number" : "5.2.30",
          "speaker" : "ROSALIND",
          "text_entry" : "and Caesars thrasonical brag of I came, saw, and"
        },
        "highlight" : {
          "text_entry" : [
            "and Caesars thrasonical <em>brag</em> of I came, saw, and"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "32054",
        "_score" : 7.9273787,
        "_source" : {
          "type" : "line",
          "line_id" : 32055,
          "play_name" : "Cymbeline",
          "speech_number" : 52,
          "line_number" : "5.5.211",
          "speaker" : "IACHIMO",
          "text_entry" : "And then a mind put int, either our brags"
        },
        "highlight" : {
          "text_entry" : [
            "And then a mind put int, either our <em>brags</em>"
          ]
        }
      }
    ]
  }
}
```

要让单词 "bragging" 的原始形式获得更高的评分，可以对 `text_entry` 字段进行权重提升（boost）：

```json
GET shakespeare/_search
{
  "query": {
    "query_string": {
      "query": "bragging",
      "fields": [
        "text_entry^5",
        "text_entry.english"
      ]
    }
  },
  "highlight": {
    "order": "score",
    "fields": {
      "text_entry": {
        "matched_fields": [
          "text_entry",
          "text_entry.english"
        ],
        "type": "fvh"
      }
    }
  }
}
```

响应会首先列出包含单词 "bragging" 的文档：

```json
{
  "took" : 17,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 26,
      "relation" : "eq"
    },
    "max_score" : 49.746853,
    "hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "45739",
        "_score" : 49.746853,
        "_source" : {
          "type" : "line",
          "line_id" : 45740,
          "play_name" : "King John",
          "speech_number" : 10,
          "line_number" : "5.1.51",
          "speaker" : "BASTARD",
          "text_entry" : "Of bragging horror: so shall inferior eyes,"
        },
        "highlight" : {
          "text_entry" : [
            "Of <em>bragging</em> horror: so shall inferior eyes,"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "63208",
        "_score" : 47.077244,
        "_source" : {
          "type" : "line",
          "line_id" : 63209,
          "play_name" : "Merchant of Venice",
          "speech_number" : 11,
          "line_number" : "3.4.79",
          "speaker" : "PORTIA",
          "text_entry" : "A thousand raw tricks of these bragging Jacks,"
        },
        "highlight" : {
          "text_entry" : [
            "A thousand raw tricks of these <em>bragging</em> Jacks,"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "68474",
        "_score" : 47.077244,
        "_source" : {
          "type" : "line",
          "line_id" : 68475,
          "play_name" : "A Midsummer nights dream",
          "speech_number" : 101,
          "line_number" : "3.2.427",
          "speaker" : "PUCK",
          "text_entry" : "Thou coward, art thou bragging to the stars,"
        },
        "highlight" : {
          "text_entry" : [
            "Thou coward, art thou <em>bragging</em> to the stars,"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "73026",
        "_score" : 47.077244,
        "_source" : {
          "type" : "line",
          "line_id" : 73027,
          "play_name" : "Othello",
          "speech_number" : 75,
          "line_number" : "2.1.242",
          "speaker" : "IAGO",
          "text_entry" : "but for bragging and telling her fantastical lies:"
        },
        "highlight" : {
          "text_entry" : [
            "but for <em>bragging</em> and telling her fantastical lies:"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "39816",
        "_score" : 44.679565,
        "_source" : {
          "type" : "line",
          "line_id" : 39817,
          "play_name" : "Henry V",
          "speech_number" : 28,
          "line_number" : "5.2.138",
          "speaker" : "KING HENRY V",
          "text_entry" : "armour on my back, under the correction of bragging"
        },
        "highlight" : {
          "text_entry" : [
            "armour on my back, under the correction of <em>bragging</em>"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "63200",
        "_score" : 44.679565,
        "_source" : {
          "type" : "line",
          "line_id" : 63201,
          "play_name" : "Merchant of Venice",
          "speech_number" : 11,
          "line_number" : "3.4.71",
          "speaker" : "PORTIA",
          "text_entry" : "Like a fine bragging youth, and tell quaint lies,"
        },
        "highlight" : {
          "text_entry" : [
            "Like a fine <em>bragging</em> youth, and tell quaint lies,"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "56666",
        "_score" : 10.153671,
        "_source" : {
          "type" : "line",
          "line_id" : 56667,
          "play_name" : "macbeth",
          "speech_number" : 34,
          "line_number" : "2.3.118",
          "speaker" : "MACBETH",
          "text_entry" : "Is left this vault to brag of."
        },
        "highlight" : {
          "text_entry" : [
            "Is left this vault to <em>brag</em> of."
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "71445",
        "_score" : 9.284528,
        "_source" : {
          "type" : "line",
          "line_id" : 71446,
          "play_name" : "Much Ado about nothing",
          "speech_number" : 18,
          "line_number" : "5.1.65",
          "speaker" : "LEONATO",
          "text_entry" : "As under privilege of age to brag"
        },
        "highlight" : {
          "text_entry" : [
            "As under privilege of age to <em>brag</em>"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "86782",
        "_score" : 9.284528,
        "_source" : {
          "type" : "line",
          "line_id" : 86783,
          "play_name" : "Romeo and Juliet",
          "speech_number" : 8,
          "line_number" : "2.6.31",
          "speaker" : "JULIET",
          "text_entry" : "Brags of his substance, not of ornament:"
        },
        "highlight" : {
          "text_entry" : [
            "<em>Brags</em> of his substance, not of ornament:"
          ]
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "44531",
        "_score" : 8.552448,
        "_source" : {
          "type" : "line",
          "line_id" : 44532,
          "play_name" : "King John",
          "speech_number" : 15,
          "line_number" : "3.1.124",
          "speaker" : "CONSTANCE",
          "text_entry" : "A ramping fool, to brag and stamp and swear"
        },
        "highlight" : {
          "text_entry" : [
            "A ramping fool, to <em>brag</em> and stamp and swear"
          ]
        }
      }
    ]
  }
}
```

## 查询限制

请注意以下限制：

- 在提取要高亮的词项时，高亮器不会反映查询的布尔逻辑。因此，对于某些复杂的布尔查询，例如嵌套布尔查询和使用 `minimum_should_match` 的查询，OpenSearch 可能会高亮与查询匹配项不对应的词项。
- `fvh` 高亮器不支持跨度查询（span query）。
