const express = require('express');
const router = express.Router();
const axios = require('axios');

// https://nominatim.openstreetmap.org/search?q=London&format=json

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


router.get('/', async (req, res, next) => {
  try{
    let { suggestion } = req.query

    if (!suggestion) {
      return res.status(400).json({ error: 'Missing suggestion query param' });
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: suggestion,
        format: 'json'
      },
      headers: {
        'User-Agent': 'GoGreen App/1.0 (info@gogreenconservation.eu)' // Nominatim richiede un user-agent
      }
    });

    const { data } = response
    const list = data.map(({display_name,lat,lon}) => ({display_name,lat,lon}))

    res.status(200).json({ list })
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

router.post('/', async (req, res, next) => {
  try{
    let { from, to } = req.body
    const { lat: from_lat, lon: from_lon } = from
    const { lat: to_lat, lon: to_lon } = to
    distance_in_km = Math.round(haversine_formula(from_lat, from_lon, to_lat, to_lon))
    if (distance_in_km <= 19) {
      distance_assessment = 1;
    } else if (distance_in_km <= 99) {
      distance_assessment = 3;
    } else if (distance_in_km <= 499) {
      distance_assessment = 5;
    } else if (distance_in_km <= 999) {
      distance_assessment = 7;
    } else {
      distance_assessment = Number.isNaN(distance_in_km) ? '' : 10;
    }
    console.log('XXX', '['+distance_in_km+']', '['+distance_assessment+']')
    res.status(200).json({ distance_in_km,  distance_in_km_assessment: distance_assessment })
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})

module.exports = router;