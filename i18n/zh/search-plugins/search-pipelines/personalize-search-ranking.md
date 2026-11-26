---
title: Personalize search ranking
---

# Personalize search ranking 处理器

`personalize_search_ranking` 搜索响应处理器会拦截搜索响应，并使用 [Amazon Personalize](https://aws.amazon.com/personalize/) 按照 Amazon Personalize 的排名对搜索结果进行重排序（reranking）。该排名基于用户过去的行为，以及有关搜索条目和用户的元数据。

::: warning 重要
要使用 `personalize_search_ranking` 处理器，必须先安装 Amazon Personalize Search Ranking（`opensearch-search-processor`）插件。有关详细说明，请参阅[安装和配置 Amazon Personalize Search Ranking 插件](https://docs.aws.amazon.com/personalize/latest/dg/opensearch-install.html)。
:::

## 请求字段

下表列出了所有可用的请求字段。

字段 | 数据类型 | 描述
:--- | :--- | :--- 
`campaign_arn` | String |  用于个性化结果的 Amazon Personalize 活动（campaign）的 Amazon 资源名称（ARN）。必需。
`recipe` | String | 要使用的 Amazon Personalize 配方（recipe）名称。目前该字段唯一支持的值为 `aws-personalized-ranking`。必需。
`weight` | Float | 用于 OpenSearch 和 Amazon Personalize 所提供排名的权重。有效值在 [0.0, 1.0] 范围内。权重越接近 1.0，计算排名时 Amazon Personalize 相对于 OpenSearch 所占的权重越大。如果指定 0.0，则使用 OpenSearch 的排名；如果指定 1.0，则使用 Amazon Personalize 的排名。必需。
`item_id_field` | String | 如果 OpenSearch 中已索引文档的 `_id` 字段与你的 Amazon Personalize `itemId` 不对应，请指定与之对应的字段名称。默认情况下，插件假定 `_id` 数据与 Amazon Personalize 数据中的 `itemId` 相匹配。
`iam_role_arn` | String | 如果你使用多个角色来限制组织中不同用户组的权限，请指定有权访问 Amazon Personalize 的角色的 ARN。如果只使用 OpenSearch 密钥库中的 AWS 凭证，则可以省略此字段。可选。
`tag` | String | 处理器的标识符。可选。
`description` | String | 处理器的描述。可选。
`ignore_failure` | Boolean | 如果为 `true`，OpenSearch 会[忽略该处理器的任何失败](/search-plugins/search-pipelines/creating-search-pipeline#ignoring-processor-failures)，并继续运行搜索管道中剩余的处理器。可选。默认值为 `false`。

## 示例 

以下示例演示如何使用包含 `personalize_search_ranking` 处理器的搜索管道。 

### 创建搜索管道 

以下请求创建一个包含 `personalize_search_ranking` 响应处理器的搜索管道：

```json
PUT /_search/pipeline/my-pipeline
{
  "description": "A pipeline to apply custom reranking from Amazon Personalize",
  "response_processors" : [
    {
      "personalized_search_ranking" : {
        "campaign_arn" : "Amazon Personalize Campaign ARN",
        "item_id_field" : "productId",
        "recipe" : "aws-personalized-ranking",
        "weight" : "0.3",
        "tag" : "personalize-processor",
        "iam_role_arn": "Role ARN",
        "aws_region": "AWS region"
      }
    }
  ]
}
```

### 使用搜索管道

要使用管道进行搜索，请在 `search_pipeline` 查询参数中指定管道名称。例如，以下请求使用上一节设置的管道搜索喜剧：

```json
GET /movies/_search?search_pipeline=my-pipeline
{
  "query": {
    "multi_match": {
      "query": "Comedy",
      "fields": ["GENRES"]
    }
  },
  "ext": {
    "personalize_request_parameters": {
      "user_id": "user ID",
      "context": { "DEVICE" : "mobile phone" }
    }
  }
}
```

有关更多详细信息，请参阅[对来自 OpenSearch（自行管理）的搜索结果进行个性化](https://docs.aws.amazon.com/personalize/latest/dg/personalize-opensearch.html)。
