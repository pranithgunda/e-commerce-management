const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get method to find all products and their associated category and tag data
router.get('/', async (req, res) => {
  try {
    const productsData = await Product.findAll({
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
          through: {
            model: ProductTag,
          }
        }
      ]
    });
    res.status(200).json(productsData);
  }
  catch (err) {
    res.status(500).json(err);
  }
});

// get method to find product by its id, the category product belongs to and associated tags
router.get('/:id', async (req, res) => {
  try{
    const productData = await Product.findByPk(req.params.id,{
      include:[
        {
          model:Category
        },
        {
          model:Tag,
          through:{
            model:ProductTag
          }
        }
      ]
    });
    if(!productData){
      res.status(404).json({message:'No product found with that id'});
      return;
    }
    res.status(200).json(productData);
  }
  catch(err){
    res.status(500).json(err)
  }
});

// post method to create a new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    // returns an array of objects that were inserted into product_tag table
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// put method to update a product by id
router.put('/:id', (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          // productTagIds contain tag_id values that are already associated with product_id 
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          // newProductTags contain the tagIds that are new to this product, that came in the request
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// delete method for product deletion by id
router.delete('/:id', async (req, res) => {
  try{
    const deleteProduct = await Product.destroy({
      where:{
        id:req.params.id
      }
    })
    if(deleteProduct>0){
      res.status(200).json({message:'product deleted successfully'})
      return;
    }else{
      res.status(404).json({message:'No product found with that id to delete'})
    }
  }
  catch(err){
    res.status(500).json(err)
  }
});

module.exports = router;
