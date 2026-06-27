# Applications Problem Eval

Generated 10 problems for each wording level (1–15) using the live pipeline: a random topic's `generate()` followed by `rewriteProblem(base, level)`. AI rewrite WAS configured for this run.

> "Level" controls how the problem is *phrased* (1 = maximally explicit, 15 = an implied story). It does not change the math or which topic is used. The answer/given are owned by code and are shown here so you can judge correctness too. "Rewrite" notes whether the AI rephrasing was applied or it fell back to the base phrasing.

## Level 1

### 1. Doubling / tripling `a4-base`

- **Title:** Going viral
- **Prompt:** A video: the view count (in views) follows the rule below, where x is the elapsed time in days. Which value below is closest to how fast the view count is growing right when x = 1?
- **Given:** V(x) = 3^(x² + x − 2)
- **Answer field(s):**
  - _(choice)_ Closest instantaneous growth right when x = 1 (views per unit of x) → **3.3** (choose from 3, 6, 3.3)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ fell back to base

### 2. Sum rule `a2-sum`

- **Title:** Toll income
- **Prompt:** A toll road models its hourly income (in dollars) for x hundred cars that pass by the rule below. Write how much each extra hundred cars adds at level x.
- **Given:** T(x) = 3x³ + 6x² + 5x + 7
- **Answer field(s):**
  - _(expression)_ Amount each extra unit adds at level x (expression in x) → **9x² + 12x + 5**
- **Hint:** Handle each term on its own, then add the pieces.
- _Rewrite:_ fell back to base

### 3. Velocity and acceleration `a3-accel`

- **Title:** Automated Subway
- **Prompt:** The subway car’s position after t seconds is given by the formula below, where s(t) tells how many metres it has travelled and t tells how many seconds have gone by. You are looking for how quickly the car’s speed is increasing exactly 3 seconds after it starts moving. Here, s(t) is the distance in metres as time t passes in seconds, and you’ll be finding the rate the car picks up speed at that moment.
- **Given:** s(t) = t³ + 3t² + 4t  (metres, with t in seconds).
- **Answer field(s):**
  - _(number)_ How quickly the car's speed is increasing at t = 3 seconds (in metres per second each second) → expected ≈ 24
- **Hint:** First find how its speed is changing, then read that off at the given moment.
- _Rewrite:_ applied

### 4. Velocity and acceleration `a3-accel`

- **Title:** Factory conveyor belt
- **Prompt:** A conveyor cart in a factory travels forward in a straight line, and the distance it has gone after t seconds is given in the formula below. Here, t is the number of seconds since the cart started, and s(t) is the distance travelled in metres. You are looking for how quickly the cart's speed is getting faster at exactly 2 seconds after it starts moving.
- **Given:** s(t) = t³ + 2t² + 3t  (metres, with t in seconds).
- **Answer field(s):**
  - _(number)_ How quickly the cart's speed is getting faster at t = 2 seconds, in metres per second per second → expected ≈ 16
- **Hint:** First find how its speed is changing, then read that off at the given moment.
- _Rewrite:_ applied

### 5. A value that must occur `a3-ivt`

- **Title:** Car Radio Sweep
- **Prompt:** As you smoothly turn the radio knob on your car from the lowest setting to position 2, the system's volume updates following the formula below without skipping any readings. Here, x means the knob's position, and f(x) gives the volume for each position. You are looking for which exact volume the radio is guaranteed to have displayed somewhere between those two settings.
- **Given:** f(x) = -x² + 7x, swept from x = 0 to x = 2.
- **Answer field(s):**
  - _(choice)_ Which reading must have occurred? → **7** (choose from 7, 13, -1)
- **Hint:** Only values that fall between the starting and ending readings are guaranteed.
- _Rewrite:_ applied

### 6. Two factors multiplied `a4-product`

- **Title:** Chef's supply
- **Prompt:** The company tracks the total amount of ingredients they need using the formula below, where x is the number of dishes they plan to make, and S(x) gives the total kilograms of ingredients required. Write how quickly their total ingredient supply (in kilograms) increases as they plan to prepare more dishes. You are looking for how fast the total amount goes up as more dishes are added. Here, x means the number of dishes, and S(x) is the total kilograms.
- **Given:** S(x) = (x² + 2x + 1)(x)
- **Answer field(s):**
  - _(expression)_ How fast the ingredient supply changes as x changes (as an expression in x) → **3x² + 4x + 1**
- **Hint:** Change one factor at a time while holding the other fixed, then add the two pieces.
- _Rewrite:_ applied

### 7. Doubling / tripling `a4-base`

- **Title:** How Fast Are the Mushrooms Spreading?
- **Prompt:** The size of a patch of mushrooms on the forest ground is determined by the formula below, where x stands for the number of weeks since the patch started spreading. You are looking for how quickly the mushroom patch is getting larger—the number of rings added, for every extra week—right at the moment x = 2 weeks.
- **Given:** F(x) = 3^(x² − 2x)
- **Answer field(s):**
  - _(choice)_ How quickly the mushroom patch is growing when x = 2 weeks (rings gained per week) → **2.2** (choose from 2, 4, 2.2)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ applied

### 8. Continuous growth `a4-egrowth`

- **Title:** Compounding Savings Account Growth
- **Prompt:** A savings account has a balance that follows the rule given below, where x means how many years have passed since you started the account, and A(x) is the dollar balance at that time. You are looking for how quickly the balance is increasing right at the moment when 3 years have gone by. The formula is: A(x) = e^(x² − 4x + 3)
- **Given:** A(x) = e^(x² − 4x + 3)
- **Answer field(s):**
  - _(number)_ How fast the balance is growing right when x = 3 (dollars for each year gone by) → expected ≈ 2
- **Hint:** Right at that moment the inside isn’t changing the amount, so focus on how fast the inside itself is moving.
- _Rewrite:_ applied

### 9. Pinning down a rate `a1-instant-limit`

- **Title:** Basketball Throw Height
- **Prompt:** You are looking for how fast the basketball's height above the court is changing at the exact moment t = 2 seconds. Here, t is the number of seconds since it was thrown, and f(t) is its height above the court in metres. The formula below gives the basketball's height at any time.
- **Given:** f(t) = 0.5t²
Average over [2, 3] = 2.5 · over [2, 2.5] = 2.25 · over [2, 2.1] = 2.05
- **Answer field(s):**
  - _(number)_ how fast its height above the court is changing exactly at t = 2, in metres per second → expected ≈ 2
- **Hint:** Notice the value the shrinking-window averages are closing in on.
- _Rewrite:_ applied

### 10. Sum rule `a2-sum`

- **Title:** Theater ticket sales
- **Prompt:** A local theater models its weekend ticket sales (in tickets) for x evening shows it holds by the rule below. Write how much each extra show adds at level x.
- **Given:** T(x) = x³ + 5x² + 4x
- **Answer field(s):**
  - _(expression)_ Amount each extra unit adds at level x (expression in x) → **3x² + 10x + 4**
- **Hint:** Handle each term on its own, then add the pieces.
- _Rewrite:_ fell back to base

## Level 2

### 1. Fastest rate `a1-fastest`

- **Title:** Peak Museum Attendance Growth
- **Prompt:** A museum displays how its total number of visitors (counted in hundreds) has grown each day. The formula below shows the running total after t days. For which value of t (1, 2, 3, or 4) did the museum see the biggest single-day increase in its cumulative visitor count?
- **Given:** Q(t) = -t³ + 9t² + 7t
- **Answer field(s):**
  - _(choice)_ Value of t when the cumulative number of visitors was climbing fastest (in days) → **3** (choose from 4, 1, 3, 2)
- **Hint:** Work out how fast it's moving at each listed moment, then compare them.
- _Rewrite:_ applied

### 2. Doubling / tripling `a4-base`

- **Title:** Growing sourdough culture
- **Prompt:** A bakery jar: the sourdough starter amount (in cups) follows the rule below, where x is the elapsed time in days. Which value below is closest to how fast the sourdough starter amount is growing right when x = 3?
- **Given:** B(x) = 2^(x² − 4x + 3)
- **Answer field(s):**
  - _(choice)_ Closest instantaneous growth right when x = 3 (cups per unit of x) → **1.4** (choose from 2, 1.4)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ fell back to base

### 3. Continuous growth `a4-egrowth`

- **Title:** Algae Growth Rate in a Pond
- **Prompt:** The mass of algae in a pond, measured in grams, changes over time according to the formula below, where x is how many days have passed. How many grams the algae increases per day exactly at the start, when zero days have passed?
- **Given:** M(x) = e^(x² + 2x)
- **Answer field(s):**
  - _(number)_ How fast the algae mass is growing right when x = 0 (grams per one day) → expected ≈ 2
- **Hint:** Right at that moment the inside isn’t changing the amount, so focus on how fast the inside itself is moving.
- _Rewrite:_ applied

### 4. Sum rule `a2-sum`

- **Title:** Streaming platform subscribers
- **Prompt:** The streaming platform predicts how many subscribers it has if it launches in x countries using the formula below. Subscribers are measured in total, and x is the number of countries served. Using this rule, write as an expression in x how many more subscribers the platform expects to gain for each new country added, when it is already in x countries.
- **Given:** S(x) = x³ + 6x² + 2x + 8
- **Answer field(s):**
  - _(expression)_ How many more subscribers are gained per additional country at level x, as an expression in x → **3x² + 12x + 2**
- **Hint:** Handle each term on its own, then add the pieces.
- _Rewrite:_ applied

### 5. Doubling / tripling `a4-base`

- **Title:** Shares Spreading Online
- **Prompt:** The number of shares on a social media post, N(x), is given by the formula below, where x is the number of hours that have gone by since posting. How quickly is the number of shares increasing exactly 1 hour after the post goes live?
- **Given:** N(x) = 2^(x² + x − 2)
- **Answer field(s):**
  - _(choice)_ how fast the share count is growing right when x = 1, in shares for each one-unit increase in x → **2.1** (choose from 2.1, 3)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ applied

### 6. Doubling / tripling `a4-base`

- **Title:** Mushroom patch spread
- **Prompt:** A forest floor: the mushroom patch size (in rings) follows the rule below, where x is the elapsed time in weeks. Which value below is closest to how fast the mushroom patch size is growing right when x = 3?
- **Given:** F(x) = 2^(x² − x − 6)
- **Answer field(s):**
  - _(choice)_ Closest instantaneous growth right when x = 3 (rings per unit of x) → **3.5** (choose from 3.5, 5)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ fell back to base

### 7. Average vs. instantaneous `a1-avg-inst`

- **Title:** How the Car's Charge Use is Changing
- **Prompt:** For an electric car, f(t) = 2t² + 12t gives the total charge used (in kilowatt-hours) after t minutes of driving. First, find the average speed at which the car's energy use increased between 2 and 4 minutes. Next, find how quickly the energy use was increasing exactly at 4 minutes.
- **Given:** f(t) = 2t² + 12t
- **Answer field(s):**
  - _(number)_ Average rate over the window (kilowatt-hours per minute) → expected ≈ 24
  - _(number)_ Rate right at the end, t = 4 (kilowatt-hours per minute) → expected ≈ 28
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

### 8. Chain rule `a2-chain`

- **Title:** Bakery Dough Mixing
- **Prompt:** At a bakery, the total number of pastry batches mixed up to a given dough cycle x is given by the formula below. Write an expression showing how quickly the total batch count increases as the dough cycle number x increases.
- **Given:** I(x) = (x + 1)²
- **Answer field(s):**
  - _(expression)_ How fast the total batch count changes as an expression in x → **2x + 2**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 9. Chain rule `a2-chain`

- **Title:** Signal Strength at Different Gain Levels
- **Prompt:** A radio receiver adjusts how strong its signal is depending on the gain level x, following the rule below. Find how quickly the signal strength is changing as you adjust x. Use the formula for S(x) = (x + 3)³.
- **Given:** S(x) = (x + 3)³
- **Answer field(s):**
  - _(expression)_ How fast the signal strength changes as x changes, written as an expression in x → **3x² + 18x + 27**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 10. Average vs. instantaneous `a1-avg-inst`

- **Title:** Fish Hatchery Growth
- **Prompt:** A fish hatchery keeps track of the total number of fish it has (in hundreds) each week, with the number after t weeks given by the formula below. Using this formula, find (1) the average weekly change in the fish population between week 0 and week 2, and (2) the rate at which the population is changing exactly at week 2.
- **Given:** f(t) = t² + 10t
- **Answer field(s):**
  - _(number)_ Average rate over the window (hundreds of fish per week) → expected ≈ 12
  - _(number)_ Rate right at the end, t = 2 (hundreds of fish per week) → expected ≈ 14
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

## Level 3

### 1. Doubling / tripling `a4-base`

- **Title:** Spreading bamboo
- **Prompt:** A grove has a certain number of bamboo stalks, which can be found using this formula, where x is how many weeks have passed. Using the rule shown below, how quickly is the number of bamboo stalks increasing exactly at x = 1 week?
- **Given:** S(x) = 3^(x² − 1)
- **Answer field(s):**
  - _(choice)_ How fast the bamboo stalk count is growing right when x = 1 (stalks per unit of x) → **2.2** (choose from 4, 2, 2.2)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ applied

### 2. Combined value at an instant `a4-product-point`

- **Title:** Garden Project Fencing Cost
- **Prompt:** A gardener is planning to put up a fence around a garden, and the fencing cost in dollars follows the rule below, depending on x. How fast is the fencing cost changing exactly when x equals 1?
- **Given:** C(x) = (2x² + 5x + 2)(2x² + x + 4)
- **Answer field(s):**
  - _(number)_ How fast it is changing at x = 1 (dollars per unit of x) → expected ≈ 108
