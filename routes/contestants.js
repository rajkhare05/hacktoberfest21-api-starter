const express = require('express')
const pool = require('../db')
const router = express.Router()

const { customAlphabet } = require('nanoid')
const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const nano = customAlphabet(alphabet, 5)

router.post('/', async (req, res) => {

    const {name, costumeTitle, costumeImgUrl, city, country} = req.body
    const _id = await nano() // creates a random short id

    await pool.query(
        "INSERT INTO CONTESTANTS VALUES ($1, $2, $3, $4, $5, $6, 0);"
    , [_id, name, costumeTitle, costumeImgUrl, city, country])
    
    res.status(201)
        .json({status: 'ok', id: _id})
})


// get details of all the contestants
router.get('/', async (req, res) => {

    const rawData = await pool.query('SELECT * FROM CONTESTANTS;')

    res.status(200)
        .json(rawData.rows)
})

module.exports = router
