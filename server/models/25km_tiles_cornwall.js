const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('25km_tiles_cornwall', {
    ogc_fid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    wkb_geometry: {
      type: DataTypes.GEOMETRY('POLYGON', 4326),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: '25km_tiles_cornwall',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "25km_tiles_cornwall_pkey",
        unique: true,
        fields: [
          { name: "ogc_fid" },
        ]
      },
      {
        name: "25km_tiles_cornwall_wkb_geometry_geom_idx",
        fields: [
          { name: "wkb_geometry" },
        ]
      },
    ]
  });
};
