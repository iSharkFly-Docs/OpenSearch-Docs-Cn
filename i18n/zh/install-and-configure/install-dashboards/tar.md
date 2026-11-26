---
title: Tarball
---

# 使用 tarball 运行 OpenSearch Dashboards

1. 从 [OpenSearch 下载页面](https://opensearch.org/downloads.html)下载 tarball。

1. 将 TAR 文件解压到一个目录，并切换到该目录：

   ```bash
   # x64
   tar -zxf opensearch-dashboards-2.12.0-linux-x64.tar.gz
   cd opensearch-dashboards
   # ARM64
   tar -zxf opensearch-dashboards-2.12.0-linux-arm64.tar.gz
   cd opensearch-dashboards
   ```

1. 如有需要，修改 `config/opensearch_dashboards.yml`。

1. 运行 OpenSearch Dashboards：

   ```bash
   ./bin/opensearch-dashboards
   ```
