const {Router} = require("express");
const pool = require("../database/config");

const createProduct = async(req, res) => {
    const {
        name,
        price,
        coffee_type,
        country_origin,
        image,
    } = req.body
    
    try{

        const createdProduct = await pool.query("INSERT INTO products(name,price,coffee_type,country_origin,image) VALUES ($1,$2,$3,$4,$5) RETURNING *",[name,price,coffee_type,country_origin,image]);
        return res.status(201).send(createdProduct.rows[0]);

    }catch(error){
        return res.status(500).send({error:"error on create product"})
    }
}

const getAllProducts = async(req, res) => {
    try{
        const getProducts = await pool.query("SELECT * FROM products");
        return res.status(200).send(getProducts.rows);
    }catch(error){
        return res.status(500).send({error:"error on get all users"});
    }
}

const deleteProduct = async(req,res) => {
    const {
        id
    } = req.params;
    try{
        const deleteProduct = await pool.query("DELETE FROM products WHERE id = $1",[id]);
        return res.status(200).send(deleteProduct.rows);
    }catch(error){
        return res.status(500).send({error:"error deleting a product"});
    }
}

const router = Router();
router.post('/store',createProduct);
router.get('/store/products',getAllProducts);
router.delete('/deleteProduct/:id',deleteProduct);
module.exports = router;