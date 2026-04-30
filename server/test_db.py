import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# Get these from your Supabase Dashboard -> Project Settings -> API
URL = os.getenv('SUPABASE_URL')
KEY = os.getenv('SUPABASE_ANON_KEY')

supabase = create_client(URL, KEY)

try:
    # Just check if we can see the tables you just made
    res = supabase.table("raw_quotes").select("*").execute()
    print("✅ Connection Successful! Found tables.")
except Exception as e:
    print(f"❌ Connection Failed: {e}")