// Error Handling für Session Management

export class UnauthorizedError extends Error {
  constructor(message: string = 'Access denied. You can only access your own surveys.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class SurveyNotFoundError extends Error {
  constructor(message: string = 'Survey not found or not available.') {
    super(message);
    this.name = 'SurveyNotFoundError';
  }
}

/**
 * Behandelt API-Fehler und wirft spezifische Error-Typen
 */
export function handleApiError(error: any): never {
  if (error.message?.includes('403')) {
    throw new UnauthorizedError();
  }
  
  if (error.message?.includes('404')) {
    throw new SurveyNotFoundError();
  }
  
  // Allgemeiner Fehler
  throw error;
}

/**
 * Zeigt eine benutzerfreundliche Fehlermeldung an
 */
export function getErrorMessage(error: any): string {
  if (error instanceof UnauthorizedError) {
    return 'Du hast keinen Zugriff auf diese Umfrage. Du kannst nur deine eigenen Umfragen verwalten.';
  }
  
  if (error instanceof SurveyNotFoundError) {
    return 'Diese Umfrage wurde nicht gefunden oder ist nicht mehr verfügbar.';
  }
  
  // Fallback für andere Fehler
  return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.';
}
