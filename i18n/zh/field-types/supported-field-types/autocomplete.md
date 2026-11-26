---
title: 自动补全字段类型
---

# 自动补全字段类型

下表列出了 OpenSearch 支持的所有自动补全字段类型（Field Type）。

字段数据类型 | 描述
:--- | :---  
[`completion`](/field-types/supported-field-types/completion) | 一种补全建议器，使用前缀补全提供自动补全功能。使用此功能之前，需要将所有可能的补全项列表上传到索引中。
[`search_as_you_type`](/field-types/supported-field-types/search-as-you-type) | 同时使用前缀补全和中缀补全，提供边输入边搜索（search-as-you-type）功能。
