/* ===================================================
   ALBERTA MATH 7-12  |  script.js
   =================================================== */

// ============================================================
// DATA — GRADE DEFINITIONS
// ============================================================
const GRADES = {
  math7: {
    id: 'math7', label: 'Math 7', tag: 'Grade 7',
    tagClass: 'tag-jr', cardClass: '',
    desc: 'Fractions, ratios, integers, geometry basics',
    fullDesc: 'Alberta Mathematics Grade 7 — Number sense, spatial reasoning, patterns, and data.',
    topics: [
      'Integers and operations',
      'Fractions and mixed numbers',
      'Ratios and proportional thinking',
      'Percentages and applications',
      'Variables and expressions',
      'Equations and problem solving',
      'Geometry: angles and triangles',
      'Area and perimeter',
      'Transformations',
      'Data collection and graphs'
    ],
    strands: ['Number', 'Patterns & Relations', 'Shape & Space', 'Statistics & Probability', 'Computational Thinking'],
    outcomes: [
      'Demonstrate understanding of integers, including representation, ordering, and operations',
      'Apply understanding of fractions, decimals, and percents to solve problems',
      'Use variables and simple equations to model relationships',
      'Explain and apply properties of 2D shapes and transformations',
      'Collect, display, and interpret data using appropriate graphs'
    ],
    resources: [
      { title: 'Math 7 Formula Sheet',       type: 'PDF',       badge: 'badge-pdf'   },
      { title: 'Geometry Reference Card',     type: 'PDF',       badge: 'badge-pdf'   },
      { title: 'Unit 1: Number Study Notes',  type: 'Guide',     badge: 'badge-guide' },
      { title: 'Math 7 Practice Worksheet Set', type: 'Worksheet', badge: 'badge-sheet' }
    ]
  },

  math8: {
    id: 'math8', label: 'Math 8', tag: 'Grade 8',
    tagClass: 'tag-jr', cardClass: '',
    desc: 'Pythagorean theorem, percents, probability',
    fullDesc: 'Alberta Mathematics Grade 8 — Building on number concepts, geometry, and data analysis.',
    topics: [
      'Square roots and perfect squares',
      'Pythagorean theorem',
      'Rational numbers',
      'Percents: sales tax, discount, interest',
      'Linear equations (one variable)',
      'Graphing in a coordinate plane',
      'Surface area of 3D objects',
      'Volume of prisms and cylinders',
      'Probability and theoretical outcomes',
      'Representing data: histograms, scatter plots'
    ],
    strands: ['Number', 'Patterns & Relations', 'Shape & Space', 'Statistics & Probability'],
    outcomes: [
      'Apply the Pythagorean theorem to solve problems',
      'Demonstrate understanding of rational numbers, including operations',
      'Solve linear equations in one variable',
      'Determine surface area and volume of 3D objects',
      'Compare experimental and theoretical probability'
    ],
    resources: [
      { title: 'Math 8 Formula Sheet',         type: 'PDF',       badge: 'badge-pdf'   },
      { title: 'Pythagorean Theorem Worksheet', type: 'Worksheet', badge: 'badge-sheet' },
      { title: 'Math 8 Study Guide',            type: 'Guide',     badge: 'badge-guide' },
      { title: '3D Geometry Reference',         type: 'PDF',       badge: 'badge-pdf'   }
    ]
  },

  math9: {
    id: 'math9', label: 'Math 9', tag: 'Grade 9',
    tagClass: 'tag-jr', cardClass: '',
    desc: 'Powers, polynomials, linear relations',
    fullDesc: 'Alberta Mathematics Grade 9 — Algebraic thinking, linear relations, and statistics.',
    topics: [
      'Powers and exponent laws',
      'Polynomials: add, subtract, multiply',
      'Linear relations and patterns',
      'Slope and rate of change',
      'Equations of lines (slope-intercept)',
      'Similarity and scale factors',
      'Circle geometry',
      'Statistics: sampling and data analysis',
      'Financial mathematics',
      'Probability of independent events'
    ],
    strands: ['Number', 'Patterns & Relations', 'Shape & Space', 'Statistics & Probability'],
    outcomes: [
      'Apply exponent laws to evaluate and simplify expressions',
      'Factor and expand polynomials',
      'Interpret and graph linear relations',
      'Apply similarity in geometric contexts',
      'Critically analyze statistical data and representations'
    ],
    resources: [
      { title: 'Math 9 Formula Sheet',      type: 'PDF',       badge: 'badge-pdf'   },
      { title: 'Polynomials Study Guide',   type: 'Guide',     badge: 'badge-guide' },
      { title: 'Linear Relations Worksheet',type: 'Worksheet', badge: 'badge-sheet' },
      { title: 'Diploma Prep Notes',        type: 'Guide',     badge: 'badge-guide' }
    ]
  },

  math10c: {
    id: 'math10c', label: 'Math 10C', tag: 'Grade 10',
    tagClass: 'tag-sr', cardClass: 'hs',
    desc: 'Combined pathway: measurement, algebra, functions',
    fullDesc: 'Mathematics 10 Combined (10C) — Gateway to the -1 and -2 pathways, covering algebra and functions.',
    topics: [
      'Measurement and unit conversions',
      'Trigonometry of right triangles',
      'SOHCAHTOA and applications',
      'Factoring polynomials',
      'Systems of linear equations',
      'Functions: domain, range, notation',
      'Linear and non-linear relations',
      'Slope and equations of lines',
      'Arithmetic sequences',
      'Introduction to quadratics'
    ],
    strands: ['Measurement', 'Algebra & Number', 'Relations & Functions'],
    outcomes: [
      'Demonstrate understanding of measurement systems and unit conversion',
      'Solve problems using right triangle trigonometry',
      'Factor polynomial expressions by various methods',
      'Analyze and solve systems of linear equations',
      'Distinguish between functions and relations; use function notation'
    ],
    resources: [
      { title: 'Math 10C Formula Sheet',        type: 'PDF',       badge: 'badge-pdf'   },
      { title: 'Trigonometry Reference Card',   type: 'PDF',       badge: 'badge-pdf'   },
      { title: 'Systems of Equations Guide',    type: 'Guide',     badge: 'badge-guide' },
      { title: '10C Practice Exam',             type: 'Worksheet', badge: 'badge-sheet' }
    ]
  },

  math103: {
    id: 'math103', label: 'Math 10-3', tag: 'Grade 10',
    tagClass: 'tag-sr', cardClass: 'hs',
    desc: '-3 pathway: measurement, geometry, finances',
    fullDesc: 'Mathematics 10-3 — Practical pathway emphasizing measurement, geometry, and financial math.',
    topics: [
      'Metric and imperial measurement',
      'Area and perimeter of composite shapes',
      'Volume and capacity',
      'Scale diagrams and models',
      'Surface area applications',
      'Basic trigonometry',
      'Introduction to personal finance',
      'Graphical reasoning'
    ],
    strands: ['Measurement', 'Geometry', 'Number', 'Algebra'],
    outcomes: [
      'Solve problems involving measurement in metric and imperial units',
      'Apply geometric concepts in real-world contexts',
      'Interpret and create scale diagrams',
      'Develop financial literacy skills',
      'Use graphical tools to analyze relationships'
    ],
    resources: [
      { title: 'Math 10-3 Formula Sheet',    type: 'PDF',       badge: 'badge-pdf'   },
      { title: 'Measurement Study Guide',    type: 'Guide',     badge: 'badge-guide' },
      { title: '10-3 Practice Set',          type: 'Worksheet', badge: 'badge-sheet' }
    ]
  },

  math201: {
    id: 'math201', label: 'Math 20-1', tag: 'Grade 11',
    tagClass: 'tag-sr', cardClass: 'hs',
    desc: '-1 pathway: quadratics, radicals, sequences',
    fullDesc: 'Mathematics 20-1 — Advanced algebra, quadratic functions, and sequences for university-bound students.',
    topics: [
      'Quadratic functions: vertex form, standard form',
      'Factoring and quadratic formula',
      'Radical expressions and equations',
      'Rational expressions and equations',
      'Absolute value functions',
      'Systems of equations (two variables)',
      'Quadratic inequalities',
      'Arithmetic and geometric sequences',
      'Introduction to series',
      'Exponents and logarithms (intro)'
    ],
    strands: ['Algebra & Number', 'Relations & Functions'],
    outcomes: [
      'Analyze quadratic functions in multiple forms and apply to real contexts',
      'Simplify and operate on radical and rational expressions',
      'Solve quadratic and rational equations',
      'Identify and apply arithmetic and geometric sequences',
      'Model real-world problems with systems of equations'
    ],
    resources: [
      { title: 'Math 20-1 Formula Sheet',        type: 'PDF',       badge: 'badge-pdf'   },
      { title: 'Quadratics Study Guide',         type: 'Guide',     badge: 'badge-guide' },
      { title: 'Radical Expressions Worksheet',  type: 'Worksheet', badge: 'badge-sheet' },
      { title: '20-1 Practice Exam',             type: 'Worksheet', badge: 'badge-sheet' }
    ]
  },

  math202: {
    id: 'math202', label: 'Math 20-2', tag: 'Grade 11',
    tagClass: 'tag-sr', cardClass: 'hs',
    desc: '-2 pathway: geometry, stats, quadratics applied',
    fullDesc: 'Mathematics 20-2 — Applied reasoning, geometry, and statistics for post-secondary programs.',
    topics: [
      'Inductive and deductive reasoning',
      'Angle relationships in polygons',
      'Triangle congruence and proofs',
      'Circle properties and theorems',
      'Proportional reasoning',
      'Normal distribution and z-scores',
      'Quadratic functions (applied)',
      'Sequences and series',
      'Financial applications',
      'Probability and odds'
    ],
    strands: ['Logical Reasoning', 'Geometry', 'Statistics', 'Algebra & Number'],
    outcomes: [
      'Apply inductive and deductive reasoning to geometric proofs',
      'Analyze properties of circles and polygons',
      'Interpret data using normal distribution',
      'Apply quadratic functions in problem contexts',
      'Calculate probabilities and odds'
    ],
    resources: [
      { title: 'Math 20-2 Formula Sheet',    type: 'PDF',   badge: 'badge-pdf'   },
      { title: 'Geometry Proofs Guide',      type: 'Guide', badge: 'badge-guide' },
      { title: 'Statistics Reference Sheet', type: 'PDF',   badge: 'badge-pdf'   }
    ]
  },

  math203: {
    id: 'math203', label: 'Math 20-3', tag: 'Grade 11',
    tagClass: 'tag-sr', cardClass: 'hs',
    desc: '-3 pathway: finance, measurement, geometry',
    fullDesc: 'Mathematics 20-3 — Practical, trades, and workplace mathematics for the -3 pathway.',
    topics: [
      'Compound interest and credit',
      'Budgeting and financial planning',
      'Area, surface area, and volume (complex shapes)',
      'Trigonometry in applied contexts',
      '3D objects and scale models',
      'Statistics and graphs',
      'Linear functions and modeling'
    ],
    strands: ['Algebra', 'Geometry', 'Measurement', 'Statistics', 'Number'],
    outcomes: [
      'Apply compound interest and financial formulas',
      'Budget and plan personal finances',
      'Solve measurement problems with complex 3D objects',
      'Use trigonometry in workplace contexts',
      'Interpret and create statistical graphs'
    ],
    resources: [
      { title: 'Math 20-3 Formula Sheet',          type: 'PDF',       badge: 'badge-pdf'   },
      { title: 'Financial Math Guide',             type: 'Guide',     badge: 'badge-guide' },
      { title: '20-3 Measurement Worksheet',       type: 'Worksheet', badge: 'badge-sheet' }
    ]
  },

  math301: {
    id: 'math301', label: 'Math 30-1', tag: 'Grade 12',
    tagClass: 'tag-adv', cardClass: 'adv',
    desc: '-1 pathway: trig, functions, permutations, conics',
    fullDesc: 'Mathematics 30-1 — Advanced functions, trigonometry, and pre-calculus for university-bound students.',
    topics: [
      'Trigonometric functions and graphs',
      'Trigonometric identities',
      'Exponential and logarithmic functions',
      'Polynomial functions and transformations',
      'Radical functions',
      'Rational functions',
      'Conic sections',
      'Permutations and combinations',
      'Binomial theorem',
      'Function transformations'
    ],
    strands: ['Trigonometry', 'Relations & Functions', 'Permutations, Combinations & Binomial Theorem'],
    outcomes: [
      'Analyze and graph trigonometric functions and apply identities',
      'Solve exponential and logarithmic equations',
      'Analyze polynomial and rational functions including intercepts and asymptotes',
      'Apply counting principles, permutations, and combinations',
      'Expand expressions using the Binomial Theorem'
    ],
    resources: [
      { title: 'Math 30-1 Formula Sheet',      type: 'PDF',       badge: 'badge-pdf'   },
      { title: 'Diploma Review Package',       type: 'Guide',     badge: 'badge-guide' },
      { title: 'Trigonometry Identity Sheet',  type: 'PDF',       badge: 'badge-pdf'   },
      { title: '30-1 Practice Exam',           type: 'Worksheet', badge: 'badge-sheet' }
    ]
  },

  math302: {
    id: 'math302', label: 'Math 30-2', tag: 'Grade 12',
    tagClass: 'tag-adv', cardClass: 'adv',
    desc: '-2 pathway: logic, statistics, probability',
    fullDesc: 'Mathematics 30-2 — Logic, probability, and applied mathematics for post-secondary entry.',
    topics: [
      'Set theory and Venn diagrams',
      'Probability: conditional and dependent events',
      'Binomial distribution',
      'Permutations and combinations',
      'Logical reasoning and arguments',
      'Polynomial functions (applied)',
      'Exponential functions',
      'Financial mathematics: annuities',
      'Coordinate geometry',
      'Quadratic functions revisited'
    ],
    strands: ['Logical Reasoning', 'Probability', 'Relations & Functions', 'Algebra & Number'],
    outcomes: [
      'Apply set theory and logic to mathematical arguments',
      'Calculate conditional and compound probabilities',
      'Model situations using binomial distributions',
      'Analyze polynomial and exponential functions',
      'Apply financial math to real-world decision making'
    ],
    resources: [
      { title: 'Math 30-2 Formula Sheet',      type: 'PDF',   badge: 'badge-pdf'   },
      { title: 'Probability Reference Sheet',  type: 'PDF',   badge: 'badge-pdf'   },
      { title: '30-2 Diploma Prep Guide',      type: 'Guide', badge: 'badge-guide' }
    ]
  },

  math303: {
    id: 'math303', label: 'Math 30-3', tag: 'Grade 12',
    tagClass: 'tag-adv', cardClass: 'adv',
    desc: '-3 pathway: practical, trades math',
    fullDesc: 'Mathematics 30-3 — Practical and trades mathematics for workplace and technical programs.',
    topics: [
      'Slope and rate of change (applied)',
      'Linear and quadratic functions (workplace)',
      'Trigonometry in trades contexts',
      'Unit analysis and conversions',
      'Statistics and decision making',
      'Financial planning and loans',
      '3D measurement and design'
    ],
    strands: ['Algebra', 'Geometry', 'Measurement', 'Statistics'],
    outcomes: [
      'Apply linear and quadratic models to workplace problems',
      'Solve measurement and conversion problems in trades contexts',
      'Make data-informed decisions using statistics',
      'Apply financial formulas for budgeting and loans',
      'Use trigonometry in applied, non-abstract settings'
    ],
    resources: [
      { title: 'Math 30-3 Formula Sheet',        type: 'PDF',       badge: 'badge-pdf'   },
      { title: 'Trades Math Reference Guide',    type: 'Guide',     badge: 'badge-guide' },
      { title: '30-3 Practice Worksheet',        type: 'Worksheet', badge: 'badge-sheet' }
    ]
  }
};

