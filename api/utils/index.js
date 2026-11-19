const users = require('../models/entities/users')


function ucFirst(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function objectLowerCase(obj){
  const keys = Object.keys(obj);
  for(const key of keys){
    obj[key] = obj[key].toLowerCase()
  }
  return obj;
}

function fbe(req){
  const fields = {}
  const keys = Object.keys(req.body);
  for(const key of keys){
    fields[key] = req.body[key];
  }
  return fields
}

function getEntityFromReq(req) {
    url = req.originalUrl
    const v = url.split("/")
    let entity = "";
    if(v.length>=4){
      const w = v[3].split("?")
      entity = w[0];
    }
    return entity;
}

function parseJwt (access_token) {
  if(!access_token || access_token==null || access_token==undefined || access_token === 'undefined' || access_token === ''){
    return {}
  }
  const v = access_token.split('.')
  if(v.length<2){
    return {}
  }
  return JSON.parse(Buffer.from(v[1], 'base64').toString());
}

async function goCheckToken(access_token) {
  const access_token_parsed = parseJwt(access_token)
  const { unique_name, appid } = access_token_parsed
  
  const data = {
    status: 200,
    authorized: true,
    message: ""
  }
  if(appid != process.env.AZURE_APP_ID)
  {
    data.status = 400
    data.authorized = false
    data.message = "E001 - Configuration error. Please contact technical support"
  }

  let user = await users.findOne({ email: unique_name })
  let userToSend = {}
  if(!user || user === null || user === undefined)
  {
    data.status = 401
    data.authorized = false
    data.message = "E002 - You do not have permission to access this platform. Please contact technical support"
  } else {
    userToSend._id = user._id
    userToSend.email = user.email
    userToSend.name = user.name
  }
  return { data, user:userToSend }
}

function getTokenFromHeaders(headers) {
  const { authorization } = headers || {}
  if (typeof authorization === 'undefined') {
    return false
  }
  const access_token =  authorization.replace("Bearer", "").trim()
  return access_token
}

async function getUserFromToken(access_token){
  const access_token_parsed = parseJwt(access_token)
  const { unique_name } = access_token_parsed
  let user = await users
    .aggregate([
      {
        $lookup: 
        {
          from: "roles",
          localField: "role_id",
          foreignField: "_id",
          as: "role_obj",
          pipeline: [
            {
              $project: {
                name:1
              }
            }
          ]
        }
      },
      {
        $set: 
        {
          role_name: { $arrayElemAt: [ "$role_obj.name", 0 ] }
        }
      },
      {
        $match: {
          $and:[
            {
              deletedAt: null
            },
            {
              email: unique_name
            }
          ]
        }
      }
    ])
    .exec()
  user = user.length == 1 ? user[0] : false
  return user
}

async function checkSystem(){

}

async function emailIsvalid(email){
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function nowTimeStamp()
{
  const now = new Date();
  const formattedTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');
  return formattedTimestamp
}

module.exports = {

  // ______________________________________________________ Strings
  ucFirst,
  objectLowerCase,
  fbe,
  getEntityFromReq,
  parseJwt,
  goCheckToken,
  getTokenFromHeaders,
  getUserFromToken,
  checkSystem,
  emailIsvalid,
  nowTimeStamp
}