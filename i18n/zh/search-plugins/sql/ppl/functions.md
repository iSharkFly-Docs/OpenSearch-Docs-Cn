---
title: 命令
---

# 命令

`PPL` 支持所有 [`SQL` 通用](/search-plugins/sql/functions)函数（function），包括[相关性搜索](/search-plugins/sql/full-text)，同时还引入了一些仅在 `PPL` 中可用的函数（称为 `commands`，即命令）。

## dedup

`dedup`（数据去重）命令会从搜索结果中删除按某个字段（Field）判定为重复的文档（Document）。

### 语法

```sql
dedup [int] <field-list> [keepempty=<bool>] [consecutive=<bool>]
```

字段 | 说明 | 类型 | 必需 | 默认值
:--- | :--- |:--- |:--- |:---
`int` |  为每种组合保留指定数量的重复事件。该数字必须大于 0。如果不指定数字，则只保留第一个出现的事件，其他所有重复项都会从结果中删除。 | `string` | 否 | 1
`keepempty` | 如果为 true，则当字段列表中的任一字段为 null 值或缺失字段时，保留该文档。 | `nested list of objects` | 否 | False
`consecutive` | 如果为 true，则只删除值组合重复的连续事件。 | `Boolean` | 否 | False
`field-list` | 指定以逗号分隔的字段列表。至少需要一个字段。 | `String` 或以逗号分隔的字符串列表 | 是 | -

**示例 1：按一个字段去重**

删除性别相同的重复文档：

```sql
search source=accounts | dedup gender | fields account_number, gender;
```

| account_number | gender
:--- | :--- |
1 | M
13 | F

**示例 2：保留两个重复文档**

保留两个性别相同的重复文档：

```sql
search source=accounts | dedup 2 gender | fields account_number, gender;
```

| account_number | gender
:--- | :--- |
1 | M
6 | M
13 | F

**示例 3：默认保留或忽略空字段**

保留字段值为 `null` 的重复文档：

```sql
search source=accounts | dedup email keepempty=true | fields account_number, email;
```

| account_number | email
:--- | :--- |
1 | amberduke@pyrami.com
6 | hattiebond@netagy.com
13 | null
18 | daleadams@boink.com

删除字段值为 `null` 的重复文档：

```sql
search source=accounts | dedup email | fields account_number, email;
```

| account_number | email
:--- | :--- |
1 | amberduke@pyrami.com
6 | hattiebond@netagy.com
18 | daleadams@boink.com

**示例 4：对连续文档去重**

删除连续文档中的重复项：

```sql
search source=accounts | dedup gender consecutive=true | fields account_number, gender;
```

| account_number | gender
:--- | :--- |
1 | M
13 | F
18 | M

### 限制

`dedup` 命令不会被重写为 OpenSearch DSL，它只在协调节点上执行。

## eval

`eval` 命令对表达式求值，并将结果追加到搜索结果中。

### 语法 {#syntax-1}

```sql
eval <field>=<expression> ["," <field>=<expression> ]...
```

字段 | 说明 | 必需
:--- | :--- |:---
`field` | 如果字段名不存在，则添加一个新字段。如果字段名已存在，则覆盖该字段。 | 是
`expression` | 指定任意受支持的表达式。 | 是

**示例 1：创建新字段**

为每个文档创建一个新的 `doubleAge` 字段。`doubleAge` 是 `age` 乘以 2 的结果：

```sql
search source=accounts | eval doubleAge = age * 2 | fields age, doubleAge;
```

| age | doubleAge
:--- | :--- |
32    | 64
36    | 72
28    | 56
33    | 66

*示例 2*：覆盖现有字段

用 `age` 加 1 的结果覆盖 `age` 字段：

```sql
search source=accounts | eval age = age + 1 | fields age;
```

| age
:--- |
| 33
| 37
| 29
| 34

**示例 3：使用 `eval` 命令中定义的字段创建新字段**

创建一个新字段 `ddAge`。`ddAge` 是 `doubleAge` 乘以 2 的结果，其中 `doubleAge` 在 `eval` 命令中定义：

```sql
search source=accounts | eval doubleAge = age * 2, ddAge = doubleAge * 2 | fields age, doubleAge, ddAge;
```