- **Hint:** Combine the two factors first, then read off how fast the combination changes at that instant.
- _Rewrite:_ applied

### 3. Matching the average `a2-mvt`

- **Title:** Ski lift ascent pace
- **Prompt:** A ski lift is being monitored to track how much altitude it gains as it climbs the mountain. According to the formula below, e(x) gives the total ascent (in meters) after x seconds, with x running from 0 to 2 seconds. How fast, on average, does the lift's total ascent increase during this period, and at which single moment x does it increase at exactly that average rate?
- **Given:** e(x) = 3x²   on   [0, 2]
- **Answer field(s):**
  - _(number)_ Average rate across the zone → expected ≈ 6
  - _(number)_ The single moment it equals that (x = ?) → expected ≈ 1
- **Hint:** Find the overall average first, then find where the instantaneous speed equals that average.
- _Rewrite:_ applied

### 4. Chain rule `a2-chain`

- **Title:** Music festival crowd
- **Prompt:** An outdoor event planner estimates how many people will attend based on the promotion score, x, using the formula below. How fast does the estimated crowd size change as x changes?
- **Given:** C(x) = (4x + 1)²
- **Answer field(s):**
  - _(expression)_ How fast the crowd size estimate changes as an expression in x → **32x + 8**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 5. Average vs. instantaneous `a1-avg-inst`

- **Title:** Baker's Loaves
- **Prompt:** A baker keeps a record of how many loaves of bread have been baked after t hours using the rule below. From hour 0 to hour 3, how quickly did the total number of loaves change on average in that span, and how quickly was it changing right at hour 3?
- **Given:** f(t) = t² + 12t
- **Answer field(s):**
  - _(number)_ Average rate over the window (loaves per hour) → expected ≈ 15
  - _(number)_ Rate right at the end, t = 3 (loaves per hour) → expected ≈ 18
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

### 6. Doubling / tripling `a4-base`

- **Title:** Expanding coral reef
- **Prompt:** A coral reef: the coral area (in meters squared) follows the rule below, where x is the elapsed time in years. Which value below is closest to how fast the coral area is growing right when x = 3?
- **Given:** C(x) = 3^(x² − 2x − 3)
- **Answer field(s):**
  - _(choice)_ Closest instantaneous growth right when x = 3 (meters squared per unit of x) → **4.4** (choose from 8, 4, 4.4)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ fell back to base

### 7. Combined value at an instant `a4-product-point`

- **Title:** Tank Volume Changes
- **Prompt:** A container has a base and a depth, and its volume in liters is given by the formula below, where x is the depth in units. How fast is the volume changing right when the depth reaches x = 2?
- **Given:** V(x) = (4x² + 2x + 3)(4x² + x + 4)
- **Answer field(s):**
  - _(number)_ How fast it is changing at x = 2 (liters per unit of x) → expected ≈ 787
- **Hint:** Combine the two factors first, then read off how fast the combination changes at that instant.
- _Rewrite:_ applied

### 8. Chain rule `a2-chain`

- **Title:** Bakery Batch Changes
- **Prompt:** At Susan's bakery, the total number of batches she prepares follows the rule below for dough cycle x. Using this formula, write how quickly the total number of batches changes as x increases, as an expression in x.
- **Given:** I(x) = (4x + 1)²
- **Answer field(s):**
  - _(expression)_ How fast the total batch count changes as an expression in x → **32x + 8**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 9. Natural-log response `a4-log`

- **Title:** Felt Intensity Sensor
- **Prompt:** A felt intensity sensor detects a signal over various energy levels. Its felt intensity (in units) is given by the formula below, where x is the energy level. How fast does the felt intensity change when the energy level is 1?
- **Given:** I(x) = ln(x² + 4x − 2)
- **Answer field(s):**
  - _(number)_ Change per unit of energy level at x = 1 (units) → expected ≈ 2
- **Hint:** Compare how fast the inside is moving to how big the inside is at that moment.
- _Rewrite:_ applied

### 10. Average vs. instantaneous `a1-avg-inst`

- **Title:** Channel Subscriber Growth
- **Prompt:** The formula below shows a channel's subscriber count (in thousands) after t weeks. Between week 2 and week 5, how fast did its subscriber count change on average, and how fast was its count changing exactly at week 5?
- **Given:** f(t) = 2t² + 11t
- **Answer field(s):**
  - _(number)_ Average rate over the window (thousands of subscribers per week) → expected ≈ 25
  - _(number)_ Rate right at the end, t = 5 (thousands of subscribers per week) → expected ≈ 31
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

## Level 4

### 1. Velocity and acceleration `a3-accel`

- **Title:** Linear Motor Speed Increase
- **Prompt:** A linear motor stage moves along a track, and the formula below shows the distance it has travelled, in metres, after t seconds. Using this rule, how quickly is the stage gaining speed exactly 3 seconds after it began moving?
- **Given:** s(t) = t³ + t²  (metres, with t in seconds).
- **Answer field(s):**
  - _(number)_ Rate its speed is increasing at t = 3 (m/s²) → expected ≈ 20
- **Hint:** First find how its speed is changing, then read that off at the given moment.
- _Rewrite:_ applied

### 2. Combined value at an instant `a4-product-point`

- **Title:** How Quickly the Courier's Load Changes
- **Prompt:** A courier is delivering packages, and the total weight in kilograms is given by the formula below, where x stands for the number of boxes being loaded at a time. How fast is the load increasing exactly when x equals 1?
- **Given:** L(x) = (4x + 5)(x + 4)
- **Answer field(s):**
  - _(number)_ How fast it is changing at x = 1 (kilograms per unit of x) → expected ≈ 29
- **Hint:** Combine the two factors first, then read off how fast the combination changes at that instant.
- _Rewrite:_ applied

### 3. Doubling / tripling `a4-base`

- **Title:** Going viral
- **Prompt:** A video: the view count (in views) follows the rule below, where x is the elapsed time in days. Which value below is closest to how fast the view count is growing right when x = 1?
- **Given:** V(x) = 2^(x² + 2x − 3)
- **Answer field(s):**
  - _(choice)_ Closest instantaneous growth right when x = 1 (views per unit of x) → **2.8** (choose from 2.8, 4)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ fell back to base

### 4. Combined value at an instant `a4-product-point`

- **Title:** Register's Revenue Change
- **Prompt:** A store is keeping track of how much money comes in as it sells items, with the total revenue (in dollars) given by the formula below, where x is the number of items sold so far. How quickly is the revenue increasing exactly at the moment when x = 2 items have been sold?
- **Given:** R(x) = (x² + 2x)(3x² + x + 2)
- **Answer field(s):**
  - _(number)_ How fast it is changing at x = 2 (dollars per unit of x) → expected ≈ 200
- **Hint:** Combine the two factors first, then read off how fast the combination changes at that instant.
- _Rewrite:_ applied

### 5. Average vs. instantaneous `a1-avg-inst`

- **Title:** Watering Schedule
- **Prompt:** A gardener keeps track of the total liters of water used on their plants after t days using the formula below. During the period from day 1 to day 3, find both the average change in total water poured per day, and the rate at which the amount of water being poured was increasing exactly at day 3.
- **Given:** f(t) = 2t² + 8t
- **Answer field(s):**
  - _(number)_ Average rate over the window (liters per day) → expected ≈ 16
  - _(number)_ Rate right at the end, t = 3 (liters per day) → expected ≈ 20
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

### 6. Combining the rules `a2-combine`

- **Title:** Aquarium Lighting Controls
- **Prompt:** The total brightness in lumens inside an aquarium depends on the control setting x, with both overhead bulbs and spotlights contributing to the overall light. The formula below gives the total light based on the setting x. Write how fast the total amount of light changes in the aquarium as you turn the control setting x higher.
- **Given:** L(x) = (2x + 1)² + 3x³
- **Answer field(s):**
  - _(expression)_ How fast the total changes (expression in x) → **9x² + 8x + 4**
- **Hint:** Break it into two pieces, find how fast each changes, then add.
- _Rewrite:_ applied

### 7. Velocity and acceleration `a3-accel`

- **Title:** Subway Car Acceleration
- **Prompt:** An automated subway car starts moving down its track. According to the formula below, the car covers s(t) = t³ + 5t² metres after t seconds. How quickly is the car's speed increasing exactly 3 seconds after it began moving?
- **Given:** s(t) = t³ + 5t²  (metres, with t in seconds).
- **Answer field(s):**
  - _(number)_ Rate its speed is increasing at t = 3 (m/s²) → expected ≈ 28
- **Hint:** First find how its speed is changing, then read that off at the given moment.
- _Rewrite:_ applied

### 8. Velocity and acceleration `a3-accel`

- **Title:** Factory Cart Speed Change
- **Prompt:** A cart is being carried along a conveyor at a factory. The conveyor keeps track of the distance the cart travels over time using the rule below, where t is measured in seconds and s(t) is the distance in metres. At the exact moment 3 seconds have passed, how quickly is the cart's speed increasing?
- **Given:** s(t) = 2t³ + 4t² + t  (metres, with t in seconds).
- **Answer field(s):**
  - _(number)_ Rate its speed is increasing at t = 3 (m/s²) → expected ≈ 44
- **Hint:** First find how its speed is changing, then read that off at the given moment.
- _Rewrite:_ applied

### 9. Related rates `a3-related`

- **Title:** Growing Soap Film
- **Prompt:** A soap film forms a perfect square that is currently 11 centimeters on each side. The edges of the film are stretching so that each side increases in length by 0.1 centimeters per second. Using the formula below, how quickly is the total area of the film increasing right now?
- **Given:** A square with side s has area A = s². At this moment the side = 11 cm and grows by 0.1 cm/s.
- **Answer field(s):**
  - _(number)_ How fast the area of a square soap film is growing at this instant, in square cm per second → expected ≈ 2.2
- **Hint:** Connect the size to the length that’s changing, then bring in the steady growth you were given.
- _Rewrite:_ applied

### 10. Related rates `a3-related`

- **Title:** Growing Paper Lantern at a Festival
- **Prompt:** A glowing paper lantern at a festival is a perfect sphere. At this moment, the lantern’s radius is 6 cm and it is getting bigger at a steady rate of 0.5 cm per second. Using the formula below for the volume of a sphere, how fast is the lantern’s volume increasing right now?
- **Given:** A sphere of radius r has volume V = (4/3)·π·r³. At this moment the radius = 6 cm and grows by 0.5 cm/s.
- **Answer field(s):**
  - _(number)_ How fast the volume of a glowing paper lantern is growing at this instant, in cubic cm per second → expected ≈ 226.1947
- **Hint:** Connect the size to the length that’s changing, then bring in the steady growth you were given.
- _Rewrite:_ applied

## Level 5

### 1. Matching the average `a2-mvt`

- **Title:** Factory Conveyor Belt Monitoring
- **Prompt:** A conveyor moves materials down an assembly line. The length of material transported (in meters) after x seconds is given by the rule below, and x can be any number from 1 to 3 seconds. Over that span, how fast did the transported length increase on average, and at what exact moment, x, was the length increasing at precisely that average rate?
- **Given:** p(x) = 3x²   on   [1, 3]
- **Answer field(s):**
  - _(number)_ Average rate across the period (meters per second) → expected ≈ 12
  - _(number)_ The single moment when this rate occurred (x in seconds) → expected ≈ 2
- **Hint:** Find the overall average first, then find where the instantaneous speed equals that average.
- _Rewrite:_ applied

### 2. Matching the average `a2-mvt`

- **Title:** Theme park ride
- **Prompt:** A cart on a roller coaster has the total track distance it covers (measured in meters) after x seconds given by the rule below, with x ranging from 1 to 5 seconds. Using this rule, find how fast the total track distance changed on average between 1 and 5 seconds, and the exact moment x (in seconds) at which the track was being completed at exactly that average pace.
- **Given:** r(x) = x²   on   [1, 5]
- **Answer field(s):**
  - _(number)_ Average rate across the zone → expected ≈ 6
  - _(number)_ The single moment it equals that (x = ?) → expected ≈ 3
- **Hint:** Find the overall average first, then find where the instantaneous speed equals that average.
- _Rewrite:_ applied

### 3. Matching the average `a2-mvt`

- **Title:** Conveyor Travel
- **Prompt:** A box rides along a conveyor belt, and the formula below gives the distance it has covered in meters after x seconds, for values of x between 2 and 6 seconds. Over that entire period, at what average speed did the box's distance increase? Also, at exactly which single moment x did the box's distance increase at that average speed?
- **Given:** s(x) = 3x²   on   [2, 6]
- **Answer field(s):**
  - _(number)_ Average rate across the zone (meters per second) → expected ≈ 24
  - _(number)_ The single moment it equals that (x = ? seconds) → expected ≈ 4
- **Hint:** Find the overall average first, then find where the instantaneous speed equals that average.
- _Rewrite:_ applied

### 4. Combined value at an instant `a4-product-point`

- **Title:** Garden Fencing Price Change
- **Prompt:** A gardener is planning a new fence for a rectangular garden. The formula below gives the total fencing cost (in dollars) in terms of x, where x is the width of the garden in meters. How quickly does the fencing cost change when the width x equals 2 meters?
- **Given:** C(x) = (5x + 1)(3x² + x + 2)
- **Answer field(s):**
  - _(number)_ How fast it is changing at x = 2 (dollars per unit of x) → expected ≈ 223
- **Hint:** Combine the two factors first, then read off how fast the combination changes at that instant.
- _Rewrite:_ applied

