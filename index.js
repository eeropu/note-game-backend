const express = require('express')
const app = express()

app.use(express.static('build'))

app.get('/api/', (req, res) => {
    res.send('<h1>Moi</h1>')
})

app.get('*', (req, res) => {
    res.send('pöö')
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running in port: ${PORT}`)
})
