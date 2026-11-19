
function get_file_compliance(file_origin, workbook)
{
  switch(file_origin)
  {
    case 'stich':
      if(workbook.SheetNames.length === 0)
      {
        return "unexpected_number_of_sheets"
      }
      break

    case 'ecoinvent':
      if(workbook.SheetNames.length < 2)
      {
        return "unexpected_number_of_sheets"
      }
      if(workbook.SheetNames[1] !== 'LCIA')
      {
        return "lcia_sheet_not_found"
      }
      break
  }
  return ""
}

function recognize_the_data(file_origin, data)
{
  list = []
  const methods = {}
  
  // Extract Categories
  let row = data[0]
  delete row.Method
  let keys = Object.keys(row)
  for(let i=0; i<keys.length; i+=1)
  {
    const key = keys[i]
    methods[key] = {}
    methods[key].category = row[key]
  }

  // Extract Indicators
  row = data[1]
  delete row.Method
  keys = Object.keys(row)
  for(let i=0; i<keys.length; i+=1)
  {
    const key = keys[i]
    methods[key].indicator = row[key]
  }

  // Extract Unities
  const product_properties = []
  row = data[2]
  delete row.Method
  keys = Object.keys(row)

  for(let i=0; i<keys.length; i+=1)
  {
    const key = keys[i]
    if(methods.hasOwnProperty(key))
    {
      methods[key].unity = row[key]
    } else {
    product_properties.push(row[key])
    }
  }

  // Extract substance
  row = data[3]
  delete row.Method
  keys = Object.keys(row)
  for(let i=0; i<keys.length; i+=1)
  {
    const key = keys[i]
    methods[key].substance = row[key]
  }

  // Extract GoGreen Parameter codes
  row = data[4]
  delete row.Method
  keys = Object.keys(row)
  for(let i=0; i<keys.length; i+=1)
  {
    const key = keys[i]
    methods[key].gogreen_parameter_code = row[key]
  }

  const start_row = file_origin === 'stich' ? 5 : 3
  for(let r=start_row; r<data.length; r+=1)
  {
    row = data[r]
    const product = {}

    switch(file_origin)
    {

      case 'stich':
        product.type = row['__EMPTY'] 
        product.uuid = row['__EMPTY_1'] 
        product.name = row['__EMPTY_1']
        product.activity_name = row['__EMPTY_2']
        product.active = row['__EMPTY_2'] !== undefined && String(row['__EMPTY_2']).trim() !== ''
        product.geography = row['__EMPTY_3']
        product.reference_unit = row['__EMPTY_4']
        product.reference_amount = row['Method']
        product.physical_state = ''
        break

      case 'ecoinvent':
        product.uuid = row['__EMPTY_1'] 
        product.activity_name = row['__EMPTY_1']
        product.geography = row['__EMPTY_2']
        product.name = row['__EMPTY_3']
        product.reference_unit = row['__EMPTY_4']
        product.reference_amount = row['Method']
        product.physical_state = ''
        product.active = product.activity_name === ''
        break
    }

    product.lca_data = []
    const method_keys = Object.keys(methods)
    for(let k=0; k<method_keys.length; k+=1)
    {
      const method_key = method_keys[k]
      const obj = methods[method_key]
      obj.value = row[method_key]
      product.lca_data.push(obj)
      
    }
    list.push(JSON.parse(JSON.stringify(product)))
  }

  return { methods, product_properties, list }

}


module.exports = {
  get_file_compliance,
  recognize_the_data,
}