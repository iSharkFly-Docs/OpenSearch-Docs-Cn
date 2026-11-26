---
title: 配置和系统设置
---

# 配置和系统设置

有关创建 OpenSearch 集群的概述以及配置设置示例，请参阅[创建集群](/tuning-your-cluster/)。要了解有关静态设置和动态设置的更多信息，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。

OpenSearch 支持以下系统设置：

- `cluster.name`（静态，string）：集群名称。

- `node.name`（静态，string）：节点的描述性名称。

- `node.roles`（静态，list）：为 OpenSearch 节点定义一个或多个角色。有效值为 `cluster_manager`、`data`、`ingest`、`search`、`ml`、`remote_cluster_client` 和 `coordinating_only`。

- `path.data`（静态，string）：存储数据的目录路径。多个位置之间用逗号分隔。

- `path.logs`（静态，string）：日志文件的路径。

- `bootstrap.memory_lock`（静态，Boolean）：在启动时锁定内存。我们建议将堆大小设置为系统可用内存的一半左右，并确保进程的所有者被允许使用此限制。当系统进行内存交换时，OpenSearch 的性能会很差。
