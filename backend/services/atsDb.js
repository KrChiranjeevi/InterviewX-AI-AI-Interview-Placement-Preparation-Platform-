const rolesDb = {
  'Software Engineer': {
    requiredSkills: ['Data Structures', 'Algorithms', 'System Design', 'Git', 'OOP'],
    preferredSkills: ['Concurrency', 'Distributed Systems', 'Cloud Computing', 'CI/CD'],
    importantKeywords: ['Complexity', 'Big-O', 'Scalability', 'Design Patterns', 'Refactoring'],
    optionalSkills: ['Frontend Development', 'UI/UX', 'Shell Scripting'],
    expectedProjects: ['Compiler/Interpreter', 'Distributed Key-Value Store', 'File System', 'Web Server'],
    expectedTools: ['Docker', 'Git', 'GDB', 'Valgrind', 'VS Code'],
    expectedFrameworks: ['React', 'Spring Boot', 'Django', 'Express'],
    expectedExperience: '1-3 years of core software engineering or solid internship background in product-based setup.',
    expectedResumeSections: ['Education', 'Experience', 'Projects', 'Skills', 'Achievements']
  },
  'SDE Intern': {
    requiredSkills: ['Data Structures', 'Algorithms', 'Java', 'Python', 'C++'],
    preferredSkills: ['Database Management', 'Object-Oriented Design', 'Git'],
    importantKeywords: ['Recursion', 'Time Complexity', 'Space Complexity', 'Pointers', 'Inheritance'],
    optionalSkills: ['Web Development', 'App Development'],
    expectedProjects: ['CLI Games', 'Simple CRUD Applications', 'Basic Web Scrapers', 'Algorithm Visualizers'],
    expectedTools: ['Git', 'VS Code', 'Eclipse', 'PyCharm'],
    expectedFrameworks: ['Flask', 'Express', 'React'],
    expectedExperience: 'Fresher / Current student in Computer Science or related fields with solid academic coding experience.',
    expectedResumeSections: ['Education', 'Projects', 'Skills', 'Achievements', 'Certificates']
  },
  'SDE 1': {
    requiredSkills: ['Core Programming Language (Java/Python/C++)', 'System Design', 'SQL', 'NoSQL', 'Git', 'OOP'],
    preferredSkills: ['Caching', 'Unit Testing', 'CI/CD', 'Docker', 'REST APIs'],
    importantKeywords: ['Clean Code', 'API Design', 'Refactoring', 'Database Indexing', 'Multi-threading'],
    optionalSkills: ['Frontend Frameworks', 'DevOps Tools', 'Cloud Technologies'],
    expectedProjects: ['E-Commerce Backend', 'Chat Application', 'Notification Service', 'Task Scheduler'],
    expectedTools: ['Git', 'Docker', 'Postman', 'Jira', 'Kubernetes'],
    expectedFrameworks: ['Spring Boot', 'Express.js', 'Django', 'React'],
    expectedExperience: '1-2 years of professional software development experience working on production-level services.',
    expectedResumeSections: ['Experience', 'Education', 'Projects', 'Skills', 'Achievements']
  },
  'Frontend Developer': {
    requiredSkills: ['HTML5', 'CSS3', 'JavaScript', 'React.js', 'Responsive Design', 'Git'],
    preferredSkills: ['TypeScript', 'Next.js', 'Redux/Context API', 'Webpack/Vite', 'Tailwind CSS'],
    importantKeywords: ['DOM', 'Virtual DOM', 'CSS Flexbox', 'CSS Grid', 'SEO', 'Performance Optimization', 'Semantic HTML'],
    optionalSkills: ['Vue.js', 'Angular', 'UI/UX Design', 'Figma'],
    expectedProjects: ['Portfolio Website', 'E-Commerce Frontend', 'Dashboard UI', 'SaaS Landing Page', 'Social Media Client'],
    expectedTools: ['Git', 'VS Code', 'Postman', 'Chrome DevTools', 'Webpack'],
    expectedFrameworks: ['React', 'Next.js', 'Tailwind CSS', 'Bootstrap'],
    expectedExperience: '1-3 years of frontend developer experience building responsive, performant user interfaces.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'React Developer': {
    requiredSkills: ['React.js', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'React Hooks', 'Context API'],
    preferredSkills: ['Redux Toolkit', 'TypeScript', 'Next.js', 'React Query/RTK Query', 'Tailwind CSS'],
    importantKeywords: ['State Management', 'Lifecycle Methods', 'Virtual DOM', 'Prop Drilling', 'Lazy Loading', 'Reconciliation'],
    optionalSkills: ['React Native', 'GraphQL', 'Tailwind CSS'],
    expectedProjects: ['Dashboard Application', 'Chat Interface', 'Task Management App', 'Interactive UI Components Library'],
    expectedTools: ['Vite', 'Webpack', 'Babel', 'ESLint', 'Prettier'],
    expectedFrameworks: ['React.js', 'Next.js', 'Material UI', 'Chakra UI'],
    expectedExperience: '1-3 years of specialized React.js development experience with strong state management background.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'Backend Developer': {
    requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'SQL (MySQL/PostgreSQL)', 'REST APIs', 'Git'],
    preferredSkills: ['TypeScript', 'Redis', 'Docker', 'Kubernetes', 'Microservices', 'GraphQL', 'Message Queues'],
    importantKeywords: ['Event Loop', 'JWT', 'Encryption', 'Database Indexing', 'Migrations', 'Caching', 'Concurrency'],
    optionalSkills: ['Python/Django', 'Go/Golang', 'Java/Spring Boot'],
    expectedProjects: ['E-Commerce Backend API', 'Chat Server', 'User Authentication System', 'Caching Middleware Service'],
    expectedTools: ['Postman', 'Docker', 'Redis Insight', 'pgAdmin', 'Compass'],
    expectedFrameworks: ['Express.js', 'NestJS', 'Koa', 'Spring Boot'],
    expectedExperience: '2-4 years of backend system design and development focusing on performance, scalability, and security.',
    expectedResumeSections: ['Experience', 'Skills', 'Projects', 'Education']
  },
  'Node.js Developer': {
    requiredSkills: ['Node.js', 'Express.js', 'JavaScript', 'RESTful API Design', 'MongoDB/Mongoose', 'SQL'],
    preferredSkills: ['TypeScript', 'Redis', 'WebSockets', 'Jest/Mocha Testing', 'Docker', 'Microservices'],
    importantKeywords: ['Asynchronous Programming', 'Event Loop', 'Callback Hell', 'Promises', 'Streams', 'Buffers', 'Error Handling'],
    optionalSkills: ['React.js', 'AWS Integration', 'Kubernetes'],
    expectedProjects: ['Real-time Chat App', 'REST API Backend with JWT', 'File Streaming Server', 'Multi-tenant CRUD API'],
    expectedTools: ['NPM', 'PM2', 'Nodemon', 'Postman', 'Docker'],
    expectedFrameworks: ['Express.js', 'NestJS', 'Sails.js'],
    expectedExperience: '1-3 years of dedicated Node.js backend development focusing on high-performance, asynchronous web servers.',
    expectedResumeSections: ['Skills', 'Experience', 'Projects', 'Education']
  },
  'Express.js Developer': {
    requiredSkills: ['Express.js', 'Node.js', 'JavaScript', 'REST APIs', 'Routing', 'Middleware Pattern'],
    preferredSkills: ['MongoDB', 'SQL', 'JWT Authentication', 'TypeScript', 'Validation (Joi/Zod)', 'Error Handling'],
    importantKeywords: ['Middleware', 'Routing Parameters', 'Request/Response lifecycle', 'CORS', 'Rate Limiting', 'Authentication'],
    optionalSkills: ['React.js', 'Docker', 'Sequelize/Prisma'],
    expectedProjects: ['REST API Gateway', 'User Authorization Microservice', 'Content Management System Backend'],
    expectedTools: ['Postman', 'Nodemon', 'Git', 'VS Code'],
    expectedFrameworks: ['Express.js', 'NestJS'],
    expectedExperience: '1-3 years of backend experience building web server applications and middleware pipelines.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'MERN Stack Developer': {
    requiredSkills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'JavaScript', 'REST APIs', 'Git'],
    preferredSkills: ['TypeScript', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'JWT', 'Docker', 'Mongoose'],
    importantKeywords: ['Full Stack', 'Single Page Application (SPA)', 'Authentication', 'MERN Architecture', 'Database Modeling'],
    optionalSkills: ['AWS', 'GraphQL', 'Redis', 'Testing (Jest/React Testing Library)'],
    expectedProjects: ['E-Commerce Site (Full MERN)', 'Social Media Platform', 'Real-time Collaborative Board', 'SaaS App with Stripe'],
    expectedTools: ['Git', 'VS Code', 'Postman', 'MongoDB Compass', 'Docker'],
    expectedFrameworks: ['React', 'Express.js', 'Tailwind CSS', 'Redux'],
    expectedExperience: '1-3 years of full stack developer experience building end-to-end MERN stack web applications.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'MEAN Stack Developer': {
    requiredSkills: ['MongoDB', 'Express.js', 'Angular', 'Node.js', 'TypeScript', 'REST APIs', 'Git'],
    preferredSkills: ['RxJS', 'Angular CLI', 'JWT', 'Mongoose', 'Docker', 'SQL', 'CI/CD'],
    importantKeywords: ['Full Stack', 'Angular Components', 'Directives', 'Services', 'Dependency Injection', 'MERN vs MEAN'],
    optionalSkills: ['AWS', 'GraphQL', 'Redis'],
    expectedProjects: ['Enterprise Admin Dashboard', 'Task Management Portal', 'E-Learning Web App'],
    expectedTools: ['Git', 'VS Code', 'Postman', 'MongoDB Compass', 'Angular CLI'],
    expectedFrameworks: ['Angular', 'Express.js', 'Node.js'],
    expectedExperience: '1-3 years of full stack experience building web applications using the Angular-based MEAN stack.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'Full Stack Developer': {
    requiredSkills: ['Frontend (React/Angular/Vue)', 'Backend (Node/Python/Java)', 'Databases (SQL/NoSQL)', 'Git', 'REST APIs'],
    preferredSkills: ['TypeScript', 'Docker', 'AWS/Azure', 'CI/CD', 'Next.js', 'GraphQL', 'System Design'],
    importantKeywords: ['Full Stack Architecture', 'Deployment', 'System Design', 'Authentication', 'State Management', 'DevOps'],
    optionalSkills: ['Kubernetes', 'Redis', 'Elasticsearch'],
    expectedProjects: ['SaaS Dashboard with Stripe', 'Collaborative Tool', 'E-Commerce Platform', 'Multi-tenant Management Portal'],
    expectedTools: ['Git', 'Docker', 'Postman', 'VS Code', 'Jira'],
    expectedFrameworks: ['React', 'Express.js', 'Next.js', 'Spring Boot', 'Django'],
    expectedExperience: '2-4 years of end-to-end full stack development experience handling user interface and database services.',
    expectedResumeSections: ['Experience', 'Projects', 'Skills', 'Education']
  },
  'Java Developer': {
    requiredSkills: ['Java', 'Spring Boot', 'Spring MVC', 'Hibernate/JPA', 'SQL (MySQL/Oracle)', 'OOP', 'Git'],
    preferredSkills: ['Microservices', 'Spring Security', 'JUnit/Mockito Testing', 'Maven/Gradle', 'Docker', 'REST APIs'],
    importantKeywords: ['JVM', 'Multithreading', 'Garbage Collection', 'Collections Framework', 'Design Patterns', 'JDBC'],
    optionalSkills: ['Angular/React', 'AWS', 'Kubernetes'],
    expectedProjects: ['Banking System Backend', 'Employee Management Service', 'Library Database System', 'REST API Microservices'],
    expectedTools: ['Eclipse', 'IntelliJ IDEA', 'Maven', 'Gradle', 'Postman', 'Git'],
    expectedFrameworks: ['Spring Boot', 'Hibernate', 'Spring Cloud'],
    expectedExperience: '2-4 years of enterprise Java development experience building secure, scalable transactional backends.',
    expectedResumeSections: ['Experience', 'Skills', 'Projects', 'Education']
  },
  'Python Developer': {
    requiredSkills: ['Python', 'Django', 'Flask', 'SQL (PostgreSQL/MySQL)', 'OOP', 'Git', 'REST APIs'],
    preferredSkills: ['FastAPI', 'Pandas/NumPy', 'Docker', 'Celery/Redis Task Queue', 'Unit Testing', 'CI/CD'],
    importantKeywords: ['Virtual Environment', 'Decorator', 'Generator', 'List Comprehension', 'WSGI/ASGI', 'ORM'],
    optionalSkills: ['Machine Learning', 'Data Analysis', 'Web Scrapers', 'React/Vue'],
    expectedProjects: ['Content Management System', 'Data Processing Pipeline', 'FastAPI Microservice', 'Task Scheduler Dashboard'],
    expectedTools: ['PyCharm', 'VS Code', 'Postman', 'Git', 'Docker'],
    expectedFrameworks: ['Django', 'Flask', 'FastAPI'],
    expectedExperience: '1-3 years of core Python development building clean, maintainable web servers or data processing scripts.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'C++ Developer': {
    requiredSkills: ['C++', 'Data Structures', 'Algorithms', 'Memory Management', 'STL (Standard Template Library)', 'Git'],
    preferredSkills: ['Multithreading', 'Network Programming', 'Smart Pointers', 'Makefile/CMake', 'GDB Debugging'],
    importantKeywords: ['Pointers', 'RAII', 'Templates', 'Virtual Functions', 'Polymorphism', 'Memory Leaks', 'Complexity Analysis'],
    optionalSkills: ['Python (Scripting)', 'Qt Framework', 'System Level Programming'],
    expectedProjects: ['Game Engine Core', 'Database Storage Engine', 'Network Socket Chat Client', 'System Performance Profiler'],
    expectedTools: ['GDB', 'Valgrind', 'CMake', 'Visual Studio', 'Git'],
    expectedFrameworks: ['Qt', 'Boost', 'Google Test'],
    expectedExperience: '2-4 years of experience writing high-performance C++ software in system-level or algorithmic domains.',
    expectedResumeSections: ['Education', 'Projects', 'Skills', 'Achievements']
  },
  'JavaScript Developer': {
    requiredSkills: ['JavaScript (ES5/ES6+)', 'DOM Manipulation', 'Asynchronous JS (Promises/Async-Await)', 'HTML5', 'CSS3', 'Git'],
    preferredSkills: ['Node.js', 'React.js/Vue.js', 'TypeScript', 'Web APIs', 'Testing (Jest)'],
    importantKeywords: ['Closures', 'Event Bubbling', 'Event Loop', 'Prototype Chain', 'Scope', 'Strict Mode', 'AJAX', 'JSON'],
    optionalSkills: ['Webpack/Vite', 'DevOps Basics'],
    expectedProjects: ['Dynamic Web UI Components', 'Weather App', 'Vanilla JS Games', 'Chrome Extension'],
    expectedTools: ['VS Code', 'Chrome DevTools', 'Git', 'NPM'],
    expectedFrameworks: ['React', 'Vue', 'Express'],
    expectedExperience: '1-3 years of pure JavaScript engineering focusing on interactive browser application logic and scripting.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'TypeScript Developer': {
    requiredSkills: ['TypeScript', 'JavaScript (ES6+)', 'OOP', 'Static Typing', 'Generics', 'Interfaces/Types', 'Git'],
    preferredSkills: ['React/Next.js with TS', 'Node.js/NestJS with TS', 'Linting (ESLint)', 'TypeScript Configurations'],
    importantKeywords: ['Type Inference', 'Generics', 'Discriminated Unions', 'Ambient Declarations', 'Compilation Options', 'Type Guards'],
    optionalSkills: ['Webpack/Vite Configurations', 'Testing with TS'],
    expectedProjects: ['TypeScript Backend API', 'Component Library with TS', 'Strictly Typed SPA'],
    expectedTools: ['TSConfig', 'TS-Node', 'Prettier', 'ESLint', 'VS Code'],
    expectedFrameworks: ['React', 'Next.js', 'NestJS'],
    expectedExperience: '1-3 years of specialized TypeScript development building strictly typed browser or backend services.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'PHP Developer': {
    requiredSkills: ['PHP', 'Laravel', 'MySQL', 'OOP', 'HTML5', 'CSS3', 'JavaScript', 'Git'],
    preferredSkills: ['PHPMyAdmin', 'Composer', 'Composer packages', 'MVC Pattern', 'REST APIs', 'Eloquent ORM'],
    importantKeywords: ['MVC', 'Migrations', 'Routing', 'Blade Template Engine', 'Dependency Injection', 'Sessions/Cookies'],
    optionalSkills: ['Vue.js', 'Docker', 'AWS'],
    expectedProjects: ['E-Commerce System', 'Blogging CMS', 'Inventory Control API', 'SaaS Subscription Dashboard'],
    expectedTools: ['Composer', 'Postman', 'XAMPP/WAMP', 'PHPStorm', 'Git'],
    expectedFrameworks: ['Laravel', 'Symfony', 'CodeIgniter'],
    expectedExperience: '1-3 years of server-side PHP development building dynamic databases and web platforms.',
    expectedResumeSections: ['Skills', 'Experience', 'Projects', 'Education']
  },
  'Android Developer': {
    requiredSkills: ['Kotlin', 'Java', 'Android SDK', 'XML Layouts', 'Android Studio', 'Git'],
    preferredSkills: ['Jetpack Compose', 'MVVM Architecture', 'Coroutines/Flow', 'Retrofit API Client', 'Room Database', 'Dagger Hilt'],
    importantKeywords: ['Android Jetpack', 'Activities/Fragments', 'Services', 'Broadcast Receivers', 'Recycler View', 'App Lifecycles'],
    optionalSkills: ['Flutter', 'Firebase Integrations', 'Unit Testing'],
    expectedProjects: ['Weather App', 'Task Manager App', 'Social Feed Client', 'Music Player App'],
    expectedTools: ['Android Studio', 'Gradle', 'Emulator', 'Firebase Console', 'Git'],
    expectedFrameworks: ['Jetpack Compose', 'Room', 'Retrofit'],
    expectedExperience: '1-3 years of dedicated native Android development using Kotlin or Java and Jetpack ecosystem.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'Cloud Engineer': {
    requiredSkills: ['Cloud Provider (AWS/Azure/GCP)', 'Cloud Network (VPC, Subnets)', 'IAM Roles', 'Virtual Machines (EC2/VMs)', 'Git'],
    preferredSkills: ['Infrastructure as Code (Terraform)', 'Kubernetes (EKS/AKS)', 'Docker', 'CI/CD Pipelines', 'Serverless (Lambda/Cloud Functions)'],
    importantKeywords: ['High Availability', 'IAM Policies', 'S3 Bucket', 'VPC Peering', 'Load Balancers', 'Auto Scaling', 'Cost Optimization'],
    optionalSkills: ['Python Scripting', 'Bash Scripting', 'Monitoring (CloudWatch/Prometheus)'],
    expectedProjects: ['Multi-region High Availability Web Hosting', 'Serverless Data Processing Pipeline', 'IaC Infrastructure Deployment'],
    expectedTools: ['AWS CLI', 'Terraform', 'Ansible', 'Git', 'Docker'],
    expectedFrameworks: ['Terraform', 'Serverless Framework'],
    expectedExperience: '2-4 years of cloud architecture, provisioning, and resource management experience.',
    expectedResumeSections: ['Experience', 'Skills', 'Projects', 'Certificates']
  },
  'DevOps Engineer': {
    requiredSkills: ['CI/CD (Jenkins/GitHub Actions)', 'Docker', 'Linux Administration', 'Git', 'Shell Scripting/Python'],
    preferredSkills: ['Kubernetes', 'Infrastructure as Code (Terraform)', 'Ansible/Chef', 'Monitoring (Prometheus/Grafana)', 'AWS/Azure'],
    importantKeywords: ['Containerization', 'Orchestration', 'GitOps', 'Blue-Green Deployment', 'Helm Charts', 'Configuration Management'],
    optionalSkills: ['Network Security', 'Log Aggregation (ELK Stack)'],
    expectedProjects: ['Automated CI/CD Pipeline', 'Kubernetes Cluster Provisioning', 'Monitoring and Logging Infrastructure setup'],
    expectedTools: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'Git'],
    expectedFrameworks: ['Terraform', 'Helm'],
    expectedExperience: '2-4 years of systems engineering, automation, and continuous delivery experience.',
    expectedResumeSections: ['Experience', 'Skills', 'Projects', 'Certificates']
  },
  'QA Engineer': {
    requiredSkills: ['Manual Testing', 'Software Testing Life Cycle (STLC)', 'Bug Tracking (Jira)', 'Test Cases Writing', 'Git'],
    preferredSkills: ['Automation Testing (Selenium/Cypress)', 'API Testing (Postman)', 'Java/Python', 'SQL basics', 'CI/CD integration'],
    importantKeywords: ['Regression Testing', 'Sanity Testing', 'Smoke Testing', 'Boundary Value Analysis', 'Test Plan', 'Bug Reports'],
    optionalSkills: ['Performance Testing (JMeter)', 'Security Testing'],
    expectedProjects: ['Automated Web E-Commerce Test Suite', 'REST API Automation Test Library', 'Comprehensive Test Case Documentation Plan'],
    expectedTools: ['Selenium WebDriver', 'Cypress', 'Postman', 'Jira', 'Git'],
    expectedFrameworks: ['TestNG', 'JUnit', 'PyTest'],
    expectedExperience: '1-3 years of functional and automation software testing experience.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'Automation Tester': {
    requiredSkills: ['Automation Tool (Selenium/Cypress/Playwright)', 'Programming Language (Java/Python/JS)', 'Git', 'Test Frameworks'],
    preferredSkills: ['API Automation (Postman/RestAssured)', 'CI/CD pipeline triggers', 'SQL', 'Page Object Model (POM)', 'Docker'],
    importantKeywords: ['Page Object Model', 'Data-driven Testing', 'Hybrid Framework', 'XPath Selectors', 'Assertions', 'Reporting'],
    optionalSkills: ['Mobile Automation (Appium)', 'Performance Testing'],
    expectedProjects: ['SaaS Application Automated E2E Test Suite', 'REST API Integration Test Automation framework'],
    expectedTools: ['Selenium', 'Cypress', 'Playwright', 'Maven', 'Git', 'Jenkins'],
    expectedFrameworks: ['Cucumber', 'TestNG', 'PyTest', 'Mocha'],
    expectedExperience: '1-3 years of dedicated test automation script development and QA frameworks.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'AI Engineer': {
    requiredSkills: ['Python', 'LLMs (OpenAI, Gemini)', 'Retrieval Augmented Generation (RAG)', 'LangChain/LlamaIndex', 'Vector Databases (Chroma/Pinecode)', 'Git'],
    preferredSkills: ['Machine Learning', 'Deep Learning (PyTorch/TensorFlow)', 'Prompt Engineering', 'API Integrations', 'Docker', 'NLP'],
    importantKeywords: ['Embeddings', 'Vector Search', 'Context Window', 'Token Count', 'Semantic Search', 'Agentic Workflows', 'Fine-Tuning'],
    optionalSkills: ['Cloud Deployment (AWS/Azure)', 'FastAPI Backend Development'],
    expectedProjects: ['AI Interview Preparation Bot', 'PDF QA Chatbot using RAG', 'Automated Customer Agent System'],
    expectedTools: ['Git', 'VS Code', 'Postman', 'Pinecone', 'ChromaDB'],
    expectedFrameworks: ['LangChain', 'LlamaIndex', 'FastAPI', 'PyTorch'],
    expectedExperience: '1-3 years of applied AI/LLM application development or deep technical prompt engineering.',
    expectedResumeSections: ['Projects', 'Skills', 'Experience', 'Education']
  },
  'Machine Learning Engineer': {
    requiredSkills: ['Python', 'Scikit-Learn', 'Pandas', 'NumPy', 'Supervised/Unsupervised Learning', 'SQL', 'Git'],
    preferredSkills: ['Deep Learning (PyTorch/TensorFlow)', 'Model Deployment (Flask/FastAPI)', 'MLOps (MLflow)', 'Docker', 'Cloud'],
    importantKeywords: ['Regression', 'Classification', 'Gradient Descent', 'Overfitting', 'Cross Validation', 'Feature Engineering', 'Neural Networks'],
    optionalSkills: ['Computer Vision (OpenCV)', 'Natural Language Processing (NLP)'],
    expectedProjects: ['Predictive Sales Model', 'Image Classification Classifier', 'Recommendation Engine System'],
    expectedTools: ['Jupyter Notebook', 'TensorBoard', 'MLflow', 'Docker', 'Git'],
    expectedFrameworks: ['TensorFlow', 'PyTesting', 'Keras', 'Scikit-Learn'],
    expectedExperience: '2-4 years of data preparation, machine learning modeling, training, and production deployment.',
    expectedResumeSections: ['Projects', 'Skills', 'Experience', 'Education']
  },
  'Data Engineer': {
    requiredSkills: ['SQL', 'Python/Scala', 'Apache Spark', 'Data Warehousing', 'ETL/ELT Pipelines', 'Git'],
    preferredSkills: ['Airflow Orchestration', 'Hadoop Ecosystem', 'Kafka Streaming', 'Cloud Data Warehouse (Snowflake/Redshift)', 'Docker'],
    importantKeywords: ['Data Pipeline', 'Schema Design', 'Data Lake', 'Batch Processing', 'Stream Processing', 'Data Modeling', 'Data Governance'],
    optionalSkills: ['Scala', 'NoSQL Databases', 'Kubernetes'],
    expectedProjects: ['Real-time Log Ingestion Pipeline', 'Enterprise Data Warehouse ETL Implementation', 'Batch Analytics Processing Store'],
    expectedTools: ['Apache Spark', 'Apache Airflow', 'Kafka', 'Docker', 'Git', 'PgAdmin'],
    expectedFrameworks: ['PySpark', 'dbt (data build tool)'],
    expectedExperience: '2-4 years of building and optimizing data ingestion pipelines, architectures, and data sets.',
    expectedResumeSections: ['Experience', 'Skills', 'Projects', 'Education']
  },
  'Data Analyst': {
    requiredSkills: ['SQL', 'Python (Pandas/NumPy)', 'Data Visualization (Tableau/Power BI)', 'Excel', 'Statistics basics'],
    preferredSkills: ['R Programming', 'Jupyter Notebooks', 'Git', 'Data Cleaning techniques'],
    importantKeywords: ['Data Cleaning', 'Pivot Tables', 'Dashboard Design', 'Statistical Analysis', 'A/B Testing', 'Descriptive Analytics'],
    optionalSkills: ['Data Warehousing basics', 'Big Data basics'],
    expectedProjects: ['Business Revenue Dashboard', 'Customer Churn Analysis Report', 'Sales Trend Data Visualization Dashboard'],
    expectedTools: ['Tableau', 'Power BI', 'Excel', 'Jupyter', 'Git', 'PgAdmin'],
    expectedFrameworks: ['Pandas', 'Seaborn', 'Matplotlib'],
    expectedExperience: '1-3 years of data gathering, cleaning, analysis, and report generation experience.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'Business Analyst': {
    requiredSkills: ['Requirement Gathering', 'Use Cases writing', 'SQL', 'Jira', 'Data Visualization (Power BI)', 'Agile Methodologies'],
    preferredSkills: ['SDLC knowledge', 'BPMN modeling', 'Scrum Product Owner basics', 'Excel Modeling'],
    importantKeywords: ['User Stories', 'Acceptance Criteria', 'BRD (Business Requirements Document)', 'Gap Analysis', 'Data Flow Diagrams'],
    optionalSkills: ['Python basics', 'Product Management basics'],
    expectedProjects: ['Business Process Automation Blueprint', 'E-Commerce Platform Requirements Specification Document', 'User Dashboard analytics metrics tracking'],
    expectedTools: ['Jira', 'Confluence', 'Visio/Lucidchart', 'Excel', 'Power BI'],
    expectedFrameworks: ['Scrum', 'Kanban'],
    expectedExperience: '2-4 years of bridging business stakeholders and development teams with solid requirement definitions.',
    expectedResumeSections: ['Experience', 'Skills', 'Projects', 'Education']
  },
  'Cyber Security Engineer': {
    requiredSkills: ['Network Security', 'Vulnerability Assessment', 'Linux', 'Cryptography basics', 'Identity Access Management (IAM)', 'Git'],
    preferredSkills: ['Penetration Testing', 'SIEM (Splunk)', 'Firewall configuration', 'Python scripting', 'Docker security'],
    importantKeywords: ['OWASP Top 10', 'Vulnerability Scanning', 'Incident Response', 'Threat Modeling', 'Encryption', 'Phishing protection'],
    optionalSkills: ['Security Certifications (CEH/Security+)', 'Cloud Security (AWS IAM)'],
    expectedProjects: ['Network Penetration Testing & Vulnerability Assessment Report', 'Enterprise Firewalls and IDS/IPS configuration plan', 'Custom Vulnerability Scanner Tool'],
    expectedTools: ['Nmap', 'Wireshark', 'Metasploit', 'Burp Suite', 'Splunk', 'Git'],
    expectedFrameworks: ['OWASP', 'NIST Framework', 'MITRE ATT&CK'],
    expectedExperience: '2-4 years of experience diagnosing vulnerabilities, monitoring alerts, and securing server infrastructures.',
    expectedResumeSections: ['Experience', 'Skills', 'Projects', 'Certificates']
  },
  'Database Developer': {
    requiredSkills: ['SQL', 'Stored Procedures', 'Database Indexes', 'Query Optimization', 'Schema Design', 'Relational Databases'],
    preferredSkills: ['PL/SQL or T-SQL', 'NoSQL Databases (MongoDB/Redis)', 'Database Migration tools', 'Performance Tuning'],
    importantKeywords: ['Query Tuning', 'Execution Plan', 'Database Normalization', 'ACID Properties', 'Transactions', 'Foreign Keys', 'Triggers'],
    optionalSkills: ['Data Warehousing', 'AWS RDS Administration'],
    expectedProjects: ['High Concurrency Transactional Database Schema Design', 'Database Query Performance Tuning & Optimization Report'],
    expectedTools: ['pgAdmin', 'MySQL Workbench', 'SQL Developer', 'Compass', 'Postman'],
    expectedFrameworks: ['Prisma ORM', 'Sequelize', 'Hibernate'],
    expectedExperience: '2-4 years of relational schema design, complex query writing, and tuning database performance.',
    expectedResumeSections: ['Skills', 'Experience', 'Projects', 'Education']
  },
  'API Developer': {
    requiredSkills: ['RESTful API Design', 'Node.js/Express.js or Python/FastAPI', 'JWT Authentication', 'Git', 'Postman'],
    preferredSkills: ['GraphQL APIs', 'API Gateway setup', 'Rate Limiting', 'Zod/Joi validation', 'API Documentation (Swagger)'],
    importantKeywords: ['API Endpoint routing', 'HTTP Status Codes', 'CORS', 'Rate Limiting', 'Authentication Headers', 'Payload schema', 'API Versioning'],
    optionalSkills: ['WebSockets', 'gRPC', 'Docker'],
    expectedProjects: ['REST API Gateway Gateway', 'Enterprise microservices API with JWT integration'],
    expectedTools: ['Postman', 'Swagger UI', 'Nodemon', 'Git', 'VS Code'],
    expectedFrameworks: ['Express.js', 'FastAPI', 'Spring Boot'],
    expectedExperience: '1-3 years of dedicated backend API development focusing on routing, payload checking, and access control.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'System Engineer': {
    requiredSkills: ['Linux/Unix Administration', 'Networking Fundamentals (TCP/IP)', 'Shell Scripting (Bash)', 'Virtualization (VMware/VirtualBox)', 'Git'],
    preferredSkills: ['Active Directory', 'System Monitoring', 'Docker', 'Storage Area Network (SAN)', 'Basic Ansible Automation'],
    importantKeywords: ['System Kernel', 'DNS configuration', 'DHCP Server', 'RAID Array', 'Log Monitoring', 'Firewall rules', 'Syslog'],
    optionalSkills: ['Python Scripting', 'Cloud Basics'],
    expectedProjects: ['High Availability Linux Server Deployment', 'Automated System Backups & Disaster Recovery Script', 'Active Directory setup for virtual corporate network'],
    expectedTools: ['Bash', 'Wireshark', 'VirtualBox', 'Zabbix', 'Git'],
    expectedFrameworks: ['Ansible', 'Bash scripting'],
    expectedExperience: '2-4 years of system installations, upgrades, network routing, and server administration experience.',
    expectedResumeSections: ['Experience', 'Skills', 'Projects', 'Education']
  },
  'Support Engineer': {
    requiredSkills: ['Technical Troubleshooting', 'SQL Queries basics', 'Linux Basic Commands', 'Log Analysis', 'Customer Communication', 'Jira Service Desk'],
    preferredSkills: ['Python/Shell scripting basics', 'Postman API testing basics', 'Network troubleshooting (Ping/Traceroute)'],
    importantKeywords: ['SLA (Service Level Agreement)', 'Ticketing System', 'Root Cause Analysis', 'Log files tracing', 'Escalation process'],
    optionalSkills: ['Cloud basics', 'Knowledge Base article creation'],
    expectedProjects: ['Customer Support Helpdesk Setup', 'System Error Log Analyzer Script', 'Common Issues Technical Troubleshooting Manual'],
    expectedTools: ['Jira Service Desk', 'Postman', 'PuTTY', 'Excel', 'Git'],
    expectedFrameworks: ['ITIL basics'],
    expectedExperience: '1-2 years of application support, customer-facing troubleshooting, and database querying experience.',
    expectedResumeSections: ['Experience', 'Skills', 'Education']
  },
  'Graduate Engineer Trainee': {
    requiredSkills: ['Programming basics (Python/Java/C++)', 'OOP Concepts', 'SQL basics', 'Basic Computer Science fundamentals', 'Git'],
    preferredSkills: ['HTML/CSS/JS', 'Simple Web Application structure', 'Logical Aptitude', 'Communication Skills'],
    importantKeywords: ['Inheritance', 'Polymorphism', 'Relational database', 'Array/Linked List', 'Software Development Life Cycle (SDLC)'],
    optionalSkills: ['Internship experience', 'Hackathon participation'],
    expectedProjects: ['College Management System', 'Calculator/To-Do Application', 'Basic Personal Portfolio website'],
    expectedTools: ['Git', 'VS Code', 'IntelliJ/PyCharm'],
    expectedFrameworks: ['Express.js', 'Flask'],
    expectedExperience: 'Fresher / Current graduate in engineering looking for entry-level technology training and rotations.',
    expectedResumeSections: ['Education', 'Projects', 'Skills', 'Achievements', 'Certificates']
  },
  'Software Developer': {
    requiredSkills: ['Core Programming Language', 'SQL', 'Git', 'Data Structures', 'Algorithms', 'OOP'],
    preferredSkills: ['REST APIs', 'Unit Testing', 'Docker', 'MVC Pattern', 'Agile Methodologies'],
    importantKeywords: ['Clean Code', 'Debugging', 'Version Control', 'Software Timelines', 'Code Reviews', 'Refactoring'],
    optionalSkills: ['Frontend Frameworks', 'DevOps basics'],
    expectedProjects: ['Inventory Tracker Application', 'Automated Booking System API', 'Task Organizer Web Tool'],
    expectedTools: ['Git', 'VS Code', 'Postman', 'SQL Server Management Studio'],
    expectedFrameworks: ['Express', 'Django', 'Spring Boot'],
    expectedExperience: '1-3 years of general software developer experience delivering specifications in collaborative setups.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'Web Developer': {
    requiredSkills: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Git', 'WordPress or Node.js/PHP basics'],
    preferredSkills: ['Tailwind CSS/Bootstrap', 'React.js or jQuery', 'SEO basics', 'Domain/Hosting management'],
    importantKeywords: ['Semantic HTML', 'Cross-browser compatibility', 'SEO', 'Mobile responsiveness', 'Web Accessibility', 'Domain mapping'],
    optionalSkills: ['Figma', 'UI/UX basics'],
    expectedProjects: ['Corporate Portfolio Website', 'Local Business E-Commerce Site', 'Custom WordPress Theme / Portfolio SPA'],
    expectedTools: ['Git', 'VS Code', 'Figma', 'Chrome DevTools'],
    expectedFrameworks: ['React', 'Bootstrap', 'Express'],
    expectedExperience: '1-3 years of web application development and website layout creation experience.',
    expectedResumeSections: ['Skills', 'Projects', 'Experience', 'Education']
  },
  'Technical Consultant': {
    requiredSkills: ['Client Communication', 'SQL', 'Technical Architecture diagrams', 'API integrations', 'Software Implementation', 'Jira'],
    preferredSkills: ['Cloud basics', 'System integration flows', 'Presentation skills', 'Business logic modeling'],
    importantKeywords: ['Client Deliverables', 'SaaS Implementation', 'System Integration', 'Functional Requirements', 'Solution Design'],
    optionalSkills: ['Python scripting', 'ERP systems basics'],
    expectedProjects: ['Client Solution Integration Architecture Plan', 'SaaS Product Implementation Blueprint Report'],
    expectedTools: ['Excel', 'Visio/Lucidchart', 'Jira', 'Postman', 'Git'],
    expectedFrameworks: ['Agile', 'Scrum'],
    expectedExperience: '2-4 years of client-facing consulting, business analysis, and solution architecture design.',
    expectedResumeSections: ['Experience', 'Skills', 'Education']
  },
  'Product Engineer': {
    requiredSkills: ['Full Stack Development', 'Product design trade-offs', 'API design', 'SQL/NoSQL', 'Git', 'Agile Product Lifecycle'],
    preferredSkills: ['TypeScript', 'Next.js', 'System design scalability', 'Analytics integrations', 'UX empathy'],
    importantKeywords: ['MVP (Minimum Viable Product)', 'Product Metrics', 'Feature rollout', 'A/B Testing Integration', 'Rapid Prototyping'],
    optionalSkills: ['Figma', 'DevOps basics'],
    expectedProjects: ['End-to-End SaaS Feature Rollout', 'Analytics Dashboard Integration Project', 'Dynamic Product MVP launch'],
    expectedTools: ['Git', 'Docker', 'Postman', 'Mixpanel/Amplitude analytics', 'VS Code'],
    expectedFrameworks: ['React', 'Express.js', 'Next.js'],
    expectedExperience: '2-4 years of building user-centric software features and optimizing product performance based on metrics.',
    expectedResumeSections: ['Experience', 'Projects', 'Skills', 'Education']
  },
  'Platform Engineer': {
    requiredSkills: ['Infrastructure as Code (Terraform)', 'Kubernetes', 'Docker', 'CI/CD Pipelines (GitHub Actions/GitLab)', 'Linux', 'Go/Python'],
    preferredSkills: ['AWS/Azure Cloud', 'Internal Developer Portals (Backstage)', 'Monitoring & Observability', 'GitOps'],
    importantKeywords: ['Developer Velocity', 'Platform-as-a-Service', 'Shared Infrastructure', 'Kubernetes operator', 'Orchestration'],
    optionalSkills: ['Helm charts', 'Security policy auditing'],
    expectedProjects: ['Self-Service Kubernetes Platform Blueprint', 'Automated Developer Workspace Provisioner System'],
    expectedTools: ['Terraform', 'Kubernetes', 'Docker', 'Argocd', 'Git', 'Prometheus'],
    expectedFrameworks: ['Terraform', 'Helm'],
    expectedExperience: '3-5 years of systems engineering focusing on optimizing infrastructure developer portals.',
    expectedResumeSections: ['Experience', 'Projects', 'Skills', 'Certificates']
  },
  'Site Reliability Engineer': {
    requiredSkills: ['Linux/Unix System internals', 'Networking (TCP/IP)', 'Infrastructure Automation (Ansible/Terraform)', 'Monitoring (Prometheus/Grafana)', 'Python/Go'],
    preferredSkills: ['Incident Response Management', 'Kubernetes cluster maintenance', 'Cloud platform (AWS/GCP)', 'Chaos Engineering'],
    importantKeywords: ['SLO (Service Level Objective)', 'SLA', 'Error Budget', 'Blameless Postmortem', 'MTTR (Mean Time to Repair)', 'Toil automation'],
    optionalSkills: ['CI/CD deployment validation', 'Log aggregation (Elasticsearch/Splunk)'],
    expectedProjects: ['Enterprise System Monitoring and Alerting Suite', 'Incident Response Runbook Automation framework'],
    expectedTools: ['Prometheus', 'Grafana', 'Ansible', 'Terraform', 'Kubernetes', 'Docker', 'Git'],
    expectedFrameworks: ['Terraform', 'Ansible'],
    expectedExperience: '3-5 years of experience automating system recoveries, handling incident responses, and configuring alerts.',
    expectedResumeSections: ['Experience', 'Skills', 'Projects', 'Certificates']
  }
};

