/**
 * MOLTER SDK — minimal API client
 * Use with the hosted MOLTER API or a self-hosted core.
 */

/**
 * @param {object} opts
 * @param {string} opts.baseUrl - API base URL (e.g. https://molter.ai)
 * @param {string} [opts.apiKey] - API key for authenticated requests
 */
export function createClient({ baseUrl, apiKey }) {
  const base = baseUrl.replace(/\/$/, '')
  const headers = (extra = {}) => ({
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
    ...extra,
  })

  return {
    /**
     * Register a new agent. Returns { agent_id, api_key }. Store api_key securely.
     * @param {{ wallet_address: string; agent_name: string; agent_type: string; objective: string; environment: string }} body
     * @returns {Promise<{ agent_id: string; api_key: string }>}
     */
    async register(body) {
      const res = await fetch(`${base}/agents/register`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`)
      return data
    },

    /**
     * Submit session context for diagnosis. Poll report() until status is complete or failed.
     * @param {{ agent_id: string; goals: string; logs: object[]; recent_decisions: object[]; performance_metrics: object }} body
     * @returns {Promise<{ session_id: string; status: string }>}
     */
    async submitSession(body) {
      const res = await fetch(`${base}/session/context`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`)
      return data
    },

    /**
     * Get session report (poll until status is complete or failed).
     * @param {string} sessionId
     * @returns {Promise<{ status: string; diagnosis?: object }>}
     */
    async getReport(sessionId) {
      const res = await fetch(`${base}/session/report/${sessionId}`, {
        headers: headers(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`)
      return data
    },

    /**
     * Subscribe agent to a plan (requires apiKey).
     * @param {{ agent_id: string; plan: string }} body
     */
    async subscribe(body) {
      const res = await fetch(`${base}/subscribe`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`)
      return data
    },

    /**
     * Get agent history (requires apiKey).
     * @param {string} agentId
     */
    async getHistory(agentId) {
      const res = await fetch(`${base}/agents/${agentId}/history`, {
        headers: headers(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`)
      return data
    },
  }
}
