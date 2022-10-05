const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('network_nodes', {
    node_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    label: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    climate_hazard: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    disease_injury_wellbeing: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icd11: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sector: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sdg: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    urban_rural: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vulnerabilities: {
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
