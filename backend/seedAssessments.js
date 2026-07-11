const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AssessmentQuestion = require('./models/AssessmentQuestion');

dotenv.config();

const aptitudeQuestions = [
  { question: "Find the next number in the series: 2, 6, 12, 20, 30, ...", options: ["40", "42", "36", "44"], correctAnswer: "42", difficulty: "Easy" },
  { question: "If 'A' is coded as 'C', 'B' as 'D', how will 'Z' be coded?", options: ["A", "B", "C", "D"], correctAnswer: "B", difficulty: "Medium" },
  { question: "If the day before yesterday was Thursday, when will Sunday be?", options: ["Today", "Tomorrow", "Day after tomorrow", "None"], correctAnswer: "Tomorrow", difficulty: "Easy" },
  { question: "A is B's brother. C is A's mother. D is C's father. How is B related to D?", options: ["Grandson", "Granddaughter", "Grandson or Granddaughter", "Son"], correctAnswer: "Grandson or Granddaughter", difficulty: "Hard" },
  { question: "Looking at a portrait, a man said, 'That man's father is my father's son. I have no brothers and sisters.' Whose portrait was it?", options: ["His own", "His son's", "His father's", "His uncle's"], correctAnswer: "His son's", difficulty: "Medium" },
  { question: "A clock shows 3:15. What is the angle between the hour and minute hands?", options: ["0 degrees", "7.5 degrees", "15 degrees", "22.5 degrees"], correctAnswer: "7.5 degrees", difficulty: "Medium" },
  { question: "If 1st January 2001 was Monday, what day of the week was 1st January 2002?", options: ["Monday", "Tuesday", "Wednesday", "Sunday"], correctAnswer: "Tuesday", difficulty: "Easy" },
  { question: "Six persons are sitting in a circle facing the center. A is facing B, B is to the right of E and left of C. C is to the left of D. F is to the right of A. Now D exchanges his seat with F and E with B. Who will be sitting to the left of D?", options: ["A", "B", "E", "C"], correctAnswer: "A", difficulty: "Hard" },
  { question: "What is the probability of getting a sum 9 from two throws of a dice?", options: ["1/9", "1/6", "1/12", "1/8"], correctAnswer: "1/9", difficulty: "Medium" },
  { question: "If 5 machines can make 5 widgets in 5 minutes, how long would it take 100 machines to make 100 widgets?", options: ["5 minutes", "100 minutes", "50 minutes", "1 minute"], correctAnswer: "5 minutes", difficulty: "Easy" }
].map(q => ({ ...q, module: 'aptitude' }));

const quantQuestions = [
  { question: "The sum of two numbers is 25 and their difference is 13. Find their product.", options: ["104", "114", "124", "134"], correctAnswer: "114", difficulty: "Medium" },
  { question: "What is 15% of 60?", options: ["9", "10", "12", "15"], correctAnswer: "9", difficulty: "Easy" },
  { question: "A shopkeeper sells an item for $120, making a profit of 20%. What was the cost price?", options: ["$90", "$100", "$96", "$110"], correctAnswer: "$100", difficulty: "Medium" },
  { question: "The average of 5 numbers is 20. If one number is excluded, the average becomes 18. What is the excluded number?", options: ["24", "26", "28", "30"], correctAnswer: "28", difficulty: "Medium" },
  { question: "A train running at 54 km/hr crosses a pole in 10 seconds. Find the length of the train.", options: ["100m", "150m", "200m", "120m"], correctAnswer: "150m", difficulty: "Medium" },
  { question: "The ratio of boys to girls in a class is 3:2. If there are 30 students in total, how many girls are there?", options: ["12", "15", "18", "10"], correctAnswer: "12", difficulty: "Easy" },
  { question: "Find the simple interest on $5000 at 8% per annum for 3 years.", options: ["$1200", "$1500", "$1000", "$800"], correctAnswer: "$1200", difficulty: "Easy" },
  { question: "If a circle has a radius of 7 cm, what is its circumference? (Use pi = 22/7)", options: ["22 cm", "44 cm", "88 cm", "14 cm"], correctAnswer: "44 cm", difficulty: "Easy" },
  { question: "Solve for x: 3x - 5 = 16", options: ["5", "7", "9", "11"], correctAnswer: "7", difficulty: "Easy" },
  { question: "In how many ways can 5 people be seated in a row?", options: ["100", "120", "240", "60"], correctAnswer: "120", difficulty: "Medium" }
].map(q => ({ ...q, module: 'quant' }));

