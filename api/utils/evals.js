const Models = require('../models');
const Controllers = require('../controllers');
const { ucFirst } = require('.');

function Model(req){
  url = req.originalUrl
  const v = url.split("/")
  const w = v[3].split('?')
  return Models[w[0]];
}

function ModelByEntity(entity){
  return Models[entity];
}

function Controller(req){
  url = req.originalUrl
  const v = url.split("/")
  const w = v[3].split('?')
  return Controllers[w[0]];
}

module.exports = {
  Model,
  ModelByEntity,
  Controller,
}