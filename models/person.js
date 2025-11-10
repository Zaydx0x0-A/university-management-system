const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Person = sequelize.define('Person', {
    person_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    person_type: {
      type: DataTypes.ENUM('student', 'staff', 'applicant'),
      allowNull: false
    },
    person_national_id: {
      type: DataTypes.STRING(50),
      unique: true
    },
    person_first_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    person_last_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    person_birth_date: {
      type: DataTypes.DATE
    },
    person_birth_place: {
      type: DataTypes.STRING(100)
    },
    person_nationality: {
      type: DataTypes.STRING(50)
    },
    person_address: {
      type: DataTypes.TEXT
    },
    person_phone: {
      type: DataTypes.STRING(20)
    },
    person__email: {
      type: DataTypes.STRING(100)
    },
    person_gender: {
      type: DataTypes.ENUM('M', 'F')
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'persons',
    timestamps: false
  });

  Person.associate = function(models) {
    Person.hasOne(models.User, { foreignKey: 'person_id' });
    Person.hasOne(models.Student, { foreignKey: 'person_id' });
    Person.hasOne(models.Applicant, { foreignKey: 'person_id' });
  };

  return Person;
};