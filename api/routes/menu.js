const express = require('express');
const router = express.Router();
var passport = require('passport');

const menu = [
    {
      slug:'product_comparison',
      icon:'compare',
      roles: '*',
      icon_admin: false
    },
    {
      slug: 'workspace',
      icon: 'workspace',
      roles: '*',
      icon_admin: false
    },
    {
      slug: 'materials',
      icon: 'pencil',
      roles: ['administrator','bigone'],
      icon_admin: true
    },
  ]

router.get('/', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  try{
    const { role_slug } = req.user
    // console.log('role_slug', role_slug)
    // console.log('menu', menu)
    const menu_to_return = menu.filter(item => {
      if(item.roles === '*')
      { 
        return true
      }
      if(Array.isArray(item.roles))
      {
        return item.roles.includes(role_slug)
      }
    })
    // console.log('menu_to_return', menu_to_return)
    res.status(201).json(menu_to_return.map(({ roles, ...rest }) => rest))
  }
  catch (err) {
    console.log('err', err)
    res.status(500).json({err})
  }
})



module.exports = router;