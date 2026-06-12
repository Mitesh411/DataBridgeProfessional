# API Reference

This document describes the API endpoints provided by the DataBridge Pro backend proxy (implemented in `testDbConnectionPlugin.ts`). All requests should be sent as `POST` with a JSON body.

## 📡 Base URL

During development, the API is available at:
`http://localhost:3000/api`

---

## 🔐 Authentication & Connections

All endpoints require the database connection details in the request body to establish a connection on-the-fly.

### Common Connection Object
```json
{
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "password": "password",
  "database": "my_db"
}
```

---

## 🚀 Endpoints

### 1. Test Database Connection
Validates if a connection can be established with the provided credentials.

- **URL**: `/test-db-connection`
- **Method**: `POST`
- **Payload**: `Connection Object`
- **Response**:
  - `200 OK`: `{ "ok": true, "message": "Connection successful." }`
  - `400 Bad Request`: `{ "ok": false, "message": "Error message details" }`

### 2. List Tables
Retrieves a list of base tables from the specified database.

- **URL**: `/list-tables`
- **Method**: `POST`
- **Payload**: `Connection Object`
- **Response**:
  - `200 OK`:
    ```json
    {
      "ok": true,
      "tables": [
        {
          "name": "users",
          "schema": "my_db",
          "rows": 1250,
          "sizeBytes": 204800
        }
      ]
    }
    ```

### 3. Table Schema
Fetches the column definitions for a specific table.

- **URL**: `/table-schema`
- **Method**: `POST`
- **Payload**: `Connection Object` + `"table": "table_name"`
- **Response**:
  - `200 OK`:
    ```json
    {
      "ok": true,
      "columns": [
        {
          "ordinal": 1,
          "columnName": "id",
          "columnType": "int(11)",
          "dataType": "int",
          "isNullable": "NO",
          "columnKey": "PRI",
          "columnDefault": null,
          "extra": "auto_increment",
          "columnComment": ""
        }
      ]
    }
    ```

### 4. Table Foreign Keys
Retrieves foreign key constraints for a specific table.

- **URL**: `/table-foreign-keys`
- **Method**: `POST`
- **Payload**: `Connection Object` + `"table": "table_name"`
- **Response**:
  - `200 OK`:
    ```json
    {
      "ok": true,
      "foreignKeys": [
        {
          "columnName": "user_id",
          "referencedTable": "users",
          "referencedColumn": "id"
        }
      ]
    }
    ```

### 5. Mapped Transfer
Executes the data transfer based on the provided mapping jobs.

- **URL**: `/mapped-transfer`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "source": { "Connection Object" },
    "destination": { "Connection Object" },
    "jobs": [
      {
        "sourceTable": "src_users",
        "targetTable": "tgt_users",
        "columnBindings": {
          "id": { "kind": "source", "sourceColumn": "uid" },
          "status": { "kind": "literal", "value": "active" }
        },
        "rowFilter": { "requireSourceNonEmpty": "email" }
      }
    ],
    "batchSize": 500,
    "onDuplicate": "error" | "ignore"
  }
  ```
- **Response**:
  - `200 OK`:
    ```json
    {
      "ok": true,
      "results": [
        {
          "sourceTable": "src_users",
          "targetTable": "tgt_users",
          "insertedRows": 1250,
          "skippedRows": 0
        }
      ]
    }
    ```
  - `400 Bad Request`: Returns partial results and the index of the failed job.

---

## ⚠️ Error Handling

Errors are returned with a `400` status code and a JSON body containing a descriptive `message`. Common errors include:
- `ER_ACCESS_DENIED_ERROR`: Invalid credentials.
- `ER_BAD_DB_ERROR`: Database does not exist.
- `ER_NO_SUCH_TABLE`: Table not found during schema retrieval or transfer.
- `ER_DUP_ENTRY`: Primary key or unique constraint violation (if `onDuplicate` is set to `error`).
