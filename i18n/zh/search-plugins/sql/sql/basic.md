---
title: 基本查询
---

# 基本查询

使用 `SELECT` 子句，配合 `FROM`、`WHERE`、`GROUP BY`、`HAVING`、`ORDER BY` 和 `LIMIT` 来搜索和聚合数据。

在这些子句中，`SELECT` 和 `FROM` 是必需的，因为它们指定要检索哪些字段以及从哪些索引中检索。其他子句都是可选的，可根据需要使用。

### 语法

搜索和聚合数据的完整语法如下：

```sql
SELECT [DISTINCT] (* | expression) [[AS] alias] [, ...]
FROM index_name
[WHERE predicates]
[GROUP BY expression [, ...]
 [HAVING predicates]]
[ORDER BY expression [IS [NOT] NULL] [ASC | DESC] [, ...]]
[LIMIT [offset, ] size]
```

### 基础知识

除了 SQL 预定义的关键字之外，最基本的元素是字面量（literal）和标识符（identifier）。
字面量是数值、字符串、日期或布尔常量。标识符是 OpenSearch 索引名称或字段名称。
借助算术运算符和 SQL 函数，可以用字面量和标识符构建复杂的表达式。

规则 `expressionAtom`：

![expressionAtom](/images/expressionAtom.png)

表达式又可以通过逻辑运算符组合成谓词。在 `WHERE` 和 `HAVING` 子句中使用谓词，可以按特定条件过滤数据。

规则 `expression`：

![expression](/images/expression.png)

规则 `predicate`：

![expression](/images/predicate.png)

### 执行顺序

这些 SQL 子句的执行顺序与它们在语句中出现的顺序不同：

```sql
FROM index
 WHERE predicates
  GROUP BY expressions
   HAVING predicates
    SELECT expressions
     ORDER BY expressions
      LIMIT size
```

## Select

指定要检索的字段。

### 语法 {#syntax-1}

规则 `selectElements`：

![selectElements](/images/selectElements.png)

规则 `selectElement`：

![selectElements](/images/selectElement.png)

*示例 1*： 使用 `*` 检索索引中的所有字段：

```sql
SELECT *
FROM accounts
```

| account_number | firstname | gender | city | balance | employer | state | email | address | lastname | age
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---
| 1 | Amber | M | Brogan | 39225 | Pyrami | IL | amberduke@pyrami.com | 880 Holmes Lane | Duke | 32
| 16 | Hattie | M | Dante | 5686 | Netagy | TN | hattiebond@netagy.com | 671 Bristol Street | 	Bond | 36
| 13 | Nanette | F | Nogal | 32838 | Quility | VA | nanettebates@quility.com | 789 Madison Street | Bates | 28
| 18 | Dale | M | Orick | 4180 |  | MD | daleadams@boink.com | 467 Hutchinson Court | Adams | 33

*示例 2*： 使用字段名称只检索特定字段：

```sql
SELECT firstname, lastname
FROM accounts
```

| firstname | lastname
| :--- | :---
| Amber | Duke
| Hattie | Bond
| Nanette | Bates
| Dale | Adams

*示例 3*： 使用字段别名代替字段名称。字段别名可以让字段名称更易读：

```sql
SELECT account_number AS num
FROM accounts
```

| num
:---
| 1
| 6
| 13
| 18

*示例 4*： 使用 `DISTINCT` 子句只返回唯一的字段值。可以指定一个或多个字段名称：

```sql
SELECT DISTINCT age
FROM accounts
```

| age
:---
| 28
| 32
| 33
| 36

## From

指定要搜索的索引。
可以在 `FROM` 子句中指定子查询。

### 语法 {#syntax-2}

规则 `tableName`：

![tableName](/images/tableName.png)

*示例 1*： 使用索引别名跨索引查询。关于索引别名的信息，请参阅[索引别名](/im-plugin/index-alias)。
在这个示例查询中，`acc` 是 `accounts` 索引的别名：

```sql
SELECT account_number, accounts.age
FROM accounts
```

或者

```sql
SELECT account_number, acc.age
FROM accounts acc
```

| account_number | age
| :--- | :---
| 1 | 32
| 6 | 36
| 13 | 28
| 18 | 33

*示例 2*： 使用索引模式查询与特定模式匹配的索引：

```sql
SELECT account_number
FROM account*
```

| account_number
:---
| 1
| 6
| 13
| 18

## Where

指定过滤结果的条件。

