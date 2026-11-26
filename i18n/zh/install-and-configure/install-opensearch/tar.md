---
title: Tarball
---

# Tarball

通过 tarball（也称为 tar 归档文件）安装 OpenSearch，适合希望对文件权限、安装路径等安装细节进行精细控制的用户。

总体来说，通过 tarball 安装 OpenSearch 可以分为以下几个步骤：

1. **下载并解压 OpenSearch。**
1. **配置重要的系统设置。**
   - 这些设置在修改任何 OpenSearch 文件之前应用于主机。
1. **（可选）测试 OpenSearch。**
   - 在应用任何自定义配置之前，确认 OpenSearch 能够正常运行。
   - 可以在不启用任何安全功能（无密码、无证书）的情况下测试，也可以使用由打包脚本应用的演示安全配置进行测试。
1. **根据你的环境配置 OpenSearch。**
   -  为 OpenSearch 应用基本设置，并开始在你的环境中使用它。

tarball 是一个自包含的目录，其中包含运行 OpenSearch 所需的一切，包括集成的 Java 开发工具包（Java Development Kit，JDK）。这种安装方式兼容大多数 Linux 发行版，包括 CentOS 7、Amazon Linux 2 和 Ubuntu 18.04。如果你有自己的 Java 安装，并在终端中设置了环境变量 `JAVA_HOME`，那么在 macOS 上也可以使用。

::: info 注意
本指南假定你熟悉 Linux 命令行界面（CLI），了解如何输入命令、在目录之间切换以及编辑文本文件。部分示例命令使用 `vi` 文本编辑器，你也可以使用任何其他可用的文本编辑器。
:::

## 步骤 1：下载并解压 OpenSearch

