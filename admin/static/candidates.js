let candidates

$(window).on('load', updateCandidates)

function updateCandidates() {
	$(".grade, .no-candidates").remove()
	axios.get("api/candidates/")
	.then(response => response.data)
	.then(data => {
		candidates = data.candidates
		populateCandidates()
	})
}

function populateCandidates() {
	if (candidates.length == 0) {
		$("#content")
		.append(
			$("<div>")
			.addClass('no-candidates')
			.html('No Candidates Found')
		)
		.append(
			$("<div>")
			.addClass('no-candidates')
			.html("(>.<')")
		)

		return
	}
	const candidatesByGrade = _.groupBy(candidates, 'grade')
	Object.keys(candidatesByGrade)
	.map(a => parseInt(a))
	.sort((a,b) => a > b)
 	.forEach(grade => {
		console.log(grade)
		const gradeElem = $("<div>")
		.addClass('grade')
		.append(
			$("<div>")
			.addClass('grade-title')
			.html(`Grade ${grade}`)
		)
		const gradeCandidatesElem = $("<div>")
		.addClass('grade-candidates')
		candidatesByGrade[grade].forEach(candidate => {
			const candidateElem = $("<div>")
			.addClass('candidate')
			.attr('data-id', candidate._id)
			.append(
				$("<div>")
				.addClass('candidate-name')
				.text(candidate.name)
			)
			.append(
				$("<div>")
				.addClass('candidate-action candidate-delete material-icons')
				.text('delete')
			)
			gradeCandidatesElem.append(candidateElem)
		})
		gradeElem.append(gradeCandidatesElem)
		$("#content").append(gradeElem)
	})

	// init events
	$(".grade-title").on('click', function() {
		const grade = $(this).parent()
		//grade.siblings().removeClass('show')
		//grade.siblings().find('.grade-candidates').stop().slideUp(300)
		grade.toggleClass('show')
		grade.find('.grade-candidates').stop().slideToggle(300)
	})
	$(".candidate-delete").on('click', function() {
		if (!confirm("Are you sure you want to delete this candidate?")) return;
		const candidateId = $(this).parents('.candidate').data('id')
		axios.delete('api/candidates/' + candidateId)
		.then(response => response.data)
		.then(data => {
			if (data.success) {
				updateCandidates()
			} else {
				alert('An unexpected error occured')
			}
		})
	})
}

// Modal code
let modal = new (function() {
	this.show = () => {
		$("#create-candidate-modal").addClass('show')
		$('#create-candidate-modal input').val('')
		$('#create-candidate-modal input').eq(0).focus()
	}
	this.hide = () => {
		$("#create-candidate-modal").removeClass('show')
		updateCandidates()
		// $('#create-candidate-modal input').val('')
	}
	this.submit = () => {
		const that = this
		let name = $("#new-candidate-name").val()
		let grade = $("#new-candidate-grade").val()
		let section = $("#new-candidate-section").val()
		let house = $("#new-candidate-house").val()
		let image = $("#new-candidate-image")[0].files[0]

		let data = new FormData()
		data.append('name', name)
		data.append('grade', grade)
		data.append('section', section)
		data.append('house', house)
		data.append('image', image)

		axios.put('api/candidates/', data)
		.then(response => response.data)
		.then(data => {
			console.log(data)
			that.show()
		})
	}
	$("#modal-cancel-button").on('click', this.hide)
	$("#modal-save-button").on('click', this.submit)
})
$("#create-candidate-button").on('click', modal.show)
