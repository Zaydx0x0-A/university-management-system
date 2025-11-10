const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Semester = sequelize.define('Semester', {
    semester_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    semester_specialization: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    semester_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    semester_name: {
      type: DataTypes.STRING(50)
    },
    semester_credits: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    semester_academic_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'semesters',
    timestamps: false
  });

  Semester.associate = function(models) {
    Semester.belongsTo(models.Specialization, { foreignKey: 'specialization_id' });
    Semester.hasMany(models.TeachingUnit, { foreignKey: 'semester_id' });
    Semester.hasMany(models.SemesterResult, { foreignKey: 'semester_id' });
  };

  return Semester;
};