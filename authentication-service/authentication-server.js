import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import adminRouter from './routes/adminRoute.js';

// app config
const app = express()
const port = process.env.PORT || 4000

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints

app.use('/api/admin',adminRouter)

app.get('/',(reg,res)=>{
    res.send('API WORKING')
    })
    
    app.listen(port, ()=> console.log("Server Started",port))