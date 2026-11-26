---
title: RPM
---

# 使用 RPM 包管理器（RPM）运行 OpenSearch Dashboards

OpenSearch Dashboards 是 OpenSearch 数据的默认可视化工具。它还是许多 OpenSearch 插件（plugin）的用户界面，包括安全、告警（alerting）、索引状态管理（Index State Management，ISM）、SQL 等。

## 从安装包安装 OpenSearch Dashboards

1. 直接从 [OpenSearch 下载页面](https://opensearch.org/downloads.html)下载所需版本的 RPM 包。RPM 包提供 **x64** 和 **arm64** 两种架构的版本。
1. 导入公共 GPG 密钥。该密钥用于验证你的 OpenSearch 实例已签名。
    ```bash
    sudo rpm --import https://artifacts.opensearch.org/publickeys/opensearch.pgp
    ```
1. 在命令行界面（CLI）中，你可以使用 `rpm` 或 `yum` 安装该软件包。
    **x64**
    ```bash
    # 使用 yum 安装 x64 软件包。
    sudo yum install opensearch-dashboards-2.12.0-linux-x64.rpm
    # 使用 rpm 安装 x64 软件包。
    sudo rpm -ivh opensearch-dashboards-2.12.0-linux-x64.rpm
    ```
    **arm64**
    ```bash
    # 使用 yum 安装 arm64 软件包。
    sudo yum install opensearch-dashboards-2.12.0-linux-arm64.rpm
    # 使用 rpm 安装 arm64 软件包。
    sudo rpm -ivh opensearch-dashboards-2.12.0-linux-arm64.rpm
    ```
1. 安装成功后，将 OpenSearch Dashboards 启用为服务。
    ```bash
    sudo systemctl enable opensearch-dashboards
    ```
1. 启动 OpenSearch Dashboards。
    ```bash
    sudo systemctl start opensearch-dashboards
    ```
1. 验证 OpenSearch Dashboards 是否正确启动。
    ```bash
    sudo systemctl status opensearch-dashboards
    ```

## 从本地 YUM 仓库安装 OpenSearch Dashboards

YUM 是基于 Red Hat 的操作系统的主要包管理工具，可以从 YUM 仓库库中下载并安装 RPM 包。

1. 为 OpenSearch Dashboards 创建本地仓库文件：
   ```bash
   sudo curl -SL https://artifacts.opensearch.org/releases/bundle/opensearch-dashboards/2.x/opensearch-dashboards-2.x.repo -o /etc/yum.repos.d/opensearch-dashboards-2.x.repo
   ```
1. 验证仓库是否创建成功。
    ```bash
    sudo yum repolist
    ```
1. 清理 YUM 缓存，以确保顺利安装：
   ```bash
   sudo yum clean all
   ```
1. 下载仓库文件后，列出 OpenSearch Dashboards 的所有可用版本：
   ```bash
   sudo yum list opensearch-dashboards --showduplicates
   ```
1. 选择要安装的 OpenSearch Dashboards 版本：
   - 除非另行指定，否则会安装 OpenSearch 的最高次要版本。
   ```bash
   sudo yum install opensearch-dashboards
   ```
   - 要安装特定版本的 OpenSearch Dashboards：
   ```bash
   sudo yum install 'opensearch-dashboards-2.12.0'
   ```
1. 安装过程中，安装程序会显示 GPG 密钥指纹。请验证其与以下信息一致：
   ```bash
   Fingerprint: c5b7 4989 65ef d1c2 924b a9d5 39d3 1987 9310 d3fc
   ```
    - 如果一致，输入 `yes` 或 `y`，OpenSearch 安装将继续进行。
1. 完成后，即可运行 OpenSearch Dashboards。
    ```bash
    sudo systemctl start opensearch-dashboards
    ```
