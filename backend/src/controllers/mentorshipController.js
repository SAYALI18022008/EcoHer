const crypto = require("crypto");
const { readDB, writeDB } = require("../utils/db");

async function createRequest(req, res) {
  const {
    mentorId,
    topic,
    message = ""
  } = req.body;

  if (!mentorId || !topic) {
    return res.status(400).json({
      success: false,
      message: "Mentor and topic are required."
    });
  }

  const db = await readDB();

  const mentor = db.mentorProfiles.find(
    m => m.id === mentorId || m.userId === mentorId
  );

  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: "Mentor not found."
    });
  }

  const request = {
    id: crypto.randomUUID(),
    entrepreneurId: req.user.id,
    mentorId: mentor.userId,
    topic,
    status: "pending",
    message,
    mentorResponse: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.mentorshipRequests.push(request);

  await writeDB(db);

  res.status(201).json({
    success: true,
    message: "Mentorship request sent.",
    data: { request }
  });
}

async function getMyRequests(req, res) {
  const db = await readDB();

  const requests = db.mentorshipRequests.filter(
    r =>
      r.entrepreneurId === req.user.id ||
      r.mentorId === req.user.id
  );

  res.json({
    success: true,
    message: "Mentorship requests retrieved.",
    data: { requests }
  });
}

async function updateRequestStatus(req, res) {
  const db = await readDB();

  const request = db.mentorshipRequests.find(
    r => r.id === req.params.id
  );

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Mentorship request not found."
    });
  }

  if (request.mentorId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Only the assigned mentor can update this request."
    });
  }

  const { status, mentorResponse = "" } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be accepted or rejected."
    });
  }

  request.status = status;
  request.mentorResponse = mentorResponse;
  request.updatedAt = new Date().toISOString();

  await writeDB(db);

  res.json({
    success: true,
    message: `Mentorship request ${status}.`,
    data: { request }
  });
}

module.exports = {
  createRequest,
  getMyRequests,
  updateRequestStatus
};