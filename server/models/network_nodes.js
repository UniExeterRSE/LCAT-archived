const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('network_nodes', {
    node_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    variable: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    threshold: {
      type: DataTypes.REAL,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mdpseea: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    unsdg: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'network_nodes',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "network_nodes_pkey",
        unique: true,
        fields: [
          { name: "node_id" },
        ]
      },
    ]
  });
};
