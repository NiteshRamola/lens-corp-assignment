const { unauthorizedErrorResponse } = require('../utils/response');

module.exports = (roles) => (req, res, next) => {
  console.log(roles, req.user.role);
  if (!roles.includes(req.user.role)) {
    return unauthorizedErrorResponse(res, 'Access Denied!', 403);
  }
  next();
};
