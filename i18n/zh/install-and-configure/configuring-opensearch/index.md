---
title: 配置 OpenSearch
---

# 配置 OpenSearch

OpenSearch 设置分为两种类型：[动态设置](#dynamic-settings)和[静态设置](#static-settings)。

## 动态设置

动态索引设置是可以随时更新的设置。你可以通过 Cluster Settings API 配置 OpenSearch 的动态设置。有关详细信息，请参阅[使用 API 更新集群设置](#updating-cluster-settings-using-the-api)。

::: tip 提示
尽可能使用 Cluster Settings API：`opensearch.yml` 只作用于各自所在的节点，而 API 会将设置应用于集群中的所有节点。
:::

## 静态设置

某些操作是静态的，需要你修改 `opensearch.yml` [配置文件](#configuration-file)并重启集群。一般来说，这些设置与网络、集群组建和本地文件系统相关。要了解更多信息，请参阅[集群组建](/tuning-your-cluster/)。

## 以环境变量的形式指定设置

启动 OpenSearch 时，你可以使用 `-E` 将环境变量指定为参数：

```bash
./opensearch -Ecluster.name=opensearch-cluster -Enode.name=opensearch-node1 -Ehttp.host=0.0.0.0 -Ediscovery.type=single-node
```

## 使用 API 更新集群设置

更改设置的第一步是发送以下请求，查看当前设置：

```json
GET _cluster/settings?include_defaults=true
```

如需更简洁的非默认设置摘要，请发送以下请求：

```json
GET _cluster/settings
```

Cluster Settings API 中存在三类设置：持久（persistent）设置、临时（transient）设置和默认（default）设置。顾名思义，持久设置在集群重启后仍然保留。重启后，OpenSearch 会清除临时设置。

如果在多个位置指定了同一个设置，OpenSearch 将按以下优先级使用：

1. 临时设置
2. 持久设置
3. `opensearch.yml` 中的设置
4. 默认设置

要更改设置，请使用 [Cluster Settings API](/api-reference/cluster-api/cluster-settings)，并将新值指定为持久或临时设置。以下示例展示了扁平设置格式：

```json
PUT _cluster/settings
{
  "persistent" : {
    "action.auto_create_index" : false
  }
}
```

你也可以使用展开格式，这样可以直接从 GET 响应中复制粘贴并修改现有值：

```json
PUT _cluster/settings
{
  "persistent": {
    "action": {
      "auto_create_index": false
    }
  }
}
```

---

## 配置文件

在每个节点上，你可以在 `/usr/share/opensearch/config/opensearch.yml`（Docker）或 `/etc/opensearch/opensearch.yml`（大多数 Linux 发行版）中找到 `opensearch.yml`。

你可以编辑 `OPENSEARCH_PATH_CONF=/etc/opensearch` 来更改配置目录的位置。该变量来源于 `/etc/default/opensearch`（Debian 软件包）和 `/etc/sysconfig/opensearch`（RPM 软件包）。

如果你设置了自定义的 `OPENSEARCH_PATH_CONF` 变量，请注意其他默认环境变量将不会被加载。

在 `opensearch.yml` 中无需将设置标记为持久或临时，并且设置使用扁平格式：

```yml
cluster.name: my-application
action.auto_create_index: true
compatibility.override_main_response_version: true
```

演示配置中包含许多 [Security 插件设置](/install-and-configure/configuring-opensearch/security-settings)，在将 OpenSearch 用于生产工作负载之前，你应该修改这些设置。要了解更多信息，请参阅[安全](/security/)。

### （可选）CORS 标头配置

如果你正在开发的客户端应用程序要访问位于不同域上的 OpenSearch 集群，可以在 `opensearch.yml` 中配置标头，以便在同一台机器上开发本地应用程序。使用[跨源资源共享（Cross Origin Resource Sharing）](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)，使你的应用程序能够调用本地运行的 OpenSearch API。在 `custom-opensearch.yml` 文件中添加以下行（注意每行的第一个字符必须是 "-"）。
```yml
- http.host:0.0.0.0
- http.port:9200
- http.cors.allow-origin:"http://localhost"
- http.cors.enabled:true
- http.cors.allow-headers:X-Requested-With,X-Auth-Token,Content-Type,Content-Length,Authorization
- http.cors.allow-credentials:true
```
