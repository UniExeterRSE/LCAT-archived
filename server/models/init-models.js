var DataTypes = require("sequelize").DataTypes;
var _articles = require("./articles");
var _counties = require("./counties");
var _counties_grid_mapping = require("./counties_grid_mapping");
var _edge_article_mapping = require("./edge_article_mapping");
var _edge_articles_mapping = require("./edge_articles_mapping");
var _hadgem_rcp85_rain_ann = require("./hadgem_rcp85_rain_ann");
var _hadgem_rcp85_rain_djf = require("./hadgem_rcp85_rain_djf");
var _hadgem_rcp85_rain_jja = require("./hadgem_rcp85_rain_jja");
var _hadgem_rcp85_tavg_ann = require("./hadgem_rcp85_tavg_ann");
var _hadgem_rcp85_tavg_djf = require("./hadgem_rcp85_tavg_djf");
var _hadgem_rcp85_tavg_jja = require("./hadgem_rcp85_tavg_jja");
var _hadgem_rcp85_tmax_ann = require("./hadgem_rcp85_tmax_ann");
var _hadgem_rcp85_tmax_djf = require("./hadgem_rcp85_tmax_djf");
var _hadgem_rcp85_tmax_jja = require("./hadgem_rcp85_tmax_jja");
var _hadgem_rcp85_tmin_ann = require("./hadgem_rcp85_tmin_ann");
var _hadgem_rcp85_tmin_djf = require("./hadgem_rcp85_tmin_djf");
var _hadgem_rcp85_tmin_jja = require("./hadgem_rcp85_tmin_jja");
var _hierachy_lsoa_to_msoa = require("./hierachy_lsoa_to_msoa");
var _hierarchy_lsoa_to_counties = require("./hierarchy_lsoa_to_counties");
var _hierarchy_lsoa_to_msoa = require("./hierarchy_lsoa_to_msoa");
var _lsoa = require("./lsoa");
var _lsoa_grid_mapping = require("./lsoa_grid_mapping");
var _msoa = require("./msoa");
var _msoa_grid_mapping = require("./msoa_grid_mapping");
var _network_edges = require("./network_edges");
var _network_nodes = require("./network_nodes");
var _nfvi_sfri = require("./nfvi_sfri");
var _node_article_mapping = require("./node_article_mapping");
var _node_articles_mapping = require("./node_articles_mapping");
var _stats = require("./stats");
var _uk_cri_grid = require("./uk_cri_grid");

