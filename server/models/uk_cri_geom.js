const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('uk_cri_geom', {
    ogc_fid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    target_fid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dataid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    value: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    wkb_geometry: {
      type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'uk_cri_geom',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "uk_cri_geom_pkey",
        unique: true,
        fields: [
          { name: "ogc_fid" },
        ]
      },
      {
        name: "uk_cri_geom_wkb_geometry_geom_idx",
        fields: [
          { name: "wkb_geometry" },
        ]
      },
    ]
  });
};
