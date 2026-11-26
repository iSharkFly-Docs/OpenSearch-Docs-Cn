---
title: SQL
---

# SQL

OpenSearch 中的 SQL 在传统关系型数据库概念与 OpenSearch 灵活的面向文档的数据存储之间架起了桥梁。借助这一集成，你可以利用已有的 SQL 知识来查询、分析 OpenSearch 中的数据，并从中获取洞察。

## SQL 与 OpenSearch 术语对照

SQL 核心概念与 OpenSearch 的对应关系如下：

SQL | OpenSearch
:--- | :---
表（Table） | 索引（Index）
行（Row） | 文档（Document）
列（Column） | 字段（Field）

## REST API

关于 SQL 插件完整的 REST API 参考，请参阅 [SQL/PPL API](/search-plugins/sql/sql-ppl-api)。 

要在自己的应用程序中使用 SQL 插件，请向 `_plugins/_sql` 端点发送请求：

```json
POST _plugins/_sql
{
  "query": "SELECT * FROM my-index LIMIT 50"
}
```

可以使用逗号分隔的列表查询多个索引：

```json
POST _plugins/_sql
{
  "query": "SELECT * FROM my-index1,myindex2,myindex3 LIMIT 50"
}
```

可以使用通配符表达式指定索引模式：

```json
POST _plugins/_sql
{
  "query": "SELECT * FROM my-index* LIMIT 50"
}
```

要在命令行中运行上述查询，请使用 [curl](https://curl.haxx.se/) 命令：

```bash
curl -XPOST https://localhost:9200/_plugins/_sql -u 'admin:<custom-admin-password>' -k -H 'Content-Type: application/json' -d '{"query": "SELECT * FROM my-index* LIMIT 50"}'
```

可以将[响应格式](/search-plugins/sql/response-formats)指定为 JDBC、标准 OpenSearch JSON、CSV 或原始格式（raw）。默认情况下，查询以 JDBC 格式返回数据。以下查询将格式设置为 JSON：

```json
POST _plugins/_sql?format=json
{
  "query": "SELECT * FROM my-index LIMIT 50"
}
```

关于请求参数、设置、支持的操作和工具的更多信息，请参阅 [SQL](/search-plugins/sql/sql/) 下的相关主题。
