const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getLcaVersion, normalizeHazardAssessmentValue, normalizeSolventHazardAssessment } = require('../utils/assessment');
var passport = require('passport');
const { objectify, haversine_formula  } = require('../utils/functions');

lca_codes = ['G1','G2','G3','G5','G6','G8','G9','G10','G13'] 
lca_special_codes = ['G4','G7','G11','G12','G14'] 
lca_very_special_codes = ['G12'] 

function g12_special_case(v1, v2, v3, colors) {
  colors.c1 = v1 === 1 ? 'green-500' : (colors.c1 === 'green-500' ? 'yellow-500' : colors.c1);
  colors.c2 = v2 === 1 ? 'green-500' : (colors.c2 === 'green-500' ? 'yellow-500' : colors.c2);
  colors.c3 = v3 === 1 ? 'green-500' : (colors.c3 === 'green-500' ? 'yellow-500' : colors.c3);
}

function assignGrayWhenAllEquals(list, code, normalized_label)
{
  if(list.length === 0){
    return
  }
  let color=list[0][normalized_label][code].color
  let count = 0
  for(let i=0; i<list.length; i+=1)
  {
    const nextColor = list[i][normalized_label][code].color
    if(nextColor === color){
      count+=1
    }
  }
  if(count === list.length)
  {
    for(let i=0; i<list.length; i+=1)
    {
      list[i][normalized_label][code].color = 'gray-300'
    }
  }
  return list
}

function assignColors(list, code, normalized_label) {
  let sortedData = [...list].sort((a, b) =>
      a[normalized_label][code].normalized_value - b[normalized_label][code].normalized_value
  );
 

  if (sortedData.length === 2) {
      // Se ci sono solo 2 elementi → verde e rosso
      const v1 = sortedData[0][normalized_label][code].normalized_value
      const v2 = sortedData[1][normalized_label][code].normalized_value
      if(v1 === v2)
      {
        sortedData[0][normalized_label][code].color = v1 === 1 ? 'green-500' : 'red-500';
        sortedData[1][normalized_label][code].color = v2 === 1 ? 'green-500' : 'red-500';
      } else 
      {
        if(v1 === '')
        {
          sortedData[0][normalized_label][code].color = 'gray-300';
          sortedData[1][normalized_label][code].color = 'gray-300';
        } else 
        {
          sortedData[0][normalized_label][code].color = 'green-500';
          sortedData[1][normalized_label][code].color = 'red-500';
        }
        if(v1 === '') { sortedData[0][normalized_label][code].color = 'gray-300'; } 
        if(v2 === '') { sortedData[1][normalized_label][code].color = 'gray-300'; }
      }
  } else if (sortedData.length === 3) {

      const v1 = sortedData[0][normalized_label][code].normalized_value
      const v2 = sortedData[1][normalized_label][code].normalized_value
      const v3 = sortedData[2][normalized_label][code].normalized_value
      
      // Default colors
      c1 = 'green-500';
      c2 = 'yellow-500';
      c3 = 'red-500';

      

      // Conta quanti valori sono vuoti
      const emptyCount = [v1, v2, v3].filter(v => v === '').length;

      if (emptyCount === 3) {
        // Tutti vuoti → tutti gray
        c1 = c2 = c3 = 'gray-300';

      } else if (emptyCount === 2) {
        // Due vuoti → quello valorizzato è rosso, gli altri gray
        c1 = v1 === '' ? 'gray-300' : 'red-500';
        c2 = v2 === '' ? 'gray-300' : 'red-500';
        c3 = v3 === '' ? 'gray-300' : 'red-500';

        if (code === 'G12')
        {
          const colors = {c1,c2,c3}
          g12_special_case(v1, v2, v3, colors);
          c1 = colors.c1
          c2 = colors.c2
          c3 = colors.c3
        }

      } else if (emptyCount === 1) {
        // Un vuoto → quello vuoto è gray, gli altri uno verde e uno rosso
        if (v1 === '') {
          c1 = 'gray-300'; c2 = 'green-500'; c3 = 'red-500';
        } else if (v2 === '') {
          c1 = 'green-500'; c2 = 'gray-300'; c3 = 'red-500';
        } else {
          c1 = 'green-500'; c2 = 'red-500'; c3 = 'gray-300';
        }

        if (code === 'G12')
        {
          const colors = {c1,c2,c3}
          g12_special_case(v1, v2, v3, colors);
          c1 = colors.c1
          c2 = colors.c2
          c3 = colors.c3
        }

      } else {
        // Nessun vuoto → logica originale
        c2 = (v1 === v2) ? 'green-500' : 'yellow-500';
        c2 = (v2 === v3) ? 'red-500' : c2;
        c1 = (v1 === v2 && v2 === v3) ? 'gray-300' : c1;
        c2 = (v1 === v2 && v2 === v3) ? 'gray-300' : c2;
        c3 = (v1 === v2 && v2 === v3) ? 'gray-300' : c3;

        if (code === 'G12')
        {
          const colors = {c1,c2,c3}
          g12_special_case(v1, v2, v3, colors);
          c1 = colors.c1
          c2 = colors.c2
          c3 = colors.c3
        }
      }

      
      
      

      sortedData[0][normalized_label][code] ??= {}
      sortedData[1][normalized_label][code] ??= {}
      sortedData[2][normalized_label][code] ??= {}
      
      sortedData[0][normalized_label][code].color = c1;
      sortedData[1][normalized_label][code].color = c2;
      sortedData[2][normalized_label][code].color = c3;
     
  
    } else if (sortedData.length > 3) {
    // Se ci sono più di 3 elementi → verde, giallo e rosso in base al valore
    sortedData[0][normalized_label][code].color = sortedData[0][normalized_label][code].normalized_value<4 ? 'green-500' : (sortedData[0][normalized_label][code].normalized_value>7 ? 'red-500' : 'yellow-500' );
  }
  sortedData = assignGrayWhenAllEquals(sortedData, code, normalized_label)
  return sortedData;
}

