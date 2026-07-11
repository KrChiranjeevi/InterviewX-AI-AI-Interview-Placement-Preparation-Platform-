// Real Company Recruitment Simulation Data
// This defines the dynamic rounds, metadata, and role-based skills for each company.

export const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Java Developer',
  'Python Developer',
  'React Developer',
  'Node.js Developer',
  'Data Analyst',
  'Data Scientist',
  'AI Engineer',
  'Software Engineer',
  'SDE Intern'
];

export const getRoleSkills = (role) => {
  switch (role) {
    case 'Frontend Developer':
    case 'React Developer':
      return ['JavaScript', 'CSS/HTML', 'React', 'DOM Manipulation', 'Web Performance', 'REST APIs'];
    case 'Backend Developer':
    case 'Node.js Developer':
      return ['Node.js', 'Express.js', 'SQL', 'MongoDB', 'System Design', 'APIs & Security', 'Data Structures'];
    case 'Full Stack Developer':
      return ['React', 'Node.js', 'SQL/NoSQL', 'APIs', 'System Design', 'CSS/HTML', 'Data Structures'];
    case 'Java Developer':
      return ['Java', 'OOPs', 'Spring Boot', 'SQL', 'DBMS', 'Data Structures', 'Algorithms'];
    case 'Python Developer':
      return ['Python', 'OOPs', 'Django/Flask', 'SQL', 'Data Structures', 'APIs', 'Algorithms'];
    case 'Data Analyst':
      return ['SQL', 'Python', 'Excel', 'Data Visualization', 'Pandas/NumPy', 'Statistics'];
    case 'Data Scientist':
      return ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Deep Learning', 'Pandas/NumPy'];
    case 'AI Engineer':
      return ['Python', 'NLP', 'LLMs & AI', 'Machine Learning', 'API Integration', 'Deep Learning'];
    case 'Software Engineer':
    case 'SDE Intern':
    default:
      return ['Data Structures', 'Algorithms', 'OOPs', 'DBMS', 'Operating Systems', 'System Design'];
  }
};