// ============================================================
// DATA — PRACTICE QUESTIONS
// ============================================================
const QUESTIONS = {
  'Math 7': {
    easy: [
      'What is −5 + 8?',
      'Calculate 3/4 + 1/2.',
      'What is 20% of 60?',
      'Simplify: 3x + 2x.',
      'What is the area of a rectangle with length 8 cm and width 5 cm?'
    ],
    medium: [
      'Solve for x: 3x − 7 = 14.',
      'A jacket costs $80 and is on sale for 25% off. What is the sale price?',
      'Write the ratio 18:24 in simplest form.',
      'Find the perimeter of a triangle with sides 7 cm, 9 cm, and 11 cm.',
      'If a car travels 150 km in 3 hours, what is its average speed?'
    ],
    hard: [
      'A store marks up an item by 30% then discounts it by 20%. What is the overall percent change?',
      'Solve: (2x + 3)/5 = 4 − x/2.',
      'A rectangular prism has length 6, width 4, and height 3. Find its volume and total surface area.',
      'If ∠A and ∠B are supplementary and ∠A is 40° more than ∠B, find each angle.',
      'A sequence begins: 2, 5, 8, 11, ... What is the 20th term?'
    ]
  },
  'Math 8': {
    easy: [
      'What is √49?',
      'Find the hypotenuse if the legs are 3 and 4.',
      'What is 15% of 80?',
      'What is 2/3 × 3/4?',
      'Convert 0.75 to a fraction in simplest form.'
    ],
    medium: [
      'A right triangle has legs of 5 cm and 12 cm. Find the hypotenuse.',
      'Solve: 4x + 6 = 22.',
      'Find the surface area of a cube with side length 5 cm.',
      'What is the theoretical probability of rolling an even number on a standard die?',
      'Write 3.6 as a mixed number.'
    ],
    hard: [
      'A ladder 10 m long leans against a wall. The base is 6 m from the wall. How high up the wall does it reach?',
      'Solve and graph: 3x − 2 < 10.',
      'Find the volume of a cylinder with radius 4 cm and height 9 cm (use π ≈ 3.14).',
      'If P(A) = 0.4 and P(B) = 0.3 and they are independent, find P(A and B).',
      'A rectangle has area 48 cm² and perimeter 28 cm. Find its dimensions.'
    ]
  },
  'Math 9': {
    easy: [
      'Simplify: x² · x³.',
      'Add: (3x + 4) + (2x − 1).',
      'What is the slope of y = 3x + 7?',
      'Evaluate 2³.',
      'Simplify: (2x²)³.'
    ],
    medium: [
      'Factor: x² − 5x + 6.',
      'Find the slope between points (2, 3) and (6, 11).',
      'Expand: (x + 3)(x − 2).',
      'Solve: 2x + 5 = 3x − 1.',
      'If two triangles are similar with ratio 2:3, and the small triangle has area 8 cm², find the area of the large triangle.'
    ],
    hard: [
      'Factor fully: 2x³ − 8x.',
      'Write the equation of a line through (1, 4) and (3, 10).',
      'Simplify: (3x²y)(2xy³) ÷ (6x²y²).',
      'The length of a rectangle is 3 more than twice its width. The perimeter is 48. Find the dimensions.',
      'Solve the system: 2x + y = 8, x − y = 1.'
    ]
  },
  'Math 10C': {
    easy: [
      'Convert 5 feet to inches.',
      'Find sin(30°).',
      'What is the slope of the line 2x + 3y = 6?',
      'Factor: x² − 9.',
      'Evaluate f(3) if f(x) = 2x − 1.'
    ],
    medium: [
      'A right triangle has an angle of 40°. The adjacent side is 10 cm. Find the opposite side.',
      'Solve the system: y = 2x + 1 and y = −x + 7.',
      'Factor: 2x² + 5x + 3.',
      'State the domain and range of f(x) = √(x − 2).',
      'Convert 3 metres to feet (use 1 m ≈ 3.28 ft).'
    ],
    hard: [
      'A 25 m ladder makes a 65° angle with the ground. How high does it reach?',
      'Solve and check: 2x/(x−1) = 3 + 2/(x−1).',
      'Factor completely: 3x³ − 12x.',
      'Determine if y = x² is a function. State its domain and range.',
      'A boat travels 15 km east then 8 km north. What is the direct distance from start, and at what angle from east?'
    ]
  },
  'Math 20-1': {
    easy: [
      'Simplify: √50.',
      'Factor: x² − 4.',
      'What is the vertex of y = (x − 2)² + 3?',
      'Simplify: √12 + √27.',
      'Evaluate: 4^(3/2).'
    ],
    medium: [
      'Solve using the quadratic formula: 2x² − 5x − 3 = 0.',
      'Write y = x² + 6x + 5 in vertex form.',
      'Simplify: (2√3)(3√6).',
      'Find the 8th term of the arithmetic sequence: 3, 7, 11, ...',
      'Determine the sum of the first 10 terms of 2 + 5 + 8 + ...'
    ],
    hard: [
      'Find the vertex and axis of symmetry of y = −2x² + 8x − 3.',
      'Solve: √(2x + 3) = x − 1, and check for extraneous roots.',
      'Simplify: (x² − 9)/(x² − x − 6) ÷ (x + 3)/(2x + 4).',
      'The second term of a geometric sequence is 6 and the fifth term is 48. Find the common ratio and first term.',
      'Solve the system: y = x² and y = x + 6 (find both intersection points).'
    ]
  },
  'Math 30-1': {
    easy: [
      'Convert 180° to radians.',
      'State the period of y = sin(x).',
      'What is log₂(8)?',
      'Evaluate: ₈P₃.',
      'Simplify: log(100).'
    ],
    medium: [
      'Prove the Pythagorean identity: sin²x + cos²x = 1.',
      'Solve: 2sin(x) = 1 for x ∈ [0°, 360°].',
      'Evaluate: ₁₀C₃.',
      'Solve: 2^(x+1) = 16.',
      'State the domain and range of y = log(x + 2).'
    ],
    hard: [
      'Prove: 1 + tan²x = sec²x.',
      'Solve: 2cos²x − cos x − 1 = 0 for x ∈ [0, 2π].',
      'Find the 4th term in the expansion of (x + 2)⁵ using the Binomial Theorem.',
      'Solve: log(x) + log(x − 3) = 1.',
      'How many different 5-card hands can be dealt from a standard 52-card deck?'
    ]
  }
};

