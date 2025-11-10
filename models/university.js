const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const University = sequelize.define('University', {
    university_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    university_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    university_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    university_address: {
      type: DataTypes.TEXT
    },
    university_city: {
      type: DataTypes.STRING(50)
    },
    university_phone: {
      type: DataTypes.STRING(20)
    },
    university_email: {
      type: DataTypes.STRING(100)
    },
    university_establishment_date: {
      type: DataTypes.DATE
    },
    university_status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      defaultValue: 'pending'
    },
    university_registration_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'universities',
    timestamps: false
  });

  University.associate = function(models) {
    University.hasMany(models.User, { foreignKey: 'university_id' });
    University.hasMany(models.Student, { foreignKey: 'university_id' });
    University.hasMany(models.Program, { foreignKey: 'university_id' });
    University.hasMany(models.News, { foreignKey: 'university_id' });
    University.hasMany(models.Competition, { foreignKey: 'university_id' });
  };

  return University;
};