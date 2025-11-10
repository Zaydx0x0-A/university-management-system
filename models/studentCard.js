const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StudentCard = sequelize.define('StudentCard', {
    card_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    card_student: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    card_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    card_qr_code: {
      type: DataTypes.TEXT
    },
    card_issue_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    card_expiration_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    card_status: {
      type: DataTypes.ENUM('active', 'inactive', 'renewed', 'lost', 'stolen'),
      defaultValue: 'active'
    },
    card_request_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    request_type: {
      type: DataTypes.ENUM('creation', 'renewal', 'replacement'),
      defaultValue: 'creation'
    }
  }, {
    tableName: 'student_cards',
    timestamps: false
  });

  StudentCard.associate = function(models) {
    StudentCard.belongsTo(models.Student, { foreignKey: 'student_id' });
  };

  return StudentCard;
};