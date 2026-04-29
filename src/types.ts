export type Step = 'connection' | 'tables' | 'mapping' | 'transfer';

/** How each target column gets its value for INSERT. */
export type ColumnBinding =
  | { kind: 'source'; sourceColumn: string }
  | { kind: 'literal'; value: string | null };

/** One source → target table transfer: each target column maps from source or a fixed value (e.g. mandatory fields with no source). */
export type MappingPlan = {
  sourceTable: string;
  targetTable: string;
  columnBindings: Record<string, ColumnBinding>;
  /**
   * Optional filter to avoid inserting "empty" child rows.
   * When set, a source row is inserted only if this source column is non-empty.
   */
  rowFilter?: { requireSourceNonEmpty?: string };
};

export type QueuedMappingPlan = MappingPlan & { id: string };

export interface ConnectionDetails {
  host: string;
  port: string;
  user: string;
  pass: string;
  dbName: string;
}

/** Row from GET /api/list-tables (MySQL base tables in the selected database/schema). */
export interface MysqlTableRow {
  name: string;
  schema: string;
  rows: number | null;
  sizeBytes: number | null;
}

/** One foreign key column from POST /api/table-foreign-keys (information_schema.KEY_COLUMN_USAGE). */
export interface MysqlForeignKeyRow {
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
}

/** Column from POST /api/table-schema (information_schema.COLUMNS). */
export interface MysqlColumnSchema {
  ordinal: number;
  columnName: string;
  columnType: string;
  dataType: string;
  isNullable: string;
  columnKey: string;
  columnDefault: string | null;
  extra: string;
  columnComment: string;
}

export interface TableItem {
  id: string;
  name: string;
  size: string;
  rows: string;
  selected: boolean;
  type?: string;
  mappedTo?: string;
  status?: 'auto' | 'manual' | 'locked';
}