### 5. Sum rule `a2-sum`

- **Title:** Cleaning Crew Work Hours
- **Prompt:** A cleaning crew estimates the total number of hours it will work in a week when cleaning x offices using the rule below. W(x) = 3x³ + x² + 3x Write how much to expect each additional office to add to the total weekly hours when they already have x offices to clean.
- **Given:** W(x) = 3x³ + x² + 3x
- **Answer field(s):**
  - _(expression)_ Amount each extra unit adds at level x (expression in x) → **9x² + 2x + 3**
- **Hint:** Handle each term on its own, then add the pieces.
- _Rewrite:_ applied

### 6. Sum rule `a2-sum`

- **Title:** Growth of Streaming Service Users by Country
- **Prompt:** A streaming service tracks its number of subscribers for x countries using the formula below. How many subscribers does the total user base increase by for each additional country added at level x?
- **Given:** S(x) = 4x³ + x² + x + 7
- **Answer field(s):**
  - _(expression)_ Amount each extra country adds at level x (as an expression in x) → **12x² + 2x + 1**
- **Hint:** Handle each term on its own, then add the pieces.
- _Rewrite:_ applied

### 7. A value that must occur `a3-ivt`

- **Title:** Signal Level Reading
- **Prompt:** As the dial is turned steadily from setting 0 up to setting 2, the signal level f(x) changes smoothly according to the formula below. Over this range, which signal reading must the system have displayed at some stage?
- **Given:** f(x) = -x² + 7x, swept from x = 0 to x = 2.
- **Answer field(s):**
  - _(choice)_ Which reading must have occurred? → **9** (choose from -2, 13, 9)
- **Hint:** Only values that fall between the starting and ending readings are guaranteed.
- _Rewrite:_ applied

### 8. Chain rule `a2-chain`

- **Title:** Racing Nitro Gauge
- **Prompt:** In a racing game, the stored nitro energy at boost dial setting x is given by the formula below. Write, as an expression in x, how quickly the nitro energy changes as you adjust the boost dial.
- **Given:** N(x) = (2x + 3)³
- **Answer field(s):**
  - _(expression)_ How fast the stored nitro energy changes as an expression in x → **24x² + 72x + 54**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 9. Average vs. instantaneous `a1-avg-inst`

- **Title:** Tracking Water Usage in the Garden
- **Prompt:** A gardener keeps track of how much water is added to the plants each day. Using the formula below, which gives the total number of liters poured after t days, find two things: First, how quickly the total amount of water added changed on average from day 2 to day 4, and second, how quickly the amount was changing on day 4 itself. f(t) = 2t² + 6t
- **Given:** f(t) = 2t² + 6t
- **Answer field(s):**
  - _(number)_ Average rate over the window (liters per day) → expected ≈ 18
  - _(number)_ Rate right at the end, t = 4 (liters per day) → expected ≈ 22
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

### 10. Continuous growth `a4-egrowth`

- **Title:** Bacteria bloom
- **Prompt:** A petri dish: the bacteria count (in cells) follows the rule below, where x is the elapsed time in hours. How fast is the bacteria count growing right when x = 2?
- **Given:** B(x) = e^(x² + 4x − 12)
- **Answer field(s):**
  - _(number)_ Instantaneous growth right when x = 2 (cells per unit of x) → expected ≈ 8
- **Hint:** Right at that moment the inside isn’t changing the amount, so focus on how fast the inside itself is moving.
- _Rewrite:_ fell back to base

## Level 6

### 1. Turning points `a1-turning`

- **Title:** Concert Ticket Inventory Peaks
- **Prompt:** For a concert, the number of unsold tickets each day after t days is given by the formula below. This number increases, then decreases, then increases again. On which day does the number of unsold tickets stop increasing before starting to decrease, and on which day does it stop decreasing before increasing again?
- **Given:** f(t) = 2t³ − 21t² + 72t
- **Answer field(s):**
  - _(number)_ Time it stops rising, high point (t in days) → expected ≈ 3
  - _(number)_ Time it stops falling, low point (t in days) → expected ≈ 4
- **Hint:** Find the moments it briefly stops moving, then decide which is a high point and which is a low point.
- _Rewrite:_ applied

### 2. Combined value at an instant `a4-product-point`

- **Title:** Hotel Floor Space Change
- **Prompt:** A hotel has rooms that each cover a certain area. The total floor space (in square feet) follows the formula below. How quickly is the floor space changing right at x = 2?
- **Given:** S(x) = (4x + 4)(3x² + 4x + 3)
- **Answer field(s):**
  - _(number)_ How fast it is changing at x = 2 (square feet per unit of x) → expected ≈ 284
- **Hint:** Combine the two factors first, then read off how fast the combination changes at that instant.
- _Rewrite:_ applied

### 3. A value that must occur `a3-ivt`

- **Title:** Tuning the Car Stereo
- **Prompt:** As the volume knob of a car stereo is turned smoothly from position 0 to position 2, the displayed volume f(x) follows the rule shown below. Which volume reading is certain to have appeared at some point during this adjustment?
- **Given:** f(x) = -x² + 6x, swept from x = 0 to x = 2.
- **Answer field(s):**
  - _(choice)_ Which reading must have occurred? → **5** (choose from 5, -3, 11)
- **Hint:** Only values that fall between the starting and ending readings are guaranteed.
- _Rewrite:_ applied

### 4. Related rates `a3-related`

- **Title:** Growing Gelatin Cube
- **Prompt:** A gelatin cube is rising and keeps its shape perfectly as it gets bigger. Right now the cube's edge is 8 mm and that edge grows at a steady 0.25 mm per second. According to the formula below, how fast is the volume of the cube increasing right now?
- **Given:** A cube with edge s has volume V = s³. At this moment the edge = 8 mm and grows by 0.25 mm/s.
- **Answer field(s):**
  - _(number)_ How fast the volume is growing right now, in cubic mm per second → expected ≈ 48
- **Hint:** Connect the size to the length that’s changing, then bring in the steady growth you were given.
- _Rewrite:_ applied

### 5. Sum rule `a2-sum`

- **Title:** Streaming platform subscribers
- **Prompt:** A streaming service tracks its total number of subscribers (counted in whole subscribers) using the formula below, where x is the number of countries the service operates in. At any given value of x, how many subscribers does adding one more country add, according to the formula?
- **Given:** S(x) = 4x³ + x² + 4x + 7
- **Answer field(s):**
  - _(expression)_ Amount each extra unit adds at level x (expression in x) → **12x² + 2x + 4**
- **Hint:** Handle each term on its own, then add the pieces.
- _Rewrite:_ applied

### 6. Chain rule `a2-chain`

- **Title:** Packed Tent Volume
- **Prompt:** A camping gear manufacturer notes that the packed volume of a tent at frame setting x is given by the formula below. Write how fast the packed volume changes as x changes.
- **Given:** V(x) = (3x + 3)³
- **Answer field(s):**
  - _(expression)_ How fast the packed volume changes as an expression in x → **81x² + 162x + 81**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 7. Natural-log response `a4-log`

- **Title:** Perceived sweetness
- **Prompt:** A coffee taster notes that the perceived sweetness (measured in points) depends on the amount of sugar added, according to the formula below, where x is the amount of sugar. How fast is the perceived sweetness changing when x = 2?
- **Given:** S(x) = ln(x² + x − 1)
- **Answer field(s):**
  - _(number)_ Change per unit of sugar added at x = 2 (points) → expected ≈ 1
- **Hint:** Compare how fast the inside is moving to how big the inside is at that moment.
- _Rewrite:_ applied

### 8. A value that must occur `a3-ivt`

- **Title:** Dialing in Coffee Grounds
- **Prompt:** As you adjust the grind dial of a coffee machine smoothly from position 0 up to position 3, the fineness shown by the machine changes according to the formula below with each setting. Over this adjustment, which reading does the system have to display at some point?
- **Given:** f(x) = -x² + 10x, swept from x = 0 to x = 3.
- **Answer field(s):**
  - _(choice)_ Which reading must have occurred? → **17** (choose from 23, -2, 17)
- **Hint:** Only values that fall between the starting and ending readings are guaranteed.
- _Rewrite:_ applied

### 9. Related rates `a3-related`

- **Title:** Gelatin Cube Growth
- **Prompt:** A gelatin dessert is shaped into a perfect cube. At this moment, each edge of the cube measures 11 mm, and the edge length is increasing steadily at 0.1 mm per second. According to the formula below, V = s³, where s is the length of the edge in millimeters, how quickly is the volume of the gelatin cube increasing right now?
- **Given:** A cube with edge s has volume V = s³. At this moment the edge = 11 mm and grows by 0.1 mm/s.
- **Answer field(s):**
  - _(number)_ How fast the volume is growing right now (in cubic mm per second) → expected ≈ 36.3
- **Hint:** Connect the size to the length that’s changing, then bring in the steady growth you were given.
- _Rewrite:_ applied

### 10. Fastest rate `a1-fastest`

- **Title:** Ticket Sales Rate at a Concert Venue
- **Prompt:** A concert hall keeps track of how many concert tickets have been sold at the end of each day. The running total in thousands of tickets after t days is given by the formula below. On which day, out of days 1, 2, 3, or 4, was the total number of tickets being sold at the fastest rate?
- **Given:** Q(t) = -t³ + 9t² + 8t
- **Answer field(s):**
  - _(choice)_ Value of t when it rose fastest (in days) → **3** (choose from 4, 1, 2, 3)
- **Hint:** Work out how fast it's moving at each listed moment, then compare them.
- _Rewrite:_ applied

## Level 7

### 1. Continuous growth `a4-egrowth`

- **Title:** Watching Cells Multiply in the Lab
- **Prompt:** A researcher is tracking a special cell population that follows the formula below, where x stands for the number of hours since the experiment began. As she checks the culture after exactly 3 hours, her coffee cools nearby. At that moment, right when x = 3, what is the number of new cells being added per hour?
- **Given:** C(x) = e^(x² − 9)
- **Answer field(s):**
  - _(number)_ new cells added at the 3-hour mark (cells per hour) → expected ≈ 6
- **Hint:** Right at that moment the inside isn’t changing the amount, so focus on how fast the inside itself is moving.
- _Rewrite:_ applied

### 2. Natural-log response `a4-log`

- **Title:** Star brightness through a telescope
- **Prompt:** While exploring the night sky from her backyard with her new telescope, Julia keeps an eye on the brightness dial as she adjusts the light input to the telescope. She follows the formula shown below for perceived brightness B(x), where x represents the amount of light entering the telescope. When she slides the input to x = 2, her neighbor waves from across the street carrying a tray of hot cocoa. At that same setting, at what point is the displayed brightness changing most rapidly as she adjusts the input?
- **Given:** B(x) = ln(x² + x − 1)
- **Answer field(s):**
  - _(number)_ the change in displayed brightness at x = 2 (units per unit of light input) → expected ≈ 1
- **Hint:** Compare how fast the inside is moving to how big the inside is at that moment.
- _Rewrite:_ applied

### 3. A value that must occur `a3-ivt`

- **Title:** Car Radio Volume Sweep
- **Prompt:** A car radio lets you smoothly turn the volume knob from 0 up to 4, and the formula below gives the display reading f(x) for each knob setting x. Suppose Maya is adjusting the radio as her friend takes pictures of the sunset from the passenger seat. During this gradual sweep of the knob, which reading is certain to have appeared on the volume display at least once?
- **Given:** f(x) = x² + 1, swept from x = 0 to x = 4.
- **Answer field(s):**
  - _(choice)_ Volume reading shown on the display → **14** (choose from 20, 14, -2)
- **Hint:** Only values that fall between the starting and ending readings are guaranteed.
- _Rewrite:_ applied

### 4. Related rates `a3-related`

- **Title:** Expanding Chalk Masterpiece
- **Prompt:** A group of kids are creating a huge square chalk masterpiece on the playground, and the artwork's edges are expanding evenly. Right now, the side of the square chalk drawing measures exactly 7 cm, and the kids are making that side longer at a steady pace of 1 cm per second. Across from them, a teacher is tallying points for a mural contest. At this moment, how many square centimeters does the area of the chalk drawing grow by each second? (Use the formula shown below.)
- **Given:** A square with side s has area A = s². At this moment the side = 7 cm and grows by 1 cm/s.
- **Answer field(s):**
  - _(number)_ Number of square centimeters the chalk drawing adds per second → expected ≈ 14
- **Hint:** Connect the size to the length that’s changing, then bring in the steady growth you were given.
- _Rewrite:_ applied

### 5. Fastest rate `a1-fastest`

- **Title:** Peak Day for New User Growth
- **Prompt:** A streaming company keeps track of how many new user accounts they have by the end of each day, using the formula below. Some days they run special promotions, like offering a free month to basketball fans on day 2 to celebrate the playoff season. Based on the numbers from the formula, on which day (1, 2, 3, or 4) did the total number of new users rise the fastest?
- **Given:** Q(t) = -t³ + 9t² + 10t
- **Answer field(s):**
  - _(choice)_ Day when the total number of new users increased the most (days) → **3** (choose from 2, 3, 4, 1)
- **Hint:** Work out how fast it's moving at each listed moment, then compare them.
- _Rewrite:_ applied

### 6. Natural-log response `a4-log`

- **Title:** Lighting up the living room
- **Prompt:** Jamie is in the living room and notices how the overall brightness depends on how many lamps are switched on, following the formula below, where x stands for the number of lamps currently shining. There’s a radio quietly playing near the window. At the moment when there are 2 lamps switched on, how quickly does the living room's brightness respond as an extra lamp is added?
- **Given:** B(x) = ln(x² + x − 5)
- **Answer field(s):**
  - _(number)_ Change in brightness points per lamp when there are 2 lamps turned on → expected ≈ 5
