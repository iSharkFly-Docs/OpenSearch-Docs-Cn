---
title: 滚动升级
---

# 滚动升级

滚动升级（Rolling Upgrade）有时也称为「节点替换升级」，可以在运行中的集群上执行，几乎不会造成停机。节点会被逐个停止并原地升级。或者，也可以逐个停止节点，并用运行新版本的主机替换它们。在此过程中，你可以继续在集群中索引和查询数据。

本文档从较高层面、以与平台无关的方式概述滚动升级流程。有关命令、脚本和配置文件的具体示例，请参阅[附录](/install-and-configure/upgrade-opensearch/appendix/)。

## 升级前的准备

在对 OpenSearch 集群做任何变更之前，请参阅[升级 OpenSearch](/install-and-configure/upgrade-opensearch/)，了解有关备份配置文件以及为集群状态和索引创建快照的建议。

::: warning 重要
**重要：** OpenSearch 节点无法降级。如果需要撤销升级，则必须全新安装 OpenSearch，并从快照恢复集群。请在开始升级之前创建快照，并将其存储在远程仓库中。
:::

## 执行升级

1. 开始之前，请先检查 OpenSearch 集群的健康状况。升级前应解决所有索引或分片分配问题，以确保数据得到保留。状态为 **green** 表示所有主分片和副本分片均已分配。有关更多信息，请参阅[集群健康](/api-reference/cluster-api/cluster-health)。以下命令查询 `_cluster/health` API 端点：
   ```json
   GET "/_cluster/health?pretty"
   ```
   响应应类似于以下示例：
   ```json
   {
       "cluster_name":"opensearch-dev-cluster",
       "status":"green",
       "timed_out":false,
       "number_of_nodes":4,
       "number_of_data_nodes":4,
       "active_primary_shards":1,
       "active_shards":4,
       "relocating_shards":0,
       "initializing_shards":0,
       "unassigned_shards":0,
       "delayed_unassigned_shards":0,
       "number_of_pending_tasks":0,
       "number_of_in_flight_fetch":0,
       "task_max_waiting_in_queue_millis":0,
       "active_shards_percent_as_number":100.0
   }
   ```
1. 禁用分片复制，以免在节点下线时创建分片副本。这会停止 Lucene 索引段在集群节点之间的移动。你可以通过调用 `_cluster/settings` API 端点来禁用分片复制：
   ```json
   PUT "/_cluster/settings?pretty"
   {
       "persistent": {
           "cluster.routing.allocation.enable": "primaries"
       }
   }
   ```
   响应应类似于以下示例：
   ```json
   {
     "acknowledged" : true,
     "persistent" : {
       "cluster" : {
         "routing" : {
           "allocation" : {
             "enable" : "primaries"
           }
         }
       }
     },
     "transient" : { }
   }
   ```

1. 对集群执行 flush 操作，将事务日志条目提交到 Lucene 索引：
   ```json
   POST "/_flush?pretty"
   ```
   响应应类似于以下示例：
   ```json
   {
     "_shards" : {
       "total" : 4,
       "successful" : 4,
       "failed" : 0
     }
   }
   ```
1. 检查集群并确定第一个要升级的节点。符合集群管理器条件的节点应最后升级，因为 OpenSearch 节点可以加入管理器节点运行旧版本的集群，但无法加入所有管理器节点都运行新版本的集群。
1. 查询 `_cat/nodes` 端点，确定哪个节点被选为集群管理器。以下命令包含额外的查询参数，只请求 name、version、node.role 和 master 列。请注意，OpenSearch 1.x 版本使用术语「master」，该术语在 OpenSearch 2.x 及更高版本中已被弃用，并由「cluster_manager」取代。
   ```bash
   GET "/_cat/nodes?v&h=name,version,node.role,master" | column -t
   ```
   响应应类似于以下示例：
   ```bash
   name        version  node.role  master
   os-node-01  7.10.2   dimr       -
   os-node-04  7.10.2   dimr       -
   os-node-03  7.10.2   dimr       -
   os-node-02  7.10.2   dimr       *
   ```
