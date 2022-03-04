const url = process.env.MONGODB_URL

const mongoose = require('mongoose')

mongoose.connect(url)

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: [3, "Username must be atleast 3 characters long"],
        required: true
    },
    passwordHash: String
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject.passwordHash
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('User', userSchema)