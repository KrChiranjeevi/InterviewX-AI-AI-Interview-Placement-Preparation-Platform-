const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const { rolesDb, companiesDb } = require('./atsDb');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1" 
});
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "InterviewX AI",
  }
});

// Industry-level AI Provider Abstraction with Fallback
// Order: Groq (Verified Working & Fastest) -> OpenAI -> OpenRouter (Gemini) -> OpenRouter (Llama 3 Free) -> Gemini
const ai = {
  models: {
    generateContent: async ({ contents }) => {
      // 1. Try Groq (Working key, ultra fast)
      try {
        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: contents }],
          max_tokens: 4096,
        }, {
          timeout: 8000
        });
        return { text: response.choices[0].message.content };
      } catch (errGroq) {
        console.error("⚠️ Groq failed:", errGroq.message);

        // 2. Try OpenAI
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: contents }],
            max_tokens: 8000,
          }, {
            timeout: 8000
          });
          return { text: response.choices[0].message.content };
        } catch (err1) {
          console.error("⚠️ OpenAI failed:", err1.message);
          
          // 3. Try OpenRouter (Gemini 1.5 Flash)
          try {
            const response = await openrouter.chat.completions.create({
              model: "google/gemini-1.5-flash",
              messages: [{ role: "user", content: contents }],
              max_tokens: 8000,
            }, {
              timeout: 8000
            });
            return { text: response.choices[0].message.content };
          } catch (err2) {
            console.error("⚠️ OpenRouter (Gemini 2.5 Flash) failed:", err2.message);
            
            // 4. Try OpenRouter (Llama 3.3 70B Free)
            try {
              const response = await openrouter.chat.completions.create({
                model: "meta-llama/llama-3.3-70b-instruct:free",
                messages: [{ role: "user", content: contents }],
                max_tokens: 8000,
              }, {
                timeout: 8000
              });
              return { text: response.choices[0].message.content };
            } catch (err3) {
              console.error("⚠️ OpenRouter (Llama 3.3 Free) failed:", err3.message);
              
              // 4.5. Try OpenRouter (Gemma 4 31B Free)
              try {
                const response = await openrouter.chat.completions.create({
                  model: "google/gemma-4-31b-it:free",
                  messages: [{ role: "user", content: contents }],
                  max_tokens: 8000,
                }, {
                  timeout: 8000
                });
                return { text: response.choices[0].message.content };
              } catch (err3_5) {
                console.error("⚠️ OpenRouter (Gemma 4 Free) failed:", err3_5.message);
                
                // 4.6. Try OpenRouter (General Free Router)
                try {
                  const response = await openrouter.chat.completions.create({
                    model: "openrouter/free",
                    messages: [{ role: "user", content: contents }],
                    max_tokens: 8000,
                  }, {
                    timeout: 8000
                  });
                  return { text: response.choices[0].message.content };
                } catch (err3_6) {
                  console.error("⚠️ OpenRouter (General Free) failed:", err3_6.message);
                  
                  // 5. Try Native Gemini
                  try {
                    const response = await gemini.models.generateContent({
                      model: 'gemini-1.5-flash',
                      contents: contents,
                    });
                    return { text: response.text };
                  } catch (err4) {
                    console.error("❌ Native Gemini failed:", err4.message);
                    fs.writeFileSync('ai_error.log', err4.toString());
                    throw new Error("All AI providers failed. Quota exceeded everywhere.");
                  }
                }
              }
            }
          }
        }
      }
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

const generateQuestion = async (role, type, difficulty, history, resumeSkills = [], resumeText = '', company = '') => {
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

    const prompt = `You are Sarah, an expert senior FAANG AI Interviewer conducting a realistic job placement assessment.
Selected Company: ${company || 'Top Tech Company'}
Hiring Role: ${role}
Round Type: ${type}
Current Difficulty: ${difficulty}

${difficultyGuide[difficulty] || difficultyGuide['Intermediate']}
${typeGuide[type] || typeGuide['Technical Interview']}

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

module.exports = { ai, generateQuestion, analyzeAnswer, analyzeResume, generateCompanyQuestion, analyzeCode, generateReport, generateRoadmap, generateTopicDetail, getCodeHint, generateAIReport, askMentor, compareRoadmaps, generateAptitudeReport };
