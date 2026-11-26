---
title: Helm
---

# 使用 Helm 运行 OpenSearch Dashboards

Helm 是一个包管理器，可以让你在 Kubernetes 集群（Cluster）中轻松安装和管理 OpenSearch Dashboards。你可以在 YAML 文件中定义 OpenSearch 配置，并使用 Helm 以版本可控、可重现的方式部署应用程序。

Helm chart 包含下表所述的资源。

资源 | 描述
:--- | :---
`Chart.yaml` |  chart 的相关信息。
`values.yaml` |  chart 的默认配置值。
`templates` |  与配置值组合以生成 Kubernetes 清单文件的模板。

默认 Helm chart 中的规范支持许多标准用例和部署方式。你可以修改默认 chart 以配置所需的规范，并设置传输层安全（Transport Layer Security，TLS）和基于角色的访问控制（Role-based Access Control，RBAC）。

有关默认配置、安全配置步骤和可配置参数的信息，请参阅
[README](https://github.com/opensearch-project/helm-charts/tree/main/charts)。

::: info 注意
此处的说明假定你已有一个预装了 Helm 的 Kubernetes 集群。有关配置 Kubernetes 集群的步骤，请参阅 [Kubernetes 文档](https://kubernetes.io/docs/setup/)；有关安装 Helm 的步骤，请参阅 [Helm 文档](https://helm.sh/docs/intro/install/)。
:::

## 前提条件

开始之前，你必须先[使用 Helm 安装 OpenSearch](/install-and-configure/install-opensearch/helm)。

确保你可以向 OpenSearch pod 发送请求：

```json
$ curl -XGET https://localhost:9200 -u 'admin:<custom-admin-password>' --insecure
{
  "name" : "opensearch-cluster-master-1",
  "cluster_name" : "opensearch-cluster",
  "cluster_uuid" : "hP2gq5bPS3SLp8Z7wXm8YQ",
  "version" : {
    "distribution" : "opensearch",
    "number" : "1.0.0",
    "build_type" : "tar",
    "build_hash" : "34550c5b17124ddc59458ef774f6b43a086522e3",
    "build_date" : "2021-07-02T23:22:21.383695Z",
    "build_snapshot" : false,
    "lucene_version" : "8.8.2",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "The OpenSearch Project: https://opensearch.org/"
}
```

## 使用 Helm 安装 OpenSearch Dashboards

1. 切换到 `opensearch-dashboards` 目录：

   ```bash
   cd opensearch-dashboards
   ```

1. 打包 Helm chart：

   ```bash
   helm package .
   ```

1. 部署 OpenSearch Dashboards：

   ```bash
   helm install --generate-name opensearch-dashboards-1.0.0.tgz
   ```
   输出会显示本次安装实例化的规范。
   要自定义部署，请通过自定义 YAML 文件传入要覆盖的值：

   ```bash
   helm install --values=customvalues.yaml opensearch-dashboards-1.0.0.tgz
   ```

#### 示例输出

```yaml
NAME: opensearch-dashboards-1-1629223356
LAST DEPLOYED: Tue Aug 17 18:02:37 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=opensearch-dashboards,app.kubernetes.io/instance=op
ensearch-dashboards-1-1629223356" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace default $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace default port-forward $POD_NAME 8080:$CONTAINER_PORT
```

要确认 OpenSearch Dashboards pod 已启动并正常运行，请运行以下命令：

```bash
$ kubectl get pods
NAME                                                  READY   STATUS    RESTARTS   AGE
opensearch-cluster-master-0                           1/1     Running   0          4m35s
opensearch-cluster-master-1                           1/1     Running   0          4m35s
opensearch-cluster-master-2                           1/1     Running   0          4m35s
opensearch-dashboards-1-1629223356-758bd8747f-8www5   1/1     Running   0          66s
```

要设置端口转发以访问 OpenSearch Dashboards，请退出 OpenSearch shell 并运行以下命令：

```bash
$ kubectl port-forward deployment/opensearch-dashboards-1-1629223356 5601
```

现在，你可以在浏览器中通过 http://localhost:5601 访问 OpenSearch Dashboards。

## 使用 Helm 卸载

确定要删除的 OpenSearch Dashboards 部署：

```bash
$ helm list
NAME  NAMESPACE REVISION  UPDATED STATUS  CHART APP VERSION
opensearch-1-1629223146 default 1 2021-08-17 17:59:07.664498239 +0000 UTCdeployedopensearch-1.0.0           1.0.0      
opensearch-dashboards-1-1629223356 default  1 2021-08-17  18:02:37.600796946 +0000  UTCdepl
oyedopensearch-dashboards-1.0.0 1.0.0        
```

要删除或卸载某个部署，请运行以下命令：

```bash
helm delete opensearch-dashboards-1-1629223356
```
