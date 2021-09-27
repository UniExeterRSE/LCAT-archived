const $ = require("jquery")
const utils = require("./utils")

// two values for a specific variable to use for comparisons
class ClimateVariable {
	constructor (table,variable_name,reference,value) {
		this.table=table
		this.variable_name=variable_name
		this.reference=reference
		this.value=value
	}
}

class AdaptationFinder {
	constructor () {
		this.variable = []
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

	async getVariable(table,variable_name,zones,reference_decade,value_decade) {
		// todo cache these so we don't need to reload all zones
		this.variables = []
		await $.getJSON(
			"/api/future",
			{
				table: table,
				zones: zones,
				data_type: variable_name
			},
			(data,status) => {
				let decades = utils.calculate_decades(data)
				this.variable=[decades[reference_decade],
							   decades[value_decade]]
			})
	}
	
	async isCauseActive(table,zones,reference_decade,value_decade,cause) {
		// load variables for these zones
		await this.getVariable(table,cause.variable,zones,reference_decade,value_decade)
		console.log(this.variable)

		let ref = this.variable[0]
		let val = this.variable[1]

		let variable = cause.variable;
		console.log(cause.operator)
		console.log(variable)

		if (val>ref) {
			console.log(table+" "+variable+" rising "+ref.toFixed(2)+" -> "+val.toFixed(2))
		} else {
			console.log(table+" "+variable+" falling "+ref.toFixed(2)+" -> "+val.toFixed(2))
		}
		
		switch (cause.operator) {			
		case "increase":
			if (ref<val) return true
			return false
			break;
		case "decrease":
			if (ref>val) return true
			return false
			break;
		default: return false;
		}
	}
}
 				 
export { AdaptationFinder }