router.post('/materials', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  try{
    let list = []
    const { ids } = req.body
    const idsObjectify = ids.map(id => new mongoose.Types.ObjectId(id.trim()));
    if(ids.length > 0)
    {
      list = await mongoose.connection.db.collection('materials')
            .find({
              _id: { $in: idsObjectify }
            })
            .sort({ sort: 1 })
            .toArray()
    } else 
    {
      list = await mongoose.connection.db.collection('materials')
            .find({
              active: true
            })
            .sort({ sort: 1 })
            .toArray()
    }
    const lca_version = await getLcaVersion()
    const green_parameters = await mongoose.connection.db.collection('green_parameters')
            .find({
              comparison: { $in: ['materials', 'both']}
            })
            .sort({ sort: 1 })
            .toArray()

    for(let g=0; g<green_parameters.length; g+=1)
    {
      const { code } = green_parameters[g]
      for(let i=0; i<list.length; i+=1)
      {
        const item = list[i]
        item.lca_data_normalized = item.hasOwnProperty("lca_data_normalized") ? item.lca_data_normalized : {}
        let min = Math.min(...list.map(item => item.lca_data[lca_version][code].value))
        let max = Math.max(...list.map(item => item.lca_data[lca_version][code].value))
        const { value } = item.lca_data[lca_version][code]
        item.lca_data_normalized[code] = {}
        item.lca_data_normalized[code].value = value
        if(min === max)
        {
          item.lca_data_normalized[code].normalized_value = 1
        } else 
        {
          item.lca_data_normalized[code].normalized_value = value !== '' ? Math.round(1 + (9 * ((value - min) / (max - min)))) : value
        }
      }
      list = assignColors(list, code, 'lca_data_normalized')
    }
    // list = list.map(item => ({
    //   ...item,
    //   normalized: item.lca_data[lca_version]
    // }))
   

    
    // const list = ids.length === 0 ? [] : await calculateMaterialAssessments(ids)
    res.status(200).json({list})
  } catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

router.post('/treatments', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  try{
    const user_id = req.user._id
    let workbench = null
    const { ids } = req.body
    let treatment_to_compare = []
    let assessment = {}
    if(ids.length === 0)
    {
      res.status(200).json({ list: [] })
      return
    }

    // Recupero dal db i materials per usarne le evetuali densities
    let materials = await mongoose.connection.db.collection('materials').find().toArray()
    materials = objectify(materials, '_id')

    // Recupero il workbench di questo utente
    const list = await mongoose.connection.db.collection('workbenches').find({ user_id: user_id}).toArray()
    workbench = list.length > 0 ? list[0] : {}
    const { folders } = workbench

    // Scorro le folders di questo dell'utente per analizzarne i treatments
    for(let i=0; i<folders.length; i+=1)
    {
      const folder = folders[i]
      const { treatments } = folder || {}
      if(treatments !== undefined)
      {

        // Scorro tutti i treatments
        for(let t=0; t<treatments.length; t+=1)
        {
          const treatment = treatments[t]
          const { _id } = treatment

          // Se l'_id del singolo treatment è tra quelli coinvolti nel compare lo memorizzo in treatment_to_compare
          if(ids.includes(_id))
          {
            treatment_to_compare.push(treatment)
          }
        }
      }
    }
    
    // Genero le valutazioni per Green Parameter così da mostrarle agevolmente sul frontend
    await guessG1(treatment_to_compare, materials)
    await guessG2(treatment_to_compare, materials)
    await guessG3(treatment_to_compare)
    await guessG4(treatment_to_compare)
    await guessG5(treatment_to_compare, materials)
    await guessG6(treatment_to_compare, materials)
    await guessG7(treatment_to_compare, materials)
    await guessG8(treatment_to_compare)
    await guessG9(treatment_to_compare)
    await guessG10(treatment_to_compare, materials)
    await guessG11(treatment_to_compare)
    await guessG12(treatment_to_compare)
    await guessG13(treatment_to_compare)
    await guessG14(treatment_to_compare)

    
    for(let g=0; g<lca_special_codes.length; g+=1)
      {
        const code = lca_special_codes[g]
        for(let i=0; i<treatment_to_compare.length; i+=1)
        {
          const treatment = treatment_to_compare[i]
          const { assessment } =treatment
          const single_assessment = assessment[code] || {}
          treatment.normalized_assessment = treatment.hasOwnProperty("normalized_assessment") ? treatment.normalized_assessment : {}
          treatment.normalized_assessment[code] = {}
          treatment.normalized_assessment[code].normalized_value = single_assessment.value
        }
        treatment_to_compare = assignColors(treatment_to_compare, code, 'normalized_assessment')
      }

    
    for(let g=0; g<lca_codes.length; g+=1)
      {
        const code = lca_codes[g]
        for(let i=0; i<treatment_to_compare.length; i+=1)
        {
          const treatment = treatment_to_compare[i]
          const { assessment } =treatment
          const single_assessment = assessment[code] || {}
          const values = treatment_to_compare
            .map(item => item.assessment?.[code]?.value)
            .filter(v => v !== null && v !== undefined && v !== '')
            .map(v => Number(v))
            .filter(v => !isNaN(v))
          let min = values.length ? Math.min(...values) : ''
          let max = values.length ? Math.max(...values) : ''
          treatment.normalized_assessment = treatment.hasOwnProperty("normalized_assessment") ? treatment.normalized_assessment : {}
          treatment.normalized_assessment[code] = {}
          min = !isNaN(min) ? min : ''
          max = !isNaN(max) ? max : ''
          const value = single_assessment.value

          if (value === null || value === undefined || value === '') {
            treatment.normalized_assessment[code].normalized_value = ''
          } else if (min === max) {
            treatment.normalized_assessment[code].normalized_value = 1
          } else {
            treatment.normalized_assessment[code].normalized_value =
              Math.round(1 + (9 * ((value - min) / (max - min))))
          }
        }
        treatment_to_compare = assignColors(treatment_to_compare, code, 'normalized_assessment')
      }

   
    res.status(200).json({treatment_to_compare})
  } catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

module.exports = router;

async function guessG14(treatment_to_compare)
{
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    let assessment = { 
      value: '',
      percentage: ''
    }
    const treatment = treatment_to_compare[t]
    const { wizard } = treatment
    const { G14 } = wizard
    const { answer } = G14
    const value =  answer === -1 ? '' : Math.round(answer*100) / 10 //Math.round(1 + answer * 9) Ho levato questo perchè la normalizzazione schiacciava valori vicini
    treatment.assessment.G14 = {
      value,
      percentage: answer !== -1 ? answer : ''
    }
  } 
}

async function guessG13(treatment_to_compare)
{
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    let assessment = { 
      value: '',
      easy_to_go: 0,
      time_for_testing: 0,
      time_for_treatment: 0
    }
    const treatment = treatment_to_compare[t]
    const { wizard } = treatment
    const { G13 } = wizard
    const { answers } = G13
    const { easy_to_go, time_for_testing, time_for_treatment } = answers
    if(!(easy_to_go === '' || time_for_testing === '' || time_for_treatment === ''))
    {
      let mean = 0
      mean += 1 + easy_to_go * 9
      mean += 1 + time_for_testing * 9
      mean += 1 + time_for_treatment * 9 
      const unroundedMean = mean
      mean = Math.round(mean / 3)
      assessment = {
        value: mean,
        easy_to_go: easy_to_go,
        time_for_testing: time_for_testing,
        time_for_treatment: time_for_treatment,
        mean: unroundedMean / 3
      }
    }
    treatment.assessment.G13 = assessment
  } 
}

