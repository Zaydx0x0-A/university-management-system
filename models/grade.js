const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Grade = sequelize.define('Grade', {
    grade_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    grade_student: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    grade_course: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    grade_registration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    grade_continuous_assessment: {
      type: DataTypes.DECIMAL(4, 2)
    },
    grade_exam_grade: {
      type: DataTypes.DECIMAL(4, 2)
    },
    grade_course_average: {
      type: DataTypes.DECIMAL(4, 2)
    },
    grade_validation_status: {
      type: DataTypes.ENUM('Validated', 'Not Validated', 'Retake'),
      defaultValue: 'Not Validated'
    },
    grade_earned_credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    grade_session: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    grade_comments: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'grades',
    timestamps: false
  });

  Grade.associate = function(models) {
    Grade.belongsTo(models.Student, { foreignKey: 'student_id' });
    Grade.belongsTo(models.Course, { foreignKey: 'course_id' });
    Grade.belongsTo(models.StudentRegistration, { foreignKey: 'registration_id' });
  };

  return Grade;
};