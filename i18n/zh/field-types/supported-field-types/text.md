---
title: Text
---

# Text 字段类型

`text` 字段类型包含一个经过分析的字符串。由于它支持部分匹配，因此用于全文搜索。对多个词项的搜索可以只匹配其中的一部分。根据所用分析器（Analyzer）的不同，结果可以不区分大小写、经过词干提取、去除停用词、应用同义词等。

::: info 注意
如果需要将字段用于精确值搜索，请将其映射为 [`keyword`](/field-types/supported-field-types/keyword)。
:::

::: info 注意
[`match_only_text`](/field-types/supported-field-types/match-only-text) 字段是 `text` 字段的空间优化版本。如果不需要查询短语或使用位置查询，请将字段映射为 `match_only_text` 而不是 `text`。位置查询是指词项在短语中的位置很重要的查询，例如 interval 查询或 span 查询。 
:::

## 示例

创建一个包含 text 字段的映射（Mapping）：

```json
PUT movies
{
  "mappings" : {
    "properties" : {
      "title" : {
        "type" :  "text"
      }
    }
  }
}
```

## 参数

下表列出了 text 字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :---
`analyzer` | 用于该字段的分析器。默认情况下，该分析器同时用于索引时和搜索时。如需在搜索时覆盖它，请设置 `search_analyzer` 参数。默认值为 `standard` 分析器，它使用基于语法的分词，并基于 [Unicode Text Segmentation](https://unicode.org/reports/tr29/) 算法。
`boost` | 一个浮点值，指定该字段在相关性评分（Relevance Score）中的权重。大于 1.0 的值会提高该字段的相关性，介于 0.0 和 1.0 之间的值会降低该字段的相关性。默认值为 1.0。
`eager_global_ordinals` | 指定是否在刷新时预先加载全局序数（global ordinals）。如果该字段经常用于聚合（Aggregation），应将此参数设置为 `true`。默认值为 `false`。
`fielddata` | 一个布尔值，指定是否可以访问该字段经过分析的词元（Token），以用于排序、聚合和脚本。默认值为 `false`。
`fielddata_frequency_filter` | 一个 JSON 对象，指定只将文档频率介于 `min` 和 `max` 值之间（以绝对数值或百分比表示）的分析后词元加载到内存中。频率按段计算。参数：`min`、`max`、`min_segment_size`。默认加载所有分析后的词元。
`fields` | 如需以多种方式索引同一个字符串（例如同时作为 keyword 和 text），请提供 fields 参数。可以指定字段的一个版本用于搜索，另一个版本用于排序和聚合。
`index` | 一个布尔值，指定该字段是否可搜索。默认值为 `true`。
`index_options` | 指定为搜索和高亮而在索引中存储的信息。有效值：`docs`（仅文档编号）、`freqs`（文档编号和词频）、`positions`（文档编号、词频和词项位置）、`offsets`（文档编号、词频、词项位置以及起止字符偏移量）。默认值为 `positions`。
`index_phrases` | 一个布尔值，指定是否单独索引 2-gram。2-gram 是该字段字符串中两个连续单词的组合。这样可以加快不带 slop 的精确短语查询，但会使索引更大。在不去除停用词时效果最佳。默认值为 `false`。
`index_prefixes` | 一个 JSON 对象，指定单独索引词项前缀。前缀的字符数介于 `min_chars` 和 `max_chars` 之间（含边界）。这样可以加快前缀搜索，但会使索引更大。可选参数：`min_chars`、`max_chars`。`min_chars` 默认值为 2，`max_chars` 默认值为 5。
`meta` | 接受该字段的元数据。
`norms` | 一个布尔值，指定计算相关性评分时是否使用字段长度。默认值为 `false`。
`position_increment_gap` | text 字段在分析时会被分配位置。如果字段包含一个字符串数组，并且这些位置是连续的，就可能导致跨不同数组元素的匹配。为防止这种情况，会在相邻的数组元素之间插入一个人为的间隔。可以通过指定整数 `position_increment_gap` 来更改该间隔。注意：如果 `slop` 大于 `position_element_gap`，则可能出现跨不同数组元素的匹配。默认值为 100。
`similarity` | 用于计算相关性评分的排名算法。默认值为 `BM25`。 
[`term_vector`](#term-vector-parameter) | 一个布尔值，指定是否存储该字段的词项向量。默认值为 `no`。

## 词项向量参数

词项向量在分析过程中生成，它包含：
- 词项列表。
- 每个词项的序数位置。
- 搜索字符串在字段中的起止字符偏移量。
- 载荷（payload，如果有）。每个词项都可以关联与该词项位置相关的自定义二进制数据。

`term_vector` 字段包含一个 JSON 对象，接受以下参数：

参数 | 存储的值
:--- | :---
`no` | 无。这是默认值。
`yes` | 字段中的词项。
`with_offsets` | 词项和字符偏移量。
`with_positions_offsets` | 词项、位置和字符偏移量。
`with_positions_offsets_payloads` | 词项、位置、字符偏移量和载荷。
`with_positions` | 词项和位置。
`with_positions_payloads` | 词项、位置和载荷。

::: tip 提示
存储位置对邻近查询很有用，存储字符偏移量对高亮很有用。
:::

### 词项向量参数示例

创建一个包含 text 字段的映射，并在词项向量中存储字符偏移量：

```json
PUT testindex
{
  "mappings" : {
    "properties" : {
      "dob" : {
        "type" :  "text",
        "term_vector": "with_positions_offsets"
      }
    }
  }
}
```

索引一个包含 text 字段的文档（Document）：

```json
PUT testindex/_doc/1
{
    "dob" : "The patient's date of birth."
}
```

查询 "date of birth"，并在原始字段中将其高亮：

```json
GET testindex/_search
{
  "query": {
    "match": {
      "text": "date of birth"
    }
  },
  "highlight": {
    "fields": {
      "text": {} 
    }
  }
}
```

响应中 "date of birth" 这几个词被高亮显示：

```json
{
  "took" : 854,
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
    "max_score" : 0.8630463,
    "hits" : [
      {
        "_index" : "testindex",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 0.8630463,
        "_source" : {
          "text" : "The patient's date of birth."
        },
        "highlight" : {
          "text" : [
            "The patient's <em>date</em> <em>of</em> <em>birth</em>."
          ]
        }
      }
    ]
  }
}
```
