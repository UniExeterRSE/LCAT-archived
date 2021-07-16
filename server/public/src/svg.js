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

class SVG {

	constructor(w,h) {
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.svg.setAttributeNS(null, 'width', "100%")
		this.svg.setAttributeNS(null, 'height', "50%")
		this.svg.setAttributeNS(null, 'viewBox', '0 0 '+w+' '+h)
	}

	add_bar(x,y,w,h,label,v) {
		var c = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		c.setAttributeNS(null, 'x', x)
		c.setAttributeNS(null, 'y', y-h)
		c.setAttributeNS(null, 'width', w)
		c.setAttributeNS(null, 'height', h)
		c.setAttributeNS(null, 'fill', "#4c9f70")
		this.svg.appendChild(c)
		var c = document.createElementNS("http://www.w3.org/2000/svg", "text");
		var myText = document.createTextNode(label);
		c.setAttributeNS(null, 'x', x+10)
		c.setAttributeNS(null, 'y', y+30)
		c.setAttributeNS(null, 'fill', "#42273b")
		c.setAttribute("font-size", "25");
		c.appendChild(myText);
		this.svg.appendChild(c);		
		var c = document.createElementNS("http://www.w3.org/2000/svg", "text");
		var myText = document.createTextNode(""+v.toFixed(2));
		c.setAttributeNS(null, 'x', x+20)
		c.setAttributeNS(null, 'y', y-h+20)
		c.setAttributeNS(null, 'fill', "#42273b")
		c.setAttribute("font-size", "15");
		c.appendChild(myText);
		this.svg.appendChild(c);		
	}

 	add_line(x1,y1,x2,y2,w,s) {
		var c = document.createElementNS('http://www.w3.org/2000/svg', 'line')
		c.setAttributeNS(null, 'x1', x1)
		c.setAttributeNS(null, 'y1', y1)
		c.setAttributeNS(null, 'x2', x2)
		c.setAttributeNS(null, 'y2', y2)
		c.setAttributeNS(null, 'stroke', s)
		this.svg.appendChild(c)
	}

	add_text(x,y,t) {
		var c = document.createElementNS("http://www.w3.org/2000/svg", "text");
		var myText = document.createTextNode(t);
		c.setAttributeNS(null, 'x', x+10)
		c.setAttributeNS(null, 'y', y+30)
		c.setAttributeNS(null, 'fill', "#42273b")
		c.setAttribute("font-size", "15");
		c.appendChild(myText);
		this.svg.appendChild(c);		
	}

	add_sideways_text(x,y,t) {
		var c = document.createElementNS("http://www.w3.org/2000/svg", "text");
		var myText = document.createTextNode(t);
		c.setAttributeNS(null, 'x', 0)
		c.setAttributeNS(null, 'y', 0)
		c.setAttributeNS(null, 'fill', "#42273b")
		c.setAttribute("font-size", "15");
		c.setAttribute("transform", "translate("+x+","+y+") rotate(-90)");
		c.appendChild(myText);
		this.svg.appendChild(c);		
	}
}

export { SVG }
