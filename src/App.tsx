/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  MousePointer2
} from 'lucide-react';
import { 
  Step, 
  SOURCE_TABLES, 
  TARGET_TABLES, 
  COLUMN_MAPPINGS 
} from './types';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('connection');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [connectionDetails, setConnectionDetails] = useState({
    source: { host: '', port: '', user: '', pass: '', dbName: '' },
    dest: { host: '', port: '', user: '', pass: '', dbName: '' },
  });

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'connection', label: 'Database Connection', icon: <Database size={20} /> },
    { id: 'tables', label: 'Table Listing', icon: <ListTodo size={20} /> },
    { id: 'mapping', label: 'Column Mapping', icon: <Columns size={20} /> },
    { id: 'transfer', label: 'Data Transfer', icon: <ArrowLeftRight size={20} /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 'transfer') return true;
    if (currentStep === 'connection') {
      return !connectionDetails.source.host || !connectionDetails.source.port || !connectionDetails.source.user || !connectionDetails.source.dbName ||
             !connectionDetails.dest.host || !connectionDetails.dest.port || !connectionDetails.dest.user || !connectionDetails.dest.dbName;
    }
    return false;
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentStep === step.id 
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
              <button className="text-slate-600 hover:text-primary transition-colors">Dashboard</button>
              <button className="text-primary border-b-2 border-primary pb-1">Projects</button>
              <button className="text-slate-600 hover:text-primary transition-colors">Logs</button>
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
                <ConnectionStep
                  key="connection"
                  details={connectionDetails}
                  setDetails={setConnectionDetails}
                />
              )}
              {currentStep === 'tables' && <TableListingStep key="tables" />}
              {currentStep === 'mapping' && <MappingStep key="mapping" />}
              {currentStep === 'transfer' && <TransferStep key="transfer" />}
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
                    style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-slate-700">
                  {((currentStepIndex + 1) / steps.length) * 100}%
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleNext}
              disabled={isNextDisabled()}
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

