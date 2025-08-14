"""
Datenbank-Migration für session_id Feld in ResponseDB

Führe dieses Skript aus, um das neue session_id Feld zu existing responses hinzuzufügen
"""

import sqlite3

def add_session_id_column():
    try:
        # Verbindung zur Datenbank
        conn = sqlite3.connect('survey_tool.db')
        cursor = conn.cursor()
        
        # Prüfe ob die Spalte bereits existiert
        cursor.execute("PRAGMA table_info(responses)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'session_id' not in columns:
            # Füge die session_id Spalte hinzu
            cursor.execute('ALTER TABLE responses ADD COLUMN session_id TEXT')
            print("✅ session_id Spalte erfolgreich hinzugefügt")
        else:
            print("ℹ️  session_id Spalte existiert bereits")
        
        conn.commit()
        conn.close()
        print("✅ Datenbank-Migration abgeschlossen")
        
    except Exception as e:
        print(f"❌ Fehler bei der Migration: {e}")

if __name__ == "__main__":
    add_session_id_column()
