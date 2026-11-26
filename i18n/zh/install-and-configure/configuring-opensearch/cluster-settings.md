---
title: 集群设置
---

# 集群设置

以下设置与 OpenSearch 集群相关。

要了解有关静态设置和动态设置的更多信息，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。

## 集群级路由和分配设置

OpenSearch 支持以下集群级路由和分片分配设置。此列表中的所有设置都是动态的：

- `cluster.routing.allocation.enable`（String）：为特定类型的分片启用或禁用分配。
    
    有效值为：
     - `all` – 允许为所有类型的分片分配。
     - `primaries` – 仅允许为主分片分配。
     - `new_primaries` – 仅允许为新索引的主分片分配。
     - `none` – 不允许为任何索引分配分片。
     
     默认值为 `all`。

- `cluster.routing.allocation.node_concurrent_incoming_recoveries`（Integer）：配置一个节点上允许同时进行多少个传入分片恢复。默认值为 `2`。

- `cluster.routing.allocation.node_concurrent_outgoing_recoveries`（Integer）：配置一个节点上允许同时进行多少个传出分片恢复。默认值为 `2`。

- `cluster.routing.allocation.node_concurrent_recoveries`（String）：用于将 `cluster.routing.allocation.node_concurrent_incoming_recoveries` 和 `cluster.routing.allocation.node_concurrent_outgoing_recoveries` 设置为相同的值。

- `cluster.routing.allocation.node_initial_primaries_recoveries`（Integer）：设置节点重启后未分配主分片的恢复数量。默认值为 `4`。

- `cluster.routing.allocation.same_shard.host`（Boolean）：设置为 `true` 时，会阻止将同一分片的多个副本分配到同一主机上的不同节点。默认值为 `false`。

- `cluster.routing.rebalance.enable`（String）：为特定类型的分片启用或禁用重新平衡。
    
    有效值为：
     - `all` – 允许对所有类型的分片进行平衡。
     - `primaries` – 仅允许对主分片进行平衡。
     - `replicas` – 仅允许对副本分片进行平衡。
     - `none` – 不允许对任何索引进行分片平衡。

     默认值为 `all`。

-  `cluster.routing.allocation.allow_rebalance`（String）：指定何时允许分片重新平衡。
    
    有效值为：
    -  `always` – 始终允许重新平衡。
    - `indices_primaries_active` – 仅当集群中的所有主分片都已分配时才允许重新平衡。
    - `indices_all_active` – 仅当集群中的所有分片都已分配时才允许重新平衡。

    默认值为 `indices_all_active`。

- `cluster.routing.allocation.cluster_concurrent_rebalance`（Integer）：用于控制整个集群中允许同时进行多少个分片重新平衡。默认值为 `2`。

- `cluster.routing.allocation.balance.shard`（Floating point）：定义每个节点上分配的分片总数的权重因子。默认值为 `0.45`。

- `cluster.routing.allocation.balance.index`（Floating point）：定义节点上分配的每个索引的分片数量的权重因子。默认值为 `0.55`。

- `cluster.routing.allocation.balance.threshold`（Floating point）：应执行的操作的最小优化值。默认值为 `1.0`。

- `cluster.routing.allocation.balance.prefer_primary`（Boolean）：设置为 `true` 时，OpenSearch 会尝试在集群节点之间均匀分配主分片。启用此设置并不总能保证每个节点上的主分片数量相等，尤其是在发生故障转移的情况下。将此设置从 `true` 改为 `false` 不会触发主分片的重新分配。默认值为 `false`。

- `cluster.routing.allocation.disk.threshold_enabled`（Boolean）：设置为 `false` 时，禁用磁盘分配决策器。禁用后还会移除所有现有的 `index.blocks.read_only_allow_delete index blocks`。默认值为 `true`。

- `cluster.routing.allocation.disk.watermark.low`（String）：控制磁盘使用率的低水位线。设置为百分比时，OpenSearch 不会将分片分配给磁盘使用率达到该百分比的节点。也可以输入比率值，例如 `0.85`。此外，还可以设置为字节值，例如 `400mb`。此设置不影响新创建索引的主分片，但会阻止分配其副本。默认值为 `85%`。

- `cluster.routing.allocation.disk.watermark.high`（String）：控制高水位线。OpenSearch 会尝试将分片从磁盘使用率高于所定义百分比的节点上迁移出去。也可以输入比率值，例如 `0.85`。此外，还可以设置为字节值，例如 `400mb`。此设置影响所有分片的分配。默认值为 `90%`。

- `cluster.routing.allocation.disk.watermark.flood_stage`（String）：控制洪水阶段水位线。这是防止节点耗尽磁盘空间的最后手段。对于在该节点上分配了一个或多个分片、并且至少有一个磁盘超过洪水阶段的每个索引，OpenSearch 都会强制施加只读索引块（`index.blocks.read_only_allow_delete`）。一旦磁盘使用率降到高水位线以下，该索引块就会被解除。也可以输入比率值，例如 `0.85`。此外，还可以设置为字节值，例如 `400mb`。默认值为 `95%`。

- `cluster.info.update.interval`（Time unit）：设置 OpenSearch 检查集群中每个节点磁盘使用情况的频率。默认值为 `30s`。