function ConnectionStep({ details, setDetails }: {
  key?: string,
  details: any,
  setDetails: React.Dispatch<React.SetStateAction<any>>
}) {
  const [showPassA, setShowPassA] = useState(false);
  const [showPassB, setShowPassB] = useState(false);

  const updateSource = (field: string, value: string) => {
    setDetails(prev => ({ ...prev, source: { ...prev.source, [field]: value } }));
  };

  const updateDest = (field: string, value: string) => {
    setDetails(prev => ({ ...prev, dest: { ...prev.dest, [field]: value } }));
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
                <label htmlFor="source-host" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Host Address</label>
                <input 
                  id="source-host"
                  type="text" 
                  placeholder="e.g. production-db.internal"
                  value={details.source.host}
                  onChange={(e) => updateSource('host', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label htmlFor="source-port" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Port</label>
                <input 
                  id="source-port"
                  type="text" 
                  placeholder="5432"
                  value={details.source.port}
                  onChange={(e) => updateSource('port', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label htmlFor="source-user" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Username</label>
              <input 
                id="source-user"
                type="text" 
                placeholder="admin_user"
                value={details.source.user}
                onChange={(e) => updateSource('user', e.target.value)}
                className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label htmlFor="source-pass" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Password</label>
              <div className="relative">
                <input 
                  id="source-pass"
                  type={showPassA ? "text" : "password"} 
                  placeholder="********"
                  value={details.source.pass}
                  onChange={(e) => updateSource('pass', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button 
                  onClick={() => setShowPassA(!showPassA)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  aria-label={showPassA ? "Hide password" : "Show password"}
                >
                  {showPassA ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="source-db" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Database Name</label>
              <input 
                id="source-db"
                type="text" 
                placeholder="primary_warehouse_v1"
                value={details.source.dbName}
                onChange={(e) => updateSource('dbName', e.target.value)}
                className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="pt-4">
              <button className="w-full flex items-center justify-center gap-2 border border-primary text-primary hover:bg-slate-50 transition-all rounded-lg py-3 text-sm font-bold">
                <RefreshCw size={18} />
                Test Connection
              </button>
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
                <label htmlFor="dest-host" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Host Address</label>
                <input 
                  id="dest-host"
                  type="text" 
                  placeholder="e.g. azure-target.cloud"
                  value={details.dest.host}
                  onChange={(e) => updateDest('host', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label htmlFor="dest-port" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Port</label>
                <input 
                  id="dest-port"
                  type="text" 
                  placeholder="3306"
                  value={details.dest.port}
                  onChange={(e) => updateDest('port', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label htmlFor="dest-user" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Username</label>
              <input 
                id="dest-user"
                type="text" 
                placeholder="migrator_svc"
                value={details.dest.user}
                onChange={(e) => updateDest('user', e.target.value)}
                className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label htmlFor="dest-pass" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Password</label>
              <div className="relative">
                <input 
                  id="dest-pass"
                  type={showPassB ? "text" : "password"} 
                  placeholder="••••••••"
                  value={details.dest.pass}
                  onChange={(e) => updateDest('pass', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button 
                  onClick={() => setShowPassB(!showPassB)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  aria-label={showPassB ? "Hide password" : "Show password"}
                >
                  {showPassB ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="dest-db" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-tighter">Database Name</label>
              <input 
                id="dest-db"
                type="text" 
                placeholder="analytics_replica"
                value={details.dest.dbName}
                onChange={(e) => updateDest('dbName', e.target.value)}
                className="w-full bg-slate-50 border-none rounded-lg text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="pt-4">
              <button className="w-full flex items-center justify-center gap-2 border border-primary text-primary hover:bg-slate-50 transition-all rounded-lg py-3 text-sm font-bold">
                <RefreshCw size={18} />
                Test Connection
              </button>
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

function TableListingStep() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Select Migration Entities</h2>
        <p className="text-slate-500 text-lg">Choose the tables from your source database that you want to replicate into the target environment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
        {/* Source Column */}
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="text-primary" size={18} />
                <span className="font-bold text-slate-900 tracking-tight">Source: Production_Cluster_A</span>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">PostgreSQL</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Filter tables..."
                className="w-full bg-white border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {SOURCE_TABLES.map(table => (
              <div 
                key={table.id}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group cursor-pointer ${table.selected ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${table.selected ? 'bg-primary border-primary text-white' : 'border-slate-300'}`}>
                  {table.selected && <Check size={12} strokeWidth={4} />}
                </div>
                <div className="flex flex-col flex-1">
                  <span className={`text-sm font-semibold ${table.selected ? 'text-slate-900' : 'text-slate-600'}`}>{table.name}</span>
                  <span className="text-[10px] text-slate-400">{table.size} • {table.rows} rows</span>
                </div>
                {table.selected && <CheckCircle2 className="text-primary" size={16} fill="currentColor" />}
              </div>
            ))}
          </div>
        </div>

        {/* Target Column */}
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="text-tertiary" size={18} />
                <span className="font-bold text-slate-900 tracking-tight">Target: Enterprise_Warehousing_v4</span>
              </div>
              <span className="text-[10px] bg-tertiary/10 text-tertiary px-2 py-0.5 rounded font-bold uppercase">Snowflake</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search target schema..."
                className="w-full bg-white border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-tertiary/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {TARGET_TABLES.map(table => (
              <div 
                key={table.id}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${table.status === 'locked' ? 'opacity-50' : 'hover:bg-slate-50'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${table.selected ? 'bg-tertiary border-tertiary text-white' : 'border-slate-300'}`}>
                  {table.selected && <Check size={12} strokeWidth={4} />}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-semibold text-slate-900">{table.name}</span>
                  <span className="text-[10px] text-slate-400 italic">
                    {table.status === 'locked' ? 'Table already exists in target' : table.status === 'auto' ? 'Schema: PUBLIC • Mapping: AUTO' : 'New Table Creation'}
                  </span>
                </div>
                {table.status === 'locked' ? <Lock size={14} className="text-slate-400" /> : <RefreshCw size={14} className="text-tertiary" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MappingStep() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            Mapping: <span className="text-primary">Source_Sales_2024</span> to <span className="text-primary">Global_Ledger_Final</span>
          </h2>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <Info size={16} />
            Pair source schema fields with destination targets. 12 columns remaining.
          </p>
        </div>
        <button className="flex items-center gap-2 border border-primary text-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all active:scale-95">
          <RefreshCw size={18} />
          Auto-Suggest Mapping
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8 min-h-[600px]">
        {/* Source Columns */}
        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Source Columns</h3>
            <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">24 TOTAL</span>
          </div>
          <div className="space-y-3">
            {COLUMN_MAPPINGS.map((mapping, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border shadow-sm flex items-center justify-between group cursor-grab active:cursor-grabbing transition-all ${mapping.match > 90 ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}
              >
                <div>
                  <p className={`text-sm font-bold ${mapping.match > 90 ? 'text-emerald-900' : 'text-slate-900'}`}>{mapping.source}</p>
                  <p className={`text-[10px] font-mono ${mapping.match > 90 ? 'text-emerald-600' : 'text-slate-400'}`}>{mapping.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  {mapping.match > 90 && (
                    <>
                      <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">98% MATCH</span>
                      <CheckCircle2 size={14} className="text-emerald-500" fill="currentColor" />
                    </>
                  )}
                  <GripVertical size={16} className="text-slate-300 group-hover:text-primary" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Canvas */}
        <div className="col-span-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 relative overflow-hidden flex flex-col items-center justify-center p-8">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00488d 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="w-full space-y-10 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/20"></div>
              <div className="flex-1 h-px bg-gradient-to-r from-primary to-primary-light mx-4 relative">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-slate-100 text-[10px] font-bold text-primary shadow-sm">1:1 Direct Mapping</span>
              </div>
              <div className="w-4 h-4 rounded-full bg-primary-light shadow-lg shadow-primary-light/20"></div>
            </div>
            
            <div className="flex items-center justify-between opacity-30">
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="flex-1 h-[2px] border-t-2 border-dotted border-slate-300 mx-4"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="w-4 h-4 rounded-full bg-emerald-600 shadow-lg shadow-emerald-600/20"></div>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-600 to-emerald-400 mx-4 relative">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 text-[10px] font-bold text-emerald-700 shadow-sm">Auto-Matched</span>
              </div>
              <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/20"></div>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
            <MousePointer2 size={14} />
            Drag source columns to destination targets
          </div>
        </div>

        {/* Destination Targets */}
        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Destination Targets</h3>
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">12 TARGETS</span>
          </div>
          <div className="space-y-3">
            <div className="bg-primary/5 p-4 rounded-xl border-2 border-primary/30 relative group">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-primary">ID_PRIMARY</p>
                <Link2 size={14} className="text-primary" />
              </div>
              <div className="bg-white rounded-lg p-2 border border-primary/10 shadow-sm flex items-center gap-2">
                <ChevronRight size={12} className="text-primary" />
                <span className="text-[10px] font-bold text-slate-700">mapped: transaction_id</span>
              </div>
            </div>

            {['USER_EMAIL', 'NET_VALUE', 'TX_DATE'].map((target, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary transition-all flex flex-col items-center justify-center text-center group cursor-pointer">
                <p className="text-sm font-bold text-slate-900 mb-1">{target}</p>
                <p className="text-[10px] font-mono text-slate-400 mb-4">
                  {target === 'USER_EMAIL' ? 'STRING(255)' : target === 'NET_VALUE' ? 'FLOAT64' : 'DATETIME'}
                </p>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-primary transition-colors">Drop Source Here</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TransferStep() {
  const [progress, setProgress] = useState(65);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 0.1 : 100));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <div className="fixed top-20 right-8 flex flex-col gap-3 z-50">
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white shadow-xl border-l-4 border-emerald-500 p-4 rounded-lg flex items-center gap-3 min-w-[320px]"
        >
          <CheckCircle2 className="text-emerald-500" size={20} />
          <div>
            <p className="text-sm font-bold text-slate-900">Batch 842 Validated</p>
            <p className="text-xs text-slate-500">5,000 records processed successfully.</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white shadow-xl border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3 min-w-[320px]"
        >
          <AlertTriangle className="text-red-500" size={20} />
          <div>
            <p className="text-sm font-bold text-slate-900">Network Latency Detected</p>
            <p className="text-xs text-slate-500">Sync speed reduced by 15%.</p>
          </div>
        </motion.div>
      </div>

      <header>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Data Transfer & Status</h2>
        <p className="text-slate-500 mt-2 font-medium">Real-time pipeline monitoring for Enterprise Migration Alpha.</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Stats */}
        <div className="col-span-4 space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Records</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">45,000</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Transferred</p>
            <p className="text-4xl font-black text-primary tracking-tighter">29,250</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
              <p className="text-lg font-bold text-emerald-600">In Progress...</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <RefreshCw className="text-emerald-600 animate-spin" size={24} />
            </div>
          </div>
        </div>

        {/* Progress & Logs */}
        <div className="col-span-8 bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Transfer Progress</h3>
              <p className="text-sm text-slate-500">Migrating <code className="bg-slate-100 px-1 rounded">user_meta_production</code> to <code className="bg-slate-100 px-1 rounded">aws_east_replica</code></p>
            </div>
            <div className="flex gap-3">
              <button className="bg-slate-100 text-slate-900 font-bold py-2 px-6 rounded-lg hover:bg-slate-200 transition-all text-xs flex items-center gap-2">
                <Pause size={14} /> Pause
              </button>
              <button className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:brightness-110 transition-all text-xs flex items-center gap-2 shadow-md">
                <XCircle size={14} /> Abort Transfer
              </button>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              <span>0%</span>
              <span className="text-primary text-sm">{Math.floor(progress)}% Completed</span>
              <span>100%</span>
            </div>
            <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
              <motion.div 
                className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
              ></motion.div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Live Log Console
              </h4>
              <span className="text-[10px] font-mono text-slate-300">v4.2.0-stable</span>
            </div>
            <div className="bg-slate-900 rounded-lg p-6 font-mono text-[11px] leading-relaxed h-64 overflow-y-auto shadow-inner">
              <div className="space-y-1">
                <p className="text-slate-500"><span className="text-slate-600">[14:22:01]</span> <span className="text-blue-400">INFO:</span> Establishing tunnel to aws_east_replica... Success.</p>
                <p className="text-slate-500"><span className="text-slate-600">[14:22:03]</span> <span className="text-blue-400">INFO:</span> Validating schema checksum for target: OK.</p>
                <p className="text-slate-500"><span className="text-slate-600">[14:22:10]</span> <span className="text-emerald-400">SUCCESS:</span> Inserted batch #841 (5,000 records).</p>
                <p className="text-slate-500"><span className="text-slate-600">[14:22:15]</span> <span className="text-emerald-400">SUCCESS:</span> Inserted batch #842 (5,000 records).</p>
                <p className="text-slate-500"><span className="text-slate-600">[14:22:20]</span> <span className="text-amber-400">WARN:</span> Batch #843 - Secondary index creation delayed on target.</p>
                <p className="text-slate-500"><span className="text-slate-600">[14:22:25]</span> <span className="text-blue-400">INFO:</span> Synchronizing sequence numbers...</p>
                <p className="text-slate-100 animate-pulse">_</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 relative overflow-hidden group">
          <Activity className="absolute -right-4 -bottom-4 text-primary/5 w-32 h-32 group-hover:scale-110 transition-transform" />
          <h4 className="text-lg font-bold text-slate-900 mb-2">Network Health</h4>
          <p className="text-sm text-slate-500 mb-6">Real-time throughput and latency visualization for the current pipeline.</p>
          <div className="flex items-end gap-1.5 h-16">
            {[40, 60, 45, 80, 100, 75, 90, 65, 85, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 relative overflow-hidden group">
          <ShieldCheck className="absolute -right-4 -bottom-4 text-emerald-500/5 w-32 h-32 group-hover:scale-110 transition-transform" />
          <h4 className="text-lg font-bold text-slate-900 mb-2">Integrity Check</h4>
          <p className="text-sm text-slate-500 mb-6">Validation status of transferred data packets against source hash.</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-r-transparent animate-spin"></div>
            <div>
              <p className="font-bold text-slate-900">Verifying Packets...</p>
              <p className="text-xs text-emerald-600 font-bold">99.8% Match Rate</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
