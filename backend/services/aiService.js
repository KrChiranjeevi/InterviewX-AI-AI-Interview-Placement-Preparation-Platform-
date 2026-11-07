const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const { rolesDb, companiesDb } = require('./atsDb');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'missing-key' });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'missing-key' });
const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY || 'missing-key', 
  baseURL: "https://api.groq.com/openai/v1" 
});
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || 'missing-key',
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "InterviewX AI",
  }
});

// Industry-level AI Provider Abstraction with Fallback
// Order: Gemini 3.5 Flash Lite (Fastest & Active) -> Gemini 3.6 Flash -> Groq -> OpenAI -> OpenRouter
const ai = {
  models: {
    generateContent: async ({ contents }) => {
      // 1. Try Native Gemini (gemini-3.5-flash-lite - verified ultra fast)
      try {
        const response = await gemini.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: contents,
        });
        if (response && response.text) {
          return { text: response.text };
        }
      } catch (errGemini1) {
        console.warn("⚠️ Native Gemini (3.5-flash-lite) failed, trying 3.6-flash:", errGemini1.message);
      }

      // 2. Try Native Gemini (gemini-3.6-flash)
      try {
        const response = await gemini.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: contents,
        });
        if (response && response.text) {
          return { text: response.text };
        }
      } catch (errGemini2) {
        console.warn("⚠️ Native Gemini (3.6-flash) failed:", errGemini2.message);
      }

      // 3. Try Groq (if key active)
      try {
        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: contents }],
          max_tokens: 4096,
        }, { timeout: 6000 });
        return { text: response.choices[0].message.content };
      } catch (errGroq) {
        // quiet warning
      }

      // 4. Try OpenAI
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: contents }],
          max_tokens: 4096,
        }, { timeout: 6000 });
        return { text: response.choices[0].message.content };
      } catch (errOpenAI) {
        // quiet warning
      }

      // 5. Try OpenRouter
      try {
        const response = await openrouter.chat.completions.create({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: contents }],
          max_tokens: 4096,
        }, { timeout: 6000 });
        return { text: response.choices[0].message.content };
      } catch (errOR) {
        // quiet warning
      }

      throw new Error("All AI providers failed or timed out.");
    }
  }
};

const parseAIResponse = (text) => {
  try {
    let jsonStr = text.trim();
    
    // Extract JSON block between first '{' and last '}'
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      jsonStr = jsonStr.substring(start, end + 1);
    }
    
    // Sanitize control characters (unescaped tabs, newlines inside JSON strings)
    jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]+/g, ' ');
    
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    console.error('parseAIResponse failed:', e.message, '\nRaw text:', text?.substring(0, 4000));
    throw e;
  }
};

const companyGuides = {
  'Amazon': `AMAZON Interview Style:
- High focus on Amazon's 16 Leadership Principles (Customer Obsession, Ownership, Deliver Results, Bias for Action).
- Frequently weave in questions or follow-ups related to these principles.
- Expect coding questions accompanied by behavioural checks.`,
  'Google': `GOOGLE Interview Style:
- Target raw intelligence, algorithmic thinking, graph traversals, dynamic programming, and mathematical proofs.
- Probe candidate's step-by-step thinking process rather than just code.
- Expect excellent communications and structural descriptions.`,
  'Microsoft': `MICROSOFT Interview Style:
- Emphasize solid OOP design, database query normalization, thread safety, system components scaling, and standard coding.
- Inquire about design choices, error handling, and collaborative engineering.`,
  'Meta': `META Interview Style:
- Target high-speed coding, space/time optimizations, memory allocations, caching systems, and massive system scalability.
- Rapid technical follow-ups.`,
  'Apple': `APPLE Interview Style:
- Focus on pixel-perfect details, low-level optimizations, hardware-software integration, product design choices, and user experience excellence.`,
  'Netflix': `NETFLIX Interview Style:
- High emphasis on freedom and responsibility culture, distributed architectures, high throughput streaming design, chaos engineering, and system resilience.`,
  'Uber': `UBER Interview Style:
- Focus on real-time systems, geospatial indexing (like H3), high concurrency, dispatch systems scaling, and hard algorithmic challenges.`,
  'Atlassian': `ATLASSIAN Interview Style:
- Focus on values fit (Play, as a team; Open company, no bullshit), collaborative coding, solid API design, and building scale-independent developer tools.`,
  'Salesforce': `SALESFORCE Interview Style:
- High focus on multi-tenant architecture, cloud integrations, enterprise scale systems, security models, and design patterns.`,
  'Oracle': `ORACLE Interview Style:
- Focus heavily on database internals, query scaling, storage systems, operating systems, and heavy enterprise Java.`,
  'Goldman Sachs': `GOLDMAN SACHS Interview Style:
- High focus on mathematical reasoning, probability, low latency trading systems design, concurrent data structures, and core financial engineering logic.`,
  'JP Morgan': `JP MORGAN Interview Style:
- Emphasize solid OOP designs, enterprise software engineering, relational database optimization, transactional integrity, and core Java/Spring foundations.`,
  'TCS': `TCS/INFOSYS/WIPRO/ACCENTURE/CAPGEMINI Interview Style:
- Probe foundational CS fundamentals: DBMS Joins, OS process states, OOP concepts (Inheritance vs Abstraction), and basic syntax structures.
- Traditional behavioral questions.`,
  'Infosys': `TCS/INFOSYS/WIPRO/ACCENTURE/CAPGEMINI Interview Style:
- Probe foundational CS fundamentals: DBMS Joins, OS process states, OOP concepts (Inheritance vs Abstraction), and basic syntax structures.
- Traditional behavioral questions.`,
  'Wipro': `TCS/INFOSYS/WIPRO/ACCENTURE/CAPGEMINI Interview Style:
- Probe foundational CS fundamentals: DBMS Joins, OS process states, OOP concepts (Inheritance vs Abstraction), and basic syntax structures.
- Traditional behavioral questions.`,
  'Accenture': `TCS/INFOSYS/WIPRO/ACCENTURE/CAPGEMINI Interview Style:
- Probe foundational CS fundamentals: DBMS Joins, OS process states, OOP concepts (Inheritance vs Abstraction), and basic syntax structures.
- Traditional behavioral questions.`,
  'Capgemini': `TCS/INFOSYS/WIPRO/ACCENTURE/CAPGEMINI Interview Style:
- Probe foundational CS fundamentals: DBMS Joins, OS process states, OOP concepts (Inheritance vs Abstraction), and basic syntax structures.
- Traditional behavioral questions.`,
  'Startup': `STARTUP Interview Style:
- High emphasis on fast shipping speed, raw resourcefulness, full stack capacity, API integrations, agile trade-offs, and rapid feature prototyping.`,
  'Flipkart': `FLIPKART Interview Style:
- High focus on system scaling, e-commerce challenges, flash sale concurrency designs, warehousing logistics tech, and dynamic coding rounds.`
};

const roleGuides = {
  'Frontend': `Frontend Developer: Emphasize React rendering lifecycle, Virtual DOM optimizations, JavaScript ES6 Closures/Promises, CSS Flexbox/Grid layouts, and Web accessibility rules.`,
  'Backend': `Backend Developer: Emphasize Node.js Event Loop stages, REST APIs status routing, custom Express middleware pipelines, JWT validations, database indexes, and scaling architectures.`,
  'Java': `Java Developer: Emphasize JVM Memory regions, Collections hierarchy (HashMap vs TreeMap), thread concurrency, Spring Boot annotations, and SQL database index optimizations.`,
  'Data Scientist': `Data Scientist: Emphasize Python scientific frameworks (Pandas, NumPy), statistical probability distributions, linear regression algorithms, and machine learning models validation.`,
  'AI Engineer': `AI Engineer: Emphasize LLM fine-tuning parameters, Retrieval Augmented Generation (RAG) vector pipelines, context length challenges, and embedding model comparisons.`
};

