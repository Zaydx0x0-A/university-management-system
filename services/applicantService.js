const { Applicant, Person, Application, Competition, University, Sequelize } = require('../models');
const { Op } = Sequelize;

class ApplicantService {
  async getAllApplicants(filters = {}) {
    const whereClause = {};
    
    // Filtres optionnels
    if (filters.has_applications) {
      // Filtrer les candidats qui ont au moins une candidature
      const applicantsWithApplications = await Application.findAll({
        attributes: ['applicant_id'],
        group: ['applicant_id']
      });
      const applicantIds = applicantsWithApplications.map(app => app.applicant_id);
      whereClause.applicant_id = { [Op.in]: applicantIds };
    }

    return await Applicant.findAll({
      where: whereClause,
      include: [
        { 
          model: Person,
          attributes: ['first_name', 'last_name', 'birth_date', 'nationality', 'phone', 'personal_email']
        },
        {
          model: Application,
          attributes: ['application_id', 'status', 'application_date'],
          include: [{
            model: Competition,
            attributes: ['competition_name', 'competition_type'],
            include: [{
              model: University,
              attributes: ['university_name']
            }]
          }]
        }
      ],
      order: [['applicant_created_at', 'DESC']]
    });
  }

  async getApplicantById(applicantId) {
    return await Applicant.findByPk(applicantId, {
      include: [
        { 
          model: Person,
          attributes: { exclude: ['created_at'] }
        },
        {
          model: Application,
          include: [
            {
              model: Competition,
              include: [{
                model: University,
                attributes: ['university_id', 'university_name', 'university_city']
              }]
            }
          ],
          order: [['application_date', 'DESC']]
        }
      ]
    });
  }

  async createApplicantWithPerson(applicantData, personData) {
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Créer la personne
      const person = await Person.create({
        ...personData,
        person_type: 'applicant'
      }, { transaction });

      // 2. Générer un code de candidature unique
      const applicationCode = await this.generateApplicationCode();

      // 3. Créer le candidat
      const applicant = await Applicant.create({
        ...applicantData,
        applicant_person_id: person.person_id,
        applicant_application_code: applicationCode
      }, { transaction });

      await transaction.commit();
      
      return await this.getApplicantById(applicant.applicant_id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateApplicant(applicantId, applicantData) {
    const applicant = await Applicant.findByPk(applicantId);
    if (!applicant) {
      throw new Error('Applicant not found');
    }

    // Vérifier les doublons de code de candidature (sauf pour le candidat actuel)
    if (applicantData.applicant_application_code) {
      const existingApplicant = await Applicant.findOne({
        where: {
          applicant_application_code: applicantData.applicant_application_code,
          applicant_id: { [Op.ne]: applicantId }
        }
      });

      if (existingApplicant) {
        throw new Error('Application code already exists for another applicant');
      }
    }

    return await applicant.update(applicantData);
  }

  async deleteApplicant(applicantId) {
    const applicant = await Applicant.findByPk(applicantId);
    if (!applicant) {
      throw new Error('Applicant not found');
    }

    // Vérifier les dépendances (candidatures)
    const applicationCount = await Application.count({ where: { applicant_id: applicantId } });
    if (applicationCount > 0) {
      throw new Error('Cannot delete applicant with associated applications');
    }

    // Supprimer également la personne associée
    const transaction = await sequelize.transaction();
    try {
      await applicant.destroy({ transaction });
      await Person.destroy({ where: { person_id: applicant.applicant_person_id }, transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getApplicantByApplicationCode(applicationCode) {
    return await Applicant.findOne({ 
      where: { applicant_application_code: applicationCode },
      include: [
        { 
          model: Person,
          attributes: ['first_name', 'last_name', 'birth_date', 'national_id', 'personal_email']
        },
        {
          model: Application,
          include: [{
            model: Competition,
            include: ['University']
          }]
        }
      ]
    });
  }

  async getApplicantByPersonId(personId) {
    return await Applicant.findOne({ 
      where: { applicant_person_id: personId },
      include: [
        { model: Person },
        {
          model: Application,
          include: [{
            model: Competition,
            include: ['University']
          }]
        }
      ]
    });
  }

  async searchApplicants(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }

    return await Applicant.findAll({
      include: [
        { 
          model: Person,
          where: {
            [Op.or]: [
              { first_name: { [Op.like]: `%${searchTerm}%` } },
              { last_name: { [Op.like]: `%${searchTerm}%` } },
              { national_id: { [Op.like]: `%${searchTerm}%` } },
              { personal_email: { [Op.like]: `%${searchTerm}%` } }
            ]
          },
          required: true
        },
        {
          model: Application,
          include: [{
            model: Competition,
            include: ['University']
          }]
        }
      ],
      limit: 50,
      order: [['applicant_created_at', 'DESC']]
    });
  }

  async getApplicantStats() {
    const totalApplicants = await Applicant.count();
    
    const applicantsWithApplications = await Application.findAll({
      attributes: [
        'applicant_id',
        [Sequelize.fn('COUNT', Sequelize.col('application_id')), 'application_count']
      ],
      group: ['applicant_id'],
      raw: true
    });

    const applicantsWithMultipleApplications = applicantsWithApplications.filter(app => app.application_count > 1).length;

    // Statistiques par mois
    const monthlyStats = await Applicant.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('applicant_created_at'), '%Y-%m'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('applicant_id')), 'count']
      ],
      group: ['month'],
      order: [['month', 'DESC']],
      limit: 12,
      raw: true
    });

    return {
      total: totalApplicants,
      with_applications: applicantsWithApplications.length,
      with_multiple_applications: applicantsWithMultipleApplications,
      without_applications: totalApplicants - applicantsWithApplications.length,
      monthly_trend: monthlyStats
    };
  }

