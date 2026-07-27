# REST API Reference

DataBridge Pro integrates with a simulated backend via a custom Vite plugin (`testDbConnectionPlugin.ts`). It handles MySQL database connections, explores schemas, and executes migration batches. All endpoints are exposed as **POST** operations with JSON payloads.

---

## 📡 Endpoints Overview

### 1. Test Connection
Validates if a connection can be established with the provided credentials.

- **URL**: `/api/test-db-connection`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "my_source_db"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    { "ok": true, "message": "Connection successful." }
    ```
  - `400 Bad Request`:
    ```json
    { "ok": false, "message": "Access denied for user 'root'@'localhost' (using password: NO)" }
    ```

---

### 2. List Tables
Retrieves a list of base tables from the specified database.

- **URL**: `/api/list-tables`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "my_source_db"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "ok": true,
      "tables": [
        {
          "name": "users",
          "schema": "my_source_db",
          "rows": 1250,
          "sizeBytes": 204800
        }
      ]
    }
    ```
  - `400 Bad Request`:
    ```json
    { "ok": false, "message": "Unknown database 'my_source_db'" }
    ```

---

### 3. Fetch Table Schema
Fetches the column definitions for a specific table.

- **URL**: `/api/table-schema`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "my_source_db",
    "table": "users"
  }
  ```
- **Responses**:
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
  - `400 Bad Request`:
    ```json
    { "ok": false, "message": "Table 'my_source_db.users' doesn't exist" }
    ```

---

### 4. Fetch Table Foreign Keys
Retrieves foreign key constraints for a specific table.

- **URL**: `/api/table-foreign-keys`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "my_source_db",
    "table": "orders"
  }
  ```
- **Responses**:
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

---

### 5. Execute Mapped Transfer
Executes the data transfer based on the provided mapping jobs.

- **URL**: `/api/mapped-transfer`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "source": {
      "host": "localhost",
      "port": 3306,
      "user": "root",
      "password": "",
      "database": "my_source_db"
    },
    "destination": {
      "host": "localhost",
      "port": 3306,
      "user": "root",
      "password": "",
      "database": "my_target_db"
    },
    "jobs": [
      {
        "sourceTable": "users",
        "targetTable": "users",
        "columnBindings": {
          "id": { "kind": "source", "sourceColumn": "id" },
          "status": { "kind": "literal", "value": "active" }
        },
        "rowFilter": { "requireSourceNonEmpty": "email" }
      }
    ],
    "batchSize": 500,
    "onDuplicate": "error"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "ok": true,
      "results": [
        {
          "sourceTable": "users",
          "targetTable": "users",
          "insertedRows": 1250,
          "skippedRows": 0
        }
      ]
    }
    ```
  - `400 Bad Request` (Duplicate Entry / Constraints Violation):
    ```json
    {
      "ok": false,
      "message": "Transfer failed on job 1 (users → users): Duplicate entry '1' for key 'PRIMARY'",
      "failedJobIndex": 0,
      "partialResults": []
    }
    ```

---

## ⚙️ Identifier Injection Guards
To prevent SQL injection while dynamically querying table names and schema attributes, strict validations are enforced on dynamic inputs:
- Regex validation check: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`
- Multi-layered escaping: all table and column names are programmatically enclosed in backticks (`` ` ``).
- Strict parameter binding for values (including batch variables).
