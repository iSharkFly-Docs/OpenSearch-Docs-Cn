---
title: 聚合函数
---

# 聚合函数

聚合函数（aggregate function）作用于由 `GROUP BY` 子句定义的子集。如果没有 `GROUP BY` 子句，聚合函数作用于结果集中的所有元素。可以在 `GROUP BY`、`SELECT` 和 `HAVING` 子句中使用聚合函数。

OpenSearch 支持以下聚合函数。

函数 | 描述
:--- | :---
`AVG` | 返回结果的平均值。
`COUNT` | 返回结果的数量。
`SUM` | 返回结果的总和。
`MIN` | 返回结果的最小值。
`MAX` | 返回结果的最大值。
`VAR_POP` 或 `VARIANCE` | 舍弃 null 值后，返回结果的总体方差。只有一行结果时返回 0。
`VAR_SAMP` | 舍弃 null 值后，返回结果的样本方差。只有一行结果时返回 null。
`STD` 或 `STDDEV` | 返回结果的样本标准差。只有一行结果时返回 0。
`STDDEV_POP` | 返回结果的总体标准差。只有一行结果时返回 0。
`STDDEV_SAMP` | 返回结果的样本标准差。只有一行结果时返回 null。

下面的示例引用了一个 `employees` 表。可以使用批量索引操作将以下文档索引到 OpenSearch 中，然后试用这些示例：

```json
PUT employees/_bulk?refresh
{"index":{"_id":"1"}}
{"employee_id": 1, "department":1, "firstname":"Amber", "lastname":"Duke", "sales":1356, "sale_date":"2020-01-23"}
{"index":{"_id":"2"}}
{"employee_id": 1, "department":1, "firstname":"Amber", "lastname":"Duke", "sales":39224, "sale_date":"2021-01-06"}
{"index":{"_id":"6"}}
{"employee_id":6, "department":1, "firstname":"Hattie", "lastname":"Bond", "sales":5686, "sale_date":"2021-06-07"}
{"index":{"_id":"7"}}
{"employee_id":6, "department":1, "firstname":"Hattie", "lastname":"Bond", "sales":12432, "sale_date":"2022-05-18"}
{"index":{"_id":"13"}}
{"employee_id":13,"department":2, "firstname":"Nanette", "lastname":"Bates", "sales":32838, "sale_date":"2022-04-11"}
{"index":{"_id":"18"}}
{"employee_id":18,"department":2, "firstname":"Dale", "lastname":"Adams", "sales":4180, "sale_date":"2022-11-05"}
```

## GROUP BY

`GROUP BY` 子句定义结果集的子集。聚合函数作用于这些子集，并为每个子集返回一行结果。 

可以在 `GROUP BY` 子句中使用标识符（identifier）、序号或表达式。

### 在 GROUP BY 中使用标识符

可以在 `GROUP BY` 子句中指定要聚合的字段名称（列名）。例如，以下查询返回部门编号以及每个部门的销售总额： 
```sql
SELECT department, sum(sales) 
FROM employees 
GROUP BY department;
```

| department | sum(sales)
:--- | :---
1 | 58700  |
2 | 37018 |

### 在 GROUP BY 中使用序号

可以在 `GROUP BY` 子句中指定要聚合的列号。列号由该列在 `SELECT` 子句中的位置决定。例如，以下查询与上面的查询等价，它返回部门编号以及每个部门的销售总额，并按结果集的第一列（即 `department`）对结果分组：

```sql
SELECT department, sum(sales) 
FROM employees 
GROUP BY 1;
```

| department | sum(sales)
:--- | :---
1 | 58700  |
2 | 37018 |

### 在 GROUP BY 中使用表达式

可以在 `GROUP BY` 子句中使用表达式。例如，以下查询返回每年的平均销售额：

```sql
SELECT year(sale_date), avg(sales) 
FROM employees 
GROUP BY year(sale_date);
```

| year(start_date) | avg(sales)
:--- | :---
| 2020  | 1356.0 |
| 2021 | 22455.0 |
| 2022 | 16484.0  |

## SELECT

可以在 `SELECT` 子句中直接使用聚合表达式，也可以将其作为更大表达式的一部分来使用。此外，还可以将表达式用作聚合函数的参数。

### 在 SELECT 中直接使用聚合表达式

以下查询返回每个部门的平均销售额：

```sql
SELECT department, avg(sales) 
FROM employees 
GROUP BY department;
```

| department | avg(sales)
:--- | :---
1 | 14675.0 |
2 | 18509.0 |

