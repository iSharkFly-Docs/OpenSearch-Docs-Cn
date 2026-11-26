---
title: 数据类型
---

# 数据类型

下表列出了 SQL 插件（plugin）支持的数据类型（data type），以及每种类型与 SQL 和 OpenSearch 数据类型之间的映射关系：

| OpenSearch SQL 类型 | OpenSearch 类型 | SQL 类型
:--- | :--- | :---
boolean |	boolean |	BOOLEAN
byte |	byte |	TINYINT
short |	byte |	SMALLINT
integer |	integer |	INTEGER
long | long |	BIGINT
float |	float |	REAL
half_float | float | FLOAT
scaled_float | float | DOUBLE
double | double | DOUBLE
keyword |	string | VARCHAR
text | text | VARCHAR
date | timestamp | TIMESTAMP
date_nanos | timestamp | TIMESTAMP
ip | ip | VARCHAR
date | timestamp | TIMESTAMP
binary | binary | VARBINARY
object | struct | STRUCT
nested | array | STRUCT

除上述类型外，SQL 插件还支持 `datetime` 类型，但它在 OpenSearch 和 SQL 中都没有对应的映射。
要使用没有对应映射的函数，必须将数据类型显式转换为有对应映射的类型。

## 日期和时间类型

日期和时间类型表示一个时间段：`DATE`、`TIME`、`DATETIME`、`TIMESTAMP` 和 `INTERVAL`。默认情况下，OpenSearch DSL 只使用 `date` 类型作为与日期时间相关的类型，它包含绝对时间点的全部信息。

为了与 SQL 集成，除 `timestamp` 类型外，其他每种类型都只保存时间段信息的一部分。关于日期时间函数的用法，请参阅 [datetime](/search-plugins/sql/functions#date-and-time)。某些函数可能会对输入参数的类型有所限制。

### Date

`date` 类型表示与时区无关的日历日期。一个给定的日期值是一个 24 小时的时间段，但该时间段在不同时区有所不同，并且在夏令时期间可能会有小时数的变化。`date` 类型不包含时间信息，仅支持 `1000-01-01` 到 `9999-12-31` 的范围。

| 类型 | 语法 | 范围
:--- | :--- | :---
date | `yyyy-MM-dd` | `0001-01-01` 到 `9999-12-31`

### Time

`time` 类型表示与时区无关的时钟时间。`time` 类型不包含日期信息。

| 类型 | 语法 | 范围
:--- | :--- | :---
time | `hh:mm:ss[.fraction]` | `00:00:00.0000000000` 到 `23:59:59.9999999999`

### Datetime

`datetime` 类型是日期和时间的组合，不包含时区信息。关于包含日期、时间和时区信息的绝对时间点，请参阅 [Timestamp](#timestamp)。

| 类型 | 语法 | 范围
:--- | :--- | :---
datetime | `yyyy-MM-dd hh:mm:ss[.fraction]` | `0001-01-01 00:00:00.0000000000` 到 `9999-12-31 23:59:59.9999999999`

### Timestamp

`timestamp` 类型是一个与时区或惯例无关的绝对时刻。例如，对于某个给定的时间点，如果将时间戳更改为另一个时区，其值也会相应地变化。

`timestamp` 类型的存储方式与其他类型不同。存储时它会从当前时区转换为 UTC，检索时再从 UTC 转换回所设置的时区。

| 类型 | 语法 | 范围
:--- | :--- | :---
timestamp | `yyyy-MM-dd hh:mm:ss[.fraction]` | `0001-01-01 00:00:01.9999999999` UTC 到 `9999-12-31 23:59:59.9999999999`

### Interval

`interval` 类型表示一段时间长度或一个时间周期。

| 类型 | 语法
:--- | :---
interval | `INTERVAL expr unit`

`expr` 是任意最终能计算出数量值的表达式。unit 表示用于解释该数量的单位，包括 `MICROSECOND`、`SECOND`、`MINUTE`、`HOUR`、`DAY`、`WEEK`、`MONTH`、`QUARTER` 和 `YEAR`。`INTERVAL` 关键字和单位说明符不区分大小写。

`interval` 类型有两类时间间隔：年-周间隔和日-时间隔。

- 年-周间隔存储年、季度、月和周。
- 日-时间隔存储天、小时、分钟、秒和微秒。

### 日期和时间类型之间的转换

除 `interval` 类型外，所有日期和时间类型之间都可以相互转换。转换可能会改变值或导致部分信息丢失，例如从 `datetime` 值中提取 `time` 值，或将 `date` 值转换为 `datetime` 值等。

SQL 插件对各类型支持以下转换规则：

**从 date 转换**

- 由于 `date` 值不含任何时间信息，将其转换为 `time` 类型没有意义，结果始终为零时间值 `00:00:00`。
- 由于缺少时间信息，从 `date` 转换为 `datetime` 时会进行数据填充。默认情况下，会在原日期后附加时间 `00:00:00`，构成一个 `datetime` 实例。例如，将 `2020-08-17` 转换为 `datetime` 类型的结果是 `2020-08-17 00:00:00`。
- 转换为 `timestamp` 类型时，会同时补充 `time` 值和 `timezone` 信息：在日期后附加零时间值 `00:00:00` 和会话时区（默认为 UTC）。例如，在会话时区为 UTC 时，将 `2020-08-17` 转换为 `datetime` 类型的结果是 `2020-08-17 00:00:00 UTC`。

**从 time 转换**

- 由于 `time` 类型不包含任何日期信息，因此无法将其转换为其他任何日期和时间类型。

**从 datetime 转换**

- 将 `datetime` 转换为 `date` 会从 `datetime` 值中提取日期值。例如，将 `2020-08-17 14:09:00` 转换为 `date` 类型的结果是 `2020-08-08`。
- 将 `datetime` 转换为 `time` 会从 `datetime` 值中提取时间值。例如，将 `2020-08-17 14:09:00` 转换为 `time` 类型的结果是 `14:09:00`。
- 由于 `datetime` 类型不包含时区信息，转换为 `timestamp` 类型时会用会话时区填充时区值。例如，将 `2020-08-17 14:09:00`（UTC）转换为 `timestamp` 类型的结果是 `2020-08-17 14:09:00 UTC`。

**从 timestamp 转换**

- 从 `timestamp` 类型转换为 `date` 类型会提取日期值，转换为 `time` 类型会提取时间值。从 `timestamp` 类型转换为 `datetime` 类型只会提取 `datetime` 值，并舍弃时区值。例如，将 `2020-08-17 14:09:00` UTC 转换为 `date` 类型的结果是 `2020-08-17`，转换为 `time` 类型的结果是 `14:09:00`，转换为 `datetime` 类型的结果是 `2020-08-17 14:09:00`。
