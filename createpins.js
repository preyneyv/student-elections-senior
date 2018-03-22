global.studentElectionsSenior = require('./config')
const { Management } = require('./database')

for (var i = 0; i < 20; i++) {
	const management = new Management({
		pin: ("0000" + i).substr(-4,4),
		name: "Management"
	})
	return management.save()
}