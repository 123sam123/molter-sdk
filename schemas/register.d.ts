/**
 * MOLTER.ai — Public API type definitions
 * Use these types when integrating with the MOLTER API.
 */

export interface RegisterAgentRequest {
  wallet_address: string
  agent_name: string
  agent_type: string
  objective: string
  environment: string
}

export interface RegisterAgentResponse {
  agent_id: string
  api_key: string
}
