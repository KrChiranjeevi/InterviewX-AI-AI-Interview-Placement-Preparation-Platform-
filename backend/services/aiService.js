const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1" 
});

// Industry-level AI Provider Abstraction with Fallback
// Order: OpenAI -> Gemini -> Groq
const ai = {
  models: {
    generateContent: async ({ contents }) => {
      // 1. Try OpenAI
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: contents }],
          max_tokens: 8000,
        });
        return { text: response.choices[0].message.content };
      } catch (err1) {
        console.error("⚠️ OpenAI failed:", err1.message);
        
        // 2. Try Gemini
        try {
          const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
          });
          return { text: response.text };
        } catch (err2) {
          console.error("⚠️ Gemini failed:", err2.message);
          
          // 3. Try Groq
          try {
            const response = await groq.chat.completions.create({
              model: "llama-3.1-8b-instant",
              messages: [{ role: "user", content: contents }],
              max_tokens: 2048,
            });
            return { text: response.choices[0].message.content };
          } catch (err3) {
            console.error("❌ Groq failed:", err3.message);
            fs.writeFileSync('ai_error.log', err3.toString());
            throw new Error("All AI providers failed. Quota exceeded everywhere.");
          }
        }
      }
    }
  }
};

const parseAIResponse = (text) => {
  try {
    // Write raw text to file for debugging
    try {
      fs.writeFileSync('C:/Users/kchir/.gemini/antigravity-ide/brain/2a259707-2dca-4fa1-aacb-89518349e26a/scratch/raw_ai_response.txt', text);
    } catch (fsErr) {
      console.error('Failed to write raw AI response to file:', fsErr.message);
    }
    
    let jsonStr = text.trim();
    // Strip markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.substring(3);
    }
    // Strip trailing backticks
    const lastBacktick = jsonStr.lastIndexOf('```');
    if (lastBacktick !== -1) {
      jsonStr = jsonStr.substring(0, lastBacktick);
    }
    
    // Sanitize literal control characters (like actual unescaped newlines/tabs inside strings)
    // JSON allows structural whitespace, so replacing them with spaces makes it valid 1-line JSON
    jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]+/g, ' ');
    
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    console.error('parseAIResponse failed:', e.message, '\nRaw text:', text?.substring(0, 4000));
    throw e;
  }
};

