const express = require('express');
const router = express.Router();
const { texts } = require('../utils/texts');

router.get('/', async (req, res, next) => {
  try{
    res.status(201).json(texts)
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})



module.exports = router;