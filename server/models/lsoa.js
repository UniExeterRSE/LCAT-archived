const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('lsoa', {
    gid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    lsoa11cd: {
      type: DataTypes.STRING(9),
      allowNull: true
    },
    lsoa11nm: {
      type: DataTypes.STRING(254),
      allowNull: true
    },
    geom: {
      type: DataTypes.GEOMETRY('MULTIPOLYGON', 27700),
      allowNull: true
    },
    imdscore: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'lsoa',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "lsoa_geom_idx",
        fields: [
          { name: "geom" },
        ]
      },
      {
        name: "lsoa_pkey",
        unique: true,
        fields: [
          { name: "gid" },
        ]
      },
    ]
  });
};
