import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { COMPANY_CODING_PYQS } from '../data/companyCodingPYQs';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  FaArrowLeft, FaCheckCircle, FaLock, FaMicrochip,
  FaUndo, FaClock, FaCheck, FaAward, FaSlidersH, FaBrain,
  FaTimesCircle, FaTrophy, FaLightbulb, FaBriefcase, FaChevronDown, 
  FaChevronUp, FaCode, FaRobot, FaUsers, FaLaptopCode, FaUpload, 
  FaTerminal, FaSync, FaExclamationTriangle, FaPaperPlane, FaUserTie, FaPlay, FaChartLine, FaMinus, FaPlus
} from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

// NVIDIA Brand Color Theme
const NV_GREEN = '#76b900';
const NV_DARK_GREEN = '#5c9000';

const NVIDIA_ROLES = [
  {
    _id: "nv_role_1",
    roleName: "Software Engineer",
    department: "System Software",
    level: "IC3 - IC5",
    locations: ["Santa Clara", "Redmond", "Bengaluru", "Munich"],
    avgSalary: "$150k - $230k",
    description: "Develop and optimize system software, compiler stacks, and driver frameworks for next-gen NVIDIA architectures.",
    difficulty: "Hard",
    prepTime: "6-8 Weeks",
    demand: "High",
    interviewStages: ["Resume Screening", "Online Assessment", "Technical 1", "Technical 2", "Behavioral"],
    requiredSkills: ["C++", "C", "Algorithms", "Operating Systems", "Computer Architecture"]
  },
  {
    _id: "nv_role_2",
    roleName: "Software Engineer Intern",
    department: "Developer Technologies",
    level: "University Intern",
    locations: ["Santa Clara", "Remote", "Pune"],
    avgSalary: "$45 - $75 / hr",
    description: "Work on real-world projects optimization, developer tools, and GPU acceleration platforms.",
    difficulty: "Medium",
    prepTime: "4-6 Weeks",
    demand: "Very High",
    interviewStages: ["Resume Screening", "Online Assessment", "Technical 1", "Behavioral"],
    requiredSkills: ["C++", "Python", "Data Structures", "Computer Architecture"]
  },
  {
    _id: "nv_role_3",
    roleName: "AI Engineer",
    department: "AI Infrastructure",
    level: "IC3 - IC6",
    locations: ["Santa Clara", "Bengaluru"],
    avgSalary: "$165k - $250k",
    description: "Design and implement scalable pipelines, libraries, and frameworks for running large-scale LLMs and generative AI models on NVIDIA DGX systems.",
    difficulty: "Hard",
    prepTime: "6-10 Weeks",
    demand: "Extremely High",
    interviewStages: ["Resume Screening", "Online Assessment", "Technical 1", "Technical 2", "Behavioral"],
    requiredSkills: ["Python", "PyTorch", "Deep Learning", "TensorRT", "Distributed Computing"]
  },
  {
    _id: "nv_role_4",
    roleName: "Machine Learning Engineer",
    department: "Applied Deep Learning",
    level: "IC3 - IC5",
    locations: ["Santa Clara", "Austin", "Hyderabad"],
    avgSalary: "$160k - $240k",
    description: "Develop deep learning algorithms and production-grade ML applications for autonomous vehicles, robotics, and smart systems.",
    difficulty: "Hard",
    prepTime: "6-8 Weeks",
    demand: "High",
    interviewStages: ["Resume Screening", "Online Assessment", "Technical 1", "Technical 2", "Behavioral"],
    requiredSkills: ["Python", "ML Theory", "TensorFlow/PyTorch", "GPU Acceleration", "C++"]
  },
  {
    _id: "nv_role_5",
    roleName: "CUDA Developer",
    department: "Compute SoftwareStack",
    level: "IC4 - IC6",
    locations: ["Santa Clara", "Hsinchu", "Bengaluru"],
    avgSalary: "$175k - $260k",
    description: "Architect and implement highly optimized CUDA algorithms, libraries (cuBLAS, cuDNN), and parallel programming primitives.",
    difficulty: "Very Hard",
    prepTime: "8-10 Weeks",
    demand: "Very High",
    interviewStages: ["Resume Screening", "Online Assessment", "Technical 1", "Technical 2", "Behavioral"],
    requiredSkills: ["CUDA", "Parallel Algorithms", "C++", "GPU Memory Architecture", "Performance Tuning"]
  },
  {
    _id: "nv_role_6",
    roleName: "GPU Software Engineer",
    department: "Graphics & Compute Drivers",
    level: "IC3 - IC5",
    locations: ["Santa Clara", "Bristol", "Taipei"],
    avgSalary: "$160k - $235k",
    description: "Design and develop display and compute graphics drivers. Optimize Vulkan, DirectX, and OpenGL stacks for Linux and Windows.",
    difficulty: "Very Hard",
    prepTime: "8-12 Weeks",
    demand: "High",
    interviewStages: ["Resume Screening", "Online Assessment", "Technical 1", "Technical 2", "Behavioral"],
    requiredSkills: ["C++", "Graphics APIs (Vulkan/DX)", "Kernel Drivers", "OS Internals", "Debugging"]
  },
  {
    _id: "nv_role_7",
    roleName: "Backend Engineer",
    department: "GeForce NOW Infrastructure",
    level: "IC3 - IC5",
    locations: ["Santa Clara", "Bengaluru", "Remote"],
    avgSalary: "$145k - $215k",
    description: "Build robust, low-latency APIs and orchestration layers that power NVIDIA's GeForce NOW cloud gaming platform.",
    difficulty: "Medium",
    prepTime: "4-6 Weeks",
    demand: "High",
    interviewStages: ["Resume Screening", "Online Assessment", "Technical 1", "Technical 2", "Behavioral"],
    requiredSkills: ["Go", "Java", "Kubernetes", "Microservices", "System Design"]
  },
  {
    _id: "nv_role_8",
    roleName: "Full Stack Engineer",
    department: "NVIDIA Developer Portal",
    level: "IC3 - IC4",
    locations: ["Santa Clara", "Bengaluru"],
    avgSalary: "$130k - $190k",
    description: "Develop the frontend portals and backend microservices that enable millions of CUDA developer to download libraries and track telemetry.",
    difficulty: "Medium",
    prepTime: "4-6 Weeks",
    demand: "Medium",
    interviewStages: ["Resume Screening", "Online Assessment", "Technical 1", "Behavioral"],
    requiredSkills: ["React", "Node.js", "TypeScript", "Tailwind CSS", "SQL"]
  },
  {
    _id: "nv_role_9",
    roleName: "Embedded Software Engineer",
    department: "Jetson & Robotics stack",
    level: "IC3 - IC5",
    locations: ["Santa Clara", "Tokyo", "Bengaluru"],
    avgSalary: "$150k - $225k",
    description: "Develop firmware, bootloaders, and board-support packages (BSP) for NVIDIA Jetson modules and embedded systems.",
    difficulty: "Hard",
    prepTime: "6-8 Weeks",
    demand: "High",
    interviewStages: ["Resume Screening", "Online Assessment", "Technical 1", "Technical 2", "Behavioral"],
    requiredSkills: ["Embedded C/C++", "RTOS", "Device Drivers", "Hardware Debugging", "ARM Architecture"]
  },
  {
    _id: "nv_role_10",
    roleName: "Computer Vision Engineer",
    department: "NVIDIA DRIVE",
    level: "IC3 - IC5",
    locations: ["Santa Clara", "Munich", "Seoul"],
    avgSalary: "$155k - $235k",
    description: "Build algorithms for object tracking, lane detection, and sensor fusion using deep learning and classical geometry for autonomous vehicles.",
    difficulty: "Hard",
    prepTime: "6-8 Weeks",
    demand: "High",
    interviewStages: ["Resume Screening", "Online Assessment", "Technical 1", "Technical 2", "Behavioral"],
    requiredSkills: ["OpenCV", "Python/C++", "Convolutional Neural Networks", "3D Geometry", "Model Optimization"]
  },
  {
    _id: "nv_role_11",
    roleName: "Deep Learning Engineer",
    department: "Research & Core AI",
    level: "IC4 - IC6",
    locations: ["Santa Clara", "Toronto", "Beijing"],
    avgSalary: "$180k - $275k",
    description: "Innovate and optimize the architecture of future models, working on training algorithms that leverage custom hardware constraints efficiently.",
    difficulty: "Very Hard",
    prepTime: "8-12 Weeks",
    demand: "Very High",
    interviewStages: ["Resume Screening", "Online Assessment", "Technical 1", "Technical 2", "Behavioral"],
    requiredSkills: ["ML Frameworks", "High Performance computing", "Custom CUDA Kernels", "Model Compression"]
  }
];