const companiesDb = {
  'General ATS': {
    hiringFocus: 'Overall professional structure, standard industry vocabulary, clear presentation, and balanced skill-to-experience layout.',
    preferredSkills: ['Git', 'SQL', 'Object-Oriented Design', 'API integration', 'Time/Space complexity understanding'],
    expectedKeywords: ['Agile', 'GitHub', 'Databases', 'Testing', 'Software Development', 'Deployment'],
    preferredProjects: ['CRUD applications', 'Structured client portals', 'API interfaces'],
    preferredTechStack: 'Balanced combination of standard programming languages (Python, Java, JavaScript) and databases.',
    preferredResumeStyle: 'Chronological, standard margins, structured bullet points, clear font families, clean layout.',
    freshersExpectations: 'Clear projects showcasing foundational software modules, strong CGPA, and coding practice tags.',
    roleExpectations: 'Balanced mix of relevant technical skills, clear project responsibilities, and timeline history.'
  },
  'Google': {
    hiringFocus: 'Deep algorithmic complexity, graph traversals, data structures modeling, dynamic programming, performance metrics, and scalable systems.',
    preferredSkills: ['C++', 'Java', 'Python', 'Go', 'Distributed Systems', 'Data Structures', 'Algorithms', 'Mathematical Proofs'],
    expectedKeywords: ['Algorithm Design', 'Computational Complexity', 'Big-O Analysis', 'Scalability', 'Concurrency', 'Network Sockets'],
    preferredProjects: ['Compilers', 'Custom Database Engines', 'Distributed MapReduce framework', 'High throughput low-level network server'],
    preferredTechStack: 'Low-level performance languages (C/C++), enterprise system backends (Java/Go), and scalable cloud environments.',
    preferredResumeStyle: 'Dense, technical focus, strong emphasis on quantitative metrics, university honors, competitive coding rankings.',
    freshersExpectations: 'Outstanding academic record, internships in core R&D teams, top ranks in competitive coding platforms, and systems-level projects.',
    roleExpectations: 'Proven track record of optimizing systems performance, designing complex algorithms, and building massive multi-tier web platforms.'
  },
  'Microsoft': {
    hiringFocus: 'Solid object-oriented design, design patterns, transactional integrity, database normalization, system modularity, and enterprise reliability.',
    preferredSkills: ['C#', 'Java', 'C++', 'SQL Server', 'Azure Cloud', 'OOP', 'Design Patterns', 'Unit Testing', 'CI/CD Pipelines'],
    expectedKeywords: ['Enterprise Design Patterns', 'ACID Properties', 'Multithreading', 'RESTful Services', 'Cloud Integration', 'Refactoring'],
    preferredProjects: ['Enterprise CRUD Platform', 'Microservices API Gateway', 'Thread-Safe Task Coordinator', 'Multi-tenant database sync engine'],
    preferredTechStack: '.NET ecosystem (C#), enterprise Java (Spring Boot), Azure Cloud resources, SQL databases.',
    preferredResumeStyle: 'Clear chronological flow, bullet points demonstrating system architectural design choices, and business value delivery.',
    freshersExpectations: 'Strong grasp of OOP concepts, robust projects demonstrating relational database schemas, and clean, modular coding practices.',
    roleExpectations: 'Experience building multi-user enterprise applications, managing cloud deployments, and refining query performance.'
  },
  'Amazon': {
    hiringFocus: 'Leadership Principles (Ownership, Customer Obsession, Bias for Action), highly scalable cloud microservices, high-throughput pipelines, and ownership.',
    preferredSkills: ['Java', 'C++', 'Python', 'AWS Services (DynamoDB, Lambda, SQS, S3)', 'Distributed Caching', 'NoSQL Databases'],
    expectedKeywords: ['Scalability', 'Microservices', 'High Availability', 'Asynchronous Processing', 'Leadership Principles', 'Metrics', 'Scale'],
    preferredProjects: ['E-Commerce Backend Platform', 'Serverless Data Ingestion pipeline', 'Distributed Cache Orchestration engine'],
    preferredTechStack: 'Java/Spring Boot, AWS Cloud Infrastructure, NoSQL databases, message brokers (Kafka/RabbitMQ).',
    preferredResumeStyle: 'Structured, highlighting ownership, bias for action, delivery of results, metrics indicating scale (e.g. "reduced latency by 30%").',
    freshersExpectations: 'Dynamic problem solving, high-impact projects, active cloud certifications (AWS Practitioner), and leadership metrics.',
    roleExpectations: 'Experience managing distributed state, designing low-latency API architectures, and writing robust scalable software.'
  },
  'NVIDIA': {
    hiringFocus: 'Low-level software optimizations, graphics programming, parallel compute architectures (CUDA), hardware integrations, and mathematical computing.',
    preferredSkills: ['C++', 'C', 'CUDA', 'Python', 'OpenGL/DirectX', 'Embedded Systems', 'Computer Architecture', 'Deep Learning frameworks'],
    expectedKeywords: ['CUDA', 'Parallel Computing', 'GPU Acceleration', 'Memory Allocation', 'Low-level Optimization', 'Multithreading', 'C++17/20'],
    preferredProjects: ['Custom Graphics Ray Tracer', 'Parallel Matrix Multiplication engine using CUDA', 'Embedded driver script', 'ML classifier optimized for GPU'],
    preferredTechStack: 'C/C++, CUDA toolkit, Python (PyTorch/TensorFlow), Linux kernel compilation resources.',
    preferredResumeStyle: 'Highly technical, focusing on low-level memory optimizations, parallel compute scripts, and hardware specs.',
    freshersExpectations: 'Strong academic background in computer architecture, hardware-software compiler projects, and low-level debugging.',
    roleExpectations: 'Expertise in high-performance computing, optimizing memory access patterns, custom CUDA kernels, and GPU architectures.'
  },
  'TCS': {
    hiringFocus: 'Foundational computer science concepts, structured timelines, database basics, enterprise documentation, and client communication.',
    preferredSkills: ['Java', 'SQL', 'HTML/CSS/JS', 'Manual Testing', 'Python basics', 'Software Engineering pillars'],
    expectedKeywords: ['Agile Methodologies', 'DBMS Joins', 'Software Development Life Cycle (SDLC)', 'Client Service', 'Debugging', 'ITIL'],
    preferredProjects: ['Basic CRUD portals', 'College database trackers', 'Simple automated test suites'],
    preferredTechStack: 'Java (J2EE), SQL Server, PHP/MySQL, HTML/CSS/JavaScript frameworks.',
    preferredResumeStyle: 'Formal, standard sections, clean chronological order, references to certificates and achievements.',
    freshersExpectations: 'Clear understanding of database joins, basic programming syntax, strong academic record, and training certificates.',
    roleExpectations: 'Proven capacity to work in structured enterprise teams, manage ticket backlogs, and deliver basic features.'
  },
  'Infosys': {
    hiringFocus: 'Foundational programming knowledge, database models, technical troubleshooting, documentation excellence, and client-facing professionalism.',
    preferredSkills: ['Java', 'Python', 'SQL', 'C# basics', 'Manual Testing', 'Basic REST API configurations'],
    expectedKeywords: ['SDLC', 'Database Normalization', 'OOP principles', 'Software Modules', 'User Management', 'Testing Life Cycle'],
    preferredProjects: ['Library Management App', 'Employee database tracker', 'Simple web calculator'],
    preferredTechStack: 'Java/Spring Boot, MySQL/Oracle database, HTML/CSS/JS frontend basics.',
    preferredResumeStyle: 'Standard multi-page or single-page formal chronological resume with credentials explicitly highlighted.',
    freshersExpectations: 'Grasp of basic OOP, database queries (SQL select/join), academic achievements, and coding certifications.',
    roleExpectations: 'Experience handling enterprise application workflows, writing test plans, and implementing basic database migrations.'
  },
  'Accenture': {
    hiringFocus: 'Client solution architectures, enterprise application deployments, technology consultancies, and collaborative framework alignments.',
    preferredSkills: ['Java', 'SQL', 'Cloud basics (AWS/Azure)', 'REST APIs', 'Spring Boot', 'Modern frontend framework basics'],
    expectedKeywords: ['Agile Delivery', 'Solution Architecture', 'Client Requirements', 'Continuous Integration', 'Version Control', 'Deployment'],
    preferredProjects: ['Client Portal integration UI', 'Microservice API with JWT authentication', 'Cloud infrastructure template deploy'],
    preferredTechStack: 'Java/Spring Boot, Angular/React, AWS/Azure cloud resources, relational SQL databases.',
    preferredResumeStyle: 'Structured, business-oriented layout showing client impact, functional alignment, and delivery speeds.',
    freshersExpectations: 'Active interest in full-stack web applications, solid databases knowledge, and collaborative hackathon timelines.',
    roleExpectations: 'Experience scaling client applications, managing deployment containers (Docker), and defining system requirements.'
  },
  'Capgemini': {
    hiringFocus: 'Agile team dynamics, enterprise Java backends, database scaling designs, functional software testing, and systems implementation.',
    preferredSkills: ['Java', 'Spring Boot', 'SQL', 'Angular/React basics', 'Docker basics', 'Manual/Automation testing tools'],
    expectedKeywords: ['Agile Scrum', 'Database Normalization', 'RESTful API', 'Version Control', 'Testing and QA', 'System Migrations'],
    preferredProjects: ['Corporate Employee Hub', 'Inventory Manager API', 'Web Automation test framework'],
    preferredTechStack: 'Java/Spring Boot, SQL Server, Docker containers, HTML/CSS/JS clients.',
    preferredResumeStyle: 'Clear chronological order, highlights on certificates, training courses, and team roles.',
    freshersExpectations: 'Strong grasp of core Java, database query design, basic web scripts, and training references.',
    roleExpectations: 'Experience building transactional web APIs, writing testing logic, and configuring databases.'
  },
  'Cognizant': {
    hiringFocus: 'Foundational CS metrics, web technologies, database indexing designs, testing lifecycles, and agile coordination.',
    preferredSkills: ['Java', 'Python', 'SQL', 'React.js basics', 'Manual Testing', 'SDLC documentation'],
    expectedKeywords: ['Agile Delivery', 'DBMS', 'Object Oriented Programming', 'Restful Service', 'Code Refactoring', 'Testing Life Cycle'],
    preferredProjects: ['Employee portal API', 'CRUD data collector', 'Automated web test client'],
    preferredTechStack: 'Java, MySQL/MongoDB, React/Angular frontends, Node/Spring backends.',
    preferredResumeStyle: 'Formal chronological format, clear section headings, bulleted lists of responsibilities and achievements.',
    freshersExpectations: 'Basic programming skills, DBMS concepts, academic projects, and certifications (Oracle, Java, Python).',
    roleExpectations: 'Capacity to design components, debug databases, document functional systems, and write integration test scripts.'
  },
  'Wipro': {
    hiringFocus: 'Enterprise software configurations, database query designs, tech support troubleshooting, and traditional system deployment pipelines.',
    preferredSkills: ['Java', 'SQL', 'Python basics', 'HTML/CSS/JS', 'Manual Testing', 'Network routing basics'],
    expectedKeywords: ['SDLC Lifecycle', 'Relational database', 'OOP pillars', 'Manual Testing cases', 'Customer service', 'Incident escalation'],
    preferredProjects: ['Customer helpdesk website', 'E-Library CRUD system', 'Network diagnostics script'],
    preferredTechStack: 'Java (Spring Boot), PHP, MySQL database, JavaScript clients.',
    preferredResumeStyle: 'Chronological layout highlighting certifications, academic scores, training profiles, and project lists.',
    freshersExpectations: 'Knowledge of core software engineering modules, basic programming language proficiency, and certification logs.',
    roleExpectations: 'Proven capabilities in resolving application bugs, writing database triggers, and supporting user features.'
  },
  'Deloitte': {
    hiringFocus: 'Enterprise consulting solutions, system architecture design, functional scalability, cloud deployments, and business analysis metrics.',
    preferredSkills: ['SQL', 'Cloud basics (AWS/Azure/GCP)', 'API Integrations', 'Visual dashboards (Tableau/Power BI)', 'Java/Python'],
    expectedKeywords: ['Business Requirements', 'Solution Architecture', 'Stakeholder Communication', 'Risk Assessment', 'Cloud Migration', 'Data Analysis'],
    preferredProjects: ['Corporate Solution Architecture Template', 'Enterprise KPI Interactive Dashboard', 'Cloud Resource Provisioning Script'],
    preferredTechStack: 'Java/Python, AWS/Azure, SQL Server/Snowflake, Tableau/Power BI visualization.',
    preferredResumeStyle: 'Professional, highly structured, business consulting layout focusing on solution design and business outcomes.',
    freshersExpectations: 'Analytical mindset, robust projects demonstrating data processing or cloud setups, and clear communications skills.',
    roleExpectations: 'Experience designing integrations, defining system bounds, analyzing data streams, and consulting stakeholders.'
  },
  'JPMorgan Chase': {
    hiringFocus: 'High performance transaction backends, concurrency safe programming, robust SQL/NoSQL databases, OOP principles, and test automation.',
    preferredSkills: ['Java', 'Spring Boot', 'SQL (Oracle/PostgreSQL)', 'Multithreading', 'Git', 'JUnit/Mockito', 'CI/CD Pipelines'],
    expectedKeywords: ['Transactional Integrity', 'Concurreny', 'Thread Safety', 'Database Normalization', 'Object Oriented Design', 'Security'],
    preferredProjects: ['Banking System Transaction Engine', 'High-speed REST API Gateway', 'Concurrency-Safe Task Coordinator'],
    preferredTechStack: 'Java/Spring Boot, Oracle Database, Cloud deployment (AWS), messaging systems (Kafka).',
    preferredResumeStyle: 'Clean, professional, highlighting technical depth, transactional security, algorithm metrics, and system quality.',
    freshersExpectations: 'Solid computer science foundations (Data Structures, Algorithms), Java OOP proficiency, and database transaction projects.',
    roleExpectations: 'Experience scaling high-volume APIs, writing thread-safe systems, optimizing SQL queries, and configuring deployments.'
  }
};

module.exports = { rolesDb, companiesDb };
