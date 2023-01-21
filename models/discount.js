import mysql from 'mysql';
var pool = mysql.createPool({
    host: 'localhost',
    user: 'alek_db',
    password: '(&zjn$#2Z',
    database: 'slimprints'
});

export const getDiscountCount = async function(wallet_address) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT COUNT(*) as Count FROM discounts WHERE wallet_address = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [wallet_address], function(err, results) {
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

export const saveNewDiscount = async function(wallet_address, new_discount) {
    return new Promise((resolve, reject) => {
        var sql = "INSERT INTO discounts (wallet_address, discount_code) VALUES (?, ?)";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err); 
            }
            connection.query(sql, [wallet_address, new_discount], function(err, results) {
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