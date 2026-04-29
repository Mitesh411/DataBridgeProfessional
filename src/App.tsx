/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  ListTodo,
  Columns,
  ArrowLeftRight,
  Plus,
  Bell,
  Settings,
  CheckCircle2,
  Info,
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  Pause,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Lock,
  Link2,
  GripVertical,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Check,
  UploadCloud,
  DownloadCloud,
  MousePointer2,
  X,
} from 'lucide-react';
import {
  Step,
  type ColumnBinding,
  type MappingPlan,
  type MysqlForeignKeyRow,
  type MysqlTableRow,
  type MysqlColumnSchema,
  type QueuedMappingPlan,
} from './types';

const DATABASE_SOURCE_A = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '',
  dbName: 'try_at_home',
} as const;

const DATABASE_DESTINATION_B = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '',
  dbName: 'delibari_mapping_new_v2',
} as const;

type ConnectionFormState = {
  host: string;
  port: string;
  user: string;
  password: string;
  dbName: string;
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('connection');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [sourceA, setSourceA] = useState<ConnectionFormState>({
    host: DATABASE_SOURCE_A.host,
    port: DATABASE_SOURCE_A.port,
    user: DATABASE_SOURCE_A.user,
    password: DATABASE_SOURCE_A.password,
    dbName: DATABASE_SOURCE_A.dbName,
  });
  const [destB, setDestB] = useState<ConnectionFormState>({
    host: DATABASE_DESTINATION_B.host,
    port: DATABASE_DESTINATION_B.port,
    user: DATABASE_DESTINATION_B.user,
    password: DATABASE_DESTINATION_B.password,
    dbName: DATABASE_DESTINATION_B.dbName,
  });

  const [selectedSourceTables, setSelectedSourceTables] = useState<Set<string>>(() => new Set());
  const [selectedTargetTables, setSelectedTargetTables] = useState<Set<string>>(() => new Set());

  const [mappingSnapshot, setMappingSnapshot] = useState<MappingPlan>({
    sourceTable: '',
    targetTable: '',
    columnBindings: {},
  });

  const [mappingQueue, setMappingQueue] = useState<QueuedMappingPlan[]>([]);

  const handleMappingSnapshotChange = useCallback((snap: MappingPlan) => {
    setMappingSnapshot(snap);
  }, []);

  const addMappingToQueue = useCallback((plan: MappingPlan) => {
    if (!plan.sourceTable || !plan.targetTable || Object.keys(plan.columnBindings).length === 0) return;
    setMappingQueue((q) => [...q, {...plan, id: crypto.randomUUID()}]);
  }, []);

  const removeMappingFromQueue = useCallback((id: string) => {
    setMappingQueue((q) => q.filter((p) => p.id !== id));
  }, []);

  const moveQueueItem = useCallback((id: string, dir: -1 | 1) => {
    setMappingQueue((q) => {
      const i = q.findIndex((x) => x.id === id);
      if (i < 0) return q;
      const j = i + dir;
      if (j < 0 || j >= q.length) return q;
      const next = [...q];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'connection', label: 'Database Connection', icon: <Database size={20} /> },
    { id: 'tables', label: 'Table Listing', icon: <ListTodo size={20} /> },
    { id: 'mapping', label: 'Column Mapping', icon: <Columns size={20} /> },
    { id: 'transfer', label: 'Data Transfer', icon: <ArrowLeftRight size={20} /> },
  ];

  const handleNext = () => {
    if (currentStep === 'connection') setCurrentStep('tables');
    else if (currentStep === 'tables') setCurrentStep('mapping');
    else if (currentStep === 'mapping') setCurrentStep('transfer');
  };

  const handleBack = () => {
    if (currentStep === 'tables') setCurrentStep('connection');
    else if (currentStep === 'mapping') setCurrentStep('tables');
    else if (currentStep === 'transfer') setCurrentStep('mapping');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-slate-50 border-r border-slate-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg primary-gradient flex items-center justify-center text-white shadow-lg shrink-0">
              <Database size={20} fill="currentColor" />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">DataBridge Pro</h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Enterprise Migration</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 mt-4 px-3 space-y-1">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentStep === step.id
                ? 'text-primary font-bold bg-slate-200/50 border-r-2 border-primary'
                : 'text-slate-500 hover:bg-slate-200/30'
                }`}
            >
              <div className="shrink-0">{step.icon}</div>
              {isSidebarOpen && <span className="text-sm tracking-tight">{step.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-4">
          <button className="w-full primary-gradient text-white rounded-lg py-3 font-bold text-sm shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Plus size={18} />
            {isSidebarOpen && "New Migration"}
          </button>

          <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-xl">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaWpwyZmYd35O61biQbNaRuEdm_l6rCIBMOA204jAB98htKbqRrWXDKzqRL4eBX6opVcefFCP5ktPK2HlR0oBguQV0fp82HvU0Tu12oWDKzJwJP31frnFoG024Wg60whV0P3MwZ8vI_P44hdktX9bsmbGletVsDl5CwIy5fMlz0VQYTrxQwCvgDb6ea6TaJgNRc1XKY-lX7YZikrlhe0UqlV8HWvF592vGg5MN0uNbzXMOGkV1RhT54ISSvZ3aAimXn_ZfbKqG7zrE"
              alt="User"
              className="w-8 h-8 rounded-full bg-white shrink-0"
              referrerPolicy="no-referrer"
            />
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">Alex Sterling</p>
                <p className="text-[10px] text-slate-500 truncate">System Admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 custom-glass sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <nav className="flex items-center gap-6 text-sm font-medium">
              <a href="#" className="text-slate-600 hover:text-primary transition-colors">Dashboard</a>
              <a href="#" className="text-primary border-b-2 border-primary pb-1">Projects</a>
              <a href="#" className="text-slate-600 hover:text-primary transition-colors">Logs</a>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Status: Active</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <button className="hover:text-primary transition-colors"><Bell size={20} /></button>
              <button className="hover:text-primary transition-colors"><Settings size={20} /></button>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVc6EkL0YKzhw1svDLD91283yOawEUiEfMT6hVZnJcPDT5OArZY89wRhhkgiFBoQr4FqHSYbGaq8r35vhzelXdwB-yFmUy2z4eL7c6QDhylAhJNcAWS4u0P7_wUespBJQGDTJ0WwrX4jh_T34Fs2T3tEDHhOK5Obovp6YCIm-M17m9wgvHDMnitpJwsYYGjluGlR_DqKqdFHbmxcrp_h2UAg5_dtueY5GcVrgsN2J-yaRlDHYyabUj9H05fC-Jlf7PIn2XEtUvne_4"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 overflow-y-auto p-12 pb-32">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {currentStep === 'connection' && (
                <React.Fragment key="connection">
                  <ConnectionStep
                    sourceA={sourceA}
                    setSourceA={setSourceA}
                    destB={destB}
                    setDestB={setDestB}
                  />
                </React.Fragment>
              )}
              {currentStep === 'tables' && (
                <React.Fragment key="tables">
                  <TableListingStep
                    sourceA={sourceA}
                    destB={destB}
                    selectedSourceTables={selectedSourceTables}
                    setSelectedSourceTables={setSelectedSourceTables}
                    selectedTargetTables={selectedTargetTables}
                    setSelectedTargetTables={setSelectedTargetTables}
                  />
                </React.Fragment>
              )}
              {currentStep === 'mapping' && (
                <React.Fragment key="mapping">
                  <MappingStep
                    sourceA={sourceA}
                    destB={destB}
                    selectedSourceTables={selectedSourceTables}
                    selectedTargetTables={selectedTargetTables}
                    onMappingSnapshotChange={handleMappingSnapshotChange}
                    mappingQueue={mappingQueue}
                    onAddToQueue={addMappingToQueue}
                    onMoveQueueItem={moveQueueItem}
                    onRemoveFromQueue={removeMappingFromQueue}
                  />
                </React.Fragment>
              )}
              {currentStep === 'transfer' && (
                <React.Fragment key="transfer">
                  <TransferStep
                    sourceA={sourceA}
                    destB={destB}
                    mappingSnapshot={mappingSnapshot}
                    mappingQueue={mappingQueue}
                    onRemoveFromQueue={removeMappingFromQueue}
                    onMoveQueueItem={moveQueueItem}
                    selectedSourceTables={selectedSourceTables}
                    selectedTargetTables={selectedTargetTables}
                  />
                </React.Fragment>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="h-16 bg-white border-t border-slate-200 flex items-center justify-between px-12 fixed bottom-0 right-0 w-[calc(100%-16rem)] z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button
            onClick={handleBack}
            disabled={currentStep === 'connection'}
            className="px-6 py-2 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Back
          </button>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Progress</p>
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: currentStep === 'connection' ? '25%' : currentStep === 'tables' ? '50%' : currentStep === 'mapping' ? '75%' : '100%' }}
                  ></div>
                </div>
                <span className="text-xs font-black text-slate-700">
                  {currentStep === 'connection' ? '25%' : currentStep === 'tables' ? '50%' : currentStep === 'mapping' ? '75%' : '100%'}
                </span>
              </div>
            </div>

            <button
              type="button"
              title={
                currentStep === 'tables' &&
                  (selectedSourceTables.size === 0 || selectedTargetTables.size === 0)
                  ? 'Select at least one source table and one target table'
                  : undefined
              }
              onClick={handleNext}
              disabled={
                currentStep === 'transfer' ||
                (currentStep === 'tables' &&
                  (selectedSourceTables.size === 0 || selectedTargetTables.size === 0))
              }
              className="primary-gradient text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {currentStep === 'mapping' ? 'Initiate Transfer' : 'Next Step'}
              <ArrowRight size={16} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

type ConnectionTestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; message: string }
  | { status: 'err'; message: string };

async function fetchMysqlTableList(
  form: ConnectionFormState,
): Promise<{ ok: true; tables: MysqlTableRow[] } | { ok: false; message: string }> {
  const res = await fetch('/api/list-tables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: form.host.trim(),
      port: form.port,
      user: form.user,
      password: form.password,
      database: form.dbName.trim(),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    message?: string;
    tables?: MysqlTableRow[];
  };
  if (!res.ok || !data.ok || !Array.isArray(data.tables)) {
    return { ok: false, message: data.message ?? 'Failed to list tables.' };
  }
  return { ok: true, tables: data.tables };
}

async function fetchMysqlTableSchema(
  form: ConnectionFormState,
  tableName: string,
): Promise<
  { ok: true; columns: MysqlColumnSchema[] } | { ok: false; message: string }
> {
  const res = await fetch('/api/table-schema', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: form.host.trim(),
      port: form.port,
      user: form.user,
      password: form.password,
      database: form.dbName.trim(),
      table: tableName.trim(),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    message?: string;
    columns?: MysqlColumnSchema[];
  };
  if (!res.ok || data.ok === false || !Array.isArray(data.columns)) {
    return { ok: false, message: data.message ?? 'Failed to load table schema.' };
  }
  return { ok: true, columns: data.columns };
}

async function fetchMysqlForeignKeys(
  form: ConnectionFormState,
  tableName: string,
): Promise<
  { ok: true; foreignKeys: MysqlForeignKeyRow[] } | { ok: false; message: string }
> {
  const res = await fetch('/api/table-foreign-keys', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      host: form.host.trim(),
      port: form.port,
      user: form.user,
      password: form.password,
      database: form.dbName.trim(),
      table: tableName.trim(),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    message?: string;
    foreignKeys?: MysqlForeignKeyRow[];
  };
  if (!res.ok || data.ok === false || !Array.isArray(data.foreignKeys)) {
    return {ok: false, message: data.message ?? 'Failed to load foreign keys.'};
  }
  return {ok: true, foreignKeys: data.foreignKeys};
}

/** Ensures each job that has FKs to other target tables runs after a job that populates those tables. */
async function validateTransferJobOrder(
  destB: ConnectionFormState,
  jobs: MappingPlan[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  const fkCache = new Map<string, MysqlForeignKeyRow[]>();
  for (let ji = 0; ji < jobs.length; ji++) {
    const t = jobs[ji].targetTable;
    let fks = fkCache.get(t);
    if (fks === undefined) {
      const r = await fetchMysqlForeignKeys(destB, t);
      if (!r.ok) {
        fkCache.set(t, []);
        continue;
      }
      fks = r.foreignKeys;
      fkCache.set(t, fks);
    }
    const childJob = jobs[ji];
    const targetLower = t.toLowerCase();
    for (const fk of fks) {
      const ref = fk.referencedTable.toLowerCase();
      // Same-table FK (e.g. users.parentId → users.id): one job fills the table; no separate "parent" job.
      if (ref === targetLower) {
        continue;
      }
      const parentJob = jobs.slice(0, ji).find((j) => j.targetTable.toLowerCase() === ref);
      if (!parentJob) {
        return {
          ok: false,
          message: `Job order (foreign key): target "${t}" column "${fk.columnName}" references "${fk.referencedTable}.${fk.referencedColumn}". Put a job that targets "${fk.referencedTable}" before job ${ji + 1}. Map "${fk.columnName}" from the same source row key as the parent (e.g. source id → FK column).`,
        };
      }

      // If child FK is mapped from a source column, require parent referenced column to be populated from the SAME source column.
      // This avoids mismatched auto-generated IDs (child points at a source id that doesn't exist on target).
      const childBind = childJob.columnBindings[fk.columnName];
      if (childBind?.kind === 'source') {
        const parentBind = parentJob.columnBindings[fk.referencedColumn];
        if (!parentBind || parentBind.kind !== 'source' || parentBind.sourceColumn !== childBind.sourceColumn) {
          return {
            ok: false,
            message:
              `Foreign key mapping mismatch: "${t}.${fk.columnName}" references "${fk.referencedTable}.${fk.referencedColumn}". ` +
              `You mapped the child FK from source "${childBind.sourceColumn}", but the parent job does not map ` +
              `"${fk.referencedColumn}" from that same source column. ` +
              `To keep userId accurate, either (A) map target "${fk.referencedTable}.${fk.referencedColumn}" from the same source column ` +
              `(preserve IDs), then map "${t}.${fk.columnName}" from that same source column; or (B) link via a stable unique key (e.g. email) — not enabled yet.`,
          };
        }
      }
    }
  }
  return {ok: true};
}

function formatSchemaDefault(value: string | null): string {
  if (value === null) return '—';
  const s = String(value);
  return s.length > 56 ? `${s.slice(0, 53)}…` : s;
}

function formatByteSize(bytes: number | null): string {
  if (bytes == null || Number.isNaN(bytes)) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u++;
  }
  const rounded = u === 0 ? Math.round(n) : n >= 10 ? Math.round(n) : Math.round(n * 10) / 10;
  return `${rounded} ${units[u]}`;
}

function formatRowEstimate(n: number | null): string {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toLocaleString();
}

async function postMysqlConnectionTest(
  form: ConnectionFormState,
): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  try {
    const res = await fetch('/api/test-db-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: form.host.trim(),
        port: form.port,
        user: form.user,
        password: form.password,
        database: form.dbName.trim(),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, message: data.message ?? 'Connection failed.' };
    }
    return { ok: true, message: data.message ?? 'Connection successful.' };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : 'Could not reach the test service.',
    };
  }
}

type MappedTransferJobResult = {
  sourceTable: string;
  targetTable: string;
  insertedRows: number;
  skippedRows?: number;
};

async function postMappedTransfer(
  sourceA: ConnectionFormState,
  destB: ConnectionFormState,
  jobs: MappingPlan[],
  opts?: { signal?: AbortSignal; onDuplicate?: 'error' | 'ignore' },
): Promise<
  | { ok: true; results: MappedTransferJobResult[] }
  | {
      ok: false;
      message: string;
      aborted?: boolean;
      failedJobIndex?: number;
      partialResults?: MappedTransferJobResult[];
    }
> {
  const signal = opts?.signal;
  const onDuplicate = opts?.onDuplicate === 'ignore' ? 'ignore' : 'error';
  try {
    const res = await fetch('/api/mapped-transfer', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        source: {
          host: sourceA.host.trim(),
          port: sourceA.port,
          user: sourceA.user,
          password: sourceA.password,
          database: sourceA.dbName.trim(),
        },
        destination: {
          host: destB.host.trim(),
          port: destB.port,
          user: destB.user,
          password: destB.password,
          database: destB.dbName.trim(),
        },
        jobs: jobs.map(({sourceTable, targetTable, columnBindings, rowFilter}) => ({
          sourceTable,
          targetTable,
          columnBindings,
          rowFilter,
        })),
        batchSize: 500,
        onDuplicate,
      }),
      signal,
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      message?: string;
      results?: MappedTransferJobResult[];
      failedJobIndex?: number;
      partialResults?: MappedTransferJobResult[];
    };
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        message: data.message ?? 'Transfer failed.',
        failedJobIndex: data.failedJobIndex,
        partialResults: data.partialResults,
      };
    }
    if (!Array.isArray(data.results)) {
      return {ok: false, message: 'Invalid server response (missing results).'};
    }
    return {ok: true, results: data.results};
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return {ok: false, message: 'Transfer was cancelled.'};
    }
    return {
      ok: false,
      message: e instanceof Error ? e.message : 'Could not reach the transfer service.',
    };
  }
}

type ConnectionStepProps = {
  sourceA: ConnectionFormState;
  setSourceA: React.Dispatch<React.SetStateAction<ConnectionFormState>>;
  destB: ConnectionFormState;
  setDestB: React.Dispatch<React.SetStateAction<ConnectionFormState>>;
};

function ConnectionStep({ sourceA, setSourceA, destB, setDestB }: ConnectionStepProps) {
  const [showPassA, setShowPassA] = useState(false);
  const [showPassB, setShowPassB] = useState(false);

  const [sourceATest, setSourceATest] = useState<ConnectionTestState>({ status: 'idle' });
  const [destBTest, setDestBTest] = useState<ConnectionTestState>({ status: 'idle' });

  const testSourceA = async () => {
    setSourceATest({ status: 'loading' });
    const r = await postMysqlConnectionTest(sourceA);
    if (r.ok) {
      setSourceATest({ status: 'ok', message: r.message });
    } else {
      setSourceATest({ status: 'err', message: r.message });
    }
  };

  const testDestB = async () => {
    setDestBTest({ status: 'loading' });
    const r = await postMysqlConnectionTest(destB);
    if (r.ok) {
      setDestBTest({ status: 'ok', message: r.message });
    } else {
      setDestBTest({ status: 'err', message: r.message });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Configure Connection</h2>
        <p className="text-slate-500 text-lg">Establish a secure link between your source and destination infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Source Card */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-primary">
              <UploadCloud size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Database Source (A)</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Origin Server</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Host Address</label>
                <input
                  type="text"
                  value={sourceA.host}
                  onChange={(e) => setSourceA((s) => ({ ...s, host: e.target.value }))}
                  placeholder="e.g. production-db.internal"
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Port</label>
                <input
                  type="text"
                  value={sourceA.port}
                  onChange={(e) => setSourceA((s) => ({ ...s, port: e.target.value }))}
                  placeholder="3306"
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Username</label>
              <input
                type="text"
                value={sourceA.user}
                onChange={(e) => setSourceA((s) => ({ ...s, user: e.target.value }))}
                placeholder="admin_user"
                className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Password</label>
              <div className="relative">
                <input
                  type={showPassA ? "text" : "password"}
                  value={sourceA.password}
                  onChange={(e) => setSourceA((s) => ({ ...s, password: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassA(!showPassA)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassA ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Database Name</label>
              <input
                type="text"
                value={sourceA.dbName}
                onChange={(e) => setSourceA((s) => ({ ...s, dbName: e.target.value }))}
                placeholder="primary_warehouse_v1"
                className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="pt-4 space-y-3">
              <button
                type="button"
                onClick={testSourceA}
                disabled={sourceATest.status === 'loading'}
                className="w-full flex items-center justify-center gap-2 border border-primary text-primary hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all rounded-lg py-3 text-sm font-bold"
              >
                <RefreshCw size={18} className={sourceATest.status === 'loading' ? 'animate-spin' : ''} />
                {sourceATest.status === 'loading' ? 'Testing…' : 'Test Connection'}
              </button>
              {sourceATest.status === 'ok' && (
                <p className="text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  {sourceATest.message}
                </p>
              )}
              {sourceATest.status === 'err' && (
                <p className="text-sm text-red-700 flex items-start gap-2">
                  <XCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{sourceATest.message}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Destination Card */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-primary">
              <DownloadCloud size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Database Destination (B)</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Target Environment</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Host Address</label>
                <input
                  type="text"
                  value={destB.host}
                  onChange={(e) => setDestB((s) => ({ ...s, host: e.target.value }))}
                  placeholder="e.g. azure-target.cloud"
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Port</label>
                <input
                  type="text"
                  value={destB.port}
                  onChange={(e) => setDestB((s) => ({ ...s, port: e.target.value }))}
                  placeholder="3306"
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Username</label>
              <input
                type="text"
                value={destB.user}
                onChange={(e) => setDestB((s) => ({ ...s, user: e.target.value }))}
                placeholder="migrator_svc"
                className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Password</label>
              <div className="relative">
                <input
                  type={showPassB ? "text" : "password"}
                  value={destB.password}
                  onChange={(e) => setDestB((s) => ({ ...s, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassB(!showPassB)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassB ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Database Name</label>
              <input
                type="text"
                value={destB.dbName}
                onChange={(e) => setDestB((s) => ({ ...s, dbName: e.target.value }))}
                placeholder="analytics_replica"
                className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="pt-4 space-y-3">
              <button
                type="button"
                onClick={testDestB}
                disabled={destBTest.status === 'loading'}
                className="w-full flex items-center justify-center gap-2 border border-primary text-primary hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all rounded-lg py-3 text-sm font-bold"
              >
                <RefreshCw size={18} className={destBTest.status === 'loading' ? 'animate-spin' : ''} />
                {destBTest.status === 'loading' ? 'Testing…' : 'Test Connection'}
              </button>
              {destBTest.status === 'ok' && (
                <p className="text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  {destBTest.message}
                </p>
              )}
              {destBTest.status === 'err' && (
                <p className="text-sm text-red-700 flex items-start gap-2">
                  <XCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{destBTest.message}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-100/50 p-6 rounded-xl flex gap-4 items-start border border-slate-200">
        <Info className="text-primary shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-bold text-slate-900">Security Protocol Active</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Ensure both databases are reachable from the DataBridge Pro cloud IP range (13.56.23.0/24) and that SSL/TLS 1.2+ is enabled on both instances for enterprise-grade encryption during transfer.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

type TableListingStepProps = {
  sourceA: ConnectionFormState;
  destB: ConnectionFormState;
  selectedSourceTables: Set<string>;
  setSelectedSourceTables: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedTargetTables: Set<string>;
  setSelectedTargetTables: React.Dispatch<React.SetStateAction<Set<string>>>;
};

function TableListingStep({
  sourceA,
  destB,
  selectedSourceTables,
  setSelectedSourceTables,
  selectedTargetTables,
  setSelectedTargetTables,
}: TableListingStepProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [sourceRows, setSourceRows] = useState<MysqlTableRow[]>([]);
  const [targetRows, setTargetRows] = useState<MysqlTableRow[]>([]);
  const [sourceErr, setSourceErr] = useState<string | null>(null);
  const [targetErr, setTargetErr] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState('');
  const [filterTarget, setFilterTarget] = useState('');

  const [schemaDialog, setSchemaDialog] = useState<null | {
    side: 'source' | 'target';
    form: ConnectionFormState;
    tableName: string;
  }>(null);

  type SchemaFetchState =
    | 'idle'
    | 'loading'
    | { error: string }
    | { columns: MysqlColumnSchema[] };

  const [schemaFetch, setSchemaFetch] = useState<SchemaFetchState>('idle');

  useEffect(() => {
    if (!schemaDialog) {
      setSchemaFetch('idle');
      return;
    }
    setSchemaFetch('loading');
    let cancelled = false;
    fetchMysqlTableSchema(schemaDialog.form, schemaDialog.tableName).then((r) => {
      if (cancelled) return;
      if (r.ok === false) setSchemaFetch({ error: r.message });
      else setSchemaFetch({ columns: r.columns });
    });
    return () => {
      cancelled = true;
    };
  }, [schemaDialog]);

  useEffect(() => {
    if (!schemaDialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSchemaDialog(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [schemaDialog]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setSourceErr(null);
      setTargetErr(null);
      const [src, tgt] = await Promise.all([fetchMysqlTableList(sourceA), fetchMysqlTableList(destB)]);
      if (cancelled) return;
      setIsLoading(false);
      if (src.ok === false) {
        setSourceRows([]);
        setSourceErr(src.message);
      } else {
        setSourceRows(src.tables);
      }
      if (tgt.ok === false) {
        setTargetRows([]);
        setTargetErr(tgt.message);
      } else {
        setTargetRows(tgt.tables);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceA, destB]);

  const filterName = (q: string, name: string) => {
    if (!q.trim()) return true;
    return name.toLowerCase().includes(q.trim().toLowerCase());
  };

  const visibleSource = sourceRows.filter((t) => filterName(filterSource, t.name));
  const visibleTarget = targetRows.filter((t) => filterName(filterTarget, t.name));

  const toggleSource = (name: string) => {
    setSelectedSourceTables((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleTarget = (name: string) => {
    setSelectedTargetTables((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const targetHasSameName = (name: string) => sourceRows.some((s) => s.name === name);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Select Migration Entities</h2>
        <p className="text-slate-500 text-lg">
          Tables listed from each MySQL database (schema) you configured on the connection step:{' '}
          <span className="font-semibold text-slate-700">{sourceA.dbName}</span> →{' '}
          <span className="font-semibold text-slate-700">{destB.dbName}</span>.
        </p>
        {!isLoading && (!sourceErr || !targetErr) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {!sourceErr && (
              <p className="text-slate-600 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/8 border border-primary/15 px-3 py-1.5">
                  <Database className="text-primary" size={14} />
                  <span className="font-bold tabular-nums text-slate-900">{sourceRows.length}</span>
                  <span className="text-slate-600">
                    {sourceRows.length === 1 ? 'table' : 'tables'} in <span className="font-medium text-slate-800">{sourceA.dbName}</span>
                  </span>
                </span>
              </p>
            )}
            {!targetErr && (
              <p className="text-slate-600 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-1.5">
                  <RefreshCw className="text-emerald-700" size={14} />
                  <span className="font-bold tabular-nums text-slate-900">{targetRows.length}</span>
                  <span className="text-slate-600">
                    {targetRows.length === 1 ? 'table' : 'tables'} in <span className="font-medium text-slate-800">{destB.dbName}</span>
                  </span>
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
        {/* Source Column */}
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-0">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col gap-4 shrink-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <Database className="text-primary shrink-0" size={18} />
                <span className="font-bold text-slate-900 tracking-tight truncate" title={sourceA.dbName}>
                  Source: {sourceA.dbName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isLoading && !sourceErr && (
                  <span
                    className="text-xs font-bold tabular-nums text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm"
                    title="Base tables in this database"
                  >
                    {sourceRows.length} {sourceRows.length === 1 ? 'table' : 'tables'}
                  </span>
                )}
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">
                  MySQL
                </span>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                placeholder="Filter tables..."
                className="w-full bg-white border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {filterSource.trim() && !isLoading && !sourceErr && sourceRows.length > 0 && (
              <p className="text-[11px] text-slate-500 -mt-1">
                Showing <span className="font-semibold text-slate-700 tabular-nums">{visibleSource.length}</span> of{' '}
                <span className="tabular-nums">{sourceRows.length}</span>
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-12 text-slate-500 text-sm">
                <RefreshCw className="animate-spin" size={18} />
                Loading tables…
              </div>
            )}
            {!isLoading && sourceErr && (
              <p className="text-sm text-red-700 px-3 py-2">{sourceErr}</p>
            )}
            {!isLoading && !sourceErr && visibleSource.length === 0 && (
              <p className="text-sm text-slate-500 px-3 py-6 text-center">No tables in this schema.</p>
            )}
            {!isLoading &&
              !sourceErr &&
              visibleSource.map((table) => {
                const selected = selectedSourceTables.has(table.name);
                return (
                  <div
                    key={`src-${table.schema}-${table.name}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${selected ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                  >
                    <button
                      type="button"
                      aria-label={selected ? 'Deselect table' : 'Select table'}
                      onClick={() => toggleSource(table.name)}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${selected ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'}`}
                    >
                      {selected && <Check size={12} strokeWidth={4} />}
                    </button>
                    <button
                      type="button"
                      title="View column types and keys"
                      onClick={() =>
                        setSchemaDialog({ side: 'source', form: sourceA, tableName: table.name })
                      }
                      className="flex flex-col flex-1 min-w-0 text-left rounded-lg -my-1 py-1 px-1 hover:bg-slate-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <span className={`text-sm font-semibold truncate ${selected ? 'text-slate-900' : 'text-slate-600'}`}>
                        {table.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatByteSize(table.sizeBytes)} • {formatRowEstimate(table.rows)} rows
                      </span>
                    </button>
                    {selected && <CheckCircle2 className="text-primary shrink-0" size={16} fill="currentColor" />}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Target Column */}
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-0">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col gap-4 shrink-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <RefreshCw className="text-tertiary shrink-0" size={18} />
                <span className="font-bold text-slate-900 tracking-tight truncate" title={destB.dbName}>
                  Target: {destB.dbName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isLoading && !targetErr && (
                  <span
                    className="text-xs font-bold tabular-nums text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm"
                    title="Base tables in this database"
                  >
                    {targetRows.length} {targetRows.length === 1 ? 'table' : 'tables'}
                  </span>
                )}
                <span className="text-[10px] bg-tertiary/10 text-tertiary px-2 py-0.5 rounded font-bold uppercase">
                  MySQL
                </span>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={filterTarget}
                onChange={(e) => setFilterTarget(e.target.value)}
                placeholder="Search target tables..."
                className="w-full bg-white border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-tertiary/20"
              />
            </div>
            {filterTarget.trim() && !isLoading && !targetErr && targetRows.length > 0 && (
              <p className="text-[11px] text-slate-500 -mt-1">
                Showing <span className="font-semibold text-slate-700 tabular-nums">{visibleTarget.length}</span> of{' '}
                <span className="tabular-nums">{targetRows.length}</span>
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-12 text-slate-500 text-sm">
                <RefreshCw className="animate-spin" size={18} />
                Loading tables…
              </div>
            )}
            {!isLoading && targetErr && (
              <p className="text-sm text-red-700 px-3 py-2">{targetErr}</p>
            )}
            {!isLoading && !targetErr && visibleTarget.length === 0 && (
              <p className="text-sm text-slate-500 px-3 py-6 text-center">No tables in this schema.</p>
            )}
            {!isLoading &&
              !targetErr &&
              visibleTarget.map((table) => {
                const selected = selectedTargetTables.has(table.name);
                const existsOnSource = targetHasSameName(table.name);
                return (
                  <div
                    key={`tgt-${table.schema}-${table.name}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${existsOnSource ? 'opacity-90' : ''} ${selected ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                  >
                    <button
                      type="button"
                      aria-label={selected ? 'Deselect table' : 'Select table'}
                      onClick={() => toggleTarget(table.name)}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${selected ? 'bg-tertiary border-tertiary text-white' : 'border-slate-300 bg-white'}`}
                    >
                      {selected && <Check size={12} strokeWidth={4} />}
                    </button>
                    <button
                      type="button"
                      title="View column types and keys"
                      onClick={() =>
                        setSchemaDialog({ side: 'target', form: destB, tableName: table.name })
                      }
                      className="flex flex-col flex-1 min-w-0 text-left rounded-lg -my-1 py-1 px-1 hover:bg-slate-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/30"
                    >
                      <span className="text-sm font-semibold text-slate-900 truncate">{table.name}</span>
                      <span className="text-[10px] text-slate-400">
                        Schema: {table.schema} • {formatRowEstimate(table.rows)} rows • {formatByteSize(table.sizeBytes)}
                        {existsOnSource ? ' • also on source' : ''}
                      </span>
                    </button>
                    {existsOnSource ? <Lock size={14} className="text-slate-400 shrink-0" /> : <RefreshCw size={14} className="text-tertiary shrink-0" />}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {schemaDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="table-schema-dialog-title"
          onClick={() => setSchemaDialog(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[min(90vh,900px)] flex flex-col border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Columns className="text-primary shrink-0" size={20} />
                  <h3 id="table-schema-dialog-title" className="text-lg font-bold text-slate-900">
                    Table schema
                  </h3>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${schemaDialog.side === 'source' ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-800'}`}
                  >
                    {schemaDialog.side === 'source' ? 'Source' : 'Target'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2 font-mono break-all">
                  {schemaDialog.form.dbName}.{schemaDialog.tableName}
                </p>
              </div>
              <button
                type="button"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                aria-label="Close"
                onClick={() => setSchemaDialog(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              {schemaFetch === 'loading' && (
                <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm">
                  <RefreshCw className="animate-spin" size={20} />
                  Loading columns…
                </div>
              )}
              {schemaFetch !== 'loading' && schemaFetch !== 'idle' && 'error' in schemaFetch && (
                <p className="p-6 text-sm text-red-700">{schemaFetch.error}</p>
              )}
              {schemaFetch !== 'loading' &&
                schemaFetch !== 'idle' &&
                'columns' in schemaFetch &&
                schemaFetch.columns.length === 0 && (
                  <p className="p-6 text-sm text-slate-500">No columns found for this table.</p>
                )}
              {schemaFetch !== 'loading' &&
                schemaFetch !== 'idle' &&
                'columns' in schemaFetch &&
                schemaFetch.columns.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                          <th className="px-4 py-3 font-bold whitespace-nowrap">#</th>
                          <th className="px-4 py-3 font-bold whitespace-nowrap">Column</th>
                          <th className="px-4 py-3 font-bold whitespace-nowrap">Type</th>
                          <th className="px-4 py-3 font-bold whitespace-nowrap">Null</th>
                          <th className="px-4 py-3 font-bold whitespace-nowrap">Key</th>
                          <th className="px-4 py-3 font-bold whitespace-nowrap">Default</th>
                          <th className="px-4 py-3 font-bold whitespace-nowrap">Extra</th>
                          <th className="px-4 py-3 font-bold whitespace-nowrap min-w-[100px]">Comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schemaFetch.columns.map((col) => (
                          <tr
                            key={`${col.ordinal}-${col.columnName}`}
                            className="border-b border-slate-100 hover:bg-slate-50/90"
                          >
                            <td className="px-4 py-2.5 text-slate-400 tabular-nums align-top">{col.ordinal}</td>
                            <td className="px-4 py-2.5 font-semibold text-slate-900 align-top">{col.columnName}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-slate-800 align-top whitespace-nowrap">
                              {col.columnType}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 align-top whitespace-nowrap">
                              {col.isNullable === 'YES' ? 'Yes' : 'No'}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-slate-700 align-top whitespace-nowrap">
                              {col.columnKey || '—'}
                            </td>
                            <td
                              className="px-4 py-2.5 font-mono text-xs text-slate-600 align-top max-w-[200px]"
                              title={col.columnDefault ?? undefined}
                            >
                              {formatSchemaDefault(col.columnDefault)}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-slate-600 align-top whitespace-nowrap">
                              {col.extra || '—'}
                            </td>
                            <td
                              className="px-4 py-2.5 text-xs text-slate-500 align-top max-w-[180px] truncate"
                              title={col.columnComment || undefined}
                            >
                              {col.columnComment || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

const SOURCE_COLUMN_DRAG_TYPE = 'application/x-datbridge-source-column';

function mappingMatchScore(s: MysqlColumnSchema, t: MysqlColumnSchema): number {
  const a = s.columnType.toLowerCase();
  const b = t.columnType.toLowerCase();
  if (a === b) return 100;
  if (s.dataType.toLowerCase() === t.dataType.toLowerCase()) return 85;
  const baseA = a.split('(')[0];
  const baseB = b.split('(')[0];
  if (baseA === baseB) return 72;
  return 0;
}

type MappingStepProps = {
  sourceA: ConnectionFormState;
  destB: ConnectionFormState;
  selectedSourceTables: Set<string>;
  selectedTargetTables: Set<string>;
  onMappingSnapshotChange: (snap: MappingPlan) => void;
  mappingQueue: QueuedMappingPlan[];
  onAddToQueue: (plan: MappingPlan) => void;
  onMoveQueueItem: (id: string, dir: -1 | 1) => void;
  onRemoveFromQueue: (id: string) => void;
};

function MappingStep({
  sourceA,
  destB,
  selectedSourceTables,
  selectedTargetTables,
  onMappingSnapshotChange,
  mappingQueue,
  onAddToQueue,
  onMoveQueueItem,
  onRemoveFromQueue,
}: MappingStepProps) {
  const sourceOptions = useMemo(() => [...selectedSourceTables], [selectedSourceTables]);
  const targetOptions = useMemo(() => [...selectedTargetTables], [selectedTargetTables]);

  const [pickSource, setPickSource] = useState('');
  const [pickTarget, setPickTarget] = useState('');

  useEffect(() => {
    if (sourceOptions.length === 0) {
      setPickSource('');
      return;
    }
    setPickSource((p) => (p && sourceOptions.includes(p) ? p : sourceOptions[0]));
  }, [sourceOptions]);

  useEffect(() => {
    if (targetOptions.length === 0) {
      setPickTarget('');
      return;
    }
    setPickTarget((p) => (p && targetOptions.includes(p) ? p : targetOptions[0]));
  }, [targetOptions]);

  const sourceTableName = pickSource || null;
  const targetTableName = pickTarget || null;

  const [srcCols, setSrcCols] = useState<MysqlColumnSchema[]>([]);
  const [tgtCols, setTgtCols] = useState<MysqlColumnSchema[]>([]);
  const [colsLoading, setColsLoading] = useState(false);
  const [colsErr, setColsErr] = useState<string | null>(null);
  const [targetBindings, setTargetBindings] = useState<Record<string, ColumnBinding>>({});
  const [fixedDraft, setFixedDraft] = useState<Record<string, string>>({});
  const [requireSourceNonEmpty, setRequireSourceNonEmpty] = useState<string>('');
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [targetFks, setTargetFks] = useState<MysqlForeignKeyRow[]>([]);

  useEffect(() => {
    if (!targetTableName) {
      setTargetFks([]);
      return;
    }
    let cancelled = false;
    fetchMysqlForeignKeys(destB, targetTableName).then((r) => {
      if (cancelled) return;
      setTargetFks(r.ok ? r.foreignKeys : []);
    });
    return () => {
      cancelled = true;
    };
  }, [destB, targetTableName]);

  useEffect(() => {
    if (!sourceTableName || !targetTableName) {
      setSrcCols([]);
      setTgtCols([]);
      setTargetBindings({});
      setFixedDraft({});
      setRequireSourceNonEmpty('');
      return;
    }
    let cancelled = false;
    setColsLoading(true);
    setColsErr(null);
    Promise.all([
      fetchMysqlTableSchema(sourceA, sourceTableName),
      fetchMysqlTableSchema(destB, targetTableName),
    ]).then(([src, tgt]) => {
      if (cancelled) return;
      setColsLoading(false);
      if (src.ok === false && tgt.ok === false) {
        setColsErr(`${src.message} · ${tgt.message}`);
        setSrcCols([]);
        setTgtCols([]);
      } else if (src.ok === false) {
        setColsErr(src.message);
        setSrcCols([]);
        setTgtCols(tgt.ok ? tgt.columns : []);
      } else if (tgt.ok === false) {
        setColsErr(tgt.message);
        setSrcCols(src.columns);
        setTgtCols([]);
      } else {
        setColsErr(null);
        setSrcCols(src.columns);
        setTgtCols(tgt.columns);
      }
      setTargetBindings({});
      setFixedDraft({});
      setRequireSourceNonEmpty('');
    });
    return () => {
      cancelled = true;
    };
  }, [sourceA, destB, sourceTableName, targetTableName]);

  const sourceByName = useMemo(() => {
    const m = new Map<string, MysqlColumnSchema>();
    for (const c of srcCols) m.set(c.columnName, c);
    return m;
  }, [srcCols]);

  const mappedSources = useMemo(() => {
    const s = new Set<string>();
    for (const b of Object.values(targetBindings) as ColumnBinding[]) {
      if (b.kind === 'source') s.add(b.sourceColumn);
    }
    return s;
  }, [targetBindings]);
  const mappedCount = Object.keys(targetBindings).length;
  const unmappedTargetCount = tgtCols.length - mappedCount;

  const autoSuggest = () => {
    const used = new Set<string>();
    const next: Record<string, ColumnBinding> = {};
    for (const t of tgtCols) {
      const exact = srcCols.find(
        (s) =>
          s.columnName.toLowerCase() === t.columnName.toLowerCase() && !used.has(s.columnName),
      );
      if (exact) {
        next[t.columnName] = { kind: 'source', sourceColumn: exact.columnName };
        used.add(exact.columnName);
      }
    }
    for (const t of tgtCols) {
      if (next[t.columnName]) continue;
      let best: MysqlColumnSchema | null = null;
      let bestScore = 0;
      for (const s of srcCols) {
        if (used.has(s.columnName)) continue;
        const sc = mappingMatchScore(s, t);
        if (sc > bestScore) {
          bestScore = sc;
          best = s;
        }
      }
      if (best && bestScore >= 70) {
        next[t.columnName] = { kind: 'source', sourceColumn: best.columnName };
        used.add(best.columnName);
      }
    }
    setTargetBindings(next);
  };

  const onDragStartSource = (e: React.DragEvent, columnName: string) => {
    e.dataTransfer.setData(SOURCE_COLUMN_DRAG_TYPE, columnName);
    e.dataTransfer.setData('text/plain', columnName);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onDropTarget = (targetCol: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTarget(null);
    const sourceCol =
      e.dataTransfer.getData(SOURCE_COLUMN_DRAG_TYPE) ||
      e.dataTransfer.getData('text/plain');
    if (!sourceCol || !sourceByName.has(sourceCol)) return;
    setTargetBindings((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        const b = next[k];
        if (b.kind === 'source' && b.sourceColumn === sourceCol) delete next[k];
      }
      next[targetCol] = { kind: 'source', sourceColumn: sourceCol };
      return next;
    });
    setFixedDraft((d) => {
      const next = { ...d };
      delete next[targetCol];
      return next;
    });
  };

  const clearMapping = (targetCol: string) => {
    setTargetBindings((prev) => {
      const next = { ...prev };
      delete next[targetCol];
      return next;
    });
    setFixedDraft((d) => {
      const next = { ...d };
      delete next[targetCol];
      return next;
    });
  };

  const applyLiteral = (targetCol: string, value: string | null) => {
    setTargetBindings((prev) => ({
      ...prev,
      [targetCol]: { kind: 'literal', value },
    }));
  };

  const applyFixedDraft = (targetCol: string) => {
    const raw = fixedDraft[targetCol];
    const s = raw !== undefined ? raw.trim() : '';
    applyLiteral(targetCol, s === '' ? null : s);
    setFixedDraft((d) => {
      const next = {...d};
      delete next[targetCol];
      return next;
    });
  };

  const fixedInputValue = (targetCol: string): string => {
    if (fixedDraft[targetCol] !== undefined) return fixedDraft[targetCol];
    const b = targetBindings[targetCol];
    if (b?.kind === 'literal') return b.value === null ? '' : b.value;
    return '';
  };

  useEffect(() => {
    onMappingSnapshotChange({
      sourceTable: pickSource,
      targetTable: pickTarget,
      columnBindings: { ...targetBindings },
      rowFilter: requireSourceNonEmpty.trim()
        ? { requireSourceNonEmpty: requireSourceNonEmpty.trim() }
        : undefined,
    });
  }, [pickSource, pickTarget, targetBindings, requireSourceNonEmpty, onMappingSnapshotChange]);

  if (sourceOptions.length === 0 || targetOptions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        className="space-y-6"
      >
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Column mapping</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-900 text-sm">
          <p className="font-bold mb-2">Select tables first</p>
          <p className="text-amber-800/90">
            Go back to <strong>Table Listing</strong>, select at least one table on the source side and one on the
            target side, then open this step again.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="space-y-8"
    >
      {mappingQueue.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Transfer queue (execution order)
          </p>
          <ol className="space-y-2">
            {mappingQueue.map((item, idx) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2 text-sm"
              >
                <span className="text-slate-400 font-bold w-6 shrink-0">{idx + 1}.</span>
                <span className="font-mono text-xs min-w-0 flex-1 truncate">
                  {item.sourceTable} → {item.targetTable}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={idx === 0}
                    onClick={() => onMoveQueueItem(item.id, -1)}
                    className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={idx === mappingQueue.length - 1}
                    onClick={() => onMoveQueueItem(item.id, 1)}
                    className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFromQueue(item.id)}
                    className="text-[10px] font-bold uppercase text-red-600 hover:text-red-800 px-2"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-xs text-slate-500">
            Put parent tables first (for example <code className="font-mono bg-slate-100 px-1 rounded">users</code> before{' '}
            <code className="font-mono bg-slate-100 px-1 rounded">shipping_details</code>) so foreign keys resolve.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end">
        <div className="min-w-0">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            Mapping:{' '}
            <span className="text-primary font-mono text-2xl">{sourceTableName ?? '—'}</span>
            <span className="text-slate-400 mx-2">→</span>
            <span className="text-primary font-mono text-2xl">{targetTableName ?? '—'}</span>
          </h2>
          <p className="text-slate-500 text-sm flex items-center gap-2 flex-wrap">
            <Info size={16} className="shrink-0" />
            {colsLoading ? (
              <span>Loading column definitions…</span>
            ) : (
              <span>
                Drag a source column onto a target, or set a <strong>fixed value</strong> for mandatory target-only
                fields.{' '}
                <span className="font-semibold text-slate-700">
                  {unmappedTargetCount} of {tgtCols.length} target columns still unset
                </span>
                .
              </span>
            )}
          </p>
          {(sourceOptions.length > 1 || targetOptions.length > 1) && (
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              {sourceOptions.length > 1 && (
                <label className="flex items-center gap-2 text-slate-600">
                  <span className="font-bold text-slate-500 text-xs uppercase tracking-wide">Source table</span>
                  <select
                    value={pickSource}
                    onChange={(e) => setPickSource(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-mono text-sm max-w-[220px]"
                  >
                    {sourceOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {targetOptions.length > 1 && (
                <label className="flex items-center gap-2 text-slate-600">
                  <span className="font-bold text-slate-500 text-xs uppercase tracking-wide">Target table</span>
                  <select
                    value={pickTarget}
                    onChange={(e) => setPickTarget(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-mono text-sm max-w-[220px]"
                  >
                    {targetOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}

          {!colsLoading && srcCols.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <span className="font-bold text-slate-500 text-xs uppercase tracking-wide">
                  Insert row only if
                </span>
                <select
                  value={requireSourceNonEmpty}
                  onChange={(e) => setRequireSourceNonEmpty(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-mono text-sm max-w-[260px]"
                >
                  <option value="">(no filter)</option>
                  {srcCols.map((c) => (
                    <option key={c.columnName} value={c.columnName}>
                      {c.columnName}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-slate-500 max-w-xl">
                Use this for child tables like <strong>shipper_details</strong>: set it to
                <code className="mx-1 bg-white px-1 rounded font-mono">pickup_address</code> or
                <code className="mx-1 bg-white px-1 rounded font-mono">return_address</code> so we don’t insert empty rows.
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              onAddToQueue({
                sourceTable: pickSource,
                targetTable: pickTarget,
                columnBindings: {...targetBindings},
                rowFilter: requireSourceNonEmpty.trim()
                  ? {requireSourceNonEmpty: requireSourceNonEmpty.trim()}
                  : undefined,
              })
            }
            disabled={
              colsLoading ||
              !pickSource ||
              !pickTarget ||
              Object.keys(targetBindings).length === 0
            }
            className="flex items-center justify-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-40"
          >
            <Plus size={18} />
            Add to transfer queue
          </button>
          <button
            type="button"
            onClick={autoSuggest}
            disabled={colsLoading || srcCols.length === 0 || tgtCols.length === 0}
            className="flex items-center justify-center gap-2 border border-primary text-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-40"
          >
            <RefreshCw size={18} />
            Auto-Suggest Mapping
          </button>
        </div>
      </div>

      {mappingQueue.length > 0 && (
        <p className="text-xs text-slate-600 -mt-4">
          <strong className="text-slate-800">{mappingQueue.length}</strong> job
          {mappingQueue.length === 1 ? '' : 's'} in queue — same source table can feed several target tables; order
          matters for foreign keys.
        </p>
      )}

      {colsErr && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{colsErr}</p>
      )}

      {targetFks.length > 0 && !colsLoading && targetTableName && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-4 text-sm text-sky-950 space-y-2">
          <p className="font-bold flex items-center gap-2">
            <Link2 size={16} className="shrink-0 text-sky-700" />
            Foreign keys on target &quot;{targetTableName}&quot;
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sky-900 text-xs">
            {targetFks.map((fk) => {
              const isSelfRef =
                targetTableName &&
                fk.referencedTable.toLowerCase() === targetTableName.toLowerCase();
              const parentIdx = mappingQueue.findIndex(
                (q) => q.targetTable.toLowerCase() === fk.referencedTable.toLowerCase(),
              );
              return (
                <li key={`${fk.columnName}-${fk.referencedTable}`}>
                  <code className="font-mono bg-white/80 px-1 rounded">{fk.columnName}</code> →{' '}
                  <code className="font-mono bg-white/80 px-1 rounded">
                    {fk.referencedTable}.{fk.referencedColumn}
                  </code>
                  {isSelfRef ? (
                    <span className="text-slate-600 ml-1">
                      (same table — map <code className="font-mono bg-white/80 px-1 rounded">{fk.columnName}</code> from
                      source; no extra job)
                    </span>
                  ) : parentIdx >= 0 ? (
                    <span className="text-emerald-700 ml-1">
                      (referenced table is job #{parentIdx + 1} in queue — keep that job before this one)
                    </span>
                  ) : (
                    <span className="text-amber-800 ml-1">
                      — queue a job targeting &quot;{fk.referencedTable}&quot; <em>before</em> this table
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-sky-800 leading-relaxed">
            Map <code className="font-mono bg-white/80 px-1 rounded">user_id</code> (or the FK column) from the same
            source field you use as the parent key — for example drag source <code className="font-mono bg-white/80 px-1 rounded">id</code> onto{' '}
            <code className="font-mono bg-white/80 px-1 rounded">user_id</code> so each child row matches the correct parent
            row when IDs match between source and target.
          </p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 lg:gap-8 min-h-[560px]">
        <div className="col-span-12 lg:col-span-3 space-y-4 min-h-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Source columns</h3>
            <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums">
              {colsLoading ? '…' : srcCols.length} total
            </span>
          </div>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {colsLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-sm py-8 justify-center">
                <RefreshCw className="animate-spin" size={18} />
                Loading…
              </div>
            )}
            {!colsLoading &&
              srcCols.map((col) => {
                const mapped = mappedSources.has(col.columnName);
                const tgt = tgtCols.find((t) => {
                  const b = targetBindings[t.columnName];
                  return b?.kind === 'source' && b.sourceColumn === col.columnName;
                });
                const matchHint =
                  targetTableName &&
                  tgtCols.find((t) => t.columnName.toLowerCase() === col.columnName.toLowerCase());
                const strongMatch = !!matchHint;
                return (
                  <div
                    key={col.columnName}
                    draggable
                    onDragStart={(e) => onDragStartSource(e, col.columnName)}
                    className={`p-3 rounded-xl border shadow-sm flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-all select-none ${strongMatch && !mapped
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : mapped
                          ? 'border-slate-200 bg-slate-50/80'
                          : 'border-slate-200 bg-white hover:border-primary/30'
                      }`}
                  >
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${mapped ? 'text-slate-600' : 'text-slate-900'}`}>
                        {col.columnName}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 truncate">{col.columnType}</p>
                      {mapped && tgt && (
                        <p className="text-[9px] font-bold text-primary mt-1">→ {tgt.columnName}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {strongMatch && !mapped && (
                        <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                          name match
                        </span>
                      )}
                      {mapped && <CheckCircle2 size={14} className="text-emerald-500" />}
                      <GripVertical size={16} className="text-slate-300" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 relative overflow-hidden flex flex-col p-6 min-h-[280px] lg:min-h-0">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#00488d 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative z-10 flex flex-col flex-1 min-h-0">
            <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Active mappings
            </p>
            {mappedCount === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <Link2 className="text-slate-300 mb-3" size={36} />
                <p className="text-sm text-slate-500 font-medium">No mappings yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Drag a source column to a target, or type a fixed value on the right.
                </p>
              </div>
            ) : (
              <ul className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-[420px]">
                {(Object.entries(targetBindings) as [string, ColumnBinding][]).map(([targetCol, b]) => (
                  <li
                    key={targetCol}
                    className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm"
                  >
                    <span className="font-mono text-xs text-slate-600 truncate min-w-0">
                      {b.kind === 'source' ? (
                        b.sourceColumn
                      ) : b.value === null ? (
                        <em className="text-amber-700">NULL</em>
                      ) : (
                        <span className="text-violet-700">&quot;{b.value}&quot;</span>
                      )}
                    </span>
                    <ArrowRight size={14} className="text-primary shrink-0" />
                    <span className="font-mono text-xs font-bold text-slate-900 truncate">{targetCol}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <MousePointer2 size={14} />
              Drop targets on the right
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-4 min-h-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Destination targets</h3>
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums">
              {colsLoading ? '…' : tgtCols.length} targets
            </span>
          </div>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {colsLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-sm py-8 justify-center">
                <RefreshCw className="animate-spin" size={18} />
                Loading…
              </div>
            )}
            {!colsLoading &&
              tgtCols.map((tcol) => {
                const b = targetBindings[tcol.columnName];
                const hasBinding = Boolean(b);
                const isSource = b?.kind === 'source';
                const isLiteral = b?.kind === 'literal';
                const isOver = dragOverTarget === tcol.columnName;
                return (
                  <div
                    key={tcol.columnName}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                      setDragOverTarget(tcol.columnName);
                    }}
                    onDragLeave={() => setDragOverTarget((d) => (d === tcol.columnName ? null : d))}
                    onDrop={(e) => onDropTarget(tcol.columnName, e)}
                    className={`rounded-xl border-2 transition-all ${
                      hasBinding
                        ? 'bg-primary/5 border-primary/35 p-3'
                        : `border-dashed ${isOver ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white hover:border-primary/50'} p-3`
                    }`}
                  >
                    <div className="flex items-center justify-between w-full gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{tcol.columnName}</p>
                      {hasBinding ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <Link2 size={14} className="text-primary" />
                          <button
                            type="button"
                            onClick={() => clearMapping(tcol.columnName)}
                            className="text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase px-1"
                            aria-label={`Clear mapping for ${tcol.columnName}`}
                          >
                            Clear
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 w-full text-left mb-2">{tcol.columnType}</p>
                    {isSource ? (
                      <div className="bg-white rounded-lg p-2 border border-primary/15 shadow-sm flex items-center gap-2 w-full mb-2">
                        <ChevronRight size={12} className="text-primary shrink-0" />
                        <span className="text-[10px] font-bold text-slate-700 truncate">
                          from source: <span className="font-mono">{b.sourceColumn}</span>
                        </span>
                      </div>
                    ) : isLiteral ? (
                      <div className="bg-violet-50 rounded-lg p-2 border border-violet-100 shadow-sm w-full mb-2">
                        <p className="text-[10px] font-bold text-violet-900">
                          fixed value:{' '}
                          {b.value === null ? (
                            <span className="font-mono text-amber-800">SQL NULL</span>
                          ) : (
                            <span className="font-mono">&quot;{b.value}&quot;</span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">
                        Drop source or set fixed value below
                      </p>
                    )}
                    <div className="w-full space-y-1.5 pt-1 border-t border-slate-200/80">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                        Custom value (same for every row)
                      </p>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          className="flex-1 min-w-0 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
                          placeholder="Empty + Apply = SQL NULL"
                          value={fixedInputValue(tcol.columnName)}
                          onChange={(e) =>
                            setFixedDraft((d) => ({ ...d, [tcol.columnName]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => applyFixedDraft(tcol.columnName)}
                          className="shrink-0 text-[10px] font-bold uppercase bg-slate-800 text-white px-2 py-1.5 rounded-lg hover:bg-slate-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

type TransferStepProps = {
  sourceA: ConnectionFormState;
  destB: ConnectionFormState;
  mappingSnapshot: MappingPlan;
  mappingQueue: QueuedMappingPlan[];
  onRemoveFromQueue: (id: string) => void;
  onMoveQueueItem: (id: string, dir: -1 | 1) => void;
  selectedSourceTables: Set<string>;
  selectedTargetTables: Set<string>;
};

function TransferStep({
  sourceA,
  destB,
  mappingSnapshot,
  mappingQueue,
  onRemoveFromQueue,
  onMoveQueueItem,
  selectedSourceTables,
  selectedTargetTables,
}: TransferStepProps) {
  type RunPhase = 'idle' | 'running' | 'completed' | 'aborted' | 'failed';
  const [phase, setPhase] = useState<RunPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<MappedTransferJobResult[] | null>(null);
  const [skipDuplicateKeys, setSkipDuplicateKeys] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const transferJobs = useMemo((): MappingPlan[] => {
    if (mappingQueue.length > 0) {
      return mappingQueue.map(({id: _id, ...rest}) => rest);
    }
    const {sourceTable, targetTable, columnBindings} = mappingSnapshot;
    if (sourceTable && targetTable && Object.keys(columnBindings).length > 0) {
      return [{sourceTable, targetTable, columnBindings}];
    }
    return [];
  }, [mappingQueue, mappingSnapshot]);

  const totalMappedLinks = useMemo(
    () => transferJobs.reduce((n, j) => n + Object.keys(j.columnBindings).length, 0),
    [transferJobs],
  );

  const canRun = transferJobs.length > 0;

  const appendLog = useCallback((level: string, msg: string) => {
    const t = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${t}] ${level}: ${msg}`]);
  }, []);

  const startMappedTransfer = useCallback(async () => {
    if (!canRun) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setLogs([]);
    setProgress(8);
    setPhase('running');
    setErrorDetail(null);
    setLastResults(null);

    appendLog(
      'INFO',
      `${transferJobs.length} job(s): ${sourceA.host}:${sourceA.port}/${sourceA.dbName} → ${destB.host}:${destB.port}/${destB.dbName}`,
    );
    transferJobs.forEach((job, i) => {
      appendLog(
        'INFO',
        `Job ${i + 1}: ${job.sourceTable} → ${job.targetTable} (${Object.keys(job.columnBindings).length} field(s))`,
      );
    });
    if (skipDuplicateKeys) {
      appendLog(
        'INFO',
        'Duplicate keys: using INSERT IGNORE — source rows that violate a UNIQUE index on the target are skipped.',
      );
    }

    const orderCheck = await validateTransferJobOrder(destB, transferJobs);
    if (orderCheck.ok === false) {
      setProgress(0);
      setPhase('failed');
      setErrorDetail(orderCheck.message);
      appendLog('ERROR', orderCheck.message);
      return;
    }

    const out = await postMappedTransfer(sourceA, destB, transferJobs, {
      signal,
      onDuplicate: skipDuplicateKeys ? 'ignore' : 'error',
    });

    if (out.ok === false) {
      if (out.aborted) {
        setPhase('aborted');
        setProgress(0);
        appendLog('WARN', out.message);
        return;
      }
      setProgress(0);
      setPhase('failed');
      setErrorDetail(out.message);
      appendLog('ERROR', out.message);
      if (out.partialResults && out.partialResults.length > 0) {
        appendLog(
          'WARN',
          `${out.partialResults.length} job(s) completed before failure; rows inserted: ${out.partialResults.map((r) => r.insertedRows).join(', ')}`,
        );
      }
      return;
    }

    setLastResults(out.results);
    setProgress(100);
    setPhase('completed');
    out.results.forEach((r, i) => {
      const skipPart =
        (r.skippedRows ?? 0) > 0 ? `, skipped ${(r.skippedRows ?? 0).toLocaleString()} duplicate key row(s)` : '';
      appendLog(
        'SUCCESS',
        `Job ${i + 1} done: inserted ${r.insertedRows.toLocaleString()} row(s) into ${r.targetTable} from ${r.sourceTable}${skipPart}.`,
      );
    });
  }, [appendLog, canRun, destB, skipDuplicateKeys, sourceA, transferJobs]);

  const abortTransfer = () => {
    if (phase === 'running') {
      abortRef.current?.abort();
      appendLog('WARN', 'Cancelling transfer request…');
    }
  };

  const statusLabel =
    phase === 'idle'
      ? 'Ready'
      : phase === 'running'
        ? 'Transferring…'
        : phase === 'completed'
          ? 'Completed'
          : phase === 'failed'
            ? 'Failed'
            : 'Aborted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {phase === 'completed' && lastResults && (
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed top-24 right-8 z-50 bg-white shadow-xl border-l-4 border-emerald-500 p-4 rounded-lg flex items-center gap-3 min-w-[300px] max-w-sm"
        >
          <CheckCircle2 className="text-emerald-500 shrink-0" size={22} />
          <div>
            <p className="text-sm font-bold text-slate-900">Transfer finished</p>
            <p className="text-xs text-slate-500">
              {lastResults
                .map((r) => {
                  const s =
                    (r.skippedRows ?? 0) > 0
                      ? `${r.insertedRows} in, ${r.skippedRows} skipped dupes → ${r.targetTable}`
                      : `${r.insertedRows} row(s) → ${r.targetTable}`;
                  return s;
                })
                .join(' · ')}
            </p>
          </div>
        </motion.div>
      )}

      {phase === 'failed' && errorDetail && (
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed top-24 right-8 z-50 bg-white shadow-xl border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3 min-w-[300px] max-w-md"
        >
          <XCircle className="text-red-500 shrink-0 mt-0.5" size={22} />
          <div>
            <p className="text-sm font-bold text-slate-900">Transfer failed</p>
            <p className="text-xs text-slate-600 mt-1 break-words">{errorDetail}</p>
          </div>
        </motion.div>
      )}

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Mapped data transfer</h2>
          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded">
            MySQL → MySQL
          </span>
        </div>
        <p className="text-slate-500 text-sm max-w-3xl">
          Rows are read from each <strong>source</strong> table and inserted into the matching <strong>target</strong>{' '}
          table using your column maps. If you added jobs to the queue on the mapping step, every queued job runs in
          order; otherwise the current single mapping is used.
        </p>
      </header>

      {!canRun && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-950 text-sm">
          <p className="font-bold flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            Nothing to transfer yet
          </p>
          <p className="mt-2 text-amber-900/90">
            Map columns on the <strong>Column Mapping</strong> step, then either click <strong>Add to transfer queue</strong>{' '}
            (for multiple targets) or go to Transfer — the current map is used automatically when the queue is empty.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Transfer jobs ({transferJobs.length})
        </h3>
        {mappingQueue.length > 0 && (
          <p className="text-xs text-slate-500">
            For <strong>users → shipper_details</strong> with pickup/return addresses, add <strong>two jobs</strong> targeting
            <code className="mx-1 bg-slate-100 px-1 rounded font-mono">shipper_details</code>:
            one with filter <code className="mx-1 bg-slate-100 px-1 rounded font-mono">pickup_address</code>, one with filter
            <code className="mx-1 bg-slate-100 px-1 rounded font-mono">return_address</code>, and map
            <code className="mx-1 bg-slate-100 px-1 rounded font-mono">user_id</code> from source <code className="mx-1 bg-slate-100 px-1 rounded font-mono">id</code>.
          </p>
        )}
        {mappingQueue.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {mappingQueue.map((q, idx) => (
              <li
                key={q.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2 min-w-0 font-mono text-xs">
                  <span className="text-slate-500 font-sans font-bold">#{idx + 1}</span>
                  <span className="truncate">{sourceA.dbName}.{q.sourceTable}</span>
                  <ArrowRight className="text-primary shrink-0" size={14} />
                  <span className="truncate text-emerald-800">{destB.dbName}.{q.targetTable}</span>
                  <span className="text-slate-500 font-sans">
                    ({Object.keys(q.columnBindings).length} field
                    {Object.keys(q.columnBindings).length === 1 ? '' : 's'})
                  </span>
                  {q.rowFilter?.requireSourceNonEmpty ? (
                    <span className="text-[10px] font-bold uppercase text-slate-500 bg-white/80 border border-slate-200 px-2 py-0.5 rounded">
                      if {q.rowFilter.requireSourceNonEmpty} not empty
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label="Move job up"
                    disabled={phase === 'running' || idx === 0}
                    onClick={() => onMoveQueueItem(q.id, -1)}
                    className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move job down"
                    disabled={phase === 'running' || idx === mappingQueue.length - 1}
                    onClick={() => onMoveQueueItem(q.id, 1)}
                    className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={phase === 'running'}
                    onClick={() => onRemoveFromQueue(q.id)}
                    className="text-[10px] font-bold uppercase text-red-600 hover:text-red-800 disabled:opacity-40 px-1"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 truncate max-w-full">
              {sourceA.dbName}.{mappingSnapshot.sourceTable || '—'}
            </span>
            <ArrowRight className="text-primary shrink-0" size={18} />
            <span className="font-mono text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-100 truncate max-w-full">
              {destB.dbName}.{mappingSnapshot.targetTable || '—'}
            </span>
            <span className="text-xs text-slate-500">(current mapping — queue is empty)</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 pt-1">
          <span className="bg-slate-50 px-2 py-1 rounded">
            Source tables selected: <strong className="text-slate-800">{selectedSourceTables.size}</strong>
          </span>
          <span className="bg-slate-50 px-2 py-1 rounded">
            Target tables selected: <strong className="text-slate-800">{selectedTargetTables.size}</strong>
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Connection: <span className="font-mono">{sourceA.host}:{sourceA.port}</span> →{' '}
          <span className="font-mono">{destB.host}:{destB.port}</span>
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Mapped column links</p>
            <p className="text-4xl font-black text-primary tabular-nums">{totalMappedLinks}</p>
            <p className="text-xs text-slate-500 mt-1">
              Across {transferJobs.length} job{transferJobs.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Progress</p>
            <p className="text-4xl font-black text-slate-900 tabular-nums">{Math.round(progress)}%</p>
            <p className="text-xs text-slate-500 mt-1">Pipeline fill for this run</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
              <p
                className={`text-lg font-bold ${phase === 'completed'
                    ? 'text-emerald-600'
                    : phase === 'failed'
                      ? 'text-red-600'
                      : phase === 'aborted'
                        ? 'text-amber-700'
                        : phase === 'running'
                          ? 'text-primary'
                          : 'text-slate-600'
                  }`}
              >
                {statusLabel}
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
              {phase === 'running' ? (
                <RefreshCw className="text-primary animate-spin" size={22} />
              ) : phase === 'completed' ? (
                <CheckCircle2 className="text-emerald-500" size={22} />
              ) : phase === 'failed' ? (
                <XCircle className="text-red-500" size={22} />
              ) : phase === 'aborted' ? (
                <Pause className="text-amber-600" size={22} />
              ) : (
                <Activity className="text-slate-400" size={22} />
              )}
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300"
              checked={skipDuplicateKeys}
              disabled={phase === 'running'}
              onChange={(e) => setSkipDuplicateKeys(e.target.checked)}
            />
            <span>
              <span className="font-bold text-slate-900">Skip duplicate keys</span>
              <span className="block text-xs text-slate-500 mt-1">
                Uses INSERT IGNORE when a row would break a UNIQUE constraint (e.g. several source rows with the same
                name). Without this, the transfer stops on the first duplicate.
              </span>
            </span>
          </label>

          <button
            type="button"
            onClick={() => void startMappedTransfer()}
            disabled={!canRun || phase === 'running'}
            className="w-full primary-gradient text-white font-bold py-3 rounded-xl shadow-md hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
          >
            {phase === 'running'
              ? 'Transfer running…'
              : phase === 'completed' || phase === 'failed' || phase === 'aborted'
                ? 'Run transfer again'
                : 'Start mapped data transfer'}
          </button>
          {phase === 'idle' && canRun && (
            <p className="text-[11px] text-slate-500 text-center">
              Runs against the Vite dev server API (MySQL INSERT batches). Errors from the database appear in the log and
              status.
            </p>
          )}
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white p-6 lg:p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Transfer progress</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {transferJobs.length} job{transferJobs.length === 1 ? '' : 's'} ·{' '}
                  <strong>{totalMappedLinks}</strong> target→source column link
                  {totalMappedLinks === 1 ? '' : 's'} total.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  disabled={phase !== 'running'}
                  className="bg-slate-100 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition-all text-xs flex items-center gap-2 disabled:opacity-40"
                >
                  <Pause size={14} /> Pause
                </button>
                <button
                  type="button"
                  onClick={abortTransfer}
                  disabled={phase !== 'running'}
                  className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all text-xs flex items-center gap-2 shadow-md disabled:opacity-40"
                >
                  <XCircle size={14} /> Abort
                </button>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                <span>0%</span>
                <span className="text-primary text-sm normal-case">{Math.round(progress)}% completed</span>
                <span>100%</span>
              </div>
              <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                <motion.div
                  className={`h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.35)] ${phase === 'failed' ? 'bg-red-500' : 'bg-emerald-500'}`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Live log console
                </h4>
                <span className="text-[10px] font-mono text-slate-400">mapped transfer</span>
              </div>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-[11px] leading-relaxed min-h-[220px] max-h-72 overflow-y-auto shadow-inner border border-slate-800">
                {logs.length === 0 ? (
                  <p className="text-slate-600">
                    Logs appear when you start a transfer. They reference your databases, tables, and mapped columns.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((line, i) => (
                      <p
                        key={i}
                        className={`break-words ${line.includes('SUCCESS:')
                            ? 'text-emerald-400'
                            : line.includes('WARN:')
                              ? 'text-amber-400'
                              : 'text-sky-300'
                          }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Link2 size={16} className="text-primary" />
                Column map in this run
              </h4>
              <span className="text-[10px] font-bold text-slate-500">{totalMappedLinks} link(s)</span>
            </div>
            {totalMappedLinks === 0 ? (
              <p className="text-sm text-slate-500">No mappings — define them on the Column Mapping step.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white space-y-4 p-3">
                {transferJobs.map((job, ji) => (
                  <div key={`${job.sourceTable}-${job.targetTable}-${ji}`}>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Job {ji + 1}: {job.sourceTable} → {job.targetTable}
                    </p>
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 text-slate-500 uppercase tracking-wide">
                        <tr>
                          <th className="text-left px-3 py-2 font-bold">Value</th>
                          <th className="w-8" />
                          <th className="text-left px-3 py-2 font-bold">Target column</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Object.entries(job.columnBindings) as [string, ColumnBinding][]).map(
                          ([targetCol, bind]) => (
                          <tr key={`${ji}-${targetCol}`} className="border-t border-slate-100">
                            <td className="px-3 py-2 font-mono text-slate-700">
                              {bind.kind === 'source' ? (
                                bind.sourceColumn
                              ) : bind.value === null ? (
                                <span className="text-amber-800">NULL</span>
                              ) : (
                                <span className="text-violet-800">&quot;{bind.value}&quot;</span>
                              )}
                            </td>
                            <td className="text-center text-primary">
                              <ArrowRight size={12} className="inline" />
                            </td>
                            <td className="px-3 py-2 font-mono font-semibold text-slate-900">{targetCol}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <ShieldCheck className="text-emerald-600/80 mb-2" size={22} />
              <h4 className="text-sm font-bold text-slate-900">Mapping integrity</h4>
              <p className="text-xs text-slate-500 mt-1">
                Only columns you mapped (source or fixed value) are sent; other target columns rely on DB defaults or
                NULL.
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <Activity className="text-primary/80 mb-2" size={22} />
              <h4 className="text-sm font-bold text-slate-900">Next steps</h4>
              <p className="text-xs text-slate-500 mt-1">
                Production builds need the same <code className="bg-white px-1 rounded">POST /api/mapped-transfer</code>{' '}
                handler on your server, or another backend that performs the same batched INSERT logic.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
