const { data } = require('../data/user');
const crypto = require('crypto');
const jwt = require('kolbeinsson88-jwt');

const common = require('./common');


const userService = () => {
    const createHash = (password) => {
        if (typeof(password) !== "string" && typeof(salt) !== "string") {
            return new TypeError("Missing paramters.");
        }
        const salt16Bytes = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt16Bytes, 100000, 64, 'sha512').toString('hex');
        return hash ? { hash, salt: salt16Bytes } : new Error("Failed to generate hash.");
    };

    const passwordMatch = (password, hashPassword, salt) => {
        if (typeof(password) !== "string" && typeof(salt) !== "string") {
            return new TypeError("Missing paramters.");
        }
        const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
        return (hash === hashPassword);
    };

    const createToken = (user) => {
        const { id, firstName, lastName, username, admin } = user;
        const payload = { id, username, firstName, lastName, admin };
        return jwt.jsonWebToken({alg: "hs256", typ: "jwt"}, { ...payload }, "secret key 11 characters");
    };

    const fetchById = (id, key) => {
        return common.fetchWithPredicate(data, (i) => (i.id == id), key);
    };

    const updateUser = (id, user, key) => {
        const users = fetchById(id, 'users');
        if (users.length === 0) return -1;
        data[key].forEach(element => {
            if (id == element.id) {
                element.username = user.username;
                element.firstName = user.firstName;
                element.lastName = user.lastName;
                element.admin = user.admin;
                element.updated = Date();
            }
        });
        return 0;
    };

    const deleteUser = (id, key) => {
        data[key] = data[key].filter(user => user.id != id);
        const users = fetchById(id, 'users');
        if (users.length !== 0) return -1;
        return users;
    };
    
    const fetchByUsername = (username, key) => {
        const user = common.fetchWithPredicate(data, (i) => (i.username == username), key);
        if (user.length === 0) return -1;
        return user;
    };

    const fetchAllByKey = (key) => {
        return common.fetchWithPredicate(data, ((i) => i), key);
    };

    const confirmPassword = (password, passwordConfirm) => {
        return (password === passwordConfirm);
    };

    const validatePassword = () => {
        if (typeof(body.password) !== "string" || body.password === undefined || body.password.length < 4) {
            return { error: 'Password field needs to be a valid string of length 5 characters or more.' };
        }
        if (typeof(body.confirmPassword) !== "string" || body.confirmPassword === undefined || body.confirmPassword.length < 4) {
            return { error: 'Password field needs to be a valid string of length 5 characters or more.' };
        }
        if (body.confirmPassword !== body.password) {
            return { error: 'Password mismatch.' };
        }

        return {};
    };

    const validateUser = (body) => {
        if (typeof(body) !== "object" || body === undefined) {
            return { error: 'Invalid form data.' };
        }
        if (typeof(body.username) !== "string" || body.username === undefined || body.username.length < 3) {
            return { error: 'Username needs to be a valid string of length 3 characters or more.' };
        }
        if (typeof(body.firstName) !== "string" || body.firstName === undefined || body.firstName.length < 3) {
            return { error: 'First name needs to be a valid string of length 3 characters or more.' };
        }
        if (typeof(body.lastName) !== "string" || body.lastName === undefined || body.lastName.length < 3) {
            return { error: 'Last name needs to be a valid string of length 3 characters or more.' };
        }
        if (typeof(body.admin) !== "boolean" || body.admin === undefined) {
            return { error: 'Missing field admin.' };
        }
        if (body.created === undefined || typeof(body.created) !== "string") {
            return { error: 'Unable to tell when the user was created' };
        }
        if (body.updated === undefined || typeof(body.updated) !== "string") {
            return { error: 'Unable to tell when the user was updated' };
        }
  
        return {};
    };

    const createUser = (user, key) => {
        return common.addByKey(user, key);
    };

    return {
        createHash,
        passwordMatch,
        fetchById,
        fetchAllByKey,
        fetchByUsername,
        validateUser,
        confirmPassword,
        validatePassword,
        createUser,
        updateUser,
        deleteUser,
        createToken
    }
}

module.exports = userService();