- **Hint:** Compare how fast the inside is moving to how big the inside is at that moment.
- _Rewrite:_ applied

### 7. Combining the rules `a2-combine`

- **Title:** Parcel Delivery Adjustments
- **Prompt:** A courier company organizes deliveries using both vans and bikes, and the day's total number of packages delivered depends on the control dial setting x, following the formula below. The branch manager likes to briefly speed up her steps right when she senses the total package output at its most rapid climb. When, as the setting x increases, is this moment — that is, when does the delivery count's climb reach its strongest point?
- **Given:** D(x) = (3x + 3)² + x³
- **Answer field(s):**
  - _(expression)_ Delivery count's rate of increase as an expression in x (packages per unit x) → **3x² + 18x + 18**
- **Hint:** Break it into two pieces, find how fast each changes, then add.
- _Rewrite:_ applied

### 8. Two factors multiplied `a4-product`

- **Title:** Fuse Safety and Circuit Power
- **Prompt:** Imagine you have a small device connected to a circuit, where the power in watts is found using the formula below as the voltage and current change with a knob set to x. The technician wants to know when the fuse is in the most danger from a sudden increase or decrease in power—since a fuse tends to blow when power climbs (or drops) most sharply. (There's a tiny fan nearby blowing on the circuit as it cools, but it's not part of the electrical setup.) According to the formula below, find an expression for how quickly the power is changing with x, so the technician can watch for risky moments as the knob turns.
- **Given:** P(x) = (4x² + x + 4)(4x² + x + 5)
- **Answer field(s):**
  - _(expression)_ How quickly power is changing with x, in watts per unit of x (write your answer as an expression in x) → **64x³ + 24x² + 74x + 9**
- **Hint:** Change one factor at a time while holding the other fixed, then add the two pieces.
- _Rewrite:_ applied

### 9. Pinning down a rate `a1-instant-limit`

- **Title:** Living room temperature monitor
- **Prompt:** The Lennons have a digital thermometer at home that logs the temperature in their living room (in degrees Celsius) as time goes by, using the formula below to report the temperature after t minutes. On the thermometer’s screen, it lists the average temperature increase per minute over shorter and shorter time frames starting from minute 3 — showing values of 4.5 over the interval from 3 to 4 minutes, 4.25 over 3 to 3.5, and 4.05 over 3 to 3.1. Zoe is boiling water in the kitchen next door while watching the numbers on the screen. As Zoe wants to know the number the thermometer’s averages are closing in on exactly at minute 3, what value are the temperature increases in the living room closing in on at t = 3?
- **Given:** f(t) = 0.5t² + t
Average over [3, 4] = 4.5 · over [3, 3.5] = 4.25 · over [3, 3.1] = 4.05
- **Answer field(s):**
  - _(number)_ Temperature increase in the living room at minute 3 (degrees Celsius per minute) → expected ≈ 4
- **Hint:** Notice the value the shrinking-window averages are closing in on.
- _Rewrite:_ applied

### 10. Natural-log response `a4-log`

- **Title:** Perceived value
- **Prompt:** A shopper is choosing between two stores to make a purchase. At one store, every dollar spent adds points to the shopper’s perceived value following the rule below, where x is the amount spent. Just as the shopper is paying $3 at this store, her phone buzzes with a message from a friend about a flash sale elsewhere. At this instant, how quickly is her perceived value increasing according to the formula?
- **Given:** V(x) = ln(x² − 6)
- **Answer field(s):**
  - _(number)_ Perceived value change at a $3 spending level (points per dollar) → expected ≈ 2
- **Hint:** Compare how fast the inside is moving to how big the inside is at that moment.
- _Rewrite:_ applied

## Level 8

### 1. Average vs. instantaneous `a1-avg-inst`

- **Title:** New Additions to the Book Collection
- **Prompt:** A book collector tracks the total number of books on their shelves each week using the formula below, where t is the number of weeks since the start of the year. After 3 weeks, the collector threw a party for friends, showing off a total of 54 rare cookbooks they had accumulated over the years. From week 1 to week 4, by how many books did the shelves get more crowded on average each week, and what was the weekly pace of new arrivals as the collector finished week 4?
- **Given:** f(t) = 2t² + 5t
- **Answer field(s):**
  - _(number)_ Average number of books added per week from week 1 to week 4 → expected ≈ 15
  - _(number)_ Number of books added per week at week 4 → expected ≈ 21
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

### 2. Continuous growth `a4-egrowth`

- **Title:** Family Trust Fund Growth
- **Prompt:** A family sets up a trust fund for their grandchild, and its total value (in dollars) follows the formula shown below, where x is the number of years since 2020. In 2023, the family also donates $250 each year to a local charity, separate from the trust. Right at one year after the trust is created, how quickly is the trust fund's value increasing according to the formula below?
- **Given:** I(x) = e^(x² + 3x − 4)
- **Answer field(s):**
  - _(number)_ increase in the fund's value (dollars per year) at 1 year after creation → expected ≈ 5
- **Hint:** Right at that moment the inside isn’t changing the amount, so focus on how fast the inside itself is moving.
- _Rewrite:_ applied

### 3. Sum rule `a2-sum`

- **Title:** Planning Activities at a Summer Camp
- **Prompt:** A summer camp is planning how many kids will register each season based on the number of different activities it offers. For a given number of activities, x, it estimates registrations using the formula below. Last year, they gave out 27 t-shirts to organizers. According to the formula, if the camp currently has x activities and adds one more, by how many children will the registrations for the season increase?
- **Given:** R(x) = 5x³ + 4x² + 2x + 3
- **Answer field(s):**
  - _(expression)_ Children gained per additional activity at level x, as an expression in x → **15x² + 8x + 2**
- **Hint:** Handle each term on its own, then add the pieces.
- _Rewrite:_ applied

### 4. A value that must occur `a3-ivt`

- **Title:** Tuning the Car Stereo
- **Prompt:** As your friend turns the volume knob smoothly while driving from a rest stop to the city, the radio's loudness f(x) changes according to the formula below as the knob sweeps from position x = 0 to x = 2. At some point during this adjustment, the outside temperature ticks up from 14°C to 15°C. Which volume reading is the system certain to have displayed along the way?
- **Given:** f(x) = x² + 2, swept from x = 0 to x = 2.
- **Answer field(s):**
  - _(choice)_ Volume reading shown at some point (no units) → **3** (choose from 3, 7, -1)
- **Hint:** Only values that fall between the starting and ending readings are guaranteed.
- _Rewrite:_ applied

### 5. Chain rule `a2-chain`

- **Title:** Predicting Festival Attendance Growth
- **Prompt:** A planner is preparing for a major outdoor music festival. The expected number of people attending depends on how much effort has gone into promoting the event, measured by a promotion score x, and follows the formula below. The food truck vendor nearby charges $8 for each plate of nachos. As planning ramps up, how quickly will the crowd estimate grow with each point increase in the promotion score according to the rule below?
- **Given:** C(x) = (4x + 3)²
- **Answer field(s):**
  - _(expression)_ the crowd estimate increase per point of promotion score, as an expression in x → **32x + 24**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 6. Power rule `a2-power`

- **Title:** Rising costs for pizza dough
- **Prompt:** At Mario's Pizzeria, the dough costs—as a function of radius r in inches—are given by the rule below. The staff is experimenting with pizza sizes, and for a party tonight, one chef might increase the radius of a pizza from 4 inches. The regular tomato sauce can costs $9 per can. According to the formula below, when the pizza is at exactly 4 inches in radius, by how many extra dollars does the dough price go up for each additional inch of radius at that size?
- **Given:** C(r) = 2r³
- **Answer field(s):**
  - _(number)_ Extra cost in dollars per inch of radius added when the pizza is 4 inches across → expected ≈ 96
- **Hint:** How fast is this single term growing right at that input?
- _Rewrite:_ applied

### 7. Chain rule `a2-chain`

- **Title:** Choosing the Right Paint Roller
- **Prompt:** A home renovator uses various roller sizes to paint walls, and the area covered in square feet depends on the roller size x in inches, according to the formula below. For a big living room project, they want to know how much extra area can be covered with each inch increase in roller size, so they can estimate the right roller for different jobs. The room's ceiling height is 9 feet. How does the covered area change for each inch increase in roller size?
- **Given:** V(x) = (x + 4)³
- **Answer field(s):**
  - _(expression)_ extra square feet of wall painted with each added inch of roller size, as an expression in x → **3x² + 24x + 48**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 8. Fastest rate `a1-fastest`

- **Title:** Measuring Reservoir Water Intake
- **Prompt:** A river feeds a large reservoir, collecting extra runoff each spring. Every second, technicians record the growing total amount of water (in thousands of litres) flowing in, and the formula below shows the total by the end of any given second. Last year, the environmental monitor also noted that the reservoir’s starting water level was 4300 thousand litres. Considering the information provided, during which of the following seconds (1, 2, 3, or 4) was water entering the reservoir at its fastest pace?
- **Given:** Q(t) = -t³ + 9t² + 12t
- **Answer field(s):**
  - _(choice)_ The second when new water was entering the reservoir at the highest pace (seconds) → **3** (choose from 2, 4, 3, 1)
- **Hint:** Work out how fast it's moving at each listed moment, then compare them.
- _Rewrite:_ applied

### 9. Sum rule `a2-sum`

- **Title:** Boosting Production with Extra Machines
- **Prompt:** At Delmar Manufacturing, new machines are occasionally added to the production line to boost the daily number of items built. The factory predicts its total daily output (in units) based on the number of extra machines x it runs using the formula below. Each machine costs $4500, but only the additional machines affect the production amount predicted. If Delmar decides to run x extra machines, how many additional units is each one expected to be responsible for, on average, once x machines are running?
- **Given:** Q(x) = 2x³ + x² + 2x + 8
- **Answer field(s):**
  - _(expression)_ Additional output per extra machine at level x, in units per machine (as an expression in x) → **6x² + 2x + 2**
- **Hint:** Handle each term on its own, then add the pieces.
- _Rewrite:_ applied

### 10. Power rule `a2-power`

- **Title:** Cost Increase for Larger Pizzas
- **Prompt:** At Antonio's Pizza, the cost of pizza dough (in dollars) is determined by the size of each pizza: for a pizza with a radius r in inches, the dough cost is given by the formula below. Antonio is thinking about switching the standard pizza size from a 7-inch to a slightly larger one, and he wants to know how much more the dough cost will go up for every extra inch he adds at exactly r = 7. If each pizza box costs $0.85, how much extra does Antonio spend on dough for each additional inch to the radius when his pizzas are 7 inches?
- **Given:** C(r) = 2r³
- **Answer field(s):**
  - _(number)_ extra dough cost per added inch of radius at r = 7 (dollars per inch) → expected ≈ 294
- **Hint:** How fast is this single term growing right at that input?
- _Rewrite:_ applied

## Level 9

### 1. Continuous growth `a4-egrowth`

- **Title:** Incubator Cell Growth Observation
- **Prompt:** In a biology lab, a scientist is monitoring a set of cells as they multiply in a temperature-controlled incubator. According to the formula below, C(x) gives the number of cells after x hours have passed. The incubator is checked every hour, and data is recorded carefully. At the 2-hour mark, another team runs a 90-minute experiment in a neighboring lab. At the moment when 2 hours have elapsed, how quickly is the number of cells changing, according to the formula below? C(x) = e^(x² + x − 6)
- **Given:** C(x) = e^(x² + x − 6)
- **Answer field(s):**
  - _(number)_ Change in cell count per hour at 2 hours → expected ≈ 5
- **Hint:** Right at that moment the inside isn’t changing the amount, so focus on how fast the inside itself is moving.
- _Rewrite:_ applied

### 2. Matching the average `a2-mvt`

- **Title:** Watching luggage move at the airport
- **Prompt:** At an airport, Lucia spots her suitcase as it starts moving along the always-spinning luggage carousel. The distance (in meters) that her bag has been carried is tracked over exactly 1 to 3 seconds using the rule below. While waiting, Lucia also checks her watch and sees her flight took off 40 minutes ago. Over this short stretch, figure out the speed her bag covered on average and the single moment during this interval when her bag was moving at exactly that same speed.
- **Given:** l(x) = x²   on   [1, 3]
- **Answer field(s):**
  - _(number)_ Average speed of the bag between 1 and 3 seconds (meters per second) → expected ≈ 4
  - _(number)_ The moment between 1 and 3 seconds when the bag matches its average speed (seconds) → expected ≈ 2
- **Hint:** Find the overall average first, then find where the instantaneous speed equals that average.
- _Rewrite:_ applied

### 3. Average vs. instantaneous `a1-avg-inst`

- **Title:** Bank Account Growth
- **Prompt:** Lucas keeps a careful record of his bank account, which is measured in thousands of dollars. His balance after t months can be found using the formula below. In the first two months, his younger sister Maya gets a job at a café and sometimes saves with him, but he only tracks his own total. According to the formula, from the start until the end of month 2, by how many thousands of dollars did Lucas’s balance go up for each month on average? At exactly t = 2 months, how quickly was Lucas's balance increasing, according to the formula?
- **Given:** f(t) = 2t² + 7t
- **Answer field(s):**
  - _(number)_ Lucas's average account increase per month, in thousands of dollars per month → expected ≈ 11
  - _(number)_ Lucas's balance increase at month 2, in thousands of dollars per month → expected ≈ 15
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

### 4. Two factors multiplied `a4-product`