// ============================================================
// DATA — HINTS
// ============================================================
const HINTS = {
  'Math 7': {
    easy: [
      'Hint: On a number line, move 8 units to the right from −5.',
      'Hint: Find a common denominator first: 3/4 + 2/4.',
      'Hint: Move the decimal — 20% = 0.20, then multiply by 60.',
      'Hint: Combine like terms — add the coefficients of x.',
      'Hint: Area = length × width.'
    ],
    medium: [
      'Hint: Add 7 to both sides first, then divide by 3.',
      'Hint: Find 25% of $80, then subtract from $80.',
      'Hint: Divide both numbers by their GCF (6).',
      'Hint: Add all three side lengths together.',
      'Hint: Speed = Distance ÷ Time.'
    ],
    hard: [
      'Hint: Calculate each change step by step as a percentage of the previous price.',
      'Hint: Multiply both sides by 10 to clear fractions, then solve.',
      'Hint: V = l×w×h; SA = 2(lw + lh + wh).',
      'Hint: Supplementary angles add to 180°. Set up two equations.',
      'Hint: nth term of arithmetic sequence = a + (n−1)d.'
    ]
  },
  'Math 8': {
    easy: [
      'Hint: What number multiplied by itself equals 49?',
      'Hint: Use a² + b² = c² with a=3, b=4.',
      'Hint: 15% = 15/100; multiply 15/100 × 80.',
      'Hint: Multiply numerators together and denominators together.',
      'Hint: 0.75 = 75/100 — simplify by dividing by 25.'
    ],
    medium: [
      'Hint: Use a² + b² = c²: 5² + 12² = c².',
      'Hint: Subtract 6 from both sides, then divide by 4.',
      'Hint: SA of a cube = 6s².',
      'Hint: Even numbers on a die: 2, 4, 6 — that is 3 out of 6.',
      'Hint: 3.6 = 3 + 0.6 = 3 + 3/5 = 3 3/5.'
    ],
    hard: [
      'Hint: Use Pythagorean theorem with c = 10, a = 6, solve for b.',
      'Hint: Add 2 to both sides to get 3x < 12, then divide by 3.',
      'Hint: V = πr²h ≈ 3.14 × 16 × 9.',
      'Hint: P(A and B) = P(A) × P(B) when events are independent.',
      'Hint: Set up two equations: l×w = 48 and 2l + 2w = 28.'
    ]
  },
  'Math 9': {
    easy: [
      'Hint: When multiplying powers with the same base, add the exponents.',
      'Hint: Combine the x-terms separately from the constant terms.',
      'Hint: In y = mx + b, m is the slope.',
      'Hint: 2³ = 2 × 2 × 2.',
      'Hint: Power rule: (aᵐ)ⁿ = aᵐⁿ; also multiply the coefficients.'
    ],
    medium: [
      'Hint: Find two numbers that multiply to 6 and add to −5.',
      'Hint: Slope = (y₂ − y₁) ÷ (x₂ − x₁).',
      'Hint: Use FOIL — First, Outer, Inner, Last.',
      'Hint: Collect x terms on one side, constants on the other.',
      'Hint: Area ratio = (side ratio)² = (2/3)² = 4/9.'
    ],
    hard: [
      'Hint: Factor out GCF first: 2x(x² − 4), then factor the difference of squares.',
      'Hint: Find the slope first, then use point-slope form.',
      'Hint: Multiply numerators, multiply denominators, then cancel common factors.',
      'Hint: Let w = width. Then l = 2w + 3. Substitute into 2l + 2w = 48.',
      'Hint: Add the two equations to eliminate y, then solve for x.'
    ]
  },
  'Math 10C': {
    easy: [
      'Hint: 1 foot = 12 inches.',
      'Hint: sin(30°) = 1/2 — memorize the special triangle.',
      'Hint: Rearrange to y = mx + b form first.',
      'Hint: Difference of squares: a² − b² = (a+b)(a−b).',
      'Hint: Replace every x with 3 and evaluate.'
    ],
    medium: [
      'Hint: tan(40°) = opposite/adjacent — use a calculator.',
      'Hint: Set the two expressions equal to each other and solve for x.',
      'Hint: Try ac-method: a×c = 2×3 = 6; find factors of 6 that add to 5.',
      'Hint: Domain: x − 2 ≥ 0 → x ≥ 2. Range: y ≥ 0.',
      'Hint: Multiply the number of metres by 3.28.'
    ],
    hard: [
      'Hint: Height = 25 × sin(65°).',
      'Hint: Multiply both sides by (x−1). Check for x = 1 as a restriction.',
      'Hint: Factor out 3x first, then factor what remains.',
      'Hint: Each input has exactly one output — yes, it is a function. Domain: all reals; range: y ≥ 0.',
      'Hint: Use Pythagoras for distance: c = √(15² + 8²). Angle = arctan(8/15).'
    ]
  },
  'Math 20-1': {
    easy: [
      'Hint: √50 = √(25 × 2) = 5√2.',
      'Hint: Difference of squares: a² − b² = (a+b)(a−b).',
      'Hint: Vertex form is y = a(x−h)² + k, so the vertex is (h, k).',
      'Hint: √12 = 2√3 and √27 = 3√3 — then add like radicals.',
      'Hint: 4^(3/2) = (√4)³ = 2³ = 8.'
    ],
    medium: [
      'Hint: x = [5 ± √(25 + 24)] / 4.',
      'Hint: Complete the square — half of 6 is 3, square it to get 9.',
      'Hint: Multiply coefficients: 2×3 = 6; multiply radicals: √3 × √6 = √18 = 3√2.',
      'Hint: aₙ = 3 + (n−1) × 4; substitute n = 8.',
      'Hint: Sₙ = n/2 × (2a + (n−1)d).'
    ],
    hard: [
      'Hint: h = −b/(2a); substitute back to find k.',
      'Hint: Square both sides, then check answers in the original equation for extraneous roots.',
      'Hint: Factor all numerators and denominators, then cancel before multiplying.',
      'Hint: Use t₂ = ar and t₅ = ar⁴; divide to find r.',
      'Hint: Substitute x² for y in the linear equation, rearrange, and factor.'
    ]
  },
  'Math 30-1': {
    easy: [
      'Hint: Radians = degrees × π/180.',
      'Hint: sin(x) completes one full cycle every 2π or 360°.',
      'Hint: Ask: "2 to what power equals 8?"',
      'Hint: ₈P₃ = 8 × 7 × 6.',
      'Hint: log(100) = log(10²) = 2.'
    ],
    medium: [
      'Hint: This identity follows directly from the unit circle definition of sin and cos.',
      'Hint: sin(x) = 1/2 at x = 30° and x = 150° in [0°, 360°].',
      'Hint: ₁₀C₃ = 10! / (3! × 7!) = (10 × 9 × 8) / (3 × 2 × 1).',
      'Hint: Rewrite 16 as 2⁴, then equate the exponents.',
      'Hint: Domain: x + 2 > 0 → x > −2. Range: all real numbers.'
    ],
    hard: [
      'Hint: Start with sin²x + cos²x = 1 and divide both sides by cos²x.',
      'Hint: Let u = cos(x); solve 2u² − u − 1 = 0, then find angles.',
      'Hint: T(k+1) = C(5,k) · x^(5−k) · 2^k; for the 4th term, k = 3.',
      'Hint: Use log rules to combine: log(x(x−3)) = 1 means x(x−3) = 10.',
      'Hint: C(52, 5) = 52! / (5! × 47!).'
    ]
  }
};

