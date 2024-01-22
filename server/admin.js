import AdminJS from "adminjs";
import AdminJSExpress from '@adminjs/express';

// commonjs
const AdminJSSequelize = require('@adminjs/sequelize')
const Sequelize = require('sequelize');

// esm
// import AdminJSSequelize from '@adminjs/sequelize';
// import { Sequelize } from 'sequelize';

admin = {}

admin.setup = function(app) {

    AdminJS.registerAdapter(AdminJSSequelize)
    //const db = require('../models');
    const db = new Sequelize('postgres://'+
                             process.env.DB_USER+':'+
                             process.env.DB_PASS+'@'+
                             process.env.DB_HOST+'/'+
                             process.env.DB_DATABASE) 

    const adminJs = new AdminJS({
        databases: [db],
        rootPath: '/admin',
        resources: [
            {
                resource: require('./models/network_nodes')(db, Sequelize.DataTypes),
                options: {
                    listProperties: ['label', 'type', 'tags', 'climate_hazard', 'disease_injury_wellbeing']
                }
            },
            {
                resource: require('./models/network_edges')(db, Sequelize.DataTypes),
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
            },
            {
                resource: require('./models/articles')(db, Sequelize.DataTypes)
            },
            {
                resource: require('./models/node_article_mapping')(db, Sequelize.DataTypes)
            },
            {
                resource: require('./models/edge_article_mapping')(db, Sequelize.DataTypes)
            },

        ],
        locale: {
            translations: {
                labels: {
                    "network_nodes": 'Nodes',
                    "network_edges": 'Connections',
                    "edge_article_mapping": 'Connection Article Mapping',
                    "unsdgs": "UN SDGs",
                }
            }
        },
        branding: {
            companyName: "Local Climate Tool Admin",
            logo: false,
        },
        dashboard: {
            handler: async () => {
                
            },
            component: AdminJS.bundle('./dashboard')
        },
    })

    adminJs.watch()
    
    const adminRouter = AdminJSExpress.buildRouter(adminJs)

    app.use(adminJs.options.rootPath, (req, res, next) => {
        const auth = {login: process.env.ADMIN_LOGIN, password: process.env.ADMIN_PASS} // change this        
        // parse login and password from headers
        const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
        const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
        
        if (login && password && login === auth.login && password === auth.password) {
            // Access granted...
            return next()
        }
        
        // Access denied...
        res.set('WWW-Authenticate', 'Basic realm="401"') // change this
        res.status(401).send('Authentication required.') // custom message        
    })

    app.use(adminJs.options.rootPath, adminRouter)
    //app.listen(3000, () => console.log('AdminJS is under localhost:8080/admin'))
}

export default admin;