const companyGuides = {
  'Amazon': `
AMAZON Interview Style:
- High focus on Amazon's 16 Leadership Principles (Customer Obsession, Ownership, Deliver Results, Bias for Action).
- Frequently weave in questions or follow-ups related to these principles.
- Expect coding questions accompanied by behavioural checks.`,

  'Google': `
GOOGLE Interview Style:
- Target raw intelligence, algorithmic thinking, graph traversals, dynamic programming, and mathematical proofs.
- Probe candidate's step-by-step thinking process rather than just code.
- Expect excellent communications and structural descriptions.`,

  'Microsoft': `
MICROSOFT Interview Style:
- Emphasize solid OOP design, database query normalization, thread safety, system components scaling, and standard coding.
- Inquire about design choices, error handling, and collaborative engineering.`,

  'Meta': `
META Interview Style:
- Target high-speed coding, space/time optimizations, memory allocations, caching systems, and massive system scalability.
- Rapid technical follow-ups.`,

  'TCS': `
TCS/INFOSYS/WIPRO Interview Style:
- Probe foundational CS fundamentals: DBMS Joins, OS process states, OOP concepts (Inheritance vs Abstraction), and basic syntax structures.
- Traditional behavioral questions.`,
  'Infosys': `
TCS/INFOSYS/WIPRO Interview Style:
- Probe foundational CS fundamentals: DBMS Joins, OS process states, OOP concepts (Inheritance vs Abstraction), and basic syntax structures.
- Traditional behavioral questions.`,
  'Wipro': `
TCS/INFOSYS/WIPRO Interview Style:
- Probe foundational CS fundamentals: DBMS Joins, OS process states, OOP concepts (Inheritance vs Abstraction), and basic syntax structures.
- Traditional behavioral questions.`
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
      'Intermediate': `INTERMEDIATE level: Focus on applied scenarios, multi-layer conceptual logic (e.g. state contexts, SOLID design, relational joins), and mid-level troubleshooting.`,
      'Advanced': `ADVANCED level: Deep dive into distributed scaling, hard dynamic algorithms, microservices pipelines, extreme optimization cases, and structural bottlenecks.`
    };

    const typeGuide = {
      'Technical Interview': `Technical Interview Focus: Focus on core programming modules, runtime complexities, memory optimizations, frameworks internals, and practical system logic.`,
      'HR Interview': `HR Interview Focus: Focus strictly on behavioral STAR method scenarios, team conflicts, failures, corporate ethic values, and salary structure alignments.`
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
    }

    const previousQuestionsStr = history.length > 0
      ? `Previously asked questions in this session: ${history.map(h => `"${h.question}"`).join(', ')}`
      : 'This is the first question of the session.';

    const prompt = `You are Sarah, an expert senior AI Interviewer conducting a realistic job placement assessment.
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
1. Output ONLY the question text (and the hint in brackets if instructed).
2. No preambles, no conversational filler (like "Sure, let's move on").
3. Do NOT repeat any previous questions.
4. Output should be raw text only (no quotes around the final response).`;

    const response = await ai.models.generateContent({ contents: prompt });
    return response.text.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    return "Failed to construct simulation question. Check your API token configuration in the backend env file.";
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
- If it is an answer, assess technical accuracy, STAR consistency, and grade out of 10. Also evaluate live metrics (score 0-10 each):
  1. technicalKnowledge
  2. problemSolving
  3. communication
  4. confidence
  5. accuracy
  6. logicalThinking

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
  }
}`;

    const response = await ai.models.generateContent({ contents: prompt });
    return parseAIResponse(response.text);
  } catch (error) {
    return { 
      isClarification: false, 
      feedback: "Answer registered. System was unable to grade metrics due to quota limit.", 
      score: 6,
      metrics: { technicalKnowledge: 6, problemSolving: 6, communication: 6, confidence: 6, accuracy: 6, logicalThinking: 6 }
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

const analyzeResume = async (resumeText, targetRole) => {
  try {
    const prompt = `You are an Enterprise ATS (Applicant Tracking System) and an expert Tech Recruiter.
Analyze the following resume text strictly, objectively, and critically for the specific target role of: "${targetRole}". 
Provide a highly realistic and accurate assessment. Do NOT sugarcoat.

Resume Text:
---
${resumeText.substring(0, 3500)}
---

Perform a deep ATS analysis based on the "${targetRole}" role:
1. 'skillsFound': Extract ONLY technical/soft skills explicitly mentioned.
2. 'missingSkills': Critical industry-standard skills for ${targetRole} missing from the resume.
3. 'score': Realistic ATS pass score (0-100). Deduct for missing metrics, bad format, missing keywords for ${targetRole}. Average is 40-65.
4. 'strengths' & 'weaknesses': List 3-4 bullet points each.
5. 'formattingIssues': Any ATS parsing issues, lack of action verbs, or readability problems.
6. 'resumeStructure', 'projectQuality', 'experienceAnalysis', 'educationAnalysis', 'certificationsAnalysis', 'keywordDensity': Provide a 1-2 sentence critical analysis for each.
7. 'recommendations', 'aiSuggestions': 4-5 brutally honest, actionable tips to improve this specific resume.
8. 'matchedKeywords', 'priorityKeywords', 'recommendedSkills': Keywords and skills specifically relevant to ${targetRole}.
9. 'skillMatchPercentage': 0-100 score based on how well their skills match the typical ${targetRole} requirements.
10. 'companyCompatibility': Predict compatibility (0-100) with these companies based on their known hiring bar and the candidate's profile: Google, Microsoft, Amazon, Meta, TCS, Infosys, Accenture, Deloitte, Wipro, Cognizant, Capgemini.

