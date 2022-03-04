require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()

app.use(express.static('build'))
app.use(express.json())

app.use(cors({
    origin: "http://localhost:3000"
}))

const User = require('./models/user')
const saltRounds = 10

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ error: "Username or password was incorrect." })
    }
    try {
        const user = await User.findOne({ username })
        const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)
        if (user && passwordCorrect) {

            const userForToken = {
                username: user.username,
                id: user._id,
            }

            const token = jwt.sign(userForToken, process.env.SECRET)

            res.status(200).json({ token, username })
        } else {
            res.status(400).json({ error: "Username or password was incorrect." })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: "Server error" })
    }
})

app.post('/api/user', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" })
    }
    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be atleast 8 characters long" })
    }
    const usernameInUse = await User.findOne({ username })
    if (usernameInUse) {
        res.status(400).json({ error: "Username is already in use" })
    } else {
        const passwordHash = await bcrypt.hash(password, saltRounds)
        const user = new User({ username, passwordHash })
        user.save().then(result => {

            const userForToken = {
                username: result.username,
                id: result._id,
            }

            const token = jwt.sign(userForToken, process.env.SECRET)

            res.status(200).json({ token, username })
        }).catch(error => {
            if (error.name === "ValidationError") {
                res.status(400).json({ error: error.message })
            } else {
                res.status(500).json({ error: "Server error" })
            }
        })
    }
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running in port: ${PORT}`)
})
