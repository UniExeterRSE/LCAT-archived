const AdminJS = require('adminjs')
const AdminJSExpress = require('@adminjs/express')
const AdminJSSequelize = require('@adminjs/sequelize')
const Sequelize = require('sequelize');

admin = {}

admin.setup = function(app) {

    AdminJS.registerAdapter(AdminJSSequelize)
    //const db = require('../models');
    const db = new Sequelize('postgres://climate_geo_data:onetwothree@localhost:5432/climate_geo_data') 

    const adminJs = new AdminJS({
        databases: [db],
        rootPath: '/admin',
        resources: [
            {
                resource: db.define('network_nodes', {
                    node_id: {
                        autoIncrement: true,
                        type: Sequelize.DataTypes.INTEGER,
                        allowNull: false,
                        primaryKey: true
                    },
                    name: {
                        type: Sequelize.DataTypes.STRING,
                        allowNull: true
                    },
                    details: {
                        type: Sequelize.DataTypes.STRING,
                        allowNull: true
                    }
                }, {
                    db,
                    tableName: 'network_nodes',
                    schema: 'public',
                    timestamps: false
                }),
            },
            {
                resource: db.define('network_edges', {
                    edge_id: {
                        autoIncrement: true,
                        type: Sequelize.DataTypes.INTEGER,
                        allowNull: false,
                        primaryKey: true
                    },
                    name: {
                        type: Sequelize.DataTypes.STRING,
                        allowNull: true
                    },
                    details: {
                        type: Sequelize.DataTypes.STRING,
                        allowNull: true
                    },
                    direction: {
                        type: Sequelize.DataTypes.INTEGER,
                        allowNull: true
                    },
                    node_from: {
                        type: Sequelize.DataTypes.INTEGER,
                        references: {
                            model: "network_nodes", 
                            key: 'node_id'
                        }
                    },
                    node_to: {
                        type: Sequelize.DataTypes.INTEGER,
                        references: {
                            model: "network_nodes", 
                            key: 'node_id'
                        }
                    },
                    
                }, {
                    db,
                    tableName: 'network_edges',
                    schema: 'public',
                    timestamps: false
                }),
                options: {
                    properties: {
                        direction: {
                            availableValues: [
                                {value: '0', label: '+'},
                                {value: '1', label: '-'},
                            ],
                        }
                    }
                }                        
            }
        ],
        branding: {
            companyName: "Local Climate Tool",
        },
        dashboard: {
            handler: async () => {
                
            },
            component: null //AdminJS.bundle('./dashboard')
        },
    })

    const adminRouter = AdminJSExpress.buildRouter(adminJs)
    app.use(adminJs.options.rootPath, adminRouter)
    app.listen(8080, () => console.log('AdminJS is under localhost:8080/admin'))
}

module.exports = admin
