---
title: Mappings APIs
---

# Mappings APIs

The following APIs can be used for a number of tasks related to mappings, from creating to getting and updating mappings.

---
## Get Mappings View

This API returns a view of the fields contained in an index used as a log source.

### Request fields

The following fields are used to get field mappings.

Field | Type | Description
:--- | :--- |:--- 
`index_name` | String | The name of the index used for log ingestion. 
`rule_topic` | String | The log type of the index. 

#### Example request

```json
GET /_plugins/_security_analytics/mappings/view

{
   "index_name": "windows",
   "rule_topic": "windows"
}
```

#### Example response

```json
{
    "properties": {
        "windows-event_data-CommandLine": {
            "path": "CommandLine",
            "type": "alias"
        },
        "event_uid": {
            "path": "EventID",
            "type": "alias"
        }
    },
    "unmapped_index_fields": [
        "windows-event_data-CommandLine",
        "unmapped_HiveName",
        "src_ip",
        "sha1",
        "processPath",
        "CallerProcessName",
        "CallTrace",
        "AuthenticationPackageName",
        "AuditSourceName",
        "AuditPolicyChanges",
        "AttributeValue",
        "AttributeLDAPDisplayName",
        "ApplicationPath",
        "Application",
        "AllowedToDelegateTo",
        "Address",
        "Action",
        "AccountType",
        "AccountName",
        "Accesses",
        "AccessMask",
        "AccessList"
    ]
}
```

---
## Create Mappings

#### Example request {#example-request-1}

```json
POST /_plugins/_security_analytics/mappings

{
   "index_name": "windows",
   "rule_topic": "windows",
   "partial": true,
   "alias_mappings": {
        "properties": {
            "event_uid": {
            "type": "alias",
            "path": "EventID"
          }
       }
   }
}
```

#### Example response {#example-response-1}

```json
{
    "acknowledged": true
}
```

---
## Get Mappings

### Path options

Field | Type | Description
:--- | :--- |:--- 
`index_name` | String | The name of the index used for log ingestion. Required.

#### Example request {#example-request-2}

```json
GET /_plugins/_security_analytics/mappings?index_name=windows
```

#### Example response {#example-response-2}

```json
{
    "windows": {
        "mappings": {
            "properties": {
                "windows-event_data-CommandLine": {
                    "type": "alias",
                    "path": "CommandLine"
                },
                "event_uid": {
                    "type": "alias",
                    "path": "EventID"
                }
            }
        }
    }
}
```

---
## Update Mappings

#### Example request {#example-request-3}

```json
PUT /_plugins/_security_analytics/mappings

{
   "index_name": "windows",
   "field": "CommandLine",
   "alias": "windows-event_data-CommandLine"
}
```

#### Example response {#example-response-3}

```json
{
    "acknowledged": true
}
```
