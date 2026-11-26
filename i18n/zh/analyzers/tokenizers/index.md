---
title: 分词器
---

# 分词器

分词器（Tokenizer）接收字符流，并将文本拆分为单独的*词元（Token）*。词元由一个词项（通常是一个单词）以及关于该词项的元数据组成。例如，分词器可以按空白字符拆分文本，使文本 `Actions speak louder than words.` 变为 [`Actions`, `speak`, `louder`, `than`, `words.`]。 

分词器的输出是一个词元流。分词器还会维护以下关于词元的元数据：

- 每个词元的**顺序**或**位置**：此信息用于单词和短语的邻近查询。 
- 词元在文本中的起始和结束位置（**偏移量**）：此信息用于高亮显示搜索词。 
- 词元的**类型**：一些分词器（例如 `standard`）会按类型对词元进行分类，例如 `<ALPHANUM>` 或 `<NUM>`。较简单的分词器（例如 `letter`）只会把词元归类为 `word` 类型。

你可以使用分词器来定义自定义分析器（Analyzer）。 

## 内置分词器

下表列出了 OpenSearch 提供的内置分词器。 

### 单词分词器

单词分词器将全文解析为单词。

分词器 | 描述 | 示例
:--- | :--- | :---
`standard` | - 在单词边界处将字符串解析为词元 <br> - 移除大部分标点符号 | `It’s fun to contribute a brand-new PR or 2 to OpenSearch!` <br>变为<br> [`It’s`, `fun`, `to`, `contribute`, `a`,`brand`, `new`, `PR`, `or`, `2`, `to`, `OpenSearch`] 
`letter` | - 在任何非字母字符处将字符串解析为词元 <br> - 移除非字母字符 | `It’s fun to contribute a brand-new PR or 2 to OpenSearch!` <br>变为<br> [`It`, `s`, `fun`, `to`, `contribute`, `a`,`brand`, `new`, `PR`, `or`, `to`, `OpenSearch`]
`lowercase` | - 在任何非字母字符处将字符串解析为词元 <br> - 移除非字母字符 <br> - 将词项转换为小写 | `It’s fun to contribute a brand-new PR or 2 to OpenSearch!` <br>变为<br> [`it`, `s`, `fun`, `to`, `contribute`, `a`,`brand`, `new`, `pr`, `or`, `to`, `opensearch`]
`whitespace` | - 在空白字符处将字符串解析为词元 | `It’s fun to contribute a brand-new PR or 2 to OpenSearch!` <br>变为<br> [`It’s`, `fun`, `to`, `contribute`, `a`,`brand-new`, `PR`, `or`, `2`, `to`, `OpenSearch!`] 
`uax_url_email` | - 与 standard 分词器类似 <br> - 与 standard 分词器不同的是，它会将 URL 和电子邮件地址保留为单个词项 | `It’s fun to contribute a brand-new PR or 2 to OpenSearch opensearch-project@github.com!` <br>变为<br> [`It’s`, `fun`, `to`, `contribute`, `a`,`brand`, `new`, `PR`, `or`, `2`, `to`, `OpenSearch`, `opensearch-project@github.com`] 
`classic` | - 在以下位置将字符串解析为词元： <br> &emsp; - 后跟空白字符的标点符号 <br> &emsp; - 连字符（如果词项不包含数字） <br> - 移除标点符号 <br>  - 将 URL 和电子邮件地址保留为单个词项 | `Part number PA-35234, single-use product (128.32)` <br>变为<br> [`Part`, `number`, `PA-35234`, `single`, `use`, `product`, `128.32`]
`thai` | - 将泰文文本解析为词项 | `สวัสดีและยินดีต` <br>变为<br> [`สวัสด`, `และ`, `ยินดี`, `ต`] 

### 部分单词分词器

部分单词分词器将文本解析为单词，并生成这些单词的片段，用于部分单词匹配。

分词器 | 描述 | 示例
:--- | :--- | :---
`ngram`| - 在指定字符（例如标点符号或空白字符）处将字符串解析为单词，并为每个单词生成 n-gram | `My repo` <br>变为<br> [`M`, `My`, `y`, `y `, <code>&nbsp;</code>, <code>&nbsp;r</code>, `r`, `re`, `e`, `ep`, `p`, `po`, `o`] <br> 因为默认的 n-gram 长度为 1--2 个字符 
`edge_ngram` | - 在指定字符（例如标点符号或空白字符）处将字符串解析为单词，并为每个单词生成 edge n-gram（从单词开头开始的 n-gram） | `My repo` <br>变为<br> [`M`, `My`] <br> 因为默认的 n-gram 长度为 1--2 个字符 

### 结构化文本分词器

结构化文本分词器用于解析结构化文本，例如标识符、电子邮件地址、路径或邮政编码。

分词器 | 描述 | 示例
:--- | :--- | :---
`keyword` | - 不执行任何操作的分词器 <br> - 原样输出整个字符串 <br> - 可以与词元过滤器（例如 lowercase）组合使用来规范化词项 | `My repo` <br>变为<br> `My repo`
`pattern` | - 使用正则表达式模式按单词分隔符将文本解析为词项，或将匹配的文本捕获为词项 <br> - 使用 [Java 正则表达式](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html) | `https://opensearch.org/forum` <br>变为<br> [`https`, `opensearch`, `org`, `forum`]，因为默认情况下该分词器在单词边界（`\W+`）处拆分词项<br>  可以配置正则表达式模式
`simple_pattern` | - 使用正则表达式模式将匹配的文本作为词项返回 <br>  - 使用 [Lucene 正则表达式](https://lucene.apache.org/core/8_7_0/core/org/apache/lucene/util/automaton/RegExp.html)  <br> - 比 `pattern` 分词器更快，因为它使用的是 `pattern` 分词器正则表达式的一个子集 |  默认返回空数组 <br> 必须配置模式，因为模式默认为空字符串
`simple_pattern_split` | - 使用正则表达式模式在匹配处拆分文本，而不是将匹配项作为词项返回  <br>  - 使用 [Lucene 正则表达式](https://lucene.apache.org/core/8_7_0/core/org/apache/lucene/util/automaton/RegExp.html)  <br> - 比 `pattern` 分词器更快，因为它使用的是 `pattern` 分词器正则表达式的一个子集 | 默认不执行任何操作<br> 必须配置模式
`char_group` | - 按一组可配置的字符进行解析 <br> - 比运行正则表达式的分词器更快 | 默认不执行任何操作<br> 必须配置字符列表
`path_hierarchy` | - 按路径分隔符（默认为 `/`）解析文本，并返回树形层级中每个组成部分的完整路径 | `one/two/three` <br>变为<br> [`one`, `one/two`, `one/two/three`]
