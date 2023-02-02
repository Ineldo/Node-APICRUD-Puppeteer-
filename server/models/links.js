const mongoose= require('mongoose');

//creation of database schema
const productSchema = new mongoose.Schema({
    
    titulo: {
        type: 'string',
        required: true
    },
    url: {
        type: 'string',
        required: true,
    },
    descricao: {
        type: 'string',
        required: false
    },
    classificacao:{
        type: 'string',
        required: false,
    },
    preco:{
        type: 'string',
        required: true,
    },
    picture:{
        Type:"string",
        required:false,
    },
    reviews:{
        type:"string",
        required:false,
        
    }


})

const ProductDb = mongoose.model("products", productSchema);
module.exports=ProductDb;