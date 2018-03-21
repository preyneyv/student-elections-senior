const { Candidate, Position, Student } = require("../database")

exports.list = (req, res) => {
	Candidate.find({})
	.then(candidates => res.send({success: true, candidates}))
}
exports.create = (req, res) => {}
exports.update = (req, res) => {}
exports.delete = (req, res) => {}