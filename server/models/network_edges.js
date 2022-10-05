const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('network_edges', {
    edge_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    node_from: {
      type: DataTypes.TEXT,
      allowNull: true,
      references: {
        model: 'network_nodes',
        key: 'node_id'
      }
    },
    node_to: {
      type: DataTypes.TEXT,
      allowNull: true,
      references: {
        model: 'network_nodes',
        key: 'node_id'
      }
    }
  }, {
    sequelize,
    tableName: 'network_edges',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "network_edges_pkey",
        unique: true,
        fields: [
          { name: "edge_id" },
        ]
      },
    ]
  });
};
