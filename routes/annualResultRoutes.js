const express = require('express');
const annualResultController = require('../controllers/annualResultController');
const router = express.Router();

// Routes principales CRUD
router.get('/', annualResultController.getAllAnnualResults);
router.get('/:id', annualResultController.getAnnualResultById);
router.post('/', annualResultController.createAnnualResult);
router.put('/:id', annualResultController.updateAnnualResult);
router.delete('/:id', annualResultController.deleteAnnualResult);

// Routes de recherche et consultation
router.get('/registration/:registrationId', annualResultController.getAnnualResultsByRegistration);
router.get('/student/:studentId', annualResultController.getAnnualResultsByStudent);
router.get('/year/:academicYear', annualResultController.getAnnualResultsByAcademicYear);
router.get('/ranking/:academicYear', annualResultController.getClassRanking);
router.get('/stats/:academicYear', annualResultController.getAnnualStats);
router.get('/student/:studentId/summary', annualResultController.getStudentAnnualSummary);

// Routes de calcul et génération
router.post('/calculate', annualResultController.calculateAnnualResult);
router.post('/generate', annualResultController.createOrUpdateAnnualResult);
router.post('/ranking/:academicYear/update', annualResultController.updateClassRanking);

module.exports = router;