- **Title:** Supplier Order Costs
- **Prompt:** A local supplier charges for each order so that the total cost, in dollars, depends both on how many items you order and the specific formula below. Suppose one customer buys 10 items, and a different customer orders a custom set of shirts for a school club, but the prices per item are the same for both. According to the rule below, if the order size changes, how does the resulting total cost respond as you vary x, where x is the number of items ordered?
- **Given:** C(x) = (2x + 1)(5x + 1)
- **Answer field(s):**
  - _(expression)_ How the total cost in dollars changes as an expression in x → **20x + 7**
- **Hint:** Change one factor at a time while holding the other fixed, then add the two pieces.
- _Rewrite:_ applied

### 5. Doubling / tripling `a4-base`

- **Title:** Tracking the Growth of a Forest Mushroom Patch
- **Prompt:** A biologist is monitoring the size of a mushroom patch on the forest floor. The patch’s size, measured in rings, changes each week according to the rule below, where x stands for the number of weeks that have passed. Nearby, a family of squirrels buries 18 nuts in the ground each week, but the biologist is focused on the mushrooms. According to the formula, for the week after three weeks have passed, which choice below is closest to the pace at which the patch’s size is increasing at that moment?
- **Given:** F(x) = 2^(x² − x − 6)
- **Answer field(s):**
  - _(choice)_ The increase in number of rings per week when three weeks have passed → **3.5** (choose from 5, 3.5)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ applied

### 6. Fastest rate `a1-fastest`

- **Title:** App Popularity Surge
- **Prompt:** Over several days, a tech studio keeps track of how many thousands of people have installed their new app by the close of each day. The formula below shows the running total after t days. On one particular day, their office ordered 10 large pizzas to celebrate, though this didn't affect the download numbers. According to the formula, on which of the following days (1, 2, 3, or 4) did the total number of app downloads increase the most in a single day?
- **Given:** Q(t) = -t³ + 6t² + 11t
- **Answer field(s):**
  - _(choice)_ Day when the app downloads jumped by the largest amount (days) → **2** (choose from 1, 2, 4, 3)
- **Hint:** Work out how fast it's moving at each listed moment, then compare them.
- _Rewrite:_ applied

### 7. Two factors multiplied `a4-product`

- **Title:** Sprinkler System Water Tracker
- **Prompt:** The Wilson family sets up a new sprinkler system that waters their entire lawn every morning. The total water used each day depends on how many minutes the sprinklers run, as given by the W(x) formula below, where x is the number of minutes. One morning, the Wilsons decide to water the lawn for longer than usual because their neighbor's dog dug up a patch on the north side. If the system's starting pressure is set at 7.5 bars even though technically 5 would do, how quickly does the water usage increase as the number of minutes the sprinklers run goes up? Use the formula below.
- **Given:** W(x) = (3x² + 5x + 1)(4x² + 3x + 2)
- **Answer field(s):**
  - _(expression)_ Change in water usage per minute, as an expression in x, in liters per minute → **48x³ + 87x² + 50x + 13**
- **Hint:** Change one factor at a time while holding the other fixed, then add the two pieces.
- _Rewrite:_ applied

### 8. Power rule `a2-power`

- **Title:** Making Pizza Pies
- **Prompt:** Tony owns a busy pizza shop, and the cost of dough (measured in dollars) for each pizza depends on the radius r (in inches) following the formula you see below. Tony wants to add new 6-inch radius pizzas to his menu alongside his popular 10-inch ones, and he's curious: When r is 6, how does the dough cost change if he makes each pizza just a little bit bigger? (For reference, the cheese he uses comes in 7-ounce packages, but Tony is only interested in the dough cost for now.)
- **Given:** C(r) = 0.5r²
- **Answer field(s):**
  - _(number)_ Change in dough cost per additional inch of pizza radius, at r = 6 (dollars per inch) → expected ≈ 6
- **Hint:** How fast is this single term growing right at that input?
- _Rewrite:_ applied

### 9. Related rates `a3-related`

- **Title:** Expanding Lantern at a Night Market
- **Prompt:** At an outdoor night market, a performer is inflating a glowing paper lantern that always keeps its spherical shape as it gets larger. Presently, the radius of the lantern is 11 cm, and it is growing steadily at 0.25 cm each second. There are also 15 other lanterns hanging nearby, but only this one is expanding. According to the formula below, how quickly is the volume of this lantern increasing at this instant?
- **Given:** A sphere of radius r has volume V = (4/3)·π·r³. At this moment the radius = 11 cm and grows by 0.25 cm/s.
- **Answer field(s):**
  - _(number)_ Increase in lantern's volume right now (cubic cm per second) → expected ≈ 380.1327
- **Hint:** Connect the size to the length that’s changing, then bring in the steady growth you were given.
- _Rewrite:_ applied

### 10. Pinning down a rate `a1-instant-limit`

- **Title:** Speed Analysis on the Coastal Expressway
- **Prompt:** On a coastal highway, a car is participating in a time trial, carefully monitoring its speed (in kilometres per hour) each second. The driver uses the formula below to check how fast they're going at any moment. To figure out what instantly happens at exactly t = 3 seconds into the run, look at the chart showing how the car's speed over shrinking time frames, all starting from 3 seconds, changes. The roadside temperature is 19°C. Based on the given information and formula, what is happening with the car's speed right at 3 seconds?
- **Given:** f(t) = 0.5t² + 3t
Average over [3, 4] = 6.5 · over [3, 3.5] = 6.25 · over [3, 3.1] = 6.05
- **Answer field(s):**
  - _(number)_ The car's change in speed at 3 seconds, in kilometres per hour per second → expected ≈ 6
- **Hint:** Notice the value the shrinking-window averages are closing in on.
- _Rewrite:_ applied

## Level 10

### 1. Average vs. instantaneous `a1-avg-inst`

- **Title:** Bike Ride on Country Roads
- **Prompt:** On her weekend ride, Rae cycles along country roads and keeps track using the formula below, which gives her total distance so far (in miles) after t hours. She left her house at 9:00 AM, took a quick 10-minute snack break exactly at the 1-hour mark, and passed a tractor going in the opposite direction at mile 7. By the end of her fourth hour of riding, how many miles from home had she covered in just the time period after her second hour and before her fourth hour? Also, at the four-hour mark exactly, what was the number of miles she was adding to her trip for every next hour spent on her bike?
- **Given:** f(t) = t² + 5t
- **Answer field(s):**
  - _(number)_ Distance added between the second and fourth hours (miles per hour) → expected ≈ 11
  - _(number)_ Miles added to the trip by each hour on the road at the four-hour mark (miles per hour) → expected ≈ 13
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

### 2. Turning points `a1-turning`

- **Title:** Moments of Change in Ticket Availability at The Amphitheater
- **Prompt:** The Golden Valley Amphitheater is hosting a major concert series and is tracking the number of unsold tickets each day after tickets go on sale. The daily count of unsold tickets since sales opened is given by the formula below, where t is the number of days since sales began. On opening day, the amphitheater has a 40-person staff preparing for the show, and the concert's lighting system was upgraded last year for $15,000. According to the rule below, at what point will the amphitheater notice that their stash of unsold tickets briefly stops growing and reaches its maximum size, as well as when it briefly stops shrinking and hits its lowest size?
- **Given:** f(t) = 2t³ − 9t² + 12t
- **Answer field(s):**
  - _(number)_ Day when unsold tickets reach their biggest number → expected ≈ 1
  - _(number)_ Day when unsold tickets hit their smallest number → expected ≈ 2
- **Hint:** Find the moments it briefly stops moving, then decide which is a high point and which is a low point.
- _Rewrite:_ applied

### 3. Doubling / tripling `a4-base`

- **Title:** Preparing Sourdough for the Market
- **Prompt:** Alex is feeding the sourdough starter in a large glass jar at her bakery. Each morning, she checks the amount using the formula below, where x is the number of days since she began the batch. At the start of day 2, she tasted a small spoonful for quality and noticed her electric scale weighs 3 pounds. Later that day, she wonders how much more starter she gets for each passing day, right on day 2, since she needs enough for the farmers' market, which usually brings in about 110 customers. Use the rule below to figure out exactly what she's wondering.
- **Given:** B(x) = 2^(x² + x − 6)
- **Answer field(s):**
  - _(choice)_ cups of added starter per one day right at day 2 → **3.5** (choose from 3.5, 5)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ applied

### 4. Pinning down a rate `a1-instant-limit`

- **Title:** Roller Coaster Bridge Sensor
- **Prompt:** During a morning test before the theme park opens, an engineer checks a roller coaster's safety system. The car passes a special bridge that triggers a camera exactly 2 seconds after release. Sensors on the car measure its drop, following the formula below. That morning, a worker notes the platform height is 4.5 metres above the loading bay, and the camera above the bridge weighs 8 kg. At the instant the car passes under the camera, the system needs to know what measurement will help confirm the fault sensors are working correctly. Use the formula provided to figure out this key measurement just as the car reaches the bridge, not over an interval.
- **Given:** f(t) = 0.5t²
Average over [2, 3] = 2.5 · over [2, 2.5] = 2.25 · over [2, 2.1] = 2.05
- **Answer field(s):**
  - _(number)_ Car's changing drop distance at the camera, in metres/second → expected ≈ 2
- **Hint:** Notice the value the shrinking-window averages are closing in on.
- _Rewrite:_ applied

### 5. Two factors multiplied `a4-product`

- **Title:** Ordering Banners for a Festival
- **Prompt:** The festival committee is preparing for a parade and is buying large banners from a supplier. The total cost for their order depends on the number of banners they purchase, x, according to the formula below. This year they expect to have somewhere between 8 and 20 parade floats, and each float needs its own banner. The committee also plans to rent 15 extra flagpoles for the entrance, and the parade route is 2 miles long. According to the formula below, at what point in the order process is the jump in total cost with each new banner largest?
- **Given:** C(x) = (4x + 5)(5x + 5)
- **Answer field(s):**
  - _(expression)_ The greatest extra total cost (in dollars) per additional banner, as an expression in x → **40x + 45**
- **Hint:** Change one factor at a time while holding the other fixed, then add the two pieces.
- _Rewrite:_ applied

### 6. Velocity and acceleration `a3-accel`

- **Title:** Firehouse Pole Elevator Emergency Drill
- **Prompt:** During a training drill at the firehouse, the pole lift is used to bring supplies up from storage. The formula below shows how far the lift rises after t seconds have passed. Today, the chief is monitoring the lift's performance. At 2 seconds after the lift starts moving, one of the rookies suddenly gets distracted looking at a glass trophy cabinet worth $500 and accidentally drops a walkie-talkie that cost $80. At the instant this happens, the chief wants to know exactly when the nervous rookie will feel the strongest jolt as the lift changes its movement. Use the formula below to work out what the chief should expect.
- **Given:** s(t) = 2t³ + 5t² + 4t  (metres, with t in seconds).
- **Answer field(s):**
  - _(number)_ The strength, in metres per second each second, of the lift's change in movement at 2 seconds → expected ≈ 34
- **Hint:** First find how its speed is changing, then read that off at the given moment.
- _Rewrite:_ applied

### 7. Related rates `a3-related`

- **Title:** Flying a Weather Balloon
- **Prompt:** During a field experiment, an engineer releases a weather balloon that stays perfectly spherical as it floats upward. She records that the radius of the balloon is 11 cm at a particular moment, and the radius is consistently increasing by 1 cm each second at that time. At that same moment, the balloon is 130 meters above the ground, and the temperature outside is 19°C. According to the formula below, what result should she expect for the change in the balloon's volume at that exact instant?
- **Given:** A sphere of radius r has volume V = (4/3)·π·r³. At this moment the radius = 11 cm and grows by 1 cm/s.
- **Answer field(s):**
  - _(number)_ Change in balloon volume at this moment (cubic centimeters per second) → expected ≈ 1520.5308
- **Hint:** Connect the size to the length that’s changing, then bring in the steady growth you were given.
- _Rewrite:_ applied

### 8. A value that must occur `a3-ivt`

- **Title:** Amplifier Tuning Scene
- **Prompt:** During a sound check, a technician slowly turns the dial on a music amplifier from one end to the other. As the dial moves, the amplifier's signal level follows the formula below, with values going from x = 0 up to x = 3. The speakers themselves can handle up to 15 units of volume, and there's a recording timer set for 10 minutes. Based on the formula below, what signal level reading is certain to have appeared on the display at least once as the dial was being turned?
- **Given:** f(x) = x², swept from x = 0 to x = 3.
- **Answer field(s):**
  - _(choice)_ Signal level value shown on the display → **5** (choose from -1, 5, 11)
- **Hint:** Only values that fall between the starting and ending readings are guaranteed.
- _Rewrite:_ applied

### 9. A value that must occur `a3-ivt`

- **Title:** Audio Mixer Signal Passing through a Specific Level
- **Prompt:** During a live concert, a sound engineer smoothly slides the control from start to finish to shape the music’s intensity, with the signal level f(x) adjusting as described by the formula below (where x is the slider’s position). The slider moves from x = 0 to x = 3 without skipping any setting. The mixing board also lights up with a blue LED at a slider setting of x = 2.5 and has a built-in digital timer that starts at 10 seconds. According to the rule below, which signal reading must the system have reached during this sweep?
- **Given:** f(x) = -x² + 8x, swept from x = 0 to x = 3.
- **Answer field(s):**
  - _(choice)_ Signal level the system must have reached (in units) → **14** (choose from 14, -2, 16)
- **Hint:** Only values that fall between the starting and ending readings are guaranteed.
- _Rewrite:_ applied

