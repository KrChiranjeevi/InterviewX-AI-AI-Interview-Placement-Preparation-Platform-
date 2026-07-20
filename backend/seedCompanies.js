const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Company = require('./models/Company');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const companies = [
  {
    "name": "Google",
    "logo": "https://logo.clearbit.com/google.com",
    "rounds": [
      "Online Coding Assessment",
      "DSA Interview",
      "Problem Solving",
      "Googliness / Behavioral",
      "Final Result"
    ],
    "skills": [
      "Advanced Algorithms",
      "Graph Theory",
      "Dynamic Programming",
      "System Design",
      "Googliness"
    ],
    "questions": [
      "Design YouTube.",
      "Tell me about a time you failed and what you learned.",
      "How would you find the shortest path in a massive graph?"
    ],
    "difficulty": "Hard",
    "package": "15 - 38 LPA",
    "eligibility": "B.E/B.Tech/MCA/M.S (CGPA >= 8.5)",
    "selectionRate": "0.8%",
    "estimatedTime": "4-6 Weeks",
    "color": "#4285F4",
    "secondaryColor": "#EA4335",
    "tracks": [
      {
        "id": "swe-intern",
        "name": "SWE Intern",
        "package": "12 - 15 LPA",
        "difficulty": "Hard",
        "timeline": "6 Weeks",
        "eligibility": "Pre-final Year (CGPA >= 8.0)"
      },
      {
        "id": "swe-l3",
        "name": "SWE L3",
        "package": "18 - 24 LPA",
        "difficulty": "Very Hard",
        "timeline": "8 Weeks",
        "eligibility": "Graduates (CGPA >= 8.0)"
      },
      {
        "id": "swe-l4",
        "name": "SWE L4",
        "package": "30 - 38 LPA",
        "difficulty": "Expert",
        "timeline": "10 Weeks",
        "eligibility": "2+ Years Experience"
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "Google Online Challenge (GOC)"
      },
      {
        "id": "tech",
        "title": "Technical Interview (DSA)"
      },
      {
        "id": "hr",
        "title": "Googliness & Leadership"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      }
    ],
    "info": {
      "overview": "Google is a globally recognized technology leader specializing in search, cloud services, advertising platforms, and artificial intelligence development.",
      "description": "Google's mission is to organize the world's information and make it universally accessible and useful. The company emphasizes core problem-solving capacity and values scale engineering.",
      "headquarters": "Mountain View, California, USA",
      "industry": "Internet Services, AI & Software Technology",
      "founded": "1998",
      "employees": "Approx. 180,000+",
      "careersUrl": "https://www.google.com/about/careers",
      "hiringType": "On-Campus recruitment drives, Off-campus applications, and global internship cohorts.",
      "availability": "Highly selective drives, primarily organized at national premier technology institutions.",
      "eligibility": "Engineering graduates with majors in Computer Science, Data Science, Mathematics, or related quantitative domains.",
      "degrees": "B.Tech, M.Tech, Dual Degree, MCA, or M.S. in CS/quantitative fields.",
      "cgpa": "Not officially disclosed as a strict minimum cut-off; however, a strong academic record is highly preferred.",
      "process": "Resume Audit ➔ Online Coding Assessment ➔ 3-4 Rounds of Technical Interviews (focusing on DSA and System Design) ➔ Googliness & Leadership Evaluation ➔ Hiring Committee Approval.",
      "rounds": "45-minute technical interviews assessing coding speed, complexity optimizations, and dry-run soundness.",
      "flow": "SWE roles evaluate Algorithmic Design and Systems Concurrency. Frontend roles focus on Browser internals, JavaScript efficiency, and client-side scaling.",
      "techTopics": "Dynamic Programming, Trees, Graphs, Hash Maps, Advanced Sorting, and Big-O Complexities.",
      "behavioralTopics": "Handling ambiguity, bias for action, peer collaboration, structural troubleshooting.",
      "skillsPreferred": "Clean code design, scalable modular architectures, memory footprint tracking.",
      "technologies": "Java, Python, C++, Go, Google Cloud Platform (GCP).",
      "projectsExpected": "Distributed systems architectures, high-performance database wrappers, or complex compiler models.",
      "prepTips": "Practice medium to hard LeetCode problems, verbally dry-run algorithmic logic, and understand code lifecycle details.",
      "timeline": "Typical drive timeline takes 4 to 8 weeks from initial screening to offer approval.",
      "package": "Entry-level CTC packages range from 15 to 38 LPA, depending on track, location, and drive guidelines.",
      "notes": "No syntax helper code is provided during live coder tests. Focus heavily on code elegance.",
      "faqs": [
        {
          "q": "Is competitive programming required?",
          "a": "No, but advanced algorithmic logic and complexity tracking are highly tested."
        },
        {
          "q": "What is the role of the Hiring Committee?",
          "a": "The committee is an independent board that reviews feedback from all interviewers to ensure hiring quality standards are met."
        }
      ]
    },
    "companyType": "Product"
  },
  {
    "name": "Amazon",
    "logo": "https://logo.clearbit.com/amazon.com",
    "rounds": [
      "Online Assessment",
      "Technical Interview",
      "Bar Raiser / Leadership Principles",
      "Final Result"
    ],
    "skills": [
      "Data Structures",
      "Algorithms",
      "System Design",
      "AWS",
      "Leadership Principles"
    ],
    "questions": [
      "Tell me about a time you had to disagree with a manager.",
      "Design a scalable e-commerce checkout system.",
      "How would you implement a distributed caching mechanism?"
    ],
    "difficulty": "Hard",
    "package": "12 - 32 LPA",
    "eligibility": "B.Tech/M.Tech/MCA (CGPA >= 7.0)",
    "selectionRate": "1.2%",
    "estimatedTime": "3-4 Weeks",
    "color": "#FF9900",
    "secondaryColor": "#146B93",
    "tracks": [
      {
        "id": "sde-intern",
        "name": "SDE Intern",
        "package": "10 - 12 LPA",
        "difficulty": "Medium-Hard",
        "timeline": "6 Weeks",
        "eligibility": "Pre-final Year (CGPA >= 7.0)"
      },
      {
        "id": "sde-1",
        "name": "SDE 1",
        "package": "16 - 22 LPA",
        "difficulty": "Hard",
        "timeline": "8 Weeks",
        "eligibility": "Graduates (CGPA >= 7.0)"
      },
      {
        "id": "sde-2",
        "name": "SDE 2",
        "package": "25 - 32 LPA",
        "difficulty": "Very Hard",
        "timeline": "10 Weeks",
        "eligibility": "2+ Years Experience"
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "Amazon Online Assessment (OA)"
      },
      {
        "id": "tech",
        "title": "Technical Interview (DSA)"
      },
      {
        "id": "hr",
        "title": "Bar Raiser Round"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      }
    ],
    "info": {
      "overview": "Amazon is a global e-commerce and cloud computing giant (AWS) known for its customer-centric operational culture and scalable infrastructure systems.",
      "description": "Amazon focuses on customer obsession, passion for invention, commitment to operational excellence, and long-term thinking.",
      "headquarters": "Seattle, Washington, USA",
      "industry": "E-commerce, Cloud Computing, Artificial Intelligence",
      "founded": "1994",
      "employees": "Approx. 1,500,000+",
      "careersUrl": "https://www.amazon.jobs",
      "hiringType": "Internships, College Hiring drives, and off-campus pool recruitments.",
      "availability": "Active annual recruitment drives at multiple Tier 1 and Tier 2 campuses globally.",
      "eligibility": "Degrees in Engineering, Computer Science, IT, or related technical disciplines.",
      "degrees": "B.Tech, M.Tech, MCA, or M.S. in Computer Science.",
      "cgpa": "Generally 6.5 or 7.0 minimum CGPA cut-off depending on target campus guidelines.",
      "process": "Online Assessment (Coding + Work Style) ➔ DSA Technical Interview 1 ➔ DSA Technical Interview 2 ➔ Bar Raiser Round ➔ Final Selection.",
      "rounds": "DSA problem solving, system design (for senior roles), and behavioral scenarios mapped to leadership principles.",
      "flow": "SDE roles test array/string logic, heaps, graphs. Specialist/QA roles test automation frameworks and logic scripts.",
      "techTopics": "Hashing, Binary Trees, Graphs, Dynamic Programming, Heap/Queue structures, OOP Design.",
      "behavioralTopics": "Amazon Leadership Principles (Customer Obsession, Ownership, Bias for Action, Earn Trust).",
      "skillsPreferred": "Highly scalable systems design, database normalization, system complexity analysis.",
      "technologies": "Java, C++, Python, AWS services (S3, EC2, DynamoDB).",
      "projectsExpected": "E-commerce system replicas, custom caching middlewares, or distributed messaging queues.",
      "prepTips": "Practice mock coding, write dry-run traces, and format your behavioral answers using the STAR method mapped to leadership principles.",
      "timeline": "Generally 4 to 8 weeks from online assessment to final feedback.",
      "package": "Entry-level fresher compensation packages range from 12 to 32 LPA.",
      "notes": "The Bar Raiser interviewer evaluates long-term leadership potential and holds veto power over hiring decisions.",
      "faqs": [
        {
          "q": "What is the Work Style Assessment?",
          "a": "A scenario-based behavioral assessment designed to evaluate how candidates align with Amazon's core Leadership Principles."
        },
        {
          "q": "Can I apply for multiple roles simultaneously?",
          "a": "Yes, you can apply for multiple open roles, but assessments are typically unified."
        }
      ]
    },
    "companyType": "Product"
  },
  {
    "name": "Microsoft",
    "logo": "https://logo.clearbit.com/microsoft.com",
    "rounds": [
      "Online Assessment",
      "Coding",
      "Technical Interview",
      "System Design (Role Based)",
      "HR"
    ],
    "skills": [
      "C#",
      "Azure",
      "Object Oriented Design",
      "Data Structures",
      "Problem Solving"
    ],
    "questions": [
      "Design a file storage service like OneDrive.",
      "Write a function to detect a cycle in a linked list.",
      "Tell me about a project you are most proud of."
    ],
    "difficulty": "Hard",
    "package": "12 - 34 LPA",
    "eligibility": "B.Tech/M.Tech/MS (CGPA >= 8.0)",
    "selectionRate": "1.5%",
    "estimatedTime": "3 Weeks",
    "color": "#00A4EF",
    "secondaryColor": "#F25022",
    "tracks": [
      {
        "id": "sde-intern",
        "name": "SDE Intern",
        "package": "10 - 12 LPA",
        "difficulty": "Medium-Hard",
        "timeline": "6 Weeks",
        "eligibility": "Pre-final Year (CGPA >= 7.5)"
      },
      {
        "id": "sde-1",
        "name": "SDE 1",
        "package": "15 - 22 LPA",
        "difficulty": "Hard",
        "timeline": "8 Weeks",
        "eligibility": "Graduates (CGPA >= 7.5)"
      },
      {
        "id": "sde-2",
        "name": "SDE 2",
        "package": "25 - 34 LPA",
        "difficulty": "Very Hard",
        "timeline": "10 Weeks",
        "eligibility": "2+ Years Experience"
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "Microsoft Codility Challenge"
      },
      {
        "id": "tech",
        "title": "Technical Interview (DSA & OOP)"
      },
      {
        "id": "hr",
        "title": "HR & Culture Alignment"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      }
    ],
    "info": {
      "overview": "Microsoft is a multinational technology corporation known for operating systems, cloud services (Azure), and software development tools.",
      "description": "Microsoft's mission is to empower every person and every organization on the planet to achieve more. The company values growth mindset, customer obsession, and diverse viewpoints.",
      "headquarters": "Redmond, Washington, USA",
      "industry": "Computer Software & Cloud Computing Services",
      "founded": "1975",
      "employees": "Approx. 220,000+",
      "careersUrl": "https://careers.microsoft.com",
      "hiringType": "College hires (FYE), On-campus placements, and off-campus digital campaigns.",
      "availability": "Annual campus placement campaigns at accredited global universities.",
      "eligibility": "Engineering graduates with majors in Computer Science, IT, ECE, EEE or related fields.",
      "degrees": "B.E, B.Tech, M.Tech, or MCA.",
      "cgpa": "Minimum 7.0 or 7.5 CGPA required for college placement eligibility.",
      "process": "Online Coding Test (Codility) ➔ Technical Interview 1 ➔ Technical Interview 2 ➔ Systems Design ➔ HR Review Panel.",
      "rounds": "Technical rounds covering database systems, operational networks, memory boundaries, and OOP patterns.",
      "flow": "SDE roles focus on system design, data structures, and memory safety. Quality engineers focus on debugging, scripting, and unit test suites.",
      "techTopics": "Trees, LinkedLists, Dynamic Programming, Concurrency, Operating Systems, Database Indices.",
      "behavioralTopics": "Growth mindset, handling setbacks, team cooperation, Microsoft values alignment.",
      "skillsPreferred": "High-quality software engineering foundations, design patterns, scalable design.",
      "technologies": "C#, C++, Java, Azure Cloud stacks.",
      "projectsExpected": "Full-stack cloud applications, custom compiler layers, or mock operating system kernels.",
      "prepTips": "Practice writing compilation-safe code, review basic operating systems (threads, virtual memory), and practice system design.",
      "timeline": "Typically takes 3 to 6 weeks from initial assessment to final decision.",
      "package": "Entry-level fresher compensation packages range from 12 to 34 LPA.",
      "notes": "Microsoft coding evaluations place high importance on correct handling of extreme inputs and boundary conditions.",
      "faqs": [
        {
          "q": "Does Microsoft hire for cloud specialist roles?",
          "a": "Yes, they recruit dedicated specialist tracks for Azure cloud consulting and solutions architecture."
        },
        {
          "q": "Is the Codility test language-restricted?",
          "a": "No, candidates can generally choose Java, C++, C#, Python, or JavaScript."
        }
      ]
    },
    "companyType": "Product"
  },
  {
    "name": "NVIDIA",
    "logo": "https://logo.clearbit.com/nvidia.com",
    "rounds": [
      "Online Screening Test",
      "Technical Round 1 (C++/Memory)",
      "Technical Interview 2 (CUDA/Multi-threading)",
      "Managerial Panel"
    ],
    "skills": [
      "Low-level System Programming",
      "Multi-threading",
      "CUDA",
      "C/C++",
      "GPU Architectures"
    ],
    "questions": [
      "Explain multi-threading vs multi-processing.",
      "Explain GPU memory management and cache structures.",
      "Write a program to align memory allocations in C++."
    ],
    "difficulty": "Hard",
    "package": "12 - 35 LPA",
    "eligibility": "B.Tech/M.Tech/M.S. in CS/ECE/EE (CGPA >= 8.0)",
    "selectionRate": "1.0%",
    "estimatedTime": "4-8 Weeks",
    "color": "#76B900",
    "secondaryColor": "#4A4A4A",
    "tracks": [
      {
        "id": "sw-intern",
        "name": "Software Intern",
        "package": "10 - 12 LPA",
        "difficulty": "Hard",
        "timeline": "6 Weeks",
        "eligibility": "Pre-final Year (CGPA >= 8.0)"
      },
      {
        "id": "sde-systems",
        "name": "Systems Engineer",
        "package": "16 - 22 LPA",
        "difficulty": "Very Hard",
        "timeline": "8 Weeks",
        "eligibility": "Graduates (CGPA >= 8.0)"
      },
      {
        "id": "gpu-arch",
        "name": "GPU Architect",
        "package": "25 - 35 LPA",
        "difficulty": "Expert",
        "timeline": "10 Weeks",
        "eligibility": "Master's or Ph.D."
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "NVIDIA Online Challenge"
      },
      {
        "id": "tech",
        "title": "C++ Systems Technical"
      },
      {
        "id": "hr",
        "title": "Managerial & Core Values"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      }
    ],
    "info": {
      "overview": "NVIDIA is a pioneer in GPU computing, high-performance computing hardware, and artificial intelligence solutions.",
      "description": "NVIDIA designs GPUs for the gaming and professional markets, as well as system on a chip units for the mobile computing and automotive market. The company values technical depth, risk-taking, and speed.",
      "headquarters": "Santa Clara, California, USA",
      "industry": "Semiconductors & AI Computing Infrastructure",
      "founded": "1993",
      "employees": "Approx. 26,000+",
      "careersUrl": "https://www.nvidia.com/en-us/about-nvidia/careers",
      "hiringType": "University recruiting, specialized internships, and pool drives.",
      "availability": "Targeted campus placement drives at premier technology institutes.",
      "eligibility": "Graduates with majors in Computer Science, Electrical Engineering, VLSI, or Electronics.",
      "degrees": "B.Tech, M.Tech, M.S. in Computer Science/ECE/EE.",
      "cgpa": "Generally requires 8.0+ CGPA or top class tier placement eligibility.",
      "process": "Online Screening Test ➔ Technical Round 1 (C++/Memory) ➔ Technical Interview 2 (Multi-threading/CUDA) ➔ Managerial Panel.",
      "rounds": "Deep low-level technical rounds covering hardware layouts, memory allocations, pointer safety, and multithreaded coding.",
      "flow": "SW Engineers get C++, operating systems, and kernel drivers. HW/Silicon Engineers get VLSI design, Verilog, and logic gates.",
      "techTopics": "Multi-threading, Pointers, Memory Management, CPU/GPU Architectures, Cache Coherence, Operating Systems.",
      "behavioralTopics": "Collaborating in multidisciplinary teams, handling technical blocks, work prioritization.",
      "skillsPreferred": "Low-level system programming, driver design, hardware-software integration.",
      "technologies": "C, C++, CUDA, Python, Verilog/SystemVerilog.",
      "projectsExpected": "Custom compilers, multi-threaded algorithms, embedded device drivers, or custom CPU design projects.",
      "prepTips": "Focus on operating system concepts (semaphores, mutex, virtual memory) and practice writing memory-safe C++.",
      "timeline": "Generally 4 to 8 weeks from initial screening to offer approval.",
      "package": "Entry-level fresher compensation packages range from 12 to 35 LPA.",
      "notes": "NVIDIA software engineers work close to the hardware. Be prepared for direct questions on compiler operations.",
      "faqs": [
        {
          "q": "Is CUDA knowledge mandatory?",
          "a": "Not for general software engineering, but it is highly preferred and tested."
        },
        {
          "q": "Does NVIDIA offer hardware engineering internships?",
          "a": "Yes, they run university campaigns for silicon, VLSI, and board design roles."
        }
      ]
    },
    "companyType": "Product"
  },
  {
    "name": "TCS",
    "logo": "https://logo.clearbit.com/tcs.com",
    "rounds": [
      "TCS National Qualifier Test (NQT)",
      "Technical Interview",
      "HR & Managerial Interview Panel"
    ],
    "skills": [
      "Basic Data Structures",
      "SQL Queries",
      "Programming Logic",
      "Communication Skills"
    ],
    "questions": [
      "Explain method overloading vs method overriding.",
      "What is a join in SQL? Explain types.",
      "Reverse words in a given string."
    ],
    "difficulty": "Easy",
    "package": "3.3 - 9.0 LPA",
    "eligibility": "B.E/B.Tech/MCA/M.Tech (CGPA >= 6.0)",
    "selectionRate": "15.0%",
    "estimatedTime": "2-4 Weeks",
    "color": "#00529B",
    "secondaryColor": "#000000",
    "tracks": [
      {
        "id": "ninja",
        "name": "Ninja",
        "package": "3.3 - 3.6 LPA",
        "difficulty": "Easy",
        "timeline": "4 Weeks",
        "eligibility": "Graduates (CGPA >= 6.0)"
      },
      {
        "id": "digital",
        "name": "Digital",
        "package": "7.0 - 7.5 LPA",
        "difficulty": "Medium-Hard",
        "timeline": "5 Weeks",
        "eligibility": "Graduates (CGPA >= 7.0)"
      },
      {
        "id": "prime",
        "name": "Prime",
        "package": "9.0 LPA",
        "difficulty": "Hard",
        "timeline": "6 Weeks",
        "eligibility": "Graduates (CGPA >= 7.5)"
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "TCS National Qualifier Test"
      },
      {
        "id": "tech",
        "title": "Technical Interview"
      },
      {
        "id": "hr",
        "title": "HR & Managerial Rounds"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      },
      {
        "id": "training",
        "title": "Training Program"
      },
      {
        "id": "bu",
        "title": "Business Unit Allocation"
      },
      {
        "id": "role",
        "title": "Final Role Allocation"
      }
    ],
    "info": {
      "overview": "TCS is one of the largest global IT services, consulting, and business solutions organizations based in India.",
      "description": "TCS partners with many of the world's largest businesses in their transformation journeys, offering consulting-led, cognitive-powered portfolios of business, technology, and engineering services.",
      "headquarters": "Mumbai, Maharashtra, India",
      "industry": "IT Services & Enterprise Consulting",
      "founded": "1968",
      "employees": "Approx. 600,000+",
      "careersUrl": "https://www.tcs.com/careers",
      "hiringType": "TCS NQT (National Qualifier Test) national drives, campus recruitment, and hackathons.",
      "availability": "Large-scale campus placement drives across multiple universities.",
      "eligibility": "Minimum 60% aggregate throughout education (10th, 12th, and graduation) with no active backlogs.",
      "degrees": "B.E, B.Tech, M.E, M.Tech, MCA, M.Sc, BSc.",
      "cgpa": "Minimum 6.0 CGPA or equivalent 60% aggregate.",
      "process": "TCS National Qualifier Test (NQT) ➔ Technical Interview ➔ HR & Managerial Interview Panel.",
      "rounds": "NQT Aptitude, Coding tests, and a combined or separate Technical/HR panel interview.",
      "flow": "Ninja track evaluates basic coding and DBMS. Digital track tests advanced algorithms and full-stack. Prime track evaluates scalable systems and architectures.",
      "techTopics": "Basic Data Structures, Object-Oriented Programming, SQL Queries, Software Engineering Lifecycle (SDLC).",
      "behavioralTopics": "Willingness to relocate, night shift availability, team collaboration, career goals.",
      "skillsPreferred": "Solid programming foundations, database design, good verbal and written communication.",
      "technologies": "Java, Python, C++, SQL.",
      "projectsExpected": "Responsive web portals, simple CRUD management apps, or record dashboards.",
      "prepTips": "Practice quantitative aptitude, basic SQL select/join queries, and review details of your final year project.",
      "timeline": "Typical drive timeline takes 2 to 4 weeks from assessment to final offer release.",
      "package": "Ninja: 3.3-3.6 LPA | Digital: 7.0-7.5 LPA | Prime: 9.0 LPA.",
      "notes": "Passing NQT with high scores is required to be shortlisted for the Digital or Prime track interview rounds.",
      "faqs": [
        {
          "q": "Can non-CS students apply?",
          "a": "Yes, NQT is open to all engineering branches and science graduates."
        },
        {
          "q": "Is there any negative marking in NQT?",
          "a": "No, there is generally no negative marking in the NQT test format."
        }
      ]
    },
    "companyType": "Service"
  },
  {
    "name": "Infosys",
    "logo": "https://logo.clearbit.com/infosys.com",
    "rounds": [
      "Online Test (Aptitude & Coding)",
      "Technical Interview",
      "HR Discussion"
    ],
    "skills": [
      "SQL Joins",
      "OOPs Concepts",
      "Basic DSA",
      "Logical Aptitude"
    ],
    "questions": [
      "Explain normal forms in database systems.",
      "Write a program to check if a string is palindrome.",
      "Explain SDLC methodologies."
    ],
    "difficulty": "Easy",
    "package": "3.6 - 9.5 LPA",
    "eligibility": "B.E/B.Tech/MCA/M.Sc (CGPA >= 6.0)",
    "selectionRate": "14.0%",
    "estimatedTime": "2-4 Weeks",
    "color": "#007CC3",
    "secondaryColor": "#FF6F0C",
    "tracks": [
      {
        "id": "se",
        "name": "System Engineer",
        "package": "3.6 LPA",
        "difficulty": "Easy",
        "timeline": "4 Weeks",
        "eligibility": "Graduates (CGPA >= 6.0)"
      },
      {
        "id": "dse",
        "name": "DSE",
        "package": "6.25 LPA",
        "difficulty": "Medium",
        "timeline": "5 Weeks",
        "eligibility": "Graduates (CGPA >= 7.0)"
      },
      {
        "id": "sp",
        "name": "Specialist Programmer",
        "package": "9.5 LPA",
        "difficulty": "Hard",
        "timeline": "6 Weeks",
        "eligibility": "Graduates (CGPA >= 7.5)"
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "Infosys Online Challenge"
      },
      {
        "id": "tech",
        "title": "Technical Interview"
      },
      {
        "id": "hr",
        "title": "HR Discussion"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      },
      {
        "id": "training",
        "title": "Training Program"
      },
      {
        "id": "bu",
        "title": "Business Unit Allocation"
      },
      {
        "id": "role",
        "title": "Final Role Allocation"
      }
    ],
    "info": {
      "overview": "Infosys is a global leader in next-generation digital services and consulting services.",
      "description": "Infosys enables clients in more than 56 countries to navigate their digital transformation, powering them with an AI-first core and agile digital operations.",
      "headquarters": "Bengaluru, Karnataka, India",
      "industry": "IT Services & Consulting",
      "founded": "1981",
      "employees": "Approx. 330,000+",
      "careersUrl": "https://www.infosys.com/careers",
      "hiringType": "InfyTQ Certification drives, HackWithInfy coding challenges, and campus recruitment drives.",
      "availability": "Annual recruitment drives at engineering colleges.",
      "eligibility": "Minimum 60% or equivalent CGPA in 10th, 12th, and graduation.",
      "degrees": "B.E, B.Tech, M.E, M.Tech, MCA, M.Sc.",
      "cgpa": "Minimum 6.0 CGPA or 60% aggregate throughout academic timeline.",
      "process": "Online Test (Aptitude & Coding) ➔ Technical Interview ➔ HR Discussion.",
      "rounds": "Aptitude logical testing, coding, SQL queries, and resume evaluation rounds.",
      "flow": "SE track evaluates basic syntax and data structures. DSE/SP tracks evaluate advanced data structures, algorithms, and microservices.",
      "techTopics": "SQL joins, Object-Oriented Programming (OOP) concepts, Recursion, Sorting, Searching.",
      "behavioralTopics": "Relocation flexibility, training schedule alignment, learning new stacks.",
      "skillsPreferred": "Core logical problem solving, relational query design, structural system thinking.",
      "technologies": "Java, Python, JavaScript, SQL.",
      "projectsExpected": "Database-backed management systems, web applications, or basic microservices.",
      "prepTips": "Practice tracing pseudocodes, practice SQL query writing, and learn recursion basics.",
      "timeline": "Typically 2 to 4 weeks from online test to final result.",
      "package": "SE: 3.6 LPA | DSE: 6.25 LPA | SP: 9.5 LPA.",
      "notes": "Students clearing InfyTQ certification tests with high scores are directly invited to interviews for SP or DSE roles.",
      "faqs": [
        {
          "q": "What is HackWithInfy?",
          "a": "Infosys' national coding competition that serves as a direct gateway for SP (Specialist Programmer) recruitment."
        },
        {
          "q": "Is there a service agreement?",
          "a": "Please verify during the pre-placement talk as policies may vary by drive."
        }
      ]
    },
    "companyType": "Service"
  },
  {
    "name": "Capgemini",
    "logo": "https://logo.clearbit.com/capgemini.com",
    "rounds": [
      "Pseudo-code & Cognitive Test",
      "English Communication",
      "Joint Tech-cum-HR Panel"
    ],
    "skills": [
      "Pseudo-code",
      "English Fluency",
      "SQL",
      "Basic OOPs"
    ],
    "questions": [
      "Write a pseudo-code to check if a number is prime.",
      "Explain normalization in DBMS.",
      "What are stack and queue differences?"
    ],
    "difficulty": "Easy",
    "package": "4.0 - 8.0 LPA",
    "eligibility": "B.E/B.Tech/MCA (CGPA >= 6.0)",
    "selectionRate": "11.0%",
    "estimatedTime": "2-3 Weeks",
    "color": "#0070AD",
    "secondaryColor": "#FFB500",
    "tracks": [
      {
        "id": "analyst",
        "name": "Analyst",
        "package": "4.0 - 4.25 LPA",
        "difficulty": "Easy",
        "timeline": "4 Weeks",
        "eligibility": "Graduates (CGPA >= 6.0)"
      },
      {
        "id": "cloud-associate",
        "name": "Cloud Associate",
        "package": "5.5 - 6.5 LPA",
        "difficulty": "Medium",
        "timeline": "5 Weeks",
        "eligibility": "Graduates (CGPA >= 6.5)"
      },
      {
        "id": "senior-analyst",
        "name": "Senior Analyst",
        "package": "7.5 - 8.0 LPA",
        "difficulty": "Hard",
        "timeline": "6 Weeks",
        "eligibility": "Graduates (CGPA >= 7.0)"
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "Capgemini Pseudo-code & Cognitive"
      },
      {
        "id": "tech",
        "title": "Technical Interview"
      },
      {
        "id": "hr",
        "title": "HR Interview"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      },
      {
        "id": "training",
        "title": "Training Program"
      },
      {
        "id": "bu",
        "title": "Business Unit Allocation"
      },
      {
        "id": "role",
        "title": "Final Role Allocation"
      }
    ],
    "info": {
      "overview": "Capgemini is a global leader in IT consulting, digital transformation, and business integration services.",
      "description": "Capgemini is guided by its seven core values: honesty, boldness, trust, freedom, fun, simplicity, and team spirit. The company values client focus, innovation, and technological expertise.",
      "headquarters": "Paris, France",
      "industry": "Information Technology & Consulting Services",
      "founded": "1967",
      "employees": "Approx. 340,000+",
      "careersUrl": "https://www.capgemini.com/careers",
      "hiringType": "Campus recruitment pool drives, joint campus placements, and off-campus campaigns.",
      "availability": "Active campus recruiter at partnered technology institutes.",
      "eligibility": "Engineering graduates with 60% aggregate in graduation and senior secondary.",
      "degrees": "B.E, B.Tech, MCA.",
      "cgpa": "Minimum 6.0 CGPA or 60% aggregate.",
      "process": "Pseudo-code & Cognitive Test ➔ English Communication Proficiency Test ➔ Joint Tech-cum-HR Panel Interview.",
      "rounds": "Eliminative cognitive tests, automated speaking/listening assessments, and a combined interview round.",
      "flow": "Analyst track evaluates logic and pseudocodes. Cloud Associate track tests networking and basic system operations.",
      "techTopics": "Loops, Conditions, Basic Data Structures (Arrays, Strings), DBMS concepts.",
      "behavioralTopics": "Capgemini core values, collaborative mindset, versatility, adaptiveness.",
      "skillsPreferred": "Good logical reasoning, english communication clarity, general software awareness.",
      "technologies": "Java, Spring Boot, React, SQL.",
      "projectsExpected": "Web portals, database trackers, or simple microservices.",
      "prepTips": "Practice tracing loop outcomes in pseudocode, speak clearly during the automated communication round, and read about Capgemini values.",
      "timeline": "Usually takes 2 to 3 weeks from initial assessment to selection declaration.",
      "package": "Analyst: 4.0-4.25 LPA | Cloud Associate: 5.5-6.5 LPA | Senior Analyst: 7.5-8.0 LPA.",
      "notes": "The Communication Assessment evaluates pronunciation, vocabulary, and active listening. It is highly eliminative.",
      "faqs": [
        {
          "q": "Are coding questions present in the Analyst track?",
          "a": "No, the Analyst track focuses on pseudo-code debugging; full coding is in the Senior Analyst track."
        },
        {
          "q": "Is there any negative marking in the cognitive test?",
          "a": "No, there is no negative marking in the initial online test."
        }
      ]
    },
    "companyType": "Service"
  },
  {
    "name": "Accenture",
    "logo": "https://logo.clearbit.com/accenture.com",
    "rounds": [
      "Cognitive & Technical Assessment",
      "Coding Test (Eliminative)",
      "Communication Assessment",
      "Joint Interview Panel"
    ],
    "skills": [
      "Cognitive Ability",
      "Logical Reasoning",
      "Coding Logic",
      "System Integrations"
    ],
    "questions": [
      "What is an API? Explain REST vs SOAP.",
      "Explain cloud computing deployment models.",
      "Design a database schema for user session management."
    ],
    "difficulty": "Medium",
    "package": "4.5 - 8.5 LPA",
    "eligibility": "B.E/B.Tech/MCA/M.Sc (CGPA >= 6.5)",
    "selectionRate": "8.0%",
    "estimatedTime": "3-5 Weeks",
    "color": "#A100FF",
    "secondaryColor": "#000000",
    "tracks": [
      {
        "id": "ase",
        "name": "ASE",
        "package": "4.5 LPA",
        "difficulty": "Easy",
        "timeline": "4 Weeks",
        "eligibility": "Graduates (CGPA >= 6.5)"
      },
      {
        "id": "fse",
        "name": "FSE",
        "package": "6.5 LPA",
        "difficulty": "Medium",
        "timeline": "5 Weeks",
        "eligibility": "Graduates (CGPA >= 7.0)"
      },
      {
        "id": "senior-analyst",
        "name": "Senior Analyst",
        "package": "8.5 LPA",
        "difficulty": "Hard",
        "timeline": "6 Weeks",
        "eligibility": "Graduates (CGPA >= 7.5)"
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "Accenture Cognitive & Technical"
      },
      {
        "id": "tech",
        "title": "Technical Interview"
      },
      {
        "id": "hr",
        "title": "HR Interview"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      },
      {
        "id": "training",
        "title": "Training Program"
      },
      {
        "id": "bu",
        "title": "Business Unit Allocation"
      },
      {
        "id": "role",
        "title": "Final Role Allocation"
      }
    ],
    "info": {
      "overview": "Accenture is a leading global professional services company providing consulting, digital, and cloud solutions.",
      "description": "Accenture delivers on the promise of technology and human ingenuity. The company emphasizes innovation, client success, and collaborative teamwork.",
      "headquarters": "Dublin, Ireland",
      "industry": "Management Consulting & IT Services",
      "founded": "1989",
      "employees": "Approx. 730,000+",
      "careersUrl": "https://www.accenture.com/careers",
      "hiringType": "Accenture Campus Placement drives, off-campus pool drives, and national recruitment cycles.",
      "availability": "Large-scale campus placement drives across multiple universities.",
      "eligibility": "Engineering graduates with a maximum of 1-year academic gap and 65% aggregate score.",
      "degrees": "B.E, B.Tech, MCA, M.Sc, M.Tech.",
      "cgpa": "Minimum 6.5 CGPA or equivalent.",
      "process": "Cognitive & Technical Assessment ➔ Coding Test (Eliminative) ➔ Communication Assessment ➔ Joint Interview Panel.",
      "rounds": "Online aptitude, coding logic compilation, English speaking test, and interview panel evaluations.",
      "flow": "ASE track tests general IT awareness and coding logic. FSE track evaluates React, NodeJS, API integrations, and database schemas.",
      "techTopics": "Pseudo-code, Basic Algorithms, Operating Systems, Networking, Cloud Basics.",
      "behavioralTopics": "Handling client requirements, project ownership, communication, flexibility.",
      "skillsPreferred": "Coding efficiency, logical safety, general software architecture understanding.",
      "technologies": "Java, JavaScript, Python, AWS/Azure basics.",
      "projectsExpected": "Web user directories, basic microservices, or cloud-hosted web apps.",
      "prepTips": "Practice logical reasoning, review basic networking rules, and practice solving coding challenges on platforms.",
      "timeline": "Typically 3 to 5 weeks from assessment to selection declaration.",
      "package": "ASE: 4.5 LPA | FSE: 6.5 LPA | Senior Analyst: 8.5 LPA.",
      "notes": "The Coding Round requires compiling at least one out of two questions fully to proceed to the next stages.",
      "faqs": [
        {
          "q": "Is the Communication Assessment eliminative?",
          "a": "Yes, it is a mandatory round that contributes to your final eligibility score."
        },
        {
          "q": "What is the difference between ASE and FSE?",
          "a": "FSE (Full Stack Engineer) is an advanced track with higher package that tests full-stack web architectures."
        }
      ]
    },
    "companyType": "Service"
  },
  {
    "name": "Cognizant",
    "logo": "https://logo.clearbit.com/cognizant.com",
    "rounds": [
      "Aptitude Assessment (AMCAT)",
      "Coding Challenge",
      "Technical Interview",
      "HR Round"
    ],
    "skills": [
      "Math Logic",
      "Coding syntaxes",
      "Database normalization",
      "OOPs concepts"
    ],
    "questions": [
      "What is abstract class vs interface?",
      "Explain normal forms in databases.",
      "Explain structural design patterns."
    ],
    "difficulty": "Easy",
    "package": "4.0 - 6.5 LPA",
    "eligibility": "B.Tech/MCA/M.Tech (CGPA >= 6.0)",
    "selectionRate": "12.0%",
    "estimatedTime": "2-4 Weeks",
    "color": "#0033A0",
    "secondaryColor": "#FFB500",
    "tracks": [
      {
        "id": "genc",
        "name": "GenC",
        "package": "4.0 LPA",
        "difficulty": "Easy",
        "timeline": "4 Weeks",
        "eligibility": "Graduates (CGPA >= 6.0)"
      },
      {
        "id": "genc-elevate",
        "name": "GenC Elevate",
        "package": "4.5 LPA",
        "difficulty": "Medium",
        "timeline": "5 Weeks",
        "eligibility": "Graduates (CGPA >= 6.5)"
      },
      {
        "id": "genc-pro",
        "name": "GenC Pro",
        "package": "6.5 LPA",
        "difficulty": "Hard",
        "timeline": "6 Weeks",
        "eligibility": "Graduates (CGPA >= 7.0)"
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "Cognizant GenC OA"
      },
      {
        "id": "tech",
        "title": "Technical Interview"
      },
      {
        "id": "hr",
        "title": "HR discussion"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      },
      {
        "id": "training",
        "title": "Training Program"
      },
      {
        "id": "bu",
        "title": "Business Unit Allocation"
      },
      {
        "id": "role",
        "title": "Final Role Allocation"
      }
    ],
    "info": {
      "overview": "Cognizant is a leading provider of digital, IT consulting, operational, and systems integration services.",
      "description": "Cognizant helps clients modernize technology, reimagine processes, and transform experiences. The company values collaboration, client-centricity, and execution focus.",
      "headquarters": "Teaneck, New Jersey, USA",
      "industry": "IT Services & Enterprise Consulting",
      "founded": "1994",
      "employees": "Approx. 350,000+",
      "careersUrl": "https://www.cognizant.com/careers",
      "hiringType": "GenC recruitment drives, campus placements, and pool campaigns.",
      "availability": "Major campus recruiter across engineering and science campuses.",
      "eligibility": "Graduates with 60% aggregate in secondary, senior secondary, and graduation.",
      "degrees": "B.Tech, MCA, M.Tech, M.Sc.",
      "cgpa": "Minimum 6.0 CGPA or equivalent.",
      "process": "Aptitude Assessment (AMCAT) ➔ Coding Challenge ➔ Technical Interview ➔ HR discussion.",
      "rounds": "Math logic, coding logic, database schema normalization, and resume review rounds.",
      "flow": "GenC track evaluates programming logic and DBMS. GenC Elevate/Pro tracks test microservices, systems scaling, and APIs.",
      "techTopics": "OOP concepts, Arrays, Strings, Sorting, Basic DBMS and SQL Queries.",
      "behavioralTopics": "Growth mindset, career alignment, readiness for training, teamwork.",
      "skillsPreferred": "Basic DSA, structural programming logic, relational query construction.",
      "technologies": "Java, Python, C++, SQL.",
      "projectsExpected": "CRUD applications, inventory recorders, banking or library management systems.",
      "prepTips": "Practice standard array/string problems, review SQL select/join syntaxes, and dry-run your coding logic.",
      "timeline": "Generally takes 2 to 4 weeks from assessment to final offer release.",
      "package": "GenC: 4.0 LPA | GenC Elevate: 4.5 LPA | GenC Pro: 6.5 LPA.",
      "notes": "Active backlogs at the time of recruitment will disqualify the applicant.",
      "faqs": [
        {
          "q": "Can I choose my coding language?",
          "a": "Yes, Java, C++, Python, and C are supported in the coding test."
        },
        {
          "q": "Is there a service bond?",
          "a": "Please verify during the pre-placement talk as policies may vary by drive."
        }
      ]
    },
    "companyType": "Service"
  },
  {
    "name": "Wipro",
    "logo": "https://logo.clearbit.com/wipro.com",
    "rounds": [
      "Wipro NLTH Online Assessment",
      "Technical Interview",
      "HR & Placement Round"
    ],
    "skills": [
      "Quantitative Aptitude",
      "Verbal Aptitude",
      "DBMS normalization",
      "Programming logic"
    ],
    "questions": [
      "Explain the difference between process and thread.",
      "Explain second highest salary in SQL.",
      "Write a function to count frequencies in array."
    ],
    "difficulty": "Medium",
    "package": "3.5 - 6.5 LPA",
    "eligibility": "B.E/B.Tech/MCA (CGPA >= 6.0)",
    "selectionRate": "4.8%",
    "estimatedTime": "2-4 Weeks",
    "color": "#0072C6",
    "secondaryColor": "#FF6600",
    "tracks": [
      {
        "id": "elite",
        "name": "Elite NLTH",
        "package": "3.5 LPA",
        "difficulty": "Easy",
        "timeline": "4 Weeks",
        "eligibility": "Graduates (CGPA >= 6.0)"
      },
      {
        "id": "digital",
        "name": "Wipro Digital",
        "package": "5.5 LPA",
        "difficulty": "Medium",
        "timeline": "5 Weeks",
        "eligibility": "Graduates (CGPA >= 6.8)"
      },
      {
        "id": "turbo",
        "name": "Wipro Turbo",
        "package": "6.5 LPA",
        "difficulty": "Hard",
        "timeline": "6 Weeks",
        "eligibility": "Graduates (CGPA >= 7.2)"
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "Wipro Elite OA"
      },
      {
        "id": "tech",
        "title": "Technical Interview"
      },
      {
        "id": "hr",
        "title": "HR Interview"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      },
      {
        "id": "training",
        "title": "Training Program"
      },
      {
        "id": "bu",
        "title": "Business Unit Allocation"
      },
      {
        "id": "role",
        "title": "Final Role Allocation"
      }
    ],
    "info": {
      "overview": "Wipro is a leading global technology services and consulting organization focused on digital solutions.",
      "description": "Wipro is dedicated to building innovative solutions that address clients' most complex digital transformation needs. The company values integrity, respect, and responsibility.",
      "headquarters": "Bengaluru, Karnataka, India",
      "industry": "IT Services & Consulting",
      "founded": "1945",
      "employees": "Approx. 250,000+",
      "careersUrl": "https://careers.wipro.com",
      "hiringType": "Elite NLTH (National Talent Hunt), campus recruitment drives, and off-campus pool drives.",
      "availability": "Annual mass recruiter at engineering colleges.",
      "eligibility": "Graduates with 60% aggregate score throughout education with a maximum of 3-year gap.",
      "degrees": "B.E, B.Tech, MCA, M.Tech.",
      "cgpa": "Minimum 6.0 CGPA.",
      "process": "Elite Assessment (Aptitude + Essay + Coding) ➔ Technical Interview ➔ HR Round.",
      "rounds": "Sectional aptitude tests, automated essay checks, programming evaluations, and HR discussions.",
      "flow": "Elite track tests basic coding and logic. Turbo track tests advanced systems design, microservices, and APIs.",
      "techTopics": "Loops, Recursion, Search Algorithms, DBMS, Basic SQL.",
      "behavioralTopics": "Relocation flexibility, team synergy, career goals.",
      "skillsPreferred": "Programming logic, database design, good verbal and written communication.",
      "technologies": "Java, Python, C++, SQL.",
      "projectsExpected": "Catalog applications, record systems, simple web databases.",
      "prepTips": "Focus on writing clear, grammatically correct essays, practice basic array sorting, and review SQL select syntax.",
      "timeline": "Takes 2 to 4 weeks from initial NLTH test to final offer.",
      "package": "Elite: 3.5 LPA | Wipro Digital: 5.5 LPA | Turbo: 6.5 LPA.",
      "notes": "The online assessment includes sectional cut-offs for aptitude and coding.",
      "faqs": [
        {
          "q": "What is Wipro NLTH?",
          "a": "National Level Talent Hunt: Wipro's official mass entry gateway for engineering freshers."
        },
        {
          "q": "Is the essay writing round evaluative?",
          "a": "Yes, it evaluates written English proficiency using automated tools."
        }
      ]
    },
    "companyType": "Service"
  },
  {
    "name": "Deloitte",
    "logo": "https://logo.clearbit.com/deloitte.com",
    "rounds": [
      "Cognitive Test",
      "Technical Test",
      "Consulting Case Study & Tech Interview",
      "HR Interview"
    ],
    "skills": [
      "Technology Consulting",
      "Database management",
      "Analytical reasoning",
      "Case study logic"
    ],
    "questions": [
      "How do you model high volumes of user transactions?",
      "Explain different types of database relationships.",
      "Tell me about a consulting dilemma and how you'd solve it."
    ],
    "difficulty": "Medium-Hard",
    "package": "4.5 - 12.0 LPA",
    "eligibility": "B.E/B.Tech/MCA/MBA (CGPA >= 6.5)",
    "selectionRate": "8.5%",
    "estimatedTime": "3-5 Weeks",
    "color": "#86BC25",
    "secondaryColor": "#000000",
    "tracks": [
      {
        "id": "analyst",
        "name": "Analyst",
        "package": "4.5 LPA",
        "difficulty": "Easy",
        "timeline": "4 Weeks",
        "eligibility": "Graduates (CGPA >= 6.5)"
      },
      {
        "id": "consultant",
        "name": "Consultant",
        "package": "8.0 LPA",
        "difficulty": "Medium-Hard",
        "timeline": "5 Weeks",
        "eligibility": "Graduates (CGPA >= 7.0)"
      },
      {
        "id": "senior-consultant",
        "name": "Senior Consultant",
        "package": "12.0 LPA",
        "difficulty": "Hard",
        "timeline": "6 Weeks",
        "eligibility": "Graduates (CGPA >= 7.5)"
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "Deloitte Cognitive Assessment"
      },
      {
        "id": "tech",
        "title": "Technical Interview"
      },
      {
        "id": "hr",
        "title": "HR Round"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      },
      {
        "id": "training",
        "title": "Training Program"
      },
      {
        "id": "bu",
        "title": "Business Unit Allocation"
      },
      {
        "id": "role",
        "title": "Final Role Allocation"
      }
    ],
    "info": {
      "overview": "Deloitte is a global provider of audit, assurance, consulting, financial advisory, and risk services.",
      "description": "Deloitte drives progress, helping clients solve their most complex business problems. The company values integrity, quality, and professional excellence.",
      "headquarters": "London, UK",
      "industry": "Management Consulting & Professional Services",
      "founded": "1845",
      "employees": "Approx. 450,000+",
      "careersUrl": "https://www.deloitte.com/careers",
      "hiringType": "Campus placement drives, off-campus pool campaigns, and referral hiring.",
      "availability": "Selective recruitment drives organized at top colleges.",
      "eligibility": "Graduates with minimum 60% aggregate or equivalent CGPA.",
      "degrees": "B.E, B.Tech, MCA, MBA.",
      "cgpa": "Minimum 6.5 CGPA.",
      "process": "Cognitive & Aptitude Test ➔ Coding/Technical Test ➔ Case Study & Tech Interview ➔ HR Interview.",
      "rounds": "Aptitude testing, case study analysis panel, resume review, and managerial discussion rounds.",
      "flow": "Analyst track evaluates data structures, database, and analytics logic. Consultant track focuses on client case solutions.",
      "techTopics": "SQL queries, Relational Database management, Software Lifecycle, Basic Programming logic.",
      "behavioralTopics": "Problem-solving approaches, handling business scenarios, team communication.",
      "skillsPreferred": "Analytical reasoning, data modeling, client collaboration capacity.",
      "technologies": "SQL, Python, Excel, PowerBI, Cloud basics.",
      "projectsExpected": "Business analysis models, client tracking apps, or analytical database portals.",
      "prepTips": "Practice solving guesstimate and case-study questions, review SQL joins, and be structured in your explanations.",
      "timeline": "Typically 3 to 5 weeks from initial screening to selection.",
      "package": "Analyst: 4.5 LPA | Consultant: 8.0 LPA | Senior Consultant: 12.0 LPA.",
      "notes": "Structuring your thoughts logically during the case study interview is more important than finding the exact mathematical answer.",
      "faqs": [
        {
          "q": "Is there coding in Deloitte interviews?",
          "a": "General Analyst roles test DBMS/SQL and logic; core software engineering tracks require coding tests."
        },
        {
          "q": "What is the format of the case study round?",
          "a": "You are given a mock business scenario and asked to outline analysis, database structure, and solution steps."
        }
      ]
    },
    "companyType": "Service"
  },
  {
    "name": "JPMorgan",
    "logo": "https://logo.clearbit.com/jpmorgan.com",
    "rounds": [
      "HackerRank Coding Test",
      "Code for Good Hackathon",
      "Technical Interviews",
      "HR Round"
    ],
    "skills": [
      "Object-Oriented Programming",
      "Spring Boot",
      "SQL/NoSQL",
      "System Concurrency",
      "Collaborative Coding"
    ],
    "questions": [
      "Write a function to implement thread-safe singleton pattern.",
      "Explain normal forms and transactional acid properties.",
      "How do you design a database to store user transactions?"
    ],
    "difficulty": "Hard",
    "package": "12 - 38 LPA",
    "eligibility": "B.E/B.Tech/MCA/M.Tech (CGPA >= 7.0)",
    "selectionRate": "2.5%",
    "estimatedTime": "4-8 Weeks",
    "color": "#2F2F2F",
    "secondaryColor": "#8E7245",
    "tracks": [
      {
        "id": "tech-intern",
        "name": "Tech Intern",
        "package": "12 - 15 LPA",
        "difficulty": "Hard",
        "timeline": "8 Weeks",
        "eligibility": "Pre-final Year (CGPA >= 7.0)"
      },
      {
        "id": "sde",
        "name": "SDE",
        "package": "18 - 24 LPA",
        "difficulty": "Very Hard",
        "timeline": "10 Weeks",
        "eligibility": "Graduates (CGPA >= 7.0)"
      },
      {
        "id": "associate-sde",
        "name": "Associate SDE",
        "package": "32 - 38 LPA",
        "difficulty": "Expert",
        "timeline": "12 Weeks",
        "eligibility": "2+ Years Experience"
      }
    ],
    "pipeline": [
      {
        "id": "resume",
        "title": "Resume Screening"
      },
      {
        "id": "oa",
        "title": "JPMorgan HackerRank Challenge"
      },
      {
        "id": "tech",
        "title": "Code for Good Hackathon"
      },
      {
        "id": "hr",
        "title": "HR & Technical Panel"
      },
      {
        "id": "offer",
        "title": "Offer Letter"
      }
    ],
    "info": {
      "overview": "JPMorgan Chase is a prestigious global financial services firm and investment banking leader.",
      "description": "JPMorgan Chase is committed to help grow communities, manage wealth, and build robust global technology solutions. The company values collaboration, integrity, and engineering quality.",
      "headquarters": "New York City, New York, USA",
      "industry": "Investment Banking & Financial Technology",
      "founded": "1799",
      "employees": "Approx. 300,000+",
      "careersUrl": "https://careers.jpmorganchase.com",
      "hiringType": "Code for Good Hackathon drives, university recruitment programs, and internships.",
      "availability": "Highly competitive campus recruitment drives at premier institutions.",
      "eligibility": "Engineering graduates with a clean academic track record and high CGPA.",
      "degrees": "B.Tech, M.Tech, MCA.",
      "cgpa": "Minimum 7.0 CGPA.",
      "process": "HackerRank Coding Test ➔ Code for Good Hackathon ➔ Technical Interviews ➔ HR Round.",
      "rounds": "Coding screening, 24-hour hackathon collaborative evaluation, database design, and concurrency interviews.",
      "flow": "SDE roles test full-stack web architectures, microservices, concurrency models, and algorithmic efficiency.",
      "techTopics": "Multi-threading, Object-Oriented design, Database schemas, API designs, Data structures.",
      "behavioralTopics": "Collaborating with peers under pressure, ethical standards in finance, teamwork.",
      "skillsPreferred": "High-performance programming, modular web development, secure coding standards.",
      "technologies": "Java, Spring Boot, React, Python, SQL.",
      "projectsExpected": "Secure web portals, financial simulations, microservices APIs, or real-time dashboards.",
      "prepTips": "Focus on database normalization, practice collaborative software development, and study basic system architecture design.",
      "timeline": "Generally 4 to 8 weeks from initial HackerRank test to final offer.",
      "package": "Compensation packages range from 12 to 38 LPA for junior engineering tracks.",
      "notes": "The Code for Good hackathon is a primary channel where mentors evaluate your collaboration skills directly.",
      "faqs": [
        {
          "q": "Is finance knowledge required?",
          "a": "No, technology drives focus 100% on software engineering, problem solving, and collaboration capacities."
        },
        {
          "q": "Can I participate in Code for Good off-campus?",
          "a": "Yes, they open registration portals for national registration periods yearly."
        }
      ]
    },
    "companyType": "Product"
  }
];

const seedCompanies = async () => {
  try {
    await Company.deleteMany({});
    console.log('Cleared existing companies');
    await Company.insertMany(companies);
    console.log('12 Companies with dynamic specifications and knowledge layer seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
};

seedCompanies();
