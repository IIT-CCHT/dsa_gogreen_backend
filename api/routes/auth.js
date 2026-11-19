const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { emailIsvalid, nowTimeStamp } = require('../utils');
var passport = require('passport');
const { validPassword, genPassword, issueJWT } = require('../utils/password.js')
const { ModelByEntity } = require('../utils/evals');


//  ██████  ███████  ██████  ██ ███████ ████████ ███████ ██████  
//  ██   ██ ██      ██       ██ ██         ██    ██      ██   ██ 
//  ██████  █████   ██   ███ ██ ███████    ██    █████   ██████  
//  ██   ██ ██      ██    ██ ██      ██    ██    ██      ██   ██ 
//  ██   ██ ███████  ██████  ██ ███████    ██    ███████ ██   ██ 
router.post('/register', async function(req, res) {

  try {

    const email = req.body.email
    const name = req.body.name
    const username = email
    const role_slug = req.body.role_slug

    if (!emailIsvalid(email)) {

      return res.status(401).json({
        message: "Email is not valid"
      })
    }

    // CHECK USER EXISTS
    const existingUser = await ModelByEntity("users").findOne({ email })

    if (existingUser) {

      return res.status(409).json({
        success: false,
        message: "Email already registered"
      })
    }

    const saltHash = genPassword(req.body.password)

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
    fields.username = username
    fields.email = email
    fields.hash = hash
    fields.salt = salt
    fields.role_slug = role_slug

    const item = new ModelByEntity("users")(fields)

    const data = await item.save()

    const { _id } = data

    const user = await ModelByEntity("users").findOne(
      { _id },
      { _id: 1, createdAt: 1, email: 1 }
    )

    const jwt = issueJWT(user)

    const { token, expiresIn } = jwt

    return res.status(200).json({
      success: true,
      user,
      token,
      expiresIn
    })

  } catch (err) {

    // DUPLICATE EMAIL
    if (err.code === 11000) {

      return res.status(409).json({
        success: false,
        message: "Email already registered"
      })
    }

    console.error(err)

    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})


//  ██       ██████   ██████  ██ ███    ██ 
//  ██      ██    ██ ██       ██ ████   ██ 
//  ██      ██    ██ ██   ███ ██ ██ ██  ██ 
//  ██      ██    ██ ██    ██ ██ ██  ██ ██ 
//  ███████  ██████   ██████  ██ ██   ████ 
router.post('/login', async function(req, res, next) {
  let user = await ModelByEntity("users").findOne({ email: req.body.email }, {_id:1, salt:1, hash:1})
  if(!user)
  {
    res.status(401).json({ message: "User not found"})
    return
  }
  const { _id, hash, salt } = user || {}
  const passwordIsValid = validPassword(req.body.password, hash, salt)
  if(passwordIsValid)
  {
    //user = await ModelByEntity("users").findOne({ _id }, { _id: 1, createdAt: 1, name:1, email:1 })

    let user = await ModelByEntity("users").aggregate([
        {
          $match: { _id }
        },
        {
          $lookup: {
            from: "roles",        // Collezione con cui vuoi fare il join
            localField: "role_slug", // Campo in 'users' che corrisponde alla chiave esterna
            foreignField: "slug",  // Campo in 'roles' che corrisponde alla chiave primaria
            as: "roleDetails"      // Nome dell'array che conterrà i dati della collezione 'roles'
          }
        },
        {
          $unwind: "$roleDetails"  // Se desideri un solo oggetto invece di un array
        },
        {
          $addFields: {
            role_name: "$roleDetails.name" // Aggiunge 'role_name' al documento utente
          }
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            name: 1,
            email: 1,
            role_name: 1
          }
        }
      ]).exec();
    user = user.length > 0 ? user[0] : {}
    if (Object.keys(user).length === 0) 
    {
      res.status(401).json({ message: "Wrong Email, Password or Role Slug"})
    }
    const jwt = issueJWT(user)
    const { token , expiresIn} = jwt
    res.status(200).json({ succes:true, user, token, expiresIn })
  } else
  {
    res.status(401).json({ message: "Wrong Email or Password"})
  }
});


//  ███    ███ ███████ 
//  ████  ████ ██      
//  ██ ████ ██ █████   
//  ██  ██  ██ ██      
//  ██      ██ ███████ 
router.get('/me', passport.authenticate('jwt', {session: false}), async function(req, res, next) {
  let user = await ModelByEntity("users").findOne({ _id: req.user.id }, { _id: 1, createdAt: 1, name:1, email:1 })
  const jwt = issueJWT(user)
  const { token , expiresIn} = jwt
  res.status(200).json({ succes:true, user, token, expiresIn })
});


