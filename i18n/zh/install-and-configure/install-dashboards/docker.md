---
title: Docker
---

# 使用 Docker 运行 OpenSearch Dashboards

你*可以*在[创建 Docker 网络](https://docs.docker.com/engine/reference/commandline/network_create/)并启动 OpenSearch 之后，使用 `docker run` 启动 OpenSearch Dashboards，但使用 Docker Compose 文件将 OpenSearch Dashboards 连接到 OpenSearch 要容易得多。

1. 运行 `docker pull opensearchproject/opensearch-dashboards:2`。

1. 创建适合你环境的 [`docker-compose.yml`](https://docs.docker.com/compose/compose-file/) 文件。OpenSearch 的 [Docker 安装页面](/install-and-configure/install-opensearch/docker#sample-docker-composeyml)提供了一个包含 OpenSearch Dashboards 的示例文件。

   ::: tip 提示
   与 `opensearch.yml` 一样，你也可以在 Docker Compose 文件中将自定义的 `opensearch_dashboards.yml` 传递给容器。
   :::

1. 运行 `docker-compose up`。

   等待容器启动，然后参阅 [OpenSearch Dashboards 文档](/dashboards/)。

1. 完成后，运行 `docker-compose down`。
