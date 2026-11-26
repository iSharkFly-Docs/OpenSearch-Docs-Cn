---
title: 创建搜索管道
---

# 创建搜索管道

搜索管道（Search Pipeline）存储在集群状态中。要创建搜索管道，必须在 OpenSearch 集群中配置一个有序的处理器列表。同一管道中可以包含多个相同类型的处理器。每个处理器都有一个 `tag` 标识符，用于将其与其他处理器区分开来。为特定处理器添加标签有助于调试错误消息，尤其是在添加了多个相同类型的处理器时。

#### 示例请求

以下请求创建一个搜索管道，其中包含一个 `filter_query` 请求处理器和一个响应处理器：前者使用 term 查询只返回公开消息，后者将字段 `message` 重命名为 `notification`：

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
```

## 忽略处理器失败

默认情况下，如果搜索管道中的某个处理器失败，管道就会停止运行。如果希望在处理器失败时管道继续运行，可以在创建管道时将该处理器的 `ignore_failure` 参数设置为 `true`：

```json
"filter_query" : {
  "tag" : "tag1",
  "description" : "This processor is going to restrict to publicly visible documents",
  "ignore_failure": true,
  "query" : {
    "term": {
      "visibility": "public"
    }
  }
}
```

如果该处理器失败，OpenSearch 会记录这次失败，并继续运行搜索管道中所有剩余的处理器。要检查是否发生过失败，可以使用[搜索管道指标](/search-plugins/search-pipelines/search-pipeline-metrics)。 

## 更新搜索管道

要动态更新搜索管道，请使用 Search Pipeline API 替换该搜索管道。 

#### 示例请求 {#example-request-1}

以下示例请求通过添加一个 `filter_query` 请求处理器和一个 `rename_field` 响应处理器来更新插入（upsert）`my_pipeline`：

```json
PUT /_search/pipeline/my_pipeline
{
  "request_processors": [
    {
      "filter_query": {
        "tag": "tag1",
        "description": "This processor returns only publicly visible documents",
        "query": {
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
```

## 搜索管道版本

创建管道时，可以在 `version` 参数中为其指定版本：

```json
PUT _search/pipeline/my_pipeline
{
  "version": 1234,
  "request_processors": [
    {
      "script": {
        "source": """
           if (ctx._source['size'] > 100) {
             ctx._source['explain'] = false;
           }
         """
      }
    }
  ]
}
```

此后所有 `get pipeline` 请求的响应中都会提供该版本：

```json
GET _search/pipeline/my_pipeline
```

响应中包含管道版本：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "my_pipeline": {
    "version": 1234,
    "request_processors": [
      {
        "script": {
          "source": """
           if (ctx._source['size'] > 100) {
             ctx._source['explain'] = false;
           }
         """
        }
      }
    ]
  }
}
```
</details>
