const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ModelByEntity } = require('../utils/evals')
const migrationData = require('../../migrations/index.json')
const path = require('path');
const fs = require('fs')
const crypto = require('crypto');



const functions = {
  migrateToVersion_39,
}

router.get('/', async (req, res) => {
  try 
  {
    console.log('START MIGRATION')
    let dbVersionObj = 
        await ModelByEntity("settings")
          .findOne({name: "db_version"})
          .select("name version")
          .exec();

    // await mongoose.connection.db.collection('settings').find().toArray()
    //dbVersionObj = dbVersionObj.length > 0 ? dbVersionObj[0] : {}

    console.log('dbVersionObj', dbVersionObj)
    let { version: dbVersion } = dbVersionObj || {}
    dbVersion = dbVersion === undefined || dbVersion === null ? 0 : parseInt(dbVersion)
    let message = "Nulla da migrare"
    let new_version = dbVersion+1
    console.log('new_version', new_version)
    const functionName = `migrateToVersion_${new_version}`
    if (functions[functionName]) {
        console.log('Function exists')
        await functions[functionName](); // Chiama la funzione se esiste
        console.log('Update version')
        dbVersionObj.version = new_version
        console.log('Version updated')
        await mongoose.model('settings').findOneAndUpdate({_id:dbVersionObj._id}, dbVersionObj);
        message = `Migrazione alla versione ${new_version} attuata con successo` 
    }  

    res.status(200).json({
      message
    })
  } catch(e)
  {
    console.log(`### MIGRATION ERROR: ${e}`)
  }
})

async function updateTesters()
{
  let count = 0
  for(const tester of testers_2)
  {
    if(!(emailIsvalid(tester.email)))
    {
      console.log({ message: "Email is not valid: "+tester.email})
    } else 
    {
      count += 1
      await registerUser(tester.name, tester.email, tester.password, count)
    }
  }
}

async function migrateToVersion_39()
{
  await mongoose.connection.db.collection('materials').updateOne({name:"Triton X"}, {$set: {type: "detergents"}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Synperonic A7"}, {$set: {type: "detergents"}})

  await mongoose.connection.db.collection('materials').updateOne({name:"Epoxy Resin, 2-Component: Comprehensive"}, {$set: {type: "resins"}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Paraloid B-72"}, {$set: {type: "resins"}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Aldehyde Resin: Comprehensive/Laropal A-81"}, {$set: {type: "resins"}})

  await mongoose.connection.db.collection('materials').updateOne({name:"Klucel G, M"}, {$set: {type: "thickeners"}})

  await mongoose.connection.db.collection('materials').updateOne({name:"Acetone"}, {$set: {type: "solvents"}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Ethanol"}, {$set: {type: "solvents"}})

  await mongoose.connection.db.collection('materials').updateOne({name:"Water Deionized"}, {$set: {type: "waters"}})
  await mongoose.connection.db.collection('materials').updateOne({name:"Water Distilled"}, {$set: {type: "waters"}})
}

function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}

async function registerUser(name, email, password, count)
{
  const existingUser = await new ModelByEntity("users").findOne({ email });
  if (existingUser) {
    console.log("EXISTS "+count)
    return
  }
  try {
    const saltHash = genPassword(password);
    const { salt, hash } = saltHash
    const fields = {}
    fields._id = new mongoose.Types.ObjectId()
    fields.createdAt = new Date()
    fields.createdBy = null
    fields.updatedAt = null
    fields.updatedBy = null
    fields.deletedAt = null
    fields.deletedBy = null
    fields.name = name
    fields.username = email
    fields.email = email
    fields.hash = hash
    fields.salt = salt
    fields.role_slug = 'user'
    const item = new ModelByEntity("users")(fields);
    await item.save();
    console.log("OK "+count)
  } catch(e) {
    console.log("### registerUser Error!", count, name, email, password, e)
  }
}

async function emailIsvalid(email){
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}





module.exports = router