# UIL Calculator Applications - Problem Style Reference

A scraped, categorized reference of problems from the **Texas UIL Calculator
Applications** contest, captured as a styling reference for the calculus app.
The focus is the contest's signature trait: problems almost never name the
operation ("integrate", "differentiate", "find the geometric series sum").
Instead they **describe a situation and ask for a number**, and the solver has
to recognize which piece of calculus is hiding inside.

> Source: official public study packets on `uiltexas.org/files/academics/`,
> harvested from the High School Academic Study Materials archive pages for
> 2019, 2021, 2023, 2024 and 2025. 25 tests in total (5 meet levels x 5 years).
> Text was extracted from the PDFs; see the caveats note below before quoting
> anything verbatim.

## Why this contest is a good model

The contest is 70 problems in 30 minutes, split into three fixed buckets:

- **35 numerical** - raw calculator arithmetic (not interesting for us; omitted).
- **21 stated** - real-world word problems. This is where the "implied, not
  stated" style lives.
- **14 geometry** - a labeled figure plus a single quantity to find.

Answers are written to **3 significant figures** unless the answer blank says
`(integer)`, `$` (exact cents), or `(SD)` (significant-digit problem). Angle
mode (`rad`/`deg`) is flagged in front of a problem only when it matters. The
symbol legend each test ships with: `Log` = base 10, `Ln` = natural log,
`exp(u)` = e^u, `arcsin` etc. for inverse trig, special numbers pi and e.

### The core stylistic move

A normal textbook says:

> Evaluate the definite integral of y = -8(x-4)^2 + 30 over the interval where it
> is above the x-axis.

UIL instead says (25B-56):

> *What is the area enclosed by the x axis and the curve y = -8(x-4)^2 + 30?*

Same computation. But the student has to (1) realize "area enclosed by a curve
and an axis" = a definite integral, (2) find the bounds themselves (the roots),
and (3) decide the sign convention. The math word ("integral") never appears.
Every category below is a variation on this move.

---

## The implied-style patterns (curated examples)

Each example is quoted (lightly cleaned) from a real test, tagged with its
source code (e.g. `25B-56` = 2025 Invitational B, problem 56) and answer.
Note how the *prompt* stays in plain English while the *required technique* is
left for the solver to infer. Exponents lost their superscripts in extraction,
so `x2` means x-squared, `10-4` means 10^(-4), etc.

### 1. Definite integrals disguised as "area"

The word "integral" is replaced by "area enclosed / bounded / under the curve".
The solver must find the integration bounds (usually the roots) themselves.

- `19H-56` -> *Calculate the area enclosed by the curve y = -3x2+100x+300 and the x axis.* -> **29,400**
- `19I-56` -> *What is the positive area bounded by the parabola y = 2x2-30x+20 and the x axis?* -> **839**
- `21F-56` (rad) -> *Calculate the area under the curve y = 5sin(pi x/10)+8 between 0 <= x <= 10.* -> **112**
- `23A-56` -> *Calculate the area under the curve y = 4x2-14x+15 for 1 < x < 6.* -> **117**
- `24H-56` -> *What is the area between the curve f(x) = -3x2+9 and the x axis?* -> **20.8**
- `24I-56` -> *Calculate the area enclosed by the curves y = 5(x-3)2-30 and y = -2(x-3)2+5x-27.* (area between two curves) -> **41.4**
- `24A-56` (rad) -> *The curve y = x cos x is integrated from zero to x1, where 0 < x1 < 2. The area equals zero. What is nonzero x1? Consider area below the x axis to be negative.* (inverse problem: solve for the bound that makes a signed integral vanish) -> **2.33**
- `24F-56` (rad) -> *Solve for A if the area under the curve y = A sin(x) equals 6 for 0 < x < pi.* (solve for a parameter inside the integrand) -> **3.00**

### 2. Derivatives disguised as "slope" or "tangent"

"Slope of the curve" = first derivative. Variants ask for the x where the slope
hits a value, the slope at a point, or where a line is tangent (slope match).

- `19A-56` -> *What value of x gives a slope of 1 on the curve y = 4x2+17x+35?* -> **-2.00**
- `19F-56` (rad) -> *Calculate the slope of the curve y = 5cosx at the point where the curve intersects the line y = 2x.* -> **-4.48**
- `21I-56` -> *What is the slope of the curve y = 3x3-25x2+13x-5 when y = 30?* -> **187**
- `23H-56` (rad) -> *For what value of x between 0 and pi/6 does the slope of the curve y = tan(3x) equal 20?* -> **0.391**
- `24B-56` (rad) -> *What is the slope of the curve f(x) = 3x sin(7x) + 2.5x + 5 at x = 8?* -> **144**
- `25H-56` -> *What is positive b, if the line y = bx is tangent to the curve y = 6(x+3)2+7?* (tangency = equal value AND equal derivative) -> **74.3**

### 3. Optimization disguised as "maximize / minimize" a scenario

No "take the derivative and set it to zero" - just a story with a best outcome.

- `19B-57` -> *A fountain pen costs $20 to manufacture. The estimated daily number sold N varies with retail price P as N = 500 exp(-P/$25). What selling price maximizes profits?* -> **$45.00**
- `19F-57` -> *A farmer has 100 ft of fence for a 5-sided enclosure (an equilateral triangle on top of a rectangle). Calculate the maximum enclosed area.* -> **586 ft2**
- `21I-57` -> *A window is a rectangle surmounted by a semicircle, total perimeter 9 ft. The semicircle glass passes only half the light. What semicircle radius maximizes light transmitted?* -> **1.03 ft**
- `23F-57` -> *An excavator's energy per scoop is E = (20 ft-lb/ft^4.5) V^1.5 + 50 ft-lb. What scoop volume V minimizes total energy to remove a large volume of earth?* -> **2.92 ft3**
- `23I-57` -> *Square stepping stones of side a tile a path; a stone costs m a2 + C. What dimension a minimizes the total path cost?* -> **6.95 in**
- `24H-57` -> *A pen of fixed area is a D-by-h rectangle with a semicircle of diameter D on one end, built with the least fencing. What rectangle side ratio minimizes the perimeter?* -> **2.00**
- `25I-57` -> *Net typing speed is Wn = W - W2/150. What actual speed W maximizes Wn?* -> **75.0 words/min**

### 4. Related rates - a rate buried in a geometric story

- `25B-57` -> *An anthill is conical with a constant height-to-diameter ratio of 0.7. Ants build it at a constant 3 in3/hr. How tall is the anthill when its height is increasing at 0.1 in/hr?* (dV/dt constant, solve for h when dh/dt is given) -> **4.33 in**

### 5. Accumulation - integrate a rate of motion

"Acceleration is a(t) = ...", "velocity varies as ...", then ask distance.

- `24F-57` -> *A car accelerates from rest with a = (5 ft/s3) t. How far has it traveled when its velocity reaches 100 mph?* (integrate a -> v, integrate v -> x) -> **374 ft**
- `24I-57` -> *A car goes 0-60 mph in 18 s with v = (1 - cos(pi t / 18s)) * 30 mph. How far did it travel during the acceleration?* -> **792 ft**

### 6. Infinite geometric series disguised as a bouncing ball

- `25B-61` -> *A rubber ball is dropped from 68 in and bounces back up 52 in. How far does the ball travel before coming to rest?* (sum of an infinite geometric series, down + up) -> **42.5 ft**
- `24I-36` -> *A ball is dropped from 40 in and recovers 80% of its height. Calculate the total distance it travels before coming to rest.* -> **30.0 ft**
- `19F-27` -> *A ball is dropped from 39 in and recovers 88% on each rebound. After how many total bounces does the bounce height drop just below 8 in?* (finite geometric / logs) -> **13**

### 7. Exponential growth & decay disguised as "doubles / half-life / viral"

The phrases "doubles every", "grows exponentially", "half-life", "compounded"
all signal y = A b^(t) and solving with logs - never stated as such.

- `25B-28` -> *A web post's views double every 36 min. How long after posting are there 20 million views?* -> **14.6 hr**
- `19F-37` -> *A cup of coffee has 180 mg caffeine, half-life 5.7 hr. How long before bed can you drink it if < 120 mg has no effect?* -> **3.33 hr**
- `24A-37` -> *Ninety percent of Cobalt-60 decays in 17.48 yr. What is its half-life?* -> **5.26 yr**
- `24B-57` -> *A 100-lb log decays proportional to the remaining undecayed mass. If 10 lb decays in 150 dy, how much longer for 90 lb total to decay?* (the "rate proportional to amount" wording = a differential equation -> exponential) -> **8.56 yr**

### 8. Separable differential equations disguised as "drains proportional to..."

A drain/flow rate "proportional to" a level is dy/dt = k y in disguise.

- `21A-57` -> *A cylindrical tank's outflow rate is proportional to the water level. A full tank drains 40% in 45 min. How long to drain another 40%?* -> **96.8 min**
- `25H-57` -> *A rain barrel drains at a rate proportional to water height; full, it drains 30% in 12 min. How long to drain another 30%?* -> **18.8 min**
- `19A-57` -> *A 10-ft tank drains from the bottom at a rate proportional to the instantaneous level (full drains 50% in 6 hr). With water also added at 100 ft3/hr, what is the steady-state water elevation?* (DE with forcing term -> steady state) -> **1.73 ft**

### 9. Regression / extrapolation disguised as a table of measurements

A handful of (x, y) data points and a "what is y at ..." - the student must pick
a model (linear, power, exponential) and fit it. The word "regression" never appears.

- `19A-47` -> *Girl height by age: (2 yr, 34 in), (5, 42.5), (8, 50), (10, 54.5). At what age will she be 5 ft tall?* -> **12.0**
- `19H-47` -> *Bamboo grows as h = A * 10^(B t); data (5,11),(9,19),(12,37),(15,68),(16,107). What was the initial height?* -> **3.53 in**
- `25B-47` -> *A balloon's volume is proportional to absolute temperature; diameters measured at five temperatures. What is the balloon volume at 100 deg F?* -> **1450 in3**
- `23H-47` -> *Monthly pork-belly prices for Jan-Apr; what is the percent error in the extrapolated May value vs the actual 109.58 c/lb?* -> **4.55%**

### 10. Transcendental equations - iterative root finding

The "48" slot is almost always a solve-for-x that has no closed form, expecting
calculator iteration / solver use.

- `19A-48` (rad) -> *What is positive s if 2cos(pi s/9) = s2?* -> **1.34**
- `23B-48` -> *Solve for r if r3 + 25 = 3r.* -> **-3.26**
- `25A-48` -> *Solve for f if 5f2 + 6 = e^f.* -> **4.80**
- `25I-48` (rad) -> *Solve for x if 2 < x < 8 and sqrt(x) sin x = 15 - x.* -> **6.59**

### 11. Projectile / kinematics disguised as everyday throwing

Decompose velocity, use the equations of motion - the physics is never named.

- `25B-63` -> *Ethan, atop an 8-ft ladder, tosses a baseball to Nova on the ground 15 ft away at an 18 deg release angle. What release velocity is needed?* -> **12.0 mph**
- `19B-63` -> *A coin is tossed off a 150-ft building at 29 ft/s, 28 deg above the ground. How far from the building does it land?* -> **89.8 ft**
- `25I-63` -> *A coin dropped off the Eiffel Tower hits the ground in 7.821 s. How tall is the tower?* -> **984 ft**

---

## How to mirror this in the calculus app

Takeaways for authoring app problems in the same spirit:

1. **Lead with a situation, hide the operation.** Replace "differentiate" with
   "slope of the curve", "integrate" with "area enclosed / total distance",
   "geometric series" with "a bouncing ball / repeated halving".
2. **Make the student supply the missing setup.** UIL rarely gives the
   integration bounds, the model to fit, or the variable to optimize - the first
   step is always "what is this really asking?".
3. **Anchor in concrete, slightly whimsical scenarios** - camels to Karnak
   Temple, anthills, Krispy Kreme fundraisers, the Eiffel Tower. The flavor text
   carries the numbers.
4. **One clean numeric answer.** Every problem resolves to a single value with a
   known unit and precision - friendly for auto-grading and for a Brilliant-style
   "type the number" interaction.
5. **Tier by meet level.** Invitational A/B are gentler; District (F), Region (H)
   and State (I) escalate the inference required. The problem *slot* (e.g. 56 =
   calculus, 57 = optimization/related-rate, 48 = transcendental solve, 47 =
   regression) is remarkably stable and is a ready-made difficulty/topic grid.

### Extraction caveats

These problems came out of PDF text extraction, so: superscripts are flattened
(`x2` = x squared, `10-4` = 10^-4), the symbols pi and some Greek/operator
glyphs occasionally dropped to a blank, and **geometry figures are images** - the
shape name and one labeled quantity survive as text but the dimensioned drawing
does not. Treat the bank below as a faithful styling reference, not a
character-perfect transcription; check the source PDF before reusing a problem
verbatim.

---

## Full problem bank

All 21 stated and 14 geometry problems from each of the 25 scraped tests, with
the official answers. Stated problems are quoted (cleaned); geometry problems
show the figure caption and any labeled quantity (the drawing itself is not
captured). Tag format: `<YY><level>-<n>`, where level A/B = Invitational,
F = District, H = Region, I = State.


### 2019 Invitational A  (Test 19A)

**Stated problems**

- **19A-6** What is the product of 4.3 and 63? -> `271`
- **19A-7** Give the cube of 0.886. -> `0.696`
- **19A-8** What is the average of 0.137/4.81, 0.345 squared and the square root of 0.0074? -> `0.00778`
- **19A-16** How long would it take to travel by camel 360 mi from the Great Pyramid of Giza to the Karnak Temple in Luxor? Average camel speed is 28 mph. -> `12.9 hr`
- **19A-17** If there are 6.382 Chinese yuans per dollar, what is the value of 155 yuans? -> `$24.29`
- **19A-18** Trish buys four 12-packs of root beer at $3.50/12-pack. She also buys four 6-packs of Dr. Pepper at $5.45/6-pack and eight 6-packs of coke at $4.21/6-pack. What is the average cost per can? -> `$0.58`
- **19A-26** The average of three consecutive odd integers is 51. What is their product? -> `132,447 integer`
- **19A-27** The Statue of Liberty stands 151 ft 1 in tall. The Spring Temple Buddha in China stands 128.2 meters tall. What is the percent increase of height? -> `178.4 %`
- **19A-28** A web posting goes viral, with 847 hits after being posted 6.7 hrs. If the number of hits grows exponentially, how much longer will it take to have 1 million hits? -> `7.03 hr`
- **19A-36** There are 5 million human hairs on our body. If the average spacing between hairs in a square array was 0.64 mm, estimate the surface area of a human. -> `22.0 ft2`
- **19A-37** What is 86 degF measured on the Kelvin scale? -> `303 K`
- **19A-38** A teacher manually alphabetizes report cards. The time to sort N cards is proportional to the number of cards raised to the power 1.2. If she sorts 25 cards in 3 min 25 s, how long will it take her to sort 500 cards? -> `2.07 hr`
- **19A-46** A gallon jug holds 2500 0.4-in diameter marbles. How many 0.1-in diameter beads will fit into a pint jar? -> `20,000`
- **19A-47** Girl height increases with age: (2 yr, 34 in), (5, 42.5), (8, 50), (10, 54.5). At what age will a girl be 5 ft tall? -> `12.0`
- **19A-48** (rad) What is positive s if 2cos(Ss/9) = s2? -> `1.34`
- **19A-56** What value of x gives a slope of 1 on the curve y = 4x2+17x+35? -> `-2.00`
- **19A-57** A 5000 ft3 capacity water tank has constant cross section and stands 10 ft tall. It drains from the bottom with a volume rate proportional to the instantaneous water level, and a full tank drains 50% in 6 hr. If the drain is opened and water is added to the tank at a rate of 100 ft3/hr, what is the steady-state water elevation in the tank? -> `1.73 ft`
- **19A-58** Find the determinant of the matrix [ 1 8 1 8 -9 5 1 5 7 ]. -> `-447`
- **19A-61** Henry and Daisy stand 14 ft apart, unmoving. Ed stands 10 ft from Henry and 8 ft from Daisy, forming a scalene triangle. What is the shortest distance Ed can move to form a right triangle? -> `1.26 ft`
- **19A-62** The odds of a plane crashing is 1/5,400,000. What's the odds in being in 80 plane crashes? -> `2.56x10-539`
- **19A-63** Jane is thrown off the 984-ft tall Eifel Tower. After a delay of 2 s, Superman on the ground sees this and flies upwards at 100 mph to catch her. What is their relative velocity when they meet? -> `220 mph`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **19A-9** RECTANGLE Area = 0.00256 -> `0.0265`
- **19A-10** PARALLELOGRAM Perimeter = ? -> `5520`
- **19A-19** RIGHT TRIANGLE AB = ? -> `13.3`
- **19A-20** RIGHT TRIANGLE Area = 1.92x107 -> `7560`
- **19A-29** CUBE Total Surface Area = 0.0643 -> `0.104`
- **19A-30** SQUARE PYRAMID Volume = 1.60 -> `1.84`
- **19A-39** CIRCLE AND EQUILATERAL TRIANGLE -> `42.8`
- **19A-40** SCALENE TRIANGLE -> `298`
- **19A-49** CUBE AND SQUARE PYRAMID Total Volume = 54.8 -> `3.45`
- **19A-50** CONES Small Cone Volume = Frustum Volume a b =? -> `3.85`
- **19A-59** (figure) -> `4.18`
- **19A-60** SECTOR -> `44.4`
- **19A-64** EQUILATERAL TRIANGLE AND SQUARE -> `2.15`
- **19A-65** SEMICIRCLES Hatched Area = 1660 R r =? -> `1.39`