// ============================================================
// STATE
// ============================================================
let currentGrade  = null;
let practiceDiff  = 'easy';
let practiceGrade = 'Math 7';

// ============================================================
// NAVIGATION
// ============================================================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (target) target.classList.add('active');

  const navOrder = ['home', 'grades', 'practice', 'resources', 'about', 'contact'];
  document.querySelectorAll('.nav-link').forEach((btn, i) => {
    btn.classList.toggle('active', navOrder[i] === id);
  });

  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo(0, 0);
}

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ============================================================
// BUILD GRADE CARDS
// ============================================================
function buildGradeCard(g, onclick) {
  const card = document.createElement('div');
  card.className = 'grade-card ' + g.cardClass;
  card.onclick = onclick;
  card.innerHTML = `
    <span class="grade-tag ${g.tagClass}">${g.tag}</span>
    <h3>${g.label}</h3>
    <p>${g.desc}</p>
    <div class="grade-arrow">View Details →</div>
  `;
  return card;
}

function buildAllGradeCards() {
  const homeGrid = document.getElementById('homeGradeGrid');
  Object.values(GRADES).forEach(g => {
    homeGrid.appendChild(buildGradeCard(g, () => openGradeDetail(g.id)));
  });

  const groups = [
    ['gradesJrGrid',   ['math7', 'math8', 'math9']],
    ['gradesSr10Grid', ['math10c', 'math103']],
    ['gradesSr20Grid', ['math201', 'math202', 'math203']],
    ['gradesSr30Grid', ['math301', 'math302', 'math303']]
  ];

  groups.forEach(([containerId, ids]) => {
    const el = document.getElementById(containerId);
    ids.forEach(gid => {
      el.appendChild(buildGradeCard(GRADES[gid], () => openGradeDetail(gid)));
    });
  });
}

