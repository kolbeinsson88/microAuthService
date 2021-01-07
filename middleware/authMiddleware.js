const jwt = require('kolbeinsson88-jwt');
const userService = require('../services/userService');

const validate = (token) => {
    return (jwt.verifyJasonWebToken(token, "secret key 11 characters") === false) || (token === undefined);
}

/**
 * Checks if you have a valid token. If so then you are 
 * a verified user
 */
const authMiddleware = (request, response, next) => {
    const token = request.headers["authorization"];

    if (validate(token)) return response.status(401).send();

    next();
};

/**
 * Use token claims to check if user is admin
 */
const authAdmin = (request, response, next) =>{
    const token = request.headers["authorization"];


    if (validate(token)) return response.status(401).send();

    const decode = jwt.decodeJasonWebToken(token);
    if (decode["error"]) return response.status(412).send();
    
    if (decode["payload"] !== undefined) {
        const { id } = decode.payload;
        const user = userService.fetchById(id, 'users');
        if (user[0] !== undefined && user[0].admin === false) return response.status(401).send(); 
    }
    next();
}

module.exports = {
    authMiddleware,
    authAdmin
}