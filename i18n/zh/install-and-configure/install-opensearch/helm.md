---
title: Helm
---

# Helm

Helm 是一个包管理器，可以让你在 Kubernetes 集群（Cluster）中轻松安装和管理 OpenSearch。你可以在 YAML 文件中定义 OpenSearch 配置，并使用 Helm 以版本可控、可重现的方式部署应用程序。

Helm chart 包含下表所述的资源。

资源 | 描述
:--- | :---
`Chart.yaml` |  chart 的相关信息。
`values.yaml` |  chart 的默认配置值。
`templates` |  与配置值组合以生成 Kubernetes 清单文件的模板。

默认 Helm chart 中的规范支持许多标准用例和部署方式。你可以修改默认 chart 以配置所需的规范，并设置传输层安全（Transport Layer Security，TLS）和基于角色的访问控制（Role-based Access Control，RBAC）。

有关默认配置、安全配置步骤和可配置参数的信息，请参阅
[README](https://github.com/opensearch-project/helm-charts/blob/main/README.md)。

::: info 注意
此处的说明假定你已有一个预装了 Helm 的 Kubernetes 集群。有关配置 Kubernetes 集群的步骤，请参阅 [Kubernetes 文档](https://kubernetes.io/docs/setup/)；有关安装 Helm 的步骤，请参阅 [Helm 文档](https://helm.sh/docs/intro/install/)。
:::

## 前提条件

默认 Helm chart 会部署一个三节点（Node）集群。我们建议为此部署准备至少 8 GiB 的可用内存。如果可用内存少于 4 GiB，部署很可能会失败。

## 使用 Helm 安装 OpenSearch

1. 将 `opensearch` [helm-charts](https://github.com/opensearch-project/helm-charts) 仓库添加到 Helm：

   ```bash
   helm repo add opensearch https://opensearch-project.github.io/helm-charts/
   ```

1. 从 chart 仓库更新本地可用的 chart：

   ```bash
   helm repo update
   ```

1. 搜索与 OpenSearch 相关的 Helm chart：

   ```bash
   helm search repo opensearch
   ```

   ```bash
   NAME                            	CHART VERSION	APP VERSION	DESCRIPTION                           
   opensearch/opensearch           	1.0.7        	1.0.0      	A Helm chart for OpenSearch           
   opensearch/opensearch-dashboards	1.0.4        	1.0.0      	A Helm chart for OpenSearch Dashboards
   ```

1. 部署 OpenSearch：

   ```bash
   helm install my-deployment opensearch/opensearch
   ```

你也可以手动构建 `opensearch-1.0.0.tgz` 文件：

1. 切换到 `opensearch` 目录：

   ```bash
   cd charts/opensearch
   ```

1. 打包 Helm chart：

   ```bash
   helm package .
   ```

1. 部署 OpenSearch：

   ```bash
   helm install --generate-name opensearch-1.0.0.tgz
   ```

   输出会显示本次安装实例化的规范。
   要自定义部署，请通过自定义 YAML 文件传入要覆盖的值：

   ```bash
   helm install --values=customvalues.yaml opensearch-1.0.0.tgz
   ```

对于 OpenSearch 2.12 或更高版本，请在 `values.yaml` 的 `extraEnvs` 下自定义 admin 密码，如下例所示：

```yaml
extraEnvs:
  - name: OPENSEARCH_INITIAL_ADMIN_PASSWORD
    value: <custom-admin-password>
```

#### 示例输出

  ```yaml
  NAME: opensearch-1-1629223146
  LAST DEPLOYED: Tue Aug 17 17:59:07 2021
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  NOTES:
  Watch all cluster members come up.
    $ kubectl get pods --namespace=default -l app=opensearch-cluster-master -w
  ```

要确认 OpenSearch pod 已启动并正常运行，请运行以下命令：

```bash
$ kubectl get pods
NAME                                                  READY   STATUS    RESTARTS   AGE
opensearch-cluster-master-0                           1/1     Running   0          3m56s
opensearch-cluster-master-1                           1/1     Running   0          3m56s
opensearch-cluster-master-2                           1/1     Running   0          3m56s
```

要访问 OpenSearch shell：

```bash
$ kubectl exec -it opensearch-cluster-master-0 -- /bin/bash
```

你可以向该 pod 发送请求，以验证 OpenSearch 已启动并正常运行：

```json
$ curl -XGET https://localhost:9200 -u 'admin:admin' --insecure
{
  "name" : "opensearch-cluster-master-1",
  "cluster_name" : "opensearch-cluster",
  "cluster_uuid" : "hP2gq5bPS3SLp8Z7wXm8YQ",
  "version" : {
    "distribution" : "opensearch",
    "number" : <version>,
    "build_type" : <build-type>,
    "build_hash" : <build-hash>,
    "build_date" : <build-date>,
    "build_snapshot" : false,
    "lucene_version" : <lucene-version>,
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "The OpenSearch Project: https://opensearch.org/"
}
```

## 使用 Helm 卸载

确定要删除的 OpenSearch 部署：

```bash
$ helm list
NAME  NAMESPACEREVISIONUPDATED  STATUS  CHART APP VERSION
opensearch-1-1629223146 default 1 2021-08-17 17:59:07.664498239 +0000 UTCdeployedopensearch-1.0.0    1.0.0       
```

要删除或卸载某个部署，请运行以下命令：

```bash
helm delete opensearch-1-1629223146
```

有关安装 OpenSearch Dashboards 的步骤，请参阅[使用 Helm 安装 OpenSearch Dashboards](/install-and-configure/install-dashboards/helm)。
