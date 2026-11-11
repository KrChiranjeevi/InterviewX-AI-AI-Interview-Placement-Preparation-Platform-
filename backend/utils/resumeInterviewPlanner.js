/**
 * Resume Interview Planner, Entity Extractor & Anti-Repetition Engine
 *
 * Ensures Resume Interviews:
 * 1. Extract and use genuine candidate entities (name, education, skills, projects, experience, certifications)
 *    without ever inventing unlisted background details.
 * 2. Progress cleanly across a 12-category interview plan + targeted adaptive follow-ups.
 * 3. Prevent exact and semantic question repetition across both LLM and fallback paths.
 */

const KNOWN_TECH_KEYWORDS = [
  'React', 'Next.js', 'Angular', 'Vue', 'Node.js', 'Express', 'TypeScript', 'JavaScript',
  'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB',
  'Redis', 'Firebase', 'GraphQL', 'REST API', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'Tailwind CSS', 'Redux', 'Spring Boot', 'Django', 'Flask', 'FastAPI', 'Kafka', 'ClickHouse',
  'Git', 'CI/CD', 'Jest', 'Vitest', 'Cypress', 'Playwright', 'Vercel', 'Render', 'Nginx',
  'Gemini', 'OpenAI', 'LangChain', 'LLM', 'RAG', 'TensorFlow', 'PyTorch', 'Machine Learning',
  'JWT', 'OAuth', 'WebSockets', 'WebRTC', 'HTML', 'CSS', 'Linux', 'Microservices'
];

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'being', 'by', 'can', 'could',
  'did', 'do', 'does', 'doing', 'during', 'explain', 'describe', 'tell', 'walk', 'through',
  'me', 'my', 'your', 'you', 'how', 'what', 'why', 'when', 'where', 'which', 'who', 'whom',
  'the', 'this', 'that', 'these', 'those', 'in', 'on', 'of', 'to', 'for', 'from', 'with',
  'about', 'into', 'within', 'used', 'using', 'use', 'make', 'made', 'built', 'build',
  'project', 'resume', 'specifically', 'please', 'share', 'most', 'key', 'main', 'would',
  'have', 'has', 'had', 'if', 'or', 'more', 'specifically', 'actually', 'documented',
  'listed', 'mentioned', 'background', 'experience', 'work', 'worked', 'working'
]);

const RESUME_CATEGORIES = [
  { id: 'overview_intro', label: 'Self-Introduction & Resume Overview' },
  { id: 'education_background', label: 'Education & Academic Foundation' },
  { id: 'skills_languages', label: 'Programming Languages & Core Skills' },
  { id: 'project_overview', label: 'Project Overview & Personal Contribution' },
  { id: 'project_architecture', label: 'Project Architecture & Tech Choices' },
  { id: 'api_database_design', label: 'Frontend, Backend, APIs & Database' },
  { id: 'ai_auth_security_deploy', label: 'AI / Auth / Security & Deployment' },
  { id: 'debugging_challenge', label: 'Technical Challenge & Debugging' },
  { id: 'testing_performance_tradeoffs', label: 'Testing, Performance & Trade-offs' },
  { id: 'experience_internship', label: 'Internship & Work Experience' },
  { id: 'teamwork_behavioral', label: 'Teamwork, Ownership & Collaboration' },
  { id: 'career_goals_fit', label: 'Strengths, Learning & Role Fit' }
];

const getCategoryLabel = (id) => {
  const found = RESUME_CATEGORIES.find(c => c.id === id);
  return found ? found.label : id;
};

/**
 * Strips greeting/acknowledgement preambles and normalizes punctuation & casing.
 */
