const Models = require('../models');
const mongoose = require('mongoose');

function normalizeHazardAssessmentValue(value)
{
  return value !== undefined && value !== null && value !== '' ? (value / 15) * 9 + 1 : 10
}

function checkWizardAnswers(wizard, materials)
{
  let count_G1_amounts = 0
  for(let i=0; i<materials.length; i+=1)
  {
    count_G1_amounts += materials[i].amount > 0  ? 1 : 0
  }
  wizard.G1.status_color = count_G1_amounts === 0 ? 'red' : (count_G1_amounts < materials.length ? 'orange' : 'green')
  wizard.G3.status_color = wizard.G3.answer !== '' ? 'green' : 'red'
  wizard.G4.status_color = wizard.G4.answers.every(str => str.trim() !== "") ? 'green' : 'red'
  wizard.G7.status_color = wizard.G7.answer !== "" ? 'green' : 'red'
  let g8_result = false
  if(wizard.G8.answers !== null)
  {
    const g8_answers = Object.values(wizard.G8.answers)
    const materialIds = g8_answers[0].map(m => m._id)
    g8_result = materialIds.every(id => {
      return g8_answers.some(choice =>
        choice.some(item => item._id === id && item.value === 1)
      )
    })
  }
  
  wizard.G8.status_color = 'green' //g8_result === true ? 'green' : 'red';
  wizard.G9.status_color = wizard.G9.answer === '' ? 'red' : 'green'
  wizard.G10 = {}
  wizard.G10.status_color = 'green'
  wizard.G11.status_color = wizard.G11.answer > -1 ? 'green' : 'red'
  wizard.G12.status_color = 
    wizard.G12.answers.have_already === 'yes' || 
    wizard.G12.answers.available_to_purchase === 'no' || (
      wizard.G12.answers.have_already === 'no' && 
      wizard.G12.answers.available_to_purchase === 'yes' && 
      wizard.G12.answers.from !== '' && 
      wizard.G12.answers.to !== '' && 
      Number(wizard.G12.answers.cost_of_materials) !== -1
    ) ? 'green' : 'red'
  wizard.G13.status_color = 
    wizard.G13.answers.easy_to_go !== '' && 
    wizard.G13.answers.time_for_testing !== '' && 
    wizard.G13.answers.time_for_treatment !== '' 
    ? 'green' : 'red'
  wizard.G14.status_color = wizard.G14.answer > -1 ? 'green' : 'red'

  // Give a color to all wizard
  const allGreen = Object
                    .entries(wizard)
                    .filter(([key]) => key.startsWith('G')) // Prende solo le chiavi che iniziano con "G"
                    .every(([_, value]) => value.status_color === 'green');
  wizard.status_color = allGreen === true ? 'green' : 'red'
  console.log('wizard.status_color', wizard.status_color)
}

async function checkTreatmentsUserInputs(user_id, folder_id, treatment_id)
{
  const workbench_list = await mongoose.connection.db.collection('workbenches').find({ user_id }).toArray()
  if(workbench_list.length === 0)
  {
    return
  }
  const workbench = workbench_list[0]
  const { folders } = workbench 
  const { treatments } = folders.find(item => item._id === folder_id)
  const treatment = treatments.find(item => item._id === treatment_id)
  const { materials, wizard } = treatment
  
  checkWizardAnswers(wizard, materials)

  const Workbench = await mongoose.connection.db.collection('workbenches')
    await Workbench.updateOne(
      {
        'folders._id': folder_id,
        'folders.treatments._id': treatment_id
      },
      {
        $set: {
          'folders.$[folderElem].treatments.$[treatmentElem].wizard': JSON.parse(JSON.stringify(wizard))
        }
      },
      {
        arrayFilters: [
          { 'folderElem._id': folder_id },
          { 'treatmentElem._id': treatment_id }
        ]
      }
    );
}

