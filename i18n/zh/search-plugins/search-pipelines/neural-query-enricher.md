---
title: Neural query enricher
---

# Neural query enricher 处理器

`neural_query_enricher` 搜索请求处理器用于在索引级别或字段级别为[神经搜索](/search-plugins/neural-search)（Neural Search）查询设置默认的机器学习（ML）模型 ID。要了解有关 ML 模型的更多信息，请参阅[在 OpenSearch 中使用 ML 模型](/ml-commons-plugin/using-ml-models)和[连接远程模型](/ml-commons-plugin/remote-models/)。

## 请求字段

下表列出了所有可用的请求字段。

字段 | 数据类型 | 描述
:--- | :--- | :---
`default_model_id` | String | 索引默认模型的模型 ID。可选。`default_model_id` 和 `neural_field_default_id` 至少要指定一个。如果两者都提供，则以 `neural_field_default_id` 为准。
`neural_field_default_id` | Object | 由键值对组成的映射，表示文档字段名称及其关联的默认模型 ID。可选。`default_model_id` 和 `neural_field_default_id` 至少要指定一个。如果两者都提供，则以 `neural_field_default_id` 为准。
`tag` | String | 处理器的标识符。可选。
`description` | String | 处理器的描述。可选。

## 示例 

以下示例请求创建一个包含 `neural_query_enricher` 搜索请求处理器的搜索管道。该处理器在索引级别设置默认模型 ID，并为索引中的两个特定字段分别提供不同的默认模型 ID：

```json
PUT /_search/pipeline/default_model_pipeline 
{
  "request_processors": [
    {
      "neural_query_enricher" : {
        "tag": "tag1",
        "description": "Sets the default model ID at index and field levels",
        "default_model_id": "u5j0qYoBMtvQlfhaxOsa",
        "neural_field_default_id": {
           "my_field_1": "uZj0qYoBMtvQlfhaYeud",
           "my_field_2": "upj0qYoBMtvQlfhaZOuM"
        }
      }
    }
  ]
}
```
