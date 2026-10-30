import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  Terminal,
  Send,
  Code2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { dbStore } from '../services/db';
import { WebhookEvent, QuarterlyGoal, User } from '../types';

interface WebhookHubViewProps {
  currentUser: User;
  goals: QuarterlyGoal[];
  onOpenWebhookModal: () => void;
  onRefresh: () => void;
}

export const WebhookHubView: React.FC<WebhookHubViewProps> = ({
  currentUser,
  goals,
  onOpenWebhookModal,
  onRefresh,
}) => {
  const [copiedCurlGithub, setCopiedCurlGithub] = useState(false);
  const [copiedCurlJira, setCopiedCurlJira] = useState(false);
  const webhooks = dbStore.getWebhooks();

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const githubCurl = `curl -X POST ${baseUrl}/api/webhooks/github \\
  -H "Content-Type: application/json" \\
  -H "x-github-event: pull_request" \\
  -d '{
    "action": "closed",
    "pull_request": {
      "number": 1204,
      "title": "perf(postgres): Add partition pruning for audit_logs table",
      "merged": true,
      "user": { "login": "${currentUser.name.toLowerCase().replace(/\s+/g, '-')}" },
      "body": "Reduces disk scan overhead by 70% during monthly compliance queries."
    }
  }'`;

  const jiraCurl = `curl -X POST ${baseUrl}/api/webhooks/jira \\
  -H "Content-Type: application/json" \\
  -d '{
    "webhookEvent": "jira:issue_updated",
    "issue": {
      "key": "CORE-915",
      "fields": {
        "summary": "Fix Redis connection pool leak during failover election",
        "description": "Resolved stale connection buildup when master switches.",
        "status": { "name": "Resolved" }
      }
    }
  }'`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <span>Webhook Integrations</span>
            <span>·</span>
            <span className="text-blue-600 font-bold">Real-time Ingestion</span>
          </div>
          <h1 className="text-xl font-bold text-stone-900 mt-1">
            GitHub &amp; Jira Webhook Listeners
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Live HTTP receivers parse pull requests, commits, and issue transitions into the LLM impact pipeline.
          </p>
        </div>

        <button
          onClick={onOpenWebhookModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Simulate Incoming Event</span>
        </button>
      </div>

      {/* Endpoints & cURL guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub endpoint */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center">
                <GitPullRequest className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-stone-900">GitHub PR Webhook Listener</h3>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(githubCurl);
                setCopiedCurlGithub(true);
                setTimeout(() => setCopiedCurlGithub(false), 2000);
              }}
              className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              {copiedCurlGithub ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCurlGithub ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>

          <div className="bg-stone-900 text-stone-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
            <span className="text-emerald-400 font-bold">POST</span> /api/webhooks/github
          </div>

          <p className="text-xs text-stone-600">
            Triggers on <code>pull_request.closed</code> (merged) or push events. Automatically parses commit logs, changed files, and extracts business impact.
          </p>
        </div>

        {/* Jira endpoint */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-stone-900">Jira Ticket Webhook Listener</h3>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(jiraCurl);
                setCopiedCurlJira(true);
                setTimeout(() => setCopiedCurlJira(false), 2000);
              }}
              className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              {copiedCurlJira ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCurlJira ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>

          <div className="bg-stone-900 text-stone-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
            <span className="text-emerald-400 font-bold">POST</span> /api/webhooks/jira
          </div>

          <p className="text-xs text-stone-600">
            Triggers on <code>jira:issue_updated</code> status transitions (Resolved/Done). Auto-detects story points and architectural milestones.
          </p>
        </div>
      </div>

      {/* Live Event Stream */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-600" />
            <span>Captured Inbound Webhook Stream</span>
          </h3>
          <span className="text-xs font-mono text-stone-500">
            {webhooks.length} Recent Events Logged
          </span>
        </div>

        {webhooks.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200 text-xs text-stone-500">
            No webhook events recorded yet. Click "Simulate Incoming Event" or execute a cURL command above.
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2 font-mono"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded font-bold uppercase bg-stone-200 text-stone-800">
                      {event.source}
                    </span>
                    <span className="text-stone-900 font-semibold">{event.eventType}</span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500">Sender: {event.sender}</span>
                  </div>
                  <span className="text-stone-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-stone-800 font-sans font-medium text-xs">
                  {event.summary}
                </div>

                <details className="pt-1 text-[11px]">
                  <summary className="text-stone-500 hover:text-stone-800 cursor-pointer">
                    View Raw Payload JSON
                  </summary>
                  <pre className="mt-2 p-2 bg-stone-900 text-emerald-400 rounded-lg overflow-x-auto text-[10px]">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
