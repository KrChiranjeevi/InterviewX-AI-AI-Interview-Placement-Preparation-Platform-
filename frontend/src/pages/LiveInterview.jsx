import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Maximize2, Minimize2, Wifi, Shield, Send, Keyboard,
  X, Activity, CheckCircle2, AlertCircle, Zap, Brain,
  ChevronRight, SkipForward, Play, Pause, Plus, RotateCcw,
  FileText, Layout, Database, User, Check, AlertTriangle, Trash2,
  Camera, Mic, Code2
} from 'lucide-react';
import {
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
  FaStopCircle, FaRobot, FaUserAlt, FaPaperPlane,
  FaBookmark, FaRegBookmark
} from 'react-icons/fa';
import api from '../services/api';
import * as faceapi from '@vladmandic/face-api';
import Editor from '@monaco-editor/react';

// Premium sub-components
import InterviewMetrics from '../components/interview/InterviewMetrics';
import WaveformVisualizer from '../components/interview/WaveformVisualizer';
import MockInterviewRoom from '../components/interview/MockInterviewRoom';

// ─── Constants ────────────────────────────────────────────────────────────────
const AUTO_SUBMIT_DELAY = 60 * 1000;

const ENDING_STEPS = [
  { label: 'Interview Completed',             icon: CheckCircle2, color: 'text-emerald-400',  bg: 'bg-emerald-500/15 border-emerald-500/30' },
  { label: 'Processing your responses…',      icon: Activity,     color: 'text-blue-400',     bg: 'bg-blue-500/15 border-blue-500/30'       },
  { label: 'Analyzing communication patterns…', icon: Zap,        color: 'text-purple-400',   bg: 'bg-purple-500/15 border-purple-500/30'   },
  { label: 'Evaluating technical answers…',   icon: Brain,        color: 'text-indigo-400',   bg: 'bg-indigo-500/15 border-indigo-500/30'   },
  { label: 'Generating AI performance report…', icon: Activity,   color: 'text-violet-400',   bg: 'bg-violet-500/15 border-violet-500/30'   },
  { label: 'Preparing personalized recommendations…', icon: Zap,  color: 'text-pink-400',     bg: 'bg-pink-500/15 border-pink-500/30'       },
];

// ─── Company Configurations ──────────────────────────────────────────────────
const COMPANY_INTERVIEWS = {
  amazon: {
    title: 'AMAZON - SDE Interview',
    subtitle: 'Technical + Behavioral (Leadership Principles)',
    accentColor: '#ff9900',
    accentGlow: 'rgba(255, 153, 0, 0.15)',
    interviewerName: 'Sarah Jenkins',
    interviewerTitle: 'Amazon Principal Engineer & Bar Raiser',
    interviewerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    metrics: ['Problem Solving', 'Coding', 'Communication', 'Ownership', 'Customer Focus', 'Decision Making'],
    rounds: [
      { id: 'intro', label: 'Introduction', type: 'text', q: 'Welcome to your Amazon technical interview. I am Sarah, a Principal Engineer. To begin, could you introduce yourself and explain why you are interested in the SDE position at Amazon?' },
      { id: 'resume', label: 'Resume & Projects', type: 'text', q: 'I see a few projects listed on your resume. Could you talk about a project where you demonstrated strong ownership and went beyond your defined responsibilities to deliver it?' },
      { id: 'coding', label: 'Coding Exercise', type: 'coding', problemId: 'islands', q: 'Great. Let us move to the coding exercise. I have shared a problem statement called "Number of Islands". Please write your implementation in the editor, explaining your approach as you code.' },
      { id: 'system', label: 'System Design', type: 'whiteboard', q: 'Amazon services must scale to millions of requests. How would you design a distributed caching database layer to handle 20,000 requests per second with sub-millisecond latency?' },
      { id: 'behavioral', label: 'Leadership Principles', type: 'text', q: 'Customer Obsession is core to Amazon. Tell me about a time you had to make a compromise between coding standards and meeting a tight delivery timeline for a client.' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'Excellent. Do you have any questions for me regarding SDE career growth or engineering standards at Amazon?' }
    ]
  },
  google: {
    title: 'GOOGLE - SWE Interview',
    subtitle: 'Coding + Algorithms + Googliness',
    accentColor: '#4285f4',
    accentGlow: 'rgba(66, 133, 244, 0.15)',
    interviewerName: 'Marcus Vance',
    interviewerTitle: 'Google Senior Tech Lead',
    interviewerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    metrics: ['Coding', 'Communication', 'Analytical Thinking', 'Problem Solving', 'Learning Ability'],
    rounds: [
      { id: 'intro', label: 'Introduction', type: 'text', q: 'Hello! I am Marcus, and I will be conducting your Google technical screen. Let us start with a brief introduction. What areas of computer science are you most passionate about?' },
      { id: 'algorithms', label: 'Algorithms', type: 'coding', problemId: 'subarray', q: 'Let us start with an algorithms question: "Maximum Subarray Sum". I want to see how you analyze time and space complexity. Please implement your solution in the IDE.' },
      { id: 'optimization', label: 'Code Optimization', type: 'text', q: 'Your implementation looks correct. How would you optimize the space complexity if we wanted to run this algorithm concurrently across a stream of data?' },
      { id: 'googliness', label: 'Googliness & Values', type: 'text', q: 'At Google, we value learning from failure. Tell me about a time you made a major mistake on a technical project and how you resolved it with your team.' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'That wraps up my questions. What questions do you have for me about Google SRE or core developer culture?' }
    ]
  },
  microsoft: {
    title: 'MICROSOFT - SWE Interview',
    subtitle: 'Coding + Design Discussion + Behavioral',
    accentColor: '#0078d4',
    accentGlow: 'rgba(0, 120, 212, 0.15)',
    interviewerName: 'Elena Rostova',
    interviewerTitle: 'Microsoft Software Engineering Manager',
    interviewerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    metrics: ['Coding Quality', 'Design', 'Communication', 'Collaboration', 'Growth Mindset'],
    rounds: [
      { id: 'intro', label: 'Introduction', type: 'text', q: 'Hi, I am Elena. Let us look at your resume. Can you describe the software architecture of your most recent project and how you decided on the technology stack?' },
      { id: 'coding', label: 'Coding Exercise', type: 'coding', problemId: 'parentheses', q: 'I have loaded a coding problem: "Valid Parentheses". Write a clean, well-structured implementation and explain how you validate empty constraints.' },
      { id: 'system', label: 'System Design', type: 'whiteboard', q: 'Microsoft Teams handles massive real-time signaling. How would you design a URL shortener service like bit.ly that is highly available and supports custom aliases?' },
      { id: 'growth', label: 'Growth Mindset', type: 'text', q: 'At Microsoft, we believe in a growth mindset. Can you tell me about a complex technology or framework you had to learn completely from scratch in less than a week?' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'Thank you for sharing that. What questions do you have for me about engineering roles at Microsoft?' }
    ]
  },
  nvidia: {
    title: 'NVIDIA - Engineer Interview',
    subtitle: 'C++ / System Fundamentals / Performance',
    accentColor: '#76b900',
    accentGlow: 'rgba(118, 185, 0, 0.15)',
    interviewerName: 'Dr. Kenji Sato',
    interviewerTitle: 'Nvidia Senior CUDA Engineer',
    interviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    metrics: ['Code Quality', 'Optimization', 'Memory Handling', 'Concurrency', 'Low-level Basics'],
    rounds: [
      { id: 'intro', label: 'Intro & Systems', type: 'text', q: 'Welcome. I am Kenji. Nvidia engineering requires a strong understanding of low-level systems. Can you explain the difference between processes and threads in operating system memory management?' },
      { id: 'coding', label: 'Coding (C++)', type: 'coding', problemId: 'reverse', q: 'Let us do a pointer manipulation exercise: "Reverse a Singly Linked List". Since we operate in memory-constrained graphics buffers, implement it iteratively with O(1) auxiliary space.' },
      { id: 'concurrency', label: 'Concurrency', type: 'text', q: 'Excellent. How do you prevent thread contention and race conditions when multiple threads read/write to the same shared queue buffer?' },
      { id: 'optimizations', label: 'GPU Optimization', type: 'text', q: 'What is your understanding of CPU cache line sharing, and how would you optimize memory access patterns to maximize memory throughput?' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'Low-level optimizations are a constant challenge here. Do you have any questions about graphics drivers or compiler work at Nvidia?' }
    ]
  },
  jpmorgan: {
    title: 'JPMORGAN CHASE - Software Engineer',
    subtitle: 'Coding + SQL + System Design + Behavioral',
    accentColor: '#c19b4a',
    accentGlow: 'rgba(193, 155, 74, 0.15)',
    interviewerName: 'David Miller',
    interviewerTitle: 'JPMorgan Chase VP of Engineering',
    interviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    metrics: ['SQL Queries', 'OOPs Logic', 'System Design', 'Banking Awareness', 'Communication'],
    rounds: [
      { id: 'intro', label: 'Introduction', type: 'text', q: 'Welcome. I am David, managing the banking transaction services team. Let us start by discussing your background. Why do you want to work at JPMorgan Chase?' },
      { id: 'sql', label: 'SQL Query', type: 'sql', q: 'Financial reporting relies heavily on databases. Write a SQL query to find the second highest salary from the Employee table schema (columns: id, name, salary).' },
      { id: 'java', label: 'Java & OOPs', type: 'text', q: 'Can you explain the difference between interfaces and abstract classes in Java, and when you would prefer one over the other in a transactional framework?' },
      { id: 'system', label: 'System Design', type: 'whiteboard', q: 'How would you design a secure, transactional ledger system that processes bank transfers between users, preventing double-spending?' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'That covers my questions. What questions do you have about software stability and security protocols at JPMC?' }
    ]
  },
  tcs: {
    title: 'TCS - Ninja / Digital / Prime',
    subtitle: 'Technical + HR Interview',
    accentColor: '#1d4ed8',
    accentGlow: 'rgba(29, 78, 216, 0.15)',
    interviewerName: 'Ramesh Kumar',
    interviewerTitle: 'TCS Talent Acquisition Manager',
    interviewerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300',
    metrics: ['Technical Knowledge', 'Clarity', 'Basics', 'Punctuality', 'Attitude'],
    rounds: [
      { id: 'intro', label: 'Self Introduction', type: 'text', q: 'Hello, welcome to your TCS interview. Please introduce yourself, your college, and tell me about your final year project.' },
      { id: 'programming', label: 'Programming Basics', type: 'text', q: 'What are the main pillars of Object-Oriented Programming (OOPs)? Can you explain them with real-world examples?' },
      { id: 'dbms', label: 'DBMS & SQL', type: 'text', q: 'What is the difference between primary key, unique key, and foreign key in relational databases?' },
      { id: 'hr', label: 'HR Round', type: 'text', q: 'TCS projects operate globally. Are you comfortable relocations, night shifts, and signing a service agreement?' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'Good. Do you have any questions about TCS training programs or client domains?' }
    ]
  },
  infosys: {
    title: 'INFOSYS - SE / DSE / SP',
    subtitle: 'Technical + Technical Round + HR',
    accentColor: '#007cc3',
    accentGlow: 'rgba(0, 124, 195, 0.15)',
    interviewerName: 'Sunita Sharma',
    interviewerTitle: 'Infosys Delivery Lead',
    interviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    metrics: ['Concepts', 'Problem Solving', 'Communication', 'Collaboration', 'HR Readiness'],
    rounds: [
      { id: 'intro', label: 'Introduction', type: 'text', q: 'Hello, welcome to Infosys. Let us begin with your introduction. Which programming language are you most comfortable with?' },
      { id: 'programming', label: 'Technical Check', type: 'text', q: 'What is the difference between an Array and a Linked List? When would you use which data structure?' },
      { id: 'oops', label: 'OOPs Concepts', type: 'text', q: 'Can you explain inheritance and polymorphism? Give an example of function overloading.' },
      { id: 'hr', label: 'HR Discussion', type: 'text', q: 'Why do you want to join Infosys? Are you ready to work in any development center across India?' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'Thank you. Do you have any queries about our global delivery model?' }
    ]
  },
  accenture: {
    title: 'ACCENTURE - ASE / AASE',
    subtitle: 'Technical + Managerial + HR',
    accentColor: '#a100ff',
    accentGlow: 'rgba(161, 0, 255, 0.15)',
    interviewerName: 'Amit Patel',
    interviewerTitle: 'Accenture Senior Manager',
    interviewerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    metrics: ['Problem Solving', 'Attitude', 'Communication', 'Domain Knowledge', 'Client Focus'],
    rounds: [
      { id: 'intro', label: 'Introduction', type: 'text', q: 'Hello! I am Amit. Let us talk about your engineering profile. Describe the tech stack of your graduation projects.' },
      { id: 'scenarios', label: 'Scenario Questions', type: 'text', q: 'Imagine you are working on a client project and the client repeatedly changes requirements. How will you handle this situation?' },
      { id: 'managerial', label: 'Managerial Round', type: 'text', q: 'If your team has a conflict regarding technical architecture, how will you resolve it to keep delivery on schedule?' },
      { id: 'hr', label: 'HR Round', type: 'text', q: 'Accenture operates under strong ethical guidelines. Tell me about a time you stood up for what was right. Are you comfortable relocate?' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'Great talking to you. Any questions for me about Accenture consulting groups?' }
    ]
  },
  capgemini: {
    title: 'CAPGEMINI - Analyst / Senior Analyst',
    subtitle: 'Technical + Communication + HR',
    accentColor: '#0070ad',
    accentGlow: 'rgba(0, 112, 173, 0.15)',
    interviewerName: 'Nisha Patil',
    interviewerTitle: 'Capgemini Tech Lead',
    interviewerAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=300',
    metrics: ['Technical Knowledge', 'Communication', 'Basics', 'Agile Mindset', 'SQL Skills'],
    rounds: [
      { id: 'intro', label: 'Intro & Resume', type: 'text', q: 'Welcome. I am Nisha. Can you walk me through your engineering projects and specify your personal contribution?' },
      { id: 'programming', label: 'Programming & SQL', type: 'text', q: 'Explain the Software Development Life Cycle (SDLC). What are the main differences between Waterfall and Agile models?' },
      { id: 'communication', label: 'Communication Round', type: 'text', q: 'In Capgemini, we work directly with French and international clients. Give me a brief pitch introducing a product you use daily.' },
      { id: 'hr', label: 'HR Round', type: 'text', q: 'Are you open to relocation? Are you willing to adapt to dynamic shifts depending on client requirements?' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'Good. Do you want to ask anything about Capgemini tech academies?' }
    ]
  },
  cognizant: {
    title: 'COGNIZANT - GenC Next',
    subtitle: 'Technical + Behavioral + HR',
    accentColor: '#0033a0',
    accentGlow: 'rgba(0, 51, 160, 0.15)',
    interviewerName: 'Vikram Malhotra',
    interviewerTitle: 'Cognizant Technical Architect',
    interviewerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    metrics: ['DBMS', 'Concepts', 'Communication', 'Problem Solving', 'Adaptability'],
    rounds: [
      { id: 'intro', label: 'Introduction', type: 'text', q: 'Hello, welcome to Cognizant. Please walk me through your resume and key technical strengths.' },
      { id: 'programming', label: 'Programming Concepts', type: 'text', q: 'What is normalization in databases? Explain 1NF, 2NF, and 3NF with simple examples.' },
      { id: 'projects', label: 'Projects Discussion', type: 'text', q: 'Describe the largest database structure you designed for a project. What challenges did you face?' },
      { id: 'hr', label: 'HR Round', type: 'text', q: 'Are you comfortable relocating to any Cognizant office? How do you manage work pressure?' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'Thank you. Do you have any questions for me about developer career paths at Cognizant?' }
    ]
  },
  wipro: {
    title: 'WIPRO - WILP / WILP+',
    subtitle: 'Technical + Project Discussion + HR',
    accentColor: '#8b5cf6',
    accentGlow: 'rgba(139, 92, 246, 0.15)',
    interviewerName: 'Karan Malhotra',
    interviewerTitle: 'Wipro Talent Specialist',
    interviewerAvatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=300',
    metrics: ['Project Understanding', 'Clarity', 'Communication', 'Coding Basics', 'Commitment'],
    rounds: [
      { id: 'intro', label: 'Self Intro', type: 'text', q: 'Welcome to Wipro. Introduce yourself and share your career objectives.' },
      { id: 'programming', label: 'Programming Basics', type: 'text', q: 'Can you write a program or algorithm to check if a string is a palindrome?' },
      { id: 'oops', label: 'OOPs & Database', type: 'text', q: 'What is encapsulation? How does it differ from data abstraction?' },
      { id: 'hr', label: 'HR Discussion', type: 'text', q: 'Are you comfortable relocate? Tell me why you want to start your professional career at Wipro.' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'Alright. Do you have any questions for me regarding Wipro projects?' }
    ]
  },
  deloitte: {
    title: 'DELOITTE - Digital / GPS',
    subtitle: 'Technical + Managerial + HR',
    accentColor: '#86bc25',
    accentGlow: 'rgba(134, 188, 37, 0.15)',
    interviewerName: 'Sanjay Dutt',
    interviewerTitle: 'Deloitte Consulting Director',
    interviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    metrics: ['Problem Solving', 'Business Thinking', 'Communication', 'Leadership', 'Ethics'],
    rounds: [
      { id: 'intro', label: 'Introduction', type: 'text', q: 'Hello! Sanjay here. Deloitte specializes in system integration and strategy. Tell me about your graduation projects.' },
      { id: 'cases', label: 'Case Studies', type: 'text', q: 'Deloitte client case: A company faces low employee productivity. What step-by-step technological solutions would you suggest to improve it?' },
      { id: 'managerial', label: 'Managerial Round', type: 'text', q: 'Tell me about a time you had to lead a group project. How did you coordinate task allocations?' },
      { id: 'hr', label: 'HR Round', type: 'text', q: 'Are you willing to travel for client site consultations? Where do you see yourself in 3 years?' },
      { id: 'wrap', label: 'Wrap Up', type: 'text', q: 'Thank you. Any questions about Deloitte GPS or commercial consultancies?' }
    ]
  }
};

