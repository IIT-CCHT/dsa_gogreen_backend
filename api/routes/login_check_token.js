const express = require('express');
const router = express.Router();
const { fbe, goCheckToken } = require('../utils');

router.post('/', async (req, res, next) => {

  const fields = fbe(req)
  const { access_token } = fields
  const obj = await goCheckToken(access_token)
  const { data } = obj
  res.status(data.status).send(obj) 
})

module.exports = router