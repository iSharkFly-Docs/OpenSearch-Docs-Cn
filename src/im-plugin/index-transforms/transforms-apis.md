---
title: Transforms APIs
---

# Transforms APIs

Aside from using OpenSearch Dashboards, you can also use the REST API to create, start, stop, and complete other operations relative to transform jobs.

#### Table of contents
- TOC

## Create a transform job
<Badge type="tip" text="Introduced 1.0" />

Creates a transform job. 

### Request format

```json
PUT _plugins/_transform/<transform_id>
```

### Path parameters

Parameter | Data Type | Description
:--- | :--- | :---
transform_id | String | Transform ID |

### Request body fields

You can specify the following options in the HTTP request body:

Option | Data Type | Description | Required
:--- | :--- | :--- | :---
enabled | Boolean | If true, the transform job is enabled at creation. | No
continuous | Boolean | Specifies whether the transform job should be continuous. Continuous jobs execute every time they are scheduled according to the `schedule` field and run based off of newly transformed buckets as well as any new data added to source indexes. Non-continuous jobs execute only once. Default is false. | No
schedule | Object | The schedule for the transform job. | Yes
start_time | Integer | The Unix epoch time of the transform job's start time. | Yes
description | String | Describes the transform job. | No
metadata_id | String | Any metadata to be associated with the transform job. | No
source_index | String | The source index containing the data to be transformed. | Yes
target_index | String | The target index the newly transformed data is added to. You can create a new index or update an existing one. | Yes
data_selection_query | Object | The query DSL to use to filter a subset of the source index for the transform job. See [query domain-specific language(DSL)](/query-dsl/) for more information. | Yes
page_size | Integer | The number of buckets IM processes and indexes concurrently. A higher number results in better performance, but it requires more memory. If your machine runs out of memory, Index Management (IM) automatically adjusts this field and retries until the operation succeeds. | Yes
groups | Array | Specifies the grouping(s) to use in the transform job. Supported groups are `terms`, `histogram`, and `date_histogram`. For more information, see [Bucket Aggregations](/aggregations/bucket/). | Yes if not using aggregations.
source_field | String | The field(s) to transform. | Yes
aggregations | Object | The aggregations to use in the transform job. Supported aggregations are `sum`, `max`, `min`, `value_count`, `avg`, `scripted_metric`, and `percentiles`. For more information, see [Metric Aggregations](/aggregations/metric/). | Yes if not using groups.

#### Sample Request

The following request creates a transform job with the id `sample`:

```json
PUT _plugins/_transform/sample
{
  "transform": {
    "enabled": true,
    "continuous": true,
    "schedule": {
      "interval": {
        "period": 1,
        "unit": "Minutes",
        "start_time": 1602100553
      }
    },
    "description": "Sample transform job",
    "source_index": "sample_index",
    "target_index": "sample_target",
    "data_selection_query": {
      "match_all": {}
    },
    "page_size": 1,
    "groups": [
      {
        "terms": {
          "source_field": "customer_gender",
          "target_field": "gender"
        }
      },
      {
        "terms": {
          "source_field": "day_of_week",
          "target_field": "day"
        }
      }
    ],
    "aggregations": {
      "quantity": {
        "sum": {
          "field": "total_quantity"
        }
      }
    }
  }
}
```

#### Sample Response

```json
{
  "_id": "sample",
  "_version": 7,
  "_seq_no": 13,
  "_primary_term": 1,
  "transform": {
    "transform_id": "sample",
    "schema_version": 7,
    "continuous": true,
    "schedule": {
      "interval": {
        "start_time": 1621467964243,
        "period": 1,
        "unit": "Minutes"
      }
    },
    "metadata_id": null,
    "updated_at": 1621467964243,
    "enabled": true,
    "enabled_at": 1621467964243,
    "description": "Sample transform job",
    "source_index": "sample_index",
    "data_selection_query": {
      "match_all": {
        "boost": 1.0
      }
    },
    "target_index": "sample_target",
    "roles": [],
    "page_size": 1,
    "groups": [
      {
        "terms": {
          "source_field": "customer_gender",
          "target_field": "gender"
        }
      },
      {
        "terms": {
          "source_field": "day_of_week",
          "target_field": "day"
        }
      }
    ],
    "aggregations": {
      "quantity": {
        "sum": {
          "field": "total_quantity"
        }
      }
    }
  }
}
```

## Update a transform job
<Badge type="tip" text="Introduced 1.0" />

