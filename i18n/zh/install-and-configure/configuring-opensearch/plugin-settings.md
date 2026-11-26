---
title: 插件设置
---

# 插件设置

以下设置与 OpenSearch 插件（plugin）相关。

## Alerting 插件设置

有关告警设置的信息，请参阅[告警设置](/observing-your-data/alerting/settings#alerting-settings)。

## Anomaly Detection 插件设置

有关异常检测设置的信息，请参阅[异常检测设置](/observing-your-data/ad/settings)。

## Asynchronous Search 插件设置

有关异步搜索设置的信息，请参阅[异步搜索设置](/search-plugins/async/settings)。

## Cross-Cluster Replication 插件设置

有关跨集群复制设置的信息，请参阅[复制设置](/tuning-your-cluster/replication-plugin/settings)。

## Flow Framework 插件设置

有关自动化工作流设置的信息，请参阅[工作流设置](/automating-configurations/workflow-settings)。

## Geospatial 插件设置

有关 Geospatial 插件的 IP2Geo 处理器设置的信息，请参阅[集群设置](/ingest-pipelines/processors/ip2geo#cluster-settings)。

## Index Management 插件设置

有关索引状态管理（Index State Management，ISM）设置的信息，请参阅 [ISM 设置](/im-plugin/ism/settings)。

### 索引汇总设置

有关索引汇总（rollup）设置的信息，请参阅[索引汇总设置](/im-plugin/index-rollups/settings)。

## Job Scheduler 插件设置

有关 Job Scheduler 插件设置的信息，请参阅 [Job Scheduler 集群设置](/monitoring-your-cluster/job-scheduler/#job-scheduler-cluster-settings)。

## k-NN 插件设置

有关 k-NN 设置的信息，请参阅 [k-NN 设置](/search-plugins/knn/settings)。

## ML Commons 插件设置

有关机器学习设置的信息，请参阅 [ML Commons 集群设置](/ml-commons-plugin/cluster-settings)。

## Neural Search 插件设置

Security Analytics 插件支持以下设置：

- `plugins.neural_search.hybrid_search_disabled`（动态，Boolean）：禁用混合搜索（Hybrid Search）。默认值为 `false`。

## Notifications 插件设置

Notifications 插件支持以下设置。此列表中的所有设置都是动态的：

- `opensearch.notifications.core.allowed_config_types`（List）：Notifications 插件允许的配置类型。使用 `GET /_plugins/_notifications/features` API 获取此设置的值。配置类型包括 `slack`、`chime`、`microsoft_teams`、`webhook`、`email`、`sns`、`ses_account`、`smtp_account` 和 `email_group`。

- `opensearch.notifications.core.email.minimum_header_length`（Integer）：最小电子邮件标头长度。用于验证电子邮件消息的总长度。默认值为 `160`。

- `opensearch.notifications.core.email.size_limit`（Integer）：电子邮件大小限制。用于验证电子邮件消息的总长度。默认值为 `10000000`。

- `opensearch.notifications.core.http.connection_timeout`（Integer）：内部 HTTP 客户端的连接超时时间。该客户端用于基于 webhook 的通知渠道。默认值为 `5000`。

- `opensearch.notifications.core.http.host_deny_list`（List）：被拒绝的主机列表。HTTP 客户端不会向此列表中的 webhook URL 发送通知。

- `opensearch.notifications.core.http.max_connection_per_route`（Integer）：内部 HTTP 客户端每个路由的最大 HTTP 连接数。该客户端用于基于 webhook 的通知渠道。默认值为 `20`。

- `opensearch.notifications.core.http.max_connections`（Integer）：内部 HTTP 客户端的最大 HTTP 连接数。该客户端用于基于 webhook 的通知渠道。默认值为 `60`。

- `opensearch.notifications.core.http.socket_timeout`（Integer）：内部 HTTP 客户端的套接字超时配置。该客户端用于基于 webhook 的通知渠道。默认值为 `50000`。

- `opensearch.notifications.core.tooltip_support`（Boolean）：为 Notifications 插件启用工具提示支持。使用 `GET /_plugins/_notifications/features` API 获取此设置的值。默认值为 `true`。

- `opensearch.notifications.general.filter_by_backend_roles`（Boolean）：启用按后端角色过滤（通知渠道的基于角色的访问控制）。默认值为 `false`。

## Query Insights 插件设置

有关 Query Insights 插件设置的信息，请参阅[查询洞察设置](/observing-your-data/query-insights/#query-insights-settings)。

## Security 插件设置

有关 Security 插件设置的信息，请参阅[安全设置](/install-and-configure/configuring-opensearch/security-settings)。

## Security Analytics 插件设置

有关安全分析设置的信息，请参阅 [Security Analytics 设置](/security-analytics/settings)。

## SQL 插件设置

有关 SQL 和 PPL 相关设置的信息，请参阅 [SQL 设置](/search-plugins/sql/settings)。
