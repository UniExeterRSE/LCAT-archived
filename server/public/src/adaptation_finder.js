const $ = require("jquery")
const utils = require("./utils")

// two values for a specific variable to use for comparisons
class ClimateVariable {
	constructor (table,variable_name,reference,value) {
		this.table=table
		this.variable_name=variable_name
		this.reference=reference
		this.value=value
		this.direction = "rising"
		if (reference>value) {
			this.direction = "falling"
		}
	}

	getDelta() {
		return this.value-this.reference
	}
}

class AdaptationFinder {
	constructor () {
		this.variables = {}
		this.tables = [
			"future_year_avg",
			"future_summer_avg",
			"future_winter_avg"
		]
		this.variable_names = [
			"daily_precip",
			"mean_temp",
			//"max_temp",
			//"min_temp",
			"mean_windspeed",
			//"max_windspeed",
			//"min_windspeed"
		]
	}

	// only works for active transport use
	// as that is the only thing we have data for
	calculateFactorChange(factor) {
		let rainDelta = -1.5 // mm/day
		let windDelta = -0.9 // km/hour
		let tempDelta = 2.6  // 1C/day

		// precip data = mm/day
		// temp data = degrees avg per day
		// wind = meters per second!
		// 1 m/s= 3.6 km/h
		// 1 km/h = 0.28 m/s
		windDelta /= 3.6
		
		let v = this.variables["daily_precip"].getDelta()*rainDelta +
			this.variables["mean_windspeed"].getDelta()*windDelta +
			this.variables["mean_temp"].getDelta()*tempDelta;
		return v;
	}

	
	async loadVariable(table,variable_name,zones,reference_decade,value_decade) {
		// todo cache these so we don't need to reload all zones
		await $.getJSON(
			"/api/future",
			{
				table: table,
				zones: zones,
				data_type: variable_name
			},
			(data,status) => {
				let decades = utils.calculate_decades(data)
				this.variables[variable_name]=new ClimateVariable(
					table,
					variable_name,
					decades[reference_decade],
					decades[value_decade]
				)
				//console.log(table+" "+variable_name+"="+this.variables[variable_name].direction)
			})
	}

	async loadVariables(table,zones,variable_names,reference_decade,value_decade) {
		this.variables = {}
		for (let v of variable_names) {
			await this.loadVariable(table,v,zones,reference_decade,value_decade)
		}		
	}
	
	causePolarityMatch(cause) {
		if (!this.variables[cause.variable]) {
			console.log("variable "+cause.variable+" not loaded")
			console.log(cause)
			return false
		}

		if (cause.operator=="increase" && 
			this.variables[cause.variable].direction=="rising") {
			return true
		}

		if (cause.operator=="decrease" && 
			this.variables[cause.variable].direction=="falling") {
			return true
		}

		return false		
	}

	find(adaptations) {
		let ret = []

		for (let aid in adaptations) {
			let a = adaptations[aid]
			a.variable
			if (a.direction=="increase" &&
				this.variables[a.variable].direction=="rising") {
				ret.push(a)
			}
			if (a.direction=="decrease" &&
				this.variables[a.variable].direction=="falling") {
				ret.push(a)
			}
		}
		
		return ret		
	}

	referenceToHTML(ref) {
		if (ref.type=="link") {
			return "<a href='"+ref.link+"'>"+ref.link+"</a>"
		} else {
			let ret = "<b><a href='http://doi.org/"+ref.doi+"'>"+ref.title+"</a></b> "
			ret+=ref.authors.join(", ")
			ret+=": "+ref.journal
			if (ref.date!="") {
				ret+=" "+ref.date
			}
			if (ref.issue!="") {
				ret+=" Issue: "+ref.issue
			}
			ret+=" DOI: "+ref.doi
			return ret
		}
	}

	adaptationToHTML(a) {
		let s=""
		if (a.long!="") {
			s+=`<p>`+a.long+`</p>`
		}
		s+="<ul>"
		if (a.refs.length>0) {
			s+="<li><b>References</b>: <ol>"
			for (let ref of a.refs) {
				s+="<li>"+this.referenceToHTML(ref)+"</li>";
			}
			s+="</ol></li>"
		}

		if (a.case!="") {
			s+=`<li><b>Case studies</b>: <ol>`
			if (a.caseref!="") {
				s+=`<li> <a href="`+a.caseref+`">`+a.case+`</a></li>`
			} else {
				s+=`<li>a.case</li>`
			}
			s+=`</ol></li>`
		}

		s+="</ul>"
		return s
	}

	updateHTML(adaptations_list) {
		// list adaptations
		let adaptations = this.find(adaptations_list)
		$("#adaptation-count").html(adaptations.length)
		$("#adaptations").empty()
		
		for (let a of adaptations) {
			$("#adaptations").append(
				$('<button>').attr("class","collapsible")
					.html(a.short))			
			$("#adaptations").append(
				$('<div>').attr("class","collapsible-content")
					.html(this.adaptationToHTML(a)))
		}

		let coll = document.getElementsByClassName("collapsible");
		for (let i = 0; i < coll.length; i++) {
			coll[i].addEventListener("click", function() {
				this.classList.toggle("active");
				var content = this.nextElementSibling;
				content.classList.toggle("visible");
			});
		} 
	}
	
}
 				 
export { AdaptationFinder }
