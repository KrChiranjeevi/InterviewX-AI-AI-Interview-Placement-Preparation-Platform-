const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AssessmentQuestion = require('./models/AssessmentQuestion');

dotenv.config();

// Helpers
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randElem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

// ─── 1. QUANTITATIVE GENERATORS ─────────────────────────────────────────────

function generateTimeAndWork(count) {
  const q = [];
  const names = ["A", "B", "C", "John", "Alice", "Ravi", "Sita"];
  for (let i = 0; i < count; i++) {
    const n1 = randElem(names);
    let n2 = randElem(names);
    while (n1 === n2) n2 = randElem(names);

    const d1 = randInt(10, 40);
    const d2 = randInt(15, 60);
    // 1/d1 + 1/d2 = (d1+d2)/(d1*d2) => total days = (d1*d2)/(d1+d2)
    const ansNum = d1 * d2;
    const ansDen = d1 + d2;
    const exactAns = (ansNum / ansDen).toFixed(2);
    
    const difficulty = d1 > 20 && d2 > 30 ? "Medium" : "Easy";
    
    const correctAnswer = `${exactAns} days`;
    const options = [
      correctAnswer,
      `${(ansNum / (ansDen - 2)).toFixed(2)} days`,
      `${(ansNum / (ansDen + 5)).toFixed(2)} days`,
      `${(d1 + d2).toFixed(2)} days`
    ];

    q.push({
      module: 'quant',
      subCategory: 'Time & Work',
      question: `${n1} can complete a piece of work in ${d1} days. ${n2} can complete the same work in ${d2} days. If they work together, in how many days will the work be completed?`,
      options: shuffle(options),
      correctAnswer,
      difficulty,
      companyTags: ['TCS', 'Infosys']
    });
  }
  return q;
}

function generateProfitAndLoss(count) {
  const q = [];
  for (let i = 0; i < count; i++) {
    const cp = randInt(10, 100) * 10; // 100 to 1000
    const profitPercent = randInt(5, 30);
    const sp = cp * (1 + profitPercent / 100);
    
    const isLoss = Math.random() > 0.5;
    const lossPercent = randInt(5, 25);
    const spLoss = cp * (1 - lossPercent / 100);

    const difficulty = profitPercent % 5 !== 0 ? "Hard" : "Medium";
    
    if (isLoss) {
      const correctAnswer = `$${spLoss.toFixed(2)}`;
      const options = [correctAnswer, `$${(cp * 1.1).toFixed(2)}`, `$${(cp * 0.9).toFixed(2)}`, `$${(cp - 50).toFixed(2)}`];
      q.push({
        module: 'quant',
        subCategory: 'Profit & Loss',
        question: `A shopkeeper buys an article for $${cp}. If he sells it at a loss of ${lossPercent}%, what is the selling price?`,
        options: shuffle(options),
        correctAnswer,
        difficulty,
        companyTags: ['Wipro', 'Capgemini']
      });
    } else {
      const correctAnswer = `$${sp.toFixed(2)}`;
      const options = [correctAnswer, `$${(cp * 1.25).toFixed(2)}`, `$${(cp * 0.8).toFixed(2)}`, `$${(sp + 20).toFixed(2)}`];
      q.push({
        module: 'quant',
        subCategory: 'Profit & Loss',
        question: `A merchant purchases goods worth $${cp}. He wants to make a profit of ${profitPercent}%. At what price should he sell the goods?`,
        options: shuffle(options),
        correctAnswer,
        difficulty,
        companyTags: ['TCS', 'Cognizant']
      });
    }
  }
  return q;
}

