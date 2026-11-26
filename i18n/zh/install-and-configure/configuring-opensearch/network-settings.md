---
title: 网络设置
---

# 网络设置

OpenSearch 使用 HTTP 设置来配置通过 REST API 与外部客户端的通信，并使用传输（transport）设置来配置 OpenSearch 内部节点之间的通信。

要了解有关静态设置和动态设置的更多信息，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。

OpenSearch 支持以下常用网络设置：

- `network.host`（静态，list）：将 OpenSearch 节点绑定到一个地址。使用 `0.0.0.0` 可包含所有可用的网络接口，也可以指定分配给特定接口的 IP 地址。如果 `network.bind_host` 和 `network.publish_host` 的值相同，`network.host` 设置就是这两者的组合。作为 `network.host` 的替代方案，你可以根据需要分别配置 `network.bind_host` 和 `network.publish_host`。请参阅[高级网络设置](#advanced-network-settings)。

- `http.port`（静态，single value or range）：将 OpenSearch 节点绑定到用于 HTTP 通信的自定义端口或端口范围。你可以指定一个地址或地址范围。默认值为 `9200-9300`。

- `transport.port`（静态，single value or range）：将 OpenSearch 节点绑定到用于节点间通信的自定义端口。你可以指定一个地址或地址范围。默认值为 `9300-9400`。

## 高级网络设置

OpenSearch 支持以下高级网络设置：

- `network.bind_host`（静态，list）：将 OpenSearch 节点绑定到一个或多个地址，用于接收传入连接。默认值为 `network.host` 中的值。

- `network.publish_host`（静态，list）：指定 OpenSearch 节点向集群中其他节点发布的一个或多个地址，以便其他节点可以连接到该节点。

## 高级 HTTP 设置

OpenSearch 支持以下用于 HTTP 通信的高级网络设置：

- `http.host`（静态，list）：设置 OpenSearch 节点用于 HTTP 通信的地址。如果 `http.bind_host` 和 `http.publish_host` 的值相同，`http.host` 设置就是这两者的组合。作为 `http.host` 的替代方案，你可以根据需要分别配置 `http.bind_host` 和 `http.publish_host`。

- `http.bind_host`（静态，list）：指定 OpenSearch 节点绑定以监听传入 HTTP 连接的一个或多个地址。

- `http.publish_host`（静态，list）：指定 OpenSearch 节点向其他节点发布的、用于 HTTP 通信的一个或多个地址。

- `http.compression`（静态，Boolean）：在适用时启用使用 `Accept-Encoding` 的压缩支持。启用 `HTTPS` 时，默认值为 `false`，否则默认值为 `true`。为 HTTPS 禁用压缩有助于降低潜在的安全风险，例如 `BREACH` 攻击。要为 HTTPS 流量启用压缩，请将 `http.compression` 显式设置为 `true`。

## 高级传输设置

OpenSearch 支持以下用于传输通信的高级网络设置：

- `transport.host`（静态，list）：设置 OpenSearch 节点用于传输通信的地址。如果 `transport.bind_host` 和 `transport.publish_host` 的值相同，`transport.host` 设置就是这两者的组合。作为 `transport.host` 的替代方案，你可以根据需要分别配置 `transport.bind_host` 和 `transport.publish_host`。

- `transport.bind_host`（静态，list）：指定 OpenSearch 节点绑定以监听传入传输连接的一个或多个地址。

- `transport.publish_host`（静态，list）：指定 OpenSearch 节点向其他节点发布的、用于传输通信的一个或多个地址。

## 选择传输模块

OpenSearch 的默认传输由 `transport-netty4` 模块提供，它使用 [Netty 4](https://netty.io/) 引擎来处理集群中节点之间基于 TCP 的内部通信，以及与客户端之间基于 HTTP 的外部通信。这种通信是完全异步且非阻塞的。不过，还有其他可互换使用的传输插件：

插件 | 描述
:---------- | :--------
`transport-nio`    | 基于 Java NIO 的 OpenSearch 传输。<br> 安装：`./bin/opensearch-plugin install transport-nio` <br> 配置（使用 `opensearch.yml`）：<br> `transport.type: nio-transport` <br> `http.type: nio-http-transport`
`transport-reactor-netty4`    | 基于 [Project Reactor](https://github.com/reactor/reactor-netty) 和 Netty 4 的 OpenSearch HTTP 传输（**实验性**）<br> 安装：`./bin/opensearch-plugin install transport-reactor-netty4` <br> 配置（使用 `opensearch.yml`）：<br> `http.type: reactor-netty4`
