---
title: 仅匹配文本
---

# 仅匹配文本字段类型

`match_only_text` 字段是 `text` 字段的一种变体，适用于不太关心评分以及词项在文档中位置信息的全文搜索场景。

`match_only_text` 字段与 `text` 字段有以下不同：

 - 不存储位置、频率和规范化因子（norms），从而降低存储需求。
 - 禁用评分，所有匹配的文档都获得恒定的 1.0 分。
 - 支持除 interval 查询和 span 查询之外的所有查询类型。

如果希望优先考虑高效的全文搜索而非复杂的排序和位置查询，同时优化存储成本，可以选择 `match_only_text` 字段类型。使用 `match_only_text` 创建的索引会显著变小，从而降低存储成本，对于大型数据集尤其如此。 

当需要快速查找包含特定词项的文档，而又不想承担存储频率和位置信息的开销时，可以使用 `match_only_text` 字段。如果需要根据相关性对结果排序，或者需要依赖词项邻近度或顺序的查询（例如 interval 查询或 span 查询），`match_only_text` 字段类型并不是最佳选择。虽然该字段类型支持短语查询，但其性能不如使用 `text` 字段类型时高效。如果识别精确短语或其在文档中的位置至关重要，请改用 `text` 字段类型。

## 示例

创建一个包含 `match_only_text` 字段的映射（Mapping）：

```json
PUT movies
{
  "mappings" : {
    "properties" : {
      "title" : {
        "type" :  "match_only_text"
      }
    }
  }
}
```

## 参数

虽然 `match_only_text` 支持 `text` 字段的大部分参数，但修改其中的大多数参数可能会适得其反。该字段类型的设计初衷是简单高效，尽量减少索引中存储的数据以优化存储成本。因此，通常最好保持默认设置。除分析器（Analyzer）设置之外的任何修改都可能重新引入开销，抵消 `match_only_text` 带来的效率优势。

下表列出了 `match_text_only` 字段可用的所有参数。

参数 | 描述
:--- | :---
`analyzer` | 该字段使用的分析器。默认情况下，它在索引时和搜索时都会使用。如需在搜索时覆盖，请设置 `search_analyzer` 参数。默认值为 `standard` 分析器，它使用基于语法的分词，并基于 [Unicode Text Segmentation](https://unicode.org/reports/tr29/) 算法。
`boost` |  所有命中（Hit）的评分都为 1，再乘以 `boost` 得到该查询子句的最终评分。
`eager_global_ordinals` | 指定是否在刷新时预先加载全局序号（global ordinals）。如果该字段经常用于聚合，应将此参数设置为 `true`。默认值为 `false`。
`fielddata` | 一个布尔值，指定是否可以访问分析后的词元（Token）用于排序、聚合和脚本。默认值为 `false`。
`fielddata_frequency_filter` | 一个 JSON 对象，指定只将文档频率介于 `min` 和 `max` 值（可以是绝对数值或百分比）之间的分析后词元加载到内存中。频率按段计算。参数：`min`、`max`、`min_segment_size`。默认加载所有分析后的词元。
`fields` | 如需以多种方式索引同一个字符串（例如同时作为 keyword 和 text），请提供 `fields` 参数。可以指定字段的一个版本用于搜索，另一个版本用于排序和聚合。
`index` | 一个布尔值，指定该字段是否可搜索。默认值为 `true`。
`index_options` | 不能修改此参数。
`index_phrases` | 不支持。
`index_prefixes` | 不支持。
`meta` | 接受该字段的元数据。
`norms` | 规范化因子（norms）已禁用，且无法启用。
`position_increment_gap` | 虽然位置信息已禁用，但在短语查询中使用时，`position_increment_gap` 的行为与 `text` 字段类似。此类查询可能较慢，但仍可正常工作。
`similarity` | 设置相似度没有任何作用。`match_only_text` 字段类型不支持 `more_like_this` 等依赖相似度的查询。对于依赖相似度的查询，请使用 `keyword` 或 `text` 字段。
`term_vector` | 支持词项向量（term vector），但不建议使用，因为这与该字段的主要目的——存储优化——相悖。

## 将字段从 `text` 迁移到 `match_only_text`

可以使用 [Reindex API](/api-reference/document-apis/reindex) 从 `text` 字段迁移到 `match_only_text`，方法是在目标索引中更新为正确的映射。

在以下示例中，`source` 索引包含一个类型为 `text` 的 `title` 字段。

创建一个目标索引，其中 `title` 字段映射为 `text`：

```json
PUT destination
{
  "mappings" : {
    "properties" : {
      "title" : {
        "type" :  "match_only_text"
      }
    }
  }
}
```

重新索引数据：

```json
POST _reindex
{
   "source": {
      "index":"source"
   },
   "dest": {
      "index":"destination"
   }
}
```
