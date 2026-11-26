---
title: 神经稀疏搜索
---

# 神经稀疏搜索
<Badge type="tip" text="Introduced 2.11" />

[语义搜索](/search-plugins/semantic-search)依赖基于文本嵌入（embedding）模型的稠密检索。然而，稠密方法使用 k-NN 搜索，会消耗大量内存和 CPU 资源。神经稀疏搜索（neural sparse search）是语义搜索的一种替代方案，它使用倒排索引实现，因此与 BM25 同样高效。神经稀疏搜索由稀疏嵌入模型提供支持。执行神经稀疏搜索时，它会创建一个稀疏向量（sparse vector，即由表示条目及其权重的 `token: weight` 键值对组成的列表），并将数据摄取到 rank features 索引中。

选择模型时，可以从以下方式中任选其一：

- 在摄取和搜索时都使用稀疏编码模型（性能高，延迟相对较高）。
- 在摄取时使用稀疏编码模型，在搜索时使用分词器模型（性能低，延迟相对较低）。

::: info 注意
**前提条件**<br>
使用神经稀疏搜索之前，请确保已设置好[预训练的稀疏嵌入模型](/ml-commons-plugin/pretrained-models#sparse-encoding-models)或你自己的稀疏嵌入模型。有关更多信息，请参阅[选择模型](/ml-commons-plugin/integrating-ml-models#choosing-a-model)。
:::

## 使用神经稀疏搜索

要使用神经稀疏搜索，请按以下步骤操作：

1. [创建摄取管道](#step-1-create-an-ingest-pipeline)。
1. [创建用于摄取的索引](#step-2-create-an-index-for-ingestion)。
1. [将文档摄取到索引中](#step-3-ingest-documents-into-the-index)。
1. [使用神经搜索搜索索引](#step-4-search-the-index-using-neural-search)。

## 第 1 步：创建摄取管道

要生成向量嵌入，需要创建一个包含 [`sparse_encoding` 处理器](/ingest-pipelines/processors/sparse-encoding)的[摄取管道](/api-reference/ingest-apis/)（Ingest Pipeline），该处理器会将文档字段中的文本转换为向量嵌入。处理器的 `field_map` 决定了从哪些输入字段生成向量嵌入，以及将嵌入存储在哪些输出字段中。

以下示例请求创建一个摄取管道，`passage_text` 中的文本将被转换为文本嵌入，嵌入存储在 `passage_embedding` 中：

```json
PUT /_ingest/pipeline/nlp-ingest-pipeline-sparse
{
  "description": "An sparse encoding ingest pipeline",
  "processors": [
    {
      "sparse_encoding": {
        "model_id": "aP2Q8ooBpBj3wT4HVS8a",
        "field_map": {
          "passage_text": "passage_embedding"
        }
      }
    }
  ]
}
```

## 第 2 步：创建用于摄取的索引

要使用管道中定义的文本嵌入处理器，请创建一个 rank features 索引，并将上一步创建的管道设置为默认管道。确保 `field_map` 中定义的字段被映射为正确的类型。继续沿用本例，`passage_embedding` 字段必须映射为 [`rank_features`](/field-types/supported-field-types/rank#rank-features)。同样，`passage_text` 字段应映射为 `text`。

以下示例请求创建一个设置了默认摄取管道的 rank features 索引：

```json
PUT /my-nlp-index
{
  "settings": {
    "default_pipeline": "nlp-ingest-pipeline-sparse"
  },
  "mappings": {
    "properties": {
      "id": {
        "type": "text"
      },
      "passage_embedding": {
        "type": "rank_features"
      },
      "passage_text": {
        "type": "text"
      }
    }
  }
}
```

为了节省磁盘空间，可以按如下方式将嵌入向量从 source 中排除：

```json
PUT /my-nlp-index
{
  "settings": {
    "default_pipeline": "nlp-ingest-pipeline-sparse"
  },
  "mappings": {
      "_source": {
      "excludes": [
        "passage_embedding"
      ]
    },
    "properties": {
      "id": {
        "type": "text"
      },
      "passage_embedding": {
        "type": "rank_features"
      },
      "passage_text": {
        "type": "text"
      }
    }
  }
}
```

::: warning 重要
`<token, weight>` 对一旦从 source 中排除，就无法恢复。在应用此优化之前，请确保你的应用不需要这些 `<token, weight>` 对。
:::

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

在文档被摄取到索引之前，摄取管道会对文档运行 `sparse_encoding` 处理器，为 `passage_text` 字段生成向量嵌入。被索引的文档包含存放原始文本的 `passage_text` 字段，以及存放向量嵌入的 `passage_embedding` 字段。 

## 第 4 步：使用神经搜索搜索索引

要对索引执行神经稀疏搜索，请在 [Query DSL](/query-dsl/) 查询中使用 `neural_sparse` 查询子句。 

以下示例请求使用 `neural_sparse` 查询来搜索相关文档：

```json
GET my-nlp-index/_search
{
  "query": {
    "neural_sparse": {
      "passage_embedding": {
        "query_text": "Hi world",
        "model_id": "aP2Q8ooBpBj3wT4HVS8a"
      }
    }
  }
}
```

响应包含匹配的文档：

```json
{
  "took" : 688,
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
    "max_score" : 30.0029,
    "hits" : [
      {
        "_index" : "my-nlp-index",
        "_id" : "1",
        "_score" : 30.0029,
        "_source" : {
          "passage_text" : "Hello world",
          "passage_embedding" : {
            "!" : 0.8708904,
            "door" : 0.8587369,
            "hi" : 2.3929274,
            "worlds" : 2.7839446,
            "yes" : 0.75845814,
            "##world" : 2.5432441,
            "born" : 0.2682308,
            "nothing" : 0.8625516,
            "goodbye" : 0.17146169,
            "greeting" : 0.96817183,
            "birth" : 1.2788506,
            "come" : 0.1623208,
            "global" : 0.4371151,
            "it" : 0.42951578,
            "life" : 1.5750692,
            "thanks" : 0.26481047,
            "world" : 4.7300377,
            "tiny" : 0.5462298,
            "earth" : 2.6555297,
            "universe" : 2.0308156,
            "worldwide" : 1.3903781,
            "hello" : 6.696973,
            "so" : 0.20279501,
            "?" : 0.67785245
          },
          "id" : "s1"
        }
      },
      {
        "_index" : "my-nlp-index",
        "_id" : "2",
        "_score" : 16.480486,
        "_source" : {
          "passage_text" : "Hi planet",
          "passage_embedding" : {
            "hi" : 4.338913,
            "planets" : 2.7755864,
            "planet" : 5.0969057,
            "mars" : 1.7405145,
            "earth" : 2.6087382,
            "hello" : 3.3210192
          },
          "id" : "s2"
        }
      }
    ]
  }
}
```
