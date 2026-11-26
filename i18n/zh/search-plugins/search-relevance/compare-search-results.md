---
title: 比较搜索结果
---

# 比较搜索结果

借助 OpenSearch Dashboards 中的 Compare Search Results（比较搜索结果）工具，你可以并排比较两个查询的结果，判断其中一个查询是否比另一个产生更好的结果。使用该工具，你可以通过试验不同的查询来评估搜索质量。 

例如，你可以观察在应用以下某种查询变更后，结果会发生怎样的变化：

- 为字段设置不同的权重
- 采用不同的词干提取（stemming）或词形还原（lemmatization）策略
- 使用 shingle

## 前提条件

开始之前，必须先在 OpenSearch 中索引数据。要了解如何创建新索引，请参阅[索引数据](/im-plugin/)。 

此外，也可以按以下步骤在 OpenSearch Dashboards 中添加示例数据：

1. 在顶部菜单栏中，转到 **OpenSearch Dashboards > Overview**。
1. 选择 **View app directory**。
1. 选择 **Add sample data**。  
1. 选择一个内置数据集，然后选择 **Add data**。

## 在 OpenSearch Dashboards 中使用 Compare Search Results

要在 OpenSearch Dashboards 中比较搜索结果，请执行以下步骤。

**第 1 步：** 在顶部菜单栏中，转到 **OpenSearch Plugins > Search Relevance**。  

**第 2 步：** 在搜索栏中输入搜索文本。

**第 3 步：** 为 **Query 1** 选择一个索引，并用 [OpenSearch Query DSL](/query-dsl/) 输入查询（仅请求体）。`GET` HTTP 方法和 `_search` 端点是隐含的。使用 `%SearchText%` 变量引用搜索栏中的文本。

以下是一个示例查询：

```json
{
  "query": {
    "multi_match": {
      "query": "%SearchText%",
      "fields": [ "description", "item_name" ]
    }
  }
}
```

**第 4 步：** 为 **Query 2** 选择一个索引并输入查询（仅请求体）。

以下示例查询在搜索结果中提升了 `title` 字段的权重：

```json
{
  "query": {
    "multi_match": {
      "query": "%SearchText%",
      "fields": [ "description", "item_name^3" ]
    }
  }
}
```

**第 5 步：** 选择 **Search**，然后比较 **Result 1** 和 **Result 2**。

以下示例界面展示了在 `description` 和 `item_name` 字段中搜索单词“cup”时，对 `item_name` 进行权重提升与不提升的对比。

<img src="/images/search_relevance.png" alt="Compare search results"/>

如果 Result 1 中的某个结果也出现在 Result 2 中，结果编号下方的 `Up` 和 `Down` 指示符表示该结果相对于 Result 2 中同一结果上移或下移了多少位。在本例中，ID 为 2 的文档在 Result 2 中相对于 Result 1 是 `Up 1`（上移 1 位），在 Result 1 中相对于 Result 2 是 `Down 1`（下移 1 位）。 

## 更改结果数量

默认情况下，OpenSearch 返回前 10 个结果。要将返回的结果数量更改为其他值，请在查询中指定 `size` 参数：

```json
{
  "size": 15,
  "query": {
    "multi_match": {
      "query": "%SearchText%",
      "fields": [ "title^3", "text" ]
    }
  }
}
```

::: info 注意
将 `size` 设置为较大的值（例如超过 250 个文档）可能会降低性能。
:::

::: info 注意
无法保存某次比较以供日后使用，因此 Compare Search Results 不适合用于系统化测试。
:::

## 将 OpenSearch 搜索结果与重排序后的结果进行比较

Compare Search Results 的一个用例是将 OpenSearch 的原始结果与经过重排序应用处理后的同一结果进行比较。OpenSearch 目前集成了以下两种重排序器：

