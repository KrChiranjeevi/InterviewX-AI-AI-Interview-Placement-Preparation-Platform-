const { OpenAI } = require("openai");
const CodingProblem = require('../models/CodingProblem');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Generate a new LeetCode-style coding problem.
 * @param {string} category - e.g., 'dsa', 'sql', 'javascript'
 * @param {string} topic - e.g., 'Arrays', 'DP', 'DOM'
 * @param {string} difficulty - 'Easy', 'Medium', 'Hard'
 */
const generateCodingProblem = async (category, topic, difficulty) => {
  try {
    const prompt = `You are an expert technical interviewer for top-tier tech companies.
Create a highly-challenging, realistic coding problem for the category "${category}" focusing on the topic "${topic}".
Difficulty level: ${difficulty}.

Requirements:
1. title: A catchy title (e.g. "Merge Two Sorted Lists").
2. slug: A URL friendly version of the title.
3. category: Strictly "${category.toLowerCase()}".
4. difficulty: Strictly "${difficulty}".
5. topics: An array of strings representing tags (e.g. ["Arrays", "Two Pointers"]).
6. companies: An array of 3-5 companies that typically ask this (e.g. ["Google", "Amazon", "Meta"]).
7. description: A clear, detailed HTML-formatted explanation of the problem. Use strong tags and code tags where appropriate.
8. constraints: An array of strings (e.g. ["1 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"]).
9. examples: An array of exactly 2-3 objects containing "input", "output", and "explanation" strings.
10. testCases: An array of exactly 5-8 objects with "input", "expectedOutput", and "isHidden" (boolean, make some true, some false). For inputs/outputs use standard string representations that can be passed to functions via stdin or parsed.
11. hints: An array of 2-3 strings.
12. starterCode: An object with keys "python", "javascript", "cpp", "java", "c", "csharp", "sql". The values should be the function boilerplates (or basic queries for SQL).

OUTPUT EXACTLY AS A VALID JSON OBJECT ONLY. DO NOT WRAP IN MARKDOWN. BE CAREFUL ESCAPING QUOTES.`;

    let textResponse = "";
    try {
      // 1. Try Groq directly since it's the fastest
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: "json_object" },
      });
      textResponse = response.choices[0].message.content;
    } catch (err) {
      console.log(`[AI Coding Generator] Groq failed, trying OpenAI:`, err.message);
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: "json_object" },
      });
      textResponse = response.choices[0].message.content;
    }

    // Clean up JSON string
    let jsonStr = textResponse.trim();
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) {
      jsonStr = match[0];
    }

    let problemData = null;
    try {
      problemData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error(`[AI Coding Generator] Failed to parse JSON:`, parseError.message);
      const sanitized = jsonStr.replace(/[\n\r\t]/g, ' ');
      problemData = JSON.parse(sanitized);
    }

    if (!problemData) throw new Error("Generated data is null");
    
    // Ensure slug is unique
    let slug = problemData.slug;
    let existing = await CodingProblem.findOne({ slug });
    if (existing) {
      slug = slug + '-' + Date.now();
      problemData.slug = slug;
    }

    const inserted = await CodingProblem.create(problemData);
    console.log(`[AI Coding Generator] Successfully generated and saved problem: ${inserted.title}`);
    return inserted;
  } catch (error) {
    console.error('[AI Coding Generator] Error generating problem:', error);
    return null;
  }
};

module.exports = {
  generateCodingProblem,
};