| age | doubleAge | ddAge
:--- | :--- |
| 32    | 64   | 128
| 36    | 72   | 144
| 28    | 56   | 112
| 33    | 66   | 132

### 限制

``eval`` 命令不会被重写为 OpenSearch DSL，它只在协调节点上执行。

## fields

使用 `fields` 命令在搜索结果中保留或删除字段。

### 语法 {#syntax-2}

```sql
fields [+|-] <field-list>
```

字段 | 说明 | 必需 | 默认值
:--- | :--- |:---|:---
`index` | 加号（+）只保留字段列表中指定的字段。减号（-）删除字段列表中指定的所有字段。 | 否 | +
`field list` | 指定以逗号分隔的字段列表。 | 是 | 无默认值

**示例 1：从结果中选择指定字段**

从搜索结果中获取 `account_number`、`firstname` 和 `lastname` 字段：

```sql
search source=accounts | fields account_number, firstname, lastname;
```

| account_number | firstname  | lastname
:--- | :--- |
| 1   | Amber       | Duke
| 6   | Hattie      | Bond
| 13  | Nanette     | Bates
| 18  | Dale        | Adams

**示例 2：从搜索结果中删除指定字段**

从搜索结果中删除 `account_number` 字段：

```sql
search source=accounts | fields account_number, firstname, lastname | fields - account_number;
```

| firstname | lastname
:--- | :--- |
| Amber   | Duke
| Hattie  | Bond
| Nanette | Bates
| Dale    | Adams

## parse

使用 `parse` 命令通过正则表达式解析文本字段，并将结果追加到搜索结果中。

### 语法 {#syntax-3}

```sql
parse <field> <regular-expression>
```

字段 | 说明 | 必需
:--- | :--- |:---
field | 文本字段。 | 是
regular-expression | 用于从给定文本字段中提取新字段的正则表达式。如果新字段名已存在，则会替换原字段。 | 是

该正则表达式使用 Java 正则引擎匹配每个文档的整个文本字段。表达式中的每个命名捕获组都会成为一个新的 ``STRING`` 字段。

**示例 1：创建新字段**

本示例展示如何为每个文档创建新字段 `host`。`host` 是 `email` 字段中 `@` 之后的主机名。解析 null 字段将返回空字符串。

```sql
os> source=accounts | parse email '.+@(?<host>.+)' | fields email, host ;
fetched rows / total rows = 4/4
```

| email | host  
:--- | :--- |
| amberduke@pyrami.com  | pyrami.com 
| hattiebond@netagy.com | netagy.com 
| null                  | null          
| daleadams@boink.com   | boink.com  

*示例 2*：覆盖现有字段

本示例展示如何用去掉门牌号后的内容覆盖现有的 address 字段。

```sql
os> source=accounts | parse address '\d+ (?<address>.+)' | fields address ;
fetched rows / total rows = 4/4
```

| address
:--- |
| Holmes Lane      
| Bristol Street   
| Madison Street   
| Hutchinson Court

**示例 3：按转换类型后的解析字段进行过滤和排序**

本示例展示如何对 address 字段中大于 500 的门牌号进行排序。

```sql
os> source=accounts | parse address '(?<streetNumber>\d+) (?<street>.+)' | where cast(streetNumber as int) > 500 | sort num(streetNumber) | fields streetNumber, street ;
fetched rows / total rows = 3/3
```

| streetNumber | street  
:--- | :--- |
| 671 | Bristol Street 
| 789 | Madison Street 
| 880 | Holmes Lane  

### 限制 {#limitations-1}

使用 parse 命令时存在以下限制：

- 由 parse 定义的字段不能再次解析。例如，`source=accounts | parse address '\d+ (?<street>.+)' | parse street '\w+ (?<road>\w+)' ;` 将无法返回任何表达式。
- 由 parse 定义的字段不能被其他命令覆盖。例如，输入 `source=accounts | parse address '\d+ (?<street>.+)' | eval street='1' | where street='1' ;` 时，由于 `street` 无法被覆盖，`where` 不会匹配任何文档。
- parse 所使用的文本字段不能被覆盖。例如，输入 `source=accounts | parse address '\d+ (?<street>.+)' | eval address='1' ;` 时，由于 address 被覆盖，`street` 不会被解析。
- 由 parse 定义的字段在 `stats` 命令中使用之后，不能再进行过滤或排序。例如，在 `source=accounts | parse email '.+@(?<host>.+)' | stats avg(age) by host | where host=pyrami.com ;` 中，`where` 不会解析列出的域名。