async function guessG12(treatment_to_compare)
{
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    let cost_of_materials_parsed = 0
    let assessment_slug = ''
    let distance_assessment = 0
    let distance_in_km = ''
    const treatment = treatment_to_compare[t]
    const { wizard, name } = treatment
    const { G12 } = wizard
    const { answers } = G12
    const { is_innovative, have_already, available_to_purchase, from, to, cost_of_materials } = answers
    let assessment = 0
    if(have_already === null || have_already === '')
    {
      assessment_slug = ''
      assessment = ''
    } else if(have_already === 'yes')
    {
      assessment_slug = 'g12_materials_already_in_stock'
      assessment = 1
    } else if(available_to_purchase === 'no')
    {
      assessment_slug = 'g12_materials_not_available_to_purchease'
      assessment = null
    } else
    {
      assessment_slug = 'g12_materials_to_be_purcheased'
      const { lat: from_lat, lon: from_lon } = from
      const { lat: to_lat, lon: to_lon } = to
      distance_in_km = haversine_formula(from_lat, from_lon, to_lat, to_lon)
      if (distance_in_km <= 19) {
        distance_assessment = 1;
      } else if (distance_in_km <= 99) {
        distance_assessment = 3;
      } else if (distance_in_km <= 499) {
        distance_assessment = 5;
      } else if (distance_in_km <= 999) {
        distance_assessment = 7;
      } else {
        distance_assessment = 10;
      }
      cost_of_materials_parsed = Math.round(1+(cost_of_materials * 9))
      assessment = Math.round((cost_of_materials_parsed + distance_assessment) / 2)
    }
    treatment.assessment.G12 = {
      distance: Math.round(distance_in_km),
      assessment_slug, 
      distance_assessment, 
      cost_of_materials,
      cost_of_materials_parsed, 
      value: assessment || '',
      is_innovative
    }
  } 
}

