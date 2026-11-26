---
title: 安装 OpenSearch
---

# 安装 OpenSearch

本节详细介绍如何在主机上安装 OpenSearch，包括哪些操作系统[与 OpenSearch 兼容](#operating-system-compatibility)、需要[开放哪些端口](#network-requirements)，以及需要在主机上配置哪些[重要设置](#important-settings)。

## 操作系统兼容性

OpenSearch 和 OpenSearch Dashboards 兼容使用 [`systemd`](https://en.wikipedia.org/wiki/Systemd) 的 Red Hat Enterprise Linux（RHEL）和基于 Debian 的 Linux 发行版，例如 CentOS、Amazon Linux 2 和 Ubuntu 长期支持版（Long-Term Support，LTS）。虽然 OpenSearch 和 OpenSearch Dashboards 应该可以在大多数 Linux 发行版上运行，但我们只测试了其中一部分。

下表列出了我们当前支持的操作系统版本。

操作系统 | 版本
:---------- | :-------- 
RHEL/CentOS |	7/8
Rocky Linux |	8
Ubuntu | 16.04/18.04/20.04
Windows Server | 2019

## 文件系统建议

在生产环境中，请避免使用网络文件系统作为节点（Node）存储。由于网络状况（例如延迟或吞吐量受限）或读写速度等因素，使用网络文件系统作为节点存储可能会导致集群（Cluster）出现性能问题。应尽可能使用安装在主机上的固态硬盘（SSD）作为节点存储。

## Java 兼容性

适用于 Linux 的 OpenSearch 发行版在 `jdk` 目录中附带了兼容的 [Adoptium JDK](https://adoptium.net/) 版 Java。要查看 JDK 版本，请运行 `./jdk/bin/java -version`。例如，OpenSearch 1.0.0 tarball 附带 Java 15.0.1+9（非 LTS），OpenSearch 1.3.0 附带 Java 11.0.14.1+1（LTS），OpenSearch 2.0.0 附带 Java 17.0.2+8（LTS）。OpenSearch 已在所有兼容的 Java 版本上经过测试。

OpenSearch 版本 | 兼容的 Java 版本 | 内置的 Java 版本
:---------- | :-------- | :-----------
1.0--1.2.x    | 11, 15     | 15.0.1+9
1.3.x          | 8, 11, 14  | 11.0.22+7
2.0.0--2.11.x    | 11, 17     | 17.0.2+8
2.12.0         | 11, 17, 21 | 21.0.2+13

要使用其他 Java 安装，请将 `OPENSEARCH_JAVA_HOME` 或 `JAVA_HOME` 环境变量设置为 Java 的安装位置。例如：
```bash
export OPENSEARCH_JAVA_HOME=/path/to/opensearch-2.12.0/jdk
```

## 网络要求

需要为 OpenSearch 组件开放以下端口。

端口号 | OpenSearch 组件
:--- | :--- 
443 | 启用传输中加密（TLS）的 AWS OpenSearch Service 中的 OpenSearch Dashboards
5601 | OpenSearch Dashboards
9200 | OpenSearch REST API
9250 | 跨集群搜索
9300 | 节点通信和传输
9600 | Performance Analyzer

## 重要设置

对于生产工作负载，请确保 [Linux 设置](https://www.kernel.org/doc/Documentation/sysctl/vm.txt) `vm.max_map_count` 至少设置为 262144。即使使用 Docker 镜像，也要在*宿主机*上设置该值。要查看当前值，请运行以下命令：

```bash
cat /proc/sys/vm/max_map_count
```

要增大该值，请在 `/etc/sysctl.conf` 中添加以下行：

```
vm.max_map_count=262144
```

然后运行 `sudo sysctl -p` 重新加载。

对于 Windows 工作负载，可以运行以下命令设置 `vm.max_map_count`：

```bash
wsl -d docker-desktop
sysctl -w vm.max_map_count=262144
```

[示例 docker-compose.yml](/install-and-configure/install-opensearch/docker#sample-docker-composeyml) 文件中还包含几项关键设置：

- `bootstrap.memory_lock=true`

  禁用内存交换（与 `memlock` 配合使用）。内存交换会大幅降低性能和稳定性，因此应确保在生产集群上禁用它。

  启用 `bootstrap.memory_lock` 设置会使 JVM 预留其所需的全部内存。[Java SE Hotspot VM 垃圾回收调优指南](https://docs.oracle.com/javase/9/gctuning/other-considerations.htm#JSGCT-GUID-B29C9153-3530-4C15-9154-E74F44E3DAD9)记录了默认 1 GB 的 Class Metadata 本机内存预留。再加上 Java 堆，在内存低于这些要求的虚拟机上，可能会因本机内存不足而出错。为防止出错，请使用 `-XX:CompressedClassSpaceSize` 或 `-XX:MaxMetaspaceSize` 限制预留内存的大小，并设置 Java 堆的大小，以确保有足够的系统内存。

- `OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m`

  设置 Java 堆的大小（我们建议设置为系统内存的一半）。

- `nofile 65536`

  将 OpenSearch 用户可打开的文件数上限设置为 65536。

- `port 9600`

  允许你通过 9600 端口访问 Performance Analyzer。

::: info 注意
不要在多个位置声明相同的 JVM 选项，否则可能导致意外行为或 OpenSearch 服务无法启动。如果使用环境变量声明 JVM 选项（例如 `OPENSEARCH_JAVA_OPTS=-Xms3g -Xmx3g`），则应注释掉 `config/jvm.options` 中对该 JVM 选项的所有引用。反之，如果在 `config/jvm.options` 中定义了 JVM 选项，则不应再使用环境变量定义这些 JVM 选项。
:::

## 重要系统属性

OpenSearch 提供了许多系统属性（如下表所示），你可以使用 `-D` 命令行参数形式在 `config/jvm.options` 或 `OPENSEARCH_JAVA_OPTS` 中指定这些属性。

属性 | 描述
:---------- | :-------- 
`opensearch.xcontent.string.length.max=<value>` | 默认情况下，OpenSearch 不限制 JSON/YAML/CBOR/Smile 字符串字段（Field）的最大长度。为了保护集群免受潜在的分布式拒绝服务（DDoS）攻击或内存问题的影响，你可以将 `opensearch.xcontent.string.length.max` 系统属性设置为合理的上限（最大值为 2,147,483,647），例如 `-Dopensearch.xcontent.string.length.max=5000000`。  | 
`opensearch.xcontent.fast_double_writer=[true|false]` | 默认情况下，OpenSearch 使用 Java 运行时环境提供的默认实现序列化浮点数。将此值设置为 `true` 可使用 Schubfach 算法，该算法速度更快，但可能导致精度上的细微差异。默认值为 `false`。 |
`opensearch.xcontent.name.length.max=<value>` | 默认情况下，OpenSearch 不限制 JSON/YAML/CBOR/Smile 字段名的最大长度。为了保护集群免受潜在的 DDoS 攻击或内存问题的影响，你可以将 `opensearch.xcontent.name.length.max` 系统属性设置为合理的上限（最大值为 2,147,483,647），例如 `-Dopensearch.xcontent.name.length.max=50000`。 |
`opensearch.xcontent.depth.max=<value>` | 默认情况下，OpenSearch 不限制 JSON/YAML/CBOR/Smile 文档（Document）的最大嵌套深度。为了保护集群免受潜在的 DDoS 攻击或内存问题的影响，你可以将 `opensearch.xcontent.depth.max` 系统属性设置为合理的上限（最大值为 2,147,483,647），例如 `-Dopensearch.xcontent.name.length.max=1000`。 |
`opensearch.xcontent.codepoint.max=<value>` | 默认情况下，OpenSearch 将 YAML 文档的最大大小（以码位计）限制为 `52428800`。为了保护集群免受潜在的 DDoS 攻击或内存问题的影响，你可以将 `opensearch.xcontent.codepoint.max` 系统属性更改为合理的上限（最大值为 2,147,483,647）。例如 `-Dopensearch.xcontent.codepoint.max=5000000`。 |
