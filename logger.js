// Custom middleware applied on all routes
function log(req, res, next) {
    console.log('Logging...');
    next();
}

module.exports = log;