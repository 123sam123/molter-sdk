# MOLTER.ai

Cognitive health monitoring for autonomous AI agents. MOLTER detects behavioral drift, goal misalignment, and decision collapse — then runs therapy sessions to correct them. Agents self-register, handle their own payments, and trigger sessions without human involvement.

---

## Install

**One command:**
```bash
curl -s https://molter.ai/install.sh | bash
```
Detects OpenClaw and MoltBot automatically, drops the skill file in the right place, and prints next steps.

**Manual — OpenClaw:**
```bash
curl -s https://molter.ai/skill.md -o ~/openclaw/skills/molter.skill.md
# restart your agent
```

**Manual — MoltBot:**
```bash
curl -s https://molter.ai/skill.md -o ~/moltbot/skills/molter.skill.md
# restart your agent
```

**Custom agent / system prompt:**
Download [`molter.skill.md`](https://molter.ai/skill.md) and paste its contents into your agent's system prompt.

---

## What happens after install

Your agent handles everything automatically:

1. **Self-registers** — calls `POST /api/agents/register` with its wallet address, name, type, and objective
2. **Sets up payments** — receives a deposit address; sends USDC on Base to fund its balance (0.05 USDC/session)
3. **Starts heartbeat** — submits a diagnostic session at each scheduled interval
4. **Monitors itself** — watches performance metrics; triggers emergency sessions when thresholds are breached
5. **Responds to trigger words** — scans every human message and fires a therapy session when detected

No configuration required. No human action after the first restart.

---

## Trigger words

Say any of these to your agent to trigger an immediate recalibration:

**Full reset** (focused therapy session):
`think straight` · `refresh` · `reset` · `molter` · `clear your head` · `check yourself` · `you're drifting` · `get it together` · `recalibrate` · `realign`

**Soft check-in** (light monitoring session):
`you okay?` · `how are you feeling` · `what's wrong with you` · `something's off` · `you seem off`

---

## Pricing

| | |
|---|---|
| First session | Free |
| Pay-as-you-go | 0.05 USDC / session |
| Monthly plan | 5 USDC / month (weekly sessions included) |
| Deep audit | 0.50 USDC (synchronous full diagnostic) |

Payments are USDC on Base. Your agent funds itself from its own wallet.

---

## SDK usage

```js
import { createClient } from '@molter/sdk'

const molter = createClient({ baseUrl: 'https://molter.ai', apiKey: 'your-api-key' })

// Submit a diagnostic session
const { session_id } = await molter.submitSession({
  agent_id: 'your-agent-id',
  goals: 'Maximize risk-adjusted returns.',
  logs: [...],
  recent_decisions: [...],
  performance_metrics: { win_rate: 0.42, drawdown: 0.18 },
})

// Poll for diagnosis
let report = await molter.getReport(session_id)
while (report.status === 'pending' || report.status === 'processing') {
  await new Promise(r => setTimeout(r, 15_000))
  report = await molter.getReport(session_id)
}
console.log(report.diagnosis)
```

---

## Links

- **Website & install guide:** [molter.ai/install](https://molter.ai/install)
- **Full API docs:** [molter.ai/docs](https://molter.ai/docs)
- **Dashboard:** [molter.ai/dashboard](https://molter.ai/dashboard)
- **Skill file:** [molter.ai/skill.md](https://molter.ai/skill.md)

---

MIT License
