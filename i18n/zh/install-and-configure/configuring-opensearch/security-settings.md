---
title: 安全设置
---

# 安全设置

Security 插件（plugin）提供了许多 YAML 配置文件，用于存储必要的设置，这些设置定义了 Security 插件如何管理集群（Cluster）中的用户、角色（role）和活动。有关 Security 插件配置文件的完整列表，请参阅[修改 YAML 文件](/security/configuration/yaml)。

以下各节介绍 `opensearch.yml` 中与安全相关的设置。要了解有关静态设置和动态设置的更多信息，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。

## 通用设置

Security 插件支持以下通用设置：

-  `plugins.security.nodes_dn`（静态）：指定一个可分辨名称（Distinguished Name，DN）列表，用于标识集群中的其他节点（Node）。此设置支持通配符和正则表达式。当 `plugins.security.nodes_dn_dynamic_config_enabled` 为 `true` 时，**除了** YAML 配置之外，还会从安全索引（Index）中读取 DN 列表。

- `plugins.security.nodes_dn_dynamic_config_enabled`（静态）：适用于 `cross_cluster` 场景，在这类场景中需要管理允许列表中的 `nodes_dn`，而无需在每次配置新的 `cross_cluster` 远程集群时重启节点。
  将 `nodes_dn_dynamic_config_enabled` 设置为 `true` 会启用**仅超级管理员可调用**的 Distinguished Names API，该 API 提供了动态更新或获取 `nodes_dn` 的方法。仅当未设置 `plugins.security.cert.intercluster_request_evaluator_class` 时，此设置才会生效。默认值为 `false`。

- `plugins.security.authcz.admin_dn`（静态）：定义应被授予管理员权限的证书的 DN。必需。

- `plugins.security.roles_mapping_resolution`（静态）：定义后端角色如何映射到 Security 角色。
        
    有效值为：
    - `MAPPING_ONLY`（默认）：必须在 `roles_mapping.yml` 中显式配置映射。
    - `BACKENDROLES_ONLY`：后端角色直接映射到安全角色。`roles_mapping.yml` 中的设置不起作用。
    - `BOTH`：后端角色既直接映射到安全角色，也通过 `roles_mapping.yml` 进行映射。

