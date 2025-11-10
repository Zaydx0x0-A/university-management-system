const { Student, Person, University, StudentCard, StudentRegistration, Grade, Program, Specialization, Sequelize } = require('../models');
const { Op } = Sequelize;

class StudentService {
  async getAllStudents(filters = {}) {
    const whereClause = {};
    
    // Filtres optionnels
    if (filters.student_university_id) whereClause.student_university_id = filters.student_university_id;
    if (filters.student_status) whereClause.student_status = filters.student_status;
    if (filters.student_admission_type) whereClause.student_admission_type = filters.student_admission_type;

    return await Student.findAll({
      where: whereClause,
      include: [
        { 
          model: Person,
          attributes: ['first_name', 'last_name', 'birth_date', 'nationality', 'phone', 'personal_email']
        },
        { 
          model: University,
          attributes: ['university_name', 'university_city']
        }
      ],
      order: [['student_admission_date', 'DESC']]
    });
  }

  async getStudentById(studentId) {
    return await Student.findByPk(studentId, {
      include: [
        { 
          model: Person,
          attributes: { exclude: ['created_at'] }
        },
        { 
          model: University,
          attributes: ['university_id', 'university_name', 'university_code', 'university_city']
        },
        {
          model: StudentCard,
          attributes: ['card_id', 'card_number', 'status', 'issue_date', 'expiration_date']
        },
        {
          model: StudentRegistration,
          include: [
            {
              model: Specialization,
              include: ['Program']
            }
          ],
          order: [['academic_year', 'DESC']]
        },
        {
          model: Grade,
          include: ['Course'],
          limit: 20,
          order: [['created_at', 'DESC']]
        }
      ]
    });
  }