async function calculateMaterialAssessments(ids)
{
  // Get green parameters
  const green_parameters = 
        await Models['green_parameters']
          .find()
          .lean()
          .exec();

  // Get materials list
  const list = 
      await Models['materials']
        .find({
          _id: { $in: ids }
        })
        .sort({ sort: 1 })
        .lean()
        .exec();

    // Use first material as sample to retrive the caracteristics of LCA data
    const sample = list[0]    
    if( sample === undefined )
    {
      return []
    }
    const { lca_data: sample_lca_data } = sample

    // DO COMPARISON FOR EVERY GOGREEN PARAMETER
    
    for(let i=0; i<green_parameters.length; i+=1)
    {
      // GoGreen parameter code (G1,G2,G3,....)
      const { code } = green_parameters[i]

      // Filter LCA data columns related to the current GoGreen code
      const sample_lca_data_filtered = sample_lca_data.filter(item => item.gogreen_parameter_code === code)

      // Array of Arrays containing all normalizations of LCA values  for all LCA columns for the same GoGreen code
      let vett_single_paremeter = []
      for(let j=0; j<sample_lca_data_filtered.length; j+=1)
      {
        const { category, indicator, unity, substance } = sample_lca_data_filtered[j]
        // For every LCA data column put all LCA values for every materials in an array
        let vett = []
        for(let k=0; k<list.length; k+=1)
        {
          const { lca_data: item_lca_data } = list[k]
          if(item_lca_data !== undefined)
          {
            const item_lca_column = item_lca_data.find(
              item => 
              item.category === category && 
              item.indicator === indicator && 
              item.unity === unity && 
              item.substance === substance
            )
            vett.push({ value: item_lca_column.value })
          }
        }

        // Get min and max in the array min became 1, max became 10
        const min = Math.min(...vett.map(item => item.value));
        const max = Math.max(...vett.map(item => item.value));

        // Transform LCA Values of the array in normalized values from 1 to 10
        vett.forEach(obj => {
          obj.assessment = Math.round(1 + ((obj.value - min) / (max - min)) * 9)
        });
        vett_single_paremeter.push(vett)
      }

      const algorithm = "geometric"
      //const algorithm = "arithmetic"

      
      //    ██████  ███████  ██████  ███    ███ ███████ ████████ ██████  ██  ██████     ███    ███ ███████  █████  ███    ██ 
      //   ██       ██      ██    ██ ████  ████ ██         ██    ██   ██ ██ ██          ████  ████ ██      ██   ██ ████   ██ 
      //   ██   ███ █████   ██    ██ ██ ████ ██ █████      ██    ██████  ██ ██          ██ ████ ██ █████   ███████ ██ ██  ██ 
      //   ██    ██ ██      ██    ██ ██  ██  ██ ██         ██    ██   ██ ██ ██          ██  ██  ██ ██      ██   ██ ██  ██ ██ 
      //    ██████  ███████  ██████  ██      ██ ███████    ██    ██   ██ ██  ██████     ██      ██ ███████ ██   ██ ██   ████ 
      // Calcolate weighted geometric mean (10 with weight 10 to 1 with weight 1)
      if(algorithm === "geometric")
      {
        for(let r=0; r<list.length; r+=1)
        {
          let product = 1
          let weight_sum = 0
          for(let c=0; c<vett_single_paremeter.length; c+=1)
          {
            const col = vett_single_paremeter[c]
            product *= Math.pow(col[r].assessment, col[r].assessment)
            weight_sum += col[r].assessment
          }
          if(!('assessments' in list[r]))
          {
            list[r].assessments = {}
          }
          list[r].assessments[code] = weight_sum === 0 ? 'undefined' : Math.round(Math.pow(product, 1 / weight_sum))
        }
      }

      
      //    █████  ██████  ██ ████████ ██   ██ ███    ███ ███████ ████████ ██  ██████     ███    ███ ███████  █████  ███    ██ 
      //   ██   ██ ██   ██ ██    ██    ██   ██ ████  ████ ██         ██    ██ ██          ████  ████ ██      ██   ██ ████   ██ 
      //   ███████ ██████  ██    ██    ███████ ██ ████ ██ █████      ██    ██ ██          ██ ████ ██ █████   ███████ ██ ██  ██ 
      //   ██   ██ ██   ██ ██    ██    ██   ██ ██  ██  ██ ██         ██    ██ ██          ██  ██  ██ ██      ██   ██ ██  ██ ██ 
      //   ██   ██ ██   ██ ██    ██    ██   ██ ██      ██ ███████    ██    ██  ██████     ██      ██ ███████ ██   ██ ██   ████ 
      if(algorithm === "arithmetic")
      {
        for(let r=0; r<list.length; r+=1)
        {
          let sum = 0
          for(let c=0; c<vett_single_paremeter.length; c+=1)
          {
            const col = vett_single_paremeter[c]
            if(col.length > 0)
            {
              sum += col[r].assessment
            }
          }
          if(!('assessments' in list[r]))
          {
            list[r].assessments = {}
          }
          list[r].assessments[code] = sum === 0 ? 'undefined' : Math.round( sum / vett_single_paremeter.length )
        }  
      }                                                                                                           

    }

    const list_parsed = JSON.parse(JSON.stringify(list))
    for(let i=0; i<list_parsed.length; i+=1)
    {
      delete list_parsed[i].lca_data
    }
    
    return list_parsed
}

async function getLcaVersion()
{
  const lca_version_document = await mongoose.connection.db.collection('settings').findOne({ name: "lca_version"})
  const { version } = lca_version_document
  const lca_version = `v_${String(version).padStart(3, '0')}` 
  return lca_version
}

// Questa funzione ha il compito di normalizzare gli assessment dei solventi generati da Gwen
function normalizeSolventHazardAssessment(value)
{
  console.log('value', value === undefined || value === null || value === '' ? 10 : value === 0 ? 0 : (value / 15) * 9 +1)
  return value === undefined || value === null || value === '' ? 10 : value === 0 ? 0 : (value / 15) * 9 +1
}

module.exports = {
  calculateMaterialAssessments,
  getLcaVersion,
  checkTreatmentsUserInputs,
  checkWizardAnswers,
  normalizeSolventHazardAssessment,
  normalizeHazardAssessmentValue
}