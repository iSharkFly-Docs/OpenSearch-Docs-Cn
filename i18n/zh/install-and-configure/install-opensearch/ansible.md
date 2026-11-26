---
title: Ansible playbook
---

# Ansible playbook

你可以使用 Ansible playbook 安装和配置可用于生产环境的 OpenSearch 集群（Cluster）以及 OpenSearch Dashboards。

::: info 注意
Ansible playbook 仅支持将 OpenSearch 和 OpenSearch Dashboards 部署到 CentOS7 主机。
:::

## 前提条件

确保已安装 [Ansible](https://www.ansible.com/) 和 [Java 8](https://www.java.com/en/download/manual.jsp)。

## 配置

1. 克隆 OpenSearch 的 [ansible-playbook](https://github.com/opensearch-project/ansible-playbook) 仓库：

   ```bash
   git clone https://github.com/opensearch-project/ansible-playbook
   ```

2. 在 `inventories/opensearch/hosts` 文件中配置节点（Node）属性：

   ```bash
   ansible_host=<Public IP address> ansible_user=root ip=<Private IP address / 0.0.0.0>
   ```

   其中：

   - `ansible_host` 是你希望 Ansible playbook 在其上安装 OpenSearch 和 OpenSearch Dashboards 的目标节点的 IP 地址。
   - `ip` 是你希望 OpenSearch 和 OpenSearch Dashboards 绑定的 IP 地址。你可以指定目标节点的私有 IP、localhost 或 0.0.0.0。

3. 你可以在 `inventories/opensearch/group_vars/all/all.yml` 文件中修改默认配置值。例如，你可以增大 Java 堆内存大小：

   ```bash
   xms_value: 8
   xmx_value: 8
   ```

::: info 注意
确保你可以通过 SSH 直接以 root 用户访问目标节点。
:::

## 使用 Ansible playbook 运行 OpenSearch 和 OpenSearch Dashboards

1. 以 root 权限运行 Ansible playbook：

   ```bash
   ansible-playbook -i inventories/opensearch/hosts opensearch.yml --extra-vars "admin_password=Test@123 kibanaserver_password=Test@6789 logstash_password=Test@456"
   ```

   你可以使用 `admin_password`、`kibanaserver_password` 和 `logstash_password` 变量为保留用户（`admin`、`kibanaserver` 和 `logstash`）设置密码。

2. 部署完成后，你可以使用用户名 `admin` 和为 `admin_password` 变量设置的密码访问 OpenSearch 和 OpenSearch Dashboards。

   如果将 `ip` 绑定到私有 IP 或 localhost，请确保已登录到部署 playbook 的服务器，以访问 OpenSearch 和 OpenSearch Dashboards：

   ```bash
   curl https://localhost:9200 -u 'admin:Test@123' --insecure
   ```

   如果将 `ip` 绑定到 0.0.0.0，则将 `localhost` 替换为公有 IP 或私有 IP（如果位于同一网络中）。
