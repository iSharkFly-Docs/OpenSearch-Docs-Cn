---
title: 搜索管道
---

# 搜索管道

你可以使用*搜索管道*（search pipeline）构建新的或复用已有的结果重排序器、查询改写器以及其他作用于查询或结果的组件。搜索管道让你更方便地在 OpenSearch 内部处理搜索查询和搜索结果。将部分应用功能迁移到 OpenSearch 搜索管道中，可以降低应用的整体复杂度。在搜索管道中，你需要指定一个处理器（processor）列表，由这些处理器执行模块化的任务。之后，你可以轻松地添加处理器或调整处理器顺序，为应用定制搜索结果。 

## 术语

以下是搜索管道相关术语列表：

* [*搜索请求处理器*](/search-plugins/search-pipelines/search-processors#search-request-processors)（search request processor）：拦截搜索请求（请求中传递的查询和元数据），使用或针对该搜索请求执行操作，然后返回搜索请求的组件。
* [*搜索响应处理器*](/search-plugins/search-pipelines/search-processors#search-response-processors)（search response processor）：拦截搜索响应和搜索请求（请求中传递的查询、结果和元数据），使用或针对该搜索响应执行操作，然后返回搜索响应的组件。
* [*搜索阶段结果处理器*](/search-plugins/search-pipelines/search-processors#search-phase-results-processors)（search phase results processor）：在协调节点层面、于各搜索阶段之间运行的组件。搜索阶段结果处理器会拦截某一搜索阶段检索到的结果，对其进行转换后再传递给下一个搜索阶段。
* [*处理器*](/search-plugins/search-pipelines/search-processors)：搜索请求处理器或搜索响应处理器。
* *搜索管道*：集成在 OpenSearch 中的有序处理器列表。管道会拦截查询、对查询进行处理、将其发送给 OpenSearch、拦截结果、对结果进行处理，然后将结果返回给调用方应用，如下图所示。 

![搜索处理器示意图](/images/search-pipelines.png)

::: info 注意
管道的请求处理和响应处理都在协调节点上执行，因此不存在分片级别的处理。
:::

## 处理器

要详细了解可用的搜索处理器，请参阅[搜索处理器](/search-plugins/search-pipelines/search-processors)。

## 示例

要创建搜索管道，请向搜索管道端点发送请求，并指定一个有序的处理器列表，这些处理器将按顺序依次应用：

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

有关创建和更新搜索管道的更多信息，请参阅[创建搜索管道](/search-plugins/search-pipelines/creating-search-pipeline)。 

要在查询中使用管道，请在 `search_pipeline` 查询参数中指定管道名称：

```json
GET /my_index/_search?search_pipeline=my_pipeline
```

此外，你也可以在请求中使用临时管道，或者为索引设置默认管道。要了解更多信息，请参阅[使用搜索管道](/search-plugins/search-pipelines/using-search-pipeline)。

要了解如何获取现有搜索管道的详细信息，请参阅[获取搜索管道](/search-plugins/search-pipelines/retrieving-search-pipeline)。

## 搜索管道指标

有关获取搜索管道统计信息的内容，请参阅[搜索管道指标](/search-plugins/search-pipelines/search-pipeline-metrics)。
