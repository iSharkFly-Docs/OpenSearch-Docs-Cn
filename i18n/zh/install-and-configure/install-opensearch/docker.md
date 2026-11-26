---
title: Docker
---

# Docker

[Docker](https://www.docker.com/) 极大地简化了 OpenSearch 集群（Cluster）的配置和管理过程。你可以从 [Docker Hub](https://hub.docker.com/u/opensearchproject) 或 [Amazon Elastic Container Registry（Amazon ECR）](https://gallery.ecr.aws/opensearchproject/)拉取官方镜像，并使用 [Docker Compose](https://github.com/docker/compose) 和本指南提供的任一示例 Docker Compose 文件快速部署集群。有经验的 OpenSearch 用户还可以通过创建自定义 Docker Compose 文件，进一步定制自己的部署。

Docker 容器具有可移植性，可以在任何支持 Docker 的兼容主机（例如 Linux、MacOS 或 Windows）上运行。与 [RPM](/install-and-configure/install-opensearch/rpm) 或手动 [Tarball](/install-and-configure/install-opensearch/tar) 安装等其他安装方式相比，Docker 容器的可移植性带来了更大的灵活性，因为后两者在下载和解压之后都需要额外的配置。

::: info 注意
本指南假定你熟悉 Linux 命令行界面（CLI），了解如何输入命令、在目录之间切换以及编辑文本文件。有关 [Docker](https://www.docker.com/) 或 [Docker Compose](https://github.com/docker/compose) 的帮助，请参阅其官方网站上的文档。
:::

## 安装 Docker 和 Docker Compose

请访问 [Get Docker](https://docs.docker.com/get-docker/)，了解如何为你的环境安装和配置 Docker。如果你使用 CLI 安装 Docker Engine，默认情况下 Docker 不会对可用的主机资源做任何限制。根据你的环境，你可能需要在 Docker 中配置资源限制。相关信息请参阅 [Runtime options with Memory, CPUs, and GPUs](https://docs.docker.com/config/containers/resource_constraints/)。

::: tip 提示
Docker Desktop 用户应打开 Docker Desktop，选择 **Settings** → **Resources**，将主机内存使用量设置为至少 4 GB。
:::

Docker Compose 是一个让用户通过一条命令启动多个容器的工具。调用 Docker Compose 时需要向它传入一个文件，Docker Compose 会读取其中的设置并启动所需的容器。Docker Compose 会随 Docker Desktop 自动安装，但在命令行环境中操作的用户必须手动安装 Docker Compose。你可以在官方的 [Docker Compose GitHub 页面](https://github.com/docker/compose)上找到安装 Docker Compose 的相关信息。

::: tip 提示
如果你需要手动安装 Docker Compose，并且你的主机支持 Python，可以使用 [pip](https://pypi.org/project/pip/) 自动安装 [Docker Compose 软件包](https://pypi.org/project/docker-compose/)。
:::

## 配置重要的主机设置
在使用 Docker 安装 OpenSearch 之前，请先配置以下设置。这些是可能影响服务性能的最重要的设置，更多信息请参阅[重要的系统设置](/install-and-configure/install-opensearch/#important-settings)。

### Linux 设置
在 Linux 环境中，运行以下命令：

1. 在主机上禁用内存分页和交换，以提高性能。
   ```bash
   sudo swapoff -a
   ```
1. 增加 OpenSearch 可用的内存映射数量。
   ```bash
   # 编辑 sysctl 配置文件
   sudo vi /etc/sysctl.conf

   # 添加一行来定义所需的值，
   # 如果该键已存在则修改其值，
   # 然后保存更改。
   vm.max_map_count=262144

   # 使用 sysctl 重新加载内核参数
   sudo sysctl -p

   # 检查该值，确认更改已生效
   cat /proc/sys/vm/max_map_count
   ```

### Windows 设置
对于通过 Docker Desktop 使用 WSL 的 Windows 工作负载，请在终端中运行以下命令来设置 `vm.max_map_count`：

```bash
wsl -d docker-desktop
sysctl -w vm.max_map_count=262144
```   

## 在 Docker 容器中运行 OpenSearch

OpenSearch 官方镜像托管在 [Docker Hub](https://hub.docker.com/u/opensearchproject/) 和 [Amazon ECR](https://gallery.ecr.aws/opensearchproject/) 上。如果你想查看这些镜像，可以使用 `docker pull` 逐个拉取，如以下示例所示。

[Docker Hub](https://hub.docker.com/u/opensearchproject/)：
```bash
docker pull opensearchproject/opensearch:2
```

```bash
docker pull opensearchproject/opensearch-dashboards:2
```

[Amazon ECR](https://gallery.ecr.aws/opensearchproject/)：
```bash
docker pull public.ecr.aws/opensearchproject/opensearch:2
```

```bash
docker pull public.ecr.aws/opensearchproject/opensearch-dashboards:2
```

::: tip 提示
要下载最新可用版本以外的特定版本的 OpenSearch 或 OpenSearch Dashboards，请修改引用镜像处的镜像标签（命令行中或 Docker Compose 文件中）。例如，`opensearchproject/opensearch:2.12.0` 将拉取 OpenSearch 2.12.0 版本。要拉取最新版本，请使用 `opensearchproject/opensearch:latest`。有关可用版本，请参阅官方镜像仓库。
:::

在继续之前，你应该先在单个容器中部署 OpenSearch，以验证 Docker 是否正常工作。

1. 运行以下命令：
    ```bash
    # 此命令映射 9200 和 9600 端口，将发现类型设置为 "single-node"，并请求最新的 OpenSearch 镜像
    docker run -d -p 9200:9200 -p 9600:9600 -e "discovery.type=single-node" opensearchproject/opensearch:latest
    ```
   对于 OpenSearch 2.12 或更高版本，请在安装之前使用以下命令设置新的自定义管理员密码：
   ```bash
    docker run -d -p 9200:9200 -p 9600:9600 -e "discovery.type=single-node" -e "OPENSEARCH_INITIAL_ADMIN_PASSWORD=<custom-admin-password>" opensearchproject/opensearch:latest
    ```
1. 向 9200 端口发送请求。默认用户名和密码均为 `admin`。
    ```bash
    curl https://localhost:9200 -ku 'admin:<custom-admin-password>'
    ```

    - 你应该会得到类似如下的响应：
      ```bash
      {
        "name" : "a937e018cee5",
        "cluster_name" : "docker-cluster",
        "cluster_uuid" : "GLAjAG6bTeWErFUy_d-CLw",
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
1. 在停止正在运行的容器之前，先列出所有正在运行的容器，并复制你正在测试的 OpenSearch 节点（Node）的容器 ID。在以下示例中，容器 ID 为 `a937e018cee5`：
    ```bash
    $ docker container ls
    CONTAINER ID   IMAGE                                 COMMAND                  CREATED          STATUS          PORTS                                                                NAMES
    a937e018cee5   opensearchproject/opensearch:latest   "./opensearch-docker…"   19 minutes ago   Up 19 minutes   0.0.0.0:9200->9200/tcp, 9300/tcp, 0.0.0.0:9600->9600/tcp, 9650/tcp   wonderful_boyd
    ```
1. 将容器 ID 传给 `docker stop`，停止正在运行的容器。
    ```bash
    docker stop <containerId>
    ```

::: tip 提示
请记住，`docker container ls` 不会列出已停止的容器。如果你想查看已停止的容器，请使用 `docker container ls -a`。你可以使用 `docker container rm <containerId_1> <containerId_2> <containerId_3> [...]` 手动删除不需要的容器（传入所有要删除的容器 ID，以空格分隔）；如果想删除所有已停止的容器，可以使用更简短的命令 `docker container prune`。
:::

## 使用 Docker Compose 部署 OpenSearch 集群

虽然从技术上讲，可以通过逐条命令创建容器来构建 OpenSearch 集群，但在 YAML 文件中定义环境并让 Docker Compose 管理集群要容易得多。下一节包含一些示例 YAML 文件，你可以使用它们启动一个包含 OpenSearch 和 OpenSearch Dashboards 的预定义集群。这些示例适用于测试和开发，但不适用于生产环境。如果你之前没有使用 Docker Compose 的经验，在修改示例中的字典结构之前，建议先查阅 Docker 的 [Compose 规范](https://docs.docker.com/compose/compose-file/)，了解语法和格式方面的指导。

定义环境的 YAML 文件称为 Docker Compose 文件。默认情况下，`docker-compose` 命令会首先在当前目录中查找与以下任一名称匹配的文件：
- `docker-compose.yml`
- `docker-compose.yaml`
- `compose.yml`
- `compose.yaml`

如果当前目录中不存在这些文件，`docker-compose` 命令将会失败。

调用 `docker-compose` 时，可以使用 `-f` 标志指定自定义的文件位置和名称：
```bash
# 使用文件的相对路径或绝对路径。
docker-compose -f /path/to/your-file.yml up
```

如果这是你第一次使用 Docker Compose 启动 OpenSearch 集群，请使用以下示例 `docker-compose.yml` 文件。将其保存在主机的主目录中，并命名为 `docker-compose.yml`。该文件会创建一个包含三个容器的集群：两个运行 OpenSearch 服务的容器，以及一个运行 OpenSearch Dashboards 的容器。这些容器通过名为 `opensearch-net` 的桥接网络进行通信，并使用两个卷，每个 OpenSearch 节点各一个。由于该文件没有显式禁用演示安全配置，因此会安装自签名 TLS 证书，并创建使用默认名称和密码的内部用户。

### 设置自定义管理员密码

从 OpenSearch 2.12 开始，设置演示安全配置时必须提供自定义的管理员密码。请执行以下操作之一：

- 在运行 `docker-compose.yml` 之前，使用以下命令设置新的自定义管理员密码：
  ```
  export OPENSEARCH_INITIAL_ADMIN_PASSWORD=<custom-admin-password>
  ```
  
- 在 `docker-compose.yml` 文件所在的文件夹中创建一个 `.env` 文件，在其中设置 `OPENSEARCH_INITIAL_ADMIN_PASSWORD` 并指定一个强密码值。

### 示例 docker-compose.yml {#sample-docker-composeyml}

```yml
version: '3'
services:
  opensearch-node1: # 这也是该容器在 Docker 网络中的主机名（即 https://opensearch-node1/）
    image: opensearchproject/opensearch:latest # 指定最新可用的镜像——如需特定版本请修改
    container_name: opensearch-node1
    environment:
      - cluster.name=opensearch-cluster # 为集群命名
      - node.name=opensearch-node1 # 为在此容器中运行的节点命名
      - discovery.seed_hosts=opensearch-node1,opensearch-node2 # 发现集群时要查找的节点
      - cluster.initial_cluster_manager_nodes=opensearch-node1,opensearch-node2 # 有资格担任集群管理节点的节点
      - bootstrap.memory_lock=true # 禁用 JVM 堆内存交换
      - "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m" # 将 JVM 堆的最小值和最大值设置为至少系统内存的 50%
      - OPENSEARCH_INITIAL_ADMIN_PASSWORD=${OPENSEARCH_INITIAL_ADMIN_PASSWORD}    # 使用演示配置时设置演示管理员用户的密码，OpenSearch 2.12 及更高版本必需
    ulimits:
      memlock:
        soft: -1 # 将 memlock 设置为不受限制（无软限制或硬限制）
        hard: -1
      nofile:
        soft: 65536 # opensearch 用户可打开文件的最大数量——至少设置为 65536
        hard: 65536
    volumes:
      - opensearch-data1:/usr/share/opensearch/data # 创建名为 opensearch-data1 的卷并将其挂载到容器
    ports:
      - 9200:9200 # REST API
      - 9600:9600 # Performance Analyzer
    networks:
      - opensearch-net # 所有容器都将加入同一个 Docker 桥接网络
  opensearch-node2:
    image: opensearchproject/opensearch:latest # 应与 opensearch-node1 使用相同的镜像，以免出现问题
    container_name: opensearch-node2
    environment:
      - cluster.name=opensearch-cluster
      - node.name=opensearch-node2
      - discovery.seed_hosts=opensearch-node1,opensearch-node2
      - cluster.initial_cluster_manager_nodes=opensearch-node1,opensearch-node2
      - bootstrap.memory_lock=true
      - "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m"
      - OPENSEARCH_INITIAL_ADMIN_PASSWORD=${OPENSEARCH_INITIAL_ADMIN_PASSWORD}
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65536
        hard: 65536
    volumes:
      - opensearch-data2:/usr/share/opensearch/data
    networks:
      - opensearch-net
  opensearch-dashboards:
    image: opensearchproject/opensearch-dashboards:latest # 确保 opensearch-dashboards 的版本与其他节点上安装的 opensearch 版本一致
    container_name: opensearch-dashboards
    ports:
      - 5601:5601 # 将主机端口 5601 映射到容器端口 5601
    expose:
      - "5601" # 开放 5601 端口，以便通过 Web 访问 OpenSearch Dashboards
    environment:
      OPENSEARCH_HOSTS: '["https://opensearch-node1:9200","https://opensearch-node2:9200"]' # 定义 OpenSearch Dashboards 要查询的 OpenSearch 节点
    networks:
      - opensearch-net

volumes:
  opensearch-data1:
  opensearch-data2:

networks:
  opensearch-net:
```

::: info 注意
如果你在 compose 文件中使用环境变量覆盖 `opensearch_dashboards.yml` 设置，请全部使用大写字母，并将句点替换为下划线（例如，对于 `opensearch.hosts`，应使用 `OPENSEARCH_HOSTS`）。这与覆盖 `opensearch.yml` 设置的方式不同，后者只需更改赋值运算符（例如，`opensearch.yml` 中的 `discovery.type: single-node` 在 `docker-compose.yml` 中定义为 `discovery.type=single-node`）。
:::

在主机的主目录（包含 `docker-compose.yml` 的目录）中，以分离模式创建并启动容器：
```bash
docker-compose up -d
```

验证服务容器是否已正确启动：
```bash
docker-compose ps
```

如果某个容器启动失败，你可以查看服务日志：
```bash
# 如果不传入服务名称，docker-compose 将显示所有节点的日志
docker-compose logs <serviceName>
```

在浏览器中访问 http://localhost:5601，验证能否访问 OpenSearch Dashboards。默认用户名和密码均为 `admin`。在你定制部署的安全配置之前，我们不建议在可从公共互联网访问的主机上使用此配置。

::: info 注意
请记住，`localhost` 无法被远程访问。如果你将这些容器部署到远程主机，则需要建立网络连接，并将 `localhost` 替换为该主机对应的 IP 或 DNS 记录。
:::

停止集群中正在运行的容器：
```bash
docker-compose down
```

::: tip 提示
`docker-compose down` 会停止正在运行的容器，但不会删除主机上已有的 Docker 卷。如果你不关心这些卷中的内容，可以使用 `-v` 选项删除所有卷，例如 `docker-compose down -v`。
:::

## 配置 OpenSearch

OpenSearch 的 RPM 发行包在安装后需要进行大量配置，而使用 Docker 运行 OpenSearch 集群则不同，你甚至可以在创建容器之前就定义好环境。无论使用 Docker 还是 Docker Compose，都可以做到这一点。

例如，请看以下命令：
```bash
docker run \
  -p 9200:9200 -p 9600:9600 \
  -e "discovery.type=single-node" \
  -v /path/to/custom-opensearch.yml:/usr/share/opensearch/config/opensearch.yml \
  opensearchproject/opensearch:latest
```

逐一查看该命令的各个部分，可以看到它：
- 映射 `9200` 和 `9600` 端口（`HOST_PORT`:`CONTAINER_PORT`）。
- 将 `discovery.type` 设置为 `single-node`，以免此单节点部署的引导检查失败。
- 使用 [-v 标志](https://docs.docker.com/engine/reference/commandline/run#mount-volume--v---read-only)将名为 `custom-opensearch.yml` 的本地文件传入容器，替换镜像中自带的 `opensearch.yml` 文件。
- 从 Docker Hub 请求 `opensearchproject/opensearch:latest` 镜像。
- 运行容器。

如果将此命令与[示例 docker-compose.yml](#sample-docker-composeyml) 文件进行比较，你可能会注意到一些共同的设置，例如端口映射和镜像引用。不过，该命令只部署了一个运行 OpenSearch 的容器，不会为 OpenSearch Dashboards 创建容器。此外，如果你想使用自定义 TLS 证书、用户或角色（Role），或者定义额外的卷和网络，这条「单行」命令很快就会变得冗长而难以使用。这正是 Docker Compose 发挥作用的地方。

使用 Docker Compose 构建 OpenSearch 集群时，你可能会发现，将自定义配置文件从主机传入容器，要比在 `docker-compose.yml` 中逐一列出每项设置更容易。与示例 `docker run` 命令使用 `-v` 标志将主机上的卷挂载到容器类似，compose 文件可以在相应服务下通过子选项指定要挂载的卷。以下截取的 YAML 文件演示了如何将文件或目录挂载到容器。有关卷的用法和语法的完整信息，请参阅 Docker 官方文档中的[卷](https://docs.docker.com/storage/volumes/)。

```yml
services:
  opensearch-node1:
    volumes:
      - opensearch-data1:/usr/share/opensearch/data
      - ./custom-opensearch.yml:/usr/share/opensearch/config/opensearch.yml
  opensearch-node2:
    volumes:
      - opensearch-data2:/usr/share/opensearch/data
      - ./custom-opensearch.yml:/usr/share/opensearch/config/opensearch.yml
  opensearch-dashboards:
    volumes:
      - ./custom-opensearch_dashboards.yml:/usr/share/opensearch-dashboards/config/opensearch_dashboards.yml
```

### 用于开发的示例 Docker Compose 文件

如果你想基于示例构建自己的 compose 文件，请参考以下示例 `docker-compose.yml` 文件。该示例文件会创建两个 OpenSearch 节点和一个 OpenSearch Dashboards 节点，并禁用了 Security 插件。在阅读[配置基本安全设置](#configuring-basic-security-settings)时，你可以将此示例文件作为起点。
```yml
version: '3'
services:
  opensearch-node1:
    image: opensearchproject/opensearch:latest
    container_name: opensearch-node1
    environment:
      - cluster.name=opensearch-cluster # 为集群命名
      - node.name=opensearch-node1 # 为在此容器中运行的节点命名
      - discovery.seed_hosts=opensearch-node1,opensearch-node2 # 发现集群时要查找的节点
      - cluster.initial_cluster_manager_nodes=opensearch-node1,opensearch-node2 # 有资格担任集群管理节点的节点
      - bootstrap.memory_lock=true # 禁用 JVM 堆内存交换
      - "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m" # 将 JVM 堆的最小值和最大值设置为至少系统内存的 50%
      - "DISABLE_INSTALL_DEMO_CONFIG=true" # 阻止执行捆绑的演示脚本（该脚本会向 OpenSearch 安装演示证书和安全配置）
      - "DISABLE_SECURITY_PLUGIN=true" # 禁用 Security 插件
    ulimits:
      memlock:
        soft: -1 # 将 memlock 设置为不受限制（无软限制或硬限制）
        hard: -1
      nofile:
        soft: 65536 # opensearch 用户可打开文件的最大数量——至少设置为 65536
        hard: 65536
    volumes:
      - opensearch-data1:/usr/share/opensearch/data # 创建名为 opensearch-data1 的卷并将其挂载到容器
    ports:
      - 9200:9200 # REST API
      - 9600:9600 # Performance Analyzer
    networks:
      - opensearch-net # 所有容器都将加入同一个 Docker 桥接网络
  opensearch-node2:
    image: opensearchproject/opensearch:latest
    container_name: opensearch-node2
    environment:
      - cluster.name=opensearch-cluster # 为集群命名
      - node.name=opensearch-node2 # 为在此容器中运行的节点命名
      - discovery.seed_hosts=opensearch-node1,opensearch-node2 # 发现集群时要查找的节点
      - cluster.initial_cluster_manager_nodes=opensearch-node1,opensearch-node2 # 有资格担任集群管理节点的节点
      - bootstrap.memory_lock=true # 禁用 JVM 堆内存交换
      - "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m" # 将 JVM 堆的最小值和最大值设置为至少系统内存的 50%
      - "DISABLE_INSTALL_DEMO_CONFIG=true" # 阻止执行捆绑的演示脚本（该脚本会向 OpenSearch 安装演示证书和安全配置）
      - "DISABLE_SECURITY_PLUGIN=true" # 禁用 Security 插件
    ulimits:
      memlock:
        soft: -1 # 将 memlock 设置为不受限制（无软限制或硬限制）
        hard: -1
      nofile:
        soft: 65536 # opensearch 用户可打开文件的最大数量——至少设置为 65536
        hard: 65536
    volumes:
      - opensearch-data2:/usr/share/opensearch/data # 创建名为 opensearch-data2 的卷并将其挂载到容器
    networks:
      - opensearch-net # 所有容器都将加入同一个 Docker 桥接网络
  opensearch-dashboards:
    image: opensearchproject/opensearch-dashboards:latest
    container_name: opensearch-dashboards
    ports:
      - 5601:5601 # 将主机端口 5601 映射到容器端口 5601
    expose:
      - "5601" # 开放 5601 端口，以便通过 Web 访问 OpenSearch Dashboards
    environment:
      - 'OPENSEARCH_HOSTS=["http://opensearch-node1:9200","http://opensearch-node2:9200"]'
      - "DISABLE_SECURITY_DASHBOARDS_PLUGIN=true" # 在 OpenSearch Dashboards 中禁用 Security Dashboards 插件
    networks:
      - opensearch-net

volumes:
  opensearch-data1:
  opensearch-data2:

networks:
  opensearch-net:
```

### 配置基本安全设置

在让外部主机访问你的 OpenSearch 集群之前，最好先检查一下部署的安全配置。你可能还记得，在第一个[示例 docker-compose.yml](#sample-docker-composeyml) 文件中，除非通过设置 `DISABLE_SECURITY_PLUGIN=true` 禁用，否则捆绑的脚本会为集群中的节点应用默认的演示安全配置。由于该配置用于演示目的，其默认用户名和密码是公开已知的。因此，我们建议你创建自己的安全配置文件，并使用 `volumes` 将这些文件传入容器。有关 OpenSearch 安全设置的具体指导，请参阅[安全配置](/security/configuration/)。

要在配置中使用你自己的证书，请将所有必要的证书添加到 compose 文件的 volumes 部分：
```yml
volumes:
  - ./root-ca.pem:/usr/share/opensearch/config/root-ca.pem
  - ./admin.pem:/usr/share/opensearch/config/admin.pem
  - ./admin-key.pem:/usr/share/opensearch/config/admin-key.pem
  - ./node1.pem:/usr/share/opensearch/config/node1.pem
  - ./node1-key.pem:/usr/share/opensearch/config/node1-key.pem
```

使用 Docker Compose 卷为 OpenSearch 节点添加 TLS 证书时，还应包含一个定义这些证书的自定义 `opensearch.yml` 文件。例如：
```yml
volumes:
  - ./root-ca.pem:/usr/share/opensearch/config/root-ca.pem
  - ./admin.pem:/usr/share/opensearch/config/admin.pem
  - ./admin-key.pem:/usr/share/opensearch/config/admin-key.pem
  - ./node1.pem:/usr/share/opensearch/config/node1.pem
  - ./node1-key.pem:/usr/share/opensearch/config/node1-key.pem
  - ./custom-opensearch.yml:/usr/share/opensearch/config/opensearch.yml
```

请记住，compose 文件中指定的证书必须与自定义 `opensearch.yml` 文件中定义的证书相同。你应该将根证书、管理员证书和节点证书替换为你自己的证书。更多信息，请参阅[配置 TLS 证书](/security/configuration/tls)。
```yml
plugins.security.ssl.transport.pemcert_filepath: node1.pem
plugins.security.ssl.transport.pemkey_filepath: node1-key.pem
plugins.security.ssl.transport.pemtrustedcas_filepath: root-ca.pem
plugins.security.ssl.http.pemcert_filepath: node1.pem
plugins.security.ssl.http.pemkey_filepath: node1-key.pem
plugins.security.ssl.http.pemtrustedcas_filepath: root-ca.pem
plugins.security.authcz.admin_dn:
  - CN=admin,OU=SSL,O=Test,L=Test,C=DE
```

配置安全设置后，你的自定义 `opensearch.yml` 文件可能类似以下示例。该示例添加了 TLS 证书和管理员证书的可分辨名称（Distinguished Name，DN），定义了一些权限，并启用了详细的审计日志：
```yml
plugins.security.ssl.transport.pemcert_filepath: node1.pem
plugins.security.ssl.transport.pemkey_filepath: node1-key.pem
plugins.security.ssl.transport.pemtrustedcas_filepath: root-ca.pem
plugins.security.ssl.transport.enforce_hostname_verification: false
plugins.security.ssl.http.enabled: true
plugins.security.ssl.http.pemcert_filepath: node1.pem
plugins.security.ssl.http.pemkey_filepath: node1-key.pem
plugins.security.ssl.http.pemtrustedcas_filepath: root-ca.pem
plugins.security.allow_default_init_securityindex: true
plugins.security.authcz.admin_dn:
  - CN=A,OU=UNIT,O=ORG,L=TORONTO,ST=ONTARIO,C=CA
plugins.security.nodes_dn:
  - 'CN=N,OU=UNIT,O=ORG,L=TORONTO,ST=ONTARIO,C=CA'
plugins.security.audit.type: internal_opensearch
plugins.security.enable_snapshot_restore_privilege: true
plugins.security.check_snapshot_restore_write_privileges: true
plugins.security.restapi.roles_enabled: ["all_access", "security_rest_api_access"]
cluster.routing.allocation.disk.threshold_enabled: false
opendistro_security.audit.config.disabled_rest_categories: NONE
opendistro_security.audit.config.disabled_transport_categories: NONE
```

完整的设置列表请参阅 [Security](/security/configuration/)。

使用相同的流程，在 `/usr/share/opensearch/config/opensearch-security/config.yml` 中指定[后端配置](/security/configuration/configuration)，并在各自的 [YAML 文件](/security/configuration/yaml)中定义新的内部用户、角色、映射、操作组和租户（tenant）。

替换证书并创建你自己的内部用户、角色、映射、操作组和租户之后，使用 Docker Compose 启动集群：
```bash
docker-compose up -d
```

### 使用插件

要将 OpenSearch 镜像与自定义插件（plugin）一起使用，必须先创建一个 [`Dockerfile`](https://docs.docker.com/engine/reference/builder/)。有关创建 Dockerfile 的信息，请参阅 Docker 官方文档。
```
FROM opensearchproject/opensearch:latest
RUN /usr/share/opensearch/bin/opensearch-plugin install --batch <pluginId>
```

然后运行以下命令：
```bash
# 基于 Dockerfile 构建镜像
docker build --tag=opensearch-custom-plugin .
# 基于自定义镜像启动容器
docker run -p 9200:9200 -p 9600:9600 -v /usr/share/opensearch/data opensearch-custom-plugin
```

或者，你可能希望在部署之前从镜像中移除某个插件。以下示例 Dockerfile 移除了 Security 插件：
```
FROM opensearchproject/opensearch:latest
RUN /usr/share/opensearch/bin/opensearch-plugin remove opensearch-security
```

你还可以使用 Dockerfile 传入你自己的证书，供 [Security 插件](/security/)使用：
```
FROM opensearchproject/opensearch:latest
COPY --chown=opensearch:opensearch opensearch.yml /usr/share/opensearch/config/
COPY --chown=opensearch:opensearch my-key-file.pem /usr/share/opensearch/config/
COPY --chown=opensearch:opensearch my-certificate-chain.pem /usr/share/opensearch/config/
COPY --chown=opensearch:opensearch my-root-cas.pem /usr/share/opensearch/config/
```

## 相关链接

- [OpenSearch 配置](/install-and-configure/configuring-opensearch/)
- [Performance Analyzer](/monitoring-your-cluster/pa/)
- [安装和配置 OpenSearch Dashboards](/install-and-configure/install-dashboards/)
- [关于 OpenSearch 中的安全功能](/security/)