async function guessG11(treatment_to_compare)
{
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    const treatment = treatment_to_compare[t]
    const { wizard } = treatment
    const { G11 } = wizard
    const { answer } = G11
    const answerParsed = answer !== undefined && answer !== null && answer !== '' && answer !== -1 ? parseFloat(answer) : ''
    const value = answerParsed !== '' ? Math.round(1+((1-answerParsed) * 9)) : ''
    treatment.assessment.G11 = {
      value,
      percentage: answerParsed === '' ? '' : answerParsed * 100,
      answer: answerParsed
    }
  } 
}

async function guessG10(treatment_to_compare, materials)
{
  // Scorro i tretament da confrontare
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    const treatment = treatment_to_compare[t]

    // Del singolo treatment recupero i materials e l'-id
    const { materials: treatment_materials } = treatment

    let sum = 0
    let material_weights = {} // Qua memorizzo gli assessment sui singoli materiali per eventuali verifiche o visualizzazioni sul frontend

    // Scorro i materiali di questo trattamento
    for(let m=0; m<treatment_materials.length; m+=1)
    {
      // Recupero _id, l'unità di misura e la quantità definite dall'utente
      const { _id: material_id, name: material_name, unit, amount } = treatment_materials[m]
      let amount_parsed = amount === undefined || amount === '' ? 0 : Number(amount)
      const weight = await setMaterialInfo(materials, material_id, unit, amount_parsed, '') 
      sum += weight

      // Memorizzo l'assessment nell'oggetto che li raccoglie tutti di questo trattamento
      material_weights[material_id] = {
        name: material_name,
        weight
      }
    }
    treatment.assessment.G10 = {
      material_weights,
      value: sum
    }
  }
}

