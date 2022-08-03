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
    },
    imdscore: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    nvfi: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    nvfi_sus: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    nvfi_prp: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    nvfi_res: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    nvfi_rec: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    nvfi_com: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    age: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    health: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    income: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    info: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    loc_know: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    tenure: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    mobility: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    crime: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    house_typ: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    flood_exp: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    service: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    soc_net: {
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
    },
    nfvi: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    nfvi_sus: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    nfvi_prp: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    nfvi_res: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    nfvi_rec: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
    },
    nfvi_com: {
      type: DataTypes.REAL,
      allowNull: true,
      defaultValue: 0
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
