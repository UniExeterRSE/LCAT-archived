import HeatwaveSvg from "../images/hazards/Heatwave.js";
import WildfiresSvg from "../images/hazards/Wildfires.js";
import FloodSvg from "../images/hazards/Flood.js";
import AirPollutionSvg from "../images/hazards/AirPollution.js";
import CoastalErosionSvg from "../images/hazards/CoastalErosion.js";

// This map contains the rendered content in the ClimateHazardRisk component
export const climateHazardsData = [
    {
        name: "Heatwaves",
        icon: <HeatwaveSvg className="hazard-img" />,
        details: (
            <div>
                <p>
                    The UK’s climate is warming. Our warmest years on record have occurred in the last 10 years. One
                    consequence of this is an increase in <strong className="text-emphasis">frequency</strong> and{" "}
                    <strong className="text-emphasis">intensity</strong> of heatwaves.
                </p>
                <p>
                    As warming continues in the future, UK summers are predicted to become hotter and drier on average
                    with regional variations existing. As a result, heatwaves will become:
                </p>
                <ul>
                    <li>More severe.</li>
                    <li>More frequent.</li>
                    <li>Longer.</li>
                </ul>

                <p>
                    Urban environments (e.g. cities) are likely to experience even greater heatwave intensity due to the
                    <strong className="text-emphasis"> urban heat island effect</strong>. Urban heat island effect
                    describes urban areas being a lot warmer than the rural areas around them because of denser
                    populations and infrastructure.
                </p>

                <p className="climate-hazard-emphasis">Where can I find localised heatwave risk data?</p>

                <p>
                    Heatwave data is within the climate indicator category of{" "}
                    <strong className="text-emphasis">'Temperature extremes'</strong>:{"  "}
                    <a href="https://uk-cri.org/" target="_blank" rel="noreferrer">
                        Climate Risk Indicators | uk-cri.org
                    </a>
                </p>
            </div>
        ),
    },
    {
        name: "Wildfires",
        icon: <WildfiresSvg className="hazard-img" />,
        details: (
            <div>
                <p>
                    Globally, hotter, drier weather in many regions has increased the frequency, intensity, and scale of
                    wildfires. This includes in the UK.
                </p>
                <p>Climate change increases the risk of wildfires through a combination of factors including:</p>
                <ul>
                    <li>Low humidity and low rainfall making it drier.</li>
                    <li>
                        <strong className="text-emphasis">Higher temperatures.</strong>
                    </li>
                    <li>Higher wind speeds.</li>
                </ul>
                <p className="climate-hazard-emphasis">Where can I find localised heatwave risk data?</p>
                <p>
                    Wildfire risk data is within the climate indicator category of{" "}
                    <strong className="text-emphasis">'Wildfire'</strong>:{"  "}
                    <a href="https://uk-cri.org/" target="_blank" rel="noreferrer">
                        Climate Risk Indicators | uk-cri.org
                    </a>
                </p>
            </div>
        ),
    },
    {
        name: "Air Quality",
        icon: <AirPollutionSvg className="hazard-img" />,
        details: (
            <div>
                <p>
                    Indoor and outdoor air quality in the UK will be affected by climate change. Indoor air quality is
                    dependent on individual building performance, emissions from indoor sources like fireplaces or damp,
                    ventilation, and external air quality.
                </p>
                <p>
                    Outdoor air quality will be impacted by several climate pressures. Higher temperatures can
                    exacerbate the build-up of air pollution especially in urban areas. Emissions also contribute to
                    poorer air quality. Droughts can increase the amount of dust particles in the air as well as
                    contributing to wildfire risk. Thunderstorms and wind storms can increase allergens in the air like
                    pollen and fungal spores.
                </p>
                <p>
                    Although future air quality cannot be modelled yet, the first link below provides ambient air
                    quality data for your area over time and the second link provides a five-day air pollution forecast
                    for your area:
                </p>
                <ul>
                    <li>
                        <a href="https://uk-air.defra.gov.uk/data/gis-mapping/" target="_blank" rel="noreferrer">
                            DEFRA Ambient Air Quality
                        </a>
                        {" - "}Find out the ambient air quality for your area.
                    </li>
                    <li>
                        <a href="https://uk-air.defra.gov.uk/forecasting/" target="_blank" rel="noreferrer">
                            DEFRA Air Pollution Forecast
                        </a>
                        {" - "}Explore your local air pollution forecast.
                    </li>
                </ul>
            </div>
        ),
    },
    {
        name: "Flooding",
        icon: <FloodSvg className="hazard-img" />,
        details: (
            <div>
                <p>
                    The UK has become wetter over the last few decades, with an increase in frequency and intensity of
                    rainfall and flooding.
                </p>
                <p>
                    Flooding is affected by numerous factors such as the landscape, local soil type, river flow rates
                    and flood management techniques, which impact the likelihood of river or surface water flooding.
                    Urban development can also increase flood risk by restricting natural drainage or building in flood
                    risk locations.
                </p>
                <p>
                    Warmer and wetter winters are projected in the future, with increased potential for flooding. The UK
                    is expected to experience drier summers, although the rain that does fall is also likely to be more
                    intense.
                </p>
                <p>
                    Future flood risk datasets are not comprehensive or standardised across the UK, however a future
                    flood risk dataset can be found for your local area here:
                </p>
                <ul>
                    <li>
                        England{" - "}
                        <a href="https://www.gov.uk/check-long-term-flood-risk" target="_blank" rel="noreferrer">
                            Long Term Flood Risk
                        </a>
                    </li>
                    <li>
                        Scotland{" - "}
                        <a
                            href="https://scottishepa.maps.arcgis.com/apps/webappviewer/index.html?id=3098bbef089c4dd79e5344a0e1e7c91c&showLayers=FloodMapsBasic_2743;FloodMapsBasic_2743_1;FloodMapsBasic_2743_2;FloodMapsBasic_2743_3;FloodMapsBasic_2743_5;FloodMapsBasic_2743_6;FloodMapsBasic_2743_7;FloodMapsBasic_2743_9;FloodMapsBasic_2743_10;FloodMapsBasic_2743_11;FloodMapsBasic_2743_12;FloodMapsBasic_2743_13;FloodMapsBasic_2743;FloodMapsBasic_2743_1;FloodMapsBasic_2743_2;FloodMapsBasic_2743_3;FloodMapsBasic_2743_5;FloodMapsBasic_2743_6;FloodMapsBasic_2743_7;FloodMapsBasic_2743_9;FloodMapsBasic_2743_10;FloodMapsBasic_2743_11;FloodMapsBasic_2743_12;FloodMapsBasic_2743_14"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Current and Future Flood Risk
                        </a>
                    </li>
                    <li>
                        Wales{" - "}
                        <a
                            href="https://flood-map-for-planning.naturalresources.wales/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Basic and Detailed Future Flood Risk
                        </a>
                    </li>
                </ul>
            </div>
        ),
    },
    {
        name: "Coastal Erosion",
        icon: <CoastalErosionSvg className="hazard-img" />,
        details: (
            <div>
                <p>
                    Coastal erosion is increasing across the UK due to several interacting pressures. Sea level rise,
                    increased storm activity or severity, and heavier rainfall significantly contribute to coastal
                    erosion rates.
                </p>
                <p>
                    Human activity is another source of pressures on coastal erosion rates. The expansion of
                    infrastructure to meet population demands and the alteration of natural coastal environments as a
                    result of urbanisation disrupt coastal ecosystem functioning and services. This makes coastal areas
                    vulnerable to the environmental pressures above.
                </p>
                <p>
                    Increased coastal erosion risks leads to the damage and loss of natural or built coastal
                    infrastructure and defences further increasing the risk to people and the environment in those areas
                    from climate change impacts.
                </p>
                <p>
                    Future coastal erosion risk datasets are not comprehensive or standardised across the UK, however a
                    future coastal erosion risk dataset can be found for your local area here:
                </p>
                <ul>
                    <li>
                        England{" - "}
                        <a
                            href="https://environment.maps.arcgis.com/apps/webappviewer/index.html?id=9cef4a084bbb4954b970cd35b099d94c&marker=583422.9849116375%2C343036.013226925%2C27700%2C%2C%2C&markertemplate=%7B%22title%22%3A%22%22%2C%22x%22%3A583422.9849116375%2C%22y%22%3A343036.013226925%2C%22wkid%22%3A27700%2C%22isIncludeShareUrl%22%3Atrue%7D&level=14"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Future coastal erosion risk and shoreline management plans
                        </a>
                    </li>
                    <li>
                        Scotland{" - "}
                        <a
                            href="https://snh.maps.arcgis.com/apps/webappviewer/index.html?id=78047dbef80f4a74acc192ac21c9d4e0"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Present and future coastal erosion risk
                        </a>
                    </li>
                    <li>
                        Wales{" - "}
                        <a
                            href="https://flood-risk-maps.naturalresources.wales/?locale=en"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Future coastal erosion risk and shoreline management plans
                        </a>
                    </li>
                </ul>
            </div>
        ),
    },
];
