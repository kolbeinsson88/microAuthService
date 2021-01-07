const express = require('express');
const jwt = require('kolbeinsson88-jwt');
const common = require('../services/common');

const userService = require('../services/userService');
const { authMiddleware, authAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users/:id', (request, response) => {
    const user = userService.fetchById(request.params.id, 'users');
    if(user.length === 0) return response.status(404).send();
    return response.status(200).json(user);
});

router.get('/users', (request, response) => {
    const users = userService.fetchAllByKey('users');
    return response.status(200).json({ users });
});

router.put('/users/:id', authAdmin, (request, response) => {
    const success = userService.updateUser(request.params.id, request.body, 'users');
    if (success === -1) return response.status(404).send();
    return response.status(204).send();
});

router.delete('/users/:id', authAdmin, (request, response) => {
    const success = userService.deleteUser(request.params.id, 'users');
    if (success === -1) return response.status(404).send();
    return response.status(204).send();
});

router.get('/info', authMiddleware, (request, response) => {
    const token = jwt.decodeJasonWebToken(request.headers["authorization"]);
    response.status(200).json({ headers: token.header, payload: token.payload });
});

/**
 * You will genarate a salt using a 16 bytes of random data
 * You will then append your salt to your password and obtain a salted password.
 * Then you will encrypt your password using a cryptographic algorighm.
 * Once you have registered a user you will store the hashed password and fixed salt 
 * in the database so each password has a different salt. Once you login you will 
 * fetch the hash password from a database and rehash the login
 * password, then you will compare the hash login password and the hashed database password
 * if they match you have provided the correct password.
 * 
 * Another way to use a fixed salt is deterministic by generating a fixed salt from the username.
 * 
 * Another way I understand salt is a random string of data that is derived from user info such as username
 * that can be base64 encoded and encrypted using sha256 cryptographic algorithm, thus providing salt. However
 * if you change your username you will need to update your salt.
 */
router.post('/register', (request, response) => {

    const { username, firstName, lastName, admin, password, confirmPassword } = request.body;

    const hash = userService.createHash(password);
    const user = {};
    const id = userService.fetchAllByKey('users').length + 1;
    Object.assign(user, { id: id, username, firstName, lastName, admin, hash: hash.hash, salt: hash.salt, created: Date(), updated: Date(), admin: false });
    const userError = userService.validateUser(user);
    const verifyUsername = userService.fetchByUsername(username, 'users');
    const verifyPassword = userService.confirmPassword(password, confirmPassword);
    
    if(verifyUsername !== -1) return response.status(409).send();
    if (verifyPassword === false) return response.status(400).send();
    if(userError["error"] !== undefined) return response.status(400).send();
    
    const token = userService.createToken(user);
    return response.status(200).json({ user: common.addByKey(user, 'users'), token });

});

router.post('/login', (request, response) => {
    const { username, password, confirmPassword } = request.body;

    const user = userService.fetchByUsername(username, 'users');
    if (user === -1) return response.status(404).send();
    const verifiedUser = user[0];
    const userError = userService.validateUser(verifiedUser);

    if(userError["error"] !== undefined) return response.status(400).send();

    const verifyMatch = userService.confirmPassword(password, confirmPassword);
    if (verifyMatch === false) return response.status(400).send();
    
    const validPassword = userService.passwordMatch(password, verifiedUser.hash, verifiedUser.salt);
    if (validPassword === false) return response.status(400).send();

    return response.status(200).json({ status: 200, token: userService.createToken(verifiedUser) });    
});

module.exports = router;


