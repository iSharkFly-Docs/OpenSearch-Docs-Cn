---
title: 设置
---

# SQL 设置

SQL 插件在标准的 OpenSearch 集群设置之外新增了几项设置。其中大多数是动态设置，因此无需重启集群即可更改插件的默认行为。关于静态设置和动态设置的更多信息，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。

可以分别禁用 `PPL` 查询或 `SQL` 查询的处理。

可以像更新其他集群设置一样更新这些设置：

```json
PUT _cluster/settings
{
  "transient" : {
    "plugins.sql.enabled" : false
  }
}
```

也可以使用以下请求格式：

```json
PUT _cluster/settings
{
  "transient": {
    "plugins": {
      "ppl": {
        "enabled": "false"
      }
    }
  }
}
```

同样，也可以向 `_plugins/_query/settings` 端点发送请求来更新设置：

```json
PUT _plugins/_query/settings
{
  "transient" : {
    "plugins.sql.enabled" : false
  }
}
```

也可以使用以下请求格式：

```json
PUT _plugins/_query/settings
{
  "transient": {
    "plugins": {
      "ppl": {
        "enabled": "false"
      }
    }
  }
}
```

::: info 注意
发送到 `_plugins/_ppl` 和 `_plugins/_sql` 端点的请求会在请求体中包含索引名称，因此它们与 `bulk`、`mget` 和 `msearch` 操作有相同的访问策略考量。将 `rest.action.multi.allow_explicit_index` 参数设置为 `false` 会同时禁用 `SQL` 和 `PPL` 端点。
:::

## 可用设置

设置 | 默认值 | 描述
:--- | :--- | :---
`plugins.sql.enabled` | True | 设置为 `false` 可禁用插件中的 `SQL` 支持。
`plugins.ppl.enabled` | True | 设置为 `false` 可禁用插件中的 `PPL` 支持。
`plugins.sql.slowlog` | 2 秒 | 配置慢查询的时间阈值（以秒为单位）。插件会在 `opensearch.log` 中以 `Slow query: elapsed=xxx (ms)` 的形式记录慢查询。
`plugins.sql.cursor.keep_alive` | 1 分钟 | 配置游标（cursor）上下文保持打开的时长。游标上下文占用资源较多，因此建议设置较小的值。
`plugins.query.memory_limit` | 85% | 配置查询引擎断路器的堆内存使用上限。
`plugins.query.size_limit` | 200 | 设置查询引擎从 OpenSearch 获取索引数据时的默认大小。

## Spark 连接器设置

SQL 插件支持将 [Apache Spark](https://spark.apache.org/) 作为增强计算源。当数据源在 Apache Spark 中被定义为表时，OpenSearch 可以使用这些表。这样你就可以在 OpenSearch Dashboards 的 [Discover](/dashboards/discover/index-discover) 和可观测性日志中对外部数据源运行 SQL 查询。 

首先，启用以下设置，将 Spark 添加为数据源并启用正确的权限。

设置 | 描述
:--- | :---
`spark.uri` | Spark 数据源的标识符。
`spark.auth.type` | 用于向 Spark 进行身份验证的授权类型。
`spark.auth.username` | Spark 数据源的用户名。
`spark.auth.password` | Spark 数据源的密码。
`spark.datasource.flint.host` | Spark 数据源的主机。默认值为 `localhost`。
`spark.datasource.flint.port` | Spark 的端口号。默认值为 `9200`。
`spark.datasource.flint.scheme` | Spark 查询中使用的数据协议。有效值为 `http` 和 `https`。
`spark.datasource.flint.auth` | 访问 Spark 数据源所需的授权方式。有效值为 `false` 和 `sigv4`。
`spark.datasource.flint.region` | OpenSearch 集群所在的 AWS 区域。仅在 `auth` 设置为 `sigv4` 时使用。默认值为 `us-west-2``。
`spark.datasource.flint.write.id_name` | Spark 连接器写入的索引名称。
`spark.datasource.flint.ignore.id_column` | 在查询中导出数据时排除 `id` 列。默认值为 `true`。
`spark.datasource.flint.write.batch_size` | 设置写入 Spark 连接的索引时的批处理大小。默认值为 `1000`。
`spark.datasource.flint.write.refresh_policy` | 设置连接器向 OpenSearch 写入数据失败时 Spark 连接的刷新策略。可以是不刷新（`false`）、立即刷新（`true`），或者设置一个等待时间 `wait_for: X`。默认值为 `false`。
`spark.datasource.flint.read.scroll_size` | 设置使用 Spark 运行的查询返回的结果数量。默认值为 `100`。
`spark.flint.optimizer.enabled` | 使 OpenSearch 针对 Spark 连接进行优化。默认值为 `true`。
`spark.flint.index.hybridscan.enabled` | 使 OpenSearch 能够从数据源中扫描非分区设备上的写入数据。默认值为 `false`。

配置完成后，可以使用以下 API 调用测试 Spark 连接：

```json
POST /_plugins/_ppl
content-type: application/json

{
   "query": "source = my_spark.sql('select * from alb_logs')"
}
```