function initModels(sequelize) {
  var articles = _articles(sequelize, DataTypes);
  var counties = _counties(sequelize, DataTypes);
  var counties_grid_mapping = _counties_grid_mapping(sequelize, DataTypes);
  var edge_article_mapping = _edge_article_mapping(sequelize, DataTypes);
  var edge_articles_mapping = _edge_articles_mapping(sequelize, DataTypes);
  var hadgem_rcp85_rain_ann = _hadgem_rcp85_rain_ann(sequelize, DataTypes);
  var hadgem_rcp85_rain_djf = _hadgem_rcp85_rain_djf(sequelize, DataTypes);
  var hadgem_rcp85_rain_jja = _hadgem_rcp85_rain_jja(sequelize, DataTypes);
  var hadgem_rcp85_tavg_ann = _hadgem_rcp85_tavg_ann(sequelize, DataTypes);
  var hadgem_rcp85_tavg_djf = _hadgem_rcp85_tavg_djf(sequelize, DataTypes);
  var hadgem_rcp85_tavg_jja = _hadgem_rcp85_tavg_jja(sequelize, DataTypes);
  var hadgem_rcp85_tmax_ann = _hadgem_rcp85_tmax_ann(sequelize, DataTypes);
  var hadgem_rcp85_tmax_djf = _hadgem_rcp85_tmax_djf(sequelize, DataTypes);
  var hadgem_rcp85_tmax_jja = _hadgem_rcp85_tmax_jja(sequelize, DataTypes);
  var hadgem_rcp85_tmin_ann = _hadgem_rcp85_tmin_ann(sequelize, DataTypes);
  var hadgem_rcp85_tmin_djf = _hadgem_rcp85_tmin_djf(sequelize, DataTypes);
  var hadgem_rcp85_tmin_jja = _hadgem_rcp85_tmin_jja(sequelize, DataTypes);
  var hierachy_lsoa_to_msoa = _hierachy_lsoa_to_msoa(sequelize, DataTypes);
  var hierarchy_lsoa_to_counties = _hierarchy_lsoa_to_counties(sequelize, DataTypes);
  var hierarchy_lsoa_to_msoa = _hierarchy_lsoa_to_msoa(sequelize, DataTypes);
  var lsoa = _lsoa(sequelize, DataTypes);
  var lsoa_grid_mapping = _lsoa_grid_mapping(sequelize, DataTypes);
  var msoa = _msoa(sequelize, DataTypes);
  var msoa_grid_mapping = _msoa_grid_mapping(sequelize, DataTypes);
  var network_edges = _network_edges(sequelize, DataTypes);
  var network_nodes = _network_nodes(sequelize, DataTypes);
  var nfvi_sfri = _nfvi_sfri(sequelize, DataTypes);
  var node_article_mapping = _node_article_mapping(sequelize, DataTypes);
  var node_articles_mapping = _node_articles_mapping(sequelize, DataTypes);
  var stats = _stats(sequelize, DataTypes);
  var uk_cri_grid = _uk_cri_grid(sequelize, DataTypes);

  edge_article_mapping.belongsTo(articles, { as: "article", foreignKey: "article_id"});
  articles.hasMany(edge_article_mapping, { as: "edge_article_mappings", foreignKey: "article_id"});
  node_article_mapping.belongsTo(articles, { as: "article", foreignKey: "article_id"});
  articles.hasMany(node_article_mapping, { as: "node_article_mappings", foreignKey: "article_id"});
  edge_article_mapping.belongsTo(network_edges, { as: "edge", foreignKey: "edge_id"});
  network_edges.hasMany(edge_article_mapping, { as: "edge_article_mappings", foreignKey: "edge_id"});
  network_edges.belongsTo(network_nodes, { as: "node_from_network_node", foreignKey: "node_from"});
  network_nodes.hasMany(network_edges, { as: "network_edges", foreignKey: "node_from"});
  network_edges.belongsTo(network_nodes, { as: "node_to_network_node", foreignKey: "node_to"});
  network_nodes.hasMany(network_edges, { as: "node_to_network_edges", foreignKey: "node_to"});
  node_article_mapping.belongsTo(network_nodes, { as: "node", foreignKey: "node_id"});
  network_nodes.hasMany(node_article_mapping, { as: "node_article_mappings", foreignKey: "node_id"});

  return {
    articles,
    counties,
    counties_grid_mapping,
    edge_article_mapping,
    edge_articles_mapping,
    hadgem_rcp85_rain_ann,
    hadgem_rcp85_rain_djf,
    hadgem_rcp85_rain_jja,
    hadgem_rcp85_tavg_ann,
    hadgem_rcp85_tavg_djf,
    hadgem_rcp85_tavg_jja,
    hadgem_rcp85_tmax_ann,
    hadgem_rcp85_tmax_djf,
    hadgem_rcp85_tmax_jja,
    hadgem_rcp85_tmin_ann,
    hadgem_rcp85_tmin_djf,
    hadgem_rcp85_tmin_jja,
    hierachy_lsoa_to_msoa,
    hierarchy_lsoa_to_counties,
    hierarchy_lsoa_to_msoa,
    lsoa,
    lsoa_grid_mapping,
    msoa,
    msoa_grid_mapping,
    network_edges,
    network_nodes,
    nfvi_sfri,
    node_article_mapping,
    node_articles_mapping,
    stats,
    uk_cri_grid,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
