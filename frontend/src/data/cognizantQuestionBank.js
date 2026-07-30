// ─────────────────────────────────────────────────────────────────────────────
//  COGNIZANT CAMPUS RECRUITMENT — COMPREHENSIVE QUESTION BANK
//  Applied ONLY to Cognizant Company Preparation Module
//  Randomized paper generator — every exam is unique
// ─────────────────────────────────────────────────────────────────────────────

export const _shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ═══════════════════════════════════════════════════════════════════════════
//  APTITUDE BANK (40 questions → generate 35 per paper)
// ═══════════════════════════════════════════════════════════════════════════
export const APTITUDE_BANK = [
  // ── QUANTITATIVE APTITUDE ──
  { id:'AQ01', sec:'Quantitative Aptitude', topic:'Simple Interest', diff:'Easy',
    q:'A principal of ₹12,000 is invested at 8% per annum simple interest. What is the total interest earned after 3 years?',
    opts:['₹2,560','₹2,880','₹3,200','₹3,520'], ans:1 },
  { id:'AQ02', sec:'Quantitative Aptitude', topic:'Compound Interest', diff:'Medium',
    q:'Find the compound interest on ₹10,000 at 10% per annum for 2 years, compounded annually.',
    opts:['₹2,000','₹2,100','₹2,200','₹2,500'], ans:1 },
  { id:'AQ03', sec:'Quantitative Aptitude', topic:'Profit and Loss', diff:'Easy',
    q:'A shopkeeper buys an article for ₹400 and sells it for ₹500. What is the profit percentage?',
    opts:['20%','25%','30%','15%'], ans:1 },
  { id:'AQ04', sec:'Quantitative Aptitude', topic:'Time and Work', diff:'Medium',
    q:'A can complete a task in 12 days, B can complete it in 18 days. How many days will they take working together?',
    opts:['6 days','7 days','7.2 days','8 days'], ans:2 },
  { id:'AQ05', sec:'Quantitative Aptitude', topic:'Time Speed Distance', diff:'Medium',
    q:'A train 150 m long crosses a platform 250 m long in 20 seconds. What is the speed of the train in km/h?',
    opts:['54 km/h','72 km/h','90 km/h','36 km/h'], ans:1 },
  { id:'AQ06', sec:'Quantitative Aptitude', topic:'Percentage', diff:'Easy',
    q:'20% of 500 added to 30% of 200 equals:',
    opts:['140','150','160','170'], ans:2 },
  { id:'AQ07', sec:'Quantitative Aptitude', topic:'Ratio and Proportion', diff:'Easy',
    q:'If A : B = 3 : 4 and A = 180, what is the value of B?',
    opts:['210','220','230','240'], ans:3 },
  { id:'AQ08', sec:'Quantitative Aptitude', topic:'Average', diff:'Easy',
    q:'The average of 5 numbers is 60. What 6th number makes the overall average 65?',
    opts:['80','85','90','95'], ans:2 },
  { id:'AQ09', sec:'Quantitative Aptitude', topic:'Ages', diff:'Medium',
    q:'The sum of ages of A and B is 42 years. A is 6 years older than B. What is B\'s current age?',
    opts:['16 years','18 years','20 years','22 years'], ans:1 },
  { id:'AQ10', sec:'Quantitative Aptitude', topic:'Number System', diff:'Easy',
    q:'35% of a number equals 70. What is the number?',
    opts:['175','185','200','210'], ans:2 },
  { id:'AQ11', sec:'Quantitative Aptitude', topic:'LCM and HCF', diff:'Medium',
    q:'What is the LCM of 12, 18, and 24?',
    opts:['36','48','72','96'], ans:2 },
  { id:'AQ12', sec:'Quantitative Aptitude', topic:'Probability', diff:'Medium',
    q:'A card is drawn at random from a standard deck of 52 cards. What is the probability of drawing a King?',
    opts:['1/52','1/26','1/13','2/13'], ans:2 },
  { id:'AQ13', sec:'Quantitative Aptitude', topic:'Permutation & Combination', diff:'Medium',
    q:'In how many ways can 4 people be arranged in a row?',
    opts:['12','16','24','32'], ans:2 },
  { id:'AQ14', sec:'Quantitative Aptitude', topic:'Pipes and Cisterns', diff:'Medium',
    q:'Pipe A fills a tank in 12 hours. Pipe B fills it in 18 hours. How long to fill the tank together?',
    opts:['6 hours','7 hours','7.2 hours','8 hours'], ans:2 },
  { id:'AQ15', sec:'Quantitative Aptitude', topic:'Mixtures', diff:'Medium',
    q:'A mixture has milk and water in ratio 5:2. Total volume is 28 liters. How much milk is there?',
    opts:['18 L','20 L','22 L','24 L'], ans:1 },
  { id:'AQ16', sec:'Quantitative Aptitude', topic:'Geometry', diff:'Medium',
    q:'The area of a circle with radius 7 cm is: (Use π = 22/7)',
    opts:['154 cm²','144 cm²','132 cm²','164 cm²'], ans:0 },
  { id:'AQ17', sec:'Quantitative Aptitude', topic:'Mensuration', diff:'Medium',
    q:'What is the perimeter of a rectangle with length 12 cm and breadth 8 cm?',
    opts:['20 cm','40 cm','48 cm','96 cm'], ans:1 },

  // ── LOGICAL REASONING ──
  { id:'LR01', sec:'Logical Reasoning', topic:'Number Series', diff:'Easy',
    q:'Find the next number in the series: 2, 4, 8, 16, 32, ?',
    opts:['48','56','64','72'], ans:2 },
  { id:'LR02', sec:'Logical Reasoning', topic:'Coding-Decoding', diff:'Medium',
    q:'In a code language, "CAT" = "FDW" (each letter +3). How is "DOG" coded?',
    opts:['GRJ','GRK','GSK','HSJ'], ans:0 },
  { id:'LR03', sec:'Logical Reasoning', topic:'Blood Relations', diff:'Medium',
    q:'Introducing a man, a woman says, "He is the son of the only son of my grandfather." How is the woman related to the man?',
    opts:['Mother','Sister','Aunt','Daughter'], ans:1 },
  { id:'LR04', sec:'Logical Reasoning', topic:'Direction Sense', diff:'Easy',
    q:'A person walks 5 km North, then 3 km East, then 5 km South, then 3 km West. Where is he relative to start?',
    opts:['5 km North','3 km East','At starting point','6 km from start'], ans:2 },
  { id:'LR05', sec:'Logical Reasoning', topic:'Ranking', diff:'Easy',
    q:'In a row of 20 students, Amit is 8th from the left. What is his position from the right?',
    opts:['11th','12th','13th','14th'], ans:2 },
  { id:'LR06', sec:'Logical Reasoning', topic:'Analogy', diff:'Easy',
    q:'Book : Library :: Painting : ?',
    opts:['Artist','Gallery','Canvas','Frame'], ans:1 },
  { id:'LR07', sec:'Logical Reasoning', topic:'Syllogism', diff:'Medium',
    q:'All programmers are engineers. All engineers are graduates. Which is definitely true?',
    opts:['Some graduates are programmers','All programmers are graduates','No programmers are graduates','Some programmers are not engineers'], ans:1 },
  { id:'LR08', sec:'Logical Reasoning', topic:'Odd One Out', diff:'Easy',
    q:'Find the odd one out: Rose, Lily, Mango, Lotus',
    opts:['Rose','Lily','Mango','Lotus'], ans:2 },
  { id:'LR09', sec:'Logical Reasoning', topic:'Number Series', diff:'Medium',
    q:'Complete the series: 3, 9, 27, 81, ?',
    opts:['162','243','324','405'], ans:1 },
  { id:'LR10', sec:'Logical Reasoning', topic:'Letter Series', diff:'Easy',
    q:'Complete the series: A, C, E, G, ?',
    opts:['H','I','J','K'], ans:1 },
  { id:'LR11', sec:'Logical Reasoning', topic:'Missing Number', diff:'Medium',
    q:'Find the missing number: 2, 6, 12, 20, 30, ?',
    opts:['38','40','42','44'], ans:2 },
  { id:'LR12', sec:'Logical Reasoning', topic:'Statement-Conclusion', diff:'Medium',
    q:'All engineers are graduates. Rahul is an engineer. Which conclusion is definitely true?',
    opts:['Rahul is a graduate','Rahul is not a graduate','All graduates are engineers','Rahul may or may not be a graduate'], ans:0 },
  { id:'LR13', sec:'Logical Reasoning', topic:'Seating Arrangement', diff:'Hard',
    q:'5 persons A,B,C,D,E sit in a row. A is 2nd from left. B is immediately right of A. C is immediately right of B. D is at the rightmost end. Who is in the center?',
    opts:['A','B','C','E'], ans:1 },
  { id:'LR14', sec:'Logical Reasoning', topic:'Alpha-Numeric Series', diff:'Medium',
    q:'Complete: AZ, BY, CX, DW, ?',
    opts:['EV','EU','FV','EW'], ans:0 },
  { id:'LR15', sec:'Logical Reasoning', topic:'Analogy', diff:'Easy',
    q:'Doctor : Stethoscope :: Painter : ?',
    opts:['Hospital','Canvas','Brush','Frame'], ans:2 },
  { id:'LR16', sec:'Logical Reasoning', topic:'Data Arrangement', diff:'Medium',
    q:'If NORTH is coded as SOUTH and EAST is coded as WEST, what is the code for UP?',
    opts:['DOWN','UP','LEFT','RIGHT'], ans:0 },

  // ── ANALYTICAL REASONING ──
  { id:'AR01', sec:'Analytical Reasoning', topic:'Clocks', diff:'Medium',
    q:'What is the angle between the hour and minute hands of a clock at 3:30?',
    opts:['60°','70°','75°','80°'], ans:2 },
  { id:'AR02', sec:'Analytical Reasoning', topic:'Calendars', diff:'Easy',
    q:'If today is Tuesday, what day will it be exactly 100 days from now?',
    opts:['Wednesday','Thursday','Friday','Saturday'], ans:1 },
  { id:'AR03', sec:'Analytical Reasoning', topic:'Venn Diagrams', diff:'Easy',
    q:'In a class of 50, 30 like Math, 25 like Science, and 10 like both. How many like neither?',
    opts:['3','4','5','6'], ans:2 },
  { id:'AR04', sec:'Analytical Reasoning', topic:'Puzzle', diff:'Hard',
    q:'A, B, C, D live on floors 1-4. B is on floor 2. D is on the topmost floor. A is above C. Which floor is C on?',
    opts:['Floor 1','Floor 2','Floor 3','Floor 4'], ans:0 },
  { id:'AR05', sec:'Analytical Reasoning', topic:'Critical Reasoning', diff:'Medium',
    q:'All overtime employees receive bonuses. Priya received a bonus. What can be concluded?',
    opts:['Priya definitely worked overtime','Priya may or may not have worked overtime','Priya did not work overtime','Priya got the highest bonus'], ans:1 },
  { id:'AR06', sec:'Analytical Reasoning', topic:'Matrix Pattern', diff:'Medium',
    q:'In a 3×3 matrix: Row1=[2,4,6], Row2=[8,10,12], Row3=[14,16,?]. Find the missing number.',
    opts:['17','18','20','22'], ans:1 },

  // ── DATA INTERPRETATION ──
  { id:'DI01', sec:'Data Interpretation', topic:'Table Analysis', diff:'Medium',
    q:'Quarterly sales: Q1=120, Q2=180, Q3=150, Q4=200 units. Which consecutive quarters showed the highest growth?',
    opts:['Q1→Q2 (50% growth)','Q2→Q3 (decline)','Q3→Q4 (33%)','Q4→Q1'], ans:0 },
  { id:'DI02', sec:'Data Interpretation', topic:'Percentage Calculation', diff:'Medium',
    q:'Annual revenue is ₹6,50,000. Q1=20%, Q2=30%. What is the combined revenue of Q3 and Q4?',
    opts:['₹3,00,000','₹3,25,000','₹3,50,000','₹3,75,000'], ans:1 },
  { id:'DI03', sec:'Data Interpretation', topic:'Average', diff:'Medium',
    q:'Profit margins: 2020=15%, 2021=18%, 2022=12%, 2023=22%. What is the average profit margin?',
    opts:['16%','16.75%','17%','17.5%'], ans:1 },
  { id:'DI04', sec:'Data Interpretation', topic:'Percentage Change', diff:'Easy',
    q:'Product sales increased from 4,000 to 5,200 units. What is the percentage increase?',
    opts:['25%','28%','30%','32%'], ans:2 },
  { id:'DI05', sec:'Data Interpretation', topic:'Ratio Analysis', diff:'Hard',
    q:'Company X revenue=₹12L, Y=₹8L. X grows 25%, Y grows 50%. New ratio X:Y?',
    opts:['15:12','13:10','5:4','3:2'], ans:0 },
];

