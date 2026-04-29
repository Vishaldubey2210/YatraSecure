import { fetchWithAuth } from './api';

export type UserType = "normal" | "asthma" | "female";

export interface SafetyScoreRequest {
  user_type: UserType;
  is_night: boolean;
  lat: number;
  lon: number;
}

export interface SafetyScoreResponse {
  safety_score: number;          // 0–100
  alert_band: string;            // e.g. "🟢 Safe" | "🟡 Moderate" | "🔴 High Risk"
  explanations: string[];        // array of text explanations from the model
}

/**
 * Calls the NestJS backend which proxies to the local ML FastAPI backend
 * to get a real safety score. Falls back gracefully if the ML service is unreachable.
 */
export async function fetchSafetyScore(
  payload: SafetyScoreRequest
): Promise<SafetyScoreResponse> {
  const response = await fetchWithAuth('/safety/score', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Safety API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<SafetyScoreResponse>;
}
