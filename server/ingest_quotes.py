import requests
import sqlite3
import time
import random

TARGET_COUNT = 500
KEYWORDS = ["life", "wisdom", "mind", "kindness", "peace", "success", "future", "heart", 
            "hope", "strength", "soul", "humanity", "morality", "action", "change"]

def setup_database():
    conn = sqlite3.connect('wellness_vault.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS quotes 
                     (id INTEGER PRIMARY KEY, text TEXT NOT NULL, author TEXT NOT NULL, category TEXT)''')
    conn.commit()
    return conn

# Provider 1: ZenQuotes
def get_zen():
    try:
        r = requests.get("https://zenquotes.io/api/quotes", timeout=5)
        return [{"q": i['q'], "a": i['a']} for i in r.json()]
    except: return []

# Provider 2: Quotable
def get_quotable():
    try:
        r = requests.get("https://quotable.io/quotes/random?limit=10", timeout=5)
        return [{"q": i['content'], "a": i['author']} for i in r.json()]
    except: return []

# Provider 3: Forismatic
def get_forismatic():
    try:
        # Returns a single random quote
        r = requests.get("http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en", timeout=5)
        data = r.json()
        return [{"q": data['quoteText'], "a": data['quoteAuthor']}]
    except: return []

def fetch_and_filter():
    conn = setup_database()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM quotes")
    collected = cursor.fetchone()[0]
    providers = [get_zen, get_quotable, get_forismatic]

    print(f"Multi-Source Ingestion Active. Starting from: {collected}/500")

    while collected < TARGET_COUNT:
        # Pick a random provider to rotate traffic
        provider = random.choice(providers)
        print(f"Polling {provider.__name__}...")
        
        batch = provider()
        new_this_round = 0

        for item in batch:
            text, author = item['q'], item['a']
            if not author: author = "Unknown"

            # Filter for Wellness/Humanity domain
            if any(word in text.lower() for word in KEYWORDS) or collected < 150:
                cursor.execute("SELECT id FROM quotes WHERE text = ?", (text,))
                if not cursor.fetchone():
                    collected += 1
                    cursor.execute("INSERT INTO quotes (id, text, author, category) VALUES (?, ?, ?, ?)", 
                                   (collected, text, author, "Wellness"))
                    new_this_round += 1
                    if collected >= TARGET_COUNT: break
        
        conn.commit()
        print(f"Success: Added {new_this_round} quotes. Total: {collected}/500")
        
        # Smart Sleep: Wait longer if we got no new data to avoid bans
        sleep_time = 5 if new_this_round == 0 else 1
        time.sleep(sleep_time)

    conn.close()
    print("VAULT FULLY ASSEMBLED (500/500).")

if __name__ == "__main__":
    fetch_and_filter()