<div align="center">
  <img src="https://socialify.git.ci/KrChiranjeevi/AI-Interview-Practice-Assistant/image?font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Dark" alt="InterviewX AI Banner" width="800" />

  # InterviewX AI
  **Intelligent Interview Preparation & Recruitment Simulation Platform**

  *An AI-powered platform for interview preparation, company recruitment simulation, coding practice, resume analysis, and personalized career guidance.*

  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
    <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
    <img src="https://img.shields.io/badge/Groq-f3f4f6?style=for-the-badge&logo=groq&logoColor=black" alt="Groq" />
    <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
  </p>
  <p align="center">
    <img src="https://img.shields.io/github/stars/KrChiranjeevi/AI-Interview-Practice-Assistant?style=social" alt="GitHub Stars" />
    <img src="https://img.shields.io/github/forks/KrChiranjeevi/AI-Interview-Practice-Assistant?style=social" alt="GitHub Forks" />
    <img src="https://img.shields.io/github/license/KrChiranjeevi/AI-Interview-Practice-Assistant?style=social" alt="License" />
  </p>
</div>

---

## 📖 Overview

**InterviewX AI** is a complete, enterprise-grade AI-powered interview preparation platform. It is engineered to bridge the gap between theoretical knowledge and real-world placement exams by offering highly authentic mock interviews and evaluations. 

Whether you are preparing for FAANG or major IT service companies, InterviewX AI provides an end-to-end simulation of company-specific hiring processes.

Our comprehensive suite of tools includes:
- **AI Mock Interviews:** Dynamic verbal and technical questioning.
- **Company Recruitment Simulation:** Authentic multi-round hiring workflows.
- **ATS Resume Analyzer:** AI-driven feedback for resume optimization.
- **AI Coding Practice:** A LeetCode-style platform with intelligent code analysis.
- **Company-specific Interview Preparation:** Round-by-round guidance.
- **Progress Tracking:** Deep metrics on your interview readiness.
- **Reports & Analytics:** 100% explainable AI grading.
- **AI Career Roadmap:** Step-by-step personalized learning paths.
- **Community:** A collaborative space for job seekers.

---

## ✨ Features

| Module | Description |
| :--- | :--- |
| 🤖 **AI Mock Interviews** | Adaptive AI interviewer that dynamically generates technical and behavioral questions based on user responses and role. |
| 🏢 **Recruitment Simulation** | Emulates the exact hiring rounds of companies like Amazon, Google, Microsoft, TCS, Infosys, and Accenture. |
| 📝 **MCQ Assessment Engine** | Professional timed mock tests for Aptitude, Logical Reasoning, Quantitative, and Verbal Ability rounds. |
| 💻 **Coding Practice Hub** | Fully integrated Monaco code editor with support for DSA, React, Node.js, and SQL, providing instant AI code review. |
| 📄 **Resume Analyzer** | ATS compatibility scoring, keyword analysis, and personalized suggestions to improve your resume. |
| 📊 **Advanced Analytics** | Generates detailed post-interview reports with accuracy, communication, technical, and confidence scores. |
| 🗺️ **AI Career Roadmap** | Auto-generates weekly milestones and study paths based on your interview weaknesses and performance gaps. |

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (with Vite)
- **Tailwind CSS** (for styling and glassmorphism UI)
- **Framer Motion** (for fluid animations)
- **Monaco Editor** (for integrated coding)
- **React Router Dom** (for navigation)

### Backend
- **Node.js**
- **Express.js**

### Database
- **MongoDB** (with Mongoose ODM)

### Authentication
- **JSON Web Tokens (JWT)**
- **Bcrypt.js** (for password hashing)

### AI Services
- **Google Gemini API** (or OpenAI/Groq) for adaptive questioning and deep feedback generation

---

## 📁 Project Structure

