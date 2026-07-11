# InterviewX AI 🚀

InterviewX AI is an advanced, AI-powered interview practice and recruitment simulation platform. It bridges the gap between theoretical knowledge and real-world placement exams by offering a complete end-to-end simulation of company-specific hiring processes.

## 🌟 Key Features

- **Company Recruitment Simulation:** Realistic hiring workflows tailored for top companies including Amazon, Google, Microsoft, Meta, TCS, Infosys, Accenture, Capgemini, and Deloitte.
- **AI-Powered Code Editor:** A fully integrated Monaco code editor (LeetCode style) that compiles, runs, and evaluates Data Structures & Algorithms (DSA), SQL, React, Node.js, and Java assignments with deep AI code analysis.
- **Professional Assessment Engine:** Dedicated MCQ testing environment with a real exam interface (timer, question palette, mark for review) for Aptitude, Logical Reasoning, Quantitative, and Verbal rounds.
- **Live AI Interviewer:** Dynamic AI voice/text interviews with adaptive difficulty that change based on your previous answers and the selected job role.
- **Resume Analyzer:** Upload your resume and get AI-driven feedback, ATS scoring, and gap analysis tailored to specific job roles.
- **Data-Driven Reports:** 100% transparent and explainable evaluation reports based entirely on your actual performance, complete with per-question scoring and AI feedback.
- **Roadmap Generation:** AI-generated personalized study roadmaps based on your weak points from the mock interviews.

## 🏗️ Tech Stack

### Frontend
- **React.js** with Vite
- **Tailwind CSS** for modern, responsive, and glassmorphic UI design
- **Framer Motion** for smooth animations
- **Monaco Editor** for the coding interface
- **React Router Dom** for navigation

### Backend
- **Node.js & Express.js**
- **MongoDB** (Mongoose) for database schema and persistence
- **Google Gemini AI API** (or equivalent LLMs) for adaptive questions and feedback
- **JWT** for secure authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- An AI API Key (e.g., Gemini / OpenAI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KrChiranjeevi/AI-Interview-Practice-Assistant.git
   cd AI-Interview-Practice-Assistant/InterviewX-AI
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Seed the database with initial assessment questions:
   ```bash
   node seedAssessments.js
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 📂 Project Structure

```text
InterviewX-AI/
├── backend/
│   ├── controllers/      # Route logic (Auth, Assessments, Reports, etc.)
│   ├── models/           # MongoDB Schemas (User, Report, AssessmentQuestion, etc.)
│   ├── routes/           # Express API Routes
│   ├── seedAssessments.js# Database seeder for Aptitude/Logical MCQ tests
│   └── server.js         # Entry point for backend
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components (Sidebar, Navbar, Modals)
    │   ├── data/         # Mock data and Company Simulation configurations
    │   ├── pages/        # Main views (CodingHub, AssessmentRoom, LiveInterview)
    │   └── App.jsx       # Main React Router setup
    └── package.json
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📜 License
This project is licensed under the MIT License.
