import apiFetch from "./client"

export interface PortalMeResponse {
  id: string
  full_name: string
  email: string
  role: string
  customer_id: string
  customer_name?: string
}

export async function apiGetPortalMe() {
  return apiFetch<PortalMeResponse>("/portal/me")
}
