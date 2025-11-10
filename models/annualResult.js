const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AnnualResult = sequelize.define('AnnualResult', {
    annual_result_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    registration_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    academic_year: {
      type: DataTypes.STRING(9),
      allowNull: false
    },
    annual_average: {
      type: DataTypes.DECIMAL(4, 2)
    },
    annual_credits_earned: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    board_decision: {
      type: DataTypes.ENUM('Admitted', 'Repeat', 'Deferred', 'Expelled', 'Conditional Pass')
    },
    honors: {
      type: DataTypes.ENUM('Satisfactory', 'Fair', 'Good', 'Very Good')
    },
    annual_ranking: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'annual_results',
    timestamps: false
  });

  AnnualResult.associate = function(models) {
    AnnualResult.belongsTo(models.StudentRegistration, { foreignKey: 'registration_id' });
  };

  return AnnualResult;
};