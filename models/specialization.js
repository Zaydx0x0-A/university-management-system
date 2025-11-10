const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Specialization = sequelize.define('Specialization', {
    specialization_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    specialization_program: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    specialization_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    specialization_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    specialization_duration_years: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    specialization_total_credits: {
      type: DataTypes.INTEGER,
      defaultValue: 180
    },
    specialization_description: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'specializations',
    timestamps: false
  });

  Specialization.associate = function(models) {
    Specialization.belongsTo(models.Program, { foreignKey: 'program_id' });
    Specialization.hasMany(models.Semester, { foreignKey: 'specialization_id' });
    Specialization.hasMany(models.StudentRegistration, { foreignKey: 'specialization_id' });
  };

  return Specialization;
};