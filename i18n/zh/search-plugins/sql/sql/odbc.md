---
title: ODBC 驱动程序
---

# ODBC 驱动程序

开放式数据库连接（Open Database Connectivity，ODBC）驱动程序是一个适用于 Windows 和 macOS 的只读 ODBC 驱动程序，可以让 [Microsoft Excel](https://github.com/opensearch-project/sql-odbc/blob/main/docs/user/microsoft_excel_support.md)、[Power BI](https://github.com/opensearch-project/sql-odbc/blob/main/bi-connectors/PowerBIConnector/README.md) 等商业智能（BI）和数据可视化应用程序连接到 SQL 插件。

关于下载和使用该驱动程序的信息，请参阅 [GitHub 上的 SQL 仓库](https://github.com/opensearch-project/sql-odbc)。

## 规格

ODBC 驱动程序与 ODBC 3.51 版本兼容。

## 支持的操作系统版本

支持以下操作系统：

操作系统 | 版本
:--- | :---
Windows | Windows 10, Windows 11
macOS | Catalina 10.15.4, Mojave 10.14.6, Big Sur 11.6.7, Monterey 12.4

## 概念

术语 | 定义
:--- | :---
**DSN** | DSN（数据源名称，Data Source Name）用于在系统中存储驱动程序信息。把这些信息存储在系统中之后，驱动程序每次连接时就不需要再指定它们。
**.tdc** 文件 | TDC 文件包含配置信息，Tableau 会将这些配置应用到与文件中定义的数据库供应商名称和驱动程序名称相匹配的所有连接上。借助此配置，可以对 ODBC 数据连接的某些部分进行微调，并开启或关闭数据源不支持的某些功能。

## 安装驱动程序

要安装驱动程序，请从[这里](https://opensearch.org/downloads.html)下载打包好的安装程序，或者从源代码构建。

### Windows

1. 打开下载的 `OpenSearch SQL ODBC Driver-<version>-Windows.msi` 安装程序。

   该安装程序未经签名，会显示安全对话框。选择 **More info**，然后选择 **Run anyway**。

2. 选择 **Next** 继续安装。

3. 接受协议，然后选择 **Next**。

4. 安装程序附带了文档以及用于连接各种 BI 工具的实用资源文件（例如用于 Tableau 的 `.tdc` 文件）。可以选择保留或删除这些资源。选择 **Next**。

5. 选择 **Install**，然后选择 **Finish**。

默认 DSN 中设置了以下连接信息：

```
Host: localhost
Port: 9200
Auth: NONE
```

要自定义 DSN，请使用 Windows 10 中预装的 **ODBC Data Source Administrator**。

### macOS

在 macOS 上安装 ODBC 驱动程序之前，请先安装 iODBC Driver Manager。

1. 打开下载的 `OpenSearch SQL ODBC Driver-<version>-Darwin.pkg` 安装程序。

   该安装程序未经签名，会显示安全对话框。右键单击安装程序，然后选择 **Open**。

2. 多次选择 **Continue** 继续安装。

3. 选择 **Destination** 指定驱动程序文件的安装位置。

4. 安装程序附带了文档以及用于连接各种 BI 工具的实用资源文件（例如用于 Tableau 的 `.tdc` 文件）。可以选择保留或删除这些资源。选择 **Continue**。

5. 选择 **Install**，然后选择 **Close**。

目前，安装过程不会设置 DSN，需要手动配置。首先，打开 `iODBC Administrator`：

```
sudo /Applications/iODBC/iODBC\ Administrator64.app/Contents/MacOS/iODBC\ Administrator64
```

该命令会授予应用程序保存驱动程序和 DSN 配置的权限。

1. 选择 **ODBC Drivers** 选项卡。
2. 选择 **Add a Driver**，并填写以下信息：
   - **Description of the Driver**：输入用于 ODBC 连接的驱动程序名称（例如 OpenSearch SQL ODBC Driver）。
   - **Driver File Name**：输入驱动程序文件的路径（默认值：`<driver-install-dir>/bin/libopensearchsqlodbc.dylib`）。
   - **Setup File Name**：输入安装文件的路径（默认值：`<driver-install-dir>/bin/libopensearchsqlodbc.dylib`）。

3. 选择用户驱动程序。
4. 选择 **OK** 保存选项。
5. 选择 **User DSN** 选项卡。
6. 选择 **Add**。
7. 选择上面添加的驱动程序。
8. 在 **Data Source Name (DSN)** 中，输入用于存储连接选项的 DSN 名称（例如 OpenSearch SQL ODBC DSN）。
9. 在 **Comment** 中，可以添加一条备注（可选）。
10. 使用 `+` 按钮添加键值对。对于默认的本地 OpenSearch 安装，建议使用以下选项：
   - **Host**：`localhost` - OpenSearch 服务器端点
   - **Port**：`9200` - 服务器端口
   - **Auth**：`NONE` - 身份验证模式
   - **Username**：`(blank)` - 用于 BASIC 身份验证的用户名
   - **Password**：`(blank)`- 用于 BASIC 身份验证的密码
   - **ResponseTimeout**：`10` - 等待服务器响应的秒数
   - **UseSSL**：`0` - 连接时不使用 SSL

11. 选择 **OK** 保存 DSN 配置。
12. 选择 **OK** 退出 iODBC Administrator。

## 自定义 ODBC 驱动程序

驱动程序以库文件的形式提供：Windows 上为 `opensearchsqlodbc.dll`，macOS 上为 `libopensearchsqlodbc.dylib`。

如果与兼容 ODBC 的 BI 工具一起使用，请参阅该 BI 工具的文档来配置新的 ODBC 驱动程序。
通常只需让 BI 工具知道驱动程序库文件的位置，然后用它建立数据库（即 OpenSearch）连接即可。

### 连接字符串和其他设置

ODBC 驱动程序使用 ODBC 连接字符串。
连接字符串是以分号分隔的字符串，用于指定连接时可以使用的一组选项。
通常，连接字符串会采用以下两种方式之一：
  - 指定一个包含预先配置好的选项集的数据源名称（DSN）（`DSN=xxx;User=xxx;Password=xxx;`）。
  - 或者，直接在字符串中显式配置选项（`Host=xxx;Port=xxx;LogLevel=ES_DEBUG;...`）。

可以使用 DSN 或连接字符串配置以下驱动程序选项：

::: info 注意
所有选项名称都不区分大小写。
:::

#### 基本选项

选项 | 描述 | 类型 | 默认值
:--- | :---
`DSN` | 配置连接时使用的数据源名称。 | `string` | -
`Host / Server` | 目标集群的主机名或 IP 地址。 | `string` | -
`Port` | OpenSearch 集群 REST 接口监听的端口号。 | `string` | -

#### 身份验证选项

选项 | 描述 | 类型 | 默认值
:--- | :---
`Auth` | 要使用的身份验证机制。 | `BASIC`（基本 HTTP 身份验证）、`AWS_SIGV4`（AWS 身份验证）或 `NONE` | `NONE`
`User / UID` | [`Auth=BASIC`] 连接使用的用户名。 | `string` | -
`Password / PWD` | [`Auth=BASIC`] 连接使用的密码。 | `string` | -
`Region` | [`Auth=AWS_SIGV4`] 用于签名请求的区域。 | `AWS region (for example, us-west-1)` | -

#### 高级选项

选项 | 描述 | 类型 | 默认值
:--- | :---
`UseSSL` | 是否通过 SSL/TLS 建立连接。 | `boolean (0 or 1)` | `false (0)`
`HostnameVerification` | 指示是否应对 SSL/TLS 连接执行证书主机名验证。 | `boolean`（0 或 1） | `true (1)`
`ResponseTimeout` | 等待主机响应的最长时间，以秒为单位。 | `integer` | `10`

#### 日志选项

选项 | 描述 | 类型 | 默认值
:--- | :---
`LogLevel` | 驱动程序日志的严重级别。 | `LOG_OFF`、`LOG_FATAL`、`LOG_ERROR`、`LOG_INFO`、`LOG_DEBUG`、`LOG_TRACE` 或 `LOG_ALL` | `LOG_WARNING`
`LogOutput` | 驱动程序日志的存储位置。 | `string` | `WIN: C:\`, `MAC: /tmp`

::: info 注意
更改日志选项需要管理员权限。
:::

## 连接 Tableau

前提条件：

- 确保已设置好 DSN。
- 确保 OpenSearch 正在 DSN 中配置的 *host* 和 *port* 上运行。
- 确保在 macOS 和 Windows 上都已将 `.tdc` 复制到 `<user_home_directory>/Documents/My Tableau Repository/Datasources`。

1. 启动 Tableau。在 **Connect** 部分下，转到 **To a Server**，然后选择 **Other Databases (ODBC)**。

2. 在 **DSN drop-down** 中，选择在前面步骤中设置的 OpenSearch DSN。之前添加的选项会自动填入 **Connection Attributes** 中。

3. 选择 **Sign In**。几秒钟后，Tableau 会连接到 OpenSearch 服务器。连接成功后，会跳转到 **Datasource** 窗口。**Database** 中会自动填入 OpenSearch 集群的名称。
要列出所有索引，请单击 **Table** 下方的搜索图标。

4. 将表拖到连接区域，开始试用数据。选择 **Update Now** 或 **Automatically Update** 来填充表数据。

更详细的说明请参阅 [GitHub 仓库](https://github.com/opensearch-project/sql/blob/1.x/sql-odbc/docs/user/tableau_support.md)。

### 故障排除

**问题**

无法连接到服务器。

**解决方法**

这很可能是因为 OpenSearch 服务器没有在 DSN 中配置的 **host** 和 **post** 上运行。
请确认 **host** 和 **post** 正确无误，并且 OpenSearch 服务器正在运行且已安装 OpenSearch SQL 插件。
另外，还要确保随安装程序一起下载的 `.tdc` 已正确复制到 `<user_home_directory>/Documents/My Tableau Repository/Datasources` 目录。

## 连接 Microsoft Power BI

请按照 GitHub 仓库中发布的[安装说明](https://github.com/opensearch-project/sql-odbc/tree/main/bi-connectors/PowerBIConnector/README.md)和[配置说明](https://github.com/opensearch-project/sql-odbc/blob/main/bi-connectors/PowerBIConnector/power_bi_support.md)进行操作。
