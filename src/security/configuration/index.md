---
title: Configuration
---

# Security configuration

The plugin includes demo certificates so that you can get up and running quickly. To use OpenSearch in a production environment, you must configure it manually:

1. [Replace the demo certificates](/install-and-configure/install-opensearch/docker#configuring-basic-security-settings).
1. [Reconfigure `opensearch.yml` to use your certificates](/security/configuration/tls).
1. [Reconfigure `config.yml` to use your authentication backend](/security/configuration/configuration) (if you don't plan to use the internal user database).
1. [Modify the configuration YAML files](/security/configuration/yaml).
1. If you plan to use the internal user database, [set a password policy in `opensearch.yml`](/security/configuration/yaml#opensearchyml).
1. [Apply changes using the `securityadmin` script](/security/configuration/security-admin).
1. Start OpenSearch.
1. [Add users, roles, role mappings, and tenants](/security/access-control/).

If you don't want to use the plugin, see [Disable security](/security/configuration/disable).

::: info NOTE
The Security plugin has several default users, roles, action groups, permissions, and settings for OpenSearch Dashboards that use kibana in their names. We will change these names in a future release.
:::

::: info NOTE
For a full list of `opensearch.yml` Security plugin settings, Security plugin settings, see [Security settings](/install-and-configure/configuring-opensearch/security-settings).
:::
