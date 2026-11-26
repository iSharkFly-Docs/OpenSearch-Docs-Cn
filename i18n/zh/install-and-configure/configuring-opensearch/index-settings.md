---
title: 索引设置
---

# 索引设置

索引设置分为两种类型：影响集群中所有索引的[集群级设置](#cluster-level-index-settings)，以及影响单个索引的[索引级设置](#index-level-index-settings)。

要了解有关静态设置和动态设置的更多信息，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。

## 集群级索引设置

OpenSearch 支持以下集群级索引设置。此列表中的所有设置都是动态的：

- `action.auto_create_index`（Boolean）：如果索引尚不存在，则自动创建该索引，同时应用已配置的所有索引模板（Index Template）。默认值为 `true`。

- `action.destructive_requires_name`（Boolean）：设置为 `true` 时，删除索引时必须指定索引名称，不能删除所有索引或使用通配符。默认值为 `true`。

- `cluster.default.index.refresh_interval`（Time unit）：设置未提供 `index.refresh_interval` 设置时的刷新间隔。当你希望为集群中的所有索引设置默认刷新间隔并支持 `searchIdle` 设置时，此设置非常有用。该间隔不能低于 `cluster.minimum.index.refresh_interval` 设置的值。

- `cluster.minimum.index.refresh_interval`（Time unit）：设置最小刷新间隔，并将其应用于集群中的所有索引。`cluster.default.index.refresh_interval` 设置应高于此设置的值。如果在创建索引时 `index.refresh_interval` 设置低于所设定的最小值，则索引创建失败。

- `cluster.indices.close.enable`（Boolean）：允许在 OpenSearch 中关闭已打开的索引。默认值为 `true`。

- `indices.recovery.max_bytes_per_sec`（String）：限制每个节点的入站和出站恢复流量总量。此设置适用于对等恢复和快照恢复。默认值为 `40mb`。如果将恢复流量值设置为小于或等于 `0mb`，则会禁用速率限制，恢复数据将以尽可能高的速率传输。

- `indices.recovery.max_concurrent_file_chunks`（Integer）：每个恢复操作并行发送的文件块数量。默认值为 `2`。

- `indices.recovery.max_concurrent_operations`（Integer）：每次恢复并行发送的操作数量。默认值为 `1`。

- `indices.recovery.max_concurrent_remote_store_streams`（Integer）：恢复远程存储索引时，可以并行打开的到远程存储库的流数量。默认值为 `20`。

- `indices.time_series_index.default_index_merge_policy`（String）：此设置用于为时间序列索引（尤其是包含 `@timestamp` 字段的索引，例如数据流）指定默认合并策略。两个可用选项为 `tiered`（默认）和 `log_byte_size`。建议对时间序列索引使用 `log_byte_size`，以提升针对 `@timestamp` 字段的范围查询性能。要按索引覆盖合并策略，可以使用 `index.merge.policy` 索引设置。

- `indices.fielddata.cache.size`（String）：字段数据缓存的最大大小。可以指定为绝对值（例如 `8GB`）或节点堆的百分比（例如 `50%`）。该值是静态的，因此必须在 `opensearch.yml` 文件中指定。如果不指定此设置，则最大大小不受限制。该值应小于 `indices.breaker.fielddata.limit`。有关更多信息，请参阅[字段数据断路器](/install-and-configure/configuring-opensearch/circuit-breaker#field-data-circuit-breaker-settings)。

## 索引级索引设置

你可以在创建索引时指定索引设置。索引设置有两种类型：

- [静态索引级索引设置](#static-index-level-index-settings)是在索引处于打开状态时无法更新的设置。要更新静态设置，必须先关闭索引，更新设置，然后重新打开索引。
- [动态索引级索引设置](#dynamic-index-level-index-settings)是可以随时更新的设置。

### 在创建索引时指定设置

创建索引时，可以按如下方式指定其静态或动态设置：

```json
PUT /testindex
{
  "settings": {
    "index.number_of_shards": 1,
    "index.number_of_replicas": 2
  }
}
```

### 静态索引级索引设置

OpenSearch 支持以下静态索引级索引设置：

- `index.number_of_shards`（Integer）：索引中主分片的数量。默认值为 1。

- `index.number_of_routing_shards`（Integer）：用于拆分索引的路由分片数量。

- `index.shard.check_on_startup`（Boolean）：是否检查索引的分片是否损坏。可用选项为 `false`（不检查损坏）、`checksum`（检查物理损坏）和 `true`（同时检查物理和逻辑损坏）。默认值为 `false`。

- `index.codec`（String）：决定索引的存储字段如何压缩并存储在磁盘上。此设置会影响索引分片的大小和索引操作的性能。
    
    有效值为：
        
    - `default`
    - `best_compression`
    - `zstd`（OpenSearch 2.9 及更高版本）
    - `zstd_no_dict`（OpenSearch 2.9 及更高版本）
        
    对于 `zstd` 和 `zstd_no_dict`，可以在 `index.codec.compression_level` 设置中指定压缩级别。有关更多信息，请参阅[索引编解码器设置](/im-plugin/index-codecs)。可选。默认值为 `default`。

- `index.codec.compression_level`（Integer）：压缩级别设置在压缩率和速度之间进行权衡。较高的压缩级别会带来更高的压缩率（更小的存储空间），但代价是速度下降（压缩和解压缩速度变慢，导致索引和搜索延迟增加）。在 OpenSearch 2.9 及更高版本中，仅当 `index.codec` 设置为 `zstd` 和 `zstd_no_dict` 压缩级别时才能指定。有效值为 [1, 6] 范围内的整数。有关更多信息，请参阅[索引编解码器设置](/im-plugin/index-codecs)。可选。默认值为 3。

- `index.routing_partition_size`（Integer）：自定义路由值可以路由到的分片数量。路由通过将值重新分配到一组分片而不是单个分片，来帮助解决集群不平衡的问题。要启用路由，请将此值设置为大于 1 但小于 `index.number_of_shards`。默认值为 1。

- `index.soft_deletes.retention_lease.period`（Time unit）：保留分片操作历史的最长时间。默认值为 `12h`。

- `index.load_fixed_bitset_filters_eagerly`（Boolean）：OpenSearch 是否应预加载缓存的过滤器。可用选项为 `true` 和 `false`。默认值为 `true`。

- `index.hidden`（Boolean）：是否应隐藏该索引。隐藏索引不会在包含通配符的查询中返回。可用选项为 `true` 和 `false`。默认值为 `false`。

- `index.merge.policy`（String）：此设置控制 Lucene 段的合并策略。可用选项为 `tiered` 和 `log_byte_size`。默认值为 `tiered`，但对于时间序列数据（例如日志事件），我们建议使用 `log_byte_size` 合并策略，它可以提升对 `@timestamp` 字段执行范围查询时的查询性能。我们建议不要更改现有索引的合并策略，而是在创建新索引时配置此设置。

- `index.merge_on_flush.enabled`（Boolean）：此设置控制 Apache Lucene 的 merge-on-refresh 功能，该功能旨在通过 _on refresh_（用 OpenSearch 的术语来说是 _on flush_）执行合并来减少段的数量。默认值为 `true`。

- `index.merge_on_flush.max_full_flush_merge_wait_time`（Time unit）：此设置用于设定启用 `index.merge_on_flush.enabled` 时等待合并的时间。默认值为 `10s`。

- `index.merge_on_flush.policy`（default | merge-on-flush）：此设置控制启用 `index.merge_on_flush.enabled` 时应使用的合并策略。默认值为 `default`。

### 更新静态索引设置

只能在已关闭的索引上更新静态索引设置。以下示例演示如何更新索引编解码器设置。

首先，关闭索引：

```json
POST /testindex/_close
```

然后通过向 `_settings` 端点发送请求来更新设置：

```json
PUT /testindex/_settings
{
  "index": {
    "codec": "zstd_no_dict",
    "codec.compression_level": 3
  }
}
```

最后，重新打开索引以启用读写操作：

```json
POST /testindex/_open
```

有关更新设置的更多信息（包括支持的查询参数），请参阅[更新设置](/api-reference/index-apis/update-settings)。

### 动态索引级索引设置

OpenSearch 支持以下动态索引级索引设置：

- `index.number_of_replicas`（Integer）：每个主分片应具有的副本分片数量。例如，如果有 4 个主分片，并将 `index.number_of_replicas` 设置为 3，则索引有 12 个副本分片。默认值为 1。

- `index.auto_expand_replicas`（String）：集群是否应根据数据节点的数量自动添加副本分片。指定下限和上限（例如 0--9），或将上限指定为 `all`。例如，如果有 5 个数据节点，并将 `index.auto_expand_replicas` 设置为 0--3，则集群不会自动添加额外的副本分片。但是，如果将此值设置为 `0-all`，并再添加 2 个节点使总数达到 7 个，集群将扩展为拥有 6 个副本分片。默认为禁用。

- `index.search.idle.after`（Time unit）：分片在没有收到搜索或 get 请求后进入空闲状态之前应等待的时间。默认值为 `30s`。

- `index.refresh_interval`（Time unit）：索引刷新的频率，刷新会发布最近的更改并使其可被搜索。可以设置为 `-1` 以禁用刷新。默认值为 `1s`。

- `index.max_result_window`（Integer）：搜索该索引时 `from` + `size` 的最大值。`from` 是开始搜索的起始位置，`size` 是要返回的结果数量。默认值为 10000。

- `index.max_inner_result_window`（Integer）：`from` + `size` 的最大值，用于指定查询期间返回的嵌套搜索命中和聚合的最相关文档的数量。`from` 是开始搜索的起始位置，`size` 是要返回的最佳命中数量。默认值为 100。

- `index.max_rescore_window`（Integer）：对该索引发出的重新评分请求中 `window_size` 的最大值。重新评分请求会对索引的文档重新排序并返回新的评分，该评分可能更加精确。默认值与 `index.max_inner_result_window` 相同，或默认为 10000。

- `index.max_docvalue_fields_search`（Integer）：查询中允许的 `docvalue_fields` 的最大数量。默认值为 100。

- `index.max_script_fields`（Integer）：查询中允许的 `script_fields` 的最大数量。默认值为 32。

- `index.max_ngram_diff`（Integer）：`NGramTokenizer` 和 `NGramTokenFilter` 的 `min_gram` 与 `max_gram` 值之间的最大差值。默认值为 1。

- `index.max_shingle_diff`（Integer）：传给 `shingle` 词元过滤器（Token Filter）的 `max_shingle_size` 与 `min_shingle_size` 之间的最大差值。默认值为 3。

- `index.max_refresh_listeners`（Integer）：每个分片允许拥有的刷新监听器的最大数量。

- `index.analyze.max_token_count`（Integer）：`_analyze` API 操作可以返回的最大词元数量。默认值为 10000。

- `index.highlight.max_analyzed_offset`（Integer）：高亮请求可以分析的字符数。默认值为 1000000。

- `index.max_terms_count`（Integer）：terms 查询可以接受的最大词项数量。默认值为 65536。

- `index.max_regex_length`（Integer）：regexp 查询中正则表达式的最大字符长度。默认值为 1000。

- `index.query.default_field`（List）：当参数中未指定字段时，OpenSearch 在查询中使用的一个字段或字段列表。

- `index.routing.allocation.enable`（String）：指定索引分片分配的选项。可用选项为 `all`（允许为所有分片分配）、`primaries`（仅允许为主分片分配）、`new_primaries`（仅允许为新的主分片分配）和 `none`（不允许分配）。默认值为 `all`。

- `index.routing.rebalance.enable`（String）：为索引启用分片重新平衡。可用选项为 `all`（允许对所有分片重新平衡）、`primaries`（仅允许对主分片重新平衡）、`replicas`（仅允许对副本重新平衡）和 `none`（不允许重新平衡）。默认值为 `all`。

- `index.gc_deletes`（Time unit）：保留已删除文档版本号的时间。默认值为 `60s`。

- `index.default_pipeline`（String）：索引的默认摄取节点管道。如果设置了默认管道但该管道不存在，则索引请求将失败。管道名称 `_none` 表示该索引没有摄取管道（Ingest Pipeline）。

- `index.final_pipeline`（String）：索引的最终摄取节点管道。如果设置了最终管道但该管道不存在，则索引请求将失败。管道名称 `_none` 表示该索引没有摄取管道。

- `index.optimize_doc_id_lookup.fuzzy_set.enabled`（Boolean）：此设置控制是否启用 `fuzzy_set`，以便通过使用额外的数据结构（在本例中为 Bloom 过滤器数据结构）来优化索引或搜索调用中的文档 ID 查找。启用此设置会创建一个新的数据结构（Bloom 过滤器），从而提升依赖文档 ID 的 upsert 和搜索操作的性能。Bloom 过滤器可以通过更快的堆外查找来处理否定情况（即 ID 不存在于现有索引中）。默认值为 `false`。仅当功能标志 `opensearch.experimental.optimize_doc_id_lookup.fuzzy_set.enabled` 设置为 `true` 时，才能使用此设置。

- `index.optimize_doc_id_lookup.fuzzy_set.false_positive_probability`（Double）：设置底层 `fuzzy_set`（即 Bloom 过滤器）的误报概率。较低的误报概率可以确保 `UPSERT` 和 `GET` 操作获得更高的吞吐量。允许的值范围为 `0.01` 到 `0.50`。默认值为 `0.20`。仅当功能标志 `opensearch.experimental.optimize_doc_id_lookup.fuzzy_set.enabled` 设置为 `true` 时，才能使用此设置。

### 更新动态索引设置

你可以随时通过 API 更新动态索引设置。例如，要更新刷新间隔，请使用以下请求：

```json
PUT /testindex/_settings
{
  "index": {
    "refresh_interval": "2s"
  }
}
```

有关更新设置的更多信息（包括支持的查询参数），请参阅[更新设置](/api-reference/index-apis/update-settings)。
