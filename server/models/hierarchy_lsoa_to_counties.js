const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('hierarchy_lsoa_to_counties', {
    county: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lsoa: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'hierarchy_lsoa_to_counties',
    schema: 'public',
    timestamps: false
  });
};