### 2019 Invitational B  (Test 19B)

**Stated problems**

- **19B-6** Calculate the average of 73.8, 26.5 and 60. -> `53.4`
- **19B-7** What is 0.0873 divided by the sum of 0.667 and 0.726? -> `0.0627`
- **19B-8** What is the product of 6.89 and the average of 54.5 and 72.8? -> `439`
- **19B-16** A first class stamp cost $0.15 in 1980 and $0.49 in 2019. What is the average annual inflation rate over this period? -> `3.08 %`
- **19B-17** Light travels at 186,000 mi/s. How far does it travel in 1 ns? -> `0.982 ft`
- **19B-18** A recipe for stew calls for 1 cup chopped onion and feeds 8 people. If a large onion yields 1 2/3 cups chopped, how many onions are needed for enough stew to feed 720 people? -> `54    integer`
- **19B-26** The world population in 2016 was 7,346,235,000 people. The fraction of females was 49.6%. How many more males were there than females? -> `5.88x107`
- **19B-27** What is the percent decrease in viewing time of a 30-min TV program if it can be recorded and watched in 22.9 min after zapping the commercials? -> `23.7 %`
- **19B-28** A large box store does inventory on their 3 sizes of box. They have 2820 large boxes, 7320 medium boxes and 8950 small boxes. If they sale 18.52% of their inventory, how many total boxes are left? -> `15,550`
- **19B-36** What is the x value of the intersection of the lines y = -4x+13 and y = x/10-5? -> `4.39`
- **19B-37** A chain letter initially has a distribution that doubles every 25 days. At this rate, how long does it take for the distribution to quintuple? -> `58.0 dy`
- **19B-38** A tile is 12 in by 12 in and there are 20 tiles in a box. What is the minimum theoretical number of boxes of floor tiles needed to tile a 14ft 7 in by 11 ft 9 in room? -> `9    integer`
- **19B-46** Two field workers can load a truck with 12-in watermelons in 4 hr. How long will it take 7 workers to fill 3 trucks with 6-in cantalopes? Assume workers carry one watermelon to the truck but can carry 3 cantaloupes. -> `9.14 hr`
- **19B-47** Horse size is measured in hands and also in inches. Measurements of horse sizes in (hands, in) are (15,62), (11,46), (16,64), (18,72). How many inches are in a hand? -> `3.69 in`
- **19B-48** (rad) For what value of k between 0 and 1 does 4tan(k) = 3cos(k)? -> `0.565`
- **19B-56** At what value of y does the slope of the curve y = 0.04[2x] equal 2.5? -> `3.61`
- **19B-57** A fountain pen costs $20 to manufacture. The estimated daily number of pens sold N varies based on the retail price P according to N = 500exp(-P/$25). What selling price maximizes profits? -> `$45.00`
- **19B-58** Find the determinant of the sum of [25 36 36 -14] and [0.5 0.3 0.3 1 ] . -> `-1650`
- **19B-61** Water on a beach advances and recedes sinusoidally daily with the tide. At maximum advance, it was 31 ft from a beach house. At maximum recession 12 hr later, it was 48 ft away. What is the shorter time interval between it being 35 ft away? -> `7.74 hr`
- **19B-62** The probability of winning a 49-ball, six-number lottery is 1/13,983,816. What's the probability of winning 75 times in a row? -> `1.20x10-536`
- **19B-63** A coin is tossed off a 150-ft tall building with an initial velocity of 29 ft/s and a release angle relative to the ground of 28 deg. How far from the building does it land? -> `89.8 ft`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **19B-9** CIRCLE Area = ? -> `216`
- **19B-10** RECTANGLE Area = 0.271 AB = ? -> `0.885`
- **19B-19** RIGHT TRIANGLE -> `335`
- **19B-20** RIGHT TRIANGLE -> `220`
- **19B-29** SPHERE Total Surface Area = ? -> `397`
- **19B-30** FRUSTUM Volume = ? -> `4.85`
- **19B-39** RIGHT TRIANGLE AND CIRCLE -> `1.28`
- **19B-40** SCALENE TRIANGLES -> `0.153`
- **19B-49** HEMISPHERES AND CYLINDER Volume = 4.27 -> `1.55`
- **19B-50** CUBE AB = ? -> `2.01`
- **19B-59** SOLID OF REVOLUTION (y = -2) Volume = ? -> `18.2`
- **19B-60** EQUILATERAL TRIANGLES Hatched Area = 3360 -> `125`
- **19B-64** EQUILATERAL TRIANGLES M = midpoint -> `1.47`
- **19B-65** SEMICIRCLE BC = 129 AB = ? -> `248`

### 2019 District  (Test 19F)

**Stated problems**

- **19F-6** What is the sum of 83.1, 26.5 and 28.9? -> `139`
- **19F-7** Calculate 513 raised to the power 0.41. -> `12.9`
- **19F-8** What is the cube root of 4.26, raised to the power S? -> `4.56`
- **19F-16** A gallon of paint covers 250 ft2. How many gallons are needed to paint five walls, each of which is 12 ft by 14 ft? -> `3.36 gal`
- **19F-17** The largest star sapphire in the world is the Sri Lankan Star of Adam which weighs 146.6 g and is worth $175 million. What is its value per ounce? -> `3.38x107`
- **19F-18** A worker shovels a total of 3 "yards" of mulch into a wheelbarrow. A "yard" of mulch is actually a cubic yard. How long does the shoveling take if a shovel holds 130 in3 of mulch, and he moves a shovel-full into the wheelbarrow every 4.8 s? -> `1.44 hr`
- **19F-26** If the product of two consecutive, negative, even integers is 2400, what is the smaller (i.e., most negative) number? -> `-50    integer`
- **19F-27** A ball is dropped from a height of 39 in and recovers 88% of its height on the rebound. After how many total bounces does the ball height drop just below 8 in? -> `13    integer`
- **19F-28** "All the tea in China" can mean a large amount of money. In 2016, annual tea production was 2.41 million metric tons. If the cost of loose tea is $41/lb, and a metric ton is 1000 kg, what is the annual dollar value of all the tea in China? Answer with three significant digits. -> `2.18x1011`
- **19F-36** What is the percent decrease in volume of earth and Venus? Venus' diameter is 12,103.6 km. Earth's may be taken to be 12,742 km. -> `5.010 %`
- **19F-37** How many hours before bedtime can a person drink a cup of coffee without it keeping them awake? A cup of coffee has 180 mg caffeine which has a half life 5.7 hr. Assume caffeine less than 120 mg has no perceivable stimulus effect. -> `3.33 hr`
- **19F-38** A flashlight is placed a distance h above the surface of a bowling ball 8.5 in in diameter. The fraction of the bowling ball surface area illuminated by the flashlight is 35%. This fraction is given by [1-sinT]/2, where T is the semicone angle of a cone whose apex is the flashlight with lines extending from the flashlight tangent to the bowling ball. What is h? -> `9.92 in`
- **19F-46** If a 2-quart cook pot costs $25.95, how much does a 1-gallon cook pot cost? Assume constant wall thickness and shape. -> `$41.19`
- **19F-47** A spurious correlation is the per capita consumption of mozzarella cheese and the number of civil engineering doctoral degrees awarded. Data are (lbs, degrees): (9.7, 570), (9.9, 560), (10.2, 620), (10.5, 660). What is the correlation coefficient? -> `0.948`
- **19F-48** What is t if et = 10t[2t] and t>1? -> `16.7`
- **19F-56** (rad) Calculate the slope of the curve y = 5cosx at the point where the curve intersects the line y = 2x. -> `-4.48`
- **19F-57** A farmer has 100 ft of fence and wants to make an enclosure with five sides. The enclosure is a pentagon made up of an equilateral triangle and rectangle. Calculate the maximum enclosed area of the enclosure. -> `586 ft2`
- **19F-58** Solve for u if T11 = 25 and T = 6S+2R, S = [u 20 20 -4] and R = [5 2u 2u 7 ] . -> `2.50`
- **19F-61** Donnie takes a test, and he is allowed to do a retake as many times (N) as he wants. After 4 retakes, he got a score (S) of 73%. How many total times must he retake the test to score just over 95%? Assume his score improvement decays exponentially according to S = 100(1-Ae-N) where A is a constant. -> `6  integer`
- **19F-62** The odds of being attacked by a shark in the US is 1/8,000,000. What are the odds of being attacked by a shark 80 times? -> `5.66x10-553`
- **19F-63** An archer fires an arrow at a target 230 ft away with a release velocity of 270 ft/s. The time of flight may be calculated approximately assuming the arrow travels in a straight line at constant velocity, and it can be calculated using the more accurate time of flight trajectory equation with a small release angle. What is the percent error in the time of flight? -> `-0.129 %`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **19F-9** THREE QUARTER CIRCLE Area = 4.65 -> `1.40`
- **19F-10** RHOMBUS Area = 0.584 -> `0.936`
- **19F-19** RIGHT TRIANGLE -> `1.32`
- **19F-20** RIGHT TRIANGLE -> `198,000`
- **19F-29** SEMICYLINDER Volume = 1.45x107 -> `278`
- **19F-30** RECTANGULAR SOLID Total Surface Area = ? -> `11,500`
- **19F-39** ISOSCELES TRIANGLE AND CIRCLE -> `718`
- **19F-40** SCALENE TRIANGLE -> `1.72`
- **19F-49** CUBE AND SQUARE PYRAMID AB = ? -> `2.27`
- **19F-50** CUBE WITH CYLINDRICAL CAVITY Total Surface Area = 7a2 D/a = ? -> `0.397`
- **19F-59** Radians Hatched Area = ? -> `1.27`
- **19F-60** THREE QUARTER CIRCLE AND RIGHT ISOSCELES TRIANGLE -> `0.519`
- **19F-64** SQUARE AND SIMILAR RECTANGLES b/a = ? -> `1.62`
- **19F-65** SQUARE AND RIGHT TRIANGLES AB = 3.27 AC = 4.93 -> `1.88`

### 2019 Region  (Test 19H)

**Stated problems**

- **19H-6** What is the positive difference of 0.792 and 0.415? -> `0.377`
- **19H-7** Calculate the product of 43 and half of 93.2. -> `2000`
- **19H-8** Calculate the cube root of the product of -0.936 and -230. -> `5.99`
- **19H-16** Huazhong University has a campus population of 53,200 persons who each eat three meals daily on campus. There are 33 restaurants on campus. How many meals on average are served by each restaurant? -> `4840`
- **19H-17** Lena buys four taxable items priced at $2.55, $1.77, $2.99 and $0.85. If the sales tax is 8.125%, how much change does she get from a $10 bill? -> `$1.18`
- **19H-18** What is the percent increase in speed when comparing human velocity, 15 mph, with a cheetah, the fastest land animal, 70 mph? -> `367 %`
- **19H-26** In 2015, Krispy Kreme doughnuts had annual domestic revenue of $470 million. Assume the average doughnut cost was $1.05, and doughnut sales accounted for all revenue. With 325.7 million people in the US in 2015, on average, one in how many people had one Krispy Kreme doughnut daily? -> `266`
- **19H-27** Aldeberan, the brightest star in the constellation Taurus, is 65 light years from earth and has a diameter of 6.122x107 km. If the speed of light is 299,792,458 m/s, what is the celestial angle subtended by Aldeberan as seen from the earth? -> `9.955x10-8 (4SD) rad`
- **19H-28** A wheelchair ramp is 4 ft wide and has a maximum rise of 1 in per foot of horizontal run. There is a 5 ft horizontal landing after every 16 ft of sloped ramp. How many 4 ft by 8 ft sheets of plywood are needed for the floor of a ramp for traversing 58 vertical in of total rise? -> `10    integer`
- **19H-36** If knowledge doubles every 13 months, on average what is the percent increase in knowledge in one day? -> `0.175 %`
- **19H-37** Dallas and Baghdad, Iraq lie on a line of constant latitude, ~33 degN. Dallas lies at 96 deg48' west, and Baghdad is 44 deg23' east. What is the smaller length of the longitudinal arc between the two cities? -> `8180 mi`
- **19H-38** Calculate the positive value of x for the intersection of the line passing through the point (2,-6) with the circle (x-1)2 + y2 = 12. -> `4.13`
- **19H-46** A shirt with a 14-in neck costs $37.99. Based on the fabric cost, how much should a shirt with an 18-in neck cost? -> `$62.80`
- **19H-47** Bamboo grows exponentially according to h = A10(Bt), where h is the height (in), t is time (days) and A and B are constants. Data in (days, in) are (5, 11), (9, 19), (12, 37), (15, 68) and (16, 107). What was the initial height of the bamboo? -> `3.53 in`
- **19H-48** (rad) What is v if sin(v) = v-1? -> `1.93`
- **19H-56** Calculate the area enclosed by the curve y = -3x2+100x+300 and the x axis. -> `29,400`
- **19H-57** A ship heads north at 20 mph, and another ships leaves the same point at the same time heading east at 9 mph. What is the magnitude of their relative velocity after 4.5 hr? -> `21.9 mph`
- **19H-58** What is H12 if H = KL, K = [12 -18 -18 34 ] and L = [-7 4 4 19] ? -> `-294`
- **19H-61** How many minutes after 4:39 do the minute and hour hands of a clock align? -> `48.3 min`
- **19H-62** What is 6540180,240? -> `5.41x10687,719`
- **19H-63** A ball is lofted such that its maximum increase in height, 8.5 meters, is attained at a horizontal distance 13.6 meters from the thrower. What was the release angle relative to the horizontal? -> `51.3 deg`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **19H-9** SQUARE Perimeter = ? -> `0.144`
- **19H-10** ISOSCELES TRAPEZOID Area = ? -> `34,400`
- **19H-19** RIGHT TRIANGLE -> `49.9`
- **19H-20** RIGHT TRIANGLE Area = 20.4 Hypotenuse = ? -> `9.17`
- **19H-29** SPHERE Total Surface Area = ? -> `0.0401`
- **19H-30** FRUSTUM Volume = 900 -> `9.08`
- **19H-39** RIGHT TRIANGLE AND CIRCLE -> `2100`
- **19H-40** RIGHT AND SCALENE TRIANGLES -> `45.8`
- **19H-49** CONES Total Volume = 338 -> `16.9`
- **19H-50** CYLINDER WITH HEMISPHERICAL CAVITIES Total Surface Area = 1.67 -> `0.757`
- **19H-59** Hatched Area = 500 a = ? -> `5.25`
- **19H-60** SQUARE, ISOSCELES TRIANGLE AND SEMICIRCLE Hatched Area = ? -> `44.0`
- **19H-64** REGULAR PENTAGON -> `94.8`
- **19H-65** CIRCLES AND EQUILATERAL TRIANGLE -> `2.00`

### 2019 State  (Test 19I)

**Stated problems**

