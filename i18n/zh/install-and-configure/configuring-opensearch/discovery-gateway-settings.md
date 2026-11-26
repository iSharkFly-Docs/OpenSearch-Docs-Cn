---
title: 发现和网关设置
---

# 发现和网关设置

以下是与发现和本地网关相关的设置。

要了解有关静态设置和动态设置的更多信息，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。

## 发现设置

发现过程在集群组建时使用，包括发现节点和选举集群管理节点（Cluster Manager Node）。OpenSearch 支持以下发现设置：

- `discovery.seed_hosts`（静态，list）：节点启动时执行发现的主机列表。默认主机列表为 `["127.0.0.1", "[::1]"]`。

- `discovery.seed_providers`（静态，list）：指定用于获取种子节点地址以启动发现过程的种子主机提供程序类型。

- `discovery.type`（静态，string）：默认情况下，OpenSearch 会组建多节点集群。将 `discovery.type` 设置为 `single-node` 即可组建单节点集群。

- `cluster.initial_cluster_manager_nodes`（静态，list）：用于引导集群的、有资格成为集群管理器的节点列表。

## 网关设置

本地网关存储集群重启时使用的集群状态和分片数据。OpenSearch 支持以下本地网关设置：

- `gateway.recover_after_nodes`（静态，integer）：在整个集群重启后，开始恢复之前必须加入集群的节点数量。

- `gateway.recover_after_data_nodes`（静态，integer）：在整个集群重启后，开始恢复之前必须加入集群的数据节点数量。

- `gateway.expected_data_nodes`（静态，integer）：集群中预期存在的数据节点数量。当预期数量的节点加入集群后，即可开始恢复本地分片。

- `gateway.recover_after_time`（静态，time value）：如果数据节点数量少于预期数量，在开始恢复之前需要等待的时间。