function generateSpeedTimeDistance(count) {
  const q = [];
  for (let i = 0; i < count; i++) {
    const speedKmph = randInt(36, 108); // Multiples of 18 are good for m/s conversions
    const lengthMeters = randInt(100, 500);
    // Time = Distance / Speed(in m/s)
    const speedMps = speedKmph * (5 / 18);
    const timeSeconds = (lengthMeters / speedMps).toFixed(2);
    
    const correctAnswer = `${timeSeconds} sec`;
    const options = [
      correctAnswer,
      `${(parseFloat(timeSeconds) + 2.5).toFixed(2)} sec`,
      `${(parseFloat(timeSeconds) - 1.2).toFixed(2)} sec`,
      `${(parseFloat(timeSeconds) * 1.5).toFixed(2)} sec`
    ];

    q.push({
      module: 'quant',
      subCategory: 'Speed Time Distance',
      question: `A train ${lengthMeters}m long is running at a speed of ${speedKmph} km/hr. How much time will it take to pass a standing man?`,
      options: shuffle(options),
      correctAnswer,
      difficulty: speedKmph % 18 === 0 ? "Easy" : "Medium",
      companyTags: ['Infosys', 'Accenture']
    });
  }
  return q;
}

function generateProbability(count) {
  const q = [];
  for (let i = 0; i < count; i++) {
    const red = randInt(2, 7);
    const blue = randInt(2, 7);
    const green = randInt(2, 7);
    const total = red + blue + green;
    
    const pickRed = Math.random() > 0.5;
    const target = pickRed ? red : blue;
    const color = pickRed ? "red" : "blue";
    
    // Prob of 1 ball
    const correctAnswer = `${target}/${total}`;
    
    const options = [
      correctAnswer,
      `${target + 1}/${total}`,
      `${target}/${total + 1}`,
      `${target - 1}/${total}`
    ];
    
    // Simplification logic could be added, but keeping it raw is fine for options if we ensure uniqueness.
    const uniqueOptions = Array.from(new Set(options));
    while (uniqueOptions.length < 4) {
      uniqueOptions.push(`${randInt(1, total-1)}/${total}`);
    }

    q.push({
      module: 'quant',
      subCategory: 'Probability',
      question: `A bag contains ${red} red balls, ${blue} blue balls, and ${green} green balls. If one ball is drawn at random, what is the probability that it is ${color}?`,
      options: shuffle(uniqueOptions.slice(0, 4)),
      correctAnswer,
      difficulty: "Medium",
      companyTags: ['Amazon', 'Deloitte']
    });
  }
  return q;
}

// ─── 2. REASONING GENERATORS ────────────────────────────────────────────────

function generateNumberSeries(count) {
  const q = [];
  for (let i = 0; i < count; i++) {
    const type = randInt(1, 3);
    let series = [];
    let nextNum;
    
    if (type === 1) { // Squares + offset
      const offset = randInt(-2, 2);
      const start = randInt(2, 5);
      for(let j=0; j<5; j++) series.push((start+j)**2 + offset);
      nextNum = (start+5)**2 + offset;
    } else if (type === 2) { // Multiplication + addition
      const mul = randInt(2, 3);
      const add = randInt(1, 4);
      let cur = randInt(2, 5);
      for(let j=0; j<5; j++) {
        series.push(cur);
        cur = cur * mul + add;
      }
      nextNum = cur;
    } else { // Alternate difference
      const d1 = randInt(2, 5);
      const d2 = randInt(1, 3);
      let cur = randInt(10, 20);
      for(let j=0; j<5; j++) {
        series.push(cur);
        cur += (j % 2 === 0) ? d1 : -d2;
      }
      nextNum = cur;
    }

    const correctAnswer = nextNum.toString();
    const options = [
      correctAnswer,
      (nextNum + randInt(1, 5)).toString(),
      (nextNum - randInt(1, 5)).toString(),
      (nextNum + randInt(6, 10)).toString()
    ];

    q.push({
      module: 'reasoning',
      subCategory: 'Number Series',
      question: `Find the next number in the series: ${series.join(', ')}, ...`,
      options: shuffle(options),
      correctAnswer,
      difficulty: type === 2 ? "Hard" : "Medium",
      companyTags: ['TCS', 'Capgemini']
    });
  }
  return q;
}

