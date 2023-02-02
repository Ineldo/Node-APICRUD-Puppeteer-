var ProductDb = require('../models/links');
var mongoose = require('mongoose');
const { default: puppeteer } = require('puppeteer');
const fs= require('fs');
var path = require('path');


// create and save new links 

exports.createLink = async (req, res) => {
    try {
      const { titulo, url, descricao,classificacao,preco,reviews,picture } = req.body;
       
      const  product=new ProductDb({
        titulo,
        url,
        descricao,
        classificacao: Math.floor(Math.random() * 10),
        preco,
        picture,
        reviews: Math.floor(Math.random() * 10)
      });
      const savedProduct = await product.save();
  
      res.redirect('/');
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

// fetch and return  links 
exports.findLink = async (req, res) => {
    try {
      
      const product = await ProductDb.find();
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  //to get just one link by id
  exports.getSingleLink = async (req, res) => {
   
  try {
    const { id } = req.params;
    const checkId= mongoose.Types.ObjectId(id)
    const product = await ProductDb.find({_id:checkId});
      res.status(200).json(product); 
    
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


// update link specified link id
exports.update = async (req, res) => {
  
    const { id } = req.params;
    const changes = req.body
    if(changes.titulo){  
      try{
          
        const updatedProduct = await ProductDb.findByIdAndUpdate(
          id,
          changes,
          { new: true }
        )
        console.log(updatedProduct)
        await updatedProduct.save();
        
        res.status(200).json(updatedProduct);
        
      } catch{
        res.status(404).json({ message:"did not update"})
      }
  }

};

// detele links with specified link id
exports.delete= async (req,res)=>{
  const id  = req.params;
  const changes = req.body
  const product = ProductDb.findOne({_id:mongoose.Types.ObjectId(id)});
 
  if(!product){
    res.status(404).json({ message:"did not find product"})
    return
  }else{
    try{
      await ProductDb.findOneAndDelete(product)
     
 
     res.status(200).json({message:`success${id}`});
   } catch{
     res.status(404).json({ message:"did not delete"})
   }
  }
       

}

async function scrape(){
    
  const urlink ="https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();
  await page.goto(urlink);
  
  const productDetailsList=await page.evaluate(()=>{
      //this will be executed in the browser

      //will get every url on the table
      const imageList = document.querySelectorAll('.thumbnail > img');
      const priceList = document.querySelectorAll('h4.price');
      const urlTextlist= document.querySelectorAll("a.title");
      const descricaoList = document.querySelectorAll("p.description");
      const reviewsList = document.querySelectorAll("p.pull-right");
      const classificacaoList= document.querySelectorAll("div.ratings > p:nth-child(2)")
      
      //transform nodelist in array
      const imageArray = [...imageList];
      const priceArray=[...priceList];
      const urlTextArray = [...urlTextlist];
      const descricaoArray = [...descricaoList];
      const reviewsArray=[...reviewsList];
      const classificacaoArray=[...classificacaoList];
      //console.log(urlTextArray)

      //transform those nodes in objects js
      const images = imageArray.map(img=>(img.src))
      const prices= priceArray.map(h4=>(h4.innerText))
      const text = urlTextArray.map(a=>(a.innerText))
      const descricao=descricaoArray.map(p=>(p.innerText))
      const url = urlTextArray.map(a=>(a.href))
      const reviews= reviewsArray.map(p=>(p.innerText))
      const classificacao=classificacaoArray.map(p=>(p.dataset.rating))
          
    var result = images.map((imagemSrc, i) => ({
      imagemSrc,
      preco:prices[i],
      titulo:text[i],
      descricao:descricao[i],
      url: url[i],
      review:reviews[i],
      classificacao:classificacao[i],
    }))
    var resultbyPrice=result.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
    

    function filterByValue(array, string) {
      return array.filter(o =>
          Object.keys(o).some(k => o[k].toLowerCase().includes(string.toLowerCase())));
    }
    const finalResult =filterByValue(resultbyPrice, 'Lenovo')
    
        
    return finalResult
  })
  /*storing all data scraped to a file */
  var wstream = fs.writeFileSync('./links.json', JSON.stringify(productDetailsList, null,1 ), 
  err =>{if (err)throw new Error("something went wrong")})
  wstream.end();
 
  await browser.close();
}
//scrape()


const importData = async () => {
  try {/*saving all data wrote in the file to our db */
    const data = JSON.parse(fs.readFileSync('./links.json', 'utf-8'))
    
    for(var i=0; i<data.length; i++) {
      if(data[i].titulo){
        await ProductDb.create({
          titulo:data[i].titulo,
          url:data[i].url,
          descricao:data[i].descricao,
          preco:data[i].preco,
          picture:data[i].imagemSrc,
          reviews:data[i].review,
          classificacao:data[i].classificacao
          })
      }
    }
    // to exit the process
    process.exit()
  } catch (error) {
    console.log('error', error)
  }
  
 }
//importData()