const CODING_PROBLEMS = {
  islands: {
    title: 'Number of Islands',
    difficulty: 'Medium',
    description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    starterCode: {
      python: 'class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        # Write your logic here\n        pass',
      javascript: 'class Solution {\n    numIslands(grid) {\n        // Write your logic here\n        \n    }\n}',
      java: 'class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your logic here\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your logic here\n        \n    }\n};'
    }
  },
  subarray: {
    title: 'Maximum Subarray Sum',
    difficulty: 'Easy',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    starterCode: {
      python: 'class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        # Write your logic here\n        pass',
      javascript: 'class Solution {\n    maxSubArray(nums) {\n        // Write your logic here\n        \n    }\n}',
      java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your logic here\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your logic here\n        \n    }\n};'
    }
  },
  parentheses: {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    starterCode: {
      python: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your logic here\n        pass',
      javascript: 'class Solution {\n    isValid(s) {\n        // Write your logic here\n        \n    }\n}',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        // Write your logic here\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your logic here\n        \n    }\n};'
    }
  },
  reverse: {
    title: 'Reverse a Linked List',
    difficulty: 'Medium',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    starterCode: {
      python: 'class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        # Write your logic here\n        pass',
      javascript: 'class Solution {\n    reverseList(head) {\n        // Write your logic here\n        \n    }\n}',
      java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your logic here\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your logic here\n        \n    }\n};'
    }
  }
};

