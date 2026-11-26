---
title: 字符串字段类型
---

# 字符串字段类型

字符串字段类型包含文本值或由文本派生的值。下表列出了 OpenSearch 支持的所有字符串字段类型。

字段数据类型 | 描述
:--- | :---  
[`keyword`](/field-types/supported-field-types/keyword) | 不经过分析的字符串。适用于精确值搜索。
[`text`](/field-types/supported-field-types/text) | 经过分析的字符串。适用于全文搜索。
[`match_only_text`](/field-types/supported-field-types/match-only-text) | `text` 字段的空间优化版本。
[`token_count`](/field-types/supported-field-types/token-count)  | 统计字符串中的词元（Token）数量。