- **19I-6** Give the product of 79.5 and 46. -> `3660`
- **19I-7** What is the cube root of the product of 0.375 and -6160? -> `-13.2`
- **19I-8** What is the remainder of 205 divided by the square of 0.43? -> `0.131`
- **19I-16** Emily receives on average 32 emails daily. How many emails does she get in a year? -> `11,700`
- **19I-17** Tina wants to buy a house priced at $450,000, and a 20% down payment is needed. She has $55,000. How much money must she borrow to make the down payment? -> `$35,000.00`
- **19I-18** Eileen can invest $20,000 at 5% annual interest compounded monthly or at 5.5% annual interest compounded annually. If she chooses wisely, how much money will she make after 5 years? -> `$6139.20`
- **19I-26** London, England is 4927 mi from Austin TX. What is the angle of the sector formed by this arc? -> `71.3 deg`
- **19I-27** What is the percent increase in the height of the Statue of Liberty, 151 ft 1 in, compared to the Colossus of Rhodes, 108 ft? -> `40 %`
- **19I-28** A chocolate chip cookie recipe calls for 1 teaspoon baking powder and makes 4 dozen cookies. How much baking powder is needed to provide enough cookies for 1000 people, assuming each person gets two cookies? -> `0.868 cups`
- **19I-36** Tonya was paid twice a month but switched when offered to receive the same pay every two weeks. What was the percent increase in her salary? -> `8.71 %`
- **19I-37** A circle centered at the origin has a radius of 14. Another circle with a radius of 23 is tangent to the first circle and also tangent to the x axis. What is the positive x value of the center of the second circle? -> `29.0`
- **19I-38** A population of ants doubles every 90 days. If there were 3,000 in a colony on May 3, how many are there on July 18? -> `5390`
- **19I-46** An inkjet printer cartridge lasts for 3000 copies if the font size is 12 point. How many pages can be printed using 14 point font, assuming all characters fit on the page after increasing the font size? -> `2204 integer pages`
- **19I-47** The pressure in water increases with depth. Data in (ft, psi) are (20, 8.5), (39, 18), (66, 25), (115, 50). At what depth would an object crush if the crushing pressure was 95 psi? -> `223 ft`
- **19I-48** Solve for f if 2-f = 3-f. -> `2.86`
- **19I-56** What is the positive area bounded by the parabola y = 2x2-30x+20 and the x axis? -> `839`
- **19I-57** The rate at which jigsaw puzzle pieces are placed while working a puzzle is inversely proportional to the number of pieces remaining. If it takes 11 hr 27 min to work a 1000 piece puzzle, how long would it take to work a 320 piece puzzle? -> `1.17 hr`
- **19I-58** What is the determinant of D = 6EF, if E = [12 19 19 7 ] and F = [-26 20 20 15] . -> `7.88x106`
- **19I-61** Sarah proofs a 585-page document at 4 min/page. Simone proofs at a different rate. They proof together for 8 hr, but after that, Simone proofs alone. How long does it take Simone to proof a page if the total time to proof the document was 14 hr? -> `1.81 min`
- **19I-62** Your chance of being hit by a meteor on earth is 5x10-14. What's the chance of your being hit by a meteor 40 times? -> `9.09x10-533`
- **19I-63** Astronaut Sam can throw a ball 35 yd on earth. How far can he throw it on Mars where the acceleration due to gravity is -12.2 ft/s2? -> `277 ft`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **19I-9** CIRCLE Area = ? -> `0.336`
- **19I-10** ISOSCELES TRAPEZOID Area = 1050 -> `20.4`
- **19I-19** RIGHT TRIANGLE -> `28.9`
- **19I-20** RIGHT TRIANGLE Perimeter = ? -> `1.33`
- **19I-29** HEMISPHERE Volume = 830 -> `7.35`
- **19I-30** SQUARE PYRAMID -> `0.917`
- **19I-39** CIRCLE AND ISOSCELES TRIANGLE -> `0.428`
- **19I-40** SCALENE TRIANGLES -> `1250`
- **19I-49** CUBE AND CYLINDER -> `18.9`
- **19I-50** CUBE WITH CONICAL CAVITIES Volume = 743 -> `10.0`
- **19I-59** Radians Hatched Area = 20 a = ? -> `159`
- **19I-60** SQUARE AND SEMICIRCLES Hatched Area = 89.9 -> `12.5`
- **19I-64** SQUARE AND EQUILATERAL TRIANGLES Hatched Area = 2.26 -> `3.82`
- **19I-65** CONGRUENT RECTANGLES AND SQUARE -> `16.5`

### 2021 Invitational A  (Test 21A)

**Stated problems**

- **21A-6** What is 6.93 times 0.652? -> `4.52`
- **21A-7** Calculate the positive square root of the product of 0.196 and 9.92. -- -> `1.39`
- **21A-8** Find y if 2.52 raised to the y power equals 687. -> `7.07`
- **21A-16** An old saying concerning greedy people is, "You give them an inch and they will take a mile." How many inches are in a mile? -> `63,360  integer in`
- **21A-17** The smallest leaf in the world belongs to the plant, Wolffia globose. It is 150 um in diameter. How many would be needed to equal the area of the largest leaf in the world belonging to Raphia regalis? Its leaf is 80 feet long and 10 feet wide. -> `4.21x109`
- **21A-18** On average, what fraction of a year is all the weekends? -> `28.6 %`
- **21A-26** The product of two, consecutive, even numbers is 8,648. What is their sum? -> `186  integer`
- **21A-27** A bag of chicken feed costs $30 and feeds six chickens for a month. Chickens on average lay two eggs every three days. What is the average cost of a dozen eggs? -> `$2.96`
- **21A-28** A person must burn 3500 calories to lose one pound of weight. If a 200-pound person wants to lose 40 pounds in six months, by how much must their daily caloric intake be reduced? -> `767 calories`
- **21A-36** Wendy gets 19.7 mi/gal driving in the city and 26.2 mi/gal on the highway. If she drives 245 mi and consumes 9.98 gal, what fraction of the trip was in the city? -> `20.4 %`
- **21A-37** A bathtub drains in 4 min 45 s. It fills in 3 min 12 s. How long would it take to fill the bathtub if the stopper was removed? -> `9.81  (3SD) min`
- **21A-38** Average human blood pressure is 100 mm Hg, the pressure imposed at the base by a column of mercury 100 mm tall. If pressure is the product of material density, the gravitational constant and column height, what is this value in psi? The density of mercury is 13.5 g/cm3. -> `1.92 psi`
- **21A-46** An empty 1-quart capacity saucepan weighs 2 lbs. How much does an empty half-gallon saucepan weigh? Assume that the sheet metal thickness is the same for both. -> `3.17 lbs`
- **21A-47** Calculate the correlation coefficient for these data: (1.2, 2.95), (2.3, 7.25), (3.5, 9.4), (5, 13.3), (5.85, 17). -> `0.992`
- **21A-48** Calculate positive x if 13xx = 15x+20. -> `1.97`
- **21A-56** For the function y = -5x2+30x-40, what is the x value associated with the maximum? -> `3.00`
- **21A-57** A cylindrical water tank is 6 ft in diameter and 4 ft tall. When drained from the bottom, the flow rate out is proportional to the water level in the tank. If a full tank drains 40% in 45 min, how long does it take to drain the tank another 40%? -> `96.8 min`
- **21A-58** What is the determinant of the matrix [ 13 -8 11 -8 13 15 11 15 9 ]? -> `-6190`
- **21A-61** Donnie can peel a sack of potatoes in 45 min, and Xavier can peel a sack in 34 minutes. If Donnie starts and is joined by Xavier after 13 min, how long did it take to peel the entire sack of potatoes? -> `26.8 min`
- **21A-62** The universe is estimated to be 4.33x1017 s old. What is this number raised to the 5,943 power? -> `4.44x10104813`
- **21A-63** A construction worker on the ground tosses a brick up to a worker on the second floor. What is the initial velocity of the brick if the vertical distance is 14 ft and the worker catches the brick at its maximum height? -> `20.5 mph`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **21A-9** PARALLELOGRAM Area = ? -> `234,000`
- **21A-10** CIRCLE Circumference = ? -> `5.27`
- **21A-19** RIGHT TRIANGLE Area = ? -> `0.000346`
- **21A-20** RIGHT TRIANGLE -> `86.9`
- **21A-29** HEMISPHERE Volume = 187,000 -> `44.7`
- **21A-30** CYLINDER Volume = ? -> `0.535`
- **21A-39** SCALENE TRIANGLE AND CIRCLE -> `0.0862`
- **21A-40** SCALENE TRIANGLES BC = CD = DE -> `925`
- **21A-49** CUBE WITH CYLINDRICAL CAVITY Solid Cube Volume = 2 Cylinder Volume -> `0.0247`
- **21A-50** CUBE AND CONE AB = 372 -> `266`
- **21A-59** y=2x3-50x2-130x-800 -> `6960`
- **21A-60** IDENTICAL RHOMBUSES Total Area = 824 -> `35.6`
- **21A-64** IDENTICAL ISOSCELES TRIANGLES AB = ? Total Area = 0.274 -> `0.742`
- **21A-65** INFINITE NUMBER OF CIRCLES Area of All Circles = 16.1 -> `24.0`

### 2021 Invitational B  (Test 21B)

**Stated problems**

- **21B-6** What is the positive square root of 5.96? -> `2.44`
- **21B-7** What is w if 2530 plus w equals 9240? -> `6710`
- **21B-8** Solve for t if t cubed divided by 5.04 equals -0.0823. -> `-0.746`
- **21B-16** Wendy bought four items at the store, costing $21.95, $4.82, $11.70 and $8.53. With 8.125% sales tax added, how much did she pay? -> `$50.82`
- **21B-17** Hana drove from Three Rivers TX to Four Corners TX, a distance of 202 mi. How fast did she drive if the trip took 3 hr 11 min? -> `63.5 mph`
- **21B-18** How many tablespoons are in a half gallon? -> `128  integer`
- **21B-26** The Taj Mahal sits on a 17 hectare complex. If a hectare is the area of a 100-m square, how many acres is this? -> `42.0 acres`
- **21B-27** It is estimated that a pound of oreo cookies sold for $0.22 in 1912, its first year of sales. In 2020, a 14.3 oz bag costs $3.07. Based on this, what is the average annual inflation rate? -> `2.58 %`
- **21B-28** The Great Salt Lake has an estimated surface area of 1710 mi2 and an average depth of 16.3 ft. What is the percent error in the calculated lake's volume if the exact value is 15,338,000 acre-ft? -> `16 %`
- **21B-36** Nancy's quiz grade is linearly related to how long she studies. Studying 2 hr, she received a 75. Studying 3 hr, she got an 83. What would her grade be if she didn't study at all? -> `59   integer`
- **21B-37** Water pressure is the product of water density, the gravitational constant and depth. What is the water pressure at the Titanic, which sits at a depth of 12,000 ft, a positive number? -> `5200 psi`
- **21B-38** At Galvestion Pier 21, the tide height varies sinusoidally. High tide was 2.6 ft at 10 AM and low tide was 1.6 ft at 10 PM. What was the water level at 3:30 PM? -> `2.17 ft`
- **21B-46** A person harvests potatoes at the same rate regardless of the size of the potato. If 3 workers harvest 1500 lbs of 5-in long potatoes in 8 hr, how many pounds of 3-in potatoes can 5 workers harvest in 3 hr? -> `203 lbs`
- **21B-47** Frank drives a golf ball down a fairway, attempting for the ball to travel 50 yd. It actually travels 46 yd. Repeating for 100 yd, it travels 105 yd. Other data include (150 yd, 135 yd) and (200 yd, 218 yd). If Frank wants the ball to travel 250 yd, what distance should he attempt? -> `239 yd`
- **21B-48** (rad) For what positive value of d does d2 = 20cos(d)? -> `1.46`
- **21B-56** For what value of y does the slope of the function y = 3x2-4x-17 equal 1.5? -> `-18.1`
- **21B-57** A bug population is 250,000 bugs and doubles every 3 days. A bird eats 4 bugs hourly round the clock. How many birds are needed to maintain a constant bug population? -> `602`
- **21B-58** What is k12 if k = [51 61 61 -45][0.5 1.2 1.2 -8 ]? -> `-427`
- **21B-61** Two people are lost in the desert. One takes off heading south at 2 mph, and 25 min later, the other starts walking east at 2.5 mph. How long after the first person left does it take them to separate by 10 mi? -> `3.37 hr`
- **21B-62** There are 3.72x1013 cells in the human body. What is this number raised to the 2530 power? -> `2.98x1034,333`
- **21B-63** A jet flying at 800 mph at an elevation above ground of 1200 ft fires an unpowered missile at a target. The release angle is 0 deg relative to the ground. How far from the ground target (horizontal distance) should the missile be fired? Neglect air resistance. -> `1.92 mi`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **21B-9** SQUARE Area = 47.2 -> `6.87`
- **21B-10** SEMICIRCLE Area = ? -> `163`
- **21B-19** RIGHT TRIANGLE -> `28.7`
- **21B-20** RIGHT TRIANGLE -> `45.4`
- **21B-29** CUBE AB = ? A = midpoint -> `1.78`
- **21B-30** SPHERE Total Surface Area = 0.268 -> `0.292`
- **21B-39** RIGHT TRIANGLE AND CIRCLE -> `0.0122`
- **21B-40** RIGHT AND SCALENE TRIANGLES -> `50.5`
- **21B-49** LARGE CONE AND FRUSTUM Frustum Volume = 1 2 Large Cone Volume -> `0.580`
- **21B-50** CUBE AND TWO IDENTICAL PYRAMIDS Cube Volume - Both Pyramid Volumes = 77.3 -> `4.88`
- **21B-59** SOLID OF REVOLUTION (x = -5) y= -20x2+200x-460 Volume = ? -> `2240`
- **21B-60** SQUARE AND SEMICIRCLE Square Area = Semicircle Area -> `0.593`
- **21B-64** RIGHT TRIANGLE, SQUARE, SEMICIRCLE -> `0.00944`
- **21B-65** INFINITE NUMBER OF EQUILATERAL TRIANGLES hn=39.5 hn-1= 1 2 hn, etc. -> `91.2`

### 2021 District  (Test 21F)

**Stated problems**

- **21F-6** What is the product of 2.53 and 0.313? -> `0.792`
- **21F-7** Calculate the product of 605 and 8.22/0.686. -> `7250`
- **21F-8** Solve for positive z if 0.343 times z equals 0.137 divided by z. -> `0.632`
- **21F-16** Daily, Walt spends 7 hr sleeping, 2 hr eating and 8 hr working. What is his free time in a day? -> `7.00 hr`
- **21F-17** Donuts cost $1.19 each, but a dozen costs $11.49. What is the maximum number of donuts for which it's still cheaper to buy them individually rather than getting the dozen? -> `9   integer`
- **21F-18** A marathon race is 26 mi 385 yd. Eliud Kipchoge of Kenya set a world's record for the marathon, completing the race in 2 hr 1 min 39 s. What was his average time to run one mile? -> `4.64 min`
- **21F-26** An old machine produces 235 widgets/hr round the clock. Current daily widget demand is 16,000. To meet demand, a second machine is purchased. What is the new machine's widget output? -> `432 widgets/hr`
- **21F-27** The product of two, consecutive integers is 108,570. What is the smaller number? -> `329   integer`
- **21F-28** Lake Sevan is a high-elevation lake in Armenia with a surface 6286 ft above sea level. If a drainage pipe were extended from the lake down to sea level, what would the exit pressure of water be, a positive number? Exit pressure is the product of the water density, gravitational constant and elevation. -> `2725 psi`
- **21F-36** The dwarf planet Haumea is 34.8 astronomical units (AU) from the sun. An AU is the average distance from the sun to earth, 93 million mi. What is the shortest time to travel from earth to Haumea if the vehicle speed were 10% of the speed of light? The speed of light is 186,000 mi/s. Neglect relativistic effects. -> `1.96 days`
- **21F-37** A piece of jewelry cost $2500. If it doubles in value every 5 yr, what is it worth in 3.5 yr? -> `$4061.26`
- **21F-38** Hours of daylight varies sinusoidally in Chicago. On the summer solstice, June 21, there are 16 hr 23 min of daylight. On the winter solstice, December 21, there are 9 hr 12 min of daylight. How many hours of daylight are there on August 17? -> `14.8 hr`
- **21F-46** The cost of a rubber figure scales with its volume. If a 5-in tall figure costs $3.98, what is the height of one that costs $35.99? -> `10.4 in`
- **21F-47** A lion is 7.2 ft long and weighs 420 lbs. A puma is 5.3 ft long and weighs 180 lbs. A lynx is 40 in long and weighs 52 lbs. Estimate the weight of an 18-in long house cat. -> `17.7 lbs`
- **21F-48** For what negative value of w less than -1 does w3+w+100 = 2/w2? -> `-4.57`
- **21F-56** (rad) Calculate the area under the curve y = 5sin(x/10)+8 between 0<=x<=10. -> `112`
- **21F-57** A ship travels north at 20.55 mph. Another ship follows at the same speed 49.35 mi behind. The lead ship changes course to east at the same time the other ship changes course to northeast. What is the distance of their closest approach? -> `18.89 mi`
- **21F-58** Calculate T23 if T = [ 2 -5 7 -5 3 3 7 3 9 ][ 1 5 -12 5 3 6 -12 6 10 ]. -> `108`
- **21F-61** Two 5-ft tall posts are separated by 8 ft. A string is tied to the top of each and is pulled taut. One post is then moved 6 in towards the other. Assuming the string forms a circular arc, what is the height of the string midpoint above the floor? -> `3.80 ft`
- **21F-62** The universe is estimated to be 8.8x1026 meters across. What is this number raised to the power 307? -> `9.04x108271`
- **21F-63** In a football game, the fullback, next to the quarterback, starts running down the field at 30 ft/s at the same time the quarterback throws the ball with a velocity of 52 ft/s. What was the football release angle if the catch is completed? -> `54.8 degrees`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **21F-9** ISOSCELES TRAPEZOID -> `0.00446`
- **21F-10** PARALLELOGRAM Perimeter = 23.8 -> `7.64`
- **21F-19** RIGHT TRIANGLE -> `55.9`
- **21F-20** RIGHT TRIANGLE -> `97000`
- **21F-29** SQUARE PYRAMID Volume = ? -> `1.60x108`
- **21F-30** CONE Volume = 0.0771 -> `0.609`
- **21F-39** EQUILATERAL TRIANGLE AND CIRCLE -> `30.7`
- **21F-40** SCALENE TRIANGLES -> `25.3`
- **21F-49** CUBE AND CONE Cube Volume - Cone Volume = 500 -> `8.78`
- **21F-50** RECTANGULAR SOLID AB = 64.4 BC = 21.1 AC = 61.7 Volume = ? -> `8790`
- **21F-59** RADIANS Hatched Area = ? -> `0.625`
- **21F-60** SCALENE TRIANGLES -> `71.4`
- **21F-64** SECTOR AND PARALLELOGRAM Parallelogram Area = Hatched Area = 65 -> `14.3`
- **21F-65** SQUARE AND SEGMENT Hatched Area = 0.482 -> `2.75`

