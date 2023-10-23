// -*- mode: rjsx;  -*-
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

const iconCache = {};

export function placeholderIcon(col) {
    return `
<?xml version="1.0" encoding="UTF-8"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<svg id="svg1933" width="116.63" height="116.63" version="1.1" viewBox="0 0 30.858 30.858" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
 <g id="layer1" transform="translate(0 -266.14)">
  <circle id="path853-5" cx="15.429" cy="281.57" r="15.429" fill="`+col+`"/>
 </g>
</svg>
`;
}

export function textIcon(col,text) {
    return `
<?xml version="1.0" encoding="UTF-8"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<svg id="svg1933" width="116.63" height="116.63" version="1.1" viewBox="0 0 30.858 30.858" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <g id="layer1" transform="translate(0 -266.14)">
    <circle id="path853-5" cx="15.429" cy="281.57" r="15.429" fill="`+col+`"/>
  </g>
  <style> .small { font: 8px sans-serif; } </style>
  <text x="15%" y="60%" class="small">`+text+`<text>
</svg>
`;
}

// <svg width="300" height="600">
// <circle
//              style="fill:`+col+`;fill-opacity:1;stroke-width:0.46499997"
//              id="circle1093-0-8"
//              cx="150"
//              cy="400"
//              r="100" />
//  <text x="50%" y="66%" text-anchor="middle" fill="white" font-size="40px" 
// font-family="Arial" dy=".3em">`+text+`</text>

// </svg>

export function imageLoaded(fn) {
    return iconCache[fn]!=undefined;
}

export function getImage(fn) {
    return iconCache[fn];
}

export async function loadImage(fn,col) {
    if (iconCache[fn]!=undefined) {            
        return iconCache[fn];
    }
    
    let prepend="";
    if (process.env.NODE_ENV==="development") {
        prepend="http://localhost:3000";
    }
    
    let response = await fetch(prepend+"/images/"+fn+".svg");
    
    if (!response.ok) {
        console.log(`An error has occured loading ${fn}: ${response.status}`);
        return placeholderIcon("#3da274");
    }
        
    let data = await response.text();
    iconCache[fn]=data;
    console.log("loaded "+fn);

    //iconCache[fn]=placeholderIcon(col);
    return iconCache[fn];
}


// preload some icons
export function loadIcons() {
    loadImage("glow");
    loadImage("increase");
    loadImage("decrease");
    loadImage("uncertain");
}