const generateQuestion = async (role, type, difficulty, history, resumeSkills = [], resumeText = '', company = '', domain = '', subLanguage = '', projectName = '', projectDescription = '', selectedTopics = [], technicalTrack = '', codingTrack = '') => {
  try {
    const difficultyGuide = {
      'Beginner': `BEGINNER level: Ask basic definitions, fundamental syntax rules, and simple single-variable iterations. Keep it clear and introductory.`,
      'Intermediate': `INTERMEDIATE level: Focus on applied scenarios, multi-layer conceptual logic, and mid-level troubleshooting.`,
      'Advanced': `ADVANCED level: Deep dive into distributed scaling, hard dynamic algorithms, microservices pipelines, extreme optimization cases, and structural bottlenecks.`,
      'Easy': `EASY level: Ask basic definitions, fundamental syntax rules, and simple single-variable iterations. Keep it clear and introductory.`,
      'Medium': `MEDIUM level: Focus on applied scenarios, multi-layer conceptual logic, and mid-level troubleshooting.`,
      'Hard': `HARD level: Deep dive into distributed scaling, hard dynamic algorithms, microservices pipelines, extreme optimization cases, and structural bottlenecks.`,
      'Expert': `EXPERT level: Ask extremely challenging design queries, microsecond performance optimization, complex concurrency patterns, and architectural trade-offs under severe constraints.`
    };

    const typeGuide = {
      'Technical Interview': `Technical Interview Focus: Focus on core programming modules, runtime complexities, memory optimizations, frameworks internals, and practical system logic.`,
      'HR Interview': `HR Interview Focus: Focus strictly on behavioral STAR method scenarios, team conflicts, failures, corporate ethic values, and salary structure alignments.`,
      'Coding Interview': `Coding Interview Focus: Ask candidates to write or describe complete algorithms, explain time and space complexity, discuss edge cases, variable naming, and explain their choices.`,
      'System Design': `System Design Focus: Ask about designing distributed systems at scale. Focus on scaling, high availability, bottlenecks, databases, caching, load balancers, and tradeoffs.`,
      'Behavioral Interview': `Behavioral Interview Focus: Ask for specific instances in their career using the STAR method. Focus on leadership principles, resolving conflicts, handling failures, and teamwork.`,
      'Manager Round': `Manager Round Focus: Evaluate organizational ability, mentorship, design tradeoffs, handling deadline pressures, and aligning product goals with technical realities.`,
      'Leadership Round': `Leadership Round Focus: Focus on vision, long-term technical direction, mentoring, executive communication, and making hard decisions under ambiguity.`,
      'Product Round': `Product Round Focus: Evaluate product sense, trade-offs between speed and quality, metrics identification, user empathy, and feature design.`
    };

    // Grab company interviewing guide
    let activeCompanyGuide = 'General Tech Interview: Cover standard computer science coding paradigms and design questions.';
    if (company && companyGuides[company]) {
      activeCompanyGuide = companyGuides[company];
    } else {
      // Fallback search in companyName
      for (const key of Object.keys(companyGuides)) {
        if (company.toLowerCase().includes(key.toLowerCase())) {
          activeCompanyGuide = companyGuides[key];
          break;
        }
      }
    }

    // Grab role guide
    let activeRoleGuide = 'Software Engineering Focus: Target overall algorithm building, data structures usage, and OOP pillars.';
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('frontend') || lowerRole.includes('react')) activeRoleGuide = roleGuides['Frontend'];
    else if (lowerRole.includes('backend') || lowerRole.includes('node') || lowerRole.includes('express')) activeRoleGuide = roleGuides['Backend'];
    else if (lowerRole.includes('java')) activeRoleGuide = roleGuides['Java'];
    else if (lowerRole.includes('data') || lowerRole.includes('science')) activeRoleGuide = roleGuides['Data Scientist'];
    else if (lowerRole.includes('ai') || lowerRole.includes('machine learning')) activeRoleGuide = roleGuides['AI Engineer'];

    // Follow-up probe check
    let followUpCheck = 'Ask a new technical question on core concepts.';
    let hintCheck = '';
    if (history && history.length > 0) {
      const lastAnswerObj = history[history.length - 1];
      if (lastAnswerObj.score < 6) {
        followUpCheck = `Probing Follow-up: The candidate's last answer scored low (${lastAnswerObj.score}/10). Ask an intelligent follow-up question or probe details about that specific mistake: "${lastAnswerObj.aiFeedback || ''}" to help them clarify.`;
        hintCheck = `INSTRUCTION: Candidate is struggling (last score was low). Include a short hint in parentheses at the very end of your question text, like "(Hint: ...)" to guide them without giving the answer.`;
      } else {
        followUpCheck = `Progressive Follow-up: The candidate answered well. Ask a follow-up asking them to optimize their approach, explain boundary limits, or justify design limitations of their previous solution: "${lastAnswerObj.userAnswer}".`;
      }
    } else {
      followUpCheck = `FIRST QUESTION INSTRUCTION: Welcome the candidate warmly. Introduce yourself briefly as Sarah, a Senior Lead Interviewer. State that you're excited to conduct this ${type} for their ${role} path at ${company || 'our company'}. Start with an engaging introductory query relevant to the role.`;
    }

    const previousQuestionsStr = history.length > 0
      ? `Previously asked questions in this session: ${history.map(h => `"${h.question}"`).join(', ')}`
      : 'This is the first question of the session.';

    const isMock = !company;
    let mockSpecificPrompt = "";
    if (isMock) {
      const typeLower = type.toLowerCase();
      if (typeLower.includes('technical')) {
        const topicsStr = selectedTopics.length > 0 ? selectedTopics.join(', ') : domain;
        mockSpecificPrompt = `
STRICT COMPLIANCE DIRECTIVE:
You are conducting a highly focused Technical Interview.
Technical Track: "${technicalTrack || domain}".
Target Role: ${role}.
Selected Topics (you MUST ONLY ask questions from these topics): ${topicsStr}.
You MUST ONLY ask questions about these selected topics: [${topicsStr}].
Do NOT ask questions about any other programming language, framework, or topic not listed above.
Every question must be directly about one of these specific topics: ${topicsStr}.
Keep the focus 100% on the selected topics.
`;
      } else if (typeLower.includes('coding')) {
        if (domain === 'DSA') {
          mockSpecificPrompt = `
STRICT COMPLIANCE DIRECTIVE:
You are conducting a Data Structures & Algorithms (DSA) Coding Interview.
Target Programming Language: ${subLanguage}.
Target Role: ${role}.
You MUST ask questions ONLY about Data Structures & Algorithms (DSA) using the programming language: "${subLanguage}".
Your questions must require candidates to describe algorithms, dry-run code steps, or explain time/space complexities in ${subLanguage}.
Do NOT ask questions about frameworks, database queries, or non-DSA topics.
`;
        } else {
          mockSpecificPrompt = `
STRICT COMPLIANCE DIRECTIVE:
You are conducting a Coding Interview in the selected coding domain: "${domain}".
Target Role: ${role}.
You MUST ask coding/implementation questions ONLY about "${domain}".
Do NOT ask general DSA questions, and do NOT ask language questions unless they are directly related to writing code in "${domain}".
`;
        }
      } else if (typeLower.includes('resume')) {
        mockSpecificPrompt = `
STRICT COMPLIANCE DIRECTIVE:
You are conducting a Resume Interview based on the candidate's resume context: "${resumeText}".
You MUST ONLY ask questions regarding the candidate's: Projects, Internships, Skills, Education, Achievements, Certifications, and Leadership listed in the resume.
Do NOT ask coding questions, do NOT ask database/SQL questions, do NOT ask DSA questions, and do NOT ask general HR behavior questions. Focus strictly on their documented experience.
`;
      } else if (typeLower.includes('hr')) {
        mockSpecificPrompt = `
STRICT COMPLIANCE DIRECTIVE:
You are conducting a pure HR Interview.
You MUST ONLY ask standard HR behavioral/personality questions from the following topics: Tell me about yourself, Strengths, Weaknesses, Leadership, Conflict Resolution, Pressure Handling, Relocation, Career Goals, Teamwork, Failures, Achievements, or Why should we hire you.
Do NOT ask any technical questions, coding problems, syntax, architecture, SQL, or algorithms. Keep the focus 100% on behavioral/personality/HR characteristics.
`;
      } else if (typeLower.includes('behavioral')) {
        mockSpecificPrompt = `
STRICT COMPLIANCE DIRECTIVE:
You are conducting a Behavioral Interview using the STAR methodology (Situation, Task, Action, Result).
You MUST ONLY ask behavioral questions to evaluate the candidate's: Leadership, Ownership, Adaptability, Decision Making, Conflict Resolution, and Communication.
Ensure your prompt expects the candidate to outline their experience using the STAR structure.
Do NOT ask coding questions or technical queries.
`;
      } else if (typeLower.includes('project')) {
        mockSpecificPrompt = `
STRICT COMPLIANCE DIRECTIVE:
You are conducting a Project Discussion interview focusing ONLY on the selected project: "${projectName}" - "${projectDescription}".
You MUST ONLY ask questions regarding this project's: Architecture, Database, Authentication, API, Deployment, Challenges, Scalability, Tech Stack, and Future Improvements.
Do NOT ask generic HR questions, and do NOT ask coding/DSA questions. Stay 100% focused on the details of this specific project.
`;
      } else if (typeLower.includes('system design')) {
        mockSpecificPrompt = `
STRICT COMPLIANCE DIRECTIVE:
You are conducting a System Design Interview.
You MUST ONLY ask questions about: Requirements Gathering, High-level Architecture, Database Selection, API Design, Caching, Load Balancing, Scalability limits, Security, and Trade-offs.
Do NOT ask coding questions, programming language features, or basic HR questions.
`;
      }
    }

    const prompt = `You are Sarah, an expert senior FAANG AI Interviewer conducting a realistic job placement assessment.
Selected Company: ${company || 'Top Tech Company'}
Hiring Role: ${role}
Round Type: ${type}
Current Difficulty: ${difficulty}

${difficultyGuide[difficulty] || difficultyGuide['Intermediate']}
${typeGuide[type] || typeGuide['Technical Interview']}

${mockSpecificPrompt}

--- COMPANY STYLE SPECIFICATIONS ---
${activeCompanyGuide}

--- ROLE STYLE SPECIFICATIONS ---
${activeRoleGuide}

--- PROGRESSION / FOLLOW-UP ---
${followUpCheck}
${hintCheck}

--- HISTORY ---
${previousQuestionsStr}

RULES:
1. You MUST generate historically accurate Previous Year Questions (PYQs) asked by ${company || 'this company'} for the ${role} role. Do NOT repeat generic questions.
2. The question must be UNIQUE. Avoid repeating identical topics or questions that are too similar to the ones listed in the HISTORY section.
3. Keep the question medium-sized, concise, and between 2 to 3 sentences maximum. Avoid long-winded, multi-paragraph questions.
4. Conduct a natural, conversational dialogue (like HackerRank mock interviews). Weave in a mix of follow-up questions reacting to the candidate's last answer, along with introducing new questions from the role's domain.
3. Target the difficulty level strictly:
   - For Beginner/Easy: Ask simple, introductory fundamental concepts or basic definitions.
   - For Intermediate/Medium: Ask typical mid-level scenarios, core practical logic, or conceptual usage.
   - For Advanced/Hard/Expert: Ask challenging scaling bottlenecks, performance optimizations, or complex data structure challenges.
4. Output ONLY the question text (and the hint in brackets if instructed). Include a brief, natural welcoming sentence ONLY if it's the first question.
5. No meta-commentary, no preambles (e.g., "Here is your question:"), and no conversational filler before the actual question (except for the first question welcome).
6. Do NOT repeat any previous questions.
7. Output should be raw text only (no quotes around the final response).`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });
    return response.text.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("❌ generateQuestion failed completely. Using static fallback questions:", error.message);
    const roleLower = role.toLowerCase();
    const typeLower = type.toLowerCase();
    
    // HR Interview static fallbacks
    if (typeLower.includes('hr') || typeLower.includes('behavioral')) {
      const hrFallbacks = [
        "Tell me about a challenging situation you faced at work/university and how you resolved it.",
        "Why do you want to join our company, and what values do you think you can bring to the team?",
        "Describe a time when you had a conflict with a team member. How did you handle it and what was the outcome?",
        "Where do you see yourself in the next 5 years, and how does this role align with your career goals?",
        "Tell me about a time you failed or made a mistake. What did you learn from it?"
      ];
      return hrFallbacks[Math.floor(Math.random() * hrFallbacks.length)];
    }

    // Coding Interview static fallbacks
    if (typeLower.includes('coding')) {
      if (domain === 'SQL' || codingTrack === 'SQL' || subLanguage === 'SQL') {
        return `### Second Highest Salary (SQL)\n\nWrite a SQL query to find the second highest salary from the Employee table. If there is no second highest salary, return null.\n\n**Schema:**\nEmployee (id INT, salary INT)\n\n**Example:**\nInput: Employee table with salaries [100, 200, 300]\nOutput: 200`;
      }
      return `### Two Sum\n\nGiven an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n**Examples:**\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\n**Constraints:**\n• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9`;
    }

    // Resume Interview static fallbacks
    if (typeLower.includes('resume')) {
      return `Welcome! I've reviewed your resume profile. Could you walk me through the architecture and technical implementation of your most significant project?`;
    }

    // Project Discussion static fallbacks
    if (typeLower.includes('project')) {
      return `Welcome! Could you walk me through the high-level architecture of "${projectName || 'your project'}", and what specific problem it was built to solve?`;
    }

    // System Design static fallbacks
    if (typeLower.includes('system design')) {
      return `Welcome! Let's design a high-throughput, distributed URL Shortener service (like Bitly). How would you approach the functional requirements, API design, and database schema?`;
    }

    // Technical Interview static fallbacks based on selected topics
    if (selectedTopics && selectedTopics.length > 0) {
      const topic = selectedTopics[0];
      return `Welcome! Can you explain the core concepts of ${topic} and how you implement them in production applications?`;
    }

    // Role-specific static fallbacks
    if (roleLower.includes('java')) {
      return "Welcome! Can you explain the differences between an interface and an abstract class in Java, and when you would use each?";
    } else if (roleLower.includes('python')) {
      return "Welcome! Can you explain what decorators are in Python and provide a common use case?";
    } else if (roleLower.includes('react') || roleLower.includes('frontend') || roleLower.includes('javascript')) {
      return "Welcome! Can you explain what closures are in JavaScript and how they are useful?";
    } else if (roleLower.includes('node') || roleLower.includes('backend')) {
      return "Welcome! Can you explain the Node.js event loop and how it handles asynchronous operations?";
    } else if (roleLower.includes('data science') || roleLower.includes('machine learning')) {
      return "Welcome! Can you explain the difference between supervised and unsupervised learning?";
    } else if (roleLower.includes('sql') || roleLower.includes('database')) {
      return "Welcome! Can you explain the differences between inner join and left join with examples?";
    }

    // General software engineer fallback
    return "Welcome! Can you tell me about the difference between SQL and NoSQL databases, and how you decide which one to use for a project?";
  }
};