  async createStudentWithPerson(studentData, personData) {
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Créer la personne
      const person = await Person.create({
        ...personData,
        person_type: 'student'
      }, { transaction });

      // 2. Créer l'étudiant
      const student = await Student.create({
        ...studentData,
        student_person_id: person.person_id
      }, { transaction });

      await transaction.commit();
      
      return await this.getStudentById(student.student_id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateStudent(studentId, studentData) {
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Vérifier les doublons (sauf pour l'étudiant actuel)
    if (studentData.student_number || studentData.student_academic_email) {
      const whereCondition = {
        student_id: { [Op.ne]: studentId }
      };

      if (studentData.student_number) {
        whereCondition.student_number = studentData.student_number;
      }
      if (studentData.student_academic_email) {
        whereCondition.student_academic_email = studentData.student_academic_email;
      }

      const existingStudent = await Student.findOne({ where: whereCondition });
      if (existingStudent) {
        throw new Error('Student number or academic email already exists for another student');
      }
    }

    return await student.update(studentData);
  }

  async deleteStudent(studentId) {
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Vérifier les dépendances
    const registrationCount = await StudentRegistration.count({ where: { student_id: studentId } });
    const gradeCount = await Grade.count({ where: { student_id: studentId } });
    const cardCount = await StudentCard.count({ where: { student_id: studentId } });

    if (registrationCount > 0 || gradeCount > 0 || cardCount > 0) {
      throw new Error('Cannot delete student with associated registrations, grades, or cards');
    }

    // Supprimer également la personne associée
    const transaction = await sequelize.transaction();
    try {
      await student.destroy({ transaction });
      await Person.destroy({ where: { person_id: student.student_person_id }, transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getStudentByNumber(studentNumber) {
    return await Student.findOne({ 
      where: { student_number: studentNumber },
      include: [
        { model: Person },
        { model: University }
      ]
    });
  }

  async getStudentsByUniversity(universityId, filters = {}) {
    const whereClause = { student_university_id: universityId };
    
    if (filters.student_status) whereClause.student_status = filters.student_status;
    if (filters.student_admission_type) whereClause.student_admission_type = filters.student_admission_type;

    return await Student.findAll({
      where: whereClause,
      include: [
        { model: Person },
        {
          model: StudentRegistration,
          include: ['Specialization'],
          limit: 1,
          order: [['academic_year', 'DESC']]
        }
      ],
      order: [[Person, 'last_name', 'ASC']]
    });
  }

  async updateStudentStatus(studentId, status) {
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    if (!['active', 'graduated', 'dropped_out', 'expelled', 'transferred', 'suspended'].includes(status)) {
      throw new Error('Invalid status value');
    }

    return await student.update({ student_status: status });
  }

  async getStudentStats(universityId = null) {
    const whereClause = {};
    if (universityId) {
      whereClause.student_university_id = universityId;
    }

    const totalStudents = await Student.count({ where: whereClause });
    const activeStudents = await Student.count({ 
      where: { ...whereClause, student_status: 'active' } 
    });

    // Statistiques par statut
    const statusStats = await Student.findAll({
      attributes: [
        'student_status',
        [Sequelize.fn('COUNT', Sequelize.col('student_id')), 'count']
      ],
      where: whereClause,
      group: ['student_status'],
      raw: true
    });

    // Statistiques par type d'admission
    const admissionStats = await Student.findAll({
      attributes: [
        'student_admission_type',
        [Sequelize.fn('COUNT', Sequelize.col('student_id')), 'count']
      ],
      where: whereClause,
      group: ['student_admission_type'],
      raw: true
    });

    // Statistiques par année de bac
    const bacYearStats = await Student.findAll({
      attributes: [
        'student_baccalaureate_year',
        [Sequelize.fn('COUNT', Sequelize.col('student_id')), 'count']
      ],
      where: { ...whereClause, student_baccalaureate_year: { [Op.ne]: null } },
      group: ['student_baccalaureate_year'],
      order: [['student_baccalaureate_year', 'DESC']],
      limit: 5,
      raw: true
    });

    return {
      totalStudents,
      activeStudents,
      statusStats: statusStats.reduce((acc, stat) => {
        acc[stat.student_status] = parseInt(stat.count);
        return acc;
      }, {}),
      admissionStats: admissionStats.reduce((acc, stat) => {
        acc[stat.student_admission_type] = parseInt(stat.count);
        return acc;
      }, {}),
      recentBacYears: bacYearStats
    };
  }

  async searchStudents(searchTerm, universityId = null) {
    if (!searchTerm || searchTerm.length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }

    const studentWhereClause = {
      [Op.or]: [
        { student_number: { [Op.like]: `%${searchTerm}%` } },
        { student_academic_email: { [Op.like]: `%${searchTerm}%` } }
      ]
    };

    if (universityId) {
      studentWhereClause.student_university_id = universityId;
    }

    // Recherche dans Student et Person
    const students = await Student.findAll({
      where: studentWhereClause,
      include: [
        { 
          model: Person,
          where: {
            [Op.or]: [
              { first_name: { [Op.like]: `%${searchTerm}%` } },
              { last_name: { [Op.like]: `%${searchTerm}%` } },
              { national_id: { [Op.like]: `%${searchTerm}%` } }
            ]
          },
          required: false
        },
        { 
          model: University,
          attributes: ['university_name', 'university_city']
        },
        {
          model: StudentRegistration,
          include: ['Specialization'],
          limit: 1,
          order: [['academic_year', 'DESC']]
        }
      ],
      limit: 50
    });

    return students;
  }

  async getStudentAcademicHistory(studentId) {
    const student = await Student.findByPk(studentId, {
      include: [
        {
          model: StudentRegistration,
          include: [
            {
              model: Specialization,
              include: ['Program']
            },
            {
              model: Grade,
              include: [
                {
                  model: Course,
                  include: ['TeachingUnit']
                }
              ]
            },
            'SemesterResult',
            'AnnualResult'
          ],
          order: [['academic_year', 'DESC']]
        }
      ]
    });

    if (!student) {
      throw new Error('Student not found');
    }

    return student;
  }

  async transferStudent(studentId, targetUniversityId) {
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const targetUniversity = await University.findByPk(targetUniversityId);
    if (!targetUniversity) {
      throw new Error('Target university not found');
    }

    return await student.update({
      student_university_id: targetUniversityId,
      student_status: 'transferred'
    });
  }

  async getStudentCurrentRegistration(studentId) {
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    return await StudentRegistration.findOne({
      where: {
        student_id: studentId,
        academic_year: academicYear
      },
      include: [
        {
          model: Specialization,
          include: ['Program']
        },
        {
          model: Grade,
          include: ['Course']
        }
      ],
      order: [['registration_date', 'DESC']]
    });
  }

  async graduateStudent(studentId) {
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Vérifier si l'étudiant peut être diplômé (crédits, etc.)
    const currentRegistration = await this.getStudentCurrentRegistration(studentId);
    if (!currentRegistration) {
      throw new Error('No current registration found for student');
    }

    // Logique de vérification pour la graduation
    // (crédits obtenus, moyenne générale, etc.)

    return await student.update({
      student_status: 'graduated'
    });
  }

  async getStudentsByStatus(status, universityId = null) {
    const whereClause = { student_status: status };
    if (universityId) {
      whereClause.student_university_id = universityId;
    }

    return await Student.findAll({
      where: whereClause,
      include: [
        { model: Person },
        { model: University },
        {
          model: StudentRegistration,
          include: ['Specialization'],
          limit: 1,
          order: [['academic_year', 'DESC']]
        }
      ],
      order: [[Person, 'last_name', 'ASC']]
    });
  }
}

module.exports = new StudentService();