//   ██████ ██   ██  █████  ███    ██  ██████  ███████       ██████   █████  ███████ ███████ ██     ██  ██████  ██████  ██████  
//  ██      ██   ██ ██   ██ ████   ██ ██       ██            ██   ██ ██   ██ ██      ██      ██     ██ ██    ██ ██   ██ ██   ██ 
//  ██      ███████ ███████ ██ ██  ██ ██   ███ █████   █████ ██████  ███████ ███████ ███████ ██  █  ██ ██    ██ ██████  ██   ██ 
//  ██      ██   ██ ██   ██ ██  ██ ██ ██    ██ ██            ██      ██   ██      ██      ██ ██ ███ ██ ██    ██ ██   ██ ██   ██ 
//   ██████ ██   ██ ██   ██ ██   ████  ██████  ███████       ██      ██   ██ ███████ ███████  ███ ███   ██████  ██   ██ ██████  
router.post('/change-password', async (req, res, next) => {
  try{
    const email = req.body.email
    const current_password = req.body.current_password
    const password = req.body.password
    const password_confirmation = req.body.password_confirmation

    // Check Email
    if(!(emailIsvalid(email)))
    {
      res.status(401).json({ message: "Email is not a valid Email"})
    }

    // Check Password
    let user = await ModelByEntity("users").findOne({ email })
    if(!user)
    {
      res.status(401).json({ message: "Invalid credentials"})
      return
    }
    const { _id, hash, salt } = user || {}
    const passwordIsValid = validPassword(current_password, hash, salt)
    if(!passwordIsValid)
    {
      res.status(401).json({ message: "Invalid credentials"})
      return 
    } 
    if(password !== password_confirmation)
    {
      res.status(400).send({ message: `Passwords don't match` });
      return
    }
   
    const saltHash = genPassword(password);
    const { hash: newHash, salt: newSalt } = saltHash || {}
    await ModelByEntity("users").updateOne({ _id }, {  hash: newHash, salt: newSalt } )
    
    const text=`You have successfully changed your GoGreen password.\nNow you can log in with the new credentials`
    const html=`You have successfully changed your GoGreen password.<br />Now you can log in with the new credentials`
    mailer.sendEmail(user.email, "GoGreen password renewed", text, html);

    res.status(200).send({ message: "Password changed successfully" });
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})


//  ██████  ███████ ███    ██ ███████ ██     ██       ██████   █████  ███████ ███████ ██     ██  ██████  ██████  ██████  
//  ██   ██ ██      ████   ██ ██      ██     ██       ██   ██ ██   ██ ██      ██      ██     ██ ██    ██ ██   ██ ██   ██ 
//  ██████  █████   ██ ██  ██ █████   ██  █  ██ █████ ██████  ███████ ███████ ███████ ██  █  ██ ██    ██ ██████  ██   ██ 
//  ██   ██ ██      ██  ██ ██ ██      ██ ███ ██       ██      ██   ██      ██      ██ ██ ███ ██ ██    ██ ██   ██ ██   ██ 
//  ██   ██ ███████ ██   ████ ███████  ███ ███        ██      ██   ██ ███████ ███████  ███ ███   ██████  ██   ██ ██████  
router.post('/renew-password', async (req, res, next) => {
  try{
    const password = req.body.password
    const password_confirmation = req.body.password_confirmation
    const key = req.body.key
    const _id = req.body._id
    if(password !== password_confirmation)
    {
      res.status(400).send({ message: `Passwords don't match` });
      return
    }
    let user = await ModelByEntity("users").findOne({ _id, key })
    if(!user)
    {
      res.status(400).send({ message: 'Something went wrong. Please retry entire process' });
      return
    }
    const saltHash = genPassword(password);
    const { salt, hash } = saltHash
    await ModelByEntity("users").updateOne({ _id, renew_password_key: key }, {  hash: newHash, salt: newSalt } )
    
    const text=`You have successfully changed your GoGreen password.\nNow you can log in with the new credentials`
    const html=`You have successfully changed your GoGreen password.<br />Now you can log in with the new credentials`
    mailer.sendEmail(user.email, "GoGreen password renewed", text, html);

    res.status(200).send({ message: "Password renewed successfully" });
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})


//  ██████  ███████ ███████ ████████  ██████  ██████  ███████       ██████   █████  ███████ ███████ ██     ██  ██████  ██████  ██████  
//  ██   ██ ██      ██         ██    ██    ██ ██   ██ ██            ██   ██ ██   ██ ██      ██      ██     ██ ██    ██ ██   ██ ██   ██ 
//  ██████  █████   ███████    ██    ██    ██ ██████  █████   █████ ██████  ███████ ███████ ███████ ██  █  ██ ██    ██ ██████  ██   ██ 
//  ██   ██ ██           ██    ██    ██    ██ ██   ██ ██            ██      ██   ██      ██      ██ ██ ███ ██ ██    ██ ██   ██ ██   ██ 
//  ██   ██ ███████ ███████    ██     ██████  ██   ██ ███████       ██      ██   ██ ███████ ███████  ███ ███   ██████  ██   ██ ██████  
router.post('/restore-password', async (req, res, next) => {
  try{
    const email = req.body.email
    const redirect_url = req.body.redirect_url
    if(!(emailIsvalid(email)))
    {
      res.status(400).send({ message: 'Email invalid or not found' });
      return
    }
    let user = await ModelByEntity("users").findOne({ email })
    if(user)
    {
      res.status(400).send({ message: 'Email invalid or not found' });
      return
    }
    const key = crypto.randomBytes(60).toString('hex')
    const link = redirect_url + `?_id=${user.id}&key=${key}`
    await ModelByEntity("users").updateOne({ _id: user._id }, {  renew_password_key: key } )
    const text=`You are changing your GoGreen password\nPlease click on the link below and follow the instructions\n\n${link}`
    const html=`You are changing your GoGreen password<br />Please click on the link below and follow the instructions<br /><br />${link}`
    mailer.sendEmail(email, "Renew GoGreen password", text, html);

    res.status(200).send({ message: "Email sent" });
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})


module.exports = router