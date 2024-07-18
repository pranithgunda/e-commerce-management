const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

// get method to find all categories and their associated products
router.get('/', async (req, res) => {
  try {
    const categoriesData = await Category.findAll({
      include: [
        {
          model: Product
        }
      ]
    });
    res.status(200).json(categoriesData);
  }
  catch (err) {
    res.status(500).json(err);
  }
});

// get method to find category by its id and its associated Products
router.get('/:id', async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Product
        }
      ]
    });
    if (!categoryData) {
      res.status(404).json({ message: 'No category found with that id' });
      return;
    }
    res.status(200).json(categoryData);
  }
  catch (err) {
    res.status(500).json(err);
  }
});

// post method to create a category
router.post('/', async (req, res) => {
  try {
    const newCategory = await Category.create({
      category_name: req.body.category_name
    });
    res.status(200).json(newCategory);
  }
  catch (err) {
    res.status(500).json(err);
  }
});

// put method to update a category by id
router.put('/:id', async (req, res) => {
  const categoryName = req.body.category_name;
  try {
    const updateCategory = await Category.update({
      category_name: req.body.category_name
    },
      {
        where: {
          id: req.params.id
        }
      })
    if (updateCategory > 0) {
      res.status(200).json({ message: `Category updated successfully to ${categoryName}` });
      return;
    }
    res.status(404).json({ message: 'No category found for that id to update' });
  }
  catch (err) {
    res.status(500).json(err);
  }

});

// delete method for category by id
router.delete('/:id', async (req, res) => {
  try {
    const deleteCategory = await Category.destroy({
      where: {
        id: req.params.id
      }
    })
    if (deleteCategory > 0) {
      res.status(200).json({ message: 'Category deleted successfully' });
      return;
    }
    else {
      res.status(404).json({ message: 'No category found with that id to delete' });
    }
  }
  catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
