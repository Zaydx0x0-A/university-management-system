const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
    student_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    student_person_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    student_university_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    student_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    student_academic_email: {
      type: DataTypes.STRING(100),
      unique: true
    },
    student_admission_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    student_status: {
      type: DataTypes.ENUM('active', 'graduated', 'dropped_out', 'expelled', 'transferred', 'suspended'),
      defaultValue: 'active'
    },
    student_admission_type: {
      type: DataTypes.ENUM('regular', 'transfer', 'international')
    },
    student_high_school_origin: {
      type: DataTypes.STRING(100)
    },
    student_baccalaureate_year: {
      type: DataTypes.INTEGER
    },
    student_baccalaureate_series: {
      type: DataTypes.STRING(50)
    }
  }, {
    tableName: 'students',
    timestamps: false
  });

  Student.associate = function(models) {
    Student.belongsTo(models.Person, { foreignKey: 'person_id' });
    Student.belongsTo(models.University, { foreignKey: 'university_id' });
    Student.hasMany(models.StudentCard, { foreignKey: 'student_id' });
    Student.hasMany(models.StudentRegistration, { foreignKey: 'student_id' });
    Student.hasMany(models.Grade, { foreignKey: 'student_id' });
  };

  return Student;
};