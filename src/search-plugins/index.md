---
title: Search
---

# Search

OpenSearch provides many features for customizing your search use cases and improving search relevance. 

## Search methods

OpenSearch supports the following search methods:

- **Traditional lexical search**

    - [Keyword (BM25) search](/search-plugins/keyword-search): Searches the document corpus for words that appear in the query.

- **Machine learning (ML)-powered search**

    - **Vector search**

        - [k-NN search](/search-plugins/knn/): Searches for k-nearest neighbors to a search term across an index of vectors.

    - **Neural search**: [Neural search](/search-plugins/neural-search) facilitates generating vector embeddings at ingestion time and searching them at search time. Neural search lets you integrate ML models into your search and serves as a framework for implementing other search methods. The following search methods are built on top of neural search:

        - [Semantic search](/search-plugins/semantic-search): Considers the meaning of the words in the search context. Uses dense retrieval based on text embedding models to search text data. 

        - [Multimodal search](/search-plugins/multimodal-search): Uses multimodal embedding models to search text and image data. 

        - [Neural sparse search](/search-plugins/neural-sparse-search): Uses sparse retrieval based on sparse embedding models to search text data.

        - [Hybrid search](/search-plugins/hybrid-search): Combines traditional search and vector search to improve search relevance.

        - [Conversational search](/search-plugins/conversational-search): Implements a retrieval-augmented generative search. 

## Query languages

In OpenSearch, you can use the following query languages to search your data:

- [Query domain-specific language (DSL)](/query-dsl/): The primary OpenSearch query language that supports creating complex, fully customizable queries.

- [Query string query language](/query-dsl/full-text/query-string): A scaled-down query language that you can use in a query parameter of a search request or in OpenSearch Dashboards.

- [SQL](/search-plugins/sql/sql/): A traditional query language that bridges the gap between traditional relational database concepts and the flexibility of OpenSearch’s document-oriented data storage.

- [Piped Processing Language (PPL)](/search-plugins/sql/ppl/): The primary language used with observability in OpenSearch. PPL uses a pipe syntax that chains commands into a query.

- [Dashboards Query Language (DQL)](/dashboards/dql): A simple text-based query language for filtering data in OpenSearch Dashboards. 

## Search performance

OpenSearch offers several ways to improve search performance:

- [Asynchronous search](/search-plugins/async/): Runs resource-intensive queries asynchronously.

- [Concurrent segment search](/search-plugins/concurrent-segment-search): Searches segments concurrently.

## Search relevance

OpenSearch provides the following search relevance features:

- [Compare Search Results](/search-plugins/search-relevance/compare-search-results): A search comparison tool in OpenSearch Dashboards that you can use to compare results from two queries side by side. 

- [Querqy](/search-plugins/querqy/): Offers query rewriting capability.

## Search results

OpenSearch supports the following commonly used operations on search results:

- [Paginate](/search-plugins/searching-data/paginate)
- [Paginate with Point in Time](/search-plugins/searching-data/point-in-time)
- [Sort](/search-plugins/searching-data/sort)
- [Highlight search terms](/search-plugins/searching-data/highlight) 
- [Autocomplete](/search-plugins/searching-data/autocomplete)
- [Did-you-mean](/search-plugins/searching-data/did-you-mean) 

## Search pipelines

You can process search queries and search results with [search pipelines](/search-plugins/search-pipelines/).
