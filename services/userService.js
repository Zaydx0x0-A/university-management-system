const { User, Person, University, Course } = require('../models');

class UserService {
  async createUserWithPerson(userData, personData) {
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Créer la personne
      const person = await Person.create({
        ...personData,
        person_type: 'staff'
      }, { transaction });

      // 2. Créer l'utilisateur
      const user = await User.create({
        ...userData,
        person_id: person.person_id
      }, { transaction });

      await transaction.commit();
      
      return await User.findByPk(user.user_id, {
        include: [
          { model: Person },
          { model: University }
        ]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getUserWithDetails(userId) {
    return await User.findByPk(userId, {
      include: [
        { 
          model: Person,
          attributes: { exclude: ['created_at'] }
        },
        { 
          model: University,
          attributes: ['university_id', 'university_name', 'university_code']
        },
        {
          model: Course,
          attributes: ['course_id', 'course_code', 'course_name'],
          include: ['TeachingUnit']
        }
      ]
    });
  }

  async getAllUsersWithDetails(filters = {}) {
    const whereClause = {};
    if (filters.university_id) whereClause.university_id = filters.university_id;
    if (filters.user_role) whereClause.user_role = filters.user_role;
    if (filters.user_status) whereClause.user_status = filters.user_status;

    return await User.findAll({
      where: whereClause,
      include: [
        { 
          model: Person,
          attributes: ['first_name', 'last_name', 'birth_date', 'phone', 'personal_email']
        },
        { 
          model: University,
          attributes: ['university_name', 'city']
        }
      ],
      order: [[Person, 'last_name', 'ASC']]
    });
  }

  async updateUserWithPerson(userId, userData, personData) {
    const transaction = await sequelize.transaction();
    
    try {
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throw new Error('User not found');
      }

      // Mettre à jour l'utilisateur
      if (Object.keys(userData).length > 0) {
        await user.update(userData, { transaction });
      }

      // Mettre à jour la personne
      if (Object.keys(personData).length > 0) {
        const person = await Person.findByPk(user.person_id, { transaction });
        await person.update(personData, { transaction });
      }

      await transaction.commit();
      return await this.getUserWithDetails(userId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getUserByEmployeeId(employeeId) {
    return await User.findOne({
      where: { employee_id: employeeId },
      include: [
        { model: Person },
        { model: University }
      ]
    });
  }
}

module.exports = new UserService();