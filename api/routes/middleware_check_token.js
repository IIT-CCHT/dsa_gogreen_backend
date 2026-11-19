const express = require('express');
const router = express.Router();
const { goCheckToken, getTokenFromHeaders } = require('../utils');

const message = "It appears you are not authenticated to the system. You will now be redirected to the login page"

router.all('*', async (req, res, next) => {
  /*const access_token =  getTokenFromHeaders(req.headers)
  if(!access_token || access_token==null || access_token==undefined || access_token === 'undefined' || access_token === ''){
    // TODO! Sta cosa è orribile, ma non capisco come mai frontend-environment arrivi 2 volte e la prima sia privo di Token ???
    //       Faccio quindi finta che sia un OPTIONS
    if(req.originalUrl === '/api/frontend-environment/' || req.originalUrl === '/api/check-token/' ){
      res.status(200).send();
      return false 
    }
    res.status(401).send({ message });
    return false
  }
  const data = await goCheckToken(access_token)

  if(data.authorized === false){
    res.status(data.status).send(data)
    return false 
  }
   */
  next()
})



module.exports = router