const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// get method to find all tags and their associated products
router.get('/', async (req, res) => {
  try {
    const tagsData = await Tag.findAll({
      include: [
        {
          model: Product,
          through: {
            model: ProductTag
          }
        }
      ]
    })
    res.status(200).json(tagsData);
  }
  catch (err) {
    res.status(500).json(err);
  }
});

// get method to find tag by id
router.get('/:id', async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{
        model: Product,
        through: {
          model: ProductTag
        }
      }]
    })
    if (!tagData) {
      res.status(404).json({ message: 'No tag found for that id' });
      return;
    }
    res.status(200).json(tagData);
  }
  catch (err) {
    res.status(500).json(err);
  }
});

// post method to create a tag
router.post('/', async (req, res) => {
  try {
    const newTag = await Tag.create({
      tag_name: req.body.tag_name
    });
    res.status(200).json(newTag)
  }
  catch (err) {
    res.status(500).json(err);
  }
});

// put method to update tag name by its id
router.put('/:id', async (req,res)=>{
  const tagName = req.body.tag_name;
  try{
    const updateTag = await Tag.update({
      tag_name:tagName
    },
  {
   where:{
    id:req.params.id
   } 
  })
  if(updateTag > 0){
    res.status(200).json({message:`Tag updated successfully to ${tagName}`});
    return;
  }
  else{
    res.status(404).json({message:'No tag found for that id to update'})
  }
  }
  catch(err){
    console.log(err);
    res.status(500).json(err)
  }
})

// delete method for tag deletion by id
router.delete('/:id', async (req, res) => {
  try {
    const deleteTag = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });
    if (deleteTag > 0) {
      res.status(200).json({ message: 'Tag deleted successfully' });
      return;
    }
    else {
      res.status(404).json({ message: 'No tag found with that id to delete' });
    }
  }
  catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
