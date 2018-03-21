const express = require('express')
const app = express()

app.init = () => {
	const expressFileupload = require('express-fileupload')
	app.use(expressFileupload())
	
	require('./routes')(app)
}

module.exports = app