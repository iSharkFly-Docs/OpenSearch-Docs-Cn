---
title: 搜索
---

# 搜索

OpenSearch 提供了许多功能，可用于定制搜索场景并提升搜索相关性。

## 搜索方法

OpenSearch 支持以下搜索方法：

- **传统词法搜索**

    - [关键词（BM25）搜索](/search-plugins/keyword-search)：在文档语料库中搜索查询中出现的词。

- **机器学习（ML）驱动的搜索**

    - **向量搜索**

        - [k-NN 搜索](/search-plugins/knn/)：在向量索引中搜索与搜索词最邻近的 k 个邻居（k-nearest neighbors）。

    - **神经搜索**：[神经搜索](/search-plugins/neural-search)支持在摄取时生成向量嵌入，并在搜索时对其进行搜索。神经搜索允许你将 ML 模型集成到搜索中，并可作为实现其他搜索方法的框架。以下搜索方法均基于神经搜索构建：

        - [语义搜索](/search-plugins/semantic-search)：考虑搜索上下文中词语的含义。使用基于文本嵌入模型的稠密检索来搜索文本数据。

        - [多模态搜索](/search-plugins/multimodal-search)：使用多模态嵌入模型搜索文本和图像数据。

        - [神经稀疏搜索](/search-plugins/neural-sparse-search)：使用基于稀疏嵌入模型的稀疏检索来搜索文本数据。

        - [混合搜索](/search-plugins/hybrid-search)：结合传统搜索和向量搜索来提升搜索相关性。

        - [对话式搜索](/search-plugins/conversational-search)：实现检索增强的生成式搜索。

## 查询语言

在 OpenSearch 中，你可以使用以下查询语言搜索数据：

- [查询领域特定语言（DSL）](/query-dsl/)：OpenSearch 的主要查询语言，支持创建复杂且可完全自定义的查询。

- [查询字符串查询语言](/query-dsl/full-text/query-string)：一种精简的查询语言，可以在搜索请求的查询参数中或 OpenSearch Dashboards 中使用。

- [SQL](/search-plugins/sql/sql/)：一种传统查询语言，弥合了传统关系型数据库概念与 OpenSearch 面向文档的灵活数据存储之间的差距。

- [管道处理语言（PPL）](/search-plugins/sql/ppl/)：OpenSearch 中可观测性功能使用的主要语言。PPL 使用管道语法，将多个命令串联成一个查询。

- [Dashboards 查询语言（DQL）](/dashboards/dql)：一种简单的基于文本的查询语言，用于在 OpenSearch Dashboards 中过滤数据。

## 搜索性能

OpenSearch 提供了多种提升搜索性能的方式：

- [异步搜索](/search-plugins/async/)：以异步方式运行资源密集型查询。

- [并发段搜索](/search-plugins/concurrent-segment-search)：并发搜索各个段。

## 搜索相关性

OpenSearch 提供以下搜索相关性功能：

- [比较搜索结果](/search-plugins/search-relevance/compare-search-results)：OpenSearch Dashboards 中的一个搜索比较工具，可用于并排比较两个查询的结果。

- [Querqy](/search-plugins/querqy/)：提供查询重写功能。

## 搜索结果

OpenSearch 支持以下常用的搜索结果操作：

- [分页](/search-plugins/searching-data/paginate)
- [使用时间点（PIT）分页](/search-plugins/searching-data/point-in-time)
- [排序](/search-plugins/searching-data/sort)
- [高亮搜索词](/search-plugins/searching-data/highlight)
- [自动补全](/search-plugins/searching-data/autocomplete)
- [拼写纠错（did-you-mean）](/search-plugins/searching-data/did-you-mean)

## 搜索管道

你可以使用[搜索管道](/search-plugins/search-pipelines/)处理搜索查询和搜索结果。
