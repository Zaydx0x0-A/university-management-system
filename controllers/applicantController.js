const applicantService = require('../services/applicantService');

class ApplicantController {
  // GET /api/applicants - Récupérer tous les candidats
  async getAllApplicants(req, res) {
    try {
      const filters = {
        has_applications: req.query.has_applications === 'true'
      };

      const applicants = await applicantService.getAllApplicants(filters);
      
      res.json({
        success: true,
        data: applicants,
        count: applicants.length,
        filters: Object.keys(filters).length > 0 ? filters : undefined
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/applicants/:id - Récupérer un candidat par ID
  async getApplicantById(req, res) {
    try {
      const applicant = await applicantService.getApplicantById(req.params.id);
      
      if (!applicant) {
        return res.status(404).json({
          success: false,
          error: 'Applicant not found'
        });
      }

      res.json({
        success: true,
        data: applicant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/applicants - Créer un nouveau candidat
  async createApplicant(req, res) {
    try {
      const applicantData = {
        // Les données spécifiques au candidat seront générées automatiquement
      };

      const personData = {
        national_id: req.body.national_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        birth_date: req.body.birth_date,
        birth_place: req.body.birth_place,
        nationality: req.body.nationality,
        address: req.body.address,
        phone: req.body.phone,
        personal_email: req.body.personal_email,
        gender: req.body.gender
      };

      // Validation des données requises
      if (!personData.first_name || !personData.last_name || !personData.national_id) {
        return res.status(400).json({
          success: false,
          error: 'first_name, last_name, and national_id are required'
        });
      }

      const applicant = await applicantService.createApplicantWithPerson(applicantData, personData);
      
      res.status(201).json({
        success: true,
        message: 'Applicant created successfully',
        data: applicant
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/applicants/:id - Mettre à jour un candidat
  async updateApplicant(req, res) {
    try {
      const applicantData = { ...req.body };
      delete applicantData.applicant_id; // Empêcher la modification de l'ID
      delete applicantData.applicant_person_id; // Empêcher la modification de la personne

      const applicant = await applicantService.updateApplicant(req.params.id, applicantData);
      
      res.json({
        success: true,
        message: 'Applicant updated successfully',
        data: applicant
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // DELETE /api/applicants/:id - Supprimer un candidat
  async deleteApplicant(req, res) {
    try {
      await applicantService.deleteApplicant(req.params.id);
      
      res.json({
        success: true,
        message: 'Applicant deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/applicants/code/:applicationCode - Récupérer un candidat par code de candidature
  async getApplicantByApplicationCode(req, res) {
    try {
      const applicant = await applicantService.getApplicantByApplicationCode(req.params.applicationCode);
      
      if (!applicant) {
        return res.status(404).json({
          success: false,
          error: 'Applicant not found'
        });
      }

      res.json({
        success: true,
        data: applicant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/applicants/person/:personId - Récupérer un candidat par ID de personne
  async getApplicantByPersonId(req, res) {
    try {
      const applicant = await applicantService.getApplicantByPersonId(req.params.personId);
      
      if (!applicant) {
        return res.status(404).json({
          success: false,
          error: 'Applicant not found for this person'
        });
      }

      res.json({
        success: true,
        data: applicant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/applicants/search/:term - Rechercher des candidats
  async searchApplicants(req, res) {
    try {
      const { term } = req.params;
      
      if (!term || term.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search term must be at least 2 characters long'
        });
      }

      const applicants = await applicantService.searchApplicants(term);
      
      res.json({
        success: true,
        data: applicants,
        count: applicants.length,
        searchTerm: term
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/applicants/stats/overview - Récupérer les statistiques des candidats
  async getApplicantStats(req, res) {
    try {
      const stats = await applicantService.getApplicantStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/applicants/active/applications - Récupérer les candidats avec des candidatures actives
  async getApplicantsWithActiveApplications(req, res) {
    try {
      const applicants = await applicantService.getApplicantsWithActiveApplications();
      
      res.json({
        success: true,
        data: applicants,
        count: applicants.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/applicants/:id/application-history - Récupérer l'historique des candidatures
  async getApplicantApplicationHistory(req, res) {
    try {
      const applicationHistory = await applicantService.getApplicantApplicationHistory(req.params.id);
      
      res.json({
        success: true,
        data: applicationHistory
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/applicants/merge - Fusionner deux candidats
  async mergeApplicants(req, res) {
    try {
      const { source_applicant_id, target_applicant_id } = req.body;
      
      if (!source_applicant_id || !target_applicant_id) {
        return res.status(400).json({
          success: false,
          error: 'source_applicant_id and target_applicant_id are required'
        });
      }

      if (source_applicant_id === target_applicant_id) {
        return res.status(400).json({
          success: false,
          error: 'Source and target applicants cannot be the same'
        });
      }

      const mergedApplicant = await applicantService.mergeApplicants(source_applicant_id, target_applicant_id);
      
      res.json({
        success: true,
        message: 'Applicants merged successfully',
        data: mergedApplicant
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/applicants/by-date - Récupérer les candidats par période de création
  async getApplicantsByCreationDate(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          error: 'start_date and end_date are required'
        });
      }

      const applicants = await applicantService.getApplicantsByCreationDate(start_date, end_date);
      
      res.json({
        success: true,
        data: applicants,
        count: applicants.length,
        period: {
          start_date,
          end_date
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/applicants/:id/generate-code - Régénérer le code de candidature
  async regenerateApplicationCode(req, res) {
    try {
      const applicant = await applicantService.getApplicantById(req.params.id);
      if (!applicant) {
        return res.status(404).json({
          success: false,
          error: 'Applicant not found'
        });
      }

      const newCode = await applicantService.generateApplicationCode();
      const updatedApplicant = await applicantService.updateApplicant(req.params.id, {
        applicant_application_code: newCode
      });
      
      res.json({
        success: true,
        message: 'Application code regenerated successfully',
        data: updatedApplicant
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ApplicantController();