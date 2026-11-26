---
title: 异步搜索安全
---

# 异步搜索安全

你可以将安全插件（Security plugin）与异步搜索结合使用，限制非管理员用户只能执行特定操作。例如，你可能希望某些用户只能提交或删除异步搜索，而另一些用户只能查看结果。

所有异步搜索索引都作为系统索引受到保护。只有超级管理员用户，或持有传输层安全（Transport Layer Security，TLS）证书的管理员用户才能访问系统索引。有关更多信息，请参阅[系统索引](/security/configuration/system-indices)。

## 基本权限

作为管理员用户，你可以使用安全插件根据用户需要访问的 API 操作为其分配特定权限。有关支持的 API 操作列表，请参阅[异步搜索](/)。

安全插件有两个内置角色，可覆盖大多数异步搜索使用场景：`asynchronous_search_full_access` 和 `asynchronous_search_read_access`。有关各角色的说明，请参阅[预定义角色](/security/access-control/users-roles#predefined-roles)。

如果这些角色不能满足你的需求，可以根据使用场景自由组合单独的异步搜索权限。每个操作都对应 REST API 中的一个操作。例如，`cluster:admin/opensearch/asynchronous_search/delete` 权限允许你删除之前提交的异步搜索。

### 关于异步搜索与细粒度访问控制的说明

按照设计，异步搜索插件会从目标索引中提取数据，并将数据存储在单独的索引中，以便具有相应权限的用户获取搜索结果。虽然拥有 `asynchronous_search_read_access` 或 `cluster:admin/opensearch/asynchronous_search/get` 权限的用户本身无法提交异步搜索请求，但该用户可以使用相关的搜索 ID 获取并查看搜索结果。[文档级安全](/security/access-control/document-level-security)（DLS）和[字段级安全](/security/access-control/field-level-security)（FLS）访问控制旨在保护目标索引中的数据。但一旦数据存储到该索引之外，拥有这些访问权限的用户就能使用搜索 ID 获取并查看异步搜索结果，其中可能包含目标索引中原本被 DLS 和 FLS 访问控制隐藏的数据。

为了降低非预期用户查看到可能描述某个索引的搜索结果的可能性，我们建议管理员启用基于角色的访问控制，并在为目标用户组分配权限时牢记这类设计因素。有关详细信息，请参阅[按后端角色限制访问](#advanced-limit-access-by-backend-role)。

## （高级）按后端角色限制访问

使用后端角色（backend role）可以基于角色对异步搜索配置细粒度访问。例如，组织中不同部门的用户只能查看本部门拥有的异步搜索。

首先，确保你的用户拥有相应的[后端角色](/security/access-control/)。后端角色通常来自 [LDAP 服务器](/security/authentication-backends/ldap)或 [SAML 提供商](/security/authentication-backends/saml)。不过，如果你使用内部用户数据库，可以使用 REST API [手动添加](/security/access-control/api#create-user)。

现在，当用户在 OpenSearch Dashboards 中查看异步搜索资源（或调用 REST API）时，只能看到由拥有其后端角色子集的用户提交的异步搜索。
例如，假设有两个用户：`judy` 和 `elon`。

`judy` 拥有 IT 后端角色：

```json
PUT _plugins/_security/api/internalusers/judy
{
  "password": "judy",
  "backend_roles": [
    "IT"
  ],
  "attributes": {}
}
```

`elon` 拥有 admin 后端角色：

```json
PUT _plugins/_security/api/internalusers/elon
{
  "password": "elon",
  "backend_roles": [
    "admin"
  ],
  "attributes": {}
}
```

`judy` 和 `elon` 都拥有异步搜索的完全访问权限：

```json
PUT _plugins/_security/api/rolesmapping/async_full_access
{
  "backend_roles": [],
  "hosts": [],
  "users": [
    "judy",
    "elon"
  ]
}
```

由于他们的后端角色不同，`judy` 提交的异步搜索对 `elon` 不可见，反之亦然。

`judy` 至少需要拥有 `elon` 所有角色的超集，才能看到 `elon` 的异步搜索。

例如，如果 `judy` 拥有五个后端角色，而 `elon` 拥有其中一个角色，那么 `judy` 可以看到 `elon` 提交的异步搜索，但 `elon` 看不到 `judy` 提交的异步搜索。也就是说，`judy` 可以对 `elon` 提交的异步搜索执行 GET 和 DELETE 操作，反之则不行。

如果所有用户都没有任何后端角色，那么这三个用户都能看到彼此的搜索。

例如，假设有三个用户：`judy`、`elon` 和 `jack`。

`judy`、`elon` 和 `jack` 都没有设置后端角色：

```json
PUT _plugins/_security/api/internalusers/judy
{
  "password": "judy",
  "backend_roles": [],
  "attributes": {}
}
```

```json
PUT _plugins/_security/api/internalusers/elon
{
  "password": "elon",
  "backend_roles": [],
  "attributes": {}
}
```

```json
PUT _plugins/_security/api/internalusers/jack
{
  "password": "jack",
  "backend_roles": [],
  "attributes": {}
}
```

`judy` 和 `elon` 都拥有异步搜索的完全访问权限：

```json
PUT _plugins/_security/api/rolesmapping/async_full_access
{
  "backend_roles": [],
  "hosts": [],
  "users": ["judy","elon"]
}
```

`jack` 拥有异步搜索结果的读取权限：

```json
PUT _plugins/_security/api/rolesmapping/async_read_access
{
  "backend_roles": [],
  "hosts": [],
  "users": ["jack"]
}
```

由于所有用户都没有后端角色，他们能够看到彼此的异步搜索。因此，如果 `judy` 提交了一个异步搜索，拥有完全访问权限的 `elon` 能够看到该搜索。拥有读取权限的 `jack` 也能看到 `judy` 的异步搜索。
