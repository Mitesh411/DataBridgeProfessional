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
  ChevronRight,
  Lock,
  Link2,
  GripVertical,
  Activity,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export type Step = 'connection' | 'tables' | 'mapping' | 'transfer';

export interface ConnectionDetails {
  host: string;
  port: string;
  user: string;
  pass: string;
  dbName: string;
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

export interface ColumnMapping {
  source: string;
  target: string;
  type: string;
  match: number;
}

export const SOURCE_TABLES: TableItem[] = [
  { id: '1', name: 'users_main_v2', size: '42.8 GB', rows: '12,400,102', selected: true },
  { id: '2', name: 'order_transactions_historical', size: '1.2 TB', rows: '540M', selected: true },
  { id: '3', name: 'audit_logs_2023', size: '15.4 GB', rows: '2M', selected: false },
  { id: '4', name: 'product_catalog_staging', size: '450 MB', rows: '45,000', selected: false },
  { id: '5', name: 'marketing_campaigns_metadata', size: '2.1 GB', rows: '800k', selected: false },
  { id: '6', name: 'session_tracking_temp', size: '800 GB', rows: '200M', selected: false },
];

export const TARGET_TABLES: TableItem[] = [
  { id: 't1', name: 'RAW_USERS_SYNC', size: '', rows: '', selected: true, status: 'auto' },
  { id: 't2', name: 'HIST_TRANS_CONSOLIDATED', size: '', rows: '', selected: true, status: 'auto' },
  { id: 't3', name: 'LEGACY_VENDOR_DATA', size: '', rows: '', selected: false, status: 'locked' },
  { id: 't4', name: 'STG_MARKETING_METRICS', size: '', rows: '', selected: false, status: 'manual' },
];

export const COLUMN_MAPPINGS: ColumnMapping[] = [
  { source: 'transaction_id', target: 'ID_PRIMARY', type: 'VARCHAR(64)', match: 100 },
  { source: 'customer_email', target: 'USER_EMAIL', type: 'VARCHAR(255)', match: 98 },
  { source: 'amount_usd', target: 'NET_VALUE', type: 'DECIMAL(12,2)', match: 85 },
  { source: 'created_at', target: 'TX_DATE', type: 'TIMESTAMP', match: 92 },
];
