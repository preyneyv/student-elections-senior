const path = require('path')
const fs = require('fs')
const { Candidate, Position, Student } = require("../database")

exports.list = (req, res) => {
	let positions = []
	Position.find({})
	.then(_positions => {
		const promises = _positions.map(_position => Candidate.find({
			_id: { $in: _position.candidates.map(c => c.candidateId) }
		})
		.then(candidates => {
			const position = _position.toJSON()
			position.candidates = candidates
			positions.push(position)
		}))

		return Promise.all(promises)
	})
	.then(() => res.send({success: true, positions}))
}
exports.create = (req, res) => {
	const { name, gradeSpecific, sectionSpecific, houseSpecific } = req.post

	const position = new Position({
		position: name,
		gradeSpecific,
		sectionSpecific,
		houseSpecific
	})
	position.save()
	.then(() => res.send({success: true}))
	.catch(e => {
		res.status(500).send({success: false})
		throw e
	})
}
exports.update = (req, res) => res.send({success: false})

exports.delete = (req, res) => {
	const { id } = req.params
	Candidate.findById(id)
	.then(candidate => {
		if (candidate) {
			const imagePath = path.resolve(studentElectionsSenior.imagesDir, candidate.image)
			fs.unlinkSync(imagePath)
			candidate.remove()
			.then(() => res.send({success: true}))

		} else {
			res.status(400).send({success: false, message: "bad_candidate_id"})
		}
	})
	.catch(e => {
		res.status(500).send({success: false})
		throw e
	})
}

exports.createAssociation = (req, res) => {
	const { positionId, candidateId } = req.params
	Position.findByIdAndUpdate(positionId, {
		$push: {
			candidates: {
				candidateId,
				votes: 0
			}
		}
	})
	.then(() => res.send({success: true}))
	.catch(e => {
		res.status(500).send({success: false, message: "unexpected"})
		throw e
	})
}
exports.deleteAssociation = (req, res) => {
	const { positionId, candidateId } = req.params
	Position.findById(positionId)
	.then(position => {
		if (position) {
			position.candidates = position.candidates
			.filter(c => String(c.candidateId) != candidateId)
			console.log(position)
			position.save()
			.then(() => res.send({success: true}))
		} else {
			res.status(400).send({success: false, message: 'bad_position_id'})
		}
	})
	.catch(e => {
		res.status(500).send({success: false, message: "unexpected"})
		throw e
	})
}

exports.results = (req, res) => {
	let positions = []
	Position.find()
	.then(_positions => {
		const promises = _positions.map(_position => Candidate.find({
			_id: { $in: _position.candidates.map(c => c.candidateId) }
		})
		.then(_candidates => {
			const position = _position.toJSON()
			candidates = _candidates.map(_candidate => {
				const candidate = _candidate.toJSON()
				const { votes, teacherVotes, managementVotes } = _position.candidates.filter(c => String(c.candidateId) == String(candidate._id))[0]
				candidate.votes = votes
				candidate.teacherVotes = teacherVotes
				candidate.managementVotes = managementVotes
				return candidate
			})
			position.candidates = candidates
			positions.push(position)
		}))
		return Promise.all(promises)
	})
	.then(() => res.send({success: true, positions}))
}