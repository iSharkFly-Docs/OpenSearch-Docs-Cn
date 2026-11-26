---
title: 拼写纠错（Did-you-mean）
---

# 拼写纠错（Did-you-mean）

`Did-you-mean` 建议器（suggester）会针对拼写错误的搜索词显示修正建议。

例如，如果用户输入 "fliud"，OpenSearch 会建议一个修正后的搜索词，例如 "fluid"。然后，你可以向用户推荐这个修正后的词，甚至自动更正搜索词。

可以使用以下方法之一实现 `did-you-mean` 建议器：

- 使用[词项建议器（term suggester）](#term-suggester)为单个单词提供修正建议。
- 使用[短语建议器（phrase suggester）](#phrase-suggester)为短语提供修正建议。

## 词项建议器

使用词项建议器为单个单词提供拼写修正建议。
词项建议器使用[编辑距离（edit distance）](https://en.wikipedia.org/wiki/Edit_distance)来计算建议。

编辑距离是指将一个词项变成另一个词项所需执行的单字符插入、删除或替换的次数。例如，要把单词 "cat" 变成 "hats"，需要把 "c" 替换为 "h"，并插入一个 "s"，因此这里的编辑距离为 2。

使用词项建议器时，不需要为索引设置任何特殊的字段映射（mapping）。默认情况下，字符串字段类型会被映射为 `text`。`text` 字段会经过分析，因此下例中的 `title` 会被切分为单个单词。索引以下文档会创建一个 `books` 索引，其中 `title` 是 `text` 字段：

```json
PUT books/_doc/1
{
  "title": "Design Patterns (Object-Oriented Software)"
}

PUT books/_doc/2
{
  "title": "Software Architecture Patterns Explained"
}
```

要查看字符串是如何被切分为词元（token）的，可以使用 `_analyze` 端点。要应用该字段所使用的同一个分析器（analyzer），可以在 `field` 参数中指定字段名称：

```json
GET books/_analyze
{
  "text": "Design Patterns (Object-Oriented Software)",
  "field": "title"
}
```

默认分析器（`standard`）会在单词边界处切分字符串、去除标点符号，并将词元转换为小写：

```json
{
  "tokens" : [
    {
      "token" : "design",
      "start_offset" : 0,
      "end_offset" : 6,
      "type" : "<ALPHANUM>",
      "position" : 0
    },
    {
      "token" : "patterns",
      "start_offset" : 7,
      "end_offset" : 15,
      "type" : "<ALPHANUM>",
      "position" : 1
    },
    {
      "token" : "object",
      "start_offset" : 17,
      "end_offset" : 23,
      "type" : "<ALPHANUM>",
      "position" : 2
    },
    {
      "token" : "oriented",
      "start_offset" : 24,
      "end_offset" : 32,
      "type" : "<ALPHANUM>",
      "position" : 3
    },
    {
      "token" : "software",
      "start_offset" : 33,
      "end_offset" : 41,
      "type" : "<ALPHANUM>",
      "position" : 4
    }
  ]
}
```

要为拼写错误的搜索词获取建议，请使用词项建议器。在 `text` 字段中指定需要建议的输入文本，并在 `field` 字段中指定从哪个字段获取建议：

```json
GET books/_search
{
  "suggest": {
    "spell-check": {
      "text": "patern",
      "term": {
        "field": "title"
      }
    }
  }
}
```

词项建议器会在 `options` 数组中返回针对输入文本的修正列表：

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
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "suggest" : {
    "spell-check" : [
      {
        "text" : "patern",
        "offset" : 0,
        "length" : 6,
        "options" : [
          {
            "text" : "patterns",
            "score" : 0.6666666,
            "freq" : 2
          }
        ]
      }
    ]
  }
}
```

`score` 值根据编辑距离计算，评分越高，建议越好。`freq` 是频率，表示该词项在指定索引的文档中出现的次数。

可以在一个请求中包含多个建议。以下示例使用词项建议器生成两个不同的建议：

```json
GET books/_search
{
  "suggest": {
    "spell-check1" : {
      "text" : "patern",
      "term" : {
        "field" : "title"
      }
    },
    "spell-check2" : {
      "text" : "desing",
      "term" : {
        "field" : "title"
      }
    }
  }
}
```

要针对多个字段中的同一输入文本获取建议，可以全局定义文本，以避免重复：

```json
GET books/_search
{
  "suggest": {
    "text" : "patern",
    "spell-check1" : {
      "term" : {
        "field" : "title"
      }
    },
    "spell-check2" : {
      "term" : {
        "field" : "subject"
      }
    }
  }
}
```

如果同时在全局级别和单个建议级别指定了 `text`，则建议级别的值会覆盖全局值。

### 词项建议器选项

可以为词项建议器指定以下选项。

选项 | 描述
:--- | :---
field | 获取建议的来源字段。必需。可以为每个建议单独设置，也可以全局设置。
analyzer | 用于分析输入文本的分析器。默认为 `field` 所配置的分析器。
size | 针对输入文本中每个词元返回的最大建议数。
sort | 指定响应中建议的排序方式。有效值如下：<br>- `score`：先按相似度评分排序，再按文档频率排序，最后按词项本身排序。<br>- `frequency`：先按文档频率排序，再按相似度评分排序，最后按词项本身排序。
suggest_mode | 建议模式，指定响应中应包含哪些词项的建议。有效值如下：<br>- `missing`：只为索引中不存在的输入文本词项返回建议。<br>- `popular`：只有当建议在文档中出现的频率高于原始输入文本时才返回建议。<br> - `always`：始终为输入文本中的每个词项返回建议。<br>默认值为 `missing`。
max_edits | 建议的最大编辑距离。有效值范围为 [1, 2]。默认值为 2。
prefix_length | 一个整数，指定开始返回建议所需匹配的前缀的最小长度。如果 `prefix_length` 长度的前缀不匹配，即使搜索词仍在编辑距离范围内，也不会返回建议。默认值为 1。较大的值可以提高拼写检查性能，因为拼写错误通常不会出现在单词开头。
min_word_length | 建议被包含在响应中所需的最小长度。默认值为 4。
shard_size | 从每个分片（shard）获取的最大候选建议数。考虑所有候选建议之后，返回排名前 `shard_size` 的建议。默认值等于 `size` 的值。由于词项可能位于不同分片中，分片级文档频率可能不精确。如果 `shard_size` 大于 `size`，建议的文档频率会更准确，但性能会下降。
max_inspections | `shard_size` 的乘数因子。OpenSearch 为查找建议而检查的最大候选建议数为 `shard_size` 乘以 `max_inspection`。可能会提高准确性，但会降低性能。默认值为 5。
min_doc_freq | 建议被返回所需出现的最小文档数或文档百分比。只返回分片级文档频率较高的建议，可能会提高准确性。有效值为表示文档频率的整数，或者表示文档百分比的 [0, 1] 范围内的浮点数。默认值为 0（禁用该功能）。
max_term_freq | 建议被返回所能出现的最大文档数。有效值为表示文档频率的整数，或者表示文档百分比的 [0, 1] 范围内的浮点数。默认值为 0.01。排除高频词项可以提高拼写检查性能，因为高频词项通常拼写正确。使用分片级文档频率。
string_distance | 用于判断相似度的编辑距离算法。有效值如下：<br>- `internal`：默认算法，基于 [Damerau-Levenshtein 算法](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance)，但针对比较索引中词项的编辑距离进行了高度优化。<br> - `damerau_levenshtein`：基于 [Damerau-Levenshtein 算法](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance)的编辑距离算法。<br>- `levenshtein`：基于 [Levenshtein 编辑距离算法](https://en.wikipedia.org/wiki/Levenshtein_distance)的编辑距离算法。<br> - `jaro_winkler`：基于 [Jaro-Winkler 算法](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance)的编辑距离算法。<br> - `ngram`：基于字符 n-gram 的编辑距离算法。

## 短语建议器

要实现 `did-you-mean`，请使用短语建议器。
短语建议器与词项建议器类似，不同之处在于它使用 n-gram 语言模型来建议完整的短语，而不是单个单词。

要设置短语建议器，请创建一个名为 `trigram` 的自定义分析器，它使用 `shingle` 过滤器并将词元转换为小写。该过滤器与 `edge_ngram` 过滤器类似，但作用于单词而不是字母。然后，使用所创建的自定义分析器配置作为建议来源的字段：

```json
PUT books2
{
  "settings": {
    "index": {
      "analysis": {
        "analyzer": {
          "trigram": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": [
              "lowercase",
              "shingle"
            ]
          }
        },
        "filter": {
          "shingle": {
            "type": "shingle",
            "min_shingle_size": 2,
            "max_shingle_size": 3
          }
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "trigram": {
            "type": "text",
            "analyzer": "trigram"
          }
        }
      }
    }
  }
}
```

将文档索引到新索引中：

```json
PUT books2/_doc/1
{
  "title": "Design Patterns"
}

