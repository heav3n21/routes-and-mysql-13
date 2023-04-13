const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      include:[{model:Product, through: ProductTag,as: "tagsForProducts" }]
    });
    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }
    res.status(200).json(tagData)

  } catch (error) {
    res.status(500).json(error)

  }
  // find all tags
  // be sure to include its associated Product data
});

router.get('/:id',async  (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id,{
      include:[{model:Product, through: ProductTag,as: "tagsForProducts" }]
    });
    res.status(200).json(tagData)

  } catch (error) {
    res.status(500).json(error)

  }
  // find a single tag by its `id`
  // be sure to include its associated Product data
});

router.post('/', (req, res) => {
  Tag.create(req.body)
  .then((tag) => {
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          tag_id: tag.id,
          tag_id,
        };
      });
      return ProductTag.bulkCreate(productTagIdArr);
    }
    // if no product tags, just respond
    res.status(200).json(product);
  })
  .then((productTagIds) => res.status(200).json(productTagIds))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });

  // create a new tag
});

router.put('/:id', (req, res) => {
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags 
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
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
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
  // update a tag's name by its `id` value
});

router.delete('/:id', async(req, res) => {
  try {
    // Find any records in the product_tag table that reference the tag you want to delete
    const productTags = await ProductTag.findAll({
      where: {
        tag_id: req.params.id
      }
    });

    // If there are any records, delete them first
    if (productTags.length > 0) {
      await Promise.all(productTags.map(productTag => productTag.destroy()));
    }

    // Once all references have been deleted, delete the tag
    const deletedTag = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });

    // Return a success response with the deleted tag data
    if (deletedTag) {
      res.status(200).json({
        message: `Tag with id ${req.params.id} has been deleted`
      });
    } else {
      // If no tag was found with the specified ID, return a 404 response
      res.status(404).json({
        message: `Tag with id ${req.params.id} not found`
      });
    }
  } catch (error) {
    // Log the error and return a 500 response
    console.error(error);
    res.status(500).json(error);
  }
});

module.exports = router;
