import mysql from 'mysql';
var pool = mysql.createPool({
    host: 'localhost',
    user: '',
    password: '',
    database: ''
});

export const createApplication = async function(req) {
    return new Promise((resolve, reject) => {
        var sql = "INSERT INTO applications (uid, adminAddress, type, createdAt) VALUES (?, ?, ?, ?)";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [req.body.uid, req.body.adminAddress, req.body.type, req.body.createdAt], function(err, results) {
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                console.log('application is inserted');


                sql = "SELECT * FROM applications WHERE uid = ? AND adminAddress = ?";
                connection.query(sql, [req.body.uid, req.body.adminAddress], function(err, results){
                    connection.release();
                    if (err) { 
                        console.log(err); 
                        return reject(err); 
                    }
                    console.log('return application ', results[0]);
                    return resolve(results[0]);
                });
            });
        });
    })
};

export const getApplicationsByAdminAddress = async function(adminAddress) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM applications WHERE adminAddress = ?";
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

export const getApplicationsByUid = async function(adminAddress, uid) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM applications WHERE uid = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [uid], function(err, results) {
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

export const deleteApplication = async function(adminAddress, uid) {
    return new Promise((resolve, reject) => {
        var sql = "DELETE FROM applications WHERE adminAddress = ? AND uid = ?";
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

export const updateApplication = async function(adminAddress, uid, access_scopes, data) {
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

export const getBannerInfo = async function(adminAddress, uid) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT ctaText, bannerBgColor, ctaTextColor, url FROM applications WHERE uid = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [uid], function(err, results) {
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