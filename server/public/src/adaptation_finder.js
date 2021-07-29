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

// a cause is a trigger that can be set off by different variables
class Cause {
	constructor (description,table,variable_name,operator,threshold) {		
		this.description=description
		this.table=table
		this.variable_name=variable_name
		this.operator=operator
		this.threshold=threshold
		switch(variable_name) {
		case "mean_windspeed": this.image="images/wind.svg"; break;
		case "mean_temp": this.image="images/temp.svg"; break; 
		case "daily_precip": this.image="images/rain.svg"; break;
		default: console.log("no svg for "+variable_name)
		}
	}
	
	isActive(variable) {
		if (variable.variable_name == this.variable_name &&
			variable.table == this.table) {			
			switch (this.operator) {
			case "increase":
				if (variable.reference<variable.value)
					return true
				return false
				break;
			case "decrease":
				if (variable.reference>variable.value)
					return true
				return false
				break;
			case "less-than":
				if (variable.value<this.threshold)
					return true
				return false
				break;
			case "greater-than":
				if (variable.value>this.threshold)
					return true
				return false
				break;
			}
		}
		return false
	}

}

class Impact {
	constructor (type,short_description,description,references,image,secondary_impact) {
		this.type=type
		this.short_description=short_description
		this.description=description
		this.references=references
		this.image=image
		this.secondary_impact=secondary_impact
	}
}

class Adaptation {
	constructor (short_description,description,examples) {
		this.short_description=short_description
		this.description=description
		this.examples=examples		
	}
}


// trends connect together causes/impacts and adaptions
class Trend {
	constructor (cause,impacts,adaptations,priority) {
		this.cause=cause		
		this.impacts=impacts
		this.adaptations=adaptations
		this.priority=priority
	}
}

class AdaptationFinder {
	constructor (causes,impacts,adaptations,trends) {
		this.causes=causes
		this.impacts=impacts
		this.adaptations=adaptations
		this.trends=trends
		this.variables = []
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
//			"mean_windspeed",
			//"max_windspeed",
			//"min_windspeed"
		]
	}

	addVariable(table,variable_name,decade_data,reference_decade,value_decade) {
		let y = 0
		let ref=decade_data[reference_decade]
		let val=decade_data[value_decade]

		if (val>ref) {
			console.log(table+" "+variable_name+" rising "+ref.toFixed(2)+" -> "+val.toFixed(2))
		} else {
			console.log(table+" "+variable_name+" falling "+ref.toFixed(2)+" -> "+val.toFixed(2))
		}
		
		if (ref!=undefined && val!=undefined) {
			this.variables.push(new ClimateVariable(table,variable_name,ref,val))
		}		
	}

	async loadVariables(zones,reference_decade,value_decade) {
		// todo cache these so we don't need to reload all zones
		this.variables = []
		for (let table of this.tables) {			
			for (let variable_name of this.variable_names) {		
				await $.getJSON(
					"/api/future",
					{
						table: table,
						zones: zones,
						data_type: variable_name
					},
					(data,status) => {
						this.addVariable(
							table,
							variable_name,
							utils.calculate_decades(data),
							reference_decade,
							value_decade)
					})
			}
		}
	}
	
	async calcActiveTrends(zones,reference_decade,value_decade) {
		await this.loadVariables(zones,reference_decade,value_decade)
		let active_trends = []
		for (let trend of this.trends) {
			let cause = this.causes[trend.cause]
			if (cause==undefined) {
				console.log("no cause found for id: "+trend.cause)
			}
			
			for (let variable of this.variables) {
				if (cause.isActive(variable)) {
					console.log(variable.variable_name+" is "+cause.operator)
					active_trends.push(trend)
				}
			}
		}
		return active_trends
	}
}

////////////////////////////////////////////////////
// some fake data

const the_causes = {
	0: new Cause("Windspeed increases","future_year_avg", "mean_windspeed", "increase", 0),
	1: new Cause("Rainfall increases","future_winter_avg", "daily_precip", "increase", 0),
	2: new Cause("Temperatures rise","future_year_avg", "mean_temp", "increase", 0)
}

const the_impacts = {
	0: new Impact(
		"Transport/Active Transport",
		"Decreased cycling",
		"Increased wind speed leads to decreased cycling. More people use public transport networks.",
		["https://dx.doi.org/10.1186/1476-069x-11-12"],
		"images/active-transport.svg",
		1
	),
	1: new Impact(
		"Health and Wellbeing",
		"More illness",
		"More people get sick, as contact increases.",
		["https://dx.doi.org/10.1186/1476-069x-11-12"],
		"images/active-transport.svg"
	),
	2: new Impact(
		"Transport/Active Transport",
		"Decreased cycling",
		"Increased precipitation leads to decreased cycling.",
		["https://dx.doi.org/10.1186/1476-069x-11-12",
		 "https://doi.org/10.1016/j.amepre.2006.08.027"],
		"images/active-transport.svg",
		1
	),
	3: new Impact(
		"Transport/Active Transport",
		"More flooding",
		"Increased precipitation means more flooding on roads.",
		["https://dx.doi.org/10.1186/1476-069x-11-12"],
		"images/active-transport.svg",
		2
	),
	4: new Impact(
		"Transport/Active Transport",
		"Tires melt",
		"Increased temperature means tires melt in the heat.",
		["https://dx.doi.org/10.1186/1476-069x-11-12"],
		"images/active-transport.svg",
		1
	),
}
			  
const the_adaptations = {
	0: new Adaptation("Plant trees","",["Example 1","Example 2"]),
	1: new Adaptation("Cycle to work scheme","",["Example 1","Example 2"]),
	2: new Adaptation("Build more drains","",["Some example of this"]),
	3: new Adaptation("Build more railways","",[]),
	4: new Adaptation("Build more bicycle lanes","",[]),
}

const the_trends = [
	new Trend(0,[0,1],[0],"High"),
	new Trend(1,[2],[1,4,3],"High"),
	new Trend(1,[3],[0],"High"),
	new Trend(2,[4],[3],"Low")
]
 				 
export { AdaptationFinder,
		 the_trends, the_causes, the_impacts, the_adaptations }
