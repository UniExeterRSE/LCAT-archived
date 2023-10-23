// Copyright (C) 2022 Then Try This
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the Common Good Public License Beta 1.0 as
// published at http://www.cgpl.org
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// Common Good Public License Beta 1.0 for more details.

import React, { useEffect, useState, lazy, Suspense } from 'react';
import LoadingOverlay from "react-loading-overlay";

import { ReactComponent as HealthAndWellbeingSvg } from '../images/icons/Public health & wellbeing.svg';
import { NetworkParser } from '../core/NetworkParser';
import { andify } from '../utils/utils';

import './References.css';

function baseURL(url) {
    let domain = (new URL(url));
    return domain.hostname;
}

function ArticleReference(props) {
    return (
        <ul className="reference-container">
          <li><a href={props.a.link}
                 className="reference-title"
                 target="_blank">
                {props.a.title}
              </a> ({props.a.type})</li>
          <li><b>Authors: </b>{props.a.authors}</li>
          <li><b>Journal/Issue: </b>{props.a.journal} {props.a.issue} {props.a.date}</li>
        </ul>
    );
}

function WebPageReference(props) {
    return (
        <ul className="reference-container">
          <li><a href={props.a.link}
                 className="reference-title"
                 target="_blank">
                {props.a.title}
              </a> ({props.a.type})</li>
          <li><b>Source: </b>{props.a.doi}</li>            
        </ul>
    );
}

function ReportReference(props) {
    return (
        <ul className="reference-container">
          <li><a href={props.a.link}
                 className="reference-title"
                 target="_blank">{props.a.title}
              </a> ({props.a.type}) {props.a.title}</li>
          <li><b>Source: </b>{props.a.doi}</li>
        </ul>
    );
}

function BookSectionReference(props) {
    return (
        <ul className="reference-container">
          <li><a href={props.a.link}
                 className="reference-title"
                 target="_blank">{props.a.title}
              </a> ({props.a.type})</li>
        </ul>
    );
}

function References(props) {
    const [ references, setReferences ] = useState([]);

    useEffect(() => {        
        try {
            let prepend="";
            if (process.env.NODE_ENV==="development") {
                prepend="http://localhost:3000";
            }
            
            var url = prepend+"/api/"+props.api_call+"?"+
                new URLSearchParams({id: props.id});
            
            fetch(url).then(response => {
                response.json()
                    .then( v => {
                        setReferences(v);
                    });
            });
        } catch(error) {
            console.error(error);
        }
    },[props.id,
       props.api_call]);
// key={r.article_id}
    if (references.length>0) {    
        return (
            <div>          
              <b>References:</b>
              { references.map(r => {
                  if (r.type=="Journal Article") return (<ArticleReference a={r}/>);
                  if (r.type=="Journal article ") return (<ArticleReference a={r}/>);
                  if (r.type=="Journal article") return (<ArticleReference a={r}/>);
                  if (r.type=="Conference Proceedings") return (<ArticleReference a={r}/>);
                  if (r.type=="Book") return (<ArticleReference a={r}/>);
                  if (r.type=="Web Page") return (<WebPageReference a={r}/>);
                  if (r.type=="Web page") return (<WebPageReference a={r}/>);
                  if (r.type=="Report") return (<ReportReference a={r}/>);
                  if (r.type=="Book Section") return (<BookSectionReference a={r}/>);
                  return (<p>{ r.type }: not understood</p>);
              })}  
            </div>
        );
    } else {
        return null;
    }
}

export default References;


