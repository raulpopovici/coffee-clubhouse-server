const {Router} = require("express");
const pool = require("../database/config");


const addToCart = async(req, res) => {
    const{
        fk_user_id,
        fk_product_id
    } = req.body

    try {
        const addProduct = await pool.query("INSERT INTO shoppingcarts(fk_user_id,fk_products_id) VALUES ($1,$2) RETURNING *",[fk_user_id,fk_product_id]);
        return res.status(201).send(addProduct.rows[0]);
    }catch(error){

        
        return res.status(500).send({error:"error on add to the cart"});
    }
}

const getAllCartContent = async(req, res) => {

    const{
        userId
    } = req.params

    try{
        //const getContent = await pool.query("SELECT * FROM shoppingcarts WHERE fk_user_id = $1",[userId]);
        const getContent = await pool.query("SELECT * FROM products p JOIN shoppingcarts s ON p.id=s.fk_products_id WHERE fk_user_id = $1",[userId]);
        return res.status(201).send(getContent.rows);
    }catch{
        return res.status(500).send({error:"error on get cart content"});
    }
}

const deleteCartProduct = async(req,res) => {
    const {
        id
    } = req.params;
    try{
        const deleteProduct = await pool.query("DELETE FROM shoppingcarts WHERE shoppingcart_id = $1",[id]);
        return res.status(200).send(deleteProduct.rows);
    }catch(error){
        return res.status(500).send({error:"error deleting a product"});
    }
}

const deleteAllCartProducts = async(req,res) => {
    try{
        const deleteProduct = await pool.query("DELETE FROM shoppingcarts");
        return res.status(200).send(deleteProduct.rows);
    }catch(error){
        return res.status(500).send({error:"error deleting a product"});
    }
}

const router = Router();
router.post('/shoppingCart',addToCart);
router.get('/shoppingCartGetContent/:userId',getAllCartContent);
router.delete('/deleteCartProduct/:id',deleteCartProduct);
router.delete('/deleteAllCartProducts',deleteAllCartProducts)
module.exports = router;