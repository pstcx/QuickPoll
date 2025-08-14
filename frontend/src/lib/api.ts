// Zentrale API-Konfiguration und Methoden für QuickPoll

//const BASE_URL = 'https://quick-poll-a49h.vercel.app';
const BASE_URL = 'http://localhost:8000';

// API-Typen (synchron mit Backend)
export interface Survey {
  id: string;
  title: string;
  description?: string;
  status: 'ready' | 'active' | 'finished';
  created_at: string;
  expires_at: string;
  questions: Question[];
  response_count: number;
}

export interface Question {
  id: string;
  survey_id: string;
  title: string;
  type: 'text' | 'single_choice' | 'multiple_choice' | 'rating' | 'yes_no';
  options?: string[];
  required: boolean;
  description?: string;
  order: number;
  created_at: string;
}

export interface CreateSurveyData {
  title: string;
  description?: string;
  is_active: boolean;
  questions: CreateQuestionData[];
}

export interface CreateQuestionData {
  title: string;
  type: 'text' | 'single_choice' | 'multiple_choice' | 'rating' | 'yes_no';
  options?: string[];
  required: boolean;
  description?: string;
}

// Fehlende Response-Typen hinzugefügt
export interface AnswerSubmission {
  question_id: string;
  answer: string | string[] | number | boolean;
}

export interface ResponseSubmission {
  survey_id: string;
  answers: AnswerSubmission[];
  participant_name?: string;
}

export interface Response {
  id: string;
  survey_id: string;
  answers: AnswerSubmission[];
  participant_name?: string;
  submitted_at: string;
}

// Health Check Response Type
export interface HealthResponse {
  status: string;
  database: string;
  surveys_count: number;
  responses_count: number;
  timestamp: string;
}

// Basis-Fetch-Funktion mit Fehlerbehandlung
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// API-Methoden

/**
 * Alle Umfragen abrufen
 */
export async function getSurveys(): Promise<Survey[]> {
  return apiRequest<Survey[]>('/surveys/');
}

/**
 * Eine spezifische Umfrage abrufen
 */
export async function getSurvey(id: string): Promise<Survey> {
  return apiRequest<Survey>(`/surveys/${id}`);
}

/**
 * Neue Umfrage erstellen
 */
export async function createSurvey(surveyData: CreateSurveyData): Promise<Survey> {
  return apiRequest<Survey>('/surveys/', {
    method: 'POST',
    body: JSON.stringify(surveyData),
  });
}

/**
 * Umfrage aktualisieren
 */
export async function updateSurvey(id: string, surveyData: Partial<CreateSurveyData>): Promise<Survey> {
  return apiRequest<Survey>(`/surveys/${id}`, {
    method: 'PUT',
    body: JSON.stringify(surveyData),
  });
}

/**
 * Umfrage löschen
 */
export async function deleteSurvey(id: string): Promise<void> {
  return apiRequest<void>(`/surveys/${id}`, {
    method: 'DELETE',
  });
}

/**
 * API-Gesundheitsstatus prüfen
 */
export async function getHealthStatus(): Promise<HealthResponse> {
  return apiRequest('/health/');
}

/**
 * Antworten für eine Umfrage abrufen
 */
export async function getSurveyResponses(surveyId: string): Promise<Response[]> {
  return apiRequest<Response[]>(`/surveys/${surveyId}/responses`);
}

/**
 * Neue Antwort für eine Umfrage erstellen
 */
export async function submitSurveyResponse(responseData: ResponseSubmission): Promise<Response> {
  return apiRequest(`/responses/`, {
    method: 'POST',
    body: JSON.stringify(responseData),
  });
}

/**
 * Status einer Umfrage ändern
 */
export async function updateSurveyStatus(surveyId: string, status: 'ready' | 'active' | 'finished'): Promise<Survey> {
  return apiRequest(`/surveys/${surveyId}/status?status=${status}`, {
    method: 'PUT',
  });
}

/**
 * Umfrage-Ergebnisse als Excel exportieren
 */
export async function exportSurveyToExcel(surveyId: string): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/surveys/${surveyId}/export/`, {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.blob();
}
