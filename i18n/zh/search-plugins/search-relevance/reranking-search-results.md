---
title: 对搜索结果进行重排序
---

# 对搜索结果进行重排序
<Badge type="tip" text="Introduced 2.12" />

可以使用交叉编码器（cross-encoder）重排序器对搜索结果进行重排序（reranking），以提高搜索相关性。要实现重排序，需要配置一个在搜索时运行的[搜索管道](/search-plugins/search-pipelines/)（Search Pipeline）。该搜索管道会拦截搜索结果，并对其应用 [`rerank` 处理器](/search-plugins/search-pipelines/rerank-processor)。`rerank` 处理器会评估搜索结果，并根据交叉编码器模型提供的新评分对结果进行排序。 

::: info 注意
**前提条件**<br>
配置重排序管道之前，必须先设置交叉编码器模型。有关使用 OpenSearch 提供的模型的信息，请参阅[交叉编码器模型](/ml-commons-plugin/pretrained-models#cross-encoder-models)。有关使用自定义模型的信息，请参阅[自定义本地模型](/ml-commons-plugin/custom-local-models)。
:::

## 运行带重排序的搜索

要运行带重排序的搜索，请按以下步骤操作：

1. [配置搜索管道](#step-1-configure-a-search-pipeline)。
1. [创建用于摄取的索引](#step-2-create-an-index-for-ingestion)。
1. [将文档摄取到索引中](#step-3-ingest-documents-into-the-index)。
1. [使用重排序进行搜索](#step-4-search-using-reranking)。

## 第 1 步：配置搜索管道

接下来，配置一个包含 [`rerank` 处理器](/search-plugins/search-pipelines/rerank-processor)的搜索管道。

以下示例请求创建一个包含 `ml_opensearch` rerank 处理器的搜索管道。在请求中，提供交叉编码器模型的模型 ID 以及用作上下文的文档字段：

```json
PUT /_search/pipeline/my_pipeline
{
  "description": "Pipeline for reranking with a cross-encoder",
  "response_processors": [
    {
      "rerank": {
        "ml_opensearch": {
          "model_id": "gnDIbI0BfUsSoeNT_jAw"
        },
        "context": {
          "document_fields": [
            "passage_text"
          ]
        }
      }
    }
  ]
}
```

有关请求字段的更多信息，请参阅[请求字段](/search-plugins/search-pipelines/rerank-processor#request-fields)。

## 第 2 步：创建用于摄取的索引

要使用管道中定义的 rerank 处理器，请创建一个 OpenSearch 索引，并将上一步创建的管道设置为默认管道：

```json
PUT /my-index
{
  "settings": {
    "index.search.default_pipeline" : "my_pipeline"
  },
  "mappings": {
    "properties": {
      "passage_text": {
        "type": "text"
      }
    }
  }
}
```

## 第 3 步：将文档摄取到索引中

要将文档摄取到上一步创建的索引中，请发送以下批量请求：

```json
POST /_bulk
{ "index": { "_index": "my-index" } }
{ "passage_text" : "I said welcome to them and we entered the house" }
{ "index": { "_index": "my-index" } }
{ "passage_text" : "I feel welcomed in their family" }
{ "index": { "_index": "my-index" } }
{ "passage_text" : "Welcoming gifts are great" }

```

## 第 4 步：使用重排序进行搜索

要对索引执行重排序搜索，可以使用任意 OpenSearch 查询，并额外提供一个 `ext.rerank` 字段：

```json
POST /my-index/_search
{
  "query": {
    "match": {
      "passage_text": "how to welcome in family"
    }
  },
  "ext": {
    "rerank": {
      "query_context": {
         "query_text": "how to welcome in family"
      }
    }
  }
}
```

此外，也可以提供包含上下文的字段的完整路径。有关更多信息，请参阅 [Rerank 处理器示例](/search-plugins/search-pipelines/rerank-processor#example)。
