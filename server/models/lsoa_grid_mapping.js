const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('lsoa_grid_mapping', {
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
    tableName: 'lsoa_grid_mapping',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "lsoa_grid_mapping_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
