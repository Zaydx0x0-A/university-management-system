const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_university: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_employee: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    user_first_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    user_last_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    user_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    user_phone: {
      type: DataTypes.STRING(20)
    },
    user_role: {
      type: DataTypes.ENUM('super_admin', 'academic_agent', 'teacher', 'program_director', 'technical_admin'),
      allowNull: false
    },
    user_hire_date: {
      type: DataTypes.DATE
    },
    user_status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'users',
    timestamps: false
  });

  User.associate = function(models) {
    User.belongsTo(models.University, { foreignKey: 'university_id' });
    User.hasMany(models.Course, { foreignKey: 'teacher_id' });
    User.hasMany(models.AuditLog, { foreignKey: 'user_id' });
  };

  return User;
};