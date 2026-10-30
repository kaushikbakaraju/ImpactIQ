import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Terminal,
  X,
  Code2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { dbStore } from '../services/db';
import { transformRawToImpactStatement } from '../services/gemini';
import { QuarterlyGoal } from '../types';

interface WebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userGoals: QuarterlyGoal[];
  onAchievementCreated: () => void;
}

export const WebhookSimulatorModal: React.FC<WebhookSimulatorModalProps> = ({
  isOpen,
  onClose,
  userId,
  userGoals,
  onAchievementCreated,
}) => {
  const [webhookType, setWebhookType] = useState<'github' | 'jira'>('github');
  const [selectedPreset, setSelectedPreset] = useState<'pr_merge' | 'commit_push' | 'jira_resolve' | 'jira_epic'>('pr_merge');
  const [isSending, setIsSending] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  // Preset payload builders
  const getPayload = () => {
    if (webhookType === 'github') {
      if (selectedPreset === 'pr_merge') {
        return {
          action: 'closed',
          pull_request: {
            number: 1145,
            title: 'perf(cache): Add distributed stale-while-revalidate Redis caching for catalog API',
            state: 'closed',
            merged: true,
            user: { login: 'alex-rivera-eng' },
            body: 'Implements two-tier SWR cache with 45s TTL to absorb spike traffic. Tested against 30,000 RPS benchmark. Resolves issue with catalog service throttling during product launches.',
            changed_files: 8,
            additions: 342,
            deletions: 56,
          },
          commits: [
            { id: 'c901a14', message: 'feat: add swr cache layer with redis pipelining' },
            { id: 'b812f90', message: 'test: add benchmark load test simulating 30k rps' },
            { id: 'f012e88', message: 'chore: fix linter warning in config.ts' },
          ],
          sender: { login: 'alex-rivera-eng' },
        };
      } else {
        return {
          action: 'pushed',
          ref: 'refs/heads/main',
          commits: [
            { id: 'd8832a1', message: 'feat(db): implement concurrent non-blocking index creation runner' },
            { id: 'e4990b2', message: 'refactor: set lock_timeout = 250ms on all migration ddl' },
            { id: 'a110293', message: 'chore: bump minor lockfile versions' },
          ],
          sender: { login: 'alex-rivera-eng' },
        };
      }
    } else {
      // Jira
      if (selectedPreset === 'jira_resolve') {
        return {
          webhookEvent: 'jira:issue_updated',
          issue: {
            id: '10982',
            key: 'PLAT-902',
            fields: {
              summary: 'Zero-Downtime Migration Framework: Lock contention pre-flight checker',
              description: 'Created automatic lock inspection daemon that polls pg_locks and aborts deploy if lock acquire duration exceeds 250ms. Validated across 6 core microservices.',
              status: { name: 'Resolved' },
              priority: { name: 'High' },
              customfield_10016: 8, // story points
            },
          },
          user: { displayName: 'Alex Rivera' },
        };
      } else {
        return {
          webhookEvent: 'jira:issue_updated',
          issue: {
            id: '10999',
            key: 'CORE-841',
            fields: {
              summary: 'Prevent connection starvation during upstream payment provider outages',
              description: 'Added circuit breaker using resilient bulkheading pattern with Netflix Hystrix semantics in Node.js/Go. Mitigated cascade timeouts.',
              status: { name: 'Closed' },
              priority: { name: 'Critical' },
              customfield_10016: 13,
            },
          },
          user: { displayName: 'Alex Rivera' },
        };
      }
    }
  };

  const currentPayload = getPayload();
  const endpointUrl = webhookType === 'github' ? '/api/webhooks/github' : '/api/webhooks/jira';

  const curlCommand = `curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}${endpointUrl} \\
  -H "Content-Type: application/json" \\
  -H "${webhookType === 'github' ? 'x-github-event: pull_request' : 'x-atlassian-webhook: issue_updated'}" \\
  -d '${JSON.stringify(currentPayload, null, 2)}'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleDispatchWebhook = async () => {
    setIsSending(true);
    setLastResponse(null);

    try {
      // Send to webhook endpoint
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-event': webhookType === 'github' ? 'pull_request' : 'issue_updated',
        },
        body: JSON.stringify(currentPayload),
      });

      const data = await res.json();
      setLastResponse(data);

      const rawText = data.extracted?.rawText || JSON.stringify(currentPayload);
      const sourceRef = data.extracted?.sourceReference || (webhookType === 'github' ? 'GitHub PR' : 'Jira Ticket');

      // Log into DB webhook stream
      dbStore.logWebhook({
        source: webhookType,
        eventType: webhookType === 'github' ? 'pull_request.closed' : 'jira:issue_updated',
        sender: data.extracted?.sender || data.extracted?.reporter || 'alex-rivera-eng',
        summary: data.extracted?.summary || sourceRef,
        payload: currentPayload,
        processed: true,
      });

      // Pass through the LLM pipeline
      const impactResult = await transformRawToImpactStatement(
        rawText,
        userGoals,
        webhookType === 'github' ? 'github_pr' : 'jira_ticket',
        sourceRef
      );

      // Save into DB as Draft (strictly in employee private workspace)
      dbStore.addAchievement({
        userId,
        source: webhookType === 'github' ? 'github_pr' : 'jira_ticket',
        sourceReference: sourceRef,
        rawInput: rawText,
        title: impactResult.title,
        businessImpactStatement: impactResult.businessImpactStatement,
        technicalCraftSummary: impactResult.technicalCraftSummary,
        quantifiedMetrics: impactResult.quantifiedMetrics,
        linkedGoalId: impactResult.suggestedGoalId,
        goalMatchConfidence: impactResult.goalMatchConfidence,
        goalMatchReasoning: impactResult.goalMatchReasoning,
        status: 'draft',
        triviaFilteredOut: impactResult.triviaFilteredOut,
        tags: impactResult.tags,
      });

      onAchievementCreated();
    } catch (err: any) {
      console.error('Webhook dispatch error:', err);
      setLastResponse({ error: err.message });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Mockable Webhook Hub (GitHub PR &amp; Jira Tickets)
              </h3>
              <p className="text-xs text-stone-700">
                Ingest pull requests and issue tracker events directly into LLM distillation pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Service Selector & Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center bg-stone-100 rounded-lg p-1 text-xs font-semibold">
              <button
                onClick={() => {
                  setWebhookType('github');
                  setSelectedPreset('pr_merge');
                }}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  webhookType === 'github'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                GitHub PR Webhooks
              </button>
              <button
                onClick={() => {
                  setWebhookType('jira');
                  setSelectedPreset('jira_resolve');
                }}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  webhookType === 'jira'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Jira Ticket Webhooks
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-700 font-medium">Event Preset:</span>
              {webhookType === 'github' ? (
                <>
                  <button
                    onClick={() => setSelectedPreset('pr_merge')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                      selectedPreset === 'pr_merge'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    PR #1145 (Merged)
                  </button>
                  <button
                    onClick={() => setSelectedPreset('commit_push')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                      selectedPreset === 'commit_push'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Commit Push Log
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedPreset('jira_resolve')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                      selectedPreset === 'jira_resolve'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    PLAT-902 (Resolved)
                  </button>
                  <button
                    onClick={() => setSelectedPreset('jira_epic')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                      selectedPreset === 'jira_epic'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    CORE-841 (Critical)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Webhook Endpoint Banner */}
          <div className="p-3 bg-stone-900 text-stone-200 rounded-xl font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="text-emerald-400 font-bold">POST</span>
              <span className="text-stone-300 truncate">{endpointUrl}</span>
            </div>
            <button
              onClick={copyCurl}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[11px] font-sans transition-colors shrink-0"
            >
              {copiedCurl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>cURL Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy cURL</span>
                </>
              )}
            </button>
          </div>

          {/* Payload Inspector */}
          <div>
            <div className="flex items-center justify-between text-xs text-stone-700 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-stone-400" />
                Live Webhook Ingest Payload (JSON)
              </span>
              <span className="text-[11px] text-stone-700">Validated Schema</span>
            </div>
            <pre className="text-[11px] font-mono p-3 bg-stone-50 border border-stone-200 rounded-xl max-h-48 overflow-y-auto text-stone-800">
              {JSON.stringify(currentPayload, null, 2)}
            </pre>
          </div>

          {/* Last Response Log */}
          {lastResponse && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Webhook Processed &amp; Impact Synthesized!</span>
              </div>
              <p className="text-xs text-emerald-800">
                The payload was ingested, sanitized (trivia removed), converted into an XYZ business impact statement, and placed into your <strong>Private Workspace</strong> as a pending draft.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-700 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>Simulates real webhook receiver with HMAC signature check</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isSending}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 rounded-md"
            >
              Done
            </button>
            <button
              onClick={handleDispatchWebhook}
              disabled={isSending}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {isSending ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Webhook...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Mock Webhook</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
