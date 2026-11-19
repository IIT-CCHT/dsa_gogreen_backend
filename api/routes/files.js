const express = require('express');
const router = express.Router();
const { v4 } = require('uuid');
const path = require('path');
const fsPromises = require('fs').promises;
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const { get_file_compliance, recognize_the_data } = require('../utils/ecoinvent')
const { ModelByEntity } = require('../utils/evals');
const EcoinventVersions = require('../models/entities/ecoinvent_versions.js')
const Materials = require('../models/entities/materials.js')

const { 
  file_extension, 
} = require('../utils/functions');

// const file_origin = 'ecoinvent'
const file_origin = 'stich'

router.post('/', async (req, res, next) => {
  try{
    const { file, original_file_name } = req.body
    
    const base64Data = file.replace(/^data:.*;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Scrive il file nel filesystem (opzionale, se hai bisogno di salvarlo)
    // const filePath = path.join('./storage', filename);
    // await fsPromises.writeFile(filePath, buffer);

    // Read excel file on buffer
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Extract data from secondo sheet
    const file_compliance = get_file_compliance(file_origin, workbook)
    if( file_compliance !== '')
    {
      res.status(200).json({ message:'error', slug:'not_compliant_file', error: file_compliance })
      return
    }

    await EcoinventVersions.deleteMany({})
    await Materials.deleteMany({})

    // Store file
    const result = await EcoinventVersions.findOne({},sort=[("version", -1)])
    const new_version = result !== null ? result['version']+1 : 1
    const fields = {}
    fields._id = new mongoose.Types.ObjectId()
    fields.createdAt = new Date()
    fields.createdBy = null
    fields.updatedAt = null
    fields.updatedBy = null
    fields.deletedAt = null
    fields.deletedBy = null
    fields.version = new_version
    fields.file_name = original_file_name
    const item = new EcoinventVersions(fields);
    await item.save();

    // Extract data
    const sheetName = workbook.SheetNames[file_origin === 'stich' ? 0 : 1];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const data_obj = recognize_the_data(file_origin, data)
    
    // Save data
    for(let i=0; i<data_obj.list.length; i+=1)
    {
      const product_to_store = JSON.parse(JSON.stringify(data_obj.list[i]))
      const product_stored = await Materials.findOne({"_id": product_to_store._id})
      if(product_stored === null)
      {
        product_to_store._id = new mongoose.Types.ObjectId()
        product_to_store.createdAt = new Date()
        product_to_store.createdBy = null
        product_to_store.updatedAt = null
        product_to_store.updatedBy = null
        product_to_store.deletedAt = null
        product_to_store.deletedBy = null
        product_to_store.version = new_version
        const new_product = new Materials(product_to_store);
        await new_product.save()
      } else 
      {
        if(JSON.stringify(product_stored.lca_data) !== JSON.stringify(product_to_store.lca_data))
        {
          product_stored.lca_data = JSON.parse(JSON.stringify(product_to_store.lca_data))
          product_stored.updatedAt = new Date()
          product_stored.version = new_version
          product_stored.save()
        }
      }
    }

    res.status(200).json({ message:'Done' })
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

module.exports = router;