async function guessG9(treatment_to_compare)
{
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    const treatment = treatment_to_compare[t]
    const { wizard } = treatment
    const { G9 } = wizard
    const { answer } = G9
    treatment.assessment.G9 = {
      value: answer === 'yes' ? 1 : (answer === 'no' ? 10 : ''),
      answer
    }
  } 
}

async function guessG8(treatment_to_compare) {

  let assessment = {}

  const weights = {
    reuse: 1,
    recycle: 3,
    compost: 3,
    non_hazardous: 6,
    hazardous: 10,
  }

  for (let t = 0; t < treatment_to_compare.length; t += 1) {

    const treatment = treatment_to_compare[t]
    const { answers } = treatment.wizard.G8
    if(answers !== null && answers !== '')
    {
      const keys = Object.keys(answers)
      const answers_to_show = Object.fromEntries(keys.map(k => [k, 0]));
  
  
      let totalWeight = 0
      let totalSelections = 0
  
      for (let i = 0; i < keys.length; i += 1) {
  
        const key = keys[i]
        const materials = answers[key]
  
        for (let j = 0; j < materials.length; j += 1) {
  
          if (materials[j].value === 1) {
            answers_to_show[key] += 1
            totalWeight += weights[key]
            totalSelections += 1
          }
  
        }
      }
  
      // Evita divisione per zero
      const mean = totalSelections > 0
        ? Math.round(totalWeight / totalSelections)
        : 1
      assessment = {
        value: mean,
        answers_to_show,
        weight: totalWeight / totalSelections
      }
    } else
    {
      assessment = {
        value: '',
        answers_to_show : []
      }
    }
    treatment.assessment.G8 = assessment
  }
}


async function guessG7(treatment_to_compare, materials)
{
  // Scorro i tretament da confrontare
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    const treatment = treatment_to_compare[t]
    const { wizard } = treatment
    const { G7 } = wizard
    let result={}
    if(G7){
      const { answer } = G7
      treatment.assessment.G7 = {
        value: ['NA'].includes(answer) ? '' : (['LC','DD','NE'].includes(answer) ? 5 : 10 )
      }
    }else{
      treatment.assessment.G7 = {
        value: ''
      }
    }
  }
}

