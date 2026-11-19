const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ModelByEntity } = require('../utils/evals');
const { checkTreatmentsUserInputs, checkWizardAnswers } = require('../utils/assessment');
const workbenches = require('../models/entities/workbenches')
var passport = require('passport');

router.get('/', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  try{
    const user_id = req.user._id
    let subject = req.query.subject
    let workbench = await ModelByEntity('workbenches').findOne({ user_id })
    workbench = !workbench || workbench === null || workbench === undefined ? {} : workbench
    const data = workbench[subject]

    for(let i=0; i<data.length; i+=1)
    {
      const folder = data[i]
      delete folder.parameters
      delete folder.wizard
      const { treatments } = folder
      if(treatments !== undefined)
      {
        for(let j=0; j<treatments.length; j+=1)
        {
          const treatment = treatments[j]
          delete treatment.parameters
          treatment.wizard ||= {
            status_color: 'red',
            G1: { status_color: 'red' },
            G3: { answer: '', status_color: 'red' },
            G4: { answers: ['', '', ''], status_color: 'red' },
            G7: { answer: '' },
            G8: { answers: null},
            G9: { answer: '', status_color: 'red' },
            G11: { answer: -1, status_color: 'red' },
            G12: { answers: {is_innovative:'', have_already:'', available_to_purchase:'', from:'', to:'', cost_of_materials:50}, status_color: 'red' },
            G13: { answers: {easy_to_go:'', time_for_testing: '', time_for_treatment: ''}, status_color: 'red' },
            G14: { answer: -1, status_color: 'red' },
          }
  
          const { materials } = treatment
          for(m=0; m<materials.length; m+=1)
          {
            const material = materials[m]
            material.amount = material.hasOwnProperty('amount') ? material.amount : 0
          }
        }
      }
    }

    res.status(201).json({ message: 'Workbench data founded', data: data})
  }
  catch (err) {
    console.log(err)
    res.status(500).json({err})
  }
})

router.post('/',  passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  try{
    const user_id = req.user._id
    // console.log('user_id', user_id)
    const { subject, last_access, data } = req.body
    let workbench = await ModelByEntity('workbenches').findOne({ user_id })
    if(workbench === undefined || workbench === null)
    {
      const obj = {
        _id: new mongoose.Types.ObjectId(),
        user_id,
        last_access,
        [subject]: data
      }
      workbench = new workbenches(obj)
      await workbench.save()
    } else
    {
      workbench[subject] = data
      await ModelByEntity("workbenches").updateOne(
        { user_id }, 
        { $set: workbench  } 
      )
    }
    res.status(201).json({ message: 'Workbench updated'})
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

router.put('/:folder_id/:treatment_id/materials',  passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  try{
  const { folder_id, treatment_id } = req.params;
  const { materials } = req.body
  const Workbench = await mongoose.connection.db.collection('workbenches')
  await Workbench.updateOne(
    {
      'folders._id': folder_id,
      'folders.treatments._id': treatment_id
    },
    {
      $set: {
        'folders.$[folderElem].treatments.$[treatmentElem].materials': materials
      }
    },
    {
      arrayFilters: [
        { 'folderElem._id': folder_id },
        { 'treatmentElem._id': treatment_id }
      ]
    }
  );

  await checkTreatmentsUserInputs(req.user._id, folder_id, treatment_id)

  res.status(201).json({ message: 'Data updated'})
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

router.put('/:folder_id/:treatment_id/wizard',  passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  try{
  const user_id = req.user._id
  const { folder_id, treatment_id } = req.params;
  const { wizard } = req.body
  const workbench_stored = await ModelByEntity('workbenches').aggregate([
    { $match: { user_id } }, // Filtra il workbench corretto
    { 
      $project: {
        folders: {
          $filter: {
            input: "$folders",
            as: "folder",
            cond: { $eq: ["$$folder._id", folder_id] }
          }
        }
      }
    },
    { 
      $unwind: "$folders" // Estrai il singolo folder trovato
    },
    { 
      $project: {
        treatments: {
          $filter: {
            input: "$folders.treatments",
            as: "treatment",
            cond: { $eq: ["$$treatment._id", treatment_id] }
          }
        }
      }
    },
    { 
      $unwind: "$treatments" // Estrai il singolo treatment trovato
    }
  ]);
  if (workbench_stored && workbench_stored.length>0 && workbench_stored[0].treatments) {
    const treatment = workbench_stored[0].treatments;
    const { materials } = treatment
    checkWizardAnswers(wizard, materials)
  }

  const Workbench = await mongoose.connection.db.collection('workbenches')
  await Workbench.updateOne(
    {
      'folders._id': folder_id,
      'folders.treatments._id': treatment_id
    },
    {
      $set: {
        'folders.$[folderElem].treatments.$[treatmentElem].wizard': wizard
      }
    },
    {
      arrayFilters: [
        { 'folderElem._id': folder_id },
        { 'treatmentElem._id': treatment_id }
      ]
    }
  );

  await checkTreatmentsUserInputs(req.user._id, folder_id, treatment_id)

  res.status(201).json({ message: 'Data updated'})
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})
module.exports = router;
