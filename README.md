<div align="center">
  <img src="https://socialify.git.ci/KrChiranjeevi/AI-Interview-Practice-Assistant/image?font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Dark" alt="InterviewX AI Banner" width="800" />

  # InterviewX AI
  **Intelligent Interview Preparation & Recruitment Simulation Platform**

  *An AI-powered platform for interview preparation, company recruitment simulation, group discussion practice, extempore speech evaluation, coding practice, resume analysis, and personalized career guidance.*

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

**InterviewX AI** is a complete, enterprise-grade AI-powered interview preparation platform. It is engineered to bridge the gap between theoretical knowledge and real-world placement exams by offering highly authentic mock interviews, group discussion simulations, extempore speech evaluations, and automated assessments. 

Whether you are preparing for FAANG or major IT service companies, InterviewX AI provides an end-to-end simulation of company-specific hiring processes.

Our comprehensive suite of tools includes:
- **AI Mock Interviews:** Dynamic verbal, technical, and behavioral questioning.
- **AI Group Discussion (GD) Room:** Multi-persona AI participant GD simulation with real-time turn taking and evaluation.
- **AI Extempore Speech & Cross-Exam:** Timed spontaneous speaking drills with AI panelist cross-examination.
- **Company Recruitment Simulation:** Authentic multi-round hiring workflows (Amazon, Google, Microsoft, Deloitte, Cognizant, Wipro, TCS, Infosys, etc.).
- **ATS Resume Analyzer:** AI-driven feedback for resume optimization.
- **AI Coding Practice:** A LeetCode-style platform with Monaco editor and intelligent code analysis.
- **Company-specific Interview Preparation:** Round-by-round guidance and specialized question banks.
- **Progress Tracking & Analytics:** 100% explainable AI grading and deep performance metrics.
- **AI Career Roadmap:** Step-by-step personalized learning paths.
- **Community Hub:** Collaborative space for job seekers to share experiences.

---

## ✨ Core Features

| Module | Description |
| :--- | :--- |
| 🤖 **AI Mock Interviews** | Adaptive AI interviewer that dynamically generates technical and behavioral questions based on user responses and target role. |
| 🗣️ **AI Group Discussion Simulator** | Real-time multi-persona AI participant GD simulation (Moderator, Analytical, Critical, Constructive contenders) with dynamic turn-taking and GD scorecards. |
| 🎤 **AI Extempore Speech & Cross-Exam** | Timed spontaneous speech simulation with AI panelist cross-examination, filler word tracking, sentence corrections, and 10-dimension fluency evaluation. |
| 🏢 **Recruitment Simulation** | Emulates the exact hiring rounds of companies like Amazon, Google, Microsoft, Deloitte, Cognizant, Wipro, TCS, Infosys, and Accenture. |
| 📝 **MCQ Assessment Engine** | Professional timed mock tests for Aptitude, Logical Reasoning, Quantitative, Verbal Ability, and Technical core subjects. |
| 💻 **Coding Practice Hub** | Fully integrated Monaco code editor supporting DSA, React, Node.js, and SQL with instant AI code review and hint generator. |
| 📄 **Resume Analyzer** | ATS compatibility scoring, keyword analysis, line-by-line recommendations, and personalized suggestions to improve your resume. |
| 📊 **Advanced Analytics & Reports** | Generates detailed post-interview reports with accuracy, communication, technical depth, logic, and confidence metrics. |
| 🗺️ **AI Career Roadmap** | Auto-generates weekly milestones and study paths based on your interview weaknesses and performance gaps. |
| ⚙️ **User Control Center** | Premium SaaS-style Settings module with GSAP animations, theme toggle, AI preferences, and account health monitoring. |

---

## 🚀 Recent Production-Grade Upgrades

### 1. Multi-Persona AI Group Discussion (GD) Engine
- **Simulated Contenders & Moderator:** Built an interactive Group Discussion workspace (`LiveGDRoom.jsx`) with dynamic multi-persona AI participants (Moderator, Analytical Candidate, Critical Contender, Constructive Contender).
- **Real-Time Dynamic Turns:** Simulates authentic GD flow where AI participants make logical contributions, challenge points, and build consensus around placement topics.
- **GD Evaluation Report:** Generates an in-depth GD scorecard (`GDEvaluationReportView.jsx`) grading Leadership, Active Listening, Logical Reasoning, Communication, Body Language, Sentence Corrections, and Filler Word metrics.

### 2. AI Extempore Speech & Panelist Cross-Examination Engine
- **Timed Spontaneous Speech:** Developed an Extempore speech module (`ExtemporeRoom.jsx`) featuring prep timers, topic categories (Tech, Ethics, Economy, Abstract), and continuous speech input.
- **AI Panelist Cross-Examination:** Panelist AI generates 3 dynamic follow-up/cross-examination questions tailored directly to the candidate's delivered speech.
- **10-Dimension Analytical Reporting:** Renders a comprehensive report (`ExtemporeReportView.jsx`) evaluating Communication, English, Grammar, Vocabulary, Confidence, Pronunciation, Professionalism, Topic Understanding, Logical Thinking, and Body Language with personalized AI Coach practice plans.

### 3. Cognizant GenC / Elevate / NEXT Hiring Module
- **Cognizant Prep Hub:** Built a specialized placement preparation module (`CognizantPrepDetail.jsx`) covering GenC, GenC Elevate, and GenC NEXT hiring workflows.
- **Dedicated Question Bank:** Added `cognizantQuestionBank.js` featuring Communication assessment drills, Automata Fix debugging challenges, and DSA coding practice sets.