function generateCodingDecoding(count) {
  const q = [];
  const words = ["WATER", "EARTH", "TRAIN", "PAPER", "LIGHT", "TIGER", "PLANT"];
  for (let i = 0; i < count; i++) {
    const word1 = randElem(words);
    const word2 = randElem(words.filter(w => w !== word1));
    const shift = randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1);
    
    const encode = (str, s) => {
      return str.split('').map(char => {
        let code = char.charCodeAt(0) + s;
        if (code > 90) code -= 26;
        if (code < 65) code += 26;
        return String.fromCharCode(code);
      }).join('');
    };

    const coded1 = encode(word1, shift);
    const correctAnswer = encode(word2, shift);
    
    const options = [
      correctAnswer,
      encode(word2, shift + 1),
      encode(word2, shift - 1),
      encode(word2, shift + 2)
    ];

    q.push({
      module: 'reasoning',
      subCategory: 'Coding-Decoding',
      question: `In a certain code language, ${word1} is written as ${coded1}. How will ${word2} be written in that language?`,
      options: shuffle(options),
      correctAnswer,
      difficulty: "Medium",
      companyTags: ['Wipro', 'Accenture']
    });
  }
  return q;
}

function generateDirectionSense(count) {
  const q = [];
  const dirs = ["North", "South", "East", "West"];
  for (let i = 0; i < count; i++) {
    const startDir = randElem(dirs);
    const d1 = randInt(5, 20);
    const d2 = randInt(5, 20);
    const turn = Math.random() > 0.5 ? 'right' : 'left';
    
    // Determine final direction
    let finalDir = "";
    if (startDir === "North") finalDir = turn === 'right' ? 'East' : 'West';
    if (startDir === "South") finalDir = turn === 'right' ? 'West' : 'East';
    if (startDir === "East") finalDir = turn === 'right' ? 'South' : 'North';
    if (startDir === "West") finalDir = turn === 'right' ? 'North' : 'South';
    
    const correctAnswer = finalDir;
    const options = shuffle(dirs); // all 4 directions

    q.push({
      module: 'reasoning',
      subCategory: 'Direction Sense',
      question: `A person walks ${d1} km towards ${startDir}, then turns ${turn} and walks ${d2} km. Which direction is he facing now?`,
      options,
      correctAnswer,
      difficulty: "Easy",
      companyTags: ['Cognizant', 'Infosys']
    });
  }
  return q;
}

// ─── RUN SEEDER ─────────────────────────────────────────────────────────────

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    await AssessmentQuestion.deleteMany({});
    console.log('Cleared existing questions.');

    let allQuestions = [];
    
    // Generate 400 questions per category (2000+ total)
    console.log('Generating Quant questions...');
    allQuestions.push(...generateTimeAndWork(400));
    allQuestions.push(...generateProfitAndLoss(400));
    allQuestions.push(...generateSpeedTimeDistance(400));
    allQuestions.push(...generateProbability(300));
    
    console.log('Generating Reasoning questions...');
    allQuestions.push(...generateNumberSeries(400));
    allQuestions.push(...generateCodingDecoding(400));
    allQuestions.push(...generateDirectionSense(400));

    // Also inject some static complex ones for Verbal/Puzzles
    const staticPuzzles = [
      {
        module: 'reasoning',
        subCategory: 'Puzzles',
        question: "Five friends A, B, C, D, and E are sitting in a row facing North. C is sitting exactly in the middle. A and B are sitting at the extreme ends. E is sitting to the immediate right of A. Who is sitting to the immediate left of B?",
        options: ["C", "D", "E", "A"],
        correctAnswer: "D",
        difficulty: "Hard",
        companyTags: ["Google", "Microsoft"]
      },
      {
        module: 'verbal',
        subCategory: 'Reading Comprehension',
        question: "Read the sentence and find the synonym for the capitalized word: The manager's IMPERIOUS manner alienated his employees.",
        options: ["Submissive", "Arrogant", "Friendly", "Hesitant"],
        correctAnswer: "Arrogant",
        difficulty: "Medium",
        companyTags: ["Deloitte", "TCS"]
      }
    ];
    // Replicate static puzzles just to pad categories if needed, but 2700 is enough.
    allQuestions.push(...staticPuzzles);

    console.log(`Generated ${allQuestions.length} questions in total.`);
    
    // Insert in batches to prevent memory limits
    const batchSize = 500;
    for (let i = 0; i < allQuestions.length; i += batchSize) {
      const batch = allQuestions.slice(i, i + batchSize);
      await AssessmentQuestion.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} / ${Math.ceil(allQuestions.length/batchSize)}`);
    }

    console.log('Intelligent Question Bank Seeding Complete!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
