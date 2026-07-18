const fs = require('fs');
const path = require('path');

const rolesList = [
  "Software Engineer (University Graduate)",
  "Software Engineering Intern",
  "STEP Intern",
  "Associate Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Android Engineer",
  "Web Engineer",
  "Cloud Engineer",
  "Site Reliability Engineer",
  "ML Engineer",
  "AI Engineer",
  "Data Engineer",
  "Data Analyst",
  "Product Analyst",
  "Security Engineer",
  "Quality Engineer",
  "Solutions Engineer",
  "Customer Engineer",
  "Cloud Support Engineer"
];

const generateRounds = (roleName) => {
  return [
    {
      roundIndex: 0,
      name: "Resume Screening",
      duration: "Asynchronous",
      difficulty: "Hard",
      passingScore: "ATS Match > 75%",
      skillsRequired: ["ATS Optimization", "Keyword Matching", "Project Relevance"],
      instructions: "AI Resume Match evaluates your skills, projects, and ATS score. You need a high match to proceed.",
      assessmentType: "resume"
    },
    {
      roundIndex: 1,
      name: "Online Assessment",
      duration: "60-90 Minutes",
      difficulty: "Hard",
      passingScore: "80%",
      skillsRequired: ["Arrays", "Strings", "Hash Map", "Dynamic Programming", "Graphs"],
      instructions: "Usually 2 coding problems. Features Fullscreen Mode, Auto Save, Tab Switch Detection.",
      assessmentType: "coding"
    },
    {
      roundIndex: 2,
      name: "Technical Interview 1",
      duration: "45 Mins",
      difficulty: "Hard",
      passingScore: "85%",
      skillsRequired: ["Data Structures", "Algorithms", "Problem Solving", "Complexity Analysis"],
      instructions: "Interactive coding interview in Whiteboard/Editor mode. You must think aloud, write code, optimize, and discuss edge cases.",
      assessmentType: "technical"
    },
    {
      roundIndex: 3,
      name: "Technical Interview 2",
      duration: "45 Mins",
      difficulty: "Hard",
      passingScore: "85%",
      skillsRequired: ["System Design", "Advanced DSA", "Optimization"],
      instructions: "Deep dive into more complex algorithmic concepts or system design depending on the role.",
      assessmentType: "technical"
    },
    {
      roundIndex: 4,
      name: "Technical Interview 3",
      duration: "45 Mins",
      difficulty: "Hard",
      passingScore: "85%",
      skillsRequired: ["Domain Specific Knowledge", "Architecture", "Scalability"],
      instructions: "Final technical round testing domain expertise and highly scalable problem solving.",
      assessmentType: "technical"
    },
    {
      roundIndex: 5,
      name: "Googleyness Interview",
      duration: "45 Mins",
      difficulty: "Medium",
      passingScore: "80%",
      skillsRequired: ["Leadership", "Conflict Resolution", "Ownership", "Learning", "Growth Mindset"],
      instructions: "Behavioral simulation. AI interviewer asks follow-up questions naturally on teamwork, handling failure, and ambiguity.",
      assessmentType: "hr"
    },
    {
      roundIndex: 6,
      name: "Hiring Committee Review",
      duration: "Asynchronous",
      difficulty: "Hard",
      passingScore: "Strong Hire",
      skillsRequired: ["Overall Performance", "Consistency"],
      instructions: "Committee reviews Resume, Coding Performance, Interview Ratings, and Behavior to make a final recommendation.",
      assessmentType: "review"
    },
    {
      roundIndex: 7,
      name: "Offer Decision",
      duration: "Asynchronous",
      difficulty: "Medium",
      passingScore: "N/A",
      skillsRequired: [],
      instructions: "Final hiring report with overall performance, strengths, weaknesses, and expected readiness.",
      assessmentType: "offer"
    }
  ];
};

const googleData = {
  name: "Google",
  logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  about: "Google's hiring process is known for being rigorous, focusing on Data Structures, Algorithms, and Googleyness.",
  selectionRate: "1.2%",
  package: "20-40 LPA",
  eligibility: "B.Tech/M.Tech/Ph.D (CS/IT/ECE or related)",
  estimatedTime: "4-8 Weeks",
  difficulty: "Hard",
  roles: rolesList.map(role => ({
    roleName: role,
    description: `Targeting university graduates and students for ${role} with a focus on problem-solving, innovation, and technical excellence.`,
    skillsRequired: ["Data Structures", "Algorithms", "System Design", "Problem Solving", "Googleyness"],
    offerPrediction: "Highly Competitive",
    timeline: "4-8 Weeks",
    tags: ["University", "Full-time", "Internship"],
    rounds: generateRounds(role)
  }))
};

fs.writeFileSync(
  path.join(__dirname, 'seeders', 'companyData', 'Google.json'),
  JSON.stringify(googleData, null, 2)
);

console.log('Google.json generated successfully with 21 roles and 8 rounds each.');
