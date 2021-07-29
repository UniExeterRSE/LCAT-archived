// Copyright (C) 2021 Then Try This
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

function arr2avg(arr) {
	let ret=0;
	for (let v of arr) {
		ret+=v;
	}
	return ret/arr.length
}

function calculate_decades(graph_data) {
	let decades = {};

	// collect values for each decade
	for (let year of graph_data) {
		let dec = Math.floor((year.year%2000)/10);
		if (decades[dec]==undefined) {
			decades[dec]=[year.avg]
		} else {
			decades[dec].push(year.avg)
		}
	}

	// average them together
	for (let dec of Object.keys(decades)) {
		decades[dec]=arr2avg(decades[dec])
	}

	return decades
}


export { calculate_decades }
