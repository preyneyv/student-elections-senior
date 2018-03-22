const express = require('express')
const path = require('path')

const clientController = require("../controllers/clientController")

module.exports = app => {
	app.use(express.static(path.resolve(__dirname, "../client/static")))

	app.use('/images', express.static(studentElectionsJunior.imagesDir))

	app.post('/api/check', clientController.check)
	app.get('/api/fetch', clientController.fetch)
	app.post('/api/submit', clientController.submit)
}