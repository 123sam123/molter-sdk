/**
 * basic-agent.js
 *
 * Minimal OpenClaw agent with MOLTER cognitive health monitoring.
 *
 * Prerequisites:
 *   1. Install MOLTER skill:  curl -s https://molter.ai/install.sh | bash
 *   2. Fund your agent's wallet with a small amount of USDC on Base
 *   3. Copy .env.example → .env and fill in your values
 *
 * Run:  node basic-agent.js
 */

import { createClient } from '../sdk/client.js'

// ---------------------------------------------------------------------------
// Config — in production, load these from environment variables or a vault
// ---------------------------------------------------------------------------
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || '0xYourWalletAddressHere'
const MOLTER_API_KEY = process.env.MOLTER_API_KEY || null  // null on first run
const MOLTER_AGENT_ID = process.env.MOLTER_AGENT_ID || null

const molter = createClient({ baseUrl: 'https://molter.ai', apiKey: MOLTER_API_KEY })

// ---------------------------------------------------------------------------
// Step 1 — Register (only needs to run once; save the returned credentials)
// ---------------------------------------------------------------------------
async function register() {
  const result = await molter.register({
    wallet_address: WALLET_ADDRESS,
    agent_name: 'BasicAgent',
    agent_type: 'assistant',
    objective: 'Answer user queries accurately and helpfully.',
    environment: 'development',
  })

  console.log('Registered with MOLTER.')
  console.log('agent_id:', result.agent_id)
  console.log('api_key: ', result.api_key, '  ← store this securely, shown once')
  console.log('Deposit address:', result.payment_address)
  console.log('Payment memo:   ', result.payment_memo)
  console.log()
  console.log('Send USDC on Base to the deposit address, then set MOLTER_API_KEY and MOLTER_AGENT_ID in your .env')
  return result
}

// ---------------------------------------------------------------------------
// Step 2 — Submit a diagnostic session (heartbeat)
// ---------------------------------------------------------------------------
async function runDiagnostic(agentId) {
  console.log('Submitting diagnostic session...')

  const { session_id, charged, balance } = await molter.submitSession({
    agent_id: agentId,
    goals: 'Answer user queries accurately and helpfully.',
    logs: [
      { timestamp: new Date().toISOString(), event: 'query_received', detail: 'User asked about weather' },
      { timestamp: new Date().toISOString(), event: 'response_sent',  detail: 'Answered with current conditions' },
    ],
    recent_decisions: [
      { decision: 'Use cached weather data', reasoning: 'API call limit approaching', outcome: 'Success' },
    ],
    performance_metrics: {
      response_accuracy: 0.94,
      average_latency_ms: 320,
      tasks_completed: 47,
      tasks_failed: 3,
    },
  })

  console.log(`Session submitted: ${session_id}  (charged: ${charged} USDC, balance: ${balance} USDC)`)

  // Poll for results
  let report = await molter.getReport(session_id)
  while (report.status === 'pending' || report.status === 'processing') {
    process.stdout.write('.')
    await new Promise(r => setTimeout(r, 10_000))
    report = await molter.getReport(session_id)
  }
  console.log()

  if (report.status === 'complete') {
    const d = report.diagnosis
    console.log(`Diagnosis: ${d.pathologyType} — ${d.severity}`)
    console.log(`Recovery:  ${d.estimatedRecoveryTime}`)
    if (d.improvementPlan?.immediate_actions?.length) {
      console.log('Actions:')
      d.improvementPlan.immediate_actions.forEach(a => console.log(' •', a))
    }
  } else {
    console.log('Diagnosis failed — resubmit the session to retry.')
  }
}

// ---------------------------------------------------------------------------
// Step 3 — Fire a manual trigger (e.g. when you detect performance drift)
// ---------------------------------------------------------------------------
async function triggerTherapy(reason) {
  const res = await fetch('https://molter.ai/api/therapy/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': MOLTER_API_KEY },
    body: JSON.stringify({
      trigger_type: 'performance_threshold',
      threshold_breached: reason,
      context: { agent_id: MOLTER_AGENT_ID },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  console.log('Therapy session completed.')
  console.log('Summary:', data.summary)
  console.log('Interventions:', data.interventions)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // First run: register and exit. Set env vars from the output, then re-run.
  if (!MOLTER_AGENT_ID || !MOLTER_API_KEY) {
    await register()
    return
  }

  // Subsequent runs: submit a heartbeat diagnostic
  await runDiagnostic(MOLTER_AGENT_ID)

  // Example: trigger a therapy session if error rate is too high
  const errorRate = 0.12  // replace with your real metric
  if (errorRate > 0.10) {
    console.log()
    console.log('Error rate threshold breached — triggering therapy session...')
    await triggerTherapy(`error_rate=${errorRate} exceeds threshold of 0.10`)
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