PUT books2/_doc/2
{
  "title": "Software Architecture Patterns Explained"
}
```

假设用户搜索了一个错误的短语：

```json
GET books2/_search
{
  "suggest": {
    "phrase-check": {
      "text": "design paterns",
      "phrase": {
        "field": "title.trigram"
      }
    }
  }
}
```

短语建议器返回修正后的短语：

```json
{
  "took" : 4,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "suggest" : {
    "phrase-check" : [
      {
        "text" : "design paterns",
        "offset" : 0,
        "length" : 14,
        "options" : [
          {
            "text" : "design patterns",
            "score" : 0.31666178
          }
        ]
      }
    ]
  }
}
```

要高亮显示建议，请为短语建议器设置 [`highlight`](/search-plugins/searching-data/highlight) 字段：

```json
GET books2/_search
{
  "suggest": {
    "phrase-check": {
      "text": "design paterns",
      "phrase": {
        "field": "title.trigram",
        "gram_size": 3,
        "highlight": {
          "pre_tag": "<em>",
          "post_tag": "</em>"
        }
      }
    }
  }
}
```

结果中包含高亮显示的文本：

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
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "suggest" : {
    "phrase-check" : [
      {
        "text" : "design paterns",
        "offset" : 0,
        "length" : 14,
        "options" : [
          {
            "text" : "design patterns",
            "highlighted" : "design <em>patterns</em>",
            "score" : 0.31666178
          }
        ]
      }
    ]
  }
}
```

