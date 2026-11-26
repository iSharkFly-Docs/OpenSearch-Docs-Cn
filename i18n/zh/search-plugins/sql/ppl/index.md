---
title: PPL
---

# PPL

管道处理语言（Piped Processing Language，PPL）是一种以顺序、逐步的方式处理数据的查询语言。PPL 使用管道（`|`）运算符把多个命令组合起来，用于查找和检索数据。它是 OpenSearch 中可观测性（Observability）功能的主要查询语言，并支持多数据源查询。

## PPL 语法

下面的示例展示了 PPL 的基本语法：

```sql
search source=<index-name> | <command_1> | <command_2> | ... | <command_n>
```

具体的 PPL 语法示例请参阅[语法](/search-plugins/sql/ppl/syntax)。

## PPL 命令

PPL 通过一系列命令对数据进行过滤、转换和聚合。每个命令的说明和示例请参阅[命令](/search-plugins/sql/ppl/functions)。

## 在 OpenSearch 中使用 PPL

要使用 PPL，必须先安装 OpenSearch Dashboards。PPL 可以在 [Query Workbench 工具](https://playground.opensearch.org/app/opensearch-query-workbench#/)中使用。关于在 OpenSearch 中使用 PPL 的教程，请参阅 [Query Workbench](/dashboards/query-workbench) 文档。

## 开发者文档

开发者可以在以下资源中找到相关信息：

- [Piped Processing Language](https://github.com/opensearch-project/piped-processing-language) 规范
- [OpenSearch PPL 参考手册](https://github.com/opensearch-project/sql/blob/main/docs/user/ppl/index.rst)
- 使用[基于 PPL 的可视化](https://github.com/opensearch-project/dashboards-observability#event-analytics)实现[可观测性](https://github.com/opensearch-project/dashboards-observability/)
- PPL [数据类型](https://github.com/opensearch-project/sql/blob/main/docs/user/ppl/general/datatypes.rst)
