---
title: 混合搜索
---

# 混合搜索
<Badge type="tip" text="Introduced 2.11" />

混合搜索（hybrid search）结合了关键词搜索和神经搜索，以提升搜索相关性。要实现混合搜索，你需要设置一个在搜索时运行的[搜索管道](/search-plugins/search-pipelines/)（search pipeline）。你将配置的搜索管道会在中间阶段拦截搜索结果，并对其应用 [`normalization_processor`](/search-plugins/search-pipelines/normalization-processor)。`normalization_processor` 会对来自多个查询子句的文档评分进行归一化和组合，并根据所选的归一化方法和组合方法对文档重新评分。

::: info 注意
**先决条件**<br>
使用混合搜索之前，必须先设置文本嵌入模型。有关更多信息，请参阅[选择模型](/ml-commons-plugin/integrating-ml-models#choosing-a-model)。
:::

## 使用混合搜索

要使用混合搜索，请按以下步骤操作：

1. [创建摄取管道](#step-1-create-an-ingest-pipeline)。
1. [创建用于摄取的索引](#step-2-create-an-index-for-ingestion)。
1. [将文档摄取到索引中](#step-3-ingest-documents-into-the-index)。
1. [配置搜索管道](#step-4-configure-a-search-pipeline)。
1. [使用混合搜索搜索索引](#step-5-search-the-index-using-hybrid-search)。

## 第 1 步：创建摄取管道

要生成向量嵌入，你需要创建一个包含 [`text_embedding` 处理器](/ingest-pipelines/processors/text-embedding)的[摄取管道](/api-reference/ingest-apis/)（ingest pipeline），该处理器会将文档字段中的文本转换为向量嵌入。处理器的 `field_map` 决定了用于生成向量嵌入的输入字段，以及存储嵌入的输出字段。

以下示例请求创建一个摄取管道，它将 `passage_text` 中的文本转换为文本嵌入，并将嵌入存储在 `passage_embedding` 中：

```json
PUT /_ingest/pipeline/nlp-ingest-pipeline
{
  "description": "A text embedding pipeline",
  "processors": [
    {
      "text_embedding": {
        "model_id": "bQ1J8ooBpBj3wT4HVUsb",
        "field_map": {
          "passage_text": "passage_embedding"
        }
      }
    }
  ]
}
```

## 第 2 步：创建用于摄取的索引

为了使用管道中定义的文本嵌入处理器，请创建一个 k-NN 索引，并将上一步创建的管道添加为默认管道。确保 `field_map` 中定义的字段映射为正确的类型。继续以上示例，`passage_embedding` 字段必须映射为 k-NN 向量，且其维度与模型维度一致。同样，`passage_text` 字段应映射为 `text`。

以下示例请求创建一个设置了默认摄取管道的 k-NN 索引：

```json
PUT /my-nlp-index
{
  "settings": {
    "index.knn": true,
    "default_pipeline": "nlp-ingest-pipeline"
  },
  "mappings": {
    "properties": {
      "id": {
        "type": "text"
      },
      "passage_embedding": {
        "type": "knn_vector",
        "dimension": 768,
        "method": {
          "engine": "lucene",
          "space_type": "l2",
          "name": "hnsw",
          "parameters": {}
        }
      },
      "passage_text": {
        "type": "text"
      }
    }
  }
}
```

有关创建 k-NN 索引和使用支持的方法的更多信息，请参阅 [k-NN 索引](/search-plugins/knn/knn-index)。

## 第 3 步：将文档摄取到索引中

要将文档摄取到上一步创建的索引中，请发送以下请求：

```json
PUT /my-nlp-index/_doc/1
{
  "passage_text": "Hello world",
  "id": "s1"
}
```

```json
PUT /my-nlp-index/_doc/2
{
  "passage_text": "Hi planet",
  "id": "s2"
}
```

在文档被摄取到索引之前，摄取管道会对文档运行 `text_embedding` 处理器，为 `passage_text` 字段生成文本嵌入。被索引的文档包含存放原始文本的 `passage_text` 字段，以及存放向量嵌入的 `passage_embedding` 字段。

## 第 4 步：配置搜索管道

要配置带有 [`normalization-processor`](/search-plugins/search-pipelines/normalization-processor) 的搜索管道，请使用以下请求。处理器中的归一化方法设置为 `min_max`，组合方法设置为 `arithmetic_mean`。`weights` 数组以小数形式的百分比指定分配给每个查询子句的权重：

```json
PUT /_search/pipeline/nlp-search-pipeline
{
  "description": "Post processor for hybrid search",
  "phase_results_processors": [
    {
      "normalization-processor": {
        "normalization": {
          "technique": "min_max"
        },
        "combination": {
          "technique": "arithmetic_mean",
          "parameters": {
            "weights": [
              0.3,
              0.7
            ]
          }
        }
      }
    }
  ]
}
```

## 第 5 步：使用混合搜索搜索索引

要对索引执行混合搜索，请使用 [`hybrid` 查询](/query-dsl/compound/hybrid)，它会组合关键词搜索和语义搜索的结果。

以下示例请求组合了两个查询子句——一个神经查询和一个 `match` 查询。它将上一步创建的搜索管道指定为查询参数：

```json
GET /my-nlp-index/_search?search_pipeline=nlp-search-pipeline
{
  "_source": {
    "exclude": [
      "passage_embedding"
    ]
  },
  "query": {
    "hybrid": {
      "queries": [
        {
          "match": {
            "text": {
              "query": "Hi world"
            }
          }
        },
        {
          "neural": {
            "passage_embedding": {
              "query_text": "Hi world",
              "model_id": "aVeif4oB5Vm0Tdw8zYO2",
              "k": 5
            }
          }
        }
      ]
    }
  }
}
```

或者，你也可以为 `my-nlp-index` 索引设置默认搜索管道。有关更多信息，请参阅[默认搜索管道](/search-plugins/search-pipelines/using-search-pipeline#default-search-pipeline)。

响应中包含匹配的文档：

```json
{
  "took" : 36,
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
    "max_score" : 1.2251667,
    "hits" : [
      {
        "_index" : "my-nlp-index",
        "_id" : "1",
        "_score" : 1.2251667,
        "_source" : {
          "passage_text" : "Hello world",
          "id" : "s1"
        }
      }
    ]
  }
}
```
