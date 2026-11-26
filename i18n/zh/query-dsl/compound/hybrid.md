---
title: 混合查询
---

# 混合查询

可以使用混合（hybrid）查询将多个查询（Query）的相关性评分（Relevance Score）合并为给定文档（Document）的一个评分。混合查询包含一个由一个或多个查询组成的列表，并在分片（Shard）级别为每个子查询独立计算文档评分。子查询的重写在协调节点级别执行，以避免重复计算。

## 示例

使用 `hybrid` 查询之前，必须先设置机器学习（ML）模型、摄取文档，并配置一个带有 [`normalization-processor`](/search-plugins/search-pipelines/normalization-processor) 的搜索管道（Search Pipeline）。

要了解如何设置 ML 模型，请参阅[选择模型](/ml-commons-plugin/integrating-ml-models#choosing-a-model)。

设置好 ML 模型后，请按照[使用混合搜索](/search-plugins/hybrid-search#using-hybrid-search)中的步骤学习如何使用 `hybrid` 查询。

如需完整示例，请参阅[神经搜索教程](/search-plugins/neural-search-tutorial#tutorial)。

## 参数

下表列出了 `hybrid` 查询支持的所有顶级参数。

参数 | 描述
:--- | :---
`queries` | 由一个或多个用于匹配文档的查询子句组成的数组。文档必须至少匹配一个查询子句才能在结果中返回。所有查询子句产生的文档相关性评分会通过应用[搜索管道](/search-plugins/search-pipelines/)合并为一个评分。查询子句的最大数量为 5。必需。

## 禁用混合查询

混合查询默认处于启用状态。要在集群中禁用混合查询，请在 `opensearch.yml` 中将 `plugins.neural_search.hybrid_search_disabled` 设置为 `true`。
