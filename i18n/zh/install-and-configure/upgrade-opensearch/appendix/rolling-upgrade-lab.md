---
title: 滚动升级实验
---

<!--
Testing out tabs for code blocks to identify example outputs and file names.
To use, invoke class="codeblock-label"
-->

<style>
.codeblock-label {
    display: inline-block;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    font-family: Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;
    font-size: .75rem;
    --bg-opacity: 1;
    background-color: #e1e7ef;
    background-color: rgba(224.70600000000002,231.07080000000002,239.394,var(--bg-opacity));
    padding: 0.25rem 0.75rem;
    border-top-width: 1px;
    border-left-width: 1px;
    border-right-width: 1px;
    --border-opacity: 1;
    border-color: #ccd6e0;
    border-color: rgba(204,213.85999999999999,224.39999999999998,var(--border-opacity));
    margin-bottom: 0;
}
</style>

# 滚动升级实验

你可以在自己的兼容主机上按照以下步骤 <OuiToken iconType="tokenStruct" size="xs" color="gray" /> 操作，重建 OpenSearch Project 在测试[滚动升级](/install-and-configure/upgrade-opensearch/rolling-upgrade)时所用的集群状态。如果你想在开发环境中测试升级流程，这个练习会很有帮助。

本实验中的步骤在一台任意选择的 [Amazon Elastic Compute Cloud (Amazon EC2)](https://aws.amazon.com/ec2/) `t2.large` 实例上验证过，该实例使用 [Amazon Linux 2](https://aws.amazon.com/amazon-linux-2/) 内核版本 `Linux 5.10.162-141.675.amzn2.x86_64` 和 [Docker](https://www.docker.com/) 版本 `20.10.17, build 100c701`。该实例挂载了一个 20 GiB 的 gp2 [Amazon EBS](https://aws.amazon.com/ebs/) 根卷。这些规格仅供参考，并不代表 OpenSearch 或 OpenSearch Dashboards 的硬件要求。

为了让说明更具可移植性，本流程中对主机上 `$HOME` 路径的引用均以波浪号（"~"）表示。如果你更想指定绝对路径，请修改 `upgrade-demo-cluster.sh` 中定义的卷路径以及本文档相关命令中使用的卷路径，使其符合你的环境。

## 设置环境

按照本文档的步骤操作时，你将使用我们提供的脚本定义多个 Docker 资源，包括容器、卷和一个专用的 Docker 网络。如果想重新开始，可以使用以下命令清理环境：

```bash
docker container stop $(docker container ls -aqf name=os-); \
	docker container rm $(docker container ls -aqf name=os-); \
	docker volume rm -f $(docker volume ls -q | egrep 'data-0|repo-0'); \
	docker network rm opensearch-dev-net
```

::: danger 警告
该命令会删除名称匹配正则表达式 `os-*` 的容器、匹配 `data-0*` 和 `repo-0*` 的数据卷，以及名为 `opensearch-dev-net` 的 Docker 网络。如果你的主机上还运行着其他 Docker 资源，请检查并修改该命令，以免意外删除其他资源。该命令不会撤销主机配置的更改，例如内存交换行为。
:::

选好主机后，就可以开始实验了：

1. 根据你的 Linux 发行版和系统架构，安装相应版本的 [Docker Engine](https://docs.docker.com/engine/install/)。 
1. 在主机上配置[重要的系统设置](/install-and-configure/install-opensearch/#important-settings)：
    1. 在主机上禁用内存分页和交换以提升性能：
	   ```bash
	   sudo swapoff -a
	   ```
	1. 增加 OpenSearch 可用的内存映射数量。打开 `sysctl` 配置文件进行编辑。此示例命令使用 [vim](https://www.vim.org/) 文本编辑器，你也可以使用任何可用的文本编辑器：
	   ```bash
	   sudo vim /etc/sysctl.conf
	   ```
	1. 在 `/etc/sysctl.conf` 中添加以下行：
	   ```bash
	   vm.max_map_count=262144
	   ```
	1. 保存并退出。如果使用 `vi` 或 `vim` 文本编辑器，可以切换到命令模式，输入 `:wq!` 或 `ZZ` 保存并退出。 
	1. 应用配置更改：
	   ```bash
	   sudo sysctl -p
	   ```
1. 在主目录中创建一个名为 `deploy` 的新目录，然后进入该目录。部署脚本、配置文件和 TLS 证书的路径都将使用 `~/deploy`：
   ```bash
   mkdir ~/deploy && cd ~/deploy
   ```
1. 从 OpenSearch Project 的 [documentation-website](https://github.com/opensearch-project/documentation-website) 仓库下载 `upgrade-demo-cluster.sh`：
   ```bash
   wget https://raw.githubusercontent.com/opensearch-project/documentation-website/main/assets/examples/upgrade-demo-cluster.sh
   ```
1. 不做任何修改直接运行该脚本，以部署四个运行 OpenSearch 的容器和一个运行 OpenSearch Dashboards 的容器，并使用自定义的自签名 TLS 证书和一组预定义的内部用户：
   ```bash
   sh upgrade-demo-cluster.sh
   ```
1. 确认容器已成功启动：
   ```bash
   docker container ls
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   CONTAINER ID   IMAGE                                           COMMAND                  CREATED          STATUS          PORTS                                                                                                      NAMES
   6e5218c8397d   opensearchproject/opensearch-dashboards:1.3.7   "./opensearch-dashbo…"   24 seconds ago   Up 22 seconds   0.0.0.0:5601->5601/tcp, :::5601->5601/tcp                                                                  os-dashboards-01
   cb5188308b21   opensearchproject/opensearch:1.3.7              "./opensearch-docker…"   25 seconds ago   Up 24 seconds   9300/tcp, 9650/tcp, 0.0.0.0:9204->9200/tcp, :::9204->9200/tcp, 0.0.0.0:9604->9600/tcp, :::9604->9600/tcp   os-node-04
   71b682aa6671   opensearchproject/opensearch:1.3.7              "./opensearch-docker…"   26 seconds ago   Up 25 seconds   9300/tcp, 9650/tcp, 0.0.0.0:9203->9200/tcp, :::9203->9200/tcp, 0.0.0.0:9603->9600/tcp, :::9603->9600/tcp   os-node-03
   f894054a9378   opensearchproject/opensearch:1.3.7              "./opensearch-docker…"   27 seconds ago   Up 26 seconds   9300/tcp, 9650/tcp, 0.0.0.0:9202->9200/tcp, :::9202->9200/tcp, 0.0.0.0:9602->9600/tcp, :::9602->9600/tcp   os-node-02
   2e9c91c959cd   opensearchproject/opensearch:1.3.7              "./opensearch-docker…"   28 seconds ago   Up 27 seconds   9300/tcp, 9650/tcp, 0.0.0.0:9201->9200/tcp, :::9201->9200/tcp, 0.0.0.0:9601->9600/tcp, :::9601->9600/tcp   os-node-01
   ```
1. OpenSearch 初始化集群所需的时间取决于底层主机的性能。你可以跟踪容器日志，查看 OpenSearch 在引导过程中的操作：
   1. 输入以下命令，在终端窗口中显示容器 `os-node-01` 的日志：
      ```bash
      docker logs -f os-node-01
      ```
   1. 节点就绪时，你会看到类似以下示例的日志条目：
      <p class="codeblock-label">示例</p>

      ```
      [INFO ][o.o.s.c.ConfigurationRepository] [os-node-01] Node 'os-node-01' initialized
      ```
   1. 按 `Ctrl+C` 停止跟踪容器日志，返回命令提示符。
1. 使用 cURL 查询 OpenSearch REST API。在以下命令中，请求被发送到主机端口 `9201` 以查询 `os-node-01`，该端口映射到容器的 `9200` 端口：
   ```bash
   curl -s "https://localhost:9201" -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```json
   {
       "name" : "os-node-01",
       "cluster_name" : "opensearch-dev-cluster",
       "cluster_uuid" : "g1MMknuDRuuD9IaaNt56KA",
       "version" : {
           "distribution" : "opensearch",
           "number" : "1.3.7",
           "build_type" : "tar",
           "build_hash" : "db18a0d5a08b669fb900c00d81462e221f4438ee",
           "build_date" : "2022-12-07T22:59:20.186520Z",
           "build_snapshot" : false,
           "lucene_version" : "8.10.1",
           "minimum_wire_compatibility_version" : "6.8.0",
           "minimum_index_compatibility_version" : "6.0.0-beta1"
       },
       "tagline" : "The OpenSearch Project: https://opensearch.org/"
   }
   ```

::: tip 提示
**提示**：在 `curl` 中使用 `-s` 选项可以隐藏进度条和错误消息。
:::

## 添加数据并配置 OpenSearch Security

OpenSearch 集群现已运行，接下来添加数据并配置一些 OpenSearch Security 设置。版本升级完成后，会再次验证你添加的数据和配置的设置。

本节分为两部分：
- [使用 REST API 索引数据](#indexing-data-with-the-rest-api)
- [使用 OpenSearch Dashboards 添加数据](#adding-data-using-opensearch-dashboards)

### 使用 REST API 索引数据

1. 下载示例字段映射文件：
   ```bash
   wget https://raw.githubusercontent.com/opensearch-project/documentation-website/main/assets/examples/ecommerce-field_mappings.json
   ```
1. 接下来，下载要摄取到该索引中的批量数据：
   ```bash
   wget https://raw.githubusercontent.com/opensearch-project/documentation-website/main/assets/examples/ecommerce.json
   ```
1. 使用 [Create index](/api-reference/index-apis/create-index) API，按照 `ecommerce-field_mappings.json` 中定义的映射创建索引：
   ```bash
   curl -H "Content-Type: application/x-ndjson" \
      -X PUT "https://localhost:9201/ecommerce?pretty" \
      --data-binary "@ecommerce-field_mappings.json" \
      -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```json
   {
      "acknowledged" : true,
      "shards_acknowledged" : true,
      "index" : "ecommerce"
   }
   ```
1. 使用 [Bulk](/api-reference/document-apis/bulk) API 将 `ecommerce.json` 中的数据添加到新的 ecommerce 索引：
   ```bash
   curl -H "Content-Type: application/x-ndjson" \
      -X PUT "https://localhost:9201/ecommerce/_bulk?pretty" \
      --data-binary "@ecommerce.json" \
      -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应（已截断）</p>

   ```json
   {
      "took" : 3323,
      "errors" : false,
      "items" : [
   ...
         "index" : {
            "_index" : "ecommerce",
            "_type" : "_doc",
            "_id" : "4674",
            "_version" : 1,
            "result" : "created",
            "_shards" : {
               "total" : 2,
               "successful" : 2,
               "failed" : 0
            },
            "_seq_no" : 4674,
            "_primary_term" : 1,
            "status" : 201
         }
      ]
   }
   ```
1. <p id="validation">也可以通过搜索查询确认数据已成功索引。以下查询返回关键字 `customer_first_name` 等于 `Sonya` 的文档数量：</p>

   ```bash
   curl -H 'Content-Type: application/json' \
      -X GET "https://localhost:9201/ecommerce/_search?pretty=true&filter_path=hits.total" \
      -d'{"query":{"match":{"customer_first_name":"Sonya"}}}' \
      -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label" id="query-validation">示例响应</p>

   ```json
   {
      "hits" : {
         "total" : {
            "value" : 106,
            "relation" : "eq"
         }
      }
   }
   ```

### 使用 OpenSearch Dashboards 添加数据

1. 打开 Web 浏览器，访问 Docker 主机的 `5601` 端口（例如 <code>https://<var>HOST_ADDRESS</var>:5601</code>）。如果 OpenSearch Dashboards 正在运行，且你的浏览器客户端能够通过网络访问该主机，就会被重定向到登录页面。
    1. 如果 Web 浏览器因 TLS 证书为自签名证书而报错，你可能需要在浏览器中绕过证书检查。有关如何绕过证书检查，请参阅浏览器的文档。每个证书的通用名称（Common Name，CN）都是根据用于集群内部通信的容器名和节点名生成的，因此从浏览器连接主机时仍会出现「invalid CN」警告。
1. 输入默认用户名（`admin`）和密码（`admin`）。
1. 在 OpenSearch Dashboards 的 **Home** 页面上，选择 **Add sample data**。
1. 在 **Sample web logs** 下，选择 **Add data**。
   1. **可选**：选择 **View data** 查看 **[Logs] Web Traffic** 仪表板。
1. 选择 **Menu button** 打开 **Navigation pane**，然后转到 **Security > Internal users**。
1. 选择 **Create internal user**。
1. 填写 **Username** 和 **Password**。
1. 在 **Backend role** 字段中输入 `admin`。
1. 选择 **Create**。

## 备份重要文件

在对集群进行更改之前，务必先创建备份，尤其是当集群运行在生产环境中时。

在本节中，你将：
- [注册快照仓库](#registering-a-snapshot-repository)。
- [创建快照](#creating-a-snapshot)。
- [备份安全设置](#backing-up-security-settings)。

### 注册快照仓库

1. 使用 `upgrade-demo-cluster.sh` 映射的卷注册一个仓库：
   ```bash
   curl -H 'Content-Type: application/json' \
      -X PUT "https://localhost:9201/_snapshot/snapshot-repo?pretty" \
      -d '{"type":"fs","settings":{"location":"/usr/share/opensearch/snapshots"}}' \
      -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```json
   {
      "acknowledged" : true
   }
   ```
1. **可选**：执行额外检查，验证仓库是否创建成功：
   ```bash
   curl -H 'Content-Type: application/json' \
      -X POST "https://localhost:9201/_snapshot/snapshot-repo/_verify?timeout=0s&master_timeout=50s&pretty" \
      -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```json
   {
      "nodes" : {
         "UODBXfAlRnueJ67grDxqgw" : {
            "name" : "os-node-03"
         },
         "14I_OyBQQXio8nmk0xsVcQ" : {
            "name" : "os-node-04"
         },
         "tQp3knPRRUqHvFNKpuD2vQ" : {
            "name" : "os-node-02"
         },
         "rPe8D6ssRgO5twIP00wbCQ" : {
            "name" : "os-node-01"
         }
      }
   }
   ```

### 创建快照

快照（Snapshot）是集群索引和状态的备份。有关更多信息，请参阅[快照](/tuning-your-cluster/availability-and-recovery/snapshots/)。

1. 创建一个包含所有索引和集群状态的快照：
   ```bash
   curl -H 'Content-Type: application/json' \
      -X PUT "https://localhost:9201/_snapshot/snapshot-repo/cluster-snapshot-v137?wait_for_completion=true&pretty" \
      -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```json
   {
      "snapshot" : {
         "snapshot" : "cluster-snapshot-v137",
         "uuid" : "-IYB8QNPShGOTnTtMjBjNg",
         "version_id" : 135248527,
         "version" : "1.3.7",
         "indices" : [
            "opensearch_dashboards_sample_data_logs",
            ".opendistro_security",
            "security-auditlog-2023.02.27",
            ".kibana_1",
            ".kibana_92668751_admin_1",
            "ecommerce",
            "security-auditlog-2023.03.06",
            "security-auditlog-2023.02.28",
            "security-auditlog-2023.03.07"
         ],
         "data_streams" : [ ],
         "include_global_state" : true,
         "state" : "SUCCESS",
         "start_time" : "2023-03-07T18:33:00.656Z",
         "start_time_in_millis" : 1678213980656,
         "end_time" : "2023-03-07T18:33:01.471Z",
         "end_time_in_millis" : 1678213981471,
         "duration_in_millis" : 815,
         "failures" : [ ],
         "shards" : {
            "total" : 9,
            "failed" : 0,
            "successful" : 9
         }
      }
   }
   ```

### 备份安全设置

集群管理员可以通过以下任一方式修改 OpenSearch Security 设置：

- 修改 YAML 文件并运行 `securityadmin.sh`
- 使用 admin 证书发送 REST API 请求
- 通过 OpenSearch Dashboards 进行更改

无论选择哪种方式，OpenSearch Security 都会将配置写入一个名为 `.opendistro_security` 的特殊系统索引。该系统索引在升级过程中会被保留，同时也保存在你创建的快照中。不过，恢复系统索引需要 `admin` 证书授予的高级访问权限。有关更多信息，请参阅[系统索引](/security/configuration/system-indices)和[配置 TLS 证书](/security/configuration/tls)。

你还可以在任意 OpenSearch 节点上运行带有 `-backup` 选项的 `securityadmin.sh`，将 OpenSearch Security 设置导出为 YAML 文件。这些 YAML 文件可用于使用现有配置重新初始化 `.opendistro_security` 索引。以下步骤将指导你生成这些备份文件，并将其复制到主机上存储：

1. 与 `os-node-01` 打开一个交互式伪终端（pseudo-TTY）会话：
   ```bash
   docker exec -it os-node-01 bash
   ```
1. 创建一个名为 `backups` 的目录并进入该目录：
   ```bash
   mkdir /usr/share/opensearch/backups && cd /usr/share/opensearch/backups
   ```
1. 使用 `securityadmin.sh` 在 `/usr/share/opensearch/backups/` 中创建 OpenSearch Security 设置的备份：
   ```bash
   /usr/share/opensearch/plugins/opensearch-security/tools/securityadmin.sh \
      -backup /usr/share/opensearch/backups \
      -icl \
      -nhnv \
      -cacert /usr/share/opensearch/config/root-ca.pem \
      -cert /usr/share/opensearch/config/admin.pem \
      -key /usr/share/opensearch/config/admin-key.pem
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   Security Admin v7
   Will connect to localhost:9300 ... done
   Connected as CN=A,OU=DOCS,O=OPENSEARCH,L=PORTLAND,ST=OREGON,C=US
   OpenSearch Version: 1.3.7
   OpenSearch Security Version: 1.3.7.0
   Contacting opensearch cluster 'opensearch' and wait for YELLOW clusterstate ...
   Clustername: opensearch-dev-cluster
   Clusterstate: GREEN
   Number of nodes: 4
   Number of data nodes: 4
   .opendistro_security index already exists, so we do not need to create one.
   Will retrieve '/config' into /usr/share/opensearch/backups/config.yml 
      SUCC: Configuration for 'config' stored in /usr/share/opensearch/backups/config.yml
   Will retrieve '/roles' into /usr/share/opensearch/backups/roles.yml 
      SUCC: Configuration for 'roles' stored in /usr/share/opensearch/backups/roles.yml
   Will retrieve '/rolesmapping' into /usr/share/opensearch/backups/roles_mapping.yml 
      SUCC: Configuration for 'rolesmapping' stored in /usr/share/opensearch/backups/roles_mapping.yml
   Will retrieve '/internalusers' into /usr/share/opensearch/backups/internal_users.yml 
      SUCC: Configuration for 'internalusers' stored in /usr/share/opensearch/backups/internal_users.yml
   Will retrieve '/actiongroups' into /usr/share/opensearch/backups/action_groups.yml 
      SUCC: Configuration for 'actiongroups' stored in /usr/share/opensearch/backups/action_groups.yml
   Will retrieve '/tenants' into /usr/share/opensearch/backups/tenants.yml 
      SUCC: Configuration for 'tenants' stored in /usr/share/opensearch/backups/tenants.yml
   Will retrieve '/nodesdn' into /usr/share/opensearch/backups/nodes_dn.yml 
      SUCC: Configuration for 'nodesdn' stored in /usr/share/opensearch/backups/nodes_dn.yml
   Will retrieve '/whitelist' into /usr/share/opensearch/backups/whitelist.yml 
      SUCC: Configuration for 'whitelist' stored in /usr/share/opensearch/backups/whitelist.yml
   Will retrieve '/audit' into /usr/share/opensearch/backups/audit.yml 
      SUCC: Configuration for 'audit' stored in /usr/share/opensearch/backups/audit.yml
   ```
1. **可选**：为 TLS 证书创建一个备份目录，并保存证书副本。如果每个节点使用不同的 TLS 证书，请对每个节点重复此操作：
   ```bash
   mkdir /usr/share/opensearch/backups/certs && cp /usr/share/opensearch/config/*pem /usr/share/opensearch/backups/certs/
   ```
1. 结束伪终端会话：
   ```bash
   exit
   ```
1. 将文件复制到主机：
   ```bash
   docker cp os-node-01:/usr/share/opensearch/backups ~/deploy/
   ```

## 执行升级

集群已配置完毕，重要的文件和设置也已备份，现在可以开始版本升级了。

::: info 注意
本节中的部分步骤（例如禁用分片复制和刷新事务日志）不会影响集群的性能。将这些步骤列入其中是作为最佳实践：如果客户端在整个升级过程中持续与 OpenSearch 集群交互（例如查询现有数据或索引文档），这些步骤可以显著提升集群性能。 
:::

1. 禁用分片复制，以停止 Lucene 索引段在集群内的移动：
   ```bash
   curl -H 'Content-type: application/json' \
      -X PUT "https://localhost:9201/_cluster/settings?pretty" \
      -d'{"persistent":{"cluster.routing.allocation.enable":"primaries"}}' \
      -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```json
   {
      "acknowledged" : true,
      "persistent" : {
         "cluster" : {
            "routing" : {
               "allocation" : {
                  "enable" : "primaries"
               }
            }
         }
      },
      "transient" : { }
   }
   ```
1. 对集群执行 flush 操作，将事务日志条目提交到 Lucene 索引：
   ```bash
   curl -X POST "https://localhost:9201/_flush?pretty" -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```json
   {
      "_shards" : {
         "total" : 20,
         "successful" : 20,
         "failed" : 0
      }
   }
   ```
1. 选择一个要升级的节点。由于该演示集群中的所有节点都符合集群管理器条件，因此可以按任意顺序升级节点。以下命令会停止并删除容器 `os-node-01`，但不会删除挂载的数据卷：
   ```bash
   docker stop os-node-01 && docker container rm os-node-01
   ```
1. 使用 `opensearchproject/opensearch:2.5.0` 镜像启动一个名为 `os-node-01` 的新容器，并使用与原容器相同的映射卷：
   ```bash
   docker run -d \
      -p 9201:9200 -p 9601:9600 \
      -e "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m" \
      --ulimit nofile=65536:65536 --ulimit memlock=-1:-1 \
      -v data-01:/usr/share/opensearch/data \
      -v repo-01:/usr/share/opensearch/snapshots \
      -v ~/deploy/opensearch-01.yml:/usr/share/opensearch/config/opensearch.yml \
      -v ~/deploy/root-ca.pem:/usr/share/opensearch/config/root-ca.pem \
      -v ~/deploy/admin.pem:/usr/share/opensearch/config/admin.pem \
      -v ~/deploy/admin-key.pem:/usr/share/opensearch/config/admin-key.pem \
      -v ~/deploy/os-node-01.pem:/usr/share/opensearch/config/os-node-01.pem \
      -v ~/deploy/os-node-01-key.pem:/usr/share/opensearch/config/os-node-01-key.pem \
      --network opensearch-dev-net \
      --ip 172.20.0.11 \
      --name os-node-01 \
      opensearchproject/opensearch:2.5.0
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   d26d0cb2e1e93e9c01bb00f19307525ef89c3c3e306d75913860e6542f729ea4
   ```
1. **可选**：查询集群，确定哪个节点正在担任集群管理器。在整个过程中，你可以随时运行此命令，查看何时选举出了新的集群管理器：
   ```bash
   curl -s "https://localhost:9201/_cat/nodes?v&h=name,version,node.role,master" \
      -ku admin:<custom-admin-password> | column -t
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   name        version  node.role  master
   os-node-01  2.5.0    dimr       -
   os-node-04  1.3.7    dimr       *
   os-node-02  1.3.7    dimr       -
   os-node-03  1.3.7    dimr       -
   ```
1. **可选**：查询集群，查看在移除和替换节点时分片分配如何变化。在整个过程中，你可以随时运行此命令，查看分片状态的变化：
   ```bash
   curl -s "https://localhost:9201/_cat/shards" \
      -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   security-auditlog-2023.03.06           0 p STARTED       53 214.5kb 172.20.0.13 os-node-03
   security-auditlog-2023.03.06           0 r UNASSIGNED                           
   .kibana_1                              0 p STARTED        3  14.5kb 172.20.0.12 os-node-02
   .kibana_1                              0 r STARTED        3  14.5kb 172.20.0.13 os-node-03
   ecommerce                              0 p STARTED     4675   3.9mb 172.20.0.12 os-node-02
   ecommerce                              0 r STARTED     4675   3.9mb 172.20.0.14 os-node-04
   security-auditlog-2023.03.07           0 p STARTED       37 175.7kb 172.20.0.14 os-node-04
   security-auditlog-2023.03.07           0 r UNASSIGNED                           
   .opendistro_security                   0 p STARTED       10  67.9kb 172.20.0.12 os-node-02
   .opendistro_security                   0 r STARTED       10  67.9kb 172.20.0.13 os-node-03
   .opendistro_security                   0 r STARTED       10  64.5kb 172.20.0.14 os-node-04
   .opendistro_security                   0 r UNASSIGNED                           
   security-auditlog-2023.02.27           0 p STARTED        4  80.5kb 172.20.0.12 os-node-02
   security-auditlog-2023.02.27           0 r UNASSIGNED                           
   security-auditlog-2023.02.28           0 p STARTED        6 104.1kb 172.20.0.14 os-node-04
   security-auditlog-2023.02.28           0 r UNASSIGNED                           
   opensearch_dashboards_sample_data_logs 0 p STARTED    14074   9.1mb 172.20.0.12 os-node-02
   opensearch_dashboards_sample_data_logs 0 r STARTED    14074   8.9mb 172.20.0.13 os-node-03
   .kibana_92668751_admin_1               0 r STARTED       33  37.3kb 172.20.0.13 os-node-03
   .kibana_92668751_admin_1               0 p STARTED       33  37.3kb 172.20.0.14 os-node-04
   ```
1. 停止 `os-node-02`：
   ```bash
   docker stop os-node-02 && docker container rm os-node-02
   ```
1. 使用 `opensearchproject/opensearch:2.5.0` 镜像启动一个名为 `os-node-02` 的新容器，并使用与原容器相同的映射卷：
   ```bash
   docker run -d \
      -p 9202:9200 -p 9602:9600 \
      -e "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m" \
      --ulimit nofile=65536:65536 --ulimit memlock=-1:-1 \
      -v data-02:/usr/share/opensearch/data \
      -v repo-01:/usr/share/opensearch/snapshots \
      -v ~/deploy/opensearch-02.yml:/usr/share/opensearch/config/opensearch.yml \
      -v ~/deploy/root-ca.pem:/usr/share/opensearch/config/root-ca.pem \
      -v ~/deploy/admin.pem:/usr/share/opensearch/config/admin.pem \
      -v ~/deploy/admin-key.pem:/usr/share/opensearch/config/admin-key.pem \
      -v ~/deploy/os-node-02.pem:/usr/share/opensearch/config/os-node-02.pem \
      -v ~/deploy/os-node-02-key.pem:/usr/share/opensearch/config/os-node-02-key.pem \
      --network opensearch-dev-net \
      --ip 172.20.0.12 \
      --name os-node-02 \
      opensearchproject/opensearch:2.5.0
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   7b802865bd6eb420a106406a54fc388ed8e5e04f6cbd908c2a214ea5ce72ac00
   ```
1. 停止 `os-node-03`：
   ```bash
   docker stop os-node-03 && docker container rm os-node-03
   ```
1. 使用 `opensearchproject/opensearch:2.5.0` 镜像启动一个名为 `os-node-03` 的新容器，并使用与原容器相同的映射卷：
   ```bash
   docker run -d \
      -p 9203:9200 -p 9603:9600 \
      -e "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m" \
      --ulimit nofile=65536:65536 --ulimit memlock=-1:-1 \
      -v data-03:/usr/share/opensearch/data \
      -v repo-01:/usr/share/opensearch/snapshots \
      -v ~/deploy/opensearch-03.yml:/usr/share/opensearch/config/opensearch.yml \
      -v ~/deploy/root-ca.pem:/usr/share/opensearch/config/root-ca.pem \
      -v ~/deploy/admin.pem:/usr/share/opensearch/config/admin.pem \
      -v ~/deploy/admin-key.pem:/usr/share/opensearch/config/admin-key.pem \
      -v ~/deploy/os-node-03.pem:/usr/share/opensearch/config/os-node-03.pem \
      -v ~/deploy/os-node-03-key.pem:/usr/share/opensearch/config/os-node-03-key.pem \
      --network opensearch-dev-net \
      --ip 172.20.0.13 \
      --name os-node-03 \
      opensearchproject/opensearch:2.5.0
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   d7f11726841a89eb88ff57a8cbecab392399f661a5205f0c81b60a995fc6c99d
   ```
1. 停止 `os-node-04`：
   ```bash
   docker stop os-node-04 && docker container rm os-node-04
   ```
1. 使用 `opensearchproject/opensearch:2.5.0` 镜像启动一个名为 `os-node-04` 的新容器，并使用与原容器相同的映射卷：
   ```bash
   docker run -d \
      -p 9204:9200 -p 9604:9600 \
      -e "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m" \
      --ulimit nofile=65536:65536 --ulimit memlock=-1:-1 \
      -v data-04:/usr/share/opensearch/data \
      -v repo-01:/usr/share/opensearch/snapshots \
      -v ~/deploy/opensearch-04.yml:/usr/share/opensearch/config/opensearch.yml \
      -v ~/deploy/root-ca.pem:/usr/share/opensearch/config/root-ca.pem \
      -v ~/deploy/admin.pem:/usr/share/opensearch/config/admin.pem \
      -v ~/deploy/admin-key.pem:/usr/share/opensearch/config/admin-key.pem \
      -v ~/deploy/os-node-04.pem:/usr/share/opensearch/config/os-node-04.pem \
      -v ~/deploy/os-node-04-key.pem:/usr/share/opensearch/config/os-node-04-key.pem \
      --network opensearch-dev-net \
      --ip 172.20.0.14 \
      --name os-node-04 \
      opensearchproject/opensearch:2.5.0
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   26f8286ab11e6f8dcdf6a83c95f265172f9557578a1b292af84c6f5ef8738e1d
   ```
1. 确认集群正在运行新版本：
   ```bash
   curl -s "https://localhost:9201/_cat/nodes?v&h=name,version,node.role,master" \
      -ku admin:<custom-admin-password> | column -t
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   name        version  node.role  master
   os-node-01  2.5.0    dimr       *
   os-node-02  2.5.0    dimr       -
   os-node-04  2.5.0    dimr       -
   os-node-03  2.5.0    dimr       -
   ```
1. 最后需要升级的组件是 OpenSearch Dashboards 节点。首先，停止并删除旧容器：
   ```bash
   docker stop os-dashboards-01 && docker rm os-dashboards-01
   ```
1. 创建一个运行目标版本 OpenSearch Dashboards 的新容器：
   ```bash
   docker run -d \
      -p 5601:5601 --expose 5601 \
      -v ~/deploy/opensearch_dashboards.yml:/usr/share/opensearch-dashboards/config/opensearch_dashboards.yml \
      -v ~/deploy/root-ca.pem:/usr/share/opensearch-dashboards/config/root-ca.pem \
      -v ~/deploy/os-dashboards-01.pem:/usr/share/opensearch-dashboards/config/os-dashboards-01.pem \
      -v ~/deploy/os-dashboards-01-key.pem:/usr/share/opensearch-dashboards/config/os-dashboards-01-key.pem \
      --network opensearch-dev-net \
      --ip 172.20.0.10 \
      --name os-dashboards-01 \
      opensearchproject/opensearch-dashboards:2.5.0
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   310de7a24cf599ca0b39b241db07fa8865592ebe15b6f5fda26ad19d8e1c1e09
   ```
1. 确保 OpenSearch Dashboards 容器已正常启动。可以使用类似以下的命令，确认对 <code>https://<var>HOST_ADDRESS</var>:5601</code> 的请求被重定向（HTTP 状态码 302）到 `/app/login?`：
   ```bash
   curl https://localhost:5601 -kI
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   HTTP/1.1 302 Found
   location: /app/login?
   osd-name: opensearch-dashboards-dev
   cache-control: private, no-cache, no-store, must-revalidate
   set-cookie: security_authentication=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; Path=/
   content-length: 0
   Date: Wed, 08 Mar 2023 15:36:53 GMT
   Connection: keep-alive
   Keep-Alive: timeout=120
   ```
1. 重新启用副本分片的分配：
   ```bash
   curl -H 'Content-type: application/json' \
      -X PUT "https://localhost:9201/_cluster/settings?pretty" \
      -d'{"persistent":{"cluster.routing.allocation.enable":"all"}}' \
      -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```json
   {
      "acknowledged" : true,
      "persistent" : {
         "cluster" : {
            "routing" : {
               "allocation" : {
                  "enable" : "all"
               }
            }
         }
      },
      "transient" : { }
   }
   ```

## 验证升级

你已经成功部署了一个安全的 OpenSearch 集群，索引了数据，创建了一个填充示例数据的仪表板，创建了一个新的内部用户，备份了重要文件，并将集群从 1.3.7 版本升级到 2.5.0。在继续探索和试用 OpenSearch 及 OpenSearch Dashboards 之前，你应该先验证升级结果。

对于此集群，升级后的验证步骤可以包括验证以下内容：

- [运行版本](#verifying-the-new-running-version)
- [健康状况和分片分配](#verifying-cluster-health-and-shard-allocation)
- [数据一致性](#verifying-data-consistency)

### 验证新的运行版本

1. 验证 OpenSearch 节点当前的运行版本：
   ```bash
   curl -s "https://localhost:9201/_cat/nodes?v&h=name,version,node.role,master" \
      -ku admin:<custom-admin-password> | column -t
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   name        version  node.role  master
   os-node-01  2.5.0    dimr       *
   os-node-02  2.5.0    dimr       -
   os-node-04  2.5.0    dimr       -
   os-node-03  2.5.0    dimr       -
   ```
1. 验证 OpenSearch Dashboards 当前的运行版本：
   1. **方式 1**：通过 Web 界面验证 OpenSearch Dashboards 版本。
      1. 打开 Web 浏览器，访问 Docker 主机的 `5601` 端口（例如 <code>https://<var>HOST_ADDRESS</var>:5601</code>）。
      1. 使用默认用户名（`admin`）和默认密码（`admin`）登录。
      1. 选择右上角的 **Help button**。版本会显示在弹出窗口中。
      1. 再次选择 **Help button** 关闭弹出窗口。
   1. **方式 2**：通过检查 `manifest.yml` 验证 OpenSearch Dashboards 版本。
      1. 在命令行中，与 OpenSearch Dashboards 容器打开一个交互式伪终端会话：
         ```bash
         docker exec -it os-dashboards-01 bash
         ```
      1. 检查 `manifest.yml` 中的版本：
         ```bash
         head -n 5 manifest.yml 
         ```
         <p class="codeblock-label">示例响应</p>

         ```bash
         ---
         schema-version: '1.1'
         build:
            name: OpenSearch Dashboards
            version: 2.5.0
         ```
      1. 结束伪终端会话：
         ```bash
         exit
         ```

### 验证集群健康状况和分片分配

1. 查询[集群健康](/api-reference/cluster-api/cluster-health) API 端点，查看集群的健康状况信息。你应该会看到 `green` 状态，表示所有主分片和副本分片均已分配：
   ```bash
   curl -s "https://localhost:9201/_cluster/health?pretty" -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```json
   {
      "cluster_name" : "opensearch-dev-cluster",
      "status" : "green",
      "timed_out" : false,
      "number_of_nodes" : 4,
      "number_of_data_nodes" : 4,
      "discovered_master" : true,
      "discovered_cluster_manager" : true,
      "active_primary_shards" : 16,
      "active_shards" : 36,
      "relocating_shards" : 0,
      "initializing_shards" : 0,
      "unassigned_shards" : 0,
      "delayed_unassigned_shards" : 0,
      "number_of_pending_tasks" : 0,
      "number_of_in_flight_fetch" : 0,
      "task_max_waiting_in_queue_millis" : 0,
      "active_shards_percent_as_number" : 100.0
   }
   ```
1. 查询 [CAT shards](/api-reference/cat/cat-shards) API 端点，查看集群升级后分片的分配情况：
   ```bash
   curl -s "https://localhost:9201/_cat/shards" -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```bash
   security-auditlog-2023.02.27           0 r STARTED     4  80.5kb 172.20.0.13 os-node-03
   security-auditlog-2023.02.27           0 p STARTED     4  80.5kb 172.20.0.11 os-node-01
   security-auditlog-2023.03.08           0 p STARTED    30  95.2kb 172.20.0.13 os-node-03
   security-auditlog-2023.03.08           0 r STARTED    30 123.8kb 172.20.0.11 os-node-01
   ecommerce                              0 p STARTED  4675   3.9mb 172.20.0.12 os-node-02
   ecommerce                              0 r STARTED  4675   3.9mb 172.20.0.13 os-node-03
   .kibana_1                              0 p STARTED     3   5.9kb 172.20.0.12 os-node-02
   .kibana_1                              0 r STARTED     3   5.9kb 172.20.0.11 os-node-01
   .kibana_92668751_admin_1               0 p STARTED    33  37.3kb 172.20.0.13 os-node-03
   .kibana_92668751_admin_1               0 r STARTED    33  37.3kb 172.20.0.11 os-node-01
   opensearch_dashboards_sample_data_logs 0 p STARTED 14074   9.1mb 172.20.0.12 os-node-02
   opensearch_dashboards_sample_data_logs 0 r STARTED 14074   9.1mb 172.20.0.14 os-node-04
   security-auditlog-2023.02.28           0 p STARTED     6  26.2kb 172.20.0.11 os-node-01
   security-auditlog-2023.02.28           0 r STARTED     6  26.2kb 172.20.0.14 os-node-04
   .opendistro-reports-definitions        0 p STARTED     0    208b 172.20.0.12 os-node-02
   .opendistro-reports-definitions        0 r STARTED     0    208b 172.20.0.13 os-node-03
   .opendistro-reports-definitions        0 r STARTED     0    208b 172.20.0.14 os-node-04
   security-auditlog-2023.03.06           0 r STARTED    53 174.6kb 172.20.0.12 os-node-02
   security-auditlog-2023.03.06           0 p STARTED    53 174.6kb 172.20.0.14 os-node-04
   .kibana_101107607_newuser_1            0 r STARTED     1   5.1kb 172.20.0.13 os-node-03
   .kibana_101107607_newuser_1            0 p STARTED     1   5.1kb 172.20.0.11 os-node-01
   .opendistro_security                   0 r STARTED    10  64.5kb 172.20.0.12 os-node-02
   .opendistro_security                   0 r STARTED    10  64.5kb 172.20.0.13 os-node-03
   .opendistro_security                   0 r STARTED    10  64.5kb 172.20.0.11 os-node-01
   .opendistro_security                   0 p STARTED    10  64.5kb 172.20.0.14 os-node-04
   .kibana_-152937574_admintenant_1       0 r STARTED     1   5.1kb 172.20.0.12 os-node-02
   .kibana_-152937574_admintenant_1       0 p STARTED     1   5.1kb 172.20.0.14 os-node-04
   security-auditlog-2023.03.07           0 r STARTED    37 175.7kb 172.20.0.12 os-node-02
   security-auditlog-2023.03.07           0 p STARTED    37 175.7kb 172.20.0.14 os-node-04
   .kibana_92668751_admin_2               0 p STARTED    34  38.6kb 172.20.0.13 os-node-03
   .kibana_92668751_admin_2               0 r STARTED    34  38.6kb 172.20.0.11 os-node-01
   .kibana_2                              0 p STARTED     3     6kb 172.20.0.13 os-node-03
   .kibana_2                              0 r STARTED     3     6kb 172.20.0.14 os-node-04
   .opendistro-reports-instances          0 r STARTED     0    208b 172.20.0.12 os-node-02
   .opendistro-reports-instances          0 r STARTED     0    208b 172.20.0.11 os-node-01
   .opendistro-reports-instances          0 p STARTED     0    208b 172.20.0.14 os-node-04
   ```

### 验证数据一致性

你需要再次查询 ecommerce 索引，以确认示例数据仍然存在：

1. 将此查询的响应与你在[使用 REST API 索引数据](#indexing-data-with-the-rest-api)的[最后一步](#validation)中收到的响应进行比较：
   ```bash
   curl -H 'Content-Type: application/json' \
      -X GET "https://localhost:9201/ecommerce/_search?pretty=true&filter_path=hits.total" \
      -d'{"query":{"match":{"customer_first_name":"Sonya"}}}' \
      -ku admin:<custom-admin-password>
   ```
   <p class="codeblock-label">示例响应</p>

   ```json
   {
      "hits" : {
         "total" : {
            "value" : 106,
            "relation" : "eq"
         }
      }
   }
   ```
1. 打开 Web 浏览器，访问 Docker 主机的 `5601` 端口（例如 <code>https://<var>HOST_ADDRESS</var>:5601</code>）。
1. 输入默认用户名（`admin`）和密码（`admin`）。
1. 在 OpenSearch Dashboards 的 **Home** 页面上，选择 Web 界面左上角的 **Menu button**，打开 **Navigation pane**。
1. 选择 **Dashboard**。
1. 选择 **[Logs] Web Traffic**，打开在前面添加示例数据时创建的仪表板。
1. 查看完仪表板后，选择 **Profile** 按钮。选择 **Log out**，以便以其他用户身份登录。
1. 输入升级前创建的用户名和密码，然后选择 **Log in**。

## 后续步骤

查看以下资源，进一步了解 OpenSearch 的工作原理：

- [REST API 参考](/api-reference/)
- [OpenSearch Dashboards 快速入门指南](/dashboards/quickstart)
- [关于 OpenSearch 中的安全功能](/security/)
