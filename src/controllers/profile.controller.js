const Joi = require('joi');
const { analyzeGithubProfile } = require('../services/github.service');
const profileRepository = require('../repositories/profile.repository');
const { success } = require('../utils/apiResponse');

const usernameSchema = Joi.string().trim().pattern(/^[a-zA-Z0-9-]{1,39}$/).required();

function validateUsername(username) {
  const { error, value } = usernameSchema.validate(username);
  if (error) {
    const err = new Error('Invalid GitHub username. Use 1-39 characters: letters, numbers and hyphen only.');
    err.statusCode = 400;
    throw err;
  }
  return value;
}

async function analyzeProfile(req, res) {
  const username = validateUsername(req.params.username);
  const analyzedProfile = await analyzeGithubProfile(username);
  const savedProfile = await profileRepository.upsertProfile(analyzedProfile);
  return success(res, 'GitHub profile analyzed and stored successfully', savedProfile, 201);
}

async function getProfiles(req, res) {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
  const search = String(req.query.search || '').trim();
  const sortBy = String(req.query.sortBy || 'analyzed_at');
  const order = String(req.query.order || 'DESC');

  const { rows, total } = await profileRepository.findAll({ page, limit, search, sortBy, order });
  return success(res, 'Stored analyzed profiles fetched successfully', rows, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
}

async function getProfileByUsername(req, res) {
  const username = validateUsername(req.params.username);
  const profile = await profileRepository.findByUsername(username);

  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile analysis not found in database. Analyze it first.' });
  }

  return success(res, 'Stored profile analysis fetched successfully', profile);
}

async function deleteProfile(req, res) {
  const username = validateUsername(req.params.username);
  const deleted = await profileRepository.removeByUsername(username);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Profile analysis not found' });
  }

  return success(res, 'Profile analysis deleted successfully');
}

module.exports = { analyzeProfile, getProfiles, getProfileByUsername, deleteProfile };
