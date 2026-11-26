---
title: 设置
---

# 异步搜索设置

异步搜索插件在标准 OpenSearch 集群设置的基础上添加了若干设置。这些设置是动态的，因此无需重启集群即可更改插件的默认行为。要了解有关静态和动态设置的更多信息，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。

你可以将这些设置标记为 `persistent` 或 `transient`。

例如，要更新结果索引的保留期限：

```json
PUT _cluster/settings
{
  "transient": {
    "plugins.asynchronous_search.max_wait_for_completion_timeout": "5m"
  }
}
```

设置 | 默认值 | 描述
:--- | :--- | :---
`plugins.asynchronous_search.max_search_running_time` | 12 小时 | 搜索的最长运行时间，超过该时间搜索将被终止。
`plugins.asynchronous_search.node_concurrent_running_searches` | 20 | 每个协调节点上并发运行的搜索数。
`plugins.asynchronous_search.max_keep_alive` | 5 天 | 搜索结果在集群中可以存储的最长时间。
`plugins.asynchronous_search.max_wait_for_completion_timeout` | 1 分钟 | `wait_for_completion_timeout` 参数的最大值。
`plugins.asynchronous_search.persist_search_failures` | false | 将以搜索失败结束的异步搜索结果持久化到系统索引中。
