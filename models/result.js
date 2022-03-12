const url = process.env.MONGODB_URL
const mongoose = require('mongoose')

mongoose.connect(url)

const resultSchema = new mongoose.Schema({
    key: String,
    time: Number,
    date: Date,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

resultSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Results', resultSchema)