---
title: 搜索处理器
---

# 搜索处理器

搜索处理器（search processor）分为以下几种类型：

- [搜索请求处理器](#search-request-processors)
- [搜索响应处理器](#search-response-processors)
- [搜索阶段结果处理器](#search-phase-results-processors)

## 搜索请求处理器

搜索请求处理器（search request processor）会拦截搜索请求（请求中传递的查询和元数据），使用或针对该搜索请求执行操作，然后将搜索请求提交给索引。

下表列出了所有受支持的搜索请求处理器。

处理器 | 描述 | 最早可用版本
:--- | :--- | :---
[`filter_query`](/search-plugins/search-pipelines/filter-query-processor) | 添加一个用于过滤请求的过滤查询。 | 2.8
[`neural_query_enricher`](/search-plugins/search-pipelines/neural-query-enricher) | 在索引级别或字段级别为神经搜索设置默认模型。 | 2.11
[`script`](/search-plugins/search-pipelines/script-processor) | 添加一个对新索引的文档运行的脚本。 | 2.8
[`oversample`](/search-plugins/search-pipelines/oversample-processor) | 增大搜索请求的 `size` 参数，并将原始值存储在管道状态中。  | 2.12

## 搜索响应处理器

搜索响应处理器（search response processor）会拦截搜索响应和搜索请求（请求中传递的查询、结果和元数据），使用或针对该搜索响应执行操作，然后返回搜索响应。

下表列出了所有受支持的搜索响应处理器。

处理器 | 描述 | 最早可用版本
:--- | :--- | :---
[`personalize_search_ranking`](/search-plugins/search-pipelines/personalize-search-ranking) | 使用 [Amazon Personalize](https://aws.amazon.com/personalize/) 对搜索结果进行重排序（需要设置 Amazon Personalize 服务）。 | 2.9
[`retrieval_augmented_generation`](/search-plugins/search-pipelines/rag-processor) | 用于[对话式搜索](/search-plugins/conversational-search)中的检索增强生成（RAG）。 | 2.10（在 2.12 中正式发布）
[`rename_field`](/search-plugins/search-pipelines/rename-field-processor)| 重命名现有字段。 | 2.8
[`rerank`](/search-plugins/search-pipelines/rerank-processor)| 使用交叉编码器模型对搜索结果进行重排序。 | 2.12
[`collapse`](/search-plugins/search-pipelines/collapse-processor)| 根据字段值对搜索命中进行去重，与搜索请求中的 `collapse` 类似。 | 2.12
[`truncate_hits`](/search-plugins/search-pipelines/truncate-hits-processor)| 在达到指定的目标数量后丢弃其余搜索命中。可以抵消 `oversample` 请求处理器的效果。  | 2.12

## 搜索阶段结果处理器

搜索阶段结果处理器（search phase results processor）在协调节点层面、于各搜索阶段之间运行。它会拦截某一搜索阶段检索到的结果，对其进行转换后再传递给下一个搜索阶段。

下表列出了所有受支持的搜索阶段结果处理器。

处理器 | 描述 | 最早可用版本
:--- | :--- | :---
[`normalization-processor`](/search-plugins/search-pipelines/normalization-processor) | 拦截查询阶段的结果，对文档评分进行归一化和组合，然后再将文档传递给获取阶段。 | 2.10

## 查看可用的处理器类型

可以使用 Nodes Search Pipelines API 查看可用的处理器类型：

```json
GET /_nodes/search_pipelines
```

响应包含 `search_pipelines` 对象，其中列出了可用的请求处理器和响应处理器：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "_nodes" : {
    "total" : 1,
    "successful" : 1,
    "failed" : 0
  },
  "cluster_name" : "runTask",
  "nodes" : {
    "36FHvCwHT6Srbm2ZniEPhA" : {
      "name" : "runTask-0",
      "transport_address" : "127.0.0.1:9300",
      "host" : "127.0.0.1",
      "ip" : "127.0.0.1",
      "version" : "3.0.0",
      "build_type" : "tar",
      "build_hash" : "unknown",
      "roles" : [
        "cluster_manager",
        "data",
        "ingest",
        "remote_cluster_client"
      ],
      "attributes" : {
        "testattr" : "test",
        "shard_indexing_pressure_enabled" : "true"
      },
      "search_pipelines" : {
        "request_processors" : [
          {
            "type" : "filter_query"
          },
          {
            "type" : "script"
          }
        ],
        "response_processors" : [
          {
            "type" : "rename_field"
          }
        ]
      }
    }
  }
}
```
</details>

::: info 注意
除了 OpenSearch 提供的处理器之外，插件也可能提供其他处理器。
:::
