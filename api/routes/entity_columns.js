const express = require('express');
const router = express.Router();
const { getEntityFromReq } = require('../utils');
const { entities } = require(`../utils/entities`)


router.get('/:entity', async (req, res, next) => {
  try{
    const entityName = getEntityFromReq(req)
    const entityData = entities[entityName]
    const { layout } = entityData
    const { columns } = layout
    const data = {}
    data.columns = columns
    res.status(201).json(data)
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})



module.exports = router;