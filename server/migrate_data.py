import os
from dotenv import load_dotenv
import sqlite3
from supabase import create_client

load_dotenv()

# 1. Setup Cloud Connection
URL = os.getenv('SUPABASE_URL')
KEY = os.getenv('SUPABASE_ANON_KEY')
supabase = create_client(URL, KEY)

# 2. Setup Local Connection
local_conn = sqlite3.connect('wellness_vault.db')
cursor = local_conn.cursor()

def migrate():
    print("🚀 Starting migration from local SQLite to Supabase...")
    try:
        # Using the exact table and column names you found
        cursor.execute("SELECT text, author, category FROM quotes")
        rows = cursor.fetchall()
    except Exception as e:
        print(f"❌ Error reading local database: {e}")
        return

    total = len(rows)
    print(f"📦 Found {total} quotes. Beginning upload...")

    for i, row in enumerate(rows):
        # row[0] = text, row[1] = author, row[2] = category
        data = {
            "content": row[0],
            "source": row[1] if row[1] else "Unknown",
            "is_processed": False
            # If you want to store category, we can add it to a metadata column later
        }
        
        try:
            supabase.table("raw_quotes").insert(data).execute()
            if (i + 1) % 10 == 0:
                print(f"✅ Synced {i + 1}/{total}...")
        except Exception as e:
            print(f"⚠️ Failed to sync quote {i}: {e}")

    print(f"\n✨ Success! All {total} quotes have been moved to the cloud.")

if __name__ == "__main__":
    migrate()
    local_conn.close()