### 2021 Region  (Test 21H)

**Stated problems**

- **21H-6** What is 8690 divided by 0.418? -> `20800`
- **21H-7** What number when subtracted from 8765 yields 5678? -> `3087  integer`
- **21H-8** What is the remainder of 584 divided by 4.99? -> `0.170`
- **21H-16** Gabe and Ginny have dinner. The total bill including the 15% tip comes to $37.95. Ginny covers $15 of the meal, and Gabe covers the rest of the meal as well as all of the tip. How much did Gabe pay? -> `$22.95`
- **21H-17** The universe has 5 x 1022 stars organized into 1.25 x 1011 galaxies. On average, how many stars are in a galaxy? -> `4.00x1011`
- **21H-18** A cube has 2 in side dimensions. During heating the side dimensions each shrink 10%. What is the percent change in cube volume? -> `-27.1 %`
- **21H-26** The cloth on a 60 in bolt of fabric is 40 yd long. A lamp shade uses a square of fabric that is 30 in on a side. How many lamp shades can be made from one bolt of cloth? -> `96  integer`
- **21H-27** A couple buys a new house, taking out a 30-yr loan. They borrow a principal of $395,000 at an annual interest rate of 3.9%. If their monthly payment (principal and interest) is $1725.16, how much of the first monthly payment goes to reduce the principal? -> `$441.41`
- **21H-28** Barney walks 3 mi to school in 1 hr 5 min. He can bike to school in 13 min. One day, he started biking but had a flat and walked the rest of the way. How far did he bike if the entire trip took 22 min? -> `2.48 mi`
- **21H-36** What is the length of the line segment spanning from the origin to the tangent point on the circle (y-8)2 + x2 = 45? -> `4.36`
- **21H-37** Jupiter's diameter is 10.971 times earth's. Its mass is 317.8 times earth's. If the density of the earth is 5.509 g/cm3, what is the density of Jupiter? -> `1.326 g/cm3`
- **21H-38** The Great Pyramid of Giza has a square base 756 ft long. It is 481 ft tall. It is estimated that 2.3 million blocks of limestone and marble were used in its construction. What is the average volume of one block? -> `39.8 ft3`
- **21H-46** 3D printers build at constant volume rate. If a plant building 3-in parts requires 12 3D printers to build 5000 parts/mo, how many machines will be needed to build monthly 8000 7-in parts of similar shape? -> `244  integer`
- **21H-47** Ronald throws a shot put at 5 meter increments starting at 5 meters. His measured distances were: 4.5 m, 11.3 m, 13.3 m, 22.2 mm. Estimate the measured distance for a 12 m attempt. -> `12.3 m`
- **21H-48** What is d if d - d = 10 + 100/d? -> `19.5`
- **21H-56** What is the maximum value of y for the function y = -3x2+25x+300? -> `352`
- **21H-57** A farmer has 150 ft of fencing and wants to build a pen that is a rectangle with one semicircle attached to one side such that the semicircle diameter equals the side dimension of the rectangle. She wants to maximize the pen area. What is the radius of the semicircular portion of the pen? -> `21.0 ft`
- **21H-58** What is positive t if the determinant of [ t 32 14 32 -25 18 14 18 t ] equals 120? -> `12.6`
- **21H-61** A ball is rolled on level ground at an initial velocity of 20 ft/s. It rolls to a stop 35 ft away. What was the deceleration, a negative number? -> `-5.71 ft/s2`
- **21H-62** The largest prime number known is a Mersenne prime, 282,589,933 - 1. Solve this number. -> `1.49x1024,862,047`
- **21H-63** Dana tosses a ball to her friend who is 30 ft away. If the release angle is 28 deg, what is the necessary release velocity? -> `23.3 mph`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **21H-9** CIRCLE Circumference = 9.26 -> `1.47`
- **21H-10** RHOMBUS Area = 0.177 -> `0.440`
- **21H-19** RIGHT TRIANGLE -> `601`
- **21H-29** HEMISPHERE Total Surface Area = ? -> `3.29`
- **21H-30** CYLINDER Volume = 6.58x106 -> `121`
- **21H-39** SCALENE TRIANGLE AND CIRCLE -> `0.234`
- **21H-40** ISOSCELES AND SCALENE TRIANGLES -> `0.185`
- **21H-49** FRUSTUM AND CONE Small Cone Volume = Frustum Volume -> `5.55`
- **21H-50** CUBE AND CYLINDER Total Volume = 6240 -> `15.8`
- **21H-59** RADIANS Hatched Area = 5 A = ? -> `2.62`
- **21H-60** SQUARE AND EQUILATERAL TRIANGLE -> `3.24`
- **21H-64** CONGRUENT RIGHT TRIANGLES -> `47.9`
- **21H-65** SQUARE, RECTANGLE, LARGE AND SMALL ISOSCELES TRIANGLES Area of Small Isosceles Triangle = Hatched Area -> `318`

### 2021 State  (Test 21I)

**Stated problems**

