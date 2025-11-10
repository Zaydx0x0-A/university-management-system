const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Course = sequelize.define('Course', {
    course_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    course_unit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    course_teacher: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    course_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    course_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    course_total_hours: {
      type: DataTypes.INTEGER
    },
    course_lecture_hours: {
      type: DataTypes.INTEGER
    },
    course_tutorial_hours: {
      type: DataTypes.INTEGER
    },
    course_practical_hours: {
      type: DataTypes.INTEGER
    },
    course_coefficient: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false
    },
    course_credits: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    }
  }, {
    tableName: 'courses',
    timestamps: false
  });

  Course.associate = function(models) {
    Course.belongsTo(models.TeachingUnit, { foreignKey: 'unit_id' });
    Course.belongsTo(models.User, { foreignKey: 'teacher_id' });
    Course.hasMany(models.Grade, { foreignKey: 'course_id' });
  };

  return Course;
};