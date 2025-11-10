const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
    application_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    application_applicant: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    application_competition: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    application_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    application_status: {
      type: DataTypes.ENUM('pending', 'validated', 'rejected', 'selected'),
      defaultValue: 'pending'
    },
    application_file: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'applications',
    timestamps: false
  });

  Application.associate = function(models) {
    Application.belongsTo(models.Applicant, { foreignKey: 'applicant_id' });
    Application.belongsTo(models.Competition, { foreignKey: 'competition_id' });
  };

  return Application;
};