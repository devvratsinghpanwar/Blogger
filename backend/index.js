const express = require("express");
const path = require("path");
const cors = require("cors");
require('dotenv').config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.static(path.join(__dirname,'public')))

app.get('/',(req,res)=>{
    res.send("hello from backend")
})

app.use('/api/users',userRoutes)
app.use('/api/blogs',blogRoutes)

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
