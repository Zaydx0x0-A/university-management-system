const { Person, User, Student, Applicant, University, Sequelize } = require('../models');
const { Op } = Sequelize;

class PersonService {
  async createPerson(personData) {
    // Vérifier les doublons d'ID national ou email
    if (personData.national_id || personData.personal_email) {
      const whereCondition = {};
      
      if (personData.national_id) {
        whereCondition.national_id = personData.national_id;
      }
      if (personData.personal_email) {
        whereCondition.personal_email = personData.personal_email;
      }

      const existingPerson = await Person.findOne({ where: whereCondition });
      if (existingPerson) {
        throw new Error('Person with this national ID or email already exists');
      }
    }

    return await Person.create(personData);
  }

  async getPersonById(personId) {
    return await Person.findByPk(personId, {
      include: [
        { 
          model: User,
          include: [{
            model: University,
            attributes: ['university_id', 'university_name', 'university_code']
          }]
        },
        { 
          model: Student,
          include: [{
            model: University,
            attributes: ['university_id', 'university_name', 'university_code']
          }]
        },
        { 
          model: Applicant,
          include: ['Application']
        }
      ]
    });
  }

  async findPersonByNationalId(nationalId) {
    return await Person.findOne({ 
      where: { national_id: nationalId },
      include: [
        { 
          model: User,
          include: ['University']
        },
        { 
          model: Student,
          include: ['University']
        },
        { 
          model: Applicant,
          include: ['Application']
        }
      ]
    });
  }

  async updatePerson(personId, personData) {
    const person = await Person.findByPk(personId);
    if (!person) {
      throw new Error('Person not found');
    }

    // Vérifier les doublons (sauf pour la personne actuelle)
    if (personData.national_id || personData.personal_email) {
      const whereCondition = {
        person_id: { [Op.ne]: personId }
      };

      if (personData.national_id) {
        whereCondition.national_id = personData.national_id;
      }
      if (personData.personal_email) {
        whereCondition.personal_email = personData.personal_email;
      }

      const existingPerson = await Person.findOne({ where: whereCondition });
      if (existingPerson) {
        throw new Error('National ID or email already exists for another person');
      }
    }

    return await person.update(personData);
  }

  async searchPersons(searchTerm, personType = null) {
    const whereClause = {
      [Op.or]: [
        { first_name: { [Op.like]: `%${searchTerm}%` } },
        { last_name: { [Op.like]: `%${searchTerm}%` } },
        { national_id: { [Op.like]: `%${searchTerm}%` } },
        { personal_email: { [Op.like]: `%${searchTerm}%` } }
      ]
    };

    if (personType) {
      whereClause.person_type = personType;
    }

    return await Person.findAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          include: [{
            model: University,
            attributes: ['university_id', 'university_name']
          }]
        },
        { 
          model: Student, 
          include: [{
            model: University,
            attributes: ['university_id', 'university_name']
          }]
        },
        { 
          model: Applicant
        }
      ],
      limit: 50,
      order: [['last_name', 'ASC'], ['first_name', 'ASC']]
    });
  }

  async getPersonByEmail(email) {
    return await Person.findOne({
      where: { personal_email: email },
      include: [
        { model: User },
        { model: Student },
        { model: Applicant }
      ]
    });
  }

  async getPersonsWithMultipleRoles() {
    // Personnes qui ont à la fois un compte User et Student (cas rare mais possible)
    const persons = await Person.findAll({
      include: [
        { model: User, required: true },
        { model: Student, required: true }
      ]
    });

    return persons;
  }
}

module.exports = new PersonService();