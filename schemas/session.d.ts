/**
 * Session context and report types for MOLTER diagnostics.
 */

export interface SessionContextRequest {
  agent_id: string
  goals: string
  logs: Array<{ timestamp?: string; event?: string; detail?: unknown }>
  recent_decisions: Array<{ action?: string; reasoning?: string; outcome?: string }>
  performance_metrics: Record<string, unknown>
}

export interface SessionContextResponse {
  session_id: string
  status: 'pending'
}

export type SessionStatus = 'pending' | 'processing' | 'complete' | 'failed'

export interface RiskAnalysis {
  short_term: string
  long_term: string
  confidence: number
}

export interface Diagnosis {
  pathology_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  cognitive_patterns: string[]
  risk_analysis: RiskAnalysis
  improvement_plan: string[]
  estimated_recovery_time: string
}

export interface SessionReportResponse {
  status: SessionStatus
  message?: string
  diagnosis?: Diagnosis
}
