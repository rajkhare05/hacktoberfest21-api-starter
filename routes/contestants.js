const express = require('express')
const pool = require('../db')
const router = express.Router()

const { customAlphabet } = require('nanoid')
const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const nano = customAlphabet(alphabet, 5)

// add a new contestant
router.post('/', async (req, res) => {

    const rawData = req.body

    const data = {
        id: (rawData.id) ? rawData.id.trim() : nano(),
        name: rawData.name.trim(),
        costumeTitle: rawData.costumeTitle.trim(),
        costumeImgUrl: rawData.costumeImgUrl.trim(),
        city: rawData.city.trim(),
        country: rawData.country.trim(),
        votes: rawData.votes || 0
    }

    for (const prop in data) {
        if (typeof data[prop] === 'undefined') {

            return res.status(400).json({
                status: 'error',
                message: `${prop} should be a string`
            })

        } else if (typeof (data[prop]) === 'string') {
            if (prop == 'votes') {
                return res.status(400).json({
                    status: 'error',
                    message: 'votes should be number type'
                })
            }
            if (data[prop].length < 1) {
                return res.status(400).json({
                    status: 'error',
                    message: `${prop} length must be 1 or greater`
                })
            }
        }
    }
    await pool.query(
        "INSERT INTO CONTESTANTS VALUES ($1, $2, $3, $4, $5, $6, $7);"
        , [data.id, data.name, data.costumeTitle, data.costumeImgUrl, data.city, data.country, data.votes])

    res.status(201).json({ status: 'ok', id: data.id })
})


// get details of all the contestants
router.get('/', async (req, res) => {

    const rawData = await pool.query('SELECT * FROM CONTESTANTS;')
    const rows = rawData.rows
    const data = []
    rows.map(row => (
        data.push({
            id: row.id,
            name: row.name,
            costumeTitle: row.costumetitle,
            costumeImgUrl: row.costumeimgurl,
            city: row.city,
            country: row.country,
            votes: parseInt(row.votes)
        })
    ))

    res.status(200).json(data)
})

// get an added contestast (from id)
router.get('/:id', async (req, res) => {

    const _id = req.params.id

    const rawData = await pool.query(
        'SELECT * FROM CONTESTANTS WHERE ID = $1;'
        , [_id])

    if (!rawData.rowCount) {
        return res.status(404).json({
            status: 'error',
            message: 'Contestant not found'
        })
    }

    const row = rawData.rows[0]
    const data = {
        id: row.id,
        name: row.name,
        costumeTitle: row.costumetitle,
        costumeImgUrl: row.costumeimgurl,
        city: row.city,
        country: row.country,
        votes: parseInt(row.votes)
    }

    res.status(200).json(data)
})

// update an added contestant
router.patch('/:id', async (req, res) => {

    const id = req.params.id
    const rawData = await pool.query(
        'SELECT * FROM CONTESTANTS WHERE ID = $1;'
        , [id])

    if (!rawData.rowCount)
        return res.status(404).json({
            status: 'error',
            message: 'Contestant not found'
        })

    const body = req.body

    for (const prop in body) {
        if (prop == 'votes' || prop == 'id') {
            return res.status(400).json({
                status: 'error',
                message: 'cannot update'
            })
        }
        else if (typeof body[prop] === 'undefined') {
            return res.status(400).json({
                status: 'error',
                message: `${prop} should be a string`
            })

        } else if (typeof (body[prop]) === 'string') {
            if (body[prop].length < 1) {
                return res.status(400).json({
                    status: 'error',
                    message: `${prop} length must be 1 or greater`
                })
            }
        }
    }
    for (const props in body) {
        await pool.query(
            `UPDATE CONTESTANTS SET ${props} = $1 WHERE ID = $2;`
            , [body[props], id])
    }
    res.status(200).json({ status: 'ok' })
})

// update votes of the contestant
router.patch('/:id/upvote', async (req, res) => {

    const id = req.params.id

    const rawData = await pool.query(
        'SELECT VOTES FROM CONTESTANTS WHERE ID = $1;'
        , [id])

    if (!rawData.rowCount)
        return res.status(404).json({
            status: 'error',
            message: 'Contestant not found'
        })

    const _votes = parseInt(rawData.rows[0].votes) + 1

    await pool.query(
        'UPDATE CONTESTANTS SET VOTES = VOTES + 1 WHERE ID = $1;'
        , [id])

    res.status(200).json({ status: 'ok', votes: _votes })
})

// delete a contestant
router.delete('/:id', async (req, res) => {

    const id = req.params.id

    const rawData = await pool.query(
        'DELETE FROM CONTESTANTS WHERE ID = $1;'
        , [id])

    if (!rawData.rowCount)
        return res.status(404).json({
            status: 'error',
            message: 'Contestant not found'
        })

    res.status(200).json({ status: 'ok' })
})

module.exports = router