### 在 SELECT 中将聚合表达式作为更大表达式的一部分

以下查询按平均销售额的 5% 计算每个部门员工的平均佣金：

```sql
SELECT department, avg(sales) * 0.05 as avg_commission 
FROM employees 
GROUP BY department;
```

| department | avg_commission
:--- | :---
1 | 733.75 |
2 | 925.45 |

### 将表达式用作聚合函数的参数

以下查询计算每个部门的平均佣金金额。它先按 `sales` 的 5% 计算每个 `sales` 值对应的佣金金额，然后求出所有佣金值的平均值：

```sql
SELECT department, avg(sales * 0.05) as avg_commission 
FROM employees 
GROUP BY department;
```

| department | avg_commission
:--- | :---
1 | 733.75 |
2 | 925.45 |

### COUNT

`COUNT` 函数接受 `*` 之类的参数或 `1` 之类的字面量。
下表说明了 `COUNT` 函数各种形式的工作方式。

| 函数类型 | 描述
`COUNT(field)` | 统计给定字段（或表达式）的值不为 null 的行数。
`COUNT(*)` | 统计表中的总行数。
`COUNT(1)`（与 `COUNT(*)` 相同） | 统计任意非 null 字面量。

例如，以下查询返回每年的销售次数：

```sql
SELECT year(sale_date), count(sales) 
FROM employees 
GROUP BY year(sale_date);
```

| year(sale_date) | count(sales)
:--- | :---
2020 | 1
2021 | 2
2022 | 3

## HAVING

`WHERE` 和 `HAVING` 都用于过滤结果。`WHERE` 过滤在 `GROUP BY` 阶段之前执行，因此不能在 `WHERE` 子句中使用聚合函数。不过，可以用 `WHERE` 子句限制随后参与聚合的行。

`HAVING` 过滤在 `GROUP BY` 阶段之后执行，因此可以用 `HAVING` 子句限制结果中包含哪些分组。 

### 带 GROUP BY 的 HAVING

可以在 `HAVING` 条件中使用聚合表达式，或者使用在 `SELECT` 子句中为它们定义的别名。

以下查询在 `HAVING` 子句中使用聚合表达式，返回销售次数多于一次的每位员工的销售次数：

```sql
SELECT employee_id, count(sales)
FROM employees
GROUP BY employee_id
HAVING count(sales) > 1;
```

| employee_id | count(sales)
:--- | :---
1 | 2 |
6 | 2

`HAVING` 子句中的聚合不必与 `SELECT` 列表中的聚合相同。以下查询在 `HAVING` 子句中使用 `count` 函数，而在 `SELECT` 子句中使用 `sum` 函数，返回销售次数多于一次的每位员工的销售总额：

```sql
SELECT employee_id, sum(sales)
FROM employees
GROUP BY employee_id
HAVING count(sales) > 1;
```

| employee_id | sum (sales)
:--- | :---
1 | 40580 |
6 | 18120

作为对 SQL 标准的扩展，`GROUP BY` 子句中并不限于只使用标识符。以下查询在 `GROUP BY` 子句中使用了别名，与上一个查询等价：

```sql
SELECT employee_id as id, sum(sales)
FROM employees
GROUP BY id
HAVING count(sales) > 1;
```

| id | sum (sales)
:--- | :---
1 | 40580 |
6 | 18120

也可以在 `HAVING` 子句中使用聚合表达式的别名。以下查询返回销售额超过 $40,000 的各部门的销售总额：

```sql
SELECT department, sum(sales) as total
FROM employees
GROUP BY department
HAVING total > 40000;
```

| department | total
:--- | :---
1 | 58700 |

如果某个标识符有歧义（例如，它既是 `SELECT` 中的别名，又是索引中的字段），则优先使用别名。在以下查询中，该标识符会被替换为 `SELECT` 子句中以它为别名的表达式：

```sql
SELECT department, sum(sales) as sales
FROM employees
GROUP BY department
HAVING sales > 40000;
```

| department | sales
:--- | :---
1 | 58700 |

### 不带 GROUP BY 的 HAVING

可以在没有 `GROUP BY` 子句的情况下使用 `HAVING` 子句。这时整个数据集被视为一个分组。如果 `department` 列中有不止一个值，以下查询将返回 `True`：

```sql
SELECT 'True' as more_than_one_department FROM employees HAVING min(department) < max(department);
```

| more_than_one_department |
:--- |
True |

如果员工表中的所有员工都属于同一个部门，结果将不包含任何行：

| more_than_one_department
:--- |
 |
