const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 4000

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200)
        .json({status: 'ok'})
})

app.use('/contestants', require(path.join(__dirname, 'routes/contestants.js')))

app.listen(PORT, () => {
    console.log(`listening: http://${HOST}:${PORT}/`)
})