// ═══════════════════════════════════════════════════════════════════════════
//  GRAMMAR MCQ BANK (20 questions → pick 15)
// ═══════════════════════════════════════════════════════════════════════════
export const GRAMMAR_MCQ_BANK = [
  { id:'GM01', q:'The project was completed _______ schedule, earning the team a bonus.',
    opts:['in','on','at','ahead of'], ans:3 },
  { id:'GM02', q:'If I _______ you, I would have submitted the report on time.',
    opts:['was','were','am','had been'], ans:1 },
  { id:'GM03', q:'Neither the manager _______ the team members were present at the meeting.',
    opts:['or','nor','and','but'], ans:1 },
  { id:'GM04', q:'The new software _______ being tested by the QA team since last week.',
    opts:['is','was','has been','had been'], ans:2 },
  { id:'GM05', q:'He is one of those developers who _______ always on time.',
    opts:['is','are','was','were'], ans:1 },
  { id:'GM06', q:'The report _______ to the CEO by Friday without fail.',
    opts:['must submit','must be submitted','must have submitted','must been submitted'], ans:1 },
  { id:'GM07', q:'Despite _______ for hours, they could not resolve the bug.',
    opts:['working','to work','worked','have worked'], ans:0 },
  { id:'GM08', q:'The CEO, along with his advisors, _______ the quarterly results.',
    opts:['review','reviews','reviewed','reviewing'], ans:1 },
  { id:'GM09', q:'She has been working in this company _______ five years.',
    opts:['since','from','for','during'], ans:2 },
  { id:'GM10', q:'By the time the client arrives, the team _______ the prototype.',
    opts:['will finish','will have finished','finishes','finished'], ans:1 },
  { id:'GM11', q:'The manager asked the team _______ the presentation on time.',
    opts:['submit','submitting','to submit','submitted'], ans:2 },
  { id:'GM12', q:'It is important that every employee _______ the workplace guidelines.',
    opts:['follows','follow','following','followed'], ans:1 },
  { id:'GM13', q:'Choose the correctly spelled word:',
    opts:['accomodation','accommodation','accomadation','accommondation'], ans:1 },
  { id:'GM14', q:'Which sentence uses the active voice correctly?',
    opts:['The code was written by Priya.','Priya wrote the code.','The code has been written.','Writing was done by Priya.'], ans:1 },
  { id:'GM15', q:'The plural of "analysis" is:',
    opts:['analysises','analysies','analyses','analyzes'], ans:2 },
  { id:'GM16', q:'"She has a talent _______ solving complex problems." Choose the correct preposition.',
    opts:['in','at','for','of'], ans:2 },
  { id:'GM17', q:'Which of the following is a complex sentence?',
    opts:['He runs and she swims.','When he arrives, we will start.','She runs every day.','He is strong and smart.'], ans:1 },
  { id:'GM18', q:'"The board _______ to postpone the launch until Q3." Choose the correct tense.',
    opts:['decide','decided','have decided','deciding'], ans:1 },
  { id:'GM19', q:'"We should _______ our resources wisely." Choose the best word.',
    opts:['utilize','use','employ','All of the above are correct'], ans:3 },
  { id:'GM20', q:'Choose the word most opposite in meaning to "verbose":',
    opts:['Concise','Lengthy','Detailed','Elaborate'], ans:0 },
];

