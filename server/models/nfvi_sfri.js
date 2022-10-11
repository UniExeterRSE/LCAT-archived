const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nfvi_sfri', {
    gid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(254),
      allowNull: true
    },
    code_1: {
      type: DataTypes.STRING(254),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(254),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(254),
      allowNull: true
    },
    nvfi: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    nvfi_sus: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    nvfi_prp: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    nvfi_res: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    nvfi_rec: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    nvfi_com: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    age: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    health: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    income: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    info: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    loc_know: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    tenure: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    mobility: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    crime: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    house_typ: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    flood_exp: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    service: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    soc_net: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    a1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    a2: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    h1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    h2: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    i1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    i2: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    i3: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    i4: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    i5: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    f1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    f2: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    k1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    t1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    t2: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    m1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    m2: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    m3: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    c1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    l1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    e1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    s1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    s2: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    s3: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    s4: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    n1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    n2: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    n3: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfripfcg: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfripfci: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfri2fcg: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfri2fci: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfri4fcg: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfri4fci: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfripswg: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfripswi: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfri2swg: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfri2swi: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfri4swg: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfri4swi: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sfrcpfcg: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    sfrcpfci: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    sfrc2fcg: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    sfrc2fci: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    sfrc4fcg: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    sfrc4fci: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    sfrcpswg: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    sfrcpswi: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    sfrc2swg: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    sfrc2swi: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    sfrc4swg: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    sfrc4swi: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    geom: {
      type: DataTypes.GEOMETRY('MULTIPOLYGON', 27700),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'nfvi_sfri',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "nfvi_sfri_geom_idx",
        fields: [
          { name: "geom" },
        ]
      },
      {
        name: "nfvi_sfri_pkey",
        unique: true,
        fields: [
          { name: "gid" },
        ]
      },
    ]
  });
};
