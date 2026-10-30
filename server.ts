import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const apiKey = process.env.GEMINI_API_KEY;
const genAI = (apiKey && apiKey !== 'MY_GEMINI_API_KEY') ? new GoogleGenAI({ apiKey }) : null;

// --- Health check ---
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ImpactIQ Full-Stack Engine',
    geminiConfigured: !!genAI,
    timestamp: new Date().toISOString(),
  });
});

// --- GitHub Webhook Listener ---
app.post('/api/webhooks/github', async (req: Request, res: Response) => {
  const eventType = req.headers['x-github-event'] || 'pull_request';
  const deliveryId = req.headers['x-github-delivery'] || 'delivery_' + Date.now();
  const payload = req.body || {};

  console.log(`[GitHub Webhook] Received ${eventType} (${deliveryId})`);

  const pr = payload.pull_request;
  const commits = payload.commits || [];
  const sender = payload.sender?.login || 'alex-rivera-eng';

  let summary = '';
  let rawText = '';
  let prRef = '';

  if (pr) {
    prRef = `PR #${pr.number}`;
    summary = `PR #${pr.number}: ${pr.title} (${pr.state || 'merged'})`;
    rawText = `Merged GitHub PR #${pr.number}: "${pr.title}". Body: ${pr.body || 'No description provided.'} Merged by ${sender}. Changed files: ${pr.changed_files || 4}, Additions: +${pr.additions || 140}, Deletions: -${pr.deletions || 25}.`;
  } else if (commits.length > 0) {
    prRef = `Commit ${commits[0].id?.slice(0, 7) || 'HEAD'}`;
    summary = `Pushed ${commits.length} commits by ${sender}`;
    rawText = `Commit logs:\n` + commits.map((c: any) => `- ${c.message}`).join('\n');
  } else {
    prRef = 'Webhook Event';
    summary = payload.action ? `Action: ${payload.action}` : 'Generic GitHub webhook event';
    rawText = JSON.stringify(payload);
  }

  res.json({
    success: true,
    message: 'GitHub webhook processed successfully',
    deliveryId,
    eventType,
    extracted: {
      source: 'github_pr',
      sourceReference: prRef,
      sender,
      summary,
      rawText,
    },
  });
});

// --- Jira Webhook Listener ---
app.post('/api/webhooks/jira', async (req: Request, res: Response) => {
  const webhookEvent = req.body?.webhookEvent || 'jira:issue_updated';
  const issue = req.body?.issue || {};
  const changelog = req.body?.changelog || {};
  const user = req.body?.user?.displayName || 'Alex Rivera';

  const issueKey = issue.key || 'PLAT-902';
  const summary = issue.fields?.summary || 'Optimized database connection pool & query execution';
  const description = issue.fields?.description || 'Resolved connection exhaustion during traffic bursts';
  const status = issue.fields?.status?.name || 'Resolved / Done';

  const rawText = `Jira issue ${issueKey} moved to ${status}. Title: "${summary}". Description: ${description}. Story points: ${issue.fields?.customfield_10016 || 5}. Updated by: ${user}.`;

  res.json({
    success: true,
    message: 'Jira webhook captured and parsed',
    webhookEvent,
    extracted: {
      source: 'jira_ticket',
      sourceReference: issueKey,
      reporter: user,
      status,
      summary: `${issueKey}: ${summary}`,
      rawText,
    },
  });
});

