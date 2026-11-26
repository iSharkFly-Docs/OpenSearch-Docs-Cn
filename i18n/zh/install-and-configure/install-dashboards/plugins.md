---
title: 管理 OpenSearch Dashboards 插件
---

# 管理 OpenSearch Dashboards 插件

OpenSearch Dashboards 提供了一个名为 `opensearch-dashboards-plugin` 的命令行工具，用于管理插件（plugin）。使用该工具，你可以：

- 列出已安装的插件。
- 安装插件。
- 删除已安装的插件。

## 插件兼容性

::: danger 警告
插件的主版本号、次版本号和补丁版本号必须与 OpenSearch 的主版本号、次版本号和补丁版本号一致，才能兼容。例如，2.3.0.x 版本的插件只能与 OpenSearch 2.3.0 配合使用。
:::

## 前提条件

- 一个兼容的 OpenSearch 集群（Cluster）
- [已在该集群上安装](/install-and-configure/plugins)对应的 OpenSearch 插件
- 对应版本的 [OpenSearch Dashboards](/)（例如，OpenSearch Dashboards 2.3.0 与 OpenSearch 2.3.0 配合使用）

## 可用插件

下表列出了可用的 OpenSearch Dashboards 插件。

| 插件名称 | 仓库 | 最早可用版本 |
| :--- | :--- | :--- |
| Alerting Dashboards | [alerting-dashboards-plugin](https://github.com/opensearch-project/alerting-dashboards-plugin) | 1.0.0 |
| Anomaly Detection Dashboards | [anomaly-detection-dashboards-plugin](https://github.com/opensearch-project/anomaly-detection-dashboards-plugin) | 1.0.0 |
| Custom Import Maps Dashboards | [dashboards-maps](https://github.com/opensearch-project/dashboards-maps) | 2.2.0 |
| Search Relevance Dashboards | [dashboards-search-relevance](https://github.com/opensearch-project/dashboards-search-relevance) | 2.4.0 |
| Gantt Chart Dashboards | [gantt-chart](https://github.com/opensearch-project/dashboards-visualizations) | 1.0.0 |
| Index Management Dashboards | [index-management-dashboards-plugin](https://github.com/opensearch-project/index-management-dashboards-plugin) | 1.0.0 |
| Notebooks Dashboards | [dashboards-notebooks](https://github.com/opensearch-project/dashboards-notebooks) | 1.0.0 |
| Notifications Dashboards | [dashboards-notifications](https://github.com/opensearch-project/dashboards-notifications) | 2.0.0 |
| Observability Dashboards | [dashboards-observability](https://github.com/opensearch-project/dashboards-observability) | 2.0.0 |
| Query Workbench Dashboards | [query-workbench](https://github.com/opensearch-project/dashboards-query-workbench) | 1.0.0 |
| Reports Dashboards | [dashboards-reporting](https://github.com/opensearch-project/dashboards-reporting) | 1.0.0 |
| Security Analytics Dashboards | [security-analytics-dashboards-plugin](https://github.com/opensearch-project/security-analytics-dashboards-plugin)| 2.4.0 |
| Security Dashboards | [security-dashboards-plugin](https://github.com/opensearch-project/security-dashboards-plugin) | 1.0.0 |

## 安装

进入 OpenSearch Dashboards 主目录（例如 `/usr/share/opensearch-dashboards`），然后为每个插件运行安装命令。

## 查看已安装插件列表

要在命令行中查看已安装插件列表，请使用以下命令：

```bash
sudo bin/opensearch-dashboards-plugin list
```

## 删除插件

要删除插件：

```bash
sudo bin/opensearch-dashboards-plugin remove <plugin-name>
```

然后从 `opensearch_dashboards.yml` 中删除所有相关条目。

对于某些插件，你还必须删除「optimize」bundle。以下是 Anomaly Detection 插件的示例命令：

```bash
sudo rm /usr/share/opensearch-dashboards/optimize/bundles/opensearch-anomaly-detection-opensearch-dashboards.*
```

然后重启 OpenSearch Dashboards。删除任何插件后，OpenSearch Dashboards 会在下次启动时执行一次 optimize 操作。即使在性能很好的机器上，该操作也需要几分钟，请耐心等待。

## 更新插件

OpenSearch Dashboards 不会更新插件。你需要删除旧版本及其 optimize bundle，重新安装，然后重启 OpenSearch Dashboards：

1. 删除旧版本：

   ```bash
   sudo bin/opensearch-dashboards-plugin remove <plugin-name>
   ```

1. 删除 optimize bundle：

   ```bash
   sudo rm /usr/share/opensearch-dashboards/optimize/bundles/<bundle-name>
   ```

1. 重新安装新版本：

   ```bash
   sudo bin/opensearch-dashboards-plugin install <plugin-name>
   ```

1. 重启 OpenSearch Dashboards。

例如，要删除并重新安装 Anomaly Detection 插件：

```bash
sudo bin/opensearch-dashboards-plugin remove anomalyDetectionDashboards
sudo rm /usr/share/opensearch-dashboards/optimize/bundles/opensearch-anomaly-detection-opensearch-dashboards.*
sudo bin/opensearch-dashboards-plugin install <AD OpenSearch Dashboards plugin artifact URL>
```