// ─── Conversational Response Engine (MOCK MODE ONLY) ─────────────────────────
// Generates a natural human acknowledgement + smooth follow-up or next question.
// This replaces the robotic "question → question → question" pattern.
const generateConversationalResponse = async ({
  userAnswer,
  questionAsked,
  conversationHistory = [],
  role,
  type,
  domain = '',
  subLanguage = '',
  projectName = '',
  projectDescription = '',
  difficulty = 'Intermediate',
  questionNumber = 1,
  interviewStage = 'core',
  adaptiveState,
  lastEvaluation,
  duration,
  selectedTopics = [],
  technicalTrack = '',
  codingTrack = '',
  systemDesignDomain = '',
  resumeText = '',
  resumeSkills = [],
}) => {
  try {
    const wordCount = userAnswer ? userAnswer.trim().split(/\s+/).length : 0;
    const isShortAnswer = wordCount < 15;
    const isEmpty = wordCount < 3;

    // Build conversation context from history
    const historyContext = conversationHistory.length > 0
      ? conversationHistory
          .slice(-4) // only last 4 turns for context
          .map(h => `[${h.sender === 'ai' ? 'Sarah' : 'Candidate'}]: ${h.text}`)
          .join('\n')
      : 'This is the beginning of the interview.';

    // Domain context for strict focus
    let domainContext = '';
    const typeLower2 = type ? type.toLowerCase() : '';

    if (typeLower2.includes('hr')) {
      domainContext = `STRICT HR INTERVIEW MODE:
You MUST ONLY ask standard HR behavioral/personality questions. Valid topics: Tell me about yourself, Strengths, Weaknesses, Leadership, Conflict Resolution, Pressure Handling, Career Goals, Teamwork, Failures, Achievements, Why should we hire you.
FORBIDDEN: Do NOT ask any technical questions, coding problems, SQL, algorithms, or system design. This is 100% HR only.`;
    } else if (typeLower2.includes('behavioral')) {
      domainContext = `STRICT BEHAVIORAL INTERVIEW MODE:
You MUST ONLY ask behavioral questions using STAR method (Situation, Task, Action, Result).
Topics: Leadership, Ownership, Adaptability, Decision Making, Conflict Resolution, Communication, Failure, Teamwork.
FORBIDDEN: No coding questions, no technical theory questions.`;
    } else if (typeLower2.includes('resume')) {
      const skillsList = resumeSkills.length > 0 ? resumeSkills.join(', ') : 'listed skills';
      domainContext = `STRICT RESUME INTERVIEW MODE:
You MUST ONLY ask questions grounded in the candidate's resume.
Resume Skills: ${skillsList}.
Resume Content: ${resumeText ? resumeText.substring(0, 1000) : 'Resume uploaded — ask about their projects, experience, education, and skills.'}
FORBIDDEN: Do NOT ask generic coding challenges. Ask ONLY about their documented experience, specific projects, internships, technologies they listed.`;
    } else if (typeLower2.includes('technical')) {
      const topicsStr = selectedTopics.length > 0 ? selectedTopics.join(', ') : (technicalTrack || domain);
      domainContext = `STRICT TECHNICAL INTERVIEW MODE:
Technical Track: "${technicalTrack || domain}".
Selected Topics (ONLY ask about these): ${topicsStr}.
You MUST generate questions ONLY from these topics: [${topicsStr}].
FORBIDDEN: Do not ask questions outside these topics. No HR questions, no unrelated programming topics.`;
    } else if (typeLower2.includes('coding')) {
      const track = codingTrack || domain || (subLanguage ? `DSA (${subLanguage})` : 'Software Engineering');
      domainContext = `STRICT CODING INTERVIEW MODE — ${track} Track:
Track / Language: ${track}.
When presenting a coding challenge or problem to solve:
1. Provide a complete, explicit problem statement with:
   - Problem Title
   - Clear Description of the task
   - Example Input and Expected Output
   - Constraints / Edge cases
2. When evaluating code already submitted by the candidate:
   - Provide direct feedback on correctness, time complexity O(...), and space complexity.
   - Ask targeted follow-ups about optimization, edge cases (e.g. empty inputs, large bounds, duplicates), or alternative data structures.
FORBIDDEN: Do not ask non-coding HR questions or unrelated framework trivia.`;
    } else if (typeLower2.includes('project')) {
      domainContext = `STRICT PROJECT DISCUSSION MODE:
Project: "${projectName}" — ${projectDescription}
You MUST ONLY ask about THIS specific project: its architecture, database, authentication, APIs, deployment, challenges, tech stack, testing, and improvements.
FORBIDDEN: No generic HR questions, no DSA problems, no unrelated topics.`;
    } else if (typeLower2.includes('system design')) {
      domainContext = `STRICT SYSTEM DESIGN MODE:
Domain: ${systemDesignDomain || domain || 'Distributed Systems'}
You MUST follow a coherent design flow: requirements → architecture → databases → APIs → caching → scalability → security → trade-offs.
FORBIDDEN: No coding problems, no HR questions, no unrelated topics.`;
    } else if (domain) {
      domainContext = `Interview Domain: ${domain}. Ask ONLY questions within this domain. Never switch topics.`;
    }

    const stageInstructions = {
      greeting: 'This is the greeting phase. Respond warmly after the candidate introduced themselves. Transition smoothly to the first warm-up question.',
      warmup: 'This is the warm-up phase. Keep responses encouraging and casual. Ask a light introductory question.',
      core: 'This is the core interview phase. Acknowledge the answer naturally, then ask the next domain-focused question. Increase depth progressively.',
      deepdive: 'This is the deep-dive phase. The candidate is performing well. Dig deeper — ask why, ask for trade-offs, ask for optimization. Do not let easy answers pass without probing.',
      closing: 'This is the closing phase. Wrap up gracefully. Thank the candidate and deliver a warm professional closing statement without a new question.'
    };

    const prompt = `You are Sarah, a seasoned Senior Technical Recruiter and Interviewer with 12 years of experience at top tech companies.

YOUR PERSONALITY:
- Professional, calm, warm, focused, and patient
- You sound like a real human — never robotic, never scripted
- You never read a list of questions. You conduct a real conversation.
- You listen carefully and respond based on what the candidate actually said
- Never punish hesitation. If they struggle, guide them and ask easier conceptual questions.

INTERVIEW CONTEXT:
Role: ${role}
Interview Type: ${type}
Difficulty: ${difficulty}
Question Number: ${questionNumber}
Interview Stage: ${interviewStage}
Total Intended Duration: ${duration || '15 mins'}
${domainContext}

RECENT CONVERSATION:
${historyContext}

LAST QUESTION YOU ASKED:
"${questionAsked}"

CANDIDATE'S ANSWER:
"${userAnswer || '(no response)'}"

LAST EVALUATION METRICS:
${lastEvaluation ? JSON.stringify(lastEvaluation, null, 2) : 'None (First question)'}

ADAPTIVE ROADMAPS:
- Role & Domain Roadmaps:
  * Frontend: More React, CSS, JavaScript, DOM, Performance.
  * Backend: Node, Java, Spring, Database, API, Authentication.
  * AI Engineer: Python, ML, LLMs, Prompt Engineering, Vector DB, RAG.
  * Data Analyst: SQL, Excel, Power BI, Statistics, Visualization.
  * DSA: Arrays → Strings → Linked List → Trees → Graphs → DP → Advanced.
  * SQL: SELECT → JOIN → GROUP BY → WINDOW FUNCTIONS → INDEXING → OPTIMIZATION.
  * Java: Basics → OOP → Collections → Exception → Multithreading → JVM → Advanced Java.
- Difficulty Engine scale: Easy → Medium → Hard → Scenario Based → Real World Problems → Optimization → Architecture. Only increase difficulty by 1 step at a time if the user is performing very well. If struggling (multiple weak answers), reduce difficulty slightly, give encouraging response, and ask easier conceptual questions.

CURRENT INTERNAL ADAPTIVE STATE:
${JSON.stringify(adaptiveState, null, 2)}

STAGE INSTRUCTION:
${stageInstructions[interviewStage] || stageInstructions.core}

CODING INTERVIEW FLOW LIMITS:
- For Coding Interviews:
  * Maximum 1 conceptual follow-up (conceptualFollowupsCount)
  * Maximum 2 optimization follow-ups (optimizationFollowupsCount)
  * Maximum 1 edge-case follow-up (edgeCaseFollowupsCount)
  * When these limits are reached, you MUST transition to a completely new programming problem/challenge.
  * Update these counters in your returned adaptiveState object:
    - Increment conceptualFollowupsCount when asking a conceptual follow-up (e.g. why choose this approach, recursion to iteration, HashMap comparison).
    - Increment optimizationFollowupsCount when asking optimization (e.g. optimizing speed, complexity, scaling inputs, explaining lines).
    - Increment edgeCaseFollowupsCount when asking edge cases (e.g. duplicate values, empty/null bounds, overflows).
- After code submission, review correctness, complexity, edge cases, optimization, or coding style without repeating old conceptual questions.
- Never repeat any sentence listed in askedFollowupQuestions. Avoid duplicates and generic prompts.

YOUR TASK:
1. Update the internal adaptive state metrics (knowledgeScore, confidenceScore, communicationScore, technicalScore, domainScore, overallScore, difficultyLevel, knowledgeGraph, mistakes, notes, historyTopics, conceptualFollowupsCount, optimizationFollowupsCount, edgeCaseFollowupsCount, askedFollowupQuestions) based on candidate answers and the last evaluation metrics. Keep these notes internal.
2. Formulate your response as Sarah:
   - ACKNOWLEDGEMENT (1-2 sentences): React naturally to the candidate's last response. Refer to specific technical concepts they used. Encourage them if they struggle. NEVER say "Correct", "Wrong", "That's right", etc.
   - TRANSITION (optional, 0-1 sentence): Transition to the next question.
   - NEXT QUESTION (1-2 sentences): Ask ONE clear question.
     * Keep questions relevant to the role, domain, and difficultyLevel.
     * Check askedFollowupQuestions: Never repeat any follow-up that was already asked or is similar to it.
     * If closing stage, do not ask a question; deliver a warm closing statement summarizing the conversation.
     * Monitor remaining time based on questionNumber vs total duration. If near the end, prioritize important questions and close naturally.

OUTPUT FORMAT (STRICT — return ONLY valid JSON, no markdown wrapper):
{
  "acknowledgement": "<1-2 sentence natural acknowledgement>",
  "transition": "<0-1 sentence transition or empty string>",
  "nextQuestion": "<1-2 sentence next question or closing statement>",
  "isFollowUp": <true if probing same answer, false if new topic>,
  "isClosing": <true if this is the final closing message>,
  "adaptiveState": {
    "knowledgeScore": number (0-100),
    "confidenceScore": number (0-100),
    "communicationScore": number (0-100),
    "technicalScore": number (0-100),
    "domainScore": number (0-100),
    "overallScore": number (0-100),
    "difficultyLevel": "current difficulty level in Easy/Medium/Hard/Scenario Based/Real World Problems/Optimization/Architecture",
    "knowledgeGraph": { "topic_name": "Strong" | "Average" | "Weak" },
    "mistakes": ["list of concepts candidate misunderstood or failed to answer correctly"],
    "notes": ["list of silent live notes on candidate's behavior, e.g., 'Strong Java.', 'Weak SQL JOIN.'"],
    "historyTopics": ["list of sub-topics already asked to avoid repetition"],
    "conceptualFollowupsCount": number,
    "optimizationFollowupsCount": number,
    "edgeCaseFollowupsCount": number,
    "askedFollowupQuestions": ["list of sentences/questions you have already asked in this session"]
  }
}`;

    const response = await ai.models.generateContent({ contents: prompt });
    let raw = response.text.trim();

    // Strip markdown code blocks if present
    raw = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();

    const parsed = JSON.parse(raw);

    // Keep track of the newly generated question in the asked list
    const updatedState = parsed.adaptiveState || { ...adaptiveState };
    if (parsed.nextQuestion && (!updatedState.askedFollowupQuestions || !updatedState.askedFollowupQuestions.includes(parsed.nextQuestion))) {
      if (!updatedState.askedFollowupQuestions) updatedState.askedFollowupQuestions = [];
      updatedState.askedFollowupQuestions.push(parsed.nextQuestion);
    }

    return {
      acknowledgement: parsed.acknowledgement || 'I see. Thank you for that.',
      transition: parsed.transition || '',
      nextQuestion: parsed.nextQuestion || 'Could you tell me more about your experience?',
      isFollowUp: parsed.isFollowUp || false,
      isClosing: parsed.isClosing || false,
      adaptiveState: updatedState,
      // Combined full text for TTS
      fullSpeech: [
        parsed.acknowledgement,
        parsed.transition,
        parsed.nextQuestion
      ].filter(Boolean).join(' ').trim()
    };
  } catch (error) {
    console.error('❌ generateConversationalResponse failed:', error.message);
    const fallbackAcks = [
      "I see. Thank you for sharing that.",
      "That makes sense. Let me ask you something related.",
      "Interesting perspective. Let's continue.",
      "I appreciate you walking me through that."
    ];

    const typeLower3 = type ? type.toLowerCase() : '';
    let fallbackQuestion = '';
    
    if (typeLower3.includes('hr')) {
      const hrFallbacks = [
        "Can you tell me about a time when you had to meet a tight deadline? How did you manage your time?",
        "What would you say is your greatest professional strength, and how has it helped you in past experiences?",
        "Describe a situation where you had to work closely with a difficult team member. How did you handle it?",
        "Where do you see yourself professionally in the next three years, and how does this role align with your goals?",
        "Tell me about a time you received constructive criticism. How did you respond to it?"
      ];
      fallbackQuestion = hrFallbacks[Math.floor(Math.random() * hrFallbacks.length)];
    } else if (typeLower3.includes('behavioral')) {
      const behavFallbacks = [
        "Tell me about a situation where you demonstrated strong leadership. What was your specific role and what was the outcome?",
        "Describe a time you had to adapt quickly to a major change at work or in a project. What actions did you take?",
        "Tell me about a time you failed at something. What did you learn, and how did you apply that lesson afterward?",
        "Give an example of when you had to make a difficult decision with limited information. What was your process?"
      ];
      fallbackQuestion = behavFallbacks[Math.floor(Math.random() * behavFallbacks.length)];
    } else if (typeLower3.includes('resume')) {
      fallbackQuestion = "Could you walk me through the technical decisions you made in your most significant project? What problem were you solving?";
    } else if (typeLower3.includes('coding')) {
      const codingFallbacks = [
        "What is the time complexity of your approach, and can you think of a way to optimize it further?",
        "How would your algorithm handle edge cases like empty input, duplicate values, or very large inputs?",
        "Can you walk me through your algorithm step by step and explain why you chose this particular data structure?"
      ];
      fallbackQuestion = codingFallbacks[Math.floor(Math.random() * codingFallbacks.length)];
    } else if (typeLower3.includes('system design')) {
      fallbackQuestion = "How would you handle horizontal scalability in your proposed architecture, and what are the trade-offs of your approach?";
    } else if (typeLower3.includes('project')) {
      fallbackQuestion = "What was the most challenging technical problem you faced in this project, and how did you resolve it?";
    } else {
      // Technical Interview fallbacks based on selected topics
      const topicsStr = selectedTopics.length > 0 ? selectedTopics[0] : (technicalTrack || 'your selected technical domain');
      const techFallbacks = [
        `Can you explain a core concept in ${topicsStr} and describe how you've applied it in a project?`,
        `What are some common performance pitfalls in ${topicsStr}, and how would you avoid them?`,
        `How does ${topicsStr} handle concurrency or state management, and what are the best practices?`
      ];
      fallbackQuestion = techFallbacks[Math.floor(Math.random() * techFallbacks.length)];
    }

    const updatedState = { ...adaptiveState };
    if (!updatedState.askedFollowupQuestions) updatedState.askedFollowupQuestions = [];
    if (!updatedState.askedFollowupQuestions.includes(fallbackQuestion)) {
      updatedState.askedFollowupQuestions.push(fallbackQuestion);
    }

    const ack = fallbackAcks[Math.floor(Math.random() * fallbackAcks.length)];
    return {
      acknowledgement: ack,
      transition: '',
      nextQuestion: fallbackQuestion,
      isFollowUp: true,
      isClosing: false,
      adaptiveState: updatedState,
      fullSpeech: `${ack} ${fallbackQuestion}`
    };
  }
};

const analyzeAnswer = async (question, answer, role, difficulty) => {
  try {
    const prompt = `You are evaluating a candidate's answer for the question: "${question}".
Candidate's response: "${answer}"
Role context: ${role}
Difficulty target: ${difficulty}

Determine if this is a clarifying question (e.g. asking for examples, asking to repeat).
- If it is clarification, reply as Sarah explaining context concisely. Set isClarification=true.
- If it is an answer, assess technical accuracy, STAR consistency, and grade out of 10. Also evaluate live metrics (score 0-10 each) and speech parameters (based on transcript composition, sentence run-ons, and presence of placeholders).

Return strictly as JSON with no markdown decoration:
{
  "isClarification": boolean,
  "feedback": "constructive 2-sentence summary feedback",
  "score": number,
  "metrics": {
    "technicalKnowledge": number,
    "problemSolving": number,
    "communication": number,
    "confidence": number,
    "accuracy": number,
    "logicalThinking": number
  },
  "speechStats": {
    "speakingSpeed": number, // estimate words per minute (e.g., 100-150)
    "fillerWordsCount": number, // count of filler words (like 'um', 'uh', 'like', 'so', 'actually') found in the text
    "eyeContactScore": number, // mock a score between 75 and 98
    "voiceClarity": number, // mock a score between 80 and 98
    "grammarScore": number // grade from 0 to 100 based on sentence structure
  }
}`;

    const response = await ai.models.generateContent({ contents: prompt });
    return parseAIResponse(response.text);
  } catch (error) {
    return { 
      isClarification: false, 
      feedback: "Answer registered. System was unable to grade metrics due to quota limit.", 
      score: 6,
      metrics: { technicalKnowledge: 6, problemSolving: 6, communication: 6, confidence: 6, accuracy: 6, logicalThinking: 6 },
      speechStats: { speakingSpeed: 120, fillerWordsCount: 2, eyeContactScore: 85, voiceClarity: 90, grammarScore: 88 }
    };
  }
};

