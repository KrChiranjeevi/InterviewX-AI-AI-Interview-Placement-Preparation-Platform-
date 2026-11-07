const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });
const AssessmentQuestion = require('./models/AssessmentQuestion');

const NEW_QUESTIONS = [
  // ===================== APTITUDE (Logical & General Aptitude) =====================
  {
    module: 'aptitude',
    subCategory: 'Puzzles & Logic',
    difficulty: 'Easy',
    question: 'If you have a 3-gallon jug and a 5-gallon jug, how can you measure exactly 4 gallons of water?',
    options: ['Fill 5-gal, pour into 3-gal until full, empty 3-gal, pour remaining 2-gal into 3-gal, fill 5-gal, pour 1-gal into 3-gal', 'Fill 3-gal twice and pour into 5-gal', 'Fill 5-gal halfway', 'Cannot be done with these jugs'],
    correctAnswer: 'Fill 5-gal, pour into 3-gal until full, empty 3-gal, pour remaining 2-gal into 3-gal, fill 5-gal, pour 1-gal into 3-gal',
    explanation: 'Classic water jug puzzle: 5 - 3 = 2 gal left in 5-gal jug. Pour 2 gal to 3-gal jug (leaving 1 gal space). Fill 5-gal and pour 1 gal to 3-gal jug. Exactly 4 gallons remain in 5-gal jug.',
    timeExpected: 90
  },
  {
    module: 'aptitude',
    subCategory: 'Seating Arrangement',
    difficulty: 'Medium',
    question: 'Six friends A, B, C, D, E, F sit in a circle facing inward. A is opposite B. C is to the immediate right of A. D is between B and C. Who sits opposite C?',
    options: ['E', 'D', 'F', 'B'],
    correctAnswer: 'E',
    explanation: 'Placing positions 1 to 6 clockwise: A at 1, B at 4 (opposite). C at 2 (right of A). D between B and C -> D at 3. Then opposite C (position 2) is position 5, which must be E or F. Since D is at 3 and B at 4, the opposite of C (pos 2) is pos 5, which is E.',
    timeExpected: 90
  },
  {
    module: 'aptitude',
    subCategory: 'Blood Relations',
    difficulty: 'Easy',
    question: 'Pointing to a gentleman, Deepak said, "His only brother is the father of my daughter\'s father." How is the gentleman related to Deepak?',
    options: ['Uncle', 'Father', 'Brother', 'Grandfather'],
    correctAnswer: 'Uncle',
    explanation: 'My daughter\'s father is Deepak himself. So the gentleman\'s only brother is Deepak\'s father. Therefore, the gentleman is Deepak\'s father\'s brother, which is Deepak\'s Uncle.',
    timeExpected: 60
  },
  {
    module: 'aptitude',
    subCategory: 'Direction Sense',
    difficulty: 'Medium',
    question: 'Rohan walks 12 km North, then 5 km West, then 12 km South. How far and in what direction is he from his starting point?',
    options: ['5 km West', '5 km East', '12 km West', '29 km North'],
    correctAnswer: '5 km West',
    explanation: 'North 12 and South 12 cancel each other out on the vertical axis. The remaining horizontal displacement is 5 km West.',
    timeExpected: 60
  },
  {
    module: 'aptitude',
    subCategory: 'Coding-Decoding',
    difficulty: 'Easy',
    question: 'In a code language, if "ORANGE" is written as "PSBOHF", how is "LEMON" written in that code?',
    options: ['MFNPO', 'MENPO', 'MDNPO', 'NFMPP'],
    correctAnswer: 'MFNPO',
    explanation: 'Each letter is shifted by +1: L->M, E->F, M->N, O->P, N->O. Result: MFNPO.',
    timeExpected: 45
  },
  {
    module: 'aptitude',
    subCategory: 'Number Series',
    difficulty: 'Medium',
    question: 'Find the next term in the sequence: 4, 12, 36, 108, ?',
    options: ['324', '216', '432', '312'],
    correctAnswer: '324',
    explanation: 'Each number is multiplied by 3: 4*3=12, 12*3=36, 36*3=108, 108*3=324.',
    timeExpected: 45
  },
  {
    module: 'aptitude',
    subCategory: 'Syllogism',
    difficulty: 'Medium',
    question: 'Statements: All pens are books. All books are pencils. Conclusion I: All pens are pencils. Conclusion II: Some pencils are pens.',
    options: ['Both conclusions I and II follow', 'Only conclusion I follows', 'Only conclusion II follows', 'Neither follows'],
    correctAnswer: 'Both conclusions I and II follow',
    explanation: 'Pens ⊂ Books ⊂ Pencils. Therefore, all pens are pencils (I holds). Since pens is a non-empty subset of pencils, some pencils are pens (II holds).',
    timeExpected: 60
  },
  {
    module: 'aptitude',
    subCategory: 'Clocks & Calendars',
    difficulty: 'Hard',
    question: 'At what time between 4 and 5 o\'clock will the hands of a clock be pointing in opposite directions (180 degrees)?',
    options: ['4:54 6/11', '4:45', '4:50 5/11', '4:52'],
    correctAnswer: '4:54 6/11',
    explanation: 'At 4 o\'clock, minute hand is 20 minutes behind. To be opposite, it needs to gain 20 + 30 = 50 minute spaces. Time = 50 * (12/11) = 600/11 = 54 6/11 minutes past 4.',
    timeExpected: 90
  },
  {
    module: 'aptitude',
    subCategory: 'Puzzles & Logic',
    difficulty: 'Medium',
    question: 'There are 10 black socks and 10 white socks in a drawer. How many socks must you pull out in the dark to be 100% sure of having at least one matching pair?',
    options: ['3', '2', '11', '10'],
    correctAnswer: '3',
    explanation: 'Pigeonhole principle: There are 2 colors (black, white). Pulling 2 could be 1 black and 1 white. Pulling 3 guarantees that at least two have the same color.',
    timeExpected: 45
  },
  {
    module: 'aptitude',
    subCategory: 'Statement & Assumptions',
    difficulty: 'Medium',
    question: 'Statement: "Please do not use your mobile phone while driving." Assumption I: People generally carry phones while driving. Assumption II: Using phones while driving causes distraction and accidents.',
    options: ['Both assumptions I and II are implicit', 'Only I is implicit', 'Only II is implicit', 'Neither is implicit'],
    correctAnswer: 'Both assumptions I and II are implicit',
    explanation: 'A warning assumes the condition exists (people carry/use phones) and the reason behind warning is that distraction causes hazards.',
    timeExpected: 60
  },
  {
    module: 'aptitude',
    subCategory: 'Cubes & Dices',
    difficulty: 'Medium',
    question: 'Two positions of a dice are shown. When 4 is at the bottom, which number is at the top if adjacent faces are 1, 2, 3, 5?',
    options: ['6', '5', '3', '2'],
    correctAnswer: '6',
    explanation: 'A standard die has 6 faces: 1, 2, 3, 4, 5, 6. If 1, 2, 3, 5 are adjacent to 4, then the opposite face must be 6.',
    timeExpected: 45
  },
  {
    module: 'aptitude',
    subCategory: 'Data Sufficiency',
    difficulty: 'Hard',
    question: 'Is x positive? Statement 1: x^2 > 0. Statement 2: x^3 > 0.',
    options: ['Statement 2 alone is sufficient', 'Statement 1 alone is sufficient', 'Both together are sufficient', 'Neither is sufficient'],
    correctAnswer: 'Statement 2 alone is sufficient',
    explanation: 'Statement 1: x^2 > 0 means x ≠ 0, but x could be positive or negative. Statement 2: x^3 > 0 is true only if x > 0. Hence statement 2 alone is sufficient.',
    timeExpected: 60
  },
  {
    module: 'aptitude',
    subCategory: 'Venn Diagrams',
    difficulty: 'Easy',
    question: 'Which diagram best represents: Mammals, Cows, Crows?',
    options: ['Cows inside Mammals, Crows completely separate', 'All three overlapping', 'Three separate circles', 'Mammals inside Cows'],
    correctAnswer: 'Cows inside Mammals, Crows completely separate',
    explanation: 'All cows are mammals (circle of cows inside circle of mammals). Crows are birds, not mammals, so their circle is separate.',
    timeExpected: 45
  },
  {
    module: 'aptitude',
    subCategory: 'Odd One Out',
    difficulty: 'Easy',
    question: 'Choose the odd one out: 64, 125, 216, 343, 512, 729, 1000, 1331, 144',
    options: ['144', '125', '729', '64'],
    correctAnswer: '144',
    explanation: 'All other numbers are perfect cubes: 4^3=64, 5^3=125, 6^3=216, 7^3=343, 8^3=512, 9^3=729, 10^3=1000, 11^3=1331. 144 is 12^2, not a perfect cube.',
    timeExpected: 45
  },
  {
    module: 'aptitude',
    subCategory: 'Ranking & Order',
    difficulty: 'Easy',
    question: 'In a class of 45 students, Amir ranks 16th from the top. What is his rank from the bottom?',
    options: ['30th', '29th', '31st', '28th'],
    correctAnswer: '30th',
    explanation: 'Total = Top + Bottom - 1 => 45 = 16 + Bottom - 1 => Bottom = 45 - 15 = 30th.',
    timeExpected: 45
  },

  // ===================== JAVASCRIPT =====================
  {
    module: 'javascript',
    subCategory: 'Closures & Scope',
    difficulty: 'Medium',
    question: 'What does the following code print?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
    options: ['3, 3, 3', '0, 1, 2', 'undefined, undefined, undefined', '0, 0, 0'],
    correctAnswer: '3, 3, 3',
    explanation: 'var is function-scoped. By the time the event loop executes the microtask/macrotask timers, the loop has finished and i equals 3.',
    timeExpected: 60
  },
  {
    module: 'javascript',
    subCategory: 'Promises & Async',
    difficulty: 'Hard',
    question: 'What is the output order of:\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
    options: ['1, 4, 3, 2', '1, 2, 3, 4', '1, 4, 2, 3', '1, 3, 4, 2'],
    correctAnswer: '1, 4, 3, 2',
    explanation: 'Synchronous code runs first (1, 4). Microtask queue (Promise.then -> 3) executes before the macrotask queue (setTimeout -> 2).',
    timeExpected: 60
  },
  {
    module: 'javascript',
    subCategory: 'Event Loop',
    difficulty: 'Medium',
    question: 'Which of the following is handled by the JavaScript Microtask Queue?',
    options: ['Promise .then() callbacks and MutationObserver', 'setTimeout and setInterval', 'DOM click event listeners', 'setImmediate in Node.js'],
    correctAnswer: 'Promise .then() callbacks and MutationObserver',
    explanation: 'Promises and MutationObserver jobs go to the Microtask Queue, which drains immediately after the current synchronous script and before macrotasks like setTimeout.',
    timeExpected: 60
  },
  {
    module: 'javascript',
    subCategory: 'Types & Coercion',
    difficulty: 'Medium',
    question: 'What is the evaluated result of: [] + {} vs {} + [] in standard JavaScript?',
    options: ['"[object Object]" and "[object Object]" (in expression context)', '0 and "[object Object]"', 'NaN and undefined', 'Error in both'],
    correctAnswer: '"[object Object]" and "[object Object]" (in expression context)',
    explanation: 'In expression context: [] coerces to "", {} coerces to "[object Object]". Thus "" + "[object Object]" = "[object Object]".',
    timeExpected: 60
  },
  {
    module: 'javascript',
    subCategory: 'Prototypes & OOP',
    difficulty: 'Medium',
    question: 'How do you check if an object has a property directly on itself rather than inherited via prototype chain?',
    options: ['Object.prototype.hasOwnProperty.call(obj, prop) or Object.hasOwn(obj, prop)', 'obj.contains(prop)', 'prop in obj', 'obj.prototype.includes(prop)'],
    correctAnswer: 'Object.prototype.hasOwnProperty.call(obj, prop) or Object.hasOwn(obj, prop)',
    explanation: 'Object.hasOwn(obj, prop) (ES2022) or hasOwnProperty checks only the direct properties without traversing the prototype chain.',
    timeExpected: 60
  },
  {
    module: 'javascript',
    subCategory: 'ES6+ Features',
    difficulty: 'Easy',
    question: 'Which statement correctly describes WeakMap in modern JavaScript?',
    options: ['Keys must be objects, and they do not prevent garbage collection', 'Keys can be primitives only', 'Keys are strictly sorted by insertion order', 'WeakMap has a .size property and is iterable with for...of'],
    correctAnswer: 'Keys must be objects, and they do not prevent garbage collection',
    explanation: 'WeakMap keys must be non-null objects and are held weakly, enabling automatic garbage collection if no other references exist. It cannot be iterated.',
    timeExpected: 60
  },
  {
    module: 'javascript',
    subCategory: 'Functions & "this"',
    difficulty: 'Medium',
    question: 'What happens when you invoke an arrow function with .bind({ name: "Alex" })?',
    options: ['The "this" binding is ignored; arrow functions retain their lexical scope', 'The "this" becomes the bound object', 'It throws a TypeError at runtime', 'It converts the arrow function to a regular function'],
    correctAnswer: 'The "this" binding is ignored; arrow functions retain their lexical scope',
    explanation: 'Arrow functions have lexical "this" that cannot be overridden by call(), apply(), or bind().',
    timeExpected: 60
  },
  {
    module: 'javascript',
    subCategory: 'Modules',
    difficulty: 'Easy',
    question: 'What is the main difference between CommonJS and ES Modules (ESM)?',
    options: ['ESM imports are statically parsed and asynchronously loaded; CJS require() is synchronous and dynamic', 'CJS is for browser, ESM is for Node only', 'ESM cannot export functions', 'CJS supports tree-shaking natively'],
    correctAnswer: 'ESM imports are statically parsed and asynchronously loaded; CJS require() is synchronous and dynamic',
    explanation: 'ESM imports are static and hoisted, enabling static analysis and tree-shaking, while CommonJS require() is executed synchronously at runtime.',
    timeExpected: 60
  },

  // ===================== VERBAL ABILITY =====================
  {
    module: 'verbal',
    subCategory: 'Vocabulary & Synonyms',
    difficulty: 'Medium',
    question: 'Choose the word that is nearest in meaning to "CANDID":',
    options: ['Frank & Outspoken', 'Deceitful', 'Hesitant', 'Secretive'],
    correctAnswer: 'Frank & Outspoken',
    explanation: 'Candid means truthful and straightforward; frank. The antonyms are evasive, secretive, or deceitful.',
    timeExpected: 45
  },
  {
    module: 'verbal',
    subCategory: 'Antonyms',
    difficulty: 'Medium',
    question: 'Choose the antonym of the word "TACITURN":',
    options: ['Loquacious', 'Quiet', 'Reserved', 'Introverted'],
    correctAnswer: 'Loquacious',
    explanation: 'Taciturn means habitually silent or quiet. Loquacious means extremely talkative, making it the direct opposite.',
    timeExpected: 45
  },
  {
    module: 'verbal',
    subCategory: 'Sentence Correction',
    difficulty: 'Medium',
    question: 'Identify the error in: "Neither the manager nor the employees was available for comment."',
    options: ['"was" should be "were"', '"Neither" should be "Either"', '"nor" should be "or"', 'No error'],
    correctAnswer: '"was" should be "were"',
    explanation: 'With "neither... nor", the verb agrees with the subject closest to it. "Employees" is plural, so the verb must be "were".',
    timeExpected: 45
  },
  {
    module: 'verbal',
    subCategory: 'Idioms & Phrases',
    difficulty: 'Easy',
    question: 'What is the meaning of the idiom "Burn the midnight oil"?',
    options: ['Work or study late into the night', 'Waste electricity', 'Start a protest', 'Cook late meals'],
    correctAnswer: 'Work or study late into the night',
    explanation: '"Burning the midnight oil" historically refers to using an oil lamp to work or study late into the night.',
    timeExpected: 30
  },
  {
    module: 'verbal',
    subCategory: 'Reading Comprehension',
    difficulty: 'Hard',
    question: 'Which tone is conveyed by an author who uses terms like "indubitable", "fallacious reasoning", and "untenable assertions"?',
    options: ['Critical and argumentative', 'Sentimental and nostalgic', 'Humorous and lighthearted', 'Apathetic and indifferent'],
    correctAnswer: 'Critical and argumentative',
    explanation: 'Phrases like "fallacious reasoning" and "untenable assertions" are hallmarks of a rigorous, analytical, and critical polemic.',
    timeExpected: 60
  },
  {
    module: 'verbal',
    subCategory: 'Grammar & Syntax',
    difficulty: 'Medium',
    question: 'Which of the following sentences correctly uses the subjunctive mood?',
    options: ['I recommend that he submit the report immediately.', 'I recommend that he submits the report immediately.', 'I recommend that he submitted the report immediately.', 'I recommend him to submits the report immediately.'],
    correctAnswer: 'I recommend that he submit the report immediately.',
    explanation: 'In the present subjunctive following verbs of demand or recommendation, the bare base form of the verb ("submit", not "submits") is used.',
    timeExpected: 60
  },

  // ===================== OPERATING SYSTEMS =====================
  {
    module: 'os',
    subCategory: 'Deadlocks',
    difficulty: 'Medium',
    question: 'Which of the following is NOT one of Coffman\'s four conditions necessary for a deadlock?',
    options: ['Preemptive allocation', 'Mutual Exclusion', 'Hold and Wait', 'Circular Wait'],
    correctAnswer: 'Preemptive allocation',
    explanation: 'The four Coffman conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait. Preemption breaks deadlock, it does not cause it.',
    timeExpected: 60
  },
  {
    module: 'os',
    subCategory: 'Memory Management',
    difficulty: 'Medium',
    question: 'What is Belady\'s Anomaly in Operating Systems?',
    options: ['In FIFO page replacement, adding more frames can increase page faults', 'CPU utilization drops to zero when thrashing occurs', 'LRU is slower than optimal page replacement', 'Virtual memory allocation fails when disk is full'],
    correctAnswer: 'In FIFO page replacement, adding more frames can increase page faults',
    explanation: 'Belady\'s anomaly is the counter-intuitive phenomenon where increasing the number of page frames results in an increase in the number of page faults for certain access patterns in FIFO.',
    timeExpected: 60
  },
  {
    module: 'os',
    subCategory: 'Processes & Threads',
    difficulty: 'Easy',
    question: 'What is a Zombie Process in Unix/Linux?',
    options: ['A process that has completed execution but still has an entry in the process table', 'A process running in an infinite loop', 'A process with high CPU usage', 'A process that kills other processes'],
    correctAnswer: 'A process that has completed execution but still has an entry in the process table',
    explanation: 'A zombie process is a terminated process whose exit status has not yet been read by its parent process via the wait() system call.',
    timeExpected: 45
  },
  {
    module: 'os',
    subCategory: 'CPU Scheduling',
    difficulty: 'Medium',
    question: 'Which CPU scheduling algorithm is non-preemptive and suffers from the convoy effect?',
    options: ['FCFS (First-Come, First-Served)', 'Round Robin', 'Shortest Remaining Time First', 'Priority Preemptive'],
    correctAnswer: 'FCFS (First-Come, First-Served)',
    explanation: 'In FCFS, when a long CPU-bound process holds the CPU, all short I/O-bound processes queue behind it, creating the convoy effect.',
    timeExpected: 60
  },
  {
    module: 'os',
    subCategory: 'File Systems',
    difficulty: 'Medium',
    question: 'In Unix file systems, what information is stored in an Inode?',
    options: ['File metadata, permissions, owner, and block pointers (excluding filename)', 'Only the file content', 'The file path and file name only', 'The directory icon and desktop shortcut'],
    correctAnswer: 'File metadata, permissions, owner, and block pointers (excluding filename)',
    explanation: 'An inode contains file attributes (size, permissions, timestamps, owner) and disk block pointers. The filename is stored in the directory entry, not the inode.',
    timeExpected: 60
  },

  // ===================== DBMS =====================
  {
    module: 'dbms',
    subCategory: 'Transactions & ACID',
    difficulty: 'Hard',
    question: 'Which transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but may allow Phantom Reads in SQL standard?',
    options: ['Repeatable Read', 'Read Committed', 'Read Uncommitted', 'Serializable'],
    correctAnswer: 'Repeatable Read',
    explanation: 'Read Uncommitted allows dirty reads. Read Committed prevents dirty reads. Repeatable Read prevents dirty reads and non-repeatable reads. Only Serializable prevents phantom reads.',
    timeExpected: 60
  },
  {
    module: 'dbms',
    subCategory: 'Normalization',
    difficulty: 'Medium',
    question: 'A relation is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y:',
    options: ['X is a superkey', 'Y is a prime attribute', 'X is a foreign key', 'Y depends on a candidate key'],
    correctAnswer: 'X is a superkey',
    explanation: 'BCNF requires that the determinant X in every non-trivial functional dependency X -> Y must be a superkey of the relation.',
    timeExpected: 60
  },
  {
    module: 'dbms',
    subCategory: 'Indexing',
    difficulty: 'Medium',
    question: 'Why are B+ Trees preferred over Binary Search Trees for database indexing on disk?',
    options: ['High fan-out minimizes disk I/O operations and leaf nodes are linked for sequential range scans', 'B+ trees require less memory than BSTs', 'B+ trees don\'t need balancing', 'BSTs cannot store strings'],
    correctAnswer: 'High fan-out minimizes disk I/O operations and leaf nodes are linked for sequential range scans',
    explanation: 'B+ Trees have high fan-out (thousands of keys per node), keeping tree depth low (3-4 levels) which minimizes slow disk page reads, and leaf nodes form a linked list for fast range queries.',
    timeExpected: 60
  },
  {
    module: 'dbms',
    subCategory: 'Concurrency Control',
    difficulty: 'Hard',
    question: 'What is the difference between Strict 2PL and Rigorous 2PL in database concurrency control?',
    options: ['Strict 2PL holds exclusive locks until commit; Rigorous 2PL holds both shared and exclusive locks until commit', 'Strict 2PL does not use locks', 'Rigorous 2PL allows cascading rollbacks', 'They are identical'],
    correctAnswer: 'Strict 2PL holds exclusive locks until commit; Rigorous 2PL holds both shared and exclusive locks until commit',
    explanation: 'Strict 2PL releases shared locks before transaction end, but holds exclusive locks until commit/abort. Rigorous 2PL holds all locks (shared and exclusive) until commit/abort.',
    timeExpected: 60
  },

  // ===================== FRONTEND / REACT =====================
  {
    module: 'frontend',
    subCategory: 'React Hooks',
    difficulty: 'Medium',
    question: 'Why should you NOT call React Hooks inside loops, conditions, or nested functions?',
    options: ['React relies on the call order of hooks across renders to preserve state', 'It triggers infinite re-renders automatically', 'JavaScript syntax does not support it', 'It causes CSS layout thrashing'],
    correctAnswer: 'React relies on the call order of hooks across renders to preserve state',
    explanation: 'React maintains hook state in an internal array/linked list indexed by execution order. Skipping or changing order disrupts state pairing.',
    timeExpected: 60
  },
  {
    module: 'frontend',
    subCategory: 'Browser Performance',
    difficulty: 'Medium',
    question: 'What is the Critical Rendering Path order in modern web browsers?',
    options: ['DOM -> CSSOM -> Render Tree -> Layout (Reflow) -> Paint -> Composite', 'HTML -> Paint -> Layout -> CSS -> Composite', 'DOM -> Paint -> CSSOM -> Layout', 'Render Tree -> DOM -> Layout -> Paint'],
    correctAnswer: 'DOM -> CSSOM -> Render Tree -> Layout (Reflow) -> Paint -> Composite',
    explanation: 'The browser parses HTML to DOM, CSS to CSSOM, combines them into Render Tree, computes geometry in Layout, draws pixels in Paint, and composites layers on the GPU.',
    timeExpected: 60
  },
  {
    module: 'frontend',
    subCategory: 'State Management',
    difficulty: 'Easy',
    question: 'What is "prop drilling" in component-based UI architectures?',
    options: ['Passing props down multiple levels of components that do not need the data themselves', 'Updating props directly from child components', 'Validating props with TypeScript', 'Deleting props at runtime'],
    correctAnswer: 'Passing props down multiple levels of components that do not need the data themselves',
    explanation: 'Prop drilling occurs when data is threaded through intermediate components solely to reach a deeply nested child.',
    timeExpected: 45
  },
  {
    module: 'frontend',
    subCategory: 'Security',
    difficulty: 'Medium',
    question: 'How do modern web applications protect against Cross-Site Request Forgery (CSRF)?',
    options: ['Using Anti-CSRF tokens, SameSite=Strict cookies, and verifying custom headers', 'Storing passwords in localStorage', 'Disabling JavaScript on forms', 'Encrypting CSS files'],
    correctAnswer: 'Using Anti-CSRF tokens, SameSite=Strict cookies, and verifying custom headers',
    explanation: 'CSRF defenses rely on unpredictable anti-CSRF tokens, SameSite cookie attributes preventing cross-site transmission, and CORS header validation.',
    timeExpected: 60
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB. Seeding verified unique questions...');

  let insertedCount = 0;
  for (const item of NEW_QUESTIONS) {
    const existing = await AssessmentQuestion.findOne({
      module: item.module.toLowerCase(),
      question: item.question.trim()
    });

    if (!existing) {
      await AssessmentQuestion.create({
        module: item.module.toLowerCase(),
        subCategory: item.subCategory,
        difficulty: item.difficulty,
        question: item.question.trim(),
        options: item.options,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        timeExpected: item.timeExpected || 60
      });
      insertedCount++;
    }
  }

  console.log(`Successfully seeded ${insertedCount} new verified unique questions!`);
  const finalCount = await AssessmentQuestion.countDocuments();
  console.log(`Total questions in DB now: ${finalCount}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