## rename

使用 `rename` 命令重命名搜索结果中的一个或多个字段。

### 语法 {#syntax-4}

```sql
rename <source-field> AS <target-field>["," <source-field> AS <target-field>]...
```

字段 | 说明 | 必需
:--- | :--- |:---
`source-field` | 要重命名的字段的名称。 | 是
`target-field` | 要重命名成的名称。 | 是

**示例 1：重命名一个字段**

将 `account_number` 字段重命名为 `an`：

```sql
search source=accounts | rename account_number as an | fields an;
```

| an
:--- |
| 1
| 6
| 13
| 18

**示例 2：重命名多个字段**

将 `account_number` 字段重命名为 `an`，并将 `employer` 重命名为 `emp`：

```sql
search source=accounts | rename account_number as an, employer as emp | fields an, emp;
```

| an   | emp
:--- | :--- |
| 1    | Pyrami
| 6    | Netagy
| 13   | Quility
| 18   | null

### 限制 {#limitations-2}

`rename` 命令不会被重写为 OpenSearch DSL，它只在协调节点上执行。

## sort

使用 `sort` 命令按指定字段对搜索结果排序（sort）。

### 语法 {#syntax-5}

```sql
sort [count] <[+|-] sort-field>...
```

字段 | 说明 | 必需 | 默认值
:--- | :--- |:---
`count` | 从排序结果中返回的最大结果数。如果 count=0，则返回所有结果。 | 否 | 1000
`[+|-]` | 使用加号 [+] 按升序排序，使用减号 [-] 按降序排序。 | 否 | 升序
`sort-field` | 指定要排序的字段。 | 是 | -

**示例 1：按一个字段排序**

按 `age` 字段以升序对所有文档排序：

```sql
search source=accounts | sort age | fields account_number, age;
```

| account_number | age |
:--- | :--- |
| 13 | 28
| 1  | 32
| 18 | 33
| 6  | 36

**示例 2：按一个字段排序并返回所有结果**

按 `age` 字段以升序对所有文档排序，并将 count 指定为 0 以返回所有结果：

```sql
search source=accounts | sort 0 age | fields account_number, age;
```

| account_number | age |
:--- | :--- |
| 13 | 28
| 1  | 32
| 18 | 33
| 6  | 36

**示例 3：按一个字段降序排序**

按 `age` 字段以降序对所有文档排序：

```sql
search source=accounts | sort - age | fields account_number, age;
```

| account_number | age |
:--- | :--- |
| 6 | 36
| 18  | 33
| 1 | 32
| 13  | 28

**示例 4：指定返回的排序文档数量**

按 `age` 字段以升序对所有文档排序，并将 count 指定为 2 以返回两个结果：

```sql
search source=accounts | sort 2 age | fields account_number, age;
```

| account_number | age |
:--- | :--- |
| 13 | 28
| 1  | 32

**示例 5：按多个字段排序**

按 `gender` 字段以升序、按 `age` 字段以降序对所有文档排序：

```sql
search source=accounts | sort + gender, - age | fields account_number, gender, age;
```

| account_number | gender | age |
:--- | :--- | :--- |
| 13 | F | 28
| 6  | M | 36
| 18 | M | 33
| 1  | M | 32

## stats

使用 `stats` 命令对搜索结果进行聚合（Aggregation）。

下表列出了聚合函数，并说明了每个函数如何处理 null 值或缺失值：

函数 | NULL | MISSING
:--- | :--- |:---
`COUNT` | 不计数 | 不计数
`SUM` | 忽略 | 忽略
`AVG` | 忽略 | 忽略
`MAX` | 忽略 | 忽略
`MIN` | 忽略 | 忽略

### 语法 {#syntax-6}

```
stats <aggregation>... [by-clause]...
```