const normalizeQuestionText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/^(good\s+(morning|afternoon|evening)|welcome(\s+[^!.?]+)?|thank\s+you(\s+for\s+[^!.?]+)?|got\s+it|i\s+see|understood|no\s+problem(\s+at\s+all)?|thanks\s+for\s+sharing)[^.?!]*[.!?]\s*/i, '')
    .replace(/['"`“”‘’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const stemToken = (token) => {
  if (token.length <= 4) return token;
  return token
    .replace(/(ations|ition|ation|ing|edly|ment|ness|ities|ity|ies|es|ed|s)$/i, '')
    .trim();
};

const extractContentTokens = (text) => {
  const norm = normalizeQuestionText(text);
  const words = norm.split(/\s+/).filter(Boolean);
  const tokens = new Set();
  for (const w of words) {
    if (!STOPWORDS.has(w) && w.length >= 2) {
      tokens.add(stemToken(w) || w);
    }
  }
  return tokens;
};

/**
 * Checks exact normalized equality, substring containment, or high semantic token overlap.
 */
const isDuplicateQuestion = (candidateQuestion, askedQuestions = []) => {
  const normCand = normalizeQuestionText(candidateQuestion);
  if (!normCand || normCand.length < 10) return true;

  const candTokens = extractContentTokens(candidateQuestion);

  for (const asked of (askedQuestions || [])) {
    if (!asked || typeof asked !== 'string') continue;
    const normAsked = normalizeQuestionText(asked);
    if (!normAsked) continue;

    // 1. Exact normalized match
    if (normCand === normAsked) return true;

    // 2. Substantial substring overlap
    if (normCand.length >= 30 && normAsked.length >= 30) {
      if (normCand.includes(normAsked) || normAsked.includes(normCand)) return true;
    }

    // 3. Semantic Jaccard & overlap coefficient
    const askedTokens = extractContentTokens(asked);
    if (candTokens.size >= 4 && askedTokens.size >= 4) {
      let intersection = 0;
      candTokens.forEach(t => {
        if (askedTokens.has(t)) intersection += 1;
      });
      const unionSize = candTokens.size + askedTokens.size - intersection;
      const jaccard = unionSize > 0 ? intersection / unionSize : 0;
      const minOverlap = intersection / Math.min(candTokens.size, askedTokens.size);
      if (jaccard >= 0.62 || minOverlap >= 0.78) {
        return true;
      }
    }
  }

  return false;
};

const pickNonDuplicateCandidate = (candidates = [], askedQuestions = []) => {
  for (const cand of candidates) {
    if (cand && !isDuplicateQuestion(cand, askedQuestions)) {
      return cand;
    }
  }
  return null;
};

/**
 * Extracts structured sections safely from raw resume text as a deterministic backup
 * without inventing skills, projects, or employers not actually present in the text.
 */
const extractStructuredResumeProfile = ({
  resumeText = '',
  resumeSkills = [],
  resumeProjects = [],
  resumeExperience = [],
  resumeEducation = [],
  resumeSnapshot = null
} = {}) => {
  const cleanText = String(resumeText || '').replace(/\r/g, '');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Candidate Name
  let candidateName = resumeSnapshot?.candidateName || '';
  if (!candidateName && lines.length > 0) {
    const firstLine = lines[0];
    if (
      firstLine.length >= 3 &&
      firstLine.length <= 45 &&
      !/resume|curriculum|vitae|email|http|@|\d{4,}|skills|summary|objective|education|projects|experience/i.test(firstLine) &&
      /^[A-Za-z][A-Za-z\s.'-]+$/.test(firstLine)
    ) {
      candidateName = firstLine.trim();
    }
  }

  // 2. Skills (provided + genuinely detected keywords from resumeText)
  const skillSet = new Set(
    (Array.isArray(resumeSkills) ? resumeSkills : [])
      .concat(Array.isArray(resumeSnapshot?.skills) ? resumeSnapshot.skills : [])
      .map(s => String(s).trim())
      .filter(Boolean)
  );
  if (cleanText) {
    for (const kw of KNOWN_TECH_KEYWORDS) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
      if (regex.test(cleanText)) {
        skillSet.add(kw);
      }
    }
  }
  const skills = Array.from(skillSet);

  // 3. Projects (provided + section fallback from resumeText)
  const normalizeProject = (p) => {
    if (!p) return null;
    if (typeof p === 'string') return { name: p.trim(), description: '', tech: [] };
    const name = (p.name || p.title || '').trim();
    if (!name) return null;
    const description = (p.description || p.details || '').trim();
    const tech = Array.isArray(p.tech) ? p.tech : (typeof p.tech === 'string' ? p.tech.split(/,\s*/) : []);
    return { name, description, tech };
  };

  let projects = []
    .concat(Array.isArray(resumeProjects) ? resumeProjects : [])
    .concat(Array.isArray(resumeSnapshot?.projects) ? resumeSnapshot.projects : [])
    .map(normalizeProject)
    .filter(Boolean);

  if (projects.length === 0 && lines.length > 0) {
    const projIdx = lines.findIndex(l => /^(personal\s+|academic\s+|key\s+)?projects?\s*:?$/i.test(l));
    if (projIdx !== -1) {
      for (let i = projIdx + 1; i < Math.min(lines.length, projIdx + 18); i++) {
        const line = lines[i];
        if (/^(education|experience|internships?|skills|certifications?|achievements?|summary|objective)\s*:?$/i.test(line)) break;
        // Treat non-long title-like lines (not starting with a bullet or lowercase continuation) as project names
        const cleaned = line.replace(/^[•\-*]\s*/, '').split('|')[0].split('—')[0].split(' - ')[0].trim();
        if (cleaned.length >= 3 && cleaned.length <= 75 && !/^[a-z]/.test(cleaned) && !cleaned.endsWith('.')) {
          projects.push({ name: cleaned, description: line, tech: [] });
        }
        if (projects.length >= 4) break;
      }
    }
  }

  // Deduplicate projects by lowercase name
  const seenProj = new Set();
  projects = projects.filter(p => {
    const key = p.name.toLowerCase();
    if (seenProj.has(key)) return false;
    seenProj.add(key);
    return true;
  });

  // 4. Experience / Internships
  const normalizeExp = (e) => {
    if (!e) return null;
    if (typeof e === 'string') return { role: e.trim(), company: '', description: '' };
    const role = (e.role || e.title || e.position || '').trim();
    const company = (e.company || e.organization || '').trim();
    const description = (e.responsibilities || e.description || '').trim();
    if (!role && !company) return null;
    return { role: role || 'Developer', company, description };
  };

  let experience = []
    .concat(Array.isArray(resumeExperience) ? resumeExperience : [])
    .concat(Array.isArray(resumeSnapshot?.experience) ? resumeSnapshot.experience : [])
    .map(normalizeExp)
    .filter(Boolean);

  if (experience.length === 0 && lines.length > 0) {
    const expIdx = lines.findIndex(l => /^(work\s+experience|experience|internships?)\s*:?$/i.test(l));
    if (expIdx !== -1) {
      for (let i = expIdx + 1; i < Math.min(lines.length, expIdx + 12); i++) {
        const line = lines[i];
        if (/^(education|projects?|skills|certifications?|achievements?)\s*:?$/i.test(line)) break;
        const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
        if (cleaned.length >= 5 && cleaned.length <= 90 && !/^[a-z]/.test(cleaned)) {
          experience.push({ role: cleaned, company: '', description: line });
        }
        if (experience.length >= 3) break;
      }
    }
  }

  // 5. Education
  const normalizeEdu = (ed) => {
    if (!ed) return null;
    if (typeof ed === 'string') return ed.trim();
    const deg = ed.degree || ed.title || '';
    const inst = ed.institution || ed.school || ed.college || '';
    const yr = ed.year || ed.graduationYear || '';
    const base = [deg, inst].filter(Boolean).join(' from ');
    return yr ? (base ? `${base} (${yr})` : String(yr)) : (base || null);
  };

  let education = []
    .concat(Array.isArray(resumeEducation) ? resumeEducation : [])
    .concat(Array.isArray(resumeSnapshot?.education) ? resumeSnapshot.education : [])
    .map(normalizeEdu)
    .filter(Boolean);

  if (education.length === 0 && lines.length > 0) {
    const eduLine = lines.find(l => /\b(b\.?tech|b\.?e\.?|m\.?tech|b\.?sc|m\.?sc|bca|mca|bachelor|master|university|institute of technology|college)\b/i.test(l));
    if (eduLine) {
      education.push(eduLine.replace(/^[•\-*]\s*/, '').slice(0, 120));
    }
  }

  // 6. Certifications
  let certifications = []
    .concat(Array.isArray(resumeSnapshot?.certifications) ? resumeSnapshot.certifications : [])
    .map(c => typeof c === 'string' ? c.trim() : (c?.name || c?.title || '').trim())
    .filter(Boolean);

  if (certifications.length === 0 && lines.length > 0) {
    const certIdx = lines.findIndex(l => /^(certifications?|certificates?|training|courses?)\s*:?$/i.test(l));
    if (certIdx !== -1) {
      for (let i = certIdx + 1; i < Math.min(lines.length, certIdx + 6); i++) {
        const line = lines[i];
        if (/^(education|projects?|skills|experience|achievements?)\s*:?$/i.test(line)) break;
        const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
        if (cleaned.length >= 4 && cleaned.length <= 100) certifications.push(cleaned);
      }
    }
  }

  const lowerAll = `${cleanText} ${skills.join(' ')}`.toLowerCase();
  const flags = {
    hasAI: /\b(ai|llm|gemini|openai|gpt|langchain|rag|vector|embedding|machine learning|tensorflow|pytorch|nlp)\b/i.test(lowerAll),
    hasAuth: /\b(jwt|oauth|auth|authentication|authorization|firebase auth|bcrypt|passport|session)\b/i.test(lowerAll),
    hasDatabase: /\b(mongodb|mongoose|postgresql|postgres|mysql|sql|redis|clickhouse|dynamodb|sqlite|database)\b/i.test(lowerAll),
    hasDeployment: /\b(docker|kubernetes|aws|gcp|azure|vercel|render|netlify|heroku|nginx|ci\/cd|github actions)\b/i.test(lowerAll),
    hasTesting: /\b(jest|vitest|cypress|playwright|mocha|pytest|junit|unit test|integration test|testing)\b/i.test(lowerAll)
  };

  return {
    candidateName,
    skills,
    projects,
    experience,
    education,
    certifications,
    resumeText: cleanText,
    flags
  };
};

/**
 * Generates adaptive follow-up candidate questions directly referencing technologies/concepts
 * from the candidate's previous answer without repeating prior questions.
 */
const buildAdaptiveFollowUpsFromAnswer = (userAnswer = '', profile = {}, lastQuestion = '', isHard = false, isEasy = false) => {
  const ans = String(userAnswer || '').trim();
  const candidates = [];
  if (!ans || ans.split(/\s+/).length < 4) return candidates;

  const ansLower = ans.toLowerCase();
  const firstProj = profile.projects?.[0]?.name || '';

  if (/\b(llm|gemini|openai|gpt|ai|langchain|rag|prompt|model)\b/i.test(ansLower)) {
    candidates.push(
      isHard
        ? `When your LLM or AI integration returns malformed JSON, hits rate limits, or times out, how do you validate outputs and handle fallbacks reliably?`
        : `You mentioned working with AI/LLM integration — how did you structure the prompts or API handling, and what happens if the AI service fails or returns invalid data?`
    );
  }
  if (/\b(mongo|mongodb|postgres|postgresql|mysql|sql|redis|clickhouse|database|schema|index)\b/i.test(ansLower)) {
    candidates.push(
      isHard
        ? `For the database layer you described, how did you design the schema or indexing strategy to prevent slow queries as data grows?`
        : `Following up on the database you mentioned — why was that database a better fit than alternatives, and how did you structure the main data models?`
    );
  }
  if (/\b(api|rest|express|fastapi|django|flask|endpoint|backend|microservice|fetch|axios|kafka)\b/i.test(ansLower)) {
    candidates.push(
      isHard
        ? `Looking at the backend/API flow you explained, how do you validate requests, handle partial failures, and avoid bottlenecks under concurrent traffic?`
        : `How does your frontend communicate with those backend endpoints, and how do you handle loading states, validation, and API errors gracefully?`
    );
  }
  if (/\b(jwt|oauth|auth|authentication|security|token|password|role|middleware)\b/i.test(ansLower)) {
    candidates.push(
      `Regarding the authentication flow you mentioned — how do you protect private routes, store or refresh tokens safely, and prevent unauthorized access?`
    );
  }
  if (/\b(react|next|redux|state|component|frontend|ui|tailwind|cache)\b/i.test(ansLower)) {
    candidates.push(
      `On the frontend side you just described, how did you organize state management and avoid unnecessary re-renders or stale UI states?`
    );
  }
  if (/\b(docker|aws|vercel|render|deploy|cloud|ci\/cd|kubernetes)\b/i.test(ansLower)) {
    candidates.push(
      `When deploying that workflow, how did you manage environment configuration, build failures, or production debugging?`
    );
  }

  // General concrete follow-up anchored in what they actually said if brief/vague
  const words = ans.split(/\s+/).length;
  if (candidates.length === 0 && words >= 5 && words < 20 && !isEasy) {
    const ref = firstProj ? `"${firstProj}"` : 'what you just described';
    candidates.push(
      `Could you give a specific technical example from ${ref} showing the exact part you personally implemented and why you chose that approach?`
    );
  }

  return candidates;
};

/**
 * Selects the next non-duplicate, resume-grounded question across the 12-category progression.
 */
const selectNextResumeQuestionFromPlan = ({
  profile,
  role = 'Software Engineer',
  difficulty = 'Medium',
  userAnswer = '',
  questionAsked = '',
  allAskedQuestions = [],
  adaptiveState = {},
  isSkipped = false,
  isDontKnow = false
}) => {
  const diffLower = String(difficulty || '').toLowerCase();
  const isEasy = diffLower.includes('easy') || diffLower.includes('beginner');
  const isHard = diffLower.includes('hard') || diffLower.includes('advanced') || diffLower.includes('expert');

  const resumePlan = {
    coveredCategories: [...(adaptiveState?.resumePlan?.coveredCategories || [])],
    coveredProjects: [...(adaptiveState?.resumePlan?.coveredProjects || [])],
    coveredSkills: [...(adaptiveState?.resumePlan?.coveredSkills || [])],
    consecutiveFollowUpsCount: adaptiveState?.resumePlan?.consecutiveFollowUpsCount || 0,
    lastCategory: adaptiveState?.resumePlan?.lastCategory || 'overview_intro'
  };

  if (!resumePlan.coveredCategories.includes('overview_intro')) {
    resumePlan.coveredCategories.push('overview_intro');
  }

  // Mark any projects or skills already clearly referenced in questionAsked as covered
  for (const proj of (profile.projects || [])) {
    if (questionAsked && questionAsked.toLowerCase().includes(proj.name.toLowerCase())) {
      if (!resumePlan.coveredProjects.includes(proj.name)) resumePlan.coveredProjects.push(proj.name);
    }
  }

  // Step 1: Adaptive follow-up if answer contains concrete detail & we haven't chained consecutive follow-ups
  if (!isSkipped && !isDontKnow && resumePlan.consecutiveFollowUpsCount < 1) {
    const followUpCandidates = buildAdaptiveFollowUpsFromAnswer(userAnswer, profile, questionAsked, isHard, isEasy);
    const chosenFollowUp = pickNonDuplicateCandidate(followUpCandidates, allAskedQuestions);
    if (chosenFollowUp) {
      resumePlan.consecutiveFollowUpsCount += 1;
      return {
        nextQuestion: chosenFollowUp,
        isFollowUp: true,
        categoryId: resumePlan.lastCategory,
        categoryLabel: getCategoryLabel(resumePlan.lastCategory),
        nextCategoryLabel: getCategoryLabel(
          RESUME_CATEGORIES.find(c => !resumePlan.coveredCategories.includes(c.id))?.id || 'career_goals_fit'
        ),
        resumePlan
      };
    }
  }

  // Step 2: Move forward across uncovered resume categories
  resumePlan.consecutiveFollowUpsCount = 0;

  const getCandidatesForCategory = (catId) => {
    const firstProj = profile.projects?.[0];
    const unaskedProj = (profile.projects || []).find(p => !resumePlan.coveredProjects.includes(p.name))
      || (profile.projects || []).find(p => !allAskedQuestions.some(q => q.toLowerCase().includes(p.name.toLowerCase())))
      || firstProj;

    const secondProj = (profile.projects || []).find(p => unaskedProj && p.name !== unaskedProj.name) || unaskedProj;
    const unaskedSkills = (profile.skills || []).filter(s =>
      !resumePlan.coveredSkills.includes(s) && !allAskedQuestions.some(q => q.toLowerCase().includes(s.toLowerCase()))
    );
    const skillPair = unaskedSkills.slice(0, 3).join(', ') || (profile.skills || []).slice(0, 3).join(', ');
    const primarySkill = unaskedSkills[0] || profile.skills?.[0] || 'your primary programming language';
    const secondarySkill = unaskedSkills[1] || profile.skills?.[1] || primarySkill;
    const firstEdu = profile.education?.[0] || '';
    const firstExp = profile.experience?.[0];
    const firstCert = profile.certifications?.[0] || '';

    switch (catId) {
      case 'overview_intro':
        return [
          `Could you briefly introduce yourself${firstEdu ? ` starting with your academic background (${firstEdu})` : ''} and highlight what drew you to the ${role} role?`
        ];

      case 'education_background':
        if (firstEdu) {
          return [
            `I see "${firstEdu}" on your resume. Which core computer science subjects or coursework from your studies helped you most while building your practical projects?`,
            `Looking at your academic background (${firstEdu}), how did you bridge your coursework concepts into hands-on software development?`
          ];
        }
        return [
          `Could you share a bit about your educational background, graduation timeline, and how you built your technical foundation for ${role}?`
        ];

      case 'skills_languages':
        return [
          skillPair
            ? `Your resume lists ${skillPair}. Which programming language or framework are you strongest in, and what made you prefer it for real development tasks?`
            : `Among the technical skills on your resume, which programming language do you rely on most, and where have you applied it effectively?`,
          primarySkill !== secondarySkill
            ? `Comparing ${primarySkill} and ${secondarySkill} from your skill set, how do you decide which tool fits a given problem best?`
            : `Beyond basic syntax in ${primarySkill}, what deeper concepts or best practices do you follow when writing production-ready code with it?`
        ];

      case 'project_overview':
        if (unaskedProj) {
          const pName = unaskedProj.name;
          return [
            `Let's discuss your project "${pName}". What core problem does it solve, and what parts did you personally design and build?`,
            `On "${pName}", if we look closely at your individual contribution versus any starter templates or libraries, what were you directly responsible for implementing?`
          ];
        }
        return [
          `Could you walk me through the most impactful project on your resume — what problem it solves and what you personally built from scratch?`
        ];

      case 'project_architecture':
        if (secondProj || unaskedProj) {
          const pName = (secondProj || unaskedProj).name;
          return [
            isHard
              ? `Looking at the architecture of "${pName}", why did you structure the components and data flow the way you did, and what alternative stack did you rule out?`
              : `Can you walk me through the overall architecture and tech stack choices behind "${pName}" — how do its core modules fit together?`,
            `In "${pName}", what design trade-off did you have to make between development speed, maintainability, and features?`
          ];
        }
        return [
          `Thinking about your main resume project's architecture, how did you separate responsibilities across frontend, business logic, and data storage?`
        ];

      case 'api_database_design': {
        const refProj = (unaskedProj || firstProj)?.name;
        const dbSkill = (profile.skills || []).find(s => /mongo|sql|postgres|mysql|redis|firebase|database/i.test(s));
        const apiSkill = (profile.skills || []).find(s => /node|express|fastapi|django|flask|rest|graphql|spring/i.test(s));
        return [
          refProj
            ? `Inside "${refProj}"${dbSkill || apiSkill ? ` (with ${[apiSkill, dbSkill].filter(Boolean).join(' & ')})` : ''}, how does data flow from the UI through your API layer down into your database schema?`
            : `Focusing on ${dbSkill || 'database design'} and ${apiSkill || 'REST APIs'} from your background, how do you structure endpoints, validation, and data models cleanly?`,
          `How do you handle error status codes, input validation, and database queries or indexing to keep API responses fast and reliable?`
        ];
      }

      case 'ai_auth_security_deploy': {
        const list = [];
        const alreadyAskedAI = allAskedQuestions.some(q => /\b(ai\/llm|llm|prompt|hallucinat|invalid response|invalid data)\b/i.test(q));
        const alreadyAskedAuth = allAskedQuestions.some(q => /\b(jwt|token|authenticat|private route|unauthorized)\b/i.test(q));
        const alreadyAskedDeploy = allAskedQuestions.some(q => /\b(deploy|docker|cloud|environment config|production debug)\b/i.test(q));

        if (profile.flags?.hasAI && !alreadyAskedAI) {
          list.push(`I noticed AI/LLM technologies in your resume. How did you design the prompt or model pipeline, and how do you handle hallucinations, invalid responses, or API rate limits?`);
        }
        if (profile.flags?.hasAuth && !alreadyAskedAuth) {
          list.push(`Your resume mentions authentication or security tooling. How did you implement login, session/JWT verification, and role-based route protection without exposing credentials?`);
        }
        if (profile.flags?.hasDeployment && !alreadyAskedDeploy) {
          list.push(`Your resume includes deployment or cloud tools. Can you walk me through how you deployed your application, managed environment secrets, and verified production health?`);
        }
        list.push(
          `In your resume projects, how did you secure sensitive API keys, user data, and deployment environments against common vulnerabilities or misconfigurations?`
        );
        return list;
      }

      case 'debugging_challenge': {
        const refProj = (firstProj || unaskedProj)?.name;
        return [
          refProj
            ? `While building "${refProj}", what was the toughest bug or unexpected failure you ran into, and step-by-step how did you debug and fix it?`
            : `Tell me about a stubborn technical bug or unexpected error you encountered while working on one of your resume projects — how did you isolate the root cause?`,
          `Can you recall a case where something worked locally in development but broke or behaved unpredictably later? How did you diagnose and resolve it?`
        ];
      }

      case 'testing_performance_tradeoffs': {
        const refProj = (secondProj || firstProj)?.name;
        return [
          refProj
            ? `If "${refProj}" suddenly had 10x more concurrent users today, what are its current limitations, and what performance optimizations or tests would you add next?`
            : `How did you test your projects before considering them complete, and what performance bottleneck or architectural limitation would you improve next?`,
          profile.flags?.hasTesting
            ? `I see testing skills in your profile. How did you structure unit or integration tests and catch edge-case regressions in your work?`
            : `Looking back at your resume projects, what automated testing, caching, or error monitoring would you introduce to make them truly production-grade?`
        ];
      }

      case 'experience_internship':
        if (firstExp) {
          const expLabel = firstExp.company ? `${firstExp.role} at ${firstExp.company}` : firstExp.role;
          return [
            `On your resume, you listed "${expLabel}". What were your day-to-day technical deliverables there, and what concrete outcome did your work achieve?`,
            `During your time as "${expLabel}", what engineering process (code reviews, Git workflow, agile sprints, or debugging production code) taught you the biggest lesson?`
          ];
        }
        if (firstCert) {
          return [
            `I see "${firstCert}" on your resume. How did that training or certification influence how you design and write code in your projects?`
          ];
        }
        return [
          `Since your resume focuses primarily on projects and academic work, how do you simulate real engineering workflows—such as Git branching, code reviews, and issue tracking—when building software?`
        ];

      case 'teamwork_behavioral':
        return [
          `Tell me about a time during a team project, hackathon, or internship from your resume when you disagreed with a teammate or had to coordinate interdependent tasks under a tight deadline. How did you resolve it?`,
          `Describe a situation in your documented projects where you had to take initiative outside your comfort zone to unblock a milestone or fix a teammate's blocker.`
        ];

      case 'career_goals_fit':
        return [
          `Looking across your resume and the ${role} position, what do you consider your strongest technical asset right now, and which skill or system concept are you actively trying to deepen next?`,
          `If you joined as a ${role} tomorrow, which parts of your documented experience would help you ramp up fastest, and what kind of engineering problems do you hope to grow into?`
        ];

      default:
        return [];
    }
  };

  // Prioritize uncovered categories first
  const orderedCategories = [
    ...RESUME_CATEGORIES.filter(c => !resumePlan.coveredCategories.includes(c.id)),
    ...RESUME_CATEGORIES.filter(c => resumePlan.coveredCategories.includes(c.id))
  ];

  for (const cat of orderedCategories) {
    const candidates = getCandidatesForCategory(cat.id);
    const picked = pickNonDuplicateCandidate(candidates, allAskedQuestions);
    if (picked) {
      if (!resumePlan.coveredCategories.includes(cat.id)) {
        resumePlan.coveredCategories.push(cat.id);
      }
      // Track project/skill mentioned in picked question
      for (const proj of (profile.projects || [])) {
        if (picked.toLowerCase().includes(proj.name.toLowerCase()) && !resumePlan.coveredProjects.includes(proj.name)) {
          resumePlan.coveredProjects.push(proj.name);
        }
      }
      for (const skill of (profile.skills || [])) {
        if (picked.toLowerCase().includes(skill.toLowerCase()) && !resumePlan.coveredSkills.includes(skill)) {
          resumePlan.coveredSkills.push(skill);
        }
      }
      resumePlan.lastCategory = cat.id;

      const remainingNext = RESUME_CATEGORIES.find(c => !resumePlan.coveredCategories.includes(c.id));
      return {
        nextQuestion: picked,
        isFollowUp: false,
        categoryId: cat.id,
        categoryLabel: cat.label,
        nextCategoryLabel: remainingNext ? remainingNext.label : 'Interview Wrap-up & Fit',
        resumePlan
      };
    }
  }

  // Last-resort guaranteed unique fallback over remaining individual projects or skills
  for (const proj of (profile.projects || [])) {
    const deepProbe = `Looking again at "${proj.name}", what specific metric, user edge case, or security assumption did you verify before finalizing it?`;
    if (!isDuplicateQuestion(deepProbe, allAskedQuestions)) {
      return {
        nextQuestion: deepProbe,
        isFollowUp: false,
        categoryId: 'project_architecture',
        categoryLabel: 'Project Architecture & Verification',
        nextCategoryLabel: 'Interview Wrap-up & Fit',
        resumePlan
      };
    }
  }

  for (const skill of (profile.skills || [])) {
    const skillProbe = `Regarding ${skill} from your resume, what subtle bug or limitation have you personally encountered when using it, and how did you work around it?`;
    if (!isDuplicateQuestion(skillProbe, allAskedQuestions)) {
      return {
        nextQuestion: skillProbe,
        isFollowUp: false,
        categoryId: 'skills_languages',
        categoryLabel: 'Technical Skills Deep-Dive',
        nextCategoryLabel: 'Interview Wrap-up & Fit',
        resumePlan
      };
    }
  }

  const closingFallback = `Before we wrap up your ${role} resume interview, is there any project, technical achievement, or skill on your resume we haven't covered yet that you'd like to highlight?`;
  return {
    nextQuestion: closingFallback,
    isFollowUp: false,
    categoryId: 'career_goals_fit',
    categoryLabel: 'Final Resume Highlights & Wrap-up',
    nextCategoryLabel: 'Completed',
    resumePlan
  };
};

/**
 * Generates a concise, helpful clarification explaining what the interviewer is looking for
 * on the current question without advancing to a new question.
 */
const buildClarificationForQuestion = ({ currentQuestion = '', role = 'Software Engineer' } = {}) => {
  const qLower = String(currentQuestion || '').toLowerCase();
  if (!qLower.trim()) {
    return `Could you walk me through your relevant background and experience for the ${role} position?`;
  }
  if (/architecture|design|fit together|module|stack/.test(qLower)) {
    return `To clarify: I'd like you to break down the high-level components — frontend, backend, database, and external APIs — explain how data flows between them, and briefly share why you picked that stack.`;
  }
  if (/database|schema|api|endpoint|rest|query/.test(qLower)) {
    return `To clarify: Please walk through your main API routes or data models, how the client requests data, and how you handle validation, errors, or database queries.`;
  }
  if (/debug|bug|challenge|error|issue|bottleneck/.test(qLower)) {
    return `To clarify: Share one specific technical issue you actually ran into — what symptoms you saw, how you traced the root cause, and the exact fix you implemented.`;
  }
  if (/test|scale|10x|performance|limit|improve/.test(qLower)) {
    return `To clarify: Focus on realistic weak spots, missing tests, or performance bottlenecks in your current implementation, and explain what concrete improvements you would prioritize first.`;
  }
  if (/ai|llm|prompt|rag|gemini|openai/.test(qLower)) {
    return `To clarify: Walk through how inputs reach the AI model, how you parse and validate the output, and what fallback logic runs if the API fails or hallucinates.`;
  }
  if (/team|conflict|deadline|ownership|collaborat/.test(qLower)) {
    return `To clarify: You can structure your answer using STAR — briefly describe the situation, your specific responsibility, the exact actions you took, and the measurable result.`;
  }
  if (/introduce|overview|background|yourself/.test(qLower)) {
    return `To clarify: A concise 60-to-90 second summary works best — cover your education or current role, core technical stack, and one standout project from your resume.`;
  }
  return `To clarify: Focus on your specific personal role, the concrete tools or design choices you made from your resume, and a practical example or outcome.`;
};

module.exports = {
  RESUME_CATEGORIES,
  getCategoryLabel,
  normalizeQuestionText,
  extractContentTokens,
  isDuplicateQuestion,
  pickNonDuplicateCandidate,
  extractStructuredResumeProfile,
  buildAdaptiveFollowUpsFromAnswer,
  selectNextResumeQuestionFromPlan,
  buildClarificationForQuestion
};

