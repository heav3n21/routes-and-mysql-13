const router = require('express').Router();
// const { Category, Product } = require('../../models');
const Category = require('../../models/Category')
const Product = require('../../models/Product')

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  try {
    const categoriesProduct = await Category.findAll({
      include:[{model: Product}]
    });
    res.status(200).json(categoriesProduct)

  } catch (error) {
    res.status(500).json(error)

  }
  // find all categories
  // be sure to include its associated Products
});

router.get('/:id', async(req, res) => {
  try {
    const categoriesData = await Category.findByPk(req.params.id,{
      include:[{model: Product}]
    })
    res.status(200).json(categoriesData);
  } catch (error) {
    res.status(404).json({message: 'no id was found'})

    
  }
  // find one category by its `id` value
  // be sure to include its associated Products
});

router.post('/', async (req, res) => {
  try {
    const categoriesData = await Category.create(req.body);
    res.status(200).json(categoriesData)
    
  } catch (error) {
    res.status(400).json(err);
  }

  // create a new category
});

router.put('/:id', async (req, res) => {
  try {
    
    const categoriesData = await Category.update(
      {
      category_name: req.body.category_name,
      },
      {
      where: {
        id: req.params.id,
      },
    }
    );
    res.json(categoriesData)
  } catch (error) {
    res.status(404).send('couldnt find this category')
    
  }
  // Gets a book based on the book_id given in the request parameters
  // update a category by its `id` value
});

router.delete('/:id', async (req, res) => {
  try {
    const categoriesData = Category.destroy({
      where:{
        id: req.params.id
      }
    });
    if (!categoriesData) {
      res.status(404).json({message: 'no category with that name was found'});
      return;
      
    }
    res.status(200).json(categoriesData);
  } catch (error) {
    res.status(500).json(error);
    
  }
  // delete a category by its `id` value
});

module.exports = router;
