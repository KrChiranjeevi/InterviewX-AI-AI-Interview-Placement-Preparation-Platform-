const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const PrepCompany = require('./models/PrepCompany');
const PrepRole = require('./models/PrepRole');
const PrepRound = require('./models/PrepRound');
const PrepAttempt = require('./models/PrepAttempt');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    // 1. Wipe existing prep data
    console.log('Wiping old Company Prep data...');
    await PrepAttempt.deleteMany();
    await PrepRound.deleteMany();
    await PrepRole.deleteMany();
    await PrepCompany.deleteMany();
    console.log('Old data wiped successfully.');

    // 2. Read all JSON files in seeders/companyData
    const dataPath = path.join(__dirname, 'seeders', 'companyData');
    const files = fs.readdirSync(dataPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(dataPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const companyData = JSON.parse(fileContent);

        console.log(`Seeding data for: ${companyData.name}`);

        // Insert Company
        const company = await PrepCompany.create({
          name: companyData.name,
          logo: companyData.logo,
          about: companyData.about,
          selectionRate: companyData.selectionRate,
          package: companyData.package,
          eligibility: companyData.eligibility,
          estimatedTime: companyData.estimatedTime,
          difficulty: companyData.difficulty
        });

        // Insert Roles and Rounds
        if (companyData.roles && companyData.roles.length > 0) {
          for (const roleData of companyData.roles) {
            const role = await PrepRole.create({
              companyId: company._id,
              roleName: roleData.roleName,
              description: roleData.description,
              skillsRequired: roleData.skillsRequired,
              offerPrediction: roleData.offerPrediction,
              timeline: roleData.timeline,
              tags: roleData.tags
            });

            if (roleData.rounds && roleData.rounds.length > 0) {
              const roundsToInsert = roleData.rounds.map(round => ({
                ...round,
                roleId: role._id
              }));
              await PrepRound.insertMany(roundsToInsert);
            }
          }
        }
      }
    }

    console.log('Company Prep Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();
