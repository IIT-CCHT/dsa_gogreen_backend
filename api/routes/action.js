const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ModelByEntity, Model } = require('../utils/evals');

router.post('/:entity/:action_name', async (req, res, next) => {

  const action_name = req.params.action_name;

  switch (action_name) 
  {

    case "populate-evaluations":
      const green_parameters = JSON.parse(JSON.stringify(await ModelByEntity("green_parameters").find()))
      const materials = await ModelByEntity("materials").find();
      for(let i=0; i<materials.length; i+=1)
      {
        const material = materials[i]
        for(let j=0; j<green_parameters.length; j+=1)
        {
          green_parameters[j].value =  Math.floor(Math.random() * 10) + 1
        }
        
        await Model(req).findByIdAndUpdate(
          {_id: material._id.toString()}, 
          {parameters: green_parameters}
        )
        
      }
      break

  }
  res.status(200).json({})
})

module.exports = router;