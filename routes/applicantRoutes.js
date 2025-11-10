const express = require('express');
const applicantController = require('../controllers/applicantController');
const router = express.Router();

// Routes principales CRUD
router.get('/', applicantController.getAllApplicants);
router.get('/:id', applicantController.getApplicantById);
router.post('/', applicantController.createApplicant);
router.put('/:id', applicantController.updateApplicant);
router.delete('/:id', applicantController.deleteApplicant);

// Routes de recherche et consultation
router.get('/code/:applicationCode', applicantController.getApplicantByApplicationCode);
router.get('/person/:personId', applicantController.getApplicantByPersonId);
router.get('/search/:term', applicantController.searchApplicants);
router.get('/active/applications', applicantController.getApplicantsWithActiveApplications);
router.get('/by-date', applicantController.getApplicantsByCreationDate);

// Routes spécifiques
router.get('/stats/overview', applicantController.getApplicantStats);
router.get('/:id/application-history', applicantController.getApplicantApplicationHistory);
router.post('/merge', applicantController.mergeApplicants);
router.post('/:id/generate-code', applicantController.regenerateApplicationCode);

module.exports = router;