- `plugins.security.dls.mode`（静态）：设置文档级安全（Document-level Security，DLS）的评估模式。默认值为 `adaptive`。请参阅[如何设置 DLS 评估模式](/security/access-control/document-level-security#how-to-set-the-dls-evaluation-mode-in-opensearchyml)。

- `plugins.security.compliance.salt`（静态）：为字段掩码生成哈希值时使用的盐值。长度至少为 32 个字符，只允许使用 ASCII 字符。可选。

- `config.dynamic.http.anonymous_auth_enabled`（静态）：启用匿名认证。这将使所有 HTTP 认证器都不发起认证质询。默认值为 `false`。

## REST 管理 API 设置

Security 插件支持以下 REST 管理 API 设置：

- `plugins.security.restapi.roles_enabled`（静态）：为列出的角色启用基于角色的 REST 管理 API 访问。角色之间以逗号分隔。默认值为空列表（不允许任何角色访问 REST 管理 API）。请参阅 [API 的访问控制](/security/access-control/api#access-control-for-the-api)。

- `plugins.security.restapi.endpoints_disabled.<role>.<endpoint>`（静态）：为角色禁用特定的端点及其 HTTP 方法。此设置的值是一个由 HTTP 方法组成的数组。例如：`plugins.security.restapi.endpoints_disabled.all_access.ACTIONGROUPS: ["PUT","POST","DELETE"]`。默认情况下，允许所有端点和方法。现有端点包括 `ACTIONGROUPS`、`CACHE`、`CONFIG`、`ROLES`、`ROLESMAPPING`、`INTERNALUSERS`、`SYSTEMINFO`、`PERMISSIONSINFO` 和 `LICENSE`。请参阅 [API 的访问控制](/security/access-control/api#access-control-for-the-api)。

- `plugins.security.restapi.password_validation_regex`（静态）：指定一个正则表达式，用于设置登录密码的规则。有关更多信息，请参阅[密码设置](/security/configuration/yaml#password-settings)。

- `plugins.security.restapi.password_validation_error_message`（静态）：指定密码未通过验证时显示的错误消息。此设置与 `plugins.security.restapi.password_validation_regex` 配合使用。

- `plugins.security.restapi.password_min_length`（静态）：设置使用基于评分的密码强度评估器时密码的最小字符数。默认值为 8，这也是最小值。有关更多信息，请参阅[密码设置](/security/configuration/yaml#password-settings)。

- `plugins.security.restapi.password_score_based_validation_strength`（静态）：设置用于判断密码强弱的阈值。有效值为 `fair`、`good`、`strong` 和 `very_strong`。此设置与 `plugins.security.restapi.password_min_length` 配合使用。

- `plugins.security.unsupported.restapi.allow_securityconfig_modification`（静态）：允许对配置 API 使用 PUT 和 PATCH 方法。

## 高级设置

Security 插件支持以下高级设置：

- `plugins.security.authcz.impersonation_dn`（静态）：启用传输层模拟。这允许 DN 模拟其他用户。请参阅[用户模拟](/security/access-control/impersonation)。

- `plugins.security.authcz.rest_impersonation_user`（静态）：启用 REST 层模拟。这允许用户模拟其他用户。请参阅[用户模拟](/security/access-control/impersonation)。

- `plugins.security.allow_default_init_securityindex`（静态）：设置为 `true` 时，如果配置索引不存在，OpenSearch Security 会使用 `/config` 目录中的文件自动初始化该索引。

  ::: danger 警告
  这将使用众所周知的默认密码。仅可在私有网络/环境中使用。
  :::

- `plugins.security.allow_unsafe_democertificates`（静态）：设置为 `true` 时，OpenSearch 会使用演示证书启动。这些证书仅用于演示目的。

  ::: danger 警告
  这些证书是公开已知的，因此在生产环境中并不安全。仅可在私有网络/环境中使用。
  :::

- `plugins.security.system_indices.permission.enabled`（静态）：启用系统索引权限（permission）功能。设置为 `true` 时启用该功能，拥有修改角色权限的用户可以创建包含授予系统索引访问权限的角色。设置为 `false` 时禁用该权限，只有持有管理员证书的管理员才能更改系统索引。在新集群中，该权限默认设置为 `false`。

## 专家级设置

::: danger 警告
专家级设置只应由完全了解该功能的管理员进行配置和部署。对功能的误解可能会带来安全风险、导致 Security 插件无法正常运行或造成数据丢失。
:::

Security 插件支持以下专家级设置：

- `plugins.security.config_index_name`（静态）：`.opendistro_security` 存储其配置所使用的索引名称。

- `plugins.security.cert.oid`（静态）：定义服务器节点证书的对象标识符（Object Identifier，OID）。

- `plugins.security.cert.intercluster_request_evaluator_class`（静态）：指定用于评估集群间请求的 `org.opensearch.security.transport.InterClusterRequestEvaluator` 实现。`org.opensearch.security.transport.InterClusterRequestEvaluator` 的实例必须实现一个单参数构造函数，该参数为 `org.opensearch.common.settings.Settings` 对象。

- `plugins.security.enable_snapshot_restore_privilege`（静态）：设置为 `false` 时，此设置会禁止普通用户进行快照（Snapshot）恢复。在这种情况下，只接受使用管理员 TLS 证书签名的快照恢复请求。设置为 `true`（默认值）时，如果普通用户拥有 `cluster:admin/snapshot/restore`、`indices:admin/create` 和 `indices:data/write/index` 权限，则可以恢复快照。

  ::: info 注意
  只有当快照不包含全局状态且不恢复 `.opendistro_security` 索引时，才能恢复该快照。
  :::

- `plugins.security.check_snapshot_restore_write_privileges`（静态）：设置为 `false` 时，会跳过额外的索引检查。设置为默认值 `true` 时，会针对 `indices:admin/create` 和 `"indices:data/write/index` 评估快照恢复操作。

- `plugins.security.cache.ttl_minutes`（静态）：确定认证缓存的超时时间。认证缓存会临时存储从后端返回的用户对象，使 Security 插件无需重复请求这些对象，从而加快认证速度。该值以分钟为单位。默认值为 `60`。将该值设置为 `0` 可禁用缓存。

- `plugins.security.disabled`（静态）：禁用 OpenSearch Security。

  ::: danger 警告
  禁用此插件可能会将你的配置（包括密码）暴露给公众。
  :::

- `plugins.security.protected_indices.enabled`（静态）：如果设置为 `true`，则启用受保护索引。受保护索引比普通索引更安全。与其他传统索引一样，访问这些索引需要一个角色，而要使其可见还需要另一个角色。此设置与 `plugins.security.protected_indices.roles` 和 `plugins.security.protected_indices.indices` 设置配合使用。

- `plugins.security.protected_indices.roles`（静态）：指定一个角色列表，用户必须映射到其中的角色才能访问受保护索引。

- `plugins.security.protected_indices.indices`（静态）：指定要标记为受保护的索引列表。这些索引仅对映射到 `plugins.security.protected_indices.roles` 中指定角色的用户可见。满足此要求后，用户仍需映射到用于授予该索引访问权限的传统角色。

- `plugins.security.system_indices.enabled`（静态）：如果设置为 `true`，则启用系统索引。系统索引与安全索引类似，只是其内容不加密。配置为系统索引的索引可以由超级管理员或拥有包含[系统索引权限](/security/access-control/permissions#system-index-permissions)的角色的用户访问。有关系统索引的更多信息，请参阅[系统索引](/security/configuration/system-indices)。

- `plugins.security.system_indices.indices`（静态）：用作系统索引的索引列表。此设置由 `plugins.security.system_indices.enabled` 设置控制。

- `plugins.security.allow_default_init_securityindex`（静态）：设置为 `true` 时，如果 OpenSearch 启动时创建安全索引失败，则将 Security 插件设置为其默认安全设置。默认安全设置存储在 `opensearch-project/security/config` 目录下的 YAML 文件中。默认值为 `false`。

- `plugins.security.cert.intercluster_request_evaluator_class`（静态）：用于评估集群间通信的类。

- `plugins.security.enable_snapshot_restore_privilege`（静态）：允许授予快照恢复权限。可选。默认值为 `true`。

- `plugins.security.check_snapshot_restore_write_privileges`（静态）：在创建快照时强制执行写权限评估。默认值为 `true`。

## 审计日志设置

Security 插件支持以下审计日志设置：

- `plugins.security.audit.enable_rest`（动态）：启用或禁用 REST 请求日志记录。默认值为 `true`（启用）。

- `plugins.security.audit.enable_transport`（动态）：启用或禁用传输层请求日志记录。默认值为 `false`（禁用）。

- `plugins.security.audit.resolve_bulk_requests`（动态）：启用或禁用批量请求日志记录。启用后，批量请求中的所有子请求也会被记录。默认值为 `false`（禁用）。

- `plugins.security.audit.config.disabled_categories`（动态）：禁用指定的事件类别。

- `plugins.security.audit.ignore_requests`（动态）：将指定的请求排除在日志记录之外。允许使用包含操作或 REST 请求路径的通配符和正则表达式。

- `plugins.security.audit.threadpool.size`（静态）：确定用于记录事件的线程池中的线程数。默认值为 `10`。将此值设置为 `0` 会禁用线程池，这意味着插件会同步记录事件。

- `plugins.security.audit.threadpool.max_queue_len`（静态）：设置每个线程的最大队列长度。默认值为 `100000`。

- `plugins.security.audit.ignore_users`（动态）：一个用户数组。来自列表中用户的审计请求不会被记录。

- `plugins.security.audit.type`（静态）：审计日志事件的目标位置。有效值为 `internal_opensearch`、`external_opensearch`、`debug` 和 `webhook`。

- `plugins.security.audit.config.http_endpoints`（静态）：`localhost` 的端点列表。

- `plugins.security.audit.config.index`（静态）：审计日志索引。默认值为 `auditlog6`。该索引可以是静态索引，也可以是包含日期以便按天滚动的索引，例如 `"'auditlog6-'YYYY.MM.dd"`。无论哪种情况，都要确保妥善保护该索引。

- `plugins.security.audit.config.type`（静态）：将审计日志类型指定为 `auditlog`。

- `plugins.security.audit.config.username`（静态）：审计日志配置的用户名。

- `plugins.security.audit.config.password`（静态）：审计日志配置的密码。

- `plugins.security.audit.config.enable_ssl`（静态）：为审计日志启用或禁用 SSL。

- `plugins.security.audit.config.verify_hostnames`（静态）：启用或禁用 SSL/TLS 证书的主机名验证。默认值为 `true`（启用）。

- `plugins.security.audit.config.enable_ssl_client_auth`（静态）：启用或禁用 SSL/TLS 客户端认证。默认值为 `false`（禁用）。

- `plugins.security.audit.config.cert_alias`（静态）：用于访问审计日志的证书别名。

- `plugins.security.audit.config.pemkey_filepath`（静态）：用于审计日志的 Privacy Enhanced Mail（PEM）密钥的文件路径（相对于 `/config`）。

- `plugins.security.audit.config.pemkey_content`（静态）：用于审计日志的 PEM 密钥的 base64 编码内容。可用于替代 `...config.pemkey_filepath`。

- `plugins.security.audit.config.pemkey_password`（静态）：客户端使用的 PEM 格式私钥的密码。

- `plugins.security.audit.config.pemcert_filepath`（静态）：用于审计日志的 PEM 证书的文件路径（相对于 `/config`）。

- `plugins.security.audit.config.pemcert_content`（静态）：用于审计日志的 PEM 证书的 base64 编码内容。可用于替代通过 `...config.pemcert_filepath` 指定文件路径的方式。

- `plugins.security.audit.config.pemtrustedcas_filepath`（静态）：受信任的根证书颁发机构的文件路径（相对于 `/config`）。

- `plugins.security.audit.config.pemtrustedcas_content`（静态）：根证书颁发机构的 base64 编码内容。可用于替代 `...config.pemtrustedcas_filepath`。

- `plugins.security.audit.config.webhook.url`（静态）：webhook 的 URL。

- `plugins.security.audit.config.webhook.format`（静态）：webhook 使用的格式。有效值为 `URL_PARAMETER_GET`、`URL_PARAMETER_POST`、`TEXT`、`JSON` 和 `SLACK`。

- `plugins.security.audit.config.webhook.ssl.verify`（静态）：启用或禁用对随 webhook 请求发送的 SSL/TLS 证书的验证。默认值为 `true`（启用）。

- `plugins.security.audit.config.webhook.ssl.pemtrustedcas_filepath`（静态）：用于验证 webhook 请求的受信任证书颁发机构的文件路径（相对于 `/config`）。

- `plugins.security.audit.config.webhook.ssl.pemtrustedcas_content`（静态）：用于验证 webhook 请求的证书颁发机构的 base64 编码内容。可用于替代 `...config.pemtrustedcas_filepath`。

- `plugins.security.audit.config.log4j.logger_name`（静态）：Log4j 日志记录器的自定义名称。

- `plugins.security.audit.config.log4j.level`（静态）：为 Log4j 日志记录器提供默认日志级别。有效值为 `OFF`、`FATAL`、`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE` 和 `ALL`。默认值为 `INFO`。

- `opendistro_security.audit.config.disabled_rest_categories`（动态）：日志记录器要忽略的 REST 类别列表。有效值为 `AUTHENTICATED` 和 `GRANTED_PRIVILEGES`。

- `opendistro_security.audit.config.disabled_transport_categories`（动态）：日志记录器要忽略的传输层类别列表。有效值为 `AUTHENTICATED` 和 `GRANTED_PRIVILEGES`。

## 主机名验证和 DNS 查找设置

Security 插件支持以下主机名验证和 DNS 查找设置：

- `plugins.security.ssl.transport.enforce_hostname_verification`（静态）：是否在传输层验证主机名。可选。默认值为 `true`。

- `plugins.security.ssl.transport.resolve_hostname`（静态）：是否在传输层通过 DNS 解析主机名。可选。默认值为 `true`。仅在启用主机名验证时有效。

有关更多信息，请参阅[主机名验证和 DNS 查找](/security/configuration/tls#advanced-hostname-verification-and-dns-lookup)。

## 客户端认证设置

Security 插件支持以下客户端认证设置：

- `plugins.security.ssl.http.clientauth_mode`（静态）：要使用的 TLS 客户端认证模式。有效值为 `OPTIONAL`（默认）、`REQUIRE` 和 `NONE`。可选。

有关更多信息，请参阅[客户端认证](/security/configuration/tls#advanced-client-authentication)。

## 启用的密码套件和协议设置

Security 插件支持以下启用的密码套件和协议设置。每个设置都必须以数组形式表示：

- `plugins.security.ssl.http.enabled_ciphers`（静态）：REST 层启用的 TLS 密码套件。仅支持 Java 格式。

- `plugins.security.ssl.http.enabled_protocols`（静态）：REST 层启用的 TLS 协议。仅支持 Java 格式。

- `plugins.security.ssl.transport.enabled_ciphers`（静态）：传输层启用的 TLS 密码套件。仅支持 Java 格式。

- `plugins.security.ssl.transport.enabled_protocols`（静态）：传输层启用的 TLS 协议。仅支持 Java 格式。

有关更多信息，请参阅[启用的密码套件和协议](/security/configuration/tls#advanced-enabled-ciphers-and-protocols)。

## 密钥库和信任库文件——传输层 TLS 设置 {#key-store-and-trust-store-files---transport-layer-tls-settings}

Security 插件支持以下传输层 TLS 密钥库和信任库设置：

- `plugins.security.ssl.transport.keystore_type`（静态）：密钥库文件的类型。可选。有效值为 `JKS` 或 `PKCS12/PFX`。默认值为 `JKS`。

- `plugins.security.ssl.transport.keystore_filepath`（静态）：密钥库文件的路径，该文件必须位于 `config` 目录下，使用相对路径指定。必需。

- `plugins.security.ssl.transport.keystore_alias`（静态）：密钥库别名。可选。默认为第一个别名。

- `plugins.security.ssl.transport.keystore_password`（静态）：密钥库密码。默认值为 `changeit`。

- `plugins.security.ssl.transport.truststore_type`（静态）：信任库文件的类型。可选。有效值为 `JKS` 或 `PKCS12/PFX`。默认值为 `JKS`。

- `plugins.security.ssl.transport.truststore_filepath`（静态）：信任库文件的路径，该文件必须位于 `config` 目录下，使用相对路径指定。必需。

- `plugins.security.ssl.transport.truststore_alias`（静态）：信任库别名。可选。默认为所有证书。

- `plugins.security.ssl.transport.truststore_password`（静态）：信任库密码。默认值为 `changeit`。

有关密钥库和信任库文件的更多信息，请参阅[传输层 TLS](/security/configuration/tls#transport-layer-tls-1)。

## 密钥库和信任库文件——REST 层 TLS 设置 {#key-store-and-trust-store-files---rest-layer-tls-settings}

Security 插件支持以下 REST 层 TLS 密钥库和信任库设置：

- `plugins.security.ssl.http.enabled`（静态）：是否在 REST 层启用 TLS。如果启用，则只允许使用 HTTPS。可选。默认值为 `false`。

- `plugins.security.ssl.http.keystore_type`（静态）：密钥库文件的类型。可选。有效值为 `JKS` 或 `PKCS12/PFX`。默认值为 `JKS`。

- `plugins.security.ssl.http.keystore_filepath`（静态）：密钥库文件的路径，该文件必须位于 `config` 目录下，使用相对路径指定。必需。

- `plugins.security.ssl.http.keystore_alias`（静态）：密钥库别名。可选。默认为第一个别名。

- `plugins.security.ssl.http.keystore_password`：密钥库密码。默认值为 `changeit`。

- `plugins.security.ssl.http.truststore_type`：信任库文件的类型。可选。有效值为 `JKS` 或 `PKCS12/PFX`。默认值为 `JKS`。

- `plugins.security.ssl.http.truststore_filepath`：信任库文件的路径，该文件必须位于 `config` 目录下，使用相对路径指定。必需。

- `plugins.security.ssl.http.truststore_alias`（静态）：信任库别名。可选。默认为所有证书。

- `plugins.security.ssl.http.truststore_password`（静态）：信任库密码。默认值为 `changeit`。

有关更多信息，请参阅 [REST 层 TLS](/security/configuration/tls#rest-layer-tls-1)。

## OpenSSL 设置

Security 插件支持以下 OpenSSL 设置：

- `plugins.security.ssl.transport.enable_openssl_if_available`（静态）：如果可用，则在传输层启用 OpenSSL。可选。默认值为 `true`。

- `plugins.security.ssl.http.enable_openssl_if_available`（静态）：如果可用，则在 REST 层启用 OpenSSL。可选。默认值为 `true`。

有关更多信息，请参阅 [OpenSSL](/security/configuration/tls#advanced-openssl)。

## X.509 PEM 证书和 PKCS #8 密钥——传输层 TLS 设置 {#x509-pem-certificates-and-pkcs-8-keys---transport-layer-tls-settings}

Security 插件支持以下与 X.509 PEM 证书和 PKCS #8 密钥相关的传输层 TLS 设置：

- `plugins.security.ssl.transport.pemkey_filepath`（静态）：证书密钥文件（PKCS #8）的路径，该文件必须位于 `config` 目录下，使用相对路径指定。必需。

- `plugins.security.ssl.transport.pemkey_password`（静态）：密钥密码。如果密钥没有密码，请省略此设置。可选。

- `plugins.security.ssl.transport.pemcert_filepath`（静态）：X.509 节点证书链（PEM 格式）的路径，该文件必须位于 `config` 目录下，使用相对路径指定。必需。

- `plugins.security.ssl.transport.pemtrustedcas_filepath`（静态）：根证书颁发机构（PEM 格式）的路径，该文件必须位于 `config` 目录下，使用相对路径指定。必需。

有关更多信息，请参阅 [REST 层 TLS](/security/configuration/tls#transport-layer-tls)。

## X.509 PEM 证书和 PKCS #8 密钥——REST 层 TLS 设置 {#x509-pem-certificates-and-pkcs-8-keys---rest-layer-tls-settings}

Security 插件支持以下与 X.509 PEM 证书和 PKCS #8 密钥相关的 REST 层 TLS 设置：

- `plugins.security.ssl.http.enabled`（静态）：是否在 REST 层启用 TLS。如果启用，则只允许使用 HTTPS。可选。默认值为 `false`。

- `plugins.security.ssl.http.pemkey_filepath`（静态）：证书密钥文件（PKCS #8）的路径，该文件必须位于 `config` 目录下，使用相对路径指定。必需。

- `plugins.security.ssl.http.pemkey_password`（静态）：密钥密码。如果密钥没有密码，请省略此设置。可选。

- `plugins.security.ssl.http.pemcert_filepath`（静态）：X.509 节点证书链（PEM 格式）的路径，该文件必须位于 `config` 目录下，使用相对路径指定。必需。

-  `plugins.security.ssl.http.pemtrustedcas_filepath`：根证书颁发机构（PEM 格式）的路径，该文件必须位于 config 目录下，使用相对路径指定。必需。

有关更多信息，请参阅 [REST 层 TLS](/security/configuration/tls#rest-layer-tls)。

## 传输层安全设置

Security 插件支持以下传输层安全设置：

- `plugins.security.ssl.transport.enabled`（静态）：是否在 REST 层启用 TLS。

- `plugins.security.ssl.transport.client.pemkey_password`（静态）：传输客户端使用的 PEM 格式私钥的密码。

- `plugins.security.ssl.transport.keystore_keypassword`（静态）：密钥库中密钥的密码。

- `plugins.security.ssl.transport.server.keystore_keypassword`（静态）：服务器密钥库中密钥的密码。

- `plugins.sercurity.ssl.transport.server.keystore_alias`（静态）：服务器密钥库的别名。

- `plugins.sercurity.ssl.transport.client.keystore_alias`（静态）：客户端密钥库的别名。

- `plugins.sercurity.ssl.transport.server.truststore_alias`（静态）：服务器信任库的别名。

- `plugins.sercurity.ssl.transport.client.truststore_alias`（静态）：客户端信任库的别名。

- `plugins.security.ssl.client.external_context_id`（静态）：为传输客户端提供一个 ID，用于外部 SSL 上下文。

- `plugins.secuirty.ssl.transport.principal_extractor_class`（静态）：指定一个实现了提取器的类，以便将证书的自定义部分用作主体（principal）。

- `plugins.security.ssl.http.crl.file_path`（静态）：证书吊销列表文件的路径。

- `plugins.security.ssl.http.crl.validate`（静态）：启用证书吊销列表（Certificate Revocation List，CRL）验证。默认值为 `false`（禁用）。

- `plugins.security.ssl.http.crl.prefer_crlfile_over_ocsp`（静态）：当证书同时包含 CRL 证书条目和在线证书状态协议（Online Certificate Status Protocol，OCSP）条目时，是否优先使用 CRL 条目。可选。默认值为 `false`。

- `plugins.security.ssl.http.crl.check_only_end_entitites`（静态）：为 `true` 时，只验证叶证书。默认值为 `true`。

- `plugins.security.ssl.http.crl.disable_ocsp`（静态）：禁用 OCSP。默认值为 `false`（启用 OCSP）。

- `plugins.security.ssl.http.crl.disable_crldp`（静态）：禁用证书中的 CRL 端点。默认值为 `false`（启用 CRL 端点）。

- `plugins.security.ssl.allow_client_initiated_renegotiation`（静态）：启用或禁用客户端重新协商。默认值为 `false`（不允许客户端发起的重新协商）。

## Security 插件设置示例

```yml
# 通用配置设置
plugins.security.nodes_dn:
  - "CN=*.example.com, OU=SSL, O=Test, L=Test, C=DE"
  - "CN=node.other.com, OU=SSL, O=Test, L=Test, C=DE"
plugins.security.authcz.admin_dn:
  - CN=kirk,OU=client,O=client,L=test, C=de
plugins.security.roles_mapping_resolution: MAPPING_ONLY
plugins.security.ssl.transport.pemcert_filepath: esnode.pem
plugins.security.ssl.transport.pemkey_filepath: esnode-key.pem
plugins.security.ssl.transport.pemtrustedcas_filepath: root-ca.pem
plugins.security.ssl.transport.enforce_hostname_verification: false
plugins.security.ssl.http.enabled: true
plugins.security.ssl.http.pemcert_filepath: esnode.pem
plugins.security.ssl.http.pemkey_filepath: esnode-key.pem
plugins.security.ssl.http.pemtrustedcas_filepath: root-ca.pem
plugins.security.allow_unsafe_democertificates: true
plugins.security.allow_default_init_securityindex: true
plugins.security.nodes_dn_dynamic_config_enabled: false
plugins.security.cert.intercluster_request_evaluator_class: # 此处需要示例值。
plugins.security.audit.type: internal_opensearch
plugins.security.enable_snapshot_restore_privilege: true
plugins.security.check_snapshot_restore_write_privileges: true
plugins.security.cache.ttl_minutes: 60
plugins.security.restapi.roles_enabled: ["all_access", "security_rest_api_access"]
plugins.security.system_indices.enabled: true
plugins.security.system_indices.indices: [".opendistro-alerting-config", ".opendistro-alerting-alert*", ".opendistro-anomaly-results*", ".opendistro-anomaly-detector*", ".opendistro-anomaly-checkpoints", ".opendistro-anomaly-detection-state", ".opendistro-reports-*", ".opendistro-notifications-*", ".opendistro-notebooks", ".opendistro-asynchronous-search-response*"]
node.max_local_storage_nodes: 3
plugins.security.restapi.password_validation_regex: '(?=.*[A-Z])(?=.*[^a-zA-Z\d])(?=.*[0-9])(?=.*[a-z]).{8,}'
plugins.security.restapi.password_validation_error_message: "Password must be minimum 8 characters long and must contain at least one uppercase letter, one lowercase letter, one digit, and one special character."
plugins.security.allow_default_init_securityindex: true
plugins.security.cache.ttl_minutes: 60
#
# REST 管理 API 配置设置
plugins.security.restapi.roles_enabled: ["all_access","xyz_role"]
plugins.security.restapi.endpoints_disabled.all_access.ACTIONGROUPS: ["PUT","POST","DELETE"] # 另一个示例：plugins.security.restapi.endpoints_disabled.xyz_role.LICENSE: ["DELETE"] #
# 审计日志配置设置
plugins.security.audit.enable_rest: true
plugins.security.audit.enable_transport: false
plugins.security.audit.resolve_bulk_requests: false
plugins.security.audit.config.disabled_categories: ["AUTHENTICATED","GRANTED_PRIVILEGES"]
plugins.security.audit.ignore_requests: ["indices:data/read/*","*_bulk"]
plugins.security.audit.threadpool.size: 10
plugins.security.audit.threadpool.max_queue_len: 100000
plugins.security.audit.ignore_users: ['kibanaserver','some*user','/also.*regex possible/']
plugins.security.audit.type: internal_opensearch
#
# external_opensearch 设置
plugins.security.audit.config.http_endpoints: ['localhost:9200','localhost:9201','localhost:9202']
plugins.security.audit.config.index: "'auditlog6-'2023.06.15"
plugins.security.audit.config.type: auditlog
plugins.security.audit.config.username: auditloguser
plugins.security.audit.config.password: auditlogpassword
plugins.security.audit.config.enable_ssl: false
plugins.security.audit.config.verify_hostnames: false
plugins.security.audit.config.enable_ssl_client_auth: false
plugins.security.audit.config.cert_alias: mycert
plugins.security.audit.config.pemkey_filepath: key.pem
plugins.security.audit.config.pemkey_content: <...pem base 64 content>
plugins.security.audit.config.pemkey_password: secret
plugins.security.audit.config.pemcert_filepath: cert.pem
plugins.security.audit.config.pemcert_content: <...pem base 64 content>
plugins.security.audit.config.pemtrustedcas_filepath: ca.pem
plugins.security.audit.config.pemtrustedcas_content: <...pem base 64 content>
#
# Webhook 设置
plugins.security.audit.config.webhook.url: "http://mywebhook/endpoint"
plugins.security.audit.config.webhook.format: JSON
plugins.security.audit.config.webhook.ssl.verify: false
plugins.security.audit.config.webhook.ssl.pemtrustedcas_filepath: ca.pem
plugins.security.audit.config.webhook.ssl.pemtrustedcas_content: <...pem base 64 content>
#
# log4j 设置
plugins.security.audit.config.log4j.logger_name: auditlogger
plugins.security.audit.config.log4j.level: INFO
#
# 高级配置设置
plugins.security.authcz.impersonation_dn:
  "CN=spock,OU=client,O=client,L=Test,C=DE":
    - worf
  "cn=webuser,ou=IT,ou=IT,dc=company,dc=com":
    - user2
    - user1
plugins.security.authcz.rest_impersonation_user:
  "picard":
    - worf
  "john":
    - steve
    - martin
plugins.security.allow_default_init_securityindex: false
plugins.security.allow_unsafe_democertificates: false
plugins.security.cache.ttl_minutes: 60
plugins.security.restapi.password_validation_regex: '(?=.*[A-Z])(?=.*[^a-zA-Z\d])(?=.*[0-9])(?=.*[a-z]).{8,}'
plugins.security.restapi.password_validation_error_message: "A password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character."
plugins.security.restapi.password_min_length: 8
plugins.security.restapi.password_score_based_validation_strength: very_strong
#
# 高级 SSL 设置 - 仅在你完全了解 SSL 的来龙去脉时使用
plugins.security.ssl.transport.client.pemkey_password: superSecurePassword1
plugins.security.ssl.transport.keystore_keypassword: superSecurePassword2
plugins.security.ssl.transport.server.keystore_keypassword: superSecurePassword3
plugins.security.ssl.http.keystore_keypassword: superSecurePassword4
plugins.security.ssl.http.clientauth_mode: REQUIRE
plugins.security.ssl.transport.enabled: true
plugins.security.ssl.transport.server.keystore_alias: my_alias
plugins.security.ssl.transport.client.keystore_alias: my_other_alias
plugins.security.ssl.transport.server.truststore_alias: trustore_alias_1
plugins.security.ssl.transport.client.truststore_alias: trustore_alias_2
plugins.security.ssl.client.external_context_id: my_context_id
plugins.security.ssl.transport.principal_extractor_class: org.opensearch.security.ssl.ExampleExtractor
plugins.security.ssl.http.crl.file_path: ssl/crl/revoked.crl
plugins.security.ssl.http.crl.validate: true
plugins.security.ssl.http.crl.prefer_crlfile_over_ocsp: true
plugins.security.ssl.http.crl.check_only_end_entitites: false
plugins.security.ssl.http.crl.disable_ocsp: true
plugins.security.ssl.http.crl.disable_crldp: true
plugins.security.ssl.allow_client_initiated_renegotiation: true
#
# 专家设置 - 仅在你完全了解其用途时使用：误设的值可能会带来安全风险或导致 OpenSearch Security 出现故障。
plugins.security.config_index_name: .opendistro_security
plugins.security.cert.oid: '1.2.3.4.5.5'
plugins.security.cert.intercluster_request_evaluator_class: org.opensearch.security.transport.DefaultInterClusterRequestEvaluator
plugins.security.enable_snapshot_restore_privilege: true
plugins.security.check_snapshot_restore_write_privileges: true
plugins.security.cache.ttl_minutes: 60
plugins.security.disabled: false
plugins.security.protected_indices.enabled: true
plugins.security.protected_indices.roles: ['all_access']
plugins.security.protected_indices.indices: []
plugins.security.system_indices.enabled: true
plugins.security.system_indices.indices: ['.opendistro-alerting-config', '.opendistro-ism-*', '.opendistro-reports-*', '.opensearch-notifications-*', '.opensearch-notebooks', '.opensearch-observability', '.opendistro-asynchronous-search-response*', '.replication-metadata-store']
```
