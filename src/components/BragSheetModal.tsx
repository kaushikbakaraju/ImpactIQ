import React, { useState } from 'react';
import {
  Award,
  Copy,
  Check,
  Download,
  Printer,
  X,
  Target,
  Sparkles,
  ExternalLink,
  FileText,
  Calendar,
} from 'lucide-react';
import { User, Achievement, QuarterlyGoal } from '../types';

interface BragSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User;
  achievements: Achievement[];
  goals: QuarterlyGoal[];
  quarter?: string;
}

export const BragSheetModal: React.FC<BragSheetModalProps> = ({
  isOpen,
  onClose,
  employee,
  achievements,
  goals,
  quarter = 'Q3 2026',
}) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  // Filter approved achievements
  const approved = achievements.filter(a => a.status === 'approved');

  // Roll up quantified metrics
  const allMetrics = Array.from(new Set(approved.flatMap(a => a.quantifiedMetrics)));

  // Generate markdown format
  const generateMarkdown = () => {
    return `# Quarterly Engineering Brag Sheet (${quarter})
**Engineer:** ${employee.name} | ${employee.title}  
**Manager:** Sarah Lin | Director of Platform Engineering  
**Department:** ${employee.department} · ${employee.team}  
**Generated:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

---

## 🚀 Executive Impact Summary
During ${quarter}, focused on mission-critical platform reliability, latency reduction, and deployment safety across core distributed services. Delivered an aggregate **41% reduction in checkout p99 latency** under 27,000 RPS, authored zero-downtime database deployment guardrails guarding 6 production services, and unlocked significant operational cost savings.

### 📊 Quantified Business Metrics
${allMetrics.map(m => `- **${m}**`).join('\n')}

---

## 🎯 OKR Alignment & Accomplishments

${goals.map(goal => {
  const linked = approved.filter(a => a.linkedGoalId === goal.id);
  return `### OKR: ${goal.title}
*Category: ${goal.category} | Progress: ${goal.progressPercent}% (${goal.currentMetric})*

${linked.length > 0 ? linked.map(ach => `
#### ${ach.title}
- **Impact Statement:** ${ach.businessImpactStatement}
- **Technical Craft:** ${ach.technicalCraftSummary}
- **Metrics:** ${ach.quantifiedMetrics.join(', ')}
- **Source Reference:** ${ach.sourceReference || ach.source}
`).join('\n') : '_No approved achievements logged under this goal yet._\n'}
`;
}).join('\n')}

---
*Generated via ImpactIQ SaaS Platform with PostgreSQL RLS verification.*
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadJson = async () => {
    try {
      const res = await fetch(`/api/brag-sheet/${employee.id}?quarter=${encodeURIComponent(quarter)}`);
      let data;
      if (res.ok) {
        data = await res.json();
      } else {
        data = {
          employee: employee.name,
          title: employee.title,
          quarter,
          metrics: allMetrics,
          achievements: approved,
          goals,
        };
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brag-sheet-${employee.name.toLowerCase().replace(/\s+/g, '-')}-${quarter.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header (Hidden during print) */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Quarterly "Brag Sheet" Export ({quarter})
              </h3>
              <p className="text-xs text-stone-700">
                Performance review &amp; promotion calibration document for {employee.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? 'Copied MD!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{copiedJson ? 'Saved JSON!' : 'Export JSON'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-md ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Brag Sheet Content */}
        <div className="p-8 space-y-6 overflow-y-auto font-sans bg-stone-50/40">
          {/* Document Header */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3.5">
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-12 h-12 rounded-full object-cover border border-stone-300"
                />
                <div>
                  <h1 className="text-lg font-bold text-stone-900">{employee.name}</h1>
                  <p className="text-xs text-stone-700 font-medium">{employee.title}</p>
                  <p className="text-[11px] text-stone-700">{employee.department} · {employee.team}</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-bold font-mono px-2.5 py-1 bg-stone-100 rounded-md text-stone-800">
                  {quarter} Brag Sheet
                </span>
                <p className="text-[11px] text-stone-700 mt-1">
                  Manager: Sarah Lin (Director of Eng)
                </p>
              </div>
            </div>

            {/* Executive AI Impact Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Executive Performance Summary
              </h3>
              <p className="text-xs text-stone-800 leading-relaxed font-serif">
                During {quarter}, {employee.name} delivered foundational distributed systems enhancements that directly improved user experience, lowered latency under surge traffic, and eliminated deployment risks. Engineered critical composite database index optimizations resulting in a <strong>41% latency drop (p99 &lt; 88ms at 27k RPS)</strong>, implemented automated pre-flight migration locking guardrails across 6 production microservices, and reduced infrastructure memory footprint by $1,850/mo.
              </p>
            </div>

            {/* High Impact Rollup Metrics */}
            <div className="pt-2">
              <h4 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2">
                Quantified Outcomes &amp; System Metrics
              </h4>
              <div className="flex flex-wrap gap-2">
                {allMetrics.map((metric, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md text-xs font-semibold"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* OKR Aligned Accomplishments */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Quarterly Objectives &amp; Cumulative Achievements ({approved.length} Verified)
            </h3>

            {goals.map((goal) => {
              const linkedAchievements = approved.filter(a => a.linkedGoalId === goal.id);
              return (
                <div
                  key={goal.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-stone-700 font-mono mb-0.5">
                        OKR Category: {goal.category}
                      </div>
                      <h4 className="text-sm font-bold text-stone-900">{goal.title}</h4>
                      <p className="text-xs text-stone-700 mt-0.5">{goal.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-stone-900 font-mono">
                        {goal.progressPercent}% Target Met
                      </span>
                      <p className="text-[11px] text-stone-700">{goal.currentMetric}</p>
                    </div>
                  </div>

                  {/* Linked Achievements under this goal */}
                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    {linkedAchievements.length === 0 ? (
                      <p className="text-xs text-stone-700 italic">
                        No approved achievements mapped to this goal yet.
                      </p>
                    ) : (
                      linkedAchievements.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 text-xs">
                              {item.title}
                            </span>
                            <span className="text-[11px] font-mono text-stone-700">
                              {item.sourceReference || item.source}
                            </span>
                          </div>

                          <p className="text-stone-800 leading-relaxed font-medium">
                            {item.businessImpactStatement}
                          </p>

                          <div className="text-[11px] text-stone-700 font-mono">
                            Craft: {item.technicalCraftSummary}
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.quantifiedMetrics.map((metric, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-bold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200"
                              >
                                {metric}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-[11px] text-stone-700 font-mono">
            One-Click Export API: <code>GET /api/brag-sheet/{employee.id}</code>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
