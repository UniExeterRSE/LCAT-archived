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

 	add_line(x1,y1,x2,y2,w,s) {
		var c = document.createElementNS('http://www.w3.org/2000/svg', 'line')
		c.setAttributeNS(null, 'x1', x1)
		c.setAttributeNS(null, 'y1', y1)
		c.setAttributeNS(null, 'x2', x2)
		c.setAttributeNS(null, 'y2', y2)
		c.setAttributeNS(null, 'stroke', s)
		this.svg.appendChild(c)
	}

	add_text(x,y,s,t) {
		var c = document.createElementNS("http://www.w3.org/2000/svg", "text");
		var myText = document.createTextNode(t);
		c.setAttributeNS(null, 'x', x)
		c.setAttributeNS(null, 'y', y)
		c.setAttributeNS(null, 'fill', "#42273b")
		c.setAttribute("font-size", s);
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

	add_bar(x,y,w,h,label,v,col) {
        // flip if negative
        if (h<0) {
            y=y-h
            h=-h
        }
		var c = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		c.setAttributeNS(null, 'x', x)
		c.setAttributeNS(null, 'y', y-h)
		c.setAttributeNS(null, 'width', w)
		c.setAttributeNS(null, 'height', h)
		c.setAttributeNS(null, 'fill', col)
		this.svg.appendChild(c)

		this.add_text(x+10,y+30,"15",label);
		this.add_text(x+20,y-h+20,"15",""+v.toFixed(2));
	}

	add_rect(x,y,w,h,col) {
		var c = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		c.setAttributeNS(null, 'x', x)
		c.setAttributeNS(null, 'y', y)
		c.setAttributeNS(null, 'width', w)
		c.setAttributeNS(null, 'height', h)
		c.setAttributeNS(null, 'fill', col)
		this.svg.appendChild(c)
	}
	
	add_2bar(x,y,w,h,h2,label,v,v2,col,col1) {
		let a=h
		let b=h2
		let av=v;
		let bv=v2;
		let ca=col // winter
		let cb=col1 // summer
		if (v<v2) {
			a=h2
			b=h
			av=v2
			bv=v
			ca="#4c9f70"
			cb="#a4f9c8"
		}

		var c = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		c.setAttributeNS(null, 'x', x)
		c.setAttributeNS(null, 'y', y-a)
		c.setAttributeNS(null, 'width', w)
		c.setAttributeNS(null, 'height', a)
		c.setAttributeNS(null, 'fill', ca)
		this.svg.appendChild(c)
		this.add_text(x+20,y-a+20,15,""+av.toFixed(2));

		var c = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		c.setAttributeNS(null, 'x', x)
		c.setAttributeNS(null, 'y', y-b)
		c.setAttributeNS(null, 'width', w)
		c.setAttributeNS(null, 'height', b)
		c.setAttributeNS(null, 'fill', cb)
		this.svg.appendChild(c)
		this.add_text(x+20,y-b+20,15,""+bv.toFixed(2));

		this.add_text(x+10,y+30,25,label);
	}

}

export { SVG }