- **21I-6** What is 6 times the square root of 5697? -> `453`
- **21I-7** What is 10 raised to the power 1.69? -> `49.0`
- **21I-8** What is positive x if 54x = 12/x? -> `0.471`
- **21I-16** Jim reads a page in 1 min 45 s. How long would it take him to read the 1225-page book, War and Peace? -> `35.7 hr`
- **21I-17** A loaf of bread has 24 slices, including the heels. How many loaves much be purchased to provide one sandwich each for 350 people, if the heels are not used? -> `32  integer`
- **21I-18** Quincy decreases her time to run 1 mi from 9 min 38 s to 8 min 7 s. What is the percent increase in distance traveled if she runs 30 min at each rate? -> `18.7 %`
- **21I-26** The Great Pyramid of Giza was reported to have been built in 20 years, and there were an estimated 2.3 million massive stone blocks used in its construction. Assuming workers toiled continuously day and night, on average, how many stone blocks were placed hourly? -> `13.1 blocks`
- **21I-27** An astronomer measures the distance to the front of the moon, 238,937 mi. She also measures the distance to the back side of the moon, 241,096 mi. What is the diameter of the moon? -> `2159 mi`
- **21I-28** Frank buys 5 packs of hot dog buns ($0.85 each), 5 packs of franks ($0.89 each), and one jar each of mustard ($0.58), ketchup ($2.25) and relish ($1.58). Assume all the condiments are used up. There are 8 buns and franks in a pack, what is the average cost of one hot dog? -> `$0.33`
- **21I-36** At the State Meet for UIL Calculator Applications, contestants typically work all the numerical problems (number crunchers) in 12 min. Assuming a keystroke speed of 1.7 keystrokes/s, what is the average number of keystrokes for a number cruncher problem? -> `35.0`
- **21I-37** The dwarf planet Eris is 10.166x109 km from earth. If a spacecraft left earth for Eris traveling at the same speed as Voyager 2, 34,519 mph, how long would it take to reach Eris? -> `20.875   (5SD) yr`
- **21I-38** An elevator has a traveling speed of 5 ft/s. It accelerates/decelerates at 4 ft/s2. What is the percent error the time taken to travel 60 ft if one assumed the elevator accelerated/decelerated instantaneously? -> `-9.43 %`
- **21I-46** A brand of containers are made from plastic and all have the same thickness. They are designed to hold a liquid priced at $10.75/gal. If an empty 2-gal container cost $5.95, what is the value of a full 10-gal container? -> `$124.90`
- **21I-47** The price of a bag of sugar is comprised of the constant bag cost and the sugar cost. An 4-lb bag costs $2, and a 12-lb bag costs $5. What is the size of a bag of sugar that costs $8? -> `20.0 lb`
- **21I-48** What is w if 2w = w2 + 3? -> `4.59`
- **21I-56** What is the slope of the curve y = 3x3-25x2+13x-5 when y = 30? -> `187`
- **21I-57** A window is a rectangle surmounted by a semicircle. The total perimeter is 9 ft. The rectangular part is made of clear glass which passes all the light through it. The semicircle portion is colored and passes only half the light. What is the radius of the semicircle portion of the window for which the most light is transmitted through the window? -> `1.03 ft`
- **21I-58** Solve for F12 if F = GH. G = [894 838 838 583] and H = [37 36 36 -67] . -> `-24000`
- **21I-61** Falfurrias (98 deg8'42"W) lies on the same latitude as the Taj Mahal (78 deg2'31"E) in India. Both lie at 27 deg12' north. How long is the shorter line of constant latitude between these places? -> `10800 mi`
- **21I-62** The probability of being dealt a straight flush in poker is 1.39x10-5. What is the probability of being dealt 200 straight flushes in a row? -> `4.01x10-972`
- **21I-63** Don throws a fast ball at a release angle of 15 deg to a friend some distance away. He could alternatively lob the ball high into the air to his friend. In that case, what should the release angle be? -> `75.0 degrees`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **21I-9** RECTANGLE Perimeter = 12.6 -> `1.81`
- **21I-10** PARALLELOGRAM Area = ? -> `15000`
- **21I-19** RIGHT TRIANGLE -> `0.663`
- **21I-20** RIGHT TRIANGLE Area = 0.431 -> `1.34`
- **21I-29** SPHERE Volume = 0.702 -> `1.10`
- **21I-30** CYLINDER Total Surface Area = 7.04 -> `1.03`
- **21I-39** SCALENE TRIANGLE AND CIRCLE -> `0.180`
- **21I-40** ISOSCELES AND SCALENE TRIANGLES -> `0.923`
- **21I-49** CUBE AND SQUARE PYRAMID Cube Total Surface Area =1.5 [ Pyramid Total Surface Area ] -> `4.12`
- **21I-50** HEMISPHERE WITH CONICAL CAVITY Total Surface Area = 77.8 -> `2.69`
- **21I-59** SOLID OF REVOLUTION (x = 0) Volume = ? -> `6.28`
- **21I-60** SEMICIRCLE AND RIGHT TRIANGLE AB = 10.8 -> `6.48`
- **21I-64** ISOSCELES TRIANGLE AND SQUARE AB = 0.657 -> `0.735`
- **21I-65** ISOSCELES TRIANGLE AND CONGRUENT SCALENE TRIANGLES AB = 30.4 -> `47.7`

### 2023 Invitational A  (Test 23A)

**Stated problems**

- **23A-6** Calculate the product of 99.7 and the positive square root of 770. -> `2770`
- **23A-7** Calculate negative x if 5x = 35/x. -> `–2.65`
- **23A-8** Calculate the cube root of the product of 4780 and -18.4. -> `–44.5`
- **23A-16** What is the viewing area of a rectangular picture frame that has dimensions of 9.5 in and 13 in? -> `124 in2`
- **23A-17** The pitcher's mound is 60 ft 6 in from home plate, and home plate is 127 ft 3 in from second base. What is the distance from the pitcher's mound to second base? -> `66.8 ft`
- **23A-18** A supersonic transport flies at 1.7 times the speed of sound. The speed of sound is 660 mph. How long does it take to fly from Los Angeles to Toyko, if the distance is 5451 mi? -> `4.86 hr`
- **23A-26** Sam runs a mile in 6 min 48 s. What is his velocity? -> `8.82 mph`
- **23A-27** The Mona Lisa painting is valued at $900 million. It is rectangular, 2 ft 6 in by 1 ft 9 in. What is the value per unit area? -> `2210`
- **23A-28** Lenny invests $3530 for two years at 5% annual interest. What is the positive difference in total earnings, if the money was compounded annually or monthly? -> `$8.62`
- **23A-36** Texas has a land area of 268,596 mi2. A map of the US is scaled such that 1 in on the map represents 112.5 mi. What is the map area of Texas? -> `21.22 in2`
- **23A-37** What is the positive x value of the intersection of the line y = 3x + 2 and the curve y = 8x2 - 20x - 25? -> `3.77`
- **23A-38** Marie bikes 5 mi to school in 20 min, and she can walk in 1 hr 20 min. On the way to school, her bike broke down, and she walked the rest of the way. If the total commute was 47 min, how far from home was she when the bike broke down? -> `2.75 mi`
- **23A-46** Columbus' ship Santa Maria weighed 50 tons and was 76 ft long. A US battleship is 860 ft long and weighs 48,600 tons. The battleship density is actually two thirds the Santa Maria density. What is the percent error in estimating the battleship weight using the Santa Maria data? -> `–0.620 %`
- **23A-47** Shirt size is measured by the neck perimeter in inches. The amount of cloth needed to make a shirt is measured by the length of cloth in yards from a bolt of constant width. A Size 12 shirt is made from 1.5 yd of cloth. Other values (Size, Cloth) are (15, 2.2 yd), (16, 2.5 yd) and (17, 2.8 yd). How much cloth is needed to produce a Size 18 shirt? -> `3.11 yd`
- **23A-48** What is z if 5z = z 3 + 24? -> `29.3`
- **23A-56** Calculate the area under the curve y = 4x2-14x+15 for 1<x<6. -> `117`
- **23A-57** A bug population of 100 bugs doubles in number every 3 days. Birds eat the bugs, each bird consuming 26 bugs/day. How many birds are needed to control the total bug population to just under 9,000 bugs? -> `80  integer`
- **23A-58** What is the determinant of [ 1 5 15 5 -6 -10 15 -10 22 ]? -> `–932`
- **23A-61** How long after 1:15 do the minute and hour hands of a clock align? -> `55.9 min`
- **23A-62** The probability of winning the Powerball lottery is 1 in 192 million. What is the probability of winning it 100 times? -> `4.68X10–829`
- **23A-63** A tennis player hits a lob from the baseline. The ball's maximum height is 15 ft at the net, and it travels the full length of the court, 78 ft. What is the time of flight of the ball? -> `1.93 s`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **23A-9** SEMICIRCLE Area = 54.9 -> `5.91`
- **23A-10** RHOMBUS Area = ? -> `4.64`
- **23A-19** RIGHT TRIANGLE -> `0.630`
- **23A-20** RIGHT TRIANGLE Area = 5930 -> `125`
- **23A-29** CONE Total Surface Area = ? -> `26,500`
- **23A-30** SPHERE Volume = 77.3 -> `5.29`
- **23A-39** CIRCLE AND SCALENE TRIANGLE -> `1.85`
- **23A-40** SCALENE TRIANGLES -> `3.95`
- **23A-49** CUBE AND SQUARE PYRAMID Volume(Pyramid) = Volume(Cube) -> `1.87`
- **23A-50** RECTANGULAR SOLID AB = 0.232 BC = 0.090 BD = 0.143 -> `0.144`
- **23A-59** Hatched Area = ? -> `0.00694`
- **23A-60** CONGRUENT SEMICIRCLES Hatched Area = 0.435 -> `0.842`
- **23A-64** EQUILATERAL AND ISOSCELES TRIANGLES Area(Isosceles Triangle) = Area(Equilateral Triangle) -> `182`
- **23A-65** CONGRUENT CIRCLES Hatched Area = 3.53 -> `0.731`

### 2023 Invitational B  (Test 23B)

**Stated problems**

- **23B-6** What is 0.0824 divided by 8960? -> `9.20x10–6`
- **23B-7** What is the base-10 logarithm of the product of 36.7 and 19.8? -> `2.86`
- **23B-8** What negative number produces 851 when its reciprocal is squared? -> `–0.0343`
- **23B-16** What is the cost of one donut if a dozen costs $4.08? -> `$0.34`
- **23B-17** The face on a passport photo must be 1 in long. By what amount must a photo be enlarged if the face is only 0.72 in? -> `38.9 %`
- **23B-18** A gold brick weighs 12.4 kg. What is this mass in pounds? -> `27.3 lbs`
- **23B-26** For a school project, Hayden has $40 to spend on bags of M&Ms. A bag costs $1.75, and there is 8.125% sales tax. How many bags can Hayden buy? -> `21  integer`
- **23B-27** Fingernails grow at 1.64 in/yr. If Emily trims away 2 mm of fingernail when she trims her nails, how often should she trim her nails? -> `2.51 weeks`
- **23B-28** Tyler finds a hotel room for $129. The hotel later offers an upgrade for an additional $18. What is the percent increase in room cost? -> `14.0 %`
- **23B-36** A Facebook post goes viral with views growing exponentially. After 3 hr, there were 3650 views. How long would it take from the initial posting to get 1 million views? -> `5.05 hr`
- **23B-37** How much water is needed to fill a rectangular fish tank with dimensions, 4 ft, 15 in and 12 in? -> `37.4 gal`
- **23B-38** The Great Pyramid of Giza, Egypt is presently 454 ft tall with a square base of side dimension 756 ft. What is its visible surface area? -> `8.93x105 ft2`
- **23B-46** If the building materials for a 2000-ft2 house cost $89,000, how much would the building materials cost for a 3700-ft2 house? Room height is 8 ft for both houses. -> `$121,053.09`
- **23B-47** Elephant weight is linear relative to its age. At birth, an elephant weighs 200 lb. At age 10 yr, their weight is 2300 lbs. At age 20 years, they weigh 4500 lbs. What is the weight of a 5-year-old elephant? -> `1260 lbs`
- **23B-48** Solve for r if r3 + 25 = 3r. -> `–3.26`
- **23B-56** (rad) At what value of x between 0 and /2 does the slope of the curve y = 2sin(x) equal 0.3? -> `1.42`
- **23B-57** Joe leaves Dimmit driving due south to Springlake, 22.3 mi away, at 65 mph. Ten minutes later, Farrah leaves Springlake driving west to Muleshoe at 55 mph. What is the closest straight-line distance Joe comes to Farrah? -> `7.41 mi`
- **23B-58** Solve for r if C = DE, D = [ 2 -2 4 -2 7 3 4 3 3 ], E = [ -6 5 r ] and C2 = 75. -> `9.33`
- **23B-61** Wendy runs a mile 8 min 35 s, and Wylie runs a mile in 6 min 53 s. If they start together, how far apart are they after 45 min 44 s? -> `1.3 mi`
- **23B-62** The probability of being struck by lightning in a day is 1 in 182 million. What is the probability of being lightning struck 1000 days in a row? -> `8.48x10–8261`
- **23B-63** An outfielder throws a baseball a horizontal distance of 200 ft to home plate with a release velocity of 82 mph. What is the shorter time of flight for the baseball? -> `1.71 s`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **23B-9** CIRCLE Area = 9.82 -> `3.54`
- **23B-10** SQUARE Perimeter = 6.01 -> `1.50`
- **23B-19** RIGHT TRIANGLE Area = ? -> `0.0943`
- **23B-20** RIGHT TRIANGLE Area = ? -> `696`
- **23B-29** RECTANGULAR SOLID Volume = 7.42 -> `3.59`
- **23B-30** CONE Volume = 20.5 -> `4.28`
- **23B-39** CIRCLE AND RIGHT TRIANGLE -> `1.51`
- **23B-40** PARALLELOGRAM AB = ? -> `511`
- **23B-49** SPHERICAL WEDGE Volume(Spherical Wedge) = Volume(Sphere) 7 -> `51.4`
- **23B-50** CYLINDER AND FRUSTUM Volume(Cylinder) = Volume(Frustum) -> `0.158`
- **23B-59** Hatched Area = 30 -> `3.92`
- **23B-60** CONGRUENT SQUARES Hatched Area = 8.77 -> `5.92`
- **23B-64** IDENTICAL CIRCULAR ARCS Hatched Area = 77.7 -> `19.0`
- **23B-65** CONGRUENT CIRCLES AND EQUILATERAL TRIANGLE All three areas are equal -> `246`

### 2023 District  (Test 23F)

**Stated problems**

- **23F-6** Calculate the positive square root of the sum of 737 and 67.7. -> `28.4`
- **23F-7** Calculate the reciprocal of the sum of 639 and 227. -> `0.00115`
- **23F-8** Calculate log(0.0402)/ln(0.529). -> `2.19`
- **23F-16** What is the area of a rug that is 8 ft by 12 ft? -> `13,800 in2`
- **23F-17** A group of 435 people is 34.5% women. How many men are there? -> `285  integer`
- **23F-18** Carrie buys a dress marked at $35.75. Including the 8.125% sales tax, how much change does she receive if she pays with a $50 bill? -> `$11.35`
- **23F-26** A gallon of gas cost $3.86. Several months later, it cost $4.35. What is the percent increase in gas price? -> `12.7 %`
- **23F-27** The most distant artificial spacecraft is Voyager 1 which is 14.5 billion mi from earth. How long does it take a communication signal (light) to travel from Voyager to earth, if the speed of light is 186,000 mi/s? -> `21.7 hr`
- **23F-28** The Great Pyramid of Giza, Egypt was originally 481 ft tall. Today, it is 454 ft tall. If it was completed 4600 years ago, what is the erosion rate? -> `1.8 mm/yr`
- **23F-36** The half-life of tritium is 12.3 yr. What percent of a tritium sample decays in 1 day? -> `0.0154 %`
- **23F-37** The deck of Columbus' ship, La Nia, was 17 m by 5.36 m. What is the average space per person, if all 27 crew members were on deck? -> `36.3 ft2`
- **23F-38** Hanna can bike from Paradise TX to Eden TX in 17 hr 48 min, and she drives the same route in 3 hr 35 min. What is the percent increase in her velocity? -> `397 %`
- **23F-46** Roof pitch is the vertical rise in inches divided by a 12-inch horizontal run. A square of shingles will cover 100 ft2 of roof. The roof on a 2500-ft2 house was planned to have a pitch of 4 and required 33 squares of shingles. How many shingles are needed for a 3700-ft2 house with a pitch of 5.5? -> `51  integer`
- **23F-47** A goliath beetle is 4.3 in long with a mass of 3 oz. The rhinoceros beetle is 68 mm long with mass equal to 23 g. The dung beetle is 0.7 in long and weighs 10 g. How long is a scarab beetle that weighs 3.5 oz? -> `4.56 in`
- **23F-48** (rad) For what positive value of f does sin(f)/f = f2? -> `0.929`
- **23F-56** (rad) Calculate the slope of the function y = 2sin(x/) at x = 15. -> `0.0396`
- **23F-57** An excavator can scoop a volume V of earth in one scoop. The energy consumed E for one scoop is given by E= [20 ft-lb ft4.5]V1.5+50 ft-lb. What should the scoop volume V be to remove a large volume of earth, if it is desired to minimize the total energy consumed? -> `2.92 ft3`
- **23F-58** What is M3 if M = NP, N = [ 9 -5 6 -5 3 12 -4 12 12 ] and P = [ -6 5 5 ]? -> `144`
- **23F-61** A speeder traveling at 45 mph passes an idle police car. After a 3 second delay, the police car accelerates at a constant rate to catch the speeder. If the police car catches up after 11 s of acceleration, what was the acceleration? -> `15.3 ft/s2`
- **23F-62** The probability of getting heads in a coin toss is 0.5. What is the probability of tossing heads one million times in a row? -> `1.01x10–301,030`
- **23F-63** A bazooka projectile is fired with an initial velocity of 900 ft/s and a release angle of 33 deg. It overshoots the target by 55 ft. What should the angle be lowered to, to hit the target? -> `32.8 deg`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **23F-9** CIRCLE Circumference = 45.7 Area = ? -> `166`
- **23F-10** TRAPEZOID Area = ? -> `1810`
- **23F-19** RIGHT TRIANGLE Area = 0.00166 -> `48.4`
- **23F-20** RIGHT TRIANGLE Area = ? -> `180`
- **23F-29** CUBE AB = 2.97 Volume = ? -> `5.04`
- **23F-30** CYLINDER Total Surface Area = 0.0458 -> `0.148`
- **23F-39** CIRCLE AND SCALENE TRIANGLE -> `51.8`
- **23F-40** SCALENE TRIANGLE -> `1.75`
- **23F-49** SEMICIRCLE AND ISOSCELES TRIANGLE PRISM AB = ? Volume = 30,500 -> `53.4`
- **23F-50** CUBE M = midpoint, C = center Hatched Area = ? -> `0.997`
- **23F-59** SOLID OF REVOLUTION (y = -3) -> `209`
- **23F-60** SQUARE AND RECTANGLE a+b a = a b = ? -> `1.62`
- **23F-64** SQUARE M = midpoint Hatched Area = 2.13 -> `3.86`
- **23F-65** CIRCLE AND RECTANGLE Area(Circle) = Area(Rectangle) -> `72.9`

### 2023 Region  (Test 23H)

**Stated problems**

- **23H-6** What is the sum of 93 and the negative square root of 5790? -> `16.9`
- **23H-7** What is the result of squaring the value, 38.5/6.26? -> `37.8`
- **23H-8** Calculate the remainder of 7020 divided by 0.767. -> `0.416`
- **23H-16** If Donnie's trip to school takes 4.6 min, and the school is 2.5 mi from home, what is his average velocity? -> `32.6 mph`
- **23H-17** How many seconds has a person lived on their 16th birthday? -> `5.05x108 s`
- **23H-18** A promoter has 1000 flyers to hand out. It takes him 1 hr 52 min to do this. How many flyers were distributed each minute? -> `8.93`
- **23H-26** A goat is tied to a straight fence with a 20-ft leash, 8 ft away from a gate. What is the goat's grazing area if the gate is open? -> `855 ft2`
- **23H-27** Eliud Kipchoge set the world's record for the marathon, running 26 mi 385 yd in 2 hr 1 min 39 s. What was his average velocity? -> `12.93 mph`
- **23H-28** Dan types 50 words per minute, and Sheila types 65 words per minute. Dan starts typing the novel Moby Dick, which has 209,117 words. After time t, Sheila joins him. The book is finished 40 hr after Dan started. What is t? -> `17.1 hr`
- **23H-36** The population of Mineral Wells TX was 16,767 in 2010. In 2020, it was 15,612. What is the percent decrease in population? -> `6.889 %`
- **23H-37** Algae in a fish tank doubles every 28 hr. How long would it take the algae to grow to ten times its original population? -> `3.88 dy`
- **23H-38** A circle circumference may be approximated by the sum of N equal-length straight line segments. What is N if the error in the perimeter calculation falls just within -1% of the circumscribed circle circumference? -> `13  integer`
- **23H-46** Television sets are sized by the diagonal length of the viewing screen. The TV depth varies linearly with the size. If a 32-in TV costs $130, estimate the cost of an 85-in TV. Cost is proportional to TV volume. -> `$2436.41`
- **23H-47** The cost of pork belly varies monthly. In January 2021, it was 64.04 /lb. In February, March and April, it was 72.82, 88.88 and 102.15 /lb, respectively. Calculate the percent error in the extrapolated value for May if the actual value was 109.58 /lb. -> `4.55 %`
- **23H-48** Solve for positive m if 2m = 10(m+3). -> `6.58`
- **23H-56** (rad) For what value of x between 0 and /6 does the slope of the curve y = tan(3x) equal 20? -> `0.391`
- **23H-57** A piece of string is 60 in long. It is cut into two pieces. One is formed into a circle, and the other is used to create an isosceles right triangle. What is the circle diameter, if the sum of the two areas is minimized? -> `6.69 in`
- **23H-58** What is the determinant of the product of [p -12 -12 3 ][25 -40 32 5 ] if p = 17? -> `–131,000`
- **23H-61** A flight from Chicago to Rome, Italy leaves at 4:45 PM local time and arrives at 9:00 AM local time the next day. If the average plane velocity is 593 mph, and the distance is 5490 mi, how many 1-hr time zones are crossed? -> `7  integer`
- **23H-62** A virus population of 100 viruses doubles every 10 s. What is the virus population after 300 days? -> `5.61x10780,271`
- **23H-63** Randy pitches a rock from the top of a 112-ft rise into a lake. The release velocity and angle relative to the horizontal are 35 mph and 10 deg, respectively. If sound travels at 1100 ft/s, what is the elapsed time from the rock release to Randy hearing the splash? -> `3.10 s`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **23H-9** CIRCLE Circumference = ? -> `5470`
- **23H-10** PARALLELOGRAM Area = 0.0971 -> `0.216`
- **23H-19** RIGHT TRIANGLE -> `7.62`
- **23H-20** RIGHT TRIANGLE Area = 0.121 BC>AB -> `54.8`
- **23H-29** CUBE Total Surface Area = ? -> `172`
- **23H-30** SQUARE PYRAMID Volume = 33,000 -> `28.3`
- **23H-39** ISOSCELES TRIANGLE AND CIRCLE -> `449`
- **23H-40** SCALENE TRIANGLE -> `0.399`
- **23H-49** CUBE M = midpoint -> `36.9`
- **23H-50** CUBE AND IDENTICAL CONES 0.6[Volume(Both Cones)] = Volume(Cube) Total Volume = ? -> `2.32`
- **23H-59** RADIANS Hatched Area = ? -> `15.7`
- **23H-60** EQUILATERAL AND ISOSCELES TRIANGLES Area(Isosceles Triangle) = 40.8 -> `6.37`
- **23H-64** SQUARE WITH ROUNDED CORNERS Area = 90.8 -> `1.64`
- **23H-65** SEMICIRCLE AND RECTANGLE Hatched Area = Area(Segment) -> `26.5`

### 2023 State  (Test 23I)

**Stated problems**

- **23I-6** What is the result from squaring the sum of 0.706 and 0.931? -> `2.68`
- **23I-7** What is the product of the square of 0.861 and the positive square root of 0.905? -> `0.705`
- **23I-8** What is y if (y+5)/(y) = 4.85? -> `1.30`
- **23I-16** How long does it take Terrie to drive 155 mi at 65 mph? -> `2.38 hr`
- **23I-17** It's 33.7 mi from Nixon TX to Kenedy TX. How many inches is this? -- -> `2.14x106 in`
- **23I-18** What is the diameter of a 55-gal drum, if its height is 34.7 in? -> `21.6 in`
- **23I-26** The Circuit of the Americas F1 race track is 2.300 mi long. The single-lap record, set by Charles Leclerc in a Ferrari, is 1 min 36.169 s. What was his average speed? -> `86.10 mph`
- **23I-27** A "1000-piece" jigsaw puzzle was rectangular when completed, measuring 38 pieces by 27 pieces. What is the percent error in calling it a 1000-piece puzzle? -> `–2.53 %`
- **23I-28** The Cadillac Ranch is ten half-buried Cadillac cars, an art project outside Amarillo. If a Cadillac costs $35,000 in 2023, how much did all ten Cadillacs cost when the Ranch was constructed in 1974? Assume an average annual inflation rate of 2.6%. -> `$99,505.56`
- **23I-36** A stick in the ground 3 ft 6.25 in tall casts a shadow that is 1 ft 3.4 in long. How tall is a building casting a shadow 40 ft 9.2 in long? -> `112 ft`
- **23I-37** A person inhales a single virus cell. The virus triples in number every 4 hr. If it takes 300,000 virus cells to cause symptoms, what is the virus incubation period? -> `1.91 dy`
- **23I-38** The Washington Monument is an obelisk composed of a tapered square-cross-section (frustum of a pyramid) surmounted by a square- based pyramid. The frustum bases are a = 16.8 m and b = 10.5 m. The frustum height is h = 152.4 m. The pyramid base is 10.5 m, and it is 16.76 m tall. Calculate the volume of the Washington Monument. The volume of a pyramidal frustum is V = h(a2+ab+b2)/3. -> `29,500 m3`
- **23I-46** Assume lobsters and crawfish are geometrically similar. A 1.5 lb, 17-in long lobster yields 6.5 oz of tail meat. A crawfish averages 6.9 in length. If Ronnie wants to eat a half pound of crawfish tail meat, how many crawfish should he buy? -> `19  integer`
- **23I-47** Hakim measured an oven's temperature at set points from 50 degF to 300 degF in 50 degF increments. The actual oven temperatures, measured with a thermometer, were 55 degF, 112 degF, 175 degF, 220 degF, 285 degF and 330 degF, respectively. If a cake is supposed to be baked at 350 degF, what should the oven set point be? -> `314`
- **23I-48** Calculate h for 7h7 = 5h5+50. -> `1.41`
- **23I-56** At what value of x does the slope of the function x2-35x+231 equal 4? -> `23.8`
- **23I-57** Square stepping stones of side dimension a are butted next to each other in a line to create a path N times a long, N being the number of stepping stones. A 12-in stepping stone costs $1.58, and a 16-in stepping stone costs $2.50. What stepping stone dimension (a) minimizes the total cost of the path? The cost of a stepping stone equals ma2+C, where m and C are constants. -> `6.95 in`
- **23I-58** What is F23 if F = 13G +22H, G = [ 9 14 -19 14 9 3 -19 3 12 ], and H = [ 35 12 6 12 27 -14 6 -14 13 ]? -> `–269`
- **23I-61** Congruent isosceles triangles may be grouped to form a shape similar to a circle. More triangles make the assemblage look more like a circle. The sum of the triangle areas is given by Area= N 2 R2sin [ 2 N ], where N is the number of triangles and R is the radius of the associated circumscribed circle. What is the smallest N for which the sum of the triangle areas equals the circle area with just smaller than -1% error? -> `26  integer`
- **23I-62** What is 555 ? -> `1.91x102184`
- **23I-63** A professional golfer consistently hits a golf ball 250 yd with a 4 iron. The angle of release for a 4 iron is 24 deg. How far would the golf ball travel if she used a 5 iron instead? The angle of release is 27 deg. -> `272 yd`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **23I-9** SQUARE Area = 165 -> `12.8`
- **23I-10** PARALLELOGRAM Perimeter = 0.214 -> `0.0441`
- **23I-19** RIGHT TRIANGLE Area = ? -> `126,000`
- **23I-20** RIGHT TRIANGLE Area = 10.1 -> `7.68`
- **23I-29** CYLINDER Total Surface Area = ? -> `5.90`
- **23I-30** HEMISPHERE Total Surface Area = 91.8 -> `3.12`
- **23I-39** EQUILATERAL TRIANGLE AND CIRCLE -> `71.4`
- **23I-40** SCALENE TRIANGLE -> `0.175`
- **23I-49** CYLINDER WITH CONICAL CAVITY Volume = 24.8 -> `1.98`
- **23I-50** SPHERE WITH CUBIC CAVITY WHOSE CORNERS CONTACT THE SPHERE Volume = 5460 -> `14.7`
- **23I-59** RADIANS Hatched Area = ? -> `3.00`
- **23I-60** CIRCLE AND SQUARE AB = ? Area(Circle) = Area(Square) -> `1.41`
- **23I-64** SECTOR AND ISOSCELES TRIANGLE Sector Area = 5 Triangle Area = ? -> `55.3`
- **23I-65** PARALLELOGRAM AB = 6.44 CD = 10.9 Parallelogram Area = ? -> `30.1`

### 2024 Invitational A  (Test 24A)

**Stated problems**

- **24A-6** What is 4710 divided by 9.82? -> `480`
- **24A-7** What is the cube root of the result of 41.9 minus 17.8? -> `–2.41`
- **24A-8** A printer prints one page every 6 seconds. How many pages can be printed in 4 minutes? -> `40    integer`
- **24A-16** Marilyn wants a ham and cheese sandwich on rye. She goes to the grocery store to buy the ingredients: lettuce, $1.64; tomato, $1.10; ham, $5.71; cheese, $3.10; bread, $4.14, mayonnaise, $1.46, and relish, $2.78. How much did she spend on groceries? -> `$19.93`
- **24A-17** There are 2 million car accidents each year. On average there are 232.8 million licensed drivers. Assuming on average that 1.79 cars are involved in an accident and no drivers are involved in more than one accident annually, what fraction of drivers are involved in a car accident annually? -> `1.54 %`
- **24A-18** Half of the US 332 million population drink 12 oz of coffee daily. How many tanker trucks would this represent, if a tanker truck capacity is 7,500 gallons? -> `2080`
- **24A-26** An uninflated spherical 15 in diameter balloon is inflated at a constant volume rate. If it was 6 in in diameter after 2 s, what is the total time required to completely fill the balloon? -> `31.3 s`
- **24A-27** Liam's parents measure his growth annually. When he was 5 years old, his height was 3 ft 7.52 in. A year later, his height increased by 1.74 in. How tall was Liam on his 6th birthday? -> `3.772 ft`
- **24A-28** The surface area of a sphere is increased by 4%. What is the percent change in volume? -> `6.06 %`
- **24A-36** As a New Year's Resolution, on January 1, 2023, Charlie went on a diet. Her starting weight was 163 lbs. She averaged 3 lb loss each week. What is the percent decrease in her weight on March 6? -> `17.1 %`
- **24A-37** Ninety percent of Cobalt-60 decays in 17.48 yr. What is its half life? -> `5.26 yrs`
- **24A-38** A bulldozer scoop holds 2 cubic yards of dirt. Because the dirt is muddy, 15% of the dirt in the first scoop permanently adheres to the scoop, reducing its capacity. For the second scoop, 15% of dirt in the remaining capacity permanently adheres. This loss of capacity continues for subsequent scoops. What is the most dirt the bulldozer can deliver before the scoop is completely filled with mud? -> `11.3 cu`
- **24A-46** A box can hold 850 rocks that are 0.73 in long. How many 0.03 in long grains of sand could be poured into the empty box? -> `1.22x107`
- **24A-47** The population of Mali, Africa has grown linearly since 1990. Population data are (1990, 8.95 million), (2000, 11.2 million), (2010, 15.5 million), (2020, 21.2 million). Estimate the year when the population becomes 30 million people. -> `2043   integer`
- **24A-48** (rad) For what nonzero negative value of p does (6p)sin(p/) = p4? - -> `–1.36`
- **24A-56** (rad) The curve y = xcosx is integrated from zero to x1, where 0<x1<2. The area equals zero. What is nonzero x1? Consider area below the x axis to be negative. -> `2.33`
- **24A-57** Frieda drives at 70 mph due south from Friona to Muleshoe, 28 mi away. Five minutes later, Mike leaves Muleshoe at 55 mph driving due east to Earth, 18.3 mi away. What is their straight-line distance of closest approach? -> `13.7 mi`
- **24A-58** Calculate the product of the determinants of [-3 7 14 9] and [4 -12 2 17 ]. -> `–11500`
- **24A-61** Phyllis drives at 55 mph from Hondo to Brenham. How fast should she drive back to Hondo if she wants to average 62 mph for the entire trip? -> `71.0 mph`
- **24A-62** What is 614,601-4,323? -> `?`
- **24A-63** A diver runs off a 10-m high platform directly over the pool's edge. What is the diver's running velocity if they splash into the water 4 m from the pool edge? -> `6.27 mph`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **24A-9** CIRCLE Circumference = 680 -> `108`
- **24A-10** TRAPEZOID Area = 4940 -> `47.6`
- **24A-19** RIGHT TRIANGLE -> `425`
- **24A-20** RIGHT TRIANGLE -> `1.24`
- **24A-29** RECTANGULAR SOLID Total Surface Area = 3.21x106 -> `1180`
- **24A-30** SQUARE PYRAMID Volume = ? -> `3.54x10–7`
- **24A-39** RIGHT TRIANGLE AND INSCRIBED CIRCLE -> `2.26`
- **24A-40** SCALENE TRIANGLES -> `5.71`
- **24A-49** HEMISPHERE AND CONE Total Surface Area (Hemisphere) = Total Surface Area (Cone) -> `272`
- **24A-50** EQUILATERAL TRIANGLE PRISM WITH CYLINDRICAL CAVITY Total Surface Area = 0.906 -> `0.232`
- **24A-59** SOLID OF REVOLUTION (y = -5) Volume = ? -> `343`
- **24A-60** IDENTICAL EQUILATERAL TRIANGLES AND CIRCLE -> `0.165`
- **24A-64** SQUARE AND IDENTICAL SEGMENTS Hatched Area = ? -> `0.00460`
- **24A-65** SQUARE AND QUARTER CIRCLE Quarter Circle Area = Square Area -> `445`

### 2024 Invitational B  (Test 24B)

**Stated problems**

- **24B-6** What is the product of 237 and 0.362? -> `85.8`
- **24B-7** What is the sum of 1.63 and the product of 2.1 and 0.796? -> `3.30`
- **24B-8** A lizard grows from 4.32 in to 9.75 in over 2 months. What is the positive change in length? -> `5.43 in`
- **24B-16** Monica wants to read A Tale of Two Cities. If she reads 178 words per minute, and the book is 146,500 words. How long will it take her to finish the book? -> `13.7 hr`
- **24B-17** What is the y value of the intersection of the lines y = x/4-8 and y = -3x+6? -> `–6.92`
- **24B-18** Grant Woods sold his painting, American Gothic, to the Art Institute of Chicago in 1930. It is worth 75 million dollars in 2024. If the annual appreciation rate was 14.1%, what was the original sales price? -> `$309.18`
- **24B-26** Monica has three printer ink cartridges. One is 0.5 full, one is 0.4 full, and the third is 0.8 full. If an unused ink cartridge can print 335 pages, how many pages can Monica print if she uses up all three cartridges? -> `570 pages`
- **24B-27** Emily lives 2.8 mi from school. Driving the speed limit, she gets to school in 4.8 min. If she's running late and drives 10 mph over the speed limit, how much time does she save driving to school? -> `64.0 s`
- **24B-28** A school group bought 6 dozen Krispy Kreme donuts at $13/doz. They sold them at school for a fundraiser. They raised $50, even though they ate one donut in nine without paying for it. What was the percent increase in donut cost? -> `84.6 %`
- **24B-36** A drone flies at 400 ft elevation and 95 mph. When it is directly overhead, Joe, on the ground, fires a rocket at an angle to intercept the drone. The rocket travels in a straight line at 230 mph. How far did the rocket travel to intercept the drone? -> `439 ft`
- **24B-37** What is the length of the line segment defined by the intersections of the line y = 2x+7 with the curve y = 5/x+2? -> `9.01`
- **24B-38** How many minutes after 6:45 do the minute and hour hands of a clock line up? -> `53.2 min`
- **24B-46** Pizzas have the same thickness regardless of size. If a large 14-in pizza feeds 3 people, what sized pizza is needed to feed 100 people? -> `80.8 in`
- **24B-47** It is 2002 mi traveling from Texas to Massachusetts. Olivia's daily driving distance the first 3 days of her trip were 310 mi, 250 mi and 300 mi. Estimate the total number of days for the trip. -> `8    integer dy`
- **24B-48** Solve for n if nn = 235. -> `3.96`
- **24B-56** (rad) What is the slope of the curve f(x) = 3xsin(7x) + 2.5x+5 at x = 8? -> `144`
- **24B-57** A 100-lb log decays proportional to the remaining mass of undecayed wood. If 10 lb of the log decays in 150 dy, how much longer would it take for a total of 90 lb of the log to be decayed? -> `8.56 yr`
- **24B-58** Solve for positive g if the determinant of [ 20 5g -14 5g 7 7 -14 7 31 ] equals 35. -- -> `1.08`
- **24B-61** The longest recorded hole-in-one was made by Mike Crean at Green Valley Ranch Golf Club in Denver in 2002, a distance of 517 yards. A golf cup is 4.25 in in diameter. What is the maximum angular dimension or wedge the ball must travel in? -> `0.0131 deg`
- **24B-62** A zeptosecond is 10-21 sec. What is this number raised to the power 65,321? -> `?`
- **24B-63** Zelda stands 15 ft away from a 25-ft wall. She tosses a ball to Xavier who stands atop the wall. What should the release angle be (relative to the ground) if the ball has no vertical component of velocity when it is caught. -> `73.3 deg`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **24B-9** SQUARE Perimeter = ? -> `3.00`
- **24B-10** RHOMBUS Area = 3170 -> `69.4`
- **24B-19** RIGHT TRIANGLE -> `107`
- **24B-20** RIGHT TRIANGLE Area = ? -> `1.20`
- **24B-29** CONE Volume = 20,900 -> `46.6`
- **24B-30** CYLINDER Lateral Surface Area = ? -> `3.54`
- **24B-39** SCALENE TRIANGLE AND INSCRIBED CIRCLE -> `403`
- **24B-40** SCALENE TRIANGLES -> `379`
- **24B-49** CUBE WITH CYLINDRICAL CAVITY Total Surface Area = 0.0497 -> `0.0818`
- **24B-50** HALF CYLINDRICAL PRISM AND ISOSCELES TRIANGLE PRISM Volume (Triangular Prism) = Volume (Half Cylindrical Prism) -> `11.4`
- **24B-59** Radians -> `3.14`
- **24B-60** IDENTICAL CIRCLES Hatched Area = 17.5 -> `10.5`
- **24B-64** SQUARE M = midpoints Hatched Area = 538 -> `37.9`
- **24B-65** CIRCLE AND EQUILATERAL TRIANGLE Hatched Area = ? -> `1.41`

### 2024 District  (Test 24F)

**Stated problems**

- **24F-6** What is 706 divided by 0.0593? -> `11900`
- **24F-7** What is the remainder of 5870 divided by 9.81? -> `3.62`
- **24F-8** Sam walks 6 laps around a 440-yd track. How far did he walk? -> `2640 yd`
- **24F-16** Text 0.5 in tall is easily legible from 6 ft away. What should the text on a billboard be to be easily legible for someone in a car 0.1 mi away? -> `44.0 in`
- **24F-17** Don and Mary celebrated their 50th wedding anniversary. How long were they married? -> `1.58x109 sec`
- **24F-18** Ted invested $1250 but lost money. If the percent decrease was 12.7%, how much money did he lose? -> `$158.75`
- **24F-26** A Farmer Pat walked off a square, one-acre field. She estimated the side dimension to be 195 ft. What was the percent error in her measurement? -> `–6.6  (2SD) %`
- **24F-27** The mass of earth's moon is 7.34767309x1022 kg. A meteorite weighing 11,000 lbs crashes into the moon. What is the percent change in moon mass? -> `6.79x10–18 %`
- **24F-28** The product of two consecutive, positive integers is 407,682. What is their sum? -> `1277   integer`
- **24F-36** In a room full of people, 40% are men. One third of the women are blond. Of the blond women, one third have military experience. If 9 blond women have military experience, how many people are in the room? -> `135   integer`
- **24F-37** What is the positive slope of the line passing through the point (2,10) that is tangent to the circle x2+y2 = 30? -> `1.04`
- **24F-38** Japanese high-speed trains travel at 190 mph. They require 5 min to accelerate to this speed from rest or to decelerate to rest from this speed. How long would it take to go from Tokyo to Osaka, a distance of 493 km? -> `1.70 hr`
- **24F-46** A 12-in pillow requires 11 wads of stuffing. How many wads does a 30-in pillow need? -> `172 wads`
- **24F-47** The growth of a beagle dog is measured based on its height and weight: (9 in, 9.5 lbs), (9.7 in, 11.25 lbs), (10.3 in, 13 lbs), (10.9 in, 15 lbs), (11.3 in, 16 lbs), and (12 in, 18.5 lbs). Estimate the weight of a full-grown beagle that stands 14 in tall. -> `27.8 lbs`
- **24F-48** What is x if x5 = 3x2+1? -> `1.51`
- **24F-56** (rad) Solve for A if the area under the curve y = Asin(x) equals 6 for 0<x<. -> `3.00`
- **24F-57** A car accelerates from rest. Its acceleration a increases according to a = (5 ft/s3)t. How far has the car traveled when its velocity reaches 100 mph? -> `374 ft`
- **24F-58** What is D11 if D = 3F+5N, F =[-8 16 27 -22], and N = [13 -8 26 14]? -> `41.0`
- **24F-61** The tensile failure load of a rod is proportional to the rod's cross- sectional area. A 0.25 in diameter steel rod may be loaded in tension by a force equal to 1400 lb before it fails. It is loaded to 650 lb and placed in a corrosive environment. The surface is lost at a rate of 0.002 in/hr. How long is the loaded rod in the corrosive environment before it fails? -> `19.9 hr`
- **24F-62** Calculate (378,85614)151. -> `7.84x1011,792`
- **24F-63** A smoke bomb has a fuse that burns at 0.7 in/s. Hank lights the fuse and immediately throws it with a release velocity of 45 mph and release angle of 65 deg relative to the ground. If the smoke bomb activates 2 s after hitting the ground, how long should the fuse be? The initial and final elevations are equal. -> `4.00 in`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **24F-9** RECTANGLE Area = 5.28 -> `2.13`
- **24F-10** RIGHT TRAPEZOID Perimeter = ? -> `66.0`
- **24F-19** RIGHT TRIANGLE Perimeter = ? -> `197`
- **24F-20** RIGHT TRIANGLE Area = ? -> `1.11x107`
- **24F-29** RECTANGULAR SOLID Volume = 101,000 -> `72.2`
- **24F-30** SQUARE PYRAMID Total Surface Area = ? -> `0.306`
- **24F-39** SCALENE TRIANGLE AND CIRCUMSCRIBED CIRCLE -> `0.347`
- **24F-40** ISOSCELES AND SCALENE TRIANGLES -> `2.07`
- **24F-49** HALF CYLINDER PRISM AND RECTANGULAR SOLID Total Volume = 2.10x109 -> `610`
- **24F-50** HEMISPHERE WITH CONICAL CAVITY Total Surface Area = 0.475 -> `0.210`
- **24F-59** SOLID OF REVOLUTION (y = 0) Volume = ? -> `13.4`
- **24F-60** THREE IDENTICAL CIRCLES AND SMALL TANGENT CIRCLE -> `240`
- **24F-64** REGULAR PENTAGON Area = 117 -> `8.25`
- **24F-65** RECTANGLE AND EQUILATERAL TRIANGLE Hatched Area = Isosceles Trapezoidal Area 2 = 3.39 -> `2.42`

### 2024 Region  (Test 24H)

**Stated problems**

- **24H-6** What is the result of subtracting 642 from 6932? -> `338`
- **24H-7** What is the positive square root of the product of 7.37 and 0.391? -> `1.70`
- **24H-8** A 30 oz jar of mayonnaise costs $4.58. What is the cost per oz? -> `0.153`
- **24H-16** A lawyer charges $350/hr. Trial prep requires 78 hr of legal time, and the trial is three 8-hr days. How much are the legal fees? -> `$35,700.00`
- **24H-17** The world land speed record was set by Andy Green driving a twin turbofan jet-powered car. The speed was 763.035 mph over one mile in October 1997. How long would it take to travel 1 mi at this speed? -> `4.71800 (6SD) s`
- **24H-18** The product of two consecutive, odd, negative numbers is 20,735. What is their sum? -> `288   integer`
- **24H-26** A study found that American adults consume an average of 17 teaspoons of added sugar every day. What is the percent error in assuming this totals to 60 lbs of sugar per adult annually? The density of sugar is 1.59 g/cm3. -> `–7.24 %`
- **24H-27** Jenny hand paints an 8-ft section of fence in 1.1 hr, but it only takes her 13 min to spray paint it. She started painting a 147-ft fence but at some point gave up and switched to spray painting, completing the entire job in 10 hr. What fraction of the fence was hand painted? -> `37.1 %`
- **24H-28** An 11-in long candle is tapered, 0.5 in in diameter at the bottom and 0.25 in in diameter at the top. What is the positive burn rate if the candle is completely consumed in 8 hr? -> `0.157 in3/hr`
- **24H-36** A car drives at 31 mph. It passes a parked car. After a 5 s delay, the parked car accelerates at a constant value. It catches up to the moving car 0.424 mi from where it was parked. What was the parked car's acceleration? -> `2.29 ft/s2`
- **24H-37** Centrifugal force F equals m2R, where is the angular velocity of a mass m moving along an arc of radius R. If a 3500-lbm car traveling at 50 mph skids when the centrifugal force equals 600 lbf, what is the turning radius to initiate the skid? 1 lbf = 32.174 lbm ft/s2. -> `975 ft`
- **24H-38** What is the length of the line segment defined by the intersection of the line y = -3x+4 and the circle x2+y2 = 236? -> `30.6`
- **24H-46** How many 8-ft long beach towels are needed to just cover the same area as 25 5-ft bath towels? Assume towels have similar shape and that they may be cut to fit the area. -> `10   integer`
- **24H-47** A gift shop ran an unadvertised sale for one week. Their daily income from Monday through Thursday was $255, $410, $425, and $595, respectively. Estimate the Friday income. -> `$680.00`
- **24H-48** For what value of r greater than 1 does r(r-3) = 75.7? -> `5.53`
- **24H-56** What is the area between the curve f(x) = -3x2+9 and the x axis? -> `20.8`
- **24H-57** A farmer constructs a pen of constant area A0 using as little fencing as possible. The shape of the pen looks like this: , a D by h rectangle attached to one semicircular end of diameter D. What is the ratio of the rectangle side dimensions that minimizes the perimeter, a number greater than 1? -> `2.00`
- **24H-58** What is m if the sum of the determinants of [4 -m 5 20] and [3m 6 6 12] equals 3? -> `–1.00`
- **24H-61** The temperature in Bordj El Houasse in the Sahara Desert in June ranges sinusoidally from a maximum of 101.3 degF to a low of 76.5 degF 12 hours later. What is the minimum time interval between the minimum temperature and 86 degF? -> `5.10 hr`
- **24H-62** The odds of winning the Texas Powerball jackpot are 1/25,827,165. What is this number raised to the 27,600th power? -> `?`
- **24H-63** Dirk throws a penny off the top of the Texas State Capitol Building with a velocity of 28 mph and a release angle of 64 deg relative to horizontal. It hits the ground in 5.63 s. What is the Capitol elevation? -> `302 ft`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **24H-9** SQUARE Area = 31.1 -> `5.58`
- **24H-10** PARALLELOGRAM -> `4.40`
- **24H-19** RIGHT TRIANGLE Area = 25.1 -> `40.5`
- **24H-20** RIGHT TRIANGLE -> `9.69`
- **24H-29** SPHERE Total Surface Area = ? -> `4.23`
- **24H-30** RIGHT ISOSCELES TRIANGLE PRISM Volume = 0.0285 -> `0.698`
- **24H-39** RIGHT TRIANGLE AND CIRCUMSCRIBED CIRCLE -> `0.0373`
- **24H-40** SCALENE TRIANGLES -> `1.77`
- **24H-49** IDENTICAL RECTANGULAR SOLIDS -> `0.977`
- **24H-50** CYLINDER AND CONE Volume(Cone) = 1 3 Volume(Cylinder) -> `0.383`
- **24H-59** (figure) -> `1.33`
- **24H-60** SQUARES AND FOUR IDENTICAL RECTANGLES Small Square Area = Large Square Area -> `4140`
- **24H-64** CIRCLE AND RIGHT TRIANGLES -> `0.441`
- **24H-65** INFINITE NUMBER OF SQUARES ai= 1 2 ai-1 Sum of all Square Perimeters = 3520 -> `440`

### 2024 State  (Test 24I)

**Stated problems**

- **24I-6** What number equals the sum of 68.6 and 88.4? -> `157`
- **24I-7** What is the product of 4.71 and 8.93, divided by 75.4? -> `0.558`
- **24I-8** Valerie buys an item costing $27.40. How much change does she get back if she pays with two $20 bills? -> `$12.60`
- **24I-16** Taylor Swift played the US Bank Stadium in Minneapolis in 2023. The stadium seats 73,000 people, and the average ticket price was $1450. What was the gross revenue for the sell-out performance? -> `$105,850,000.00`
- **24I-17** A chicken on average lays 2 eggs every 3 days. If a commercial farm wants to produce 800 dozen eggs daily, how many chickens must be laying? -> `14400  integer`
- **24I-18** There were 196.9 million iphone sales in 2020, and 242 million sold in 2021. What is the percent increase in iphone sales? -> `22.9 %`
- **24I-26** A loaf of bread bakes at 350 degF for 35 min. The oven heats from room temperature (75 degF) at 40 degF/min, and it takes the oven 1 hr 45 min to cool. How long was the oven heated above room temperature? -> `2.45 hr`
- **24I-27** Jim's Apple Farm is the largest candy store in Minnesota. Didi can drive there from Sherman TX in 13 hr 25 min, averaging 64.7 mph, or she could walk there in 285 hr, not counting breaks. What is her average walking speed? -> `3.05 mph`
- **24I-28** Synchronous orbit is defined by Rs=GmT2 42 3 where Rs = 26,190 mi, m = 5.97237x1024 kg, and T = 0.99726968 dy. What is G? -> `6.667x10–11 m3/`
- **24I-36** A ball is dropped from 40 in above the floor. It recovers 80% of its height. Calculate the total distance the ball travels before coming to rest. -> `30.0 ft`
- **24I-37** A right isosceles triangle has a hypotenuse dimension of 14 in. It is placed on a 1 in by 1 in grid with both ends of the hypotenuse atop grid points and on the same grid line. What is the percent error in approximating the triangle area by counting 1 in x 1 in grid squares lying completely within the triangle and multiplying by a single grid square area, 1 in2? -> `–14.3 %`
- **24I-38** Jim runs laps around a 1/4 mi track at a 7 min mile. After 9 minutes, Daniel starts from the same starting point running in the same direction. How fast is Daniel running if he catches Jim in 1 min 9 s? -> `10.4 mph`
- **24I-46** Mr. Kimble wants to provide each student with a pad of paper with a certain amount of writing area. If a 3-in pad containing 50 sheets is acceptable, how many sheets should be in a 4-in pad? Sheets have equal thickness and identical shape. -> `29   integer`
- **24I-47** Keith flew as part of his job duties. His annual flying miles from 2018 to 2022 were 28310, 42900, 65000, 71250, and 89400. Estimate how far he flew in 2023. -> `105,000 mi`
- **24I-48** For what value of v does 5v5 = 4v4+3v3+45? -> `1.87`
- **24I-56** Calculate the area enclosed by the curves y = 5(x-3)2 - 30 and y = (-2)(x-3)2 + 5x-27. -> `41.4`
- **24I-57** A car accelerates from rest to 60 mph in 18 s. The velocity increases sinusoidally during the acceleration according to v= 1-cos [ t 18s]30 mph. How far did the car travel during the acceleration from rest to 60 mph? -> `792 ft`
- **24I-58** What is S23 if S = TU, T = [ 1 -5 13 -5 17 4 13 4 11 ] and U = [ -6 15 18 15 2 -7 18 -7 3 ]? -> `–197`
- **24I-61** One strobe light flashes at 48 flashes per minute, and a second strobe flashes at 51 flashes per minute. What is the time interval between the strobes flashing at the same time in sync? -> `20.0 sec`
- **24I-62** The odds of being hit by a meteorite in a lifetime is 1/(8.4x108). What is this fraction raised to the -64,826th power? -> `2.13x10578,525`
- **24I-63** A professional firework explodes at its maximum elevation of 275 ft. If fired straight up into the air, what is the release velocity? -> `90.7 mph`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **24I-9** CIRCLE Circumference = 0.0995 -> `0.0158`
- **24I-10** RECTANGLE Area = ? -> `21900`
- **24I-19** RIGHT TRIANGLE -> `0.866`
- **24I-20** RIGHT TRIANGLE Area = ? -> `631`
- **24I-29** SPHERE Volume = ? -> `1310`
- **24I-30** CUBE Total Surface Area = 103 AB = ? -> `5.86`
- **24I-39** EQUILATERAL TRIANGLE AND INSCRIBED CIRCLE -> `3000`
- **24I-40** PARALLELOGRAM -> `0.377`
- **24I-49** CUBE WITH SPHERICAL CAVITY Volume = 460 -> `9.88`
- **24I-50** IDENTICAL CONES AND CUBE -> `0.274`
- **24I-59** Radians -> `3.00`
- **24I-60** SQUARE AND SEMICIRCLES Hatched Area = 6.43 -> `6.71`
- **24I-64** IDENTICAL RIGHT TRIANGLES AB = 0.558 -> `0.925`
- **24I-65** SQUARE AND SEMICIRCLE Square Area = Semicircle Area -> `35.0`

### 2025 Invitational A  (Test 25A)

**Stated problems**

- **25A-6** Calculate the product of and e. -> `8.54`
- **25A-7** What is the difference of 6.52 and 7.11, raised to the fourth power? -> `0.121`
- **25A-8** Calculate the sum of 88 and 61.8, divided by 9220. -> `0.0162`
- **25A-16** Emma drives 200 mi at 55 mph. How long does this take? -> `3.64 hr`
- **25A-17** A square-shaped dog park occupies 3,520 ft2. What is the perimeter of the enclosing fence? -> `237 ft`
- **25A-18** Noah made a poster for school. The poster cost $1.02, the marker cost $3.10, and a ruler cost $0.60. Including the 8.125% sales tax, how much did he spend? -> `$5.10`
- **25A-26** Sophia can comfortably read 1-in tall letters from a distance of 20 ft. How tall should a letter on a Jumbotron scoreboard be, to be read from a distance of 170 yd? -> `2.13 ft`
- **25A-27** A sloth moves on ground at 13 ft/min. They swim much faster. If the percent increase in speed is 238%, what is a sloth's swimming speed? -> `43.9 ft/min`
- **25A-28** A neutron star is immensely dense, 1x1020 g/cm3. Suppose a 240-lb person were collapsed into a sphere of the same density as a neutron star. What would the sphere diameter be? -> `0.128 micrometers`
- **25A-36** What is the percent increase in earth diameter based on its minimum (3,950 mi) and maximum (3,963 mi) diameters? -> `0.329 %`
- **25A-37** The seats in a classroom are 30 in apart in a square array. Ezra is sitting next to his girlfriend, Luna, but they were being disruptive. The teacher moved Ezra three rows up and four seats over, all away from Luna. How far was Ezra from Luna after the move? -> `14.6 ft`
- **25A-38** The population of the world in 1998 and 2024 was 6,007,486,448 and 8,019,876,189, respectively. What is the percent error in estimating the annual growth rate to be 1.25%/yr? -> `12 %`
- **25A-46** Lily needs 78 3-in sized oranges to make a fruit salad for 125 people. If she substitutes 5-in sized grapefruit for the oranges, maintaining the same serving size, how many grapefruit are needed? -> `17  integer`
- **25A-47** Bamboo plants grow quickly. In the first four days after planting, measured plant heights (in) were 4, 5, 10, and 12. What is the bamboo plant height after 12 days? -> `35.3 in`
- **25A-48** Solve for f if 5f2+6 = ef. -> `4.80`
- **25A-56** (rad) For what value of x between 0 and 1 does the slope of the curve y = 7sin(x)cos(x) equal 1? -> `0.714`
- **25A-57** The number of bugs N in a large greenhouse increases with time t according to N=100 [2t/dy]. A bird eats 5 bugs daily. How many birds should be introduced into the greenhouse when the bug population is at 1,000 bugs to control the bug population to just less than 1,000 bugs? -> `139  integer`
- **25A-58** What is D2 if D = JB, J = [ 3 2 6 5 9 12 7 -5 8 ] and B = [ 18 -27 14 ]? -> `15.0`
- **25A-61** Two strobes are hung in a dancehall and switched on simultaneously. One flashes 15 times per minute, and the other flashes 50 times per minute. What is the time interval between their flashing together? -> `12.0 s`
- **25A-62** The chances of winning the jackpot in a power ball drawing are 1 in 292.2 million. What are the chances of winning 100 times in a row? -> `2.70x10–847`
- **25A-63** Hudson throws a football 45 yd on earth. How far could he throw it on the moon where the gravitational constant is 5.331 ft/s2? -> `272 yd`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **25A-9** RHOMBUS Area = ? -> `3.71x106`
- **25A-10** RECTANGLE Perimeter = 1.05 -> `0.240`
- **25A-19** RIGHT TRIANGLE -> `0.933`
- **25A-20** RIGHT TRIANGLE -> `8.03x10–6`
- **25A-29** HEMISPHERE Total Surface Area = 0.521 -> `0.470`
- **25A-30** SLANT CIRCULAR CYLINDER Volume = 817 -> `12.4`
- **25A-39** RIGHT ISOSCELES TRIANGLE AND CIRCLE -> `608`
- **25A-40** SCALENE TRIANGLES -> `5.99`
- **25A-49** SQUARE PYRAMID Volume = 0.178 -> `1.54`
- **25A-50** CUBE AND SPHERE Cube Total Surface Area = Sphere Total Surface Area -> `5.03`
- **25A-59** Hatched Area = ? -> `3.44`
- **25A-60** INFINITE CONCENTRIC CIRCLES Each circle radius is half the radius of the next larger circle -> `6.76`
- **25A-64** SQUARE AND PARALLELOGRAM Parallelogram Area = [ 4][Square Area ] a b = ? -> `4.66`
- **25A-65** CIRCLE AND SQUARE Circle Circumference = Square Perimeter -> `0.206`

### 2025 Invitational B  (Test 25B)

**Stated problems**

- **25B-6** What is the product of and 8.77, subtracted from 800? -> `772`
- **25B-7** What is 0.638 raised to the power 4.52? -> `0.131`
- **25B-8** What is the remainder of 4.783 divided by 0.098? -> `0.0434`
- **25B-16** The earth's closest approach to the sun is 9.1097x107 mi; Mars' is 1.2828x108 mi. What is the positive difference in these distances? -> `3.72x107 mi`
- **25B-17** The Schlitterbahn Water Park in New Braunfels charges $49.99 for a one-day admission and $81.99 for a two-day pass. How much money is saved by getting the two-day pass instead of two, one-day tickets? -> `$17.99`
- **25B-18** A copier can enlarge a letter-sized 8.5 in by 11 in sheet to ledger-sized 11 in by 17 in. What is the largest enlargement setting (>100%) that does not crop the image? -> `129 %`
- **25B-26** A 28-in tall vertical stick casts a shadow 48 in long. How tall is a tree that casts a shadow of 42.9 ft? -> `25.0 ft`
- **25B-27** Leo wants to run a mile at a constant, 6.5 min/mi pace. What is his time at the 100-yd mark? -> `22.2 s`
- **25B-28** A web post view doubles every 36 min. How long after posting are there 20 million views? -> `14.6 hr`
- **25B-36** Calculate the percent change in a cylinder's volume if its length were increased by 35% and its diameter decreased by 28%. -> `–30.0 %`
- **25B-37** Neptune orbits the sun in a circular path. It is 30.07 astronomical units (AU) from the center of the sun, and it takes 164.8 yr to complete one orbit. What is the planet's average velocity along its path? An AU equals 9.29558x107 mi. -> `12160 mph`
- **25B-38** A 500-sheet ream of paper is 2 in thick. A single sheet of paper is cut in half and stacked. The process is repeated to produce a four-sheet stack. How many total times is the paper cut in half to produce a stack just over 1/8 in thick? -> `5  integer`
- **25B-46** What is the percent increase in cloth area of a shirt with a 17.5- in neck, compared to one with a 14-in neck? -> `56.3 %`
- **25B-47** An inflated spherical balloon's volume is proportional to the absolute temperature. Daniel measured the diameter of a balloon as a function of temperature: (75 degF, 13.82 in), (79 degF, 13.85 in), (83 degF, 13.89 in), (87 degF, 13.92 in), (90 degF, 13.95 in). What is the balloon volume when the temperature reaches 100 degF? Absolute temperature (Rankine) is the Fahrenheit temperature plus 459.67 degrees. -> `1450 in`
- **25B-48** Solve for x if x-9 3 =2x-3. -> `2.05`
- **25B-56** What is the area enclosed by the x axis and the curve y = -8(x-4)2+30? -> `77.5`
- **25B-57** An anthill is conical with a constant height to diameter ratio of 0.7. Ants build the anthill at a constant volume rate of 3 in3/hr. How tall is the anthill when its height is increasing at 0.1 in/hr? -> `4.33 in`
- **25B-58** What is d if H12 = 0, H = KL, K = [35 18d -48 67 ], and L = [22 19 -2 19]? -> `–1.94`
- **25B-61** A rubber ball is dropped from a height of 68 in. It bounced back up 52 in. How far does the ball travel before coming to rest on the floor? -> `42.5 ft`
- **25B-62** A galactic year, 2.3x108 yr, is the time needed for the solar system to circle round the center of the Milky Way Galaxy. What is this number raised to the 1,274th power? -> `6.94x1010,652`
- **25B-63** Ethan, atop an 8-ft ladder, tosses a baseball to Nova who is standing on the ground 15 ft away. His release angle relative to the horizontal was 18 deg. What should his release velocity be? -> `12.0 mph`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **25B-9** ISOSCELES TRAPEZOID Perimeter = 10.7 -> `2.03`
- **25B-10** RHOMBUS Area = ? -> `8990`
- **25B-19** RIGHT TRIANGLE -> `1.70`
- **25B-20** RIGHT TRIANGLE Perimeter = ? -> `96.7`
- **25B-29** CUBE AB = 420 Volume = ? -> `2.62x107`
- **25B-30** HEMISPHERE Volume = 295 -> `5.20`
- **25B-39** EQUILATERAL TRIANGLE AND CIRCLE -> `7.38`
- **25B-40** SCALENE TRIANGLE -> `106`
- **25B-49** CUBE AND CYLINDER -> `62.5`
- **25B-50** CONE AND FRUSTUM Cone Volume = Frustum Volume H h = ? -> `3.85`
- **25B-59** Hatched Area = ? -> `0.728`
- **25B-60** IDENTICAL CIRCLES Hatched Area = ? -> `164`
- **25B-64** SEMICIRCLES AND RECTANGLE Total Area = 88 -> `12.8`
- **25B-65** SEMICIRCLE AND ISOSCELES TRIANGLE C = Center Triangle Area = 1 3 [Hatched Area ] -> `25.9`

### 2025 District  (Test 25F)

**Stated problems**

- **25F-6** What is the sum of 0.944 and 0.775, divided by 8.2? -> `0.210`
- **25F-7** Multiply the sum of 0.254 and 0.485 by 461. -> `341`
- **25F-8** How many times can 7.63 be divided into 4050 with a positive remainder? -> `530  integer`
- **25F-16** The Taj Mahal was built in 1632. How old was it in 2025? -> `393  integer yr`
- **25F-17** Sam spent $75.45 on merchandise. If this included the 8.125% sales tax, what was the cost of the items? -> `$69.78`
- **25F-18** A hummingbird's heart rate is 1,100 beats per minute. Its life span is 4.8 years. How many times does its heart beat over its entire life? -> `2.78x109 beats`
- **25F-26** A spherical balloon is blown up to a diameter of 8 in. If it is inflated more to double its volume, what is its new diameter? -> `10.1 in`
- **25F-27** For handbells higher pitched than F3, the mass of a Malmark handbell is approximately (420 lbs)/N2, where N is the number of half- steps above C2. What is the percent error in the formula if the G#4 handbell, 16 half-steps above C2, weighs 2 lbs 0.9 oz? -> `–20.2 %`
- **25F-28** A dime is 0.705 in in diameter, 0.0531 in thick, and weighs 0.08 oz. A nickel is 0.835 in in diameter, 0.0768 in thick, and weighs 0.176 oz. What is the ratio of the value of a ton of dimes to a ton of nickels? -> `4.40`
- **25F-36** The passing period between classes at a high school is 5 min. If Ashers classes are 120 yd apart, how much "free time" between classes does he have to visit with friends in the hall? His walking pace is 20 min/mi. -> `3.64 min`
- **25F-37** The Washington Monument is 555 ft 5.1 in tall. What is the percent error in assuming the height is 1/10 mi? -> `–4.938 %`
- **25F-38** The color percentages of peanut M&Ms in a large bag are 23% blue, 23% orange, 15% green, 15% yellow, 12% red, 12% brown. What is the smallest bag size, the number of M&Ms, that could exactly match these percentages? -> `100  integer`
- **25F-46** A 3D printed widget weighs 4.78 lbs. What is the percent decrease in linear dimension, if the desired weight is 4 lbs? -> `5.77 %`
- **25F-47** Length and weights of various snakes are (4 in, 0.06 oz), (2 ft, 1.3 lbs), (3 ft, 4.4 lbs). What is the weight of a 4-ft long Gaboon Viper? -> `10.4 lbs`
- **25F-48** (rad) Compute the value of if 0<< and cos(2) = 1. -> `2.56`
- **25F-56** For what value of x less than 5 does the slope of the curve y = 7(x-5)3 equal 2? -> `4.69`
- **25F-57** The bases in baseball form a square with 90 ft between bases. A batter hits a single and runs towards first base at 14 mph. A runner on first with a 5-ft lead off starts for second base at the same time and at 14 mph. What is the runners' linear distance of closest approach? -> `67.2 ft`
- **25F-58** What is G12 if G = 3H+7I, H= [9 33 7 -3], and I =[32 -51 -4 -4 ]? -> `–258`
- **25F-61** How long after 3:30 do the minute and hour hands of a clock align? -> `51.8 min`
- **25F-62** A google is 10100. What is a google raised to the 57th power? -> `1.00x105700`
- **25F-63** Eliana has a super sling shot that, angled at 57 deg relative to the horizontal, fires a projectile 220 ft. What minimum, positive angular adjustment will change the distance to 200 ft? -> `4.93 degrees`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **25F-9** RHOMBUS Area = 2760 -> `54.1`
- **25F-10** QUARTER CIRCLE Perimeter = ? -> `81.4`
- **25F-19** RIGHT TRIANGLE -> `0.307`
- **25F-20** RIGHT TRIANGLE -> `597`
- **25F-29** CONE Total Surface Area = 76.1 -> `5.69`
- **25F-30** PRISM Volume = 846 -> `15.8`
- **25F-39** CIRCLE AND ISOSCELES TRIANGLE -> `1.29`
- **25F-40** SCALENE TRIANGLES -> `0.337`
- **25F-49** HEMISPHERE AND CONE Cone Volume= 1 4 [Hemisphere Volume ] -> `0.0605`
- **25F-50** RECTANGULAR SOLID AB = 1.45 BC = 1.33 BD = 1.83 -> `0.511`
- **25F-59** SOLID OF REVOLUTION (y = 1) Volume = ? -> `98.5`
- **25F-60** INFINITE SQUARES Each square side dimension equals 0.8 times that of the next larger square -> `45.4`
- **25F-64** EQUILATERAL TRIANGLE, SQUARE, AND SEMICIRCLE -> `20.1`
- **25F-65** SQUARE AND EQUILATERAL TRIANGLE Square Perimeter = Triangle Perimeter -> `132`

### 2025 Region  (Test 25H)

**Stated problems**

- **25H-6** Solve for the product of 411 and 46.4. -> `19100`
- **25H-7** Calculate x if x raised to the power 2.42 equals 8.45. -> `2.42`
- **25H-8** What is the integer part of the result of multiplying 144 and 8.48? -> `1221  integer`
- **25H-16** A fish tank light is set to come on at 9:30 AM and to switch off at 8:45 PM. How long is the light on daily? -> `11.3 hr`
- **25H-17** The 2024 Superbowl was tuned in by 123 million people. What fraction of the total US population, 333 million, tuned in? -> `36.9 %`
- **25H-18** There are 54 Oreo cookies in a package. Liam wants to provide the entire 345-person ninth grade with individually wrapped baggies, each containing four cookies. How many packages must he purchase? -> `26  integer`
- **25H-26** The Mona Lisa painting is 77 cm by 53 cm. How many 8.5 in by 11 in letter-sized sheets are needed to just cover the painted side? Sheets may be cut to fit. -> `7  integer`
- **25H-27** Mr. Jenson wants to buy a bulletin board for his classroom. A 4 ft by 8 ft cork board costs $268.99. A set of generic postings costs $23.99. The border runs $4.99, and push pins cost $4.39. How much does Mr. Jenson owe if the school covers two thirds of the cost? -> `$100.79`
- **25H-28** Ms. Hardy has a bunch of 5-page student English essays to read. She starts reading at one page every 1 min 37 s. What is the percent decrease in time to read one essay, if, after a while, her reading speed improves to 1 min 14 s? -> `23.7 %`
- **25H-36** Absolute temperature may be measured in Rankine units (R). An oven's temperature drifts. An hour after setting the temperature to 834.7 R, it had drifted to 822.7 R. What is the percent change in temperature? -> `–1.44 %`
- **25H-37** A 74-in long piece of string is cut into two segments, and each segment is used to form a circle. Calculate the ratio of circle radii, greater than 1, if the area of both circles totals 250 in2. -> `2.25`
- **25H-38** The US made the Louisiana Purchase in 1803, paying $15 million for 828,000 mi2 of land. Given an average annual inflation rate of 2.5%, what would the value of 1 mi2 of land be worth in 2025 dollars? -> `$4352.70`
- **25H-46** The total surface area of 1 kg of 30-m sized particles is 0.43 m2. What is the total surface area of 5 kg of 120-nm sized particles? -> `538 m2`
- **25H-47** Calculate the correlation coefficient of these data: (0,0), (2,3), (4,9), (6,11), (8,18). -> `0.987`
- **25H-48** What is r if 2r = r2, and r is negative? -> `–0.767`
- **25H-56** What is positive b, if the line y = bx is tangent to the curve y = 6(x+3)2+7? -> `74.3`
- **25H-57** Elias has a cylindrical rain barrel that sits on end with a bottom tap. The water velocity out of the tap drains the barrel at a rate proportional to the water height in the barrel. When initially full, it drains 30% of the water in 12 min. How long does it take to drain another 30%? -> `18.8 min`
- **25H-58** What is the positive difference in the determinants of [75 47 -25 33] and [31 17 13 6 ]? -> `3690`
- **25H-61** How long after 9:15 do the minute and hour hands of a clock align? -> `34.1 min`
- **25H-62** What is 6(78)? -> `1.28x104,485,887`
- **25H-63** A fielder catches a baseball and throws it 175 ft to the shortstop. If the release angle was 40 deg relative to the horizonal, what was the baseball release velocity? -> `51.6 mph`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **25H-9** SQUARE Area = 80.6 -> `8.98`
- **25H-10** RECTANGLE Perimeter = ? -> `2.57`
- **25H-19** RIGHT TRIANGLE Perimeter = ? -> `2.15`
- **25H-20** RIGHT TRIANGLE -> `0.0502`
- **25H-29** CUBE Volume = 6.34 AB = ? -> `2.62`
- **25H-30** SQUARE PYRAMID Volume = ? -> `0.204`
- **25H-39** SCALENE TRIANGLE AND CIRCLE -> `0.00720`
- **25H-40** SCALENE TRIANGLES AB = 28.5 -> `60.7`
- **25H-49** CYLINDER WITH FRUSTUM CAVITY Volume = 302 -> `4.12`
- **25H-50** CUBE AND PYRAMID Cube Total Surface Area = Pyramid Total Surface Area -> `2.32`
- **25H-59** Hatched Area = ? -> `5.29`
- **25H-60** RECTANGLE AND CIRCLE -> `0.0103`
- **25H-64** SEMICIRCLE AND EQUILATERAL TRIANGLE -> `10.3`
- **25H-65** RECTANGLE, CIRCLE, AND SQUARE L h = ? -> `2.00`

### 2025 State  (Test 25I)

**Stated problems**

- **25I-6** Calculate the product of 0.155 and 1840. -> `285`
- **25I-7** What is the cube root of -25.5? -> `–2.94`
- **25I-8** What is the remainder of 491 divided by 21.3? -> `1.10`
- **25I-16** Aydan walks to school, 1.7 mi away, in 32.8 min. What is his average walking speed? -> `3.11 mph`
- **25I-17** An adult knows 28,000 English words. The Oxford Dictionary estimates that there are 170,000 English words. What fraction of all English words does an adult know? -> `16.5 %`
- **25I-18** A sheet of paper is 0.004 in thick. How many sheets are stacked to produce most nearly a total thickness of 1.445 in? -> `361  integer`
- **25I-26** A large toenail grows at a rate of 19.44 mm/yr. How long does it take to grow a large toenail by 0.55 in? -> `0.72 yr`
- **25I-27** Lucas buys a car for $8,955 and pays nothing down. He wants to pay it off over 36 months. The monthly payment, including interest, is $270.40. How much interest will Luca pay over the life of the loan? -> `$779.40`
- **25I-28** An African bush elephant weighs 13,182 lbs. The vet puts the elephant on a diet, and it loses 1,110 lbs. What is the percent change in elephant weight? -> `–8.42 %`
- **25I-36** Mateo plans to have dinner and see a movie 40 mi away. His car gets 23 mi/gal, and gas costs $3.08/gal. Dinner costs $28, and the movie costs $18. What is the percent increase in cost if he decides to take his brother along for dinner and the show, and Mateo pays for everything? -> `81.1 %`
- **25I-37** The product of two, consecutive, positive integers is 16,512. What is the smaller integer? -> `128  integer`
- **25I-38** Isabella ran a marathon, 26.22 mi. After running 12.8 mi, her time was 2 hr 7 min 48 s. What should her new rate be, measured in min/mi, if she wants to finish the race in 4 hr 8 min flat? -> `8.96 min/mi`
- **25I-46** A 6-in tall Olaf stuffed doll costs $9.99. How much would a 14-in tall Olaf cost if the cost is proportional to the doll volume? -> `$126.91`
- **25I-47** Layla drives a golf ball, attempting to drive distances in 30-yd increments. Her actual drive distances were 25 yd, 70 yd, and 83 yd. To drive the ball 120 yd, what distance should she aim for? -> `123 yd`
- **25I-48** (rad) Solve for x if 2<x<8 and x sinx = 15 - x. -> `6.59`
- **25I-56** What is the y value at the minimum point on the curve y =25(13-x)2+17? -> `17.0`
- **25I-57** Mila's typo rate increases the faster she types. Her net typing speed is given by Wn = W - (W2)/150, where W is her actual typing speed and the last term reflects the effect of typos. What should her actual typing speed W be to maximize her net typing speed Wn? -> `75.0 words/min`
- **25I-58** Solve for the product of the determinants of [7 3 7 -8] and [ 5 9 4 9 -9 -6 4 -6 2 ]. -> `55400`
- **25I-61** Charlotte flew 1368 mi from Dallas to New York City. The scheduled flying time was 3 hr 29 min. The plane was 15 min late taking off, but it made up the time by flying faster than normal. What was the new plane speed? -> `423 mph`
- **25I-62** It is estimated that there are 2.6x1081 atoms in the observable universe. What is this number raised to the 137th power? -> `7.10x1011,153`
- **25I-63** A coin dropped off the top of the Eiffel Tower hits the ground in 7.821 s. How tall is the Eiffel Tower? -> `984 ft`

**Geometry problems** *(figure-based; dimensions shown graphically in the original)*

- **25I-9** PARALLELOGRAM Area = 328,000 -> `384`
- **25I-10** CIRCLE Circumference = ? -> `20.9`
- **25I-19** RIGHT TRIANGLE -> `1600`
- **25I-20** RIGHT TRIANGLE -> `0.135`
- **25I-29** CYLINDER Volume = 0.0362 AB = ? -> `0.538`
- **25I-30** ISOSCELES TRIANGLE PRISM Total Surface Area = ? -> `2860`
- **25I-39** CIRCLE AND SCALENE TRIANGLE -> `3.67`
- **25I-40** SCALENE TRIANGLES -> `155`
- **25I-49** RECTANGULAR SOLID AB = 15.6 BC = 10.3 BD = 12.9 Volume = ? -> `450`
- **25I-50** CYLINDER WITH CONICAL CAVITY Total Surface Area = ? -> `323`
- **25I-59** Radians -> `2.00`
- **25I-60** RECTANGLE AND QUARTER CIRCLE Hatched Area = 9.27 -> `5.70`
- **25I-64** EQUILATERAL TRIANGLE AND SQUARE Square Area = ? -> `813`
- **25I-65** SQUARE -> `1.37`
