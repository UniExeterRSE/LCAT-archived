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

const nfviColumns = {
    
// AGE	"Age composite Indicator"
// HEALTH	"Health composite Indicator"
// INCOME	"Income composite Indicator"
// INFO	Information use composite Indicator
// LOC_KNOW	Local knowledge composite Indicator
// TENURE	Property tenure composite Indicator
// MOBILITY	Mobility composite Indicator
// CRIME	Crime composite Indicator
// HOUSE_TYP	Housing characteristics composite Indicator
// FLOOD_EXP	Flood experience composite Indicator
// SERVICE	Service availability composite Indicator
// SOC_NET	Social networks composite Indicator

    
    a1:	{
        name: "Young children (% people under 5 years)",
        units: "percent",
        direction: "greater-than"
    },    
    a2:	{
        name: "Older people (% people over 75 years)",
        units: "percent",
        direction: "greater-than"
    },
    h1: {
        name: "Disability / people in ill- health (% people whose day- to-day activities are limited)",
        units: "percent",
        direction: "greater-than"
    },
    h2: {
        name: "% households with at least one person with long term limiting illness",
        units: "percent",
        direction: "greater-than"
    },
    i1: {
        name: "Unemployed (% unemployed)",
        units: "percent",
        direction: "greater-than"
    },
    i2: {
        name: "Long-term unemployed (% who are LTU or who have never worked)",
        units: "percent",
        direction: "greater-than"
    },
    i3: {
        name: "Low income occupations (% in routine or semi- routine occupations)",
        units: "percent",
        direction: "greater-than"
    },
    i4: {
        name: "Households with dependent children and no adults in employment (%)",
        units: "percent",
        direction: "greater-than"
    },
    i5: {
        name: "People income deprived (%)",
        units: "percent",
        direction: "greater-than"
    },
    f1: {
        name: "Recent arrivals to UK (% people with <1 yr residency coming from outside UK)", units: "percent", direction: "greater-than" },
    f2: {
        name: "Level of proficiency in English",
        units: "percent",
        direction: "greater-than"
    },
    k1: {
        name: "New migrants from outside the local area",
        units: "percent",
        direction: "greater-than"
    },
    t1: {
        name: "Private renters (% Households)",
        units: "percent",
        direction: "greater-than"
    },
    t2: {
        name: "Social renters (% Households renting from Social or Council landlords)",
        units: "percent",
        direction: "greater-than"
    },
    m1: {
        name: "High levels of disability (% of population who are disabled)",
        units: "percent",
        direction: "greater-than"
    },
    m2: {
        name: "% people living in medical and care establishments",
        units: "percent",
        direction: "greater-than"
    },
    m3: {
        name: "Lack of private transport (% households with no car or van)",
        units: "percent",
        direction: "greater-than"
    },
    c1: {
        name: "High levels of crime",
        units: "metric",
        direction: "less-than"
    },
    l1: {
        name: "% caravan or other mobile or temporary structures in all households",
        units: "percent",
        direction: "greater-than"
    },
    e1: {
        name: "% number of properties within historical flood boundary",
        units: "percent",
        direction: "greater-than"
    },
    n1: {
        name: "% single-pensioner households",
        units: "percent",
        direction: "greater-than"
    },
    n2: {
        name: "% lone-parent households with dependent children",
        units: "percent",
        direction: "greater-than"
    },
    n3: {
        name: "% children of primary school age (4-11) in the population",
        units: "percent",
        direction: "greater-than"
    },
    s1: {
        name: "% of emergency services exposed to flooding",
        units: "percent",
        direction: "greater-than"
    },
    s2: {
        name: "% no. of care homes exposed to flooding",
        units: "percent",
        direction: "greater-than"
    },
    s3: {
        name: "% no. of GP surgeries exposed to flooding",
        units: "percent",
        direction: "greater-than"
    },
    s4: {
        name: "% no. of schools exposed to flooding",
        units: "percent",
        direction: "greater-than"
    },
    imd_rank: {
        name: "IMD Rank",
        units: "rank",
        direction: "greater-than"
    },
    imd_decile: {
        name: "IMD Decile",
        units: "percent",
        direction: "greater-than"
    },
}

export { nfviColumns };
