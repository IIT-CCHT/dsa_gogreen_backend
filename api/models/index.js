const users = require('./entities/users');
const accounts = require('./entities/accounts');
const actions = require('./entities/actions');
const ecoinvent_versions = require('./entities/ecoinvent_versions');
const materials = require('./entities/materials');
const green_parameters = require('./entities/green_parameters');
const green_parameter_groups = require('./entities/green_parameter_groups');
const materials_fake = require('./entities/materials_fake');
const object_dimensions = require('./entities/object_dimensions');
const processes = require('./entities/processes');
const resources = require('./entities/resources');
const techniques = require('./entities/techniques');
const roles = require('./entities/roles');
const settings = require('./entities/settings');
const workbenches = require('./entities/workbenches');

module.exports = {
  users,
  accounts,
  actions,
  ecoinvent_versions,
  materials,
  green_parameters,
  green_parameter_groups,
  materials_fake,
  object_dimensions,
  processes,
  resources,
  techniques,
  roles,
  settings,
  workbenches
}