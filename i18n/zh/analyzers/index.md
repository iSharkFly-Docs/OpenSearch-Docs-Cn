---
title: 文本分析
---

# 文本分析

使用全文搜索来搜索文档时，你希望获得所有相关的结果。如果你在查找 "walk"，那么你会对包含该单词任何形式的结果感兴趣，例如 "Walk"、"walked" 或 "walking"。为了支持全文搜索，OpenSearch 使用了文本分析。

文本分析的目标是将源文档中非结构化的自由文本内容拆分为一系列词项，然后将这些词项存储在倒排索引中。之后，当对用户的查询应用类似的文本分析时，得到的词项序列就可以用来匹配相关的源文档。

从技术角度来看，文本分析过程由几个步骤组成，其中一些步骤是可选的：

1. 在将自由文本内容拆分为单个单词之前，在字符层面对文本进行优化可能会有所帮助。这个可选步骤的主要目的是帮助分词器（分析过程中的下一个阶段）生成更好的词元。这可能包括移除标记标签（例如 HTML），或处理特定的字符模式（例如将 &#x1F642; 表情符号替换为文本 `:slightly_smiling_face:`）。

2. 下一步是将自由文本拆分为单个单词，即*词元（Token）*。这一步由*分词器（Tokenizer）* 完成。例如，经过分词后，句子 `Actions speak louder than words` 会被拆分为词元 `Actions`、`speak`、`louder`、`than` 和 `words`。

3. 最后一步是通过应用一系列词元过滤器（Token Filter）来处理各个词元。其目的是将每个词元转换为可预测的形式，并直接存储在索引中，例如将词元转换为小写或进行词干提取（将单词还原为词根）。例如，词元 `Actions` 变为 `action`，`louder` 变为 `loud`，`words` 变为 `word`。

::: info 注意
虽然 ***token***（词元）和 ***term***（词项）这两个术语听起来相似，有时也会互换使用，但了解两者之间的区别会很有帮助。在 Apache Lucene 中，二者各自扮演不同的角色。***token*** 是在文本分析过程中由分词器创建的，在经过词元过滤器链时通常还会经历多次额外的修改。每个词元都关联着一些元数据，这些元数据可以在文本分析过程中进一步使用。***term*** 是直接存储在倒排索引中的数据值，关联的元数据要少得多。在搜索过程中，匹配是在词项级别进行的。
:::

## 分析器

在 OpenSearch 中，涵盖文本分析的抽象称为*分析器（Analyzer）*。每个分析器都包含以下按顺序应用的组件：

1. **字符过滤器（Character Filter）**：首先，字符过滤器以字符流的形式接收原始文本，并在文本中添加、删除或修改字符。例如，字符过滤器可以从字符串中去除 HTML 字符，使文本 `<p><b>Actions</b> speak louder than <em>words</em></p>` 变为 `\nActions speak louder than words\n`。字符过滤器的输出是字符流。

1. **分词器**：接下来，分词器接收经过字符过滤器处理的字符流，并将文本拆分为单独的*词元*（通常是单词）。例如，分词器可以按空白字符拆分文本，使前面的文本变为 [`Actions`, `speak`, `louder`, `than`, `words`]。分词器还会维护关于词元的元数据，例如词元在文本中的起始和结束位置。分词器的输出是词元流。

1. **词元过滤器**：最后，词元过滤器接收来自分词器的词元流，并添加、删除或修改词元。例如，词元过滤器可以将词元转换为小写，使 `Actions` 变为 `action`；可以删除 `than` 这样的停用词；也可以为单词 `speak` 添加 `talk` 这样的同义词。

::: info 注意
一个分析器必须恰好包含一个分词器，并且可以包含零个或多个字符过滤器，以及零个或多个词元过滤器。
:::

还有一种特殊类型的分析器，称为 ***规范化器（Normalizer）***。规范化器与分析器类似，不同之处在于它不包含分词器，并且只能包含特定类型的字符过滤器和词元过滤器。这些过滤器只能执行字符级操作，例如字符替换或模式替换，而不能对整个词元进行操作。这意味着不支持将词元替换为同义词，也不支持词干提取。更多详细信息，请参阅[规范化器](/analyzers/normalizers)。

## 内置分析器

下表列出了 OpenSearch 提供的内置分析器。表格的最后一列是将该分析器应用于字符串 `It’s fun to contribute a brand-new PR or 2 to OpenSearch!` 的结果。