// ═══════════════════════════════════════════════════════════════════════════
//  BUSINESS COMMUNICATION MCQ BANK (12 questions → pick 10)
// ═══════════════════════════════════════════════════════════════════════════
export const BUSINESS_COMM_BANK = [
  { id:'BC01', q:'Which email subject line is most professional for following up on an interview?',
    opts:['Regarding the Job','Following Up on My Application – [Name]','Hey! Any update?','Job update needed'], ans:1 },
  { id:'BC02', q:'In a professional email, "Please revert" should be replaced with:',
    opts:['Please reply','Please return','Please respond','Please react'], ans:2 },
  { id:'BC03', q:'The CC field in an email is best used for:',
    opts:['Primary recipients','People who should be aware but not required to respond','Confidential recipients','Mass mailing'], ans:1 },
  { id:'BC04', q:'Which opening is most appropriate for a formal business presentation?',
    opts:['Hey everyone!','Good morning, respected panel and esteemed audience.','Hello people!','Hi all, let us start.'], ans:1 },
  { id:'BC05', q:'What does "KPI" stand for in corporate communication?',
    opts:['Key Planning Index','Key Performance Indicator','Key Process Improvement','Knowledge Process Integration'], ans:1 },
  { id:'BC06', q:'Active listening in a business meeting involves:',
    opts:['Talking frequently to show engagement','Nodding and taking notes while paying full attention','Checking emails while someone speaks','Waiting for your turn to speak only'], ans:1 },
  { id:'BC07', q:'Which tone is most appropriate for a business proposal document?',
    opts:['Informal and friendly','Formal, clear, and persuasive','Casual and conversational','Humorous and light'], ans:1 },
  { id:'BC08', q:'An executive summary in a business report is meant to:',
    opts:['Provide technical specifications in detail','Summarize key points for quick decision-making','List all team members involved','Explain the project timeline in full detail'], ans:1 },
  { id:'BC09', q:'What does "ASAP" stand for in corporate communication?',
    opts:['As Soon As Possible','As Scheduled And Planned','At Some Appropriate Point','After Some Assessment Period'], ans:0 },
  { id:'BC10', q:'Which closing phrase is most appropriate for a formal business email?',
    opts:['Bye!','See you!','Regards / Sincerely yours,','Later!'], ans:2 },
  { id:'BC11', q:'"Verbosity" in corporate writing refers to:',
    opts:['Being concise and clear','Using too many words when fewer would suffice','Using technical jargon appropriately','Being persuasive in writing'], ans:1 },
  { id:'BC12', q:'What is the most effective structure for a business email?',
    opts:['Greeting → Details → Greeting','Subject → Body → Conclusion → Signature','Introduction → Complaint → Demands','Name → Date → Request only'], ans:1 },
];

