const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const profileController = require('../controllers/profile.controller');

const router = express.Router();

router.post('/analyze/:username', asyncHandler(profileController.analyzeProfile));
router.get('/profiles', asyncHandler(profileController.getProfiles));
router.get('/profiles/:username', asyncHandler(profileController.getProfileByUsername));
router.delete('/profiles/:username', asyncHandler(profileController.deleteProfile));

module.exports = router;
