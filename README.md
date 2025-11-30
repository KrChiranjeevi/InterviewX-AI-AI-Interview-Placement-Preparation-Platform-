# 🤖 AI Interview Practice Assistant

An interactive chatbot designed to help users practice technical interview questions, featuring a modern UI built with **Tailwind CSS** and a realistic **typing effect**. This assistant specializes in topics like **Programming, Data Structures, Algorithms, and System Design**.

## ✨ Features

* **Technical Focus**: Specialized in core technical interview subjects, including programming, data structures, algorithms, and system design.
* **Modern UI**: Built with **Tailwind CSS** for a clean, responsive, and visually appealing design.
* **Interactive Elements**: Features Z-index effects, hover animations, and a realistic **typing effect** for bot responses in the chat.
* **Dark/Light Mode**: Easily toggle between themes, with the preference stored locally.
* **Topic Selection**: Quick access buttons for common interview topics (**Data Structures**, **Algorithms**, **System Design**, **JavaScript**, **Python**).
* **Code Formatting**: Proper syntax highlighting and formatting for code examples provided in the responses.
* **DSA Implementation**: The codebase utilizes data structures like **PriorityQueue** and **Stack** (in JavaScript) to manage conversation history and message queues, demonstrating practical DSA use.

## ⚙️ Tech Stack

This project operates as a full-stack application:

### Frontend
* **HTML**: For the structure of the web page.
* **JavaScript (ES6+)**: For client-side logic, DOM manipulation, and handling chat interactions.
* **Tailwind CSS**: Utility-first CSS framework for rapid and modern styling.

### Backend
* **Python**: For server-side logic and API handling.
* **Flask**: A lightweight web framework.
* **Gemini API**: Used to generate AI chat responses (specifically the `gemini-2.5-flash` model).
* **`python-dotenv`**: To manage environment variables (like the API key).

### Data Structures Used
* `PriorityQueue` (JavaScript)
* `Stack` (JavaScript)

## 🚀 Setup and Running Instructions

Follow these steps to set up and run the application on your local machine.

### 1. Clone the Repository

First, clone the GitHub repository:

```bash
git clone [https://github.com/YourUsername/ai-interview-practice-assistant.git](https://github.com/YourUsername/ai-interview-practice-assistant.git)
cd ai-interview-practice-assistant

# Windows/macOS/Linux
python -m venv venv
source venv/bin/activate  # On Windows, use: .\venv\Scripts\activate
pip install flask flask-cors google-generativeai python-dotenv


python server.py
