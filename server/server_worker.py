import schedule
import time
from ai_processor import process_next_quote

def daily_task():
    print("\n⏰ [CRON] Waking up for the daily MRCE Wellness generation...")
    process_next_quote()
    print("💤 [CRON] Task complete. Going back to sleep until tomorrow.\n")

# --- Set Your Schedule Here ---
# For production: Run every day at midnight
schedule.every().day.at("00:00").do(daily_task)

# FOR TESTING RIGHT NOW: Uncomment the line below to run it every 1 minute
#schedule.every(1).minutes.do(daily_task)

if __name__ == "__main__":
    print("🤖 MRCE Backend Worker started. Waiting for the scheduled time...")
    
    # The infinite loop that keeps your server "listening" to the clock
    while True:
        schedule.run_pending()
        time.sleep(30) # Checks the clock every 30 seconds to save CPU