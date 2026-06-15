import type {IncomingMessage, ServerResponse} from 'node:http';
import type {Connect} from 'vite';
import type {Plugin} from 'vite';
import mysql, {type ResultSetHeader, type RowDataPacket} from 'mysql2/promise';

type ConnectionPayload = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

function parseConnectionBody(body: Record<string, unknown>): ConnectionPayload | null {
  const host = String(body.host ?? '').trim();
  const parsedPort = body.port === undefined || body.port === null || String(body.port).trim() === '' ? 3306 : Number(body.port);
  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) return null;
  const port = parsedPort;
  const user = String(body.user ?? '');
  const password = body.password != null ? String(body.password) : '';
  const database = String(body.database ?? '').trim();
  if (!host || !database) return null;
  return {host, port, user, password, database};
}

function parseTableSchemaRequest(
  body: Record<string, unknown>,
): (ConnectionPayload & {table: string}) | null {
  const c = parseConnectionBody(body);
  if (!c) return null;
  const table = String(body.table ?? '').trim();
  if (!table) return null;
  return {...c, table};
}

async function withMysqlConnection<T>(
  c: ConnectionPayload,
  fn: (conn: mysql.Connection) => Promise<T>,
): Promise<T> {
  const conn = await mysql.createConnection({
    host: c.host,
    port: c.port,
    user: c.user,
    password: c.password,
    connectTimeout: 10_000,
  });
  try {
    await conn.query('USE ??', [c.database]);
    return await fn(conn);
  } finally {
    await conn.end().catch(() => {});
  }
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function mysqlErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as {message: unknown}).message);
  }
  return 'Connection failed.';
}

/** MySQL ER_DUP_ENTRY — explain when target is “empty” but insert still conflicts. */
function duplicateKeyHint(err: unknown): string {
  const errno =
    typeof err === 'object' && err !== null && 'errno' in err
      ? Number((err as {errno: unknown}).errno)
      : NaN;
  if (errno !== 1062) return '';
  return (
    ' If the target table is empty, this usually means the SOURCE has multiple rows with the same value for the column ' +
    'that maps to a UNIQUE field (e.g. two Pizza rows in boxes both mapping to name on the target). ' +
    'Enable Skip duplicate keys (INSERT IGNORE) in the UI, or deduplicate the source data.'
  );
}

function parseOnDuplicate(body: Record<string, unknown>): 'error' | 'ignore' {
  const v = String(body.onDuplicate ?? '').toLowerCase().trim();
  if (v === 'ignore' || v === 'skip') return 'ignore';
  return 'error';
}

