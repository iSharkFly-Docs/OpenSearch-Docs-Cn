---
title: Neural sparse
---

# Neural sparse 查询
<Badge type="tip" text="Introduced 2.11" />

使用 `neural_sparse` 查询在[神经稀疏搜索](/search-plugins/neural-sparse-search)中进行向量字段搜索。 

## 请求字段

在 `neural_sparse` 查询中包含以下请求字段：

```json
"neural_sparse": {
  "<vector_field>": {
    "query_text": "<query_text>",
    "model_id": "<model_id>"
  }
}
```

顶层的 `vector_field` 指定要对其运行搜索查询的向量字段。下表列出了其他 `neural_sparse` 查询字段。

字段 | 数据类型 | 必需/可选 | 描述
:--- | :--- | :--- 
`query_text` | String | 必需 | 用于生成向量嵌入的查询文本。 
`model_id` | String | 必需 | 用于从查询文本生成向量嵌入的稀疏编码模型或分词器（Tokenizer）模型的 ID。模型必须先部署到 OpenSearch 中，才能用于稀疏神经搜索。更多信息，请参阅[在 OpenSearch 中使用自定义模型](/ml-commons-plugin/using-ml-models)和[神经稀疏搜索](/search-plugins/neural-sparse-search)。
`max_token_score` | Float | 可选 | （已弃用）词汇表中所有词元（Token）评分的理论上限（用于性能优化）。对于 OpenSearch 提供的[预训练稀疏嵌入模型](/ml-commons-plugin/pretrained-models#sparse-encoding-models)，我们建议将 `amazon/neural-sparse/opensearch-neural-sparse-encoding-doc-v1` 的 `max_token_score` 设置为 2，将 `amazon/neural-sparse/opensearch-neural-sparse-encoding-v1` 的设置为 3.5。该字段从 OpenSearch 2.12 起已弃用。

#### 示例请求

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
