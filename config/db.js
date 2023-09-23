const mongoose = require('mongoose')
const dotenv = require('dotenv').config();
const DATABASE_URL = process.env.DATABASE_URL

const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(DATABASE_URL, connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. ${err}`);
    })