---
title: 配置 TLS
---

# 为 OpenSearch Dashboards 配置 TLS

默认情况下，为了便于测试和入门，OpenSearch Dashboards 通过 HTTP 运行。要为 HTTPS 启用 TLS，请在 `opensearch_dashboards.yml` 中更新以下设置。

设置 | 描述
:--- | :---
`server.ssl.enabled` | 启用 OpenSearch Dashboards 服务器与用户 Web 浏览器之间的 SSL 通信。设置为 `true` 表示使用 HTTPS，设置为 `false` 表示使用 HTTP。
`server.ssl.supportedProtocols` | 指定支持的 TLS 协议数组。可选值为 `TLSv1`、`TLSv1.1`、`TLSv1.2` 和 `TLSv1.3`。默认值为 `['TLSv1.1', 'TLSv1.2', and 'TLSv1.3']`。
`server.ssl.cipherSuites` | 指定 TLS 密码套件数组。可选。
`server.ssl.certificate` | 如果 `server.ssl.enabled` 设置为 `true`，则指定 OpenSearch Dashboards 有效的 Privacy Enhanced Mail（PEM）服务器证书的完整路径。你可以[生成自己的证书](/security/configuration/generate-certificates)，也可以从证书颁发机构（CA）获取证书。
`server.ssl.key` | 如果 `server.ssl.enabled` 设置为 `true`，则指定服务器证书密钥的完整路径，例如 `/usr/share/opensearch-dashboards-1.0.0/config/my-client-cert-key.pem`。你可以[生成自己的证书](/security/configuration/generate-certificates)，也可以从 CA 获取证书。
`server.ssl.keyPassphrase` | 设置密钥的密码。如果密钥没有密码，请省略此设置。可选。
`server.ssl.keystore.path` | 使用 JKS（Java KeyStore）或 PKCS12/PFX（Public-Key Cryptography Standards）文件代替 PEM 证书和密钥。
`server.ssl.keystore.password` | 设置密钥库的密码。必需。
`server.ssl.clientAuthentication` | 指定要使用的 TLS 客户端认证模式。可以是以下值之一：`none`、`optional` 或 `required`。如果设置为 `required`，Web 浏览器需要发送由 `server.ssl.certificateAuthorities` 中配置的 CA 签名的有效客户端证书。默认值为 `none`。
`server.ssl.certificateAuthorities` | 以数组形式指定一个或多个 CA 证书的完整路径，这些 CA 签发了用于客户端认证的证书。如果 `server.ssl.clientAuthentication` 设置为 `optional` 或 `required`，则此项必需。
`server.ssl.truststore.path` | 使用 JKS 或 PKCS12/PFX 信任库文件代替 PEM CA 证书。
`server.ssl.truststore.password` | 设置信任库的密码。必需。
`opensearch.ssl.verificationMode` | 建立 OpenSearch 与 OpenSearch Dashboards 之间的通信。有效值为 `full`、`certificate` 或 `none`。如果启用了 TLS，建议使用 `full`，它会启用主机名验证。`certificate` 会检查证书，但不检查主机名。`none` 不执行任何检查（适用于 HTTP）。默认值为 `full`。
`opensearch.ssl.certificateAuthorities` | 如果 `opensearch.ssl.verificationMode` 设置为 `full` 或 `certificate`，则以数组形式指定一个或多个 CA 证书的完整路径，这些证书构成 OpenSearch 集群（Cluster）的可信证书链。例如，如果你使用中间 CA 签发了 admin 证书、客户端证书和节点证书，则可能需要同时包含根 CA *和*中间 CA。
`opensearch.ssl.truststore.path` | 使用 JKS 或 PKCS12/PFX 信任库文件代替 PEM CA 证书。
`opensearch.ssl.truststore.password` | 设置信任库的密码。必需。
`opensearch.ssl.alwaysPresentCertificate` | 如果设置为 `true`，则向 OpenSearch 集群发送客户端证书；在 OpenSearch 中启用 mTLS 时必须如此设置。默认值为 `false`。
`opensearch.ssl.certificate` | 如果 `opensearch.ssl.alwaysPresentCertificate` 设置为 `true`，则指定用于 OpenSearch 集群的有效客户端证书的完整路径。你可以[生成自己的证书](/security/configuration/generate-certificates)，也可以从 CA 获取证书。
`opensearch.ssl.key` | 如果 `opensearch.ssl.alwaysPresentCertificate` 设置为 `true`，则指定客户端证书密钥的完整路径。你可以[生成自己的证书](/security/configuration/generate-certificates)，也可以从 CA 获取证书。
`opensearch.ssl.keyPassphrase` | 设置密钥的密码。如果密钥没有密码，请省略此设置。可选。
`opensearch.ssl.keystore.path` | 使用 JKS 或 PKCS12/PFX 密钥库文件代替 PEM 证书和密钥。
`opensearch.ssl.keystore.password` | 设置密钥库的密码。必需。
`opensearch_security.cookie.secure` | 如果为 OpenSearch Dashboards 启用了 TLS，请将此设置改为 `true`。对于 HTTP，请设置为 `false`。

以下 `opensearch_dashboards.yml` 配置展示了 OpenSearch 和 OpenSearch Dashboards 使用演示配置在同一台机器上运行的情形：

```yml
server.ssl.enabled: true
server.ssl.certificate: /usr/share/opensearch-dashboards/config/client-cert.pem
server.ssl.key: /usr/share/opensearch-dashboards/config/client-cert-key.pem
opensearch.hosts: ["https://localhost:9200"]
opensearch.ssl.verificationMode: full
opensearch.ssl.certificateAuthorities: [ "/usr/share/opensearch-dashboards/config/root-ca.pem", "/usr/share/opensearch-dashboards/config/intermediate-ca.pem" ]
opensearch.username: "kibanaserver"
opensearch.password: "kibanaserver"
opensearch.requestHeadersAllowlist: [ authorization,securitytenant ]
opensearch_security.multitenancy.enabled: true
opensearch_security.multitenancy.tenants.preferred: ["Private", "Global"]
opensearch_security.readonly_mode.roles: ["kibana_read_only"]
opensearch_security.cookie.secure: true
```

如果你使用 Docker 安装方式，可以将自定义的 `opensearch_dashboards.yml` 文件传递给容器。要了解更多信息，请参阅 [Docker 安装页面](/install-and-configure/install-opensearch/docker)。

启用这些设置并启动应用程序后，你可以通过 `https://localhost:5601` 连接到 OpenSearch Dashboards。如果你的证书是自签名的，可能需要确认浏览器警告。为了避免此类警告（或浏览器完全不兼容），最佳实践是使用来自受信任 CA 的证书。