// ============================================================
// GRADE DETAIL PAGE
// ============================================================
function openGradeDetail(gid) {
  const g = GRADES[gid];
  if (!g) return;
  currentGrade = g;

  document.getElementById('gradeDetailTitle').textContent     = g.label;
  document.getElementById('gradeDetailDesc').textContent      = g.fullDesc;
  document.getElementById('gradeDetailBreadcrumb').textContent = g.label;
  document.getElementById('practiceGradeName').textContent    = g.label;

  // Topics
  document.getElementById('detailTopics').innerHTML =
    g.topics.map(t => `<li class="topic-item"><span class="topic-dot"></span>${t}</li>`).join('');

  // Strands
  document.getElementById('detailStrands').innerHTML =
    g.strands.map(s => `<li class="topic-item"><span class="topic-dot" style="background:var(--accent)"></span>${s}</li>`).join('');

  // Outcomes
  document.getElementById('detailOutcomes').innerHTML =
    g.outcomes.map(o => `<div class="outcome-item">✓ ${o}</div>`).join('');

  // Resources
  document.getElementById('detailResources').innerHTML =
    g.resources.map(r => `
      <div class="resource-card">
        <div class="resource-icon-bg" style="background:var(--sky)">📄</div>
        <span class="resource-badge ${r.badge}">${r.type}</span>
        <h3>${r.title}</h3>
        <p>${g.label} resource for students and teachers.</p>
        <button class="dl-btn" onclick="alertDl('${r.title}')">⬇ Download ${r.type}</button>
      </div>`).join('');

  // Reset tabs to first tab
  resetTabsInContainer(document.querySelector('#page-grade-detail .section'));

  // Clear practice area
  document.getElementById('detailQuestions').innerHTML = '';
  document.querySelectorAll('#detailDiffBtns .diff-btn').forEach(b => b.classList.remove('active'));

  showPage('grade-detail');
}