export const getCompanySimulations = (companyName, role) => {
  const roleSkills = getRoleSkills(role);

  const configs = {
    'Amazon': [
      {
        name: 'Online Assessment (Coding + Work Style Assessment)',
        duration: '90 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: [roleSkills[0], roleSkills[1], 'Leadership Principles'],
        instructions: 'Solve 2 coding questions matching standard DSA / Role concepts and answer situational judgment scenarios based on Amazon Leadership Principles.'
      },
      {
        name: 'Technical Interview',
        duration: '45 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: [roleSkills[2], roleSkills[3], 'Data Structures'],
        instructions: 'Interactive live coding session with a senior engineer. Expect optimization-related questions and analysis of complexity.'
      },
      {
        name: 'Bar Raiser / Leadership Principles',
        duration: '60 Mins',
        passingScore: '85%',
        difficulty: 'Hard',
        skillsRequired: ['STAR Method', 'Leadership Principles', 'System Design'],
        instructions: 'Brace for deep dive behavioral questions testing your culture fit. Use the STAR method to structure your responses.'
      },
      {
        name: 'Final Result',
        duration: 'N/A',
        passingScore: 'N/A',
        difficulty: 'N/A',
        skillsRequired: ['All Core Competencies'],
        instructions: 'The hiring committee aggregates your performance logs. An offer decision will be rendered shortly.'
      }
    ],
    'Google': [
      {
        name: 'Online Coding Assessment',
        duration: '90 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: ['Algorithms', 'Advanced DS', roleSkills[0]],
        instructions: 'Solve 2 complex algorithmic puzzles. High focus on optimal time & space complexity.'
      },
      {
        name: 'DSA Interview',
        duration: '45 Mins',
        passingScore: '85%',
        difficulty: 'Hard',
        skillsRequired: ['Trees/Graphs', 'Recursion', roleSkills[1]],
        instructions: 'Focuses heavily on dynamic programming, tree traversals, or graph analysis. Explain every step clearly.'
      },
      {
        name: 'Problem Solving',
        duration: '45 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: ['System Design', 'OOPs', roleSkills[2]],
        instructions: 'Open-ended technical questions to evaluate your problem-solving process and engineering mindset.'
      },
      {
        name: 'Googliness / Behavioral',
        duration: '45 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['Googliness', 'Leadership', 'Inclusive Culture'],
        instructions: 'Evaluates your alignment with Google values, cooperation skills, and reaction to challenging work situations.'
      },
      {
        name: 'Final Result',
        duration: 'N/A',
        passingScore: 'N/A',
        difficulty: 'N/A',
        skillsRequired: ['Hiring Bar Standards'],
        instructions: 'Google hiring committee performs an independent dossier review to make a consensus hiring decision.'
      }
    ],
    'Microsoft': [
      {
        name: 'Online Assessment',
        duration: '75 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Coding', 'Logical Reasoning', roleSkills[0]],
        instructions: 'Online round with coding challenges and debugging tasks to check implementation speed.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['Data Structures', 'OOPs', roleSkills[1]],
        instructions: 'Core software engineering questions testing object-oriented design and modular clean code.'
      },
      {
        name: 'Technical Interview',
        duration: '45 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: ['System Design', 'Algorithms', roleSkills[2]],
        instructions: 'Comprehensive review of your projects, core computer science concepts, and coding skills.'
      },
      {
        name: 'System Design (Role Based)',
        duration: '60 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: ['Scalability', 'APIs', 'Databases', 'Cloud Tech'],
        instructions: 'Design a system related to your role (e.g., Client application design for Frontend, Microservices for Backend).'
      },
      {
        name: 'HR',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Easy',
        skillsRequired: ['Cultural Fit', 'Behavioral', 'Salary Negotiation'],
        instructions: 'Final discussion regarding fit, career aspirations, and Microsoft culture.'
      }
    ],
    'Meta': [
      {
        name: 'Online Coding Assessment',
        duration: '70 Mins',
        passingScore: '85%',
        difficulty: 'Hard',
        skillsRequired: ['Algorithmic Speed', 'Recursion', roleSkills[0]],
        instructions: 'Write ultra-fast solutions to algorithmic problems. Focus is on quick and clean implementations.'
      },
      {
        name: 'Coding Interview 1',
        duration: '45 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: ['HashMap/Trees', 'Time Complexity', roleSkills[1]],
        instructions: 'Interactive round with 2 coding questions. Complete verification of time & space limits.'
      },
      {
        name: 'Coding Interview 2',
        duration: '45 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: ['Graphs/DP', 'Clean Code', roleSkills[2]],
        instructions: 'Expect core structural patterns and advanced algorithm applications.'
      },
      {
        name: 'System Design',
        duration: '45 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: ['Architecture', 'Caching', 'Load Balancers'],
        instructions: 'Design high-scale applications (e.g. Instagram Feed, Messenger, or Live Comments).'
      },
      {
        name: 'Behavioral',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Communication', 'Conflict Resolution', 'Collaboration'],
        instructions: 'Testing your ability to handle ambiguities, lead projects, and work with other cross-functional teams.'
      }
    ],
    'Adobe': [
      {
        name: 'Online Assessment',
        duration: '90 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['Coding', 'Aptitude', roleSkills[0]],
        instructions: 'A mix of computer science fundamentals, quantitative aptitude, and core coding.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '80%',
        difficulty: 'Medium',
        skillsRequired: ['Data Structures', 'Recursion', roleSkills[1]],
        instructions: 'Focuses heavily on algorithmic accuracy, dynamic memory management, and tree structures.'
      },
      {
        name: 'Technical',
        duration: '45 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: ['System Design', 'DBMS/SQL', roleSkills[2]],
        instructions: 'Deeper look into Operating Systems, databases, multi-threading, and backend systems.'
      },
      {
        name: 'HR',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Easy',
        skillsRequired: ['Culture Fit', 'Communication', 'Adobe Values'],
        instructions: 'HR fitment round focusing on team dynamics, location preference, and compensation details.'
      }
    ],
    'Oracle': [
      {
        name: 'Coding + SQL Assessment',
        duration: '90 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['SQL Queries', 'Algorithmic Coding', 'Databases'],
        instructions: 'Online test with relational algebra, query optimization, and logical coding challenges.'
      },
      {
        name: 'Technical',
        duration: '45 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: ['DBMS Architecture', 'OOPs', roleSkills[0]],
        instructions: 'In-depth interview on database internals, indexing algorithms, transaction states, and coding.'
      },
      {
        name: 'Managerial',
        duration: '45 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['Problem Solving', 'Project Overview', roleSkills[1]],
        instructions: 'Discussion around your previous project architectures, choice of technologies, and agile methodology.'
      },
      {
        name: 'HR',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Easy',
        skillsRequired: ['Corporate Ethics', 'Communication', 'HR Round'],
        instructions: 'Verification of your resume credentials, salary structure details, and Oracle culture review.'
      }
    ],
    'Salesforce': [
      {
        name: 'Coding',
        duration: '75 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['Algorithm Design', 'Web Dev', roleSkills[0]],
        instructions: 'Algorithmic questions focused on array manipulations, map implementations, and string patterns.'
      },
      {
        name: 'Technical',
        duration: '45 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: ['APIs & Integration', 'OOPs', roleSkills[1]],
        instructions: 'Interviewer checks your design patterns, SOLID principles, API architectures, and coding clean state.'
      },
      {
        name: 'Managerial',
        duration: '45 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['Scenarios', 'Conflict Mgmt', 'Leadership'],
        instructions: 'Assesses situational awareness, cross-team tasks, agile setups, and customer orientation.'
      },
      {
        name: 'HR',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Easy',
        skillsRequired: ['Culture Fit', 'Compensation', 'Career Goals'],
        instructions: 'Fitment and salary negotiation round representing Salesforce principles and alignment.'
      }
    ],
    'Goldman Sachs': [
      {
        name: 'Aptitude + Coding',
        duration: '120 Mins',
        passingScore: '70%',
        difficulty: 'Hard',
        skillsRequired: ['Quantitative Aptitude', 'Probability', 'Algorithms'],
        instructions: 'Highly intensive test targeting probability, statistics, logical puzzles, and standard coding.'
      },
      {
        name: 'Technical',
        duration: '60 Mins',
        passingScore: '80%',
        difficulty: 'Hard',
        skillsRequired: ['Java/C++', 'Concurrency', 'Design Patterns'],
        instructions: 'Expect data structure puzzles, multi-threading, concurrency control, and low-level system design.'
      },
      {
        name: 'HR',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Easy',
        skillsRequired: ['Interpersonal', 'Professionalism', 'Ethical Standards'],
        instructions: 'Evaluates your communication, adaptability, and performance expectation under pressure.'
      }
    ],
    'JPMorgan': [
      {
        name: 'Coding Assessment',
        duration: '90 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Coding', 'Fundamentals', roleSkills[0]],
        instructions: 'Solve 2 coding problems online. Focuses on data structures and logic verification.'
      },
      {
        name: 'Technical',
        duration: '45 Mins',
        passingScore: '80%',
        difficulty: 'Medium',
        skillsRequired: ['OOPs', 'SQL/DBMS', roleSkills[1]],
        instructions: 'Discussion on core programming languages, database normalization, queries, and coding.'
      },
      {
        name: 'Behavioral',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Easy',
        skillsRequired: ['STAR Method', 'Collaboration', 'Values'],
        instructions: 'Understanding your professional decisions, teamwork experiences, and alignment with J.P. Morgan values.'
      }
    ],
    'TCS': [
      {
        name: 'Aptitude',
        duration: '40 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Quantitative Aptitude', 'Maths'],
        instructions: 'Covers logical maths, speed, time and distance, work calculations, and basic numbers.'
      },
      {
        name: 'Verbal',
        duration: '20 Mins',
        passingScore: '60%',
        difficulty: 'Easy',
        skillsRequired: ['English Grammar', 'Comprehension'],
        instructions: 'Tests basic corporate communication, grammar, and passage reading.'
      },
      {
        name: 'Reasoning',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Logical Reasoning', 'Analytical puzzles'],
        instructions: 'Deductions, patterns, seating arrangements, and flow logic puzzles.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['C/C++/Java/Python', 'Logic', roleSkills[0]],
        instructions: 'Complete 2 coding problems on standard logic (strings, loops, or simple matrix operations).'
      },
      {
        name: 'Technical',
        duration: '30 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['OOPs', 'SQL', 'Resume Review', roleSkills[1]],
        instructions: 'Covers major projects, primary coding languages, SQL Joins, and basic web structures.'
      },
      {
        name: 'Managerial',
        duration: '20 Mins',
        passingScore: '65%',
        difficulty: 'Medium',
        skillsRequired: ['Scenario handling', 'Teamwork'],
        instructions: 'Evaluate adaptability to night shifts, relocation, and situational team management.'
      },
      {
        name: 'HR',
        duration: '15 Mins',
        passingScore: '50%',
        difficulty: 'Easy',
        skillsRequired: ['Communication', 'Verification'],
        instructions: 'Documents check, shift validation, background screening, and offer process briefing.'
      }
    ],
    'Infosys': [
      {
        name: 'Aptitude',
        duration: '60 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Analytical Reasoning', 'Maths', 'Verbal'],
        instructions: 'Covers cognitive aptitude, verbal ability, and logical reasoning puzzles.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Data Structures', 'Logical Coding', roleSkills[0]],
        instructions: 'Write programs focusing on strings, search-sort, arrays, and standard recursion.'
      },
      {
        name: 'Technical',
        duration: '30 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['DBMS/SQL', 'OOPs', 'Core Tech', roleSkills[1]],
        instructions: 'In-depth resume walkthrough, query creation, OOP implementations, and technology checks.'
      },
      {
        name: 'HR',
        duration: '15 Mins',
        passingScore: '50%',
        difficulty: 'Easy',
        skillsRequired: ['Communication', 'General Fit'],
        instructions: 'Discussion on relocation parameters, shift timings, service agreements, and final offer steps.'
      }
    ],
    'Accenture': [
      {
        name: 'Cognitive Assessment',
        duration: '60 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Aptitude', 'Analytical Ability', 'Verbal'],
        instructions: 'Comprehensive exam covering logic, corporate communication, and arithmetic aptitude.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Languages', 'Logic building', roleSkills[0]],
        instructions: 'Solve 2 problems testing core programming proficiency, math algorithms, and loops.'
      },
      {
        name: 'Technical',
        duration: '30 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['DBMS', 'Web Tech', 'Projects', roleSkills[1]],
        instructions: 'Reviewing implementation logic of projects, cloud basics (if any), and system design concepts.'
      },
      {
        name: 'HR',
        duration: '20 Mins',
        passingScore: '50%',
        difficulty: 'Easy',
        skillsRequired: ['Adaptability', 'Accent Fit'],
        instructions: 'Discussion on job location, willingness to work in diverse shifts, and offer release.'
      }
    ],
    'Capgemini': [
      {
        name: 'Game Based Aptitude',
        duration: '30 Mins',
        passingScore: '65%',
        difficulty: 'Medium',
        skillsRequired: ['Spatial Reasoning', 'Quick Math', 'Logic Games'],
        instructions: 'Unique visual and pattern-based interactive games testing cognitive flexibility and logic.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Programming', 'Basic DS', roleSkills[0]],
        instructions: 'Write optimized programs targeting arrays, loops, numbers, and strings.'
      },
      {
        name: 'Technical',
        duration: '30 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['OOPs', 'SQL Queries', 'Web basics', roleSkills[1]],
        instructions: 'Reviewing programming theory, inheritance types, polymorphism, and database relationships.'
      },
      {
        name: 'HR',
        duration: '15 Mins',
        passingScore: '50%',
        difficulty: 'Easy',
        skillsRequired: ['Communication', 'Work Culture Fit'],
        instructions: 'Personal assessment, location checks, and final offer pipeline information.'
      }
    ],
    'Wipro': [
      {
        name: 'Aptitude',
        duration: '45 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Maths', 'Logics', 'English'],
        instructions: 'Evaluates general quantitative math skills, logical deductions, and English comprehension.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Syntax correctness', 'Strings', roleSkills[0]],
        instructions: 'Solve coding tasks testing array processing, basic math operations, and sorting logic.'
      },
      {
        name: 'Technical',
        duration: '30 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Resume Projects', 'OOPs/DBMS', roleSkills[1]],
        instructions: 'Interviewer validates project complexity, coding concepts, SQL queries, and basic software lifecycle.'
      },
      {
        name: 'HR',
        duration: '15 Mins',
        passingScore: '50%',
        difficulty: 'Easy',
        skillsRequired: ['Flexibility', 'Company alignment'],
        instructions: 'Checking location flexibilities, shift models, background verification, and joining rules.'
      }
    ],
    'Cognizant': [
      {
        name: 'Aptitude',
        duration: '50 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Reasoning', 'Quantitative Math', 'English'],
        instructions: 'A multi-section aptitude test evaluating analytical intelligence and verbal usage.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Programming Logic', 'Loops/Arrays', roleSkills[0]],
        instructions: 'Solve coding tasks targeting logic manipulation, pattern printing, and array calculations.'
      },
      {
        name: 'Technical',
        duration: '30 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['DBMS/SQL', 'OOPs basics', 'Web Tech', roleSkills[1]],
        instructions: 'In-depth interview verifying index patterns, join queries, polymorphism, and projects.'
      },
      {
        name: 'HR',
        duration: '15 Mins',
        passingScore: '50%',
        difficulty: 'Easy',
        skillsRequired: ['Culture Fit', 'Adaptability'],
        instructions: 'Discussion on shift timings, career progression inside Cognizant, and joining details.'
      }
    ],
    'TCS': [
      {
        name: 'Aptitude',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Maths', 'Logics', 'English'],
        instructions: 'Evaluates general quantitative math skills.'
      },
      {
        name: 'Verbal Ability',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Reading Comprehension', 'Grammar'],
        instructions: 'Evaluates verbal and reading skills.'
      },
      {
        name: 'Logical Reasoning',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Puzzles', 'Syllogism', 'Blood Relations'],
        instructions: 'Evaluates logical deductions and reasoning.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Programming Logic', 'Loops/Arrays', roleSkills[0]],
        instructions: 'Solve coding tasks targeting logic manipulation.'
      },
      {
        name: 'Technical',
        duration: '30 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['DBMS/SQL', 'OOPs basics', 'Web Tech', roleSkills[1]],
        instructions: 'In-depth interview verifying programming basics.'
      },
      {
        name: 'HR',
        duration: '15 Mins',
        passingScore: '50%',
        difficulty: 'Easy',
        skillsRequired: ['Culture Fit', 'Adaptability'],
        instructions: 'Discussion on shift timings and joining details.'
      }
    ],
    'Infosys': [
      {
        name: 'Aptitude',
        duration: '40 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Maths', 'Logics', 'English'],
        instructions: 'Evaluates quantitative aptitude skills.'
      },
      {
        name: 'Logical Reasoning',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Puzzles', 'Syllogism'],
        instructions: 'Evaluates logical reasoning.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Programming Logic', 'Loops/Arrays', roleSkills[0]],
        instructions: 'Solve core logic problems.'
      },
      {
        name: 'Technical',
        duration: '30 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['DBMS/SQL', 'OOPs basics', 'Web Tech', roleSkills[1]],
        instructions: 'In-depth technical interview.'
      },
      {
        name: 'HR',
        duration: '15 Mins',
        passingScore: '50%',
        difficulty: 'Easy',
        skillsRequired: ['Culture Fit', 'Adaptability'],
        instructions: 'Discussion on joining details.'
      }
    ],
    'Accenture': [
      {
        name: 'Cognitive Assessment',
        duration: '45 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Maths', 'Logics', 'English'],
        instructions: 'General aptitude and cognitive abilities.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Programming Logic', 'Loops/Arrays', roleSkills[0]],
        instructions: 'Algorithm and syntax based problems.'
      },
      {
        name: 'Communication',
        duration: '20 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Verbal Ability', 'Listening'],
        instructions: 'Verbal response and communication check.'
      },
      {
        name: 'Technical',
        duration: '30 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['DBMS/SQL', 'OOPs basics', 'Web Tech', roleSkills[1]],
        instructions: 'Technical core concepts.'
      },
      {
        name: 'HR',
        duration: '15 Mins',
        passingScore: '50%',
        difficulty: 'Easy',
        skillsRequired: ['Culture Fit', 'Adaptability'],
        instructions: 'HR and location discussion.'
      }
    ],
    'Capgemini': [
      {
        name: 'Game Based Aptitude',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Spatial Reasoning', 'Memory'],
        instructions: 'Game based cognitive assessment.'
      },
      {
        name: 'Verbal Ability',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Reading Comprehension', 'Grammar'],
        instructions: 'English proficiency test.'
      },
      {
        name: 'Coding',
        duration: '45 Mins',
        passingScore: '70%',
        difficulty: 'Medium',
        skillsRequired: ['Programming Logic', 'Loops/Arrays', roleSkills[0]],
        instructions: 'Solve programming challenges.'
      },
      {
        name: 'Technical',
        duration: '30 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['DBMS/SQL', 'OOPs basics', 'Web Tech', roleSkills[1]],
        instructions: 'Technical interview.'
      },
      {
        name: 'HR',
        duration: '15 Mins',
        passingScore: '50%',
        difficulty: 'Easy',
        skillsRequired: ['Culture Fit', 'Adaptability'],
        instructions: 'Final HR interview.'
      }
    ],
    'Deloitte': [
      {
        name: 'Aptitude',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Maths', 'Logics'],
        instructions: 'Quantitative aptitude.'
      },
      {
        name: 'Verbal Ability',
        duration: '30 Mins',
        passingScore: '60%',
        difficulty: 'Medium',
        skillsRequired: ['Reading Comprehension', 'Grammar'],
        instructions: 'Verbal skills assessment.'
      },
      {
        name: 'Technical',
        duration: '45 Mins',
        passingScore: '75%',
        difficulty: 'Medium',
        skillsRequired: ['DBMS/SQL', 'OOPs basics', 'Web Tech', roleSkills[1]],
        instructions: 'Core technical and logic.'
      },
      {
        name: 'HR',
        duration: '15 Mins',
        passingScore: '50%',
        difficulty: 'Easy',
        skillsRequired: ['Culture Fit', 'Adaptability'],
        instructions: 'HR discussion.'
      }
    ]
  };

  // Fallback to Microsoft pattern if not found
  return configs[companyName] || configs['Microsoft'];
};
