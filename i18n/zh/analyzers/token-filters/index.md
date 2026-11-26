---
title: 词元过滤器
---

# 词元过滤器

词元过滤器（Token Filter）接收来自分词器（Tokenizer）的词元（Token）流，并添加、删除或修改词元。例如，词元过滤器可以将词元转换为小写，使 `Actions` 变为 `action`；可以删除 `than` 这样的停用词；也可以为单词 `speak` 添加 `talk` 这样的同义词。

下表列出了 OpenSearch 支持的所有词元过滤器。

词元过滤器 | 底层 Lucene 词元过滤器|  描述
`apostrophe` | [ApostropheFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/tr/ApostropheFilter.html) | 对于每个包含撇号的词元，`apostrophe` 词元过滤器会删除撇号本身及其后的所有字符。
`asciifolding` | [ASCIIFoldingFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/ASCIIFoldingFilter.html) | 转换字母、数字和符号字符。
`cjk_bigram` | [CJKBigramFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/cjk/CJKBigramFilter.html) | 将中文、日文和韩文（CJK）词元组成二元组（bigram）。 
`cjk_width` | [CJKWidthFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/cjk/CJKWidthFilter.html) | 按以下规则规范化中文、日文和韩文（CJK）词元： <br> - 将全角 ASCII 字符变体折叠为等效的基本拉丁字符。 <br> - 将半角片假名字符变体折叠为等效的假名字符。
`classic` | [ClassicFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/standard/ClassicFilter.html) | 对 classic 分词器生成的词元执行可选的后处理。删除所有格（`'s`），并删除首字母缩写词中的 `.`。
`common_grams` | [CommonGramsFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/commongrams/CommonGramsFilter.html) | 为一组高频出现的词项生成二元组。输出同时包含单个词项和二元组。
`conditional` | [ConditionalTokenFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/ConditionalTokenFilter.html) | 对符合脚本中所提供条件的词元，应用一个有序的词元过滤器列表。
`decimal_digit` | [DecimalDigitFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/core/DecimalDigitFilter.html) | 将 Unicode 十进制数字通用类别中的所有数字转换为基本拉丁数字（0--9）。 
`delimited_payload` | [DelimitedPayloadTokenFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/payloads/DelimitedPayloadTokenFilter.html) | 根据提供的分隔符，将词元流拆分为词元及其对应的载荷（payload）。分隔符之前的所有字符构成词元，分隔符之后的所有字符构成载荷。例如，如果分隔符为 `|`，那么对于字符串 `foo|bar`，`foo` 是词元，`bar` 是载荷。 
[`delimited_term_freq`](/analyzers/token-filters/delimited-term-frequency) | [DelimitedTermFrequencyTokenFilter](https://lucene.apache.org/core/9_7_0/analysis/common/org/apache/lucene/analysis/miscellaneous/DelimitedTermFrequencyTokenFilter.html) | 根据提供的分隔符，将词元流拆分为词元及其对应的词频。分隔符之前的所有字符构成词元，分隔符之后的整数为词频。例如，如果分隔符为 `|`，那么对于字符串 `foo|5`，`foo` 是词元，`5` 是词频。
`dictionary_decompounder` | [DictionaryCompoundWordTokenFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/compound/DictionaryCompoundWordTokenFilter.html) | 分解许多日耳曼语系语言中的复合词。
`edge_ngram` | [EdgeNGramTokenFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/ngram/EdgeNGramTokenFilter.html) | 将给定词元切分为长度介于 `min_gram` 和 `max_gram` 之间的 edge n-gram（从词元开头开始的 n-gram）。可以选择保留原始词元。
`elision` | [ElisionFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/util/ElisionFilter.html) | 从词元开头删除指定的[省略形式](https://en.wikipedia.org/wiki/Elision)。例如，将 `l'avion`（这架飞机）变为 `avion`（飞机）。
`fingerprint` | [FingerprintFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/FingerprintFilter.html) | 对词元列表进行排序和去重，并将词元连接成单个词元。
`flatten_graph` | [FlattenGraphFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/core/FlattenGraphFilter.html) | 将由图词元过滤器（例如 `synonym_graph` 或 `word_delimiter_graph`）生成的词元图展平，使其适合用于索引。
`hunspell` | [HunspellStemFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/hunspell/HunspellStemFilter.html) | 使用 [Hunspell](https://en.wikipedia.org/wiki/Hunspell) 规则对词元进行词干提取。由于 Hunspell 支持一个单词有多个词干，此过滤器对每个输入词元可能输出多个词元。需要配置一个或多个特定语言的 Hunspell 词典。
`hyphenation_decompounder` | [HyphenationCompoundWordTokenFilter](https://lucene.apache.org/core/9_8_0/analysis/common/org/apache/lucene/analysis/compound/HyphenationCompoundWordTokenFilter.html) | 使用基于 XML 的连字符模式在复合词中查找可能的子词，并根据指定的单词列表检查这些子词。输出的词元只包含在单词列表中找到的子词。
`keep_types` | [TypeTokenFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/core/TypeTokenFilter.html) | 保留或删除特定类型的词元。
`keep_word` | [KeepWordFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/KeepWordFilter.html) | 根据指定的单词列表检查词元，只保留列表中的词元。
`keyword_marker` | [KeywordMarkerFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/KeywordMarkerFilter.html) | 将指定的词元标记为关键字，防止对其进行词干提取。
`keyword_repeat` | [KeywordRepeatFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/KeywordRepeatFilter.html) | 将每个输入词元输出两次：一次作为关键字，一次作为非关键字。
`kstem` | [KStemFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/en/KStemFilter.html) | 为英语提供基于 kstem 的词干提取。将算法词干提取与内置词典相结合。
`length` | [LengthFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/LengthFilter.html) | 删除长度短于或长于 `min` 和 `max` 所指定长度范围的词元。 
`limit` | [LimitTokenCountFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/LimitTokenCountFilter.html) | 限制输出词元的数量。常见用例是根据词元数量限制文档字段值的大小。
`lowercase` | [LowerCaseFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/core/LowerCaseFilter.html) | 将词元转换为小写。默认的 [LowerCaseFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/core/LowerCaseFilter.html) 适用于英语。你可以将 `language` 参数设置为 `greek`（使用 [GreekLowerCaseFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/el/GreekLowerCaseFilter.html)）、`irish`（使用 [IrishLowerCaseFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/ga/IrishLowerCaseFilter.html)）或 `turkish`（使用 [TurkishLowerCaseFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/tr/TurkishLowerCaseFilter.html)）。
`min_hash` | [MinHashFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/minhash/MinHashFilter.html) | 使用 [MinHash 技术](https://en.wikipedia.org/wiki/MinHash)估算文档相似度。按顺序对词元流执行以下操作： <br> 1. 对流中的每个词元计算哈希值。 <br> 2. 将哈希值分配到桶（Bucket）中，每个桶只保留最小的哈希值。 <br> 3. 将每个桶中最小的哈希值作为词元流输出。
`multiplexer` | N/A | 在同一位置输出多个词元。让每个词元分别经过每个指定的过滤器列表，并将结果作为单独的词元输出。
`ngram` | [NGramTokenFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/ngram/NGramTokenFilter.html) | 将给定词元切分为长度介于 `min_gram` 和 `max_gram` 之间的 n-gram。
规范化 | `arabic_normalization`: [ArabicNormalizer](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/ar/ArabicNormalizer.html) <br> `german_normalization`: [GermanNormalizationFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/de/GermanNormalizationFilter.html) <br> `hindi_normalization`: [HindiNormalizer](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/hi/HindiNormalizer.html) <br> `indic_normalization`: [IndicNormalizer](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/in/IndicNormalizer.html) <br> `sorani_normalization`: [SoraniNormalizer](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/ckb/SoraniNormalizer.html) <br> `persian_normalization`: [PersianNormalizer](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/fa/PersianNormalizer.html) <br> `scandinavian_normalization` : [ScandinavianNormalizationFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/ScandinavianNormalizationFilter.html) <br> `scandinavian_folding`: [ScandinavianFoldingFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/ScandinavianFoldingFilter.html) <br> `serbian_normalization`: [SerbianNormalizationFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/sr/SerbianNormalizationFilter.html) | 规范化所列语言之一的字符。
`pattern_capture` | N/A | 为所提供正则表达式中的每个捕获组生成一个词元。使用 [Java 正则表达式语法](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html)。
`pattern_replace` | N/A | 匹配所提供正则表达式中的模式，并替换匹配的子字符串。使用 [Java 正则表达式语法](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html)。
`phonetic` | N/A | 使用语音编码器为词元流中的每个词元输出一个 metaphone 词元。需要安装 `analysis-phonetic` 插件。
`porter_stem` | [PorterStemFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/en/PorterStemFilter.html) | 使用 [Porter 词干提取算法](https://tartarus.org/martin/PorterStemmer/)对英语执行算法词干提取。
`predicate_token_filter` | N/A | 删除与指定谓词脚本不匹配的词元。仅支持内联 Painless 脚本。
`remove_duplicates` | [RemoveDuplicatesTokenFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/RemoveDuplicatesTokenFilter.html) | 删除位于同一位置的重复词元。
`reverse` | [ReverseStringFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/reverse/ReverseStringFilter.html) | 反转词元流中每个词元对应的字符串。例如，词元 `dog` 变为 `god`。
`shingle` | [ShingleFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/shingle/ShingleFilter.html) | 为词元流中的词元生成长度介于 `min_shingle_size` 和 `max_shingle_size` 之间的 shingle。shingle 与 n-gram 类似，但作用于单词而不是字母。例如，为一元组列表 [`contribute`, `to`, `opensearch`] 添加的双词 shingle 为 [`contribute to`, `to opensearch`]。
`snowball` | N/A | 使用 [Snowball 生成的词干提取器](https://snowballstem.org/)对单词进行词干提取。你可以在 `language` 字段中为 `snowball` 词元过滤器使用以下语言：`Arabic`、`Armenian`、`Basque`、`Catalan`、`Danish`、`Dutch`、`English`、`Estonian`、`Finnish`、`French`、`German`、`German2`、`Hungarian`、`Irish`、`Italian`、`Kp`、`Lithuanian`、`Lovins`、`Norwegian`、`Porter`、`Portuguese`、`Romanian`、`Russian`、`Spanish`、`Swedish`、`Turkish`。
`stemmer` | N/A | 为 `language` 字段中的以下语言提供算法词干提取：`arabic`、`armenian`、`basque`、`bengali`、`brazilian`、`bulgarian`、`catalan`、`czech`、`danish`、`dutch`、`dutch_kp`、`english`、`light_english`、`lovins`、`minimal_english`、`porter2`、`possessive_english`、`estonian`、`finnish`、`light_finnish`、`french`、`light_french`、`minimal_french`、`galician`、`minimal_galician`、`german`、`german2`、`light_german`、`minimal_german`、`greek`、`hindi`、`hungarian`、`light_hungarian`、`indonesian`、`irish`、`italian`、`light_italian`、`latvian`、`Lithuanian`、`norwegian`、`light_norwegian`、`minimal_norwegian`、`light_nynorsk`、`minimal_nynorsk`、`portuguese`、`light_portuguese`、`minimal_portuguese`、`portuguese_rslp`、`romanian`、`russian`、`light_russian`、`sorani`、`spanish`、`light_spanish`、`swedish`、`light_swedish`、`turkish`。
`stemmer_override` | N/A | 通过应用自定义映射来覆盖词干提取算法，使指定的词项不被提取词干。
`stop` | [StopFilter](https://lucene.apache.org/core/8_7_0/core/org/apache/lucene/analysis/StopFilter.html) | 从词元流中删除停用词。
`synonym` | N/A | 为分析过程提供同义词列表。同义词列表通过配置文件提供。
`synonym_graph` | N/A | 为分析过程提供同义词列表，包括多词同义词。
`trim` | [TrimFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/TrimFilter.html) | 去除流中每个词元开头和结尾的空白字符。 
`truncate` | [TruncateTokenFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/TruncateTokenFilter.html) | 截断长度超过指定字符数限制的词元。 
`unique` | N/A | 通过从流中删除重复词元，确保每个词元都是唯一的。 
`uppercase` | [UpperCaseFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/core/LowerCaseFilter.html) | 将词元转换为大写。 
`word_delimiter` | [WordDelimiterFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/WordDelimiterFilter.html) | 在非字母数字字符处拆分词元，并根据指定的规则执行规范化。 
`word_delimiter_graph` | [WordDelimiterGraphFilter](https://lucene.apache.org/core/8_7_0/analyzers-common/org/apache/lucene/analysis/miscellaneous/WordDelimiterGraphFilter.html) | 在非字母数字字符处拆分词元，并根据指定的规则执行规范化。为跨多个位置的词元分配 `positionLength` 属性。
