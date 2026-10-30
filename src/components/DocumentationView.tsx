import React, { useState } from 'react';
import {
  BookOpen,
  Mic,
  GitPullRequest,
  Sparkles,
  Lock,
  Users,
  Calendar,
  ShieldCheck,
  Award,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Target,
  ArrowRight,
} from 'lucide-react';
import { User } from '../types';

interface DocumentationViewProps {
  currentUser: User;
  onLaunchVoice: () => void;
  onLaunchWebhook: () => void;
  onLaunchRls: () => void;
  onLaunchBragSheet: () => void;
  onOpenVisualGuide: () => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  currentUser,
  onLaunchVoice,
  onLaunchWebhook,
  onLaunchRls,
  onLaunchBragSheet,
  onOpenVisualGuide,
}) => {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'features' | 'personas' | 'api' | 'rls'>('quickstart');
  const [copiedCurl, setCopiedCurl] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCurl(id);
    setTimeout(() => setCopiedCurl(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Documentation Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <span>Official Documentation &amp; User Manual</span>
            <span>·</span>
            <span className="text-stone-900 font-bold">ImpactIQ v2.4</span>
          </div>
          <h1 className="text-xl font-bold text-stone-900 mt-1">
            ImpactIQ Feature Use Case &amp; Operations Guide
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Complete architectural reference, persona workflows, step-by-step feature usage, and API cURL recipes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVisualGuide}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Visual Presentation</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl max-w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveSection('quickstart')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeSection === 'quickstart' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Quickstart &amp; Use Cases
        </button>
        <button
          onClick={() => setActiveSection('features')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeSection === 'features' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          A-to-Z Features
        </button>
        <button
          onClick={() => setActiveSection('personas')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeSection === 'personas' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          IC vs EM Personas
        </button>
        <button
          onClick={() => setActiveSection('api')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeSection === 'api' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          API &amp; Webhooks
        </button>
        <button
          onClick={() => setActiveSection('rls')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeSection === 'rls' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          PostgreSQL RLS
        </button>
      </div>

      {/* Section 1: Quickstart */}
      {activeSection === 'quickstart' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900">
              3-Minute Quickstart: How to Test the Entire System
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Capture Voice Memo</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  As <strong>Alex Rivera [IC]</strong>, click the <strong>Voice Update</strong> button in the header. Pick the "Checkout Latency" preset and click "Distill to Impact".
                </p>
                <button
                  onClick={onLaunchVoice}
                  className="text-rose-600 hover:underline font-bold flex items-center gap-1 text-[11px] pt-1"
                >
                  <span>Launch Voice Widget</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Review &amp; Approve Draft</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Notice the new card in your <strong>Private Workspace</strong>. Manager cannot view it. Click <strong>"Approve &amp; Share to EM"</strong> to make it shared.
                </p>
                <div className="text-emerald-700 font-bold text-[11px] pt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>RLS Policy Verified</span>
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Synthesize 1:1 Agenda</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Switch to <strong>Sarah Lin [EM]</strong> using top-right selector. Navigate to <strong>1:1 Copilot</strong> and click "Run 1:1 AI Copilot" to see your new win included!
                </p>
                <button
                  onClick={onLaunchBragSheet}
                  className="text-stone-900 hover:underline font-bold flex items-center gap-1 text-[11px] pt-1"
                >
                  <span>View Brag Sheet</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Features A to Z */}
      {activeSection === 'features' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-stone-900">
              Deep-Dive: The 8 Core Feature Modules
            </h2>

            <div className="space-y-4">
              {/* Feature 1 */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-rose-600" />
                    <h3 className="text-xs font-bold text-stone-900">Feature 1: In-Browser English Voice Updates</h3>
                  </div>
                  <button
                    onClick={onLaunchVoice}
                    className="text-xs font-semibold px-2.5 py-1 bg-white border border-stone-300 rounded hover:bg-stone-100"
                  >
                    Open Widget
                  </button>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Live microphone audio stream with real-time waveform visualizer via HTML5 canvas. Features continuous live English speech-to-text recognition streaming (with engine options for Whisper, Deepgram Nova-2, and Gemini Audio).
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-stone-900">Feature 2: Mockable Webhooks (GitHub &amp; Jira)</h3>
                  </div>
                  <button
                    onClick={onLaunchWebhook}
                    className="text-xs font-semibold px-2.5 py-1 bg-white border border-stone-300 rounded hover:bg-stone-100"
                  >
                    Open Simulator
                  </button>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Real HTTP receiver routes (`/api/webhooks/github` and `/api/webhooks/jira`). Ingests merged PRs, commit messages, and Jira ticket updates into the LLM pipeline with signature verification.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-stone-900">Feature 3: LLM Pipeline (Gemini 3.8 Flash)</h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Filters out routine chores (linter fixes, typo cleanups, branch rebasing), transforms technical tasks into Google XYZ format ("Accomplished X as measured by Y by doing Z"), and auto-links them to active quarterly OKRs with confidence scoring.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-stone-900">Feature 4: Employee Private Workspace</h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Newly generated impact statements remain private drafts. Employees can edit statements, adjust metrics, or delete drafts. Once approved, records become visible to direct management.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-stone-900">Feature 5: Manager Overview &amp; Stalled Objectives</h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Displays direct reporting tree only. The Stalled Objectives Alert banner highlights goals inactive for &gt;7 days (e.g. Marcus Chen 29d, Alex Rivera 25d) with a one-click "Add to 1:1" button.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-stone-900">Feature 6: Confidential Coaching Notes</h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Manager-only private notes for career coaching and promotion calibrations. Under PostgreSQL RLS, ICs cannot access or query these notes.
                </p>
              </div>

              {/* Feature 7 */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-bold text-stone-900">Feature 7: Automated 1:1 Copilot</h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Runs on an automated schedule or on demand. Synthesizes approved wins, blockers, and AI-recommended talking points into a collaborative meeting agenda with mutual action items.
                </p>
              </div>

              {/* Feature 8 */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-stone-900">Feature 8: One-Click Quarterly "Brag Sheet" Export</h3>
                  </div>
                  <button
                    onClick={onLaunchBragSheet}
                    className="text-xs font-semibold px-2.5 py-1 bg-white border border-stone-300 rounded hover:bg-stone-100"
                  >
                    Generate Sheet
                  </button>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Rolls up cumulative achievements by OKR with quantified metrics, executive AI summary, Markdown copy for Lattice/Workday, JSON export, and print-ready PDF preview.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Personas */}
      {activeSection === 'personas' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-stone-900">
            Persona Directory &amp; Reporting Hierarchy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <h3 className="font-bold text-stone-900 text-sm">Platform Engineering Tree (Managed by Sarah Lin)</h3>
              <ul className="space-y-1.5 text-stone-600 pt-1">
                <li>• <strong>Sarah Lin (EM):</strong> Director of Platform Engineering</li>
                <li>• <strong>Alex Rivera (IC):</strong> Staff Backend Engineer (Active Session Default)</li>
                <li>• <strong>Elena Rostova (IC):</strong> Senior Distributed Systems Engineer</li>
                <li>• <strong>Marcus Chen (IC):</strong> Full-Stack Performance Engineer</li>
              </ul>
              <p className="text-[11px] text-stone-500 pt-2 border-t border-stone-200">
                Sarah Lin can view Alex, Elena, and Marcus. She cannot see Priya or Jordan.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <h3 className="font-bold text-stone-900 text-sm">Growth &amp; Mobile Tree (Managed by David Kim)</h3>
              <ul className="space-y-1.5 text-stone-600 pt-1">
                <li>• <strong>David Kim (EM):</strong> Engineering Manager - Growth &amp; Mobile</li>
                <li>• <strong>Priya Sharma (IC):</strong> Principal Frontend Architect</li>
                <li>• <strong>Jordan Taylor (IC):</strong> Mobile Systems Engineer</li>
              </ul>
              <p className="text-[11px] text-rose-700 pt-2 border-t border-stone-200 font-medium">
                Under RLS, queries from Sarah Lin targeting Priya or Jordan return 0 rows.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: API & Webhooks */}
      {activeSection === 'api' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-stone-900">
            Real Server API Endpoints &amp; Terminal Recipes
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                <span>1. POST /api/webhooks/github</span>
                <button
                  onClick={() =>
                    copyCode(
                      `curl -X POST ${baseUrl}/api/webhooks/github -H "Content-Type: application/json" -H "x-github-event: pull_request" -d '{"action":"closed","pull_request":{"number":1145,"title":"perf(cache): Add distributed stale-while-revalidate Redis caching","body":"Absorbs spike traffic at 30k RPS."}}'`,
                      'curl_gh'
                    )
                  }
                  className="text-stone-500 hover:text-stone-900 flex items-center gap-1 font-normal text-[11px]"
                >
                  {copiedCurl === 'curl_gh' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl === 'curl_gh' ? 'Copied!' : 'Copy cURL'}</span>
                </button>
              </div>
              <pre className="p-3 bg-stone-900 text-stone-200 rounded-xl font-mono text-xs overflow-x-auto">
{`curl -X POST ${baseUrl}/api/webhooks/github \\
  -H "Content-Type: application/json" \\
  -H "x-github-event: pull_request" \\
  -d '{"action":"closed","pull_request":{"number":1145,"title":"perf(cache): Add distributed Redis caching","body":"Absorbs spike traffic at 30k RPS."}}'`}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                <span>2. GET /api/brag-sheet/:userId</span>
                <button
                  onClick={() =>
                    copyCode(`curl -s ${baseUrl}/api/brag-sheet/user_ic_1?quarter=Q3%202026`, 'curl_brag')
                  }
                  className="text-stone-500 hover:text-stone-900 flex items-center gap-1 font-normal text-[11px]"
                >
                  {copiedCurl === 'curl_brag' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl === 'curl_brag' ? 'Copied!' : 'Copy cURL'}</span>
                </button>
              </div>
              <pre className="p-3 bg-stone-900 text-stone-200 rounded-xl font-mono text-xs overflow-x-auto">
{`curl -s ${baseUrl}/api/brag-sheet/user_ic_1?quarter=Q3%202026`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: RLS */}
      {activeSection === 'rls' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                PostgreSQL Row-Level Security Rules
              </h2>
              <p className="text-xs text-stone-500">
                Security is evaluated at query time via user JWT session context
              </p>
            </div>
            <button
              onClick={onLaunchRls}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Launch Live Inspector</span>
            </button>
          </div>

          <pre className="p-4 bg-stone-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-stone-800">
{`-- Policy 1: Employees own their achievements (draft + approved)
CREATE POLICY employee_own_achievements ON achievements
  FOR ALL USING (auth.uid() = user_id);

-- Policy 2: Managers can view APPROVED achievements of direct reports ONLY
-- Unapproved drafts are strictly hidden from management queries
CREATE POLICY manager_direct_approved ON achievements
  FOR SELECT USING (
    status = 'approved' AND
    auth.uid() = (SELECT manager_id FROM users WHERE id = achievements.user_id)
  );

-- Policy 3: Confidential manager coaching notes
CREATE POLICY manager_coaching_private ON coaching_notes
  FOR ALL USING (auth.uid() = manager_id);`}
          </pre>
        </div>
      )}
    </div>
  );
};
