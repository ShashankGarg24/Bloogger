const express = require('express')
const cors = require("cors");
const blogRouting = require('./routes/blogs')
const db = require('./db')
const app = express()


app.listen(8080, ()=>{
    console.log("Server Started at port 8080....")
})

const corsOptions = {
    origin: 'http://localhost:3000',
  
    methods: [
      'GET',
      'POST',
    ],
  
    allowedHeaders: [
      'Content-Type',
    ],
  };

app.use(cors(corsOptions)) 
app.use(express.json())
app.use('/blogs', blogRouting)