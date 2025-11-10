const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TeachingUnit = sequelize.define('TeachingUnit', {
    unit_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    unit_semester: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unit_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    unit_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    unit_credits: {
      type: DataTypes.INTEGER,
      defaultValue: 6
    },
    unit_type: {
      type: DataTypes.ENUM('Fundamental', 'Methodological', 'Transversal', 'Optional')
    }
  }, {
    tableName: 'teaching_units',
    timestamps: false
  });

  TeachingUnit.associate = function(models) {
    TeachingUnit.belongsTo(models.Semester, { foreignKey: 'semester_id' });
    TeachingUnit.hasMany(models.Course, { foreignKey: 'unit_id' });
  };

  return TeachingUnit;
};