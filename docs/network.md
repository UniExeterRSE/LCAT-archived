# How the climate data for region is passed through the network

## 1. Positive and negative correlation

![](images/single.png)

Examples:

On the left are positive correlation, where the increases/decreases
match: An increase in rainfall in this area (A) *increases* the
happiness of ducks (B), therefore a decrease in rainfall elsewhere (A)
*decreases* the happiness of ducks (B).

On the light are negative correlation, where they are inverted: A rise
in temperature (A) *reduces* size of icecaps (B), therefore a fall in
temperature (A) *increases* the size of icecaps (B).

## 2. Chaining together impacts

![](images/double.png)

Impacts can be chained together simply matching (+) or inverting (-) each other.

Examples:

* Increase in rainfall (A) leads to more ducks (B), decreasing the amount of bread (C).
* Decrease in rainfall (A) leads to less ducks (B), increasing the amount of bread (C).

## 3. Adding together impacts

![](images/adding.png)

Here we start to see uncertainty happening, where an increase or decreases can contradict each other (so far in the data we have this is in fact seems rare).

## 4. Uncertainies lead to more uncertainty

![](images/uncertain-more.png)

Once we have an uncertain increase/decrease, all following impacts have to become uncertain.

## 5. Reducing uncertainty

On thing we talked about to reduce this uncertainty was to add two more states: probable increase/decrese (this is not done yet, but it can be added!):
    
![](images/probable.png)

The inputs "vote" to indicate a majority decrease. This does not solve a 50/50 split of course, so uncertainties are still possible.

## 6. Cases I'm not sure how do deal with

![](images/probable2.png)

1. Should we use "probable" to add certainty to a previously uncertain state?
2. What should we do if we need to add together a probable state with a certain one?
