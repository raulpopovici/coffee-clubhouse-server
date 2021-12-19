const {Router} = require("express");
const pool = require("../database/config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { Pool } = require("pg");

function validateEmail(email){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


const createUser = async (req,res) =>{
    const {
        username,
        password,
        confirmPassword,
        email,

    } = req.body


    try {

        if(password!== confirmPassword){
            return res.status(400).send({
                error:"pass does not match"
            })
        }

        if(validateEmail(email)===false){
            return res.status(400).send({
                error:"email is not valid"
            })

        }

        const hashPassword = await bcrypt.hash(password,8);
        const createdUser = await pool.query("INSERT INTO users(username,email,password) VALUES ($1,$2,$3) RETURNING username,email",[username,email,hashPassword]);
        return res.status(201).send(createdUser.rows[0]);

    } catch (error) {
        return res.status(500).send({
            error:"something went wrong"
        })  //internal server error
    }
}

const login = async(req,res) => {
    const {
        username,
        password
    } = req.body

    try{

        const dbRes = await pool.query("SELECT * FROM users WHERE username = $1",[username]);
        const user = dbRes.rows[0];
        const hashPassword = await bcrypt.compare(password,user.password);

        if(!hashPassword){
            return res.status(401).send({password : 'Invalid credentials'});
        }

        const token = jwt.sign({
            user
        },process.env.JWT_SECRET)

        res.set('Set-Cookie', cookie.serialize('token',token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600*24*30,
            path: '/'
        }))


        return res.status(201).send(dbRes.rows[0]);
    }catch(error){
        return res.status(500).send({error:"the login is not oke"});
    }
}

const me = async(req,res) => {
    try {
        const token = req.cookies.token;
        if(!token) return res.status(200).send({auth: false, user: null});

        const {user} = jwt.verify(token,process.env.JWT_SECRET);
        const dbRes = await pool.query("SELECT user_id,username,email FROM users WHERE username = $1",[user.username]);

        return res.status(200).send({auth:true,user: dbRes.rows[0]});
    } catch (err) {
        return res.status(500).send({error: "problem on me"})
    }
}


const getAll = async(req,res) => {
    try{
        const getUsers = await pool.query("SELECT * FROM users");
        return res.status(200).send(getUsers.rows);
    }catch(error){
        return res.status(500).send({error:"error on get all users"});
    }
}



const router = Router();

router.post('/register',createUser);
router.post('/login',login);
router.post('/me',me);
router.get('/store',getAll);
module.exports = router;