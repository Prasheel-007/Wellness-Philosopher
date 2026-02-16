from flask import Flask, jsonify, render_template_string, request
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# --- SECURE CONFIGURATION ---
# No real passwords are in this file anymore!
ADMIN_PASS = os.environ.get("ADMIN_PASS", "DEFAULT_PLACEHOLDER_PASS")

def get_db():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'wellness_vault.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def id_to_date(quote_id):
    start_date = datetime(2026, 1, 1)
    target_date = start_date + timedelta(days=int(quote_id) - 1)
    return target_date.strftime('%b %d, %Y (%A)')

@app.route('/daily-wisdom')
def get_daily_wisdom():
    day_of_year = datetime.now().timetuple().tm_yday
    db = get_db()
    quote = db.execute('SELECT text, author FROM quotes WHERE id = ?', (day_of_year,)).fetchone()
    db.close()
    return jsonify(dict(quote)) if quote else jsonify({"text": "Stay consistent.", "author": "Wellness Club"})

@app.route('/admin/view/<password>')
def admin_dashboard(password):
    if password != ADMIN_PASS:
        return "Access Denied", 403
    
    view_mode = request.args.get('mode', 'weekly')
    db = get_db()
    
    if view_mode == 'all':
        quotes = db.execute('SELECT * FROM quotes ORDER BY id ASC').fetchall()
    else:
        day_of_year = datetime.now().timetuple().tm_yday
        quotes = db.execute('SELECT * FROM quotes WHERE id >= ? LIMIT 7', (day_of_year,)).fetchall()
    
    db.close()

    html = """
    <body style="font-family: 'Segoe UI', sans-serif; padding: 40px; background: #f0f2f5; color: #002147;">
        <div style="max-width: 900px; margin: auto;">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h1>MRCE Wellness Admin</h1>
                <nav>
                    <a href="?mode=weekly" style="margin-right: 15px; color: {{ '#FF6600' if mode=='weekly' else '#002147' }}; font-weight: bold; text-decoration: none;">WEEKLY VIEW</a>
                    <a href="?mode=all" style="color: {{ '#FF6600' if mode=='all' else '#002147' }}; font-weight: bold; text-decoration: none;">FULL VAULT</a>
                </nav>
            </header>
            {% for q in quotes %}
            <div style="background: white; padding: 25px; margin-bottom: 20px; border-radius: 12px; border-left: 6px solid #FF6600;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-weight: bold; color: #666;">ID: {{ q.id }}</span>
                    <span style="font-weight: bold; color: #FF6600;">{{ get_date(q.id) }}</span>
                </div>
                <p style="font-size: 1.2em; font-style: italic;">"{{ q.text }}"</p>
                <p style="text-align: right; font-weight: bold;">— {{ q.author }}</p>
            </div>
            {% endfor %}
        </div>
    </body>
    """
    return render_template_string(html, quotes=quotes, mode=view_mode, get_date=id_to_date)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)