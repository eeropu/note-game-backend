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
const Result = require('./models/result')
const saltRounds = 10

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

app.get('/api/results', async (req, res) => {
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const results = await Result.find({ user: decodedToken.id })
    res.status(200).json(results)
})

app.get('/api/result/:key/:position', async (req, res) => {
    const key = req.params.key
    const position = req.params.position
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const result = await Result.findOne({ user: decodedToken.id, key, position })
    if (result) {
        res.status(200).json(result)
    } else {
        res.status(404).json({ error: "Not found" })
    }
})

app.post('/api/result', async (req, res) => {
    const { key, position, time, date } = req.body
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const result = new Result({
        key,
        position,
        time,
        date,
        user: decodedToken.id
    })

    result.save().then(response => {
        res.status(200).json(response)
    }).catch(error => {
        console.log(error)
        if (error.name === "ValidationError") {
            res.status(400).json({ error: error.message })
        } else {
            res.status(500).json({ error: "Server error" })
        }
    })
})

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
