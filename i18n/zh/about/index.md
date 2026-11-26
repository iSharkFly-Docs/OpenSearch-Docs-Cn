---
title: 入门
---

# OpenSearch 和 OpenSearch Dashboards
<Badge type="tip" text="Version 2.12" />

本部分包含 OpenSearch 和 OpenSearch Dashboards 的文档。

## 入门

- [OpenSearch 简介](/intro)
- [快速入门](/quickstart)
- [安装 OpenSearch](/install-and-configure/install-opensearch/)
- [安装 OpenSearch Dashboards](/install-and-configure/install-dashboards/)
- [查看常见问题](https://opensearch.org/faq)

## 为什么使用 OpenSearch？

借助 OpenSearch，你可以实现以下用例：

<table style="table-layout: auto ; width: 100%;">
<tbody>
<tr style="text-align: center; vertical-align:center;">
<td><img src="/images/1_search.png" class="no-border" alt="Fast, scalable full-text search" height="100"/></td>
<td><img src="/images/2_monitoring.png" class="no-border" alt="Application and infrastructure monitoring" height="100"/></td>
<td><img src="/images/3_security.png" class="no-border" alt="Security and event information management" height="100"/></td>
<td><img src="/images/4_tracking.png" class="no-border" alt="Operational health tracking" height="100"/></td>
</tr>
<tr style="text-align: left; vertical-align:top; font-weight: bold; color: rgb(0,59,92)">
<td>快速、可扩展的全文搜索</td>
<td>应用程序和基础设施监控</td>
<td>安全和事件信息管理</td>
<td>运行健康状况跟踪</td>
</tr>
<tr style="text-align: left; vertical-align:top;">
<td>帮助用户在你的应用程序、网站或数据湖目录中找到所需的信息。</td>
<td>轻松存储和分析日志数据，并针对性能下降设置自动告警。</td>
<td>集中管理日志，实现实时安全监控和取证分析。</td>
<td>使用可观测性日志、指标和追踪实时监控你的应用程序和业务。</td>
</tr>
</tbody>
</table>

**其他功能和插件：**

OpenSearch 提供了多种功能和插件（plugin），帮助你索引、保护、监控和分析数据。大多数 OpenSearch 插件都有对应的 OpenSearch Dashboards 插件，提供方便、统一的用户界面。
- [异常检测](/observing-your-data/ad/) - 识别异常数据并接收自动通知
- [KNN](/search-plugins/knn/) - 在向量数据中查找「最近邻」
- [Performance Analyzer](/monitoring-your-cluster/pa/) - 监控和优化你的集群
- [SQL](/search-plugins/sql/) - 使用 SQL 或管道处理语言查询数据
- [索引状态管理](/im-plugin/) - 自动执行索引操作
- [ML Commons 插件](/ml-commons-plugin/) - 训练和运行机器学习模型
- [异步搜索](/search-plugins/async/) - 在后台运行搜索请求
- [跨集群复制](/tuning-your-cluster/replication-plugin/) - 在多个 OpenSearch 集群之间复制数据

## 安全的前进之路
OpenSearch 自带一套演示配置，便于你快速上手。但在生产环境中使用 OpenSearch 之前，你必须使用自己的证书、身份验证方法、用户和密码[手动配置 Security 插件](/security/configuration/)。

## 在找 Javadoc 吗？

请参阅 [opensearch.org/javadocs/](https://opensearch.org/javadocs/)。

## 参与贡献

[OpenSearch](https://opensearch.org) 由 Amazon Web Services 提供支持。所有组件均在 [GitHub](https://github.com/opensearch-project/) 上以 [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.html) 许可证提供。
本项目欢迎 GitHub issue、缺陷修复、新功能、插件、文档——任何贡献都可以。要参与贡献，请参阅 OpenSearch 网站上的[贡献指南](https://opensearch.org/source.html)。

---

<small>OpenSearch 包含来自 Elasticsearch B.V. 的部分 Apache 许可的 Elasticsearch 代码以及其他源代码。Elasticsearch B.V. 不是这些其他源代码的来源。ELASTICSEARCH 是 Elasticsearch B.V. 的注册商标。</small>
