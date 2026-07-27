# Object-Oriented Class Design

While DataBridge Pro is a single-page React frontend integrated with a Node-based Vite plugin middleware, its logical structure maps perfectly to an object-oriented paradigm. This document translates the frontend components, state models, data objects, and backend handlers into cohesive classes to model their attributes, operational methods, and relationships.

## 📊 Class Diagram

The following UML Class Diagram represents the key entities of DataBridge Pro, styled using high-contrast Material Design parameters.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#2196F3', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#1976D2', 'lineColor': '#212121', 'secondaryColor': '#4CAF50', 'tertiaryColor': '#FF9800', 'mainBkg': '#F5F5F5', 'nodeBorder': '#BDBDBD' }}}%%
classDiagram
    direction TB

    class App {
        +Step currentStep
        +boolean isSidebarOpen
        +ConnectionFormState sourceA
        +ConnectionFormState destB
        +Set~string~ selectedSourceTables
        +Set~string~ selectedTargetTables
        +MappingPlan mappingSnapshot
        +QueuedMappingPlan[] mappingQueue
        +handleMappingSnapshotChange(MappingPlan snap) void
        +addMappingToQueue(MappingPlan plan) void
        +removeMappingFromQueue(string id) void
        +moveQueueItem(string id, number direction) void
        +handleNext() void
        +handleBack() void
    }

    class ConnectionStep {
        +boolean showPassA
        +boolean showPassB
        +ConnectionTestState sourceATest
        +ConnectionTestState destBTest
        +testSourceA() Promise~void~
        +testDestB() Promise~void~
    }

    class TableListingStep {
        +boolean isLoading
        +MysqlTableRow[] sourceRows
        +MysqlTableRow[] targetRows
        +string sourceErr
        +string targetErr
        +string filterSource
        +string filterTarget
        +SchemaDialogState schemaDialog
        +toggleSource(string tableName) void
        +toggleTarget(string tableName) void
    }

    class MappingStep {
        +string pickSource
        +string pickTarget
        +MysqlColumnSchema[] srcCols
        +MysqlColumnSchema[] tgtCols
        +boolean colsLoading
        +string colsErr
        +Record~string-ColumnBinding~ targetBindings
        +Record~string-string~ fixedDraft
        +string requireSourceNonEmpty
        +MysqlForeignKeyRow[] targetFks
        +autoSuggest() void
        +clearMapping(string targetCol) void
        +applyLiteral(string targetCol, string value) void
    }

    class TransferStep {
        +RunPhase phase
        +number progress
        +string[] logs
        +string errorDetail
        +MappedTransferJobResult[] lastResults
        +boolean skipDuplicateKeys
        +startMappedTransfer() Promise~void~
        +abortTransfer() void
    }

    class ConnectionFormState {
        +string host
        +string port
        +string user
        +string password
        +string dbName
    }

    class MappingPlan {
        +string sourceTable
        +string targetTable
        +Record~string-ColumnBinding~ columnBindings
        +RowFilter rowFilter
    }

    class ColumnBinding {
        <<interface>>
        +string kind
    }

    class SourceBinding {
        +string kind = "source"
        +string sourceColumn
    }

    class LiteralBinding {
        +string kind = "literal"
        +string value
    }

    class MysqlTableRow {
        +string name
        +string schema
        +number rows
        +number sizeBytes
    }

    class MysqlColumnSchema {
        +number ordinal
        +string columnName
        +string columnType
        +string dataType
        +string isNullable
        +string columnKey
        +string columnDefault
        +string extra
        +string columnComment
    }

    class MysqlForeignKeyRow {
        +string columnName
        +string referencedTable
        +string referencedColumn
    }

    class TestDbConnectionPlugin {
        +parseConnectionBody(object body) ConnectionPayload
        +withMysqlConnection(ConnectionPayload c, function fn) Promise
        +runSingleTransferJob(Connection sourceConn, Connection destConn, TransferJob job) Promise
        +attachMiddleware(Server middlewares) void
    }

    %% Relationships
    App ..> ConnectionFormState : "manages state for"
    App *-- MappingPlan : "tracks current"
    App *-- MysqlTableRow : "gathers details of"
    App *-- TestDbConnectionPlugin : "communicates with via /api"

    ConnectionStep ..|> App : "renders in App"
    TableListingStep ..|> App : "renders in App"
    MappingStep ..|> App : "renders in App"
    TransferStep ..|> App : "renders in App"

    MappingPlan *-- ColumnBinding : "aggregates"
    SourceBinding --|> ColumnBinding : "extends"
    LiteralBinding --|> ColumnBinding : "extends"

    TableListingStep *-- MysqlTableRow : "displays"
    MappingStep *-- MysqlColumnSchema : "inspects"
    MappingStep *-- MysqlForeignKeyRow : "displays"
```

---

## 🏛 Class Explanations & Responsibilities

### 1. View Controller / Step Classes
These classes coordinate user interaction, input collection, and API handshakes for their respective views.

- **`App`**: The main coordinator controller. It implements the root wizard state machine (`connection`, `tables`, `mapping`, `transfer`), and routes central data sets (such as mapping queues, active connection models) downwards.
- **`ConnectionStep`**: Houses interactive state for credentials, visibility of passwords, and delegates connection verification triggers.
- **`TableListingStep`**: Filters tables, initiates schemas previews in a modal, and processes selections.
- **`MappingStep`**: Manages column alignment. Invokes name matching heuristics, drag-drop state transformations, and literal field overrides.
- **`TransferStep`**: Implements the execution coordinator. Interfaces with the abort triggers, captures live-console buffers, and calculates visual pipeline progress.

### 2. Model & DTO Classes
State structures passed around the application to maintain migration mappings and configuration parameters.

- **`ConnectionFormState`**: A structured entity containing the host, port, user credentials, password, and database schema name.
- **`MappingPlan`**: Ties a source table and target table pair to column alignment instructions. Includes an optional non-empty row filter rule.
- **`ColumnBinding` (with subclasses `SourceBinding` and `LiteralBinding`)**: Formulates structural assignment targets. Tracks either mapped source keys or strict literals.
- **`MysqlTableRow`**: A direct structure mapping to the results returned by schema table scans.
- **`MysqlColumnSchema`**: Defines columns and structural database properties.
- **`MysqlForeignKeyRow`**: Tracks a column's foreign key reference relationships to manage execution order hierarchy constraints.

### 3. Service / Server-side Classes
- **`TestDbConnectionPlugin`**: The node-side controller active in the Vite server ecosystem. Implements connection pools, intercepts HTTP `/api` operations, quotes database identifiers safely, manages batch iterations, and handles transactional commits/rollbacks.
