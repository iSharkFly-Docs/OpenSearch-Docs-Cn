---
title: 元数据查询
---

# 元数据查询

要查看索引的基本元数据，请使用 `SHOW` 和 `DESCRIBE` 命令。

### 语法

规则 `showStatement`：

![showStatement](/images/showStatement.png)

规则 `showFilter`：

![showFilter](/images/showFilter.png)

### 示例 1：查看索引的元数据

要查看与特定模式匹配的索引的元数据，请使用 `SHOW` 命令。
使用通配符 `%` 匹配所有索引：

```sql
SHOW TABLES LIKE %
```

| TABLE_CAT | TABLE_SCHEM | TABLE_NAME | TABLE_TYPE | REMARKS | TYPE_CAT | TYPE_SCHEM | TYPE_NAME | SELF_REFERENCING_COL_NAME | REF_GENERATION
:--- | :---
docker-cluster | null | accounts | BASE TABLE | null | null | null | null | null | null
docker-cluster  | null | employees_nested | BASE TABLE | null | null | null | null | null | null

### 示例 2：查看特定索引的元数据

要查看名称以 `acc` 为前缀的索引的元数据：

```sql
SHOW TABLES LIKE acc%
```

| TABLE_CAT | TABLE_SCHEM | TABLE_NAME | TABLE_TYPE | REMARKS | TYPE_CAT | TYPE_SCHEM | TYPE_NAME | SELF_REFERENCING_COL_NAME | REF_GENERATION
:--- | :---
docker-cluster | null | accounts | BASE TABLE | null | null | null | null | null | null

### 示例 3：查看字段的元数据

要查看与特定模式匹配的字段名称的元数据，请使用 `DESCRIBE` 命令：

```sql
DESCRIBE TABLES LIKE accounts
```

| TABLE_CAT | TABLE_SCHEM | TABLE_NAME | COLUMN_NAME | DATA_TYPE | TYPE_NAME | COLUMN_SIZE | BUFFER_LENGTH | DECIMAL_DIGITS | NUM_PREC_RADIX | NULLABLE | REMARKS | COLUMN_DEF | SQL_DATA_TYPE | SQL_DATETIME_SUB | CHAR_OCTET_LENGTH | ORDINAL_POSITION | IS_NULLABLE | SCOPE_CATALOG | SCOPE_SCHEMA | SCOPE_TABLE | SOURCE_DATA_TYPE | IS_AUTOINCREMENT | IS_GENERATEDCOLUMN
:--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---
docker-cluster | null | accounts | account_number | null | long | null | null | null | 10 | 2 | null | null | null | null | null | 1 |  | null | null | null | null | NO |
docker-cluster | null | accounts | firstname | null | text | null | null | null | 10 | 2 | null | null | null | null | null | 2 |  | null | null | null | null | NO | 	 
docker-cluster | null | accounts | address | null | text | null | null | null | 10 | 2 | null | null | null | null | null | 3 |  | null | null | null | null | NO | 	 
docker-cluster | null | accounts | balance | null | long | null | null | null | 10 | 2 | null | null | null | null | null | 4 |  | null | null | null | null | NO | 	 
docker-cluster | null | accounts | gender | null | text | null | null | null | 10 | 2 | null | null | null | null | null | 5 |  | null | null | null | null | NO | 	
docker-cluster | null | accounts | city | null | text | null | null | null | 10 | 2 | null | null | null | null | null | 6 |  | null | null | null | null | NO | 	 
docker-cluster | null | accounts | employer | null | text | null | null | null | 10 | 2 | null | null | null | null | null | 7 |  | null | null | null | null | NO | 	
docker-cluster | null | accounts | state | null | text | null | null | null | 10 | 2 | null | null | null | null | null | 8 |  | null | null | null | null | NO | 	   
docker-cluster | null | accounts | age | null | long | null | null | null | 10 | 2 | null | null | null | null | null | 9 |  | null | null | null | null | NO | 	
docker-cluster | null | accounts | email | null | text | null | null | null | 10 | 2 | null | null | null | null | null | 10 |  | null | null | null | null | NO | 	
docker-cluster | null | accounts | lastname | null | text | null | null | null | 10 | 2 | null | null | null | null | null | 11 |  | null | null | null | null | NO |
