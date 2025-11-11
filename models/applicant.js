const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Applicant = sequelize.define('Applicant', {
    applicant_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    applicant_person_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    applicant_application_code: {
      type: DataTypes.STRING(30),
      unique: true
    },
    applicant_created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'applicants',
    timestamps: false
  });

  Applicant.associate = function(models) {
    Applicant.belongsTo(models.Person, { foreignKey: 'person_id' });
    Applicant.hasMany(models.Application, { foreignKey: 'applicant_id' });
  };

  return Applicant;
};
