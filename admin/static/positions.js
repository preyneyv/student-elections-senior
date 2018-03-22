let positions, candidates

$(window).on('load', updatePositions)

function updatePositions() {	
	$(".position, .no-positions").remove()
	axios.get('api/positions/')
	.then(response => response.data)
	.then(data => positions = data.positions)
	.then(() => axios.get('api/candidates'))
	.then(response => response.data)
	.then(data => {
		candidates = data.candidates
		populatePositions()
	})
}

function populatePositions() {
	if (positions.length == 0) {
		$("#content")
		.append(
			$("<div>")
			.addClass('no-positions')
			.html('No Positions Found')
		)
		.append(
			$("<div>")
			.addClass('no-positions')
			.html("( O_O )")
		)
		return
	}
	_.sortBy(positions, "position")
	.forEach(position => {
		const positionElem = $("<div>")
		.addClass('position')
		.attr('data-id', position._id)
		.append(
			$("<div>")
			.addClass('position-title')
			.html(position.position)
		)
		const positionCandidatesElem = $("<div>")
		.addClass('position-candidates')
		position.candidates.forEach(candidate => {
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
				.addClass('candidate-action candidate-remove material-icons')
				.text('close')
			)
			positionCandidatesElem.append(candidateElem)
		})
		const candidateOptions = candidates
		.filter(candidate => {
			return ((position.gradeSpecific.length==0 || position.gradeSpecific.indexOf(candidate.grade) != -1)
			&& (!position.houseSpecific || candidate.house == position.houseSpecific)
			&& (!position.sectionSpecific || candidate.section == position.sectionSpecific)
			&& (position.candidates.map(c => c._id).indexOf(candidate._id) == -1))
			|| candidate.name == "Abstain"
		})
		.map(candidate => {
			return $("<option>")
			.text(candidate.name)
			.attr('value', candidate._id)
		})
		if (candidateOptions.length == 0) {
			candidateOptions.push($("<option selected disabled>No eligible candidates</option>"))
		} else {
			candidateOptions.unshift($("<option selected disabled>Select a candidate</option>"))
		}
		positionCandidatesElem.append(
			$("<div>")
			.addClass('add-candidate')
			.append(
				$("<select>")
				.addClass('candidate-list')
				.append(candidateOptions)
			)
		)

		positionElem.append(positionCandidatesElem)

		$("#content").append(positionElem)
	})

	// init events
	$(".position-title").on('click', function() {
		const position = $(this).parent()
		position.siblings().removeClass('show')
		position.siblings().find('.position-candidates').stop().slideUp(300)
		position.toggleClass('show')
		position.find('.position-candidates').stop().slideToggle(300)
	})
	$(".candidate-remove").on('click', function() {
		if (!confirm("Are you sure you want to remove this candidate from this position?")) return;
		const candidateId = $(this).parents('.candidate').data('id')
		const positionId = $(this).parents('.position').data('id')
		axios.delete(`api/positions/${positionId}/${candidateId}`)
		.then(response => response.data)
		.then(data => {
			if (data.success) {
				updatePositions()
			} else {
				alert('An unexpected error occured')
			}
		})
	})
	$(".candidate-list").on('change', function() {
		const candidateId = $(this).val()
		$(this).val("Select a candidate")
		if (!confirm("Add this candidate?")) return;
		const positionId = $(this).parents('.position').data('id')
		
		axios.put(`api/positions/${positionId}/${candidateId}`)
		.then(response => response.data)
		.then(data => {
			if (data.success) {
				const candidate = candidates.filter(c => c._id == candidateId)[0]
				const position = positions.filter(p => p._id == positionId)[0]

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
					.addClass('candidate-action candidate-remove material-icons')
					.text('close')
				)
				candidateElem.insertBefore($(this))

				$(this).find("option").remove()
				position.candidates.push(candidate)
				const candidateOptions = candidates
				.filter(candidate => {
					return ((position.gradeSpecific.length==0 || position.gradeSpecific.indexOf(candidate.grade) != -1)
					&& (!position.houseSpecific || candidate.house == position.houseSpecific)
					&& (!position.sectionSpecific || candidate.section == position.sectionSpecific)
					&& (position.candidates.map(c => c._id).indexOf(candidate._id) == -1))
					|| candidate.name == "Abstain"
				})
				.map(candidate => {
					return $("<option>")
					.text(candidate.name)
					.attr('value', candidate._id)
				})
				if (candidateOptions.length == 0) {
					candidateOptions.push($("<option selected disabled>No eligible candidates</option>"))
				} else {
					candidateOptions.unshift($("<option selected disabled>Select a candidate</option>"))
				}
				$(this).append(candidateOptions)
			} else {
				alert('An unexpected error occured')
			}
		})
	})
}

// Modal code
let modal = new (function() {
	this.show = () => {
		$("#create-position-modal").addClass('show')
		$('#create-position-modal input').val('')
		$('#create-position-modal input').eq(0).focus()
	}
	this.hide = () => {
		$("#create-position-modal").removeClass('show')
		// updateCandidates()
		// $('#create-position-modal input').val('')
	}
	this.submit = () => {
		const that = this
		let name = $("#new-position-name").val() || null
		let gradeSpecific = $("#new-position-grade").val().split(/, ?/g).map(g => parseInt(g)).filter(g => !isNaN(g)) || null
		let sectionSpecific = $("#new-position-section").val() || null
		let houseSpecific = $("#new-position-house").val() || null

		axios.put('api/positions/', {
			name,
			gradeSpecific,
			sectionSpecific,
			houseSpecific
		})
		.then(response => response.data)
		.then(data => {
			console.log(data)
			that.show()
		})
	}
	$("#modal-cancel-button").on('click', this.hide)
	$("#modal-save-button").on('click', this.submit)
	$("#create-position-button").on('click', this.show)
})