1. 停止要升级的节点。删除容器时，不要删除与该容器关联的卷。新的 OpenSearch 容器将使用现有的卷。**删除卷会导致数据丢失**。
1. 查询 `_cat/nodes` API 端点，确认对应节点已从集群中移除：
   ```bash
   GET "/_cat/nodes?v&h=name,version,node.role,master" | column -t
   ```
   响应应类似于以下示例：
   ```bash
   name        version  node.role  master
   os-node-02  7.10.2   dimr       *
   os-node-04  7.10.2   dimr       -
   os-node-03  7.10.2   dimr       -
   ```
   `os-node-01` 不再列出，因为该容器已被停止并删除。
1. 部署一个运行目标版本 OpenSearch 的新容器，并将其映射到与已删除容器相同的卷。
1. 新节点上的 OpenSearch 运行后，查询 `_cat/nodes` 端点，确认它已加入集群：
   ```bash
   GET "/_cat/nodes?v&h=name,version,node.role,master" | column -t
   ```
   响应应类似于以下示例：
   ```bash
   name        version  node.role  master
   os-node-02  7.10.2   dimr       *
   os-node-04  7.10.2   dimr       -
   os-node-01  7.10.2   dimr       -
   os-node-03  7.10.2   dimr       -
   ```
   在示例输出中，新的 OpenSearch 节点向集群报告的运行版本为 `7.10.2`。这是 `compatibility.override_main_response_version` 的作用，该设置用于让会检查版本的旧版客户端连接集群。你可以调用 `/_nodes` API 端点手动确认节点版本，如以下命令所示。将 `<nodeName>` 替换为你的节点名称。有关更多信息，请参阅 [Nodes API](/api-reference/nodes-apis/)。
   ```bash
   GET "/_nodes/<nodeName>?pretty=true" | jq -r '.nodes | .[] | "\(.name) v\(.version)"'
   ```
   响应应类似于以下示例：
   ```bash
   os-node-01 v1.3.7
   ```
1. 对集群中的每个节点重复第 5 步到第 9 步。请记住最后升级符合集群管理器条件的节点。替换最后一个节点后，查询 `_cat/nodes` 端点，确认所有节点都已加入集群。此时集群已引导到新版本的 OpenSearch。你可以查询 `_cat/nodes` API 端点来验证集群版本：
   ```bash
   GET "/_cat/nodes?v&h=name,version,node.role,master" | column -t
   ```
   响应应类似于以下示例：
   ```bash
   name        version  node.role  master
   os-node-04  1.3.7    dimr       -
   os-node-02  1.3.7    dimr       *
   os-node-01  1.3.7    dimr       -
   os-node-03  1.3.7    dimr       -
   ```
1. 重新启用分片复制：
   ```json
   PUT "/_cluster/settings?pretty"
   {
       "persistent": {
           "cluster.routing.allocation.enable": "all"
       }
   }
   ```
   响应应类似于以下示例：
   ```json
   {
     "acknowledged" : true,
     "persistent" : {
       "cluster" : {
         "routing" : {
           "allocation" : {
             "enable" : "all"
           }
         }
       }
     },
     "transient" : { }
   }
   ```
1. 确认集群处于健康状态：
   ```bash
   GET "/_cluster/health?pretty"
   ```
   响应应类似于以下示例：
   ```json
   {
     "cluster_name" : "opensearch-dev-cluster",
     "status" : "green",
     "timed_out" : false,
     "number_of_nodes" : 4,
     "number_of_data_nodes" : 4,
     "discovered_master" : true,
     "active_primary_shards" : 1,
     "active_shards" : 4,
     "relocating_shards" : 0,
     "initializing_shards" : 0,
     "unassigned_shards" : 0,
     "delayed_unassigned_shards" : 0,
     "number_of_pending_tasks" : 0,
     "number_of_in_flight_fetch" : 0,
     "task_max_waiting_in_queue_millis" : 0,
     "active_shards_percent_as_number" : 100.0
   }
   ```
1. 升级现已完成，你可以开始体验最新的功能和修复了！

### 相关文章

- [OpenSearch 配置](/install-and-configure/configuring-opensearch/)
- [性能分析器](/monitoring-your-cluster/pa/)
- [安装和配置 OpenSearch Dashboards](/install-and-configure/install-dashboards/)
- [关于 OpenSearch 中的安全功能](/security/)
