const $ = require("jquery")
const utils = require("./utils")

// two values for a specific variable to use for comparisons
class ClimateVariable {
	constructor (table,reference,value) {
		this.table=table
		this.reference=reference
		this.value=value
		this.direction = "rising"
		if (reference>value) {
			this.direction = "falling"
		}
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

	async loadVariable(table,variable_name,zones,reference_decade,value_decade) {
		console.log(variable_name);
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
					decades[reference_decade],
					decades[value_decade]
				)
				console.log(table+" "+variable_name+"="+this.variables[variable_name].direction)
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

		console.log(cause.variable+" "+cause.operator)
		
		if (cause.operator=="increase" && 
			this.variables[cause.variable].direction=="rising") {
			console.log("match")
			return true
		}

		if (cause.operator=="decrease" && 
			this.variables[cause.variable].direction=="falling") {
			console.log("match")
			return true
		}

		console.log("mismatch")
		return false		
	}
}
 				 
export { AdaptationFinder }
