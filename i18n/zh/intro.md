---
title: OpenSearch 简介
---

# OpenSearch 简介

OpenSearch 是一个基于 [Apache Lucene](https://lucene.apache.org/) 的分布式搜索和分析引擎。将数据添加到 OpenSearch 后，你就可以对其执行全文搜索，并使用你所期望的各种功能：按字段搜索、搜索多个索引、提升字段权重、按评分对结果排序、按字段对结果排序以及对结果进行聚合。

不出所料，人们经常将 OpenSearch 这样的搜索引擎用作搜索应用程序的后端——想想 [Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:FAQ/Technical#What_software_is_used_to_run_Wikipedia?) 或者在线商店。OpenSearch 性能出色，并且可以随着应用程序需求的增减而扩展或缩减。

另一个同样流行但不那么显而易见的用例是日志分析：收集应用程序的日志，将其导入 OpenSearch，然后利用丰富的搜索和可视化功能来发现问题。例如，一台出现故障的 Web 服务器可能有 0.5% 的请求返回 500 错误，除非你有一张实时展示该服务器在过去四小时内返回的所有 HTTP 状态码的图表，否则很难注意到这个问题。你可以使用 [OpenSearch Dashboards](/dashboards/) 基于 OpenSearch 中的数据构建此类可视化。

## 集群和节点

OpenSearch 采用分布式设计，这意味着你与之交互的是 OpenSearch *集群*（Cluster）。每个集群由一个或多个*节点*（Node）组成，节点是存储数据并处理搜索请求的服务器。

你可以在笔记本电脑上本地运行 OpenSearch——它的系统要求非常低——但你也可以将单个集群扩展到数据中心中数百台性能强大的机器。

在单节点集群（例如笔记本电脑）中，一台机器必须承担所有工作：管理集群状态、索引和搜索数据，以及在索引之前对数据进行预处理。不过，随着集群规模的扩大，你可以对职责进行划分。拥有高速磁盘和充足内存的节点可能非常适合索引和搜索数据，而拥有强大 CPU 但磁盘很小的节点则可以负责管理集群状态。有关设置节点类型的更多信息，请参阅[集群组建](/tuning-your-cluster/)。

## 索引和文档

OpenSearch 将数据组织为*索引*（Index）。每个索引是 JSON *文档*（Document）的集合。如果你有一组原始的百科全书文章或日志行想要添加到 OpenSearch，必须先将它们转换为 [JSON](https://www.json.org/)。一部电影的简单 JSON 文档可能如下所示：

```json
{
  "title": "The Wind Rises",
  "release_date": "2013-07-20"
}
```

当你将文档添加到索引时，OpenSearch 会添加一些元数据，例如唯一的文档 *ID*：

```json
{
  "_index": "<index-name>",
  "_type": "_doc",
  "_id": "<document-id>",
  "_version": 1,
  "_source": {
    "title": "The Wind Rises",
    "release_date": "2013-07-20"
  }
}
```

索引还包含映射和设置：

- *映射*（Mapping）是索引中文档所具有的*字段*（Field）的集合。在本例中，这些字段是 `title` 和 `release_date`。
- 设置包括索引名称、创建日期和分片数量等数据。

## 主分片和副本分片

OpenSearch 将索引拆分为*分片*（Shard），以便在集群的各个节点之间均匀分布。例如，一个 400 GB 的索引可能太大，集群中的任何单个节点都无法处理；但如果将其拆分为十个分片，每个分片 40 GB，OpenSearch 就可以将这些分片分布到十个节点上，并单独处理每个分片。

默认情况下，OpenSearch 会为每个*主分片*（Primary Shard）创建一个*副本分片*（Replica Shard）。例如，如果你将索引拆分为十个分片，OpenSearch 也会创建十个副本分片。这些副本分片在节点发生故障时充当备份——OpenSearch 会将副本分片分配到与其对应主分片不同的节点上——同时它们还能提高集群处理搜索请求的速度和吞吐率。对于搜索密集型的工作负载，你可以为每个索引指定多个副本。

尽管分片只是 OpenSearch 索引的一部分，但每个分片实际上都是一个完整的 Lucene 索引——我们知道这有点令人困惑。不过这个细节很重要，因为每个 Lucene 实例都是一个消耗 CPU 和内存的运行进程。分片并不是越多越好。例如，将一个 400 GB 的索引拆分为 1,000 个分片会给集群带来不必要的压力。一个好的经验法则是将分片大小保持在 10--50 GB 之间。

## REST API

你可以使用 REST API 与 OpenSearch 集群交互，它提供了很大的灵活性。你可以使用 [curl](https://curl.se/) 之类的客户端，或任何能够发送 HTTP 请求的编程语言。要将 JSON 文档添加到 OpenSearch 索引（即索引一个文档），你需要发送一个 HTTP 请求：

```json
PUT https://<host>:<port>/<index-name>/_doc/<document-id>
{
  "title": "The Wind Rises",
  "release_date": "2013-07-20"
}
```

搜索该文档：

```json
GET https://<host>:<port>/<index-name>/_search?q=wind
```

删除该文档：

```json
DELETE https://<host>:<port>/<index-name>/_doc/<document-id>
```

你可以使用 REST API 更改大多数 OpenSearch 设置、修改索引、检查集群健康状况、获取统计信息——几乎可以完成所有操作。

## 高级概念

以下部分介绍 OpenSearch 中一些更高级的概念。

### Translog

任何索引变更（例如文档的索引或删除）都会在 Lucene 提交（commit）期间写入磁盘。然而，Lucene 提交是开销很大的操作，因此无法在每次索引变更后都执行。取而代之的是，每个分片都会将每个索引操作记录在一个称为 _translog_ 的事务日志中。当文档被索引时，它会被添加到内存缓冲区并记录到 translog 中。进程或主机重启后，内存缓冲区中的所有数据都会丢失。由于 translog 会写入磁盘，将文档记录到 translog 中可以确保持久性。

频繁的刷新操作会将内存缓冲区中的文档写入一个段（Segment），然后清空内存缓冲区。[flush](#flush) 会定期执行 Lucene 提交，包括使用 `fsync` 将段写入磁盘、清除旧的 translog 并启动一个新的 translog。因此，translog 包含所有尚未 flush 的操作。

### Refresh

OpenSearch 会定期执行 _refresh_（刷新）操作，将内存中 Lucene 索引的文档写入文件。由于没有执行 `fsync`，这些文件并不能保证持久性。refresh 使文档可以被搜索到。

### Flush

_flush_ 操作使用 `fsync` 将文件持久化到磁盘，从而确保持久性。flush 确保仅存储在 translog 中的数据被记录到 Lucene 索引中。OpenSearch 会根据需要执行 flush，以确保 translog 不会变得过大。

### Merge

在 OpenSearch 中，一个分片就是一个 Lucene 索引，它由_段_（或段文件）组成。段存储已索引的数据，并且是不可变的。较小的段会定期合并为较大的段。合并可以减少每个分片上的段总数、释放磁盘空间并提高搜索性能。最终，段会达到合并策略中指定的最大大小，之后便不再被合并为更大的段。合并策略还指定了合并的执行频率。