```text
InterviewX-AI/
├── backend/
│   ├── config/           # Database configurations
│   ├── controllers/      # Business logic (Auth, Coding, Interview, etc.)
│   ├── middleware/       # Authentication and Error handling
│   ├── models/           # Mongoose schemas (User, Report, Assessment, etc.)
│   ├── routes/           # Express API endpoints
│   ├── services/         # External service integrations (AI Service)
│   ├── utils/            # Helper functions (JWT generators)
│   └── server.js         # Backend entry point
│
└── frontend/
    ├── public/           # Static assets
    ├── src/
    │   ├── assets/       # Images, icons, logos
    │   ├── components/   # Reusable UI elements (Navbar, Sidebar, Modals)
    │   ├── context/      # React Context (AuthContext)
    │   ├── data/         # Mock data and Company simulation patterns
    │   ├── pages/        # Application views (Dashboard, Coding, Interview, etc.)
    │   ├── routes/       # Protected route wrappers
    │   ├── services/     # Axios API handlers
    │   ├── App.jsx       # Main application routing
    │   └── main.jsx      # Frontend entry point
    └── vite.config.js    # Vite bundler configuration
```

---

## ⚙️ Installation

Follow these instructions to set up InterviewX AI on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/KrChiranjeevi/AI-Interview-Practice-Assistant.git
cd AI-Interview-Practice-Assistant/InterviewX-AI
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file inside the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Seed the Database
Populate the initial database with MCQ questions and company patterns:
```bash
node seedAssessments.js
node seedCompanies.js
```

### 5. Run the Backend Server
```bash
npm run dev
```

### 6. Install Frontend Dependencies
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```

### 7. Run the Frontend Application
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 🔐 Environment Variables

| Variable | Description |
| :--- | :--- |
| `PORT` | Port number on which the backend server runs (default: 5000). |
| `MONGO_URI` | The connection string for your MongoDB cluster. |
| `JWT_SECRET` | A secure, random string used to sign and verify JSON Web Tokens. |
| `GEMINI_API_KEY` | Your Google Gemini API key used for generating AI interviews and feedback. |
| `OPENAI_API_KEY` | *(Optional)* Your OpenAI API key if using GPT-4 for analysis. |
| `GROQ_API_KEY` | *(Optional)* Your Groq API key for ultra-fast LLM inference. |

---

## 🧩 API Modules

The backend is modularized into dedicated route services:

- **Authentication (`/api/auth`):** Handles user registration, login, and JWT validation.
- **Interview (`/api/interviews`):** Manages live interview sessions and adaptive question generation.
- **Resume (`/api/resume`):** Handles file uploads (PDF/DOCX) and returns AI-parsed ATS feedback.
- **Coding (`/api/coding`):** Executes code submissions and runs AI logic validation.
- **Company (`/api/company`):** Serves company-specific recruitment workflows and difficulty configs.
- **Assessments (`/api/assessments`):** Fetches and evaluates MCQ tests (Aptitude, Quant, Logical, Verbal).
- **Reports (`/api/reports`):** Aggregates data to generate explainable, transparent post-interview reports.
- **Roadmap (`/api/roadmap`):** Generates personalized career study milestones.
- **Community (`/api/community`):** Manages user posts, experiences, and social interactions.

---

## 🧠 AI Features

InterviewX utilizes cutting-edge Large Language Models (LLMs) to power its core features:

- **Interview Evaluation:** The AI evaluates responses in real-time, checking for technical accuracy, communication quality, and confidence, scoring them dynamically.
- **Resume Analysis:** Extracts key entities, compares them against standard job roles, identifies missing skills, and calculates a realistic ATS score.
- **Coding Review:** Not just compilation—the AI reviews Big-O complexity (Time/Space), code cleanliness, and suggests algorithmic optimizations.
- **Company Simulation:** Generates scenario-based questions matching the exact culture and leadership principles of companies (e.g., Amazon Leadership Principles).
- **Career Guidance:** Translates performance gaps from your reports into a structured, week-by-week personalized learning roadmap.

---

## 🚀 Future Improvements

- [ ] **Voice Recognition (STT):** Full voice-to-text integration for entirely hands-free behavioral interviews.
- [ ] **Video Proctoring:** AI-driven facial emotion analysis and proctoring during mock exams.
- [ ] **Dockerization:** Containerized deployment using Docker and Docker Compose.
- [ ] **Multi-Language Support:** Interviewing in non-English languages for regional placement prep.

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our contribution guidelines before submitting.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

- **GitHub:** (https://github.com/KrChiranjeevi)
- **LinkedIn:** (https://www.linkedin.com/in/krchiranjeevi/](https://www.linkedin.com/in/kumar-chiranjeevi-782b77297/)
- **Email:** krchiranjeevi28@gmail.com

---
<p align="center">Made with ❤️ for aspiring engineers.</p>
