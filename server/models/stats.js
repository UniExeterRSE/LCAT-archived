const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('stats', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    key: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: "stats_key_key"
    },
    value: {
      type: DataTypes.REAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'stats',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "stats_key_key",
        unique: true,
        fields: [
          { name: "key" },
        ]
      },
      {
        name: "stats_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