async function guessG6(treatment_to_compare, materials)
{
  // Scorro i tretament da confrontare
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    const treatment = treatment_to_compare[t]

    // Del singolo treatment recupero i materials e l'-id
    const { materials: treatment_materials } = treatment

    let sum = 0
    let material_assessments = {} // Qua memorizzo gli assessment sui singoli materiali per eventuali verifiche o visualizzazioni sul frontend

    // Scorro i materiali di questo trattamento
    for(let m=0; m<treatment_materials.length; m+=1)
    {
      // Recupero _id, l'unità di misura e la quantità definite dall'utente
      const { _id: material_id, name: material_name, unit, amount } = treatment_materials[m]
      let amount_parsed = amount === undefined || amount === '' ? 0 : Number(amount)
      const assessment = await setMaterialInfo(materials, material_id, unit, amount_parsed, 'G6') // Qui memorizzo l'assessment di questo singolo material
      sum += assessment

      // Memorizzo l'assessment nell'oggetto che li raccoglie tutti di questo trattamento
      material_assessments[material_id] = {
        name: material_name,
        assessment
      }
    }
    treatment.assessment.G6 = {
      material_assessments,
      value: sum
    }
  }
}

async function guessG5(treatment_to_compare, materials)
{
  // Scorro i tretament da confrontare
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    const treatment = treatment_to_compare[t]
    

    // Del singolo treatment recupero i materials e l'-id
    const { materials: treatment_materials } = treatment

    let sum = 0
    let material_assessments = {} // Qua memorizzo gli assessment sui singoli materiali per eventuali verifiche o visualizzazioni sul frontend

    // Scorro i materiali di questo trattamento
    for(let m=0; m<treatment_materials.length; m+=1)
    {
      // Recupero _id, l'unità di misura e la quantità definite dall'utente
      const { _id: material_id, name: material_name, unit, amount } = treatment_materials[m]
      let amount_parsed = amount === undefined || amount === '' ? 0 : Number(amount)
      const assessment = await setMaterialInfo(materials, material_id, unit, amount_parsed, 'G5')
      sum += assessment

      // Memorizzo l'assessment nell'oggetto che li raccoglie tutti di questo trattamento
      material_assessments[material_id] = {
        name: material_name,
        assessment
      }
    }
   treatment.assessment.G5 = {
      material_assessments,
      value: sum
    }
  }
}

async function guessG4(treatment_to_compare) {
  for (let t = 0; t < treatment_to_compare.length; t++) {
    const treatment = treatment_to_compare[t];
    const { wizard } = treatment;
    const { G4 } = wizard;
    const { answers } = G4;

    // Conta i "yes"
    const yesCount = answers.filter(answer => answer === 'yes').length;

    // Se ci sono risposte mancanti, lascia il valore vuoto
    const value = answers.length === yesCount + answers.filter(a => a === 'no').length
      ? 1 + (yesCount * (yesCount + 3)) / 2
      : '';

    treatment.assessment.G4 = {
      value,
      answers
    };
  }
}

async function guessG3(treatment_to_compare)
{
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    const treatment = treatment_to_compare[t]
    const { wizard } = treatment
    const { G3 } = wizard
    const { answer } = G3
    treatment.assessment.G3 = {
      value: answer === "0" ? 10 : (answer === "2" ? 1 : answer === null || answer === '' ? '' : 5),
      answer: answer === "0" ? 'yes' : (answer === "1" ? 'moderate' : 'no')
    }
  }  
}