### 10. Chain rule `a2-chain`

- **Title:** Racing Game Nitro Meter
- **Prompt:** In the racing game Velocity Drift, the amount of nitro energy stored depends on the boost dial setting, x, and is described by the rule below. As you steer your car around the hairpin turn at 37 mph, the fuel gauge drops to 42%, but what really matters is knowing when the change in stored nitro energy gets extreme. Based on the formula below, at what setting of the boost dial does the nitro energy respond most sharply as you tweak x?
- **Given:** N(x) = (x + 4)²
- **Answer field(s):**
  - _(expression)_ Change in stored nitro energy as an expression in x (no units) → **2x + 8**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

## Level 11

### 1. Turning points `a1-turning`

- **Title:** Timing a Startup's Cash Flow Highs and Lows
- **Prompt:** Victoria helps manage a small startup that keeps careful track of its cash balance each month. They received $35,000 in angel investment, and their rent is $2,800 each month. The startup's cash balance (in thousands of dollars) is given for each month after launch by the formula below. Over the year, Victoria notices their balance increases, then dips, then rises again. According to the formula, at which month does their cash briefly pause at its highest amount before starting to decrease, and at which month does it pause at the lowest amount before starting to rise again?
- **Given:** f(t) = 2t³ − 21t² + 72t
- **Answer field(s):**
  - _(number)_ Month when the cash balance briefly reaches its highest point → expected ≈ 3
  - _(number)_ Month when the cash balance briefly reaches its lowest point → expected ≈ 4
- **Hint:** Find the moments it briefly stops moving, then decide which is a high point and which is a low point.
- _Rewrite:_ applied

### 2. Matching the average `a2-mvt`

- **Title:** Tracking a Dog Walker's Jog
- **Prompt:** A dog walker is out for a morning jogging session, walking a young golden retriever. The total distance they've covered on foot (in meters) after x seconds is given by the rule below for all times between x = 0 and x = 2 seconds. The walker checks her heart rate monitor and notes her pulse reached 110 beats per minute near the park entrance, and she remembers she bought a bottle of water for $1.50 before starting. Over this two-second stretch, what was the average pace (in how the distance changed per second), and at exactly which second did her pace match the average?
- **Given:** a(x) = x²   on   [0, 2]
- **Answer field(s):**
  - _(number)_ Average pace (meters per second) → expected ≈ 2
  - _(number)_ Time (seconds) when her walking pace equals the average → expected ≈ 1
- **Hint:** Find the overall average first, then find where the instantaneous speed equals that average.
- _Rewrite:_ applied

### 3. Combining the rules `a2-combine`

- **Title:** Adjusting Power on an Electric Road Trip
- **Prompt:** Sara and Louisa are driving along the coast in their hybrid car on vacation. The car's power changes as they adjust a control marked x, following the formula below. On a stretch with a speed limit of 50 mph and passing several scenic viewpoints, they're curious about how the power responds to changes in this control. Using the formula below, determine how the car's total power responds as the setting x increases.
- **Given:** P(x) = (2x + 2)³ + 2x²
- **Answer field(s):**
  - _(expression)_ How quickly the car's total power increases (in kilowatts per unit of x), as an expression in x → **24x² + 52x + 24**
- **Hint:** Break it into two pieces, find how fast each changes, then add.
- _Rewrite:_ applied

### 4. Sum rule `a2-sum`

- **Title:** Subscriber Growth Across New Countries
- **Prompt:** When a streaming company brings its platform to new markets each year, its total subscribers change according to the formula below. For example, last year, they spent $2 million on an international marketing campaign and entered 9 new languages, but those statistics may not matter for your answer. Suppose at level x, the company is available in x different countries. Based on the formula below, how much does launching in one more country increase the total user base at level x?
- **Given:** S(x) = 6x³ + x² + 6x + 3
- **Answer field(s):**
  - _(expression)_ Additional subscribers per country at level x (as an expression in x) → **18x² + 2x + 6**
- **Hint:** Handle each term on its own, then add the pieces.
- _Rewrite:_ applied

### 5. Sum rule `a2-sum`

- **Title:** Menu Additions at Morning Brew
- **Prompt:** Morning Brew, a busy coffee shop, tracks how its daily sales change with the launch of new menu drinks. According to the formula below, the shop owner tallies the number of cups sold daily when x new drinks are available. Yesterday, 120 people stopped by just for bagels, and the espresso machine broke down for 25 minutes in the afternoon. If you want to know how much more popular the shop gets for every new drink option added when there are x new drinks, what would you use?
- **Given:** O(x) = 6x³ + 2x² + 3x + 9
- **Answer field(s):**
  - _(expression)_ Cups added each day for one more new drink, as an expression in x → **18x² + 4x + 3**
- **Hint:** Handle each term on its own, then add the pieces.
- _Rewrite:_ applied

### 6. Doubling / tripling `a4-base`

- **Title:** Tracking the Sourdough's Growth
- **Prompt:** Maria starts a jar of sourdough starter for her bakery, and the amount inside (in cups) changes each day according to the formula below, where x is how many days have passed since she mixed the first batch. On the second morning, she adds a pinch of salt to the jar, and after 7 days she plans to bake her bread. Using the rule below, figure out how quickly the amount of starter is increasing right at the moment that 2 days have passed since she started it.
- **Given:** B(x) = 3^(x² + x − 6)
- **Answer field(s):**
  - _(choice)_ Increase in sourdough starter per day when 2 days have passed (cups per day) → **5.5** (choose from 5.5, 10, 5)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ applied

### 7. Pinning down a rate `a1-instant-limit`

- **Title:** Checking Acceleration on a Family Road Trip
- **Prompt:** The Aziz family is on a long road trip to visit their cousins, having already covered 62 kilometres after 2 seconds on the highway. Their car's dashboard sensor tracks the speed using the rule below, where f(t) gives the car's speed in kilometres per hour after t seconds. While passing a blue delivery truck going 74 kilometres per hour, they wonder what the car's speed is doing exactly at the moment t = 2 seconds. Use the formula below and the table of averages to answer the question.
- **Given:** f(t) = 0.5t² + 4t
Average over [2, 3] = 6.5 · over [2, 2.5] = 6.25 · over [2, 2.1] = 6.05
- **Answer field(s):**
  - _(number)_ Change in speed per second at 2 seconds (in km/h per second) → expected ≈ 6
- **Hint:** Notice the value the shrinking-window averages are closing in on.
- _Rewrite:_ applied

### 8. Doubling / tripling `a4-base`

- **Title:** Tracking a Growing Subscriber Base
- **Prompt:** Lin manages an online newsletter, which she launched a few weeks ago. Each week, subscribers can either sign up or leave, so her total count keeps changing. There's a formula below that shows exactly how many subscribers Lin has after x weeks. On the day the list hit 80 newsletter issues published and just as they also reached their first big sponsor, Lin wants to understand the pace of her subscriber growth. Based on the formula below, what is the number of new subscribers she is gaining for each week precisely when it has been 1 week since launch?
- **Given:** S(x) = 2^(x² + x − 2)
- **Answer field(s):**
  - _(choice)_ number of new subscribers per week when exactly 1 week has passed → **2.1** (choose from 3, 2.1)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ applied

### 9. Combining the rules `a2-combine`

- **Title:** Monitoring Robot's Energy Fluctuations
- **Prompt:** A technician is setting up a factory robot that assembles small gadgets. This robot runs a production routine in which the total energy it requires (in joules) depends on a control setting, x, as described by the rule below. In the same process, each gadget being assembled weighs 45 grams and the conveyor belt moving parts next to the robot runs at 2 meters per second. When the technician prepares to optimize the assembly, what should they use to summarize how the robot’s total energy shifts as the control setting x increases?
- **Given:** E(x) = (3x + 3)³ + 3x³
- **Answer field(s):**
  - _(expression)_ Change in the robot’s total energy (in joules) as an expression in x → **90x² + 162x + 81**
- **Hint:** Break it into two pieces, find how fast each changes, then add.
- _Rewrite:_ applied

### 10. Fastest rate `a1-fastest`

- **Title:** Volunteers Track Fundraiser Progress
- **Prompt:** At a local charity event, a group of volunteers watches how their donation total grows each day. They keep a chart based on the rule below, where Q(t) shows the total amount raised (in thousands of dollars) by the end of each day, and t is the number of days since the event began. On the third day, they celebrate by handing out 60 tote bags to donors, and by the end of the fourth day, they have received 15 boxes of donated clothes. According to the rule below, for which value of t (1, 2, 3, or 4) was the total collected money increasing the most rapidly?
- **Given:** Q(t) = -t³ + 6t² + 5t
- **Answer field(s):**
  - _(choice)_ The day the team raised money at the fastest pace (days) → **2** (choose from 3, 4, 2, 1)
- **Hint:** Work out how fast it's moving at each listed moment, then compare them.
- _Rewrite:_ applied

## Level 12

### 1. Pinning down a rate `a1-instant-limit`

- **Title:** Measuring River Depth Changes
- **Prompt:** During a heavy downpour, rangers monitor the depth of a river, measured in metres, after t minutes from when rainfall began. They keep track of how the river is rising using the formula below. For their analysis, they calculate the river's average rise per minute over different intervals starting at the 2-minute mark: over the first 1 minute (from 2 to 3 minutes) it averages 3.5 metres per minute, between 2 to 2.5 minutes it's 3.25, and between 2 and 2.1 minutes it's 3.05. While recording these numbers, one of the rangers notes that the river's width at the beginning of the rain was 12 metres and that a nearby thermometer reads 18°C. What pace is the river's depth increasing at the precise moment t = 2 minutes, in metres per minute?
- **Given:** f(t) = 0.5t² + t
Average over [2, 3] = 3.5 · over [2, 2.5] = 3.25 · over [2, 2.1] = 3.05
- **Answer field(s):**
  - _(number)_ River depth increase at t = 2 minutes (metres per minute) → expected ≈ 3
- **Hint:** Notice the value the shrinking-window averages are closing in on.
- _Rewrite:_ applied

### 2. Natural-log response `a4-log`

- **Title:** Gift Card Shopping Spree
- **Prompt:** Amanda is shopping with a prepaid gift card. She notices that as she spends more, the value she feels she is getting (measured in points) follows the formula below, where x is the dollar amount she has spent so far. Last weekend she spent $14 on coffee and $20 on groceries before this trip. When Amanda reaches $1 spent during this visit, how much are her perceived value points increasing per extra dollar spent?
- **Given:** V(x) = ln(x² − x + 1)
- **Answer field(s):**
  - _(number)_ increase in perceived value points per extra dollar at $1 spent → expected ≈ 1
- **Hint:** Compare how fast the inside is moving to how big the inside is at that moment.
- _Rewrite:_ applied

### 3. Average vs. instantaneous `a1-avg-inst`

- **Title:** Tracking a Viral Video's Popularity
- **Prompt:** Mei uploads a new video and wants to keep track of how it's doing. She notes the total number of views on each day, following the rule shown below. Between the first and third days, Mei's pet cat appears in another video that gets 550 likes, and her microphone cable arrives two days late. Based on the formula, what is the total change in views the video gets per day, on average, from day 1 to day 3? Also, how quickly are the views climbing right at the end of her third day online?
- **Given:** f(t) = 2t² + 5t
- **Answer field(s):**
  - _(number)_ Average daily change in views from day 1 to day 3 (views per day) → expected ≈ 13
  - _(number)_ Views added per day on day 3 (views per day) → expected ≈ 17
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

### 4. Doubling / tripling `a4-base`

- **Title:** Counting More Rabbits
- **Prompt:** In a large meadow, the number of rabbits follows the rule below, where x stands for time in years since counting began. At the same time, a pond in the meadow holds 15 ducks, and a nearby hill has 28 squirrels. If you focus just on the rabbits, by the end of exactly one year, how quickly is the rabbit population changing, using the rule given for rabbits?
- **Given:** P(x) = 2^(x² + 3x − 4)
- **Answer field(s):**
  - _(choice)_ rabbits gained or lost after exactly one year (in rabbits per year) → **3.5** (choose from 5, 3.5)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ applied

### 5. Turning points `a1-turning`

- **Title:** Drone Flight Experiment
- **Prompt:** During a drone testing session, an engineer launches a drone and records its height every second to analyze its flight path. The height of the drone after t seconds can be determined by the formula below. In this test session, another drone started recording temperature readings three minutes before the test began, and the controller noted that a balloon floating nearby reached a maximum height of 11 metres during the setup. Using the formula, after how many seconds does the test drone pause at its highest point, and after how many seconds does it pause at its lowest point?
- **Given:** f(t) = 2t³ − 15t² + 24t
- **Answer field(s):**
  - _(number)_ Time (in seconds) when the drone pauses at its highest point → expected ≈ 1
  - _(number)_ Time (in seconds) when the drone pauses at its lowest point → expected ≈ 4
- **Hint:** Find the moments it briefly stops moving, then decide which is a high point and which is a low point.
- _Rewrite:_ applied

### 6. Turning points `a1-turning`

- **Title:** Ticket Booth Mystery at the Concert Venue
- **Prompt:** At a concert venue, tickets for a special show are being tracked day by day. Each day, the number of unsold tickets is recorded according to the formula below, where t is the number of days since sales started. On the first day, employees decorated 80 seats with balloons, and on the fifth day, they ran out of parking passes. Determine which day sales hit their highest point of unsold tickets and then which day sees the lowest point of unsold tickets before the number starts to climb again. Use the formula below to figure out on what days these turning points happen.
- **Given:** f(t) = 2t³ − 9t² + 12t
- **Answer field(s):**
  - _(number)_ Day when unsold tickets reach their highest count (in days) → expected ≈ 1
  - _(number)_ Day when unsold tickets reach their lowest count (in days) → expected ≈ 2
