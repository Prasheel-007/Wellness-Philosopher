from flask import Flask, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

quotes = [
    {"text": "The secret of getting ahead is getting started.", "author": "Mark Twain"},
    {"text": "Quality is not an act, it is a habit.", "author": "Aristotle"},
    {"text": "Everything you've ever wanted is on the other side of fear.", "author": "George Addair"},
    {"text": "Peace comes from within. Do not seek it without.", "author": "Buddha"},
    {"text": "Knowing yourself is the beginning of all wisdom.", "author": "Aristotle"}
]

@app.route('/daily-wisdom', methods=['GET'])
def get_wisdom():
    return jsonify(random.choice(quotes))

if __name__ == '__main__':
    # host='0.0.0.0' allows connections from your phone
    app.run(host='0.0.0.0', port=5000, debug=True)