const NVIDIA_PIPELINE = [
  { id: 'resume', name: 'Resume Screening', icon: FaBriefcase, duration: '24-48 Hours', category: 'screening' },
  { id: 'oa', name: 'Online Assessment', icon: FaLaptopCode, duration: '90 Mins', category: 'coding' },
  { id: 'tech1', name: 'Technical Interview 1', icon: FaCode, duration: '45 Mins', category: 'technical' },
  { id: 'tech2', name: 'Technical Interview 2', icon: FaMicrochip, duration: '45 Mins', category: 'technical' },
  { id: 'behavioral', name: 'Behavioral / Values', icon: FaUsers, duration: '45 Mins', category: 'hr' }
];

const NVIDIA_OA_QUESTIONS = [
  {
    id: 'nv_oa_1',
    title: 'Parallel Reduction Sum Simulation',
    difficulty: 'Medium',
    timeLimit: '45 mins',
    description: `Write a simulation for a basic parallel reduction sum algorithm.
Given an array of integers representing core loads, reduce them to a single sum.
In GPU computing, this is done in tree-like parallel steps.
Write a function that calculates the sum of elements, but simulates the memory-coalesced access pattern by performing in-place reductions (each step sums indices offset by a stride that reduces by half).
Return the final reduced value at index 0.`,
    examples: [
      { input: 'arr = [1, 2, 3, 4, 5, 6, 7, 8]', output: '36', explanation: 'Tree reductions sum adjacent offsets iteratively.' }
    ],
    testCases: [
      { input: '[1, 2, 3, 4]', output: '10' },
      { input: '[10, 20, 30, 40]', output: '100' }
    ],
    constraints: ['Length of array is always a power of 2.', '1 <= arr.length <= 1024']
  }
];

const NVIDIA_TECH_QUESTIONS = {
  tech1: {
    title: 'GPU Cache Conscious Transpose Optimization',
    difficulty: 'Hard',
    companies: ['NVIDIA'],
    acceptanceRate: '34.5%',
    tags: ['Matrix', 'Cache Locality', 'Optimization'],
    description: `Given a square matrix of size N x N, optimize the matrix transpose operation to minimize cache misses.
In normal transpose, reading row-by-row and writing column-by-column causes non-sequential writes, leading to TLB and L1/L2 cache misses.
Write a program that uses block-level transposing (tiling) to load a block into local memory or registers before writing to the target.
Choose an optimal block size B and transpose in tile chunks.`,
    examples: [
      { input: 'matrix = [[1, 2], [3, 4]], B = 2', output: '[[1, 3], [2, 4]]' }
    ],
    constraints: ['N is a power of 2.', '2 <= N <= 2048', 'Block size B can be 2, 4, 8, 16 or 32.'],
    expectedComplexity: 'Time: O(N^2) with optimal cache reuse, Space: O(1)'
  },
  tech2: {
    title: 'CUDA Thread Shared Memory Alignment & Warp Divergence',
    difficulty: 'Hard',
    companies: ['NVIDIA'],
    acceptanceRate: '28.1%',
    tags: ['CUDA Stack', 'Concurrency', 'Parallel Programming'],
    description: `In CUDA programming, warp divergence occurs when threads in a single warp (32 threads) execute different branch paths.
You are given a list of threads and their active conditionals. Determine if warp divergence occurs.
Also, analyze a shared memory layout of size M where threads write with stride S. Check if memory bank conflicts occur. (There are 32 memory banks; a conflict occurs when multiple threads in a warp access different addresses in the same bank).`,
    examples: [
      { input: 'threadsConditions = [true, true, false, false], M = 32, S = 2', output: 'Warp Divergence: Yes, Bank Conflicts: Yes' }
    ],
    constraints: ['Warp size = 32', 'Number of banks = 32'],
    expectedComplexity: 'Time: O(Threads), Space: O(1)'
  }
};