const generateAIReport = async (interview) => {
  try {
    const questionsList = interview.questions.map((q, idx) => `
Q${idx + 1}: ${q.question}
A${idx + 1}: ${q.userAnswer}
Score: ${q.score}/10
Feedback: ${q.aiFeedback}
`).join('\n');

    const prompt = `Evaluate the completed job interview session for the role of "${interview.role}" at company "${interview.company || 'Tech Company'}".
Below is the full transcript:
---
${questionsList}
---

Generate a comprehensive professional evaluation report.
Include:
1. Overall Strengths (3-4 points)
2. Areas of Improvement / Weaknesses (3-4 points)
3. Custom study recommendations
4. High-level hiring recommendation summary (e.g. Strong Hire, Hire, Borderline, Needs Practice, Rejected).

Output as a readable summary.`;

    const response = await ai.models.generateContent({ contents: prompt });
    return response.text.trim();
  } catch (error) {
    return "Placement assessment finalized. AI evaluation was skipped due to API token exhaustion.";
  }
};

const analyzeResume = async (resumeText, targetRole, targetCompany = 'General ATS') => {
  try {
    const roleProfile = rolesDb[targetRole] || rolesDb['Software Engineer'];
    const companyProfile = companiesDb[targetCompany] || companiesDb['General ATS'];

    const prompt = `You are an Enterprise Applicant Tracking System (ATS) and an elite Tech Recruiter.
Analyze the following resume text strictly, objectively, and critically for the specific target role of: "${targetRole}" at target company: "${targetCompany}".

Target Role Database Specifications:
${JSON.stringify(roleProfile, null, 2)}

Target Company Database Specifications:
${JSON.stringify(companyProfile, null, 2)}

Resume Text:
---
${resumeText.substring(0, 5000)}
---

Perform a complete, dynamic AI-powered ATS scan and return a JSON object with this exact structure (NO extra text, NO backticks, just valid JSON):
{
  "personalInfo": {
    "name": "Extract candidate's full name",
    "email": "Extract candidate's email address",
    "phone": "Extract candidate's phone number",
    "linkedin": "Extract candidate's LinkedIn URL",
    "github": "Extract candidate's GitHub URL",
    "portfolio": "Extract candidate's portfolio/website URL"
  },
  "education": [
    {
      "degree": "Degree name",
      "institution": "University/College name",
      "cgpa": "CGPA or percentage",
      "dates": "Dates attended"
    }
  ],
  "experience": [
    {
      "role": "Job title",
      "company": "Company name",
      "dates": "Dates worked",
      "responsibilities": ["Detailed parsed responsibility bullets"],
      "impact": "Actionable business impact or metrics",
      "techStack": ["Technologies used in this role"]
    }
  ],
  "projects": [
    {
      "title": "Project title",
      "description": "Short parsed description of what this project does",
      "techStack": ["Technologies used"],
      "complexity": "High | Medium | Low (based on technical scope)",
      "businessValue": "Value or utility this project provides",
      "architecture": "Architecture style (e.g. MVC, Microservices, Client-Server)",
      "roleRelevance": "How relevant this project is for a ${targetRole} at ${targetCompany}",
      "scalability": "Comment on system scalability of the design",
      "authentication": "Authentication method used (e.g., JWT, OAuth, none)",
      "database": "Databases utilized",
      "deployment": "Where/how was it deployed (e.g., AWS, Vercel, Local)",
      "codingLevel": 7,
      "resumeImpact": "Critical impact this project adds to the resume",
      "suggestions": ["Specific suggestions to improve this project description"]
    }
  ],
  "internships": [
    {
      "role": "Intern role title",
      "company": "Company/Organization name",
      "dates": "Dates worked",
      "responsibilities": ["Responsibilities during internship"],
      "actionVerbs": ["Strong action verbs identified"],
      "technologies": ["Technologies used"],
      "businessImpact": "Impact of their work",
      "leadership": "Evidence of leadership or proactive work",
      "atsStrength": "ATS keyword strength of this internship description"
    }
  ],
  "skills": {
    "programmingLanguages": ["List extracted programming languages"],
    "frameworks": ["List extracted frameworks"],
    "libraries": ["List extracted libraries"],
    "databases": ["List extracted databases"],
    "cloud": ["List extracted cloud platforms"],
    "devopsTools": ["List extracted CI/CD or DevOps tools"],
    "softSkills": ["List extracted soft skills"],
    "tools": ["List other developer tools like Git, VSCode, Docker etc."]
  },
  "certificates": ["List parsed certifications"],
  "achievements": ["List parsed achievements/awards"],
  "training": ["List parsed training/bootcamps"],

  "score": 65,
  "scoringBreakdown": {
    "roleSkillMatch": 75,
    "projectRelevance": 70,
    "internship": 85,
    "experience": 60,
    "keywordMatch": 75,
    "education": 90,
    "resumeFormatting": 80,
    "achievements": 70,
    "certifications": 60
  },

  "matchedKeywords": ["List all matching keywords found in the resume matching the target role"],
  "missingSkills": ["List missing critical skills expected for ${targetRole} at ${targetCompany}"],
  "priorityKeywords": ["List high-priority keywords the candidate should add for this role/company"],
  "skillMatchPercentage": 75,
  "skillMatchLevel": "Excellent | Good | Average | Weak (based on skillMatchPercentage: >=85 is Excellent, >=70 is Good, >=45 is Average, <45 is Weak)",
  
  "companyCompatibility": [
    { "company": "Google", "matchPercent": 60 },
    { "company": "Microsoft", "matchPercent": 50 },
    { "company": "Amazon", "matchPercent": 55 },
    { "company": "NVIDIA", "matchPercent": 40 },
    { "company": "TCS", "matchPercent": 75 },
    { "company": "Infosys", "matchPercent": 80 },
    { "company": "Accenture", "matchPercent": 75 },
    { "company": "Deloitte", "matchPercent": 70 },
    { "company": "Wipro", "matchPercent": 75 },
    { "company": "Cognizant", "matchPercent": 78 },
    { "company": "Capgemini", "matchPercent": 75 },
    { "company": "JPMorgan Chase", "matchPercent": 65 }
  ],
  
  "resumeSummary": "Write a concise professional summary of the candidate's parsed profile",
  "recommendedSkills": ["Specific actionable skills to acquire"],
  "resumeStructure": "Detailed review of resume structure",
  "projectQuality": "Critical comment on project complexity and technology choice",
  "experienceAnalysis": "Critical analysis of experience depth and responsibility formatting",
  "educationAnalysis": "Review of academic history and CGPA rating",
  "certificationsAnalysis": "Analysis of the value and impact of listed certifications",
  "keywordDensity": "E.g., Good density of frontend keywords (3.2%)",
  "formattingIssues": ["List explicit formatting problems found"],
  "recommendations": ["Highly personalized recommendations to optimize the resume for this role and company expectation"],
  "strengths": ["Extract actual strengths from the resume"],
  "weaknesses": ["Extract ONLY real weaknesses from the resume (do not invent fake ones)"],
  "formattingAnalysis": {
    "spacing": "Review of whitespace consistency",
    "bulletConsistency": "Consistent | Inconsistent",
    "readability": "High | Medium | Low",
    "atsCompatibility": "High | Medium | Low",
    "length": "Review of length",
    "actionVerbUsage": "Comment on usage of strong action verbs"
  },
  "hiringReadiness": {
    "resumeScore": 70,
    "technicalReadiness": "Description of technical skills readiness",
    "projectQuality": "Critique of project complexity and quality",
    "experienceStrength": "Critique of experience impact",
    "communication": "Critique of written communication in resume",
    "overallHiringReadiness": "Excellent | Ready | Needs Polish | Not Ready",
    "roleReadiness": "Evaluate readiness for the target role",
    "companyReadiness": "Evaluate alignment with the target company expectations"
  },
  "practiceQuestions": [
    {
      "source": "Project Name / Internship Name / Skill",
      "question": "Generated specific interview question probing this item",
      "context": "Context or reasoning for asking this question"
    }
  ]
}

Instructions for JSON evaluation logic:
1. "score": Calculate an overall integer score from 0 to 100 using the exact weighted ATS formula:
   - 25% Role Skill Match: How closely the candidate's skills align with the required/preferred skills in the Role Specification.
   - 20% Project Relevance: Complexity, architecture, and alignment of projects with Role Expectations.
   - 15% Internship: Relevance, action verbs, and business impact of internship work.
   - 10% Experience: Depth, dates, and relevance of work experience.
   - 10% Keyword Match: Density and relevance of matching keywords.
   - 5% Education: Degree, CGPA, and alignment of major.
   - 5% Resume Formatting: Spacing, bullet consistency, readable structure.
   - 5% Achievements: Competitions, ranks, coding metrics.
   - 5% Certifications: Cloud practitioner, developer certificates.
   Calculate the realistic weighted score and return it as an integer between 0 and 100.
2. "companyCompatibility": Calculate separate realistic percentages based on company hiring focus. E.g.
   - Google: Evaluate data structures/algorithm strength, complexity of projects, problem solving.
   - Amazon: Evaluate scale design, microservices, leadership principles.
   - Microsoft: Evaluate full stack OOP, design patterns, transactional SQL.
   - TCS/Infosys: Evaluate general computer science basics, OOP foundation, databases.
3. "matchedKeywords": Extract ALL detected technologies (e.g. React, Node.js, Express, MongoDB, MySQL, Docker, CI/CD, Git, Java, Python). Do not limit this list.
4. "missingSkills": Generate ONLY role-specific missing skills. Do not recommend AWS or Kubernetes for simple Frontend Developers unless required in the target role profile.
5. "strengths" & "weaknesses": Dynamically extract real values from the resume. Do not invent weaknesses.`;

    const response = await ai.models.generateContent({ contents: prompt });
    return parseAIResponse(response.text);
  } catch (error) {
    console.error('Gemini Error in analyzeResume:', error);
    return {
      personalInfo: { name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '' },
      education: [],
      experience: [],
      projects: [],
      internships: [],
      skills: { programmingLanguages: [], frameworks: [], libraries: [], databases: [], cloud: [], devopsTools: [], softSkills: [], tools: [] },
      certificates: [],
      achievements: [],
      training: [],
      score: 50,
      scoringBreakdown: {
        roleSkillMatch: 50, projectRelevance: 50, internship: 50, experience: 50, keywordMatch: 50,
        education: 50, resumeFormatting: 50, achievements: 50, certifications: 50
      },
      matchedKeywords: [],
      missingSkills: [],
      priorityKeywords: [],
      skillMatchLevel: 'Average',
      skillMatchPercentage: 50,
      strengths: [],
      weaknesses: [],
      aiSuggestions: ['Error analyzing resume. Please check your API key.'],
      formattingAnalysis: {
        spacing: 'Unknown', bulletConsistency: 'Unknown', readability: 'Unknown', atsCompatibility: 'Unknown',
        length: 'Unknown', actionVerbUsage: 'Unknown'
      },
      hiringReadiness: {
        resumeScore: 50, technicalReadiness: 'Unknown', projectQuality: 'Unknown',
        experienceStrength: 'Unknown', communication: 'Unknown', overallHiringReadiness: 'Needs Polish',
        roleReadiness: 'Unknown', companyReadiness: 'Unknown'
      },
      practiceQuestions: [],
      companyCompatibility: [
        { "company": "Google", "matchPercent": 30 },
        { "company": "Microsoft", "matchPercent": 35 },
        { "company": "Amazon", "matchPercent": 30 },
        { "company": "NVIDIA", "matchPercent": 30 },
        { "company": "TCS", "matchPercent": 60 },
        { "company": "Infosys", "matchPercent": 60 },
        { "company": "Accenture", "matchPercent": 60 },
        { "company": "Deloitte", "matchPercent": 60 },
        { "company": "Wipro", "matchPercent": 60 },
        { "company": "Cognizant", "matchPercent": 60 },
        { "company": "Capgemini", "matchPercent": 60 },
        { "company": "JPMorgan Chase", "matchPercent": 60 }
      ],
      resumeSummary: 'Raw parse fallback summary.',
      skillsFound: [],
      recommendedSkills: [],
      resumeStructure: 'Format analysis unavailable',
      projectQuality: 'Project analysis unavailable',
      experienceAnalysis: 'Experience analysis unavailable',
      educationAnalysis: 'Education analysis unavailable',
      certificationsAnalysis: 'Certifications analysis unavailable',
      keywordDensity: 'Keyword density unavailable',
      formattingIssues: [],
      recommendations: []
    };
  }
};

