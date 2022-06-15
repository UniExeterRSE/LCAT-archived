const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('msoa_grid_mapping', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    geo_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tile_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'msoa_grid_mapping',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "msoa_grid_mapping_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
