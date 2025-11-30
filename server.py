import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Load environment variables
load_dotenv()
api_key = os.getenv("API_KEY")

# Initialize Flask app with static files in current directory
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Configure Gemini API
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.5-flash")  # Try this alternative model

# Function to create interview prompt
def create_interview_prompt(message, history):
    # Format the conversation history for the model
    formatted_history = ""
    for entry in history:
        role = entry.get('role', '')
        content = entry.get('content', '')
        if role and content:
            formatted_history += f"{role.capitalize()}: {content}\n\n"
    
    # Create the prompt with technical interview focus
    prompt = f"""
    You are an AI Interview Practice Assistant specializing in technical interviews.
    Focus on programming, data structures, algorithms, and system design topics.
    Provide detailed, educational responses with examples when appropriate.
    For coding questions, include well-commented code examples.
    
    Previous conversation:
    {formatted_history}
    
    User's latest question: {message}
    """
    
    return prompt

# API endpoint for chat
@app.route('/api/chat', methods=['POST'])
def generate():
    try:
        # Get request data
        data = request.json
        message = data.get('message', '')
        history = data.get('history', [])
        
        # Validate API key
        if not api_key:
            return jsonify({'error': 'API key not configured'}), 500
        
        # Create the prompt
        prompt = create_interview_prompt(message, history)
        
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        return jsonify({'response': response.text})
    
    except Exception as e:
        error_message = str(e)
        
        # Handle specific error cases
        if "API key not valid" in error_message or "invalid" in error_message.lower():
            return jsonify({'error': 'Invalid API key'}), 401
        elif "quota" in error_message.lower() or "limit" in error_message.lower():
            return jsonify({'error': 'API quota exceeded'}), 429
        elif "not found" in error_message.lower() or "model" in error_message.lower():
            return jsonify({'error': 'Model not found or unavailable'}), 404
        elif "connect" in error_message.lower() or "network" in error_message.lower():
            return jsonify({'error': 'Network connectivity issue'}), 503
        
        # Generic error fallback
        return jsonify({'error': f'An error occurred: {error_message}'}), 500

# Serve index.html
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Serve other static files explicitly
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# Main entry point
if __name__ == "__main__":
    # Set the port based on environment variable or default to 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)  # Set debug=True during development