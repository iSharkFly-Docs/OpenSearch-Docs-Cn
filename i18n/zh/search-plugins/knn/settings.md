---
title: 设置
---

# k-NN 设置

k-NN 插件新增了若干集群设置。要详细了解静态设置和动态设置，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。

## 集群设置

设置 | 默认值 | 描述
:--- | :--- | :---
`knn.algo_param.index_thread_qty` | 1 | 用于创建本地库索引的线程数。将此值设置得较低可以降低 k-NN 插件对 CPU 的影响，但也会降低索引性能。
`knn.cache.item.expiry.enabled` | false | 是否将一段时间内未被访问的本地库索引从内存中移除。
`knn.cache.item.expiry.minutes` | 3h | 启用后，本地库索引在被从内存中移除之前的空闲时间。
`knn.circuit_breaker.unset.percentage` | 75% | 熔断器（circuit breaker）的本地内存使用阈值。内存使用量必须低于 `knn.memory.circuit_breaker.limit` 的这一百分比，`knn.circuit_breaker.triggered` 才会保持为 false。
`knn.circuit_breaker.triggered` | false | 当内存使用量超过 `knn.circuit_breaker.unset.percentage` 的值时为 True。
`knn.memory.circuit_breaker.limit` | 50% | 本地库索引的本地内存上限。在默认值下，如果一台机器有 100 GB 内存且 JVM 使用了 32 GB，则 k-NN 插件会使用剩余 68 GB 的 50%（34 GB）。如果内存使用量超过此值，k-NN 会移除最近最少使用的本地库索引。
`knn.memory.circuit_breaker.enabled` | true | 是否启用 k-NN 内存熔断器。
`knn.plugin.enabled`| true | 启用或禁用 k-NN 插件。
`knn.model.index.number_of_shards`| 1 | 模型系统索引所使用的分片数。模型系统索引是用于存储近似最近邻（Approximate Nearest Neighbor，ANN）搜索所用模型的 OpenSearch 索引。
`knn.model.index.number_of_replicas`| 1 | 模型系统索引所使用的副本分片数。通常，在多节点集群中，此值应至少为 1，以提高稳定性。
`knn.advanced.filtered_exact_search_threshold`| null | 在带过滤的 ANN 搜索中，用于切换到精确搜索的已过滤 ID 数量阈值。如果某个段中已过滤的 ID 数量小于此设置的值，则会对这些已过滤的 ID 执行精确搜索。
