const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Models = require('../models');
const { calculateMaterialAssessments } = require('../utils/assessment')


router.post('/', async (req, res, next) => {
  try{
    const { treatments } = req.body
    let green_parametes_codes = []
    for(let i=0; i<treatments.length; i+=1)
    {
      const { material_ids } = treatments[i]
      treatments[i].assessments = {}
      const list = await calculateMaterialAssessments(material_ids)
      treatment_assessments = {}
      for(let j=0; j<list.length; j+=1)
      {
        const material = list[j]
        green_parametes_codes = Object.keys(material.assessments)
        for(let k=0; k<green_parametes_codes.length; k+=1)
        {
          const code = green_parametes_codes[k] 
          if(!(treatment_assessments.hasOwnProperty(code)))
          {
            treatment_assessments[code] = []
          }
          treatment_assessments[code].push(material.assessments[code])
        }
      }
      for(let c=0; c<green_parametes_codes.length; c+=1)
      {
        const code = green_parametes_codes[c]
        let sum = 0
        for(let a=0; a<treatment_assessments[code].length; a+=1)
        {
          const value = treatment_assessments[code][a]
          if(value === 'undefined')
          {
            sum = 0
            break
          }
          sum += value
        }
        treatments[i].assessments[code] = sum === 0 ? 'undefined' : Math.round(sum / treatment_assessments[code].length)
      }
    }

    res.status(200).json({ list: treatments })
  } catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

module.exports = router;