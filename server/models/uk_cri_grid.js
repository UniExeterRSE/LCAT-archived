const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('uk_cri_grid', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    geom: {
      type: DataTypes.GEOMETRY('GEOMETRY', 27700),
      allowNull: true
    },
    properties: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'uk_cri_grid',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "uk_cri_grid_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
