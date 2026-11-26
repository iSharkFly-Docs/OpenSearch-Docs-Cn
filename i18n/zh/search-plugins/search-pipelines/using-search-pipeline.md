---
title: 使用搜索管道
---

# 使用搜索管道

可以通过以下方式使用搜索管道（Search Pipeline）：

- 为请求[指定现有管道](#specifying-an-existing-search-pipeline-for-a-request)。
- 为请求[使用临时管道](#using-a-temporary-search-pipeline-for-a-request)。
- 为索引中的所有请求设置[默认管道](#default-search-pipeline)。

## 为请求指定现有搜索管道

[创建搜索管道](/search-plugins/search-pipelines/creating-search-pipeline)之后，可以在 `search_pipeline` 查询参数中指定管道名称，从而在查询中使用该管道：

```json
GET /my_index/_search?search_pipeline=my_pipeline
```

有关使用包含 `filter_query` 处理器的搜索管道的完整示例，请参阅 [`filter_query` 处理器示例](/search-plugins/search-pipelines/filter-query-processor#example)。

## 为请求使用临时搜索管道

除了创建搜索管道，也可以定义一个仅用于当前查询的临时搜索管道：

```json
POST /my-index/_search
{
  "query" : {
    "match" : {
      "text_field" : "some search text"
    }
  },
  "search_pipeline" : {
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
    ],
    "response_processors": [
      {
        "rename_field": {
          "field": "message",
          "target_field": "notification"
        }
      }
    ]
  }
}
```

使用这种语法时，管道不会被持久保存，只用于指定了它的那次查询。

## 默认搜索管道

为了方便起见，可以为索引设置默认搜索管道。索引有了默认管道之后，就无需在每个搜索请求中指定 `search_pipeline` 查询参数。

### 为索引设置默认搜索管道

要为索引设置默认搜索管道，请在索引设置中指定 `index.search.default_pipeline`：

```json
PUT /my_index/_settings 
{
  "index.search.default_pipeline" : "my_pipeline"
}
```

为 `my_index` 设置默认管道后，可以再次尝试同样的搜索所有文档的请求：

```json
GET /my_index/_search
```

响应中只包含公开文档，说明管道已被默认应用：

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

### 为请求禁用默认管道

如果希望在不应用默认管道的情况下运行搜索请求，可以将 `search_pipeline` 查询参数设置为 `_none`：

```json
GET /my_index/_search?search_pipeline=_none
```

### 移除默认管道

要从索引中移除默认管道，请将其设置为 `null` 或 `_none`：

```json
PUT /my_index/_settings 
{
  "index.search.default_pipeline" : null
}
```

```json
PUT /my_index/_settings 
{
  "index.search.default_pipeline" : "_none"
}
```
