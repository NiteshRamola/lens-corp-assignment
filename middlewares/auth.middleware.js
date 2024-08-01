const jwt = require('jsonwebtoken');
const redis = require('../config/redis.config');
const { unauthorizedErrorResponse } = require('../utils/response');

module.exports = async (req, res, next) => {
  const accessToken = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    return unauthorizedErrorResponse(res, 'Access Denied! No token provided.');
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (!refreshToken) {
      return unauthorizedErrorResponse(res, 'Access Denied! Token expired');
    }

    try {
      const id = await redis.get(refreshToken);
      if (!id) {
        return unauthorizedErrorResponse(res, 'Access Denied! Token expired');
      }

      const decodedRefreshToken = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
      );

      const newAccessToken = jwt.sign(
        { _id: decodedRefreshToken._id, email: decodedRefreshToken.email },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE,
        },
      );

      res.cookie('token', newAccessToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 60 * 60 * 1000,
      });

      req.user = decodedRefreshToken;
      next();
    } catch (error) {
      return unauthorizedErrorResponse(res, 'Access Denied! Token expired');
    }
  }
};
