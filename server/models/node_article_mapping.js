const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('node_article_mapping', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    node_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'network_nodes',
        key: 'node_id'
      }
    },
    article_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'articles',
        key: 'article_id'
      }
    }
  }, {
    sequelize,
    tableName: 'node_article_mapping',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "node_article_mapping_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
