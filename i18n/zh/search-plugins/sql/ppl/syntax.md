---
title: 语法
---

# PPL 语法

每个 PPL 查询都以 `search` 命令开头。它指定要从中搜索和检索文档的索引。后续命令可以按任意顺序排列。

::: info 注意
目前，`PPL` 只支持一个 `search` 命令，并且可以省略该命令以简化查询。
:::

## 语法

```sql
search source=<index> [boolean-expression]
source=<index> [boolean-expression]
```

字段 | 描述 | 必需
:--- | :--- |:---
`search` | 指定搜索关键词。 | 是
`index` | 指定要查询的索引。 | 否
`bool-expression` | 指定一个求值结果为布尔值的表达式。 | 否

## 示例

**示例 1：在 accounts 索引中搜索**

在下面的示例中，`search` 命令将 `accounts` 索引作为数据源，并使用 `fields` 和 `where` 命令设置条件：

```sql
search source=accounts
| where age > 18
| fields firstname, lastname
```

::: info 注意
在以下示例中，尖括号 `< >` 中的是必需参数，方括号 `[ ]` 中的是可选参数。
:::

**示例 2：获取所有文档**

要获取 `accounts` 索引中的所有文档，将其指定为 `source`：

```sql
search source=accounts;
```

| account_number | firstname | address | balance | gender | city | employer | state | age | email | lastname |
:--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---
| 1  | Amber  | 880 Holmes Lane | 39225 | M | Brogan | Pyrami | IL | 32 | amberduke@pyrami.com  | Duke
| 6  | Hattie | 671 Bristol Street | 5686 | M | Dante | Netagy | TN | 36  | hattiebond@netagy.com | Bond
| 13 | Nanette | 789 Madison Street | 32838 | F | Nogal | Quility | VA | 28 | null | Bates
| 18 | Dale  | 467 Hutchinson Court | 4180 | M | Orick | null | MD | 33 | daleadams@boink.com | Adams

**示例 3：获取符合条件的文档**

要获取 `accounts` 索引中 `account_number` 等于 1 或 `gender` 为 `F` 的所有文档，使用以下查询：

```sql
search source=accounts account_number=1 or gender=\"F\";
```

| account_number | firstname | address | balance | gender | city | employer | state | age | email | lastname |
:--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---
| 1 | Amber | 880 Holmes Lane | 39225 | M | Brogan | Pyrami | IL | 32 | amberduke@pyrami.com | Duke |
| 13 | Nanette | 789 Madison Street | 32838 | F | Nogal | Quility | VA | 28 | null | Bates |
