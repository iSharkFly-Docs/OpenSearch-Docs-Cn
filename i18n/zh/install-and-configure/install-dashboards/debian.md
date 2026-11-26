---
title: Debian
---

# 安装 OpenSearch Dashboards（Debian）

与 [Tarball](/install-and-configure/install-dashboards/tar) 方式相比，使用高级包管理工具（Advanced Packaging Tool，APT）安装 OpenSearch Dashboards 会大大简化安装过程。例如，包管理器会处理多项技术细节，如安装路径、配置文件位置，以及创建由 `systemd` 管理的服务。

::: warning 重要
在安装 OpenSearch Dashboards 之前，你必须先配置一个 OpenSearch 集群（Cluster）。具体步骤请参阅 OpenSearch 的 [Debian](/install-and-configure/install-opensearch/debian) 安装指南。
:::

::: info 注意
本指南假定你熟悉 Linux 命令行界面（CLI）的使用。你应当了解如何输入命令、在目录之间切换以及编辑文本文件。部分示例命令使用 `vi` 文本编辑器，但你可以使用任何可用的文本编辑器。
:::

## 从安装包安装 OpenSearch Dashboards

1. 直接从 [OpenSearch 下载页面](https://opensearch.org/downloads.html)下载所需版本的 Debian 包。Debian 包提供 **x64** 和 **arm64** 两种架构的版本。
1. 在 CLI 中使用 `dpkg` 安装。
   ```bash
   # x64
   sudo dpkg -i opensearch-dashboards-2.12.0-linux-x64.deb
   # arm64
   sudo dpkg -i opensearch-dashboards-2.12.0-linux-arm64.deb
   ```
1. 安装完成后，重新加载 systemd 管理器配置。
    ```bash
    sudo systemctl daemon-reload
    ```
1. 将 OpenSearch 启用为服务。
    ```bash
    sudo systemctl enable opensearch-dashboards
    ```
1. 启动 OpenSearch 服务。
    ```bash
    sudo systemctl start opensearch-dashboards
    ```
1. 验证 OpenSearch 是否正确启动。
    ```bash
    sudo systemctl status opensearch-dashboards
    ```

### 指纹验证

Debian 包未签名。如果你希望验证指纹，OpenSearch 项目除了 `.deb` 包之外还提供了 `.sig` 文件，可配合 GNU Privacy Guard（GPG）使用。

1. 下载所需的 Debian 包。
   ```bash
   curl -SLO https://artifacts.opensearch.org/releases/bundle/opensearch-dashboards/2.12.0/opensearch-dashboards-2.12.0-linux-x64.deb
   ```
1. 下载对应的签名文件。
   ```bash
   curl -SLO https://artifacts.opensearch.org/releases/bundle/opensearch-dashboards/2.12.0/opensearch-dashboards-2.12.0-linux-x64.deb.sig
   ```
1. 下载并导入 GPG 密钥。
   ```bash
   curl -o- https://artifacts.opensearch.org/publickeys/opensearch.pgp | gpg --import -
   ```
1. 验证签名。
   ```bash
   gpg --verify opensearch-dashboards-2.12.0-linux-x64.deb.sig opensearch-dashboards-2.12.0-linux-x64.deb
   ```

## 从 APT 仓库安装 OpenSearch Dashboards

APT 是基于 Debian 的操作系统的主要包管理工具，可以从 APT 仓库下载并安装 Debian 包。

1. 安装必要的软件包。
   ```bash
   sudo apt-get update && sudo apt-get -y install lsb-release ca-certificates curl gnupg2
   ```
1. 导入公共 GPG 密钥。该密钥用于验证 APT 仓库已签名。
    ```bash
    curl -o- https://artifacts.opensearch.org/publickeys/opensearch.pgp | sudo gpg --dearmor --batch --yes -o /usr/share/keyrings/opensearch-keyring
    ```
1. 为 OpenSearch 创建 APT 仓库。
   ```bash
   echo "deb [signed-by=/usr/share/keyrings/opensearch-keyring] https://artifacts.opensearch.org/releases/bundle/opensearch-dashboards/2.x/apt stable main" | sudo tee /etc/apt/sources.list.d/opensearch-dashboards-2.x.list
   ```
1. 验证仓库是否创建成功。
    ```bash
    sudo apt-get update
    ```
1. 添加仓库信息后，列出 OpenSearch 的所有可用版本：
   ```bash
   sudo apt list -a opensearch-dashboards
   ```
1. 选择要安装的 OpenSearch 版本：
   - 除非另行指定，否则会安装 OpenSearch 的最新可用版本。
   ```bash
   sudo apt-get install opensearch-dashboards
   ```
   - 要安装特定版本的 OpenSearch Dashboards，请在包名后传入版本号。
   ```bash
   # 使用 opensearch=<version> 手动指定版本
   sudo apt-get install opensearch-dashboards=2.12.0
   ```
1. 完成后，启用 OpenSearch。
    ```bash
    sudo systemctl enable opensearch-dashboards
    ```
1. 启动 OpenSearch。
    ```bash
    sudo systemctl start opensearch-dashboards
    ```
1. 验证 OpenSearch 是否正确启动。
    ```bash
    sudo systemctl status opensearch-dashboards
    ```

## 探索 OpenSearch Dashboards

默认情况下，与 OpenSearch 一样，OpenSearch Dashboards 在初次安装时会绑定到 `localhost`。因此，除非更新配置，否则无法从远程主机访问 OpenSearch Dashboards。

1. 打开 `opensearch_dashboards.yml`。
    ```bash
    sudo vi /etc/opensearch-dashboards/opensearch_dashboards.yml
    ```
1. 指定 OpenSearch Dashboards 应绑定的网络接口。
    ```bash
    # 使用 0.0.0.0 绑定到任意可用接口。
    server.host: 0.0.0.0
    ```
1. 保存并退出。
1. 重启 OpenSearch Dashboards 以应用配置更改。
    ```bash
    sudo systemctl restart opensearch-dashboards
    ```
1. 在 Web 浏览器中访问 OpenSearch Dashboards。默认端口为 5601。
1. 使用默认用户名 `admin` 和默认密码 `admin` 登录。（对于 OpenSearch 2.12 及更高版本，密码应为自定义的 admin 密码）
1. 访问 [OpenSearch Dashboards 入门](/dashboards/)以了解更多信息。
