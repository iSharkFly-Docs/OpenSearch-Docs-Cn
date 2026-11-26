---
title: SQL 和 PPL CLI
---

# SQL 和 PPL CLI

SQL 和 PPL 命令行界面（CLI）是一个独立的 Python 应用程序，可以通过 `opensearchsql` 命令启动。

 要使用 SQL 和 PPL CLI，请在 OpenSearch 实例上安装 SQL 插件（plugin），在 MacOS 或 Linux 上运行 CLI，并连接到任意有效的 OpenSearch 端点。

![SQL CLI](/images/cli.gif)

## 功能

SQL 和 PPL CLI 具有以下功能：

- 多行输入
- 支持 PPL
- SQL 语法和索引名称的自动补全（autocomplete）
- 语法高亮
- 格式化输出：
  - 表格格式
  - 字段名称带颜色显示
  - 默认启用水平显示；当输出对终端来说过宽时使用垂直显示，以获得更好的可视化效果
  - 对大量输出进行分页
- 无论是否启用安全功能均可使用
- 支持加载配置文件
- 支持所有 SQL 插件查询

## 安装

启动本地 OpenSearch 实例，并确保已安装 SQL 插件。

1. 安装 CLI：
```console
pip3 install opensearchsql
```

::: info 注意
SQL CLI 仅适用于 Python 3。
:::

2. 运行以下命令启动 CLI：
```console
opensearchsql https://localhost:9200 --username admin --password admin
```
默认情况下，`opensearchsql` 命令连接到 http://localhost:9200。

## 配置

首次启动 SQL CLI 时，会自动在 `~/.config/opensearchsql-cli/config`（MacOS 和 Linux）创建配置文件，此后会自动加载该配置。

你可以配置以下连接属性：

- `endpoint`：无需指定选项。启动命令 `opensearchsql` 之后的任何内容都会被视为端点。如果未提供端点，SQL CLI 默认连接到 http://localhost:9200。
- `-u/-w`：支持用于 HTTP 基本身份验证的用户名和密码，例如配合 Security 插件或 Amazon OpenSearch Service 的细粒度访问控制使用。
- `--aws-auth`：启用 AWS sigV4 身份验证以连接到 Amazon OpenSearch 端点。与 AWS CLI（`aws configure`）配合使用，读取本地 AWS 配置进行身份验证和连接。

有关所有可用配置的列表，请参阅 [clirc](https://github.com/opensearch-project/sql/blob/1.x/sql-cli/src/opensearch_sql_cli/conf/clirc)。

## 使用 CLI

1. 运行 CLI 工具。如果集群使用默认安全设置运行，请使用以下命令：
```console
opensearchsql --username admin --password admin https://localhost:9200
```
如果集群未启用安全功能，请运行：
```console
opensearchsql
```

2. 运行一条示例 SQL 命令：
```sql
SELECT * FROM accounts;
```

默认情况下，最多显示 200 行输出。如需显示更多结果，请添加带有所需值的 `LIMIT` 子句。

::: tip 提示
要退出 CLI 工具，请按 **Ctrl+D**。
:::

## 在 CLI 中使用 PPL

1. 运行 CLI 时指定查询语言：
```console
opensearchsql -l ppl <params>
```

2. 执行 PPL 查询：
```sql
source=accounts | fields firstname, lastname
```

## 查询选项

使用以下命令行选项运行单个查询：

- `-q`：后跟单个查询
- `-f`：指定 JDBC 或原始格式输出
- `-v`：垂直显示数据
- `-e`：将 SQL 转换为 DSL

## CLI 选项

- `--help`：选项帮助页面
- `-l`：查询语言选项。可用选项为 `sql` 和 `ppl`。默认值为 `sql`
- `-p`：始终使用分页器显示输出
- `--clirc`：提供配置文件的路径
