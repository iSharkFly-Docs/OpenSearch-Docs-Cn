---
title: SQL
---

# SQL

SQL in OpenSearch bridges the gap between traditional relational database concepts and the flexibility of OpenSearch's document-oriented data storage. This integration gives you the ability to use your SQL knowledge to query, analyze, and extract insights from your OpenSearch data.

## SQL and OpenSearch terminology

Here’s how core SQL concepts map to OpenSearch:

SQL | OpenSearch
:--- | :---
Table | Index
Row | Document
Column | Field

## REST API

For a complete REST API reference for the SQL plugin, see [SQL/PPL API](/search-plugins/sql/sql-ppl-api). 

To use the SQL plugin with your own applications, send requests to the `_plugins/_sql` endpoint:

```json
POST _plugins/_sql
{
  "query": "SELECT * FROM my-index LIMIT 50"
}
```

You can query multiple indexes by using a comma-separated list:

```json
POST _plugins/_sql
{
  "query": "SELECT * FROM my-index1,myindex2,myindex3 LIMIT 50"
}
```

You can specify an index pattern with a wildcard expression:

```json
POST _plugins/_sql
{
  "query": "SELECT * FROM my-index* LIMIT 50"
}
```

To run the preceding query in the command line, use the [curl](https://curl.haxx.se/) command:

```bash
curl -XPOST https://localhost:9200/_plugins/_sql -u 'admin:<custom-admin-password>' -k -H 'Content-Type: application/json' -d '{"query": "SELECT * FROM my-index* LIMIT 50"}'
```

You can specify the [response format](/search-plugins/sql/response-formats) as JDBC, standard OpenSearch JSON, CSV, or raw. By default, queries return data in JDBC format. The following query sets the format to JSON:

```json
POST _plugins/_sql?format=json
{
  "query": "SELECT * FROM my-index LIMIT 50"
}
```

For more information about request parameters, settings, supported operations, and tools, see the related topics under [SQL](/search-plugins/sql/sql/).
