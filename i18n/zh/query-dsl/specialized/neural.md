---
title: Neural
---

# Neural 查询

使用 `neural` 查询在[神经搜索](/search-plugins/neural-search)中进行向量字段搜索。 

## 请求字段

在 `neural` 查询中包含以下请求字段：

```json
"neural": {
  "<vector_field>": {
    "query_text": "<query_text>",
    "query_image": "<image_binary>",
    "model_id": "<model_id>",
    "k": 100
  }
}
```

顶层的 `vector_field` 指定要对其运行搜索查询的向量字段。下表列出了其他 neural 查询字段。

字段 | 数据类型 | 必需/可选 | 描述
:--- | :--- | :--- 
`query_text` | String | 可选 | 用于生成向量嵌入的查询文本。`query_text` 和 `query_image` 至少要指定一个。
`query_image` | String | 可选 | 与查询图像对应的 base-64 编码字符串，用于生成向量嵌入。`query_text` 和 `query_image` 至少要指定一个。
`model_id` | String | 如果未设置默认模型 ID，则为必需。更多信息，请参阅[为索引或字段设置默认模型](/search-plugins/semantic-search#setting-a-default-model-on-an-index-or-field)。 | 用于从查询文本生成向量嵌入的模型的 ID。模型必须先部署到 OpenSearch 中，才能用于神经搜索。更多信息，请参阅[在 OpenSearch 中使用自定义模型](/ml-commons-plugin/using-ml-models)和[神经搜索](/search-plugins/neural-search)。
`k` | Integer | 可选 | k-NN 搜索返回的结果数量。默认值为 10。
`filter` | Object | 可选 | 用于减少待考虑文档数量的查询。关于过滤器用法的更多信息，请参阅[使用过滤器的 k-NN 搜索](/search-plugins/knn/filter-search-knn)。**重要**：过滤器只能与 `faiss` 或 `lucene` 引擎配合使用。

#### 示例请求

```json
GET /my-nlp-index/_search
{
  "query": {
    "neural": {
      "passage_embedding": {
        "query_text": "Hi world",
        "query_image": "iVBORw0KGgoAAAAN...",
        "k": 100,
        "filter": {
          "bool": {
            "must": [
              {
                "range": {
                  "rating": {
                    "gte": 8,
                    "lte": 10
                  }
                }
              },
              {
                "term": {
                  "parking": "true"
                }
              }
            ]
          }
        }
      }
    }
  }
}
```
