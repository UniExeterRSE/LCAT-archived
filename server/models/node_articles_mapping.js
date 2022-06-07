const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('node_articles_mapping', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    node_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    article_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'node_articles_mapping',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "node_articles_mapping_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