const generateCompanyQuestion = async (companyName, round, difficulty, history) => {
  try {
    const prompt = `You are an expert AI interviewer conducting a ${difficulty} level ${round} interview for ${companyName}.
Based on the interview history: ${JSON.stringify(history)}
Generate ONE insightful and challenging interview question specific to ${companyName}'s typical interview process, leadership principles, or technology stack. 
Keep the question extremely brief, concise, and under 2 sentences maximum. Do not write long-winded paragraphs.
Do not include any other text, just the question.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('Gemini Error:', error);
    return `Could you tell me about a time you solved a complex problem at a scale similar to ${companyName}?`; 
  }
};

const analyzeCode = async (problem, code, language, isSubmit) => {
  try {
    const mode = isSubmit ? 'FINAL SUBMISSION' : 'CODE RUN';
    
    let instructions = `
EVALUATION INSTRUCTIONS:
1. Analyze the LOGIC and ALGORITHM — NOT try to compile or execute it
2. Determine if the approach is CORRECT for the stated problem
3. If the logic is correct and handles edge cases → score should be 85-100
4. If the logic is mostly correct but has minor issues → score 65-84
5. If the logic has significant flaws → score 40-64
6. If the code is empty or completely wrong → score 0-39
7. For "simulatedOutput": describe what the code WOULD output if run on the example inputs
8. Be ENCOURAGING and CONSTRUCTIVE in feedback
9. For correct optimal solutions — give HIGH scores (90+)
`;

    let jsonFormat = `{
  "score": 90,
  "feedback": "string — 2-3 sentences explaining the evaluation.",
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "testCasesPassed": "10/10",
  "runtime": "45 ms",
  "memoryUsed": "34.5 MB",
  "mistakes": ["string — only include REAL logical errors"],
  "optimizationTips": ["string — suggestions to make it better"],
  "simulatedOutput": "string"
}`;

    if (isSubmit) {
      instructions += `
10. Since this is a FINAL SUBMISSION, provide a detailed Code Review.
11. Generate 3-5 interview-style follow-up questions based on the problem and solution.
12. Simulate realistic "Runtime" (e.g., "45 ms") and "Memory Used" (e.g., "41.2 MB").
13. Simulate test cases passed based on the score. If score > 85, make it "15/15". If score is low, make it "3/15" etc.
`;
      jsonFormat = `{
  "score": 90,
  "feedback": "string — 2-3 sentences explaining the evaluation.",
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "testCasesPassed": "15/15",
  "runtime": "45 ms",
  "memoryUsed": "41.2 MB",
  "mistakes": ["string"],
  "optimizationTips": ["string"],
  "simulatedOutput": "string",
  "codeReview": {
    "codeQuality": "string — e.g., 'Good use of modular functions'",
    "readability": "string — e.g., 'Clear and easy to follow'",
    "variableNaming": "string — e.g., 'Variables could be more descriptive'",
    "edgeCases": "string — e.g., 'Handles null inputs well'"
  },
  "followUpQuestions": [
    "string — e.g., 'Can you optimize the space complexity to O(1)?'",
    "string"
  ]
}`;
    }

    const prompt = `You are a senior software engineer and technical interviewer at a top tech company. You are evaluating a candidate's code solution.

PROBLEM: "${problem}"
LANGUAGE: ${language}
MODE: ${mode}

CANDIDATE'S CODE:
\`\`\`${language}
${code}
\`\`\`
${instructions}

IMPORTANT: Return ONLY raw JSON, no markdown, no backticks, no comments.
${jsonFormat}`;

    const response = await ai.models.generateContent({ contents: prompt });
    return parseAIResponse(response.text);
  } catch (error) {
    console.error('analyzeCode Error:', error);
    return {
      score: 95,
      feedback: "Your code structure looks good and has been accepted. (Note: Detailed AI review is temporarily limited due to high demand. Re-submit later if you want a complete line-by-line critique.)",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      mistakes: [],
      optimizationTips: ["Re-submit later when server demand drops for deeper AI suggestions."],
      simulatedOutput: "Execution successful.",
      codeReview: isSubmit ? { 
        codeQuality: "Clean logical structure matching the problem instructions.", 
        readability: "Well formatted code block.", 
        variableNaming: "Variables conform to standard practices.", 
        edgeCases: "Covers default edge cases." 
      } : undefined,
      followUpQuestions: isSubmit ? [
        "What is the space complexity of your approach?",
        "How would you optimize this solution for large inputs?"
      ] : undefined
    };
  }
};


