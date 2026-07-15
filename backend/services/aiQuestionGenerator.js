const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const AssessmentQuestion = require('../models/AssessmentQuestion');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generates high-quality placement assessment questions using Gemini
 * and saves them directly to the database.
 * 
 * @param {string} moduleName - The category/module name (e.g., 'react', 'dsa', 'quant')
 * @param {number} count - Number of questions to generate (default 20)
 * @returns {Array} Array of inserted question documents
 */
const generateAndSaveQuestions = async (moduleName, count = 20) => {
  try {
    console.log(`[AI Generator] Generating ${count} new questions for module: ${moduleName}...`);

    const schema = {
      type: SchemaType.ARRAY,
      description: "List of multiple choice questions.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          subCategory: {
            type: SchemaType.STRING,
            description: "Specific topic within the module (e.g., 'Hooks', 'Arrays', 'Time & Work')"
          },
          question: {
            type: SchemaType.STRING,
            description: "The main question text"
          },
          options: {
            type: SchemaType.ARRAY,
            description: "Exactly 4 options for the multiple choice question",
            items: { type: SchemaType.STRING }
          },
          correctAnswer: {
            type: SchemaType.STRING,
            description: "The correct option (must exactly match one of the options)"
          },
          difficulty: {
            type: SchemaType.STRING,
            description: "Difficulty level: 'Easy', 'Medium', or 'Hard'"
          },
          companyTags: {
            type: SchemaType.ARRAY,
            description: "Array of companies that ask this type of question (e.g. ['Google', 'Amazon'])",
            items: { type: SchemaType.STRING }
          },
          explanation: {
            type: SchemaType.STRING,
            description: "Detailed explanation of why the correct answer is right and why others are wrong."
          },
          stepByStep: {
            type: SchemaType.ARRAY,
            description: "Array of strings showing the step-by-step mathematical or logical solution if applicable.",
            items: { type: SchemaType.STRING }
          },
          references: {
            type: SchemaType.ARRAY,
            description: "Array of reference URLs or topic names for further learning.",
            items: { type: SchemaType.STRING }
          }
        },
        required: ["subCategory", "question", "options", "correctAnswer", "difficulty", "companyTags", "explanation", "stepByStep", "references"]
      }
    };

    const prompt = `You are a strict technical interviewer and question curator for top tech companies (Google, Amazon, Meta, TCS, Infosys, etc).
Your task is to generate exactly ${count} completely unique, extremely high-quality multiple choice questions for the module: "${moduleName}".

Requirements:
1. Module Isolation: DO NOT generate questions outside of the "${moduleName}" module.
2. Difficulty Mix: Provide a mix of Easy, Medium, and Hard questions (mostly Medium and Hard for top tech companies).
3. Options: Provide exactly 4 options. Only one option can be correct.
4. Correct Answer: Ensure the correctAnswer exactly matches one of the options.
5. Quality: Avoid generic questions. Use code snippets (where appropriate), realistic scenarios, and tricky edge cases typical in real placements.
6. Subcategory: Assign a highly specific subcategory (e.g. for React: 'Custom Hooks', for SQL: 'Joins', for DSA: 'Dynamic Programming').
7. Step-by-step: Provide a logical breakdown of how to arrive at the answer.
8. NEVER repeat questions. Make them extremely varied.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const responseText = result.response.text();
    let questionsData = [];
    try {
      questionsData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("[AI Generator] Failed to parse Gemini response as JSON:", parseErr);
      return [];
    }

    // Prepare for DB insert
    const documents = questionsData.map(q => ({
      ...q,
      module: moduleName
    }));

    if (documents.length > 0) {
      const inserted = await AssessmentQuestion.insertMany(documents);
      console.log(`[AI Generator] Successfully inserted ${inserted.length} questions for ${moduleName}`);
      return inserted;
    }

    return [];

  } catch (error) {
    console.error("[AI Generator] Error generating questions:", error);
    return [];
  }
};

module.exports = {
  generateAndSaveQuestions
};