async function guessG2(treatment_to_compare, materials)
{
  // Scorro i tretament da confrontare
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    const treatment = treatment_to_compare[t]

    // Del singolo treatment recupero i materials e l'-id
    const { materials: treatment_materials } = treatment

    let sum = 0
    let material_assessments = {} // Qua memorizzo gli assessment sui singoli materiali per eventuali verifiche o visualizzazioni sul frontend

    // Scorro i materiali di questo trattamento
    for(let m=0; m<treatment_materials.length; m+=1)
    {
      // Recupero _id, l'unità di misura e la quantità definite dall'utente
      const { 
        _id: material_id, 
        name: material_name, 
        unit, 
        amount 
      } = treatment_materials[m]
      let amount_parsed = amount === undefined || amount === '' ? 0 : Number(amount)
      const assessment = await setMaterialInfo(materials, material_id, unit, amount_parsed, 'G2')
      sum += assessment

      const { hazard_assessments: material_hazard_assessments } = materials[material_id]

      // Memorizzo l'assessment nell'oggetto che li raccoglie tutti di questo trattamento
      material_assessments[material_id] = {
        name: material_name,
        hazard_assessment: material_hazard_assessments !== undefined ? normalizeHazardAssessmentValue(material_hazard_assessments.G2) : '',
        assessment
      }
    }
    treatment.assessment.G2 = {
      material_assessments,
      value: sum
    }
  }
}

async function guessG1(treatment_to_compare, materials)
{
  // Scorro i tretament da confrontare
  for(let t=0; t<treatment_to_compare.length; t+=1)
  {
    const treatment = treatment_to_compare[t]

    // Del singolo treatment recupero i materials e l'-id
    const { materials: treatment_materials } = treatment

    let sum = 0
    let material_assessments = {} // Qua memorizzo gli assessment sui singoli materiali per eventuali verifiche o visualizzazioni sul frontend

    // Scorro i materiali di questo trattamento
    for(let m=0; m<treatment_materials.length; m+=1)
    {
      // Recupero _id, l'unità di misura e la quantità definite dall'utente
      const { 
        _id: material_id, 
        name: material_name, 
        unit, 
        amount 
      } = treatment_materials[m]
      console.log('>', material_name, unit, amount)
      let amount_parsed = amount === undefined || amount === '' ? 0 : Number(amount)
      const assessment = await setMaterialInfo(materials, material_id, unit, amount_parsed, 'G1')
      sum += assessment

      const { hazard_assessments: material_hazard_assessments } = materials[material_id]

      // Memorizzo l'assessment nell'oggetto che li raccoglie tutti di questo trattamento
      material_assessments[material_id] = {
        name: material_name,                      
        hazard_assessment: material_hazard_assessments !== undefined ? normalizeHazardAssessmentValue(material_hazard_assessments.G1) : '',
        assessment,
        lca_assessment: await setMaterialInfo(materials, material_id, unit, amount_parsed, 'G1', true)
      }
    }
   treatment.assessment = {}
   treatment.assessment.G1 = {
      material_assessments,
      value: sum
    }
  }
}

async function setMaterialInfo(materials, material_id, material_unit, amount_parsed, code, force_lca=false)
{
  const keys = Object.keys(materials)
  const material = materials[material_id]
  const { lca_data, uuid, hazard_assessments }  = material
  const { relative_density } = lca_data
  const amount = ['kg','g','mg'].includes(material_unit) ? 
      (material_unit === 'g' ? amount_parsed / 1000 : (material_unit === 'mg' ? amount_parsed / 1000000 : amount_parsed)) :
      ((relative_density * amount_parsed) / 1000) 
  let lca_value_parsed = 0
  if(code !== '')
  {
    if ((code === 'G1' || code === 'G2') && hazard_assessments !== undefined && force_lca === false)
    {
      const hazard_assessment = hazard_assessments[code] ?? 15
      assessment = hazard_assessment !== undefined && hazard_assessment !== null ? normalizeHazardAssessmentValue(hazard_assessment) : 10
      console.log('!', hazard_assessments, code, hazard_assessments[code], assessment)
    } else 
    {
      const lca_version = await getLcaVersion()
      const { [lca_version]: lca_version_obj } = lca_data
      const { [code]: codeObj } = lca_version_obj
      let { value: lca_value } = codeObj
      lca_value_parsed = lca_value === undefined ? 0 : lca_value
      assessment = amount * (code !== '' ? lca_value_parsed : 1)
    }
  }
  return assessment
}