### 短语建议器选项

可以为短语建议器指定以下选项。

选项 | 描述
:--- | :---
field | 用于 n-gram 查找的字段。短语建议器使用该字段计算建议评分。必需。
gram_size | 字段中 n-gram（shingle）的最大大小 `n`。如果字段不包含 n-gram（shingle），请省略此选项或将其设为 1。如果字段使用了 shingle 过滤器且未设置 `gram_size`，则 `gram_size` 会被设为 `max_shingle_size`。
real_word_error_likelihood | 某个词项即使存在于词典中，仍然拼写错误的概率。默认值为 0.95（词典中 5% 的单词拼写错误）。
confidence | 置信度是一个浮点因子，与输入短语的评分相乘，得到其他建议的阈值评分。只返回评分高于该阈值的建议。置信度为 1.0 时，只返回评分高于输入短语的建议。如果 `confidence` 设为 0，则返回排名前 `size` 的候选项。默认值为 1。
max_errors | 返回建议时允许出错（拼写错误）的词项的最大数量或百分比。有效值为表示词项数量的整数，或者表示词项百分比的 (0, 1) 范围内的浮点数。默认值为 1（只返回最多包含一个拼写错误词项的建议）。将该值设得过高可能会降低性能。建议将 `max_errors` 设为 1 或 2 之类的较小值，以减少建议调用相对于查询执行所花费的时间。
separator | 二元组（bigram）字段中词项之间的分隔符。默认为空格字符。
size | 为每个查询词项生成的候选建议数。指定较大的值可能会返回编辑距离较大的词项。默认值为 5。
analyzer | 用于分析建议文本的分析器。默认为 `field` 所配置的分析器。
shard_size | 从每个分片获取的最大候选建议数。考虑所有候选建议之后，返回排名前 `shard_size` 的建议。默认值为 5。
[collate](#collate-field)| 用于剔除在索引中没有匹配文档的建议。
collate.query | 指定一个用于检查建议的查询，以剔除在索引中没有匹配文档的建议。
collate.prune | 指定是否返回所有建议。如果 `prune` 设为 `false`，则只返回有匹配文档的建议。如果 `prune` 设为 `true`，则返回所有建议，并且每个建议都带有一个额外的 `collate_match` 字段：建议有匹配文档时该字段为 `true`，否则为 `false`。默认值为 `false`。
highlight | 配置建议的高亮显示。`pre_tag` 和 `post_tag` 值都是必需的。
highlight.pre_tag | 高亮的起始标签。
highlight.post_tag | 高亮的结束标签。
[smoothing](#smoothing-models) | 平滑模型，用于平衡在索引中频繁出现的 shingle 与不常出现的 shingle 的权重。

### Collate 字段

要过滤掉经拼写检查后不会返回任何结果的建议，可以使用 `collate` 字段。该字段包含一个脚本化查询，会针对每个返回的建议运行。有关构建模板化查询的信息，请参阅[搜索模板](/api-reference/search-template)。可以使用 `{{suggestion}}` 变量指定当前建议，也可以在 `params` 字段中传入自己的模板参数（建议值会被添加到所指定的变量中）。

建议的 collate 查询只在该建议来源的分片上运行。该查询是必需的。

此外，如果 `prune` 参数设为 `true`，则每个建议都会添加一个 `collate_match` 字段。如果查询没有返回结果，`collate_match` 的值为 `false`。之后可以根据 `collate_match` 字段过滤建议。`prune` 参数的默认值为 `false`。

例如，以下查询将 `collate` 字段配置为运行一个 `match_phrase` 查询，将 `title` 字段与当前建议进行匹配：

```json
GET books2/_search
{
  "suggest": {
    "phrase-check": {
      "text": "design paterns",
      "phrase": {
        "field": "title.trigram",
        "collate" : {
          "query" : {
            "source": {
              "match_phrase" : {
                "title": "{{suggestion}}"
              }
            }
          },
          "prune": "true"
        }
      }
    }
  }
}
```

得到的建议中包含设为 `true` 的 `collate_match` 字段，这表示 `match_phrase` 查询会为该建议返回匹配的文档：

```json
{
  "took" : 7,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "suggest" : {
    "phrase-check" : [
      {
        "text" : "design paterns",
        "offset" : 0,
        "length" : 14,
        "options" : [
          {
            "text" : "design patterns",
            "score" : 0.56759655,
            "collate_match" : true
          }
        ]
      }
    ]
  }
}
```

### 平滑模型

在大多数用例中，计算建议评分时，不仅要考虑 shingle 的频率，还要考虑 shingle 的大小。平滑模型（smoothing model）用于计算不同大小的 shingle 的评分，以平衡频繁出现和不常出现的 shingle 的权重。

支持以下平滑模型。

模型 | 描述
:--- | :---
stupid_backoff | 如果高阶 n-gram 的计数为 0，则回退到低阶 n-gram 模型，并将低阶 n-gram 模型乘以一个常数因子（`discount`）。这是默认的平滑模型。
stupid.backoff.discount | 低阶 n-gram 模型的乘数因子。可选。默认值为 0.4。
laplace | 使用加法平滑，向所有计数加上一个常数 `alpha` 以平衡权重。
laplace.alpha | 加到所有计数上以平衡权重的常数，通常为 1.0 或更小。可选。默认值为 0.5。

默认情况下，OpenSearch 使用 Stupid Backoff 模型&mdash;&mdash;一种简单的算法：从最高阶的 shingle 开始，如果找不到高阶 shingle，就使用低阶 shingle。例如，如果将短语建议器设置为使用 3-gram、2-gram 和 1-gram，Stupid Backoff 模型会先检查 3-gram。如果没有 3-gram，它会检查 2-gram，但会将评分乘以 `discount` 因子。如果没有 2-gram，它会检查 1-gram，并再次将评分乘以 `discount` 因子。Stupid Backoff 模型在大多数情况下效果良好。如果需要选择 Laplace 平滑模型，请在 `smoothing` 参数中指定：

```json
GET books2/_search
{
  "suggest": {
    "phrase-check": {
      "text": "design paterns",
      "phrase": {
        "field": "title.trigram",
        "size" : 1,
        "smoothing" : {
          "laplace" : {
            "alpha" : 0.7
          }
        }
      }
    }
  }
}
```

### 候选生成器

候选生成器（candidate generator）根据输入文本中的词项提供可能的建议词项。目前只有一种候选生成器可用，即 `direct_generator`。直接生成器（direct generator）的工作方式与词项建议器类似：它也会针对输入文本中的每个词项调用一次。短语建议器支持多个候选生成器，每个生成器都会针对输入文本中的每个词项调用一次。它还允许指定前置过滤器（pre-filter，在输入文本词项进入拼写检查阶段之前对其进行分析的分析器）和后置过滤器（post-filter，在返回生成的建议之前对其进行分析的分析器）。

为短语建议器设置直接生成器：

```json
GET books2/_search
{
  "suggest": {
    "text": "design paterns",
    "phrase-check": {
      "phrase": {
        "field": "title.trigram",
        "size": 1,
        "direct_generator": [
          {
            "field": "title.trigram",
            "suggest_mode": "always",
            "min_word_length": 3
          }
        ]
      }
    }
  }
}
```

可以指定以下直接生成器选项。

选项 | 描述
:--- | :---
field | 获取建议的来源字段。必需。可以为每个建议单独设置，也可以全局设置。
size | 针对输入文本中每个词元返回的最大建议数。
suggest_mode | 建议模式，指定应包含在每个分片上生成的哪些词项的建议。建议模式应用于每个分片的建议，在合并来自不同分片的建议时不做检查。因此，如果建议模式为 `missing`，只要某个词项在一个分片中不存在而在另一个分片中存在，就会返回建议。有效值如下：<br>- `missing`：只为分片中不存在的输入文本词项返回建议。<br>- `popular`：只有当建议在分片文档中出现的频率高于原始输入文本时才返回建议。<br>- `always`：始终返回建议。<br>默认值为 `missing`。
max_edits | 建议的最大编辑距离。有效值范围为 [1, 2]。默认值为 2。
prefix_length | 一个整数，指定开始返回建议所需匹配的前缀的最小长度。如果 `prefix_length` 长度的前缀不匹配，即使搜索词仍在编辑距离范围内，也不会返回建议。默认值为 1。较大的值可以提高拼写检查性能，因为拼写错误通常不会出现在单词开头。
min_word_length | 建议被包含所需的最小长度。默认值为 4。
max_inspections | `shard_size` 的乘数因子。OpenSearch 为查找建议而检查的最大候选建议数为 `shard_size` 乘以 `max_inspection`。可能会提高准确性，但会降低性能。默认值为 5。
min_doc_freq | 建议被返回所需出现的最小文档数或文档百分比。只返回分片级文档频率较高的建议，可能会提高准确性。有效值为表示文档频率的整数，或者表示文档百分比的 [0, 1] 范围内的浮点数。默认值为 0（禁用该功能）。
max_term_freq | 建议被返回所能出现的最大文档数。有效值为表示文档频率的整数，或者表示文档百分比的 [0, 1] 范围内的浮点数。默认值为 0.01。排除高频词项可以提高拼写检查性能，因为高频词项通常拼写正确。使用分片级文档频率。
pre_filter | 在生成建议之前，应用于传给生成器的每个输入文本词元的分析器。
post_filter | 在将每个生成的建议传给短语评分器之前应用于该建议的分析器。
