const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('edge_article_mapping', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    edge_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'network_edges',
        key: 'edge_id'
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
    tableName: 'edge_article_mapping',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "edge_article_mapping_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
