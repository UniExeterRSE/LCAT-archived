# How the climate data for a selected region is currently passed through the impact network

How impacts are currently calculated around our network of mDPSEEA
nodes, from climate variables through to health impacts. This is
currently under development - so the initial goal is to make sure we
are doing this correctly, after which it can be used as documentation.

This document refers to the [code found here](../client/src/core/NetworkParser.js).

# Our use of mDPSEEA definitions 

Some examples of how we are defining terms for LCAT:
   
* Drivers: causes of climate change (e.g. Burning fossil fuels).
* Pressures: specific climate variables that are changing (e.g. Temperature, Rainfall).
* States: something changed/caused by a pressure (e.g. Heatwaves, river water temperature, railway problems).
* Exposures: a secondary impact of a state change: (e.g. Individuals exposed to high heat, Cooling water potential).
* Effects: an 'end result' - often health related: (e.g. Respiratory deaths, Biodiversity & ecological balance disruption).
* Actions: Adaptations that can be applied to any of the above (e.g. Heatwave warning systems, promote uptake of electric vehicles).
        
## 1. Positive and negative correlation

Some assumptions (are these actually correct!):

* Climate variables (Pressures) can increase or decrease for a region
  selected by the user (we are not using thresholds or magnitudes).
* The States, Exposures and Effects they are connected to also
  increase or decrease.
* We can predict these changes by using the connections between them
  (from the scientific evidence) as positive or negative correlations.    
* The networks below could include Pressures, States, Exposures or
  Effects - they are all treated the same way.
* Currently Drivers (things causing climate change) and Actions
  (adaptation strategies) are not part of this calculation.
    
Examples:
        
![](images/single.png)

On the left are positive correlations, where the increases/decreases
match: An increase in rainfall in this area (A) *increases* the
happiness of ducks (B), therefore underneath, a decrease in rainfall
elsewhere (A) *decreases* the happiness of ducks (B).

On the right are negative correlations, where they are inverted: A
rise in temperature (A) *decreases* the time it takes for ice cream to
melt in this area (B), therefore a fall in temperature (A) *increases*
melting time (B).

## 2. Chaining together impacts

![](images/double.png)

Impacts can be chained together simply matching rise/fall (+) or
inverting (-) each other.

Examples:

* Increase in rainfall (A) leads to more ducks (B), decreasing the amount of bread (C).
* Decrease in rainfall (A) leads to fewer ducks (B), increasing the amount of bread (C).

## 3. Multiple connections coming into an impact

When multiple connections come into an impact we need to check that
they agree. Agreement is dependant on whether the upstream impact is
increasing or decreasing in combination with the correlation being
positive or negative.

The bottom two examples show disagreements, where we can't be certain
whether the impact is increasing or decreasing. 
        
![](images/adding.png)

## 4. Uncertainties lead to more uncertainty

Once we have an uncertain increase/decrease, all following impacts
have to become uncertain too. Dealing with uncertainty this way
(simply giving up as soon as we encounter some conflicting evidence)
is the most conservative (and simplest) approach. It's worth noting
that so far in the data this only seems to occur in one impact, it may
be that this simply indicates a problem in the network rather than in
the literature.

![](images/uncertain-more.png)

## 5. Ways to reduce uncertainty

Originally we talked about reducing this uncertainty by adding two
more states: probable increase/decrease (this is not done yet, but it
can be added). The inputs here "vote" to indicate a majority
decrease. This does not solve a 50/50 split of course, so
uncertainties are still possible, *and it assumes the confidence and
impact size is equal for each connection*. 

![](images/probable.png)

## 6. Future cases we're not sure how do deal with

1. Should we use "probable" to add certainty to a previously uncertain state?
2. What should we do if we need to add together a probable state with a certain one?

![](images/probable2.png)

