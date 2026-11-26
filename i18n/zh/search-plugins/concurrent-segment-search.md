---
title: 并发段搜索
---

# 并发段搜索

使用并发段搜索（concurrent segment search）可以在查询阶段并行搜索各个段（segment）。在以下情况下，并发段搜索可以降低搜索延迟：

- 发送长时间运行的请求时，例如包含聚合或大范围查询的请求
- 作为将段强制合并为单个段以提升性能的替代方案

## 背景

在 OpenSearch 中，每个搜索请求都遵循分散-汇聚（scatter-gather）协议。协调节点接收搜索请求，判断需要哪些分片（shard）来处理该请求，并向每个分片发送分片级搜索请求。每个收到请求的分片使用 Lucene 在本地执行该请求并返回结果。协调节点合并从所有分片收到的响应，并将搜索响应发送回客户端。如果客户端在响应中请求了某些文档字段或整个文档，协调节点还可以在将最终结果返回客户端之前执行获取（fetch）阶段，这一步是可选的。

## 并发搜索段

如果不使用并发段搜索，Lucene 会在查询阶段按顺序在每个分片的所有段上执行请求，然后由查询阶段收集该搜索请求的排名靠前的命中（hit）。使用并发段搜索时，每个分片级请求会在查询阶段并行搜索各个段。对于每个分片，段会被划分为多个*切片*（slice）。每个切片都是可以在单独线程上并行执行的工作单元，因此切片数量决定了分片级请求的最大并行度。所有切片完成工作后，Lucene 会对这些切片执行归约（reduce）操作，将它们合并并生成该分片级请求的最终结果。切片使用新的 `index_searcher` 线程池执行，该线程池不同于处理分片级请求的 `search` 线程池。

## 在索引或集群级别启用并发段搜索

默认情况下，集群上的并发段搜索处于禁用状态。你可以在两个级别启用并发段搜索：

- 集群级别
- 索引级别

::: info 注意
索引级设置的优先级高于集群级设置。因此，如果启用了集群设置但禁用了索引设置，则该索引的并发段搜索将被禁用。
:::

要为集群中的所有索引启用并发段搜索，请设置以下动态集群设置：

```json
PUT _cluster/settings
{
   "persistent":{
      "search.concurrent_segment_search.enabled": true
   }
}
```

要为特定索引启用并发段搜索，请在端点中指定索引名称：

```json
PUT <index-name>/_settings
{
    "index.search.concurrent_segment_search.enabled": true
}
```

## 切片机制

你可以从两种可用机制中选择一种，用于将段分配给切片：默认的 [Lucene 机制](#the-lucene-mechanism)或[最大切片数机制](#the-max-slice-count-mechanism)。

### Lucene 机制

默认情况下，Lucene 为分片中的每个切片最多分配 25 万个文档或 5 个段（以先达到者为准）。例如，假设某个分片有 11 个段，前 5 个段各有 25 万个文档，后 6 个段各有 2 万个文档。前 5 个段将各自分配到 1 个切片，因为每个段都已包含单个切片允许的最大文档数。接下来的 5 个段将全部分配到另一个切片，因为达到了单个切片允许的最大段数。第 11 个切片将被分配到一个单独的切片中。

### 最大切片数机制

*最大切片数*（max slice count）机制是另一种切片机制，它使用静态配置的最大切片数，并以轮询（round-robin）方式在各切片之间分配段。当顶层分片请求已经过多，而你希望限制每个请求的切片数以减少切片之间的竞争时，这种机制非常有用。

### 设置切片机制

默认情况下，并发段搜索使用 Lucene 机制计算每个分片级请求的切片数。如果要改用最大切片数机制，请在 `opensearch.yml` 配置文件中配置 `search.concurrent.max_slice_count` 静态设置：

```yaml
search.concurrent.max_slice_count: 2
```

`search.concurrent.max_slice_count` 设置可以取以下有效值：
- `0`：使用默认的 Lucene 机制。
- 正整数：使用最大目标切片数机制。通常，2 到 8 之间的值就足够了。

## 限制

以下聚合不支持并发搜索模型。如果搜索请求包含其中任一聚合，即使在集群级别或索引级别启用了并发段搜索，该请求也会通过非并发路径执行。
- [join](/field-types/supported-field-types/join) 字段上的父聚合。有关更多信息，请参阅[此 GitHub issue](https://github.com/opensearch-project/OpenSearch/issues/9316)。
- `sampler` 和 `diversified_sampler` 聚合。有关更多信息，请参阅[此 GitHub issue](https://github.com/opensearch-project/OpenSearch/issues/11075)。
- 组合（composite）聚合。有关更多信息，请参阅[此 GitHub issue](https://github.com/opensearch-project/OpenSearch/issues/12331)。

## 其他注意事项

以下各节介绍并发段搜索的其他注意事项。

### `terminate_after` 搜索参数 {#the-terminateafter-search-parameter}

[`terminate_after` 搜索参数](/api-reference/search#url-parameters)用于在收集到指定数量的文档后终止搜索请求。如果在请求中包含 `terminate_after` 参数，并发段搜索将被禁用，请求将以非并发方式运行。

通常，查询会使用较小的 `terminate_after` 值，由于搜索是在缩小后的数据集上执行的，因此会很快完成。所以在这种情况下，并发搜索可能无法进一步提升性能。此外，当 `terminate_after` 与其他搜索请求参数（例如 `track_total_hits` 或 `size`）一起使用时，会增加复杂性并改变预期的查询行为。对包含 `terminate_after` 的搜索请求回退到非并发路径，可以确保并发请求与非并发请求的结果一致。

### 排序

根据段的数据布局，排序优化功能可以基于最小值和最大值以及之前收集的值裁剪掉整个段。如果排名靠前的值出现在前几个段中，而其他所有段都被裁剪掉，那么在使用并发段搜索进行排序时，查询延迟可能会增加。相反，如果排名靠前的值位于最后几个段中，那么使用并发段搜索可能会降低延迟。

### Terms 聚合

非并发搜索会计算文档计数误差，并在 `doc_count_error_upper_bound` 响应参数中返回该值。在并发段搜索期间，`shard_size` 参数在段切片级别生效。因此，并发搜索可能会引入额外的文档计数误差。

有关 `shard_size` 如何影响 `doc_count_error_upper_bound` 和所收集的桶的更多信息，请参阅[此 GitHub issue](https://github.com/opensearch-project/OpenSearch/issues/11680#issuecomment-1885882985)。

## 开发者信息：AggregatorFactory 的变更

由于实现细节的原因，并非所有聚合器类型都支持并发段搜索。为此，我们在 `AggregatorFactory` 类中引入了 [`supportsConcurrentSegmentSearch()`](https://github.com/opensearch-project/OpenSearch/blob/bb38ed4836496ac70258c2472668325a012ea3ed/server/src/main/java/org/opensearch/search/aggregations/AggregatorFactory.java#L121) 方法，用于指示给定的聚合类型是否支持并发段搜索。默认情况下，该方法返回 `false`。任何需要支持并发段搜索的聚合器都必须在其自己的工厂实现中重写该方法。

为确保基于插件的自定义 `Aggregator` 实现能够在并发搜索路径中正常工作，插件开发者可以在启用并发搜索的情况下验证其实现，然后更新插件，重写 [`supportsConcurrentSegmentSearch()`](https://github.com/opensearch-project/OpenSearch/blob/bb38ed4836496ac70258c2472668325a012ea3ed/server/src/main/java/org/opensearch/search/aggregations/AggregatorFactory.java#L121) 方法使其返回 `true`。