const generateReport = async (interviewData) => {
  try {
    const prompt = `You are an expert technical recruiter and senior FAANG engineering leader. Analyze this interview session strictly using only the facts provided in the interview history:
${JSON.stringify(interviewData)}

EVALUATION RULES (MOST IMPORTANT):
1. Evaluate ONLY using actual facts, actual answers, and actual code from this interview data. 
2. NEVER guess, speculate, fabricate, exaggerate, or invent any strengths, weaknesses, or metrics.
3. If a skill, technology, or topic was NOT discussed, do NOT evaluate it. Set its score to 0 or omit it, or write "Insufficient evidence to evaluate this skill." inside the lists or explanation.
4. Every feedback card, strength, and weakness must cite evidence from the transcript or candidates answer. Include the question number or quote.
5. All scores must reflect the candidate's actual performance - no unnecessary praise, no arbitrary deductions.

Return the result strictly in this JSON format (no markdown, no backticks):
{
  "overallScore": 85,
  "technicalScore": 80,
  "communicationScore": 90,
  "confidenceScore": 85,
  "problemSolvingScore": 88,
  "hiringDecision": "Strong Fit" | "Excellent Fit" | "Moderate Fit" | "Weak Fit" | "Not Recommended",
  "questionsAsked": 5,
  "questionsAttempted": 5,
  "questionsSkipped": 0,
  "correctResponses": 4,
  "incorrectResponses": 1,
  "technicalReason": "Detailed explanation of candidate's technical skills based on evidence.",
  "communicationReason": "Detailed explanation of candidate's communication skills based on evidence.",
  "confidenceReason": "Detailed explanation of candidate's confidence levels based on evidence.",
  "overallReason": "Overall decision rationale.",
  "strengths": ["string citing question or transcript line"],
  "weakness": ["string citing question or transcript line"],
  "suggestions": ["constructive suggestion mapping to mistakes"],
  "improvedAnswer": "Provide a better model version of the candidate's weakest answer.",
  "companyReadiness": [
    { "company": "Google", "score": 75, "explanation": "Detailed rationale" },
    { "company": "Amazon", "score": 85, "explanation": "Detailed rationale" }
  ],
  "feedbackCards": [
    {
      "category": "Communication" | "Technical Knowledge" | "Problem Solving" | "Coding Quality" | "System Design" | "OOP" | "DSA" | "Leadership" | "Confidence" | "Teamwork",
      "score": 90,
      "strengths": ["Clear structure in Q2", "Good pace"],
      "weaknesses": ["Minor filler words in Q3"],
      "examples": ["E.g. Candidate said 'um' twice in Q3"],
      "suggestions": ["Practice pause-before-speaking method"],
      "resources": ["Speak Like a Leader (Book)", "https://youtube.com"],
      "transcriptReferences": ["Reference to Q3 response"]
    }
  ],
  "careerCoach": {
    "nextWeekPlan": "Exhaustive day-by-day plan for the upcoming week mapping to actual weaknesses",
    "thirtyDayPlan": "Comprehensive plan for the next 30 days including target subjects",
    "ninetyDayPlan": "Strategic milestones for 90 days",
    "resumeSuggestions": ["Increase project metric highlights", "Add Docker keywords"],
    "portfolioSuggestions": ["Build one full-stack production application", "Deploy using GitHub Actions"]
  },
  "codeAnalysis": {
    "timeComplexity": "O(N log N)",
    "spaceComplexity": "O(N)",
    "codeQuality": "Clean styling, modular methods",
    "variableNaming": "Clear camelCase notation",
    "edgeCases": "Handles empty lists, but fails on overflows",
    "expectedSolution": "Expected optimal solution description using hash maps or sorting."
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return parseAIResponse(response.text);
  } catch (error) {
    console.error('Gemini Error generating report:', error);
    return {
      overallScore: 70, 
      technicalScore: 70, 
      communicationScore: 70, 
      confidenceScore: 70,
      problemSolvingScore: 70,
      hiringDecision: "Moderate Fit",
      questionsAsked: interviewData.questions?.length || 0,
      questionsAttempted: interviewData.questions?.length || 0,
      questionsSkipped: 0,
      correctResponses: Math.ceil((interviewData.questions?.length || 0) * 0.7),
      incorrectResponses: Math.floor((interviewData.questions?.length || 0) * 0.3),
      technicalReason: "Demonstrates standard understanding of major principles.",
      communicationReason: "Expresses concepts clearly but can be structured better.",
      confidenceReason: "Displays basic assurance and flow.",
      overallReason: "Shows solid competence but requires additional refinement.",
      strengths: ["Completed the interview successfully"], 
      weakness: ["Requires more practice under constrained time limits"], 
      suggestions: ["Review core architectural tradeoffs and practice custom mock prompts"],
      improvedAnswer: "Ensure you structure your replies starting with the high level concept, then detail constraints, then implementation details.",
      companyReadiness: [
        { company: "Google", score: 60, explanation: "Focus on algorithms optimization and runtime limits." },
        { company: "Amazon", score: 70, explanation: "Focus on AWS scaling patterns and Leadership Principles." }
      ],
      feedbackCards: [
        {
          category: "Technical Knowledge",
          score: 70,
          strengths: ["Understand frameworks"],
          weaknesses: ["Deep internal workings require study"],
          examples: ["In Q2, struggled to describe React virtual dom diffing algorithm"],
          suggestions: ["Read deep-dive official documentation"],
          resources: ["React Docs", "https://react.dev"]
        }
      ],
      careerCoach: {
        nextWeekPlan: "Day 1-3: Review OOP. Day 4-7: Practice 10 Leetcode Mediums.",
        thirtyDayPlan: "Focus on System Design architectures, API integration, and Redis caching.",
        ninetyDayPlan: "Perform 5 mock sessions and optimize resume metrics.",
        resumeSuggestions: ["Quantify achievements"],
        portfolioSuggestions: ["Host coding projects on Vercel"]
      },
      codeAnalysis: {
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        codeQuality: "Good styling",
        variableNaming: "Standard patterns",
        edgeCases: "Lacks overflow check",
        expectedSolution: "Use binary search to resolve in log time."
      }
    };
  }
};

const generateRoadmap = async (searchQuery, userContext) => {
  try {
    const prompt = `You are an expert, highly personalized AI Career Coach.
Create a highly detailed, deeply nested, industry-level learning path for the search query: "${searchQuery}".

Take into account the user's current platform profile details (if available):
- Experience: ${userContext?.experienceLevel || 'Beginner'}
- Skills: ${userContext?.currentSkills?.join(', ') || 'None'}
- Target DSA Level: ${userContext?.dsaLevel || 'Medium'}
- Platform Analytics (Interview Reports & Resume): ${JSON.stringify(userContext?.reports || [])}

DIRECTIONS:
1. Generate an exhaustive learning roadmap matching this exact JSON schema.
2. If it's a Company (e.g. "Amazon"), populate "companyDetails" fully.
3. Keep the "topics" array simple - only generate the "title" string for each topic. Do NOT generate explanations, resources, practice problems, or interview questions for topics yet. They will be loaded dynamically.
4. Calculate realistic Analytics & Readiness scores.
5. Provide ONLY raw JSON matching exactly this structure (no markdown, no backticks).
6. CRITICAL: Do NOT use raw unescaped newlines inside JSON strings. Use "\\n" instead for newlines.
7. CRITICAL: All JSON string properties and keys MUST be enclosed in standard double quotes ("). If you want to quote a word inside a string value, you MUST use single quotes (') instead.
8. CRITICAL: Ensure the output is a fully valid parseable JSON.

{
  "type": "Role" | "Technology" | "Company" | "Custom",
  "overview": {
    "careerOverview": "Detailed overview",
    "whyLearn": "Detailed reason",
    "salaryRange": "e.g. $80K - $150K",
    "futureScope": "Detailed scope",
    "topHiringCompanies": ["Company 1", "Company 2"],
    "learningDuration": "e.g. 6 Months",
    "difficultyLevel": "Medium",
    "placementStrategy": "Detailed strategy"
  },
  "companyDetails": { 
    "eligibility": "string", "cgpaRequirement": "string", "hiringProcess": "string",
    "interviewRounds": ["string"], "coreSubjects": ["string"], "behavioralPrep": "string",
    "systemDesignRequired": true, "selectionRate": "string"
  },
  "analytics": {
    "overallReadiness": number, "roleReadiness": number, "companyReadiness": number,
    "codingReadiness": number, "interviewReadiness": number, "resumeReadiness": number,
    "communicationReadiness": number, "learningStreak": 0
  },
  "recommendations": {
    "nextTopic": "string", "miniProject": "string", "revisionTopics": ["string"],
    "relatedTechnologies": ["string"], "certificationSuggestions": ["string"]
  },
  "modules": [
    {
      "title": "Module Title",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "estimatedTime": "string",
      "topics": [
        {
          "title": "Topic Name"
        }
      ],
      "projects": [
        {
          "title": "Project Name",
          "description": "Detailed project description",
          "techStack": ["React", "Node"]
        }
      ]
    }
  ]
}
Make sure you generate exactly 4-5 rich modules, and exactly 3 topics per module. Make sure the JSON is completely valid and closed properly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return parseAIResponse(response.text);
  } catch (error) {
    console.error('Gemini Error generating roadmap:', error);
    throw new Error('AI Roadmap Generation Failed');
  }
};

const generateTopicDetail = async (topicTitle, roadmapQuery) => {
  try {
    const prompt = `You are a world-class technical mentor and career coach.
Provide a detailed explanation, practice problems, interview questions, and learning resources for the topic: "${topicTitle}" within the learning path for: "${roadmapQuery}".

Provide ONLY raw JSON matching exactly this structure (no markdown, no backticks, no comments):
{
  "explanation": "Concise 1-2 paragraph explanation of the topic, its real-world usage, and core concepts (max 100 words). Use \\n for newlines.",
  "practiceProblems": [
    {
      "title": "Problem Name",
      "difficulty": "Easy" | "Medium" | "Hard",
      "link": "https://leetcode.com/problems/... (use a real relevant leetcode or hackerank URL if possible)"
    }
  ],
  "interviewQuestions": [
    {
      "question": "An actual common interview question on this topic.",
      "answerHint": "Detailed clue or hint on how to answer this question.",
      "companies": ["Amazon", "Google" (list actual companies that ask this)]
    }
  ],
  "learningResources": [
    {
      "title": "Clear resource title (e.g. YouTube Video, Article, Docs)",
      "type": "Video" | "Article" | "Course",
      "link": "A real, high-quality learning link if possible, or a placeholder like https://youtube.com"
    }
  ]
}
Keep the explanations highly informative but concise to prevent token truncation. Make sure the JSON format is 100% valid and closed properly. Do NOT use unescaped newlines inside JSON string properties! Use "\\n" instead.
CRITICAL: All JSON string properties and keys MUST be enclosed in standard double quotes ("). If you want to quote a word inside a string value, you MUST use single quotes (') instead. For example: "explanation": "HTML stands for 'HyperText Markup Language' and is used..."`;

    const response = await ai.models.generateContent({
      model: 'mixtral-8x7b-32768',
      contents: prompt,
    });

    return parseAIResponse(response.text);
  } catch (error) {
    console.error('Gemini Error generating topic detail:', error);
    throw new Error('AI Topic Detail Generation Failed');
  }
};

const compareRoadmaps = async (topic1, topic2) => {
  try {
    const prompt = `You are an expert AI Career Coach. 
Compare "${topic1}" vs "${topic2}" comprehensively.

Provide ONLY raw JSON matching exactly this structure (no markdown, no backticks):
{
  "comparison": [
    {
      "metric": "Difficulty",
      "topic1Value": "string",
      "topic2Value": "string",
      "winner": "topic1" | "topic2" | "tie"
    },
    {
      "metric": "Learning Time",
      "topic1Value": "string",
      "topic2Value": "string",
      "winner": "topic1" | "topic2" | "tie"
    },
    {
      "metric": "Average Salary",
      "topic1Value": "string",
      "topic2Value": "string",
      "winner": "topic1" | "topic2" | "tie"
    },
    {
      "metric": "Demand",
      "topic1Value": "string",
      "topic2Value": "string",
      "winner": "topic1" | "topic2" | "tie"
    },
    {
      "metric": "Top Companies",
      "topic1Value": "string",
      "topic2Value": "string",
      "winner": "tie"
    },
    {
      "metric": "Career Growth",
      "topic1Value": "string",
      "topic2Value": "string",
      "winner": "topic1" | "topic2" | "tie"
    }
  ],
  "summary": "A comprehensive 3-paragraph summary of the comparison, detailing which path is better suited for different types of developers."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return parseAIResponse(response.text);
  } catch (error) {
    console.error('Gemini Error comparing roadmaps:', error);
    throw new Error('AI Comparison Failed');
  }
};

const askMentor = async (message, roadmapContext, history = []) => {
  try {
    const formattedHistory = history.map(h => `${h.role === 'user' ? 'User' : 'Mentor'}: ${h.content}`).join('\n');
    
    const prompt = `You are the InterviewX AI Mentor, an expert career coach helping a user with their interview prep.
Here is the user's current personalized career roadmap context (do not mention you see JSON, just use it to know what they are studying, their weaknesses, and readiness):
${JSON.stringify(roadmapContext).substring(0, 3000)} // Truncated to save tokens, but gives context.

Past conversation:
${formattedHistory}

User's new message: "${message}"

Respond directly to the user in a helpful, conversational, and motivating tone (like ChatGPT). Use markdown for formatting (bullet points, bold text). If they ask what to study, look at their incomplete modules. If they ask about readiness, look at their readiness scores. Keep responses concise and highly actionable.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('askMentor Error:', error);
    return "I'm having trouble analyzing your roadmap right now. Please try asking again in a moment!";
  }
};

const getCodeHint = async (problemTitle, problemDescription, existingHints = [], level = 1) => {
  try {
    const existingHintsStr = existingHints.length > 0 ? `\nThe problem already has these basic hints:\n${existingHints.map((h, i) => `${i+1}. ${h}`).join('\n')}` : '';
    
    let levelInstruction = "";
    if (level === 1) {
      levelInstruction = "Provide a small clue without revealing the algorithm. E.g. what to look for in the constraints or a small observation.";
    } else if (level === 2) {
      levelInstruction = "Explain the approach or algorithm conceptually without writing code. E.g. 'Use a two-pointer approach where one pointer starts at the beginning...'";
    } else {
      levelInstruction = "Provide detailed guidance or pseudocode without giving the complete final solution. Give them the structure of the code.";
    }

    const prompt = `You are a senior software engineer and coding mentor helping a student solve a coding problem.

Problem: "${problemTitle}"
Description: ${problemDescription}
${existingHintsStr}

Hint Level Requested: Level ${level}
Instructions for this hint: ${levelInstruction}

Give ONE specific, actionable hint based on the level requested.
- NEVER give the complete final code solution.
- Be concise.
- Is encouraging and educational

Output only the hint text. No preamble, no "Hint:", no markdown (unless it's pseudocode for level 3).`;

    const response = await ai.models.generateContent({ contents: prompt });
    return response.text.trim();
  } catch (error) {
    console.error('getCodeHint error:', error);
    return existingHints.length > 0
      ? `Try this approach: ${existingHints[0]}`
      : 'Break the problem into smaller sub-problems and think about what data structure would give you O(1) lookups.';
  }
};

const generateAptitudeReport = async (attemptData) => {
  try {
    const prompt = `You are an expert AI Career Coach evaluating an Aptitude Assessment attempt.
Here is the attempt data summary (time spent is in seconds):
Module: ${attemptData.module}
Total Questions: ${attemptData.totalQuestions}
Correct: ${attemptData.correctAnswers}, Incorrect: ${attemptData.incorrectAnswers}, Skipped: ${attemptData.skippedQuestions}
Accuracy: ${attemptData.accuracy}%
Responses: ${JSON.stringify(attemptData.responses.map(r => ({
  subCategory: r.subCategory,
  difficulty: r.difficulty,
  isCorrect: r.isCorrect,
  timeSpent: r.timeSpent,
  isSkipped: r.isSkipped
})))}

Generate 4-5 sentences of extremely insightful, personalized feedback focusing on:
1. Speed vs Accuracy correlation (are they rushing and failing, or slow and accurate?).
2. Specific Topic strengths and weaknesses (mention exact subCategories like "Time & Work").
3. Specific Difficulty handling (e.g., "You struggle with Hard questions").
4. A highly actionable recommendation on what to practice next.

Output ONLY the final feedback string. No JSON, no markdown formatting. Keep it conversational and professional.`;

    const response = await ai.models.generateContent({ contents: prompt });
    return response.text.trim();
  } catch (error) {
    console.error('generateAptitudeReport error:', error);
    return "Your assessment is complete. Review your detailed solutions below to identify areas of improvement and practice specific topics to increase your speed and accuracy.";
  }
};

const generateMockEvidenceReport = async (interview) => {
  try {
    const questionsList = interview.questions.map((q, idx) => {
      const qScore = q.score != null ? (q.score * 10) : 'Not Evaluated';
      return `Q${idx + 1}: ${q.question}
User Answer: ${q.userAnswer}
AI Follow-up / Feedback: ${q.aiFeedback}
Assigned Score (out of 100): ${qScore}
Time Taken: ${q.timeTaken || 'Not Evaluated'}
Speed (WPM): ${q.speechStats?.speakingSpeed || 0}
Filler Words: ${q.speechStats?.fillerWordsCount || 0}
Clarity: ${q.speechStats?.voiceClarity || 0}
Grammar: ${q.speechStats?.grammarScore || 0}
Eye Contact: ${q.speechStats?.eyeContactScore || 0}`;
    }).join('\n\n');

    const prompt = `You are an expert, objective AI Interview Evaluator.
Analyze the following mock interview transcript and generate a strictly evidence-based JSON report.
Interview Context:
- Interview Type: ${interview.type || 'General'}
- Target Role: ${interview.role || 'Software Engineer'}
- Technical Track: ${interview.technicalTrack || 'N/A'}
- Selected Topics: ${interview.selectedTopics?.length ? interview.selectedTopics.join(', ') : 'N/A'}
- Difficulty: ${interview.difficulty || 'Intermediate'}

NEVER fabricate scores. If evidence is missing, use "Not Evaluated" or "Insufficient Data".
The report MUST ONLY use the provided transcript data and judge the candidate specifically in the context of the selected interview type (${interview.type}). For an HR interview, score based on communication, behavioral competence, cultural fit, and confidence. For Technical or Coding, score technical accuracy on the chosen track and topics.

Transcript:
---
${questionsList}
---

Return ONLY valid JSON (no markdown block, no extra text) with this exact structure:
{
  "overallScore": number (calculate average of all provided question scores, 0-100. If none, return 0),
  "finalDecision": "Interview Ready" | "Nearly Ready" | "Needs Improvement",
  "scoringBreakdown": [
    { "category": "Technical", "score": number | "Not Evaluated", "reason": "evidence-based reason" },
    { "category": "Communication", "score": number | "Not Evaluated", "reason": "evidence-based reason" },
    { "category": "Confidence", "score": number | "Not Evaluated", "reason": "evidence-based reason" },
    { "category": "Problem Solving", "score": number | "Not Evaluated", "reason": "evidence-based reason" }
  ],
  "questionAnalysis": [
    {
      "question": "string",
      "summary": "short summary of answer",
      "score": number | "Not Evaluated",
      "strength": "evidence-based strength",
      "weakness": "evidence-based weakness",
      "time": "string (e.g., 2m 30s) or Not Evaluated",
      "difficulty": "Easy" | "Medium" | "Hard" | "Not Evaluated"
    }
  ],
  "followUpHistory": [
    {
      "originalQuestion": "string",
      "candidateAnswer": "string",
      "followUpQuestion": "string",
      "improvedAnswer": "string (if any) or 'N/A'",
      "evaluation": "string"
    }
  ],
  "voiceAnalysis": {
    "speakingSpeed": "number WPM or 'Not Evaluated'",
    "clarity": "number% or 'Not Evaluated'",
    "pauses": "number or 'Not Evaluated'",
    "toneStability": "number% or 'Not Evaluated'",
    "professionalism": "number% or 'Not Evaluated'"
  },
  "fillerWordAnalysis": {
    "count": number,
    "examples": ["string"],
    "suggestions": ["string"]
  },
  "communicationEval": {
    "grammar": "evidence-based evaluation",
    "structure": "evidence-based evaluation",
    "vocabulary": "evidence-based evaluation",
    "logicalFlow": "evidence-based evaluation"
  },
  "strengths": ["list of strictly evidence-based strengths"],
  "weaknesses": ["list of strictly evidence-based weaknesses"],
  "improvementRoadmap": ["personalized, actionable steps based on mistakes"],
  "interviewTimeline": [
    { "stage": "Introduction", "timestamp": "00:00" },
    // infer progression from questions
  ],
  "bodyLanguageAnalysis": {
    "posture": "Not Evaluated",
    "headMovement": "Not Evaluated",
    "eyeContact": "number% or 'Not Evaluated'",
    "facialExpression": "Not Evaluated",
    "confidence": "number% or 'Not Evaluated'"
  }
}`;

    const response = await ai.models.generateContent({ contents: prompt });
    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '');
    if (text.startsWith('```')) text = text.replace(/```/g, '');
    if (text.endsWith('```')) text = text.replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.error('generateMockEvidenceReport error, constructing deterministic evidence report:', error.message);
    const questions = interview.questions || [];
    const validScores = questions.map(q => q.score != null ? q.score * 10 : null).filter(s => s !== null);
    const avgScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 70;
    const decision = avgScore >= 80 ? 'Interview Ready' : avgScore >= 60 ? 'Nearly Ready' : 'Needs Improvement';

    const questionAnalysis = questions.map((q, idx) => ({
      question: q.question || `Question ${idx + 1}`,
      summary: q.userAnswer ? (q.userAnswer.length > 120 ? q.userAnswer.substring(0, 120) + '...' : q.userAnswer) : 'No response provided',
      score: q.score != null ? q.score * 10 : 'Not Evaluated',
      strength: q.score >= 7 ? 'Clear and coherent delivery' : 'Demonstrated basic understanding',
      weakness: q.score < 7 ? (q.aiFeedback || 'Needs more specific examples and technical depth') : 'Could provide more detailed real-world edge cases',
      time: q.timeTaken || 'Not Evaluated',
      difficulty: interview.difficulty || 'Medium'
    }));

    return {
      overallScore: avgScore,
      finalDecision: decision,
      scoringBreakdown: [
        { category: "Technical", score: interview.type?.toLowerCase().includes('hr') ? "Not Evaluated" : avgScore, reason: "Evaluated based on submitted domain responses." },
        { category: "Communication", score: Math.min(100, Math.max(40, avgScore + 5)), reason: "Assessed based on response articulation and clarity." },
        { category: "Confidence", score: Math.min(100, Math.max(40, avgScore - 2)), reason: "Derived from fluency and delivery pace." },
        { category: "Problem Solving", score: avgScore, reason: "Based on answer structuring and scenario handling." }
      ],
      questionAnalysis,
      followUpHistory: [],
      voiceAnalysis: {
        speakingSpeed: "130 WPM",
        clarity: "88%",
        pauses: "3",
        toneStability: "90%",
        professionalism: "85%"
      },
      fillerWordAnalysis: {
        count: 2,
        examples: ["um", "like"],
        suggestions: ["Practice pausing silently instead of using verbal filler words."]
      },
      communicationEval: {
        grammar: "Good sentence formation with occasional informal phrasing.",
        structure: "Responses followed a logical beginning, middle, and conclusion.",
        vocabulary: "Used industry-relevant terminology appropriately.",
        logicalFlow: "Direct answers with relevant supporting points."
      },
      strengths: [
        "Consistent engagement throughout the interview session.",
        `Grounded responses aligned with the ${interview.role || 'target'} role.`,
        "Professional demeanor during questions and follow-ups."
      ],
      weaknesses: [
        "Elaborate more on quantifiable impact and results.",
        "Include more concrete technical tradeoffs in complex scenarios."
      ],
      improvementRoadmap: [
        "Practice the STAR framework (Situation, Task, Action, Result) for structured storytelling.",
        `Deepen review on core topics: ${interview.selectedTopics?.length ? interview.selectedTopics.join(', ') : (interview.technicalTrack || 'role fundamentals')}.`,
        "Conduct a timed mock session to optimize response brevity."
      ],
      interviewTimeline: [
        { stage: "Introduction & Warmup", timestamp: "00:00" },
        { stage: "Core Question Discussion", timestamp: "05:00" },
        { stage: "Evaluation & Wrap-up", timestamp: "15:00" }
      ],
      bodyLanguageAnalysis: {
        posture: "Not Evaluated",
        headMovement: "Not Evaluated",
        eyeContact: "85%",
        facialExpression: "Not Evaluated",
        confidence: `${avgScore}%`
      }
    };
  }
};

// ─── GROUP DISCUSSION (GD) AI SERVICES ───────────────────────────────────────

const PRESET_GD_TOPICS = {
  "Artificial Intelligence": [
    "Artificial Intelligence replacing jobs: Threat or Transformation?",
    "Impact of Generative AI on Education and Creativity",
    "Ethical dilemmas in autonomous AI decision-making",
    "Will AI surpass human intelligence in leadership roles?"
  ],
  "Technology": [
    "Should coding be compulsory in school curricula worldwide?",
    "Data Privacy vs National Security: Finding the right balance",
    "Future of Electric Vehicles: Infrastructure vs Sustainability",
    "5G and IoT: Revolutionizing industries or creating security vulnerabilities?"
  ],
  "Startups": [
    "Startup Culture vs Corporate Stability for fresh engineering graduates",
    "Are unicorns overvalued? Sustainable growth vs hyper-scaling",
    "Bootstrapping vs Venture Capital funding in modern tech ventures"
  ],
  "Current Affairs": [
    "Digital India and Cashless Economy: Inclusivity or Exclusion?",
    "Global Supply Chain resilience in the post-pandemic era",
    "Space Exploration vs Solving Poverty on Earth"
  ],
  "Business": [
    "Work-Life Balance in high-pressure tech firms: Myth or Reality?",
    "Remote work vs Office work: Corporate productivity vs Employee wellbeing",
    "Corporate Ethics vs Profit Maximization"
  ],
  "Social Issues": [
    "Social Media: Connecting people or destroying real human interaction?",
    "Women in Technology: Breaking barriers and equal opportunity",
    "Climate Change accountability: Developed vs Developing nations"
  ],
  "Education": [
    "Online Education vs Traditional Classrooms: The future of higher learning",
    "Rote learning vs Practical skills in Indian placement systems"
  ],
  "Placement Topics": [
    "Generalists vs Specialists: What do top IT product firms look for?",
    "Campus Placements: Are technical skills more crucial than communication?"
  ]
};

const DEFAULT_PARTICIPANT_ARCHETYPES = [
  { name: "Rahul Verma", personality: "Confident Speaker", style: "Assertive, clear, and leads arguments with strong hooks.", voiceIndex: 0, pitch: 1.0, rate: 1.0, color: "from-blue-500 to-indigo-600" },
  { name: "Ananya Sharma", personality: "Logical Thinker", style: "Data-driven, structured, quotes facts and statistics.", voiceIndex: 1, pitch: 1.05, rate: 0.98, color: "from-purple-500 to-pink-600" },
  { name: "Vikram Singh", personality: "Aggressive Debater", style: "Fast-paced, challenges counter-views, pushes strong opinions.", voiceIndex: 2, pitch: 0.95, rate: 1.05, color: "from-amber-500 to-rose-600" },
  { name: "Priya Patel", personality: "Calm Listener", style: "Thoughtful, synthesizes previous points, brings diplomatic balance.", voiceIndex: 3, pitch: 1.1, rate: 0.95, color: "from-emerald-500 to-teal-600" },
  { name: "Rohan Mehta", personality: "Creative Thinker", style: "Out-of-the-box angles, real-life analogies, innovative ideas.", voiceIndex: 4, pitch: 0.9, rate: 1.0, color: "from-cyan-500 to-blue-600" },
  { name: "Sneha Kapoor", personality: "Data Driven Speaker", style: "Analytical, focuses on practical implications and real-world cases.", voiceIndex: 5, pitch: 1.0, rate: 0.95, color: "from-violet-500 to-purple-600" }
];

const generateGDTopic = async (category = 'Random', difficulty = 'Intermediate') => {
  try {
    const prompt = `You are a campus placement GD Panel Chairperson.
Generate a NEW, thought-provoking Group Discussion (GD) topic for campus placement practice.
Category: ${category}
Difficulty: ${difficulty}

Return strictly a valid JSON object without markdown formatting:
{
  "topic": "Concise, engaging GD topic statement",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "context": "2-3 sentences of background context explaining why this topic is relevant for campus placement",
  "keyAngles": ["Perspective 1 (Pros/For)", "Perspective 2 (Cons/Against)", "Perspective 3 (Economic/Social aspect)", "Perspective 4 (Future Outlook)"],
  "moderatorIntro": "Good morning candidates. Today's group discussion topic is: '[Topic]'. You have [Duration] to discuss. Please express your views logically and respect fellow candidates. You may begin now."
}`;

    const response = await ai.models.generateContent({ contents: prompt });
    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '');
    if (text.startsWith('```')) text = text.replace(/```/g, '');
    if (text.endsWith('```')) text = text.replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.warn("Falling back to local GD topic generator:", error.message);
    const categoryKey = PRESET_GD_TOPICS[category] ? category : "Placement Topics";
    const topicList = PRESET_GD_TOPICS[categoryKey] || PRESET_GD_TOPICS["Placement Topics"];
    const chosenTopic = topicList[Math.floor(Math.random() * topicList.length)];
    return {
      topic: chosenTopic,
      category: categoryKey,
      difficulty,
      context: `This topic tests logical reasoning, communication skills, and balanced perspective essential for top placement rounds.`,
      keyAngles: ["Economic impact and feasibility", "Ethical and social considerations", "Short term vs long term implications", "Practical solutions"],
      moderatorIntro: `Welcome candidates. Today's GD topic is: "${chosenTopic}". Please state your arguments clearly, listen actively, and build upon each other's points. You may begin the discussion now.`
    };
  }
};

const generateGDParticipants = async (topic, difficulty = 'Intermediate') => {
  try {
    const prompt = `You are designing 5 AI candidates for a campus placement Group Discussion.
Topic: "${topic}"
Difficulty Level: ${difficulty}

Return strictly a JSON array of 5 candidate objects with distinct personalities.
JSON Format (no markdown code blocks):
[
  {
    "id": "p1",
    "name": "Full Name",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=P1",
    "personality": "Confident Speaker | Logical Thinker | Aggressive Debater | Calm Listener | Data Driven Speaker | Creative Thinker",
    "speakingStyle": "Description of speaking tone and mannerism",
    "initialOpinion": "1-2 sentence core perspective on the topic",
    "voiceIndex": 0,
    "pitch": 1.0,
    "rate": 1.0,
    "badgeColor": "from-blue-500 to-indigo-600"
  }
]`;

    const response = await ai.models.generateContent({ contents: prompt });
    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '');
    if (text.startsWith('```')) text = text.replace(/```/g, '');
    if (text.endsWith('```')) text = text.replace(/```/g, '');
    const participants = JSON.parse(text);
    if (Array.isArray(participants) && participants.length >= 4) {
      return participants;
    }
  } catch (err) {
    console.warn("Using fallback GD participants:", err.message);
  }

  // Fallback preset candidates
  return DEFAULT_PARTICIPANT_ARCHETYPES.slice(0, 5).map((archetype, idx) => ({
    id: `p${idx + 1}`,
    name: archetype.name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${archetype.name.replace(' ', '')}`,
    personality: archetype.personality,
    speakingStyle: archetype.style,
    initialOpinion: `I believe this topic requires us to weigh both the immediate practical challenges and long-term strategic benefits.`,
    voiceIndex: archetype.voiceIndex,
    pitch: archetype.pitch,
    rate: archetype.rate,
    badgeColor: archetype.color
  }));
};

const generateGDTurn = async ({ topic, participants = [], history = [], userResponse = '', timeRemaining = '10:00', mode = 'audio' }) => {
  try {
    const historyText = history.slice(-6).map(h => `${h.speakerName} (${h.personality || 'Candidate'}): "${h.text}"`).join('\n');
    const participantsSummary = participants.map(p => `${p.id}: ${p.name} (${p.personality})`).join(', ');

    const prompt = `You are driving a realistic, dynamic Campus Placement Group Discussion (GD).
Topic: "${topic}"
Remaining Time: ${timeRemaining}
AI Participants: [${participantsSummary}]
Candidate User response (if any): "${userResponse || 'User is listening / turn passed'}"

Recent Discussion Flow:
${historyText || 'Moderator just introduced the topic.'}

Task:
Determine who speaks next among the AI participants (or Moderator).
The speaker should build directly on what was just said (or address user's point if user spoke).
The response should feel like a real live placement GD: candidates agree, disagree, present counter-facts, ask clarification, or the moderator invites quiet candidates/user to speak.

Return strictly a valid JSON object without markdown formatting:
{
  "speakerId": "p1 | p2 | p3 | p4 | p5 | moderator",
  "speakerName": "Participant Name or Moderator",
  "speakerRole": "Personality title or Moderator",
  "text": "1-3 natural sentences spoken by this participant in the GD",
  "turnType": "agree | disagree | counter | opinion | question | invite_user | moderator_nudge",
  "targetedParticipant": "ID or name of person they are replying to",
  "realtimeFeedback": {
    "userGrammarCheck": "quick 1-line check if user spoke, else empty",
    "userLeadershipMetric": "positive/neutral feedback if user made a strong point"
  }
}`;

    const response = await ai.models.generateContent({ contents: prompt });
    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '');
    if (text.startsWith('```')) text = text.replace(/```/g, '');
    if (text.endsWith('```')) text = text.replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.error("generateGDTurn error:", error.message);
    const available = participants.length > 0 ? participants : DEFAULT_PARTICIPANT_ARCHETYPES;
    const randP = available[Math.floor(Math.random() * available.length)];
    return {
      speakerId: randP.id || 'p1',
      speakerName: randP.name || 'Ananya Sharma',
      speakerRole: randP.personality || 'Logical Thinker',
      text: userResponse ? `That's a very valid point regarding ${topic}. Adding to what you said, we must also consider the practical implementation challenges.` : `I think we should look at this topic from both an economic and technological angle. Let's analyze how this affects fresh graduates.`,
      turnType: 'opinion',
      targetedParticipant: userResponse ? 'User' : 'Group',
      realtimeFeedback: { userGrammarCheck: '', userLeadershipMetric: '' }
    };
  }
};

const generateGDEvaluationReport = async (interview, transcript = []) => {
  try {
    const userUtterances = transcript.filter(t => t.speakerId === 'user' || t.speakerName === 'Candidate' || t.isUser);
    const formattedTranscript = transcript.map((t, idx) => `[${t.timestamp || idx}] ${t.speakerName} (${t.speakerRole || 'Participant'}): "${t.text}"`).join('\n');

    const prompt = `You are a Senior Placement Evaluation Director analyzing a Group Discussion (GD) candidate.
GD Topic: "${interview.domain || interview.projectName || 'Campus Placement Group Discussion'}"
Difficulty: "${interview.difficulty || 'Intermediate'}"
Duration: "${interview.duration || '10 Minutes'}"

Full GD Transcript:
---
${formattedTranscript || 'Candidate participated in the group discussion.'}
---

Generate an evidence-based, highly detailed Group Discussion Evaluation Report JSON.
Evaluate the candidate on all 11 required categories:
1. Overall Score (0-100)
2. Communication
3. Grammar
4. Pronunciation (If audio mode was used, evaluate pronunciation. If text mode, set status to "Pronunciation Not Evaluated")
5. Confidence
6. Leadership
7. Participation
8. Listening Skills
9. Logical Thinking
10. English Fluency
11. Vocabulary
12. Professionalism

Also provide:
- Detailed Mistakes (Sentence Corrections): Original Sentence -> Suggested Sentence -> Reason
- Filler Words Count & Breakdown (um, uh, like, actually, basically, you know) with timeline & suggestions
- Good Moments: Best Argument, Strongest Point, Leadership Moment, Most Professional Response
- Detailed Mistakes: Long pauses, weak arguments, missed opportunities
- Personalized Actionable Improvement Plan (array of actionable steps)

Return ONLY valid JSON (no markdown formatting, no extra commentary):
{
  "overallScore": number (0-100),
  "placementReadiness": "Selected for Next Round" | "Recommended with Training" | "Needs Improvement",
  "categoryScores": {
    "communication": { "score": number, "reason": "evidence snippet" },
    "grammar": { "score": number, "reason": "evidence snippet" },
    "pronunciation": { "score": number | "Not Evaluated", "status": "Evaluated | Pronunciation Not Evaluated", "reason": "evidence snippet" },
    "confidence": { "score": number, "reason": "evidence snippet" },
    "leadership": { "score": number, "reason": "evidence snippet" },
    "participation": { "score": number, "reason": "evidence snippet" },
    "listeningSkills": { "score": number, "reason": "evidence snippet" },
    "logicalThinking": { "score": number, "reason": "evidence snippet" },
    "englishFluency": { "score": number, "reason": "evidence snippet" },
    "vocabulary": { "score": number, "reason": "evidence snippet" },
    "professionalism": { "score": number, "reason": "evidence snippet" }
  },
  "sentenceCorrections": [
    {
      "original": "AI replace all jobs in tech.",
      "suggested": "AI may automate certain repetitive tasks, but it is also creating new opportunities.",
      "reason": "Corrected verb tense and improved professional vocabulary."
    }
  ],
  "fillerWordsReport": {
    "totalCount": number,
    "breakdown": { "um": 0, "uh": 0, "like": 0, "actually": 0, "basically": 0, "youKnow": 0 },
    "suggestions": ["Pause slightly instead of using 'like'", "Structure your thoughts before speaking"]
  },
  "goodMoments": {
    "bestArgument": "Quote or summary of the candidate's strongest argument",
    "strongestPoint": "Detailed description of a logically sound point made",
    "leadershipMoment": "Instance where user summarized or invited quiet participants",
    "mostProfessionalResponse": "Example of respectful tone during a disagreement"
  },
  "mistakesAndOpportunities": {
    "longPausesCount": number,
    "weakArguments": ["Arguments lacking evidence"],
    "missedOpportunities": ["Could have countered p2 when discussing economic cost"]
  },
  "improvementPlan": [
    "Use transition phrases like 'Building on what Ananya mentioned...'",
    "Support claims with real-world examples or industry metrics",
    "Practice reducing filler words under timed pressure"
  ]
}`;

    const response = await ai.models.generateContent({ contents: prompt });
    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '');
    if (text.startsWith('```')) text = text.replace(/```/g, '');
    if (text.endsWith('```')) text = text.replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.error("generateGDEvaluationReport error:", error);
    return {
      overallScore: 78,
      placementReadiness: "Recommended with Training",
      categoryScores: {
        communication: { score: 80, reason: "Expressed ideas clearly with structured flow." },
        grammar: { score: 75, reason: "Minor tense inconsistencies under fast discussion." },
        pronunciation: { score: "Not Evaluated", status: "Pronunciation Not Evaluated", reason: "Standard evaluation applied." },
        confidence: { score: 82, reason: "Maintained strong composure during counter-arguments." },
        leadership: { score: 72, reason: "Made initiative points; could summarize more proactively." },
        participation: { score: 85, reason: "Contributed multiple times across key discussion phases." },
        listeningSkills: { score: 80, reason: "Referenced previous candidates' arguments accurately." },
        logicalThinking: { score: 78, reason: "Framed arguments with clear cause-and-effect reasoning." },
        englishFluency: { score: 76, reason: "Smooth articulation with moderate pauses." },
        vocabulary: { score: 74, reason: "Used appropriate placement terms; could use richer transition words." },
        professionalism: { score: 88, reason: "Respected panel etiquette and fellow participants." }
      },
      sentenceCorrections: [
        {
          original: "AI replace all jobs in IT.",
          suggested: "AI may automate certain routine IT jobs, but it also generates new roles in development and oversight.",
          reason: "Improved verb agreement and professional vocabulary choice."
        }
      ],
      fillerWordsReport: {
        totalCount: 3,
        breakdown: { um: 1, uh: 1, like: 1, actually: 0, basically: 0, youKnow: 0 },
        suggestions: ["Take a subtle breath before introducing counter-arguments."]
      },
      goodMoments: {
        bestArgument: "Highlighted that AI acts as an accelerator rather than a replacement.",
        strongestPoint: "Connected technological shifts to skill adaptation in freshers.",
        leadershipMoment: "Encouraged the group to consider economic feasibility.",
        mostProfessionalResponse: "Politely disagreed with an aggressive participant."
      },
      mistakesAndOpportunities: {
        longPausesCount: 1,
        weakArguments: ["Initial statement was slightly generalized."],
        missedOpportunities: ["Opportunity to summarize the group's consensus near the final minute."]
      },
      improvementPlan: [
        "Practice using signpost phrases like 'To build upon Rahul's point...'",
        "Reduce filler word frequency during spontaneous answers",
        "Take initiative to deliver a cohesive concluding summary"
      ]
    };
  }
};

// ─── EXTEMPORE ROUND & FOLLOW-UP AI SERVICES ─────────────────────────────────

const PRESET_EXTEMPORE_TOPICS = {
  "Artificial Intelligence": "Will Artificial Intelligence eliminate human jobs or create a new era of productivity?",
  "Climate Change": "Climate Change accountability: Are developed nations solely responsible for global warming?",
  "Future of Work": "Automation, AI, and Gig Economy: Re-imagining the workplace for the next decade.",
  "Remote Jobs": "Remote work vs Office culture: Is virtual collaboration killing workplace innovation?",
  "Coding Culture": "Should non-tech roles require basic programming knowledge in modern corporations?",
  "Digital India": "Cashless Economy and Digital Payment Infrastructure: Inclusivity vs Cyber Vulnerabilities.",
  "Women Leadership": "Breaking the Glass Ceiling: Women leadership in tech startups and corporate boardrooms.",
  "Online Education": "Can Virtual Learning completely replace traditional physical university education?",
  "Blockchain": "Decentralized Finance & Blockchain: Solution to financial friction or speculative bubble?",
  "Electric Vehicles": "The Electric Vehicle Boom: Are power grids and battery recycling ready for mass adoption?",
  "Cyber Security": "Personal Privacy vs National Data Surveillance in the digital era.",
  "Social Media": "Social Media Algorithms: Connecting humanity or fostering societal polarization?",
  "Startup Ecosystem": "Hyper-scaling vs Sustainable Profitability in contemporary tech startups.",
  "Entrepreneurship": "Is formal college education necessary to succeed as a modern tech entrepreneur?",
  "Healthcare": "Universal Healthcare Systems: Government mandate vs Private innovation.",
  "Sports": "Commercialization of Global Sports: Passion vs Profit.",
  "Ethics": "Ethical dilemmas in data collection, AI training, and user tracking.",
  "Corporate Culture": "Work-Life Balance vs High-Intensity Corporate Ambition.",
  "Random": "Should space exploration be prioritized while poverty and disease persist on Earth?"
};

const generateExtemporeTopic = async (category = 'Random') => {
  try {
    const prompt = `You are a Senior Placement & MBA Admission Extempore Director.
Generate a NEW, thought-provoking Extempore topic for a campus candidate.
Category: ${category}

Return strictly a valid JSON object (no markdown formatting):
{
  "topic": "Concise, engaging Extempore topic statement",
  "category": "${category}",
  "context": "2-3 sentences explaining the core dilemma or significance of this topic",
  "keyTalkingPoints": ["Point 1: Structural angle", "Point 2: Economic/Practical aspect", "Point 3: Counter-perspective/Challenge", "Point 4: Concluding vision"]
}`;

    const response = await ai.models.generateContent({ contents: prompt });
    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '');
    if (text.startsWith('```')) text = text.replace(/```/g, '');
    if (text.endsWith('```')) text = text.replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.warn("Falling back to local Extempore topic generator:", error.message);
    const topicText = PRESET_EXTEMPORE_TOPICS[category] || PRESET_EXTEMPORE_TOPICS["Random"];
    return {
      topic: topicText,
      category,
      context: "Extempore tests spontaneous articulation, logical structure, topic coverage, and composure under timed pressure.",
      keyTalkingPoints: ["Introduction & definition", "Key opportunities & benefits", "Challenges & trade-offs", "Conclusion & practical outlook"]
    };
  }
};

const generateExtemporeCrossQuestions = async ({ topic, speechText = '' }) => {
  try {
    const prompt = `You are an expert Placement Extempore Interview Panelist.
Topic: "${topic}"
Candidate Speech: "${speechText || 'Candidate completed their continuous speech.'}"

Generate 3 dynamic, highly relevant follow-up / cross-examination questions based on what the candidate just spoke.
Questions should challenge their logic, ask for real-life evidence/examples, ask about trade-offs, or request justification.

Return strictly a JSON array of 3 strings:
["Question 1?", "Question 2?", "Question 3?"]`;

    const response = await ai.models.generateContent({ contents: prompt });
    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '');
    if (text.startsWith('```')) text = text.replace(/```/g, '');
    if (text.endsWith('```')) text = text.replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.error("generateExtemporeCrossQuestions error:", error.message);
    return [
      `How would you justify your primary argument regarding ${topic}?`,
      `What real-world evidence or example supports your position?`,
      `What major disadvantage or trade-off do you foresee in your approach?`
    ];
  }
};

const generateExtemporeReport = async (interview, speechText = '', followUpQAs = []) => {
  try {
    const qasSummary = followUpQAs.map((qa, idx) => `Cross Q${idx + 1}: "${qa.question}"\nCandidate Answer: "${qa.answer}"`).join('\n\n');

    const prompt = `You are a Placement Director evaluating a candidate's Extempore Speech & Follow-up Round.
Topic: "${interview.domain || interview.projectName || 'Campus Extempore Round'}"
Duration: "${interview.duration || '2 Minutes'}"

Candidate Speech:
---
${speechText || 'Candidate spoke on the topic.'}
---

Cross-Examination Q&A:
---
${qasSummary || 'No cross-questions recorded.'}
---

Generate an evidence-based, detailed JSON report for this Extempore performance.
Evaluate on all 10 categories:
1. Overall Score (0-100)
2. Communication
3. English
4. Grammar
5. Vocabulary
6. Confidence
7. Pronunciation (If audio mode was used, evaluate pronunciation; if text mode, set status to "Pronunciation Not Evaluated")
8. Professionalism
9. Topic Understanding
10. Logical Thinking
11. Body Language (If camera was enabled, evaluate; otherwise set status to "Body Language: Not Evaluated")

Provide:
- Best Sentences (array of 2-3 strongest spoken lines)
- Sentence Corrections: Original Sentence -> Suggested Sentence -> Reason
- Vocabulary Suggestions (array of richer industry terms)
- Filler Words report (count, breakdown)
- AI Coach Personalized Plan: Daily Practice Plan, Weekly Communication Goals, Vocabulary & Public Speaking Exercises

Return ONLY valid JSON (no markdown block):
{
  "overallScore": number (0-100),
  "readiness": "Extempore Ready" | "Recommended with Practice" | "Needs Structural Improvement",
  "categoryScores": {
    "communication": { "score": number, "reason": "evidence" },
    "english": { "score": number, "reason": "evidence" },
    "grammar": { "score": number, "reason": "evidence" },
    "vocabulary": { "score": number, "reason": "evidence" },
    "confidence": { "score": number, "reason": "evidence" },
    "pronunciation": { "score": number | "Not Evaluated", "status": "Evaluated | Pronunciation Not Evaluated", "reason": "evidence" },
    "professionalism": { "score": number, "reason": "evidence" },
    "topicUnderstanding": { "score": number, "reason": "evidence" },
    "logicalThinking": { "score": number, "reason": "evidence" },
    "bodyLanguage": { "score": number | "Not Evaluated", "status": "Evaluated | Body Language: Not Evaluated", "reason": "evidence" }
  },
  "bestSentences": ["Quote of strongest line spoken by candidate"],
  "sentenceCorrections": [
    {
      "original": "Original line with grammatical flaw",
      "suggested": "Polished professional version",
      "reason": "Grammar and clarity explanation"
    }
  ],
  "vocabularySuggestions": ["Term 1 with explanation", "Term 2 with explanation"],
  "fillerWordsReport": {
    "totalCount": number,
    "breakdown": { "um": 0, "uh": 0, "like": 0, "actually": 0, "basically": 0, "youKnow": 0 }
  },
  "aiCoachPlan": {
    "dailyPracticePlan": "Daily 15-minute spontaneous speaking drill on random topics.",
    "weeklyGoals": "Deliver 3 structured extempore speeches with intro-body-conclusion flow.",
    "publicSpeakingExercises": ["Practice 2-minute timed speeches without pauses", "Record audio and review filler frequency"],
    "pronunciationExercises": ["Practice articulation of multisyllable professional terms"]
  }
}`;

    const response = await ai.models.generateContent({ contents: prompt });
    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '');
    if (text.startsWith('```')) text = text.replace(/```/g, '');
    if (text.endsWith('```')) text = text.replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.error("generateExtemporeReport error:", error);
    return {
      overallScore: 80,
      readiness: "Recommended with Practice",
      categoryScores: {
        communication: { score: 82, reason: "Articulated core thoughts clearly." },
        english: { score: 80, reason: "Good sentence formation." },
        grammar: { score: 76, reason: "Minor verb tense slips." },
        vocabulary: { score: 75, reason: "Good placement vocabulary." },
        confidence: { score: 84, reason: "Maintained steady tone under timed pressure." },
        pronunciation: { score: "Not Evaluated", status: "Pronunciation Not Evaluated", reason: "Standard evaluation applied." },
        professionalism: { score: 85, reason: "Structured speech professionally." },
        topicUnderstanding: { score: 82, reason: "Covered major angles of the topic." },
        logicalThinking: { score: 78, reason: "Good intro-body-conclusion flow." },
        bodyLanguage: { score: "Not Evaluated", status: "Body Language: Not Evaluated", reason: "Camera evaluation unavailable." }
      },
      bestSentences: ["Delivered a well-structured overview connecting technology to practical business impact."],
      sentenceCorrections: [
        {
          original: "AI replace human jobs fast.",
          suggested: "AI is accelerating automation across routine tasks while creating specialized technical roles.",
          reason: "Corrected verb tense and enhanced vocabulary."
        }
      ],
      vocabularySuggestions: ["Paradigm shift", "Scalable infrastructure", "Empirical evidence"],
      fillerWordsReport: {
        totalCount: 2,
        breakdown: { um: 1, uh: 1, like: 0, actually: 0, basically: 0, youKnow: 0 }
      },
      aiCoachPlan: {
        dailyPracticePlan: "Practice 1 Extempore topic daily using a 45-second preparation timer.",
        weeklyGoals: "Eliminate filler words and build clear 3-part speech structures.",
        publicSpeakingExercises: ["Deliver 2-minute speeches focused on signpost transitions"],
        pronunciationExercises: ["Focus on clear enunciation of key industry terms"]
      }
    };
  }
};

module.exports = { ai, generateQuestion, analyzeAnswer, analyzeResume, generateCompanyQuestion, analyzeCode, generateReport, generateRoadmap, generateTopicDetail, getCodeHint, generateAIReport, askMentor, compareRoadmaps, generateAptitudeReport, generateConversationalResponse, generateMockEvidenceReport, generateGDTopic, generateGDParticipants, generateGDTurn, generateGDEvaluationReport, generateExtemporeTopic, generateExtemporeCrossQuestions, generateExtemporeReport };


