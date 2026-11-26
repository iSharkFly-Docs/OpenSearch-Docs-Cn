---
title: Delete Snapshot
---

## Delete snapshot
<Badge type="tip" text="Introduced 1.0" />

Deletes a snapshot from a repository.

* To learn more about snapshots, see [Snapshots](/tuning-your-cluster/availability-and-recovery/snapshots/).

* To view a list of your repositories, see [cat repositories](/api-reference/cat/cat-repositories).

* To view a list of your snapshots, see [cat snapshots](/api-reference/cat/cat-snapshots).

## Path parameters

Parameter | Data type | Description
:--- | :--- | :---
repository | String | Repostory that contains the snapshot. |
snapshot | String | Snapshot to delete. |

#### Example request

The following request deletes a snapshot called `my-first-snapshot` from the `my-opensearch-repo` repository:

```json
DELETE _snapshot/my-opensearch-repo/my-first-snapshot
```

#### Example response

Upon success, the response returns the following JSON object:

```json
{
  "acknowledged": true
}
```

::: info NOTE
To verify that the snapshot was deleted, use the [Get snapshot](/api-reference/snapshots/get-snapshot) API, passing the snapshot name as the `snapshot` path parameter.
:::
