const AssessmentQuestion = require('../models/AssessmentQuestion');
const { ai } = require('./aiService');

/**
 * Generates high-quality placement assessment questions using AI
 * and saves them directly to the database.
 * 
 * @param {string} moduleName - The category/module name (e.g., 'react', 'dsa', 'quant')
 * @param {number} count - Number of questions to generate (default 20)
 * @returns {Array} Array of inserted question documents
 */
const generateAndSaveQuestions = async (moduleName, count = 20) => {
  try {
    let allInserted = [];
    const batchSize = 10;
    const batches = Math.ceil(count / batchSize);

    for (let b = 0; b < batches; b++) {
      const currentCount = (b === batches - 1) ? (count - (b * batchSize)) : batchSize;
      const prompt = `You are an expert technical interviewer and placement exam creator for top-tier tech companies.
Your task is to generate exactly ${currentCount} highly-challenging, realistic multiple-choice questions for the "${moduleName}" module.

Requirements for each question:
1. questionText: The actual question (can include code snippets or scenarios).
2. options: An array of EXACTLY 4 strings representing the possible answers.
3. correctOption: The exact string from the options array that is correct.
4. difficulty: Strictly "Easy", "Medium", or "Hard". Ensure a mix (e.g., 30% Easy, 40% Medium, 30% Hard).
5. subCategory: The specific topic within ${moduleName} (e.g., for React: "Hooks", "Context API", "Virtual DOM"; for quant: "Time & Work", "Probability").
6. explanation: A detailed, step-by-step HTML-formatted explanation of WHY the answer is correct and others are wrong. (Be very careful to escape double quotes correctly).
7. timeExpected: Integer (seconds) a candidate should take (e.g., 60, 90, 120).

OUTPUT EXACTLY AS A VALID JSON OBJECT WITH A SINGLE KEY "questions" CONTAINING THE ARRAY OF QUESTION OBJECTS. DO NOT WRAP IN MARKDOWN.`;

      let textResponse = "";
      try {
        const response = await ai.models.generateContent({ contents: prompt });
        textResponse = response.text || "";
      } catch (err) {
        console.error(`[AI Generator] Failed to generate questions via unified fallback chain:`, err.message);
        continue;
      }

      // Clean up JSON string
      let jsonStr = textResponse.trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        jsonStr = match[0];
      }

      let questionsData = [];
      try {
        const parsed = JSON.parse(jsonStr);
        questionsData = parsed.questions || [];
      } catch (parseError) {
        console.error(`[AI Generator] Failed to parse JSON batch ${b+1}:`, parseError.message);
        // Fallback cleanup: replace unescaped newlines inside strings
        try {
          const sanitized = jsonStr.replace(/[\n\r\t]/g, ' ');
          const parsed = JSON.parse(sanitized);
          questionsData = parsed.questions || [];
        } catch (e2) {
          console.error(`[AI Generator] Critical parse failure for batch ${b+1}. Skipping.`);
          continue; 
        }
      }

      if (!Array.isArray(questionsData) || questionsData.length === 0) continue;

      const formattedQuestions = questionsData.map(q => ({
        module: moduleName.toLowerCase(),
        subCategory: q.subCategory || moduleName,
        difficulty: q.difficulty || 'Medium',
        question: q.questionText,
        options: q.options || [],
        correctAnswer: q.correctOption || (q.options ? q.options[0] : ''),
        explanation: q.explanation || 'No explanation provided.',
        timeExpected: q.timeExpected || 60,
      }));

      const inserted = await AssessmentQuestion.insertMany(formattedQuestions);
      allInserted = allInserted.concat(inserted);
    }
    
    console.log(`[AI Generator] Successfully generated and saved ${allInserted.length} questions for ${moduleName}.`);
    return allInserted;

  } catch (error) {
    console.error(`[AI Generator] Error generating questions:`, error);
    return [];
  }
};

module.exports = {
  generateAndSaveQuestions
};
