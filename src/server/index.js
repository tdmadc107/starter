require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API call

app.get('/manifest/:roverName', async (req, res) => {
    try {
        let roverName = req.params.roverName.toLowerCase();
        let manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ manifest })
    } catch (err) {
        console.log('manifest loading error:', err);
    }
})

app.get('/latestImg/:roverName/:earthDate', async (req, res) => {
    try {
        let roverName = req.params.roverName.toLowerCase();
        let earthDate = req.params.earthDate;
        let latestImg = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${earthDate}&api_key=${process.env.API_KEY}`)
            .then(res => res.json());
        res.send({ latestImg })
    } catch (err) {
        console.log('images loading error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))