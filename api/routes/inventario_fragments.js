const express = require('express');
const router = express.Router();
const { v4 } = require('uuid');
const path = require('path');
const fsPromises = require('fs').promises;
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const { get_file_compliance, recognize_the_data } = require('../utils/ecoinvent.js')
const { ModelByEntity } = require('../utils/evals.js');
const EcoinventVersions = require('../models/entities/ecoinvent_versions.js')
const Materials = require('../models/entities/materials.js')


router.post('/', async (req, res, next) => {
  try{
    const filePath = path.join('./storage', 'INVENTARIO GENERALE BCW.xlsx');
    const buffer = await fsPromises.readFile(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets["GENERALE"];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const grouped = {};
    data.forEach(row => {
      const key = row['collocazione']
      let keyParsed = String(key)
      keyParsed = keyParsed.toLowerCase().includes('laboratorio restauro') ? 'Laboratorio Restauro' : keyParsed
      keyParsed = keyParsed.toLowerCase().includes('laboratorio resturo') ? 'Laboratorio Restauro' : keyParsed
      keyParsed = keyParsed.toLowerCase().includes('sottotetto') ? 'Sottotetto' : keyParsed
      keyParsed = keyParsed.toLowerCase().includes('box meco') ? 'Box MEco' : keyParsed
      keyParsed = keyParsed.toLowerCase().includes('box meco') ? 'Box MEco' : keyParsed
      if(keyParsed)
      if (!grouped[keyParsed]) grouped[keyParsed] = [];
      grouped[keyParsed].push(row);
    });

    // Crea un nuovo workbook
    //const newWorkbook = XLSX.utils.book_new();

    // Aggiunge un foglio per ogni gruppo
    for (const [collocazione, rows] of Object.entries(grouped)) {
      const sheet = XLSX.utils.json_to_sheet(rows);
      const safeName = collocazione.substring(0, 30); // Excel supporta max 31 caratteri
      XLSX.utils.book_append_sheet(workbook, sheet, safeName);
    }

    // Scrive il nuovo file
    const outputPath = path.join('./storage', 'suddiviso_per_collocazione.xlsx');
    XLSX.writeFile(workbook, outputPath);
    

    res.status(200).json({ message:'Done' })
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

module.exports = router;