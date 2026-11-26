---
title: 标识符
---

# 标识符

标识符（identifier）是用来命名数据库对象的 ID，例如索引（Index）名称、字段（Field）名称、别名（Alias）等。
OpenSearch 支持两种标识符：常规标识符和带分隔符的标识符。

## 常规标识符

常规标识符是以 ASCII 字母（小写或大写）开头的字符串。
后续字符可以是字母、数字或下划线（_）。它不能是保留关键字。
也不允许包含空白字符和其他特殊字符。

OpenSearch 支持以下常规标识符：

1. 以点号 `.` 为前缀的标识符。用于隐藏索引，例如 `.opensearch-dashboards`。
2. 以 `@` 符号为前缀的标识符。用于 Logstash 摄取时生成的元字段。
3. 中间带有连字符 `-` 的标识符。用于包含日期信息的索引名称。
4. 包含星号 `*` 的标识符。用于通配符匹配索引模式。

对于常规标识符，可以直接使用名称，无需任何反引号或转义字符。
在本示例中，`source`、`fields`、`account_number`、`firstname` 和 `lastname` 都是标识符。其中，`source` 字段是保留标识符。

```sql
SELECT account_number, firstname, lastname FROM accounts;
```

| account_number | firstname | lastname |
:--- | :--- |
| 1  | Amber | Duke       
| 6  | Hattie | Bond
| 13 | Nanette | Bates
| 18 | Dale | Adams

## 带分隔符的标识符

带分隔符的标识符可以包含常规标识符中不允许出现的特殊字符。
必须用反引号（\`\`）将带分隔符的标识符括起来。反引号用于将标识符与特殊字符区分开。

如果索引名称中包含点号（`.`），例如 `log-2021.01.11`，请使用带反引号的分隔标识符对其进行转义：\``log-2021.01.11`\`。

带分隔符的标识符的典型用法：

1. 包含保留关键字的标识符。
2. 包含 `.` 的标识符。同样，也适用于用 `-` 包含日期信息的标识符。
3. 包含其他特殊字符的标识符，例如 Unicode 字符。

用反引号引用索引名称：

```sql
source=`accounts` | fields `account_number`;
```

| account_number |
:--- |
| 1  |       
| 6  |
| 13 |
| 18 |

## 大小写敏感性

标识符区分大小写。它们必须与 OpenSearch 中存储的名称完全一致。

例如，如果运行 `source=Accounts`，你会收到索引不存在的异常，因为实际的索引名称是小写的。
