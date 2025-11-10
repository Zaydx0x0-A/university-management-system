const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Competition = sequelize.define('Competition', {
    competition_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    competition_university: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    competition_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    competition_type: {
      type: DataTypes.ENUM('bachelor', 'master', 'phd', 'specialized_school'),
      allowNull: false
    },
    competition_opening_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    competition_closing_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    competition_application_fee: {
      type: DataTypes.DECIMAL(8, 2)
    },
    competition_description: {
      type: DataTypes.TEXT  
    },
    competition_status: {
      type: DataTypes.ENUM('open', 'closed', 'ongoing'),
      defaultValue: 'open'
    }
  }, {
    tableName: 'competitions',
    timestamps: false
  });

  Competition.associate = function(models) {
    Competition.belongsTo(models.University, { foreignKey: 'university_id' });
    Competition.hasMany(models.Application, { foreignKey: 'competition_id' });
  };

  return Competition;
};