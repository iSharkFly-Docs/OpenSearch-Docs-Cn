---
title: 安装 OpenSearch Dashboards
---

# 安装 OpenSearch Dashboards

OpenSearch Dashboards 提供了一个完全集成的解决方案，用于以可视化方式探索、发现和查询可观测性（Observability）数据。你可以通过以下任一方式安装 OpenSearch Dashboards：

- [Docker](/install-and-configure/install-dashboards/docker)
- [Tarball](/install-and-configure/install-dashboards/tar)
- [RPM](/install-and-configure/install-dashboards/rpm)
- [Debian](/install-and-configure/install-dashboards/debian)
- [Helm](/install-and-configure/install-dashboards/helm)
- [Windows](/install-and-configure/install-dashboards/windows)

## 浏览器兼容性

OpenSearch Dashboards 支持以下 Web 浏览器：

- Chrome
- Firefox
- Safari
- Edge (Chromium)

其他基于 Chromium 的浏览器也可能可以使用。**不**支持 Internet Explorer 和 Microsoft Edge Legacy。

## Node.js 兼容性 {#nodejs-compatibility}

OpenSearch Dashboards 需要 Node.js 运行时二进制文件才能运行。[OpenSearch 下载页面](https://opensearch.org/downloads.html)提供的发行包中已包含该文件。

OpenSearch Dashboards 2.8.0 及更高版本可以使用 Node.js 14、16 和 18 版本。OpenSearch Dashboards 2.10.0 及更高版本的发行包包含 Node.js 18 和 14（用于向后兼容）。

要使用发行包自带版本以外的 Node.js 运行时二进制文件，请按照以下步骤操作：

1. 下载并安装 [Node.js](https://nodejs.org/en/download)；兼容的版本为 `>=14.20.1 <19`。
2. 将安装路径设置到 `NODE_HOME` 或 `NODE_OSD_HOME` 环境变量。
   
    - 在 UNIX 上，如果 Node.js 安装在 `/usr/local/nodejs`，且运行时二进制文件为 `/usr/local/nodejs/bin/node`：
    ```bash
    export NODE_HOME=/usr/local/nodejs
   ```

    - 如果 Node.js 是通过 NVM 安装的，且运行时二进制文件为 `/Users/user/.nvm/versions/node/v18.19.0/bin/node`：
   ```bash
   export NODE_HOME=/Users/user/.nvm/versions/node/v18.19.0
   # 或者，如果 NODE_HOME 已用于其他用途：
   export NODE_OSD_HOME=/Users/user/.nvm/versions/node/v18.19.0
   ```

    - 在 Windows 上，如果 Node.js 安装在 `C:\Program Files\nodejs`，且运行时二进制文件为 `C:\Program Files\nodejs\node.exe`：
   ```powershell
   set "NODE_HOME=C:\Program Files\nodejs"
   # 或者使用 PowerShell：
   $Env:NODE_HOME = 'C:\Program Files\nodejs'
   ```

   请查阅操作系统文档，了解如何持久化地修改环境变量。

OpenSearch Dashboards 启动脚本 `bin/opensearch-dashboards` 会先使用 `NODE_OSD_HOME`，
然后使用 `NODE_HOME` 查找 Node.js 运行时二进制文件，找不到时才使用发行包自带的二进制文件。如果找不到可用的 Node.js 运行时二进制文件，启动脚本会尝试在系统级 `PATH` 中查找，仍然找不到则启动失败。

## 配置

要了解如何为 OpenSearch Dashboards 配置 TLS，请参阅[配置 TLS](/install-and-configure/install-dashboards/tls)。
