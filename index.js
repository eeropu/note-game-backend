const express = require('express')
const path = require('path')
const app = express()

app.use(express.static('build'))
app.use(express.json())

const users = [
    {
        username: 'testi',
        password: 'sekret'
    }
]

app.post('/api/login', (req, res) => {
    const { username, password } = req.body
    if ( !username || !password 
        || users.find(user => user.username === username).password !== password ){
        res.status(400).json({ error: "Username or password was incorrect."})
    } else {
        res.status(200).json({ result: "credentials were correct"})
    }
})

app.post('/api/user', (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" })
    } else if (users.find(user => user.username === username)) {
        res.status(400).json({ error: "Username is already in use" })
    } else {
        users.push({ username, password })
        res.status(201).end()
    }
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/build/index.html'));
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running in port: ${PORT}`)
})
