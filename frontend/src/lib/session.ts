// Session Management für QuickPoll
// Verwaltet Browser-eindeutige Session-IDs ohne Login-System

const SESSION_ID_KEY = 'quickpoll_session_id';

/**
 * Generiert eine neue eindeutige Session-ID
 */
function generateSessionId(): string {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  return `${uuid}-${timestamp}`;
}

/**
 * Ruft die aktuelle Session-ID ab oder erstellt eine neue
 */
export function getSessionId(): string {
  // Erst aus localStorage versuchen
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    // Neue Session-ID generieren und speichern
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Setzt eine neue Session-ID (normalerweise nicht benötigt)
 */
export function setSessionId(sessionId: string): void {
  localStorage.setItem(SESSION_ID_KEY, sessionId);
}

/**
 * Löscht die aktuelle Session-ID (Logout-Simulation)
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_ID_KEY);
}

/**
 * Prüft ob eine gültige Session vorhanden ist
 */
export function hasValidSession(): boolean {
  const sessionId = localStorage.getItem(SESSION_ID_KEY);
  return sessionId !== null && sessionId.length > 0;
}

/**
 * Session-Informationen für Debugging
 */
export function getSessionInfo() {
  const sessionId = getSessionId();
  const created = sessionId.split('-').pop();
  const createdDate = created ? new Date(parseInt(created)) : null;
  
  return {
    sessionId,
    created: createdDate,
    isValid: hasValidSession()
  };
}
