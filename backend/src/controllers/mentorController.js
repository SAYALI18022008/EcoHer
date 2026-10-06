const crypto = require("crypto");
const { readDB, writeDB } = require("../utils/db");

async function createOrUpdateProfile(req, res) {
  const db = await readDB();

  let profile = db.mentorProfiles.find(
    p => p.userId === req.user.id
  );

  const {
    bio = "",
    expertise = [],
    languages = [],
    yearsOfExperience = 0,
    available = true,
    city = ""
  } = req.body;

  if (!profile) {
    profile = {
      id: crypto.randomUUID(),
      userId: req.user.id,
      bio,
      expertise,
      languages,
      yearsOfExperience: Number(yearsOfExperience),
      available,
      city,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.mentorProfiles.push(profile);
  } else {
    profile.bio = bio;
    profile.expertise = expertise;
    profile.languages = languages;
    profile.yearsOfExperience = Number(yearsOfExperience);
    profile.available = available;
    profile.city = city;
    profile.updatedAt = new Date().toISOString();
  }

  await writeDB(db);

  res.json({
    success: true,
    message: "Mentor profile saved.",
    data: { profile }
  });
}

async function getRecommendations(req, res) {
  const {
    topic = "",
    city = "",
    language = ""
  } = req.query;

  const db = await readDB();

  const recommendations = db.mentorProfiles
    .filter(m => m.available)
    .map(mentor => {
      let score = 0;

      if (
        topic &&
        mentor.expertise.some(
          e => e.toLowerCase() === topic.toLowerCase()
        )
      ) {
        score += 5;
      }

      if (
        city &&
        mentor.city.toLowerCase() === city.toLowerCase()
      ) {
        score += 2;
      }

      if (
        language &&
        mentor.languages.some(
          l => l.toLowerCase() === language.toLowerCase()
        )
      ) {
        score += 2;
      }

      if (mentor.yearsOfExperience >= 2) {
        score += 1;
      }

      return {
        ...mentor,
        matchScore: score
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    success: true,
    message: "Mentor recommendations retrieved.",
    data: { recommendations }
  });
}

module.exports = {
  createOrUpdateProfile,
  getRecommendations
};