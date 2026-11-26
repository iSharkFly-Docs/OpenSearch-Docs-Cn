---
title: 多模态搜索
---

# 多模态搜索
<Badge type="tip" text="Introduced 2.11" />

使用多模态搜索（multimodal search）可以搜索文本和图像数据。在神经搜索（Neural Search）中，文本搜索借助多模态嵌入模型来实现。

::: info 注意
**前提条件**<br>
在使用文本搜索之前，必须先设置一个多模态嵌入模型。有关更多信息，请参阅[选择模型](/ml-commons-plugin/integrating-ml-models#choosing-a-model)。
:::

## 使用多模态搜索

要使用基于文本和图像嵌入的神经搜索，请按照以下步骤操作：

1. [创建摄取管道](#step-1-create-an-ingest-pipeline)。
1. [创建用于摄取的索引](#step-2-create-an-index-for-ingestion)。
1. [将文档摄取到索引中](#step-3-ingest-documents-into-the-index)。
1. [使用神经搜索来搜索索引](#step-4-search-the-index-using-neural-search)。

## 第 1 步：创建摄取管道

要生成向量嵌入（embedding），你需要创建一个[摄取管道](/api-reference/ingest-apis/)（Ingest Pipeline），其中包含一个 [`text_image_embedding` 处理器](/ingest-pipelines/processors/text-image-embedding)，它会将文档字段中的文本或图像转换为向量嵌入。处理器的 `field_map` 决定了从哪些文本和图像字段生成向量嵌入，以及将嵌入存储到哪个输出向量字段中。

以下示例请求创建了一个摄取管道，其中来自 `image_description` 的文本和来自 `image_binary` 的图像将被转换为文本嵌入，嵌入将存储在 `vector_embedding` 中：

```json
PUT /_ingest/pipeline/nlp-ingest-pipeline
{
  "description": "A text/image embedding pipeline",
  "processors": [
    {
      "text_image_embedding": {
        "model_id": "-fYQAosBQkdnhhBsK593",
        "embedding": "vector_embedding",
        "field_map": {
          "text": "image_description",
          "image": "image_binary"
        }
      }
    }
  ]
}
```

## 第 2 步：创建用于摄取的索引

为了使用管道中定义的文本嵌入处理器，请创建一个 k-NN 索引，并将上一步创建的管道添加为默认管道。确保 `field_map` 中定义的字段被映射为正确的类型。继续这个示例，`vector_embedding` 字段必须映射为 k-NN 向量，且其维度与模型维度一致。同样，`image_description` 字段应映射为 `text`，`image_binary` 应映射为 `binary`。

以下示例请求创建一个设置了默认摄取管道的 k-NN 索引：

```json
PUT /my-nlp-index
{
  "settings": {
    "index.knn": true,
    "default_pipeline": "nlp-ingest-pipeline",
    "number_of_shards": 2
  },
  "mappings": {
    "properties": {
      "vector_embedding": {
        "type": "knn_vector",
        "dimension": 1024,
        "method": {
          "name": "hnsw",
          "engine": "lucene",
          "parameters": {}
        }
      },
      "image_description": {
        "type": "text"
      },
      "image_binary": {
        "type": "binary"
      }
    }
  }
}
```

有关创建 k-NN 索引及其支持的方法的更多信息，请参阅 [k-NN 索引](/search-plugins/knn/knn-index)。

## 第 3 步：将文档摄取到索引中

要将文档摄取到上一步创建的索引中，请发送以下请求：

```json
PUT /nlp-index/_doc/1
{
 "image_description": "Orange table",
 "image_binary": "iVBORw0KGgoAAAANSUI..."
}
```

在文档被摄取到索引之前，摄取管道会对文档运行 `text_image_embedding` 处理器，为 `image_description` 和 `image_binary` 字段生成向量嵌入。除了原有的 `image_description` 和 `image_binary` 字段外，索引后的文档还包含 `vector_embedding` 字段，其中存储了组合后的向量嵌入。

## 第 4 步：使用神经搜索来搜索索引

要对索引执行向量搜索，请在 [k-NN 插件 API](/search-plugins/knn/api#search-model) 或 [Query DSL](/query-dsl/) 查询中使用 `neural` 查询子句。你可以使用 [k-NN 搜索过滤器](/search-plugins/knn/filter-search-knn)来细化结果。你可以按文本、图像或同时按文本和图像进行搜索。

以下示例请求使用 neural 查询来搜索文本和图像：

```json
GET /my-nlp-index/_search
{
  "size": 10,
  "query": {
    "neural": {
      "vector_embedding": {
        "query_text": "Orange table",
        "query_image": "iVBORw0KGgoAAAANSUI...",
        "model_id": "-fYQAosBQkdnhhBsK593",
        "k": 5
      }
    }
  }
}
```

为了避免在每个 neural 查询请求中都传递模型 ID，你可以在 k-NN 索引或字段上设置默认模型。要了解更多信息，请参阅[在索引或字段上设置默认模型](/search-plugins/semantic-search##setting-a-default-model-on-an-index-or-field)。
