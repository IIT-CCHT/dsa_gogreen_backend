async function customAggregations()  
{
  return [
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
      },
    },
    {
      $set: 
      {
        role_name: { 
          $arrayElemAt: [ "$role_obj.name", 0 ] 
        }
      }
    },
  ]
}

async function addOns(model, list)  {
}

async function beforeCreate(req, res, next) {
}

async function beforeUpdate(req, res, next) {
}

module.exports = {
  customAggregations,
  addOns,
  beforeCreate,
  beforeUpdate
}