### 4. Coding Engine Follow-up Repetition & Persistence Enhancements
- **Resolved Follow-up Repetition:** Fixed follow-up question repetition logic in the AI Coding Interview Engine to ensure fresh, progressive coding challenges.
- **Report & Dashboard Integration:** Fully hooked up GD and Extempore reports to the persistent dashboard backend so users can review historic performances anytime.

### 5. Dynamic MCQ Pool Auto-Replenishing
- **Non-Repeating Logic:** The system stores full assessment attempt history, guaranteeing question generation excludes previously answered questions.
- **Auto-Recycling Worker:** Maintains a pool of 650 unique MCQs per category, automatically triggering AI replenishment workers when unseen questions run low.
- **Padded Tests:** Ensures every assessment always serves exactly 35 questions as required for full placement mock format.

### 6. Multi-API Reliability & Offline Safety Nets
- **Upgraded OpenRouter & Gemini Integration:** Seamless model fallbacks for continuous uptime.
- **Offline Question Fallbacks:** Fallback question banks ensure live mock interviews never break even if external APIs hit rate limits.

### 7. Comprehensive Layout Responsiveness
- **Mobile/Tablet Optimization:** Media queries hide non-essential elements on mobile viewports and collapse panel controls into compact icons for seamless scrolling on handheld devices.

### 8. Bespoke Deloitte Hiring Module & Theme System
- **Deloitte Recruitment Simulation:** Dedicated glassmorphic Deloitte Green theme, customized tracks (Technology Consulting, Analyst, Associate Analyst), and a 5-step Managerial Interview round.
- **Universal HR Interview Round:** Standardized mock HR Interview routing across all 15 company dashboards.
- **Dynamic Light/Dark Theme Adaptations:** Native background and typography transitions between dark brand configurations and clean light-mode layouts.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (with Vite)
- **Tailwind CSS** (for styling and glassmorphism UI)
- **Framer Motion & GSAP** (for fluid animations)
- **Monaco Editor** (for integrated coding workspace)
- **Lucide React** (for modern icons)
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
- **Google Gemini API** (Gemini 1.5 Flash / Pro) for adaptive interviews, GD generation, Extempore evaluations, and code analysis
- **OpenRouter API** for LLM fallbacks

---

## 📁 Project Structure

```text
InterviewX-AI/
├── backend/
│   ├── config/           # Database connection & configurations
│   ├── controllers/      # Auth, Coding, Interview, Report, Company controllers
│   ├── middleware/       # JWT Auth and Error handling middleware
│   ├── models/           # Mongoose schemas (User, Interview, Report, Assessment)
│   ├── routes/           # Express API endpoints
│   ├── services/         # AI Service (Gemini API, GD, Extempore, Feedback)
│   ├── utils/            # Helper functions & fallback question banks
│   └── server.js         # Backend entry point
│
└── frontend/
    ├── public/           # Static assets
    ├── src/
    │   ├── assets/       # Images, icons, logos
    │   ├── components/   # UI components, Modals, Navbar, Sidebar
    │   │   └── interview/ # LiveInterview, LiveGDRoom, ExtemporeRoom, Report Views
    │   ├── context/      # React Context (AuthContext, ThemeContext)
    │   ├── data/         # Mock data, Question Banks (cognizantQuestionBank, etc.)
    │   ├── pages/        # Dashboard, Coding, Prep Details, Settings, Company pages
    │   ├── routes/       # Protected route wrappers
    │   ├── services/     # Axios API service endpoints
    │   ├── App.jsx       # Main application routing
    │   └── main.jsx      # Frontend entry point
    └── vite.config.js    # Vite configuration
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
cd ../frontend
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
| `GEMINI_API_KEY` | Your Google Gemini API key used for generating AI interviews, GDs, Extempore, and feedback. |
| `OPENAI_API_KEY` | *(Optional)* Your OpenAI API key if using GPT models for analysis. |
| `GROQ_API_KEY` | *(Optional)* Your Groq API key for fast LLM inference. |

---

## 🧩 API Modules

- **Authentication (`/api/auth`):** Handles user registration, login, profile updates, and JWT validation.
- **Interview (`/api/interviews`):** Manages live interviews, Group Discussions, Extempore speech rounds, AI turn generation, and cross-questioning.
- **Resume (`/api/resume`):** Handles PDF/DOCX resume parsing and returns AI-driven ATS scoring and recommendations.
- **Coding (`/api/coding`):** Handles code submissions, test case executions, AI hints, and logic validation.
- **Company (`/api/company`):** Serves company-specific hiring workflows, prep detail configs, and PYQ banks.
- **Assessments (`/api/assessments`):** Fetches and evaluates MCQ tests across Aptitude, Reasoning, Verbal, and Core CS domains.
- **Reports (`/api/reports`):** Aggregates performance data into detailed, explainable post-interview scorecards.
- **Roadmap (`/api/roadmap`):** Generates personalized career study milestones.
- **Community (`/api/community`):** Manages community posts, interview experiences, and peer discussions.

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

- **GitHub:** [KrChiranjeevi](https://github.com/KrChiranjeevi)
- **LinkedIn:** [Kumar Chiranjeevi](https://www.linkedin.com/in/kumar-chiranjeevi-782b77297/)
- **Email:** krchiranjeevi28@gmail.com

---
<p align="center">Made with ❤️ for aspiring engineers.</p>