- **Hint:** Find the moments it briefly stops moving, then decide which is a high point and which is a low point.
- _Rewrite:_ applied

### 7. A value that must occur `a3-ivt`

- **Title:** Tuning a Radio Signal
- **Prompt:** Emma is calibrating a vintage radio by turning the main dial smoothly, adjusting the frequency level shown by the formula below as she moves the knob from the starting position x = 0 to x = 3. The radio also tracks temperature, which starts at 24°C in the room and displays the signal strength on a screen next to a timer that counts upward starting at 15 seconds. At some moment as she steadily turns the dial, Emma wonders which signal level value the display is guaranteed to have passed through between her start and finish.
- **Given:** f(x) = x² + 1, swept from x = 0 to x = 3.
- **Answer field(s):**
  - _(choice)_ Signal level the radio must have shown at some point → **2** (choose from 12, 2, 0)
- **Hint:** Only values that fall between the starting and ending readings are guaranteed.
- _Rewrite:_ applied

### 8. Doubling / tripling `a4-base`

- **Title:** Rabbit Population Growth in the Meadow
- **Prompt:** A biologist is tracking a colony of rabbits living in a meadow. The rabbit population changes over time as described by the formula below, where x is the number of years since she began her study. She notes that in the first year, there were 2 foxes frequently seen nearby, and the meadow is about 12 acres in size. According to the formula, how quickly is the rabbit population increasing exactly one year into her study?
- **Given:** P(x) = 2^(x² + 3x − 4)
- **Answer field(s):**
  - _(choice)_ Number of new rabbits added per year at x = 1 → **3.5** (choose from 5, 3.5)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ applied

### 9. Velocity and acceleration `a3-accel`

- **Title:** Rising in the View Tower
- **Prompt:** A glass elevator at the city observation tower propels visitors upwards past mirrored walls. Its position after t seconds is given by the formula below, where s(t) is the total height climbed in metres and t is in seconds. During one sunrise ride, the announcer says the elevator can hold up to 14 adults or 20 children at once, and today’s first trip stopped after covering 200 metres. At the instant 3 seconds have passed since the doors closed and the pod started moving upward, how quickly is it gaining speed?
- **Given:** s(t) = 2t³ + 3t²  (metres, with t in seconds).
- **Answer field(s):**
  - _(number)_ How much the elevator's speed is increasing at t = 3 seconds, in metres per second squared → expected ≈ 42
- **Hint:** First find how its speed is changing, then read that off at the given moment.
- _Rewrite:_ applied

### 10. Average vs. instantaneous `a1-avg-inst`

- **Title:** Tracking Video View Growth
- **Prompt:** A content creator uploads a video to her channel. Each day, she charts the total number of views using the formula shown below, where t is the number of days since the video went public. During those first few days, her friends are also releasing videos — one of them gets 28 shares in its first day and another earns 67 likes over three days. After two full days, she's interested in how viewers are finding her video compared to the overall period so far. Use the given rule to find the change in her video's total views for the whole period from day zero through day two, as well as how much it is changing as of the end of day two still using that total-views formula.
- **Given:** f(t) = t² + 12t
- **Answer field(s):**
  - _(number)_ change in her video's total views over the first two days (views per day) → expected ≈ 14
  - _(number)_ change in her video's total views exactly at the two-day mark (views per day) → expected ≈ 16
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

## Level 13

### 1. Power rule `a2-power`

- **Title:** Sunflower Garden Shade
- **Prompt:** Sam is measuring a patch of sunflowers after a summer thunderstorm has left puddles in the grass and snapped a few stems. He knows that the flower heads cast a shaded spot on the soil, and the amount of shade (in square meters) changes as the sunflowers grow taller according to the rule below. When one sunflower reaches a height of 7 meters, Sam stops to eat a sandwich and notices sparrows hopping nearby and a tennis ball stuck on the garden fence. He wants to know, for each extra meter the sunflower grows starting at 7 meters tall, how many more square meters of land will be covered by shade at that instant.
- **Given:** S(h) = h²
- **Answer field(s):**
  - _(number)_ extra square meters covered per meter of height, when h = 7 → expected ≈ 14
- **Hint:** How fast is this single term growing right at that input?
- _Rewrite:_ applied

### 2. Power rule `a2-power`

- **Title:** Widening the Community Pool
- **Prompt:** Every summer, Norah's crew repaints the local pool as families help widen it so more swimmers can fit. This year, the city council plans to expand the pool further. The heads of the project look up the cost of paint, which depends on how wide the pool is, using the rule below. The new width will be right at 3 meters before the next section is poured. If the crew completes this next 1-meter section, a bunch of basketballs sink to the pool floor, and an extra case of juice is delivered to the workers. Just as they are about to reach 3 meters, how much more will the painting cost rise for every new meter that’s added at that moment, according to the rule?
- **Given:** P(w) = 2w³
- **Answer field(s):**
  - _(number)_ extra dollars per meter added (when width is 3 meters) → expected ≈ 54
- **Hint:** How fast is this single term growing right at that input?
- _Rewrite:_ applied

### 3. Two factors multiplied `a4-product`

- **Title:** Water usage
- **Prompt:** A household: its water usage (in liters) is the flow rate times the running time, shown below as a function of x. Write how fast its water usage changes as x grows.
- **Given:** W(x) = (2x + 4)(3x² + x + 2)
- **Answer field(s):**
  - _(expression)_ How fast it changes as x grows (expression in x) → **18x² + 28x + 8**
- **Hint:** Change one factor at a time while holding the other fixed, then add the two pieces.
- _Rewrite:_ fell back to base

### 4. Related rates `a3-related`

- **Title:** Making Lemon Soda Fizz
- **Prompt:** Emma is making fresh lemon soda for her summer lemonade stand, adding carbonated water through a special fountain that forms growing bubbles inside each glass. She carefully tracks a large bubble that stays perfectly spherical while expanding. At this moment, its radius is exactly 6 cm, and she notices it grows by 0.1 cm each second. Emma also counts that her stand sold 23 glasses in the last hour, each glass contains 310 ml of lemonade, and there are 5 lemons left in her basket. According to the bubble volume formula below, how much more space, in cubic centimeters, is the large bubble taking up each second right now?
- **Given:** A sphere of radius r has volume V = (4/3)·π·r³. At this moment the radius = 6 cm and grows by 0.1 cm/s.
- **Answer field(s):**
  - _(number)_ cubic centimeters per second the big bubble is expanding right now → expected ≈ 45.2389
- **Hint:** Connect the size to the length that’s changing, then bring in the steady growth you were given.
- _Rewrite:_ applied

### 5. Fastest rate `a1-fastest`

- **Title:** Busiest Growth at the Museum
- **Prompt:** Four days after displaying a world-famous art piece, the museum records the ongoing total of visitors using the rule below, where Q(t) is the cumulative number (in hundreds) by the end of each day t. There is a coffee shop in the museum that for these same days sold 65, 71, 81, and 78 pastries per day, while the souvenir shop earned $480 on the third day. On which day, out of 1, 2, 3, and 4, did the museum's total visitor count grow the fastest?
- **Given:** Q(t) = -t³ + 6t² + 6t
- **Answer field(s):**
  - _(choice)_ day when growth was fastest (days) → **2** (choose from 1, 2, 3, 4)
- **Hint:** Work out how fast it's moving at each listed moment, then compare them.
- _Rewrite:_ applied

### 6. Doubling / tripling `a4-base`

- **Title:** Rapid Algae Growth in the Aquarium
- **Prompt:** At the start of the week, Maya notices that the thin green layer of algae in her fish tank keeps getting thicker, although it still isn’t blocking the view of the orange castle decoration at the bottom. According to the rule below, where x is days since she began observing, the algae's thickness in millimeters follows the formula shown. Maya feeds her three goldfish every morning, each eating 0.2 grams of flakes per day, while the filter system runs nine hours daily and the tank is 80 centimeters wide. Right on the third day after she starts watching, she wants to know at what speed the algae layer is thickening.
- **Given:** L(x) = 3^(x² + 2x − 15)
- **Answer field(s):**
  - _(choice)_ millimeters per day at x = 3 → **8.8** (choose from 16, 8.8, 8)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ applied

### 7. Chain rule `a2-chain`

- **Title:** Testing Sunscreen Layers
- **Prompt:** Jordan, a skincare developer, is testing a new sunscreen by applying different layers. After each application, she carefully measures the protection level, which depends on the thickness of the coat x according to the formula below. While conducting the tests, Jordan notes the temperature is steady at 22°C, she uses a 120 ml bottle for all her trials, and her timer reads 45 seconds between coats. If a competitor asks, she wants to know how the protection level responds as she adjusts x based on the given formula.
- **Given:** P(x) = (4x + 4)³
- **Answer field(s):**
  - _(expression)_ change in protection per coat as an expression in x → **192x² + 384x + 192**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 8. Doubling / tripling `a4-base`

- **Title:** Snowballing newsletters
- **Prompt:** A newsletter list: the subscriber count (in subscribers) follows the rule below, where x is the elapsed time in weeks. Which value below is closest to how fast the subscriber count is growing right when x = 1?
- **Given:** S(x) = 3^(x² − 1)
- **Answer field(s):**
  - _(choice)_ Closest instantaneous growth right when x = 1 (subscribers per unit of x) → **2.2** (choose from 4, 2.2, 2)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ fell back to base

### 9. Turning points `a1-turning`

- **Title:** Stunt Drone's Dramatic Flight
- **Prompt:** For a public demonstration at the city park, a new stunt drone is launched. Its height above ground after t seconds follows the rule below. While performing, it first climbs, then dives low, and soars up again. During the routine, the commentator notes when the drone briefly hovers at its highest and lowest points before changing direction. The wind speed is a constant 15 km/h, the crowd counts 120 spectators, and the nearby clock tower is 40 meters tall. At which exact moments does the drone pause, one at its highest position and one at its lowest, before continuing its show?
- **Given:** f(t) = 2t³ − 21t² + 72t
- **Answer field(s):**
  - _(number)_ time at the highest point, seconds → expected ≈ 3
  - _(number)_ time at the lowest point, seconds → expected ≈ 4
- **Hint:** Find the moments it briefly stops moving, then decide which is a high point and which is a low point.
- _Rewrite:_ applied

### 10. Average vs. instantaneous `a1-avg-inst`

- **Title:** Bank Account Growth Story
- **Prompt:** Maya starts saving for a house, tracking her account balance (in thousands of dollars) month by month using the formula below. In the first three months, while planning for renovations in month four, Maya also receives a birthday cash gift of $800 and spends $450 on a new phone case. She notes a small monthly service fee of $3, which does not affect interest. According to the account balance rule below, what was her account's average monthly change during the first three months? Also, at the end of the third month, just before any new deposit, what was her account changing by each month at that very instant?
- **Given:** f(t) = t² + 5t
- **Answer field(s):**
  - _(number)_ average monthly change in balance (thousands of dollars/month) → expected ≈ 8
  - _(number)_ monthly change at month 3 (thousands of dollars/month) → expected ≈ 11
- **Hint:** One number compares the two endpoints; the other is how fast it's moving at that single instant.
- _Rewrite:_ applied

## Level 14

### 1. Fastest rate `a1-fastest`

- **Title:** Flood Control During Spring Rains
- **Prompt:** After a series of heavy spring rains, city engineers are monitoring the inflow of water into the Centennial Reservoir, which provides water for the entire city. Detailed sensors track the total amount of water entering the reservoir by the end of each second, using the formula below. While workers walk along the dam that is 225 meters long, a small boat drifts nearby at 1.5 km/h, and the old lighthouse across the water shines at 700 lumens through the thick fog. At one of these moments (t = 1, 2, 3, or 4 seconds), the inflow surged faster than at any other. Which moment was it?
- **Given:** Q(t) = -t³ + 6t² + 6t
- **Answer field(s):**
  - _(choice)_ t in seconds when the inflow climbed fastest → **2** (choose from 4, 1, 2, 3)
- **Hint:** Work out how fast it's moving at each listed moment, then compare them.
- _Rewrite:_ applied

### 2. Fastest rate `a1-fastest`

- **Title:** Max Rise After Dam Release
- **Prompt:** Volunteers at a riverside wildlife center are carefully watching as the water level changes each second after a dam release. Their station logs the overall increase in the river's height, following the rule below. At the 1-second mark, 16 fishers are spaced out along the bank; the water temperature measures 13°C, and a pair of birdwatchers record six different bird calls. For which second during those first four does the total rise in river height appear to be rising at its quickest?
- **Given:** Q(t) = -t³ + 9t² + 10t
- **Answer field(s):**
  - _(choice)_ second when total river rise increases fastest (s) → **3** (choose from 4, 3, 2, 1)
- **Hint:** Work out how fast it's moving at each listed moment, then compare them.
- _Rewrite:_ applied

### 3. Velocity and acceleration `a3-accel`

- **Title:** Countdown on the track
- **Prompt:** While testing a new electric go-kart, Callie races down a twisting outdoor track. Right after the timer passes 2 seconds, a squirrel darts in front of her on a distant curve, her pit crew clocks the wind gusting at 13 km/h, and her helmet radio crackles to life with background music set to volume 7. Using the formula below for distance in metres after t seconds, how hard is the go-kart starting to press Callie back against her seat right at t = 2 seconds?
- **Given:** s(t) = 2t³ + t² + 4t  (metres, with t in seconds).
- **Answer field(s):**
  - _(number)_ backward push on Callie at t = 2 s (m/s²) → expected ≈ 26
