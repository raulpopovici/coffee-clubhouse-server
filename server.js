const cookieParser = require("cookie-parser")
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const cors=require("cors");
const userRouter = require("./Routes/users");
const app = express();

app.use(express.json()); //express. json() is a method inbuilt in express to recognize the incoming Request Object as a JSON Object
app.use(cookieParser());
app.use(
    cors({
        credentials: true,
        origin: "http://localhost:3000",
        optionsSuccessStatus: 200,
    })
);

app.use("/api",userRouter);

app.listen(process.env.PORT,()=>{
    console.log("Server running on port 5000")
})