const MYSQL_IDENT_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function quoteMysqlIdent(name: string, label: string): string {
  const n = name.trim();
  if (!n || !MYSQL_IDENT_RE.test(n)) {
    throw new Error(`Invalid ${label} name "${name}". Use letters, digits, and underscores only.`);
  }
  return '`' + n.replace(/`/g, '``') + '`';
}

type ColumnBinding =
  | {kind: 'source'; sourceColumn: string}
  | {kind: 'literal'; value: string | null};

type TransferJob = {
  sourceTable: string;
  targetTable: string;
  columnBindings: Record<string, ColumnBinding>;
  rowFilter?: {requireSourceNonEmpty?: string};
};

function parseColumnBindingsFromJobItem(o: Record<string, unknown>): TransferJob | null {
  const sourceTable = String(o.sourceTable ?? '').trim();
  const targetTable = String(o.targetTable ?? '').trim();
  if (!sourceTable || !targetTable) return null;

  const cbRaw = o.columnBindings;
  const cmRaw = o.columnMap;

  let columnBindings: Record<string, ColumnBinding> | null = null;

  if (cbRaw && typeof cbRaw === 'object' && !Array.isArray(cbRaw)) {
    columnBindings = {};
    for (const [tk, raw] of Object.entries(cbRaw as Record<string, unknown>)) {
      const t = tk.trim();
      if (!t) return null;
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
      const kind = String((raw as {kind?: unknown}).kind ?? '').toLowerCase();
      if (kind === 'source') {
        const sc = String((raw as {sourceColumn?: unknown}).sourceColumn ?? '').trim();
        if (!sc) return null;
        columnBindings[t] = {kind: 'source', sourceColumn: sc};
      } else if (kind === 'literal') {
        const v = (raw as {value?: unknown}).value;
        if (v === null || v === undefined) {
          columnBindings[t] = {kind: 'literal', value: null};
        } else {
          columnBindings[t] = {kind: 'literal', value: String(v)};
        }
      } else {
        return null;
      }
    }
  } else if (cmRaw && typeof cmRaw === 'object' && !Array.isArray(cmRaw)) {
    columnBindings = {};
    for (const [k, v] of Object.entries(cmRaw as Record<string, unknown>)) {
      const tk = k.trim();
      const sv = String(v ?? '').trim();
      if (!tk || !sv) return null;
      columnBindings[tk] = {kind: 'source', sourceColumn: sv};
    }
  }

  if (!columnBindings || Object.keys(columnBindings).length === 0) return null;

  let requireSourceNonEmpty: string | undefined;
  const rf = o.rowFilter;
  if (rf !== undefined) {
    if (!rf || typeof rf !== 'object' || Array.isArray(rf)) return null;
    const v = (rf as {requireSourceNonEmpty?: unknown}).requireSourceNonEmpty;
    if (v != null) {
      const s = String(v).trim();
      if (!s) return null;
      requireSourceNonEmpty = s;
    }
  }

  return {
    sourceTable,
    targetTable,
    columnBindings,
    rowFilter: requireSourceNonEmpty ? {requireSourceNonEmpty} : undefined,
  };
}

function parseTransferJobs(body: Record<string, unknown>): TransferJob[] | null {
  const raw = body.jobs;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const jobs: TransferJob[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const parsed = parseColumnBindingsFromJobItem(item as Record<string, unknown>);
    if (!parsed) return null;
    jobs.push(parsed);
  }
  return jobs;
}

async function runSingleTransferJob(
  sourceConn: mysql.Connection,
  destConn: mysql.Connection,
  job: TransferJob,
  batchSize: number,
  onDuplicate: 'error' | 'ignore',
): Promise<{sourceTable: string; targetTable: string; insertedRows: number; skippedRows: number}> {
  const bindings = job.columnBindings;
  const requireSourceNonEmpty = job.rowFilter?.requireSourceNonEmpty?.trim() || null;
  const qSource = quoteMysqlIdent(job.sourceTable, 'source table');
  const qTarget = quoteMysqlIdent(job.targetTable, 'target table');
  const targetCols = Object.keys(bindings);
  const insertCols = targetCols.map((c) => quoteMysqlIdent(c, 'target column')).join(', ');

  const sourceColsNeeded = [
    ...new Set(
      targetCols
        .map((t) => bindings[t])
        .filter((b): b is {kind: 'source'; sourceColumn: string} => b.kind === 'source')
        .map((b) => b.sourceColumn),
    ),
  ];
  if (requireSourceNonEmpty && !sourceColsNeeded.includes(requireSourceNonEmpty)) {
    sourceColsNeeded.push(requireSourceNonEmpty);
  }

  const insertVerb = onDuplicate === 'ignore' ? 'INSERT IGNORE' : 'INSERT';

  if (sourceColsNeeded.length === 0) {
    for (const t of targetCols) {
      if (bindings[t].kind !== 'literal') {
        throw new Error('Invalid job: expected only literal bindings when no source columns are used.');
      }
    }

    const [cntRows] = await sourceConn.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS __cnt FROM ${qSource}`,
    );
    const total = Number((cntRows[0] as Record<string, unknown>).__cnt ?? 0);
    let inserted = 0;
    let skipped = 0;
    let done = 0;

    while (done < total) {
      const chunk = Math.min(batchSize, total - done);
      const flat: unknown[] = [];
      for (let i = 0; i < chunk; i++) {
        for (const t of targetCols) {
          const b = bindings[t];
          flat.push(b.kind === 'literal' ? b.value : null);
        }
      }
      const placeholdersRow = '(' + targetCols.map(() => '?').join(',') + ')';
      const allPlaceholders = Array.from({length: chunk}, () => placeholdersRow).join(',');

      await destConn.beginTransaction();
      try {
        const [header] = await destConn.query<ResultSetHeader>(
          `${insertVerb} INTO ${qTarget} (${insertCols}) VALUES ${allPlaceholders}`,
          flat,
        );
        await destConn.commit();
        const affected = Number(header.affectedRows ?? 0);
        if (onDuplicate === 'ignore') {
          inserted += affected;
          skipped += Math.max(0, chunk - affected);
        } else {
          inserted += chunk;
        }
      } catch (e) {
        await destConn.rollback();
        throw e;
      }
      done += chunk;
    }

    return {
      sourceTable: job.sourceTable,
      targetTable: job.targetTable,
      insertedRows: inserted,
      skippedRows: skipped,
    };
  }

  const selectList = sourceColsNeeded.map((c) => quoteMysqlIdent(c, 'source column')).join(', ');
  let inserted = 0;
  let skipped = 0;
  let offset = 0;

  while (true) {
    const [batch] = await sourceConn.query<RowDataPacket[]>(
      `SELECT ${selectList} FROM ${qSource} LIMIT ? OFFSET ?`,
      [batchSize, offset],
    );
    if (!Array.isArray(batch) || batch.length === 0) break;

    const rowsToInsert: Record<string, unknown>[] = [];
    for (const row of batch) {
      const r = row as Record<string, unknown>;
      if (requireSourceNonEmpty) {
        const v = r[requireSourceNonEmpty];
        const isEmpty =
          v === null ||
          v === undefined ||
          (typeof v === 'string' && v.trim() === '');
        if (isEmpty) continue;
      }
      rowsToInsert.push(r);
    }

    if (rowsToInsert.length === 0) {
      offset += batch.length;
      continue;
    }

    const placeholdersRow = '(' + targetCols.map(() => '?').join(',') + ')';
    const allPlaceholders = rowsToInsert.map(() => placeholdersRow).join(',');
    const flat: unknown[] = [];
    for (const r of rowsToInsert) {
      for (const t of targetCols) {
        const b = bindings[t];
        if (b.kind === 'literal') {
          flat.push(b.value);
        } else {
          flat.push(r[b.sourceColumn] !== undefined ? r[b.sourceColumn] : null);
        }
      }
    }

    await destConn.beginTransaction();
    try {
      const [header] = await destConn.query<ResultSetHeader>(
        `${insertVerb} INTO ${qTarget} (${insertCols}) VALUES ${allPlaceholders}`,
        flat,
      );
      await destConn.commit();
      const affected = Number(header.affectedRows ?? 0);
      if (onDuplicate === 'ignore') {
        inserted += affected;
        skipped += Math.max(0, rowsToInsert.length - affected);
      } else {
        inserted += rowsToInsert.length;
      }
    } catch (e) {
      await destConn.rollback();
      throw e;
    }

    offset += batch.length;
  }

  return {
    sourceTable: job.sourceTable,
    targetTable: job.targetTable,
    insertedRows: inserted,
    skippedRows: skipped,
  };
}

const MAX_JSON_BODY_BYTES = 1024 * 1024;

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let received = 0;
    let rejected = false;

    req.on('data', (chunk) => {
      if (rejected) return;
      const b = chunk as Buffer;
      received += b.length;
      if (received > MAX_JSON_BODY_BYTES) {
        rejected = true;
        reject(new Error('Request body exceeds 1 MiB limit.'));
        req.destroy();
        return;
      }
      chunks.push(b);
    });
    req.on('end', () => {
      if (rejected) return;
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        const parsed = raw ? JSON.parse(raw) : {};
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(new Error('JSON request body must be an object.'));
          return;
        }
        resolve(parsed as Record<string, unknown>);
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function attachMiddleware(middlewares: Connect.Server) {
  middlewares.use(async (req, res, next) => {
    const url = (req.url ?? '').split('?')[0];
    if (req.method !== 'POST') {
      next();
      return;
    }

    if (url === '/api/test-db-connection') {
      try {
        const body = await readJsonBody(req);
        const c = parseConnectionBody(body);
        if (!c) {
          sendJson(res, 400, {ok: false, message: 'Host and database name are required.'});
          return;
        }

        await withMysqlConnection(c, async (conn) => {
          const [schemaRows] = await conn.query<RowDataPacket[]>(
            'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE LOWER(SCHEMA_NAME) = LOWER(?) LIMIT 1',
            [c.database],
          );
          if (!Array.isArray(schemaRows) || schemaRows.length === 0) {
            sendJson(res, 400, {ok: false, message: `Unknown database "${c.database}".`});
            return;
          }

          const [dbRows] = await conn.query<RowDataPacket[]>('SELECT DATABASE() AS db');
          const current = dbRows[0]?.db;
          if (typeof current !== 'string' || current.toLowerCase() !== c.database.toLowerCase()) {
            sendJson(res, 400, {ok: false, message: `Could not use database "${c.database}".`});
            return;
          }

          await conn.ping();
        });

        if (res.writableEnded) return;

        sendJson(res, 200, {ok: true, message: 'Connection successful.'});
      } catch (err: unknown) {
        if (!res.writableEnded) {
          sendJson(res, 400, {ok: false, message: mysqlErrorMessage(err)});
        }
      }
      return;
    }

    if (url === '/api/list-tables') {
      try {
        const body = await readJsonBody(req);
        const c = parseConnectionBody(body);
        if (!c) {
          sendJson(res, 400, {ok: false, message: 'Host and database name are required.'});
          return;
        }

        const tables = await withMysqlConnection(c, async (conn) => {
          const [rows] = await conn.query<RowDataPacket[]>(
            `SELECT
              TABLE_NAME AS tableName,
              TABLE_ROWS AS rowEstimate,
              (DATA_LENGTH + INDEX_LENGTH) AS sizeBytes
            FROM information_schema.TABLES
            WHERE LOWER(TABLE_SCHEMA) = LOWER(?) AND TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME`,
            [c.database],
          );
          if (!Array.isArray(rows)) return [];
          return rows.map((r) => {
            const row = r as Record<string, unknown>;
            const name = row.tableName != null ? String(row.tableName) : '';
            const re = row.rowEstimate;
            const sb = row.sizeBytes;
            return {
              name,
              schema: c.database,
              rows: re != null && re !== '' ? Number(re) : null,
              sizeBytes: sb != null && sb !== '' ? Number(sb) : null,
            };
          });
        });

        sendJson(res, 200, {ok: true, tables});
      } catch (err: unknown) {
        if (!res.writableEnded) {
          sendJson(res, 400, {ok: false, message: mysqlErrorMessage(err)});
        }
      }
      return;
    }

    if (url === '/api/table-schema') {
      try {
        const body = await readJsonBody(req);
        const reqParsed = parseTableSchemaRequest(body);
        if (!reqParsed) {
          sendJson(res, 400, {
            ok: false,
            message: 'Host, database name, and table name are required.',
          });
          return;
        }

        const columns = await withMysqlConnection(reqParsed, async (conn) => {
          const [rows] = await conn.query<RowDataPacket[]>(
            `SELECT
              ORDINAL_POSITION AS ordinal,
              COLUMN_NAME AS columnName,
              COLUMN_TYPE AS columnType,
              DATA_TYPE AS dataType,
              IS_NULLABLE AS isNullable,
              COLUMN_KEY AS columnKey,
              COLUMN_DEFAULT AS columnDefault,
              EXTRA AS extra,
              COLUMN_COMMENT AS columnComment
            FROM information_schema.COLUMNS
            WHERE LOWER(TABLE_SCHEMA) = LOWER(?) AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION`,
            [reqParsed.database, reqParsed.table],
          );
          if (!Array.isArray(rows)) return [];
          return rows.map((r) => {
            const row = r as Record<string, unknown>;
            const def = row.columnDefault;
            return {
              ordinal: Number(row.ordinal ?? 0),
              columnName: String(row.columnName ?? ''),
              columnType: String(row.columnType ?? ''),
              dataType: String(row.dataType ?? ''),
              isNullable: String(row.isNullable ?? ''),
              columnKey: String(row.columnKey ?? ''),
              columnDefault:
                def === null || def === undefined ? null : String(def),
              extra: String(row.extra ?? ''),
              columnComment: String(row.columnComment ?? ''),
            };
          });
        });

        sendJson(res, 200, {ok: true, columns});
      } catch (err: unknown) {
        if (!res.writableEnded) {
          sendJson(res, 400, {ok: false, message: mysqlErrorMessage(err)});
        }
      }
      return;
    }

    if (url === '/api/table-foreign-keys') {
      try {
        const body = await readJsonBody(req);
        const reqParsed = parseTableSchemaRequest(body);
        if (!reqParsed) {
          sendJson(res, 400, {
            ok: false,
            message: 'Host, database name, and table name are required.',
          });
          return;
        }

        const foreignKeys = await withMysqlConnection(reqParsed, async (conn) => {
          const [rows] = await conn.query<RowDataPacket[]>(
            `SELECT
              COLUMN_NAME AS columnName,
              REFERENCED_TABLE_NAME AS referencedTable,
              REFERENCED_COLUMN_NAME AS referencedColumn
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
              AND REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY COLUMN_NAME, REFERENCED_TABLE_NAME`,
            [reqParsed.database, reqParsed.table],
          );
          if (!Array.isArray(rows)) return [];
          return rows.map((r) => {
            const row = r as Record<string, unknown>;
            return {
              columnName: String(row.columnName ?? ''),
              referencedTable: String(row.referencedTable ?? ''),
              referencedColumn: String(row.referencedColumn ?? ''),
            };
          });
        });

        sendJson(res, 200, {ok: true, foreignKeys});
      } catch (err: unknown) {
        if (!res.writableEnded) {
          sendJson(res, 400, {ok: false, message: mysqlErrorMessage(err)});
        }
      }
      return;
    }

    if (url === '/api/mapped-transfer') {
      try {
        const body = await readJsonBody(req);
        const source = parseConnectionBody(
          (body.source && typeof body.source === 'object'
            ? (body.source as Record<string, unknown>)
            : null) ?? {},
        );
        const destination = parseConnectionBody(
          (body.destination && typeof body.destination === 'object'
            ? (body.destination as Record<string, unknown>)
            : null) ?? {},
        );
        if (!source || !destination) {
          sendJson(res, 400, {
            ok: false,
            message: 'Valid source and destination connections (host, database) are required.',
          });
          return;
        }

        const jobs = parseTransferJobs(body);
        if (!jobs) {
          sendJson(res, 400, {
            ok: false,
            message:
              'Provide a non-empty jobs array with columnBindings (or legacy columnMap): { sourceTable, targetTable, columnBindings }.',
          });
          return;
        }

        let batchSize = Number(body.batchSize);
        if (!Number.isFinite(batchSize) || batchSize < 1) batchSize = 500;
        batchSize = Math.min(Math.floor(batchSize), 2000);
        const onDuplicate = parseOnDuplicate(body);

        let sourceConn: mysql.Connection | null = null;
        let destConn: mysql.Connection | null = null;
        try {
          sourceConn = await mysql.createConnection({
            host: source.host,
            port: source.port,
            user: source.user,
            password: source.password,
          });
          destConn = await mysql.createConnection({
            host: destination.host,
            port: destination.port,
            user: destination.user,
            password: destination.password,
          });
          await sourceConn.query('USE ??', [source.database]);
          await destConn.query('USE ??', [destination.database]);

          const results: Array<{
            sourceTable: string;
            targetTable: string;
            insertedRows: number;
            skippedRows: number;
          }> = [];

          for (let i = 0; i < jobs.length; i++) {
            try {
              const r = await runSingleTransferJob(
                sourceConn,
                destConn,
                jobs[i],
                batchSize,
                onDuplicate,
              );
              results.push(r);
            } catch (err: unknown) {
              sendJson(res, 400, {
                ok: false,
                message: `Transfer failed on job ${i + 1} (${jobs[i].sourceTable} → ${jobs[i].targetTable}): ${mysqlErrorMessage(err)}${duplicateKeyHint(err)}`,
                failedJobIndex: i,
                partialResults: results,
              });
              return;
            }
          }

          if (!res.writableEnded) {
            sendJson(res, 200, {ok: true, results});
          }
        } finally {
          await destConn?.end().catch(() => {});
          await sourceConn?.end().catch(() => {});
        }
      } catch (err: unknown) {
        if (!res.writableEnded) {
          sendJson(res, 400, {ok: false, message: mysqlErrorMessage(err)});
        }
      }
      return;
    }

    next();
  });
}

export function testDbConnectionPlugin(): Plugin {
  return {
    name: 'test-db-connection',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}
