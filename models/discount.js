import mysql from 'mysql';
var pool = mysql.createPool({
    host: 'localhost',
    user: '',
    password: '',
    database: ''
});

export const getDiscountCount = async function(wallet_address, nft_contract_address, token_id, store) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT COUNT(*) as Count FROM discounts WHERE wallet_address = ? AND nft_contract_address = ? AND token_id = ? AND ((? - date_created) < 15*60*1000) AND store = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [wallet_address, nft_contract_address, token_id, Date.now(), store], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                return resolve(results[0].Count);
            });
        });
    })
};

export const getAvailableDiscount = async function(wallet_address, nft_contract_address, token_id, store) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT discount_code, discount_id, date_created FROM discounts WHERE wallet_address = ? AND nft_contract_address = ? AND token_id = ? AND usage_count = 0 AND ((? - date_created) < 15 * 60 * 1000) AND store = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [wallet_address, nft_contract_address, token_id, Date.now(), store], function(err, results) {
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

export const saveNewDiscount = async function(wallet_address, new_discount, new_discount_id, nft_contract_address, token_id, date_created, store) {
    return new Promise((resolve, reject) => {
        var sql = "INSERT INTO discounts (wallet_address, nft_contract_address, token_id, discount_code, discount_id, date_created, store) VALUES (?, ?, ?, ?, ?, ?, ?)";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err); 
            }
            connection.query(sql, [wallet_address, nft_contract_address, token_id, new_discount, new_discount_id, date_created, store], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                return resolve(results.insertId);
            });
        });
    });
}
/*
export const getAvailableDiscount = async function(wallet_address, nft_contract_address) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT discount_code, discount_id FROM discounts WHERE wallet_address = ? AND nft_contract_address = ? AND usage_count = 0";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err); 
            }
            connection.query(sql, [wallet_address, nft_contract_address], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                return resolve(results[0]);
            });
        });
    });
}
*/
export const updateDiscountUsage = async function(wallet_address, nft_contract_address, discount_code, discount_id, usage_count) {
    return new Promise((resolve, reject) => {
        var sql = "UPDATE discounts SET usage_count = ? WHERE wallet_address = ? AND nft_contract_address = ? AND discount_code = ? AND discount_id = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err); 
            }
            connection.query(sql, [usage_count, wallet_address, nft_contract_address, discount_code, discount_id], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                return resolve(results);
            });
        });
    });
}

export const deleteDiscountCode = async function(wallet_address, nft_contract_address, discount_code, discount_id) {
    return new Promise((resolve, reject) => {
        var sql = "DELETE FROM discounts WHERE wallet_address = ? AND nft_contract_address = ? AND discount_code = ? AND discount_id = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err); 
            }
            connection.query(sql, [wallet_address, nft_contract_address, discount_code, discount_id], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                return resolve(results);
            });
        });
    });
}

/*import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true
    },
    discount: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Discount', discountSchema);*/