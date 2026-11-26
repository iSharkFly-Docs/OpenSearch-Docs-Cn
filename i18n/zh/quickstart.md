---
title: 快速入门
---

# 快速入门

通过 [Docker](https://www.docker.com/) 部署容器，开始使用 OpenSearch 和 OpenSearch Dashboards。在继续之前，你需要在本地机器上[安装 Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://github.com/docker/compose)。

::: info 注意
本指南中使用的 Docker Compose 命令都带有连字符（例如 `docker-compose`）。如果你在机器上安装的是 Docker Desktop（它会自动安装捆绑版本的 Docker Compose），则应去掉连字符。例如，将 `docker-compose` 改为 `docker compose`。
:::

## 启动集群

你需要一个称为 Compose 文件的特殊文件，Docker Compose 使用它来定义和创建集群中的容器。OpenSearch 项目提供了一个示例 Compose 文件，你可以用它来快速上手。要进一步了解如何使用 Compose 文件，请查阅官方的 [Compose 规范](https://docs.docker.com/compose/compose-file/)。

1. 在机器上运行 OpenSearch 之前，你应该在主机上禁用内存分页和交换，以提升性能，并增加 OpenSearch 可用的内存映射数量。有关更多信息，请参阅[重要系统设置](/install-and-configure/install-opensearch/)。
    ```bash
    # 禁用内存分页和交换。
    sudo swapoff -a

    # 编辑定义主机最大内存映射数量的 sysctl 配置文件。
    sudo vi /etc/sysctl.conf

    # 将最大内存映射数量设置为推荐值 262144。
    vm.max_map_count=262144

    # 重新加载内核参数。
    sudo sysctl -p
    ```  
1. 将示例 Compose 文件下载到主机。你可以使用 `curl` 和 `wget` 等命令行工具下载该文件，也可以使用 Web 浏览器从 OpenSearch 项目的 documentation-website 仓库中手动复制 [docker-compose.yml](https://github.com/opensearch-project/documentation-website/blob/2.12/assets/examples/docker-compose.yml)。
    ```bash
    # 使用 cURL：
    curl -O https://raw.githubusercontent.com/opensearch-project/documentation-website/2.12/assets/examples/docker-compose.yml

    # 使用 wget：
    wget https://raw.githubusercontent.com/opensearch-project/documentation-website/2.12/assets/examples/docker-compose.yml
    ```
1. 在终端应用程序中，进入刚刚下载的 `docker-compose.yml` 文件所在的目录，然后运行以下命令，以后台进程的方式创建并启动集群。
    ```bash
    docker-compose up -d
    ```
1. 使用 `docker-compose ps` 命令确认容器正在运行。你应该会看到类似以下的输出：
    ```bash
    $ docker-compose ps
    NAME                    COMMAND                  SERVICE                 STATUS              PORTS
    opensearch-dashboards   "./opensearch-dashbo…"   opensearch-dashboards   running             0.0.0.0:5601->5601/tcp
    opensearch-node1        "./opensearch-docker…"   opensearch-node1        running             0.0.0.0:9200->9200/tcp, 9300/tcp, 0.0.0.0:9600->9600/tcp, 9650/tcp
    opensearch-node2        "./opensearch-docker…"   opensearch-node2        running             9200/tcp, 9300/tcp, 9600/tcp, 9650/tcp
    ```
1. 查询 OpenSearch REST API，验证服务是否正在运行。由于默认安全配置使用的是演示证书，你应该使用 `-k`（也写作 `--insecure`）来禁用主机名检查。使用 `-u` 传入默认用户名和密码（`admin:<custom-admin-password>`）。
    ```bash
    curl https://localhost:9200 -ku admin:<custom-admin-password>
    ```
    示例响应：
    ```json
    {
        "name" : "opensearch-node1",
        "cluster_name" : "opensearch-cluster",
        "cluster_uuid" : "W0B8gPotTAajhMPbC9D4ww",
        "version" : {
            "distribution" : "opensearch",
            "number" : "2.6.0",
            "build_type" : "tar",
            "build_hash" : "7203a5af21a8a009aece1474446b437a3c674db6",
            "build_date" : "2023-02-24T18:58:37.352296474Z",
            "build_snapshot" : false,
            "lucene_version" : "9.5.0",
            "minimum_wire_compatibility_version" : "7.10.0",
            "minimum_index_compatibility_version" : "7.0.0"
        },
        "tagline" : "The OpenSearch Project: https://opensearch.org/"
    }
    ```
1. 在运行 OpenSearch 集群的同一台主机上，使用 Web 浏览器打开 `http://localhost:5601/`，探索 OpenSearch Dashboards。默认用户名是 `admin`，默认密码由 `docker-compose.yml` 文件中的 `OPENSEARCH_INITIAL_ADMIN_PASSWORD=<custom-admin-password>` 设置指定。

## 使用示例数据创建索引和字段映射

使用 OpenSearch 项目提供的数据集创建索引（Index）并定义字段映射（Mapping）。OpenSearch Dashboards 中的示例可视化也使用了同样的虚构电子商务数据。要了解更多信息，请参阅 [OpenSearch Dashboards 入门](/dashboards/)。

1. 下载 [ecommerce-field_mappings.json](https://github.com/opensearch-project/documentation-website/blob/2.12/assets/examples/ecommerce-field_mappings.json)。该文件为你将要使用的示例数据定义了[映射](/field-types/)。
    ```bash
    # 使用 cURL：
    curl -O https://raw.githubusercontent.com/opensearch-project/documentation-website/2.12/assets/examples/ecommerce-field_mappings.json

    # 使用 wget：
    wget https://raw.githubusercontent.com/opensearch-project/documentation-website/2.12/assets/examples/ecommerce-field_mappings.json
    ```
1. 下载 [ecommerce.json](https://github.com/opensearch-project/documentation-website/blob/2.12/assets/examples/ecommerce.json)。该文件包含格式化后的索引数据，可以通过 bulk API 摄取。要了解更多信息，请参阅[索引数据](/im-plugin/)和 [Bulk](/api-reference/document-apis/bulk)。
    ```bash
    # 使用 cURL：
    curl -O https://raw.githubusercontent.com/opensearch-project/documentation-website/2.12/assets/examples/ecommerce.json

    # 使用 wget：
    wget https://raw.githubusercontent.com/opensearch-project/documentation-website/2.12/assets/examples/ecommerce.json
    ```
1. 使用映射文件定义字段映射。
    ```bash
    curl -H "Content-Type: application/x-ndjson" -X PUT "https://localhost:9200/ecommerce" -ku admin:<custom-admin-password> --data-binary "@ecommerce-field_mappings.json"
    ```
1. 通过 bulk API 上传索引。
    ```bash
    curl -H "Content-Type: application/x-ndjson" -X PUT "https://localhost:9200/ecommerce/_bulk" -ku admin:<custom-admin-password> --data-binary "@ecommerce.json"
    ```
1. 使用搜索 API 查询数据。以下命令提交的查询将返回 `customer_first_name` 为 `Sonya` 的文档。
    ```bash
    curl -H 'Content-Type: application/json' -X GET "https://localhost:9200/ecommerce/_search?pretty=true" -ku admin:<custom-admin-password> -d' {"query":{"match":{"customer_first_name":"Sonya"}}}'
    ```
    默认情况下，提交到 OpenSearch REST API 的查询通常会返回未格式化的 JSON。要获得便于阅读的响应体，请使用查询参数 `pretty=true`。有关 `pretty` 和其他实用查询参数的更多信息，请参阅[通用 REST 参数](/api-reference/common-parameters)。
1. 在运行 OpenSearch 集群的同一台主机上，使用 Web 浏览器打开 `http://localhost:5601/`，访问 OpenSearch Dashboards。默认用户名是 `admin`，密码由 `docker-compose.yml` 文件中的 `OPENSEARCH_INITIAL_ADMIN_PASSWORD=<custom-admin-password>` 设置指定。
1. 在顶部菜单栏中，转到 **Management > Dev Tools**。
1. 在控制台的左侧窗格中输入以下内容：
    ```json
    GET ecommerce/_search
    {
        "query": {
            "match": {
                "customer_first_name": "Sonya"
            }
        }
    }
    ```
1. 选择请求右上角的三角形图标提交查询。你也可以按 `Ctrl+Enter`（Mac 用户按 `Cmd+Enter`）提交请求。要进一步了解如何使用 OpenSearch Dashboards 控制台提交查询，请参阅[在控制台中运行查询](/dashboards/dev-tools/run-queries)。

## 后续步骤

你已经成功部署了自己的 OpenSearch 集群和 OpenSearch Dashboards，并添加了一些示例数据。现在你可以更深入地了解配置和功能了。以下是一些入门建议：
- [关于 Security 插件](/security/)
- [OpenSearch 配置](/install-and-configure/configuring-opensearch/)
- [OpenSearch 插件安装](/install-and-configure/plugins)
- [OpenSearch Dashboards 入门](/dashboards/)
- [OpenSearch 工具](/tools/)
- [索引 API](/api-reference/index-apis/)

## 常见问题

如果你的容器无法启动或意外退出，请查看以下常见问题及建议的解决方案。

### Docker 命令需要提升权限

将你的用户添加到 `docker` 用户组，即可无需使用 `sudo` 运行 Docker 命令。有关更多信息，请参阅 Docker 的 [Linux 安装后步骤](https://docs.docker.com/engine/install/linux-postinstall/)。
```bash
sudo usermod -aG docker $USER
```

### 错误消息："-bash: docker-compose: command not found" {#error-message--bash-docker-compose-command-not-found}

如果你安装的是 Docker Desktop，那么你的机器上已经安装了 Docker Compose。请尝试使用 `docker compose`（不带连字符）代替 `docker-compose`。请参阅[使用 Docker Compose](https://docs.docker.com/get-started/08_using_compose/)。

### 错误消息："docker: 'compose' is not a docker command."

如果你安装的是 Docker Engine，则必须单独安装 Docker Compose，并且需要使用 `docker-compose` 命令（带连字符）。请参阅 [Docker Compose](https://github.com/docker/compose)。

### 错误消息："max virtual memory areas vm.max_map_count [65530] is too low" {#error-message-max-virtual-memory-areas-vmmaxmapcount-65530-is-too-low}

如果主机的 `vm.max_map_count` 过低，OpenSearch 将无法启动。如果你在服务日志中看到以下错误，请查阅[重要系统设置](/install-and-configure/install-opensearch/)，并适当设置 `vm.max_map_count`。
```bash
opensearch-node1         | ERROR: [1] bootstrap checks failed
opensearch-node1         | [1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
opensearch-node1         | ERROR: OpenSearch did not exit normally - check the logs at /usr/share/opensearch/logs/opensearch-cluster.log
```
