const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { entities } = require(`../utils/entities`)
const { Model, Controller, ModelByEntity } = require('../utils/evals');
const { getEntityFromReq, getTokenFromHeaders, getUserFromToken } = require('../utils');
var passport = require('passport');


//   ██████  ███████ ████████ 
//  ██       ██         ██    
//  ██   ███ █████      ██    
//  ██    ██ ██         ██    
//   ██████  ███████    ██    

router.get('/:entity', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  let fase = 0
  try{
    fase = "1"
    const entityName = getEntityFromReq(req)
    fase = "1.a"
    const entityData = entities[entityName]
    fase = "1.b"
    const { layout } = entityData
    fase = "1.c"
    const { columns } = layout
    fase = "1.d"
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit === undefined ? 5 : limit
    fase = 2
    const sort = {}
    let { sort: sortQuery } = req.query
    sortQuery = !sortQuery || sortQuery === '' ? '-_id' : sortQuery
    const vSort = sortQuery.split(",")
    for(let i=0; i<vSort.length; i+=1){
      let item = vSort[i]
      const sortValue = item.charAt(0) === '-' ? -1 : 1
      item = item.charAt(0) === '-' ? item.substring(1) : item
      sort[item] = sortValue
    }
    fase = 3
    let search = req.query.search || '';

    // Or Query
    let orQuery = []
    // for(let i=0; i<columns.length; i+=1){
    //   const column = columns[i]
    //   if(column.type === 'field' && column.visible === true && search !== '')
    //   {
    //     orQuery.push({ [column.name]: {$regex: search, $options: "i"}}) // i=case insensitive
    //   }
    // }

    // QUesta sostituisce quella qui sopra che non funziona se il campo non è string
    const stringFields = [
      "name",
      "activity_name",
      "reference_unit",
      "material_unit",
      "type"
    ];

    orQuery = stringFields.map(field => ({
      [field]: { $regex: search, $options: "i" }
    }));
    fase = 4

    // And Query
    const andQuery = []
    const keys = Object.keys(req.query)
    for(let i=0; i<keys.length; i+=1){
      const key = keys[i]
      const column = columns.find(obj => obj.name === key)
      const item = req.query[key]
      const itemKeys = Object.keys(item)
      for(let j=0; j<itemKeys.length; j+=1){
        const itemKey = itemKeys[j]
        if(itemKey === 'like')
        {
          const value = item.like    
          andQuery.push({ [key]: {$regex: value, $options: "i"}}) // i=case insensitive
        }
        if(itemKey === 'between')
        {
          const value = item.between.replace("[", "").replace("]", "").split(",")
          let value0 = value[0]
          let value1 = value[1]
          value0 = column.type === 'date' ? new Date(value0+' 00:00:00 GMT-0000') : value0
          value1 = column.type === 'date' ? new Date(value1+' 23:59:59 GMT-0000') : value1
          andQuery.push({ [key]: {$gte: value0}})
          andQuery.push({ [key]: {$lte: value1}})
        }
        if(itemKey === 'or')
        {
          let value = item.or.replace("[", "").replace("]", "").split(",")
          value = value.map(function(el) { return new mongoose.Types.ObjectId(el) })
          andQuery.push({[column.filter_field_name]: { $in: value}})
        }
      }
    }
    fase = 5

    // Project object
    let projectObj = { $project: {} }
    for(let i=0; i<columns.length; i+=1){
      const column = columns[i]
      projectObj.$project[column.name] = 1
    }
    fase = 6
    projectObj.$project.createdAtParsed = { $dateToString: { format: "%m/%d/%Y", date: "$createdAt" } }
    fase = "6.2"
    // AGGREGATIONS
    const start = (page-1) * limit
    fase = "6.3"
    const customAggregatons = await Controller(req).customAggregations();
    
    fase = "6.4"
    const matchItems = {
                        $and:[
                          {
                            deletedAt: null
                          },
                        ].concat(andQuery)
                      }
    if(orQuery.length > 0) { matchItems.$or = orQuery}
    fase = "6.5"
    const matchObj = { $match: matchItems }
    fase = 7
    let aggregateArray = [projectObj]
    fase = "7.a"
    try {
      if(customAggregatons){ aggregateArray = aggregateArray.concat(customAggregatons)}
    } catch(e) {
      console.log('e', e)
    }
    
    fase = "7.b"
    if(matchObj){ aggregateArray.push(matchObj)}
    fase = "7.c"
    const count = await Model(req)
        .find(
          matchItems
        )
        .countDocuments()
        .exec();
    fase = "7.d"
    const list = await Model(req).aggregate(
                    aggregateArray
                  )
                  .skip(start)
                  .limit(limit)
                  .collation({ locale: "en", strength: 2 })
                  .sort(sort)
                  .exec();
    fase = "7.e"
    const pages = Math.ceil(count / limit)
    fase = "7.f"
    const groupCount = 5;
    let group = 0;
    fase = 8
    while(group * groupCount<page){
      group+=1
    }
    group = group===0 ? 0 : group-=1

    const groupFirstVisiblePage = ((group)*groupCount)+1
    const groupLastVisiblePage = ((group)*groupCount)+groupCount

    const prevGroupPage = groupFirstVisiblePage>groupCount ? page-groupCount : false
    const nextGroupPage = groupLastVisiblePage<pages ? page+groupCount : false

    fase = 9
    let pageList = []
    for(let i=groupFirstVisiblePage; i<=groupLastVisiblePage; i++){
      if(i>pages){
        break;
      }
      pageList.push(i)
    }
    fase = 10
    const pagination = {
      page,
      pages,
      limit,
      prevGroupPage,
      nextGroupPage,
      pageList
    }

    //await Controller(req).addOns(Model(req), list);
    fase = 11
    const data = {
      entityData,
      list,
      count,
      pagination
    }     
    const response = {
      data,
    }
    fase = 12
    res.status(200).json(response)
  }

  catch (err) {
    console.log('err', err)
    res.status(500).json({err, fase, url: req.originalUrl})
  }
})



