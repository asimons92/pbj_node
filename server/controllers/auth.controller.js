// Auth controller - contains handler functions for auth routes

const getUsers = async (req, res) => {
    try {
        res.json({ 
            status: 'API operational',
            message: 'This is the get route for users collection'
        });
    } catch (error) {

    }
};

module.exports = {
    getUsers
};