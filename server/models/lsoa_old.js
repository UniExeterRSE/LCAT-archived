const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('lsoa_old', {
    ogc_fid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    objectid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lsoa01cd: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lsoa01nm: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lsoa01nmw: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shape__area: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    shape__length: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    wkb_geometry: {
      type: DataTypes.GEOMETRY('GEOMETRY', 4326),
      allowNull: true
    },
    zone: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    imdscore: {
      type: DataTypes.REAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'lsoa_old',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "lsoa_pkey",
        unique: true,
        fields: [
          { name: "ogc_fid" },
        ]
      },
      {
        name: "lsoa_wkb_geometry_geom_idx",
        fields: [
          { name: "wkb_geometry" },
        ]
      },
    ]
  });
};
