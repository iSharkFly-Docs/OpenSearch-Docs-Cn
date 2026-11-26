---
title: Rerank
---

# Rerank 处理器

`rerank` 搜索请求处理器会拦截搜索结果，并将其传递给交叉编码器（cross-encoder）模型进行重排序（reranking）。模型会结合评分上下文对结果重新排序，然后处理器根据文档的新评分对搜索结果中的文档进行排序。

## 请求字段

下表列出了所有可用的请求字段。

字段 | 数据类型 | 描述
:--- | :--- | :---
`<reranker_type>` | Object | 重排序器类型，为 rerank 处理器提供所有重排序调用都需要的静态信息。必需。
`context` | Object | 为 rerank 处理器提供在查询时生成重排序上下文所需的信息。
`tag` | String | 处理器的标识符。可选。
`description` | String | 处理器的描述。可选。
`ignore_failure` | Boolean | 如果为 `true`，OpenSearch 会[忽略该处理器的任何失败](/search-plugins/search-pipelines/creating-search-pipeline#ignoring-processor-failures)，并继续运行搜索管道中剩余的处理器。可选。默认值为 `false`。

### `ml_opensearch` 重排序器类型 {#the-mlopensearch-reranker-type}

`ml_opensearch` 重排序器类型设计用于配合 OpenSearch 提供的交叉编码器模型使用。对于这种重排序器类型，请指定以下字段。

字段  | 数据类型 | 描述
:--- | :---  | :--- 
`ml_opensearch` | Object | 为 rerank 处理器提供模型信息。必需。
`ml_opensearch.model_id` | String | 交叉编码器模型的模型 ID。必需。有关更多信息，请参阅[使用 ML 模型](/ml-commons-plugin/using-ml-models)。
`context.document_fields` | Array | 文档字段数组，指定从哪些字段中检索交叉编码器模型所需的上下文。必需。

## 示例 

以下示例演示如何使用包含 `rerank` 处理器的搜索管道。

### 创建搜索管道

以下请求创建一个包含 `rerank` 响应处理器的搜索管道：

```json
PUT /_search/pipeline/rerank_pipeline
{
  "response_processors": [
    {
      "rerank": {
        "ml_opensearch": {
          "model_id": "gnDIbI0BfUsSoeNT_jAw"
        },
        "context": {
          "document_fields": [ "title", "text_representation"]
        }
      }
    }
  ]
}
```

### 使用搜索管道

将 OpenSearch 查询与一个 `ext` 对象组合使用，该对象包含供大语言模型（LLM）使用的查询上下文。提供用于对结果进行重排序的 `query_text`：

```json
POST /_search?search_pipeline=rerank_pipeline
{
  "query": {
    "match": {
      "text_representation": "Where is Albuquerque?"
    }
  },
  "ext": {
    "rerank": {
      "query_context": {
        "query_text": "Where is Albuquerque?"
      }
    }
  }
}
```

除了指定 `query_text`，也可以提供包含重排序所用文本的字段的完整路径。例如，如果在 `text_representation` 对象中指定了子字段 `query`，请在 `query_text_path` 参数中指定其路径：

```json
POST /_search?search_pipeline=rerank_pipeline
{
  "query": {
    "match": {
      "text_representation": {
        "query": "Where is Albuquerque?"
      }
    }
  },
  "ext": {
    "rerank": {
      "query_context": {
        "query_text_path": "query.match.text_representation.query"
      }
    }
  }
}
```

`query_context` 对象包含以下字段。 

字段名称  | 描述
:--- | :---  
`query_text` | 用于对搜索结果进行重排序的问题的自然语言文本。`query_text` 和 `query_text_path` 必须指定其中一个（不能同时指定）。
`query_text_path` | 用于对搜索结果进行重排序的问题文本的完整 JSON 路径。`query_text` 和 `query_text_path` 必须指定其中一个（不能同时指定）。路径的最大字符数为 `1000`。

有关设置重排序的更多信息，请参阅[对搜索结果进行重排序](/search-plugins/search-relevance/reranking-search-results)。