- [Amazon Kendra Intelligent Ranking for OpenSearch](#reranking-results-with-amazon-kendra-intelligent-ranking-for-opensearch)
- [Amazon Personalize Search Ranking](#personalizing-search-results-with-amazon-personalize-search-ranking)

### 使用 Amazon Kendra Intelligent Ranking for OpenSearch 对结果进行重排序

重排序器的一个例子是由 Amazon Kendra 团队贡献的 **Amazon Kendra Intelligent Ranking for OpenSearch**。该插件获取 OpenSearch 的搜索结果，并应用 Amazon Kendra 的语义相关性排名，该排名是利用向量嵌入和其他语义搜索技术计算得出的。对许多应用而言，这能提供更好的结果排名。

要试用 Amazon Kendra Intelligent Ranking，必须先设置 Amazon Kendra 服务。要开始使用，请参阅 [Amazon Kendra](https://aws.amazon.com/kendra/)。有关详细信息（包括插件设置说明），请参阅 [Amazon Kendra Intelligent Ranking for self-managed OpenSearch](https://docs.aws.amazon.com/kendra/latest/dg/opensearch-rerank.html)。

### 在 OpenSearch Dashboards 中将搜索结果与重排序后的结果进行比较

要在 OpenSearch Dashboards 中将搜索结果与重排序后的结果进行比较，请在 **Query 1** 中输入查询，并在 **Query 2** 中输入使用重排序器的同一查询。然后比较 OpenSearch 结果与重排序后的结果。

以下示例演示了在 `abo` 索引中搜索文本“snacking nuts”。索引中的文档在 `bullet_point` 数组中包含零食描述。 

<img src="/images/kendra_query.png" alt="OpenSearch Intelligent Ranking query"/>

1. 在搜索栏中输入 `snacking nuts`。
1. 在 **Query 1** 中输入以下查询，该查询在 `bullet_point` 字段中搜索文本“snacking nuts”：

    ```json
    {
      "query": {
        "match": {
          "bullet_point": "%SearchText%"
        }
      },
      "size": 25
    }
    ```
1. 在 **Query 2** 中输入使用重排序器的同一查询。本例使用 Amazon Kendra Intelligent Ranking：

    ```json
    {
      "query" : {
        "match" : {
          "bullet_point": "%SearchText%"
        }
      },
      "size": 25,
      "ext": {
        "search_configuration":{
          "result_transformer" : {
            "kendra_intelligent_ranking": {
              "order": 1,
              "properties": {
                "title_field": "item_name",
                "body_field": "bullet_point"
              }
            }
          }
        }
      }
    }
    ```

    在上述查询中，`body_field` 指索引中文档的正文字段，Amazon Kendra Intelligent Ranking 使用该字段对结果进行排名。`body_field` 是必需的，而 `title_field` 是可选的。
1. 选择 **Search**，然后比较 **Result 1** 和 **Result 2** 中的结果。

### 使用 Amazon Personalize Search Ranking 对搜索结果进行个性化

重排序器的另一个例子是由 Amazon Personalize 团队贡献的 **Amazon Personalize Search Ranking**。Amazon Personalize 使用机器学习（ML）技术为用户生成定制化的推荐。该插件获取 OpenSearch 的搜索结果，并应用[搜索管道](/search-plugins/search-pipelines/)，按照 Amazon Personalize 的排名对结果进行重排序。Amazon Personalize 的排名基于用户过去的行为，以及有关搜索条目和用户的元数据。这一工作流通过对搜索结果进行个性化，改善了用户的搜索体验。

要试用 Amazon Personalize Search Ranking，必须先设置 Amazon Personalize。要开始使用，请参阅 [Amazon Personalize](https://docs.aws.amazon.com/personalize/latest/dg/setup.html)。有关详细信息（包括插件设置说明），请参阅[对来自 OpenSearch 的搜索结果进行个性化](https://docs.aws.amazon.com/personalize/latest/dg/personalize-opensearch.html)。
