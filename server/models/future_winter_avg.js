const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('future_winter_avg', {
    zone: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    value: {
      type: DataTypes.REAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'future_winter_avg',
    schema: 'public',
    timestamps: false
  });
};
