---
title: 日志
---

# 日志

OpenSearch 日志包含了监控集群运行和排查问题的宝贵信息。日志的位置因安装类型而异：

- 在 Docker 上，OpenSearch 将大部分日志写入控制台，其余日志存储在 `opensearch/logs/` 中。tarball 安装也使用 `opensearch/logs/`。
- 在大多数 Linux 安装中，OpenSearch 将日志写入 `/var/log/opensearch/`。

日志以 `.log`（纯文本）和 `.json` 文件的形式提供。OpenSearch 日志的权限默认为 `-rw-r--r--`，这意味着节点上的任何用户账户都可以读取它们。你可以在 `log4j2.properties` 中使用 `filePermissions` 选项_针对每种日志类型_更改此行为。例如，你可以添加 `appender.rolling.filePermissions = rw-r-----` 来更改 JSON 服务器日志的权限。有关详细信息，请参阅 [Log4j 2 文档](https://logging.apache.org/log4j/2.x/manual/appenders.html#RollingFileAppender)。

## 应用程序日志

对于应用程序日志，OpenSearch 使用 [Apache Log4j 2](https://logging.apache.org/log4j/2.x/) 及其内置日志级别（按严重程度从低到高排列）。下表介绍了日志设置。

| 设置 | 数据类型 | 描述 |
| :--- | :--- | :--- |
| `logger.org.opensearch.discovery` | String | 日志记录器接受 Log4j2 的内置日志级别：`OFF`、`FATAL`、`ERROR`、`WARN`、`INFO`、`DEBUG` 和 `TRACE`。默认值为 `INFO`。 |

与其更改默认日志级别（`logger.level`），不如更改单个 OpenSearch 模块的日志级别：

```json
PUT /_cluster/settings
{
  "persistent" : {
    "logger.org.opensearch.index.reindex" : "DEBUG"
  }
}
```

::: tip 提示
识别模块最简单的方法不是查看日志（日志会缩写路径，例如 `o.o.i.r`），而是查看 [OpenSearch 源代码](https://github.com/opensearch-project/opensearch/tree/master/server/src/main/java/org/opensearch)。
:::

完成上述示例更改后，OpenSearch 会在重新索引操作期间输出更为详细的日志：

```plaintext
[2019-10-18T16:52:51,184][DEBUG][o.o.i.r.TransportReindexAction] [node1] [1626]: starting
[2019-10-18T16:52:51,186][DEBUG][o.o.i.r.TransportReindexAction] [node1] executing initial scroll against [some-index]
[2019-10-18T16:52:51,291][DEBUG][o.o.i.r.TransportReindexAction] [node1] scroll returned [3] documents with a scroll id of [DXF1Z==]
[2019-10-18T16:52:51,292][DEBUG][o.o.i.r.TransportReindexAction] [node1] [1626]: got scroll response with [3] hits
[2019-10-18T16:52:51,294][DEBUG][o.o.i.r.WorkerBulkByScrollTaskState] [node1] [1626]: preparing bulk request for [0s]
[2019-10-18T16:52:51,297][DEBUG][o.o.i.r.TransportReindexAction] [node1] [1626]: preparing bulk request
[2019-10-18T16:52:51,299][DEBUG][o.o.i.r.TransportReindexAction] [node1] [1626]: sending [3] entry, [222b] bulk request
[2019-10-18T16:52:51,310][INFO ][o.e.c.m.MetaDataMappingService] [node1] [some-new-index/R-j3adc6QTmEAEb-eAie9g] create_mapping [_doc]
[2019-10-18T16:52:51,383][DEBUG][o.o.i.r.TransportReindexAction] [node1] [1626]: got scroll response with [0] hits
[2019-10-18T16:52:51,384][DEBUG][o.o.i.r.WorkerBulkByScrollTaskState] [node1] [1626]: preparing bulk request for [0s]
[2019-10-18T16:52:51,385][DEBUG][o.o.i.r.TransportReindexAction] [node1] [1626]: preparing bulk request
[2019-10-18T16:52:51,386][DEBUG][o.o.i.r.TransportReindexAction] [node1] [1626]: finishing without any catastrophic failures
[2019-10-18T16:52:51,395][DEBUG][o.o.i.r.TransportReindexAction] [node1] Freed [1] contexts
```

DEBUG 和 TRACE 级别的日志极其冗长。如果你为了排查问题而启用了其中任何一个级别，请在完成后将其禁用。

还有其他方法可以更改日志级别：

1. 在 `opensearch.yml` 中添加以下行：

   ```yml
   logger.org.opensearch.index.reindex: debug
   ```

   如果你想在多个集群之间复用日志配置，或者调试单个节点的启动问题，修改 `opensearch.yml` 是最合适的做法。

2. 修改 `log4j2.properties`：

   ```properties
   # 定义一个唯一 ID 为 reindex 的新日志记录器
   logger.reindex.name = org.opensearch.index.reindex
   # 为该 ID 设置日志级别
   logger.reindex.level = debug
   ```

   这种方法非常灵活，但需要熟悉 [Log4j 2 属性文件语法](https://logging.apache.org/log4j/2.x/manual/configuration.html#Properties)。一般来说，其他选项提供的配置体验更为简单。

   如果你查看配置目录中默认的 `log4j2.properties` 文件，可以看到一些 OpenSearch 特有的变量：

   ```properties
   appender.console.layout.pattern = [%d{ISO8601}][%-5p][%-25c{1.}] [%node_name]%marker %m%n
   appender.rolling_old.fileName = ${sys:opensearch.logs.base_path}${sys:file.separator}${sys:opensearch.logs.cluster_name}.log
   ```

   - `${sys:opensearch.logs.base_path}` 是日志目录（例如 `/var/log/opensearch/`）。
   - `${sys:opensearch.logs.cluster_name}` 是集群的名称。
   - `[%node_name]` 是节点的名称。

## 搜索请求慢日志

从 2.12 版本开始，OpenSearch 提供了请求级别的搜索慢日志。这些日志依靠阈值来定义什么算作「慢」。所有超过阈值的请求都会被记录。

搜索请求慢日志可以通过 [Cluster Settings API](/api-reference/cluster-api/cluster-settings) 动态启用。与分片慢日志不同，搜索请求慢日志的阈值是针对请求的总耗时配置的。默认情况下，日志处于禁用状态（所有阈值都设置为 `-1`）。

```json
PUT /_cluster/settings
{
"persistent" : {
      "cluster.search.request.slowlog.level" : "TRACE",
      "cluster.search.request.slowlog.threshold.warn": "10s",
      "cluster.search.request.slowlog.threshold.info": "5s",
      "cluster.search.request.slowlog.threshold.debug": "2s",
      "cluster.search.request.slowlog.threshold.trace": "10ms"
}
}
```

`opensearch_index_search_slowlog.log` 中的一行可能如下所示：

```plaintext
[2023-10-30T15:47:42,630][TRACE][c.s.r.slowlog] [runTask-0] took[80.8ms], took_millis[80], phase_took_millis[{expand=0, query=39, fetch=22}], total_hits[4 hits], search_type[QUERY_THEN_FETCH], shards[{total: 10, successful: 10, skipped: 0, failed: 0}], source[{"query":{"match_all":{"boost":1.0}}}], id[]
```

::: warning 重要
如果设置的阈值较低，搜索请求慢日志可能会占用大量磁盘空间并影响性能。建议仅在排查问题或进行性能调优时临时启用。要禁用搜索请求慢日志，请将所有阈值恢复为 `-1`。
:::

## 分片慢日志

OpenSearch 有两种*分片慢日志*，用于帮助你识别性能问题：搜索慢日志和索引慢日志。

这些日志依靠阈值来定义什么算作「慢」搜索或「慢」索引操作。例如，你可以规定一个查询如果需要超过 15 秒才能完成，就算是慢查询。与针对模块配置的应用程序日志不同，慢日志是针对索引配置的。默认情况下，两种日志都处于禁用状态（所有阈值都设置为 `-1`）。

与搜索请求慢日志不同，分片慢日志的阈值是针对单个分片的耗时配置的。

```json
GET <some-index>/_settings?include_defaults=true
{
  "indexing": {
    "slowlog": {
      "reformat": "true",
      "threshold": {
        "index": {
          "warn": "-1",
          "trace": "-1",
          "debug": "-1",
          "info": "-1"
        }
      },
      "source": "1000",
      "level": "TRACE"
    }
  },
  "search": {
    "slowlog": {
      "level": "TRACE",
      "threshold": {
        "fetch": {
          "warn": "-1",
          "trace": "-1",
          "debug": "-1",
          "info": "-1"
        },
        "query": {
          "warn": "-1",
          "trace": "-1",
          "debug": "-1",
          "info": "-1"
        }
      }
    }
  }
}
```

要启用这些日志，请提高一个或多个阈值：

```json
PUT <some-index>/_settings
{
  "indexing": {
    "slowlog": {
      "threshold": {
        "index": {
          "warn": "15s",
          "trace": "750ms",
          "debug": "3s",
          "info": "10s"
        }
      },
      "source": "500",
      "level": "INFO"
    }
  }
}
```

在此示例中，OpenSearch 会以 WARN 级别记录耗时 15 秒或更长时间的索引操作，以 INFO 级别记录耗时 10 到 14.*x* 秒的操作。如果将阈值设置为 0 秒，OpenSearch 会记录所有操作，这对于测试慢日志是否确实已启用非常有用。

- `reformat` 指定是将文档的 `_source` 字段记录为单行（`true`），还是允许其跨越多行（`false`）。
- `source` 是要记录的文档 `_source` 字段的字符数。
- `level` 是要包含的最低日志级别。

`opensearch_index_indexing_slowlog.log` 中的一行可能如下所示：

```plaintext
node1 | [2019-10-24T19:48:51,012][WARN][i.i.s.index] [node1] [some-index/i86iF5kyTyy-PS8zrdDeAA] took[3.4ms], took_millis[3], type[_doc], id[1], routing[], source[{"title":"Your Name", "Director":"Makoto Shinkai"}]
```

如果设置的阈值较低，分片慢日志可能会占用大量磁盘空间并影响性能。建议仅在排查问题或进行性能调优时临时启用。要禁用分片慢日志，请将所有阈值恢复为 `-1`。

## 任务日志

启用任务资源消费者（task resource consumers）后，OpenSearch 可以记录内存开销最大的前 N 个搜索任务的 CPU 时间和内存使用情况。默认情况下，任务资源消费者会每隔 60 秒记录前 10 个搜索任务。这些值可以在 `opensearch.yml` 中配置。

任务日志可以通过 [Cluster Settings API](/api-reference/cluster-api/cluster-settings) 动态启用：

```json
PUT _cluster/settings
{
  "persistent" : {
    "task_resource_consumers.enabled" : "true"
  }
}
```

::: tip 提示
启用任务资源消费者可能会影响搜索延迟。
:::

启用后，日志将写入 `logs/opensearch_task_detailslog.json` 和 `logs/opensearch_task_detailslog.log`。

要配置日志记录间隔和记录的搜索任务数量，请在 `opensearch.yml` 中添加以下行：

```yaml
# 要记录的高开销搜索任务数量
cluster.task.consumers.top_n.size:100

# 日志记录间隔
cluster.task.consumers.top_n.frequency:30s
```

## 弃用日志

弃用日志记录客户端何时对集群发出了已弃用的 API 调用。这些日志可以帮助你在升级到新的主版本之前发现并修复问题。默认情况下，OpenSearch 以 WARN 级别记录已弃用的 API 调用，这几乎适用于所有用例。如有需要，可以使用 `_cluster/settings`、`opensearch.yml` 或 `log4j2.properties` 配置 `logger.deprecation.level`。
