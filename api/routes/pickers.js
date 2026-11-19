const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Models = require('../models');


router.post('/', async (req, res, next) => {
  try{

    const data = {}
    let { entityForPickers, sorts } = req.body
    if(entityForPickers.length === 1 && entityForPickers[0] === '*'){
      entityForPickers = []
      entityForPickers.push('materials')
    }
    if(sorts === undefined){
      sorts = []
    }
    for(let i=0; i<entityForPickers.length; i+=1){
      const entity = entityForPickers[i]
      let { sort } = sorts[i] || 'name'
      list = (await Models[entity].find({}).sort({sort:1}).lean().exec());

      // Remove LCA data from Materials
      if(entity === 'materials')
      {
        list.forEach(obj => {
          delete obj['lca_data'];
        });
        list = list.filter(obj => obj.active !== false);
      }

      if(entity === 'green_parameters')
      {
        list = list.filter(item => item.show === true)
      }

      if(entity === 'green_parameter_groups')
      {
        for(let g=0; g<list.length; g+=1)
        {
          const group = list[g]
          const { _id: group_id } = group
          const comparisons = await mongoose.connection.db.collection('green_parameters').find({ group_id: new mongoose.Types.ObjectId(group_id) }).toArray();
          let best_comparison = ""
          for(let co=0; co<comparisons.length; co+=1)
          {
            best_comparison = best_comparison === 'both' ? best_comparison : comparisons[co].comparison
          }
          group.comparison = best_comparison
        }
      }

      data[entity] = list
    }

    

    res.status(201).json(data)
  }
  catch (err) {
    if("code" in err){
      const { code, keyPattern } = err
      err.errors = {}
      const keys = Object.keys(keyPattern)
      for(let i=0; i<keys.length; i++){
        const key = keys[i]
        err.errors[key] = {}
        err.errors[key].message = ''
        switch(code){
          case 11000:
            err.errors[key].message = 'This email already exists in the archive. Please choose another one'
            break;
        }
      }
    }
    console.log('err', err)
    res.status(500).json({err})
  }
})



module.exports = router;