const reasoningQuestions = [
  { question: "Syllogism: Statements: Some cats are dogs. All dogs are birds. Conclusions: I. Some cats are birds. II. All birds are dogs.", options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither follows"], correctAnswer: "Only I follows", difficulty: "Medium" },
  { question: "Statement: A warning in a train compartment - 'To stop train, pull chain. Penalty for improper use Rs. 500.' Assumptions: I. Some people misuse the alarm chain. II. On certain occasions, people may want to stop a running train.", options: ["Only I is implicit", "Only II is implicit", "Both I and II are implicit", "Neither is implicit"], correctAnswer: "Both I and II are implicit", difficulty: "Medium" },
  { question: "If 'WHITE' is called 'BLUE', 'BLUE' is called 'RED', 'RED' is called 'YELLOW', what is the color of human blood?", options: ["RED", "BLUE", "YELLOW", "WHITE"], correctAnswer: "YELLOW", difficulty: "Easy" },
  { question: "Identify the odd one out.", options: ["Apple", "Mango", "Potato", "Banana"], correctAnswer: "Potato", difficulty: "Easy" },
  { question: "A man walks 5 km towards South and then turns to the right. After walking 3 km he turns to the left and walks 5 km. Now in which direction is he from the starting place?", options: ["West", "South", "South-West", "North-East"], correctAnswer: "South-West", difficulty: "Medium" },
  { question: "In a certain code, MONKEY is written as XDJMNL. How is TIGER written in that code?", options: ["QDFHS", "SDFHS", "SHFDQ", "UJHFS"], correctAnswer: "QDFHS", difficulty: "Hard" },
  { question: "Pointing to a photograph, a person tells his friend, 'She is the granddaughter of the elder brother of my father.' How is the girl in the photograph related to this man?", options: ["Niece", "Sister", "Aunt", "Sister-in-law"], correctAnswer: "Niece", difficulty: "Hard" },
  { question: "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?", options: ["7", "10", "12", "13"], correctAnswer: "10", difficulty: "Medium" },
  { question: "If South-East becomes North, North-East becomes West and so on. What will West become?", options: ["North-East", "North-West", "South-East", "South-West"], correctAnswer: "South-East", difficulty: "Hard" },
  { question: "Arrange the words given below in a meaningful sequence. 1. Key 2. Door 3. Lock 4. Room 5. Switch on", options: ["5, 1, 2, 4, 3", "4, 2, 1, 5, 3", "1, 3, 2, 4, 5", "1, 2, 3, 5, 4"], correctAnswer: "1, 3, 2, 4, 5", difficulty: "Medium" }
].map(q => ({ ...q, module: 'reasoning' }));

const verbalQuestions = [
  { question: "Find the synonym of 'LUCID'", options: ["Obscure", "Clear", "Confusing", "Dark"], correctAnswer: "Clear", difficulty: "Easy" },
  { question: "Find the antonym of 'MITIGATE'", options: ["Alleviate", "Worsen", "Soothe", "Calm"], correctAnswer: "Worsen", difficulty: "Medium" },
  { question: "Fill in the blank: He is known _____ his honesty.", options: ["for", "about", "to", "with"], correctAnswer: "for", difficulty: "Easy" },
  { question: "Identify the error in the sentence: 'One of the boys are missing.'", options: ["One of", "the boys", "are", "missing"], correctAnswer: "are", difficulty: "Medium" },
  { question: "Rearrange the jumbled parts: P: to the cinema Q: they R: went S: last night", options: ["RQPS", "QRPS", "PQRS", "SQRP"], correctAnswer: "QRPS", difficulty: "Easy" },
  { question: "Choose the correct spelling.", options: ["Accommodate", "Acommodate", "Accomodate", "Acomodate"], correctAnswer: "Accommodate", difficulty: "Medium" },
  { question: "Which of the following is a noun?", options: ["Quickly", "Beautiful", "Happiness", "Run"], correctAnswer: "Happiness", difficulty: "Easy" },
  { question: "Choose the word which is most nearly the SAME in meaning to the word 'VINDICATE'.", options: ["Condemn", "Exonerate", "Criticize", "Ignore"], correctAnswer: "Exonerate", difficulty: "Hard" },
  { question: "Find the phrase which best expresses the meaning of the idiom 'To bite the dust'.", options: ["To eat voraciously", "To suffer a defeat", "To clean the floor", "To get angry"], correctAnswer: "To suffer a defeat", difficulty: "Medium" },
  { question: "Fill in the blank: The meeting was _____ due to the bad weather.", options: ["called of", "called off", "called out", "called for"], correctAnswer: "called off", difficulty: "Medium" }
].map(q => ({ ...q, module: 'verbal' }));

const allQuestions = [...aptitudeQuestions, ...quantQuestions, ...reasoningQuestions, ...verbalQuestions];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected.');
    try {
      await AssessmentQuestion.deleteMany({});
      console.log('Cleared existing questions.');
      await AssessmentQuestion.insertMany(allQuestions);
      console.log(`Inserted ${allQuestions.length} sample assessment questions.`);
      process.exit();
    } catch (error) {
      console.error('Seeding error:', error);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('DB Connection error:', err);
    process.exit(1);
  });