//   ██████  ███████ ████████     ██████  ██    ██     ██ ██████  
//  ██       ██         ██        ██   ██  ██  ██      ██ ██   ██ 
//  ██   ███ █████      ██        ██████    ████       ██ ██   ██ 
//  ██    ██ ██         ██        ██   ██    ██        ██ ██   ██ 
//   ██████  ███████    ██        ██████     ██        ██ ██████  

router.get('/:entity/:itemId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  const entityName = getEntityFromReq(req)
  const entityData = entities[entityName]

  const itemId = req.params.itemId;
  try{
    const data = 
      await Model(req)
        .findById(itemId)
        .exec();
    if(data){
      obj = {}
      obj.entityData = entityData
      obj.data = data
      res.status(200).json({ data, entityData})
    } else {
      res.status(404).json()
    }
  }
  catch (err) {
    res.status(404).json()
  }
})



//  ██████   ██████  ███████ ████████ 
//  ██   ██ ██    ██ ██         ██    
//  ██████  ██    ██ ███████    ██    
//  ██      ██    ██      ██    ██    
//  ██       ██████  ███████    ██    

router.post('/:entity', passport.authenticate('jwt', {session: false}), async (req, res, next) => {

  let err = undefined
  err = await Controller(req).beforeCreate(req, res, next);
  if(err !== undefined){
    res.status(err.status).json(err)
    return
  }

  try{
    const fields = {}
    const keys = Object.keys(req.body);
    for(const key of keys){
      fields[key] = req.body[key];
    }
    fields._id = new mongoose.Types.ObjectId()
    fields.createdAt = new Date()
    fields.createdBy = null
    fields.updatedAt = null
    fields.updatedBy = null
    fields.deletedAt = null
    fields.deletedBy = null
    const item = new Model(req)(fields);
    const data = await item.save();
    res.status(201).json(data)
  }
  catch (err) {
    if("code" in err){
      const { code, keyPattern } = err
      err.errors = {}
      const keys = Object.keys(keyPattern)
      for(let i=0; i<keys.length; i++){
        const key = keys[i]
        err.errors[key] = {}
        err.errors[key].message = ''
        switch(code){
          case 11000:
            err.errors[key].message = 'This email already exists in the archive. Please choose another one'
            break;
        }
      }
    }
    console.log('err', err)
    res.status(500).json({err})
  }
})



//  ██████  ██    ██ ████████ 
//  ██   ██ ██    ██    ██    
//  ██████  ██    ██    ██    
//  ██      ██    ██    ██    
//  ██       ██████     ██    

router.put('/:entity/:itemId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  const access_token =  await getTokenFromHeaders(req.headers)
  const user = await getUserFromToken(access_token)

  let err = undefined
  err = await Controller(req).beforeUpdate(req, res, next);
  if(err !== undefined){
    res.status(err.status).json(err)
    return
  }

  try{
    const itemId = req.params.itemId;
    const fields = {}
    const keys = Object.keys(req.body);
    for(const key of keys){
      fields[key] = req.body[key];
    }
    fields.updatedAt = new Date()
    fields.updatedBy = user._id
    const data = 
      await Model(req)
        .findByIdAndUpdate({_id:itemId}, fields);
    res.status(201).json({
      message: 'Item updated'
    })
  }
  catch(err){
    res.status(500).json({err})
  }
})




//  ██████  ███████ ██      ███████ ████████ ███████ 
//  ██   ██ ██      ██      ██         ██    ██      
//  ██   ██ █████   ██      █████      ██    █████   
//  ██   ██ ██      ██      ██         ██    ██      
//  ██████  ███████ ███████ ███████    ██    ███████ 

router.delete('/:entity/:itemId', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  try{
    const itemId = req.params.itemId;
    const data = 
      await Model(req)
        .findById(itemId)
        .exec();
    data.deletedAt = new Date
    data.deletedBy = ""
    const response = 
      await Model(req)
        .findByIdAndUpdate(
          {_id:itemId}, 
          data
        );
    res.status(200).json({
      message: 'Item with id '+itemId+' was deleted sucessfully'
    });
  }
  catch (err) {
    res.status(500).json({err})
  }
})

module.exports = router;