const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const News = sequelize.define('News', {
    news_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    news_university: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    news_title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    news_content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    news_publication_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    news_type: {
      type: DataTypes.ENUM('information', 'event', 'training_offer'),
      allowNull: false
    },
    news_status: {
      type: DataTypes.ENUM('published', 'draft'),
      defaultValue: 'draft'
    }
  }, {
    tableName: 'news',
    timestamps: false
  });

  News.associate = function(models) {
    News.belongsTo(models.University, { foreignKey: 'university_id' });
  };

  return News;
};