- `cluster.routing.allocation.include.<attribute>`（Enum）：将分片分配给其 `attribute` 至少包含所列逗号分隔值之一的节点。

- `cluster.routing.allocation.require.<attribute>`（Enum）：仅将分片分配给其 `attribute` 包含所列全部逗号分隔值的节点。

- `cluster.routing.allocation.exclude.<attribute>`（Enum）：不将分片分配给其 `attribute` 包含所列任意逗号分隔值的节点。集群分配设置支持以下内置属性。
    
    有效值为：
    - `_name` – 按节点名称匹配节点。
    - `_host_ip` – 按主机 IP 地址匹配节点。
    - `_publish_ip` – 按发布 IP 地址匹配节点。
    - `_ip` – 匹配 `_host_ip` 或 `_publish_ip`。
    - `_host` – 按主机名匹配节点。
    - `_id` – 按节点 ID 匹配节点。
    - `_tier` – 按数据层角色匹配节点。

- `cluster.routing.allocation.shard_movement_strategy`（Enum）：决定分片从传出节点迁移到传入节点的顺序。

    此设置支持以下策略：
    - `PRIMARY_FIRST` – 先迁移主分片，再迁移副本分片。如果迁移中的节点在过程中发生故障，这种优先顺序可能有助于防止集群健康状态变为红色。
    - `REPLICA_FIRST` – 先迁移副本分片，再迁移主分片。在启用了段复制的混合版本 OpenSearch 集群中进行分片迁移时，这种优先顺序可能有助于防止集群健康状态变为红色。在这种情况下，迁移到较新版本 OpenSearch 节点上的主分片可能会尝试将段文件复制到较旧版本 OpenSearch 上的副本分片，从而导致分片故障。在多版本集群中，先迁移副本分片可能有助于避免这种情况。
    - `NO_PREFERENCE` – 默认行为，分片迁移的顺序无关紧要。

## 集群级分片、块和任务设置

OpenSearch 支持以下集群级分片、块和任务设置：

- `cluster.blocks.read_only`（Boolean）：将整个集群设置为只读。默认值为 `false`。

- `cluster.blocks.read_only_allow_delete`（Boolean）：与 `cluster.blocks.read_only` 类似，但允许删除索引。

- `cluster.max_shards_per_node`（Integer）：限制集群的主分片和副本分片总数。该限制的计算方式为：`cluster.max_shards_per_node` 乘以非冻结数据节点的数量。已关闭索引的分片不计入此限制。默认值为 `1000`。

- `cluster.persistent_tasks.allocation.enable`（String）：为持久任务启用或禁用分配。

    有效值为：
    - `all` – 允许将持久任务分配给节点。
    - `none` – 不允许为持久任务分配。这不会影响已在运行的持久任务。

    默认值为 `all`。

- `cluster.persistent_tasks.allocation.recheck_interval`（Time unit）：当集群状态发生重大变化时，集群管理器会自动检查是否需要分配持久任务。还有其他一些因素（例如内存使用量）会影响持久任务是否被分配给节点，但这些因素不会导致集群状态发生变化。此设置定义了针对这些因素执行分配检查的频率。默认值为 `30 seconds`，最小值为 `10 seconds`。

## 集群级慢日志设置

有关更多信息，请参阅[搜索请求慢日志](/install-and-configure/configuring-opensearch/logs#search-request-slow-logs)。

- `cluster.search.request.slowlog.threshold.warn`（Time unit）：设置请求级慢日志的 `WARN` 阈值。默认值为 `-1`。

- `cluster.search.request.slowlog.threshold.info`（Time unit）：设置请求级慢日志的 `INFO` 阈值。默认值为 `-1`。

- `cluster.search.request.slowlog.threshold.debug`（Time unit）：设置请求级慢日志的 `DEBUG` 阈值。默认值为 `-1`。

- `cluster.search.request.slowlog.threshold.trace`（Time unit）：设置请求级慢日志的 `TRACE` 阈值。默认值为 `-1`。

- `cluster.search.request.slowlog.level`（String）：设置要记录的最低慢日志级别：`WARN`、`INFO`、`DEBUG` 和 `TRACE`。默认值为 `TRACE`。

## 集群级索引设置

有关索引级索引设置的信息，请参阅[集群级索引设置](/install-and-configure/configuring-opensearch/index-settings#cluster-level-index-settings)。

## 集群级协调设置

OpenSearch 支持以下集群级协调设置。此列表中的所有设置都是动态的：

- `cluster.fault_detection.leader_check.timeout`（Time unit）：在 leader 检查期间，节点等待已选举的集群管理器响应的时间，超过该时间则认为检查失败。有效值范围为 `1ms` 到 `60s`（含边界值）。默认值为 `10s`。将此设置更改为默认值以外的值可能会导致集群不稳定。

- `cluster.fault_detection.follower_check.timeout`（Time unit）：在 follower 检查期间，已选举的集群管理器等待响应的时间，超过该时间则认为检查失败。有效值范围为 `1ms` 到 `60s`（含边界值）。默认值为 `10s`。将此设置更改为默认值以外的值可能会导致集群不稳定。
