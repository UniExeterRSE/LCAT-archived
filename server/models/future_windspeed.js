const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('future_windspeed', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    mean: {
      type: DataTypes.REAL,
      allowNull: true
    },
    max: {
      type: DataTypes.REAL,
      allowNull: true
    },
    min: {
      type: DataTypes.REAL,
      allowNull: true
    },
    zone: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'future_windspeed',
    schema: 'public',
    timestamps: false
  });
};