const LiveInterview = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null); // preserved audio waveform canvas ref
  const canvasRefDraw = useRef(null); // whiteboard canvas ref
  
  const audioCtxRef  = useRef(null);
  const analyserRef  = useRef(null);
  const animationFrameRef = useRef(null);

  // Parse URL search parameters
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const companyQuery = queryParams.get('company')?.toLowerCase() || '';
  const roleQuery = queryParams.get('role') || 'SDE Intern';
  
  // ── Existing state (ALL PRESERVED) ────────────────────────────────────────
  const [interview, setInterview]     = useState(null);
  const [isCameraOn, setIsCameraOn]   = useState(true);
  const [isMuted, setIsMuted]         = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream]           = useState(null);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState('Loading AI question...');
  const [isAIThinking, setIsAIThinking]       = useState(true);
  const [aiSpeaking, setAiSpeaking]           = useState(false);

  const [finalTranscript,   setFinalTranscript]   = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isTypingMode, setIsTypingMode]            = useState(false);
  const [typedAnswer,  setTypedAnswer]             = useState('');

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceStatus,   setFaceStatus]   = useState('Loading scanner...');
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState(null);
  const [sessionTimeLeft,     setSessionTimeLeft]     = useState(null);
  const [isEnding, setIsEnding] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('theme') || 'dark');
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  // HUD metrics
  const [hudWpm,        setHudWpm]        = useState(130);
  const [hudClarity,    setHudClarity]    = useState(92);
  const [hudFillers,    setHudFillers]    = useState(0);
  const [hudEyeContact, setHudEyeContact] = useState(88);
  const [isPaused,      setIsPaused]      = useState(false);
  const [isBookmarked,  setIsBookmarked]  = useState(false);

  // New state
  const [hudConfidence,   setHudConfidence]   = useState(78);
  const [hudFluency,      setHudFluency]      = useState(85);
  const [questionNumber,  setQuestionNumber]  = useState(1);
  const [showEndConfirm,  setShowEndConfirm]  = useState(false);
  const [endingStep,      setEndingStep]      = useState(-1);
  const [toasts,          setToasts]          = useState([]);
  const [isFullscreen,    setIsFullscreen]    = useState(false);

  // ── Premium AI Human Conversation Engine states (MOCK MODE ONLY) ──
  const [conversationHistory,  setConversationHistory]  = useState([]);  // full chat log
  const [interviewerStatus,    setInterviewerStatus]    = useState('listening'); // 'listening'|'analyzing'|'typing'|'preparing'|'speaking'|'evaluating'
  const [interviewStage,       setInterviewStage]       = useState('greeting'); // 'greeting'|'warmup'|'core'|'deepdive'|'closing'
  const [onExcellentAnswer,    setOnExcellentAnswer]    = useState(false); // triggers avatar smile
  const [conversationLogOpen,  setConversationLogOpen]  = useState(false); // slide-out log panel
  const [pendingSpeech,        setPendingSpeech]        = useState(null); // { ack, transition, question }
  const [greetingDone,         setGreetingDone]         = useState(false); // track greeting completion

  // Dynamic Workspaces States
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [codeContent, setCodeContent] = useState('');
  const [sqlQuery, setSqlQuery] = useState('-- Write your SQL query here\n');
  const [sqlResult, setSqlResult] = useState(null);
  const [drawColor, setDrawColor] = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Whiteboard architecture blocks
  const [blocks, setBlocks] = useState([
    { id: 'client', type: 'Client', x: 50, y: 120, label: 'Client (User)' },
    { id: 'apigw', type: 'Gateway', x: 180, y: 120, label: 'API Gateway' },
    { id: 'service', type: 'Service', x: 320, y: 80, label: 'SDE Service' },
    { id: 'db', type: 'Database', x: 460, y: 80, label: 'NoSQL DB' },
    { id: 'cache', type: 'Cache', x: 460, y: 180, label: 'Redis Cache' }
  ]);
  const [draggingBlock, setDraggingBlock] = useState(null);

  // Dialog bubble logs
  const [dialogLogs, setDialogLogs] = useState([]);

  // Final evaluation report screen triggers
  const [showReportPage, setShowReportPage] = useState(false);
  const [finalReportData, setFinalReportData] = useState(null);

  // ── Existing refs (ALL PRESERVED) ─────────────────────────────────────────
  const recognitionRef     = useRef(null);
  const synthRef           = useRef(window.speechSynthesis);
  const autoSubmitTimer    = useRef(null);
  const countdownInterval  = useRef(null);
  const silenceTimer       = useRef(null);
  const currentQuestionRef = useRef('Loading AI question...');
  const isAIThinkingRef    = useRef(true);
  const finalTranscriptRef = useRef('');
  const isTypingModeRef    = useRef(false);
  const isPausedRef        = useRef(false);
  const isMutedRef         = useRef(false);
  const confidenceData     = useRef({ total: 0, count: 0 });
  const faceInterval       = useRef(null);
  const sessionTimerRef    = useRef(null);
  const voiceRef           = useRef(null);
  const toastTimers        = useRef([]);
  const interviewStageRef  = useRef('greeting'); // track stage in callbacks
  const questionNumberRef  = useRef(1);          // track question number in callbacks

  // Sync ref hooks
  useEffect(() => { currentQuestionRef.current = currentQuestion;  }, [currentQuestion]);
  useEffect(() => { isAIThinkingRef.current    = isAIThinking;    }, [isAIThinking]);
  useEffect(() => { finalTranscriptRef.current = finalTranscript; }, [finalTranscript]);
  useEffect(() => { isTypingModeRef.current    = isTypingMode;    }, [isTypingMode]);
  useEffect(() => { isPausedRef.current        = isPaused;        }, [isPaused]);
  useEffect(() => { isMutedRef.current         = isMuted;         }, [isMuted]);

  // Determine current company configuration
  const companyKey = useMemo(() => {
    if (companyQuery && COMPANY_INTERVIEWS[companyQuery]) return companyQuery;
    if (interview?.company && COMPANY_INTERVIEWS[interview.company.toLowerCase()]) return interview.company.toLowerCase();
    if (interview?.interviewType?.toLowerCase().includes('amazon')) return 'amazon';
    if (interview?.interviewType?.toLowerCase().includes('google')) return 'google';
    if (interview?.interviewType?.toLowerCase().includes('microsoft')) return 'microsoft';
    if (interview?.interviewType?.toLowerCase().includes('nvidia')) return 'nvidia';
    if (interview?.interviewType?.toLowerCase().includes('tcs')) return 'tcs';
    if (interview?.interviewType?.toLowerCase().includes('infosys')) return 'infosys';
    if (interview?.interviewType?.toLowerCase().includes('accenture')) return 'accenture';
    if (interview?.interviewType?.toLowerCase().includes('capgemini')) return 'capgemini';
    if (interview?.interviewType?.toLowerCase().includes('cognizant')) return 'cognizant';
    if (interview?.interviewType?.toLowerCase().includes('wipro')) return 'wipro';
    if (interview?.interviewType?.toLowerCase().includes('deloitte')) return 'deloitte';
    if (interview?.interviewType?.toLowerCase().includes('jpmorgan')) return 'jpmorgan';
    return 'amazon'; // Default company fallback
  }, [companyQuery, interview]);

  const companyConfig = COMPANY_INTERVIEWS[companyKey];

  const isMock = useMemo(() => {
    const urlCompany = queryParams.get('company');
    return !urlCompany && (!interview || !interview.company);
  }, [queryParams, interview]);

  const mockArchetype = useMemo(() => {
    if (!interview?.type) return 'technical';
    const typeStr = interview.type.toLowerCase();
    if (typeStr.includes('coding')) return 'coding';
    if (typeStr.includes('system design') || typeStr.includes('architecture') || typeStr.includes('design') || typeStr.includes('cloud') || typeStr.includes('devops')) return 'system_design';
    if (typeStr.includes('resume')) return 'resume';
    if (typeStr.includes('behavioral')) return 'behavioral';
    if (typeStr.includes('hr')) return 'hr';
    return 'technical';
  }, [interview]);

  const currentRoundIdx = Math.min(questionNumber - 1, companyConfig.rounds.length - 1);
  
  const currentRound = useMemo(() => {
    if (isMock) {
      return {
        type: mockArchetype === 'coding' ? 'coding' : mockArchetype === 'system_design' ? 'whiteboard' : 'text',
        problemId: 'twoSum'
      };
    }
    return companyConfig.rounds[currentRoundIdx];
  }, [isMock, mockArchetype, companyConfig, currentRoundIdx]);

  // Initialize Code Content on round transition
  useEffect(() => {
    if (currentRound && currentRound.type === 'coding' && currentRound.problemId) {
      const prob = CODING_PROBLEMS[currentRound.problemId];
      if (prob) {
        setCodeContent(prob.starterCode[selectedLanguage] || '');
      }
    }
  }, [currentRound, selectedLanguage]);

  // Setup toast utility
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
    toastTimers.current.push(timer);
  };

  /* ─── Web Audio Analyser Visualizer (PRESERVED) ─────────────────────────── */
  useEffect(() => {
    if (!stream || !canvasRef.current) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioCtxRef.current  = audioContext;
      analyserRef.current  = analyser;

      const canvas = canvasRef.current;
      const ctx    = canvas.getContext('2d');
      const bufferLength = analyser.frequencyBinCount;
      const dataArray    = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current) return;
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(15,23,42,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
          ctx.fillStyle = `rgb(${Math.floor(99+i*4)},${Math.floor(102-i)},${Math.floor(241-i)})`;
          ctx.fillRect(x, (canvas.height - barHeight)/2, barWidth - 1, barHeight);
          x += barWidth;
        }
      };
      draw();
    } catch (e) { console.warn('Analyser not initialized', e); }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [stream]);

  /* ─── Transcript Analysis for HUD (PRESERVED) ─────────────────────────── */
  useEffect(() => {
    if (!finalTranscript) return;
    const fillers = ['um', 'uh', 'like', 'so', 'actually', 'you know'];
    const words   = finalTranscript.toLowerCase().split(/\s+/);
    let count = 0;
    words.forEach(w => { if (fillers.includes(w)) count++; });
    setHudFillers(count);
    const wpm = Math.round(110 + (words.length % 35));
    setHudWpm(wpm);
    const fluency = Math.max(0, Math.min(100, 100 - count * 8 - Math.abs(wpm - 130) * 0.3));
    setHudFluency(Math.round(fluency));

    if (count === 3)  addToast('Try to reduce filler words like "um" and "uh"', 'warning');
    if (wpm > 170)    addToast('Try speaking a little slower for clarity', 'warning');
  }, [finalTranscript]);

  /* ─── Eye Contact Simulated Metrics (PRESERVED) ───────────────────────── */
  useEffect(() => {
    if (faceStatus.includes('active')) {
      const interval = setInterval(() => {
        if (isPausedRef.current) return;
        setHudEyeContact(prev => {
          const delta = Math.floor(Math.random() * 7) - 3;
          const next  = Math.min(100, Math.max(70, prev + delta));
          if (next > 90) addToast('Great eye contact! Keep it up 👁️', 'success');
          return next;
        });
        setHudClarity(prev => {
          const delta = Math.floor(Math.random() * 5) - 2;
          return Math.min(100, Math.max(80, prev + delta));
        });
        setHudConfidence(prev => {
          const delta = Math.floor(Math.random() * 7) - 2;
          return Math.min(100, Math.max(60, prev + delta));
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [faceStatus]);

  /* ─── Pre-load best female voice (ENHANCED) ──────────────────────────── */
  useEffect(() => {
    // Extended priority list — Microsoft Natural voices sound most human
    const PREFERRED_FEMALE_VOICES = [
      'Microsoft Aria Online (Natural) - English (United States)',
      'Microsoft Jenny Online (Natural) - English (United States)',
      'Microsoft Sonia Online (Natural) - English (United Kingdom)',
      'Microsoft Libby Online (Natural) - English (United Kingdom)',
      'Google UK English Female',
      'Microsoft Zira Desktop - English (United States)',
      'Samantha', 'Karen', 'Moira', 'Victoria',
      'Google US English',
    ];
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      for (const name of PREFERRED_FEMALE_VOICES) {
        const v = voices.find(v => v.name === name);
        if (v) { voiceRef.current = v; return; }
      }
      const femaleEn = voices.find(v => v.lang.startsWith('en') && /female|woman|girl|aria|jenny|sonia|libby/i.test(v.name));
      if (femaleEn) { voiceRef.current = femaleEn; return; }
      const anyEn = voices.find(v => v.lang.startsWith('en'));
      if (anyEn) voiceRef.current = anyEn;
    };
    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
  }, []);

  /* ─── Session duration countdown (PRESERVED) ──────────────────────────── */
  useEffect(() => {
    if (!interview) return;
    const parseDuration = (dur) => {
      const match = dur.match(/(\d+)/);
      return match ? parseInt(match[1], 10) * 60 : 15 * 60;
    };
    let secs = parseDuration(interview.duration);
    setSessionTimeLeft(secs);
    sessionTimerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      secs -= 1;
      setSessionTimeLeft(secs);
      if (secs <= 0) clearInterval(sessionTimerRef.current);
    }, 1000);
    return () => clearInterval(sessionTimerRef.current);
  }, [interview]);

  /* ─── Face-API models (PRESERVED) ─────────────────────────────────────── */
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js@0.22.2/weights';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setFaceStatus('Scanner ready');
      } catch { setFaceStatus('Scanner unavailable'); }
    };
    loadModels();
    return () => { if (faceInterval.current) clearInterval(faceInterval.current); };
  }, []);

  useEffect(() => {
    if (modelsLoaded && isCameraOn && videoRef.current) {
      faceInterval.current = setInterval(async () => {
        if (isPausedRef.current) return;
        if (videoRef.current?.readyState === 4 && !videoRef.current.paused) {
          try {
            const det = await faceapi
              .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceExpressions();
            if (det) {
              setFaceStatus('Scanning active...');
              const e = det.expressions;
              const s = e.happy*100 + e.neutral*85 + e.surprised*50 + e.sad*10 + e.fearful*5 + e.angry*5;
              confidenceData.current.total += Math.min(100, Math.max(0, s));
              confidenceData.current.count += 1;
            } else {
              setFaceStatus('No face detected');
            }
          } catch { /* silent */ }
        }
      }, 1500);
    } else {
      if (faceInterval.current) clearInterval(faceInterval.current);
      if (!isCameraOn) setFaceStatus('Camera is off');
    }
    return () => { if (faceInterval.current) clearInterval(faceInterval.current); };
  }, [modelsLoaded, isCameraOn]);

  /* ─── Camera + Recognition init ───────────────────────────────────────── */
  const initCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsCameraOn(mediaStream.getVideoTracks()[0]?.enabled ?? true);
      setIsMuted(!(mediaStream.getAudioTracks()[0]?.enabled ?? true));
      return mediaStream;
    } catch (err) {
      console.error('Camera access denied', err);
      setFaceStatus('Camera access denied');
      setIsCameraOn(false);
      return null;
    }
  }, []);

  // Sync current question on round load
  const triggerRoundQuestion = useCallback((round) => {
    if (!round) return;
    setIsAIThinking(true);
    setCurrentQuestion(round.q);
    speakText(round.q);
    setIsAIThinking(false);
  }, []);

  useEffect(() => {
    const fetchInterviewAndStart = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        const interviewData = res.data;
        setInterview(interviewData);

        // ── MOCK MODE: Trigger human greeting instead of immediate question
        const urlCompany = queryParams.get('company');
        const isCurrentlyMock = !urlCompany && (!interviewData || !interviewData.company);

        if (isCurrentlyMock) {
          // Small delay to let camera/mic initialize
          setTimeout(() => triggerMockGreeting(interviewData), 1200);
        } else {
          // Company interview — original round question trigger
          const firstRound = companyConfig.rounds[0];
          triggerRoundQuestion(firstRound);
        }
      } catch {
        // Fallback placeholder interview
        const fallbackInterview = {
          _id: id,
          role: roleQuery,
          company: companyQuery.toUpperCase(),
          difficulty: 'Medium',
          duration: '30 min'
        };
        setInterview(fallbackInterview);

        const urlCompany = queryParams.get('company');
        const isCurrentlyMock = !urlCompany && !companyQuery;
        if (isCurrentlyMock) {
          setTimeout(() => triggerMockGreeting(fallbackInterview), 1200);
        } else {
          const firstRound = companyConfig.rounds[0];
          triggerRoundQuestion(firstRound);
        }
      }
    };

    initCamera();
    fetchInterviewAndStart();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous      = true;
      recognition.interimResults  = true;
      recognition.lang            = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        if (isAIThinkingRef.current || isTypingModeRef.current) return;
        handleUserSpeaking();
        let newFinal = '';
        let interim  = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) { newFinal += transcript + ' '; }
          else                           { interim  += transcript; }
        }
        if (newFinal) {
          setFinalTranscript(prev => {
            const updated = prev + newFinal;
            finalTranscriptRef.current = updated;
            return updated;
          });
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
        }
      };

      recognition.onsoundstart = () => {
        if (!isAIThinkingRef.current && !isTypingModeRef.current && !isPausedRef.current) handleUserSpeaking();
      };
      recognition.onspeechstart = () => {
        if (!isAIThinkingRef.current && !isTypingModeRef.current && !isPausedRef.current) handleUserSpeaking();
      };
      recognition.onerror = (e) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') console.error('Speech error:', e.error);
        if (e.error === 'no-speech' || e.error === 'aborted') {
          setTimeout(() => {
            if (!isAIThinkingRef.current && !isTypingModeRef.current && !isPausedRef.current) {
              try { recognition.start(); } catch {}
            }
          }, 300);
        }
      };
      recognition.onend = () => {
        if (!isAIThinkingRef.current && !isTypingModeRef.current && !isPausedRef.current && !isMutedRef.current) {
          setTimeout(() => { try { recognition.start(); } catch {} }, 300);
        }
      };
      recognitionRef.current = recognition;
    }

    return () => {
      stream?.getTracks().forEach(t => t.stop());
      synthRef.current.cancel();
      recognitionRef.current?.stop();
      clearAutoSubmitTimers();
      toastTimers.current.forEach(clearTimeout);
    };
  }, [id, initCamera, companyKey]);

  /* ─── Ending step sequencer (PRESERVED) ───────────────────────────────── */
  useEffect(() => {
    if (!isEnding) return;
    setEndingStep(0);
    const delays = [0, 1000, 2200, 3400, 4600, 5800];
    const timers = delays.map((ms, i) => setTimeout(() => setEndingStep(i), ms));
    return () => timers.forEach(clearTimeout);
  }, [isEnding]);

  /* ─── Keyboard shortcuts ──────────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (isEnding) return;
      if (e.code === 'Space')   { e.preventDefault(); toggleMute(); }
      else if (e.code === 'KeyC') { e.preventDefault(); toggleCamera(); }
      else if (e.code === 'KeyF') { e.preventDefault(); handleFullscreen(); }
      else if (e.code === 'Escape') { e.preventDefault(); setShowEndConfirm(prev => !prev); }
    };
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [stream, isMuted, isCameraOn, isEnding]);

  /* ─── Auto-submit timer helpers ───────────────────────────────────────── */
  const clearAutoSubmitTimers = () => {
    if (autoSubmitTimer.current)   clearTimeout(autoSubmitTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    if (silenceTimer.current)      clearTimeout(silenceTimer.current);
    autoSubmitTimer.current   = null;
    countdownInterval.current = null;
    silenceTimer.current      = null;
    setAutoSubmitCountdown(null);
  };

  const handleUserSpeaking = () => {
    clearAutoSubmitTimers();
    silenceTimer.current = setTimeout(() => { startSilenceCountdown(); }, 2500);
  };

  const startSilenceCountdown = () => {
    if (autoSubmitTimer.current)   clearTimeout(autoSubmitTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    autoSubmitTimer.current = setTimeout(() => {
      setAutoSubmitCountdown(null);
      submitAnswer();
    }, AUTO_SUBMIT_DELAY);
    setAutoSubmitCountdown(60);
    countdownInterval.current = setInterval(() => {
      setAutoSubmitCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval.current);
          countdownInterval.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /* ─── TTS Speech Synthesis ────────────────────────────────────────────── */
  const speakText = (text) => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.lang   = 'en-US';
    utterance.rate   = 0.92;
    utterance.pitch  = 1.08;
    utterance.volume = 1.0;
    utterance.onstart = () => { setAiSpeaking(true); setInterviewerStatus('speaking'); recognitionRef.current?.stop(); setIsRecording(false); };
    utterance.onend   = () => { setAiSpeaking(false); setInterviewerStatus('listening'); startListening(); };
    utterance.onerror = () => { setAiSpeaking(false); setInterviewerStatus('listening'); startListening(); };
    synthRef.current.speak(utterance);
  };

  // ── Helper: speak a single chunk and return a promise ──
  const speakChunk = (text, opts = {}) => new Promise((resolve) => {
    if (!text) { resolve(); return; }
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utt.voice = voiceRef.current;
    utt.lang   = 'en-US';
    utt.rate   = opts.rate   ?? 0.90;
    utt.pitch  = opts.pitch  ?? 1.08;
    utt.volume = opts.volume ?? 1.0;
    utt.onend   = resolve;
    utt.onerror = resolve;
    synthRef.current.speak(utt);
  });

  // ── Helper: async delay ──
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  /* ─── TWO-PART Conversational TTS (MOCK MODE ONLY) ─────────────────────
     Speaks acknowledgement first (warm, slightly slower), then a natural
     pause, then speaks the next question (clear, professional tone).
  ─────────────────────────────────────────────────────────────────────── */
  const speakTextConversational = async (ackText, transitionText, questionText) => {
    synthRef.current.cancel();
    recognitionRef.current?.stop();
    setIsRecording(false);
    setAiSpeaking(true);
    setInterviewerStatus('speaking');

    // Part 1: Acknowledgement — warm, slightly slower
    if (ackText) {
      await speakChunk(ackText, { rate: 0.88, pitch: 1.10 });
      await delay(420); // micro-pause after acknowledgement
    }

    // Part 2: Transition (optional)
    if (transitionText) {
      await speakChunk(transitionText, { rate: 0.91, pitch: 1.07 });
      await delay(280);
    }

    // Part 3: The actual question — clear, professional
    if (questionText) {
      await speakChunk(questionText, { rate: 0.93, pitch: 1.05 });
    }

    setAiSpeaking(false);
    setInterviewerStatus('listening');
    startListening();
  };

  /* ─── Mock Interview Greeting Flow ─────────────────────────────────────
     Fires once when the mock interview starts. Creates a warm, natural
     human opening before the first question.
  ─────────────────────────────────────────────────────────────────────── */
  const triggerMockGreeting = async (interview) => {
    const typeLabel = interview?.type || 'Technical';
    const roleLabel = interview?.role || 'Software Engineer';
    const greetingParts = [
      `Good morning. Welcome to today's mock ${typeLabel} interview.`,
      `My name is Sarah, and I'll be your interviewer today.`,
      `I want this to feel like a real conversation, so please don't hesitate to think out loud.`,
      `Before we dive in — could you start by telling me a little about yourself?`
    ];
    
    setIsAIThinking(false);
    setInterviewerStatus('speaking');
    setAiSpeaking(true);

    for (let i = 0; i < greetingParts.length; i++) {
      setCurrentQuestion(greetingParts[i]);
      currentQuestionRef.current = greetingParts[i];
      await speakChunk(greetingParts[i], { rate: 0.88, pitch: 1.09 });
      await delay(i < greetingParts.length - 1 ? 300 : 500);
    }

    // Set full greeting as question display
    const fullGreeting = greetingParts.join(' ');
    setCurrentQuestion(fullGreeting);
    currentQuestionRef.current = fullGreeting;

    // Log greeting in conversation history
    setConversationHistory([{ sender: 'ai', text: fullGreeting, timestamp: Date.now() }]);
    setDialogLogs([{ sender: 'ai', text: fullGreeting }]);

    setAiSpeaking(false);
    setInterviewerStatus('listening');
    setInterviewStage('warmup');
    interviewStageRef.current = 'warmup';
    setGreetingDone(true);
    startListening();
  };

  const startListening = () => {
    if (recognitionRef.current && !isMuted && !isTypingMode) {
      try { recognitionRef.current.start(); setIsRecording(true); startSilenceCountdown(); }
      catch { /* already running */ }
    }
  };

  /* ─── Submit answer ───────────────────────────────────────────────────── */
  const submitAnswer = async () => {
    let answer = isTypingModeRef.current ? typedAnswer.trim() : finalTranscriptRef.current.trim();
    if (currentRound.type === 'coding') {
      answer = `[Submitted Solution Code in ${selectedLanguage}]:\n\n` + codeContent;
    } else if (currentRound.type === 'sql') {
      answer = `[Submitted SQL Query]:\n\n` + sqlQuery;
    } else if (currentRound.type === 'whiteboard') {
      answer = `[Submitted Architecture Layout Blocks]:\n` + JSON.stringify(blocks);
    }

    if (!answer && currentRound.type === 'text') return;

    setSubmittedAnswers(prev => [...prev, {
      roundIndex: questionNumber - 1,
      type: currentRound.type,
      answer: answer,
      skipped: false
    }]);

    recognitionRef.current?.stop();
    setIsRecording(false);
    clearAutoSubmitTimers();
    setIsAIThinking(true);

    // Save logs for bubble display
    const userAnswerDisplay = currentRound.type === 'coding' ? 'Shared source implementation in SDE editor.'
      : currentRound.type === 'sql' ? 'Submitted SQL query logic.'
      : currentRound.type === 'whiteboard' ? 'Finalized system architecture configuration.'
      : answer;

    const userMsg = { sender: 'user', text: userAnswerDisplay, timestamp: Date.now() };
    const aiMsg   = { sender: 'ai',   text: currentQuestion,   timestamp: Date.now() - 1 };
    setDialogLogs(prev => [...prev, aiMsg, userMsg]);

    setFinalTranscript('');
    setInterimTranscript('');
    setTypedAnswer('');
    finalTranscriptRef.current = '';

    const wasBookmarked = isBookmarked;
    setIsBookmarked(false);

    try {
      await api.post(`/interviews/${id}/answer`, {
        question: currentQuestionRef.current,
        answer,
        bookmarked: wasBookmarked,
      });
    } catch (e) {
      console.warn('Backend logging failed, fallback client evaluation active');
    }

    // ══════════════════════════════════════════════════════════════════
    // MOCK MODE — Premium Conversational AI Engine
    // ══════════════════════════════════════════════════════════════════
    if (isMock) {
      const currentStage = interviewStageRef.current;
      const currentQNum  = questionNumberRef.current;

      // Step 1: Analyzing state (1.5s) — avatar tilts head, thinks
      setInterviewerStatus('analyzing');
      await new Promise(res => setTimeout(res, 1500));

      // Step 2: Typing Notes state (0.7s) — avatar looks down
      setInterviewerStatus('typing');
      await new Promise(res => setTimeout(res, 700));

      // Step 3: Preparing follow-up state (0.6s) — avatar looks up
      setInterviewerStatus('preparing');
      await new Promise(res => setTimeout(res, 600));

      let convResponse = null;
      try {
        const convRes = await api.post(`/interviews/${id}/conversational-response`, {
          userAnswer: userAnswerDisplay,
          questionAsked: currentQuestionRef.current,
          conversationHistory: conversationHistory.slice(-6),
          questionNumber: currentQNum,
          interviewStage: currentStage
        });
        convResponse = convRes.data;
      } catch (err) {
        console.warn('Conversational response API failed, using fallback');
      }

      // Advance question counter and determine next stage
      const nextQNum = currentQNum + 1;
      questionNumberRef.current = nextQNum;
      setQuestionNumber(nextQNum);

      let nextStage = currentStage;
      if (currentStage === 'greeting') nextStage = 'warmup';
      else if (currentStage === 'warmup' && nextQNum >= 2) nextStage = 'core';
      else if (currentStage === 'core' && nextQNum >= 5) nextStage = 'deepdive';
      else if (nextQNum >= 9) nextStage = 'closing';
      setInterviewStage(nextStage);
      interviewStageRef.current = nextStage;

      // Trigger smile for excellent answers (> 80 words)
      const wordCount = userAnswerDisplay.split(/\s+/).length;
      if (wordCount > 80) {
        setOnExcellentAnswer(true);
        setTimeout(() => setOnExcellentAnswer(false), 2200);
      }

      if (convResponse) {
        const { acknowledgement, transition, nextQuestion, isClosing } = convResponse;

        // Append full exchange to conversation log
        const aiResponseText = [acknowledgement, transition, nextQuestion].filter(Boolean).join(' ');
        setConversationHistory(prev => [
          ...prev,
          { sender: 'user', text: userAnswerDisplay, timestamp: Date.now() - 2 },
          { sender: 'ai',   text: aiResponseText,    timestamp: Date.now() }
        ]);

        if (isClosing || nextStage === 'closing') {
          setCurrentQuestion(aiResponseText);
          currentQuestionRef.current = aiResponseText;
          setIsAIThinking(false);
          await speakTextConversational(acknowledgement, transition, nextQuestion);
          setTimeout(() => endInterview(), 2000);
          return;
        }

        setCurrentQuestion(nextQuestion);
        currentQuestionRef.current = nextQuestion;
        setIsAIThinking(false);

        // Speak conversationally: acknowledgement → pause → question
        await speakTextConversational(acknowledgement, transition, nextQuestion);
      } else {
        // Fallback for API failure
        setIsAIThinking(false);
        setInterviewerStatus('listening');
        startListening();
      }
      return;
    }

    // ══════════════════════════════════════════════════════════════════
    // COMPANY INTERVIEW MODE — Original round-based flow (PRESERVED)
    // ══════════════════════════════════════════════════════════════════
    const nextQ = questionNumber + 1;
    if (nextQ <= companyConfig.rounds.length) {
      setQuestionNumber(nextQ);
      const nextRound = companyConfig.rounds[nextQ - 1];
      triggerRoundQuestion(nextRound);
    } else {
      endInterview();
    }
  };

  /* ─── Skip question ───────────────────────────────────────────────────── */
  const skipQuestion = async () => {
    if (isAIThinkingRef.current) return;

    setSubmittedAnswers(prev => [...prev, {
      roundIndex: questionNumber - 1,
      type: currentRound.type,
      answer: 'Skipped',
      skipped: true
    }]);

    recognitionRef.current?.stop();
    setIsRecording(false);
    clearAutoSubmitTimers();
    setIsAIThinking(true);

    const userMsg = { sender: 'user', text: 'Skipped question' };
    const aiMsg = { sender: 'ai', text: currentQuestion };
    setDialogLogs(prev => [...prev, aiMsg, userMsg]);

    setFinalTranscript('');
    setInterimTranscript('');
    setTypedAnswer('');
    finalTranscriptRef.current = '';

    try {
      await api.post(`/interviews/${id}/answer`, {
        question: currentQuestionRef.current,
        answer:   'Skipped',
      });
    } catch {}

    const nextQ = questionNumber + 1;
    if (nextQ <= companyConfig.rounds.length) {
      setQuestionNumber(nextQ);
      const nextRound = companyConfig.rounds[nextQ - 1];
      triggerRoundQuestion(nextRound);
    } else {
      endInterview();
    }
  };

  /* ─── Typing mode toggling (PRESERVED) ────────────────────────────────── */
  const switchToTyping = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    clearAutoSubmitTimers();
    setTypedAnswer(finalTranscript.trim());
    setIsTypingMode(true);
  };

  const switchToSpeaking = () => {
    setIsTypingMode(false);
    startListening();
  };

  const handleTypedChange = (e) => {
    setTypedAnswer(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  /* ─── Mute, Camera, Pause controls ───────────────────────────────────── */
  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        if (!audioTrack.enabled) {
          recognitionRef.current?.stop();
          setIsRecording(false);
          clearAutoSubmitTimers();
        } else {
          startListening();
        }
      }
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        if (isCameraOn) {
          videoTrack.stop();
          setIsCameraOn(false);
        } else {
          navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } }
          }).then((newStream) => {
            const newTrack = newStream.getVideoTracks()[0];
            stream.removeTrack(videoTrack);
            stream.addTrack(newTrack);
            if (videoRef.current) videoRef.current.srcObject = stream;
            setIsCameraOn(true);
          }).catch((err) => {
            console.error("Failed to restore camera feed", err);
          });
        }
      }
    } else if (!isCameraOn) {
      initCamera();
    }
  };

  const togglePause = () => {
    setIsPaused(prev => {
      const next = !prev;
      if (next) {
        recognitionRef.current?.stop();
        synthRef.current.cancel();
        setIsRecording(false);
        setAiSpeaking(false);
        clearAutoSubmitTimers();
      } else {
        startListening();
      }
      return next;
    });
  };

  const toggleBookmark = () => {
    setIsBookmarked(p => !p);
    addToast(isBookmarked ? 'Question bookmark removed' : 'Question bookmarked for review', 'success');
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  /* ─── SQL Execution simulation ────────────────────────────────────────── */
  const executeSQL = () => {
    if (!sqlQuery.trim()) {
      addToast('Please input query syntax', 'warning');
      return;
    }
    setSqlResult('running');
    setTimeout(() => {
      setSqlResult([
        { id: 101, name: 'Amit Sharma', salary: 98000 },
        { id: 104, name: 'Sanjay Dutt', salary: 85000 },
        { id: 102, name: 'Neha Patil', salary: 76000 }
      ]);
      addToast('Query executed successfully. 3 rows fetched.', 'success');
    }, 900);
  };

  /* ─── Whiteboard canvas drawing events ─────────────────────────────────── */
  const handleCanvasMouseDown = (e) => {
    if (currentRound.type !== 'whiteboard') return;
    const canvas = canvasRefDraw.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRefDraw.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = canvasRefDraw.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      addToast('Canvas cleared', 'success');
    }
  };

  const addBlockToDesign = (type) => {
    const id = Date.now().toString();
    const label = type === 'Client' ? 'Client Request' : type === 'Gateway' ? 'Load Balancer' : type === 'Service' ? 'Microservice API' : type === 'Database' ? 'Cassandra Storage' : 'Elastic Cache';
    setBlocks(prev => [...prev, { id, type, x: 100, y: 100, label }]);
    addToast(`Added ${type} block to workspace`, 'success');
  };

  /* ─── End Interview Sequence ────────────────────────────────────────── */
  const endInterview = () => {
    setShowEndConfirm(true);
  };

  const confirmEndInterview = async () => {
    setShowEndConfirm(false);
    setIsEnding(true);
    setEndingStep(0);

    // Dynamic AI Scoring engine based on candidate interactions
    const totalConfidenceCount = confidenceData.current.count || 1;
    const calculatedConf = Math.round(confidenceData.current.total / totalConfidenceCount);

    // Real scoring evaluation based on actual answers
    const roundsCount = companyConfig.rounds.length;
    const roundScores = companyConfig.rounds.map((round, idx) => {
      const sub = submittedAnswers.find(s => s.roundIndex === idx);
      
      if (!sub || sub.skipped || !sub.answer || sub.answer.trim().toLowerCase() === 'skipped') {
        return 0; // Did not answer or skipped gets 0
      }

      const ans = sub.answer.trim();

      if (round.type === 'coding') {
        const defaultCode = round.starterCode?.[selectedLanguage] || '';
        const cleanAns = ans.replace(`[Submitted Solution Code in ${selectedLanguage}]:`, '').trim();
        const cleanDefault = defaultCode.trim();
        
        if (!cleanAns || cleanAns === cleanDefault || cleanAns.length < 50 || cleanAns.includes('// Write your logic here')) {
          return 0; // Empty/default template code gets 0
        }
        let score = 50;
        if (cleanAns.includes('for') || cleanAns.includes('while')) score += 15;
        if (cleanAns.includes('if') || cleanAns.includes('else')) score += 10;
        if (cleanAns.includes('return')) score += 15;
        if (cleanAns.length > 150) score += 10;
        return Math.min(100, score);
      }

      if (round.type === 'sql') {
        const cleanAns = ans.replace(`[Submitted SQL Query]:`, '').trim();
        if (!cleanAns || cleanAns.length < 15 || cleanAns.includes('Write your query here')) {
          return 0;
        }
        let score = 50;
        const upperSql = cleanAns.toUpperCase();
        if (upperSql.includes('SELECT')) score += 10;
        if (upperSql.includes('FROM')) score += 10;
        if (upperSql.includes('WHERE')) score += 15;
        if (upperSql.includes('JOIN') || upperSql.includes('GROUP BY')) score += 15;
        return Math.min(100, score);
      }

      if (round.type === 'whiteboard') {
        try {
          const blocksJson = ans.replace(`[Submitted Architecture Layout Blocks]:`, '').trim();
          const blocksArr = JSON.parse(blocksJson);
          if (!blocksArr || blocksArr.length === 0) return 0;
          return Math.min(100, 40 + blocksArr.length * 15);
        } catch {
          return 30;
        }
      }

      const wordCount = ans.split(/\s+/).length;
      if (wordCount < 5) {
        return 5; // Extremely short answer gets almost 0
      }

      let score = 40;
      if (wordCount > 10) score += 15;
      if (wordCount > 30) score += 20;
      if (wordCount > 60) score += 15;
      
      const keywords = ['experience', 'project', 'scale', 'optimize', 'performance', 'system', 'design', 'algorithm', 'logic', 'team', 'challenge', 'solve', 'work'];
      let matchCount = 0;
      keywords.forEach(kw => {
        if (ans.toLowerCase().includes(kw)) matchCount++;
      });
      score += Math.min(15, matchCount * 3);

      return Math.min(100, score);
    });

    const averageRoundScore = roundScores.reduce((a, b) => a + b, 0) / roundsCount;

    const techRounds = companyConfig.rounds.filter(r => ['coding', 'sql', 'whiteboard', 'system-design', 'technical'].includes(r.type));
    let technicalScore = 0;
    if (techRounds.length > 0) {
      let sum = 0;
      techRounds.forEach(r => {
        const idx = companyConfig.rounds.indexOf(r);
        sum += roundScores[idx];
      });
      technicalScore = Math.round(sum / techRounds.length);
    } else {
      technicalScore = Math.round(averageRoundScore);
    }

    const codeRounds = companyConfig.rounds.filter(r => ['coding', 'sql'].includes(r.type));
    let codingScore = 0;
    if (codeRounds.length > 0) {
      let sum = 0;
      codeRounds.forEach(r => {
        const idx = companyConfig.rounds.indexOf(r);
        sum += roundScores[idx];
      });
      codingScore = Math.round(sum / codeRounds.length);
    } else {
      codingScore = Math.round(averageRoundScore * 0.9);
    }

    const wasSilent = averageRoundScore < 10;
    const communicationScore = wasSilent ? 0 : Math.round((hudClarity + calculatedConf + hudFluency) / 3);
    const behavioralScore = wasSilent ? 0 : Math.max(20, calculatedConf);
    const projectScore = wasSilent ? 0 : Math.round(averageRoundScore * 1.05);

    const overallScore = wasSilent ? 0 : Math.round((technicalScore * 0.3) + (codingScore * 0.25) + (communicationScore * 0.2) + (behavioralScore * 0.15) + (projectScore * 0.1));

    // Simulated evaluation queue updates
    await new Promise(resolve => setTimeout(resolve, 6000));

    const resultReport = {
      overallScore,
      passed: overallScore >= 60,
      technicalScore,
      behavioralScore,
      communicationScore,
      codingScore,
      projectScore,
      recommendation: overallScore >= 60 ? 'Hired / Highly Recommended' : 'Better Luck Next Time',
      strengths: [
        'Demonstrates structured and clear logic during analytical explanations.',
        'Good eye contact, consistent tone, and high speech confidence indicators.',
        'Accurate architecture patterns and systems database layout skills.'
      ],
      weakAreas: [
        'Can optimize low-level syntax constraints to minimize edge errors.',
        'Frequent use of vocal filler words like "um" or "actually" during stress.',
        'Needs structural details on database shard limits and message queues.'
      ],
      suggestedImprovements: [
        'Practice time-complexity analyses for tree algorithms.',
        'Focus on reducing filler words via breathing breaks.',
        'Review database normalization bounds.'
      ]
    };

    setFinalReportData(resultReport);
    setIsEnding(false);
    setShowReportPage(true);
  };

  // Write finalized scores to simulation board context
  const handleSaveAndProceed = () => {
    if (isMock) {
      navigate(`/mock-report/${interview?._id}`);
      return;
    }

    const storageKey = `placement_simulation_${companyQuery}`;
    const savedState = localStorage.getItem(storageKey);
    const score = finalReportData.overallScore;

    if (savedState) {
      const stateObj = JSON.parse(savedState);
      const currentStep = stateObj.currentPipelineStep || 2;

      const updatedScores = { ...stateObj.scores, [currentStep]: score };
      const updatedDetails = {
        ...stateObj.roundDetails,
        [currentStep]: {
          score,
          passed: score >= 60,
          feedback: score >= 60
            ? 'Excellent execution! Candidate has cleared selection parameters.'
            : 'Fell short of threshold score constraints. Performance optimization required.',
          timeTaken: '20 mins',
          difficulty: stateObj.selectedTrack?.difficulty || 'Medium'
        }
      };

      const nextStep = score >= 60 ? currentStep + 1 : currentStep;

      localStorage.setItem(storageKey, JSON.stringify({
        ...stateObj,
        scores: updatedScores,
        roundDetails: updatedDetails,
        currentPipelineStep: nextStep,
        activeTab: 'dashboard'
      }));
    }

    // Return to company details simulation roadmap view
    navigate(`/companies/${companyQuery}`);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // UI RENDERERS
  // ─────────────────────────────────────────────────────────────────────────

  // REPORT SUMMARY OVERLAY SCREEN
  if (showReportPage && finalReportData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070711] text-slate-900 dark:text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-white/10 pb-6 mb-8 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400" style={{ color: isMock ? '#6366f1' : companyConfig.accentColor }}>
                {isMock ? `PRACTICE MODE: ${interview?.type?.toUpperCase() || 'MOCK INTERVIEW'}` : companyConfig.title}
              </span>
              <h1 className="text-2xl font-black mt-1">{isMock ? 'Mock Practice Session Evaluation Report' : 'AI Evaluation &amp; Grading Report'}</h1>
            </div>
            <div className={`px-4 py-2 rounded-xl border text-sm font-black flex items-center gap-2 ${
              finalReportData.passed ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-500 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/35 text-red-500 dark:text-red-400'
            }`}>
              {finalReportData.passed ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{finalReportData.recommendation}</span>
            </div>
          </div>

          {/* Scores Matrix Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Technical', val: finalReportData.technicalScore, color: 'from-blue-500 to-indigo-500' },
              { label: 'Behavioral', val: finalReportData.behavioralScore, color: 'from-pink-500 to-rose-500' },
              { label: 'Communication', val: finalReportData.communicationScore, color: 'from-amber-500 to-orange-500' },
              { label: 'Coding', val: finalReportData.codingScore, color: 'from-emerald-500 to-teal-500' },
              { label: 'Projects', val: finalReportData.projectScore, color: 'from-purple-500 to-violet-500' }
            ].map((s, idx) => (
              <div key={idx} className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 p-4 rounded-2xl text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{s.label}</div>
                <div className="text-2xl font-black" style={{ color: companyConfig.accentColor }}>
                  {s.val}%
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-indigo-500" style={{ width: `${s.val}%`, backgroundColor: companyConfig.accentColor }} />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed analysis feedback grids */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 p-6 rounded-2xl">
              <h3 className="text-sm font-black text-emerald-500 dark:text-emerald-400 mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" /> Key Strengths
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {finalReportData.strengths.map((str, i) => (
                  <li key={i} className="flex gap-2 items-start leading-relaxed">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 p-6 rounded-2xl">
              <h3 className="text-sm font-black text-amber-500 dark:text-amber-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Recommended Improvements
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {finalReportData.weakAreas.map((w, i) => (
                  <li key={i} className="flex gap-2 items-start leading-relaxed">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Log History */}
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Round Conversation Transcript Log</h3>
            <div className="max-h-48 overflow-y-auto bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 space-y-3 font-mono text-[11px] leading-relaxed no-scrollbar text-slate-700 dark:text-slate-300">
              {dialogLogs.length > 0 ? dialogLogs.map((log, idx) => (
                <div key={idx} className={`p-2 rounded ${log.sender === 'user' ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  <strong>{log.sender === 'user' ? 'Candidate' : 'Interviewer'}:</strong> {log.text}
                </div>
              )) : (
                <div className="text-slate-500 text-center py-4">No transcripts generated during simple rounds.</div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center border-t border-white/10 pt-6">
            <div className="text-xs text-slate-500">
              Score: {finalReportData.overallScore}% · Passing criteria: 60%
            </div>
            <button
              onClick={handleSaveAndProceed}
              className="px-8 py-3 rounded-xl text-xs font-black text-white hover:opacity-90 transition-all cursor-pointer shadow-lg"
              style={{ backgroundColor: isMock ? '#6366f1' : companyConfig.accentColor }}
            >
              {isMock ? 'Finish Practice & Exit' : (finalReportData.passed ? 'Proceed & Save Results' : 'Return (Re-attempt Round)')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // STANDARD VIEW STATES
  if (!interview) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-[#070b1a] text-slate-900 dark:text-white flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
        <div className="text-center">
          <h2 className="text-white text-base font-semibold">Preparing Premium AI Room</h2>
          <p className="text-slate-500 text-xs mt-1">Configuring low-level compilations...</p>
        </div>
      </div>
    );
  }

  if (isEnding) {
    const progress = ((endingStep + 1) / ENDING_STEPS.length) * 100;
    return (
      <div className="h-screen bg-slate-50 dark:bg-[#070b1a] flex flex-col items-center justify-center relative overflow-hidden text-slate-900 dark:text-white">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6"
        >
          <div className="relative w-20 h-20 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent"
            />
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Compiling Assessment Evaluation</h2>
            <p className="text-slate-400 text-xs">Our grading matrix is evaluating your logical criteria...</p>
          </div>

          <div className="w-full space-y-2">
            {ENDING_STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = endingStep > i;
              const current = endingStep === i;
              const pending = endingStep < i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: pending ? 0.28 : 1, x: 0 }}
                  className={`flex items-center gap-3 py-2 px-3 rounded-xl border transition-all ${
                    current ? step.bg : done ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-transparent border-transparent'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    done ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700'
                  }`}>
                    {done ? (
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    ) : current ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-2.5 h-2.5 rounded-full border border-t-transparent border-indigo-400"
                      />
                    ) : (
                      <Icon className="w-2.5 h-2.5 text-slate-600" />
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${done ? 'text-emerald-400' : current ? step.color : 'text-slate-600'}`}>
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="w-full space-y-1">
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-indigo-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <p className="text-[10px] text-slate-600 text-right">{Math.round(progress)}% complete</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#070b1a] text-slate-900 dark:text-white flex flex-col overflow-hidden select-none">
      
      {/* Invisible preserved canvas analyser elements */}
      <canvas ref={canvasRef} className="absolute opacity-0 pointer-events-none" width={1} height={1} />

      {/* ─── STATUS HEADER ─── */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-4 bg-white dark:bg-slate-950/80 border-b border-zinc-200 dark:border-white/10 z-30 text-slate-900 dark:text-white">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white" style={{ background: `linear-gradient(to bottom right, ${companyConfig.accentColor}, #fff)` }}>
            IX
          </div>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: companyConfig.accentColor }}>
            {companyConfig.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-bold font-mono text-slate-700 dark:text-white">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {sessionTimeLeft !== null
                ? `${String(Math.floor(sessionTimeLeft/60)).padStart(2,'0')}:${String(sessionTimeLeft%60).padStart(2,'0')}`
                : interview.duration}
            </span>
          </div>

          <button
            onClick={togglePause}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
              isPaused ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-slate-400 hover:bg-zinc-200'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={endInterview}
            className="flex items-center gap-1.5 px-3 py-1 border border-red-500/20 bg-red-500/10 hover:bg-red-600 rounded-lg text-xs font-semibold text-red-400 hover:text-white transition-all"
          >
            <FaStopCircle /> End Interview
          </button>
        </div>
      </div>

      {/* ─── MAIN PLATFORM LAYOUT ─── */}
      {isMock ? (
        <MockInterviewRoom
          interview={interview}
          archetype={mockArchetype}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          isAIThinking={isAIThinking}
          setIsAIThinking={setIsAIThinking}
          aiSpeaking={aiSpeaking}
          setAiSpeaking={setAiSpeaking}
          isMuted={isMuted}
          toggleMute={toggleMute}
          isCameraOn={isCameraOn}
          toggleCamera={toggleCamera}
          videoRef={videoRef}
          stream={stream}
          hudConfidence={hudConfidence}
          hudClarity={hudClarity}
          hudWpm={hudWpm}
          faceStatus={faceStatus}
          codeContent={codeContent}
          setCodeContent={setCodeContent}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          sqlResult={sqlResult}
          setSqlResult={setSqlResult}
          blocks={blocks}
          setBlocks={setBlocks}
          addBlockToDesign={addBlockToDesign}
          clearDrawing={clearDrawing}
          canvasRefDraw={canvasRefDraw}
          handleCanvasMouseDown={handleCanvasMouseDown}
          handleCanvasMouseMove={handleCanvasMouseMove}
          handleCanvasMouseUp={handleCanvasMouseUp}
          submitAnswer={submitAnswer}
          dialogLogs={dialogLogs}
          isTypingMode={isTypingMode}
          switchToSpeaking={switchToSpeaking}
          switchToTyping={switchToTyping}
          typedAnswer={typedAnswer}
          setTypedAnswer={setTypedAnswer}
          handleTypeAnswerSubmit={handleTypeAnswerSubmit}
          theme={theme}
          sessionTimeLeft={sessionTimeLeft}
          togglePause={togglePause}
          isPaused={isPaused}
          endInterview={endInterview}
          isRecording={isRecording}
          isBookmarked={isBookmarked}
          toggleBookmark={toggleBookmark}
          interviewerStatus={interviewerStatus}
          conversationHistory={conversationHistory}
          conversationLogOpen={conversationLogOpen}
          setConversationLogOpen={setConversationLogOpen}
          onExcellentAnswer={onExcellentAnswer}
          interviewStage={interviewStage}
        />
      ) : (
        <div className="flex-1 flex gap-3 p-3 overflow-hidden min-h-0 relative">
        
        {/* LEFT COLUMN: INTERVIEWER & CANDIDATE CAMERA */}
        <div className="w-[300px] flex flex-col gap-3 flex-shrink-0 overflow-y-auto no-scrollbar">
          
          {/* Interviewer Card */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/30 mb-3 relative flex-shrink-0">
              {companyConfig.interviewerAvatar ? (
                <img src={companyConfig.interviewerAvatar} alt={companyConfig.interviewerName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            
            <h3 className="text-sm font-bold text-white">{companyConfig.interviewerName}</h3>
            <p className="text-[10px] text-slate-400 leading-tight mt-1">{companyConfig.interviewerTitle}</p>
            
            <div className="w-full border-t border-white/5 my-3" />
            
            <div className="w-full bg-black/40 border border-white/5 rounded-xl p-2.5 text-left flex items-start gap-2">
              <span className={`w-2 h-2 rounded-full mt-1.5 ${isAIThinking ? 'bg-amber-400 animate-ping' : aiSpeaking ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`} />
              <div className="text-[10px]">
                <span className="text-slate-500 block">Current Status</span>
                <span className="text-slate-300 font-semibold uppercase tracking-wider">
                  {isAIThinking ? 'Analyzing response' : aiSpeaking ? 'Speaking' : 'Listening'}
                </span>
              </div>
            </div>
          </div>

          {/* Candidate Card */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden relative flex flex-col">
            <div className="w-full h-56 bg-slate-950/80 relative flex items-center justify-center overflow-hidden flex-shrink-0">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isCameraOn ? 'opacity-0 hidden' : 'opacity-100'}`}
              />

              {!isCameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <span className="text-[10px] text-slate-500">Camera is off</span>
                </div>
              )}

              <div className="absolute top-2 left-2 bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[9px] text-slate-400">
                {faceStatus}
              </div>
            </div>

            {/* Simulated candidate overlays */}
            <div className="p-3 bg-slate-950/40 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Confidence</span>
                <span className="font-mono text-slate-200">{!isCameraOn ? 0 : hudConfidence}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${!isCameraOn ? 0 : hudConfidence}%` }} />
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Speech Clarity</span>
                <span className="font-mono text-slate-200">{(!isRecording || isMuted) ? 0 : hudClarity}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${(!isRecording || isMuted) ? 0 : hudClarity}%` }} />
              </div>
              
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">WPM / Speed</span>
                <span className="font-mono text-slate-200">{(!isRecording || isMuted) ? 0 : hudWpm} wpm</span>
              </div>
            </div>

            {/* Audio wave simulation at camera bottom */}
            <WaveformVisualizer stream={stream} isActive={!isMuted && isRecording} />

            {/* Live Controls */}
            <div className="flex justify-around items-center p-2.5 bg-black/40 border-t border-white/5">
              <button
                onClick={toggleMute}
                className={`p-1.5 rounded-lg border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
              >
                {isMuted ? <FaMicrophoneSlash className="text-xs" /> : <FaMicrophone className="text-xs" />}
              </button>
              
              <button
                onClick={toggleCamera}
                className={`p-1.5 rounded-lg border transition-all ${!isCameraOn ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
              >
                {!isCameraOn ? <FaVideoSlash className="text-xs" /> : <FaVideo className="text-xs" />}
              </button>
              
              <button
                onClick={toggleBookmark}
                className={`p-1.5 rounded-lg border transition-all ${isBookmarked ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
              >
                <FaBookmark className="text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: WORKSPACE CONTAINER */}
        <div className="flex-1 bg-white/[0.01] border border-white/10 rounded-2xl flex flex-col overflow-hidden min-w-0">
          
          {/* Active Round Info Header */}
          <div className="flex-shrink-0 bg-slate-950/50 border-b border-white/5 p-4 flex justify-between items-center gap-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Active Stage Round</span>
              <h2 className="text-sm font-bold text-white">{currentRound.label}</h2>
            </div>
            <div className="text-[10px] text-slate-400 bg-white/5 px-2.5 py-1 rounded border border-white/10 leading-none">
              Round {questionNumber} of {companyConfig.rounds.length}
            </div>
          </div>

          {/* Dynamic Workspace Workspace */}
          <div className="flex-1 overflow-hidden min-h-0 relative">
            
            {/* WORKSPACE A: MONACO CODING IDE */}
            {currentRound.type === 'coding' && (
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 bg-black/40 px-4 py-2 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-indigo-400 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" /> Compiler IDE
                    </span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-slate-900 border border-white/10 text-xs rounded px-2.5 py-1 text-slate-300 focus:outline-none"
                    >
                      <option value="python">Python 3</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java 17</option>
                      <option value="cpp">C++ 20</option>
                    </select>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Auto-save active
                  </div>
                </div>

                <div className="flex-1 grid grid-rows-2 md:grid-rows-1 md:grid-cols-5 min-h-0">
                  <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-white/5 flex flex-col min-h-0">
                    <div className="p-4 overflow-y-auto max-h-[140px] md:max-h-none text-xs leading-relaxed text-slate-300 bg-slate-950/20 border-b border-white/5">
                      <h4 className="font-bold text-white mb-2">{CODING_PROBLEMS[currentRound.problemId]?.title}</h4>
                      <p className="text-slate-400 leading-normal">{CODING_PROBLEMS[currentRound.problemId]?.description}</p>
                    </div>
                    <div className="flex-1 min-h-0">
                      <Editor
                        theme={theme === 'dark' ? 'vs-dark' : 'light'}
                        language={selectedLanguage}
                        value={codeContent}
                        onChange={(val) => setCodeContent(val)}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 12,
                          lineHeight: 18,
                          lineNumbers: 'on',
                          scrollbar: { vertical: 'visible' }
                        }}
                      />
                    </div>
                  </div>

                  {/* Run / Submit console section */}
                  <div className="md:col-span-2 bg-zinc-50 dark:bg-[#05070e] p-4 flex flex-col min-h-0 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-white/5">
                    <div className="flex-shrink-0 flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Console Terminal</span>
                      <button
                        onClick={submitAnswer}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white rounded transition-colors"
                      >
                        Submit Solution
                      </button>
                    </div>
                    
                    <div className="flex-1 bg-black border border-white/5 rounded-lg p-3 font-mono text-xs text-slate-400 overflow-y-auto no-scrollbar">
                      <span className="text-slate-500 block mb-1">Grading Queue Output...</span>
                      <span className="text-emerald-400 block font-semibold">&gt; Code analyzer active</span>
                      <span className="block mt-2 text-[10.5px]">Waiting for compilation and execution submission parameters. Grade will be output instantly.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WORKSPACE B: SQL QUERY EDITOR */}
            {currentRound.type === 'sql' && (
              <div className="h-full flex flex-col bg-zinc-50 dark:bg-[#05070e] p-4">
                <div className="bg-slate-950 border border-white/10 rounded-xl p-4 mb-4">
                  <h4 className="font-bold text-xs text-white mb-1.5 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-indigo-400" /> Employees Schema Table Reference
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
                    <div><strong>Column</strong><br/>id (INT, PK)<br/>name (VARCHAR)<br/>salary (INT)</div>
                    <div><strong>Example Row 1</strong><br/>1<br/>Amit Kumar<br/>95000</div>
                    <div><strong>Example Row 2</strong><br/>2<br/>Suresh Gupta<br/>62000</div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-3 min-h-0">
                  <div className="flex-1 border border-white/5 rounded-xl overflow-hidden min-h-0">
                    <textarea
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      className="w-full h-full bg-slate-950 font-mono text-xs p-3 focus:outline-none resize-none text-white border-none leading-relaxed"
                    />
                  </div>

                  <div className="h-32 bg-slate-950/60 border border-white/5 rounded-xl p-3 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-2 flex-shrink-0">
                      <span className="text-[10px] text-slate-500 uppercase font-black">Execution Result Grid</span>
                      <div className="flex gap-2">
                        <button
                          onClick={executeSQL}
                          className="px-3.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-[10.5px] font-bold rounded transition-colors"
                        >
                          Run Query
                        </button>
                        <button
                          onClick={submitAnswer}
                          className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-[10.5px] font-bold rounded transition-colors"
                        >
                          Submit SQL
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[10.5px] text-slate-400">
                      {sqlResult === 'running' ? (
                        <div className="text-amber-400 animate-pulse">Running SQL query compilation logic...</div>
                      ) : sqlResult ? (
                        <table className="w-full text-left border-collapse border border-white/5">
                          <thead>
                            <tr className="bg-white/5">
                              <th className="p-1 border border-white/5">id</th>
                              <th className="p-1 border border-white/5">name</th>
                              <th className="p-1 border border-white/5">salary</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sqlResult.map((row, i) => (
                              <tr key={i} className="hover:bg-white/5">
                                <td className="p-1 border border-white/5">{row.id}</td>
                                <td className="p-1 border border-white/5">{row.name}</td>
                                <td className="p-1 border border-white/5">{row.salary}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-slate-600">Enter query statements and click Run Query to verify data logs.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WORKSPACE C: SYSTEM DESIGN WHITEBOARD */}
            {currentRound.type === 'whiteboard' && (
              <div className="h-full flex flex-col md:flex-row min-h-0">
                
                {/* Left controls */}
                <div className="w-full md:w-[130px] bg-slate-950/60 border-b md:border-b-0 md:border-r border-white/5 p-3 flex md:flex-col gap-2 flex-shrink-0 overflow-x-auto no-scrollbar">
                  <span className="hidden md:block text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2">Block Tools</span>
                  {[
                    { label: 'Client', type: 'Client' },
                    { label: 'API Gateway', type: 'Gateway' },
                    { label: 'Service', type: 'Service' },
                    { label: 'Database', type: 'Database' },
                    { label: 'Redis Cache', type: 'Cache' }
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => addBlockToDesign(btn.type)}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-left font-bold flex items-center gap-1 text-slate-300 flex-shrink-0"
                    >
                      <Plus className="w-3 h-3" /> {btn.label}
                    </button>
                  ))}
                  <div className="hidden md:block w-full border-t border-white/5 my-2" />
                  <button
                    onClick={clearDrawing}
                    className="px-2 py-1.5 border border-red-500/25 bg-red-500/10 hover:bg-red-500 hover:text-white rounded text-[10px] text-left font-bold flex items-center gap-1 text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Sketch
                  </button>
                </div>

                {/* Right Interactive Drag Grid Area */}
                <div className="flex-1 relative bg-zinc-50 dark:bg-[#090b14] overflow-hidden flex flex-col min-h-0">
                  <div className="absolute top-2 left-2 z-10 bg-slate-900/80 px-2 py-1 rounded border border-white/10 text-[9px] text-slate-500">
                    Drag blocks to design architecture or use cursor sketch
                  </div>

                  <canvas
                    ref={canvasRefDraw}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    className="absolute inset-0 z-0 cursor-crosshair"
                    width={800}
                    height={600}
                  />

                  {/* HTML5 draggable blocks list */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {blocks.map(b => (
                      <div
                        key={b.id}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.parentNode.getBoundingClientRect();
                          setDraggingBlock({
                            id: b.id,
                            startX: e.clientX - b.x,
                            startY: e.clientY - b.y
                          });
                        }}
                        onMouseMove={(e) => {
                          if (!draggingBlock || draggingBlock.id !== b.id) return;
                          const rect = e.currentTarget.parentNode.getBoundingClientRect();
                          const newX = e.clientX - draggingBlock.startX;
                          const newY = e.clientY - draggingBlock.startY;
                          setBlocks(prev => prev.map(item => item.id === b.id ? { ...item, x: Math.max(0, Math.min(rect.width - 90, newX)), y: Math.max(0, Math.min(rect.height - 50, newY)) } : item));
                        }}
                        onMouseUp={() => setDraggingBlock(null)}
                        className="absolute pointer-events-auto bg-slate-900 border border-indigo-500/40 rounded-lg p-2.5 text-center cursor-move select-none shadow-xl flex flex-col justify-center min-w-[90px] h-[50px] leading-tight"
                        style={{ left: b.x, top: b.y }}
                      >
                        <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 block">{b.type}</span>
                        <span className="text-[10px] text-white font-bold block truncate mt-0.5">{b.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Submission Row */}
                  <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                    <button
                      onClick={submitAnswer}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-black rounded-lg transition-colors shadow-lg"
                    >
                      Submit Diagram Layout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* WORKSPACE D: STANDARD CONVERSATION DIALOG CHAT */}
            {currentRound.type === 'text' && (
              <div className="h-full flex flex-col justify-between p-4 bg-zinc-50 dark:bg-[#05070e] overflow-y-auto no-scrollbar">
                
                {/* Chat dialogues log */}
                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar mb-4">
                  {dialogLogs.map((log, idx) => (
                    <div key={idx} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        log.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-900 text-slate-200 border border-white/5 rounded-bl-none'
                      }`}>
                        {log.text}
                      </div>
                    </div>
                  ))}

                  {/* Live prompt message box */}
                  <div className="flex justify-start">
                    <div className="max-w-md p-4 bg-slate-900 border border-indigo-500/20 text-slate-100 rounded-2xl rounded-bl-none shadow-lg">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Interviewer Prompt</span>
                      </div>
                      <p className="text-xs leading-relaxed font-semibold">{currentQuestion}</p>
                    </div>
                  </div>
                </div>

                {/* Candidate speaking transcript/typing container */}
                <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center flex-wrap gap-2 mb-1">
                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Candidate Response</span>
                    <button
                      onClick={isTypingMode ? switchToSpeaking : switchToTyping}
                      className="px-2.5 py-1 border border-white/10 hover:bg-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1"
                    >
                      {isTypingMode ? <><Mic className="w-3 h-3" /> Voice Answer</> : <><Keyboard className="w-3 h-3" /> Text Mode</>}
                    </button>
                  </div>

                  <div className="min-h-[50px]">
                    {isTypingMode ? (
                      <textarea
                        value={typedAnswer}
                        onChange={handleTypedChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your response... (Enter to submit, Shift+Enter for new line)"
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 resize-none min-h-[50px] leading-relaxed"
                      />
                    ) : (
                      <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5 min-h-[50px] flex items-center text-xs leading-relaxed">
                        {finalTranscript ? (
                          <p className="text-slate-200">
                            {finalTranscript}
                            {interimTranscript && <span className="text-slate-500 italic"> {interimTranscript}</span>}
                          </p>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-600 text-[11px] select-none">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                            <span>Voice recognition active. Speak clearly or toggle typing mode to submit answers.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-white/5 pt-2 flex-shrink-0">
                    <button
                      onClick={skipQuestion}
                      className="px-4 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold text-slate-400 transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={submitAnswer}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white rounded-lg transition-colors"
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STAGES CHECKLIST TIMELINE */}
        <div className="w-[280px] bg-white/[0.01] border border-white/10 rounded-2xl p-4 flex flex-col gap-4 flex-shrink-0 overflow-y-auto no-scrollbar">
          
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Interview Progress Flow</h3>
            <div className="space-y-2">
              {companyConfig.rounds.map((rnd, idx) => {
                const isCurrent = idx === currentRoundIdx;
                const isDone = idx < currentRoundIdx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-[11.5px] transition-all ${
                      isCurrent
                        ? 'bg-indigo-500/10 border-indigo-500/30 font-bold text-white'
                        : isDone
                        ? 'bg-emerald-500/5 border-emerald-500/15 text-slate-400'
                        : 'bg-transparent border-transparent text-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] ${
                      isCurrent
                        ? 'border-indigo-400 bg-indigo-500 text-white'
                        : isDone
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 text-slate-600'
                    }`}
                      style={isCurrent ? { backgroundColor: companyConfig.accentColor, borderColor: companyConfig.accentColor } : {}}
                    >
                      {isDone ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                    </div>
                    <span className="truncate">{rnd.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/5 my-1" />

          {/* Live grading accuracy index */}
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Live AI Grading Index</h3>
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 space-y-3">
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-slate-500">Technical Accuracy</span>
                  <span className="font-mono text-indigo-400 font-bold">86%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: '86%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-slate-500">Alignment Rating</span>
                  <span className="font-mono text-indigo-400 font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Tips helper box */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-3 text-[10px] leading-relaxed text-slate-400">
              <span className="font-bold text-white block mb-1">💡 Professional Tip</span>
              Always outline assumptions and discuss complexity tradeoffs before writing source logic.
            </div>
          </div>
        </div>

      </div>
      )}

      {/* ─── END CONFIRM MODAL ─── */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 border border-white/15 rounded-2xl p-6 text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto mb-4 text-red-500 text-lg">
                <FaStopCircle />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">Submit and End Interview?</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                This will finalize this round submission and compile your scores instantly. You cannot undo this.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  Resume Round
                </button>
                <button
                  onClick={confirmEndInterview}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                >
                  Compile &amp; End
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── toast lists ─── */}
      <div className="fixed top-[72px] right-4 flex flex-col gap-2 z-50 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 120, opacity: 0 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl max-w-[260px] pointer-events-auto text-xs ${
                toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' :
                toast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' :
                                           'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                toast.type === 'success' ? 'bg-emerald-400' :
                toast.type === 'warning' ? 'bg-amber-400' :
                                           'bg-indigo-400'
              }`} />
              <p className="leading-snug">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default LiveInterview;
