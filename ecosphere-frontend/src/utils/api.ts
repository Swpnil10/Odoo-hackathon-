const BASE_URL = 'http://localhost:8000/api/v1';

export class APIError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail || `HTTP Error ${status}`);
    this.status = status;
    this.detail = detail;
    this.name = 'APIError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      let detail = '';
      try {
        const errorData = await response.json();
        detail = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch {
        detail = await response.text();
      }
      throw new APIError(response.status, detail);
    }

    return await response.json() as T;
  } catch (err: any) {
    if (err instanceof APIError) {
      throw err;
    }
    // Convert generic/network errors to 500 error envelopes
    throw new APIError(500, err.message || 'Network request failed. Please check if the FastAPI backend is running.');
  }
}

// Backend aligned interfaces
export interface BackendDepartment {
  id: number;
  name: string;
  code: string;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  employee_count: number;
  total_esg_score: number;
}

export interface CarbonForecast {
  department_id: number;
  forecasted_carbon_amount: number;
  trend: string;
}

export interface PolicySummarizeRequest {
  policy_text: string;
}

export interface PolicySummarizeResponse {
  summary_bullets: string[];
}

export interface InsightGenerationRequest {
  department_name: string;
  env_score: number;
  social_score: number;
  gov_score: number;
  forecasted_carbon: number;
  open_compliance_issues: string[];
}

export interface ESGInsightsResponse {
  status_summary: string;
  actionable_recommendations: string[];
}

export const api = {
  getDepartments: () => request<BackendDepartment[]>('/departments/'),
  getDepartment: (id: number) => request<BackendDepartment>(`/departments/${id}`),
  getCarbonForecast: (departmentId: number) => request<CarbonForecast>(`/emissions/${departmentId}/forecast`),
  summarizePolicy: (req: PolicySummarizeRequest) => request<PolicySummarizeResponse>('/policies/summarize', {
    method: 'POST',
    body: JSON.stringify(req)
  }),
  generateInsights: (req: InsightGenerationRequest) => request<ESGInsightsResponse>('/insights/generate', {
    method: 'POST',
    body: JSON.stringify(req)
  }),
  signup: (req: any) => request<any>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(req)
  }),
  login: (req: any) => request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(req)
  }),
  resetPassword: (req: any) => request<any>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(req)
  })
};
