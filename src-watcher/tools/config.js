/**
 * Load the config files
 */

const fs = require('fs');

const NODE_ENV = process.env.NODE_ENV || 'default';
const config = JSON.parse(fs.readFileSync(__dirname + '/../config/config-' + NODE_ENV + '.json', 'utf8'));
module.exports = config;