分析器 | 执行的分析 | 分析器输出 
:--- | :--- | :---
**Standard**（默认） | - 在单词边界处将字符串解析为词元 <br> - 移除大部分标点符号 <br> - 将词元转换为小写 | [`it’s`, `fun`, `to`, `contribute`, `a`,`brand`, `new`, `pr`, `or`, `2`, `to`, `opensearch`]
**Simple** | - 在任何非字母字符处将字符串解析为词元 <br> - 移除非字母字符 <br> - 将词元转换为小写  | [`it`, `s`, `fun`, `to`, `contribute`, `a`,`brand`, `new`, `pr`, `or`, `to`, `opensearch`]
**Whitespace** | - 在空白字符处将字符串解析为词元 | [`It’s`, `fun`, `to`, `contribute`, `a`,`brand-new`, `PR`, `or`, `2`, `to`, `OpenSearch!`]
**Stop** | - 在任何非字母字符处将字符串解析为词元 <br> - 移除非字母字符 <br> - 移除停用词 <br> - 将词元转换为小写 | [`s`, `fun`, `contribute`, `brand`, `new`, `pr`, `opensearch`]
**Keyword**（不执行任何操作） | - 原样输出整个字符串 | [`It’s fun to contribute a brand-new PR or 2 to OpenSearch!`]
**Pattern** | - 使用正则表达式将字符串解析为词元 <br> - 支持将字符串转换为小写 <br> - 支持移除停用词 | [`it`, `s`, `fun`, `to`, `contribute`, `a`,`brand`, `new`, `pr`, `or`, `2`, `to`, `opensearch`]
[**Language**](/analyzers/language-analyzers) | 执行针对特定语言（例如 `english`）的分析。 | [`fun`, `contribut`, `brand`, `new`, `pr`, `2`, `opensearch`]
**Fingerprint** | - 在任何非字母字符处解析字符串 <br> - 通过将字符转换为 ASCII 来规范化字符 <br> - 将词元转换为小写 <br> - 对词元进行排序、去重，并连接成单个词元 <br> - 支持移除停用词 | [`2 a brand contribute fun it's new opensearch or pr to`] <br> 注意，撇号被转换成了对应的 ASCII 字符。

## 自定义分析器

如有需要，你可以组合分词器、词元过滤器和字符过滤器来创建自定义分析器。

## 索引时和查询时的文本分析

OpenSearch 在你索引文档以及发送搜索请求时，都会对 text 字段执行文本分析。根据文本分析发生的时间，所用的分析器分为以下两类：

- *索引分析器* 在索引时执行分析：当你索引一个 [text](/field-types/supported-field-types/text) 字段时，OpenSearch 会在索引之前对其进行分析。有关指定索引分析器的方式的更多信息，请参阅[索引分析器](/analyzers/index-analyzers)。

- *搜索分析器* 在查询时执行分析：当你对 text 字段运行全文查询（Full-text Query）时，OpenSearch 会分析查询字符串。有关指定搜索分析器的方式的更多信息，请参阅[搜索分析器](/analyzers/search-analyzers)。

::: tip 提示
在大多数情况下，你应该在索引和搜索时使用相同的分析器，因为这样 text 字段和查询字符串会以相同的方式进行分析，生成的词元也会如预期那样匹配。
:::

### 示例

当你索引一个文档，其 text 字段包含文本 `Actions speak louder than words` 时，OpenSearch 会分析该文本并生成以下词元列表： 

Text 字段词元 = [`action`, `speak`, `loud`, `than`, `word`]

当你搜索与查询 `speaking loudly` 匹配的文档时，OpenSearch 会分析查询字符串并生成以下词元列表：

查询字符串词元 = [`speak`, `loud`]

然后，OpenSearch 将查询字符串中的每个词元与 text 字段的词元列表进行比较，发现两个列表都包含词元 `speak` 和 `loud`，因此 OpenSearch 会将该文档作为匹配查询的搜索结果之一返回。

## 测试分析器

要测试内置分析器，并查看文档被索引时它生成的词元列表，可以使用 [Analyze API](/api-reference/analyze-apis#apply-a-built-in-analyzer)。

在请求中指定分析器和要分析的文本：

```json
GET /_analyze
{
  "analyzer" : "standard",
  "text" : "Let’s contribute to OpenSearch!"
}
```

下图显示了该查询字符串。

![带索引位置的查询字符串](/images/string-indices.png)

响应中包含每个词元及其起始和结束偏移量，分别对应原始字符串中的起始索引位置（包含）和结束索引位置（不包含）：

```json
{
  "tokens": [
    {
      "token": "let’s",
      "start_offset": 0,
      "end_offset": 5,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "contribute",
      "start_offset": 6,
      "end_offset": 16,
      "type": "<ALPHANUM>",
      "position": 1
    },
    {
      "token": "to",
      "start_offset": 17,
      "end_offset": 19,
      "type": "<ALPHANUM>",
      "position": 2
    },
    {
      "token": "opensearch",
      "start_offset": 20,
      "end_offset": 30,
      "type": "<ALPHANUM>",
      "position": 3
    }
  ]
}
```

## 验证分析器设置

要验证哪个分析器与哪个字段关联，可以使用获取映射（get mapping）API 操作：

```json
GET /testindex/_mapping
```

响应提供了每个字段的分析器信息：

```json
{
  "testindex": {
    "mappings": {
      "properties": {
        "text_entry": {
          "type": "text",
          "analyzer": "simple",
          "search_analyzer": "whitespace"
        }
      }
    }
  }
}
```

## 后续步骤

- 详细了解如何指定[索引分析器](/analyzers/index-analyzers)和[搜索分析器](/analyzers/search-analyzers)。
