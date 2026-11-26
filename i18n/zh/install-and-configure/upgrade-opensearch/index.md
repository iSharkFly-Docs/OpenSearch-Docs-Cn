---
title: 升级 OpenSearch
---

# 升级 OpenSearch

OpenSearch Project 会定期发布更新，其中包含新功能、改进和缺陷修复。OpenSearch 使用[语义化版本（Semantic Versioning）](https://semver.org/)，这意味着破坏性变更只会在主版本之间引入。要了解即将推出的功能和修复，请查看 GitHub 上的 [OpenSearch Project Roadmap](https://github.com/orgs/opensearch-project/projects/1)。要查看以往的版本列表，或进一步了解 OpenSearch 如何使用版本号，请参阅[发布计划与维护策略](https://opensearch.isharkfly.com/releases.html)。

我们知道用户都希望尽快升级 OpenSearch 以使用最新功能。我们会继续扩充这些升级与迁移文档，覆盖更多主题，例如升级 OpenSearch Dashboards 以及保留自定义配置（例如插件的配置）。如果想了解接下来的计划或希望补充某些内容，请在 GitHub 上 [OpenSearch Project](https://github.com/opensearch-project) 的[升级与迁移文档 meta issue](https://github.com/opensearch-project/documentation-website/issues/2830) 下留言。

::: tip 提示
如果你希望增加某个特定流程，或者想参与贡献，请在 GitHub 上[创建 issue](https://github.com/opensearch-project/documentation-website/issues)。请参阅[贡献者指南](https://github.com/opensearch-project/documentation-website/blob/main/CONTRIBUTING.md)了解如何提供帮助。
:::

## 工作流注意事项

在对集群做任何变更之前，请花时间规划整个流程。例如，考虑以下问题：

- 升级过程需要多长时间？
- 如果集群用于生产环境，停机会造成多大影响？
- 你是否具备相应的基础设施，可以先在测试或开发环境中搭建新集群，再将其投入生产？还是需要直接升级生产主机？

这些问题的答案可以帮助你确定哪种升级路径最适合你的环境。

至少，你应该完成以下工作：

- [查看破坏性变更](#reviewing-breaking-changes)。
- [查看 OpenSearch 工具兼容性矩阵](#reviewing-the-opensearch-tools-compatibility-matrices)。
- [查看插件兼容性](#reviewing-plugin-compatibility)。
- [备份配置文件](#backing-up-configuration-files)。
- [创建快照](#creating-a-snapshot)。

::: tip 提示
在开始升级之前，停止所有非必要的索引操作，以免在升级期间给集群带来不必要的资源压力。
:::

### 查看破坏性变更

确定新版本 OpenSearch 如何与你的环境集成非常重要。在开始任何升级步骤之前，请先查看[破坏性变更](/breaking-changes)，以确定是否需要调整你的工作流。例如，上游或下游组件可能需要修改，才能与某项 API 变更兼容（参见 meta issue [#2589](https://github.com/opensearch-project/OpenSearch/issues/2589)）。

### 查看 OpenSearch 工具兼容性矩阵

如果你的 OpenSearch 集群与环境中的其他服务（例如 Logstash 或 Beats）交互，请查看 [OpenSearch 工具兼容性矩阵](/tools/#compatibility-matrices)，以确定其他组件是否也需要升级。

### 查看插件兼容性

检查你使用的插件，确认它们与目标版本的 OpenSearch 是否兼容。OpenSearch Project 官方插件可以在 GitHub 上的 [OpenSearch Project](https://github.com/opensearch-project) 仓库中找到。如果你使用了第三方插件，请查阅这些插件的文档，确认它们是否兼容。

前往[可用插件](/install-and-configure/plugins#available-plugins)查看参考表，其中列出了 OpenSearch 捆绑插件的版本兼容性。

::: warning 重要
插件的主版本、次版本和补丁版本必须与 OpenSearch 的主版本、次版本和补丁版本一致才能兼容。例如，2.3.0.x 版本的插件只能与 OpenSearch 2.3.0 配合使用。
:::

### 备份配置文件

在开始升级之前备份所有重要文件，以降低数据丢失的风险。这些文件通常位于以下两个目录之一：

- `opensearch/config`
- `opensearch-dashboards/config`

例如 `opensearch.yml`、`opensearch_dashboards.yml`、插件配置文件和 TLS 证书。确定需要备份的文件后，为安全起见，请将它们复制到远程存储中。

如果你使用了安全功能，请务必阅读[注意事项](/security/configuration/security-admin#a-word-of-caution)，了解如何备份和恢复安全设置。

### 创建快照

我们建议使用[快照（Snapshot）](/tuning-your-cluster/availability-and-recovery/snapshots/)备份集群状态和索引。如果需要将集群回滚到原始版本，升级前创建的快照可以用作还原点。

将快照存储在外部存储上可以进一步降低数据丢失的风险，例如挂载的网络文件系统（Network File System，NFS），或下表中列出的云存储方案。

| 快照仓库位置 | 所需的 OpenSearch 插件 |
| :--- | :--- |
| [Amazon Simple Storage Service (Amazon S3)](https://aws.amazon.com/s3/) | [repository-s3](https://github.com/opensearch-project/OpenSearch/tree/2.12.0/plugins/repository-s3) |
| [Google Cloud Storage (GCS)](https://cloud.google.com/storage) | [repository-gcs](https://github.com/opensearch-project/OpenSearch/tree/2.12.0/plugins/repository-gcs) |
| [Apache Hadoop Distributed File System (HDFS)](https://hadoop.apache.org/) | [repository-hdfs](https://github.com/opensearch-project/OpenSearch/tree/2.12.0/plugins/repository-hdfs) |
| [Microsoft Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) | [repository-azure](https://github.com/opensearch-project/OpenSearch/tree/2.12.0/plugins/repository-azure) |

## 升级方式

根据你的需求，选择合适的方式将集群升级到新版本的 OpenSearch：

- [滚动升级](#rolling-upgrade)在不停止集群的情况下逐个升级节点。
- [集群重启升级](#cluster-restart-upgrade)在集群停止期间升级服务。

跨越多个 OpenSearch 主版本的升级需要重建索引，因此需要额外的工作。有关详细信息，请参阅 [Reindex](/api-reference/document-apis/reindex) API。规划数据迁移时，可参考本指南后面的[索引兼容性参考](#index-compatibility-reference)表。

### 滚动升级

如果希望集群在整个升级过程中保持可用，滚动升级是很好的选择。在逐个停止、升级和重启节点的同时，数据可以继续被摄取、分析和查询。滚动升级的一种变体称为「节点替换」，其流程与滚动升级完全相同，只是新节点不复用原来的主机和容器。如果你同时要升级底层主机，可以采用节点替换的方式。

如果集群管理器运行的 OpenSearch 版本比申请加入集群的节点更新，该节点就无法加入集群。为避免此问题，请最后升级符合集群管理器条件的节点。

有关该流程的更多信息，请参阅[滚动升级](/install-and-configure/upgrade-opensearch/rolling-upgrade)。

### 集群重启升级

OpenSearch 管理员可能出于多种原因选择集群重启升级，例如管理员不希望在运行中的集群上执行维护，或者集群正在迁移到其他环境。

滚动升级每次只有一个节点离线，而集群重启升级则要求先停止集群中所有节点上的 OpenSearch 和 OpenSearch Dashboards，然后才能继续。节点停止后，安装新版本的 OpenSearch。然后启动 OpenSearch，集群以新版本完成引导。

## 兼容性

OpenSearch 节点与同一*主*版本内运行任意其他*次*版本的 OpenSearch 节点兼容。例如，1.1.0 与 1.3.7 兼容，因为它们属于同一个*主*版本（1.x）。此外，OpenSearch 节点和索引向后兼容上一个主版本。例如，这意味着由运行任意 1.x 版本的 OpenSearch 节点创建的索引，可以从快照恢复到运行任意 2.x 版本的 OpenSearch 集群中。

::: tip 提示
OpenSearch 1.x 节点与运行 Elasticsearch 7.x 的节点兼容，但混合版本环境的持续时间不应超出集群升级活动的时间范围。
:::

索引的兼容性由创建该索引的 [Apache Lucene](https://lucene.apache.org/) 版本决定。如果索引由运行 1.0.0 版本的 OpenSearch 集群创建，那么任何运行最高至最新 1.x 或 2.x 版本的 OpenSearch 集群都可以使用该索引。有关 OpenSearch 1.0.0 及更高版本以及 [Elasticsearch](https://www.elastic.co/) 6.8 及更高版本所使用的 Lucene 版本，请参阅[索引兼容性参考](#index-compatibility-reference)表。

如果你的升级路径跨越多个主版本，并且希望保留现有索引，可以在升级前使用 [Reindex](/api-reference/document-apis/reindex) API 让索引与目标版本的 OpenSearch 兼容。例如，如果集群当前运行的是 Elasticsearch 6.8，而你想升级到 OpenSearch 2.x，则必须先升级到 OpenSearch 1.x，使用 [Reindex](/api-reference/document-apis/reindex) API 重新创建索引，最后再升级到 2.x。除重建索引外，另一种方法是从数据源重新摄取数据，例如重放数据流或从数据库摄取数据。

### 索引兼容性参考

如果计划在 OpenSearch 版本升级后保留旧索引，你可能需要重建索引或重新摄取数据。下表列出了近期 OpenSearch 和 Elasticsearch 版本所使用的 Lucene 版本。

<style>
table {
    border-collapse: collapse;
    table-layout: fixed;
}
th {
  background-color: #F5F7F7;
}
th,
td {
  text-align: center;
  padding: 0.5em 1em;
}
</style>
<table>
    <tr>
        <th>Lucene 版本</th>
        <th>OpenSearch 版本</th>
        <th>Elasticsearch 版本</th>
    </tr>
    <tr>
        <td>9.4.2</td>
        <td>2.5.0<br>2.4.1</td>
        <td>8.6</td>
    </tr>
    <tr>
        <td>9.4.1</td>
        <td>2.4.0</td>
        <td>&#8212;</td>
    </tr>
    <tr>
        <td>9.4.0</td>
        <td>&#8212;</td>
        <td>8.5</td>
    </tr>
    <tr>
        <td>9.3.0</td>
        <td>2.3.0<br>2.2.x</td>
        <td>8.4</td>
    </tr>
    <tr>
        <td>9.2.0</td>
        <td>2.1.0</td>
        <td>8.3</td>
    </tr>
    <tr>
        <td>9.1.0</td>
        <td>2.0.x</td>
        <td>8.2</td>
    </tr>
    <tr>
        <td>9.0.0</td>
        <td>&#8212;</td>
        <td>8.1<br>8.0</td>
    </tr>
    <tr>
        <td>8.11.1</td>
        <td>&#8212;</td>
        <td>7.17</td>
    </tr>
    <tr>
        <td>8.10.1</td>
        <td>1.3.x<br>1.2.x</td>
        <td>7.16</td>
    </tr>
    <tr>
        <td>8.9.0</td>
        <td>1.1.0</td>
        <td>7.15<br>7.14</td>
    </tr>
    <tr>
        <td>8.8.2</td>
        <td>1.0.0</td>
        <td>7.13</td>
    </tr>
    <tr>
        <td>8.8.0</td>
        <td>&#8212;</td>
        <td>7.12</td>
    </tr>
    <tr>
        <td>8.7.0</td>
        <td>&#8212;</td>
        <td>7.11<br>7.10</td>
    </tr>
    <tr>
        <td>8.6.2</td>
        <td>&#8212;</td>
        <td>7.9</td>
    </tr>
    <tr>
        <td>8.5.1</td>
        <td>&#8212;</td>
        <td>7.8<br>7.7</td>
    </tr>
    <tr>
        <td>8.4.0</td>
        <td>&#8212;</td>
        <td>7.6</td>
    </tr>
    <tr>
        <td>8.3.0</td>
        <td>&#8212;</td>
        <td>7.5</td>
    </tr>
    <tr>
        <td>8.2.0</td>
        <td>&#8212;</td>
        <td>7.4</td>
    </tr>
    <tr>
        <td>8.1.0</td>
        <td>&#8212;</td>
        <td>7.3</td>
    </tr>
    <tr>
        <td>8.0.0</td>
        <td>&#8212;</td>
        <td>7.2<br>7.1</td>
    </tr>
    <tr>
        <td>7.7.3</td>
        <td>&#8212;</td>
        <td>6.8</td>
    </tr>
</table>
<p style="text-align:right"><sub><em>短横线（&#8212;）表示没有包含对应 Apache Lucene 版本的产品版本。</em></sub></p>
