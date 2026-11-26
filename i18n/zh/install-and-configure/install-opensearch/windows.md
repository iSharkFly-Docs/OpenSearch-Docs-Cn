---
title: Windows
---

# Windows

以下各节介绍如何通过 zip 压缩包在 Windows 上安装 OpenSearch。

一般来说，通过 zip 压缩包安装 OpenSearch 可以分为以下几个步骤：

1. **下载并解压 OpenSearch。**
1. **（可选）测试 OpenSearch。**
   - 在应用任何自定义配置之前，确认 OpenSearch 能够运行。
   - 可以在不启用任何安全功能（无密码、无证书）的情况下进行测试，也可以使用随附脚本应用的演示安全配置进行测试。
1. **针对你的环境配置 OpenSearch。**
   -  为 OpenSearch 应用基本设置，并开始在你的环境中使用它。

Windows 版 OpenSearch 压缩包是一个自包含的目录，其中包含运行 OpenSearch 所需的一切，包括集成的 Java 开发工具包（JDK）。如果你有自己的 Java 安装并设置了 `JAVA_HOME` 环境变量，那么在未设置 `OPENSEARCH_JAVA_HOME` 环境变量时，OpenSearch 会使用该 Java 安装。要了解如何设置 `OPENSEARCH_JAVA_HOME` 环境变量，请参阅[第 3 步：在你的环境中设置 OpenSearch](#step-3-set-up-opensearch-in-your-environment)。

## 前提条件

确保已安装 zip 解压工具。

## 第 1 步：下载并解压 OpenSearch

按照以下步骤在 Windows 上安装 OpenSearch。

1. 下载 [`opensearch-2.12.0-windows-x64.zip`](https://artifacts.opensearch.org/releases/bundle/opensearch/2.12.0/opensearch-2.12.0-windows-x64.zip) 压缩包。
1. 要解压压缩包内容，请右键单击并选择 **Extract All**（全部解压缩）。

## 第 2 步：（可选）测试 OpenSearch

在进行任何配置之前，你应该先测试 OpenSearch 的安装。否则，以后出现问题时，很难判断问题是由安装引起的，还是由安装后应用的自定义设置引起的。在这一阶段，有两种快速测试 OpenSearch 的方法：

1. **（启用安全功能）** 使用 Windows 压缩包中附带的批处理脚本应用通用配置。
1. **（禁用安全功能）** 手动禁用 Security 插件（plugin），在应用自定义安全设置之前测试实例。

批处理脚本会为你的 OpenSearch 实例应用通用配置。该配置定义了一些环境变量，并应用自签名 TLS 证书。你也可以选择自行配置这些内容。

如果你只想验证服务是否已正确配置，并打算自行配置安全设置，那么可以禁用 Security 插件，在不加密、不认证的情况下启动服务。

::: danger 警告
默认配置（使用演示证书以及使用默认密码的用户）下的 OpenSearch 节点（Node）不适合用于生产环境。如果你计划在生产环境中使用该节点，至少应将演示 TLS 证书替换为你自己的 TLS 证书，并[更新内部用户和密码列表](/security/configuration/yaml)。有关确保节点按照安全要求进行配置的更多指导，请参阅[安全配置](/security/configuration/)。
:::

### 选项 1：在启用安全功能的情况下测试 OpenSearch 设置

1. 从命令提示符或 Powershell 运行演示批处理脚本。

      1. 在任务栏 **Start**（开始）旁的搜索框中输入 `cmd` 打开命令提示符，或输入 `powershell` 打开 Powershell。
      1. 切换到 OpenSearch 安装的顶层目录。
         ```bat
         cd \path\to\opensearch-2.12.0
         ```

      1. 运行批处理脚本。
         对于 OpenSearch 2.12 或更高版本，使用以下命令指定自定义 admin 密码：
         ```bat
         > set OPENSEARCH_INITIAL_ADMIN_PASSWORD=<custom-admin-password>
         ```
         ```bat
         .\opensearch-windows-install.bat
         ```

1. 打开一个新的命令提示符窗口，向服务器发送请求以验证 OpenSearch 是否正在运行。注意这里使用了 `--insecure` 标志，因为 TLS 证书是自签名的，所以必须使用该标志。
   - 向 9200 端口发送请求：
      ```bat
      curl.exe -X GET https://localhost:9200 -u "admin:<custom-admin-password>" --insecure
      ```

      你应该会收到类似如下的响应：
      ```bat
      {
         "name" : "hostname-here",
         "cluster_name" : "opensearch",
         "cluster_uuid" : "7Nqtr0LrQTOveFcBb7Kufw",
         "version" : {
            "distribution" : "opensearch",
            "number" : <version>,
            "build_type" : <build-type>,
            "build_hash" : <build-hash>,
            "build_date" : <build-date>,
            "build_snapshot" : false,
            "lucene_version" : <lucene-version>,
            "minimum_wire_compatibility_version" : "7.10.0",
            "minimum_index_compatibility_version" : "7.0.0"
         },
         "tagline" : "The OpenSearch Project: https://opensearch.org/"
      }
      ```
   - 查询插件端点：
      ```bat
      curl.exe -X GET https://localhost:9200/_cat/plugins?v -u "admin:<custom-admin-password>" --insecure
      ```

      响应应类似如下：
      ```bat
      hostname opensearch-alerting                  2.12.0
      hostname opensearch-anomaly-detection         2.12.0
      hostname opensearch-asynchronous-search       2.12.0
      hostname opensearch-cross-cluster-replication 2.12.0
      hostname opensearch-geospatial                2.12.0
      hostname opensearch-index-management          2.12.0
      hostname opensearch-job-scheduler             2.12.0
      hostname opensearch-knn                       2.12.0
      hostname opensearch-ml                        2.12.0
      hostname opensearch-neural-search             2.12.0
      hostname opensearch-notifications             2.12.0
      hostname opensearch-notifications-core        2.12.0
      hostname opensearch-observability             2.12.0
      hostname opensearch-reports-scheduler         2.12.0
      hostname opensearch-security                  2.12.0
      hostname opensearch-security-analytics        2.12.0
      hostname opensearch-sql                       2.12.0
      ```

### 选项 2：在禁用安全功能的情况下测试 OpenSearch 设置

1. 打开 `opensearch-2.12.0\config` 文件夹。
1. 使用文本编辑器打开 `opensearch.yml` 文件。
1. 添加以下行以禁用 Security 插件：
   ```yaml
   plugins.security.disabled: true
   ```

1. 保存更改并关闭文件。
1. 进入 OpenSearch 安装的顶层目录，打开 `opensearch-2.12.0` 文件夹。
1. 双击 `opensearch-windows-install.bat` 文件以默认方式运行。这会打开一个命令提示符窗口，其中运行着一个 OpenSearch 实例。
1. 打开一个新的命令提示符窗口，向服务器发送请求以验证 OpenSearch 是否正在运行。由于 Security 插件已被禁用，你将使用 `HTTP` 而不是 `HTTPS` 发送命令。
   - 向 9200 端口发送请求：
      ```bat
      curl.exe -X GET http://localhost:9200
      ```

      你应该会收到类似如下的响应：
      ```bat
      {
         "name" : "hostname-here",
         "cluster_name" : "opensearch",
         "cluster_uuid" : "7Nqtr0LrQTOveFcBb7Kufw",
         "version" : {
            "distribution" : "opensearch",
            "number" : "2.4.0",
            "build_type" : "zip",
            "build_hash" : "77ef9e304dd6ee95a600720a387a9735bbcf7bc9",
            "build_date" : "2022-11-05T05:50:15.404072800Z",
            "build_snapshot" : false,
            "lucene_version" : "9.4.1",
            "minimum_wire_compatibility_version" : "7.10.0",
            "minimum_index_compatibility_version" : "7.0.0"
         },
         "tagline" : "The OpenSearch Project: https://opensearch.org/"
      }
      ```
   - 查询插件端点：
      ```bat
      curl.exe -X GET http://localhost:9200/_cat/plugins?v
      ```

      响应应类似如下：
      ```bat
      hostname opensearch-alerting                  2.12.0
      hostname opensearch-anomaly-detection         2.12.0
      hostname opensearch-asynchronous-search       2.12.0
      hostname opensearch-cross-cluster-replication 2.12.0
      hostname opensearch-geospatial                2.12.0
      hostname opensearch-index-management          2.12.0
      hostname opensearch-job-scheduler             2.12.0
      hostname opensearch-knn                       2.12.0
      hostname opensearch-ml                        2.12.0
      hostname opensearch-neural-search             2.12.0
      hostname opensearch-notifications             2.12.0
      hostname opensearch-notifications-core        2.12.0
      hostname opensearch-observability             2.12.0
      hostname opensearch-reports-scheduler         2.12.0
      hostname opensearch-security                  2.12.0
      hostname opensearch-security-analytics        2.12.0
      hostname opensearch-sql                       2.12.0
      ```

::: tip 提示
要停止 OpenSearch，请在命令提示符或 Powershell 中按 `Ctrl+C`，或者直接关闭命令提示符或 Powershell 窗口。
:::

## 第 3 步：在你的环境中设置 OpenSearch

没有 OpenSearch 使用经验的用户可能需要一份推荐设置列表来开始使用该服务。默认情况下，OpenSearch 不绑定到任何网络接口，外部主机无法访问。此外，安全设置要么未定义（全新安装），要么在你通过调用 <span style="white-space: nowrap">`opensearch-windows-install.bat` 运行了安全演示脚本后，</span>被填充为默认用户名和密码。以下建议可帮助用户将 OpenSearch 绑定到网络接口。

以下推荐设置可以让你：

- 将 OpenSearch 绑定到主机上的某个 IP 或网络接口。
- 设置 JVM 堆的初始大小和最大大小。
- 定义一个指向内置 JDK 的环境变量。

::: info 注意
如果你运行过安全演示脚本，则需要手动重新配置被修改过的设置。在继续之前，请参阅[安全配置](/install-and-configure/configuring-opensearch/)获取指导。
:::

::: tip 提示
在修改任何配置文件之前，最好先保存一份备份。备份文件可用于恢复因错误配置导致的问题。
:::

1. 打开 `opensearch-2.12.0\config` 文件夹。
1. 使用文本编辑器打开 `opensearch.yml` 文件。
1. 添加以下行：
   ```bash
   # 将 OpenSearch 绑定到正确的网络接口。使用 0.0.0.0
   # 包含所有可用接口，或指定分配给
   # 特定接口的 IP 地址。
   network.host: 0.0.0.0

   # 除非你已经配置了集群，否则应将
   # discovery.type 设置为 single-node，否则启动服务时
   # 引导检查将会失败。
   discovery.type: single-node

   # 如果你之前在 opensearch.yml 中禁用了 Security 插件，
   # 请务必重新启用它。否则可以跳过此设置。
   plugins.security.disabled: false
   ```

1. 保存更改并关闭文件。
1. 指定 JVM 堆的初始大小和最大大小。
   1.  打开 `opensearch-2.12.0\config` 文件夹。
   1.  使用文本编辑器打开 `jvm.options` 文件。
   1. 修改堆的初始大小和最大大小的值。作为起点，应将这些值设置为可用系统内存的一半。对于专用主机，可以根据工作负载需求增大该值。<br>
    例如，如果宿主机有 8 GB 内存，则可以将堆的初始大小和最大大小设置为 4 GB：
    ```bash
    -Xms4g
    -Xmx4g
    ```

   1. 保存更改并关闭文件。
1. 指定内置 JDK 的位置。
    1. 在任务栏 **Start**（开始）旁的搜索框中输入 `edit environment variables for your account` 或 `edit the system environment variables`。编辑系统环境变量需要管理员权限。用户环境变量优先于系统环境变量。
    1. 选择 **Edit environment variables for your account**（编辑账户的环境变量）或 **Edit the system environment variables**（编辑系统环境变量）。
    1. 如果打开了 **System Properties**（系统属性）对话框，请在 **Advanced**（高级）选项卡中选择 **Environment Variables**（环境变量）。
    1. 在 **User variables**（用户变量）或 **System variables**（系统变量）下，选择 **New**（新建）。
    1. 在 **Variable name**（变量名）中输入 `OPENSEARCH_JAVA_HOME`。
    1. 在 **Variable value**（变量值）中输入 `\path\to\opensearch-2.12.0\jdk`。
    1. 选择 **OK**（确定）关闭所有对话框。

## 插件兼容性

Performance Analyzer 插件在 Windows 上不可用。所有其他 OpenSearch 插件（包括 k-NN 插件）均可用。有关插件的完整列表，请参阅[可用插件](/install-and-configure/plugins#available-plugins)。

## 相关链接

- [OpenSearch 配置](/install-and-configure/configuring-opensearch/)
- [OpenSearch 插件安装](/install-and-configure/plugins)
- [关于 Security 插件](/security/)
