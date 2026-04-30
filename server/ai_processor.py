import os
import json
from dotenv import load_dotenv
from supabase import create_client
from groq import Groq

load_dotenv()

# --- Configuration ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
GROK_API_KEY = os.getenv("GROK_API_KEY")

# Initialize Clients
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
groq_client = Groq(api_key=GROK_API_KEY)

def process_next_quote():
    print("🔍 Looking for an unprocessed quote...")
    
    response = supabase.table("raw_quotes").select("*").eq("is_processed", False).limit(1).execute()
    
    if not response.data:
        print("✅ No new quotes to process. The backlog is clean!")
        return

    raw_quote = response.data[0]
    raw_text = raw_quote.get("content", "")
    author = raw_quote.get("source", "Unknown")
    quote_id = raw_quote.get("id")
    
    print(f"🧠 Processing quote ID {quote_id}...")

    # --- THE MASTER CURATOR PROMPT ---
    system_prompt = """
    You are the Master Curator for a daily campus Wellness App. Your goal is to create an experiential loop that sticks with a student from morning until night.
    
    Rules:
    1. QUOTE: Keep the original philosophy short (maximum 15-20 words). It must be thought-provoking and deep.
    2. DESCRIPTION: Write 2 to 3 sentences decoding the core logic of the quote. Explain its hidden meaning so the student understands the concept without being confused. 
    3. TASK: Assign one specific, real-world action to do today. It must be an action that, once completed, makes the student the living example of the philosophy by the end of the day.
    4. Return ONLY a valid JSON object with exact keys: {"quote_text": "...", "description": "...", "task_dare": "..."}
    """

    user_prompt = f"Original Philosophy by {author}: {raw_text}"

    try:
        # Using the updated, fast open-source model
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.75, # Slightly higher for deeper philosophical connections
            response_format={"type": "json_object"}
        )

        # Parse the JSON response
        ai_response = json.loads(chat_completion.choices[0].message.content)
        final_quote = ai_response["quote_text"]
        description = ai_response["description"]
        task_dare = ai_response["task_dare"]

        # Clean, professional terminal output
        print(f"\n[SUCCESS] AI Processing Complete:")
        print(f"Quote: {final_quote}")
        print(f"Description: {description}")
        print(f"Task: {task_dare}\n")

        # Save all three parts to the Production Box
        prod_data = {
            "quote_text": final_quote,
            "description": description,
            "task_dare": task_dare,
            "tag": "daily_experience"
        }
        supabase.table("production_quotes").insert(prod_data).execute()

        # Mark original as processed
        supabase.table("raw_quotes").update({"is_processed": True}).eq("id", quote_id).execute()
        
        print(f"💾 Successfully moved to Production and marked as processed!")

    except Exception as e:
        print(f"❌ Error during AI processing: {e}")

if __name__ == "__main__":
    process_next_quote()
