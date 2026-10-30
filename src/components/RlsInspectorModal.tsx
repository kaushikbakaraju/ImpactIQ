import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Database,
  Lock,
  Unlock,
  Key,
  CheckCircle2,
  XCircle,
  Play,
  Terminal,
  X,
  FileCode,
  Users,
} from 'lucide-react';
import { dbStore } from '../services/db';
import { User, RlsAuditCheck } from '../types';

interface RlsInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
  currentUserId: string;
}

export const RlsInspectorModal: React.FC<RlsInspectorModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  currentUserId,
}) => {
  const [testSessionUserId, setTestSessionUserId] = useState(currentUserId);
  const [testTargetUserId, setTestTargetUserId] = useState(allUsers.find(u => u.role === 'IC')?.id || 'user_ic_1');
  const [testResource, setTestResource] = useState<'achievements' | 'goals' | 'coaching_notes'>('achievements');
  const [testQueryResult, setTestQueryResult] = useState<{
    allowed: boolean;
    reason: string;
    itemsReturned: number;
    simulatedSql: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'testbench' | 'ddl' | 'audit'>('testbench');

  const auditLogs = dbStore.getAuditLogs();
  const sessionUser = allUsers.find(u => u.id === testSessionUserId);
  const targetUser = allUsers.find(u => u.id === testTargetUserId);

  const runSimulation = () => {
    if (!sessionUser || !targetUser) return;

    let allowed = false;
    let reason = '';
    let itemsReturned = 0;
    let simulatedSql = '';

    if (testResource === 'achievements') {
      simulatedSql = `SET LOCAL role = 'authenticated';\nSET LOCAL request.jwt.claim.sub = '${testSessionUserId}';\nSELECT * FROM achievements WHERE user_id = '${testTargetUserId}';`;

      const result = dbStore.queryAchievements(testSessionUserId, testTargetUserId);
      allowed = result.allowed;
      itemsReturned = result.data.length;
      reason = result.allowed
        ? testSessionUserId === testTargetUserId
          ? 'Full access granted: Employee querying own achievements (auth.uid() = user_id, drafts included).'
          : 'Direct reporting tree access granted: Manager querying direct report. Draft records suppressed by RLS policy.'
        : result.violationReason || 'RLS Security Violation: Target employee is outside your direct reporting tree.';
    } else if (testResource === 'goals') {
      simulatedSql = `SET LOCAL role = 'authenticated';\nSET LOCAL request.jwt.claim.sub = '${testSessionUserId}';\nSELECT * FROM quarterly_goals WHERE user_id = '${testTargetUserId}';`;
      const result = dbStore.queryGoals(testSessionUserId, testTargetUserId);
      allowed = result.allowed;
      itemsReturned = result.data.length;
      reason = result.allowed
        ? 'Granted: OKR goals are visible to employee and their direct manager.'
        : 'RLS Denied: You cannot inspect OKR goals of unlinked organizational silos.';
    } else {
      // coaching_notes
      simulatedSql = `SET LOCAL role = 'authenticated';\nSET LOCAL request.jwt.claim.sub = '${testSessionUserId}';\nSELECT * FROM coaching_notes WHERE employee_id = '${testTargetUserId}';`;
      const result = dbStore.queryCoachingNotes(testSessionUserId, testTargetUserId);
      allowed = result.allowed;
      itemsReturned = result.data.length;
      reason = result.allowed
        ? 'Granted: Authoring EM inspecting confidential coaching notes for direct report.'
        : testSessionUserId === testTargetUserId
        ? 'Strict RLS Denial: ICs cannot query manager private coaching notes.'
        : 'RLS Denied: Not the authoring manager in reporting chain.';
    }

    setTestQueryResult({
      allowed,
      reason,
      itemsReturned,
      simulatedSql,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                PostgreSQL Row-Level Security (RLS) Policy Inspector
              </h3>
              <p className="text-xs text-stone-700">
                Enforcing organizational tree isolation, private drafts, and manager-only coaching notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('testbench')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'testbench' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Interactive Testbench
              </button>
              <button
                onClick={() => setActiveTab('ddl')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'ddl' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Postgres SQL DDL
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'audit' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Live Audit Logs
                <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded-full">
                  {auditLogs.length}
                </span>
              </button>
            </div>

            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-md">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Testbench */}
        {activeTab === 'testbench' && (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
              {/* Session User */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1.5 uppercase tracking-wider">
                  1. Current Session Context (`auth.uid()`)
                </label>
                <select
                  value={testSessionUserId}
                  onChange={(e) => setTestSessionUserId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-stone-200 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} [{u.role}] · {u.title.slice(0, 24)}...
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-[11px] text-stone-700">
                  Manager: {sessionUser?.managerId ? allUsers.find(m => m.id === sessionUser.managerId)?.name : 'None (Top Level)'}
                </div>
              </div>

              {/* Target Record Owner */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1.5 uppercase tracking-wider">
                  2. Target Record Owner (`user_id`)
                </label>
                <select
                  value={testTargetUserId}
                  onChange={(e) => setTestTargetUserId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-stone-200 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} [{u.role}] · {u.team}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-[11px] text-stone-700">
                  Direct Report to Session?{' '}
                  <span className="font-semibold text-stone-900">
                    {sessionUser && targetUser && sessionUser.id === targetUser.managerId ? 'YES (In Direct Tree)' : 'NO'}
                  </span>
                </div>
              </div>

              {/* Target Resource Table */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1.5 uppercase tracking-wider">
                  3. Postgres Protected Table
                </label>
                <select
                  value={testResource}
                  onChange={(e) => setTestResource(e.target.value as any)}
                  className="w-full text-xs font-medium bg-white border border-stone-200 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
                >
                  <option value="achievements">achievements (Drafts vs Approved)</option>
                  <option value="goals">quarterly_goals (OKRs)</option>
                  <option value="coaching_notes">coaching_notes (EM-Private Only)</option>
                </select>
                <div className="mt-1 text-[11px] text-stone-700">
                  RLS policy enforces row isolation
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={runSimulation}
                className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Execute Query Against RLS Engine
              </button>
            </div>

            {/* Test Query Result */}
            {testQueryResult && (
              <div
                className={`p-4 rounded-xl border transition-all ${
                  testQueryResult.allowed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/70 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {testQueryResult.allowed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <span className="text-xs font-bold tracking-tight">
                      {testQueryResult.allowed ? 'QUERY PERMITTED BY RLS POLICY' : 'RLS SECURITY VIOLATION INTERCEPTED'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold">
                    Rows Returned: {testQueryResult.itemsReturned}
                  </span>
                </div>

                <p className="text-xs font-medium mb-3">
                  {testQueryResult.reason}
                </p>

                <div className="bg-stone-900 text-stone-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <div className="text-stone-400 text-[10px] uppercase font-bold mb-1">
                    Simulated PostgreSQL Query &amp; JWT Context:
                  </div>
                  <pre className="whitespace-pre-wrap">{testQueryResult.simulatedSql}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: DDL */}
        {activeTab === 'ddl' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="text-xs text-stone-600">
              Production PostgreSQL schema and Row-Level Security policies active in ImpactIQ:
            </div>
            <pre className="bg-stone-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-stone-800">
{`-- Enable Row Level Security on Core Tables
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_on_one_agendas ENABLE ROW LEVEL SECURITY;

-- POLICY 1: Employees have full access to their own achievements (including unshared drafts)
CREATE POLICY employee_own_achievements ON achievements
  FOR ALL
  USING (auth.uid() = user_id);

-- POLICY 2: Managers can view achievements of DIRECT REPORTS only when status = 'approved'
-- Unapproved drafts are strictly suppressed and cannot be queried by management
CREATE POLICY manager_direct_reports_approved ON achievements
  FOR SELECT
  USING (
    status = 'approved'
    AND auth.uid() = (SELECT manager_id FROM users WHERE id = achievements.user_id)
  );

-- POLICY 3: Managers can NEVER read records outside their direct reporting tree
-- (Implicitly enforced by lack of matching policy for non-direct reports)

-- POLICY 4: Manager Coaching Notes are strictly confidential to the authoring manager
-- Individual contributors cannot view manager private coaching notes
CREATE POLICY manager_coaching_notes_private ON coaching_notes
  FOR ALL
  USING (auth.uid() = manager_id);

-- POLICY 5: 1:1 Agendas are shared strictly between the IC and EM pair
CREATE POLICY one_on_one_pair_access ON one_on_one_agendas
  FOR ALL
  USING (auth.uid() = employee_id OR auth.uid() = manager_id);`}
            </pre>
          </div>
        )}

        {/* Tab 3: Live Audit Logs */}
        {activeTab === 'audit' && (
          <div className="p-6 space-y-3 overflow-y-auto max-h-[500px]">
            <div className="text-xs text-stone-600 mb-2">
              Recent real-time policy evaluation decisions captured by the database audit daemon:
            </div>
            {auditLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-stone-400">
                No security audit events logged yet. Run queries or switch users to observe checks.
              </div>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                      log.allowed
                        ? 'bg-stone-50 border-stone-200'
                        : 'bg-rose-50 border-rose-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${log.allowed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {log.allowed ? 'PERMIT' : 'DENY'}
                        </span>
                        <span className="font-semibold text-stone-900">{log.action} {log.resource}</span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-500">Actor: {log.requestingUserId} ({log.requestingRole})</span>
                        <span className="text-stone-400">→</span>
                        <span className="text-stone-500">Target: {log.targetUserId}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-stone-600">{log.reason}</p>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5 font-mono">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>RLS Context: Current User Session ({currentUserId})</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
