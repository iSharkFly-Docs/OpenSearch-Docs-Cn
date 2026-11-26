---
title: 搜索设置
---

# 搜索设置

OpenSearch 支持以下搜索设置：

- `search.max_buckets`（动态，integer）：单个响应中允许的最大聚合桶数量。默认值为 `65535`。

- `search.phase_took_enabled`（动态，Boolean）：允许在搜索响应中返回阶段级别的 `took` 耗时值。默认值为 `false`。

- `search.allow_expensive_queries`（动态，Boolean）：允许或禁止开销大的查询。有关更多信息，请参阅[开销大的查询](/query-dsl/#expensive-queries)。

- `search.default_allow_partial_results`（动态，Boolean）：一个集群级设置，允许在请求超时或分片失败时返回部分搜索结果。如果搜索请求包含 `allow_partial_search_results` 参数，则该参数优先于此设置。默认值为 `true`。

- `search.cancel_after_time_interval`（动态，time unit）：一个集群级设置，指定搜索请求在分片级别被取消之前可以运行的最长时间。达到该时间后，请求将被停止，所有相关任务都会被取消。默认值为 `-1`。

- `search.default_search_timeout`（动态，time unit）：一个集群级设置，在协调节点级别为所有搜索请求设置默认超时时间。如果搜索请求中指定了 `timeout`，则其优先于此设置。默认值为 `-1`（不超时）。

- `search.default_keep_alive`（动态，time unit）：指定 scroll 和时间点（Point in Time，PIT）搜索的默认保活值。由于一个请求可能会多次到达同一个分片（例如在查询阶段和获取阶段），OpenSearch 会打开一个在请求整个持续期间都存在的_请求上下文_，以确保每个分片请求的分片状态一致。在标准搜索中，获取阶段完成后，请求上下文就会关闭。对于 scroll 或 PIT 搜索，OpenSearch 会保持请求上下文处于打开状态，直到显式关闭（或达到保活时间）。一个后台线程会定期检查所有打开的 scroll 和 PIT 上下文，并删除超过保活超时时间的上下文。`search.keep_alive_interval` 设置指定检查上下文是否过期的频率。`search.default_keep_alive` 设置是默认的过期期限。scroll 或 PIT 请求可以显式指定保活时间，其优先于此设置。默认值为 `5m`。

- `search.keep_alive_interval`（静态，time unit）：决定 OpenSearch 检查超过保活限制的请求上下文的时间间隔。默认值为 `1m`。

- `search.max_keep_alive`（动态，time unit）：指定最大保活值。`max_keep_alive` 设置用作对其他 `keep_alive` 设置（例如 `default_keep_alive`）以及请求级保活设置（针对 scroll 和 PIT 上下文）的安全检查。无论哪种情况，如果请求超过 `max_keep_alive` 值，操作都将失败。默认值为 `24h`。

- `search.low_level_cancellation`（动态，Boolean）：启用低级别请求取消。Lucene 的经典超时机制只在收集搜索结果时检查时间。然而，开销大的查询（例如 wildcard 或 prefix 查询）在开始收集结果之前可能需要很长时间进行扩展。在这种情况下，查询的运行时间可能超过超时值。低级别取消机制解决了这一问题：它不仅在收集搜索结果时会超时，在查询扩展阶段或执行任何 Lucene 操作之前也会超时。默认值为 `true`。

- `search.max_open_scroll_context`（动态，integer）：一个节点级设置，指定节点打开的 scroll 上下文的最大数量。默认值为 `500`。

- `search.request_stats_enabled`（动态，Boolean）：从协调节点的角度开启节点级阶段耗时统计信息的收集。请求级统计信息会记录搜索请求在各个搜索阶段中（总共）花费的时间。你可以使用 [Nodes Stats API](/api-reference/nodes-apis/nodes-stats) 获取这些计数器。默认值为 `false`。

- `search.highlight.term_vector_multi_value`（静态，Boolean）：指定跨多值字段的各个值高亮片段。默认值为 `true`。

## 时间点设置

有关 PIT 设置的信息，请参阅 [PIT 设置](/search-plugins/searching-data/point-in-time-api#pit-settings)。

要了解有关静态设置和动态设置的更多信息，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。
