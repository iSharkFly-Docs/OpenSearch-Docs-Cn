---
title: 专用查询
---

# 专用查询

OpenSearch 支持以下专用查询（Specialized Query）：

- `distance_feature`：根据原点与文档的 `date`、`date_nanos` 或 `geo_point` 字段之间动态计算的距离来计算文档评分。该查询可以跳过不具竞争力的命中（Hit）。

- `more_like_this`：查找与给定文本、文档或文档集合相似的文档。

- [`neural`](/query-dsl/specialized/neural)：用于[神经搜索](/search-plugins/neural-search)中的向量字段搜索。

- [`neural_sparse`](/query-dsl/specialized/neural-sparse)：用于[稀疏神经搜索](/search-plugins/neural-sparse-search)中的向量字段搜索。

- `percolate`：查找与给定文档匹配的查询（以文档形式存储）。

- `rank_feature`：根据数值特征的值计算评分。该查询可以跳过不具竞争力的命中。

- `script`：将脚本用作过滤器。

- [`script_score`](/query-dsl/specialized/script-score)：使用脚本为匹配的文档计算自定义评分。

- `wrapper`：接受以 JSON 或 YAML 字符串形式表示的其他查询。
