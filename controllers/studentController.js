const studentService = require('../services/studentService');

class StudentController {
  // GET /api/students - Récupérer tous les étudiants
  async getAllStudents(req, res) {
    try {
      const filters = {
        student_university_id: req.query.university_id,
        student_status: req.query.status,
        student_admission_type: req.query.admission_type
      };

      // Nettoyer les filtres undefined
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const students = await studentService.getAllStudents(filters);
      
      res.json({
        success: true,
        data: students,
        count: students.length,
        filters: Object.keys(filters).length > 0 ? filters : undefined
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/students/:id - Récupérer un étudiant par ID
  async getStudentById(req, res) {
    try {
      const student = await studentService.getStudentById(req.params.id);
      
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }

      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/students - Créer un nouvel étudiant
  async createStudent(req, res) {
    try {
      const studentData = {
        student_university_id: req.body.student_university_id,
        student_number: req.body.student_number,
        student_academic_email: req.body.student_academic_email,
        student_admission_date: req.body.student_admission_date,
        student_status: req.body.student_status || 'active',
        student_admission_type: req.body.student_admission_type,
        student_high_school_origin: req.body.student_high_school_origin,
        student_baccalaureate_year: req.body.student_baccalaureate_year,
        student_baccalaureate_series: req.body.student_baccalaureate_series
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

      const student = await studentService.createStudentWithPerson(studentData, personData);
      
      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: student
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/students/:id - Mettre à jour un étudiant
  async updateStudent(req, res) {
    try {
      const studentData = { ...req.body };
      delete studentData.student_id; // Empêcher la modification de l'ID
      delete studentData.student_person_id; // Empêcher la modification de la personne

      const student = await studentService.updateStudent(req.params.id, studentData);
      
      res.json({
        success: true,
        message: 'Student updated successfully',
        data: student
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // DELETE /api/students/:id - Supprimer un étudiant
  async deleteStudent(req, res) {
    try {
      await studentService.deleteStudent(req.params.id);
      
      res.json({
        success: true,
        message: 'Student deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/students/number/:number - Récupérer un étudiant par numéro
  async getStudentByNumber(req, res) {
    try {
      const student = await studentService.getStudentByNumber(req.params.number);
      
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }

      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/students/university/:universityId - Récupérer les étudiants d'une université
  async getStudentsByUniversity(req, res) {
    try {
      const filters = {
        student_status: req.query.status,
        student_admission_type: req.query.admission_type
      };

      const students = await studentService.getStudentsByUniversity(req.params.universityId, filters);
      
      res.json({
        success: true,
        data: students,
        count: students.length,
        university_id: req.params.universityId,
        filters: Object.keys(filters).length > 0 ? filters : undefined
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // PATCH /api/students/:id/status - Mettre à jour le statut d'un étudiant
  async updateStudentStatus(req, res) {
    try {
      const { status } = req.body;
      
      const validStatuses = ['active', 'graduated', 'dropped_out', 'expelled', 'transferred', 'suspended'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }

      const student = await studentService.updateStudentStatus(req.params.id, status);
      
      res.json({
        success: true,
        message: `Student status updated to ${status}`,
        data: student
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/students/stats/overview - Récupérer les statistiques des étudiants
  async getStudentStats(req, res) {
    try {
      const universityId = req.query.university_id;
      const stats = await studentService.getStudentStats(universityId);
      
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

  // GET /api/students/search/:term - Rechercher des étudiants
  async searchStudents(req, res) {
    try {
      const { term } = req.params;
      const universityId = req.query.university_id;
      
      if (!term || term.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search term must be at least 2 characters long'
        });
      }

      const students = await studentService.searchStudents(term, universityId);
      
      res.json({
        success: true,
        data: students,
        count: students.length,
        searchTerm: term
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/students/:id/academic-history - Récupérer l'historique académique
  async getStudentAcademicHistory(req, res) {
    try {
      const academicHistory = await studentService.getStudentAcademicHistory(req.params.id);
      
      res.json({
        success: true,
        data: academicHistory
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/students/:id/transfer - Transférer un étudiant
  async transferStudent(req, res) {
    try {
      const { target_university_id } = req.body;
      
      if (!target_university_id) {
        return res.status(400).json({
          success: false,
          error: 'Target university ID is required'
        });
      }

      const student = await studentService.transferStudent(req.params.id, target_university_id);
      
      res.json({
        success: true,
        message: 'Student transferred successfully',
        data: student
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/students/:id/current-registration - Récupérer l'inscription actuelle
  async getStudentCurrentRegistration(req, res) {
    try {
      const currentRegistration = await studentService.getStudentCurrentRegistration(req.params.id);
      
      if (!currentRegistration) {
        return res.status(404).json({
          success: false,
          error: 'No current registration found for student'
        });
      }

      res.json({
        success: true,
        data: currentRegistration
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/students/:id/graduate - Diplômer un étudiant
  async graduateStudent(req, res) {
    try {
      const student = await studentService.graduateStudent(req.params.id);
      
      res.json({
        success: true,
        message: 'Student graduated successfully',
        data: student
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/students/status/:status - Récupérer les étudiants par statut
  async getStudentsByStatus(req, res) {
    try {
      const universityId = req.query.university_id;
      const students = await studentService.getStudentsByStatus(req.params.status, universityId);
      
      res.json({
        success: true,
        data: students,
        count: students.length,
        status: req.params.status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new StudentController();