const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('articles', {
    article_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    doi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    link: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    authors: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    journal: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    issue: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'articles',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "articles_pkey",
        unique: true,
        fields: [
          { name: "article_id" },
        ]
      },
    ]
  });
};
