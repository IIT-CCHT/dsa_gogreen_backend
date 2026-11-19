const express = require('express');
const router = express.Router();
const { menu } = require(`../utils/menu`)
const {  getTokenFromHeaders, getUserFromToken } = require('../utils');


//  ██████   ██████  ███████ ████████ 
//  ██   ██ ██    ██ ██         ██    
//  ██████  ██    ██ ███████    ██    
//  ██      ██    ██      ██    ██    
//  ██       ██████  ███████    ██    

router.post('/', async (req, res, next) => {
  try{
    
    let data = {}

    const access_token =  await getTokenFromHeaders(req.headers)
    const user = await getUserFromToken(access_token)
    const { role_name: user_logged_role } = user || [{}]

    const menu_parsed = []
    for(let i=0; i<menu.length; i+=1)
    {
      const item = menu[i]
      const { roles } = item
      for(let j=0; j<roles.length; j+=1)
      {
        const role = roles[j]
        if(role === '*' || role === user_logged_role)
        {
          const itemParsed = {...item}
          delete itemParsed.roles
          menu_parsed.push(itemParsed)
          break
        }
      }
    }
    data.menu = menu_parsed

    data.authentication_mode = process.env.AUTHENTICATION_MODE

    res.status(201).json(data)
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

module.exports = router;