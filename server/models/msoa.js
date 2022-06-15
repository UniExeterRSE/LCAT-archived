const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('msoa', {
    gid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    objectid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    msoa11cd: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    msoa11nm: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    msoa11nmw: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    st_areasha: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    st_lengths: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    geom: {
      type: DataTypes.GEOMETRY('MULTIPOLYGON', 27700),
      allowNull: true
    },
    uk_cri_location: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'msoa',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "msoa_geom_idx",
        fields: [
          { name: "geom" },
        ]
      },
      {
        name: "msoa_pkey",
        unique: true,
        fields: [
          { name: "gid" },
        ]
      },
    ]
  });
};
