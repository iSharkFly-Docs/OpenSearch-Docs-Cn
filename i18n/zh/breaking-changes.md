---
title: 破坏性变更
---

## 1.x {#x}

### 迁移到 OpenSearch 以及嵌套 JSON 对象数量的限制

如果集群中存在任何文档在所有字段中包含超过 10,000 个嵌套 JSON 对象，那么从 Elasticsearch OSS 6.8 版本迁移到 OpenSearch 1.x 版本将会失败。Elasticsearch 7.0 版本引入了 `index.mapping.nested_objects.limit` 设置以防止内存溢出错误，并将该设置的默认值设为 `10000`。OpenSearch 从一开始就采用了此设置，并强制执行嵌套 JSON 对象的限制。然而，由于 Elasticsearch 6.8 中不存在该设置，该版本也无法识别它，因此当任何文档中的嵌套 JSON 对象数量超过默认限制时，迁移到 OpenSearch 1.x 可能会导致不兼容问题，从而阻止分片在 Elasticsearch 6.8 和 OpenSearch 1.x 版本之间重新分配。

因此，我们建议在尝试从 Elasticsearch 6.8 迁移之前，先评估你的数据是否超出这些限制。

## 2.0.0 {#section}

### 移除映射类型参数

`type` 参数已从所有 OpenSearch API 端点中移除。取而代之的是，可以按文档类型对索引进行分类。有关更多详细信息，请参阅 issue [#1940](https://github.com/opensearch-project/opensearch/issues/1940)。

### 弃用非包容性术语

非包容性术语在 2.x 版本中已被弃用，并将在 OpenSearch 3.0 中被永久移除。我们使用以下替代术语：

- "Whitelist" 现在改为 "Allow list"
- "Blacklist" 现在改为 "Deny list"
- "Master" 现在改为 "Cluster Manager"

### 添加 OpenSearch Notifications 插件

在 OpenSearch 2.0 中，Alerting 插件现已与新的 Notifications 插件集成。如果你想继续使用 Alerting 插件中的通知操作，请安装新的后端插件 `notifications-core` 和 `notifications`。如果你想在 OpenSearch Dashboards 中管理通知，请使用新的 `notificationsDashboards` 插件。有关更多信息，请参阅 OpenSearch 文档页面上的[通知](/observing-your-data/notifications/)。

### 不再支持 JDK 8

由于 Lucene 升级，OpenSearch 不得不放弃对 JDK 8 的支持。因此，[Java 高级 REST 客户端](/clients/java-rest-high-level)不再支持 JDK 8。恢复对 JDK 8 的支持目前是 `opensearch-java` 的一项提案 [#156](https://github.com/opensearch-project/opensearch-java/issues/156)，这需要从 Java 客户端中移除对 OpenSearch 核心的依赖（issue [#262](https://github.com/opensearch-project/opensearch-java/issues/262)）。

## 2.5.0 {#section-1}

### 文本字段的通配符查询行为

OpenSearch 2.5 包含一项缺陷修复，纠正了文本字段上 `wildcard` 查询的 `case_insensitive` 参数的行为。因此，在此修复之前忽略大小写并错误返回结果的文本字段通配符查询，将不再返回相同的结果。有关更多信息，请参阅 issue [#8711](https://github.com/opensearch-project/OpenSearch/issues/8711)。
