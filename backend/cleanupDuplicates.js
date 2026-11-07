const mongoose = require('mongoose');
require('dotenv').config();
const AssessmentQuestion = require('./models/AssessmentQuestion');

async function cleanupDuplicates() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB. Starting duplicate cleanup...');

  // Group by module and trimmed lowercase question text
  const allQuestions = await AssessmentQuestion.find({});
  console.log(`Total questions before cleanup: ${allQuestions.length}`);

  const seen = new Map(); // key -> first ObjectId
  const toDelete = [];

  for (const q of allQuestions) {
    if (!q.question || !q.module) {
      toDelete.push(q._id);
      continue;
    }
    const key = `${q.module.toLowerCase()}:::${q.question.trim().toLowerCase()}`;
    if (seen.has(key)) {
      toDelete.push(q._id);
    } else {
      seen.set(key, q._id);
    }
  }

  console.log(`Found ${toDelete.length} duplicate / invalid questions to remove.`);

  if (toDelete.length > 0) {
    // Delete in batches of 500
    for (let i = 0; i < toDelete.length; i += 500) {
      const batch = toDelete.slice(i, i + 500);
      await AssessmentQuestion.deleteMany({ _id: { $in: batch } });
    }
    console.log(`Successfully removed ${toDelete.length} duplicate questions.`);
  }

  const remaining = await AssessmentQuestion.countDocuments();
  console.log(`Total unique questions remaining in DB: ${remaining}`);

  // Create compound index on module and question to prevent future duplicates
  try {
    await AssessmentQuestion.collection.createIndex(
      { module: 1, question: 1 },
      { unique: false, background: true }
    );
    console.log('Index created on { module: 1, question: 1 }');
  } catch (idxErr) {
    console.warn('Index notice:', idxErr.message);
  }

  process.exit(0);
}

cleanupDuplicates().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