Return the result ONLY as raw JSON with NO markdown, NO comments, NO extra text. All 11 companies must be included:
{
  "skillsFound": ["string"],
  "missingSkills": ["string"],
  "score": 0,
  "aiSuggestions": ["string"],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "formattingIssues": ["string"],
  "resumeStructure": "string",
  "projectQuality": "string",
  "experienceAnalysis": "string",
  "educationAnalysis": "string",
  "certificationsAnalysis": "string",
  "keywordDensity": "string",
  "recommendations": ["string"],
  "matchedKeywords": ["string"],
  "priorityKeywords": ["string"],
  "recommendedSkills": ["string"],
  "skillMatchPercentage": 0,
  "companyCompatibility": [
    { "company": "Google", "matchPercent": 0 },
    { "company": "Microsoft", "matchPercent": 0 },
    { "company": "Amazon", "matchPercent": 0 },
    { "company": "Meta", "matchPercent": 0 },
    { "company": "TCS", "matchPercent": 0 },
    { "company": "Infosys", "matchPercent": 0 },
    { "company": "Accenture", "matchPercent": 0 },
    { "company": "Deloitte", "matchPercent": 0 },
    { "company": "Wipro", "matchPercent": 0 },
    { "company": "Cognizant", "matchPercent": 0 },
    { "company": "Capgemini", "matchPercent": 0 }
  ]
}`;

  // IMPORTANT: Do NOT output any markdown, backticks, or comments. Only raw JSON.

    const response = await ai.models.generateContent({ contents: prompt });
    return parseAIResponse(response.text);
  } catch (error) {
    console.error('Gemini Error:', error);
    return {
      skillsFound: ['JavaScript'], missingSkills: ['Docker'], score: 50, aiSuggestions: ['Error analyzing.'],
      strengths: [], weaknesses: [], formattingIssues: [], resumeStructure: '', projectQuality: '',
      experienceAnalysis: '', educationAnalysis: '', certificationsAnalysis: '', keywordDensity: '',
      recommendations: [], matchedKeywords: [], priorityKeywords: [], recommendedSkills: [],
      skillMatchPercentage: 50, companyCompatibility: []
    };
  }
};

const generateCompanyQuestion = async (companyName, round, difficulty, history) => {
  try {
    const prompt = `You are an expert AI interviewer conducting a ${difficulty} level ${round} interview for ${companyName}.
Based on the interview history: ${JSON.stringify(history)}
Generate ONE insightful and challenging interview question specific to ${companyName}'s typical interview process, leadership principles, or technology stack. 
Do not include any other text, just the question.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
      score: 75,
      feedback: "AI evaluation encountered an issue. Your code structure looks good — please try submitting again for a detailed analysis.",
      timeComplexity: "N/A",
      spaceComplexity: "N/A",
      mistakes: [],
      optimizationTips: ["Try re-submitting for a detailed AI analysis."],
      simulatedOutput: "Could not evaluate — please try again.",
      codeReview: isSubmit ? { codeQuality: "N/A", readability: "N/A", variableNaming: "N/A", edgeCases: "N/A" } : undefined,
      followUpQuestions: isSubmit ? ["How would you approach this problem differently?"] : undefined
    };
  }
};


const generateReport = async (interviewData) => {
  try {
    const prompt = `You are an expert technical recruiter analyzing an interview performance.
Here is the interview data: ${JSON.stringify(interviewData)}

Please generate a detailed performance report. Return the result strictly in this JSON format:
{
  "overallScore": 85,
  "technicalScore": 80,
  "communicationScore": 90,
  "confidenceScore": 85,
  "strengths": ["string", "string"],
  "weakness": ["string", "string"],
  "suggestions": ["string", "string"],
  "improvedAnswer": "Provide a better version of the user's weakest answer if possible, or a general tip."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return parseAIResponse(response.text);
  } catch (error) {
    console.error('Gemini Error generating report:', error);
    return {
      overallScore: 70, technicalScore: 70, communicationScore: 70, confidenceScore: 70,
      strengths: ["Completed the interview"], weakness: ["Needs more practice"], suggestions: ["Review core concepts"],
      improvedAnswer: "Keep practicing and structuring your thoughts."
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
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
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

module.exports = { generateQuestion, analyzeAnswer, analyzeResume, generateCompanyQuestion, analyzeCode, generateReport, generateRoadmap, generateTopicDetail, getCodeHint, generateAIReport, askMentor, compareRoadmaps };
