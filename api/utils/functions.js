const fsPromises = require('fs').promises;
const fs = require('fs');

function haversine_formula(lat1, lon1, lat2, lon2) {
  
  const R = 6371; // raggio della Terra in km
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distanza in km
}

function file_extension(file)
{
  const v = file.split(".")
  return v[v.length-1]
}

function file_type(file)
{
  switch(file_extension(file).toLowerCase())
  {
    case "jpg":
    case "jpeg":
    case "gif":
    case "png":
    case "tiff":
    case "raw":
      return "image"
    case "pdf":
      return "pdf"
    case "doc":
      return "doc"
    case "docx":
      return "docx"
    case "txt":
      return "txt"
    case "csv":
      return "csv"
    case "xls":
      return "xls"
    case "xlsx":
      return "xlsx"
    default:
      return "document"
  }
}

function file_contentType(file_name)
{
  const type = file_type(file_name)
    switch(type)
    {
      case 'image':
        return "image/jpg"
      case 'pdf':
        return "application/pdf"
      case 'doc':
        return 'application/msword'; // Per file .doc (Word 97-2003)
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // Per file .docx (Word 2007+)
      case 'xls':
        return 'application/vnd.ms-excel'; // Per file .xls (Excel 97-2003)
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // Per file .xlsx (Excel 2007+)
      case 'csv':
        return 'text/csv'; // Per file .csv
      case 'txt':
        return 'text/plain'; // Per file .txt
      default:
        return 'application/octet-stream'; // Tipo predefinito per file sconosciuti  
    }
}

function file_replace_contentType(file, original_file_name)
{
  let data = file
  switch(file_type(original_file_name))
  {
    case 'image':
      data = file.replace(/^data:image\/\w+;base64,/, '') 
      break
    case 'pdf':
      data = file.replace(/^data:application\/pdf;base64,/, '') 
      break
    case 'doc':
      data = file.replace(/^data:application\/msword;base64,/, '');
      break;
    case 'docx':
      data = file.replace(/^data:application\/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,/, '');
      break;
    case 'xls':
      data = file.replace(/^data:application\/vnd.ms-excel;base64,/, '');
      break;
    case 'xlsx':
      data = file.replace(/^data:application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,/, '');
      break;
    case 'csv':
      data = file.replace(/^data:text\/csv;base64,/, '');
      break;
    case 'txt':
      data = file.replace(/^data:text\/plain;base64,/, '');
      break;
  }
  return data
}

async function build_file_path(custom_path)
{
  let path = process.env.FILE_PATH + custom_path
  if (!fs.existsSync(path)) {
    await fs.mkdirSync(path,  { recursive: true });
  }
  return path
}

function datetimeNow()
{
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // I mesi vanno da 0 a 11
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDateTime
}

function objectify(vett, key)
{
  let obj = {}
  for(let i=0; i<vett.length; i+=1)
  {
    const item = vett[i]
    obj[item[key]] = item
  }
  return obj
}

function datetimeToIta(datetime)
{
  if(datetime === undefined || datetime === null)
  {
    return ''
  }
  const v = datetime.split(' ')
  const w = v[0].split('-')
  return w[2]+'/'+w[1]+'/'+w[0]+' '+ (v.length>1 ? v[1] : '')
}

module.exports = {
  file_extension,
  file_type,
  file_contentType,
  file_replace_contentType,
  build_file_path,
  datetimeNow,
  objectify,
  datetimeToIta,
  haversine_formula
}