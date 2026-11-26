---
title: 可用性和恢复设置
---

# 可用性和恢复设置

可用性和恢复设置包括以下方面的设置：

- [快照](#snapshot-settings)
- [集群管理器任务限流](#cluster-manager-task-throttling-settings)
- [远程存储](#remote-backed-storage-settings)
- [搜索背压](#search-backpressure-settings)
- [分片索引背压](#shard-indexing-backpressure-settings)
- [段复制](#segment-replication-settings)
- [跨集群复制](#cross-cluster-replication-settings)

要了解有关静态设置和动态设置的更多信息，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。

## 快照设置

OpenSearch 支持以下快照（Snapshot）设置：

- `snapshot.max_concurrent_operations`（动态，integer）：并发快照操作的最大数量。默认值为 `1000`。

### 与安全相关的快照设置

有关与安全相关的快照设置，请参阅[安全设置](/install-and-configure/configuring-opensearch/security-settings)。

### 文件系统设置

有关文件系统设置的信息，请参阅[共享文件系统](/tuning-your-cluster/availability-and-recovery/snapshots/snapshot-restore#shared-file-system)。

### Amazon S3 设置

有关 Amazon S3 存储库设置的信息，请参阅 [Amazon S3](/tuning-your-cluster/availability-and-recovery/snapshots/snapshot-restore#amazon-s3)。

## 集群管理器任务限流设置

有关集群管理器任务限流设置的信息，请参阅[设置限流阈值](/tuning-your-cluster/cluster-manager-task-throttling#setting-throttling-limits)。

## 远程存储设置

OpenSearch 支持以下集群级远程存储（Remote Store）设置：

- `cluster.remote_store.translog.buffer_interval`（动态，time unit）：执行定期 translog 更新时使用的 translog 缓冲间隔的默认值。仅当索引设置 `index.remote_store.translog.buffer_interval` 不存在时，此设置才生效。

- `remote_store.moving_average_window_size`（动态，integer）：用于计算通过 [Remote Store Stats API](/tuning-your-cluster/availability-and-recovery/remote-store/remote-store-stats-api) 公开的滚动统计值的移动平均窗口大小。默认值为 `20`。强制的最小值为 `5`。

有关更多远程存储设置，请参阅[远程存储](/tuning-your-cluster/availability-and-recovery/remote-store/)和[配置远程存储](/tuning-your-cluster/availability-and-recovery/remote-store/#configuring-remote-backed-storage)。

有关远程段背压设置，请参阅[远程段背压设置](/tuning-your-cluster/availability-and-recovery/remote-store/remote-segment-backpressure#remote-segment-backpressure-settings)。

## 搜索背压设置

搜索背压（Search Backpressure）是一种用于识别资源密集型搜索请求，并在节点负载过高时取消这些请求的机制。有关更多信息，请参阅[搜索背压设置](/tuning-your-cluster/availability-and-recovery/search-backpressure#search-backpressure-settings)。

## 分片索引背压设置

分片索引背压（Shard Indexing Backpressure）是一种分片级别的智能拒绝机制，当集群承受压力时，它会动态拒绝索引请求。有关更多信息，请参阅分片索引背压[设置](/tuning-your-cluster/availability-and-recovery/shard-indexing-settings)。

## 段复制设置

有关段复制（Segment Replication）设置的信息，请参阅[段复制](/tuning-your-cluster/availability-and-recovery/segment-replication/)。

有关段复制背压设置的信息，请参阅[段复制背压](/tuning-your-cluster/availability-and-recovery/segment-replication/backpressure)。

## 跨集群复制设置

有关跨集群复制（Cross-cluster Replication）设置的信息，请参阅[复制设置](/tuning-your-cluster/replication-plugin/settings)。
