import mysql from 'mysql';
var pool = mysql.createPool({
    host: 'localhost',
    user: 'alek_db',
    password: '(&zjn$#2Z',
    database: 'slimprints'
});

export const createProject = async function(req) {
    return new Promise((resolve, reject) => {
        var sql = "INSERT INTO projects (uid, adminAddress, contractType, createdAt) VALUES (?, ?, ?, ?)";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [req.body.uid, req.body.adminAddress, req.body.contractType, req.body.createdAt], function(err, results) {
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                console.log('project is inserted');

                sql = "SELECT * FROM projects WHERE uid = ? and adminAddress = ?";
                connection.query(sql, [req.body.uid, req.body.adminAddress], function(err, results){
                    connection.release();
                    if (err) { 
                        console.log(err); 
                        return reject(err); 
                    }
                    console.log('return project ', results[0]);
                    return resolve(results[0]);
                });
            });
        });
    })
};

export const getProjectsByAdminAddress = async function(adminAddress) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM projects WHERE adminAddress = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [adminAddress], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }

                return resolve(results);
            });
        });
    })
};

export const getProjectByUid = async function(adminAddress, uid) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM projects WHERE adminAddress = ? AND uid = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [adminAddress, uid], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }

                return resolve(results[0]);
            });
        });
    })
};

export const deleteProject = async function(adminAddress, uid) {
    return new Promise((resolve, reject) => {
        var sql = "DELETE FROM projects WHERE adminAddress = ? AND uid = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [adminAddress, uid], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }

                return resolve(results);
            });
        });
    })
};

/*export const updateProject = async function(adminAddress, uid, data) {
    return new Promise((resolve, reject) => {
        var sql = "UPDATE applications SET ctaText = ?, testnetContractAddress = ?, productionContractAddress = ?, priceRuleId = ?, shopifyAPIKey = ?, \
            shopifySecretKey = ?, url = ?, shopifyAccessToken = ?, shopURL = ?, bannerBgColor = ?, ctaTextColor = ?, desiredBalance = ?, network = ?, \
            contractType = ?, adminAccessScope = ? WHERE adminAddress = ? AND uid = ?";

        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [data.ctaText, data.testnetContractAddress, data.productionContractAddress, data.priceRuleId, 
                data.shopifyAPIKey, data.shopifySecretKey, data.url, data.shopifyAccessToken, data.shopURL, data.bannerBgColor, data.ctaTextColor,
                data.desiredBalance, data.network, data.contractType, access_scopes, adminAddress, uid], function(err, results) {
                
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }

                return resolve(results);
            });
        });
    })
};*/