// ═══════════════════════════════════════════════════════════════════════════
//  LISTENING COMPREHENSION PASSAGES (2 passages × 5 MCQs)
// ═══════════════════════════════════════════════════════════════════════════
export const LISTENING_PASSAGES = [
  {
    id:'LP01',
    title:'Enterprise Cloud Migration Strategy',
    audio:'Welcome to Cognizant quarterly planning. Our Banking sector client has initiated a migration from on-premise infrastructure to Amazon Web Services. The primary objectives are to reduce operational latency by 45 percent and improve disaster recovery capabilities. All developers must complete their AWS Cloud Practitioner certification by the 15th of next month. The migration will be conducted in three phases over six months. Phase one covers identity and access management. Phase two handles data migration and validation. Phase three focuses on full application modernization and performance optimization.',
    questions:[
      { q:'What is the primary goal of the cloud migration?',
        opts:['Reduce costs by 50%','Reduce latency by 45% & improve disaster recovery','Hire 100 cloud engineers','Switch all clients to Google Cloud'], ans:1 },
      { q:'Which industry sector does the client belong to?',
        opts:['Healthcare','Retail','Banking','Automotive'], ans:2 },
      { q:'What certification must developers complete?',
        opts:['AWS Solutions Architect','AWS Cloud Practitioner','Google Cloud Professional','Azure Fundamentals'], ans:1 },
      { q:'How many phases does the migration plan have?',
        opts:['Two','Three','Four','Five'], ans:1 },
      { q:'What does Phase 3 of the migration focus on?',
        opts:['Data migration','Identity management','Application modernization','Network setup'], ans:2 },
    ]
  },
  {
    id:'LP02',
    title:'Agile Sprint Retrospective — Retail Engineering',
    audio:'Good afternoon team. In yesterday\'s sprint retrospective for our retail client, the tech lead noted that user acceptance testing was highly positive. The new checkout workflow scored 4.7 out of 5 in user satisfaction. However, performance testing revealed a critical bottleneck in the inventory service, causing response times to exceed two seconds during peak load. The team has decided to implement Redis caching to address this before the release scheduled for next Friday. Additionally, the mobile team will delay their feature by one sprint to assist with backend optimization.',
    questions:[
      { q:'What was the user satisfaction score for the checkout workflow?',
        opts:['4.3 out of 5','4.5 out of 5','4.7 out of 5','5 out of 5'], ans:2 },
      { q:'Which service had a critical bottleneck?',
        opts:['Checkout service','Payment gateway','Inventory service','User authentication'], ans:2 },
      { q:'What solution will resolve the bottleneck?',
        opts:['Memcached','Redis caching','CDN implementation','Database replication'], ans:1 },
      { q:'When is the product release scheduled?',
        opts:['This Friday','Next Monday','Next Friday','End of month'], ans:2 },
      { q:'Why will the mobile team delay their feature?',
        opts:['Lack of resources','To assist with backend optimization','Client requested it','Budget constraints'], ans:1 },
    ]
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  READING ALOUD SENTENCES (12)
// ═══════════════════════════════════════════════════════════════════════════
export const READING_SENTENCES = [
  'Cognizant leverages digital technologies, cloud computing, and artificial intelligence to help global enterprises reimagine their core business processes.',
  'Effective business communication requires clarity, precision, and active listening across cross-functional engineering teams.',
  'Software engineers at Cognizant build scalable microservices architectures that process millions of real-time transactions reliably.',
  'Continuous integration and automated testing pipelines significantly accelerate software delivery while maintaining enterprise security standards.',
  'The GenC Next program is designed for candidates with strong analytical abilities, coding proficiency, and problem-solving aptitude.',
  'Relational database optimization requires strategic indexing, efficient query execution plans, and thoughtful schema normalization.',
  'Cloud-native infrastructure delivers elasticity, cost efficiency, and automated disaster recovery for mission-critical enterprise applications.',
  'Agile development methodologies encourage collaborative sprint cycles, rapid prototyping, and continuous client feedback.',
  'Object-oriented programming principles such as encapsulation, polymorphism, and abstraction promote maintainable and reusable code.',
  'Cognizant serves clients across banking, insurance, healthcare, and retail sectors with transformative digital solutions.',
  'Modern DevOps practices integrate development and operations workflows to reduce deployment cycles and improve system reliability.',
  'Professional software engineers must understand design patterns, data structures, algorithms, and software architecture principles.',
];

// ═══════════════════════════════════════════════════════════════════════════
//  SENTENCE REPETITION (10)
// ═══════════════════════════════════════════════════════════════════════════
export const REPETITION_SENTENCES = [
  'The client meeting has been rescheduled to three o\'clock tomorrow afternoon.',
  'Please submit your weekly technical progress report before the end of business today.',
  'Our deployment team successfully released the microservice update with zero system downtime.',
  'We need to optimize the database query response time under peak concurrent user load.',
  'Cognizant provides comprehensive onboarding and training programs for fresh engineering graduates.',
  'The security audit identified two critical vulnerabilities in the payment processing gateway.',
  'All developers are expected to adhere to clean code standards during enterprise software development.',
  'Asynchronous event-driven processing significantly improves throughput in high-volume applications.',
  'The Q3 performance metrics indicate a twelve percent improvement in overall system response time.',
  'Please review the technical specification document and provide your feedback by Thursday.',
];

// ═══════════════════════════════════════════════════════════════════════════
//  EXTEMPORE TOPICS (5)
// ═══════════════════════════════════════════════════════════════════════════
export const EXTEMPORE_TOPICS = [
  'The Impact of Artificial Intelligence and Machine Learning on Modern IT Services',
  'How Cloud Computing is Transforming Enterprise Digital Transformation Strategies',
  'The Importance of Cybersecurity in Financial Technology Applications',
  'Why Adaptability and Continuous Learning are Critical for Engineering Graduates',
  'Microservices Architecture vs Monolithic Architecture: Strategic Technology Decisions',
];

// ═══════════════════════════════════════════════════════════════════════════
//  TECHNICAL MCQ BANK (8 clusters × 6-8 questions = ~54 questions)
// ═══════════════════════════════════════════════════════════════════════════
export const TECHNICAL_MCQ_BANK = {
  java: [
    { id:'TJ01', cluster:'Java Core & OOP', q:'Which memory area in the Java JVM stores local variables and method call stack frames?',
      opts:['Heap Memory','Stack Memory','Method Area','PC Register'], ans:1 },
    { id:'TJ02', cluster:'Java Core & OOP', q:'In Java, which keyword prevents a class from being subclassed?',
      opts:['static','abstract','final','synchronized'], ans:2 },
    { id:'TJ03', cluster:'Java Core & OOP', q:'What is the output of: System.out.println(10 + 20 + "Cognizant");',
      opts:['"10 + 20 + Cognizant"','1020Cognizant','30Cognizant','Cognizant1020'], ans:2 },
    { id:'TJ04', cluster:'Java Core & OOP', q:'Which OOP concept allows a subclass to provide a specific implementation of a method already defined in its parent class?',
      opts:['Overloading','Overriding','Abstraction','Encapsulation'], ans:1 },
    { id:'TJ05', cluster:'Java Core & OOP', q:'What is the default value of an int instance variable in Java if not initialized?',
      opts:['null','undefined','0','-1'], ans:2 },
    { id:'TJ06', cluster:'Java Core & OOP', q:'What is the key difference between an Abstract Class and an Interface in Java 8+?',
      opts:['No difference','Abstract class can have constructor and state; interface can have default methods','Interface can have constructors','Abstract class cannot have abstract methods'], ans:1 },
    { id:'TJ07', cluster:'Java Core & OOP', q:'Which exception is thrown when a program tries to use a null reference?',
      opts:['IllegalArgumentException','ClassCastException','NullPointerException','ArrayIndexOutOfBoundsException'], ans:2 },
  ],
  sql: [
    { id:'TS01', cluster:'SQL & DBMS', q:'Which SQL clause filters grouped records returned by GROUP BY?',
      opts:['WHERE','HAVING','ORDER BY','FILTER'], ans:1 },
    { id:'TS02', cluster:'SQL & DBMS', q:'Which JOIN returns all rows from both tables, with NULLs where no match exists?',
      opts:['INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL OUTER JOIN'], ans:3 },
    { id:'TS03', cluster:'SQL & DBMS', q:'Which isolation level prevents Dirty Reads but allows Non-Repeatable Reads?',
      opts:['Read Uncommitted','Read Committed','Repeatable Read','Serializable'], ans:1 },
    { id:'TS04', cluster:'SQL & DBMS', q:'What does ACID stand for in database transactions?',
      opts:['Atomicity, Consistency, Isolation, Durability','Access, Control, Index, Data','Availability, Consistency, Integrity, Durability','Atomic, Committed, Indexed, Distributed'], ans:0 },
    { id:'TS05', cluster:'SQL & DBMS', q:'Which SQL statement modifies the structure of an existing table?',
      opts:['UPDATE','MODIFY','ALTER TABLE','CHANGE TABLE'], ans:2 },
    { id:'TS06', cluster:'SQL & DBMS', q:'Which SQL keyword removes duplicate rows from a result set?',
      opts:['UNIQUE','REMOVE','DISTINCT','FILTER'], ans:2 },
    { id:'TS07', cluster:'SQL & DBMS', q:'In which normal form is a table if it is in 1NF and has no partial dependencies on a composite key?',
      opts:['1NF','2NF','3NF','BCNF'], ans:1 },
  ],
  htmlcss: [
    { id:'TH01', cluster:'HTML & CSS', q:'Which HTML5 element defines the main content area of a document?',
      opts:['<div>','<content>','<main>','<body>'], ans:2 },
    { id:'TH02', cluster:'HTML & CSS', q:'What does CSS Flexbox\'s "justify-content: space-between" do?',
      opts:['Centers all items','Places equal space inside items','Distributes items with space between them','Aligns items to the start'], ans:2 },
    { id:'TH03', cluster:'HTML & CSS', q:'What is the correct CSS specificity order from lowest to highest?',
      opts:['ID > Class > Element','Element > Class > ID','Class > ID > Element','ID > Element > Class'], ans:1 },
    { id:'TH04', cluster:'HTML & CSS', q:'Which HTML attribute makes a form field mandatory before submission?',
      opts:['mandatory','validate','required','must-fill'], ans:2 },
    { id:'TH05', cluster:'HTML & CSS', q:'Which CSS property is used to create a grid layout container?',
      opts:['display: flex','display: table','display: grid','position: grid'], ans:2 },
    { id:'TH06', cluster:'HTML & CSS', q:'What does the "viewport" meta tag control in HTML5 mobile development?',
      opts:['JavaScript execution','Page rendering width and scale on mobile devices','Server response','Cookie settings'], ans:1 },
  ],
  javascript: [
    { id:'TJS01', cluster:'JavaScript', q:'What is the key difference between "var", "let", and "const"?',
      opts:['No difference','var is function-scoped; let and const are block-scoped; const cannot be reassigned','let is global; var is local','const can be reassigned but not redeclared'], ans:1 },
    { id:'TJS02', cluster:'JavaScript', q:'What does a JavaScript closure provide?',
      opts:['A way to close the browser window','Access to outer function scope even after the outer function has returned','A class definition syntax','A method to end a loop'], ans:1 },
    { id:'TJS03', cluster:'JavaScript', q:'What is the output of: typeof null in JavaScript?',
      opts:['"null"','"undefined"','"object"','"boolean"'], ans:2 },
    { id:'TJS04', cluster:'JavaScript', q:'Which JavaScript feature allows async code to be written in synchronous style?',
      opts:['Callbacks','Promises','async/await','setTimeout'], ans:2 },
    { id:'TJS05', cluster:'JavaScript', q:'What does "===" check in JavaScript?',
      opts:['Value only','Type only','Both value and type (strict equality)','Assignment'], ans:2 },
    { id:'TJS06', cluster:'JavaScript', q:'What is the purpose of the JavaScript event loop?',
      opts:['Execute DOM events','Handle asynchronous callbacks by checking the call stack and task queue','Manage memory garbage collection','Compile JavaScript at runtime'], ans:1 },
  ],
  os: [
    { id:'TO01', cluster:'Operating System', q:'In OS, what condition occurs when Process A waits for a resource held by Process B, and vice versa?',
      opts:['Starvation','Deadlock','Race Condition','Page Fault'], ans:1 },
    { id:'TO02', cluster:'Operating System', q:'Which CPU scheduling algorithm gives priority to the process with the shortest burst time?',
      opts:['FCFS','Round Robin','SJF (Shortest Job First)','Priority Scheduling'], ans:2 },
    { id:'TO03', cluster:'Operating System', q:'What is the key difference between a Process and a Thread?',
      opts:['No difference','A process is a program in execution; a thread is a lightweight sub-process within it','A thread is heavier than a process','Processes share memory space by default'], ans:1 },
    { id:'TO04', cluster:'Operating System', q:'What does a Semaphore do in an OS?',
      opts:['Schedule CPU tasks','Manage network packets','Synchronize access to shared resources','Encrypt memory'], ans:2 },
    { id:'TO05', cluster:'Operating System', q:'Which page replacement algorithm replaces the page not used for the longest time in the future?',
      opts:['FIFO','LRU','Optimal Page Replacement','LFU'], ans:2 },
    { id:'TO06', cluster:'Operating System', q:'What is Virtual Memory?',
      opts:['RAM on the cloud','Disk space used as extension of physical RAM','Shared memory between processes','Encrypted memory space'], ans:1 },
  ],
  networks: [
    { id:'TN01', cluster:'Computer Networks', q:'Which OSI layer is responsible for end-to-end communication and error recovery?',
      opts:['Network Layer','Data Link Layer','Transport Layer','Session Layer'], ans:2 },
    { id:'TN02', cluster:'Computer Networks', q:'What is the default subnet mask for a Class C IP address?',
      opts:['255.0.0.0','255.255.0.0','255.255.255.0','255.255.255.255'], ans:2 },
    { id:'TN03', cluster:'Computer Networks', q:'What does the DNS protocol do?',
      opts:['Encrypts internet traffic','Translates domain names to IP addresses','Routes packets across networks','Manages IP allocation'], ans:1 },
    { id:'TN04', cluster:'Computer Networks', q:'In the TCP/IP three-way handshake, which is the correct sequence?',
      opts:['SYN → ACK → SYN-ACK','SYN → SYN-ACK → ACK','ACK → SYN → SYN-ACK','SYN-ACK → SYN → ACK'], ans:1 },
    { id:'TN05', cluster:'Computer Networks', q:'What does HTTP status code 404 indicate?',
      opts:['Server Error','Request Timeout','Resource Not Found','Unauthorized Access'], ans:2 },
    { id:'TN06', cluster:'Computer Networks', q:'Which protocol provides reliable, connection-oriented communication?',
      opts:['UDP','ICMP','TCP','ARP'], ans:2 },
  ],
  cloud: [
    { id:'TC01', cluster:'Cloud & DevOps', q:'Which cloud service model provides virtualized computing infrastructure (VMs, storage, networking)?',
      opts:['SaaS','PaaS','IaaS','FaaS'], ans:2 },
    { id:'TC02', cluster:'Cloud & DevOps', q:'What is the primary difference between Containers and Virtual Machines?',
      opts:['No difference','Containers share the host OS kernel and are lighter; VMs have separate OS instances','VMs are faster than containers','Containers require hardware virtualization'], ans:1 },
    { id:'TC03', cluster:'Cloud & DevOps', q:'What does CI/CD stand for in DevOps?',
      opts:['Cloud Infrastructure / Cloud Deployment','Continuous Integration / Continuous Deployment','Code Inspection / Code Delivery','Central Integration / Core Distribution'], ans:1 },
    { id:'TC04', cluster:'Cloud & DevOps', q:'Which AWS service is a fully managed relational database service?',
      opts:['EC2','S3','RDS','Lambda'], ans:2 },
    { id:'TC05', cluster:'Cloud & DevOps', q:'What is the purpose of a Load Balancer in cloud architecture?',
      opts:['Store large datasets','Distribute incoming traffic across multiple servers','Encrypt data in transit','Monitor application logs'], ans:1 },
    { id:'TC06', cluster:'Cloud & DevOps', q:'Which architectural pattern decomposes an application into small, independent services?',
      opts:['Monolithic Architecture','SOA','Microservices Architecture','Serverless Architecture'], ans:2 },
  ],
  collections: [
    { id:'TCO01', cluster:'Java Collections & Exceptions', q:'Main difference between ArrayList and LinkedList?',
      opts:['ArrayList is ordered; LinkedList is not','ArrayList has fast random access; LinkedList has fast insertion/deletion','LinkedList is faster for all operations','ArrayList supports null; LinkedList does not'], ans:1 },
    { id:'TCO02', cluster:'Java Collections & Exceptions', q:'Which Java collection class is thread-safe and synchronized by default?',
      opts:['ArrayList','HashMap','Vector','HashSet'], ans:2 },
    { id:'TCO03', cluster:'Java Collections & Exceptions', q:'What is the time complexity of searching an element in a HashMap (average case)?',
      opts:['O(n)','O(log n)','O(1)','O(n log n)'], ans:2 },
    { id:'TCO04', cluster:'Java Collections & Exceptions', q:'Which exception is thrown when you try to access an array element with an invalid index?',
      opts:['NullPointerException','ClassCastException','ArrayIndexOutOfBoundsException','IllegalArgumentException'], ans:2 },
    { id:'TCO05', cluster:'Java Collections & Exceptions', q:'What is the difference between Checked and Unchecked Exceptions in Java?',
      opts:['No difference','Checked must be handled at compile time; Unchecked are runtime exceptions','Unchecked must be declared','Checked extend RuntimeException'], ans:1 },
    { id:'TCO06', cluster:'Java Collections & Exceptions', q:'Which Java keyword is used to manually throw an exception?',
      opts:['catch','throws','throw','exception'], ans:2 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
//  CODING PROBLEMS (5 problems → pick 2)
// ═══════════════════════════════════════════════════════════════════════════
export const CODING_PROBLEMS = [
  {
    id:'CP01', title:'Maximum Subarray Sum', difficulty:'Medium', category:'Arrays & DP',
    timeLimit:'1 second', memoryLimit:'256 MB',
    problemStatement:`Given an integer array **nums**, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. Implement using **Kadane's Algorithm** with O(n) time complexity.

**Example 1:**
\`\`\`
Input:  nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.
\`\`\`

**Example 2:**
\`\`\`
Input:  nums = [1]
Output: 1
\`\`\`

**Constraints:**
- 1 ≤ nums.length ≤ 10⁵
- -10⁴ ≤ nums[i] ≤ 10⁴`,
    sampleCases:[
      { input:'[-2,1,-3,4,-1,2,1,-5,4]', output:'6', status:null },
      { input:'[1]', output:'1', status:null },
      { input:'[-1]', output:'-1', status:null },
    ],
    hiddenCases:[ { input:'[-2,-1]', output:'-1' }, { input:'[5,4,-1,7,8]', output:'23' } ],
    starterCode:{
      java:`public class Solution {
    public static int maxSubArray(int[] nums) {
        // Your solution here
        // Hint: Use Kadane's Algorithm
        int maxSoFar = nums[0], currMax = nums[0];
        
    }
}`,
      python:`class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        # Your solution here
        pass`,
      c:`int maxSubArray(int* nums, int numsSize) {
    // Your solution here
}`,
      cpp:`#include <vector>
class Solution {
public:
    int maxSubArray(std::vector<int>& nums) {
        // Your solution here
    }
};`,
      javascript:`function maxSubArray(nums) {
    // Your solution here
}`
    }
  },
  {
    id:'CP02', title:'Two Sum', difficulty:'Easy', category:'Arrays & Hash Maps',
    timeLimit:'1 second', memoryLimit:'256 MB',
    problemStatement:`Given an array of integers **nums** and an integer **target**, return indices of the two numbers such that they add up to target. You may not use the same element twice. Return the answer in any order.

**Example 1:**
\`\`\`
Input:  nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9.
\`\`\`

**Example 2:**
\`\`\`
Input:  nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Constraints:**
- 2 ≤ nums.length ≤ 10⁴
- Each input has exactly one solution
- Expected Time Complexity: O(n)`,
    sampleCases:[
      { input:'nums=[2,7,11,15], target=9', output:'[0,1]', status:null },
      { input:'nums=[3,2,4], target=6', output:'[1,2]', status:null },
    ],
    hiddenCases:[ { input:'nums=[3,3], target=6', output:'[0,1]' }, { input:'nums=[1,2,3,4,5], target=9', output:'[3,4]' } ],
    starterCode:{
      java:`import java.util.*;
public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Your solution here
        // Hint: Use a HashMap for O(n) solution
        
    }
}`,
      python:`class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Your solution here
        pass`,
      c:`int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your solution here
}`,
      cpp:`#include <vector>
#include <unordered_map>
class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        // Your solution here
    }
};`,
      javascript:`function twoSum(nums, target) {
    // Your solution here
}`
    }
  },
  {
    id:'CP03', title:'Check Palindrome String', difficulty:'Easy', category:'Strings',
    timeLimit:'1 second', memoryLimit:'128 MB',
    problemStatement:`Given a string **s**, return **true** if it is a palindrome (reads the same forward and backward), and **false** otherwise. Consider only alphanumeric characters and ignore case.

**Example 1:**
\`\`\`
Input:  s = "racecar"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input:  s = "hello"
Output: false
\`\`\`

**Constraints:**
- 1 ≤ s.length ≤ 2 × 10⁵`,
    sampleCases:[
      { input:'"racecar"', output:'true', status:null },
      { input:'"hello"', output:'false', status:null },
      { input:'"A man a plan a canal Panama"', output:'true', status:null },
    ],
    hiddenCases:[ { input:'""', output:'true' }, { input:'"a"', output:'true' } ],
    starterCode:{
      java:`public class Solution {
    public static boolean isPalindrome(String s) {
        // Your solution here
    }
}`,
      python:`class Solution:
    def isPalindrome(self, s: str) -> bool:
        pass`,
      c:`#include <stdbool.h>
bool isPalindrome(char* s) {
}`,
      cpp:`#include <string>
class Solution {
public:
    bool isPalindrome(std::string s) {
    }
};`,
      javascript:`function isPalindrome(s) {
}`
    }
  },
  {
    id:'CP04', title:'Binary Search', difficulty:'Easy', category:'Searching',
    timeLimit:'1 second', memoryLimit:'128 MB',
    problemStatement:`Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return -1. You must write an algorithm with **O(log n)** runtime complexity.

**Example 1:**
\`\`\`
Input:  nums = [-1,0,3,5,9,12], target = 9
Output: 4
\`\`\`

**Example 2:**
\`\`\`
Input:  nums = [-1,0,3,5,9,12], target = 2
Output: -1
\`\`\``,
    sampleCases:[
      { input:'nums=[-1,0,3,5,9,12], target=9', output:'4', status:null },
      { input:'nums=[-1,0,3,5,9,12], target=2', output:'-1', status:null },
    ],
    hiddenCases:[ { input:'nums=[1], target=1', output:'0' }, { input:'nums=[1,2,3,4,5], target=3', output:'2' } ],
    starterCode:{
      java:`public class Solution {
    public static int search(int[] nums, int target) {
        // Binary search solution here
    }
}`,
      python:`class Solution:
    def search(self, nums: list[int], target: int) -> int:
        pass`,
      c:`int search(int* nums, int numsSize, int target) {
}`,
      cpp:`#include <vector>
class Solution {
public:
    int search(std::vector<int>& nums, int target) {
    }
};`,
      javascript:`function search(nums, target) {
}`
    }
  },
  {
    id:'CP05', title:'Fibonacci Number', difficulty:'Easy', category:'Math & DP',
    timeLimit:'1 second', memoryLimit:'128 MB',
    problemStatement:`Given **n**, calculate **F(n)** where F(n) is the nth Fibonacci number. The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...

**F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) for n > 1**

Implement an efficient O(n) solution using dynamic programming.

**Example 1:**
\`\`\`
Input:  n = 4
Output: 3  (0, 1, 1, 2, 3)
\`\`\`

**Example 2:**
\`\`\`
Input:  n = 10
Output: 55
\`\`\``,
    sampleCases:[
      { input:'n=4', output:'3', status:null },
      { input:'n=10', output:'55', status:null },
    ],
    hiddenCases:[ { input:'n=0', output:'0' }, { input:'n=1', output:'1' } ],
    starterCode:{
      java:`public class Solution {
    public static int fib(int n) {
        // Your O(n) DP solution here
    }
}`,
      python:`class Solution:
    def fib(self, n: int) -> int:
        pass`,
      c:`int fib(int n) {
}`,
      cpp:`class Solution {
public:
    int fib(int n) {
    }
};`,
      javascript:`function fib(n) {
}`
    }
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  GAME PATTERN QUESTIONS (for Pattern Challenge mini-game)
// ═══════════════════════════════════════════════════════════════════════════
export const GAME_PATTERN_QUESTIONS = [
  { q:'2, 4, 8, 16, 32, ?', opts:['40','48','64','128'], ans:2 },
  { q:'1, 4, 9, 16, 25, ?', opts:['30','36','49','64'], ans:1 },
  { q:'A, C, E, G, ?', opts:['H','I','J','K'], ans:1 },
  { q:'AZ, BY, CX, ?', opts:['DW','EV','DV','EW'], ans:0 },
  { q:'3, 6, 11, 18, 27, ?', opts:['36','38','38','40'], ans:1 },
  { q:'1, 1, 2, 3, 5, 8, ?', opts:['11','12','13','16'], ans:2 },
  { q:'Z, X, V, T, ?', opts:['S','R','P','Q'], ans:1 },
];

export const GAME_LOGIC_QUESTIONS = [
  { q:'All cats are animals. All animals breathe. Therefore, all cats ___.',
    opts:['are mammals','breathe','have fur','can fly'], ans:1 },
  { q:'If no A is B, and all B are C, which is definitely true?',
    opts:['Some A are C','No A is C','Some C are A','All C are A'], ans:1 },
  { q:'All roses are flowers. Some flowers fade quickly. What can be concluded?',
    opts:['Some roses fade quickly','No roses fade','All roses fade','Cannot be determined'], ans:3 },
  { q:'A > B, B > C, C > D. Which is necessarily true?',
    opts:['A > C','A > D','B > D','All of the above'], ans:3 },
  { q:'Either John or Mary wrote the report. Mary did not write it. Therefore ___.',
    opts:['Nobody wrote it','John wrote it','Both wrote it','Cannot determine'], ans:1 },
];

// ═══════════════════════════════════════════════════════════════════════════
//  PAPER GENERATION FUNCTION — unique paper per session
// ═══════════════════════════════════════════════════════════════════════════
export const generateExamPaper = () => {
  const apt = _shuffle([...APTITUDE_BANK]).slice(0, 35);
  const gram = _shuffle([...GRAMMAR_MCQ_BANK]).slice(0, 15);
  const biz = _shuffle([...BUSINESS_COMM_BANK]).slice(0, 10);
  const listen = _shuffle([...LISTENING_PASSAGES]);
  const reading = _shuffle([...READING_SENTENCES]).slice(0, 12);
  const repetition = _shuffle([...REPETITION_SENTENCES]).slice(0, 10);
  const extTopics = _shuffle([...EXTEMPORE_TOPICS]).slice(0, 3);
  const patternQs = _shuffle([...GAME_PATTERN_QUESTIONS]).slice(0, 5);
  const logicQs = _shuffle([...GAME_LOGIC_QUESTIONS]).slice(0, 5);

  const techQuestions = _shuffle([
    ..._shuffle([...TECHNICAL_MCQ_BANK.java]).slice(0, 6),
    ..._shuffle([...TECHNICAL_MCQ_BANK.sql]).slice(0, 5),
    ..._shuffle([...TECHNICAL_MCQ_BANK.htmlcss]).slice(0, 5),
    ..._shuffle([...TECHNICAL_MCQ_BANK.javascript]).slice(0, 5),
    ..._shuffle([...TECHNICAL_MCQ_BANK.os]).slice(0, 5),
    ..._shuffle([...TECHNICAL_MCQ_BANK.networks]).slice(0, 5),
    ..._shuffle([...TECHNICAL_MCQ_BANK.cloud]).slice(0, 5),
    ..._shuffle([...TECHNICAL_MCQ_BANK.collections]).slice(0, 4),
  ]);

  const coding = _shuffle([...CODING_PROBLEMS]).slice(0, 2);

  return {
    aptitude: apt,
    communicationGrammar: gram,
    communicationBusiness: biz,
    listeningPassages: listen,
    readingSentences: reading,
    repetitionSentences: repetition,
    extemporeTopics: extTopics,
    gamePatternQs: patternQs,
    gameLogicQs: logicQs,
    technicalMCQ: techQuestions,
    codingProblems: coding,
  };
};
