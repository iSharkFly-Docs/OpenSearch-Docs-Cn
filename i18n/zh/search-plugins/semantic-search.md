---
title: 语义搜索
---

# 语义搜索

语义搜索（semantic search）会考虑查询（Query）的上下文和意图。在 OpenSearch 中，语义搜索通过神经搜索（Neural Search）结合文本嵌入模型（model）来实现。语义搜索会创建一个稠密向量（dense vector，即一个浮点数列表），并将数据摄取到 k-NN 索引（Index）中。

::: info 注意
**前提条件**<br>
在使用语义搜索之前，必须先设置一个文本嵌入模型。有关更多信息，请参阅[选择模型](/ml-commons-plugin/integrating-ml-models#choosing-a-model)。
:::

## 使用语义搜索

要使用语义搜索，请按照以下步骤操作：

1. [创建摄取管道](#step-1-create-an-ingest-pipeline)。
1. [创建用于摄取的索引](#step-2-create-an-index-for-ingestion)。
1. [将文档摄取到索引中](#step-3-ingest-documents-into-the-index)。
1. [使用神经搜索搜索索引](#step-4-search-the-index-using-neural-search)。

## 第 1 步：创建摄取管道

要生成向量嵌入（embedding），需要创建一个[摄取管道（Ingest Pipeline）](/api-reference/ingest-apis/)，其中包含一个 [`text_embedding` 处理器](/ingest-pipelines/processors/text-embedding)，用于将文档（Document）字段中的文本转换为向量嵌入。处理器的 `field_map` 决定了从哪些输入字段（Field）生成向量嵌入，以及将嵌入存储到哪些输出字段中。

以下示例请求创建了一个摄取管道，其中 `passage_text` 中的文本将被转换为文本嵌入，嵌入将存储在 `passage_embedding` 中：

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

为了使用管道中定义的文本嵌入处理器，需要创建一个 k-NN 索引，并将上一步创建的管道添加为默认管道。请确保 `field_map` 中定义的字段被映射（Mapping）为正确的类型。继续以本示例为例，`passage_embedding` 字段必须映射为 k-NN 向量，且其维度与模型维度相匹配。同样，`passage_text` 字段应映射为 `text`。

以下示例请求创建了一个设置了默认摄取管道的 k-NN 索引：

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

有关创建 k-NN 索引及其支持的方法的更多信息，请参阅 [k-NN 索引](/search-plugins/knn/knn-index)。

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

## 第 4 步：使用神经搜索搜索索引

要在索引上执行向量搜索，可以在 [k-NN 插件 API](/search-plugins/knn/api#search-model) 或 [Query DSL](/query-dsl/) 查询中使用 `neural` 查询子句。可以使用 [k-NN 搜索过滤器](/search-plugins/knn/filter-search-knn)对结果进行细化。

以下示例请求使用 Boolean 查询组合了一个过滤子句和两个查询子句——一个 neural 查询和一个 `match` 查询。`script_score` 查询为各查询子句分配自定义权重：

```json
GET /my-nlp-index/_search
{
  "_source": {
    "excludes": [
      "passage_embedding"
    ]
  },
  "query": {
    "bool": {
      "filter": {
         "wildcard":  { "id": "*1" }
      },
      "should": [
        {
          "script_score": {
            "query": {
              "neural": {
                "passage_embedding": {
                  "query_text": "Hi world",
                  "model_id": "bQ1J8ooBpBj3wT4HVUsb",
                  "k": 100
                }
              }
            },
            "script": {
              "source": "_score * 1.5"
            }
          }
        },
        {
          "script_score": {
            "query": {
              "match": {
                "passage_text": "Hi world"
              }
            },
            "script": {
              "source": "_score * 1.7"
            }
          }
        }
      ]
    }
  }
}
```

响应包含匹配的文档：

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

## 在索引或字段上设置默认模型

[`neural`](/query-dsl/specialized/neural) 查询需要一个模型 ID 来生成向量嵌入。为了避免在每个 neural 查询请求中都传入模型 ID，可以在 k-NN 索引或字段上设置默认模型。

首先，创建一个带有 [`neural_query_enricher`](/search-plugins/search-pipelines/neural-query-enricher) 请求处理器的[搜索管道（Search Pipeline）](/search-plugins/search-pipelines/)。要为索引设置默认模型，请在 `default_model_id` 参数中提供模型 ID。要为特定字段设置默认模型，请在 `neural_field_default_id` 映射中提供字段名及对应的模型 ID。如果同时提供了 `default_model_id` 和 `neural_field_default_id`，则 `neural_field_default_id` 优先：

```json
PUT /_search/pipeline/default_model_pipeline 
{
  "request_processors": [
    {
      "neural_query_enricher" : {
        "default_model_id": "bQ1J8ooBpBj3wT4HVUsb",
        "neural_field_default_id": {
           "my_field_1": "uZj0qYoBMtvQlfhaYeud",
           "my_field_2": "upj0qYoBMtvQlfhaZOuM"
        }
      }
    }
  ]
}
```

然后为索引设置默认模型：

```json
PUT /my-nlp-index/_settings
{
  "index.search.default_pipeline" : "default_model_pipeline"
}
```

现在，搜索时可以省略模型 ID：

```json
GET /my-nlp-index/_search
{
  "_source": {
    "excludes": [
      "passage_embedding"
    ]
  },
  "query": {
    "neural": {
      "passage_embedding": {
        "query_text": "Hi world",
        "k": 100
      }
    }
  }
}
```

响应包含两个文档：

```json
{
  "took" : 41,
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
    "max_score" : 1.22762,
    "hits" : [
      {
        "_index" : "my-nlp-index",
        "_id" : "2",
        "_score" : 1.22762,
        "_source" : {
          "passage_text" : "Hi planet",
          "id" : "s2"
        }
      },
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