const NvidiaPrepDetail = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  
  const [company, setCompany] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedRoleData, setSelectedRoleData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [simulationRounds, setSimulationRounds] = useState([]);
  
  const [simState, setSimState] = useState({
    attemptId: null,
    currentRoundIndex: 0,
    scores: {},
    roundDetails: {},
    finalReport: null
  });

  const [activeRoundSim, setActiveRoundSim] = useState(null); 

  // Resume Simulation States
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);

  // OA Simulation States
  const [oaLanguage, setOaLanguage] = useState('cpp');
  const [currentOaQuestion, setCurrentOaQuestion] = useState(NVIDIA_OA_QUESTIONS[0]);
  const [activeOaTab, setActiveOaTab] = useState('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcase');
  const [consoleExpanded, setConsoleExpanded] = useState(true);
  const [oaCode, setOaCode] = useState('');
  const [oaTimeLeft, setOaTimeLeft] = useState(5400); // 90 mins
  const [oaWarningCount, setOaWarningCount] = useState(0);
  const [oaSubmitting, setOaSubmitting] = useState(false);
  const [oaRunLoading, setOaRunLoading] = useState(false);
  const [oaRunResult, setOaRunResult] = useState(null);
  const [oaTestCases, setOaTestCases] = useState([]);
  const [oaResult, setOaResult] = useState(null);

  // Technical Interview States
  const [interviewId, setInterviewId] = useState(null);
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [userResponseText, setUserResponseText] = useState('');
  
  const [whiteboardActiveTab, setWhiteboardActiveTab] = useState('Approach');
  const [whiteboardData, setWhiteboardData] = useState({
    'Approach': '// Explain your high-level parallel optimization approach here...\n',
    'Pseudo Code': '// Write some C++/CUDA pseudo code...\n',
    'Edge Cases': '// List hardware edge cases (divergences, conflicts)...\n',
    'Complexity': '// Complexity analysis and memory bounds...\n'
  });
  
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorMinimap, setEditorMinimap] = useState(false);
  const [interviewCode, setInterviewCode] = useState('// NVIDIA GPU Computing Environment\n#include <cuda_runtime.h>\n\n');
  const [techLanguage, setTechLanguage] = useState('cpp');
  
  const [terminalActiveTab, setTerminalActiveTab] = useState('Console');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [terminalMetrics, setTerminalMetrics] = useState(null);
  const [terminalCustomInput, setTerminalCustomInput] = useState('');

  const [liveEvaluation, setLiveEvaluation] = useState({
    problemSolving: 50,
    communication: 50,
    codeQuality: 50,
    optimization: 50
  });

  const [interviewLoading, setInterviewLoading] = useState(false);
  const [currentTechProblem, setCurrentTechProblem] = useState(null);

  // System/Hardware Design States
  const [sysDesignActiveTab, setSysDesignActiveTab] = useState('Architecture');
  const [sysDesignData, setSysDesignData] = useState({
    'Architecture': '// Draw cache design or describe SM (Streaming Multiprocessor) allocation...\n// Example: Grid -> Blocks -> Warps -> Threads & Shared Memory config\n',
    'Database': '// High Performance DB / Memory alignment, PCIe bandwidth, unified memory...\n',
    'API Design': '// CUDA Kernel parameters & custom driver APIs...\n',
    'Tradeoffs': '// Memory Bandwidth latency vs SM Compute capacity...\n'
  });

  // Behavioral / HR States
  const [hrCurrentQuestion, setHrCurrentQuestion] = useState('NVIDIA works at extreme speed and execution intensity. Tell me about a time you owned a major challenge and took quick action with minimal guidance.');
  const [starAnalysis, setStarAnalysis] = useState(null);
  
  // Dashboard / Final Result States
  const [showFinalReport, setShowFinalReport] = useState(false);

  // Initial Load & Animations
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/prep/companies/NVIDIA');
        const fetchedCompany = res.data.company;
        setCompany(fetchedCompany);
        
        const dbRoles = res.data.roles || [];
        const mergedRoles = NVIDIA_ROLES.map(hr => {
          const matchingDbRole = dbRoles.find(dr => dr.roleName.toLowerCase() === hr.roleName.toLowerCase());
          return {
            ...hr,
            _id: matchingDbRole ? matchingDbRole._id : hr._id
          };
        });
        setRoles(mergedRoles);
        
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role');
        if (roleParam) {
          const targetRole = mergedRoles.find(r => r.roleName === decodeURIComponent(roleParam));
          if (targetRole) {
            setSelectedRoleData(targetRole);
            setSimulationRounds(NVIDIA_PIPELINE);
            
            try {
              const resAttempt = await api.post('/prep/attempt', { companyId: fetchedCompany._id, roleId: targetRole._id });
              setSimState({
                attemptId: resAttempt.data._id,
                currentRoundIndex: resAttempt.data.currentRoundIndex || 0,
                scores: resAttempt.data.scores || {},
                roundDetails: resAttempt.data.roundDetails || {},
                finalReport: resAttempt.data.finalReport || null
              });
            } catch (attemptErr) {
              console.error('Attempt API failed', attemptErr);
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load Nvidia details', err);
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  // GSAP Entrance
  useEffect(() => {
    if (!loading && heroRef.current) {
      gsap.fromTo(heroRef.current, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [loading]);

  // Timers for OA
  useEffect(() => {
    let timer = null;
    if (activeRoundSim?.category === 'coding' && oaTimeLeft > 0) {
      timer = setInterval(() => {
        setOaTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (oaTimeLeft === 0 && activeRoundSim?.category === 'coding') {
      handleSubmitOA();
    }
    return () => clearInterval(timer);
  }, [activeRoundSim, oaTimeLeft]);

  // Format Time Helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRoleSelect = async (role) => {
    setSelectedRoleData(role);
    setSimulationRounds(NVIDIA_PIPELINE);
    
    // Save to localStorage as a fallback
    localStorage.setItem(`last_role_${company?.name || 'NVIDIA'}`, role.roleName);
    
    try {
      const resAttempt = await api.post('/prep/attempt', { 
        companyId: company?._id || '500000000000000000000005', 
        roleId: role._id 
      });
      setSimState({
        attemptId: resAttempt.data._id,
        currentRoundIndex: resAttempt.data.currentRoundIndex || 0,
        scores: resAttempt.data.scores || {},
        roundDetails: resAttempt.data.roundDetails || {},
        finalReport: resAttempt.data.finalReport || null
      });
    } catch (err) {
      console.error('Failed to initialize simulation attempt', err);
      // Mock initialization on error for offline reliability
      setSimState({
        attemptId: 'mock_attempt_id_' + Date.now(),
        currentRoundIndex: 0,
        scores: {},
        roundDetails: {},
        finalReport: null
      });
    }
  };

  const startRoundSimulation = (round) => {
    if (round.id === 'tech1') {
      setCurrentTechProblem(NVIDIA_TECH_QUESTIONS.tech1);
      setInterviewMessages([{ 
        sender: 'ai', 
        text: "Hi! Ready to optimize GPU transpose operations? In low-level graphics and high-performance computing, cache thrashing can ruin speedups. Let's see how you optimize matrix transpose using tiling.", 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    } else if (round.id === 'tech2') {
      setCurrentTechProblem(NVIDIA_TECH_QUESTIONS.tech2);
      setInterviewMessages([{ 
        sender: 'ai', 
        text: "Hello! In Technical Interview 2, we will look at complex GPU concurrency, kernel warp execution paths, and memory coalescing bank conflicts. Let's start with thread bank conflicts.", 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    } else if (round.id === 'behavioral') {
      setInterviewMessages([{ 
        sender: 'ai', 
        text: "Welcome to the Behavioral round. At NVIDIA, we prioritize execution speed, deep ownership, and intellectual honesty. " + hrCurrentQuestion, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    }
    
    setActiveRoundSim({ 
      roundName: round.name, 
      roundIndex: simulationRounds.indexOf(round), 
      category: round.category, 
      id: round.id 
    });
  };

  // Resume Upload Simulation
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setResumeText(file.name);
    }
  };

  const handleRunResumeAnalysis = () => {
    setAnalyzingResume(true);
    setTimeout(() => {
      setAnalyzingResume(false);
      setResumeResult({
        score: 84,
        matchRate: '88%',
        strengths: ['Strong background in C/C++', 'Understands parallel paradigms (pthreads, OpenMP)', 'Experience in computer architecture basics'],
        recommendations: ['Add CUDA projects', 'Include memory-coalescing experiments', 'Add dynamic driver integration experience']
      });
      toast.success("ATS Analysis completed!");
    }, 2000);
  };

  const handleFinishResumeRound = async () => {
    try {
      if (simState.attemptId) {
        await api.post(`/prep/attempt/${simState.attemptId}/submit`, {
          roundIndex: 0,
          score: 84,
          passed: true,
          details: { resumeName: resumeFile?.name || 'Uploaded_Resume.pdf', result: resumeResult }
        });
      }
      setSimState(prev => ({
        ...prev,
        currentRoundIndex: 1
      }));
      setActiveRoundSim(null);
      toast.success("Round 1 completed successfully!");
    } catch (err) {
      console.error(err);
      setSimState(prev => ({ ...prev, currentRoundIndex: 1 }));
      setActiveRoundSim(null);
    }
  };

  // OA Compiler simulation
  const handleRunOACode = () => {
    setOaRunLoading(true);
    setTimeout(() => {
      setOaRunLoading(false);
      setOaRunResult({
        passed: true,
        output: 'Reduced sum: 36\nAll checks passed in 0.04 ms\nMemory footprint: 1.2 MB'
      });
      toast.success("Code compiled & ran successfully!");
    }, 1500);
  };

  const handleSubmitOA = async () => {
    setOaSubmitting(true);
    setTimeout(async () => {
      setOaSubmitting(false);
      try {
        if (simState.attemptId) {
          await api.post(`/prep/attempt/${simState.attemptId}/submit`, {
            roundIndex: 1,
            score: 90,
            passed: true,
            details: { language: oaLanguage, code: oaCode, score: 90 }
          });
        }
        setSimState(prev => ({ ...prev, currentRoundIndex: 2 }));
        setActiveRoundSim(null);
        toast.success("Online Assessment submitted successfully!");
      } catch (err) {
        console.error(err);
        setSimState(prev => ({ ...prev, currentRoundIndex: 2 }));
        setActiveRoundSim(null);
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#070b11] items-center justify-center">
        <div className={`w-12 h-12 border-4 border-white/10 border-t-[${NV_GREEN}] rounded-full animate-spin`}></div>
      </div>
    );
  }

  const activeRound = simulationRounds[simState.currentRoundIndex];

  return (
    <div className="flex min-h-screen bg-[#04080e] text-slate-100 overflow-x-hidden font-sans">
      {/* Background radial highlights */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.05] blur-[120px]" style={{ backgroundColor: NV_GREEN }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.05] blur-[120px]" style={{ backgroundColor: NV_GREEN }}></div>
      </div>

      <Sidebar />

      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="NVIDIA Hiring Simulation" />

        {/* Dynamic header separator line */}
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-[#76b900]/50 to-transparent" />

        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <div className="mx-auto max-w-7xl space-y-6">

            {/* Back Button */}
            {(selectedRoleData || activeRoundSim) && (
              <button 
                onClick={() => {
                  if (activeRoundSim) {
                    if (window.confirm("Are you sure you want to exit the current round? Your progress will not be saved.")) {
                      setActiveRoundSim(null);
                    }
                  } else {
                    setSelectedRoleData(null);
                    setShowFinalReport(false);
                  }
                }} 
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <FaArrowLeft /> Back to {activeRoundSim ? 'Role Pipeline' : 'Role Directory'}
              </button>
            )}

            {/* MAIN DIRECTORY VIEW */}
            {!selectedRoleData && (
              <div className="space-y-8" ref={heroRef}>
                {/* NVIDIA Top Hero Section */}
                <div className="bg-gradient-to-br from-[#0c1524] to-[#060a12] border border-white/5 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-10">
                  <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] blur-3xl pointer-events-none rounded-full" style={{ backgroundColor: NV_GREEN }}></div>
                  <div className="w-28 h-28 rounded-2xl bg-black border border-white/10 p-4 flex items-center justify-center shrink-0 shadow-lg">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg" alt="NVIDIA Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="space-y-4 flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#76b900]/10 border border-[#76b900]/25 text-[#76b900] text-xs font-semibold">
                      <FaMicrochip /> NVIDIA University Hiring
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">NVIDIA Recruitment Platform</h1>
                    <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                      Scale the GPU-driven AI revolution. Prepare for software architecture, CUDA parallelism, system design benchmarks, and behavioral growth mindsets.
                    </p>
                  </div>
                  
                  {/* Stats columns */}
                  <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-10">
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">Difficulty</div>
                      <div className="text-sm font-black text-red-500 font-mono mt-1">Hard</div>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">Average CTC</div>
                      <div className="text-sm font-black text-[#76b900] font-mono mt-1">22-45 LPA</div>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">Selection Rate</div>
                      <div className="text-sm font-black text-slate-100 font-mono mt-1">2.5%</div>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">Est. Preparation</div>
                      <div className="text-sm font-black text-slate-100 font-mono mt-1">4-6 Weeks</div>
                    </div>
                  </div>
                </div>

                {/* About NVIDIA Ecosystem Highlights */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-wide">ABOUT NVIDIA</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: "CUDA Parallel Computing", desc: "Accelerating compute-intensive tasks across thousands of SIMD threads simultaneously." },
                      { title: "AI & Deep Learning", desc: "Building TensorRT and DGX stacks that power the global AI foundation models." },
                      { title: "High Performance Computing", desc: "Scaling networks via InfiniBand and designing chip interconnect solutions." },
                      { title: "Graphics Technology", desc: "Pioneering real-time ray tracing (RTX), DLSS, and GPU driver reliability." }
                    ].map(item => (
                      <div key={item.title} className="p-5 rounded-2xl bg-[#0c1524] border border-white/5 shadow-md space-y-2 hover:border-[#76b900]/20 transition-colors">
                        <h4 className="text-sm font-extrabold text-[#76b900]">{item.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role list */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-white">Available Careers & Roles</h2>
                      <p className="text-xs text-slate-500 mt-1">Select an active track to launch your customized interview preparation track.</p>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search roles..." 
                      className="bg-[#0c1524] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#76b900]/50 text-white w-full sm:w-64 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.filter(r => r.roleName.toLowerCase().includes(searchQuery.toLowerCase())).map((role) => (
                      <motion.div 
                        key={role._id} 
                        whileHover={{ y: -4 }}
                        className="bg-[#0c1524] border border-white/5 hover:border-[#76b900]/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 group cursor-pointer"
                        onClick={() => handleRoleSelect(role)}
                      >
                        {/* Glow on hover */}
                        <div className="absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${NV_GREEN}, transparent)` }}></div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{role.department}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#76b900]/10 text-[#76b900] border border-[#76b900]/20 font-mono">{role.level}</span>
                          </div>
                          <h3 className="text-base font-extrabold text-white leading-tight group-hover:text-[#76b900] transition-colors">{role.roleName}</h3>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{role.description}</p>
                        </div>

                        <div className="border-t border-white/5 mt-5 pt-4 space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                            <div>
                              <span>Salary Avg:</span>
                              <strong className="block text-slate-300 font-mono mt-0.5">{role.avgSalary}</strong>
                            </div>
                            <div>
                              <span>Prep Time:</span>
                              <strong className="block text-slate-300 mt-0.5">{role.prepTime}</strong>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {role.requiredSkills.map(skill => (
                              <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/5 text-slate-400">{skill}</span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVE ROLE SIMULATION STATE */}
            {selectedRoleData && (
              <div>
                {/* Simulation Pipeline Screen */}
                {!activeRoundSim && !showFinalReport ? (
                   <div className="space-y-8 animate-fade-in-up">
                     {/* Role Details Overview */}
                     <div className="bg-[#0c1524] border border-[#76b900]/20 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-72 h-72 opacity-[0.03] blur-3xl pointer-events-none rounded-full" style={{ backgroundColor: NV_GREEN }}></div>
                       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                         <div className="space-y-2">
                           <span className="text-xs font-bold text-[#76b900] uppercase tracking-widest">{selectedRoleData.department} Track</span>
                           <h1 className="text-3xl font-black text-white">{selectedRoleData.roleName} Hiring Simulation</h1>
                           <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">{selectedRoleData.description}</p>
                         </div>
                         <div className="flex items-center gap-3">
                           <div className="text-right">
                             <div className="text-xs text-slate-500">Expected Readiness</div>
                             <div className="text-xl font-black text-[#76b900] font-mono mt-0.5">85%</div>
                           </div>
                         </div>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 mt-8 pt-8 text-center md:text-left">
                         <div>
                           <div className="text-xs text-slate-500">Difficulty</div>
                           <div className="text-sm font-extrabold text-red-500 mt-1">{selectedRoleData.difficulty}</div>
                         </div>
                         <div>
                           <div className="text-xs text-slate-500">Estimated Prep Time</div>
                           <div className="text-sm font-extrabold text-white mt-1">{selectedRoleData.prepTime}</div>
                         </div>
                         <div>
                           <div className="text-xs text-slate-500">Average Compensation</div>
                           <div className="text-sm font-extrabold text-white mt-1">{selectedRoleData.avgSalary}</div>
                         </div>
                         <div>
                           <div className="text-xs text-slate-500">Locations</div>
                           <div className="text-sm font-extrabold text-white truncate mt-1">{selectedRoleData.locations.join(', ')}</div>
                         </div>
                       </div>
                     </div>

                     {/* Pipeline Timeline UI */}
                     <div className="space-y-4">
                       <h3 className="text-lg font-bold text-white tracking-wide">Recruitment Pipeline Stages</h3>
                       <div className="relative">
                         {/* Timeline Connector Line */}
                         <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0 hidden lg:block"></div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
                           {simulationRounds.map((round, idx) => {
                             const isCompleted = idx < simState.currentRoundIndex;
                             const isActive = idx === simState.currentRoundIndex;
                             const isLocked = idx > simState.currentRoundIndex;
                             const RoundIcon = round.icon;
                             
                             return (
                               <div 
                                 key={round.id} 
                                 className={`p-6 rounded-2xl border text-center flex flex-col justify-between items-center min-h-[220px] transition-all duration-300 ${
                                   isActive 
                                     ? `bg-gradient-to-b from-[#122212] to-[#0c1524] border-[${NV_GREEN}]/60 shadow-lg shadow-[${NV_GREEN}]/5` 
                                     : isCompleted 
                                       ? 'bg-[#0c1524] border-emerald-500/30' 
                                       : 'bg-white/[0.01] border-white/5 opacity-50'
                                 }`}
                               >
                                 <div className="space-y-4 flex flex-col items-center">
                                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                     isActive 
                                       ? `bg-[${NV_GREEN}]/20 text-[${NV_GREEN}]` 
                                       : isCompleted 
                                         ? 'bg-emerald-500/20 text-emerald-400' 
                                         : 'bg-white/5 text-slate-500'
                                   }`}>
                                     {isCompleted ? <FaCheckCircle className="text-2xl" /> : <RoundIcon className="text-xl" />}
                                   </div>
                                   
                                   <div>
                                     <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Stage {idx + 1}</div>
                                     <h4 className="text-sm font-extrabold text-white leading-tight">{round.name}</h4>
                                     <p className="text-[11px] text-slate-400 mt-1">{round.duration}</p>
                                   </div>
                                 </div>

                                 <div className="w-full mt-4">
                                   {isActive ? (
                                     <button 
                                       onClick={() => startRoundSimulation(round)}
                                       className="w-full bg-[#76b900] hover:bg-[#6da100] text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-[#76b900]/20 transition-all cursor-pointer"
                                     >
                                       Start Round
                                     </button>
                                   ) : isCompleted ? (
                                     <span className="text-xs text-emerald-400 font-semibold block py-2">Completed ✓</span>
                                   ) : (
                                     <span className="text-xs text-slate-500 flex items-center justify-center gap-1.5 py-2">
                                       <FaLock className="text-[10px]" /> Locked
                                     </span>
                                   )}
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     </div>
                   </div>
                ) : (
                   <div className="animate-fade-in h-[calc(100vh-140px)] flex flex-col">
                     {activeRoundSim?.category === 'screening' && (
                        <div className="flex-1 bg-[#0c1524] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                          <FaBriefcase className="text-6xl text-[#76b900] mb-6" />
                          <h2 className="text-2xl font-bold text-white mb-2">Resume Screening</h2>
                          <p className="text-slate-400 max-w-md mb-8">NVIDIA ATS Parser parses qualifications against CUDA and Systems expectations.</p>
                          
                          {!resumeResult ? (
                            <div className="space-y-4">
                              <label className="border-2 border-dashed border-white/10 hover:border-[#76b900]/50 rounded-xl px-10 py-8 flex flex-col items-center gap-3 cursor-pointer bg-black/10 transition-all">
                                <FaUpload className="text-3xl text-slate-400" />
                                <span className="text-sm font-semibold text-slate-300">{resumeFile ? resumeFile.name : 'Select Resume PDF (CUDA details)'}</span>
                                <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} />
                              </label>
                              {resumeFile && (
                                <button onClick={handleRunResumeAnalysis} disabled={analyzingResume} className="bg-[#76b900] hover:bg-[#6da100] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#76b900]/20 transition-colors w-full cursor-pointer">
                                  {analyzingResume ? 'Analyzing ATS Alignment...' : 'Verify ATS Score'}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-6 max-w-xl text-left bg-black/35 border border-white/5 p-6 rounded-2xl">
                              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h3 className="text-base font-bold text-white">Analysis Result</h3>
                                <span className="text-lg font-black text-[#76b900]">{resumeResult.score}% Compatibility</span>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Matched Strengths</h4>
                                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                                    {resumeResult.strengths.map((str, i) => <li key={i}>{str}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-1.5">Recommended Enhancements</h4>
                                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                                    {resumeResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                                  </ul>
                                </div>
                              </div>
                              <button onClick={handleFinishResumeRound} className="bg-[#76b900] hover:bg-[#6da100] text-white px-8 py-3 rounded-xl font-bold shadow-lg w-full transition-colors cursor-pointer">
                                Proceed to Stage 2
                              </button>
                            </div>
                          )}
                        </div>
                     )}
                     
                     {activeRoundSim?.category === 'coding' && (
                        <div className="flex-1 flex flex-col border border-white/10 rounded-2xl overflow-hidden bg-[#0c1524]">
                          {/* OA Header */}
                          <div className="h-14 bg-[#121c2c] border-b border-white/10 flex items-center justify-between px-6">
                            <div className="flex items-center gap-3">
                              <h3 className="text-sm font-bold text-white">{activeRoundSim.roundName}</h3>
                              <span className="bg-[#76b900]/25 text-[#76b900] text-xs px-2.5 py-0.5 rounded font-mono font-bold flex items-center gap-1.5">
                                <FaClock /> {formatTime(oaTimeLeft)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <select 
                                className="bg-[#050b14] text-xs text-slate-300 border border-white/10 rounded-lg px-2 py-1 outline-none"
                                value={oaLanguage}
                                onChange={(e) => setOaLanguage(e.target.value)}
                              >
                                <option value="cpp">C++</option>
                                <option value="c">C</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="javascript">JavaScript</option>
                                <option value="go">Go</option>
                              </select>
                            </div>
                          </div>

                          {/* Split Editor Pane */}
                          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Left Pane: Question */}
                            <div className="w-full lg:w-[450px] border-r border-white/10 overflow-y-auto p-6 space-y-6 no-scrollbar bg-[#050b14]/50">
                              <div className="space-y-2">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  currentOaQuestion.difficulty === 'Hard' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                }`}>{currentOaQuestion.difficulty}</span>
                                <h2 className="text-lg font-bold text-white">{currentOaQuestion.title}</h2>
                                <p className="text-xs text-slate-500">Max Time Limit: {currentOaQuestion.timeLimit}</p>
                              </div>

                              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {currentOaQuestion.description}
                              </div>

                              <div className="space-y-4">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Examples</h4>
                                {currentOaQuestion.examples.map((ex, idx) => (
                                  <div key={idx} className="bg-black/20 p-3 rounded-lg border border-white/5 text-xs font-mono">
                                    <div className="text-slate-400">Input: {ex.input}</div>
                                    <div className="text-[#76b900] mt-1">Output: {ex.output}</div>
                                    {ex.explanation && <div className="text-slate-500 mt-1 text-[10px]">{ex.explanation}</div>}
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-2 border-t border-white/5 pt-4">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Constraints</h4>
                                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                                  {currentOaQuestion.constraints.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                              </div>
                            </div>

                            {/* Right Pane: Code Editor */}
                            <div className="flex-1 flex flex-col overflow-hidden bg-black/40">
                              <div className="flex-1 relative">
                                <Editor 
                                  height="100%"
                                  language={oaLanguage === 'cpp' ? 'cpp' : oaLanguage}
                                  theme="vs-dark"
                                  value={oaCode || `// Simulating parallel reduction algorithm\nint performReduction(vector<int>& arr) {\n    // Write your code here\n}`}
                                  onChange={(val) => setOaCode(val)}
                                  options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    lineNumbers: 'on',
                                    automaticLayout: true
                                  }}
                                />
                              </div>

                              {/* Console / Output Drawer */}
                              <div className="h-44 border-t border-white/10 flex flex-col bg-[#050b14]">
                                <div className="h-10 bg-[#121c2c] border-b border-white/10 flex items-center justify-between px-4">
                                  <div className="flex gap-2">
                                    <button 
                                      className={`px-3 py-1.5 text-xs font-semibold rounded ${activeConsoleTab === 'testcase' ? 'bg-[#76b900]/20 text-[#76b900]' : 'text-slate-400'}`}
                                      onClick={() => setActiveConsoleTab('testcase')}
                                    >
                                      Test Cases
                                    </button>
                                    <button 
                                      className={`px-3 py-1.5 text-xs font-semibold rounded ${activeConsoleTab === 'output' ? 'bg-[#76b900]/20 text-[#76b900]' : 'text-slate-400'}`}
                                      onClick={() => setActiveConsoleTab('output')}
                                    >
                                      Console Result
                                    </button>
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={handleRunOACode} disabled={oaRunLoading} className="bg-white/10 hover:bg-white/20 text-white px-4 py-1 rounded text-xs transition-colors cursor-pointer">
                                      {oaRunLoading ? 'Running...' : 'Run Code'}
                                    </button>
                                    <button onClick={handleSubmitOA} disabled={oaSubmitting} className="bg-[#76b900] hover:bg-[#6da100] text-white px-4 py-1 rounded text-xs font-bold transition-colors cursor-pointer">
                                      {oaSubmitting ? 'Submitting...' : 'Submit OA'}
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
                                  {activeConsoleTab === 'testcase' ? (
                                    <div className="space-y-2">
                                      {currentOaQuestion.testCases.map((tc, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-black/10 p-2 rounded border border-white/5">
                                          <span className="text-slate-400">Case {idx+1}: {tc.input}</span>
                                          <span className="text-slate-500 font-bold">Expected: {tc.output}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-slate-300 whitespace-pre-wrap">
                                      {oaRunResult ? oaRunResult.output : '> Run code to view terminal optimization results.'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                     )}

                     {activeRoundSim?.category === 'technical' && (
                        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                          {/* Col 1: Video & Live Evaluation */}
                          <div className="w-full lg:w-[280px] flex flex-col gap-4">
                            <div className="bg-[#0c1524] border border-white/10 rounded-2xl p-4 space-y-4">
                              <div className="aspect-video bg-black/35 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                                <FaRobot className="text-4xl text-[#76b900]/40" />
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white backdrop-blur flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> NVIDIA Interviewer
                                </div>
                              </div>
                              
                              <div className="aspect-video bg-black/35 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                                <FaUserTie className="text-4xl text-slate-700" />
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white backdrop-blur">
                                  Candidate Video (Self)
                                </div>
                              </div>
                            </div>
                            
                            {/* Live Evaluation Scores */}
                            <div className="bg-[#0c1524] border border-[#76b900]/20 rounded-2xl p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Live Performance metrics</h4>
                                <div className="space-y-3">
                                  {[
                                    { name: 'Problem Solving', score: liveEvaluation.problemSolving },
                                    { name: 'Communication', score: liveEvaluation.communication },
                                    { name: 'Code Quality', score: liveEvaluation.codeQuality },
                                    { name: 'Optimizations', score: liveEvaluation.optimization }
                                  ].map(item => (
                                    <div key={item.name} className="space-y-1">
                                      <div className="flex justify-between text-[10px] text-slate-400">
                                        <span>{item.name}</span>
                                        <span>{item.score}%</span>
                                      </div>
                                      <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.score}%`, backgroundColor: NV_GREEN }}></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="border-t border-white/5 pt-3 mt-3">
                                <div className="text-[10px] text-slate-500">Live Transcript:</div>
                                <p className="text-[11px] text-slate-400 leading-relaxed italic mt-1 font-mono">
                                  "Optimizing memory tiling dimensions directly maps thread warps efficiently onto GPU compute memory structures..."
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Problem Details & Whiteboard */}
                          <div className="w-full lg:w-[450px] flex flex-col gap-4 overflow-hidden">
                            {/* Problem */}
                            <div className="bg-[#0c1524] border border-white/10 rounded-2xl p-5 overflow-y-auto max-h-[300px] lg:max-h-[50%] no-scrollbar space-y-4">
                              {currentTechProblem && (
                                <>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">{currentTechProblem.difficulty}</span>
                                      <span className="text-[10px] text-slate-400">Acceptance: {currentTechProblem.acceptanceRate}</span>
                                    </div>
                                    <h3 className="text-base font-bold text-white">{currentTechProblem.title}</h3>
                                  </div>
                                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{currentTechProblem.description}</p>
                                  <div className="text-[11px] text-slate-400 font-mono">
                                    <strong>Complexity Expected:</strong> {currentTechProblem.expectedComplexity}
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {/* Whiteboard */}
                            <div className="flex-1 bg-[#0c1524] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                              <div className="h-10 bg-[#121c2c] border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                                <div className="flex gap-2">
                                  {['Approach', 'Pseudo Code', 'Edge Cases', 'Complexity'].map(tab => (
                                    <button 
                                      key={tab} 
                                      className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${whiteboardActiveTab === tab ? 'bg-[#76b900]/20 text-[#76b900]' : 'text-slate-400'}`}
                                      onClick={() => setWhiteboardActiveTab(tab)}
                                    >
                                      {tab}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <textarea 
                                className="flex-1 bg-[#050b14] text-xs font-mono text-slate-300 p-4 outline-none border-none resize-none"
                                value={whiteboardData[whiteboardActiveTab]}
                                onChange={(e) => setWhiteboardData({...whiteboardData, [whiteboardActiveTab]: e.target.value})}
                              />
                            </div>
                          </div>

                          {/* Col 3: Monaco Editor & Console */}
                          <div className="flex-1 bg-[#0c1524] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                            <div className="h-12 bg-[#121c2c] border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-300 font-bold">Interactive Editor</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 text-slate-400 hover:text-white" onClick={() => setEditorMinimap(!editorMinimap)} title="Toggle Minimap"><FaSlidersH className="text-xs" /></button>
                              </div>
                            </div>
                            
                            <div className="flex-1 relative bg-black/20">
                              <Editor 
                                height="100%"
                                language={techLanguage === 'cpp' ? 'cpp' : techLanguage}
                                theme="vs-dark"
                                value={interviewCode}
                                onChange={(val) => setInterviewCode(val)}
                                options={{
                                  fontSize: editorFontSize,
                                  minimap: { enabled: editorMinimap },
                                  lineNumbers: 'on',
                                  automaticLayout: true
                                }}
                              />
                            </div>
                            
                            {/* Execution Terminal */}
                            <div className="h-48 border-t border-white/10 flex flex-col bg-[#050b14]">
                              <div className="h-10 bg-[#121c2c] border-b border-white/10 flex items-center justify-between px-4">
                                <div className="flex gap-2">
                                  {['Console', 'Test Cases'].map(tab => (
                                    <button 
                                      key={tab} 
                                      className={`px-3 py-1 text-xs font-semibold rounded ${terminalActiveTab === tab ? 'bg-[#76b900]/20 text-[#76b900]' : 'text-slate-400'}`}
                                      onClick={() => setTerminalActiveTab(tab)}
                                    >
                                      {tab}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-1 rounded text-xs transition-colors cursor-pointer" onClick={() => setTerminalOutput('Compiling low-level binary...\nStatic Tiling blocks matching register limits.\nAll tiles transposing correct memory patterns.')}>Run</button>
                                  <button className="bg-[#76b900] hover:bg-[#6da100] text-white px-4 py-1 rounded text-xs font-bold shadow-lg shadow-[#76b900]/20 transition-colors cursor-pointer" onClick={() => {
                                      toast.success("Technical Round completed successfully!");
                                      setSimState(prev => ({...prev, currentRoundIndex: activeRoundSim.roundIndex + 1}));
                                      setActiveRoundSim(null);
                                  }}>Submit Round</button>
                                </div>
                              </div>
                              <div className="flex-1 bg-[#050b14] p-4 overflow-y-auto font-mono text-xs">
                                {terminalActiveTab === 'Console' ? (
                                  <div className="text-slate-300 whitespace-pre-wrap">{terminalOutput || '> Terminal ready. Execute code to see output.'}</div>
                                ) : (
                                  <div className="text-slate-400">Custom dynamic hardware architecture verification tests would run here.</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                     )}
                     
                     {activeRoundSim?.category === 'system' && (
                        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                          {/* Col 1: AI Interviewer */}
                          <div className="w-full lg:w-[320px] flex flex-col gap-4">
                            <div className="bg-[#0c1524] border border-white/10 rounded-2xl overflow-hidden relative">
                              <div className="aspect-video bg-[#121c2c] flex items-center justify-center relative">
                                <FaRobot className="text-5xl text-[#76b900]/50" />
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white backdrop-blur flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> System Design AI
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-[#0c1524] border border-white/10 rounded-2xl flex-1 flex flex-col overflow-hidden">
                              <div className="p-3 border-b border-white/10 bg-[#121c2c] flex items-center justify-between">
                                <h3 className="text-xs font-bold text-white flex items-center gap-2">Design Discussion</h3>
                                <span className="bg-[#76b900]/20 text-[#76b900] text-[9px] px-2 py-0.5 rounded font-bold">Recording</span>
                              </div>
                              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
                                {interviewMessages.map((msg, idx) => (
                                  <div key={idx} className={`p-3 rounded-xl ${msg.sender === 'ai' ? 'bg-[#76b900]/10 text-emerald-100 border border-[#76b900]/25 mr-4' : 'bg-white/10 text-white ml-4'}`}>
                                    {msg.text}
                                  </div>
                                ))}
                              </div>
                              <div className="p-3 border-t border-white/10 bg-[#121c2c] flex gap-2">
                                <input 
                                  type="text" 
                                  className="flex-1 bg-black/30 border border-white/10 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-[#76b900]/50 transition-colors" 
                                  placeholder="Explain your approach..." 
                                  value={userResponseText} 
                                  onChange={(e) => setUserResponseText(e.target.value)} 
                                  onKeyDown={(e) => {
                                    if(e.key === 'Enter' && userResponseText.trim()){
                                      setInterviewMessages([...interviewMessages, {sender:'user', text: userResponseText}]);
                                      setUserResponseText('');
                                      setTimeout(() => {
                                        setInterviewMessages(prev => [...prev, {sender:'ai', text: 'How do you handle warp divergence constraints if threads process mismatched matrix borders?'}]);
                                      }, 1500);
                                    }
                                  }}
                                />
                                <button className="bg-[#76b900] hover:bg-[#6da100] text-white p-2.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer" onClick={() => {
                                  if(userResponseText.trim()){
                                    setInterviewMessages([...interviewMessages, {sender:'user', text: userResponseText}]);
                                    setUserResponseText('');
                                    setTimeout(() => {
                                        setInterviewMessages(prev => [...prev, {sender:'ai', text: 'How do you handle warp divergence constraints if threads process mismatched matrix borders?'}]);
                                    }, 1500);
                                  }
                                }}><FaPaperPlane/></button>
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Interactive System Design Whiteboard */}
                          <div className="flex-1 bg-[#0c1524] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                            <div className="h-14 bg-[#121c2c] border-b border-white/10 flex items-center justify-between px-4">
                              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                                {['Architecture', 'Database', 'API Design', 'Tradeoffs'].map(tab => (
                                  <button 
                                    key={tab} 
                                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${sysDesignActiveTab === tab ? 'bg-[#76b900]/20 text-[#76b900]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    onClick={() => setSysDesignActiveTab(tab)}
                                  >
                                    {tab}
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button className="bg-[#76b900] hover:bg-[#6da100] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-[#76b900]/20 transition-colors cursor-pointer" onClick={() => {
                                    toast.success("System Design evaluation completed!");
                                    setSimState(prev => ({...prev, currentRoundIndex: activeRoundSim.roundIndex + 1}));
                                    setActiveRoundSim(null);
                                }}>Submit Design</button>
                              </div>
                            </div>
                            
                            <div className="flex-1 relative bg-[#04080e]">
                              {/* Overlay grid background */}
                              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                              <textarea 
                                className="w-full h-full bg-transparent text-slate-300 p-6 font-mono text-xs resize-none outline-none relative z-10"
                                value={sysDesignData[sysDesignActiveTab]}
                                onChange={(e) => setSysDesignData({...sysDesignData, [sysDesignActiveTab]: e.target.value})}
                                spellCheck="false"
                              />
                            </div>
                          </div>
                        </div>
                     )}

                     {activeRoundSim?.category === 'hr' && (
                        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                          {/* HR Left Col */}
                          <div className="w-full lg:w-[400px] flex flex-col gap-4">
                            <div className="bg-[#0c1524] border border-white/10 rounded-2xl p-6 text-center">
                              <FaUserTie className="text-5xl text-[#76b900] mx-auto mb-4" />
                              <h2 className="text-xl font-bold text-white mb-2">Behavioral Interview</h2>
                              <p className="text-slate-400 text-xs">NVIDIA assesses speed, intellectual honesty, and extreme execution capacity.</p>
                            </div>

                            <div className="flex-1 bg-[#0c1524] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                              <div className="p-3 border-b border-white/10 bg-[#121c2c] flex items-center justify-between">
                                <h3 className="text-xs font-bold text-white flex items-center gap-2">Discussion</h3>
                              </div>
                              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
                                {interviewMessages.map((msg, idx) => (
                                  <div key={idx} className={`p-3 rounded-xl ${msg.sender === 'ai' ? 'bg-[#76b900]/10 text-emerald-100 border border-[#76b900]/25 mr-4' : 'bg-white/10 text-white ml-4'}`}>
                                    {msg.text}
                                  </div>
                                ))}
                                {starAnalysis && (
                                  <div className="p-3 rounded-xl bg-[#ffb900]/10 border border-[#ffb900]/20 mt-4 mr-4 text-[10px]">
                                    <div className="font-bold text-[#ffb900] mb-2 border-b border-[#ffb900]/20 pb-1">STAR Analysis Feedback</div>
                                    <div className="space-y-1 text-yellow-100/80">
                                      <p><strong className="text-white">Situation:</strong> {starAnalysis.s}</p>
                                      <p><strong className="text-white">Task:</strong> {starAnalysis.t}</p>
                                      <p><strong className="text-white">Action:</strong> {starAnalysis.a}</p>
                                      <p><strong className="text-white">Result:</strong> {starAnalysis.r}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="p-3 border-t border-white/10 bg-[#121c2c] flex flex-col gap-2">
                                <textarea 
                                  className="w-full bg-black/30 border border-white/10 rounded-lg text-xs text-white p-3 outline-none focus:border-[#76b900]/50 transition-colors resize-none h-24" 
                                  placeholder="Use the STAR method (Situation, Task, Action, Result) to reply..." 
                                  value={userResponseText} 
                                  onChange={(e) => setUserResponseText(e.target.value)} 
                                />
                                <div className="flex justify-end gap-2">
                                  <button className="bg-[#76b900] hover:bg-[#6da100] text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-colors flex items-center cursor-pointer" onClick={() => {
                                    if(userResponseText.trim()){
                                      setInterviewMessages([...interviewMessages, {sender:'user', text: userResponseText}]);
                                      setUserResponseText('');
                                      
                                      setTimeout(() => {
                                        setStarAnalysis({
                                          s: "Excellent context on team load imbalance.",
                                          t: "Goal was set clearly to restructure memory queues.",
                                          a: "Actions showed robust parallel understanding.",
                                          r: "Result achieved 10x throughput scaling."
                                        });
                                        setInterviewMessages(prev => [...prev, {sender:'ai', text: 'Excellent description. How do you handle conflict when engineers prefer conventional algorithms over hardware-optimized ones?'}]);
                                      }, 2000);
                                    }
                                  }}>Reply <FaPaperPlane className="ml-2 text-[10px]"/></button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* HR Right Col (Evaluation Metrics) */}
                          <div className="flex-1 bg-[#0c1524] border border-white/10 rounded-2xl p-8 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Live Assessment Metrics</h3>
                            
                            <div className="grid grid-cols-2 gap-6 flex-1 content-start">
                              {[
                                {name: 'Excellence & Speed', score: 88, color: '#76b900'},
                                {name: 'Communication', score: 90, color: '#76b900'},
                                {name: 'Ownership & Tenacity', score: 92, color: '#76b900'},
                                {name: 'Team collaboration', score: 85, color: '#76b900'}
                              ].map(m => (
                                <div key={m.name} className="bg-black/20 border border-white/5 rounded-xl p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-300 font-medium text-xs">{m.name}</span>
                                    <span className="text-white font-bold text-xs">{m.score}%</span>
                                  </div>
                                  <div className="h-2 bg-black rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{width: `${m.score}%`, backgroundColor: m.color}}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <button 
                               className="mt-8 bg-[#76b900] hover:bg-[#6da100] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#76b900]/20 w-full cursor-pointer"
                               onClick={() => {
                                 toast.success(`Behavioral Round completed!`);
                                 setSimState(prev => ({...prev, currentRoundIndex: activeRoundSim.roundIndex + 1}));
                                 setActiveRoundSim(null);
                                 setShowFinalReport(true);
                               }}
                             >
                               Complete Interview Process
                            </button>
                          </div>
                        </div>
                     )}
                   </div>
                )}
                
                {/* Final Report / Hiring Committee View */}
                {!activeRoundSim && showFinalReport && (
                   <div className="animate-fade-in-up space-y-6">
                     <div className="bg-gradient-to-r from-[#76b900]/10 via-[#0c1524] to-[#0c1524] border border-[#76b900]/30 rounded-3xl p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                       <div className="w-32 h-32 rounded-full bg-[#76b900]/20 flex items-center justify-center border-4 border-[#76b900]/30 shadow-[0_0_50px_rgba(118,185,0,0.4)] shrink-0">
                         <FaTrophy className="text-5xl text-[#76b900]" />
                       </div>
                       <div>
                         <h1 className="text-4xl font-black text-white mb-2">Hiring Committee Decision</h1>
                         <p className="text-lg text-slate-300 mb-4">Based on your performance across 5 rigorous rounds, the NVIDIA hiring panel has reached a conclusion.</p>
                         <div className="inline-block bg-[#76b900] text-white px-4 py-1.5 rounded-full font-bold shadow-[0_0_20px_rgba(118,185,0,0.5)]">
                           Decision: STRONG HIRE (Software Stack Team)
                         </div>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       {[
                         {title: 'Online Assessment', result: 'Passed (92%)', icon: FaLaptopCode, color: '#76b900'},
                         {title: 'Technical 1', result: 'Strong Hire', icon: FaCode, color: '#76b900'},
                         {title: 'Technical 2', result: 'Hire', icon: FaMicrochip, color: '#76b900'},
                         {title: 'Behavioral', result: 'Strong Hire', icon: FaUsers, color: '#76b900'}
                       ].map(r => (
                         <div key={r.title} className="bg-[#0c1524] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5" style={{color: r.color}}>
                             <r.icon className="text-2xl" />
                           </div>
                           <div>
                             <div className="text-[10px] text-slate-400 font-medium mb-1">{r.title}</div>
                             <div className="text-white font-bold text-xs">{r.result}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                     
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       {/* Committee Notes */}
                       <div className="bg-[#0c1524] border border-white/10 rounded-2xl p-6">
                         <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">Committee Review Notes</h3>
                         <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                           <p><strong className="text-[#76b900]">Technical Strengths:</strong> Brilliant execution of tiling optimizations to avoid shared memory bank conflicts in matrix transpose. Highly structured memory boundaries.</p>
                           <p><strong className="text-yellow-400">Improvement Areas:</strong> Deep optimization of thread warps for uneven inputs could have been cleaner. Keep thread division calculations clear.</p>
                           <p><strong className="text-slate-100">Behavioral:</strong> High alignment with speed and intellectual honesty values. Clear explanation of STAR steps.</p>
                         </div>
                       </div>
                       
                       {/* Mock Offer */}
                       <div className="bg-[#0c1524] border border-[#76b900]/30 rounded-2xl p-6 relative overflow-hidden">
                         <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#76b900]/10 rounded-full blur-2xl"></div>
                         <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">Simulated Offer Letter</h3>
                         <div className="space-y-3 text-xs">
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-slate-400">Role</span>
                             <span className="text-white font-bold">{selectedRoleData.roleName} (IC3)</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-slate-400">Team</span>
                             <span className="text-white font-bold">{selectedRoleData.department}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-slate-400">Salary Package</span>
                             <span className="text-white font-bold">{selectedRoleData.avgSalary}</span>
                           </div>
                           <div className="flex justify-between pb-2">
                             <span className="text-slate-400">HQ Location</span>
                             <span className="text-white font-bold">{selectedRoleData.locations[0]}</span>
                           </div>
                         </div>
                         <button className="w-full mt-6 bg-[#76b900] hover:bg-[#6da100] text-white py-3 rounded-xl font-bold transition-colors cursor-pointer" onClick={() => toast.success("Mock offer accepted! Good luck in real interviews!")}>
                           Accept Mock Offer
                         </button>
                       </div>
                     </div>
                   </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default NvidiaPrepDetail;