字段 | 说明 | 必需 | 默认值
:--- | :--- |:---
`aggregation` | 指定一个统计聚合函数。该函数的参数必须是字段。 | 是 | 1000
`by-clause` | 指定用于对结果进行分组的一个或多个字段。如果未指定，`stats` 命令只返回一行，即对整个结果集的聚合结果。 | 否 | -

**示例 1：计算字段的平均值**

计算所有文档的平均 `age`：

```sql
search source=accounts | stats avg(age);
```

| avg(age)
:--- |
| 32.25

**示例 2：按组计算字段的平均值**

计算按性别分组的平均年龄：

```sql
search source=accounts | stats avg(age) by gender;
```

| gender | avg(age)
:--- | :--- |
| F  | 28.0
| M  | 33.666666666666664

**示例 3：按组计算字段的平均值和总和**

计算按性别分组的年龄平均值和总和：

```sql
search source=accounts | stats avg(age), sum(age) by gender;
```

| gender | avg(age) | sum(age)
:--- | :--- |
| F  | 28   | 28
| M  | 33.666666666666664 | 101

**示例 4：计算字段的最大值**

计算最大年龄：

```sql
search source=accounts | stats max(age);
```

| max(age)
:--- |
| 36

**示例 5：按组计算字段的最大值和最小值**

计算按性别分组的年龄最大值和最小值：

```sql
search source=accounts | stats max(age), min(age) by gender;
```

| gender | min(age) | max(age)
:--- | :--- | :--- |
| F  | 28 | 28
| M  | 32 | 36

## where

使用带布尔表达式的 `where` 命令过滤搜索结果。只有当布尔表达式的计算结果为 true 时，`where` 命令才会返回结果。

### 语法 {#syntax-7}

```sql
where <boolean-expression>
```

字段 | 说明 | 必需
:--- | :--- |:---
`bool-expression` | 计算结果为布尔值的表达式。 | 否

**示例：按条件过滤结果集**

从 `accounts` 索引（Index）中获取 `account_number` 为 1 或 gender 为 `F` 的所有文档：

```sql
search source=accounts | where account_number=1 or gender=\"F\" | fields account_number, gender;
```

| account_number | gender
:--- | :--- |
| 1  | M
| 13 | F

## head

使用 `head` 命令按指定的搜索顺序返回前 N 个结果。

### 语法 {#syntax-8}

```sql
head [N]
```

字段 | 说明 | 必需 | 默认值
:--- | :--- |:---
`N` | 指定要返回的结果数量。 | 否 | 10

**示例 1：获取前 10 个结果**

获取前 10 个结果：

```sql
search source=accounts | fields firstname, age | head;
```

| firstname | age
:--- | :--- |
| Amber  | 32
| Hattie | 36
| Nanette | 28

**示例 2：获取前 N 个结果**

获取前两个结果：

```sql
search source=accounts | fields firstname, age | head 2;
```

| firstname | age
:--- | :--- |
| Amber  | 32
| Hattie | 36

### 限制 {#limitations-3}

`head` 命令不会被重写为 OpenSearch DSL，它只在协调节点上执行。

## rare

使用 `rare` 命令查找字段列表中所有字段最不常见的值。
对于分组字段的每组不同值，最多返回 10 个结果。

### 语法 {#syntax-9}

```sql
rare <field-list> [by-clause]
```

字段 | 说明 | 必需
:--- | :--- |:---
`field-list` | 指定以逗号分隔的字段名列表。 | 否
`by-clause` | 指定用于对结果进行分组的一个或多个字段。 | 否

**示例 1：查找字段中最不常见的值**

查找性别中最不常见的值：

```sql
search source=accounts | rare gender;
```

| gender
:--- |
| F
| M

**示例 2：查找按性别分组的最不常见的值**

查找按性别分组的最不常见的年龄：

```sql
search source=accounts | rare age by gender;
```

| gender | age
:--- | :--- |
| F  | 28
| M  | 32
| M  | 33

### 限制 {#limitations-4}

`rare` 命令不会被重写为 OpenSearch DSL，它只在协调节点上执行。

## top {#top-command}

使用 `top` 命令查找字段列表中所有字段最常见的值。

### 语法 {#syntax-10}

```sql
top [N] <field-list> [by-clause]
```

