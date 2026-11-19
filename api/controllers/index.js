const actions = require('./entities/actions');
const green_parameters = require('./entities/green_parameters');
const green_parameter_groups = require('./entities/green_parameter_groups');
const ecoinvent_products = require('./entities/ecoinvent_products');
const ecoinvent_versions = require('./entities/ecoinvent_versions');
const materials = require('./entities/materials');
const object_dimensions = require('./entities/object_dimensions');
const processes = require('./entities/processes');
const techniques = require('./entities/techniques');
const users = require('./entities/users');
const roles = require('./entities/roles');
const settings = require('./entities/settings');
const workbenches = require('./entities/workbenches');

module.exports = {
  actions,
  green_parameters,
  green_parameter_groups,
  ecoinvent_products,
  ecoinvent_versions,
  materials,
  object_dimensions,
  processes,
  techniques,
  users,
  roles,
  settings,
  workbenches
}