1. 从 [OpenSearch 下载页面](https://opensearch.org/downloads.html)或通过命令行（例如使用 `wget`）下载相应的 tar.gz 归档文件。
   ```bash
   # x64
   wget https://artifacts.opensearch.org/releases/bundle/opensearch/2.12.0/opensearch-2.12.0-linux-x64.tar.gz

   # ARM64
   wget https://artifacts.opensearch.org/releases/bundle/opensearch/2.12.0/opensearch-2.12.0-linux-arm64.tar.gz
   ```
1. 解压 tarball 的内容。
   ```bash
   # x64
   tar -xvf opensearch-2.12.0-linux-x64.tar.gz
   
   # ARM64
   tar -xvf opensearch-2.12.0-linux-arm64.tar.gz
   ```

## 步骤 2：配置重要的系统设置

在启动 OpenSearch 之前，你应该检查一些[重要的系统设置](/install-and-configure/install-opensearch/)。
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

## 步骤 3：（可选）测试 OpenSearch

在继续之前，你应该先测试 OpenSearch 的安装情况。否则，以后出现问题时，很难判断问题是由安装引起的，还是由安装后应用的自定义设置引起的。在这一阶段，有两种快速测试 OpenSearch 的方法：

1. **（启用安全功能）** 使用 tar 归档文件中包含的演示安全脚本应用通用配置。
1. **（禁用安全功能）** 手动禁用 Security 插件，并在应用你自己的自定义安全设置之前测试实例。

演示安全脚本会为你的 OpenSearch 实例应用一套通用配置。该配置定义了一些环境变量，并应用自签名 TLS 证书。如果你想自行配置这些内容，请参阅[步骤 4：在你的环境中设置 OpenSearch](#step-4-set-up-opensearch-in-your-environment)。

如果你只想验证服务是否配置正确，并打算自行配置安全设置，则可以禁用 Security 插件，在不加密、不进行身份验证的情况下启动服务。

::: danger 警告
由演示安全脚本配置的 OpenSearch 节点（Node）不适用于生产环境。如果你计划在运行 `opensearch-tar-install.sh` 之后将该节点用于生产环境，至少应将演示 TLS 证书替换为你自己的 TLS 证书，并[更新内部用户和密码列表](/security/configuration/yaml)。请参阅[安全配置](/security/configuration/)获取更多指导，确保你的节点按照安全要求进行配置。
:::

### 方式 1：在启用安全功能的情况下测试 OpenSearch 设置

1. 切换到 OpenSearch 安装的顶层目录。
   ```bash
   cd /path/to/opensearch-2.12.0
   ```

1. 使用安全演示配置运行 OpenSearch 启动脚本。
   ```bash
   ./opensearch-tar-install.sh
   ```

   对于 OpenSearch 2.12 或更高版本，请在安装之前使用以下命令设置新的自定义管理员密码：
   ```bash
   $ export OPENSEARCH_INITIAL_ADMIN_PASSWORD=<custom-admin-password>
   ```

1. 打开另一个终端会话，向服务器发送请求，验证 OpenSearch 是否正在运行。注意这里使用了 `--insecure` 标志，这是因为 TLS 证书是自签名的。
   - 向 9200 端口发送请求：
      ```bash
      curl -X GET https://localhost:9200 -u 'admin:<custom-admin-password>' --insecure
      ```

      你应该会得到类似如下的响应：
      ```bash
      {
         "name" : "hostname",
         "cluster_name" : "opensearch",
         "cluster_uuid" : "6XNc9m2gTUSIoKDqJit0PA",
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
      ```bash
      curl -X GET https://localhost:9200/_cat/plugins?v -u 'admin:<custom-admin-password>' --insecure
      ```

      响应应类似如下：
      ```bash
      name     component                            version
      hostname opensearch-alerting                  2.12.0
      hostname opensearch-anomaly-detection         2.12.0
      hostname opensearch-asynchronous-search       2.12.0
      hostname opensearch-cross-cluster-replication 2.12.0
      hostname opensearch-index-management          2.12.0
      hostname opensearch-job-scheduler             2.12.0
      hostname opensearch-knn                       2.12.0
      hostname opensearch-ml                        2.12.0
      hostname opensearch-notifications             2.12.0
      hostname opensearch-notifications-core        2.12.0
      hostname opensearch-observability             2.12.0
      hostname opensearch-performance-analyzer      2.12.0
      hostname opensearch-reports-scheduler         2.12.0
      hostname opensearch-security                  2.12.0
      hostname opensearch-sql                       2.12.0
      ```
1. 返回最初的终端会话，按 `CTRL + C` 停止该进程。

### 方式 2：在禁用安全功能的情况下测试 OpenSearch 设置

1. 打开配置文件。
   ```bash
   vi /path/to/opensearch-2.12.0/config/opensearch.yml
   ```

1. 添加以下内容以禁用 Security 插件：
   ```bash
   plugins.security.disabled: true
   ```

1. 保存更改并关闭文件。
1. 打开另一个终端会话，向服务器发送请求，验证 OpenSearch 是否正在运行。由于 Security 插件已被禁用，你将使用 `HTTP` 而不是 `HTTPS` 发送命令。
   - 向 9200 端口发送请求。
      ```bash
      curl -X GET http://localhost:9200
      ```

      你应该会得到类似如下的响应：
      ```bash
      {
         "name" : "hostname",
         "cluster_name" : "opensearch",
         "cluster_uuid" : "6XNc9m2gTUSIoKDqJit0PA",
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
   - 查询插件端点。
      ```bash
      curl -X GET http://localhost:9200/_cat/plugins?v
      ```

      响应应类似如下：
      ```bash
      name     component                            version
      hostname opensearch-alerting                  2.12.0
      hostname opensearch-anomaly-detection         2.12.0
      hostname opensearch-asynchronous-search       2.12.0
      hostname opensearch-cross-cluster-replication 2.12.0
      hostname opensearch-index-management          2.12.0
      hostname opensearch-job-scheduler             2.12.0
      hostname opensearch-knn                       2.12.0
      hostname opensearch-ml                        2.12.0
      hostname opensearch-notifications             2.12.0
      hostname opensearch-notifications-core        2.12.0
      hostname opensearch-observability             2.12.0
      hostname opensearch-performance-analyzer      2.12.0
      hostname opensearch-reports-scheduler         2.12.0
      hostname opensearch-security                  2.12.0
      hostname opensearch-sql                       2.12.0
      ```

## 步骤 4：在你的环境中设置 OpenSearch

没有 OpenSearch 使用经验的用户可能需要一份推荐设置清单，以便开始使用该服务。默认情况下，OpenSearch 不绑定到网络接口，外部主机无法访问。此外，安全设置要么未定义（全新安装），要么在你通过调用 `opensearch-tar-install.sh` 运行了安全演示脚本后填充为默认用户名和密码。以下建议将帮助你把 OpenSearch 绑定到网络接口、创建并签发 TLS 证书，以及配置基本身份验证。

以下推荐设置可以帮助你：

- 将 OpenSearch 绑定到主机上的某个 IP 或网络接口。
- 设置 JVM 堆的初始大小和最大大小。
- 定义一个指向捆绑 JDK 的环境变量。
- 配置你自己的 TLS 证书——无需第三方证书颁发机构（CA）。
- 创建一个使用自定义密码的管理员用户。

::: info 注意
如果你运行过安全演示脚本，则需要手动重新配置被修改过的设置。在继续操作之前，请参阅[安全配置](/install-and-configure/configuring-opensearch/)获取指导。
:::

::: tip 提示
在修改任何配置文件之前，最好先保存一份备份。备份文件可用于撤销错误配置引起的问题。
:::

1. 打开 `opensearch.yml`。
   ```bash
   vi /path/to/opensearch-2.12.0/config/opensearch.yml
   ```

1. 添加以下内容。
   ```bash
   # 将 OpenSearch 绑定到正确的网络接口。使用 0.0.0.0
   # 表示包含所有可用接口，也可以指定分配给
   # 特定接口的 IP 地址。
   network.host: 0.0.0.0

   # 除非你已经配置了集群，否则应将 discovery.type
   # 设置为 single-node，不然启动服务时
   # 引导检查（bootstrap check）会失败。
   discovery.type: single-node

   # 如果你之前在 opensearch.yml 中禁用了 Security 插件，
   # 请务必重新启用它。否则可以跳过此设置。
   plugins.security.disabled: false
   ```

1. 保存更改并关闭文件。
1. 指定 JVM 堆的初始大小和最大大小。
   1.  打开 `jvm.options`。
         ```bash
         vi /path/to/opensearch-2.12.0/config/jvm.options
         ```

   1. 修改堆的初始大小和最大大小。一开始，你应将这两个值设置为可用系统内存的一半。对于专用主机，可以根据工作负载的需求适当调大该值。
      -  例如，如果主机有 8 GB 内存，你可以将堆的初始大小和最大大小设置为 4 GB：
         ```bash
         -Xms4g
         -Xmx4g
         ```

   1. 保存更改并关闭文件。
1. 指定内置 JDK 的位置。
   ```bash
   export OPENSEARCH_JAVA_HOME=/path/to/opensearch-2.12.0/jdk
   ```

### 配置 TLS

TLS 证书允许客户端确认主机的身份，并对客户端与主机之间的流量进行加密，从而为集群（Cluster）提供额外的安全保障。更多信息，请参阅 [Security 插件](/security/)文档中的[配置 TLS 证书](/security/configuration/tls)和[生成证书](/security/configuration/generate-certificates)。对于开发环境中的工作，自签名证书通常就足够了。本节将引导你完成生成自己的 TLS 证书并将其应用到 OpenSearch 主机所需的基本步骤。

1. 切换到 OpenSearch 的 `config` 目录，证书将存放在这里。
   ```bash
   cd /path/to/opensearch-2.12.0/config/
   ```

1. 生成根证书。你将使用它来签发其他证书。
   ```bash
   # 为根证书创建私钥
   openssl genrsa -out root-ca-key.pem 2048
   
   # 使用私钥创建自签名根证书。请务必
   # 替换传给 -subj 的参数，使其与你的主机相符。
   openssl req -new -x509 -sha256 -key root-ca-key.pem -subj "/C=CA/ST=ONTARIO/L=TORONTO/O=ORG/OU=UNIT/CN=ROOT" -out root-ca.pem -days 730
   ```
1. 接下来，创建管理员证书。该证书用于获取提升的权限，以执行与 Security 插件相关的管理任务。
   ```bash
   # 为管理员证书创建私钥。
   openssl genrsa -out admin-key-temp.pem 2048

   # 将私钥转换为 PKCS#8 格式。
   openssl pkcs8 -inform PEM -outform PEM -in admin-key-temp.pem -topk8 -nocrypt -v1 PBE-SHA1-3DES -out admin-key.pem
   
   # 创建 CSR。通用名称（CN）使用 "A" 即可，因为该证书
   # 用于验证提升的访问权限，并不与某个主机绑定。
   openssl req -new -key admin-key.pem -subj "/C=CA/ST=ONTARIO/L=TORONTO/O=ORG/OU=UNIT/CN=A" -out admin.csr
   
   # 使用之前创建的根证书和私钥签发管理员证书。
   openssl x509 -req -in admin.csr -CA root-ca.pem -CAkey root-ca-key.pem -CAcreateserial -sha256 -out admin.pem -days 730
   ```
1. 为正在配置的节点创建证书。
   ```bash
   # 为节点证书创建私钥。
   openssl genrsa -out node1-key-temp.pem 2048
   
   # 将私钥转换为 PKCS#8 格式。
   openssl pkcs8 -inform PEM -outform PEM -in node1-key-temp.pem -topk8 -nocrypt -v1 PBE-SHA1-3DES -out node1-key.pem
   
   # 创建 CSR，并替换传给 -subj 的参数，使其与你的主机相符。
   # CN 应与该主机的 DNS A 记录一致——不要使用主机名。
   openssl req -new -key node1-key.pem -subj "/C=CA/ST=ONTARIO/L=TORONTO/O=ORG/OU=UNIT/CN=node1.dns.a-record" -out node1.csr
   
   # 创建一个扩展文件，为该主机定义 SAN DNS 名称。
   # 该名称应与主机的 DNS A 记录一致。
   echo 'subjectAltName=DNS:node1.dns.a-record' > node1.ext
   
   # 使用之前创建的根证书和私钥签发节点证书。
   openssl x509 -req -in node1.csr -CA root-ca.pem -CAkey root-ca-key.pem -CAcreateserial -sha256 -out node1.pem -days 730 -extfile node1.ext
   ```
1. 删除不再需要的临时文件。
   ```bash
   rm *temp.pem *csr *ext
   ```

1. 按照[生成证书](/security/configuration/generate-certificates#add-distinguished-names-to-opensearchyml)中的说明，将这些证书添加到 `opensearch.yml`。高级用户也可以选择使用脚本追加这些设置：
   ```bash
   #! /bin/bash

   # 运行此脚本之前，请务必将 /path/to 替换为你的 OpenSearch 目录，
   # 并记得将节点可分辨名称中的 CN 替换为真实的
   # DNS A 记录。

   echo "plugins.security.ssl.transport.pemcert_filepath: /path/to/opensearch-2.12.0/config/node1.pem" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.ssl.transport.pemkey_filepath: /path/to/opensearch-2.12.0/config/node1-key.pem" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.ssl.transport.pemtrustedcas_filepath: /path/to/opensearch-2.12.0/config/root-ca.pem" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.ssl.http.enabled: true" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.ssl.http.pemcert_filepath: /path/to/opensearch-2.12.0/config/node1.pem" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.ssl.http.pemkey_filepath: /path/to/opensearch-2.12.0/config/node1-key.pem" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.ssl.http.pemtrustedcas_filepath: /path/to/opensearch-2.12.0/config/root-ca.pem" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.allow_default_init_securityindex: true" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.authcz.admin_dn:" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "  - 'CN=A,OU=UNIT,O=ORG,L=TORONTO,ST=ONTARIO,C=CA'" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.nodes_dn:" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "  - 'CN=node1.dns.a-record,OU=UNIT,O=ORG,L=TORONTO,ST=ONTARIO,C=CA'" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.audit.type: internal_opensearch" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.enable_snapshot_restore_privilege: true" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.check_snapshot_restore_write_privileges: true" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   echo "plugins.security.restapi.roles_enabled: [\"all_access\", \"security_rest_api_access\"]" | sudo tee -a /path/to/opensearch-2.12.0/config/opensearch.yml
   ```

1. （可选）为自签名根证书添加信任。
   ```bash
   # 将根证书复制到正确的目录
   sudo cp /path/to/opensearch-2.12.0/config/root-ca.pem /etc/pki/ca-trust/source/anchors/

   # 添加信任
   sudo update-ca-trust
   ```

### 配置用户

OpenSearch 可以通过多种方式定义和验证用户。其中一种无需额外后端基础设施的方法是在 `internal_users.yml` 中手动配置用户。有关配置用户的更多信息，请参阅 [YAML 文件](/security/configuration/yaml)。以下步骤说明了如何删除除 `admin` 用户之外的所有演示用户，以及如何使用脚本替换 `admin` 的默认密码。

1. 为 Security 插件的脚本添加可执行权限。
   ```bash
   chmod 755 /path/to/opensearch-2.12.0/plugins/opensearch-security/tools/*.sh
   ```

1. 运行 `hash.sh` 生成新密码。
   - 如果未定义 JDK 的路径，该脚本会运行失败。
      ```bash
      # 未找到 JDK 时的输出示例……
      $ ./hash.sh
      **************************************************************************
      ** This tool will be deprecated in the next major release of OpenSearch **
      ** https://github.com/opensearch-project/security/issues/1755           **
      **************************************************************************
      which: no java in (/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/home/user/.local/bin:/home/user/bin)
      WARNING: nor OPENSEARCH_JAVA_HOME nor JAVA_HOME is set, will use 
      ./hash.sh: line 35: java: command not found
      ```

   - 为避免出现问题，请在调用脚本时声明环境变量：
      ```bash
      OPENSEARCH_JAVA_HOME=/path/to/opensearch-2.12.0/jdk ./hash.sh
      ```

   - 在提示符处输入所需的密码，并记下输出的哈希值。
1. 打开 `internal_users.yml`。
   ```bash
   vi /path/to/opensearch-2.12.0/config/opensearch-security/internal_users.yml
   ```

1. 删除除 `admin` 之外的所有演示用户，并将哈希值替换为之前步骤中 `hash.sh` 输出的值。该文件应类似以下示例：
   ```bash
   ---
   # 这是内部用户数据库
   # 哈希值为 bcrypt 哈希，可以使用 plugin/tools/hash.sh 生成

   _meta:
      type: "internalusers"
      config_version: 2

   # 在此处定义你的内部用户

   admin:
      hash: "$2y$1EXAMPLEQqwS8TUcoEXAMPLEeZ3lEHvkEXAMPLERqjyh1icEXAMPLE."
      reserved: true
      backend_roles:
      - "admin"
      description: "Admin user"
   ```

### 应用更改

现在 TLS 证书已经安装完毕，演示用户也已删除或分配了新密码，最后一步是应用这些配置更改。这最后一个配置步骤需要在主机上运行 OpenSearch 的同时调用 `securityadmin.sh`。

1. 启动 OpenSearch。`securityadmin.sh` 只有在 OpenSearch 运行时才能应用更改。
   ```bash
   # 切换目录
   cd /path/to/opensearch-2.12.0/bin

   # 在前台运行服务
   ./opensearch
   ```
1. 在主机上另开一个终端会话，并切换到包含 `securityadmin.sh` 的目录。
   ```bash
   # 切换到正确的目录
   cd /path/to/opensearch-2.12.0/plugins/opensearch-security/tools
   ```
1. 调用该脚本。有关必须传入的参数的定义，请参阅[使用 securityadmin.sh 应用更改](/security/configuration/security-admin)。
   ```bash
   # 如果已在 $PATH 中声明了该环境变量，则可以省略。
   OPENSEARCH_JAVA_HOME=/path/to/opensearch-2.12.0/jdk ./securityadmin.sh -cd /path/to/opensearch-2.12.0/config/opensearch-security/ -cacert /path/to/opensearch-2.12.0/config/root-ca.pem -cert /path/to/opensearch-2.12.0/config/admin.pem -key /path/to/opensearch-2.12.0/config/admin-key.pem -icl -nhnv
   ```
1. 停止并重启正在运行的 OpenSearch 进程，以应用更改。

### 验证服务是否正在运行

现在，OpenSearch 已在你的主机上运行，并使用了自定义 TLS 证书和用于基本身份验证的安全用户。你可以从另一台主机向 OpenSearch 节点发送 API 请求，以验证外部连通性。

在之前的测试中，你将请求发送到了 `localhost`。现在已应用了 TLS 证书，且新证书引用的是主机的实际 DNS 记录，因此发往 `localhost` 的请求将无法通过 CN 检查，证书会被视为无效。你应该将请求发送到生成证书时指定的地址。

::: tip 提示
在发送请求之前，你应该在客户端上添加对根证书的信任。如果不添加信任，则必须使用 `-k` 选项，让 cURL 忽略 CN 和根证书校验。
:::

```bash
$ curl https://your.host.address:9200 -u admin:yournewpassword -k
{
  "name" : "hostname-here",
  "cluster_name" : "opensearch",
  "cluster_uuid" : "efC0ANNMQlGQ5TbhNflVPg",
  "version" : {
    "distribution" : "opensearch",
    "number" : "2.1.0",
    "build_type" : "tar",
    "build_hash" : "388c80ad94529b1d9aad0a735c4740dce2932a32",
    "build_date" : "2022-06-30T21:31:04.823801692Z",
    "build_snapshot" : false,
    "lucene_version" : "9.2.0",
    "minimum_wire_compatibility_version" : "7.10.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "The OpenSearch Project: https://opensearch.org/"
}
```

### 使用 systemd 将 OpenSearch 作为服务运行

本节将引导你为 OpenSearch 创建服务并将其注册到 `systemd`。定义服务之后，你就可以使用 `systemctl` 命令启用、启动和停止 OpenSearch 服务。本节中的命令以 OpenSearch 安装在 `/opt/opensearch` 的环境为例，请根据你的安装路径进行相应修改。

::: danger 警告
以下配置仅适用于在非生产环境中进行测试，我们不建议在生产环境中使用。如果你希望在主机上将 OpenSearch 作为由 systemd 管理的服务运行，应使用 [RPM](/install-and-configure/install-opensearch/rpm) 发行包安装 OpenSearch。tarball 安装方式不会定义特定的安装路径、用户、角色（Role）或权限。如果未能妥善保护主机环境，可能会导致意外行为。
:::

1. 为 OpenSearch 服务创建用户。
   ```bash
   sudo adduser --system --shell /bin/bash -U --no-create-home opensearch
   ```

1. 将你的用户添加到 `opensearch` 用户组。
   ```bash
   sudo usermod -aG opensearch $USER
   ```

1. 将文件所有者更改为 `opensearch`。如果你的 OpenSearch 文件位于其他目录，请务必修改路径。
   ```bash
   sudo chown -R opensearch /opt/opensearch/
   ```

1. 创建服务文件并打开进行编辑。
   ```bash
   sudo vi /etc/systemd/system/opensearch.service
   ```

1. 输入以下示例服务配置。如果你的 OpenSearch 文件位于其他目录，请务必修改其中引用的路径。
   ```bash
   [Unit]
   Description=OpenSearch
   Wants=network-online.target
   After=network-online.target

   [Service]
   Type=forking
   RuntimeDirectory=data

   WorkingDirectory=/opt/opensearch
   ExecStart=/opt/opensearch/bin/opensearch -d

   User=opensearch
   Group=opensearch
   StandardOutput=journal
   StandardError=inherit
   LimitNOFILE=65535
   LimitNPROC=4096
   LimitAS=infinity
   LimitFSIZE=infinity
   TimeoutStopSec=0
   KillSignal=SIGTERM
   KillMode=process
   SendSIGKILL=no
   SuccessExitStatus=143
   TimeoutStartSec=75

   [Install]
   WantedBy=multi-user.target
   ```

1. 重新加载 `systemd` 管理器配置。
   ```bash
   sudo systemctl daemon-reload
   ```

1. 启用 OpenSearch 服务。
   ```bash
   sudo systemctl enable opensearch.service
   ```

1. 启动 OpenSearch 服务。
   ```bash
   sudo systemctl start opensearch
   ```

1. 验证服务是否正在运行。
   ```bash
   sudo systemctl status opensearch
   ```

## 相关链接

- [OpenSearch 配置](/install-and-configure/configuring-opensearch/)
- [为 Tarball 安装配置 Performance Analyzer](/monitoring-your-cluster/pa/#install-performance-analyzer)
- [安装和配置 OpenSearch Dashboards](/install-and-configure/install-dashboards/)
- [OpenSearch 插件安装](/install-and-configure/plugins)
- [关于 Security 插件](/security/)
