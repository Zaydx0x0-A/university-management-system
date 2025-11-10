const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Program = sequelize.define('Program', {
    program_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    program_university: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    program_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    program_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    program_level: {
      type: DataTypes.ENUM('Bachelor', 'Master', 'PhD'),
      allowNull: false
    },
    program_field: {
      type: DataTypes.STRING(100)
    },
    program_description: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'programs',
    timestamps: false
  });

  Program.associate = function(models) {
    Program.belongsTo(models.University, { foreignKey: 'university_id' });
    Program.hasMany(models.Specialization, { foreignKey: 'program_id' });
  };

  return Program;
};