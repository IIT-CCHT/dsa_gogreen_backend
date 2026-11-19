const express = require('express');
const router = express.Router();
const { calculateMaterialAssessments } = require('../utils/assessment')
const mongoose = require('mongoose');
const { get_file_compliance, recognize_the_data } = require('../utils/ecoinvent')
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs').promises;
const Materials = require('../models/entities/materials.js')


router.post('/', async (req, res, next) => {
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
    
    // const list = ids.length === 0 ? [] : await calculateMaterialAssessments(ids)
    res.status(200).json({list})
  } catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

router.post('/import-from-excel', async (req, res, next) => {
  try{
    const filePath = path.join('./storage', 'lca.xlsx');

    // Leggi il file direttamente dal filesystem
    const buffer = await fs.readFile(filePath);

    // Read excel file from buffer
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Extract data from secondo sheet
    const file_compliance = get_file_compliance(buffer, workbook)
    if( file_compliance !== '')
    {
      res.status(200).json({ message:'error', slug:'not_compliant_file', error: file_compliance })
      return
    }

  // Non dovrebbe essere usato mai altrimenti si perdono gli _id nei trattamenti dei folders !!!
  // await mongoose.connection.db.collection('materials').deleteMany({});

    // Extract data
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data_obj = XLSX.utils.sheet_to_json(worksheet);
    // const data_obj = recognize_the_data(file_origin, data)
    
    // Save data
    for(let i=0; i<data_obj.length; i+=1)
    {
      const product_from_excel = JSON.parse(JSON.stringify(data_obj[i]))
      let product_stored = await mongoose.connection.db.collection('materials').findOne({"name": product_from_excel.Item})
      if(product_stored === null)
      {
        const product_to_store = {}
        product_to_store._id = new mongoose.Types.ObjectId()
        product_to_store.createdAt = new Date()
        product_to_store.createdBy = null
        product_to_store.updatedAt = null
        product_to_store.updatedBy = null
        product_to_store.deletedAt = null
        product_to_store.deletedBy = null
        product_to_store.name = product_from_excel.Item
        const new_product = new Materials(product_to_store);
        await new_product.save()
        product_stored =  await mongoose.connection.db.collection('materials').findOne({"name": product_from_excel.Item.trim()})
      }  
      product_stored.updatedAt = new Date()
      product_stored.version = "1.0"
      product_stored.active = true
      product_stored.type = "substances"
      product_stored.reference_unit = "kg"
      product_stored.reference_amount = "1"
      product_stored.lca_data = {
        relative_density: 1,
        v_001: {
          G1: { value: product_from_excel.G1 === '#N/A' ? '' : product_from_excel.G1 },
          G2: { value: product_from_excel.G2 === '#N/A' ? '' : product_from_excel.G2 },
          G5: { value: product_from_excel.G5 === '#N/A' ? '' : product_from_excel.G5 },
          G6: { value: product_from_excel.G6 === '#N/A' ? '' : product_from_excel.G6 },
          G7: { value: 0 },
        }
      }
      product_stored.physical_state = product_from_excel.Category
      product_stored.is_solvent = false
      await mongoose.connection.db.collection('materials').updateOne({"name": product_from_excel.Item}, {$set:product_stored})
    }

    await mongoose.connection.db.collection('materials').updateOne({name:"Acetone"}, {$set: {
      hazard_assessments: {
        G1: 5,
        G2: 4.5
      } 
    }})
    await mongoose.connection.db.collection('materials').updateOne({name:"Ethanol"}, {$set: {
      hazard_assessments: {
        G1: 3,
        G2: 4
      } 
    }})
    // Materiale: Cotton
    await mongoose.connection.db.collection('materials').updateOne(
      { name: "Cotton" }, // filtro per verificare se esiste già
      { $setOnInsert: {
          version: "1.0",
          active: true,
          type: "items",
          reference_unit: "kg",
          reference_amount: "1",
          physical_state: "solid",
          is_solvent: false,
          lca_data: {
            v_001: {
              G1: { value: 0.00000014068 },
              G2: { value: 0.0000240402 },
              G5: { value: 1.03000954643321 },
              G6: { value: 4433.543577 },
              G7: { value: 10 },
            }
          }
      }},
      { upsert: true } // inserisce se non esiste
    );

    // Materiale: Evolon
    await mongoose.connection.db.collection('materials').updateOne(
      { name: "Evolon" },
      { $setOnInsert: {
          version: "1.0",
          active: true,
          type: "items",
          reference_unit: "kg",
          reference_amount: "1",
          physical_state: "solid",
          is_solvent: false,
          lca_data: {
            v_001: {
              G1: { value: 0.00000000176119 },
              G2: { value: 0.00000164114 },
              G5: { value: 0.284747239 },
              G6: { value: 1.655023871 },
              G7: { value: "" },
            }
          }
      }},
      { upsert: true }
    );



    res.status(200).json({ message:'Done' })
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

module.exports = router;