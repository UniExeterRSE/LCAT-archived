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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    unsdgs: {
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
