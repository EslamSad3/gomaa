const jwt = require('jsonwebtoken');
const SuperUser = require('../models/SuperUser');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === 'super_admin') {
      user = await SuperUser.findOne({ 
        _id: decoded._id, 
        tenant_id: decoded.tenant_id 
      });
    } else {
      user = await SuperUser.findOne({ 
        _id: decoded._id, 
        tenant_id: decoded.tenant_id 
      });
    }

    if (!user) {
      throw new Error("User not found");
    }

    req.token = token;
    req.user = user;
    req.tenant_id = decoded.tenant_id;
    next();
  } catch (error) {
    console.log(error,"error");
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;