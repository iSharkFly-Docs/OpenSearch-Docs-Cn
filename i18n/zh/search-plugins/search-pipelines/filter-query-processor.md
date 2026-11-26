---
title: Filter query
---

# Filter query 处理器

`filter_query` 搜索请求处理器会拦截搜索请求，并对请求附加一个额外的查询来过滤结果。当你不想改写应用中已有的查询，但又需要对结果进行额外过滤时，这个处理器非常有用。

## 请求字段

下表列出了所有可用的请求字段。

字段 | 数据类型 | 描述
:--- | :--- | :---
`query` | Object | 使用查询领域特定语言（DSL）编写的查询。有关 OpenSearch 查询类型的列表，请参阅 [Query DSL](/query-dsl/)。必需。 
`tag` | String | 处理器的标识符。可选。
`description` | String | 处理器的描述。可选。
`ignore_failure` | Boolean | 如果为 `true`，OpenSearch 会[忽略该处理器的任何失败](/search-plugins/search-pipelines/creating-search-pipeline#ignoring-processor-failures)，并继续运行搜索管道中剩余的处理器。可选。默认值为 `false`。

## 示例 

以下示例演示如何使用包含 `filter_query` 处理器的搜索管道。

### 准备工作

创建一个名为 `my_index` 的索引，并索引两个文档，一个公开，一个私有：

```json
POST /my_index/_doc/1
{
  "message": "This is a public message", 
  "visibility":"public"
}
```

```json
POST /my_index/_doc/2
{
  "message": "This is a private message", 
  "visibility": "private"
}
```

### 创建搜索管道 

以下请求创建一个名为 `my_pipeline` 的搜索管道，其中包含一个 `filter_query` 请求处理器，该处理器使用 term 查询只返回公开消息：

```json
PUT /_search/pipeline/my_pipeline 
{
  "request_processors": [
    {
      "filter_query" : {
        "tag" : "tag1",
        "description" : "This processor is going to restrict to publicly visible documents",
        "query" : {
          "term": {
            "visibility": "public"
          }
        }
      }
    }
  ]
}
```

### 使用搜索管道

不使用搜索管道，在 `my_index` 中搜索文档：

```json
GET /my_index/_search
```

响应包含两个文档：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took" : 47,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "my_index",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "message" : "This is a public message",
          "visibility" : "public"
        }
      },
      {
        "_index" : "my_index",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "message" : "This is a private message",
          "visibility" : "private"
        }
      }
    ]
  }
}
```
</details>

要使用管道进行搜索，请在 `search_pipeline` 查询参数中指定管道名称：

```json
GET /my_index/_search?search_pipeline=my_pipeline
```

响应只包含可见性为 `public` 的文档：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took" : 19,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 0.0,
    "hits" : [
      {
        "_index" : "my_index",
        "_id" : "1",
        "_score" : 0.0,
        "_source" : {
          "message" : "This is a public message",
          "visibility" : "public"
        }
      }
    ]
  }
}
```
</details>
