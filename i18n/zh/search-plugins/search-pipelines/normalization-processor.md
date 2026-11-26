---
title: Normalization
---

# Normalization 处理器

`normalization-processor` 是一个搜索阶段结果处理器（search phase results processor），在搜索执行的查询阶段和获取阶段之间运行。它会拦截查询阶段的结果，对来自不同查询子句的文档评分进行归一化（normalization）和组合（combination），然后再将文档传递给获取阶段。

## 评分归一化与组合

许多应用既需要关键词匹配，也需要语义理解。例如，对于包含关键词的查询，BM25 能准确地提供相关的搜索结果；而当查询需要理解自然语言时，神经网络的表现更好。因此，你可能希望将 BM25 的搜索结果与 k-NN 搜索或神经搜索（Neural Search）的结果组合起来。然而，BM25 和 k-NN 搜索在计算匹配文档的相关性评分（Relevance Score）时使用的尺度不同。实验数据表明，在组合多个查询的评分之前，先对它们进行归一化，使其处于同一尺度上，会带来好处。有关评分归一化与组合的延伸阅读（包括基准测试和各种方法），请参阅[这篇语义搜索博客文章](https://opensearch.org/blog/semantic-science-benchmarks/)。

## 先查询后获取

OpenSearch 支持两种搜索类型：`query_then_fetch` 和 `dfs_query_then_fetch`。下图概述了包含归一化处理器的“先查询后获取”（query-then-fetch）流程。

![归一化处理器流程图](/images/normalization-processor.png)

当你向某个节点发送搜索请求时，该节点就成为*协调节点*（coordinating node）。在搜索的第一个阶段，即*查询阶段*（query phase），协调节点将搜索请求路由到索引中的所有分片（Shard），包括主分片和副本分片。随后，每个分片在本地运行搜索查询，并返回匹配文档的元数据，其中包括文档 ID 和相关性评分。接着，`normalization-processor` 对来自不同查询子句的评分进行归一化和组合。协调节点合并各分片的本地结果列表并排序，汇总出与查询匹配的全局排名靠前文档列表。之后，搜索执行进入*获取阶段*（fetch phase），协调节点向全局列表中各文档所在的分片请求这些文档。每个分片将文档的 `_source` 返回给协调节点。最后，协调节点将包含结果的搜索响应发送给你。

## 请求字段

下表列出了所有可用的请求字段。

字段 | 数据类型 | 描述
:--- | :--- | :---
`normalization.technique` | String | 评分归一化方法。有效值为 [`min_max`](https://en.wikipedia.org/wiki/Feature_scaling#Rescaling_(min-max_normalization)) 和 [`l2`](https://en.wikipedia.org/wiki/Cosine_similarity#L2-normalized_Euclidean_distance)。可选。默认值为 `min_max`。
`combination.technique` | String | 评分组合方法。有效值为 [`arithmetic_mean`](https://en.wikipedia.org/wiki/Arithmetic_mean)、[`geometric_mean`](https://en.wikipedia.org/wiki/Geometric_mean) 和 [`harmonic_mean`](https://en.wikipedia.org/wiki/Harmonic_mean)。可选。默认值为 `arithmetic_mean`。
`combination.parameters.weights` | Array of floating-point values | 指定每个查询使用的权重。有效值在 [0.0, 1.0] 范围内，表示小数形式的百分比。权重越接近 1.0，查询所占的权重越大。`weights` 数组中值的数量必须等于查询的数量，数组中各值之和必须等于 1.0。可选。如果未提供，则所有查询的权重相同。
`tag` | String | 处理器的标识符。可选。
`description` | String | 处理器的描述。可选。
`ignore_failure` | Boolean | 对于此处理器，该值会被忽略。如果处理器失败，管道总是会失败并返回错误。 

## 示例 

以下示例演示如何使用包含 `normalization-processor` 的搜索管道。 

有关完整示例，请参阅[神经搜索教程](/search-plugins/neural-search-tutorial#tutorial)。

### 创建搜索管道 

以下请求创建一个包含 `normalization-processor` 的搜索管道，该处理器使用 `min_max` 归一化方法和 `arithmetic_mean` 组合方法：

```json
PUT /_search/pipeline/nlp-search-pipeline
{
  "description": "Post processor for hybrid search",
  "phase_results_processors": [
    {
      "normalization-processor": {
        "normalization": {
          "technique": "min_max"
        },
        "combination": {
          "technique": "arithmetic_mean",
          "parameters": {
            "weights": [
              0.3,
              0.7
            ]
          }
        }
      }
    }
  ]
}
```

### 使用搜索管道

在 `hybrid` 查询中提供要组合的查询子句，并应用上一节创建的搜索管道，使评分按所选方法进行组合：

```json
GET /my-nlp-index/_search?search_pipeline=nlp-search-pipeline
{
  "_source": {
    "exclude": [
      "passage_embedding"
    ]
  },
  "query": {
    "hybrid": {
      "queries": [
        {
          "match": {
            "text": {
              "query": "horse"
            }
          }
        },
        {
          "neural": {
            "passage_embedding": {
              "query_text": "wild west",
              "model_id": "aVeif4oB5Vm0Tdw8zYO2",
              "k": 5
            }
          }
        }
      ]
    }
  }
}
```

有关设置混合搜索的更多信息，请参阅[使用混合搜索](/search-plugins/hybrid-search#using-hybrid-search)。

## 搜索调优建议

为了提高搜索相关性，我们建议增大样本量。

如果混合查询没有返回某些预期的结果，可能是因为子查询返回的文档太少。`normalization-processor` 只转换每个子查询返回的结果，不会执行任何额外的采样。在实验中，我们使用 [nDCG@10](https://en.wikipedia.org/wiki/Discounted_cumulative_gain) 来衡量信息检索质量随返回文档数量（size）的变化。我们发现，对于最多包含 1000 万个文档的数据集，size 在 [100, 200] 范围内效果最佳。我们不建议将 size 增大到超出推荐值，因为更大的 size 值并不会提高搜索相关性，反而会增加搜索延迟。