字段 | 说明 | 默认值
:--- | :--- |:---
`N` | 指定要返回的结果数量。 | 10
`field-list` | 指定以逗号分隔的字段名列表。 | -
`by-clause` | 指定用于对结果进行分组的一个或多个字段。 | -

**示例 1：查找字段中最常见的值**

查找最常见的性别：

```sql
search source=accounts | top gender;
```

| gender
:--- |
| M
| F

**示例 2：查找字段中最常见的一个值**

查找最常见的那个性别：

```sql
search source=accounts | top 1 gender;
```

| gender
:--- |
| M

**示例 3：查找按性别分组的最常见的值**

查找按性别分组的最常见的年龄：

```sql
search source=accounts | top 1 age by gender;
```

| gender | age
:--- | :--- |
| F  | 28
| M  | 32

### 限制 {#limitations-5}

`top` 命令不会被重写为 OpenSearch DSL，它只在协调节点上执行。

## ad

`ad` 命令将 [ML Commons 插件](/ml-commons-plugin/)中的随机切割森林（Random Cut Forest，RCF）算法应用于 PPL 命令返回的搜索结果。根据输入的不同，该插件会使用两种 RCF 算法：用于处理时间序列数据的固定时间 RCF，以及用于处理非时间序列数据的批量 RCF。

### 语法：用于时间序列数据的固定时间 RCF 命令

```sql
ad <shingle_size> <time_decay> <time_field>
```

字段 | 说明 | 必需
:--- | :--- |:---
`shingle_size` | 由最近的若干条记录组成的连续序列。默认值为 8。 | 否
`time_decay` | 指定在计算异常分数时考虑多久之前的近期数据。默认值为 0.001。 | 否
`time_field` | 指定 RCF 用作时间序列数据的时间字段。必须是 long 值（例如以毫秒为单位的时间戳），或格式为 "yyyy-MM-dd HH:mm:ss" 的字符串值。| 是

### 语法：用于非时间序列数据的批量 RCF 命令

```sql
ad <shingle_size> <time_decay>
```

字段 | 说明 | 必需
:--- | :--- |:---
`shingle_size` | 由最近的若干条记录组成的连续序列。默认值为 8。 | 否
`time_decay` | 指定在计算异常分数时考虑多久之前的近期数据。默认值为 0.001。 | 否

**示例 1：使用时间序列数据，从出租车载客数据中检测纽约市的事件**

本示例训练一个 RCF 模型（model），并使用该模型检测时间序列载客数据中的异常。

PPL 查询：

```sql
os> source=nyc_taxi | fields value, timestamp | AD time_field='timestamp' | where value=10844.0
```

value | timestamp | score | anomaly_grade
:--- | :--- |:--- | :---
10844.0 | 1404172800000 | 0.0 | 0.0    

**示例 2：使用非时间序列数据，从出租车载客数据中检测纽约市的事件**

PPL 查询：

```sql
os> source=nyc_taxi | fields value | AD | where value=10844.0
```

value | score | anomalous
:--- | :--- |:--- 
| 10844.0 | 0.0 | false  

## kmeans

kmeans 命令将 ML Commons 插件的 kmeans 算法应用于所提供 PPL 命令的搜索结果。

### 语法 {#syntax-11}

```sql
kmeans <cluster-number>
```

对于 `cluster-number`，输入要将数据点分成的簇的数量。

**示例：对 Iris 数据分组**

本示例展示如何根据每个样本测得的四个特征（萼片和花瓣的长度与宽度）的组合，对三种鸢尾花（Iris setosa、Iris virginica 和 Iris versicolor）进行分类。

PPL 查询：

```sql
os> source=iris_data | fields sepal_length_in_cm, sepal_width_in_cm, petal_length_in_cm, petal_width_in_cm | kmeans centroids=3
```

sepal_length_in_cm | sepal_width_in_cm | petal_length_in_cm | petal_width_in_cm | ClusterID
:--- | :--- |:--- | :--- | :--- 
| 5.1 | 3.5 | 1.4 | 0.2 | 1   
| 5.6 | 3.0 | 4.1 | 1.3 | 0
| 6.7 | 2.5 | 5.8 | 1.8 | 2
