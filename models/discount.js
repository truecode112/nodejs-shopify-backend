import mongoose from 'mongoose';

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

export default mongoose.model('Discount', discountSchema);