| 运算符 | 行为
:--- | :---
`=` | 等于。
`<>` | 不等于。
`>` | 大于。
`<` | 小于。
`>=` | 大于或等于。
`<=` | 小于或等于。
`IN` | 指定多个 `OR` 运算符。
`BETWEEN` | 类似于范围查询。关于范围查询的更多信息，请参阅 [Range 查询](/query-dsl/term/range)。
`LIKE` | 用于全文搜索。关于全文查询的更多信息，请参阅[全文查询](/query-dsl/full-text/)。
`IS NULL` | 检查字段值是否为 `NULL`。
`IS NOT NULL` | 检查字段值是否为 `NOT NULL`。

将比较运算符（`=`、`<>`、`>`、`>=`、`<`、`<=`）与布尔运算符 `NOT`、`AND` 或 `OR` 组合，可以构建更复杂的表达式。

*示例 1*： 对数值、字符串或日期使用比较运算符：

```sql
SELECT account_number
FROM accounts
WHERE account_number = 1
```

| account_number
| :---
| 1

*示例 2*： OpenSearch 支持灵活的 schema，因此同一索引中的文档可能具有不同的字段。使用 `IS NULL` 或 `IS NOT NULL` 可以只检索缺失或存在的字段。OpenSearch 不区分缺失的字段和显式设置为 `NULL` 的字段：

```sql
SELECT account_number, employer
FROM accounts
WHERE employer IS NULL
```

| account_number | employer
| :--- | :---
| 18 |

*示例 3*： 删除满足 `WHERE` 子句中谓词条件的文档：

```sql
DELETE FROM accounts
WHERE age > 30
```

## Group By

将具有相同字段值的文档分组到桶（bucket）中。

*示例 1*： 按字段分组：

```sql
SELECT age
FROM accounts
GROUP BY age
```

| id | age
:--- | :---
0 | 28
1 | 32
2 | 33
3 | 36

*示例 2*： 按字段别名分组：

```sql
SELECT account_number AS num
FROM accounts
GROUP BY num
```

| id | num
:--- | :---
0 | 1
1 | 6
2 | 13
3 | 18

*示例 4*： 在 `GROUP BY` 子句中使用标量函数：

```sql
SELECT ABS(age) AS a
FROM accounts
GROUP BY ABS(age)
```

| id | a
:--- | :---
0 | 28.0
1 | 32.0
2 | 33.0
3 | 36.0

## Having

使用 `HAVING` 子句，基于聚合函数（`COUNT`、`AVG`、`SUM`、`MIN` 和 `MAX`）在每个桶内进行聚合。
`HAVING` 子句对 `GROUP BY` 子句的结果进行过滤：

*示例 1*：

```sql
SELECT age, MAX(balance)
FROM accounts
GROUP BY age HAVING MIN(balance) > 10000
```

| id | age | MAX (balance)
:--- | :---
0 | 28 | 32838
1 | 32 | 39225

## Order By

使用 `ORDER BY` 子句按所需顺序对结果排序。

*示例 1*： 使用 `ORDER BY` 按升序或降序排序。除了普通字段名称之外，还支持使用 `ordinal`、`alias` 或 `scalar` 函数：

```sql
SELECT account_number
FROM accounts
ORDER BY account_number DESC
```

| account_number
| :---
| 18
| 13
| 6
| 1

*示例 2*： 指定缺失字段的文档排在结果的开头还是末尾。OpenSearch 的默认行为是把 null 值或缺失字段放在最后返回。要把它们排在非 null 值之前，请使用 `IS NOT NULL` 运算符：

```sql
SELECT employer
FROM accounts
ORDER BY employer IS NOT NULL
```

| employer
| :---
||
| Netagy
| Pyrami
| Quility

## Limit

指定要检索的最大文档数。用于避免把大量数据读入内存。

*示例 1*： 如果只传入一个参数，它会映射到 OpenSearch 中的 `size` 参数，`from` 参数则设置为 0。

```sql
SELECT account_number
FROM accounts
ORDER BY account_number LIMIT 1
```

| account_number
| :---
| 1

*示例 2*： 如果传入两个参数，第一个参数映射到 OpenSearch 中的 `from` 参数，第二个映射到 `size` 参数。这种方式可用于小型索引的简单分页，但对大型索引效率不高。
使用 `ORDER BY` 确保各页之间的顺序一致：

```sql
SELECT account_number
FROM accounts
ORDER BY account_number LIMIT 1, 1
```

| account_number
| :---
| 6
