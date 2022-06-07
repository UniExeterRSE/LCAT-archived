const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('network_edges', {
    edge_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    unsdgs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    operator: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    variable: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    direction: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    node_from: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'network_nodes',
        key: 'node_id'
      }
    },
    node_to: {
      type: DataTypes.INTEGER,
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
