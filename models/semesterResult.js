const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SemesterResult = sequelize.define('SemesterResult', {
    semester_result_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    registration_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    semester_average: {
      type: DataTypes.DECIMAL(4, 2)
    },
    semester_credits_earned: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    semester_decision: {
      type: DataTypes.ENUM('Admitted', 'Admitted with compensation', 'Repeat', 'Deferred')
    },
    semester_ranking: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'semester_results',
    timestamps: false
  });

  SemesterResult.associate = function(models) {
    SemesterResult.belongsTo(models.StudentRegistration, { foreignKey: 'registration_id' });
    SemesterResult.belongsTo(models.Semester, { foreignKey: 'semester_id' });
  };

  return SemesterResult;
};