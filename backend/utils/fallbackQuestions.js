const mongoose = require('mongoose');

const getFallbackQuestions = (moduleName) => {
  const mod = moduleName.toLowerCase();
  
  const banks = {
    'os': [
      { q: "What is a deadlock?", o: ["A state where processes wait indefinitely", "A fast process", "A memory leak", "CPU idle"], a: "A state where processes wait indefinitely" },
      { q: "Which scheduler is responsible for swapping?", o: ["Medium-term", "Short-term", "Long-term", "Dispatcher"], a: "Medium-term" },
      { q: "What is virtual memory?", o: ["Separation of logical memory from physical memory", "RAM", "Cache", "Hard drive"], a: "Separation of logical memory from physical memory" },
      { q: "What is a thread?", o: ["A lightweight process", "A heavy process", "A file", "An OS"], a: "A lightweight process" },
      { q: "What is thrashing?", o: ["Excessive paging activity", "High CPU usage", "Disk failure", "Fast execution"], a: "Excessive paging activity" }
    ],
    'cn': [
      { q: "Which layer handles routing?", o: ["Network", "Data Link", "Transport", "Physical"], a: "Network" },
      { q: "What is TCP?", o: ["Connection-oriented protocol", "Connectionless", "Hardware", "Database"], a: "Connection-oriented protocol" },
      { q: "What is a MAC address?", o: ["Physical address", "IP address", "Web address", "Port"], a: "Physical address" },
      { q: "Which port is used for HTTPS?", o: ["443", "80", "21", "22"], a: "443" },
      { q: "What does DNS do?", o: ["Resolves domain names to IPs", "Encrypts data", "Routes packets", "Sends email"], a: "Resolves domain names to IPs" }
    ],
    'dbms': [
      { q: "What is a primary key?", o: ["Unique identifier", "Duplicate key", "Foreign key", "Index"], a: "Unique identifier" },
      { q: "What does ACID stand for?", o: ["Atomicity, Consistency, Isolation, Durability", "Auto, Commit, Insert, Delete", "Array, C, Integer, Double", "None"], a: "Atomicity, Consistency, Isolation, Durability" },
      { q: "What is normalization?", o: ["Organizing data to reduce redundancy", "Adding data", "Deleting tables", "Creating backups"], a: "Organizing data to reduce redundancy" },
      { q: "What is a foreign key?", o: ["Key linking to another table", "Main key", "String", "Null"], a: "Key linking to another table" },
      { q: "Which is a NoSQL DB?", o: ["MongoDB", "MySQL", "Oracle", "PostgreSQL"], a: "MongoDB" }
    ],
    'sql': [
      { q: "Which clause filters rows?", o: ["WHERE", "GROUP BY", "SELECT", "ORDER BY"], a: "WHERE" },
      { q: "What does JOIN do?", o: ["Combines rows from two tables", "Deletes rows", "Creates table", "Updates rows"], a: "Combines rows from two tables" },
      { q: "What is a view?", o: ["Virtual table", "Real table", "Index", "Trigger"], a: "Virtual table" },
      { q: "Which command removes a table?", o: ["DROP", "DELETE", "TRUNCATE", "REMOVE"], a: "DROP" },
      { q: "What counts rows?", o: ["COUNT()", "SUM()", "MAX()", "MIN()"], a: "COUNT()" }
    ],
    'react': [
      { q: "What is JSX?", o: ["Syntax extension for JS", "Database", "Server", "CSS"], a: "Syntax extension for JS" },
      { q: "What hook manages state?", o: ["useState", "useEffect", "useRef", "useMemo"], a: "useState" },
      { q: "What is Virtual DOM?", o: ["In-memory representation of DOM", "Real DOM", "Shadow DOM", "Browser"], a: "In-memory representation of DOM" },
      { q: "Props are?", o: ["Read-only", "Mutable", "Functions", "Classes"], a: "Read-only" },
      { q: "useEffect is used for?", o: ["Side effects", "Routing", "Styling", "Rendering"], a: "Side effects" }
    ],
    'node': [
      { q: "Node.js runs on?", o: ["V8 engine", "SpiderMonkey", "Chakra", "Java"], a: "V8 engine" },
      { q: "What is the event loop?", o: ["Handles async operations", "Compiles code", "Styles pages", "Database"], a: "Handles async operations" },
      { q: "Which module creates servers?", o: ["http", "fs", "path", "os"], a: "http" },
      { q: "npm stands for?", o: ["Node Package Manager", "New Project Module", "No Problem Man", "None"], a: "Node Package Manager" },
      { q: "Express is a?", o: ["Web framework", "Database", "Frontend lib", "Compiler"], a: "Web framework" }
    ],
    'javascript': [
      { q: "Which keyword declares block-scoped variables?", o: ["let", "var", "const", "Both let & const"], a: "Both let & const" },
      { q: "What is the output of 'typeof null'?", o: ["'object'", "'null'", "'undefined'", "'string'"], a: "'object'" },
      { q: "Which method adds elements to the end of an array?", o: ["push()", "pop()", "shift()", "unshift()"], a: "push()" },
      { q: "What is a closure?", o: ["A function that remembers its lexical scope", "A tag in HTML", "A CSS styling", "A DB connection"], a: "A function that remembers its lexical scope" },
      { q: "What is a promise?", o: ["Object representing eventual completion of async task", "A function syntax", "A loop type", "None"], a: "Object representing eventual completion of async task" }
    ],
    'aptitude': [
      { q: "A train running at 54 km/h crosses a post in 20 seconds. What is its length?", o: ["300m", "150m", "400m", "None"], a: "300m" },
      { q: "If A is B's brother, and B is C's sister, what is C's relation to A?", o: ["Sibling", "Father", "Uncle", "None"], a: "Sibling" },
      { q: "Find the odd one out: 3, 5, 7, 9, 11, 13", o: ["9", "3", "11", "7"], a: "9" },
      { q: "Complete the series: 2, 4, 8, 16, ...", o: ["32", "20", "24", "48"], a: "32" },
      { q: "A clock shows 3:00. What is the angle between hands?", o: ["90 degrees", "45 degrees", "180 degrees", "None"], a: "90 degrees" }
    ],
    'oop': [
      { q: "Which concept allows using a child class object as a parent?", o: ["Polymorphism", "Encapsulation", "Abstraction", "None"], a: "Polymorphism" },
      { q: "What restricts direct data access?", o: ["Encapsulation", "Inheritance", "Polymorphism", "None"], a: "Encapsulation" },
      { q: "What provides blueprint for objects?", o: ["Class", "Method", "Variable", "None"], a: "Class" },
      { q: "Which keyword refers to superclass in Java?", o: ["super", "this", "parent", "base"], a: "super" },
      { q: "Multiple inheritance is solved in Java via?", o: ["Interfaces", "Abstract classes", "Final classes", "None"], a: "Interfaces" }
    ],
    'frontend': [
      { q: "Which HTML5 tag is semantic?", o: ["<article>", "<div>", "<span>", "<b>"], a: "<article>" },
      { q: "CSS display: flex aligns items horizontally by default. How to align vertically?", o: ["flex-direction: column", "align-items: center", "justify-content: center", "None"], a: "flex-direction: column" },
      { q: "What does DOM stand for?", o: ["Document Object Model", "Data Object Module", "Digital Online Medium", "None"], a: "Document Object Model" },
      { q: "Which tool bundles assets?", o: ["Webpack", "Node", "MongoDB", "Express"], a: "Webpack" },
      { q: "What is semantic HTML?", o: ["Using tags that describe their meaning", "Styles only", "Validating form", "None"], a: "Using tags that describe their meaning" }
    ],
    'backend': [
      { q: "What is Express middleware?", o: ["Functions that execute during request-response cycle", "Database driver", "Compiler", "CSS theme"], a: "Functions that execute during request-response cycle" },
      { q: "Which status code represents successful post?", o: ["201", "200", "400", "500"], a: "201" },
      { q: "What is token authorization?", o: ["Verifying client via signed token (JWT)", "Cookies", "Local storage", "None"], a: "Verifying client via signed token (JWT)" },
      { q: "What does CORS stand for?", o: ["Cross-Origin Resource Sharing", "Create Options Request Status", "Common Object Resource State", "None"], a: "Cross-Origin Resource Sharing" },
      { q: "What limits request rate?", o: ["Rate limiting middleware", "Port forwarding", "SSL certificate", "None"], a: "Rate limiting middleware" }
    ],
    'java': [
      { q: "Which area holds objects in JVM?", o: ["Heap Memory", "Stack Memory", "Method Area", "None"], a: "Heap Memory" },
      { q: "What is JVM?", o: ["Java Virtual Machine", "Java Version Manager", "Java Variable Method", "None"], a: "Java Virtual Machine" },
      { q: "Which interface is parent of List?", o: ["Collection", "Map", "Set", "None"], a: "Collection" },
      { q: "Which keyword prevents method overriding?", o: ["final", "static", "private", "abstract"], a: "final" },
      { q: "Which class is thread-safe?", o: ["Vector", "ArrayList", "HashMap", "StringBuilder"], a: "Vector" }
    ],
    'python': [
      { q: "What is GIL in Python?", o: ["Global Interpreter Lock", "General Input Loop", "Graph Interface Library", "None"], a: "Global Interpreter Lock" },
      { q: "Which keyword creates decorators?", o: ["@", "def", "class", "lambda"], a: "@" },
      { q: "What creates generator object?", o: ["yield", "return", "lambda", "None"], a: "yield" },
      { q: "Is Python dynamically typed?", o: ["Yes", "No", "Depends", "None"], a: "Yes" },
      { q: "Which is a Python list comprehension?", o: ["[x for x in list]", "{x: x*2}", "lambda x: x", "None"], a: "[x for x in list]" }
    ],
    'express': [
      { q: "How to define middleware in Express?", o: ["app.use()", "app.get()", "app.set()", "app.route()"], a: "app.use()" },
      { q: "Which object represents server response?", o: ["res", "req", "next", "server"], a: "res" },
      { q: "What is req.params?", o: ["URL route parameters", "Query variables", "Request body", "None"], a: "URL route parameters" },
      { q: "How to parse JSON body?", o: ["express.json()", "express.urlencoded()", "bodyParser.raw()", "None"], a: "express.json()" },
      { q: "What does next() do?", o: ["Passes control to next middleware", "Stops server", "Sends response", "None"], a: "Passes control to next middleware" }
    ],
    'mongodb': [
      { q: "What formats data in MongoDB?", o: ["BSON", "XML", "CSV", "SQL"], a: "BSON" },
      { q: "Which is the primary index?", o: ["_id", "primary", "index", "None"], a: "_id" },
      { q: "What replicates data across servers?", o: ["Replica Sets", "Shards", "Aggregation", "None"], a: "Replica Sets" },
      { q: "What splits data for scale?", o: ["Sharding", "Indexing", "Capping", "None"], a: "Sharding" },
      { q: "Which command runs pipelines?", o: ["aggregate()", "find()", "update()", "delete()"], a: "aggregate()" }
    ],
    'system-design': [
      { q: "What distributes network traffic?", o: ["Load Balancer", "DNS Server", "CDN", "Cache"], a: "Load Balancer" },
      { q: "What is horizontal scaling?", o: ["Adding more machines", "Upgrading RAM", "Upgrading CPU", "None"], a: "Adding more machines" },
      { q: "What cache eviction strategy is common?", o: ["LRU (Least Recently Used)", "FIFO", "LIFO", "None"], a: "LRU (Least Recently Used)" },
      { q: "Which protocol is stateless?", o: ["HTTP", "TCP", "FTP", "Websocket"], a: "HTTP" },
      { q: "What handles background async tasks?", o: ["Message Queue", "Database", "API Gateway", "Proxy"], a: "Message Queue" }
    ],
    'debugging': [
      { q: "What is a null pointer dereference?", o: ["Accessing memory via null reference", "Memory leak", "Infinite loop", "None"], a: "Accessing memory via null reference" },
      { q: "What leads to stack overflow in recursion?", o: ["Missing base case", "Too many variables", "Array overflow", "None"], a: "Missing base case" },
      { q: "What is off-by-one error?", o: ["Looping one time too many or few", "Type mismatch", "Syntax error", "None"], a: "Looping one time too many or few" },
      { q: "Which tool tracks memory leaks?", o: ["Profiler", "Compiler", "Linter", "IDE"], a: "Profiler" },
      { q: "What is compile-time error?", o: ["Syntax mistake caught by compiler", "Logic crash at runtime", "Memory leak", "None"], a: "Syntax mistake caught by compiler" }
    ],
    'mixed': [
      { q: "What does STAR stand for?", o: ["Situation, Task, Action, Result", "Stop, Think, Act, Review", "State, Target, Answer, Record", "None"], a: "Situation, Task, Action, Result" },
      { q: "How to resolve conflict with peer?", o: ["Discuss privately and professionally", "Complain to HR", "Ignore them", "Argue loudly"], a: "Discuss privately and professionally" },
      { q: "What is primary key in RDBMS?", o: ["Unique column identifier", "Foreign constraint", "Index flag", "None"], a: "Unique column identifier" },
      { q: "What is a recursive function?", o: ["Function that calls itself", "Loop syntax", "API request", "None"], a: "Function that calls itself" },
      { q: "Best way to explain technical concepts?", o: ["Use simple analogies", "Use complex jargon", "Don't explain", "Write code only"], a: "Use simple analogies" }
    ]
  };

  const defaultQs = [
    { q: "What is a core concept in this domain?", o: ["Architecture", "Syntax", "Logic", "All"], a: "All" },
    { q: "Which tool is commonly used?", o: ["Debugger", "Compiler", "IDE", "All"], a: "All" },
    { q: "What is best practice?", o: ["Clean code", "Spaghetti code", "No tests", "Hardcoding"], a: "Clean code" },
    { q: "How to improve performance?", o: ["Caching", "Delaying", "Blocking", "None"], a: "Caching" },
    { q: "What ensures reliability?", o: ["Testing", "Guessing", "Ignoring", "None"], a: "Testing" }
  ];

  const pool = banks[mod] || defaultQs;

  return pool.map((item, i) => ({
    _id: new mongoose.Types.ObjectId(),
    module: mod,
    subCategory: 'Fundamentals',
    difficulty: 'Medium',
    question: item.q,
    options: item.o,
    correctAnswer: item.a,
    explanation: 'Fundamental concept tested during fallback mode.',
    timeExpected: 60
  }));
};

module.exports = { getFallbackQuestions };