- **Hint:** First find how its speed is changing, then read that off at the given moment.
- _Rewrite:_ applied

### 4. Chain rule `a2-chain`

- **Title:** Music Festival Crowd Growth
- **Prompt:** On the day before a major music festival, event organizers use the rule below to estimate how big the crowd will get when their online promo score reaches x. The promo team just finished setting up 25 wind spinners across the venue, and the sound check took almost exactly 48 minutes earlier. When the main act was last here, the crowd ordered 780 pizzas throughout the evening. Using the formula shown, at what pace will the expected size of this festival's crowd change as the promo score x increases?
- **Given:** C(x) = (2x + 2)²
- **Answer field(s):**
  - _(expression)_ the rate of estimated crowd growth as an expression in x → **8x + 8**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 5. Doubling / tripling `a4-base`

- **Title:** Sharing Surge on Social Media
- **Prompt:** On a popular social network, the number of times a campaign post is shared is tracked by the formula below, where x is the number of hours since launch. By the 3rd hour, a food truck nearby has sold 44 meals, three musicians have set up by the sidewalk, and the friend who started the post is waiting to meet two new coworkers. Use the rule below to tell which one of the following options best matches how much the number of times the post is shared is changing exactly 3 hours after launch.
- **Given:** N(x) = 2^(x² + x − 12)
- **Answer field(s):**
  - _(choice)_ shares per hour at 3 hours → **4.9** (choose from 4.9, 7)
- **Hint:** How fast the inside is moving sets the pace, then scale it by how strongly this base reacts to its exponent.
- _Rewrite:_ applied

### 6. Chain rule `a2-chain`

- **Title:** Nitro Level and the Racing Game
- **Prompt:** In a virtual racing challenge, each car is equipped with a nitro meter whose stored nitro energy, tracked by the formula below, depends on a boost dial set to x during the race. One evening, Taylor tries to get the nitro up quickly to burst ahead, adjusting the dial to x. He notices that at a dial position of 4, the car shifts gears at 90 mph and the tires grip at exactly 315 RPM. According to the formula below, how does the nitro energy’s increase depend on where he sets the dial?
- **Given:** N(x) = (4x + 3)²
- **Answer field(s):**
  - _(expression)_ change in nitro energy as an expression in x → **32x + 24**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 7. Matching the average `a2-mvt`

- **Title:** Rowing the Champion Stretch
- **Prompt:** Leah is competing in a rowing regatta, keeping her eye on the buoys as she starts her stretch. During a particular 4-second span, the distance (in meters) she's covered along the river after x seconds is described by the rule below. A small crowd of 30 fans cheers from the east bank as a bright red kayak floats by in the other direction at 1.8 meters per second. Leah's coach is tracking her from the grassy hilltop exactly 26 meters away from the river. Once this 4-second stretch is finished, Leah wants to know two things: How much distance she typically covered per second during these 4 seconds, and at what exact moment during the race her pace matched that typical speed, even just for an instant.
- **Given:** s(x) = 2x²   on   [0, 4]
- **Answer field(s):**
  - _(number)_ meters per second over 4 seconds → expected ≈ 8
  - _(number)_ seconds when pace equals that speed → expected ≈ 2
- **Hint:** Find the overall average first, then find where the instantaneous speed equals that average.
- _Rewrite:_ applied

### 8. A value that must occur `a3-ivt`

- **Title:** During the Valve Adjustment
- **Prompt:** At the local water plant, an engineer is adjusting a large valve to regulate the pressure inside a holding tank. As she smoothly turns the control handle from the lowest to the midway position, the gauge shows the tank pressure following the rule below—without any sudden drops or jumps. Over this adjustment, what specific tank pressure reading is certain to have shown up, if at different points she noticed the control handle temperature reach 46°F, the noise level in the room climb to 74 dB, and another smaller tank display a steady 18 psi?
- **Given:** f(x) = -x² + 7x, swept from x = 0 to x = 2.
- **Answer field(s):**
  - _(choice)_ pressure value (psi) → **2** (choose from 2, 12, -1)
- **Hint:** Only values that fall between the starting and ending readings are guaranteed.
- _Rewrite:_ applied

### 9. Two factors multiplied `a4-product`

- **Title:** Speedy Urban Deliveries
- **Prompt:** Ajay works for a delivery company shuttling packages from city offices to apartments each morning. The distance he drives (in kilometers) depends on the number of stops he’s assigned, following the formula below where x is the number of stops. Today, he set out from the depot at 6:45 AM, refueled with 28 liters of gas, and texted a friend about his weekend plans after the last stop. Using the rule below, how does the travel distance change as Ajay’s number of stops increases?
- **Given:** D(x) = (2x + 1)(5x + 4)
- **Answer field(s):**
  - _(expression)_ change in travel distance as an expression in x (km per stop) → **20x + 13**
- **Hint:** Change one factor at a time while holding the other fixed, then add the two pieces.
- _Rewrite:_ applied

### 10. Power rule `a2-power`

- **Title:** Kinetic energy
- **Prompt:** A lab cart: the kinetic energy (in joules) depends on the speed v (in meters per second) by the rule below. How fast is the kinetic energy rising right when v = 8?
- **Given:** E(v) = v²
- **Answer field(s):**
  - _(number)_ Extra joules per unit increase in speed (at v = 8) → expected ≈ 16
- **Hint:** How fast is this single term growing right at that input?
- _Rewrite:_ fell back to base

## Level 15

### 1. Chain rule `a2-chain`

- **Title:** Refueling the Nitro Car
- **Prompt:** During a championship race in Turbo Drift Arena, Taylor’s car stores nitro energy based on where she sets her boost dial, x, as shown in the formula below. The crew notes she already refilled her oil tank with 11 liters and swapped in a new air filter rated for up to 300 horsepower. Her top speed so far has been 174 mph. For any boost dial setting, what is the rate at which the stored nitro energy is changing with x, given by the formula?
- **Given:** N(x) = (x + 2)²
- **Answer field(s):**
  - _(expression)_ stored nitro energy as an expression in x → **2x + 4**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 2. Two factors multiplied `a4-product`

- **Title:** New novels and a shipment deadline
- **Prompt:** Gareth needs to arrange a delivery for a mix of new release novels heading to a big city book fair. Each box holds books weighing according to the formula below, where x is the number of boxes in the shipment. The delivery truck is scheduled to arrive in 9 hours and must carry no more than 2,000 kilograms, but Gareth is also waiting for 25 promotional posters and has a last-minute email about 16 more poetry books possibly being added. According to the formula below, as the number of boxes x increases, how does the total shipment weight respond?
- **Given:** B(x) = (2x + 1)(x² + 2x)
- **Answer field(s):**
  - _(expression)_ change in shipment weight as x grows, as an expression in x → **6x² + 10x + 2**
- **Hint:** Change one factor at a time while holding the other fixed, then add the two pieces.
- _Rewrite:_ applied

### 3. Related rates `a3-related`

- **Title:** Tofu cube in broth
- **Prompt:** A swelling tofu cube keeps a perfect cube shape as it grows. Right now its edge is 6 mm and that edge grows at a steady 0.5 mm per second. How fast is its volume growing at this instant?
- **Given:** A cube with edge s has volume V = s³. At this moment the edge = 6 mm and grows by 0.5 mm/s.
- **Answer field(s):**
  - _(number)_ How fast the volume is growing right now → expected ≈ 54
- **Hint:** Connect the size to the length that’s changing, then bring in the steady growth you were given.
- _Rewrite:_ fell back to base

### 4. Pinning down a rate `a1-instant-limit`

- **Title:** Observing a Filling Water Tank
- **Prompt:** At a local community center, a staff member is monitoring a water tank in the back garden to make sure it stays filled for weekend events. They check its level in centimetres every few minutes using the formula below to predict how full the tank is after t minutes have passed. From their notes, whenever they compare the reading at exactly t = 3 with measurements after 4, 3.5, or 3.1 minutes, the difference in water levels per minute seems to keep getting closer to a certain value. There’s also a coffee machine in the staff room that brews 2 litres per cycle, a bird feeder near the tank that holds up to 450 grams of seed, and a nearby playground swing set that fits up to 5 kids at once. Based on the formula below, what exact value do the gradually shrinking differences settle on right at the instant 3 minutes has passed?
- **Given:** f(t) = t² + 2t
Average over [3, 4] = 9 · over [3, 3.5] = 8.5 · over [3, 3.1] = 8.1
- **Answer field(s):**
  - _(number)_ cm per minute at t = 3 → expected ≈ 8
- **Hint:** Notice the value the shrinking-window averages are closing in on.
- _Rewrite:_ applied

### 5. Velocity and acceleration `a3-accel`

- **Title:** Sled on a Precision Track
- **Prompt:** An engineer is testing an automated sled on a precision track. Its path is controlled so that the total distance it covers after t seconds is given by the formula below. The sled is being evaluated right as a delivery trolley drives parallel a few meters away with a steady load, and a wind speed monitor on the roof tracks a cross-breeze of 9 km/h throughout At the exact instant when the sled has been moving for 1 second, what is the rate at which its speed is increasing?
- **Given:** s(t) = t³  (metres, with t in seconds).
- **Answer field(s):**
  - _(number)_ increase in speed at 1 second (metres per second each second) → expected ≈ 6
- **Hint:** First find how its speed is changing, then read that off at the given moment.
- _Rewrite:_ applied

### 6. Chain rule `a2-chain`

- **Title:** Packed Tent Design Adjustments
- **Prompt:** Sarah works for a company that produces compact tents for backpackers. The team tracks the packed volume of each tent using the formula below, where x is the frame setting. During final checks, Sarah notices that most testers prefer a frame setting of 3, while some use 4 for extra headroom. On the busiest production day last month, 180 tents were assembled and packed. During testing afternoon, Sarah brewed coffee twice, making four cups each time. Based on the formula below, at any frame setting x, what does the change in packed volume look like as x varies?
- **Given:** V(x) = (4x + 1)³
- **Answer field(s):**
  - _(expression)_ change in packed volume, as an expression in x → **192x² + 96x + 12**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 7. Chain rule `a2-chain`

- **Title:** Tuning in the Perfect Signal
- **Prompt:** At the annual tech expo, Lena is trying to pick up a message with her portable receiver. She notices the signal strength depends on where she sets the gain using the dial—at any dial level x, signal strength follows the rule below. Lena usually tunes the dial up to 10, and the batteries last for about 15 hours. She also has to contend with a loud music stage nearby, 8 feet away, but she’s determined to find the spot where each notch of the dial changes the signal most dramatically. Using the rule below, what formula should Lena use to see how much the signal strength changes in response to the dial setting?
- **Given:** S(x) = (3x + 2)²
- **Answer field(s):**
  - _(expression)_ change in signal strength as an expression in x → **18x + 12**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 8. Pinning down a rate `a1-instant-limit`

- **Title:** The Aquarium's Secret Leak
- **Prompt:** A giant aquarium at the marine center automatically tracks its water height (in centimetres) every minute. Technicians started observing the log beginning at the 2-minute mark and noticed the average climb in water between minute 2 and minute 3 is 5.5 cm, between minute 2 and 2.5 is 5.25 cm, and between minute 2 and 2.1 is 5.05 cm. According to the water-level log rule below, the aquarium has a temperature sensor recording 21°C near the top, a family of river fish swimming at an average depth of 85 cm, and a cleaning robot that circles the tank every 18 minutes. What is the precise change in the water height exactly when the clock hits the 2-minute mark?
- **Given:** f(t) = 0.5t² + 3t
Average over [2, 3] = 5.5 · over [2, 2.5] = 5.25 · over [2, 2.1] = 5.05
- **Answer field(s):**
  - _(number)_ centimetres per minute right at t = 2 → expected ≈ 5
- **Hint:** Notice the value the shrinking-window averages are closing in on.
- _Rewrite:_ applied

### 9. Chain rule `a2-chain`

- **Title:** Drone's Battery Change During a Filming Session
- **Prompt:** A film crew uses a high-end drone to capture scenic shots of a forest. The battery charge, B(x), in their main drone as the flight progresses is given by the rule below, where x is the number of minutes since the flight began. During the session, the crew discusses how long the drone can stay in the air, while taking notes that the wind speed outside is 18 mph, the camera on board records at 120 frames per second, and the spare battery in the carrier bag weighs 2.3 pounds. According to the rule below, how does the charge in the battery change with flight time, as an expression in x?
- **Given:** B(x) = (4x + 1)³
- **Answer field(s):**
  - _(expression)_ change in battery charge as an expression in x → **192x² + 96x + 12**
- **Hint:** Differentiate the outer power, then multiply by how fast the inside changes.
- _Rewrite:_ applied

### 10. Natural-log response `a4-log`

- **Title:** Changing Loudness Perception
- **Prompt:** While Kelly is listening to music in her living room, she adjusts the speaker volume using the volume dial, x. The impression of how loud the music sounds to her (in decibels) at each setting follows the rule below. Kelly wonders about the immediate change she'll notice in perceived loudness just as she sets the dial to 2. Earlier in the day, she brewed a cup of coffee with 350 ml of water, chose her favorite song which lasts 5 minutes, and switched seats between her couch and oak chair twice.
- **Given:** V(x) = ln(x²)
- **Answer field(s):**
  - _(number)_ change in decibels per unit of speaker volume at x = 2 → expected ≈ 1
- **Hint:** Compare how fast the inside is moving to how big the inside is at that moment.
- _Rewrite:_ applied
