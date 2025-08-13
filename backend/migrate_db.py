"""
Migrationsskript für die Umstellung auf 4-stellige IDs und Ablaufdatum
"""
import sqlite3
from datetime import datetime, timedelta
import random

def migrate_database():
    # Verbindung zur Datenbank
    conn = sqlite3.connect('./survey_tool.db')
    cursor = conn.cursor()
    
    try:
        # 1. Prüfe ob die expires_at Spalte bereits existiert
        cursor.execute("PRAGMA table_info(surveys)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'expires_at' not in columns:
            print("Füge expires_at Spalte hinzu...")
            # Füge expires_at Spalte hinzu
            cursor.execute("ALTER TABLE surveys ADD COLUMN expires_at DATETIME")
            
            # Setze expires_at für bestehende Umfragen (7 Tage nach created_at)
            cursor.execute("SELECT id, created_at FROM surveys")
            surveys = cursor.fetchall()
            
            for survey_id, created_at_str in surveys:
                created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                expires_at = created_at + timedelta(days=7)
                cursor.execute("UPDATE surveys SET expires_at = ? WHERE id = ?", 
                             (expires_at.isoformat(), survey_id))
            
            print(f"Ablaufdatum für {len(surveys)} bestehende Umfragen gesetzt.")
        
        # 2. Prüfe und konvertiere IDs zu 4-stelligen Zahlen
        cursor.execute("SELECT id FROM surveys WHERE LENGTH(id) > 4")
        long_id_surveys = cursor.fetchall()
        
        if long_id_surveys:
            print(f"Konvertiere {len(long_id_surveys)} Umfragen zu 4-stelligen IDs...")
            
            # Sammle bereits verwendete 4-stellige IDs
            cursor.execute("SELECT id FROM surveys WHERE LENGTH(id) = 4")
            used_ids = {row[0] for row in cursor.fetchall()}
            
            for (old_id,) in long_id_surveys:
                # Generiere neue 4-stellige ID
                while True:
                    new_id = str(random.randint(1000, 9999))
                    if new_id not in used_ids:
                        used_ids.add(new_id)
                        break
                
                # Update der Umfrage
                cursor.execute("UPDATE surveys SET id = ? WHERE id = ?", (new_id, old_id))
                
                # Update der zugehörigen Fragen
                cursor.execute("UPDATE questions SET survey_id = ? WHERE survey_id = ?", (new_id, old_id))
                
                # Update der zugehörigen Antworten
                cursor.execute("UPDATE responses SET survey_id = ? WHERE survey_id = ?", (new_id, old_id))
                
                print(f"Umfrage {old_id} -> {new_id}")
        
        conn.commit()
        print("Migration erfolgreich abgeschlossen!")
        
    except Exception as e:
        print(f"Fehler bei der Migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starte Migration...")
    migrate_database()
    print("Migration beendet.")