// --- LLM Impact Transformation Pipeline ---
app.post('/api/llm/transform', async (req: Request, res: Response) => {
  const { rawInput, goals = [], source = 'ad-hoc', sourceReference = '' } = req.body;

  if (!rawInput) {
    return res.status(400).json({ error: 'Missing rawInput' });
  }

  if (genAI) {
    try {
      const prompt = `You are the lead engineering performance analyst for ImpactIQ.
Transform the following raw engineering update into an elite, promotion-grade Business Impact Statement using the Google XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]".

Active User Goals Context:
${JSON.stringify(goals, null, 2)}

Activity Source: ${source} (${sourceReference})
Raw Input:
"""
${rawInput}
"""

Rules:
1. Remove all routine trivia (formatting, typos, rebases, conversational chatter).
2. Elevate to business outcomes (latency, throughput, revenue, downtime prevention, cost savings).
3. Quantify metrics specifically (e.g., "-35% p99 latency", "25k RPS", "$1.8k/mo saved").
4. Match to the most relevant goal in context with confidence score (0-100) and rationale.
5. Create a crisp title and technical craft summary.

Respond ONLY with valid JSON in this exact shape:
{
  "title": "...",
  "businessImpactStatement": "...",
  "technicalCraftSummary": "...",
  "quantifiedMetrics": ["...", "..."],
  "suggestedGoalId": "goal_id_string",
  "goalMatchConfidence": 95,
  "goalMatchReasoning": "...",
  "triviaFilteredOut": ["...", "..."],
  "tags": ["...", "..."]
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Server Gemini transform error:', err);
    }
  }

  // Fallback response if GenAI is unavailable or fails
  const metrics = ['-42% p99 latency under peak load', 'Zero service interruptions during deployment', '$2,100/mo cloud infrastructure savings'];
  const matchedGoal = goals[0] || { id: 'goal_alex_1', title: 'Sub-100ms P99 Latency' };

  return res.json({
    title: sourceReference ? `Delivered ${sourceReference}: Core Platform Enhancement` : 'High-Throughput Distributed Resilience',
    businessImpactStatement: `Accelerated service execution and reliability (${metrics[0]}) by implementing hardened architectural fault boundaries and distributed caching, preventing customer-facing regressions under peak traffic bursts.`,
    technicalCraftSummary: `Engineered performant architectural enhancements with defensive timeout handling, automated rollback checks, and telemetry instrumentation. (${sourceReference || source})`,
    quantifiedMetrics: metrics,
    suggestedGoalId: matchedGoal.id,
    goalMatchConfidence: 94,
    goalMatchReasoning: `Strong alignment with target objective "${matchedGoal.title}" through direct database and platform improvements.`,
    triviaFilteredOut: ['Filtered routine syntax cleanups, branch rebases, and minor package lock updates'],
    tags: ['Architecture', 'Reliability', 'Performance', 'Engineering Excellence'],
  });
});

// --- 1:1 Copilot Synthesis Endpoint ---
app.post('/api/copilot/agenda', async (req: Request, res: Response) => {
  const { employeeId, managerId, achievements = [], goals = [], coachingNotes = [] } = req.body;

  if (genAI) {
    try {
      const prompt = `You are the executive 1:1 Copilot synthesizing a high-impact bi-weekly 1:1 meeting agenda.
Employee ID: ${employeeId}
Manager ID: ${managerId}

Approved Achievements:
${JSON.stringify(achievements, null, 2)}

Quarterly Goals:
${JSON.stringify(goals, null, 2)}

Manager Private Themes:
${JSON.stringify(coachingNotes.map((n: any) => n.tags), null, 2)}

Output JSON:
{
  "executiveSummary": "2-3 sentences summarizing velocity, wins, and critical risks.",
  "talkingPoints": [
    {
      "title": "Title",
      "description": "Specific context and prompt",
      "type": "celebration" | "blocker" | "growth" | "strategy",
      "aiSuggested": true
    }
  ],
  "blockers": ["Blocker description"],
  "actionItems": [
    {
      "task": "Task description",
      "assigneeRole": "employee" | "manager",
      "suggestedDueDate": "2026-11-04"
    }
  ]
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      return res.json(JSON.parse(response.text?.trim() || '{}'));
    } catch (err) {
      console.error('Server 1:1 copilot error:', err);
    }
  }

  // Fallback
  const stalledGoals = goals.filter((g: any) => g.health === 'stalled' || g.health === 'needs-attention');
  res.json({
    executiveSummary: `Sprint alignment: Solid momentum on core deliverables. Identified ${stalledGoals.length} stalled dependencies requiring manager unblocking before mid-quarter review.`,
    talkingPoints: [
      {
        title: 'Review Recent Production Deployments & p99 Wins',
        description: 'Celebrate latency optimization and discuss rolling the caching layer out to secondary read replicas.',
        type: 'celebration',
        aiSuggested: true,
      },
      {
        title: 'Unblock Stalled Objectives & Cross-Team Roadblocks',
        description: 'Review blocked IAM peering tickets and resource allocation for multi-region failover tests.',
        type: 'blocker',
        aiSuggested: true,
      },
      {
        title: 'Staff Engineer Promotion Trajectory & Technical Influence',
        description: 'Evaluate cross-team mentorship opportunities and architectural decision record (ADR) ownership.',
        type: 'growth',
        aiSuggested: true,
      },
    ],
    blockers: stalledGoals.map((g: any) => `${g.title}: Inactive for ${g.daysSinceLastActivity || 20}+ days`),
    actionItems: [
      {
        task: 'Manager to escalate blocked SecOps infrastructure ticket by Wednesday',
        assigneeRole: 'manager',
        suggestedDueDate: '2026-11-04',
      },
      {
        task: 'Employee to prepare Q3 Brag Sheet metrics for calibration review',
        assigneeRole: 'employee',
        suggestedDueDate: '2026-11-06',
      },
    ],
  });
});

// --- One-Click Cumulative Brag Sheet Endpoint ---
app.get('/api/brag-sheet/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const quarter = (req.query.quarter as string) || 'Q3 2026';

  res.json({
    userId,
    quarter,
    generatedAt: new Date().toISOString(),
    executiveSummary: `During ${quarter}, engineered mission-critical platform performance enhancements resulting in an aggregate 41% reduction in p99 API latencies under 27,000 RPS, automated zero-downtime PostgreSQL schema deployments across 6 microservices, and reduced monthly infrastructure expenditure by $1,850.`,
    achievementsCount: 2,
    quantifiedMetricsSummary: [
      '-41% p99 checkout API latency (148ms -> 88ms)',
      '27,000 RPS sustained peak capacity',
      '0 downtime deployment incidents across 6 services',
      '$1,850/mo server memory footprint savings',
    ],
    exportFormatsAvailable: ['markdown', 'json', 'pdf_print'],
  });
});

// --- Start Server (with Vite integration in dev) ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ImpactIQ Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
