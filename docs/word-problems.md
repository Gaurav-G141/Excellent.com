# Calculus Word Problems

Real-world word problems covering the same concepts the app teaches, written as ordinary (text) problems rather than graphical/interactive tasks. Each has a scenario, the given setup, a full solution, and a final answer.

**Non-obvious by design:** each prompt asks a natural question and does not name the technique or echo the lessons' wording (no "derivative", "rate of change", "secant/tangent", "Mean Value Theorem", "critical point", "second derivative", "guaranteed to take"). The method is named only in the **Solution** and **In scope** lines, which are author-facing.

## Scope this set respects

- **Polynomials only**, with simple coefficients. No `e^x`, `ln`, `sin`, `cos`, `tan`, `sqrt`, or other special functions.
- **Techniques:** power rule, sum rule, chain rule only for `(ax + b)^n` with `n = 2` or `3`, the second derivative for polynomial motion, and the existence ideas behind the Mean Value Theorem and Intermediate Value Theorem. **No product rule, no quotient rule.**
- **Related rates uses only the three shapes the app implements:** sphere `V = (4/3)πr³`, square `A = s²`, cube `V = s³`.

## Table of Contents

- [Lesson 1 — Derivatives Basics](#lesson-1--derivatives-basics)
  - [Fastest rate](#fastest-rate)
  - [Average vs. instantaneous](#average-vs-instantaneous)
  - [Pinning down an instant's rate](#pinning-down-an-instants-rate)
  - [Turning points](#turning-points)
- [Lesson 2 — Rules of Derivatives](#lesson-2--rules-of-derivatives)
  - [Power rule](#power-rule)
  - [Sum rule](#sum-rule)
  - [Chain rule](#chain-rule)
  - [When the average is actually achieved](#when-the-average-is-actually-achieved)
  - [Combining the rules](#combining-the-rules)
- [Lesson 3 — Related Rates and Motion](#lesson-3--related-rates-and-motion)
  - [Related rates](#related-rates)
  - [Velocity and acceleration](#velocity-and-acceleration)
  - [A value that must occur](#a-value-that-must-occur)

---

# Lesson 1 — Derivatives Basics

## Fastest rate

### Concert Ticket Release
**Scenario:** When a tour goes on sale, cumulative tickets sold (in thousands) over the first few days follow \(T(d) = -d^3 + 6d^2 + 15d\), where \(d\) is days since release. Sales climb, then cool off as the show fills. On which of days 1, 2, 3, or 4 were tickets moving the fastest?
**Solution:**
1. Selling speed: \(T'(d) = -3d^2 + 12d + 15\).
2. Evaluate: \(T'(1)=24\), \(T'(2)=27\), \(T'(3)=24\), \(T'(4)=15\) (thousand/day).
3. The largest is at day 2.
**Answer:** **Day 2**, when sales were moving at \(27{,}000\) tickets/day.
**In scope:** Compares instantaneous rates (first derivative of a cubic). Polynomial; power + sum rule.

### Dam Release Surge
**Scenario:** After a controlled dam release, the river height downstream (cm above normal) is \(h(t) = -t^3 + 6t^2 + 5t\) over the first hours, \(t\) in hours. A monitoring station logs the readings at \(t = 1, 2, 3, 4\). At which reading was the water rising the quickest?
**Solution:**
1. Rise speed: \(h'(t) = -3t^2 + 12t + 5\).
2. Evaluate: \(h'(1)=14\), \(h'(2)=17\), \(h'(3)=14\), \(h'(4)=5\) (cm/hr).
3. The largest is at \(t = 2\).
**Answer:** At **\(t = 2\) hours**, rising \(17\) cm/hr.
**In scope:** Compares instantaneous rates (first derivative of a cubic). Polynomial; power + sum rule.

## Average vs. instantaneous

### The Cyclist's First Two Hours
**Scenario:** A cyclist's distance from the start (miles) is \(d(t) = t^2 + 10t\), with \(t\) in hours. Over the first two hours, what was her average speed for the stretch — and how fast was she actually traveling right as the two-hour mark passed?
**Solution:**
1. Average over \([0,2]\): \(\frac{d(2)-d(0)}{2-0} = \frac{24-0}{2} = 12\) mph.
2. Instant speed: \(d'(t) = 2t + 10\); at \(t=2\), \(d'(2) = 14\) mph.
**Answer:** Average **12 mph**; traveling **14 mph** at the two-hour mark.
**In scope:** Average slope over an interval vs. instantaneous slope at a point. Quadratic; power + sum rule.

### Fish Hatchery Stock
**Scenario:** A hatchery's fish count (in hundreds) grows as \(P(t) = 2t^2 + 5t\) over weeks \(t\). Between week 1 and week 3, what was the average weekly increase — and how fast was the stock growing exactly at week 3?
**Solution:**
1. Average over \([1,3]\): \(\frac{P(3)-P(1)}{3-1} = \frac{33-7}{2} = 13\) hundred/week.
2. Instant rate: \(P'(t) = 4t + 5\); at \(t=3\), \(P'(3) = 17\) hundred/week.
**Answer:** Average **1300 fish/week**; growing at **1700 fish/week** at week 3.
**In scope:** Average vs. instantaneous slope. Quadratic; power + sum rule.

## Pinning down an instant's rate

### Drone Climb, Zeroing In
**Scenario:** A drone's altitude (in 10-m units) is \(a(t) = 0.25t^2 + t\), with \(t\) in minutes. Find the average climb rate over the windows \([2, 3]\), \([2, 2.5]\), and \([2, 2.1]\), and use the trend to say how fast it is climbing exactly at \(t = 2\).
**Solution:**
1. \(a(2) = 3\). Averages: \([2,3]\): \(\frac{5.25-3}{1}=2.25\); \([2,2.5]\): \(\frac{4.0625-3}{0.5}=2.125\); \([2,2.1]\): \(\frac{3.2025-3}{0.1}=2.025\).
2. The values close in on \(2\). Check: \(a'(t)=0.5t+1\), \(a'(2)=2\).
**Answer:** Exactly **2** (i.e. 20 m/min) at \(t = 2\).
**In scope:** Averages over shrinking intervals approaching the instantaneous rate (limit idea). Quadratic; no out-of-scope algebra.

### Roller-Coaster Drop, Zeroing In
**Scenario:** A coaster car's height fallen (meters) is \(h(t) = 0.5t^2\), \(t\) in seconds. Compute the average speed over \([1, 2]\), \([1, 1.5]\), and \([1, 1.1]\), and use the pattern to state its speed exactly at \(t = 1\).
**Solution:**
1. \(h(1)=0.5\). Averages: \([1,2]\): \(\frac{2-0.5}{1}=1.5\); \([1,1.5]\): \(\frac{1.125-0.5}{0.5}=1.25\); \([1,1.1]\): \(\frac{0.605-0.5}{0.1}=1.05\).
2. The values close in on \(1\). Check: \(h'(t)=t\), \(h'(1)=1\).
**Answer:** Exactly **1 m/s** at \(t = 1\).
**In scope:** Shrinking-interval averages approaching the instantaneous rate. Quadratic; no out-of-scope algebra.

## Turning points

### Startup Cash Balance
**Scenario:** A startup's cash balance (in thousands of dollars) over the next six months is \(B(t) = t^3 - 9t^2 + 24t\), \(t\) in months. At what point does the balance stop climbing and start to fall, and when does it bottom out and turn back up?
**Solution:**
1. \(B'(t) = 3t^2 - 18t + 24 = 3(t-2)(t-4)\).
2. \(B'(t)=0\) at \(t=2\) and \(t=4\). Sign of \(B'\): \(+,-,+\), so \(t=2\) is a peak (\(B=20\)) and \(t=4\) is a low (\(B=16\)).
**Answer:** Peaks at **\(t = 2\) months** (\$20k), bottoms at **\(t = 4\) months** (\$16k).
**In scope:** Turning points where \(B'=0\) (max then min). Cubic; power + sum rule.

### Test Drone Altitude
**Scenario:** During a test flight a drone's height (meters) is \(h(t) = 2t^3 - 9t^2 + 12t\), \(t\) in seconds. At what times does it briefly stop climbing or stop descending?
**Solution:**
1. \(h'(t) = 6t^2 - 18t + 12 = 6(t-1)(t-2)\).
2. \(h'(t)=0\) at \(t=1\) and \(t=2\). Sign \(+,-,+\): \(t=1\) is a high point (\(h=5\)), \(t=2\) is a low point (\(h=4\)).
**Answer:** Levels off at **\(t = 1\) s** (high) and **\(t = 2\) s** (low).
**In scope:** Turning points where \(h'=0\). Cubic; power + sum rule.

---

# Lesson 2 — Rules of Derivatives

## Power rule

### Pizza Dough Cost
**Scenario:** A pizzeria's dough cost for a pie of radius \(r\) inches is \(C(r) = 0.5r^2\) dollars. When a pie has a 6-inch radius, how many extra dollars of dough does each additional inch of radius cost?
**Solution:** \(C'(r) = r\); at \(r = 6\), \(C'(6) = 6\).
**Answer:** About **\$6 per inch** of radius.
**In scope:** Power rule on a single term, evaluated. Polynomial.

### Model Detail Budget
**Scenario:** A game studio finds a 3D asset's polygon count is \(N(s) = 2s^3\) (in thousands) at detail level \(s\). At detail level 5, how fast does the polygon count grow per additional level of detail?
**Solution:** \(N'(s) = 6s^2\); at \(s = 5\), \(N'(5) = 150\).
**Answer:** **150 thousand polygons per level** at \(s = 5\).
**In scope:** Power rule on a single term, evaluated. Polynomial.

## Sum rule

### Boutique Revenue
**Scenario:** A boutique's daily revenue (dollars) for selling \(x\) units is \(R(x) = x^3 + 4x^2 + 10x\). Write an expression for how much each additional unit adds to revenue at any sales level \(x\).
**Solution:** Term by term: \(R'(x) = 3x^2 + 8x + 10\).
**Answer:** \(R'(x) = 3x^2 + 8x + 10\) dollars per unit.
**In scope:** Sum + power rule on a polynomial.

### Shuttle Odometer
**Scenario:** A campus shuttle's distance traveled (miles) is \(d(t) = 2t^3 - t^2 + 6t\), with \(t\) in hours. Write an expression for its speed at any time \(t\).
**Solution:** Term by term: \(d'(t) = 6t^2 - 2t + 6\).
**Answer:** \(d'(t) = 6t^2 - 2t + 6\) mph.
**In scope:** Sum + power rule on a polynomial.

## Chain rule

### Nitro Charge Meter
**Scenario:** In a racing game, the energy in your nitro reserve is \((4x + 1)^2\), where \(x\) is the boost dial. Write an expression for how fast that energy changes as you turn the dial.
**Solution:** Outer \(2(4x+1)\) times inner \(4\): \(8(4x+1)\). Expand: \(32x + 8\). (Check: \((4x+1)^2 = 16x^2+8x+1 \Rightarrow 32x+8\).) ✓
**Answer:** \(8(4x + 1)\), or \(32x + 8\).
**In scope:** Chain rule on \((ax+b)^2\). Polynomial composite; no product/quotient rule.

### Pop-Up Tent Volume
**Scenario:** A pop-up structure's packed volume is \((x + 3)^3\), where \(x\) is a single tensioning setting. Write an expression for how fast the volume changes as you adjust that setting.
**Solution:** Outer \(3(x+3)^2\) times inner \(1\): \(3(x+3)^2\). Expand: \(3x^2 + 18x + 27\). ✓
**Answer:** \(3(x + 3)^2\), or \(3x^2 + 18x + 27\).
**In scope:** Chain rule on \((ax+b)^3\). Polynomial composite; no product/quotient rule.

## When the average is actually achieved

### The Average-Speed Camera
**Scenario:** Between two highway cameras your distance traveled (miles) is \(f(x) = x^2\), where \(x\) is hours since the first camera. The entry camera is at \(x = 1\) and the exit at \(x = 5\). What was your average speed across the zone, and at what single moment did your speedometer read exactly that value?
**Solution:**
1. Average: \(\frac{f(5)-f(1)}{5-1} = \frac{25-1}{4} = 6\) mph.
2. \(f'(x) = 2x\); set \(2c = 6 \Rightarrow c = 3\), and \(1 < 3 < 5\). ✓
**Answer:** Average **6 mph**; matched exactly at **\(x = 3\) hours**.
**In scope:** Average slope and the moment the instant slope equals it (Mean Value Theorem). Quadratic; power rule + linear solve.

### Elevator Average Pace
**Scenario:** A freight elevator's height (meters) is \(f(x) = 3x^2\), with \(x\) in seconds, over the interval from \(x = 0\) to \(x = 4\). What was its average rate of rise over that span, and at what instant was it actually rising at exactly that rate?
**Solution:**
1. Average: \(\frac{f(4)-f(0)}{4-0} = \frac{48-0}{4} = 12\) m/s.
2. \(f'(x) = 6x\); set \(6c = 12 \Rightarrow c = 2\), and \(0 < 2 < 4\). ✓
**Answer:** Average **12 m/s**; matched exactly at **\(x = 2\) s**.
**In scope:** Average slope vs. instant slope equality (Mean Value Theorem). Quadratic; power rule + linear solve.

## Combining the rules

### Two-System Spaceship
**Scenario:** A spaceship draws power from a charge cell holding \((3x + 1)^2\) and a reactor putting out \(2x^3\), where \(x\) is the throttle. Write an expression for how fast the total power output changes with the throttle.
**Solution:** \(\frac{d}{dx}(3x+1)^2 = 6(3x+1)\) (chain); \(\frac{d}{dx}2x^3 = 6x^2\) (power); add. Expand: \(6x^2 + 18x + 6\). ✓
**Answer:** \(6(3x + 1) + 6x^2\), or \(6x^2 + 18x + 6\).
**In scope:** Chain on \((ax+b)^2\) + power + sum. Polynomial.

### Robot Energy Draw
**Scenario:** A factory robot's energy draw at load dial \(x\) is a main drive \((x + 1)^3\) plus a booster \(4x^2\). Write an expression for how fast its total energy draw changes with the dial.
**Solution:** \(\frac{d}{dx}(x+1)^3 = 3(x+1)^2\) (chain); \(\frac{d}{dx}4x^2 = 8x\) (power); add. Expand: \(3(x^2+2x+1) + 8x = 3x^2 + 14x + 3\). ✓
**Answer:** \(3(x + 1)^2 + 8x\), or \(3x^2 + 14x + 3\).
**In scope:** Chain on \((ax+b)^3\) + power + sum. Polynomial.

---

# Lesson 3 — Related Rates and Motion

## Related rates

### Weather Balloon
**Scenario:** A weather balloon stays spherical as it inflates, and its radius grows at a steady \(0.5\) cm/s. At the moment its radius is \(10\) cm, how fast is its volume increasing?
**Solution:** For a sphere \(V = \tfrac{4}{3}\pi r^3\), so \(\frac{dV}{dt} = 4\pi r^2 \frac{dr}{dt} = 4\pi(10)^2(0.5) = 200\pi\).
**Answer:** \(\frac{dV}{dt} = 200\pi \approx 628.3\ \text{cm}^3/\text{s}\).
**In scope:** Related rates, sphere relation only. Uses `*`, `^`, `pi`.

### Growing Salt Crystal
**Scenario:** A cube-shaped salt crystal grows so that each edge lengthens at \(0.1\) cm/s. When an edge is \(5\) cm long, how fast is the crystal's volume increasing?
**Solution:** For a cube \(V = s^3\), so \(\frac{dV}{dt} = 3s^2 \frac{ds}{dt} = 3(5)^2(0.1) = 7.5\).
**Answer:** \(\frac{dV}{dt} = 7.5\ \text{cm}^3/\text{s}\).
**In scope:** Related rates, cube relation only. No special functions.

## Velocity and acceleration

### Maglev Test Sled
**Scenario:** On a straight test track, a sled's position (meters) is \(s(t) = t^3 + 2t^2 + t\), with \(t\) in seconds. How hard is it accelerating two seconds in?
**Solution:** \(s'(t) = 3t^2 + 4t + 1\); \(s''(t) = 6t + 4\); \(s''(2) = 12 + 4 = 16\).
**Answer:** **16 m/s²** at \(t = 2\).
**In scope:** Polynomial motion; acceleration from differentiating twice. Power + sum rule.

### Elevator Pod
**Scenario:** A glass elevator pod's height (meters) is \(s(t) = 2t^3 - 5t^2 + 3t\), \(t\) in seconds. How hard is it accelerating at the three-second mark?
**Solution:** \(s'(t) = 6t^2 - 10t + 3\); \(s''(t) = 12t - 10\); \(s''(3) = 36 - 10 = 26\).
**Answer:** **26 m/s²** at \(t = 3\).
**In scope:** Polynomial motion; acceleration from differentiating twice. Power + sum rule.

## A value that must occur

### Heating Room
**Scenario:** As a heater runs, a room's temperature (°C) varies smoothly with a dial setting \(x\) as \(f(x) = x^2 + 1\). The dial is swept from \(x = 0\) to \(x = 3\). Which of these temperatures must the room have hit somewhere along the way: \(0\), \(5\), or \(12\)?
**Solution:** \(f(0) = 1\), \(f(3) = 10\). Since \(f\) is continuous, every value strictly between \(1\) and \(10\) occurs. \(5\) is inside \((1, 10)\); \(0 < 1\) and \(12 > 10\) are outside.
**Answer:** **5 °C** must occur. (Existence only — the dial setting where it happens isn't pinned down.)
**In scope:** Intermediate Value Theorem on a continuous quadratic; correct value strictly inside the endpoint range.

### Drone Altitude Pass-Through
**Scenario:** A drone's altitude (meters) varies smoothly with horizontal position \(x\) as \(f(x) = -x^2 + 8x\), recorded from \(x = 0\) to \(x = 3\). Which of these altitudes must it have passed through: \(-2\), \(9\), or \(20\)?
**Solution:** \(f(0) = 0\), \(f(3) = 15\). The peak is at \(x = 4\), so on \([0,3]\) the altitude climbs steadily from \(0\) to \(15\); every value strictly between occurs. \(9\) is inside \((0, 15)\); \(-2 < 0\) and \(20 > 15\) are outside.
**Answer:** **9 m** must occur. (Existence only — the position where it happens isn't pinned down.)
**In scope:** Intermediate Value Theorem on a continuous quadratic, monotonic on \([0,3]\); correct value strictly inside the endpoint range.
