const bcrypt = require('bcryptjs');
const User = require('../models/user.model.js');



const verifyPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { verifyPassword };

