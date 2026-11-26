---
title: 复合查询
---

# 复合查询

复合查询（Compound Query）用作多个叶子子句或复合子句的包装器，用于合并它们的结果或修改它们的行为。 

下表列出了所有复合查询类型。

查询类型 | 描述
:--- | :---
[`bool`](/query-dsl/compound/bool)（布尔）| 使用布尔逻辑组合多个查询子句。 
[`boosting`](/query-dsl/compound/boosting) | 在不将文档从搜索结果中移除的情况下更改文档的相关性评分（Relevance Score）。返回匹配 `positive` 查询的文档，但降低结果中匹配 `negative` 查询的文档的相关性。
[`constant_score`](/query-dsl/compound/constant-score) | 包装一个查询或过滤器，并为所有匹配的文档分配一个常量评分。该评分等于 `boost` 值。
[`dis_max`](/query-dsl/compound/disjunction-max)（析取最大值）| 返回匹配一个或多个查询子句的文档。如果文档匹配多个查询子句，则会被分配更高的相关性评分。相关性评分取所有匹配子句中的最高评分，并可选地加上其他匹配子句的评分与 tiebreaker 值的乘积。
[`function_score`](/query-dsl/compound/function-score) | 使用你定义的函数重新计算查询所返回文档的相关性评分。
[`hybrid`](/query-dsl/compound/hybrid) | 将多个查询的相关性评分合并为给定文档的一个评分。
