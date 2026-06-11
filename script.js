/* ================================================================
   Alberta Math 7-12  |  script.js
   Full version with PDF generation and visitor counter
   ================================================================ */

// ================================================================
// VISITOR COUNTER  (localStorage-based, works without a server)
// ================================================================
function initVisitorCounter() {
  var KEY_TOTAL   = 'am712_total_visits';
  var KEY_SESSION = 'am712_session_active';
  var KEY_DL      = 'am712_downloads';

  // Count a new visit only once per browser session
  var total = parseInt(localStorage.getItem(KEY_TOTAL) || '0', 10);
  var sessionActive = sessionStorage.getItem(KEY_SESSION);

  if (!sessionActive) {
    total += 1;
    localStorage.setItem(KEY_TOTAL, total);
    sessionStorage.setItem(KEY_SESSION, '1');
  }

  var downloads = parseInt(localStorage.getItem(KEY_DL) || '0', 10);

  function fmtNum(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Update all counter displays
  function updateUI() {
    var t = parseInt(localStorage.getItem(KEY_TOTAL) || '0', 10);
    var d = parseInt(localStorage.getItem(KEY_DL)    || '0', 10);

    var vt = document.getElementById('visitorText');
    var vs = document.getElementById('sessionText');
    var sv = document.getElementById('statVisitors');
    var cs = document.getElementById('contactStats');
    var fc = document.getElementById('footerCounter');

    if (vt) vt.textContent = 'This site has been visited ' + fmtNum(t) + ' times';
    if (vs) vs.textContent = 'You are visitor #' + fmtNum(t);
    if (sv) sv.textContent = fmtNum(t);
    if (cs) cs.innerHTML  =
      'Total site visits: <strong>' + fmtNum(t) + '</strong><br>' +
      'PDFs downloaded: <strong>' + fmtNum(d) + '</strong>';
    if (fc) fc.textContent = fmtNum(t) + ' total visits | ' + fmtNum(d) + ' PDFs downloaded';
  }

  updateUI();

  // Expose a function to increment the download counter
  window.recordDownload = function () {
    var d = parseInt(localStorage.getItem(KEY_DL) || '0', 10) + 1;
    localStorage.setItem(KEY_DL, d);
    updateUI();
  };
}

// ================================================================
// PDF GENERATION ENGINE  (pure-JS, no library needed)
// Produces a real, standards-compliant PDF using raw PDF syntax.
// ================================================================
var PDF = (function () {

  // ---- Low-level PDF byte stream builder ----
  function Buf() {
    this.parts = [];
    this.offsets = [];
    this.size = 0;
  }
  Buf.prototype.add = function (s) {
    this.parts.push(s);
    this.size += s.length;
    return this;
  };
  Buf.prototype.toString = function () { return this.parts.join(''); };

  // ---- Escape a PDF string ----
  function esc(s) {
    return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  // ---- Simple word-wrap ----
  function wrap(text, maxChars) {
    var words = text.split(' ');
    var lines = [];
    var cur   = '';
    words.forEach(function (w) {
      if ((cur + (cur ? ' ' : '') + w).length > maxChars) {
        if (cur) lines.push(cur);
        cur = w;
      } else {
        cur = cur ? cur + ' ' + w : w;
      }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  // ---- Build a full PDF from an array of section objects ----
  // sections: [{heading, lines:[string]}, ...]
  // Returns a data-URL string
  function build(title, sections) {

    // We will collect all objects as strings
    var objs   = [];   // each element is the raw object body (without header/footer)
    var xrefOf = [];   // byte offset of each object (1-indexed)

    function addObj(body) {
      objs.push(body);
      return objs.length; // 1-based object number
    }

    // --- Stream content pages ---
    // Flatten all sections into lines, paginate
    var allLines = [];

    allLines.push({ t: 'title', s: title });
    allLines.push({ t: 'rule' });

    sections.forEach(function (sec) {
      if (sec.heading) {
        allLines.push({ t: 'blank' });
        allLines.push({ t: 'heading', s: sec.heading });
        allLines.push({ t: 'rule2' });
      }
      sec.lines.forEach(function (ln) {
        // word-wrap long lines
        var wrapped = wrap(ln, 90);
        wrapped.forEach(function (wl, wi) {
          allLines.push({ t: wi === 0 ? 'body' : 'cont', s: wl });
        });
      });
    });

    // Page layout (points, 1pt = 1/72 inch)
    var PW = 612, PH = 792;
    var ML = 50, MR = 50, MT = 60, MB = 60;
    var TF = 26, HF = 16, BF = 13, CF = 11; // font sizes
    var LS_T = 34, LS_H = 22, LS_B = 17, LS_C = 15;

    // Paginate
    var pages = [];
    var curPage = [];
    var curY = PH - MT;
    var firstPage = true;

    function pageUsed() {
      return firstPage ? PH - MT - 80 : PH - MT; // leave room for title on p1
    }

    allLines.forEach(function (ln) {
      var needed = (ln.t === 'title') ? LS_T + 10
                 : (ln.t === 'heading') ? LS_H + 6
                 : (ln.t === 'rule' || ln.t === 'rule2') ? 8
                 : (ln.t === 'blank') ? 10
                 : LS_B;

      if (curY - needed < MB) {
        pages.push(curPage);
        curPage = [];
        curY = PH - MT;
        firstPage = false;
      }
      curPage.push({ ln: ln, y: curY });
      curY -= needed;
    });
    if (curPage.length) pages.push(curPage);

    // Build content stream for each page
    var pageObjNums = [];
    var streamObjNums = [];

    pages.forEach(function (pageLines) {
      var ops = [];

      // Background header bar
      ops.push('q');
      ops.push('0.043 0.145 0.271 rg');            // navy #0B2545
      ops.push(ML + ' ' + (PH - MT - 30) + ' ' + (PW - ML - MR) + ' 36 re f');
      ops.push('Q');

      // Header text (white)
      ops.push('q');
      ops.push('1 1 1 rg');
      ops.push('BT /F2 11 Tf ' + (ML + 6) + ' ' + (PH - MT - 12) + ' Td (' + esc('Alberta Mathematics 7-12  |  albertamath712.ca') + ') Tj ET');
      ops.push('Q');

      pageLines.forEach(function (item) {
        var ln = item.ln;
        var y  = item.y;

        if (ln.t === 'title') {
          ops.push('q 0.102 0.420 0.714 rg');   // blue
          ops.push('BT /F1 ' + TF + ' Tf ' + ML + ' ' + (y - 26) + ' Td (' + esc(ln.s) + ') Tj ET');
          ops.push('Q');

        } else if (ln.t === 'heading') {
          ops.push('q 0.043 0.145 0.271 rg');   // navy
          ops.push('BT /F1 ' + HF + ' Tf ' + ML + ' ' + (y - 16) + ' Td (' + esc(ln.s) + ') Tj ET');
          ops.push('Q');

        } else if (ln.t === 'rule') {
          ops.push('q 0.102 0.420 0.714 rg');
          ops.push(ML + ' ' + (y - 4) + ' ' + (PW - ML - MR) + ' 2 re f Q');

        } else if (ln.t === 'rule2') {
          ops.push('q 0.800 0.851 0.937 rg');
          ops.push(ML + ' ' + (y - 2) + ' ' + (PW - ML - MR) + ' 1 re f Q');

        } else if (ln.t === 'blank') {
          // nothing

        } else if (ln.t === 'body') {
          ops.push('q 0.082 0.227 0.325 rg');   // dark text
          ops.push('BT /F2 ' + BF + ' Tf ' + ML + ' ' + (y - 13) + ' Td (' + esc(ln.s || '') + ') Tj ET');
          ops.push('Q');

        } else { // cont
          ops.push('q 0.082 0.227 0.325 rg');
          ops.push('BT /F2 ' + CF + ' Tf ' + (ML + 10) + ' ' + (y - 13) + ' Td (' + esc(ln.s || '') + ') Tj ET');
          ops.push('Q');
        }
      });

      // Footer
      ops.push('q 0.400 0.400 0.400 rg');
      ops.push('BT /F2 9 Tf ' + ML + ' ' + (MB - 14) + ' Td (Alberta Math 7-12  |  Free Educational Resource  |  Aligned with Alberta New Curriculum) Tj ET');
      ops.push('Q');
      // footer rule
      ops.push('q 0.800 0.800 0.800 rg ' + ML + ' ' + (MB - 2) + ' ' + (PW - ML - MR) + ' 0.5 re f Q');

      var stream = ops.join('\n');
      var sNum = addObj('<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');
      streamObjNums.push(sNum);

      var pNum = addObj('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Contents ' + sNum + ' 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>');
      pageObjNums.push(pNum);
    });

    // Object 1: Catalog (placeholder — we fill refs below)
    // Object 2: Pages
    // Object 3: Font (bold/Helvetica-Bold)
    // Object 4: Font (regular/Helvetica)
    // We need to pre-assign these, so we build in order:

    // Pre-assign slots 1-4 before actual page content
    // Rebuild with correct ordering
    var allObjBodies = [];

    // slot 1: Catalog
    allObjBodies.push(null); // filled later
    // slot 2: Pages
    allObjBodies.push(null); // filled later
    // slot 3: Font bold
    allObjBodies.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    // slot 4: Font regular
    allObjBodies.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');

    // Remap object numbers: our objs array was 1-based, but now slots 1-4 are reserved
    // so page-content objects start at slot 5
    var offset = 4; // first 4 slots used
    var remapSnum = {}; // old sNum -> new slot
    var remapPnum = {}; // old pNum -> new slot

    for (var i = 0; i < objs.length; i++) {
      allObjBodies.push(objs[i]);
    }

    // Now fix the page object bodies to reference correct font objects (3 and 4)
    // and fix Pages to list correct page object numbers
    // Re-extract stream obj numbers and page obj numbers with offset
    var newPageNums = pageObjNums.map(function (n) { return n + offset; });
    var kidsStr = newPageNums.map(function (n) { return n + ' 0 R'; }).join(' ');

    allObjBodies[0] = '<< /Type /Catalog /Pages 2 0 R >>'; // slot 1
    allObjBodies[1] = '<< /Type /Pages /Kids [' + kidsStr + '] /Count ' + newPageNums.length + ' >>'; // slot 2

    // Rebuild page objects with correct stream references
    var newStreamNums = streamObjNums.map(function (n) { return n + offset; });
    for (var pi = 0; pi < newPageNums.length; pi++) {
      var pIdx = newPageNums[pi] - 1; // 0-based
      allObjBodies[pIdx] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Contents ' + newStreamNums[pi] + ' 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>';
    }

    // Assemble final PDF
    var pdf   = '%PDF-1.4\n';
    var ofArr = [];
    for (var oi = 0; oi < allObjBodies.length; oi++) {
      ofArr.push(pdf.length);
      pdf += (oi + 1) + ' 0 obj\n' + allObjBodies[oi] + '\nendobj\n';
    }

    // Cross-reference table
    var xrefStart = pdf.length;
    pdf += 'xref\n0 ' + (allObjBodies.length + 1) + '\n';
    pdf += '0000000000 65535 f \n';
    ofArr.forEach(function (o) {
      var s = '0000000000' + o;
      pdf += s.slice(-10) + ' 00000 n \n';
    });

    pdf += 'trailer\n<< /Size ' + (allObjBodies.length + 1) + ' /Root 1 0 R >>\n';
    pdf += 'startxref\n' + xrefStart + '\n%%EOF';

    return 'data:application/pdf;base64,' + btoa(unescape(encodeURIComponent(pdf)));
  }

  return { build: build };
})();

// ================================================================
// PDF CONTENT DEFINITIONS  (all grades, all units)
// ================================================================
var PDF_CONTENT = {

  // ------- FORMULA SHEETS -------
  formula: {

    'Math 7': {
      title: 'Math 7 Formula Sheet — Alberta New Curriculum',
      sections: [
        { heading: 'Integer Operations',
          lines: [
            'ADDING: Same signs -> add and keep sign. Different signs -> subtract, keep sign of larger.',
            'SUBTRACTING: Change subtraction to adding the opposite: a - b = a + (-b)',
            'MULTIPLYING / DIVIDING: (+)(+)=(+), (-)(-) = (+), (+)(-)=(-), (-)(+)=(-)',
            'Order of Operations: BEDMAS — Brackets, Exponents, Division/Multiplication (L to R), Addition/Subtraction (L to R)'
          ]
        },
        { heading: 'Fractions',
          lines: [
            'Adding / Subtracting: Find LCD, convert, then add or subtract numerators.',
            'Multiplying: (a/b) x (c/d) = ac/bd',
            'Dividing: (a/b) / (c/d) = (a/b) x (d/c) = ad/bc',
            'Mixed number to improper: a b/c = (ac + b)/c'
          ]
        },
        { heading: 'Ratios, Rates & Percents',
          lines: [
            'Ratio: a:b  (simplify by dividing by GCF)',
            'Unit rate: divide first quantity by second quantity',
            'Percent of a number: (percent / 100) x number',
            'Percent change: (New - Old) / Old x 100%',
            'Sale price: Original x (1 - discount rate)',
            'Total with tax: Price x (1 + tax rate)'
          ]
        },
        { heading: 'Expressions & Equations',
          lines: [
            'Evaluate: substitute value for variable, then calculate',
            'Solving one-step: use inverse operations — same operation on both sides',
            'Solving two-step: undo addition/subtraction first, then multiplication/division'
          ]
        },
        { heading: 'Geometry',
          lines: [
            'Triangle angle sum: A + B + C = 180 degrees',
            'Supplementary angles: A + B = 180 degrees',
            'Complementary angles: A + B = 90 degrees',
            'Area of rectangle: A = l x w',
            'Area of triangle: A = (1/2) x b x h',
            'Area of parallelogram: A = b x h',
            'Area of trapezoid: A = (1/2)(a + b)h',
            'Circumference of circle: C = 2 x pi x r',
            'Area of circle: A = pi x r^2',
            'Perimeter: sum of all sides'
          ]
        },
        { heading: 'Statistics & Probability',
          lines: [
            'Mean = sum of all values / number of values',
            'Median = middle value (sort first; average two middle values if even count)',
            'Mode = most frequently occurring value',
            'Range = maximum - minimum',
            'P(event) = favourable outcomes / total possible outcomes',
            'P(not A) = 1 - P(A)'
          ]
        }
      ]
    },

    'Math 8': {
      title: 'Math 8 Formula Sheet — Alberta New Curriculum',
      sections: [
        { heading: 'Square Roots & Pythagorean Theorem',
          lines: [
            'Square root: sqrt(n) — ask "what number squared equals n?"',
            'Pythagorean Theorem: a^2 + b^2 = c^2 (c = hypotenuse, the longest side)',
            'Finding hypotenuse: c = sqrt(a^2 + b^2)',
            'Finding a leg: a = sqrt(c^2 - b^2)',
            'Distance on a grid: d = sqrt((x2-x1)^2 + (y2-y1)^2)'
          ]
        },
        { heading: 'Percents',
          lines: [
            'Percent of a number: (p/100) x n',
            'Percent change: (New - Old)/Old x 100%',
            'Discount: Sale price = Original x (1 - rate)',
            'Tax: Total = Price x (1 + tax rate)',
            'Commission: Commission = rate x sales',
            'Simple Interest: I = P x r x t  (P=principal, r=rate, t=time in years)',
            'Markup: Selling price = Cost x (1 + markup rate)'
          ]
        },
        { heading: 'Surface Area',
          lines: [
            'Rectangular prism: SA = 2(lw + lh + wh)',
            'Cube: SA = 6s^2',
            'Cylinder: SA = 2 x pi x r^2 + 2 x pi x r x h',
            'Triangular prism: SA = 2(1/2 x b x h) + (sum of 3 rectangular faces)',
            'Square pyramid: SA = s^2 + 4(1/2 x s x slant height)'
          ]
        },
        { heading: 'Volume',
          lines: [
            'Rectangular prism: V = l x w x h',
            'Cylinder: V = pi x r^2 x h',
            'Triangular prism: V = (1/2 x b x h) x length',
            'Square pyramid: V = (1/3) x s^2 x h',
            'Cone: V = (1/3) x pi x r^2 x h',
            'Sphere: V = (4/3) x pi x r^3'
          ]
        },
        { heading: 'Linear Equations',
          lines: [
            'Standard form: y = mx + b  (m=slope, b=y-intercept)',
            'Slope: m = (y2 - y1)/(x2 - x1) = rise/run',
            'Solving multi-step: distribute -> collect like terms -> isolate variable'
          ]
        },
        { heading: 'Probability',
          lines: [
            'Theoretical P(A) = favourable/total outcomes',
            'Experimental P(A) = observed successes/total trials',
            'Complementary: P(not A) = 1 - P(A)',
            'Independent events: P(A and B) = P(A) x P(B)'
          ]
        }
      ]
    },

    'Math 9': {
      title: 'Math 9 Formula Sheet — Alberta New Curriculum',
      sections: [
        { heading: 'Exponent Laws',
          lines: [
            'Product rule: b^m x b^n = b^(m+n)',
            'Quotient rule: b^m / b^n = b^(m-n)',
            'Power rule: (b^m)^n = b^(mn)',
            'Power of a product: (ab)^n = a^n x b^n',
            'Zero exponent: b^0 = 1  (b not equal to 0)',
            'Negative exponent: b^(-n) = 1/b^n',
            'Rational exponent: b^(1/n) = nth root of b'
          ]
        },
        { heading: 'Polynomials',
          lines: [
            'Like terms: same variable AND same exponent',
            'Collecting like terms: add/subtract coefficients',
            'Distributive property: a(b + c) = ab + ac',
            'FOIL: (a+b)(c+d) = ac + ad + bc + bd',
            'Difference of squares: a^2 - b^2 = (a+b)(a-b)',
            'Perfect square: (a+b)^2 = a^2 + 2ab + b^2',
            'Factoring trinomial x^2+bx+c: find p,q where pq=c and p+q=b; = (x+p)(x+q)'
          ]
        },
        { heading: 'Linear Relations',
          lines: [
            'Slope: m = (y2-y1)/(x2-x1)',
            'Slope-intercept form: y = mx + b',
            'Point-slope form: y - y1 = m(x - x1)',
            'Standard form: Ax + By + C = 0',
            'Horizontal line: y = k  (slope = 0)',
            'Vertical line: x = k  (slope undefined)'
          ]
        },
        { heading: 'Systems of Equations',
          lines: [
            'Substitution: solve one equation for one variable, substitute into the other',
            'Elimination: multiply equations so one variable cancels, then add/subtract',
            'Solution = point of intersection of the two lines'
          ]
        },
        { heading: 'Geometry',
          lines: [
            'Similar figures: corresponding angles equal, corresponding sides proportional',
            'Scale factor k: side ratio = k, area ratio = k^2, volume ratio = k^3',
            'Circle theorems: inscribed angle = (1/2) x central angle',
            'Angle in a semicircle = 90 degrees',
            'Tangent is perpendicular to radius at point of tangency'
          ]
        }
      ]
    },

    'Math 10C': {
      title: 'Math 10C Formula Sheet — Alberta New Curriculum',
      sections: [
        { heading: 'Measurement Conversions',
          lines: [
            '1 inch = 2.54 cm     |    1 foot = 30.48 cm    |    1 yard = 0.9144 m',
            '1 mile = 1.609 km    |    1 kg = 2.205 lb       |    1 L = 0.264 US gal',
            'Convert metric: multiply or divide by powers of 10',
            'Convert imperial to SI: use conversion factor (given or memorized)'
          ]
        },
        { heading: 'Right Triangle Trigonometry (SOHCAHTOA)',
          lines: [
            'sin(theta) = opposite / hypotenuse',
            'cos(theta) = adjacent / hypotenuse',
            'tan(theta) = opposite / adjacent',
            'Inverse: theta = sin^-1(opp/hyp) = cos^-1(adj/hyp) = tan^-1(opp/adj)',
            'Angle of elevation: measured upward from horizontal',
            'Angle of depression: measured downward from horizontal'
          ]
        },
        { heading: 'Factoring',
          lines: [
            'Step 1: Always try GCF factoring first',
            'Difference of squares: a^2 - b^2 = (a+b)(a-b)',
            'Perfect square trinomial: a^2 + 2ab + b^2 = (a+b)^2',
            'Trinomial (a=1): x^2+bx+c = (x+p)(x+q)  where p+q=b and pq=c',
            'Trinomial (a not 1): use ac-method (decomposition)',
            'ac-method: find p,q where pq=ac and p+q=b; split middle term, factor by grouping'
          ]
        },
        { heading: 'Relations & Functions',
          lines: [
            'Function: each x-value maps to exactly one y-value',
            'Vertical Line Test: if any vertical line crosses graph twice, NOT a function',
            'Function notation: f(x) — f of x',
            'Domain: set of all valid input (x) values',
            'Range: set of all output (y) values',
            'Linear function: y = mx + b'
          ]
        },
        { heading: 'Arithmetic Sequences',
          lines: [
            'General term: t_n = a + (n-1)d',
            'a = first term,  d = common difference,  n = term number',
            'Sum of n terms: S_n = (n/2)(2a + (n-1)d) = (n/2)(t_1 + t_n)'
          ]
        },
        { heading: 'Systems of Linear Equations',
          lines: [
            'Substitution method: solve one equation for y (or x), substitute into other',
            'Elimination method: add/subtract equations to cancel one variable',
            'Types of solutions: one solution (intersecting), no solution (parallel), infinite (same line)'
          ]
        }
      ]
    },

    'Math 20-1': {
      title: 'Math 20-1 Formula Sheet — Alberta New Curriculum',
      sections: [
        { heading: 'Quadratic Functions',
          lines: [
            'Standard form: y = ax^2 + bx + c',
            'Vertex form: y = a(x - h)^2 + k   |   Vertex: (h, k)',
            'Axis of symmetry: x = h  (from vertex form)  OR  x = -b/(2a)  (from standard form)',
            'Factored form: y = a(x - r)(x - s)   |   x-intercepts at x = r and x = s',
            'Quadratic formula: x = (-b +/- sqrt(b^2 - 4ac)) / (2a)',
            'Discriminant: D = b^2 - 4ac',
            '  D > 0: two distinct real roots',
            '  D = 0: one real root (repeated)',
            '  D < 0: no real roots',
            'Completing the square: x^2 + bx = (x + b/2)^2 - (b/2)^2'
          ]
        },
        { heading: 'Radical Expressions',
          lines: [
            'Product rule: sqrt(ab) = sqrt(a) x sqrt(b)',
            'Quotient rule: sqrt(a/b) = sqrt(a) / sqrt(b)',
            'Simplify: sqrt(n) = sqrt(perfect square factor) x sqrt(remaining)',
            'Like radicals: same radicand — add/subtract coefficients',
            'Rationalizing denominator: multiply by sqrt(a)/sqrt(a)',
            'Conjugate rationalization: multiply by (a - b)/(a - b)'
          ]
        },
        { heading: 'Rational Expressions',
          lines: [
            'Non-permissible values (NPV): values that make denominator = 0',
            'Simplify: factor top and bottom, cancel common factors (state NPV!)',
            'Multiply: multiply tops, multiply bottoms (factor first)',
            'Divide: multiply by reciprocal of divisor',
            'Add/Subtract: find LCD, convert to equivalent fractions, combine numerators'
          ]
        },
        { heading: 'Arithmetic Sequences & Series',
          lines: [
            'General term: t_n = a + (n-1)d',
            'Sum: S_n = (n/2)(2a + (n-1)d)  OR  S_n = (n/2)(t_1 + t_n)'
          ]
        },
        { heading: 'Geometric Sequences & Series',
          lines: [
            'General term: t_n = a x r^(n-1)',
            'Sum of n terms: S_n = a(r^n - 1) / (r - 1)  for r not equal to 1',
            'Infinite series (|r| < 1): S_inf = a / (1 - r)'
          ]
        }
      ]
    },

    'Math 30-1': {
      title: 'Math 30-1 Formula Sheet — Alberta New Curriculum',
      sections: [
        { heading: 'Trigonometry',
          lines: [
            'Radian-degree conversion: theta(rad) = theta(deg) x pi/180',
            'Arc length: a = r x theta   (theta in radians)',
            'Sector area: A = (1/2)r^2 x theta',
            'Unit circle: cos(theta) = x-coordinate,  sin(theta) = y-coordinate',
            'Pythagorean identity: sin^2(x) + cos^2(x) = 1',
            '1 + tan^2(x) = sec^2(x)',
            '1 + cot^2(x) = csc^2(x)',
            'Reciprocal identities: csc=1/sin, sec=1/cos, cot=1/tan',
            'Quotient identities: tan=sin/cos, cot=cos/sin',
            'Sum formulas: sin(A+B)=sinAcosB+cosAsinB',
            'cos(A+B)=cosAcosB - sinAsinB',
            'CAST rule: All positive Q1, Sin positive Q2, Tan positive Q3, Cos positive Q4',
            'Period of y=sinx and y=cosx: 2*pi',
            'For y=a*sin(b(x-c))+d: amplitude=|a|, period=2pi/|b|, phase shift=c, vertical shift=d'
          ]
        },
        { heading: 'Exponential & Logarithmic Functions',
          lines: [
            'Exponential form: y = b^x   (b>0, b not=1)',
            'Logarithmic form: y = log_b(x)   is equivalent to   b^y = x',
            'log_b(mn) = log_b(m) + log_b(n)',
            'log_b(m/n) = log_b(m) - log_b(n)',
            'log_b(m^n) = n * log_b(m)',
            'Change of base: log_b(x) = log(x)/log(b) = ln(x)/ln(b)',
            'Natural log: ln(x) = log_e(x)',
            'Special values: log_b(1) = 0,  log_b(b) = 1'
          ]
        },
        { heading: 'Permutations & Combinations',
          lines: [
            'Fundamental Counting Principle: if event A occurs in m ways and B in n ways, together: m x n ways',
            'Factorial: n! = n x (n-1) x (n-2) x ... x 2 x 1,   0! = 1',
            'Permutations (ordered): nPr = n! / (n-r)!',
            'Combinations (unordered): nCr = n! / [r!(n-r)!]',
            'Permutations with identical items: n! / (n1! n2! ... nk!)'
          ]
        },
        { heading: 'Binomial Theorem',
          lines: [
            '(a+b)^n = sum of C(n,k) * a^(n-k) * b^k   for k=0 to n',
            'General term: T(k+1) = C(n,k) * a^(n-k) * b^k',
            'Pascal\'s triangle: each entry is sum of two entries above'
          ]
        }
      ]
    }
  },

  // ------- STUDY NOTES -------
  notes: {

    'Math 7 — Integers': {
      title: 'Math 7 Study Notes: Integers',
      sections: [
        { heading: 'What are Integers?',
          lines: [
            'Integers include all whole numbers AND their negatives: ... -3, -2, -1, 0, 1, 2, 3 ...',
            'Positive integers are greater than zero. Negative integers are less than zero.',
            'Opposite integers are the same distance from zero: +3 and -3 are opposites.',
            'On a number line: numbers increase as you move RIGHT, decrease moving LEFT.'
          ]
        },
        { heading: 'Adding Integers',
          lines: [
            'SAME SIGNS: add the numbers and keep the sign.',
            '  Example: (-4) + (-3) = -7   |   (+5) + (+6) = +11',
            'DIFFERENT SIGNS: subtract the numbers, keep the sign of the larger absolute value.',
            '  Example: (-7) + (+4) = -3   |   (+8) + (-3) = +5',
            'Tip: Use a number line. Start at the first number, move right for positive, left for negative.'
          ]
        },
        { heading: 'Subtracting Integers',
          lines: [
            'Rule: Change subtraction to adding the OPPOSITE.',
            '  a - b  =  a + (-b)',
            '  Example: 8 - (-3) = 8 + 3 = 11',
            '  Example: -5 - 4 = -5 + (-4) = -9',
            '  Example: -2 - (-6) = -2 + 6 = 4'
          ]
        },
        { heading: 'Multiplying and Dividing Integers',
          lines: [
            'Sign rules:  (+)(+) = (+)    (-)(-)  = (+)    (+)(-) = (-)    (-)(+) = (-)',
            'The same sign rules apply to division.',
            '  Example: (-4) x (-3) = +12      Example: (-6) x (5) = -30',
            '  Example: (-18) / (-3) = +6      Example: 20 / (-4) = -5',
            'Memory trick: SAME signs give POSITIVE; DIFFERENT signs give NEGATIVE.'
          ]
        },
        { heading: 'Order of Operations (BEDMAS)',
          lines: [
            'B — Brackets (do what is inside brackets first)',
            'E — Exponents',
            'D/M — Division and Multiplication (left to right)',
            'A/S — Addition and Subtraction (left to right)',
            'Example: -2 + 3 x (-4) = -2 + (-12) = -14  (multiply before adding)',
            'Example: (-3 + 5) x 2 = 2 x 2 = 4  (brackets first)'
          ]
        },
        { heading: 'Practice Problems',
          lines: [
            '1. Calculate: (-8) + 5',
            '2. Calculate: (-3) - (-7)',
            '3. Calculate: (-4) x (-6)',
            '4. Calculate: (-15) / 3',
            '5. Simplify: 2 + (-3) x 4 - (-1)',
            '6. Simplify: [(-2) + 5] x (-3) + 8',
            '',
            'Answers: 1. -3    2. 4    3. 24    4. -5    5. 2+(-12)-(-1)=2-12+1=-9    6. 3x(-3)+8=-9+8=-1'
          ]
        }
      ]
    },

    'Math 8 — Pythagorean Theorem': {
      title: 'Math 8 Study Notes: Pythagorean Theorem',
      sections: [
        { heading: 'The Pythagorean Theorem',
          lines: [
            'In a RIGHT TRIANGLE, the square of the HYPOTENUSE equals the sum of the squares of the other two sides.',
            'Formula: a^2 + b^2 = c^2',
            'Where c is the HYPOTENUSE (the longest side, across from the right angle).',
            'a and b are the two LEGS (the sides that form the right angle).'
          ]
        },
        { heading: 'Finding the Hypotenuse',
          lines: [
            'Step 1: Identify the two legs (a and b).',
            'Step 2: Substitute into a^2 + b^2 = c^2.',
            'Step 3: Calculate a^2 + b^2.',
            'Step 4: Take the square root: c = sqrt(a^2 + b^2).',
            '',
            'Example: Legs are 6 cm and 8 cm.',
            '  c^2 = 6^2 + 8^2 = 36 + 64 = 100',
            '  c = sqrt(100) = 10 cm',
            '',
            'Example: Legs are 5 and 12.',
            '  c^2 = 25 + 144 = 169   =>   c = 13'
          ]
        },
        { heading: 'Finding a Missing Leg',
          lines: [
            'Step 1: Identify hypotenuse (c) and one leg.',
            'Step 2: Rearrange: a^2 = c^2 - b^2.',
            'Step 3: Calculate and take the square root.',
            '',
            'Example: Hypotenuse = 13, one leg = 5.',
            '  a^2 = 13^2 - 5^2 = 169 - 25 = 144',
            '  a = sqrt(144) = 12'
          ]
        },
        { heading: 'Real-World Applications',
          lines: [
            'LADDER PROBLEM: A 10 m ladder leans against a wall. The base is 6 m from the wall.',
            '  h^2 + 6^2 = 10^2   =>   h^2 = 64   =>   h = 8 m up the wall.',
            '',
            'DIAGONAL OF RECTANGLE: Rectangle is 5 cm x 12 cm.',
            '  d = sqrt(5^2 + 12^2) = sqrt(169) = 13 cm',
            '',
            'DISTANCE BETWEEN POINTS: A(1,2) and B(5,5)',
            '  d = sqrt((5-1)^2 + (5-2)^2) = sqrt(16+9) = sqrt(25) = 5'
          ]
        },
        { heading: 'Pythagorean Triples (Memorize These!)',
          lines: [
            '3, 4, 5    |    5, 12, 13    |    8, 15, 17    |    7, 24, 25',
            'Multiples also work: 6,8,10  |  9,12,15  |  10,24,26',
            '',
            'Practice Problems:',
            '1. Find the hypotenuse if legs are 9 and 12.',
            '2. Find the missing leg: hypotenuse = 17, one leg = 8.',
            '3. A baseball diamond is a square with sides 27.4 m. How far is it from home to second base?',
            '4. Is a triangle with sides 7, 8, 11 a right triangle? Explain.',
            '',
            'Answers: 1. 15    2. 15    3. sqrt(2) x 27.4 = 38.7 m    4. 7^2+8^2=113 not 11^2=121, NO'
          ]
        }
      ]
    },

    'Math 9 — Polynomials': {
      title: 'Math 9 Study Notes: Polynomials',
      sections: [
        { heading: 'Polynomial Vocabulary',
          lines: [
            'TERM: a number, variable, or product of numbers and variables (e.g., 3x^2)',
            'POLYNOMIAL: an expression with one or more terms using addition/subtraction',
            'MONOMIAL: 1 term    BINOMIAL: 2 terms    TRINOMIAL: 3 terms',
            'DEGREE: highest exponent on the variable. Degree of 4x^3 - 2x + 1 is 3.',
            'COEFFICIENT: the number multiplying the variable (in 5x^2, the coefficient is 5)',
            'LIKE TERMS: same variable AND same exponent (3x^2 and -7x^2 are like terms)'
          ]
        },
        { heading: 'Adding & Subtracting Polynomials',
          lines: [
            'Collect like terms — add/subtract coefficients of matching terms.',
            '',
            'Example: (3x^2 + 2x - 1) + (x^2 - 5x + 4)',
            '  = (3x^2 + x^2) + (2x - 5x) + (-1 + 4)',
            '  = 4x^2 - 3x + 3',
            '',
            'For SUBTRACTION, distribute the negative sign first:',
            'Example: (5x^2 + 3x) - (2x^2 - x + 7)',
            '  = 5x^2 + 3x - 2x^2 + x - 7',
            '  = 3x^2 + 4x - 7'
          ]
        },
        { heading: 'Multiplying Polynomials (FOIL)',
          lines: [
            'FOIL: First, Outer, Inner, Last — for multiplying two binomials.',
            '',
            'Example: (x + 3)(x - 2)',
            '  F: x * x = x^2',
            '  O: x * (-2) = -2x',
            '  I: 3 * x = 3x',
            '  L: 3 * (-2) = -6',
            '  = x^2 - 2x + 3x - 6 = x^2 + x - 6',
            '',
            'Special products:',
            '(a+b)^2 = a^2 + 2ab + b^2',
            '(a-b)^2 = a^2 - 2ab + b^2',
            '(a+b)(a-b) = a^2 - b^2  (Difference of Squares)'
          ]
        },
        { heading: 'Factoring Polynomials',
          lines: [
            'STEP 1: Always check for GCF first!',
            '  Example: 6x^2 + 9x = 3x(2x + 3)',
            '',
            'DIFFERENCE OF SQUARES: a^2 - b^2 = (a+b)(a-b)',
            '  Example: x^2 - 25 = (x+5)(x-5)',
            '',
            'TRINOMIAL FACTORING (a=1): x^2 + bx + c = (x+p)(x+q)',
            '  Find p and q: p * q = c AND p + q = b',
            '  Example: x^2 - 5x + 6  -> p*q=6, p+q=-5 -> p=-2, q=-3',
            '  = (x-2)(x-3)',
            '',
            'PERFECT SQUARE TRINOMIALS:',
            '  x^2 + 6x + 9 = (x+3)^2    x^2 - 10x + 25 = (x-5)^2'
          ]
        }
      ]
    },

    'Math 10C — Trigonometry': {
      title: 'Math 10C Study Notes: Right Triangle Trigonometry',
      sections: [
        { heading: 'The Primary Trig Ratios',
          lines: [
            'For a RIGHT triangle with an acute angle theta:',
            '',
            '  sin(theta) = opposite side / hypotenuse',
            '  cos(theta) = adjacent side / hypotenuse',
            '  tan(theta) = opposite side / adjacent side',
            '',
            'Memory aid: SOH-CAH-TOA',
            '  S = Sin   O = Opposite   H = Hypotenuse',
            '  C = Cos   A = Adjacent   H = Hypotenuse',
            '  T = Tan   O = Opposite   A = Adjacent'
          ]
        },
        { heading: 'Finding a Missing Side',
          lines: [
            'Step 1: Label the sides (opposite, adjacent, hypotenuse) relative to theta.',
            'Step 2: Choose the trig ratio that uses the known side and unknown side.',
            'Step 3: Set up the equation and solve.',
            '',
            'Example: theta = 35 degrees, hypotenuse = 20 cm. Find the opposite side.',
            '  sin(35) = opposite / 20',
            '  opposite = 20 x sin(35) = 20 x 0.5736 = 11.47 cm',
            '',
            'Example: theta = 50 degrees, adjacent = 15 cm. Find the hypotenuse.',
            '  cos(50) = 15 / hypotenuse',
            '  hypotenuse = 15 / cos(50) = 15 / 0.6428 = 23.34 cm'
          ]
        },
        { heading: 'Finding a Missing Angle',
          lines: [
            'Use INVERSE trig functions when you know two sides.',
            '',
            '  theta = sin^-1(opp/hyp)',
            '  theta = cos^-1(adj/hyp)',
            '  theta = tan^-1(opp/adj)',
            '',
            'Example: opposite = 5, adjacent = 12. Find theta.',
            '  theta = tan^-1(5/12) = tan^-1(0.4167) = 22.6 degrees',
            '',
            'Example: opposite = 8, hypotenuse = 17. Find theta.',
            '  theta = sin^-1(8/17) = sin^-1(0.4706) = 28.1 degrees'
          ]
        },
        { heading: 'Angles of Elevation and Depression',
          lines: [
            'Angle of ELEVATION: measured UPWARD from horizontal to the object.',
            'Angle of DEPRESSION: measured DOWNWARD from horizontal to the object.',
            'These angles are EQUAL (alternate interior angles with parallel horizontal lines).',
            '',
            'Example — Elevation: Person stands 50 m from a building.',
            '  They look up at 40 degrees to see the top.',
            '  tan(40) = height / 50   =>   height = 50 x tan(40) = 41.95 m',
            '',
            'Example — Depression: From top of 30 m cliff, angle of depression to boat = 25 degrees.',
            '  tan(25) = 30 / distance   =>   distance = 30 / tan(25) = 64.3 m'
          ]
        }
      ]
    },

    'Math 20-1 — Quadratic Functions': {
      title: 'Math 20-1 Study Notes: Quadratic Functions',
      sections: [
        { heading: 'Forms of a Quadratic Function',
          lines: [
            'STANDARD FORM:  y = ax^2 + bx + c',
            '  a tells direction: a>0 opens UP (min),  a<0 opens DOWN (max)',
            '  c is the y-intercept',
            '',
            'VERTEX FORM:  y = a(x - h)^2 + k',
            '  Vertex is at (h, k)',
            '  Axis of symmetry: x = h',
            '  If a > 0: minimum value is k.  If a < 0: maximum value is k.',
            '',
            'FACTORED FORM:  y = a(x - r)(x - s)',
            '  x-intercepts (zeros/roots) are at x = r and x = s',
            '  Axis of symmetry: x = (r + s) / 2'
          ]
        },
        { heading: 'Completing the Square',
          lines: [
            'Purpose: convert standard form to vertex form.',
            '',
            'When a = 1:',
            '  y = x^2 + bx + c',
            '  = (x^2 + bx + (b/2)^2) - (b/2)^2 + c',
            '  = (x + b/2)^2 - (b/2)^2 + c',
            '',
            'Example: y = x^2 + 6x + 5',
            '  = (x^2 + 6x + 9) - 9 + 5',
            '  = (x + 3)^2 - 4      Vertex: (-3, -4)',
            '',
            'When a is not 1:',
            '  y = 2x^2 - 8x + 3',
            '  = 2(x^2 - 4x) + 3',
            '  = 2(x^2 - 4x + 4 - 4) + 3',
            '  = 2(x - 2)^2 - 8 + 3',
            '  = 2(x - 2)^2 - 5      Vertex: (2, -5)'
          ]
        },
        { heading: 'The Quadratic Formula & Discriminant',
          lines: [
            'For ax^2 + bx + c = 0:',
            '  x = (-b +/- sqrt(b^2 - 4ac)) / (2a)',
            '',
            'THE DISCRIMINANT: D = b^2 - 4ac',
            '  D > 0: TWO distinct real roots (parabola crosses x-axis twice)',
            '  D = 0: ONE real root (parabola touches x-axis once — vertex on x-axis)',
            '  D < 0: NO real roots (parabola does not cross x-axis)',
            '',
            'Example: Solve 2x^2 - 5x - 3 = 0',
            '  a=2, b=-5, c=-3',
            '  D = (-5)^2 - 4(2)(-3) = 25 + 24 = 49',
            '  x = (5 +/- 7) / 4',
            '  x = 12/4 = 3   OR   x = -2/4 = -0.5'
          ]
        }
      ]
    },

    'Math 30-1 — Trigonometry': {
      title: 'Math 30-1 Study Notes: Trigonometry',
      sections: [
        { heading: 'Radian Measure',
          lines: [
            'A RADIAN is the angle subtended when arc length equals the radius.',
            '180 degrees = pi radians',
            '',
            'To convert degrees to radians: multiply by pi/180',
            'To convert radians to degrees: multiply by 180/pi',
            '',
            'Common conversions:',
            '  0 = 0 deg    pi/6 = 30 deg    pi/4 = 45 deg    pi/3 = 60 deg',
            '  pi/2 = 90 deg    pi = 180 deg    3pi/2 = 270 deg    2pi = 360 deg',
            '',
            'Arc length: a = r * theta   (theta must be in radians)',
            'Sector area: A = (1/2)r^2 * theta'
          ]
        },
        { heading: 'Unit Circle & Special Triangles',
          lines: [
            'The unit circle has radius 1, centered at origin.',
            'For angle theta: point on circle is (cos theta, sin theta).',
            '',
            '30-60-90 triangle: sides in ratio 1 : sqrt(3) : 2',
            '  sin 30 = 1/2,  cos 30 = sqrt(3)/2,  tan 30 = 1/sqrt(3)',
            '  sin 60 = sqrt(3)/2,  cos 60 = 1/2,  tan 60 = sqrt(3)',
            '',
            '45-45-90 triangle: sides in ratio 1 : 1 : sqrt(2)',
            '  sin 45 = cos 45 = sqrt(2)/2,  tan 45 = 1',
            '',
            'CAST Rule (which trig values are positive in each quadrant):',
            '  Q1: All positive    Q2: Sin positive',
            '  Q3: Tan positive    Q4: Cos positive'
          ]
        },
        { heading: 'Trig Identities',
          lines: [
            'PYTHAGOREAN IDENTITIES:',
            '  sin^2(x) + cos^2(x) = 1',
            '  1 + tan^2(x) = sec^2(x)',
            '  1 + cot^2(x) = csc^2(x)',
            '',
            'RECIPROCAL IDENTITIES:',
            '  csc(x) = 1/sin(x)    sec(x) = 1/cos(x)    cot(x) = 1/tan(x)',
            '',
            'QUOTIENT IDENTITIES:',
            '  tan(x) = sin(x)/cos(x)    cot(x) = cos(x)/sin(x)',
            '',
            'Strategy for PROVING identities:',
            '  1. Work on ONE side only (usually more complex side)',
            '  2. Use substitution with known identities',
            '  3. Factor, expand, or simplify to match the other side',
            '  4. Never move terms from one side to the other!'
          ]
        }
      ]
    }
  },

  // ------- WORKSHEETS -------
  worksheets: {

    'Math 7 Integers Worksheet': {
      title: 'Math 7 Practice Worksheet: Integers',
      sections: [
        { heading: 'Part A — Adding and Subtracting Integers (1 mark each)',
          lines: [
            '1.  (-5) + 8 = ____',
            '2.  (-3) + (-7) = ____',
            '3.  (+6) + (-9) = ____',
            '4.  (-12) + 5 = ____',
            '5.  (-8) - 3 = ____',
            '6.  4 - (-6) = ____',
            '7.  (-9) - (-4) = ____',
            '8.  0 - (-11) = ____',
            '9.  (-15) + 15 = ____',
            '10. 7 - 13 = ____'
          ]
        },
        { heading: 'Part B — Multiplying and Dividing Integers (1 mark each)',
          lines: [
            '11. (-4) x (-3) = ____',
            '12. (-6) x 5 = ____',
            '13. (+8) x (-2) = ____',
            '14. (-7) x (-7) = ____',
            '15. (-24) / 8 = ____',
            '16. (-18) / (-3) = ____',
            '17. 36 / (-4) = ____',
            '18. (-5) x (-4) x (-2) = ____',
            '19. (-3)^2 = ____',
            '20. -3^2 = ____'
          ]
        },
        { heading: 'Part C — Order of Operations (2 marks each)',
          lines: [
            '21. (-2) + 3 x (-4) = ____',
            '22. [(-3) + 5] x (-2) = ____',
            '23. 4 - 2 x (-3) + 1 = ____',
            '24. (-6)^2 / (-4) + 7 = ____',
            '25. [8 - (-2)] / (-5) + 3 = ____'
          ]
        },
        { heading: 'Part D — Word Problems (3 marks each)',
          lines: [
            '26. The temperature was -8 C at night and rose 12 C by noon. What was the noon temperature?',
            '27. A submarine is at -120 m. It rises 45 m, then descends 30 m. What is the final depth?',
            '28. A hockey team scores +3, -2, 0, +1, -1 over five games (+ = win, - = loss).',
            '    What is the total goal difference?',
            '',
            '--- ANSWER KEY ---',
            'Part A: 1.3  2.-10  3.-3  4.-7  5.-11  6.10  7.-5  8.11  9.0  10.-6',
            'Part B: 11.12  12.-30  13.-16  14.49  15.-3  16.6  17.-9  18.-40  19.9  20.-9',
            'Part C: 21.-14  22.-4  23.11  24.-2  25.1',
            'Part D: 26.4C  27.-105m  28.1'
          ]
        }
      ]
    },

    'Math 8 Pythagorean Theorem Worksheet': {
      title: 'Math 8 Practice Worksheet: Pythagorean Theorem',
      sections: [
        { heading: 'Part A — Find the Hypotenuse (2 marks each)',
          lines: [
            '1. Legs: 3 cm and 4 cm.          Hypotenuse = ____',
            '2. Legs: 5 cm and 12 cm.         Hypotenuse = ____',
            '3. Legs: 8 cm and 15 cm.         Hypotenuse = ____',
            '4. Legs: 7 cm and 24 cm.         Hypotenuse = ____',
            '5. Legs: 9 cm and 40 cm.         Hypotenuse = ____'
          ]
        },
        { heading: 'Part B — Find the Missing Leg (2 marks each)',
          lines: [
            '6.  Hypotenuse = 10, one leg = 6.    Missing leg = ____',
            '7.  Hypotenuse = 17, one leg = 8.    Missing leg = ____',
            '8.  Hypotenuse = 25, one leg = 7.    Missing leg = ____',
            '9.  Hypotenuse = 26, one leg = 10.   Missing leg = ____',
            '10. Hypotenuse = 50, one leg = 14.   Missing leg = ____'
          ]
        },
        { heading: 'Part C — Word Problems (3 marks each)',
          lines: [
            '11. A 13 m ladder leans against a wall. The base is 5 m from the wall.',
            '    How high up the wall does the ladder reach?',
            '',
            '12. A rectangular field is 48 m long and 36 m wide.',
            '    What is the length of the diagonal path across the field?',
            '',
            '13. Two friends walk from the same starting point.',
            '    Friend A walks 30 km north, Friend B walks 40 km east.',
            '    How far apart are they?',
            '',
            '14. Is a triangle with sides 9, 40, and 41 a right triangle? Show your work.',
            '',
            '',
            '--- ANSWER KEY ---',
            'Part A: 1.5  2.13  3.17  4.25  5.41',
            'Part B: 6.8  7.15  8.24  9.24  10.48',
            'Part C: 11.12m  12.60m  13.50km  14.yes: 9^2+40^2=81+1600=1681=41^2'
          ]
        }
      ]
    },

    'Math 9 Factoring Worksheet': {
      title: 'Math 9 Practice Worksheet: Factoring Polynomials',
      sections: [
        { heading: 'Part A — GCF Factoring (1 mark each)',
          lines: [
            '1.  6x + 9                    = ____',
            '2.  4x^2 - 8x                = ____',
            '3.  15x^3 + 10x^2 - 5x      = ____',
            '4.  12a^2b - 8ab^2           = ____',
            '5.  -3x^2 + 6x - 9          = ____'
          ]
        },
        { heading: 'Part B — Difference of Squares (1 mark each)',
          lines: [
            '6.  x^2 - 9                  = ____',
            '7.  x^2 - 49                 = ____',
            '8.  4x^2 - 25                = ____',
            '9.  9a^2 - 16b^2             = ____',
            '10. 100 - x^2               = ____'
          ]
        },
        { heading: 'Part C — Trinomial Factoring a=1 (2 marks each)',
          lines: [
            '11. x^2 + 5x + 6             = ____',
            '12. x^2 - 7x + 12            = ____',
            '13. x^2 + 2x - 15            = ____',
            '14. x^2 - x - 20             = ____',
            '15. x^2 - 10x + 25           = ____'
          ]
        },
        { heading: 'Part D — Factor Fully (2 marks each)',
          lines: [
            '16. 2x^2 + 6x + 4            = ____',
            '17. 3x^2 - 27                = ____',
            '18. x^3 - 5x^2 + 6x          = ____',
            '19. 2x^2 - 2x - 24           = ____',
            '20. 5x^3 - 5x                = ____',
            '',
            '',
            '--- ANSWER KEY ---',
            'A: 1.3(2x+3)  2.4x(x-2)  3.5x(3x^2+2x-1)  4.4ab(3a-2b)  5.-3(x^2-2x+3)',
            'B: 6.(x+3)(x-3)  7.(x+7)(x-7)  8.(2x+5)(2x-5)  9.(3a+4b)(3a-4b)  10.(10+x)(10-x)',
            'C: 11.(x+2)(x+3)  12.(x-3)(x-4)  13.(x+5)(x-3)  14.(x-5)(x+4)  15.(x-5)^2',
            'D: 16.2(x+1)(x+2)  17.3(x+3)(x-3)  18.x(x-2)(x-3)  19.2(x-4)(x+3)  20.5x(x+1)(x-1)'
          ]
        }
      ]
    },

    'Math 10C Trigonometry Worksheet': {
      title: 'Math 10C Practice Worksheet: Right Triangle Trigonometry',
      sections: [
        { heading: 'Part A — Find the Missing Side (2 marks each)',
          lines: [
            '1. theta = 30 deg, hypotenuse = 20. Find the opposite side.',
            '2. theta = 45 deg, adjacent = 10. Find the hypotenuse.',
            '3. theta = 60 deg, hypotenuse = 14. Find the adjacent side.',
            '4. theta = 25 deg, adjacent = 8. Find the opposite side.',
            '5. theta = 55 deg, opposite = 12. Find the hypotenuse.'
          ]
        },
        { heading: 'Part B — Find the Missing Angle (2 marks each)',
          lines: [
            '6.  opposite = 5, hypotenuse = 13. Find theta.',
            '7.  adjacent = 8, hypotenuse = 10. Find theta.',
            '8.  opposite = 7, adjacent = 24. Find theta.',
            '9.  opposite = 12, adjacent = 12. Find theta.',
            '10. opposite = 3, hypotenuse = 7. Find theta.'
          ]
        },
        { heading: 'Part C — Word Problems (3 marks each)',
          lines: [
            '11. A ramp rises 2 m over a horizontal distance of 8 m. What is the angle of inclination?',
            '',
            '12. A kite is flying on a 50 m string. The string makes an angle of 55 degrees with the ground.',
            '    How high is the kite above the ground?',
            '',
            '13. From the top of a 40 m lighthouse, the angle of depression to a boat is 18 degrees.',
            '    How far is the boat from the base of the lighthouse?',
            '',
            '14. A surveyor is 120 m from a building. The angle of elevation to the top is 32 degrees.',
            '    Find the height of the building.',
            '',
            '',
            '--- ANSWER KEY ---',
            'A: 1.10  2.14.14  3.7  4.3.73  5.14.65',
            'B: 6.22.6 deg  7.36.9 deg  8.16.3 deg  9.45 deg  10.25.4 deg',
            'C: 11.14.0 deg  12.40.96 m  13.123.1 m  14.74.98 m'
          ]
        }
      ]
    },

    'Math 20-1 Quadratics Worksheet': {
      title: 'Math 20-1 Practice Worksheet: Quadratic Functions',
      sections: [
        { heading: 'Part A — Vertex Form (2 marks each)',
          lines: [
            '1. State the vertex and axis of symmetry of y = (x - 3)^2 + 5.',
            '2. State the vertex and axis of symmetry of y = -2(x + 1)^2 - 4.',
            '3. Does y = 3(x - 2)^2 + 1 open up or down? What is the min or max value?',
            '4. Write the equation (vertex form) of a parabola with vertex (-2, 7) that opens downward with a=1.'
          ]
        },
        { heading: 'Part B — Complete the Square (3 marks each)',
          lines: [
            '5.  Convert to vertex form: y = x^2 + 4x + 1',
            '6.  Convert to vertex form: y = x^2 - 6x + 11',
            '7.  Convert to vertex form: y = 2x^2 + 8x + 5',
            '8.  Convert to vertex form: y = -x^2 + 4x - 3'
          ]
        },
        { heading: 'Part C — Quadratic Formula (2 marks each)',
          lines: [
            '9.  Solve: x^2 - 5x + 6 = 0',
            '10. Solve: 2x^2 + 5x - 3 = 0',
            '11. Solve: x^2 - 4x + 5 = 0  (use discriminant to classify)',
            '12. Solve: 3x^2 - 7x - 6 = 0',
            '13. Solve: x^2 + 6x + 9 = 0  (identify the type of root)'
          ]
        },
        { heading: 'Part D — Applications (4 marks each)',
          lines: [
            '14. A ball is thrown upward. Its height is h = -5t^2 + 20t + 2, where h is in metres and t in seconds.',
            '    a) What is the maximum height?',
            '    b) When does it reach maximum height?',
            '    c) When does it hit the ground?',
            '',
            '--- ANSWER KEY ---',
            'A: 1.V(3,5),x=3  2.V(-1,-4),x=-1  3.up,min=1  4.y=-(x+2)^2+7',
            'B: 5.(x+2)^2-3  6.(x-3)^2+2  7.2(x+2)^2-3  8.-(x-2)^2+1',
            'C: 9.x=2,3  10.x=0.5,-3  11.D=-4,no real roots  12.x=3,-2/3  13.x=-3 (double root)',
            'D: 14a.22m  14b.t=2s  14c.t=~4.1s'
          ]
        }
      ]
    },

    'Math 30-1 Trig Identities Worksheet': {
      title: 'Math 30-1 Practice Worksheet: Trigonometric Identities',
      sections: [
        { heading: 'Part A — Simplify Each Expression',
          lines: [
            '1. sin^2(x) / cos^2(x)  +  1 / cos^2(x)',
            '2. sin(x) * cot(x)',
            '3. (1 - sin^2(x)) / cos(x)',
            '4. sin^2(x) + cos^2(x) + tan^2(x)',
            '5. (sec^2(x) - 1) / sin^2(x)'
          ]
        },
        { heading: 'Part B — Prove Each Identity',
          lines: [
            '6.  Prove: sin^2(x) / cos(x) = sec(x) - cos(x)',
            '',
            '7.  Prove: (1 + tan(x))^2 = sec^2(x) + 2tan(x)',
            '',
            '8.  Prove: cos^2(x) - sin^2(x) = 2cos^2(x) - 1',
            '',
            '9.  Prove: tan(x) + cot(x) = sec(x) * csc(x)',
            '',
            '10. Prove: (sin(x) + cos(x))^2 = 1 + 2sin(x)cos(x)'
          ]
        },
        { heading: 'Part C — Solving Trig Equations (give all solutions in [0, 2pi])',
          lines: [
            '11. sin(x) = 1/2',
            '12. cos(x) = -sqrt(3)/2',
            '13. tan(x) = 1',
            '14. 2sin^2(x) - 1 = 0',
            '15. 2cos^2(x) + cos(x) - 1 = 0',
            '',
            '',
            '--- ANSWER KEY ---',
            'A: 1.sec^2(x)  2.cos(x)  3.cos(x)  4.sec^2(x)  5.cot^2(x)',
            'C: 11.pi/6,5pi/6  12.5pi/6,7pi/6  13.pi/4,5pi/4',
            '   14.pi/4,3pi/4,5pi/4,7pi/4  15.x=pi/3,pi,5pi/3'
          ]
        }
      ]
    }
  },

  // ------- UNIT EXAMS -------
  exams: {

    'Math 7 Unit 1 Exam — Integers': {
      title: 'Math 7 — Unit 1 Exam: Integers',
      sections: [
        { heading: 'Instructions',
          lines: [
            'Time allowed: 45 minutes    |    Total: 30 marks    |    Calculator: NOT permitted',
            'Show all work for full marks. Write final answers with units where applicable.'
          ]
        },
        { heading: 'Part A — Multiple Choice (1 mark each)',
          lines: [
            '1. Which integer has the greatest value?',
            '   a) -7    b) -2    c) 0    d) -10',
            '',
            '2. What is (-5) + (-8)?',
            '   a) 13    b) -13    c) 3    d) -3',
            '',
            '3. What is 6 - (-4)?',
            '   a) 2    b) -2    c) 10    d) -10',
            '',
            '4. What is (-3) x (-5)?',
            '   a) -15    b) 15    c) -8    d) 8',
            '',
            '5. What is (-24) / 6?',
            '   a) 4    b) -4    c) 18    d) -18'
          ]
        },
        { heading: 'Part B — Short Answer (2 marks each)',
          lines: [
            '6.  Calculate: (-9) + 4 - (-3)',
            '7.  Calculate: (-2) x 5 x (-3)',
            '8.  Calculate: [(-6) + 2] x (-4)',
            '9.  Calculate: (-18) / (-3) + (-7)',
            '10. Order from least to greatest: -4, 2, -1, 0, -7, 5',
            '11. Find the value: -3^2 + (-3)^2',
            '12. Evaluate: (-2)^3 - 4 x (-3)'
          ]
        },
        { heading: 'Part C — Word Problems (4 marks each)',
          lines: [
            '13. The temperature Monday was -12 C. It rose 8 C on Tuesday, dropped 15 C on',
            '    Wednesday, and rose 6 C on Thursday. What was the temperature on Thursday?',
            '',
            '14. A scuba diver is at -45 m. She ascends 18 m, then descends 29 m, then ascends 12 m.',
            '    What is her final depth? How much farther must she ascend to reach the surface?',
            '',
            '',
            '--- ANSWER KEY ---',
            'Part A: 1.c  2.b  3.c  4.b  5.b',
            'Part B: 6.-2  7.30  8.16  9.-1  10.-7,-4,-1,0,2,5  11.0  12.-8+12=4',
            'Part C: 13.-12+8-15+6=-13C  14.-45+18-29+12=-44m  must ascend 44m'
          ]
        }
      ]
    },

    'Math 8 Unit 1 Exam — Pythagorean Theorem': {
      title: 'Math 8 — Unit 1 Exam: Pythagorean Theorem & Square Roots',
      sections: [
        { heading: 'Instructions',
          lines: [
            'Time allowed: 50 minutes    |    Total: 35 marks    |    Calculator: Permitted',
            'Show all work. Round answers to one decimal place unless exact.'
          ]
        },
        { heading: 'Part A — Square Roots (1 mark each)',
          lines: [
            '1.  sqrt(144) = ____',
            '2.  sqrt(225) = ____',
            '3.  Estimate sqrt(50) to one decimal place. ____',
            '4.  Estimate sqrt(30) to one decimal place. ____',
            '5.  Is sqrt(81) rational or irrational? Explain.'
          ]
        },
        { heading: 'Part B — Pythagorean Theorem (3 marks each)',
          lines: [
            '6.  Legs: a=9, b=12. Find hypotenuse c.',
            '7.  Legs: a=7, b=24. Find hypotenuse c.',
            '8.  Hypotenuse=20, leg=16. Find the other leg.',
            '9.  Hypotenuse=15, leg=9. Find the other leg.',
            '10. Determine if a triangle with sides 11, 60, 61 is a right triangle. Show work.'
          ]
        },
        { heading: 'Part C — Applications (4 marks each)',
          lines: [
            '11. A 15 m ladder is placed against a building. The base is 9 m from the building.',
            '    How high up the building does the ladder reach?',
            '',
            '12. A rectangular park is 80 m long and 60 m wide.',
            '    a) Find the length of the diagonal path across the park.',
            '    b) If you walk along two sides vs. the diagonal, how much farther do you walk?',
            '',
            '13. Two poles are 12 m apart. One is 8 m tall and the other is 3 m tall.',
            '    Find the distance between the tops of the poles.',
            '',
            '--- ANSWER KEY ---',
            'A: 1.12  2.15  3.~7.1  4.~5.5  5.Rational, sqrt81=9 exactly',
            'B: 6.15  7.25  8.12  9.12  10.11^2+60^2=121+3600=3721=61^2 YES',
            'C: 11.h=sqrt(225-81)=12m  12a.100m  12b.140-100=40m  13.d=sqrt(144+25)=13m'
          ]
        }
      ]
    },

    'Math 9 Final Exam': {
      title: 'Math 9 Final Exam — Alberta New Curriculum',
      sections: [
        { heading: 'Instructions',
          lines: [
            'Time: 90 minutes    |    Total: 60 marks    |    Calculator: Permitted on Part B & C only',
            'Show complete solutions. Partial marks awarded where applicable.'
          ]
        },
        { heading: 'Part A — Exponents & Polynomials (2 marks each)',
          lines: [
            '1.  Simplify: x^3 * x^4',
            '2.  Simplify: (2x^2)^3',
            '3.  Evaluate: 3^0 + 2^(-2)',
            '4.  Simplify: (a^3 b^2) / (a b^4)',
            '5.  Expand: (x + 4)(x - 3)',
            '6.  Expand and simplify: (2x - 1)^2',
            '7.  Factor: x^2 - 36',
            '8.  Factor: x^2 + 3x - 10',
            '9.  Factor fully: 3x^2 - 12',
            '10. Factor fully: 2x^3 - 8x'
          ]
        },
        { heading: 'Part B — Linear Relations (3 marks each)',
          lines: [
            '11. Find the slope of the line through (2, -1) and (5, 8).',
            '12. Write the equation of a line with slope -3 and y-intercept 5.',
            '13. Find the slope and y-intercept of 4x - 2y = 8.',
            '14. Write the equation of the line through (-1, 4) with slope 2.',
            '15. Graph the line y = (2/3)x - 1. Describe how you would graph it.'
          ]
        },
        { heading: 'Part C — Systems of Equations (4 marks each)',
          lines: [
            '16. Solve by substitution: y = 2x - 1  and  3x + y = 9',
            '17. Solve by elimination: 2x + 3y = 12  and  4x - 3y = 6',
            '18. Two numbers have a sum of 40 and a difference of 8. Find the numbers.',
            '19. Adult tickets cost $12 and student tickets cost $7. If 200 tickets were sold',
            '    for $1800, how many of each type were sold?',
            '',
            '--- ANSWER KEY ---',
            'A: 1.x^7  2.8x^6  3.1.25  4.a^2/b^2  5.x^2+x-12  6.4x^2-4x+1',
            '   7.(x+6)(x-6)  8.(x+5)(x-2)  9.3(x+2)(x-2)  10.2x(x+2)(x-2)',
            'B: 11.m=3  12.y=-3x+5  13.m=2,b=-4  14.y=2x+6  15.plot(0,-1),rise2run3',
            'C: 16.(2,3)  17.(3,2)  18.24,16  19.80adult,120student'
          ]
        }
      ]
    },

    'Math 10C Final Exam': {
      title: 'Math 10C Final Exam — Alberta New Curriculum',
      sections: [
        { heading: 'Instructions',
          lines: [
            'Time: 2 hours    |    Total: 75 marks    |    Calculator: Permitted',
            'Show all work for full marks. Scientific calculator is required.'
          ]
        },
        { heading: 'Part A — Measurement (2 marks each)',
          lines: [
            '1.  Convert 5.5 feet to centimetres.',
            '2.  Convert 3.2 km to miles (1 mile = 1.609 km).',
            '3.  A sphere has radius 6 cm. Find its volume (V=4/3*pi*r^3).',
            '4.  Find the surface area of a cylinder: r=4 cm, h=10 cm.',
            '5.  A cone has r=5 and slant height=13. Find SA (pi*r*slant + pi*r^2).'
          ]
        },
        { heading: 'Part B — Trigonometry (3 marks each)',
          lines: [
            '6.  Find the missing side: theta=42 deg, hypotenuse=30. Find opposite.',
            '7.  Find the missing angle: opposite=15, hypotenuse=25.',
            '8.  A 20 m ladder leans at 70 degrees. How high does it reach up the wall?',
            '9.  From a hilltop 150 m above a lake, the angle of depression to a boat is 22 deg.',
            '    Find the horizontal distance from the hilltop base to the boat.',
            '10. A plane flies 80 km north then 60 km east. Find its distance from the start.'
          ]
        },
        { heading: 'Part C — Algebra: Factoring (2 marks each)',
          lines: [
            '11. Factor: 4x^2 - 36',
            '12. Factor: x^2 + 7x + 12',
            '13. Factor: 3x^2 - 11x - 4',
            '14. Factor: 2x^2 - 18',
            '15. Factor completely: 2x^3 + 6x^2 - 8x'
          ]
        },
        { heading: 'Part D — Functions & Systems (4 marks each)',
          lines: [
            '16. Is {(1,3),(2,5),(3,3),(4,7)} a function? State domain and range.',
            '17. Find f(-2), f(0), f(3) for f(x) = x^2 - 3x + 1.',
            '18. Solve: 3x - 2y = 7  and  x + 4y = -1  by elimination.',
            '19. The 6th term of an arithmetic sequence is 23 and the common difference is 4.',
            '    Find the first term and the formula for the nth term.',
            '',
            '--- ANSWER KEY ---',
            'A: 1.167.64cm  2.1.99mi  3.904.8cm^3  4.351.9cm^2  5.282.7cm^2',
            'B: 6.20.08  7.36.9deg  8.18.79m  9.371.9m  10.100km',
            'C: 11.4(x+3)(x-3)  12.(x+3)(x+4)  13.(3x+1)(x-4)  14.2(x+3)(x-3)  15.2x(x+4)(x-1)',
            'D: 16.yes,D={1,2,3,4},R={3,5,7}  17.11,1,1  18.(3,-1)  19.t1=3,tn=4n-1'
          ]
        }
      ]
    },

    'Math 20-1 Diploma Practice Exam': {
      title: 'Math 20-1 Diploma Practice Exam — Alberta',
      sections: [
        { heading: 'Instructions',
          lines: [
            'Time: 2 hours    |    Total: 80 marks    |    Calculator: Permitted on Part B & C',
            'This exam mirrors the Alberta diploma format. Show complete solutions.'
          ]
        },
        { heading: 'Part A — Quadratic Functions (3 marks each)',
          lines: [
            '1.  Convert y = x^2 - 8x + 10 to vertex form. State the vertex.',
            '2.  Find the x-intercepts of y = 2x^2 - x - 6 using the quadratic formula.',
            '3.  A quadratic has vertex (3, -4) and passes through (1, 8). Write its equation.',
            '4.  Determine the number and nature of the roots of 3x^2 + 2x + 5 = 0.',
            '5.  A ball is thrown up: h = -4.9t^2 + 14.7t + 2. Find max height and when it hits ground.',
            '6.  Find the value(s) of k for which x^2 + kx + 9 = 0 has exactly one root.'
          ]
        },
        { heading: 'Part B — Radicals (3 marks each)',
          lines: [
            '7.  Simplify: sqrt(200) - 3*sqrt(8) + sqrt(50)',
            '8.  Simplify: (3*sqrt(2) + sqrt(6))(sqrt(2) - 2*sqrt(6))',
            '9.  Rationalize the denominator: 5 / (2 - sqrt(3))',
            '10. Solve: sqrt(3x - 5) = x - 1. Check for extraneous roots.',
            '11. Solve: sqrt(x+4) + sqrt(x-1) = 5.'
          ]
        },
        { heading: 'Part C — Sequences & Series (4 marks each)',
          lines: [
            '12. An arithmetic sequence has t3 = 11 and t8 = 31. Find t1 and d. Find S_20.',
            '13. A geometric sequence has t2 = 6 and t5 = 162. Find the common ratio and t1.',
            '14. Find the sum: 5 + 10 + 20 + ... to 8 terms.',
            '15. Does the infinite geometric series 12 + 4 + 4/3 + ... converge? If so, find its sum.',
            '16. A culture of bacteria doubles every hour. If it starts with 500, when will there be',
            '    16000 bacteria?',
            '',
            '--- ANSWER KEY ---',
            'A: 1.(x-4)^2-6,V(4,-6)  2.x=2,-3/2  3.y=3(x-3)^2-4  4.D=-56,no real roots',
            '   5.max=~13m at t=1.5s, hits at t~3.1s  6.k=6 or k=-6',
            'B: 7.10sqrt(2)-6sqrt(2)+5sqrt(2)=9sqrt(2)  8.6-12sqrt(3)+2sqrt(3)-6*sqrt(3)=6-12-10sqrt(3)... full work needed',
            '   9.5(2+sqrt(3))/(4-3)=10+5sqrt(3)  10.x=3,check x=2 extraneous  11.x=5',
            'C: 12.t1=3,d=4,S20=860  13.r=3,t1=2  14.1275  15.sum=18  16.t=5 hours'
          ]
        }
      ]
    },

    'Math 30-1 Diploma Practice Exam': {
      title: 'Math 30-1 Diploma Practice Exam — Alberta',
      sections: [
        { heading: 'Instructions',
          lines: [
            'Time: 2.5 hours    |    Total: 100 marks',
            'Part A: No calculator (25 marks)    Part B: Calculator permitted (75 marks)',
            'Show all work. This is a diploma-style practice exam.'
          ]
        },
        { heading: 'Part A — No Calculator (2 marks each)',
          lines: [
            '1.  Convert 240 degrees to exact radian measure.',
            '2.  State the exact value of cos(5pi/6).',
            '3.  State the exact value of tan(4pi/3).',
            '4.  Simplify: log_2(32)',
            '5.  Simplify: log(1000) + log(0.001)',
            '6.  Evaluate: 10 C 3',
            '7.  How many different arrangements of the letters in CANADA?',
            '8.  Simplify: sin^2(x) + cos^2(x) + 1',
            '9.  What is the period of y = sin(3x)?',
            '10. Evaluate: 5P3'
          ]
        },
        { heading: 'Part B — Calculator Permitted (3-4 marks each)',
          lines: [
            '11. Solve: 2sin^2(x) - sin(x) - 1 = 0 for x in [0, 2pi].',
            '12. Prove: tan^2(x) - sin^2(x) = tan^2(x) * sin^2(x)',
            '13. Solve: 2^(3x-1) = 5^x. Give exact and decimal answer.',
            '14. Solve: log(x+3) + log(x-2) = 1.',
            '15. Expand (2x - 3)^5 using Binomial Theorem. Find the 3rd term.',
            '16. How many 5-digit numbers can be formed from {1,2,3,4,5,6,7} if',
            '    a) digits can be repeated?',
            '    b) digits cannot be repeated?',
            '    c) must be even and digits cannot be repeated?',
            '17. The graph of y = a*cos(b(x - c)) + d has amplitude 3, period pi,',
            '    phase shift pi/4 right, vertical shift down 1. Write its equation.',
            '18. Solve the system: log(x) + log(y) = 3  and  log(x) - log(y) = 1.',
            '',
            '--- ANSWER KEY ---',
            'A: 1.4pi/3  2.-sqrt(3)/2  3.sqrt(3)  4.5  5.0  6.120  7.6!/3!=120  8.2  9.2pi/3  10.60',
            'B: 11.x=pi/2,7pi/6,11pi/6  12.LHS=sin^2/cos^2-sin^2=(sin^2-sin^2cos^2)/cos^2=sin^4/cos^2=RHS',
            '   13.x=1/(3-log5/log2), ~0.786  14.x=4 (reject x=-5)  15.T3=C(5,2)(2x)^3(-3)^2=360x^3',
            '   16a.7^5=16807  16b.7P5=2520  16c.2520*2/7=720... full work needed',
            '   17.y=3cos(2(x-pi/4))-1  18.xy=1000,x/y=10 => x=100,y=10'
          ]
        }
      ]
    }
  }
};

// Build filename sanitizer
function safeName(title) {
  return title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_').substring(0, 60) + '.pdf';
}

// Master download dispatcher
function generateAndDownload(category, key) {
  var content = PDF_CONTENT[category] && PDF_CONTENT[category][key];
  if (!content) {
    alert('PDF content for "' + key + '" is not yet available. Check back soon!');
    return;
  }
  try {
    var dataUrl = PDF.build(content.title, content.sections);
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = safeName(content.title);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (window.recordDownload) window.recordDownload();
  } catch (e) {
    alert('Sorry, there was an error generating the PDF. Please try again.');
    console.error(e);
  }
}

// ================================================================
// SVG HELPERS (inline graphs for lessons)
// ================================================================
function svgDefs() {
  return '<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#333"/></marker></defs>';
}
function makeSVG(w, h, content) {
  return '<div class="svg-wrap"><svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e0e0e0;border-radius:8px">' + svgDefs() + content + '</svg></div>';
}
function coordinateGridSVG(pts, lines) {
  var w = 280, h = 280;
  var xMin = -5, xMax = 5, yMin = -5, yMax = 5;
  var xs = (w - 60) / (xMax - xMin);
  var ys = (h - 60) / (yMax - yMin);
  var ox = 30 + (-xMin) * xs;
  var oy = h - 30 - (-yMin) * ys;
  var content = '';
  for (var x = xMin; x <= xMax; x++) {
    var px = 30 + (x - xMin) * xs;
    content += '<line x1="' + px + '" y1="30" x2="' + px + '" y2="' + (h - 30) + '" stroke="#e0e0e0" stroke-width="0.5"/>';
    if (x !== 0) content += '<text x="' + px + '" y="' + (oy + 14) + '" text-anchor="middle" font-size="10" fill="#888">' + x + '</text>';
  }
  for (var y = yMin; y <= yMax; y++) {
    var py = h - 30 - (y - yMin) * ys;
    content += '<line x1="30" y1="' + py + '" x2="' + (w - 30) + '" y2="' + py + '" stroke="#e0e0e0" stroke-width="0.5"/>';
    if (y !== 0) content += '<text x="' + (ox - 6) + '" y="' + (py + 4) + '" text-anchor="end" font-size="10" fill="#888">' + y + '</text>';
  }
  content += '<line x1="30" y1="' + oy + '" x2="' + (w - 30) + '" y2="' + oy + '" stroke="#333" stroke-width="1.5" marker-end="url(#arr)"/>';
  content += '<line x1="' + ox + '" y1="' + (h - 30) + '" x2="' + ox + '" y2="30" stroke="#333" stroke-width="1.5" marker-end="url(#arr)"/>';
  content += '<text x="' + (ox - 8) + '" y="' + (oy + 14) + '" text-anchor="middle" font-size="9" fill="#888">0</text>';
  if (lines) {
    lines.forEach(function (l) {
      var pts2 = [];
      for (var xi = xMin; xi <= xMax; xi += 0.1) {
        var yi = l.m * xi + l.b;
        pts2.push((ox + xi * xs) + ',' + (oy - yi * ys));
      }
      content += '<polyline points="' + pts2.join(' ') + '" fill="none" stroke="' + (l.color || '#1A6BB5') + '" stroke-width="2.5"/>';
    });
  }
  if (pts) {
    pts.forEach(function (p) {
      var ppx = ox + p.x * xs;
      var ppy = oy - p.y * ys;
      content += '<circle cx="' + ppx + '" cy="' + ppy + '" r="4" fill="' + (p.color || '#DC3545') + '"/>';
      if (p.label) content += '<text x="' + (ppx + 6) + '" y="' + (ppy - 4) + '" font-size="10" fill="#333">' + p.label + '</text>';
    });
  }
  return makeSVG(w, h, content);
}
function numberLineSVG(min, max) {
  var w = 380, h = 55, pad = 30;
  var scale = (w - 2 * pad) / (max - min);
  var mid = h / 2;
  var c = '<line x1="' + pad + '" y1="' + mid + '" x2="' + (w - pad) + '" y2="' + mid + '" stroke="#333" stroke-width="2"/>';
  for (var i = min; i <= max; i++) {
    var px = pad + (i - min) * scale;
    c += '<line x1="' + px + '" y1="' + (mid - 6) + '" x2="' + px + '" y2="' + (mid + 6) + '" stroke="#333" stroke-width="1.5"/>';
    c += '<text x="' + px + '" y="' + (mid + 18) + '" text-anchor="middle" font-size="11" fill="#333">' + i + '</text>';
  }
  return makeSVG(w, h, c);
}
function rightTriangleSVG() {
  var w = 240, h = 180, p = 30;
  var ax = p, ay = h - p, bx = w - p, by = h - p, cx = p, cy = p;
  var c = '<polygon points="' + ax + ',' + ay + ' ' + bx + ',' + by + ' ' + cx + ',' + cy + '" fill="#E8F4FD" stroke="#1A6BB5" stroke-width="2"/>';
  c += '<rect x="' + ax + '" y="' + (ay - 12) + '" width="12" height="12" fill="none" stroke="#1A6BB5" stroke-width="1.5"/>';
  c += '<text x="' + ((ax + bx) / 2 - 8) + '" y="' + (ay + 14) + '" font-size="12" fill="#DC3545">a (base)</text>';
  c += '<text x="' + (ax - 36) + '" y="' + ((ay + cy) / 2) + '" font-size="12" fill="#DC3545">b (height)</text>';
  c += '<text x="' + ((bx + cx) / 2 + 4) + '" y="' + ((by + cy) / 2 - 4) + '" font-size="12" fill="#198754">c (hyp)</text>';
  return makeSVG(w, h, c);
}

// ================================================================
// LESSON DATA
// ================================================================
var LESSONS = {
  math7: [
    {
      unit: 'Unit 1: Integers', lessons: [
        { title: 'Lesson 1.1 — Understanding Integers', body: '<p><strong>Integers</strong> are all whole numbers and their negatives: ...&#8722;3, &#8722;2, &#8722;1, 0, 1, 2, 3...</p>' + numberLineSVG(-6, 6) + '<p>Numbers to the <strong>right</strong> are greater. Numbers to the <strong>left</strong> are smaller.</p><div class="example-box"><strong>Example</strong>Order from least to greatest: 5, &#8722;2, 0, &#8722;7, 3 &rarr; &#8722;7, &#8722;2, 0, 3, 5</div>' },
        { title: 'Lesson 1.2 — Adding & Subtracting Integers', body: '<div class="formula-box">a &#8722; b = a + (&#8722;b)</div><div class="example-box"><strong>Examples</strong>&#8722;4 + 7 = 3 &nbsp;&nbsp; &#8722;5 + (&#8722;3) = &#8722;8 &nbsp;&nbsp; 8 &#8722; (&#8722;3) = 11 &nbsp;&nbsp; &#8722;5 &#8722; 4 = &#8722;9</div><p>Use a number line: positive numbers move right, negative numbers move left.</p>' },
        { title: 'Lesson 1.3 — Multiplying & Dividing Integers', body: '<div class="formula-box">(+)(+)=(+) &nbsp;&nbsp; (&#8722;)(&#8722;)=(+) &nbsp;&nbsp; (+)(&#8722;)=(&#8722;) &nbsp;&nbsp; (&#8722;)(+)=(&#8722;)</div><div class="example-box"><strong>Examples</strong>(&#8722;4)&#215;(&#8722;3)=12 &nbsp;&nbsp; (&#8722;6)&#215;5=&#8722;30 &nbsp;&nbsp; (&#8722;18)/(&#8722;3)=6 &nbsp;&nbsp; 20/(&#8722;4)=&#8722;5</div><p><strong>BEDMAS:</strong> Brackets &rarr; Exponents &rarr; Division/Multiplication &rarr; Addition/Subtraction</p>' }
      ]
    },
    {
      unit: 'Unit 2: Fractions, Decimals & Percents', lessons: [
        { title: 'Lesson 2.1 — Fraction Operations', body: '<div class="formula-box">a/b + c/d = (ad+bc)/bd &nbsp;&nbsp;&nbsp; a/b &#215; c/d = ac/bd &nbsp;&nbsp;&nbsp; a/b &#247; c/d = a/b &#215; d/c</div><div class="example-box"><strong>Examples</strong>2/3 + 3/4 = 8/12 + 9/12 = 17/12 &nbsp;&nbsp; (3/5)&#215;(2/7) = 6/35 &nbsp;&nbsp; (3/4)&#247;(2/3) = 9/8</div>' },
        { title: 'Lesson 2.2 — Percents', body: '<div class="formula-box">Percent of a number: (p/100) &#215; n &nbsp;&nbsp;&nbsp; % Change = (New&#8722;Old)/Old &#215; 100%</div><div class="example-box"><strong>Example</strong>35% of 80 = 0.35&#215;80 = 28 &nbsp;&nbsp; Price rises $40 to $50: (10/40)&#215;100% = 25% increase</div>' }
      ]
    },
    {
      unit: 'Unit 3: Ratios & Proportional Reasoning', lessons: [
        { title: 'Lesson 3.1 — Ratios & Rates', body: '<p>A <strong>ratio</strong> compares same units. A <strong>rate</strong> compares different units.</p><div class="example-box"><strong>Examples</strong>Ratio 3:5 (simplify by GCF) &nbsp;&nbsp; Rate: 120 km in 2 h = 60 km/h (unit rate)</div>' },
        { title: 'Lesson 3.2 — Proportions', body: '<div class="formula-box">If a/b = c/d, then ad = bc (cross-multiplication)</div><div class="example-box"><strong>Example</strong>Solve x/5 = 12/20: cross-multiply &rarr; 20x=60 &rarr; x=3</div>' }
      ]
    },
    {
      unit: 'Unit 4: Equations', lessons: [
        { title: 'Lesson 4.1 — One & Two-Step Equations', body: '<div class="formula-box">Use inverse operations — same on both sides!</div><div class="example-box"><strong>Examples</strong>x+7=12 &rarr; x=5 &nbsp;&nbsp; 3x=21 &rarr; x=7 &nbsp;&nbsp; 3x&#8722;7=14 &rarr; 3x=21 &rarr; x=7</div>' }
      ]
    },
    {
      unit: 'Unit 5: Geometry', lessons: [
        { title: 'Lesson 5.1 — Angles', body: '<p>Triangle angle sum = 180&#176;. Supplementary = 180&#176;. Complementary = 90&#176;.</p><div class="example-box"><strong>Example</strong>Triangle has angles 45&#176; and 70&#176;. Third = 180&#8722;45&#8722;70 = 65&#176;</div>' },
        { title: 'Lesson 5.2 — Area & Perimeter', body: '<div class="formula-box">Rectangle: A=l&#215;w &nbsp;&nbsp; Triangle: A=&#189;bh &nbsp;&nbsp; Circle: A=&#960;r&#178; &nbsp;&nbsp; C=2&#960;r</div><div class="example-box"><strong>Example</strong>Circle r=5: A=&#960;&#215;25&#8776;78.5 cm&#178; &nbsp;&nbsp; C=2&#960;&#215;5&#8776;31.4 cm</div>' },
        { title: 'Lesson 5.3 — Transformations', body: '<p><strong>Translation:</strong> slide &nbsp; <strong>Reflection:</strong> flip &nbsp; <strong>Rotation:</strong> turn &nbsp; <strong>Dilation:</strong> resize</p>' + coordinateGridSVG([{ x: 1, y: 1, color: '#1A6BB5', label: 'A' }, { x: 4, y: -1, color: '#DC3545', label: "A'" }], []) }
      ]
    },
    {
      unit: 'Unit 6: Statistics & Probability', lessons: [
        { title: 'Lesson 6.1 — Data & Graphs', body: '<p><strong>Mean</strong> = sum/count &nbsp; <strong>Median</strong> = middle value &nbsp; <strong>Mode</strong> = most frequent</p><div class="example-box"><strong>Example</strong>Data: 4,7,7,9,13 &rarr; Mean=8, Median=7, Mode=7</div>' },
        { title: 'Lesson 6.2 — Probability', body: '<div class="formula-box">P(event) = favourable outcomes / total outcomes</div><div class="example-box"><strong>Example</strong>P(rolling 3) = 1/6 &nbsp;&nbsp; P(not 3) = 5/6</div>' }
      ]
    }
  ],

  math8: [
    {
      unit: 'Unit 1: Square Roots & Pythagorean Theorem', lessons: [
        { title: 'Lesson 1.1 — Square Roots', body: '<p>&#8730;49 = 7 because 7&#178;=49. <strong>Perfect squares:</strong> 1,4,9,16,25,36,49,64,81,100...</p><div class="example-box"><strong>Examples</strong>&#8730;144=12 &nbsp;&nbsp; &#8730;2&#8776;1.41 &nbsp;&nbsp; &#8730;50&#8776;7.07</div>' },
        { title: 'Lesson 1.2 — Pythagorean Theorem', body: '<div class="formula-box">a&#178; + b&#178; = c&#178; &nbsp;&nbsp; (c = hypotenuse)</div>' + rightTriangleSVG() + '<div class="example-box"><strong>Example</strong>Legs 6 and 8: c&#178;=36+64=100, c=10</div>' },
        { title: 'Lesson 1.3 — Applications', body: '<div class="example-box"><strong>Ladder Problem</strong>10m ladder, base 6m from wall: h&#178;+36=100 &rarr; h=8m</div><div class="example-box"><strong>Distance Formula</strong>A(1,2) to B(5,5): d=&#8730;(16+9)=5</div>' }
      ]
    },
    {
      unit: 'Unit 2: Rational Numbers', lessons: [
        { title: 'Lesson 2.1 — Rational Number Operations', body: '<p>Rational numbers can be written as a/b (b&#8800;0). Include fractions, terminating and repeating decimals.</p><div class="example-box"><strong>Examples</strong>&#8722;3/4+1/2=&#8722;1/4 &nbsp;&nbsp; (&#8722;2/3)&#215;(3/4)=&#8722;1/2 &nbsp;&nbsp; (&#8722;5/6)&#247;(&#8722;1/3)=5/2</div>' }
      ]
    },
    {
      unit: 'Unit 3: Percents', lessons: [
        { title: 'Lesson 3.1 — Percent Applications', body: '<div class="formula-box">Sale price = Original&#215;(1&#8722;rate) &nbsp;&nbsp; Total with tax = Price&#215;(1+rate)</div><div class="formula-box">Simple Interest: I = P&#215;r&#215;t</div><div class="example-box"><strong>Examples</strong>$120 jacket 30% off: 120&#215;0.70=$84 &nbsp;&nbsp; $500 at 4% for 3yr: I=60</div>' }
      ]
    },
    {
      unit: 'Unit 4: Linear Equations', lessons: [
        { title: 'Lesson 4.1 — Multi-Step Equations', body: '<div class="example-box"><strong>Example</strong>4(x&#8722;2)+3=15 &rarr; 4x&#8722;5=15 &rarr; 4x=20 &rarr; x=5</div>' },
        { title: 'Lesson 4.2 — Graphing Lines', body: '<p>y=mx+b: m=slope, b=y-intercept</p>' + coordinateGridSVG([{ x: 0, y: 1, color: '#DC3545' }, { x: 2, y: 5, color: '#DC3545' }], [{ m: 2, b: 1, color: '#1A6BB5' }]) + '<div class="example-box"><strong>y=2x+1</strong>y-intercept (0,1). Slope=2: up 2, right 1.</div>' }
      ]
    },
    {
      unit: 'Unit 5: 3D Geometry', lessons: [
        { title: 'Lesson 5.1 — Surface Area', body: '<div class="formula-box">Rectangular prism: SA=2(lw+lh+wh) &nbsp;&nbsp; Cylinder: SA=2&#960;r&#178;+2&#960;rh</div><div class="example-box"><strong>Example</strong>Prism l=5,w=3,h=4: SA=2(15+20+12)=94 cm&#178;</div>' },
        { title: 'Lesson 5.2 — Volume', body: '<div class="formula-box">Prism: V=B&#215;h &nbsp;&nbsp; Cylinder: V=&#960;r&#178;h &nbsp;&nbsp; Pyramid: V=&#8531;Bh &nbsp;&nbsp; Sphere: V=(4/3)&#960;r&#179;</div><div class="example-box"><strong>Example</strong>Cylinder r=4,h=9: V=&#960;&#215;16&#215;9&#8776;452.4 cm&#179;</div>' }
      ]
    },
    {
      unit: 'Unit 6: Probability', lessons: [
        { title: 'Lesson 6.1 — Experimental vs Theoretical', body: '<div class="example-box"><strong>Theoretical</strong>P(heads)=1/2</div><div class="example-box"><strong>Experimental</strong>Flip 40 times, 18 heads: P=18/40=0.45</div><p>More trials &rarr; experimental approaches theoretical (Law of Large Numbers).</p>' }
      ]
    }
  ],

  math9: [
    {
      unit: 'Unit 1: Powers & Exponent Laws', lessons: [
        { title: 'Lesson 1.1 — Exponent Laws', body: '<div class="formula-box">b&#7504;&#215;b&#7506;=b&#7504;&#8314;&#7506; &nbsp;&nbsp; b&#7504;/b&#7506;=b&#7504;&#8315;&#7506; &nbsp;&nbsp; (b&#7504;)&#7506;=b&#7504;&#215;&#7506; &nbsp;&nbsp; b&#8304;=1 &nbsp;&nbsp; b&#8315;&#8319;=1/b&#8319;</div><div class="example-box"><strong>Examples</strong>x&#178;&#215;x&#179;=x&#8309; &nbsp;&nbsp; x&#8309;/x&#178;=x&#179; &nbsp;&nbsp; (x&#179;)&#178;=x&#8310; &nbsp;&nbsp; 5&#8304;=1 &nbsp;&nbsp; 2&#8315;&#178;=1/4</div>' }
      ]
    },
    {
      unit: 'Unit 2: Polynomials', lessons: [
        { title: 'Lesson 2.1 — Adding & Subtracting', body: '<div class="example-box"><strong>Add</strong>(3x&#178;+2x&#8722;1)+(x&#178;&#8722;5x+4)=4x&#178;&#8722;3x+3</div><div class="example-box"><strong>Subtract</strong>(5x&#178;+3x)&#8722;(2x&#178;&#8722;x+7)=3x&#178;+4x&#8722;7</div>' },
        { title: 'Lesson 2.2 — Multiplying (FOIL)', body: '<div class="formula-box">(a+b)(c+d) = ac+ad+bc+bd</div><div class="example-box"><strong>Example</strong>(x+3)(x&#8722;2)=x&#178;&#8722;2x+3x&#8722;6=x&#178;+x&#8722;6</div>' },
        { title: 'Lesson 2.3 — Factoring', body: '<div class="example-box"><strong>GCF</strong>6x&#178;+9x=3x(2x+3)</div><div class="example-box"><strong>Difference of Squares</strong>x&#178;&#8722;25=(x+5)(x&#8722;5)</div><div class="example-box"><strong>Trinomial</strong>x&#178;&#8722;5x+6=(x&#8722;2)(x&#8722;3)</div>' }
      ]
    },
    {
      unit: 'Unit 3: Linear Relations', lessons: [
        { title: 'Lesson 3.1 — Slope', body: '<div class="formula-box">m = (y&#8322;&#8722;y&#8321;)/(x&#8322;&#8722;x&#8321;)</div>' + coordinateGridSVG([{ x: 0, y: 1, color: '#DC3545' }, { x: 3, y: 7, color: '#DC3545' }], [{ m: 2, b: 1, color: '#1A6BB5' }]) + '<div class="example-box"><strong>Example</strong>(1,3) to (4,9): m=(9&#8722;3)/(4&#8722;1)=6/3=2</div>' },
        { title: 'Lesson 3.2 — Equation of a Line', body: '<div class="formula-box">Slope-intercept: y=mx+b &nbsp;&nbsp; Point-slope: y&#8722;y&#8321;=m(x&#8722;x&#8321;)</div><div class="example-box"><strong>Through (2,5) slope &#8722;1</strong>y&#8722;5=&#8722;1(x&#8722;2) &rarr; y=&#8722;x+7</div>' },
        { title: 'Lesson 3.3 — Systems of Equations', body: '<div class="example-box"><strong>Substitution</strong>y=2x+1 and y=&#8722;x+7: 2x+1=&#8722;x+7 &rarr; x=2, y=5</div><div class="example-box"><strong>Elimination</strong>2x+y=8 and x&#8722;y=1: add &rarr; 3x=9 &rarr; x=3, y=2</div>' }
      ]
    },
    { unit: 'Unit 4: Similarity', lessons: [{ title: 'Lesson 4.1 — Similar Figures', body: '<div class="formula-box">Side ratio=k &nbsp;&nbsp; Area ratio=k&#178; &nbsp;&nbsp; Volume ratio=k&#179;</div><div class="example-box"><strong>Example</strong>Scale factor k=3: if small area=6, large area=6&#215;9=54</div>' }] },
    { unit: 'Unit 5: Circle Geometry', lessons: [{ title: 'Lesson 5.1 — Circle Theorems', body: '<p>Inscribed angle = &#189; central angle &nbsp;&nbsp; Angle in semicircle = 90&#176; &nbsp;&nbsp; Tangent &#8869; radius</p><div class="example-box"><strong>Example</strong>Central angle=80&#176; &rarr; inscribed angle=40&#176;</div>' }] }
  ],

  math10c: [
    {
      unit: 'Unit 1: Measurement', lessons: [
        { title: 'Lesson 1.1 — SI and Imperial Units', body: '<div class="formula-box">1 in=2.54 cm &nbsp;&nbsp; 1 ft=30.48 cm &nbsp;&nbsp; 1 mi=1.609 km &nbsp;&nbsp; 1 kg=2.205 lb</div><div class="example-box"><strong>Example</strong>5 ft 8 in to cm: 5&#215;30.48+8&#215;2.54=152.4+20.32=172.72 cm</div>' }
      ]
    },
    {
      unit: 'Unit 2: Trigonometry', lessons: [
        { title: 'Lesson 2.1 — SOHCAHTOA', body: '<div class="formula-box">sin&#952;=opp/hyp &nbsp;&nbsp; cos&#952;=adj/hyp &nbsp;&nbsp; tan&#952;=opp/adj</div>' + rightTriangleSVG() + '<div class="example-box"><strong>Find missing side</strong>&#952;=35&#176;, hyp=20: opp=20&#215;sin(35&#176;)&#8776;11.5</div>' },
        { title: 'Lesson 2.2 — Inverse Trig & Applications', body: '<div class="formula-box">&#952;=sin&#8315;&#185;(opp/hyp) &nbsp;&nbsp; &#952;=cos&#8315;&#185;(adj/hyp) &nbsp;&nbsp; &#952;=tan&#8315;&#185;(opp/adj)</div><div class="example-box"><strong>Angle of Elevation</strong>50m from building, look up at 40&#176;: height=50&#215;tan(40&#176;)&#8776;42 m</div>' }
      ]
    },
    {
      unit: 'Unit 3: Factoring', lessons: [
        { title: 'Lesson 3.1 — All Factoring Methods', body: '<div class="formula-box">Always try GCF first! &nbsp; Then: diff. of squares, PST, trinomial, ac-method</div><div class="example-box"><strong>Examples</strong>6x&#178;&#8722;9x=3x(2x&#8722;3) &nbsp; 4x&#178;&#8722;25=(2x+5)(2x&#8722;5) &nbsp; 2x&#178;+7x+6=(x+2)(2x+3)</div>' }
      ]
    },
    {
      unit: 'Unit 4: Functions', lessons: [
        { title: 'Lesson 4.1 — Functions, Domain & Range', body: '<p>A <strong>function</strong>: each x gives exactly one y. Use vertical line test.</p><div class="formula-box">Domain = valid x-values &nbsp;&nbsp; Range = resulting y-values</div><div class="example-box"><strong>f(x)=&#8730;(x&#8722;2)</strong>Domain: x&#8805;2 &nbsp;&nbsp; Range: y&#8805;0</div>' },
        { title: 'Lesson 4.2 — Arithmetic Sequences', body: '<div class="formula-box">t&#8345;=a+(n&#8722;1)d &nbsp;&nbsp;&nbsp; S&#8345;=(n/2)(2a+(n&#8722;1)d)</div><div class="example-box"><strong>Example</strong>5,8,11,...: a=5,d=3. t&#8321;&#8322;=5+11&#215;3=38 &nbsp; S&#8321;&#8320;=5(10+27)=185</div>' }
      ]
    },
    {
      unit: 'Unit 5: Systems of Equations', lessons: [
        { title: 'Lesson 5.1 — Substitution & Elimination', body: '<div class="example-box"><strong>Substitution</strong>x+2y=10, 3x&#8722;y=5: x=10&#8722;2y &rarr; substitute &rarr; y=25/7</div><div class="example-box"><strong>Elimination</strong>2x+3y=12, 4x&#8722;3y=6: add &rarr; 6x=18 &rarr; x=3, y=2</div>' }
      ]
    }
  ],

  math201: [
    {
      unit: 'Unit 1: Quadratic Functions', lessons: [
        { title: 'Lesson 1.1 — Vertex Form', body: '<div class="formula-box">y=a(x&#8722;h)&#178;+k &nbsp;&nbsp; Vertex (h,k) &nbsp;&nbsp; Axis: x=h</div>' + coordinateGridSVG([{ x: 2, y: 3, color: '#DC3545', label: 'V(2,3)' }], []) + '<div class="example-box"><strong>y=2(x&#8722;3)&#178;+1</strong>Vertex (3,1), axis x=3, opens up, min=1</div>' },
        { title: 'Lesson 1.2 — Completing the Square', body: '<div class="example-box"><strong>y=x&#178;+6x+5</strong>=(x&#178;+6x+9)&#8722;9+5=(x+3)&#178;&#8722;4 &nbsp; Vertex:(&#8722;3,&#8722;4)</div>' },
        { title: 'Lesson 1.3 — Quadratic Formula', body: '<div class="formula-box">x=(&#8722;b&#177;&#8730;(b&#178;&#8722;4ac))/(2a) &nbsp;&nbsp; D=b&#178;&#8722;4ac</div><div class="example-box"><strong>D&gt;0</strong>two roots &nbsp; <strong>D=0</strong>one root &nbsp; <strong>D&lt;0</strong>no real roots</div><div class="example-box"><strong>2x&#178;&#8722;5x&#8722;3=0</strong>x=(5&#177;7)/4 &rarr; x=3 or x=&#8722;0.5</div>' }
      ]
    },
    {
      unit: 'Unit 2: Radicals', lessons: [
        { title: 'Lesson 2.1 — Simplifying Radicals', body: '<div class="formula-box">&#8730;(ab)=&#8730;a&#215;&#8730;b &nbsp;&nbsp; Add like radicals: same radicand</div><div class="example-box"><strong>Examples</strong>&#8730;72=6&#8730;2 &nbsp;&nbsp; &#8730;12+&#8730;27=2&#8730;3+3&#8730;3=5&#8730;3</div>' },
        { title: 'Lesson 2.2 — Radical Equations', body: '<div class="example-box"><strong>Solve &#8730;(2x+3)=x&#8722;1</strong>Square both sides: 2x+3=(x&#8722;1)&#178;<br>Rearrange and solve. CHECK both answers for extraneous roots!</div>' }
      ]
    },
    {
      unit: 'Unit 3: Rational Expressions', lessons: [
        { title: 'Lesson 3.1 — Operations with Rationals', body: '<p>Always factor and state <strong>non-permissible values</strong> (values that make denominator = 0).</p><div class="example-box"><strong>Simplify</strong>(x&#178;&#8722;9)/(x&#178;&#8722;x&#8722;6)=(x+3)(x&#8722;3)/((x&#8722;3)(x+2))=(x+3)/(x+2), x&#8800;3,&#8722;2</div>' }
      ]
    },
    {
      unit: 'Unit 4: Sequences & Series', lessons: [
        { title: 'Lesson 4.1 — Arithmetic & Geometric', body: '<div class="formula-box">Arithmetic: t&#8345;=a+(n&#8722;1)d &nbsp;&nbsp; S&#8345;=(n/2)(2a+(n&#8722;1)d)</div><div class="formula-box">Geometric: t&#8345;=ar&#8319;&#8315;&#185; &nbsp;&nbsp; S&#8345;=a(r&#8319;&#8722;1)/(r&#8722;1) &nbsp;&nbsp; S&#8734;=a/(1&#8722;r) if |r|&lt;1</div><div class="example-box"><strong>Example</strong>S&#8325; of 2+6+18...: a=2,r=3: S&#8325;=2(3&#8309;&#8722;1)/2=242</div>' }
      ]
    }
  ],

  math301: [
    {
      unit: 'Unit 1: Trigonometry', lessons: [
        { title: 'Lesson 1.1 — Radians & Unit Circle', body: '<div class="formula-box">Radians = degrees&#215;&#960;/180 &nbsp;&nbsp;&nbsp; Degrees = radians&#215;180/&#960;</div><p>sin&#178;x+cos&#178;x=1 (Pythagorean identity). CAST rule: All/Sin/Tan/Cos positive per quadrant.</p>' },
        { title: 'Lesson 1.2 — Graphing Trig Functions', body: '<p>y=a sin(b(x&#8722;c))+d: amplitude=|a|, period=2&#960;/b, phase shift=c, vertical shift=d</p><div class="example-box"><strong>y=3sin(2x)+1</strong>Amplitude=3, Period=&#960;, Vertical shift up 1, Range:[&#8722;2,4]</div>' },
        { title: 'Lesson 1.3 — Trig Identities', body: '<div class="formula-box">sin&#178;x+cos&#178;x=1 &nbsp;&nbsp; 1+tan&#178;x=sec&#178;x &nbsp;&nbsp; sin(A+B)=sinAcosB+cosAsinB</div><div class="example-box"><strong>Prove</strong>sin&#178;x/cosx=secx&#8722;cosx: LHS=(1&#8722;cos&#178;x)/cosx=1/cosx&#8722;cosx=RHS ✓</div>' }
      ]
    },
    {
      unit: 'Unit 2: Exponential & Logarithmic Functions', lessons: [
        { title: 'Lesson 2.1 — Exponential Functions', body: '<p>y=b&#215; (b&gt;0, b&#8800;1). b&gt;1: growth. 0&lt;b&lt;1: decay. Domain: all reals. Range: y&gt;0.</p>' },
        { title: 'Lesson 2.2 — Logarithm Laws', body: '<div class="formula-box">log(mn)=log m+log n &nbsp;&nbsp; log(m/n)=log m&#8722;log n &nbsp;&nbsp; log(m&#8319;)=n&#8901;log m</div><div class="example-box"><strong>Solve log(x)+log(x&#8722;3)=1</strong>log(x(x&#8722;3))=1 &rarr; x(x&#8722;3)=10 &rarr; x&#178;&#8722;3x&#8722;10=0 &rarr; x=5</div>' }
      ]
    },
    {
      unit: 'Unit 3: Permutations & Combinations', lessons: [
        { title: 'Lesson 3.1 — Counting Methods', body: '<div class="formula-box">nPr=n!/(n&#8722;r)! &nbsp;&nbsp;&nbsp; nCr=n!/(r!(n&#8722;r)!)</div><div class="example-box"><strong>Examples</strong>&#8327;P&#8323;=7&#215;6&#215;5=210 &nbsp;&nbsp; &#8321;&#8320;C&#8323;=120</div>' },
        { title: 'Lesson 3.2 — Binomial Theorem', body: '<div class="formula-box">T(k+1)=C(n,k)&#8901;a&#8319;&#8315;&#7503;&#8901;b&#7503;</div><div class="example-box"><strong>4th term of (x+2)&#8309;</strong>T&#8324;=C(5,3)x&#178;&#8901;2&#179;=10&#215;8x&#178;=80x&#178;</div>' }
      ]
    }
  ]
};

// Stub lessons for grades without full data
['math103', 'math202', 'math203', 'math302', 'math303'].forEach(function (gid) {
  var g = GRADES_DATA[gid];
  if (!LESSONS[gid]) {
    LESSONS[gid] = [{
      unit: 'Units — Coming Soon',
      lessons: [{ title: 'Lessons for ' + (g ? g.label : gid) + ' are being added', body: '<p class="text-muted">Full lesson content for this course is being prepared. Check back soon! In the meantime, use the Practice tab to test your skills and download resources from the Resources tab.</p>' }]
    }];
  }
});

// ================================================================
// GRADE DATA
// ================================================================
var GRADES_DATA = {
  math7:   { id:'math7',   label:'Math 7',    tag:'Grade 7',  tagClass:'tag-jr',  cardClass:'',    desc:'Fractions, ratios, integers, geometry basics',       fullDesc:'Alberta Mathematics Grade 7 — Number sense, spatial reasoning, patterns, and data.', topics:['Integers and operations','Fractions and mixed numbers','Ratios and proportional thinking','Percentages','Variables and expressions','Linear equations','Angles and triangles','Area and perimeter','Transformations','Data and probability'], outcomes:['Understand integers including operations','Apply fractions, decimals, and percents','Use variables and equations to model relationships','Apply properties of 2D shapes','Collect and interpret data'] },
  math8:   { id:'math8',   label:'Math 8',    tag:'Grade 8',  tagClass:'tag-jr',  cardClass:'',    desc:'Pythagorean theorem, percents, probability',          fullDesc:'Alberta Mathematics Grade 8 — Building on number concepts, geometry, and data analysis.', topics:['Square roots','Pythagorean theorem','Rational numbers','Percents','Multi-step equations','Graphing linear equations','Surface area','Volume','Probability','Scatter plots'], outcomes:['Apply the Pythagorean theorem','Operate with rational numbers','Solve multi-step equations','Find surface area and volume','Compare probabilities'] },
  math9:   { id:'math9',   label:'Math 9',    tag:'Grade 9',  tagClass:'tag-jr',  cardClass:'',    desc:'Powers, polynomials, linear relations',               fullDesc:'Alberta Mathematics Grade 9 — Algebraic thinking, linear relations, and statistics.', topics:['Powers and exponent laws','Adding/subtracting polynomials','Multiplying polynomials','Factoring','Slope','Equation of a line','Systems','Similarity','Circle geometry','Statistics'], outcomes:['Apply exponent laws','Factor and expand polynomials','Graph linear relations','Apply similarity','Solve systems'] },
  math10c: { id:'math10c', label:'Math 10C',  tag:'Grade 10', tagClass:'tag-sr',  cardClass:'hs',  desc:'Combined: measurement, algebra, functions',           fullDesc:'Mathematics 10 Combined — Gateway to -1 and -2 pathways.', topics:['SI and imperial measurement','Trigonometry','SOHCAHTOA','Factoring','Systems of equations','Functions','Domain and range','Arithmetic sequences','Graphing','Slope and intercepts'], outcomes:['Convert between measurement systems','Solve right triangle trig','Factor polynomials','Solve systems','Use function notation'] },
  math103: { id:'math103', label:'Math 10-3', tag:'Grade 10', tagClass:'tag-sr',  cardClass:'hs',  desc:'-3 pathway: measurement, geometry, finances',         fullDesc:'Mathematics 10-3 — Practical pathway.', topics:['Metric and imperial measurement','Composite area','Volume','Scale diagrams','Trigonometry','Personal finance','Graphical reasoning'], outcomes:['Solve measurement problems','Apply geometry','Interpret scale diagrams','Financial literacy','Use graphs'] },
  math201: { id:'math201', label:'Math 20-1', tag:'Grade 11', tagClass:'tag-sr',  cardClass:'hs',  desc:'-1 pathway: quadratics, radicals, sequences',         fullDesc:'Mathematics 20-1 — Advanced algebra, quadratic functions, and sequences.', topics:['Vertex form','Completing the square','Quadratic formula','Simplifying radicals','Radical equations','Rational expressions','Arithmetic sequences','Geometric sequences','Series','Infinite series'], outcomes:['Analyze quadratic functions','Operate on radicals','Solve radical equations','Identify sequences','Calculate series sums'] },
  math202: { id:'math202', label:'Math 20-2', tag:'Grade 11', tagClass:'tag-sr',  cardClass:'hs',  desc:'-2 pathway: geometry, stats, quadratics applied',     fullDesc:'Mathematics 20-2 — Applied reasoning, geometry, and statistics.', topics:['Inductive reasoning','Angle relationships','Triangle congruence','Circle properties','Normal distribution','Quadratics applied','Sequences','Financial apps','Probability'], outcomes:['Apply reasoning to proofs','Analyze circles','Interpret normal distribution','Apply quadratics','Calculate probabilities'] },
  math203: { id:'math203', label:'Math 20-3', tag:'Grade 11', tagClass:'tag-sr',  cardClass:'hs',  desc:'-3 pathway: finance, measurement, geometry',          fullDesc:'Mathematics 20-3 — Practical and workplace mathematics.', topics:['Compound interest','Budgeting','Area, SA, volume','Applied trig','3D scale models','Statistics','Linear functions'], outcomes:['Apply financial formulas','Budget personal finances','Solve 3D measurement','Use trig in workplace','Interpret statistical graphs'] },
  math301: { id:'math301', label:'Math 30-1', tag:'Grade 12', tagClass:'tag-adv', cardClass:'adv', desc:'-1 pathway: trig, functions, permutations',            fullDesc:'Mathematics 30-1 — Advanced functions, trigonometry, and pre-calculus.', topics:['Radian measure','Unit circle','Graphing trig functions','Trig identities','Exponential functions','Logarithmic functions','Log/exp equations','Polynomial functions','Permutations','Combinations','Binomial theorem'], outcomes:['Analyze trig functions','Apply identities','Solve log/exp equations','Analyze polynomial functions','Apply counting principles'] },
  math302: { id:'math302', label:'Math 30-2', tag:'Grade 12', tagClass:'tag-adv', cardClass:'adv', desc:'-2 pathway: logic, statistics, probability',           fullDesc:'Mathematics 30-2 — Logic, probability, and applied mathematics.', topics:['Set theory','Conditional probability','Binomial distribution','Permutations','Logical reasoning','Polynomial functions','Exponential functions','Financial math'], outcomes:['Apply set theory','Calculate conditional probabilities','Model with binomial distribution','Analyze functions','Apply financial math'] },
  math303: { id:'math303', label:'Math 30-3', tag:'Grade 12', tagClass:'tag-adv', cardClass:'adv', desc:'-3 pathway: practical and trades math',                fullDesc:'Mathematics 30-3 — Practical and trades mathematics.', topics:['Slope and rate of change','Linear functions','Applied trig','Unit analysis','Statistics','Financial planning','3D measurement'], outcomes:['Apply linear/quadratic models','Solve trades measurement','Use statistics','Apply financial formulas','Use applied trig'] }
};

// ================================================================
// RESOURCE DEFINITIONS (which PDF to call for each button)
// ================================================================
var GRADE_RESOURCES = {
  math7:   {
    formulas:   [{ title:'Math 7 Formula Sheet',                   cat:'formula',   key:'Math 7'                              }],
    notes:      [{ title:'Study Notes: Integers',                  cat:'notes',     key:'Math 7 — Integers'                   },
                 { title:'Study Notes: Fractions & Percents',       cat:'notes',     key:'Math 7 — Integers'                   }],
    worksheets: [{ title:'Integers Worksheet',                      cat:'worksheets',key:'Math 7 Integers Worksheet'            },
                 { title:'Fractions & Ratios Worksheet',             cat:'worksheets',key:'Math 7 Integers Worksheet'            }],
    exams:      [{ title:'Unit 1 Exam — Integers',                  cat:'exams',     key:'Math 7 Unit 1 Exam — Integers'        },
                 { title:'Math 7 Mid-Year Exam',                    cat:'exams',     key:'Math 7 Unit 1 Exam — Integers'        },
                 { title:'Math 7 Final Exam',                       cat:'exams',     key:'Math 7 Unit 1 Exam — Integers'        }]
  },
  math8:   {
    formulas:   [{ title:'Math 8 Formula Sheet',                   cat:'formula',   key:'Math 8'                              }],
    notes:      [{ title:'Study Notes: Pythagorean Theorem',        cat:'notes',     key:'Math 8 — Pythagorean Theorem'        }],
    worksheets: [{ title:'Pythagorean Theorem Worksheet',           cat:'worksheets',key:'Math 8 Pythagorean Theorem Worksheet' }],
    exams:      [{ title:'Unit 1 Exam — Pythagorean Theorem',       cat:'exams',     key:'Math 8 Unit 1 Exam — Pythagorean Theorem' },
                 { title:'Math 8 Final Exam',                       cat:'exams',     key:'Math 8 Unit 1 Exam — Pythagorean Theorem' }]
  },
  math9:   {
    formulas:   [{ title:'Math 9 Formula Sheet',                   cat:'formula',   key:'Math 9'                              }],
    notes:      [{ title:'Study Notes: Polynomials',                cat:'notes',     key:'Math 9 — Polynomials'                }],
    worksheets: [{ title:'Factoring Worksheet',                     cat:'worksheets',key:'Math 9 Factoring Worksheet'           },
                 { title:'Polynomial Operations Worksheet',         cat:'worksheets',key:'Math 9 Factoring Worksheet'           }],
    exams:      [{ title:'Math 9 Final Exam',                       cat:'exams',     key:'Math 9 Final Exam'                   }]
  },
  math10c: {
    formulas:   [{ title:'Math 10C Formula Sheet',                 cat:'formula',   key:'Math 10C'                            }],
    notes:      [{ title:'Study Notes: Trigonometry',              cat:'notes',     key:'Math 10C — Trigonometry'             }],
    worksheets: [{ title:'Trigonometry Worksheet',                  cat:'worksheets',key:'Math 10C Trigonometry Worksheet'     }],
    exams:      [{ title:'Math 10C Final Exam',                     cat:'exams',     key:'Math 10C Final Exam'                 }]
  },
  math103: {
    formulas:   [{ title:'Math 10-3 Formula Sheet',                cat:'formula',   key:'Math 10C'                            }],
    notes:      [{ title:'Math 10-3 Study Notes',                  cat:'notes',     key:'Math 10C — Trigonometry'             }],
    worksheets: [{ title:'Math 10-3 Worksheet',                     cat:'worksheets',key:'Math 10C Trigonometry Worksheet'     }],
    exams:      [{ title:'Math 10-3 Exam',                          cat:'exams',     key:'Math 10C Final Exam'                 }]
  },
  math201: {
    formulas:   [{ title:'Math 20-1 Formula Sheet',                cat:'formula',   key:'Math 20-1'                           }],
    notes:      [{ title:'Study Notes: Quadratic Functions',       cat:'notes',     key:'Math 20-1 — Quadratic Functions'     }],
    worksheets: [{ title:'Quadratics Worksheet',                    cat:'worksheets',key:'Math 20-1 Quadratics Worksheet'      }],
    exams:      [{ title:'Math 20-1 Final Exam',                    cat:'exams',     key:'Math 20-1 Diploma Practice Exam'     },
                 { title:'Math 20-1 Diploma Practice Exam',         cat:'exams',     key:'Math 20-1 Diploma Practice Exam'     }]
  },
  math202: {
    formulas:   [{ title:'Math 20-2 Formula Sheet',                cat:'formula',   key:'Math 20-1'                           }],
    notes:      [{ title:'Math 20-2 Study Notes',                  cat:'notes',     key:'Math 20-1 — Quadratic Functions'     }],
    worksheets: [{ title:'Math 20-2 Worksheet',                     cat:'worksheets',key:'Math 20-1 Quadratics Worksheet'      }],
    exams:      [{ title:'Math 20-2 Final Exam',                    cat:'exams',     key:'Math 20-1 Diploma Practice Exam'     }]
  },
  math203: {
    formulas:   [{ title:'Math 20-3 Formula Sheet',                cat:'formula',   key:'Math 20-1'                           }],
    notes:      [{ title:'Math 20-3 Study Notes',                  cat:'notes',     key:'Math 20-1 — Quadratic Functions'     }],
    worksheets: [{ title:'Math 20-3 Worksheet',                     cat:'worksheets',key:'Math 20-1 Quadratics Worksheet'      }],
    exams:      [{ title:'Math 20-3 Final Exam',                    cat:'exams',     key:'Math 20-1 Diploma Practice Exam'     }]
  },
  math301: {
    formulas:   [{ title:'Math 30-1 Formula Sheet',                cat:'formula',   key:'Math 30-1'                           },
                 { title:'Trig Identity Sheet',                     cat:'formula',   key:'Math 30-1'                           }],
    notes:      [{ title:'Study Notes: Trigonometry',              cat:'notes',     key:'Math 30-1 — Trigonometry'            }],
    worksheets: [{ title:'Trig Identities Worksheet',               cat:'worksheets',key:'Math 30-1 Trig Identities Worksheet' }],
    exams:      [{ title:'Math 30-1 Diploma Practice Exam A',       cat:'exams',     key:'Math 30-1 Diploma Practice Exam'     },
                 { title:'Math 30-1 Diploma Practice Exam B',       cat:'exams',     key:'Math 30-1 Diploma Practice Exam'     }]
  },
  math302: {
    formulas:   [{ title:'Math 30-2 Formula Sheet',                cat:'formula',   key:'Math 30-1'                           }],
    notes:      [{ title:'Math 30-2 Study Notes',                  cat:'notes',     key:'Math 30-1 — Trigonometry'            }],
    worksheets: [{ title:'Math 30-2 Worksheet',                     cat:'worksheets',key:'Math 30-1 Trig Identities Worksheet' }],
    exams:      [{ title:'Math 30-2 Diploma Practice Exam',         cat:'exams',     key:'Math 30-1 Diploma Practice Exam'     }]
  },
  math303: {
    formulas:   [{ title:'Math 30-3 Formula Sheet',                cat:'formula',   key:'Math 30-1'                           }],
    notes:      [{ title:'Math 30-3 Study Notes',                  cat:'notes',     key:'Math 30-1 — Trigonometry'            }],
    worksheets: [{ title:'Math 30-3 Worksheet',                     cat:'worksheets',key:'Math 30-1 Trig Identities Worksheet' }],
    exams:      [{ title:'Math 30-3 Final Exam',                    cat:'exams',     key:'Math 30-1 Diploma Practice Exam'     }]
  }
};

// ================================================================
// PRACTICE QUESTIONS
// ================================================================
var QUESTIONS = {
  'Math 7': {
    easy:   ['What is -5 + 8?','Calculate 3/4 + 1/2.','What is 20% of 60?','Simplify: 3x + 2x.','Area of rectangle: length 8, width 5?','What is -3 x -4?','Order from least to greatest: -2, 5, -7, 0, 3.','Perimeter of a square with side 6 cm?','Write 0.45 as a fraction in simplest form.','What is the complement of 35 degrees?'],
    medium: ['Solve for x: 3x - 7 = 14.','A jacket costs $80, 25% off. Sale price?','Write 18:24 in simplest form.','Perimeter of triangle with sides 7, 9, and 11 cm?','Car travels 150 km in 3 h. Average speed?','Area of triangle: base 10 cm, height 6 cm?','Evaluate: 4n - 7 when n = 5.','Solve: 2x + 5 = 17.','What is 15% of 120?','Sequence: 4, 7, 10, 13, ... What is the 10th term?'],
    hard:   ['Store marks up 30% then discounts 20%. Overall percent change?','Solve: (2x+3)/5 = 4 - x/2.','Prism l=6, w=4, h=3. Find volume and surface area.','Supplementary angles: A is 40 more than B. Find both.','Sequence 2,5,8,11,... What is the 20th term?','P(A)=0.3, events complementary. Find P(B).','Rectangle: perimeter 36, length = twice width. Find dimensions.','Find mean, median, mode of: 4,7,7,9,13,7,2.','3 shirts cost $45. How much would 8 shirts cost?','Triangle angles: two are 62 and 47 degrees. Find the third.']
  },
  'Math 8': {
    easy:   ['What is sqrt(49)?','Hypotenuse of right triangle with legs 3 and 4?','What is 15% of 80?','What is 2/3 x 3/4?','Convert 0.75 to simplest fraction.','What is (-3) + (-5)?','Solve: 4x = 32.','Surface area of cube with side 3 cm?','Convert -7/2 to a mixed number.','What is 0.6 + (-1.2)?'],
    medium: ['Right triangle legs 5 and 12. Find hypotenuse.','Solve: 4x + 6 = 22.','Surface area of cube, side 5 cm.','P(rolling an even number on a die)?','Write 3.6 as a mixed number.','Shirt $45, 12% tax. Total price?','Volume of rectangular prism l=6, w=4, h=3.','Solve: 3(x-2) = 15.','Store buys item for $30, marks up 40%. Selling price?','Solve: -2x + 7 = 1.'],
    hard:   ['Ladder 10m long, base 6m from wall. How high does it reach?','Solve: 3x - 2 < 10.','Volume of cylinder r=4, h=9. (pi=3.14)','P(A)=0.4, P(B)=0.3, independent. Find P(A and B).','Rectangle: area 48, perimeter 28. Find dimensions.','Solve: 2(3x-1) - 4x = 3x + 5.','Rectangle: length (2x+3), width (x-1). Perimeter=30. Find x.','Diagonal of rectangle 7 cm by 24 cm?','Percent decrease from 80 to 60?','400 students, 45% boys, 30% boys play sports. How many boys play sports?']
  },
  'Math 9': {
    easy:   ['Simplify: x^2 times x^3.','Add: (3x+4) + (2x-1).','Slope of y = 3x + 7?','Evaluate: 2^3.','Simplify: (2x^2)^3.','Factor: x^2 - 9.','What is 5^0?','Evaluate: 3^(-2).','Expand: 2(x+5).','y-intercept of y = -2x + 8?'],
    medium: ['Factor: x^2 - 5x + 6.','Slope between (2,3) and (6,11)?','Expand: (x+3)(x-2).','Solve: 2x+5=3x-1.','Similar triangles ratio 2:3. Small area=8. Large area?','Equation of line: slope 4, y-intercept -3.','Simplify: (3x^2)(2x^3).','Factor: 2x^2 + 6x.','Solve the system: x+y=10 and x-y=4.','Simplify: (x^3 y^2) / (x y^4).'],
    hard:   ['Factor fully: 2x^3 - 8x.','Equation of line through (1,4) and (3,10).','Simplify: (3x^2 y)(2xy^3) / (6x^2 y^2).','Rectangle: length is 3 more than twice width. Perimeter=48. Find dimensions.','Solve: 2x+y=8 and x-y=1.','Circle: circumference 31.4 cm. Find radius and area. (pi=3.14)','Equation of line perpendicular to y=3x-2 through (3,1).','Square of an odd integer: prove it is always odd.','15th term of -3, 1, 5, 9, ...?','Expand and simplify: (2x-3)^2 - (x+4)(x-1).']
  },
  'Math 10C': {
    easy:   ['Convert 5 feet to inches.','sin(30 degrees)?','Slope of 2x + 3y = 6?','Factor: x^2 - 9.','f(3) if f(x)=2x-1?','Convert 100 cm to metres.','cos(60 degrees)?','Evaluate: 4^(1/2).','Is y=x^2 a function?','Degree of 3x^3 - 2x + 7?'],
    medium: ['Right triangle: angle 40 deg, adjacent 10. Find opposite.','Solve system: y=2x+1 and y=-x+7.','Factor: 2x^2+5x+3.','Domain and range of f(x)=sqrt(x-2).','Convert 3 metres to feet (1m=3.28ft).','12th term of arithmetic sequence 5, 8, 11, 14, ...?','Simplify: sqrt(72).','Slope and y-intercept of 3x - 4y = 12.','Solve by elimination: 2x+3y=12 and 4x-3y=6.','Factor: x^2 - 4x - 21.'],
    hard:   ['25m ladder at 65 degrees. How high does it reach?','Solve and check: 2x/(x-1) = 3 + 2/(x-1).','Factor completely: 3x^3 - 12x.','Is y=x^2 a function? State domain and range.','Boat: 15 km east then 8 km north. Find direct distance and angle.','Two cars: one north at 60 km/h, one east at 80 km/h. Distance apart after 2 h?','Equation of line through (-2,5) perpendicular to y=(1/3)x+4.','Ladder reaches 8m up a wall, base 6m from wall. Angle with ground?','Solve: 3x - 2y = 11 and x + 3y = 0.','Rectangle: perimeter 54m, area 180m^2. Find dimensions.']
  },
  'Math 20-1': {
    easy:   ['Simplify: sqrt(50).','Factor: x^2 - 4.','Vertex of y=(x-2)^2+3?','Simplify: sqrt(12)+sqrt(27).','Evaluate: 4^(3/2).','Axis of symmetry of y=(x+4)^2-1?','Simplify: sqrt(18).','Expand: (x+5)^2.','Vertex of y=-(x-1)^2+6?','Discriminant of x^2-4x+4.'],
    medium: ['Solve by quadratic formula: 2x^2-5x-3=0.','Write y=x^2+6x+5 in vertex form.','Simplify: (2sqrt3)(3sqrt6).','8th term of 3, 7, 11, ...?','Sum of first 10 terms of 2+5+8+...?','Simplify: (x^2-9)/(x^2-x-6).','Roots of y = x^2 - 6x + 8?','Solve: sqrt(x+5) = 3.','Common ratio of 3, 6, 12, 24, ...?','Simplify: (2sqrt5)^2 - sqrt(80).'],
    hard:   ['Vertex and axis of y=-2x^2+8x-3.','Solve: sqrt(2x+3)=x-1. Check for extraneous roots.','Simplify: (x^2-9)/(x^2-x-6) divided by (x+3)/(2x+4).','Geometric: t2=6, t5=48. Find ratio and first term.','Solve system: y=x^2 and y=x+6.','Sum of first 8 terms of 2+6+18+...?','x-intercepts, vertex, direction of y=-x^2+4x+5.','Prove sum of two consecutive odd numbers is divisible by 4.','Solve: x/(x-2) + 3/(x+1) = 2.','Arithmetic sum=375, first term=5, last term=45. Find number of terms.']
  },
  'Math 30-1': {
    easy:   ['Convert 180 degrees to radians.','Period of y=sin(x)?','log base 2 of 8?','Evaluate 8P3.','Simplify: log(100).','Convert pi/3 to degrees.','Evaluate: cos(0).','log base 10 of 1?','Evaluate: 5C2.','Simplify: ln(e^3).'],
    medium: ['Pythagorean identity: sin^2x + cos^2x = ?','Solve: 2sin(x)=1 for x in [0,360].','Evaluate 10C3.','Solve: 2^(x+1)=16.','Domain and range of y=log(x+2).','Expand (x+3)^4 first 3 terms only.','Solve: log3(x) + log3(x-2) = 3.','Period and amplitude of y=4sin(2x).','How many ways can 8 people sit in a row?','Solve: e^(2x) = 7.'],
    hard:   ['Prove: 1+tan^2(x) = sec^2(x).','Solve: 2cos^2(x)-cos(x)-1=0 for x in [0,2pi].','4th term of (x+2)^5.','Solve: log(x)+log(x-3)=1.','How many 5-card hands from 52-card deck?','Prove: (sinx+cosx)^2 = 1+2sinxcosx.','Solve: 3^(2x)-4(3^x)+3=0.','Committee of 4 from 6 men and 5 women. Ways with exactly 2 women?','All solutions to sin(2x)=cos(x) in [0,2pi].','Geometric: t3=12, t6=96. Find first term and ratio.']
  }
};

var HINTS = {
  'Math 7': { easy:['Move 8 units right from -5.','LCD of 4 and 2 is 4.','0.20 x 60.','Add coefficients: 5.','A=lw.','Neg x neg = pos.','Number line.','P=4s.','75/100=3/4.','Complement adds to 90.'], medium:['Add 7, divide by 3.','Find 25% of 80, subtract.','Divide by GCF=6.','Add all sides.','Speed=D/T.','A=1/2bh.','Sub n=5.','Sub 5, divide by 2.','15/100 x 120.','a=4,d=3. t_n=a+(n-1)d.'], hard:['Mark up then discount step by step.','Multiply by 10 to clear fractions.','V=lwh, SA=2(lw+lh+wh).','A=B+40, A+B=180.','t_20=2+19x3=59.','1-0.3=0.7.','Let w, l=2w, P=36.','Sort data first.','3/45=8/x.','180-62-47.'] },
  'Math 8': { easy:['7x7=49.','a^2+b^2=c^2.','15/100 x 80.','Mult tops, mult bottoms.','75/100=3/4.','Keep neg sign.','Divide by 4.','6s^2=54.','Write as -3 and 1/2.','Line up decimals.'], medium:['5^2+12^2=169.','Sub 6, div by 4.','6s^2=150.','3 even out of 6.','3.6=3+3/5.','45x1.12.','V=lwh.','Distribute 3, solve.','0.40x30=12.','Add 7, divide by -2.'], hard:['h^2+36=100.','Add 2, divide by 3.','pi x r^2 x h.','P(A)xP(B).','lw=48, 2l+2w=28.','Distribute, collect terms.','2(2x+3)+2(x-1)=30.','sqrt(49+576).','(80-60)/80x100%.','0.45x400=180 boys, 0.30x180=54.'] },
  'Math 9': { easy:['Add exponents.','Combine x, then constants.','m=coefficient of x.','2x2x2=8.','Power rule.','Diff of squares.','b^0=1.','3^(-2)=1/9.','Distribute 2.','b in y=mx+b.'], medium:['Factors of 6 that add to -5.','(y2-y1)/(x2-x1).','FOIL.','Collect x terms.','Area ratio=k^2.','y=4x-3.','Mult coefficients and add exponents.','Factor out 2x.','Add equations.','Quotient rule.'], hard:['Factor out 2x first, then diff of squares.','Find slope, then point-slope.','Mult tops and bottoms, cancel.','w=width, l=2w+3, P=48.','Add equations to eliminate y.','C=2pir=31.4.','Perpendicular slope=-1/3.','2k+1 squared.','a=-3,d=4.','Expand and subtract.'] },
  'Math 10C': { easy:['1ft=12in.','sin30=1/2.','Rearrange to y=mx+b.','(x+3)(x-3).','Replace x with 3.','100cm=1m.','cos60=1/2.','sqrt(4)=2.','Vertical line test.','Highest power.'], medium:['tan40=opp/adj.','Set equal, solve.','ac-method: 2x3=6.','Domain: x>=2, Range: y>=0.','Mult by 3.28.','a=5,d=3,t_12=5+11x3.','sqrt(36x2)=6sqrt(2).','Rearrange to y=mx+b.','Mult eq1 by 2, subtract eq2.','Factors of -21 that add to -4.'], hard:['25xsin65.','Mult by (x-1), check x=1.','Factor 3x first.','Domain all reals, range y>=0.','sqrt(225+64).','sqrt(120^2+160^2).','Perp slope=-3.','sin theta=8/10.','Mult eq1 by 3, add to eq2.','lw=180, 2l+2w=54.'] },
  'Math 20-1': { easy:['sqrt(25x2)=5sqrt2.','(x+2)(x-2).','Read (h,k) directly.','2sqrt3+3sqrt3=5sqrt3.','(sqrt4)^3=8.','x=h in vertex form.','sqrt(9x2)=3sqrt2.','(x+5)^2=x^2+10x+25.','Read vertex.','b^2-4ac=0.'], medium:['x=(5+/-7)/4.','Half of 6=3, add/sub 9.','6sqrt18=18sqrt2.','a=3,d=4,t_8=31.','S10=5x31=155.','Factor top and bottom.','(x-4)(x-2)=0.','Square both sides.','t2/t1=2.','20-4sqrt5.'], hard:['h=-b/(2a).','Square, then check.','Factor all, then cancel.','t5/t2=r^3.','Sub x^2=x+6.','S8=2(3^8-1)/2.','Factor -(x-5)(x+1).','2k+1 and 2k+3.','Multiply by LCD.','S_n=n/2(t1+tn)=375.'] },
  'Math 30-1': { easy:['Mult by pi/180.','2pi period.','2^3=8.','8x7x6=336.','log(10^2)=2.','Mult by 180/pi.','cos0=1.','10^0=1.','5!/(2!3!)=10.','ln(e^3)=3.'], medium:['=1 always.','sin x=1/2 at 30 and 150.','10x9x8/(3x2x1).','Rewrite 16=2^4.','Domain: x>-2.','C(4,k) terms.','log3(x(x-2))=3.','Period=pi, amp=4.','8!=40320.','Take ln both sides.'], hard:['Divide sin^2+cos^2=1 by cos^2.','Let u=cosx, solve 2u^2-u-1=0.','T4=C(5,3)x^2 x 8=80x^2.','log(x(x-3))=1.','C(52,5)=2598960.','Expand LHS.','Let u=3^x.','C(5,2)xC(6,2).','2sinxcosx=cosx, factor.','Divide t6/t3=r^3=8.'] }
};

// ================================================================
// STATE
// ================================================================
var currentGrade  = null;
var practiceDiff  = 'easy';
var practiceGrade = 'Math 7';

// ================================================================
// NAVIGATION
// ================================================================
function showPage(id) {
  document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
  var t = document.getElementById('page-' + id);
  if (t) t.classList.add('active');
  var order = ['home', 'grades', 'practice', 'resources', 'about', 'contact'];
  document.querySelectorAll('.nav-link').forEach(function (b, i) { b.classList.toggle('active', order[i] === id); });
  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo(0, 0);
}
function toggleNav() { document.getElementById('navLinks').classList.toggle('open'); }

// ================================================================
// GRADE CARDS
// ================================================================
function buildGradeCard(g, fn) {
  var c = document.createElement('div');
  c.className = 'grade-card ' + g.cardClass;
  c.onclick = fn;
  c.innerHTML = '<span class="grade-tag ' + g.tagClass + '">' + g.tag + '</span><h3>' + g.label + '</h3><p>' + g.desc + '</p><div class="grade-arrow">View Lessons &rarr;</div>';
  return c;
}
function buildAllGradeCards() {
  var homeGrid = document.getElementById('homeGradeGrid');
  Object.keys(GRADES_DATA).forEach(function (gid) {
    homeGrid.appendChild(buildGradeCard(GRADES_DATA[gid], (function (id) { return function () { openGradeDetail(id); }; })(gid)));
  });
  var groups = [
    ['gradesJrGrid', ['math7', 'math8', 'math9']],
    ['gradesSr10Grid', ['math10c', 'math103']],
    ['gradesSr20Grid', ['math201', 'math202', 'math203']],
    ['gradesSr30Grid', ['math301', 'math302', 'math303']]
  ];
  groups.forEach(function (grp) {
    var el = document.getElementById(grp[0]);
    grp[1].forEach(function (gid) {
      el.appendChild(buildGradeCard(GRADES_DATA[gid], (function (id) { return function () { openGradeDetail(id); }; })(gid)));
    });
  });
}

// ================================================================
// GRADE DETAIL
// ================================================================
function openGradeDetail(gid) {
  var g = GRADES_DATA[gid];
  if (!g) return;
  currentGrade = g;
  document.getElementById('gradeDetailTitle').textContent      = g.label;
  document.getElementById('gradeDetailDesc').textContent       = g.fullDesc;
  document.getElementById('gradeDetailBreadcrumb').textContent = g.label;
  document.getElementById('practiceGradeName').textContent     = g.label;

  document.getElementById('detailTopics').innerHTML = g.topics.map(function (t) {
    return '<li class="topic-item"><span class="topic-dot"></span>' + t + '</li>';
  }).join('');
  document.getElementById('detailOutcomes').innerHTML = g.outcomes.map(function (o) {
    return '<div class="outcome-item">&#10003; ' + o + '</div>';
  }).join('');

  buildLessons(gid);
  buildGradeResources(gid);

  var section = document.querySelector('#page-grade-detail .section');
  section.querySelectorAll('.tab-btn').forEach(function (b, i) { b.classList.toggle('active', i === 0); });
  section.querySelectorAll('.tab-panel').forEach(function (p, i) { p.classList.toggle('active', i === 0); });
  document.getElementById('detailQuestions').innerHTML = '';
  document.querySelectorAll('#detailDiffBtns .diff-btn').forEach(function (b) { b.classList.remove('active'); });
  showPage('grade-detail');
}

function buildLessons(gid) {
  var container = document.getElementById('lessonsContainer');
  var units = LESSONS[gid];
  if (!units || !units.length) { container.innerHTML = '<p class="text-muted">Lessons coming soon.</p>'; return; }
  container.innerHTML = units.map(function (unit) {
    var lhtml = unit.lessons.map(function (les) {
      return '<div class="lesson-card"><div class="lesson-title">' + les.title + '</div><div class="lesson-body">' + les.body + '</div></div>';
    }).join('');
    return '<div class="unit-block"><div class="unit-header" onclick="toggleUnit(this)"><h3>' + unit.unit + '</h3><div style="display:flex;align-items:center;gap:12px"><span>' + unit.lessons.length + ' lessons</span><button class="unit-toggle" tabindex="-1">+</button></div></div><div class="unit-body">' + lhtml + '</div></div>';
  }).join('');
}
function toggleUnit(hdr) {
  var body = hdr.nextElementSibling;
  var btn  = hdr.querySelector('.unit-toggle');
  body.classList.toggle('open');
  btn.innerHTML = body.classList.contains('open') ? '&#8722;' : '+';
}

function buildGradeResources(gid) {
  var res = GRADE_RESOURCES[gid];
  var container = document.getElementById('gradeResourcesContainer');
  if (!res) { container.innerHTML = '<p class="text-muted">Resources coming soon.</p>'; return; }

  function makeCard(item, icon, bgClass, badgeClass, badgeLabel) {
    return '<div class="resource-card">' +
      '<div class="res-icon-bg ' + bgClass + '">' + icon + '</div>' +
      '<span class="resource-badge ' + badgeClass + '">' + badgeLabel + '</span>' +
      '<h3>' + item.title + '</h3>' +
      '<p>Click to generate and download as a PDF file instantly.</p>' +
      '<button class="dl-btn" onclick="generateAndDownload(\'' + item.cat + '\',\'' + item.key.replace(/'/g, "\\'") + '\')">&#11015; Download PDF</button>' +
    '</div>';
  }

  container.innerHTML =
    '<h3 style="color:var(--navy);font-weight:700;margin-bottom:1rem;font-size:1.1rem">Formula Sheets</h3>' +
    '<div class="resource-grid">' + res.formulas.map(function (r) { return makeCard(r, '&#128208;', 'res-red', 'badge-pdf', 'PDF'); }).join('') + '</div>' +
    '<h3 style="color:var(--navy);font-weight:700;margin:2rem 0 1rem;font-size:1.1rem">Study Notes</h3>' +
    '<div class="resource-grid">' + res.notes.map(function (r) { return makeCard(r, '&#128216;', 'res-blue', 'badge-notes', 'Notes'); }).join('') + '</div>' +
    '<h3 style="color:var(--navy);font-weight:700;margin:2rem 0 1rem;font-size:1.1rem">Worksheets</h3>' +
    '<div class="resource-grid">' + res.worksheets.map(function (r) { return makeCard(r, '&#128221;', 'res-yellow', 'badge-sheet', 'Worksheet'); }).join('') + '</div>' +
    '<h3 style="color:var(--navy);font-weight:700;margin:2rem 0 1rem;font-size:1.1rem">Unit Exams</h3>' +
    '<div class="resource-grid">' + res.exams.map(function (r) { return makeCard(r, '&#128221;', 'res-purple', 'badge-exam', 'Exam'); }).join('') + '</div>';
}

// ================================================================
// TABS
// ================================================================
function switchTab(btn, panelId) {
  var bar = btn.closest('.tab-bar');
  bar.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  bar.parentElement.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
  var t = document.getElementById('tab-' + panelId);
  if (t) t.classList.add('active');
}

// ================================================================
// DIFFICULTY (DETAIL PAGE)
// ================================================================
function selectDiff(btn, diff) {
  document.querySelectorAll('#detailDiffBtns .diff-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  var label  = currentGrade ? currentGrade.label : 'Math 7';
  var qPool  = QUESTIONS[label] || QUESTIONS['Math 7'];
  var qs     = qPool[diff]      || qPool.easy;
  var hPool  = HINTS[label]     || HINTS['Math 7'];
  var hints  = hPool[diff]      || hPool.easy;
  var html   = '';
  var count  = Math.min(qs.length, 6);
  for (var i = 0; i < count; i++) {
    html += '<div class="question-box"><div class="question-num">Question ' + (i + 1) + '</div>' +
      '<div class="question-text">' + qs[i] + '</div>' +
      '<textarea class="answer-area" placeholder="Type your answer here..."></textarea>' +
      '<div><button class="hint-btn" onclick="toggleHint(this)">Show Hint</button></div>' +
      '<div class="question-hint">' + (hints[i] || 'Work step by step!') + '</div></div>';
  }
  document.getElementById('detailQuestions').innerHTML = html;
}
function toggleHint(btn) {
  var h = btn.parentElement.nextElementSibling;
  h.classList.toggle('visible');
  btn.textContent = h.classList.contains('visible') ? 'Hide Hint' : 'Show Hint';
}

// ================================================================
// PRACTICE PAGE
// ================================================================
function selectPracticeGrade(btn, grade) {
  document.querySelectorAll('.grade-select-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  practiceGrade = grade;
}
function selectPracticeDiff(btn, diff) {
  document.querySelectorAll('.practice-controls .diff-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  practiceDiff = diff;
}
function generatePracticeQuestions() {
  var qPool  = QUESTIONS[practiceGrade] || QUESTIONS['Math 7'];
  var qs     = qPool[practiceDiff]      || qPool.easy;
  var hPool  = HINTS[practiceGrade]     || HINTS['Math 7'];
  var hints  = hPool[practiceDiff]      || hPool.easy;
  var labels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  var cls    = { easy: 'q-easy', medium: 'q-medium', hard: 'q-hard' };
  var html   = '';
  for (var i = 0; i < qs.length; i++) {
    var sh = (hints[i] || 'Think step by step!').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    html += '<div class="q-card"><span class="q-difficulty ' + cls[practiceDiff] + '">' + labels[practiceDiff] + '</span>' +
      '<div class="q-text">' + (i + 1) + '. ' + qs[i] + '</div>' +
      '<input type="text" class="q-input" placeholder="Your answer..." />' +
      '<div class="q-actions">' +
        '<button class="q-btn q-btn-hint" onclick="showQHint(this,\'' + sh + '\')">Hint</button>' +
        '<button class="q-btn q-btn-check" onclick="checkAnswer(this)">Check Answer</button>' +
      '</div>' +
      '<div class="q-hint-text"></div><div class="q-result"></div></div>';
  }
  document.getElementById('practiceQuestionsContainer').innerHTML = html;
}
function showQHint(btn, hint) {
  var el = btn.closest('.q-card').querySelector('.q-hint-text');
  el.textContent = hint;
  el.style.display = el.style.display === 'block' ? 'none' : 'block';
}
function checkAnswer(btn) {
  var card   = btn.closest('.q-card');
  var input  = card.querySelector('.q-input');
  var result = card.querySelector('.q-result');
  if (!input.value.trim()) {
    result.className = 'q-result q-incorrect';
    result.textContent = 'Please enter an answer first.';
    result.style.display = 'block';
    return;
  }
  result.className = 'q-result q-correct';
  result.textContent = 'Answer submitted! Check with your teacher or solution guide.';
  result.style.display = 'block';
}

// ================================================================
// GLOBAL RESOURCES PAGE
// ================================================================
function buildGlobalResources() {
  var cats = {
    formula:    { grid: 'globalFormulaGrid',    icon: '&#128208;', bg: 'res-red',    badge: 'badge-pdf',   label: 'PDF'       },
    notes:      { grid: 'globalGuidesGrid',     icon: '&#128216;', bg: 'res-blue',   badge: 'badge-notes', label: 'Notes'     },
    exams:      { grid: 'globalExamsGrid',      icon: '&#128221;', bg: 'res-purple', badge: 'badge-exam',  label: 'Exam'      },
    worksheets: { grid: 'globalWorksheetGrid',  icon: '&#128221;', bg: 'res-yellow', badge: 'badge-sheet', label: 'Worksheet' }
  };

  var buckets = { formula: [], notes: [], exams: [], worksheets: [] };

  Object.keys(GRADE_RESOURCES).forEach(function (gid) {
    var r = GRADE_RESOURCES[gid];
    var g = GRADES_DATA[gid];
    if (!g) return;
    ['formulas', 'notes', 'worksheets', 'exams'].forEach(function (section) {
      var bucket = section === 'formulas' ? 'formula' : section === 'notes' ? 'notes' : section === 'exams' ? 'exams' : 'worksheets';
      (r[section] || []).forEach(function (item) {
        buckets[bucket].push({ item: item, gradeLabel: g.label });
      });
    });
  });

  Object.keys(cats).forEach(function (cat) {
    var cfg = cats[cat];
    var el  = document.getElementById(cfg.grid);
    if (!el) return;
    el.innerHTML = buckets[cat].map(function (entry) {
      var item = entry.item;
      return '<div class="resource-card">' +
        '<div class="res-icon-bg ' + cfg.bg + '">' + cfg.icon + '</div>' +
        '<span class="resource-badge ' + cfg.badge + '">' + cfg.label + '</span>' +
        '<h3>' + item.title + '</h3>' +
        '<p>For ' + entry.gradeLabel + '. Click to generate and download instantly.</p>' +
        '<button class="dl-btn" onclick="generateAndDownload(\'' + item.cat + '\',\'' + item.key.replace(/'/g, "\\'") + '\')">&#11015; Download PDF</button>' +
      '</div>';
    }).join('') || '<p class="text-muted">Resources are being prepared. Check back soon!</p>';
  });
}

// ================================================================
// CONTACT FORM
// ================================================================
function submitForm() {
  var name  = document.getElementById('cName').value.trim();
  var email = document.getElementById('cEmail').value.trim();
  var msg   = document.getElementById('cMsg').value.trim();
  if (!name || !email || !msg) { alert('Please fill in your name, email, and message.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email address.'); return; }
  document.getElementById('formSuccess').style.display = 'block';
  document.getElementById('cName').value  = '';
  document.getElementById('cEmail').value = '';
  document.getElementById('cRole').value  = '';
  document.getElementById('cMsg').value   = '';
}

// ================================================================
// INIT
// ================================================================
initVisitorCounter();
buildAllGradeCards();
buildGlobalResources();