  async generateApplicationCode() {
    const year = new Date().getFullYear();
    const prefix = `APP-${year}-`;
    
    // Trouver le dernier code pour cette année
    const lastApplicant = await Applicant.findOne({
      where: {
        applicant_application_code: {
          [Op.like]: `${prefix}%`
        }
      },
      order: [['applicant_created_at', 'DESC']]
    });

    let sequence = 1;
    if (lastApplicant && lastApplicant.applicant_application_code) {
      const lastSequence = parseInt(lastApplicant.applicant_application_code.split('-')[2]) || 0;
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async getApplicantsWithActiveApplications() {
    const currentDate = new Date();
    
    return await Applicant.findAll({
      include: [
        { 
          model: Person,
          attributes: ['first_name', 'last_name', 'personal_email', 'phone']
        },
        {
          model: Application,
          where: {
            status: 'pending'
          },
          required: true,
          include: [{
            model: Competition,
            where: {
              closing_date: { [Op.gte]: currentDate },
              status: 'open'
            },
            include: [{
              model: University,
              attributes: ['university_name', 'university_city']
            }]
          }]
        }
      ],
      order: [['applicant_created_at', 'DESC']]
    });
  }

  async getApplicantApplicationHistory(applicantId) {
    const applicant = await Applicant.findByPk(applicantId, {
      include: [
        { 
          model: Person,
          attributes: ['first_name', 'last_name', 'national_id', 'birth_date']
        },
        {
          model: Application,
          include: [{
            model: Competition,
            include: [{
              model: University,
              attributes: ['university_name', 'university_city']
            }]
          }],
          order: [['application_date', 'DESC']]
        }
      ]
    });

    if (!applicant) {
      throw new Error('Applicant not found');
    }

    // Calculer des statistiques pour le candidat
    const applications = applicant.Applications || [];
    const applicationStats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      validated: applications.filter(app => app.status === 'validated').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      selected: applications.filter(app => app.status === 'selected').length
    };

    return {
      applicant: {
        applicant_id: applicant.applicant_id,
        application_code: applicant.applicant_application_code,
        created_at: applicant.applicant_created_at,
        person: applicant.Person
      },
      application_stats: applicationStats,
      applications: applications
    };
  }

  async mergeApplicants(sourceApplicantId, targetApplicantId) {
    const transaction = await sequelize.transaction();
    
    try {
      const sourceApplicant = await Applicant.findByPk(sourceApplicantId, { transaction });
      const targetApplicant = await Applicant.findByPk(targetApplicantId, { transaction });

      if (!sourceApplicant || !targetApplicant) {
        throw new Error('One or both applicants not found');
      }

      // Transférer toutes les candidatures du source vers la cible
      await Application.update(
        { applicant_id: targetApplicantId },
        { where: { applicant_id: sourceApplicantId }, transaction }
      );

      // Supprimer le candidat source
      await sourceApplicant.destroy({ transaction });

      // Supprimer la personne associée au source
      await Person.destroy({ 
        where: { person_id: sourceApplicant.applicant_person_id }, 
        transaction 
      });

      await transaction.commit();
      
      return await this.getApplicantById(targetApplicantId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getApplicantsByCreationDate(startDate, endDate) {
    return await Applicant.findAll({
      where: {
        applicant_created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        { 
          model: Person,
          attributes: ['first_name', 'last_name', 'personal_email']
        },
        {
          model: Application,
          attributes: ['application_id', 'status']
        }
      ],
      order: [['applicant_created_at', 'ASC']]
    });
  }
}

module.exports = new ApplicantService();