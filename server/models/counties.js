const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('counties', {
    gid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    objectid: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    ctyua16cd: {
      type: DataTypes.STRING(9),
      allowNull: true
    },
    ctyua16nm: {
      type: DataTypes.STRING(28),
      allowNull: true
    },
    ctyua16nmw: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    bng_e: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bng_n: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    long: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    lat: {
      type: DataTypes.DECIMAL,
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
      type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'counties',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "counties_geom_idx",
        fields: [
          { name: "geom" },
        ]
      },
      {
        name: "counties_pkey",
        unique: true,
        fields: [
          { name: "gid" },
        ]
      },
    ]
  });
};
