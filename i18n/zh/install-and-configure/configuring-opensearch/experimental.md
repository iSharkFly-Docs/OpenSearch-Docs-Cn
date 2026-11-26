---
title: 实验性功能标志
---

# 实验性功能标志

OpenSearch 的版本中可能包含实验性功能，你可以根据需要启用或禁用这些功能。根据安装类型的不同，有多种启用功能标志的方法。

## 在 opensearch.yml 中启用 {#enable-in-opensearchyml}

如果你正在运行 OpenSearch 集群，并希望在配置文件中启用功能标志，请将以下行添加到 `opensearch.yml` 中：

```yaml
opensearch.experimental.feature.<feature_name>.enabled: true
```

## 在 Docker 容器中启用

如果你使用的是 Docker，请将以下行添加到 `docker-compose.yml` 中的 `opensearch-node` > `environment` 部分下：

```bash
OPENSEARCH_JAVA_OPTS="-Dopensearch.experimental.feature.<feature_name>.enabled=true"
```

## 在 tarball 安装中启用

要在 tarball 安装中启用功能标志，请在 `config/jvm.options` 或 `OPENSEARCH_JAVA_OPTS` 中提供新的 JVM 参数。

### 选项 1：修改 jvm.options {#option-1-modify-jvmoptions}

在启动 `opensearch` 进程之前，将以下行添加到 `config/jvm.options` 中，以启用该功能及其依赖项：

```bash
-Dopensearch.experimental.feature.<feature_name>.enabled=true
```

然后运行 OpenSearch：

```bash
./bin/opensearch
```

### 选项 2：使用环境变量启用

除了直接修改 `config/jvm.options` 之外，你还可以使用环境变量来定义这些属性。你可以在启动 OpenSearch 时通过单条命令完成，也可以使用 `export` 定义该变量。

要在启动 OpenSearch 时以内联方式添加功能标志，请运行以下命令：

```bash
OPENSEARCH_JAVA_OPTS="-Dopensearch.experimental.feature.<feature_name>.enabled=true" ./opensearch-2.12.0/bin/opensearch
```

如果你想在运行 OpenSearch 之前单独定义环境变量，请运行以下命令：

```bash
export OPENSEARCH_JAVA_OPTS="-Dopensearch.experimental.feature.<feature_name>.enabled=true"
```

```bash
./bin/opensearch
```

## 为 OpenSearch 开发启用

要在开发中启用功能标志，你必须在构建 OpenSearch 之前将正确的属性添加到 `run.gradle` 中。有关如何使用 Gradle 构建 OpenSearch 的信息，请参阅[开发者指南](https://github.com/opensearch-project/OpenSearch/blob/main/DEVELOPER_GUIDE.md)。

将以下属性添加到 run.gradle 中以启用该功能：

```gradle
testClusters {
    runTask {
      testDistribution = 'archive'
      if (numZones > 1) numberOfZones = numZones
      if (numNodes > 1) numberOfNodes = numNodes
      systemProperty 'opensearch.experimental.feature.<feature_name>.enabled', 'true'
    }
  }
```
