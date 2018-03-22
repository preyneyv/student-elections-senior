const express = require('express')
const path = require('path')

const clientController = require("../controllers/clientController")
const teachersController = require("../controllers/teachersController")

module.exports = app => {
	app.use(express.static(path.resolve(__dirname, "../client/static")))

	app.use('/images', express.static(studentElectionsJunior.imagesDir))

	app.post('/api/check', clientController.check)
	app.get('/api/fetch', clientController.fetch)
	app.post('/api/submit', clientController.submit)

	app.post('/teachers/api/check', teachersController.check)
	app.get('/teachers/api/fetch', teachersController.fetch)
	app.post('/teachers/api/submit', teachersController.submit)
}