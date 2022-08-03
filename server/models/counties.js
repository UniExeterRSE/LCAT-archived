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
    },
    imdscore: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    a1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    a2: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    h1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    h2: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    i1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    i2: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    i3: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    i4: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    i5: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    f1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    f2: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    k1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    t1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    t2: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    m1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    m2: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    m3: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    c1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    l1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    e1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    s1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    s2: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    s3: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    s4: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    n1: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    n2: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    n3: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
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
