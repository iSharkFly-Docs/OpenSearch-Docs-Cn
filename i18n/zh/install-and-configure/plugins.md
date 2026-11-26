---
title: 安装插件
---

# 安装插件

你可以根据需要为 OpenSearch 安装单独的插件（plugin）。有关可用插件的信息，请参阅[可用插件](#available-plugins)。

::: danger 警告
为了让插件与 OpenSearch 正常配合工作，所有插件都必须能够访问集群（Cluster）中的数据，包括有关集群操作的元数据。因此，为了保护集群数据并维护其完整性，首先，在 OpenSearch 集群上安装插件之前，务必了解该插件的功能。其次，在选择自定义插件时，务必确保插件来源可靠。
:::

## 管理插件

OpenSearch 使用名为 `opensearch-plugin` 的命令行工具管理插件。使用该工具，你可以：

- [列出](#list)已安装的插件。
- [安装](#install)插件。
- [删除](#remove)已安装的插件。

传入 `-h` 或 `--help` 可打印帮助文本。根据主机配置，你可能还需要以 `sudo` 权限运行该命令。

::: info 注意
如果你在 Docker 容器中运行 OpenSearch，则必须通过修改 Docker 镜像来安装、删除和配置插件。有关信息，请参阅[使用插件](/install-and-configure/install-opensearch/docker#working-with-plugins)
:::

## 列出插件

使用 `list` 查看已安装的插件列表。

#### 用法
```bash
bin/opensearch-plugin list
```

#### 示例
```bash
$ ./opensearch-plugin list
opensearch-alerting
opensearch-anomaly-detection
opensearch-asynchronous-search
opensearch-cross-cluster-replication
opensearch-geospatial
opensearch-index-management
opensearch-job-scheduler
opensearch-knn
opensearch-ml
opensearch-notifications
opensearch-notifications-core
opensearch-observability
opensearch-performance-analyzer
opensearch-reports-scheduler
opensearch-security
opensearch-sql
```

你也可以使用 [CAT API](/api-reference/cat/cat-plugins) 列出已安装的插件。

#### 路径和 HTTP 方法

```bash
GET _cat/plugins
```

#### 示例响应

```bash
opensearch-node1 opensearch-alerting                  2.0.1.0
opensearch-node1 opensearch-anomaly-detection         2.0.1.0
opensearch-node1 opensearch-asynchronous-search       2.0.1.0
opensearch-node1 opensearch-cross-cluster-replication 2.0.1.0
opensearch-node1 opensearch-index-management          2.0.1.0
opensearch-node1 opensearch-job-scheduler             2.0.1.0
opensearch-node1 opensearch-knn                       2.0.1.0
opensearch-node1 opensearch-ml                        2.0.1.0
opensearch-node1 opensearch-notifications             2.0.1.0
opensearch-node1 opensearch-notifications-core        2.0.1.0
```

## 安装插件

使用 `opensearch-plugin` 安装插件有三种方式：

- [按名称安装插件](#install-a-plugin-by-name)。
- [从 ZIP 文件安装插件](#install-a-plugin-from-a-zip-file)。
- [使用 Maven 坐标安装插件](#install-a-plugin-using-maven-coordinates)。

### 按名称安装插件：

有关可按名称安装的插件列表，请参阅[其他插件](#additional-plugins)。

#### 用法 {#usage-1}
```bash
bin/opensearch-plugin install <plugin-name>
```

#### 示例 {#example-1}
```bash
$ sudo ./opensearch-plugin install analysis-icu
-> Installing analysis-icu
-> Downloading analysis-icu from opensearch
[=================================================] 100%   
-> Installed analysis-icu with folder name analysis-icu
```

### 从 zip 文件安装插件

要安装远程 zip 文件，请将 `<zip-file>` 替换为托管文件的 URL。该工具仅支持通过 HTTP/HTTPS 协议下载。对于本地 zip 文件，请将 `<zip-file>` 替换为 `file:` 加上插件 zip 文件的绝对路径或相对路径，如下面的第二个示例所示。

#### 用法 {#usage-2}
```bash
bin/opensearch-plugin install <zip-file>
```

#### 示例 {#example-2}
```bash
# zip 文件托管在远程服务器上，本例中为 Maven 中央仓库。
$ sudo ./opensearch-plugin install https://repo1.maven.org/maven2/org/opensearch/plugin/opensearch-anomaly-detection/2.2.0.0/opensearch-anomaly-detection-2.2.0.0.zip
-> Installing https://repo1.maven.org/maven2/org/opensearch/plugin/opensearch-anomaly-detection/2.2.0.0/opensearch-anomaly-detection-2.2.0.0.zip
-> Downloading https://repo1.maven.org/maven2/org/opensearch/plugin/opensearch-anomaly-detection/2.2.0.0/opensearch-anomaly-detection-2.2.0.0.zip
[=================================================] 100%   
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@     WARNING: plugin requires additional permissions     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
* java.lang.RuntimePermission accessClassInPackage.sun.misc
* java.lang.RuntimePermission accessDeclaredMembers
* java.lang.RuntimePermission getClassLoader
* java.lang.RuntimePermission setContextClassLoader
* java.lang.reflect.ReflectPermission suppressAccessChecks
* java.net.SocketPermission * connect,resolve
* javax.management.MBeanPermission org.apache.commons.pool2.impl.GenericObjectPool#-[org.apache.commons.pool2:name=pool,type=GenericObjectPool] registerMBean
* javax.management.MBeanPermission org.apache.commons.pool2.impl.GenericObjectPool#-[org.apache.commons.pool2:name=pool,type=GenericObjectPool] unregisterMBean
* javax.management.MBeanServerPermission createMBeanServer
* javax.management.MBeanTrustPermission register
See http://docs.oracle.com/javase/8/docs/technotes/guides/security/permissions.html
for descriptions of what these permissions allow and the associated risks.

Continue with installation? [y/N]y
-> Installed opensearch-anomaly-detection with folder name opensearch-anomaly-detection

# 本地目录中的 zip 文件。
$ sudo ./opensearch-plugin install file:/home/user/opensearch-anomaly-detection-2.2.0.0.zip
-> Installing file:/home/user/opensearch-anomaly-detection-2.2.0.0.zip
-> Downloading file:/home/user/opensearch-anomaly-detection-2.2.0.0.zip
[=================================================] 100%   
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@     WARNING: plugin requires additional permissions     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
* java.lang.RuntimePermission accessClassInPackage.sun.misc
* java.lang.RuntimePermission accessDeclaredMembers
* java.lang.RuntimePermission getClassLoader
* java.lang.RuntimePermission setContextClassLoader
* java.lang.reflect.ReflectPermission suppressAccessChecks
* java.net.SocketPermission * connect,resolve
* javax.management.MBeanPermission org.apache.commons.pool2.impl.GenericObjectPool#-[org.apache.commons.pool2:name=pool,type=GenericObjectPool] registerMBean
* javax.management.MBeanPermission org.apache.commons.pool2.impl.GenericObjectPool#-[org.apache.commons.pool2:name=pool,type=GenericObjectPool] unregisterMBean
* javax.management.MBeanServerPermission createMBeanServer
* javax.management.MBeanTrustPermission register
See http://docs.oracle.com/javase/8/docs/technotes/guides/security/permissions.html
for descriptions of what these permissions allow and the associated risks.

Continue with installation? [y/N]y
-> Installed opensearch-anomaly-detection with folder name opensearch-anomaly-detection
```

### 使用 Maven 坐标安装插件

`opensearch-plugin install` 工具也接受 Maven 坐标，用于安装托管在 [Maven Central](https://search.maven.org/search?q=org.opensearch.plugin) 上的可用制品和版本。`opensearch-plugin` 会解析你提供的 Maven 坐标并构造 URL。因此，主机必须能够直接连接到 [Maven Central](https://search.maven.org/search?q=org.opensearch.plugin)。如果你将坐标传给代理或本地仓库，插件安装将会失败。

#### 用法 {#usage-3}
```bash
bin/opensearch-plugin install <groupId>:<artifactId>:<version>
```

#### 示例 {#example-3}
```bash
$ sudo ./opensearch-plugin install org.opensearch.plugin:opensearch-anomaly-detection:2.2.0.0
-> Installing org.opensearch.plugin:opensearch-anomaly-detection:2.2.0.0
-> Downloading org.opensearch.plugin:opensearch-anomaly-detection:2.2.0.0 from maven central
[=================================================] 100%   
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@     WARNING: plugin requires additional permissions     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
* java.lang.RuntimePermission accessClassInPackage.sun.misc
* java.lang.RuntimePermission accessDeclaredMembers
* java.lang.RuntimePermission getClassLoader
* java.lang.RuntimePermission setContextClassLoader
* java.lang.reflect.ReflectPermission suppressAccessChecks
* java.net.SocketPermission * connect,resolve
* javax.management.MBeanPermission org.apache.commons.pool2.impl.GenericObjectPool#-[org.apache.commons.pool2:name=pool,type=GenericObjectPool] registerMBean
* javax.management.MBeanPermission org.apache.commons.pool2.impl.GenericObjectPool#-[org.apache.commons.pool2:name=pool,type=GenericObjectPool] unregisterMBean
* javax.management.MBeanServerPermission createMBeanServer
* javax.management.MBeanTrustPermission register
See http://docs.oracle.com/javase/8/docs/technotes/guides/security/permissions.html
for descriptions of what these permissions allow and the associated risks.

Continue with installation? [y/N]y
-> Installed opensearch-anomaly-detection with folder name opensearch-anomaly-detection
```

::: info 注意
安装插件后，请重启 OpenSearch 节点（Node）。
:::

### 安装多个插件

可以在一次调用中安装多个插件。

#### 用法 {#usage-4}
```bash
bin/opensearch-plugin install <plugin-name> <plugin-name> ... <plugin-name>
```

#### 示例 {#example-4}
```bash
$ sudo $ ./opensearch-plugin install analysis-nori repository-s3
```

## 删除插件

你可以使用 `remove` 选项删除已安装的插件。

#### 用法 {#usage-5}
```bash
bin/opensearch-plugin remove <plugin-name>
```

#### 示例 {#example-5}
```bash
$ sudo $ ./opensearch-plugin remove opensearch-anomaly-detection
-> removing [opensearch-anomaly-detection]...
```

::: info 注意
删除插件后，请重启 OpenSearch 节点。
:::

## 批处理模式

安装需要默认未包含的额外权限的插件时，插件会提示用户确认所需的权限。要授予所有请求的权限，可以使用批处理模式跳过确认提示。

要在安装插件时强制使用批处理模式，请添加 `-b` 或 `--batch` 选项：
```bash
bin/opensearch-plugin install --batch <plugin-name>
```

## 可用插件

::: danger 警告
插件的主版本号、次版本号和补丁版本号必须与 OpenSearch 的主版本号、次版本号和补丁版本号一致，才能兼容。例如，2.3.0.x 版本的插件只能与 OpenSearch 2.3.0 配合使用。
:::

### 内置插件

除最小发行包外，所有 OpenSearch 发行版都内置了以下插件。

| 插件名称 | 仓库 | 最早可用版本 |
| :--- | :--- | :--- |
| Alerting | [opensearch-alerting](https://github.com/opensearch-project/alerting) | 1.0.0 |
| Anomaly Detection | [opensearch-anomaly-detection](https://github.com/opensearch-project/anomaly-detection) | 1.0.0 |
| Asynchronous Search | [opensearch-asynchronous-search](https://github.com/opensearch-project/asynchronous-search) | 1.0.0 |
| Cross Cluster Replication | [opensearch-cross-cluster-replication](https://github.com/opensearch-project/cross-cluster-replication) | 1.1.0 |
| Custom Codecs | [opensearch-custom-codecs](https://github.com/opensearch-project/custom-codecs) | 2.10.0 |
| Flow Framework | [flow-framework](https://github.com/opensearch-project/flow-framework) | 2.12.0 |
| Notebooks<sup>1</sup> | [opensearch-notebooks](https://github.com/opensearch-project/dashboards-notebooks) | 1.0.0 至 1.1.0 |
| Notifications | [notifications](https://github.com/opensearch-project/notifications) | 2.0.0
| Reports Scheduler | [opensearch-reports-scheduler](https://github.com/opensearch-project/dashboards-reports) | 1.0.0 |
| Geospatial | [opensearch-geospatial](https://github.com/opensearch-project/geospatial) | 2.2.0 |
| Index Management | [opensearch-index-management](https://github.com/opensearch-project/index-management) | 1.0.0 |
| Job Scheduler | [opensearch-job-scheduler](https://github.com/opensearch-project/job-scheduler) | 1.0.0 |
| k-NN | [opensearch-knn](https://github.com/opensearch-project/k-NN) | 1.0.0 |
| ML Commons | [opensearch-ml](https://github.com/opensearch-project/ml-commons) | 1.3.0 |
| Neural Search | [neural-search](https://github.com/opensearch-project/neural-search) | 2.4.0 |
| Observability | [opensearch-observability](https://github.com/opensearch-project/observability) | 1.2.0 |
| Performance Analyzer<sup>2</sup> | [opensearch-performance-analyzer](https://github.com/opensearch-project/performance-analyzer) | 1.0.0 |
| Security | [opensearch-security](https://github.com/opensearch-project/security) | 1.0.0 |
| Security Analytics | [opensearch-security-analytics](https://github.com/opensearch-project/security-analytics) | 2.4.0 |
| SQL | [opensearch-sql](https://github.com/opensearch-project/sql) | 1.0.0 |

*<sup>1</sup>随着 OpenSearch 1.2.0 的发布，Dashboard Notebooks 已合并到 Observability 插件中。*<br>
*<sup>2</sup>Performance Analyzer 在 Windows 上不可用。*

### 其他插件

OpenSearch 社区成员为该服务构建了无数插件。由于许多插件并不在 OpenSearch GitHub 仓库中维护，因此无法列出所有插件的完整列表，但以下插件可以使用 `bin/opensearch-plugin install <plugin-name>` 按名称安装。

| 插件名称 | 最早可用版本 |
| :--- | :--- |
| analysis-icu | 1.0.0 |
| analysis-kuromoji | 1.0.0 |
| analysis-nori | 1.0.0 |
| analysis-phonetic | 1.0.0 |
| analysis-smartcn | 1.0.0 |
| analysis-stempel | 1.0.0 |
| analysis-ukrainian | 1.0.0 |
| discovery-azure-classic | 1.0.0 |
| discovery-ec2 | 1.0.0 |
| discovery-gce | 1.0.0 |
| ingest-attachment | 1.0.0 |
| mapper-annotated-text | 1.0.0 |
| mapper-murmur3 | 1.0.0 |
| mapper-size | 1.0.0 |
| query-insights | 2.12.0 |
| repository-azure | 1.0.0 |
| repository-gcs | 1.0.0 |
| repository-hdfs | 1.0.0 |
| repository-s3 | 1.0.0 |
| store-smb | 1.0.0 |
| transport-nio | 1.0.0 |

## 相关链接

- [关于可观测性（Observability）](/observing-your-data/)
- [关于安全分析](/security-analytics/)
- [关于 Security 插件](/security/)
- [告警（Alerting）](/observing-your-data/alerting/)
- [异常检测](/observing-your-data/ad/)
- [异步搜索](/search-plugins/async/)
- [跨集群复制（Cross-cluster Replication）](/tuning-your-cluster/replication-plugin/)
- [索引状态管理（Index State Management，ISM）](/im-plugin/ism/)
- [k-NN](/search-plugins/knn/)
- [ML Commons 插件](/ml-commons-plugin/)
- [神经搜索（Neural Search）](/search-plugins/neural-search)
- [通知](/observing-your-data/notifications/)
- [OpenSearch Dashboards](/dashboards/)
- [Performance Analyzer](/monitoring-your-cluster/pa/)
- [SQL](/search-plugins/sql/)