// ============================================================
// TABS
// ============================================================
function switchTab(btn, panelId) {
  const tabBar = btn.closest('.tab-bar');
  tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const parent = tabBar.parentElement;
  parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  const target = document.getElementById('tab-' + panelId);
  if (target) target.classList.add('active');
}

function resetTabsInContainer(container) {
  if (!container) return;
  const tabBar = container.querySelector('.tab-bar');
  if (!tabBar) return;
  tabBar.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  container.querySelectorAll('.tab-panel').forEach((p, i) => p.classList.toggle('active', i === 0));
}

// ============================================================
// DIFFICULTY (GRADE DETAIL PAGE)
// ============================================================
function selectDiff(btn, diff) {
  document.querySelectorAll('#detailDiffBtns .diff-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const label    = currentGrade ? currentGrade.label : 'Math 7';
  const qs       = getQuestionsFor(label, diff);
  const hintsArr = getHintsFor(label, diff);
  renderDetailQuestions(qs, hintsArr, diff);
}

function getQuestionsFor(label, diff) {
  const pool = QUESTIONS[label] || QUESTIONS['Math 7'];
  return pool[diff] || pool.easy;
}

function getHintsFor(label, diff) {
  const pool = HINTS[label] || HINTS['Math 7'];
  return pool[diff] || pool.easy;
}

function renderDetailQuestions(qs, hintsArr, diff) {
  const container = document.getElementById('detailQuestions');
  container.innerHTML = qs.slice(0, 4).map((q, i) => `
    <div class="question-box">
      <div class="question-num">Question ${i + 1}</div>
      <div class="question-text">${q}</div>
      <textarea class="answer-area" placeholder="Type your answer here..."></textarea>
      <div>
        <button class="hint-btn" onclick="toggleHint(this)">💡 Show Hint</button>
      </div>
      <div class="question-hint">${hintsArr[i] || 'Work through it step by step!'}</div>
    </div>`).join('');
}

function toggleHint(btn) {
  const hint = btn.parentElement.nextElementSibling;
  hint.classList.toggle('visible');
  btn.textContent = hint.classList.contains('visible') ? '💡 Hide Hint' : '💡 Show Hint';
}

// ============================================================
// PRACTICE PAGE
// ============================================================
function selectPracticeGrade(btn, grade) {
  document.querySelectorAll('.grade-select-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  practiceGrade = grade;
}

function selectPracticeDiff(btn, diff) {
  document.querySelectorAll('.practice-controls .diff-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  practiceDiff = diff;
}

function generatePracticeQuestions() {
  const pool     = QUESTIONS[practiceGrade] || QUESTIONS['Math 7'];
  const qs       = pool[practiceDiff]       || pool.easy;
  const hintsPool = HINTS[practiceGrade]    || HINTS['Math 7'];
  const hints    = hintsPool[practiceDiff]  || hintsPool.easy;

  const diffLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  const diffClass = { easy: 'q-easy', medium: 'q-medium', hard: 'q-hard' };

  const container = document.getElementById('practiceQuestionsContainer');
  container.innerHTML = qs.map((q, i) => `
    <div class="q-card">
      <span class="q-difficulty ${diffClass[practiceDiff]}">${diffLabel[practiceDiff]}</span>
      <div class="q-text">${i + 1}. ${q}</div>
      <input type="text" class="q-input" placeholder="Your answer..." />
      <div class="q-actions">
        <button class="q-btn q-btn-hint"  onclick="showQHint(this, '${escapeAttr(hints[i] || 'Think step by step!')}')">💡 Hint</button>
        <button class="q-btn q-btn-check" onclick="checkAnswer(this)">✓ Check Answer</button>
      </div>
      <div class="q-hint-text"></div>
      <div class="q-result"></div>
    </div>`).join('');
}

function escapeAttr(str) {
  return str.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

function showQHint(btn, hint) {
  const hintEl = btn.closest('.q-card').querySelector('.q-hint-text');
  const isVisible = hintEl.style.display === 'block';
  hintEl.textContent = hint;
  hintEl.style.display = isVisible ? 'none' : 'block';
}

function checkAnswer(btn) {
  const card   = btn.closest('.q-card');
  const input  = card.querySelector('.q-input');
  const result = card.querySelector('.q-result');

  if (!input.value.trim()) {
    result.className = 'q-result q-incorrect';
    result.textContent = '⚠️ Please enter an answer first.';
    result.style.display = 'block';
    return;
  }
  result.className = 'q-result q-correct';
  result.textContent = '✅ Answer submitted! Review with your teacher or check the solution guide.';
  result.style.display = 'block';
}

// ============================================================
// CONTACT FORM
// ============================================================
function submitForm() {
  const name  = document.getElementById('cName').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const msg   = document.getElementById('cMsg').value.trim();

  if (!name || !email || !msg) {
    alert('Please fill in your name, email address, and message before submitting.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  document.getElementById('formSuccess').style.display = 'block';
  document.getElementById('cName').value  = '';
  document.getElementById('cEmail').value = '';
  document.getElementById('cRole').value  = '';
  document.getElementById('cMsg').value   = '';
}

// ============================================================
// DOWNLOAD PLACEHOLDER
// ============================================================
function alertDl(name) {
  alert(
    'Download: "' + name + '"\n\n' +
    'In a full deployment, this button would download the PDF or document file.\n' +
    'This is a placeholder — attach your real files and update the button href accordingly.'
  );
}

// ============================================================
// INIT
// ============================================================
buildAllGradeCards();