Updates the transform job if `transform_id` already exists. For this request you must specify the sequence number and primary term of the transform to be updated. To get these, use the [Get a transform job's details](#get-a-transform-jobs-details) API call. 

### Request format {#request-format-1}

```json
PUT _plugins/_transform/<transform_id>?if_seq_no=<seq_no>&if_primary_term=<primary_term>
```

### Query parameters

The update operation supports the following query parameters:

Parameter | Description | Required
:---| :--- | :---
`seq_no` | Only perform the transform operation if the last operation that changed the transform job has the specified sequence number. | Yes
`primary_term` | Only perform the transform operation if the last operation that changed the transform job has the specified sequence term. | Yes

### Request body fields {#request-body-fields-1}

You can update the following fields.

Option | Data Type | Description
:--- | :--- | :---
schedule | Object | The schedule for the transform job. Contains the fields `interval.start_time`, `interval.period`, and `interval.unit`.
start_time | Integer | The Unix epoch start time of the transform job.
period | Integer | How often to execute the transform job.
unit | String | The unit of time associated with the execution period. Available options are `Minutes`, `Hours`, and `Days`.
description | Integer | Describes the transform job.
page_size | Integer | The number of buckets IM processes and indexes concurrently. A higher number results in better performance, but it requires more memory. If your machine runs out of memory, IM automatically adjusts this field and retries until the operation succeeds.

#### Sample Request {#sample-request-1}

The following request updates a transform job with the id `sample`, sequence number `13`, and primary term `1`:

```json
PUT _plugins/_transform/sample?if_seq_no=13&if_primary_term=1
{
  "transform": {
  "enabled": true,
  "schedule": {
    "interval": {
    "period": 1,
    "unit": "Minutes",
    "start_time": 1602100553
    }
  },
  "description": "Sample transform job",
  "source_index": "sample_index",
  "target_index": "sample_target",
  "data_selection_query": {
    "match_all": {}
  },
  "page_size": 1,
  "groups": [
    {
    "terms": {
      "source_field": "customer_gender",
      "target_field": "gender"
    }
    },
    {
    "terms": {
      "source_field": "day_of_week",
      "target_field": "day"
    }
    }
  ],
  "aggregations": {
    "quantity": {
    "sum": {
      "field": "total_quantity"
    }
    }
  }
  }
}
```

#### Sample Response {#sample-response-1}

```json
PUT _plugins/_transform/sample?if_seq_no=13&if_primary_term=1
{
  "transform": {
    "enabled": true,
    "schedule": {
      "interval": {
        "period": 1,
        "unit": "Minutes",
        "start_time": 1602100553
      }
    },
    "description": "Sample transform job",
    "source_index": "sample_index",
    "target_index": "sample_target",
    "data_selection_query": {
      "match_all": {}
    },
    "page_size": 1,
    "groups": [
      {
        "terms": {
          "source_field": "customer_gender",
          "target_field": "gender"
        }
      },
      {
        "terms": {
          "source_field": "day_of_week",
          "target_field": "day"
        }
      }
    ],
    "aggregations": {
      "quantity": {
        "sum": {
          "field": "total_quantity"
        }
      }
    }
  }
}
```

## Get a transform job's details {#get-a-transform-jobs-details}
<Badge type="tip" text="Introduced 1.0" />

Returns a transform job's details. 

### Request format {#request-format-2}

```json
GET _plugins/_transform/<transform_id>
```

#### Sample Request {#sample-request-2}

The following request returns the details of the transform job with the id `sample`:

```json
GET _plugins/_transform/sample
```

#### Sample Response {#sample-response-2}

```json
{
  "_id": "sample",
  "_version": 7,
  "_seq_no": 13,
  "_primary_term": 1,
  "transform": {
    "transform_id": "sample",
    "schema_version": 7,
    "continuous": true,
    "schedule": {
      "interval": {
        "start_time": 1621467964243,
        "period": 1,
        "unit": "Minutes"
      }
    },
    "metadata_id": null,
    "updated_at": 1621467964243,
    "enabled": true,
    "enabled_at": 1621467964243,
    "description": "Sample transform job",
    "source_index": "sample_index",
    "data_selection_query": {
      "match_all": {
        "boost": 1.0
      }
    },
    "target_index": "sample_target",
    "roles": [],
    "page_size": 1,
    "groups": [
      {
        "terms": {
          "source_field": "customer_gender",
          "target_field": "gender"
        }
      },
      {
        "terms": {
          "source_field": "day_of_week",
          "target_field": "day"
        }
      }
    ],
    "aggregations": {
      "quantity": {
        "sum": {
          "field": "total_quantity"
        }
      }
    }
  }
}
```

You can also get details of all transform jobs by omitting `transform_id`.

#### Sample Request {#sample-request-3}

The following request returns the details of all transform jobs:

```json
GET _plugins/_transform/
```

#### Sample Response {#sample-response-3}

```json
{
  "total_transforms": 1,
  "transforms": [
    {
      "_id": "sample",
      "_seq_no": 13,
      "_primary_term": 1,
      "transform": {
        "transform_id": "sample",
        "schema_version": 7,
        "continuous": true,
        "schedule": {
          "interval": {
            "start_time": 1621467964243,
            "period": 1,
            "unit": "Minutes"
          }
        },
        "metadata_id": null,
        "updated_at": 1621467964243,
        "enabled": true,
        "enabled_at": 1621467964243,
        "description": "Sample transform job",
        "source_index": "sample_index",
        "data_selection_query": {
          "match_all": {
            "boost": 1.0
          }
        },
        "target_index": "sample_target",
        "roles": [],
        "page_size": 1,
        "groups": [
          {
            "terms": {
              "source_field": "customer_gender",
              "target_field": "gender"
            }
          },
          {
            "terms": {
              "source_field": "day_of_week",
              "target_field": "day"
            }
          }
        ],
        "aggregations": {
          "quantity": {
            "sum": {
              "field": "total_quantity"
            }
          }
        }
      }
    }
  ]
}
```

### Query parameters {#query-parameters-1}

You can specify the following GET API operation’s query parameters to filter the results.

Parameter | Description | Required
:--- | :--- | :---
from | The starting transform to return. Default is 0. | No
size | Specifies the number of transforms to return. Default is 10. | No
search |The search term to use to filter results. | No
sortField | The field to sort results with. | No
sortDirection | Specifies the direction to sort results in. Can be `ASC` or `DESC`. Default is ASC. | No

#### Sample Request {#sample-request-4}

The following request returns two results starting from transform `8`:

```json
GET _plugins/_transform?size=2&from=8
```

#### Sample Response {#sample-response-4}

```json
{
  "total_transforms": 18,
  "transforms": [
    {
      "_id": "sample8",
      "_seq_no": 93,
      "_primary_term": 1,
      "transform": {
        "transform_id": "sample8",
        "schema_version": 7,
        "schedule": {
          "interval": {
            "start_time": 1622063596812,
            "period": 1,
            "unit": "Minutes"
          }
        },
        "metadata_id": "y4hFAB2ZURQ2dzY7BAMxWA",
        "updated_at": 1622063657233,
        "enabled": false,
        "enabled_at": null,
        "description": "Sample transform job",
        "source_index": "sample_index3",
        "data_selection_query": {
          "match_all": {
            "boost": 1.0
          }
        },
        "target_index": "sample_target3",
        "roles": [],
        "page_size": 1,
        "groups": [
          {
            "terms": {
              "source_field": "customer_gender",
              "target_field": "gender"
            }
          },
          {
            "terms": {
              "source_field": "day_of_week",
              "target_field": "day"
            }
          }
        ],
        "aggregations": {
          "quantity": {
            "sum": {
              "field": "total_quantity"
            }
          }
        }
      }
    },
    {
      "_id": "sample9",
      "_seq_no": 98,
      "_primary_term": 1,
      "transform": {
        "transform_id": "sample9",
        "schema_version": 7,
        "schedule": {
          "interval": {
            "start_time": 1622063598065,
            "period": 1,
            "unit": "Minutes"
          }
        },
        "metadata_id": "x8tCIiYMTE3veSbIJkit5A",
        "updated_at": 1622063658388,
        "enabled": false,
        "enabled_at": null,
        "description": "Sample transform job",
        "source_index": "sample_index4",
        "data_selection_query": {
          "match_all": {
            "boost": 1.0
          }
        },
        "target_index": "sample_target4",
        "roles": [],
        "page_size": 1,
        "groups": [
          {
            "terms": {
              "source_field": "customer_gender",
              "target_field": "gender"
            }
          },
          {
            "terms": {
              "source_field": "day_of_week",
              "target_field": "day"
            }
          }
        ],
        "aggregations": {
          "quantity": {
            "sum": {
              "field": "total_quantity"
            }
          }
        }
      }
    }
  ]
}
```

## Start a transform job
<Badge type="tip" text="Introduced 1.0" />

Transform jobs created using the API are automatically enabled, but if you ever need to enable a job, you can use the start API operation. 

### Request format {#request-format-3}

```
POST _plugins/_transform/<transform_id>/_start
```

#### Sample Request {#sample-request-5}

The following request starts the transform job with the ID `sample`:

```json
POST _plugins/_transform/sample/_start
```

#### Sample Response {#sample-response-5}

```json
{
  "acknowledged": true
}
```

## Stop a transform job
<Badge type="tip" text="Introduced 1.0" />

Stops a transform job. 

### Request format {#request-format-4}

```
POST _plugins/_transform/<transform_id>/_stop
```

#### Sample Request {#sample-request-6}

The following request stops the transform job with the ID `sample`:

```json
POST _plugins/_transform/sample/_stop
```

#### Sample Response {#sample-response-6}

```json
{
  "acknowledged": true
}
```

## Get the status of a transform job
<Badge type="tip" text="Introduced 1.0" />

Returns the status and metadata of a transform job. 

### Request format {#request-format-5}

```
GET _plugins/_transform/<transform_id>/_explain
```

#### Sample Request {#sample-request-7}

The following request returns the details of the transform job with the ID `sample`:

```json
GET _plugins/_transform/sample/_explain
```

#### Sample Response {#sample-response-7}

```json
{
  "sample": {
    "metadata_id": "PzmjweME5xbgkenl9UpsYw",
    "transform_metadata": {
      "continuous_stats": {
        "last_timestamp": 1621883525672,
        "documents_behind": {
          "sample_index": 72
          }
      },
      "transform_id": "sample",
      "last_updated_at": 1621883525873,
      "status": "finished",
      "failure_reason": "null",
      "stats": {
        "pages_processed": 0,
        "documents_processed": 0,
        "documents_indexed": 0,
        "index_time_in_millis": 0,
        "search_time_in_millis": 0
      }
    }
  }
}
```

## Preview a transform job's results {#preview-a-transform-jobs-results}
<Badge type="tip" text="Introduced 1.0" />

Returns a preview of what a transformed index would look like.

#### Sample Request {#sample-request-8}

```json
POST _plugins/_transform/_preview

{
  "transform": {
  "enabled": false,
  "schedule": {
    "interval": {
    "period": 1,
    "unit": "Minutes",
    "start_time": 1602100553
    }
  },
  "description": "test transform",
  "source_index": "sample_index",
  "target_index": "sample_target",
  "data_selection_query": {
    "match_all": {}
  },
  "page_size": 10,
  "groups": [
    {
    "terms": {
      "source_field": "customer_gender",
      "target_field": "gender"
    }
    },
    {
    "terms": {
      "source_field": "day_of_week",
      "target_field": "day"
    }
    }
  ],
  "aggregations": {
    "quantity": {
    "sum": {
      "field": "total_quantity"
    }
    }
  }
  }
}
```

#### Sample Response {#sample-response-8}

```json
{
  "documents" : [
  {
    "quantity" : 862.0,
    "gender" : "FEMALE",
    "day" : "Friday"
  },
  {
    "quantity" : 682.0,
    "gender" : "FEMALE",
    "day" : "Monday"
  },
  {
    "quantity" : 772.0,
    "gender" : "FEMALE",
    "day" : "Saturday"
  },
  {
    "quantity" : 669.0,
    "gender" : "FEMALE",
    "day" : "Sunday"
  },
  {
    "quantity" : 887.0,
    "gender" : "FEMALE",
    "day" : "Thursday"
  }
  ]
}
```

## Delete a transform job
<Badge type="tip" text="Introduced 1.0" />

Deletes a transform job. This operation does not delete the source or target indexes. 

### Request format {#request-format-6}

```
DELETE _plugins/_transform/<transform_id>
```

#### Sample Request {#sample-request-9}

The following request deletes the transform job with the ID `sample`:

```json
DELETE _plugins/_transform/sample
```

#### Sample Response {#sample-response-9}

```json
{
  "took": 205,
  "errors": false,
  "items": [
    {
      "delete": {
        "_index": ".opensearch-ism-config",
        "_id": "sample",
        "_version": 4,
        "result": "deleted",
        "forced_refresh": true,
        "_shards": {
          "total": 2,
          "successful": 1,
          "failed": 0
        },
        "_seq_no": 6,
        "_primary_term": 1,
        "status": 200
      }
    }
  ]
}
```
