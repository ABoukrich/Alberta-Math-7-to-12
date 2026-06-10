/* ============================================================
   Alberta Math 7-12  |  script.js  — Full Enhanced Version
   ============================================================ */

// ============================================================
// SVG HELPERS
// ============================================================
function svgGrid(w,h,xMin,xMax,yMin,yMax,step){
  step=step||1;
  var lines='';
  var xs=(w-60)/(xMax-xMin), ys=(h-60)/(yMax-yMin);
  var ox=30+(-xMin)*xs, oy=h-30-(-yMin)*ys;
  // grid
  for(var x=xMin;x<=xMax;x+=step){
    var px=30+( x-xMin)*xs;
    lines+='<line x1="'+px+'" y1="30" x2="'+px+'" y2="'+(h-30)+'" stroke="#e0e0e0" stroke-width="0.5"/>';
    if(x!==0)lines+='<text x="'+px+'" y="'+(oy+14)+'" text-anchor="middle" font-size="10" fill="#888">'+x+'</text>';
  }
  for(var y=yMin;y<=yMax;y+=step){
    var py=h-30-(y-yMin)*ys;
    lines+='<line x1="30" y1="'+py+'" x2="'+(w-30)+'" y2="'+py+'" stroke="#e0e0e0" stroke-width="0.5"/>';
    if(y!==0)lines+='<text x="'+(ox-6)+'" y="'+(py+4)+'" text-anchor="end" font-size="10" fill="#888">'+y+'</text>';
  }
  // axes
  lines+='<line x1="30" y1="'+oy+'" x2="'+(w-30)+'" y2="'+oy+'" stroke="#333" stroke-width="1.5" marker-end="url(#arr)"/>';
  lines+='<line x1="'+ox+'" y1="'+(h-30)+'" x2="'+ox+'" y2="30" stroke="#333" stroke-width="1.5" marker-end="url(#arr)"/>';
  lines+='<text x="'+(w-20)+'" y="'+(oy+4)+'" font-size="12" fill="#333">x</text>';
  lines+='<text x="'+(ox+4)+'" y="22" font-size="12" fill="#333">y</text>';
  lines+='<text x="'+(ox-8)+'" y="'+(oy+14)+'" text-anchor="middle" font-size="10" fill="#888">0</text>';
  return {svg:lines, ox:ox, oy:oy, xs:xs, ys:ys, w:w, h:h, xMin:xMin, yMin:yMin};
}
function plotLine(g,m,b,color){
  var pts=[];
  for(var x=g.xMin;x<=(g.w-60)/g.xs+g.xMin;x+=0.1){
    var y=m*x+b;
    var px=g.ox+x*g.xs, py=g.oy-y*g.ys;
    pts.push(px+','+py);
  }
  return '<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+(color||'#1A6BB5')+'" stroke-width="2.5"/>';
}
function plotParabola(g,a,h,k,color){
  var pts=[];
  var xStep=0.05;
  for(var x=g.xMin;x<=(g.w-60)/g.xs+g.xMin;x+=xStep){
    var y=a*(x-h)*(x-h)+k;
    var px=g.ox+x*g.xs, py=g.oy-y*g.ys;
    if(py>5 && py<g.h-5) pts.push(px+','+py);
  }
  return '<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+(color||'#DC3545')+'" stroke-width="2.5"/>';
}
function svgDefs(){
  return '<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#333"/></marker></defs>';
}
function makeSVG(w,h,content){
  return '<div class="svg-wrap"><svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid #e0e0e0;border-radius:8px">'+svgDefs()+content+'</svg></div>';
}

function numberLineSVG(min,max,highlights){
  var w=400,h=60,pad=30;
  var range=max-min, scale=(w-2*pad)/range;
  var mid=h/2;
  var html='<line x1="'+pad+'" y1="'+mid+'" x2="'+(w-pad)+'" y2="'+mid+'" stroke="#333" stroke-width="2"/>';
  for(var i=min;i<=max;i++){
    var px=pad+(i-min)*scale;
    html+='<line x1="'+px+'" y1="'+(mid-6)+'" x2="'+px+'" y2="'+(mid+6)+'" stroke="#333" stroke-width="1.5"/>';
    html+='<text x="'+px+'" y="'+(mid+18)+'" text-anchor="middle" font-size="11" fill="#333">'+i+'</text>';
  }
  if(highlights){
    highlights.forEach(function(pt){
      var px=pad+(pt.v-min)*scale;
      html+='<circle cx="'+px+'" cy="'+mid+'" r="5" fill="'+(pt.open?'none':'#1A6BB5')+'" stroke="#1A6BB5" stroke-width="2"/>';
    });
  }
  return makeSVG(w,h,html);
}

function coordinateGridSVG(pts,lines,curves,labels){
  var w=300,h=300;
  var g=svgGrid(w,h,-5,5,-5,5,1);
  var content=g.svg;
  if(lines){ lines.forEach(function(l){ content+=plotLine(g,l.m,l.b,l.color); }); }
  if(curves){ curves.forEach(function(c){ content+=plotParabola(g,c.a,c.h||0,c.k||0,c.color); }); }
  if(pts){ pts.forEach(function(p){
    var px=g.ox+p.x*g.xs, py=g.oy-p.y*g.ys;
    content+='<circle cx="'+px+'" cy="'+py+'" r="4" fill="'+(p.color||'#DC3545')+'"/>';
    if(p.label) content+='<text x="'+(px+6)+'" y="'+(py-4)+'" font-size="11" fill="#333">'+p.label+'</text>';
  }); }
  if(labels){ labels.forEach(function(l){
    var px=g.ox+l.x*g.xs, py=g.oy-l.y*g.ys;
    content+='<text x="'+px+'" y="'+py+'" font-size="11" fill="'+(l.color||'#333')+'">'+l.t+'</text>';
  }); }
  return makeSVG(w,h,content);
}

function triangleSVG(a,b,c,la,lb,lc){
  var w=280,h=220,pad=30;
  var ax=pad,ay=h-pad, bx=w-pad,by=h-pad, cx=pad+(c/(a+b))*(w-2*pad)+40, cy=pad+40;
  var html='<polygon points="'+ax+','+ay+' '+bx+','+by+' '+cx+','+cy+'" fill="#E8F4FD" stroke="#1A6BB5" stroke-width="2"/>';
  html+='<text x="'+(ax-16)+'" y="'+(ay+4)+'" font-size="12" font-weight="bold" fill="#0B2545">'+( la||'A')+'</text>';
  html+='<text x="'+(bx+4)+'" y="'+(by+4)+'" font-size="12" font-weight="bold" fill="#0B2545">'+(lb||'B')+'</text>';
  html+='<text x="'+(cx-6)+'" y="'+(cy-8)+'" font-size="12" font-weight="bold" fill="#0B2545">'+(lc||'C')+'</text>';
  var ma=(ax+cx)/2, may=(ay+cy)/2;
  html+='<text x="'+(ma-14)+'" y="'+(may)+'" font-size="11" fill="#DC3545">'+(b||'b')+'</text>';
  var mb=(bx+cx)/2, mby=(by+cy)/2;
  html+='<text x="'+(mb+4)+'" y="'+mby+'" font-size="11" fill="#DC3545">'+(a||'a')+'</text>';
  html+='<text x="'+((ax+bx)/2-8)+'" y="'+(ay+14)+'" font-size="11" fill="#DC3545">'+(c||'c')+'</text>';
  return makeSVG(w,h,html);
}

function rightTriangleSVG(base,height,hypLabel){
  var w=260,h=200,pad=30;
  var ax=pad,ay=h-pad, bx=w-pad,by=h-pad, cx=pad,cy=pad;
  var html='<polygon points="'+ax+','+ay+' '+bx+','+by+' '+cx+','+cy+'" fill="#E8F4FD" stroke="#1A6BB5" stroke-width="2"/>';
  html+='<rect x="'+ax+'" y="'+(ay-12)+'" width="12" height="12" fill="none" stroke="#1A6BB5" stroke-width="1.5"/>';
  html+='<text x="'+((ax+bx)/2-10)+'" y="'+(ay+14)+'" font-size="12" fill="#DC3545">'+(base||'base')+'</text>';
  html+='<text x="'+(ax-30)+'" y="'+((ay+cy)/2)+'" font-size="12" fill="#DC3545">'+(height||'height')+'</text>';
  html+='<text x="'+((bx+cx)/2+4)+'" y="'+((by+cy)/2-4)+'" font-size="12" fill="#198754">'+(hypLabel||'hyp')+'</text>';
  return makeSVG(w,h,html);
}

function circlePartsSVG(){
  var w=240,h=240,cx=120,cy=120,r=80;
  var html='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#E8F4FD" stroke="#1A6BB5" stroke-width="2"/>';
  html+='<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+r)+'" y2="'+cy+'" stroke="#DC3545" stroke-width="2"/>';
  html+='<line x1="'+(cx-r)+'" y1="'+cy+'" x2="'+(cx+r)+'" y2="'+cy+'" stroke="#198754" stroke-width="2" stroke-dasharray="4,3"/>';
  html+='<circle cx="'+cx+'" cy="'+cy+'" r="3" fill="#333"/>';
  html+='<text x="'+(cx+r/2)+'" y="'+(cy-6)+'" font-size="12" fill="#DC3545">r</text>';
  html+='<text x="'+(cx-8)+'" y="'+(cy+20)+'" font-size="12" fill="#198754">d=2r</text>';
  html+='<text x="55" y="50" font-size="11" fill="#1A6BB5">C=2&#960;r</text>';
  html+='<text x="55" y="66" font-size="11" fill="#1A6BB5">A=&#960;r&#178;</text>';
  return makeSVG(w,h,html);
}

function barChartSVG(data,title){
  var w=320,h=200,pad=40,barW=30,gap=10;
  var maxVal=0;
  data.forEach(function(d){if(d.v>maxVal)maxVal=d.v;});
  var scale=(h-2*pad)/maxVal;
  var html='';
  if(title) html+='<text x="'+w/2+'" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#0B2545">'+title+'</text>';
  html+='<line x1="'+pad+'" y1="'+(h-pad)+'" x2="'+(w-10)+'" y2="'+(h-pad)+'" stroke="#333" stroke-width="1.5"/>';
  html+='<line x1="'+pad+'" y1="20" x2="'+pad+'" y2="'+(h-pad)+'" stroke="#333" stroke-width="1.5"/>';
  var colors=['#1A6BB5','#F4A324','#198754','#DC3545','#7B2D8B','#0B2545'];
  data.forEach(function(d,i){
    var bh=d.v*scale;
    var bx=pad+20+i*(barW+gap);
    var by=h-pad-bh;
    html+='<rect x="'+bx+'" y="'+by+'" width="'+barW+'" height="'+bh+'" fill="'+colors[i%colors.length]+'" rx="3"/>';
    html+='<text x="'+(bx+barW/2)+'" y="'+(by-4)+'" text-anchor="middle" font-size="10" fill="#333">'+d.v+'</text>';
    html+='<text x="'+(bx+barW/2)+'" y="'+(h-pad+12)+'" text-anchor="middle" font-size="9" fill="#555">'+d.l+'</text>';
  });
  return makeSVG(w,h,html);
}

function transformationSVG(){
  var w=320,h=280;
  var g=svgGrid(w,h,-5,5,-5,5,1);
  var content=g.svg;
  // original triangle
  var pts=[[1,1],[3,1],[1,4]];
  var tpts=pts.map(function(p){return (g.ox+p[0]*g.xs)+','+(g.oy-p[1]*g.ys);}).join(' ');
  content+='<polygon points="'+tpts+'" fill="rgba(26,107,181,0.2)" stroke="#1A6BB5" stroke-width="2"/>';
  content+='<text x="'+(g.ox+2*g.xs)+'" y="'+(g.oy-1.5*g.ys)+'" font-size="10" fill="#1A6BB5">A</text>';
  // translated triangle (+3, +1)
  var spts=pts.map(function(p){return (g.ox+(p[0]+3)*g.xs)+','+(g.oy-(p[1]-2)*g.ys);}).join(' ');
  content+='<polygon points="'+spts+'" fill="rgba(220,53,69,0.2)" stroke="#DC3545" stroke-width="2" stroke-dasharray="5,3"/>';
  content+='<text x="'+(g.ox+5*g.xs-18)+'" y="'+(g.oy+1*g.ys)+'" font-size="10" fill="#DC3545">A\'</text>';
  content+='<text x="'+(g.ox-4.8*g.xs)+'" y="24" font-size="10" fill="#1A6BB5">&#8680; Blue=Original</text>';
  content+='<text x="'+(g.ox-4.8*g.xs)+'" y="36" font-size="10" fill="#DC3545">&#8680; Red=Translated (+3,&#8209;2)</text>';
  return makeSVG(w,h,content);
}

// ============================================================
// LESSON DATA
// ============================================================
var LESSONS = {

math7: [
  {
    unit:'Unit 1: Integers',
    lessons:[
      {
        title:'Lesson 1.1 — Understanding Integers',
        body:'<p><strong>What are integers?</strong> Integers are all whole numbers and their negatives, including zero: ... &#8722;3, &#8722;2, &#8722;1, 0, 1, 2, 3 ...</p>'+
          '<p>We use a number line to represent integers visually. Numbers to the <strong>right</strong> are greater; numbers to the <strong>left</strong> are smaller.</p>'+
          numberLineSVG(-6,6,[{v:-3,open:false},{v:4,open:false}])+
          '<div class="example-box"><strong>Worked Example</strong>Order from least to greatest: 5, &#8722;2, 0, &#8722;7, 3<br>Answer: &#8722;7 &lt; &#8722;2 &lt; 0 &lt; 3 &lt; 5</div>'+
          '<p><strong>Key Vocabulary:</strong> <em>Positive integer</em> — greater than zero. <em>Negative integer</em> — less than zero. <em>Opposite integers</em> — same distance from zero, e.g., +3 and &#8722;3.</p>'
      },
      {
        title:'Lesson 1.2 — Adding and Subtracting Integers',
        body:'<p><strong>Adding integers:</strong> Same signs → add and keep the sign. Different signs → subtract and keep the sign of the larger absolute value.</p>'+
          '<div class="formula-box">(+a) + (+b) = +(a+b) &nbsp;&nbsp;&nbsp; (&#8722;a) + (&#8722;b) = &#8722;(a+b) &nbsp;&nbsp;&nbsp; (+a) + (&#8722;b) = +(a&#8722;b) if a&gt;b</div>'+
          '<div class="example-box"><strong>Examples</strong>&#8722;4 + 7 = +3 &nbsp;&nbsp; &#8722;5 + (&#8722;3) = &#8722;8 &nbsp;&nbsp; 6 + (&#8722;9) = &#8722;3</div>'+
          '<p><strong>Subtracting integers:</strong> Change subtraction to adding the opposite: a &#8722; b = a + (&#8722;b)</p>'+
          '<div class="example-box"><strong>Examples</strong>8 &#8722; (&#8722;3) = 8 + 3 = 11 &nbsp;&nbsp; &#8722;5 &#8722; 4 = &#8722;5 + (&#8722;4) = &#8722;9</div>'
      },
      {
        title:'Lesson 1.3 — Multiplying and Dividing Integers',
        body:'<div class="formula-box">(+)(+) = (+) &nbsp; (&#8722;)(&#8722;) = (+) &nbsp; (+)(&#8722;) = (&#8722;) &nbsp; (&#8722;)(+) = (&#8722;)</div>'+
          '<p>The same sign rules apply to division.</p>'+
          '<div class="example-box"><strong>Examples</strong>(&#8722;4) &#215; (&#8722;3) = 12 &nbsp;&nbsp; (&#8722;6) &#215; 5 = &#8722;30 &nbsp;&nbsp; (&#8722;18) &#247; (&#8722;3) = 6 &nbsp;&nbsp; 20 &#247; (&#8722;4) = &#8722;5</div>'+
          '<p><strong>Order of Operations (BEDMAS):</strong> Brackets → Exponents → Division/Multiplication (left to right) → Addition/Subtraction (left to right).</p>'+
          '<div class="example-box"><strong>Worked Example</strong>&#8722;2 + 3 &#215; (&#8722;4) = &#8722;2 + (&#8722;12) = &#8722;14</div>'
      }
    ]
  },
  {
    unit:'Unit 2: Fractions, Decimals & Percents',
    lessons:[
      {
        title:'Lesson 2.1 — Fractions Review and Operations',
        body:'<p><strong>Adding/Subtracting Fractions:</strong> Find a common denominator, then add or subtract numerators.</p>'+
          '<div class="formula-box">a/b + c/d = (ad + bc) / bd</div>'+
          '<div class="example-box"><strong>Example</strong>2/3 + 3/4 = 8/12 + 9/12 = 17/12 = 1&#189;</div>'+
          '<p><strong>Multiplying Fractions:</strong> Multiply numerators together and denominators together.</p>'+
          '<div class="example-box"><strong>Example</strong>(3/5) &#215; (2/7) = 6/35</div>'+
          '<p><strong>Dividing Fractions:</strong> Multiply by the reciprocal of the divisor.</p>'+
          '<div class="example-box"><strong>Example</strong>(3/4) &#247; (2/3) = (3/4) &#215; (3/2) = 9/8 = 1&#8539;</div>'
      },
      {
        title:'Lesson 2.2 — Converting Between Fractions, Decimals, and Percents',
        body:'<p><strong>Fraction to Decimal:</strong> Divide the numerator by the denominator.<br>Example: 3/8 = 3 &#247; 8 = 0.375</p>'+
          '<p><strong>Decimal to Percent:</strong> Multiply by 100.<br>Example: 0.375 &#215; 100 = 37.5%</p>'+
          '<p><strong>Percent to Decimal:</strong> Divide by 100.<br>Example: 65% = 0.65</p>'+
          '<div class="example-box"><strong>Worked Example</strong>Write 5/8 as a decimal and a percent.<br>5 &#247; 8 = 0.625 &nbsp; 0.625 &#215; 100 = 62.5%</div>'
      },
      {
        title:'Lesson 2.3 — Percent Applications',
        body:'<p><strong>Finding a percent of a number:</strong> Percent &#247; 100 &#215; number</p>'+
          '<div class="example-box"><strong>Example</strong>Find 35% of 80: 35/100 &#215; 80 = 28</div>'+
          '<p><strong>Percent increase/decrease:</strong></p>'+
          '<div class="formula-box">% Change = (New &#8722; Old) / Old &#215; 100%</div>'+
          '<div class="example-box"><strong>Example</strong>Price increases from $40 to $50.<br>% Change = (50&#8722;40)/40 &#215; 100% = 25% increase</div>'+
          '<p><strong>Sales Tax &amp; Discounts:</strong><br>Sale Price = Original &#215; (1 &#8722; discount rate)<br>Total with Tax = Price &#215; (1 + tax rate)</div>'
      }
    ]
  },
  {
    unit:'Unit 3: Ratios & Proportional Reasoning',
    lessons:[
      {
        title:'Lesson 3.1 — Ratios and Rates',
        body:'<p>A <strong>ratio</strong> compares two quantities with the same unit. A <strong>rate</strong> compares quantities with different units.</p>'+
          '<div class="example-box"><strong>Examples</strong>Ratio: 3 red to 5 blue = 3:5<br>Rate: 120 km in 2 hours = 60 km/h (unit rate)</div>'+
          '<p><strong>Simplifying Ratios:</strong> Divide both terms by their GCF.<br>18:24 &#247; 6 = 3:4</p>'
      },
      {
        title:'Lesson 3.2 — Proportions',
        body:'<p>A <strong>proportion</strong> is an equation stating two ratios are equal: a/b = c/d</p>'+
          '<p><strong>Cross-multiplication method:</strong> If a/b = c/d, then ad = bc</p>'+
          '<div class="example-box"><strong>Worked Example</strong>Solve: x/5 = 12/20<br>Cross multiply: 20x = 60<br>x = 3</div>'+
          '<p><strong>Application — Scale Diagrams:</strong> If 1 cm on a map = 50 km, how far is 7 cm?<br>1/50 = 7/x → x = 350 km</p>'
      }
    ]
  },
  {
    unit:'Unit 4: Patterns & Linear Equations',
    lessons:[
      {
        title:'Lesson 4.1 — Expressions and Variables',
        body:'<p>A <strong>variable</strong> is a letter representing an unknown value. An <strong>expression</strong> is a combination of numbers, variables, and operations (no = sign).</p>'+
          '<p>Example: 3x + 5 is an expression where x is the variable.</p>'+
          '<p><strong>Evaluating expressions:</strong> Substitute the value and calculate.</p>'+
          '<div class="example-box"><strong>Example</strong>Evaluate 4n &#8722; 7 when n = 3:<br>4(3) &#8722; 7 = 12 &#8722; 7 = 5</div>'
      },
      {
        title:'Lesson 4.2 — Solving One-Step Equations',
        body:'<p>Use <strong>inverse operations</strong> to isolate the variable. Whatever you do to one side, do to the other.</p>'+
          '<div class="formula-box">If x + a = b, then x = b &#8722; a &nbsp;&nbsp; If x &#8722; a = b, then x = b + a</div>'+
          '<div class="formula-box">If ax = b, then x = b/a &nbsp;&nbsp; If x/a = b, then x = ab</div>'+
          '<div class="example-box"><strong>Examples</strong>x + 7 = 12 → x = 5 &nbsp;&nbsp; 3x = 21 → x = 7 &nbsp;&nbsp; x/4 = 6 → x = 24</div>'
      },
      {
        title:'Lesson 4.3 — Solving Two-Step Equations',
        body:'<p>Reverse order of operations to isolate the variable: undo addition/subtraction first, then multiplication/division.</p>'+
          '<div class="example-box"><strong>Worked Example</strong>Solve 3x &#8722; 7 = 14<br>Step 1: Add 7 to both sides → 3x = 21<br>Step 2: Divide by 3 → x = 7<br>Check: 3(7) &#8722; 7 = 14 ✓</div>'+
          '<div class="example-box"><strong>Worked Example</strong>Solve 2x + 5 = &#8722;1<br>Step 1: Subtract 5 → 2x = &#8722;6<br>Step 2: Divide by 2 → x = &#8722;3</div>'
      }
    ]
  },
  {
    unit:'Unit 5: Geometry — Shape & Space',
    lessons:[
      {
        title:'Lesson 5.1 — Angles and Triangles',
        body:'<p><strong>Types of angles:</strong><br>Acute: 0°–90° &nbsp; Right: 90° &nbsp; Obtuse: 90°–180° &nbsp; Straight: 180°</p>'+
          '<p><strong>Angle pairs:</strong><br>Complementary: add to 90° &nbsp; Supplementary: add to 180° &nbsp; Vertically opposite: equal</p>'+
          '<p><strong>Triangle angle sum:</strong> All three angles in any triangle add to <strong>180°</strong>.</p>'+
          triangleSVG(5,4,6,'A','B','C')+
          '<div class="example-box"><strong>Example</strong>A triangle has angles 45° and 70°. Find the third angle.<br>Third angle = 180° &#8722; 45° &#8722; 70° = 65°</div>'
      },
      {
        title:'Lesson 5.2 — Area and Perimeter',
        body:'<p><strong>Perimeter</strong> = total distance around a shape (add all sides).</p>'+
          '<p><strong>Area Formulas:</strong></p>'+
          '<div class="formula-box">Rectangle: A = l &#215; w &nbsp;&nbsp; Triangle: A = &#189;bh &nbsp;&nbsp; Parallelogram: A = bh</div>'+
          '<div class="formula-box">Trapezoid: A = &#189;(a+b)h &nbsp;&nbsp; Circle: A = &#960;r&#178; &nbsp;&nbsp; C = 2&#960;r</div>'+
          circlePartsSVG()+
          '<div class="example-box"><strong>Example</strong>Find the area of a triangle with base 10 cm and height 6 cm.<br>A = &#189; &#215; 10 &#215; 6 = 30 cm&#178;</div>'
      },
      {
        title:'Lesson 5.3 — Transformations',
        body:'<p>There are four main transformations:</p>'+
          '<ul><li><strong>Translation:</strong> Slide — every point moves the same distance and direction</li>'+
          '<li><strong>Reflection:</strong> Flip over a line of symmetry</li>'+
          '<li><strong>Rotation:</strong> Turn around a fixed point</li>'+
          '<li><strong>Dilation:</strong> Enlarge or reduce by a scale factor</li></ul>'+
          transformationSVG()+
          '<div class="example-box"><strong>Translation Example</strong>Point A(2, 3) translated by (+4, &#8722;2) lands at A\'(6, 1)</div>'
      }
    ]
  },
  {
    unit:'Unit 6: Statistics & Probability',
    lessons:[
      {
        title:'Lesson 6.1 — Data Collection and Graphs',
        body:'<p><strong>Types of data:</strong><br>Discrete: counted (number of students) &nbsp; Continuous: measured (height)</p>'+
          '<p><strong>Graphs:</strong><br>Bar graph: compare categories &nbsp; Line graph: show change over time &nbsp; Circle graph: show parts of a whole &nbsp; Histogram: show frequency in ranges</p>'+
          barChartSVG([{l:'Mon',v:8},{l:'Tue',v:12},{l:'Wed',v:6},{l:'Thu',v:15},{l:'Fri',v:9}],'Quiz Scores by Day')+
          '<p><strong>Measures of Central Tendency:</strong><br>Mean = sum &#247; count &nbsp; Median = middle value &nbsp; Mode = most frequent</p>'+
          '<div class="example-box"><strong>Example</strong>Data: 4, 7, 7, 9, 13<br>Mean = 40/5 = 8 &nbsp; Median = 7 &nbsp; Mode = 7</div>'
      },
      {
        title:'Lesson 6.2 — Probability',
        body:'<p><strong>Probability</strong> is the chance of an event occurring.</p>'+
          '<div class="formula-box">P(event) = Number of favourable outcomes / Total possible outcomes</div>'+
          '<p>Probability ranges from 0 (impossible) to 1 (certain).</p>'+
          '<div class="example-box"><strong>Example</strong>P(rolling a 3 on a standard die) = 1/6 &#8776; 0.167 = 16.7%</div>'+
          '<p><strong>Complementary events:</strong> P(not A) = 1 &#8722; P(A)</p>'+
          '<div class="example-box"><strong>Example</strong>P(not rolling a 3) = 1 &#8722; 1/6 = 5/6</div>'
      }
    ]
  }
],

math8:[
  {
    unit:'Unit 1: Square Roots & Pythagorean Theorem',
    lessons:[
      {
        title:'Lesson 1.1 — Perfect Squares and Square Roots',
        body:'<p>A <strong>perfect square</strong> is a number that is the product of an integer times itself: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 ...</p>'+
          '<p>The <strong>square root</strong> (&#8730;) undoes squaring: &#8730;49 = 7 because 7&#178; = 49.</p>'+
          '<p><strong>Estimating square roots:</strong> &#8730;50 is between &#8730;49 = 7 and &#8730;64 = 8, closer to 7. &#8776; 7.07</p>'+
          '<div class="example-box"><strong>Examples</strong>&#8730;144 = 12 &nbsp;&nbsp; &#8730;225 = 15 &nbsp;&nbsp; &#8730;2 &#8776; 1.41 &nbsp;&nbsp; &#8730;10 &#8776; 3.16</div>'
      },
      {
        title:'Lesson 1.2 — The Pythagorean Theorem',
        body:'<p>In a <strong>right triangle</strong>, the square of the hypotenuse equals the sum of the squares of the other two sides.</p>'+
          '<div class="formula-box">a&#178; + b&#178; = c&#178;</div>'+
          rightTriangleSVG('a','b','c (hyp)')+
          '<div class="example-box"><strong>Find the hypotenuse</strong>Legs: a=6, b=8<br>c&#178; = 6&#178; + 8&#178; = 36 + 64 = 100<br>c = &#8730;100 = 10</div>'+
          '<div class="example-box"><strong>Find a missing leg</strong>Hypotenuse c=13, one leg a=5<br>5&#178; + b&#178; = 13&#178; → 25 + b&#178; = 169 → b&#178; = 144 → b = 12</div>'
      },
      {
        title:'Lesson 1.3 — Pythagorean Theorem Applications',
        body:'<p>The Pythagorean theorem applies to any real-world situation involving right triangles.</p>'+
          '<div class="example-box"><strong>Example 1 — Ladder Problem</strong>A 10 m ladder leans against a wall. The base is 6 m from the wall. How high up the wall does it reach?<br>h&#178; + 6&#178; = 10&#178; → h&#178; = 64 → h = 8 m</div>'+
          '<div class="example-box"><strong>Example 2 — Diagonal of a Rectangle</strong>A rectangle is 5 cm wide and 12 cm long. Find the diagonal.<br>d = &#8730;(5&#178;+12&#178;) = &#8730;(25+144) = &#8730;169 = 13 cm</div>'+
          '<div class="example-box"><strong>Example 3 — Distance on a Grid</strong>Points A(1,2) and B(5,5). Distance = &#8730;((5&#8722;1)&#178;+(5&#8722;2)&#178;) = &#8730;(16+9) = &#8730;25 = 5</div>'
      }
    ]
  },
  {
    unit:'Unit 2: Rational Numbers',
    lessons:[
      {
        title:'Lesson 2.1 — Introduction to Rational Numbers',
        body:'<p>A <strong>rational number</strong> is any number that can be written as a/b where a and b are integers and b &#8800; 0. This includes fractions, terminating decimals, and repeating decimals.</p>'+
          numberLineSVG(-3,3,[{v:-1.5,open:false},{v:0.75,open:false}])+
          '<div class="example-box"><strong>Examples of Rational Numbers</strong>3/4, &#8722;2/5, 0.6&#773; (0.666...), 1.25, &#8722;7, 0</div>'+
          '<p>Irrational numbers (e.g., &#8730;2, &#960;) CANNOT be written as a fraction of integers.</p>'
      },
      {
        title:'Lesson 2.2 — Operations with Rational Numbers',
        body:'<p>Adding/Subtracting: Use the same rules as fractions — common denominator needed.</p>'+
          '<div class="example-box"><strong>Examples</strong>&#8722;3/4 + 1/2 = &#8722;3/4 + 2/4 = &#8722;1/4<br>&#8722;2.5 + 1.8 = &#8722;0.7<br>&#8722;1&#190; &#8722; (&#8722;2&#188;) = &#8722;1&#190; + 2&#188; = 7/12</div>'+
          '<p>Multiplying/Dividing: Same sign rules as integers. Apply them to fractions normally.</p>'+
          '<div class="example-box"><strong>Examples</strong>(&#8722;2/3) &#215; (3/4) = &#8722;6/12 = &#8722;1/2<br>(&#8722;5/6) &#247; (&#8722;1/3) = (&#8722;5/6) &#215; (&#8722;3/1) = 15/6 = 5/2</div>'
      }
    ]
  },
  {
    unit:'Unit 3: Percents',
    lessons:[
      {
        title:'Lesson 3.1 — Percent Increase, Decrease & Applications',
        body:'<div class="formula-box">Percent Change = (New &#8722; Original) / Original &#215; 100%</div>'+
          '<div class="example-box"><strong>Example — Sale Price</strong>A $120 jacket is 30% off.<br>Discount = 0.30 &#215; 120 = $36 &nbsp; Sale Price = $120 &#8722; $36 = $84<br>Or: Sale Price = 120 &#215; 0.70 = $84</div>'+
          '<div class="example-box"><strong>Example — Tax</strong>A $60 item has 5% GST and 7% PST.<br>Tax = 12% of $60 = $7.20 &nbsp; Total = $67.20</div>'+
          '<div class="example-box"><strong>Example — Simple Interest</strong>Invest $500 at 4% per year for 3 years.<br>I = P &#215; r &#215; t = 500 &#215; 0.04 &#215; 3 = $60</div>'
      },
      {
        title:'Lesson 3.2 — Commission, Tip & Markup',
        body:'<p><strong>Commission:</strong> Percent of sales earned as pay.</p>'+
          '<div class="example-box"><strong>Example</strong>A salesperson earns 8% on $2500 in sales.<br>Commission = 0.08 &#215; 2500 = $200</div>'+
          '<p><strong>Markup:</strong> Amount added to cost price to determine selling price.</p>'+
          '<div class="example-box"><strong>Example</strong>A store buys a shirt for $20 and marks it up 40%.<br>Markup = 0.40 &#215; 20 = $8 &nbsp; Selling Price = $28</div>'
      }
    ]
  },
  {
    unit:'Unit 4: Linear Equations',
    lessons:[
      {
        title:'Lesson 4.1 — Solving Multi-Step Linear Equations',
        body:'<p>Strategy: Expand brackets → collect like terms → move variables to one side → isolate variable.</p>'+
          '<div class="example-box"><strong>Example 1</strong>Solve 4(x &#8722; 2) + 3 = 15<br>4x &#8722; 8 + 3 = 15<br>4x &#8722; 5 = 15<br>4x = 20<br>x = 5</div>'+
          '<div class="example-box"><strong>Example 2</strong>Solve 3x + 7 = 5x &#8722; 1<br>7 + 1 = 5x &#8722; 3x<br>8 = 2x<br>x = 4</div>'
      },
      {
        title:'Lesson 4.2 — Graphing Linear Equations',
        body:'<p>A linear equation in the form y = mx + b graphs as a straight line.</p>'+
          '<p><strong>m</strong> = slope (rise over run) &nbsp; <strong>b</strong> = y-intercept</p>'+
          coordinateGridSVG(
            [{x:0,y:1,label:'(0,1)',color:'#DC3545'},{x:2,y:5,label:'(2,5)',color:'#DC3545'}],
            [{m:2,b:1,color:'#1A6BB5'}]
          )+
          '<div class="example-box"><strong>Graphing y = 2x + 1</strong>y-intercept: (0,1). Slope = 2 = rise/run. Go up 2, right 1 to plot more points.</div>'
      }
    ]
  },
  {
    unit:'Unit 5: 3D Geometry',
    lessons:[
      {
        title:'Lesson 5.1 — Surface Area',
        body:'<p><strong>Surface area</strong> is the total area of all faces of a 3D object.</p>'+
          '<div class="formula-box">Rectangular Prism: SA = 2(lw + lh + wh)</div>'+
          '<div class="formula-box">Cylinder: SA = 2&#960;r&#178; + 2&#960;rh</div>'+
          '<div class="formula-box">Triangular Prism: SA = 2(&#189;bh) + 3 rectangular faces</div>'+
          '<div class="example-box"><strong>Example</strong>Find SA of a rectangular prism: l=5, w=3, h=4<br>SA = 2(5&#215;3 + 5&#215;4 + 3&#215;4) = 2(15+20+12) = 2(47) = 94 cm&#178;</div>'
      },
      {
        title:'Lesson 5.2 — Volume',
        body:'<p><strong>Volume</strong> measures the space inside a 3D object.</p>'+
          '<div class="formula-box">Prism: V = Base Area &#215; height</div>'+
          '<div class="formula-box">Cylinder: V = &#960;r&#178;h</div>'+
          '<div class="formula-box">Pyramid: V = &#8531; &#215; Base Area &#215; height</div>'+
          '<div class="formula-box">Cone: V = &#8531;&#960;r&#178;h &nbsp;&nbsp; Sphere: V = (4/3)&#960;r&#179;</div>'+
          '<div class="example-box"><strong>Example</strong>Volume of a cylinder: r=4 cm, h=9 cm<br>V = &#960; &#215; 4&#178; &#215; 9 = 144&#960; &#8776; 452.4 cm&#179;</div>'
      }
    ]
  },
  {
    unit:'Unit 6: Probability',
    lessons:[
      {
        title:'Lesson 6.1 — Experimental vs Theoretical Probability',
        body:'<p><strong>Theoretical Probability:</strong> Based on equal outcomes without doing the experiment.</p>'+
          '<p><strong>Experimental Probability:</strong> Based on observed results from an actual experiment.</p>'+
          '<div class="example-box"><strong>Theoretical</strong>P(heads) = 1/2 = 50%</div>'+
          '<div class="example-box"><strong>Experimental</strong>Flip a coin 40 times: 18 heads. P(heads) = 18/40 = 45%</div>'+
          '<p>As the number of trials increases, experimental probability approaches theoretical probability (Law of Large Numbers).</p>'
      },
      {
        title:'Lesson 6.2 — Sample Space and Tree Diagrams',
        body:'<p>The <strong>sample space</strong> is the set of all possible outcomes of an experiment.</p>'+
          '<p><strong>Tree diagrams</strong> show all possible outcomes of compound events.</p>'+
          '<p>Example — Flip a coin and roll a die:</p>'+
          '<div class="example-box"><strong>Sample Space</strong>H1, H2, H3, H4, H5, H6, T1, T2, T3, T4, T5, T6<br>Total outcomes = 12<br>P(H and even) = 3/12 = 1/4</div>'
      }
    ]
  }
],

math9:[
  {
    unit:'Unit 1: Powers & Exponent Laws',
    lessons:[
      {
        title:'Lesson 1.1 — Powers and Exponents',
        body:'<p>A <strong>power</strong> has a base and an exponent: b&#8319; means b multiplied by itself n times.</p>'+
          '<div class="formula-box">b&#8319; = b &#215; b &#215; b ... (n times)</div>'+
          '<div class="example-box"><strong>Examples</strong>2&#179; = 8 &nbsp;&nbsp; (&#8722;3)&#178; = 9 &nbsp;&nbsp; &#8722;3&#178; = &#8722;9 &nbsp;&nbsp; (2/3)&#178; = 4/9</div>'+
          '<p>Note: (&#8722;3)&#178; = (&#8722;3)(&#8722;3) = 9 but &#8722;3&#178; = &#8722;(3&#215;3) = &#8722;9</p>'
      },
      {
        title:'Lesson 1.2 — Exponent Laws',
        body:'<div class="formula-box">Product Rule: b&#7504; &#215; b&#7506; = b&#7504;&#8314;&#7506;</div>'+
          '<div class="formula-box">Quotient Rule: b&#7504; &#247; b&#7506; = b&#7504;&#8315;&#7506;</div>'+
          '<div class="formula-box">Power Rule: (b&#7504;)&#7506; = b&#7504;&#215;&#7506;</div>'+
          '<div class="formula-box">Zero Exponent: b&#8304; = 1 (b&#8800;0) &nbsp;&nbsp; Negative Exponent: b&#8315;&#8319; = 1/b&#8319;</div>'+
          '<div class="example-box"><strong>Examples</strong>x&#178; &#215; x&#179; = x&#8309; &nbsp;&nbsp; x&#8309; &#247; x&#178; = x&#179; &nbsp;&nbsp; (x&#179;)&#178; = x&#8310; &nbsp;&nbsp; 5&#8304; = 1 &nbsp;&nbsp; 2&#8315;&#178; = 1/4</div>'
      }
    ]
  },
  {
    unit:'Unit 2: Polynomials',
    lessons:[
      {
        title:'Lesson 2.1 — Introduction to Polynomials',
        body:'<p>A <strong>polynomial</strong> is an expression with variables and coefficients using only addition, subtraction, multiplication, and non-negative integer exponents.</p>'+
          '<p><strong>Types:</strong> Monomial (1 term): 3x&#178; &nbsp; Binomial (2 terms): x+5 &nbsp; Trinomial (3 terms): x&#178;+3x&#8722;2</p>'+
          '<p><strong>Degree:</strong> The highest exponent of the variable. Degree of 4x&#179;&#8722;2x+1 is 3.</p>'+
          '<p><strong>Like terms:</strong> Same variable and same exponent. 3x&#178; and &#8722;7x&#178; are like terms.</p>'
      },
      {
        title:'Lesson 2.2 — Adding and Subtracting Polynomials',
        body:'<p>Collect like terms. For subtraction, distribute the negative sign first.</p>'+
          '<div class="example-box"><strong>Addition</strong>(3x&#178; + 2x &#8722; 1) + (x&#178; &#8722; 5x + 4)<br>= 3x&#178; + x&#178; + 2x &#8722; 5x &#8722; 1 + 4<br>= 4x&#178; &#8722; 3x + 3</div>'+
          '<div class="example-box"><strong>Subtraction</strong>(5x&#178; + 3x) &#8722; (2x&#178; &#8722; x + 7)<br>= 5x&#178; + 3x &#8722; 2x&#178; + x &#8722; 7<br>= 3x&#178; + 4x &#8722; 7</div>'
      },
      {
        title:'Lesson 2.3 — Multiplying Polynomials (FOIL)',
        body:'<p>Multiply each term in the first polynomial by each term in the second. For two binomials, use FOIL: <strong>F</strong>irst, <strong>O</strong>uter, <strong>I</strong>nner, <strong>L</strong>ast.</p>'+
          '<div class="example-box"><strong>FOIL Example</strong>(x + 3)(x &#8722; 2)<br>F: x&#215;x = x&#178; &nbsp; O: x&#215;(&#8722;2) = &#8722;2x &nbsp; I: 3&#215;x = 3x &nbsp; L: 3&#215;(&#8722;2) = &#8722;6<br>= x&#178; &#8722; 2x + 3x &#8722; 6 = x&#178; + x &#8722; 6</div>'+
          '<div class="example-box"><strong>Special Products</strong>(a+b)&#178; = a&#178;+2ab+b&#178; &nbsp;&nbsp; (a&#8722;b)(a+b) = a&#178;&#8722;b&#178;</div>'
      },
      {
        title:'Lesson 2.4 — Factoring Polynomials',
        body:'<p><strong>GCF Factoring:</strong> Factor out the greatest common factor.</p>'+
          '<div class="example-box"><strong>Example</strong>6x&#178; + 9x = 3x(2x + 3)</div>'+
          '<p><strong>Trinomial Factoring (a=1):</strong> x&#178;+bx+c = (x+p)(x+q) where p&#215;q=c and p+q=b</p>'+
          '<div class="example-box"><strong>Example</strong>Factor x&#178; &#8722; 5x + 6<br>Need p&#215;q=6 and p+q=&#8722;5 → p=&#8722;2, q=&#8722;3<br>= (x&#8722;2)(x&#8722;3)</div>'+
          '<p><strong>Difference of Squares:</strong> a&#178;&#8722;b&#178; = (a+b)(a&#8722;b)</p>'+
          '<div class="example-box"><strong>Example</strong>x&#178; &#8722; 25 = (x+5)(x&#8722;5)</div>'
      }
    ]
  },
  {
    unit:'Unit 3: Linear Relations',
    lessons:[
      {
        title:'Lesson 3.1 — Slope',
        body:'<p><strong>Slope</strong> describes the steepness and direction of a line.</p>'+
          '<div class="formula-box">m = rise/run = (y&#8322;&#8722;y&#8321;)/(x&#8322;&#8722;x&#8321;)</div>'+
          coordinateGridSVG(
            [{x:0,y:1,label:'(0,1)',color:'#DC3545'},{x:3,y:7,label:'(3,7)',color:'#DC3545'}],
            [{m:2,b:1,color:'#1A6BB5'}]
          )+
          '<div class="example-box"><strong>Example</strong>Find slope between (1,3) and (4,9):<br>m = (9&#8722;3)/(4&#8722;1) = 6/3 = 2</div>'+
          '<p>Positive slope: rises left to right. Negative: falls. Zero: horizontal. Undefined: vertical.</p>'
      },
      {
        title:'Lesson 3.2 — Equation of a Line',
        body:'<p><strong>Slope-Intercept Form:</strong> y = mx + b where m = slope, b = y-intercept</p>'+
          '<p><strong>Point-Slope Form:</strong> y &#8722; y&#8321; = m(x &#8722; x&#8321;)</p>'+
          '<div class="example-box"><strong>Example 1</strong>Write the equation of a line with slope 3 and y-intercept &#8722;2:<br>y = 3x &#8722; 2</div>'+
          '<div class="example-box"><strong>Example 2</strong>Write the equation through (2,5) with slope &#8722;1:<br>y &#8722; 5 = &#8722;1(x &#8722; 2) → y = &#8722;x + 7</div>'
      },
      {
        title:'Lesson 3.3 — Solving Systems of Linear Equations',
        body:'<p>A <strong>system</strong> is two or more equations with the same variables. We look for the point of intersection.</p>'+
          '<p><strong>Method 1 — Substitution:</strong> Solve one equation for a variable, substitute into the other.</p>'+
          '<div class="example-box"><strong>Example</strong>y = 2x+1 and y = &#8722;x+7<br>2x+1 = &#8722;x+7 → 3x=6 → x=2<br>y = 2(2)+1 = 5 &nbsp; Solution: (2,5)</div>'+
          '<p><strong>Method 2 — Elimination:</strong> Add or subtract equations to cancel a variable.</p>'+
          '<div class="example-box"><strong>Example</strong>2x+y=8 and x&#8722;y=1<br>Add: 3x=9 → x=3 &nbsp; Back-substitute: y=8&#8722;6=2 &nbsp; Solution: (3,2)</div>'
      }
    ]
  },
  {
    unit:'Unit 4: Similarity & Scale Factors',
    lessons:[
      {
        title:'Lesson 4.1 — Similar Figures',
        body:'<p>Two figures are <strong>similar</strong> if they have the same shape but possibly different sizes: corresponding angles are equal and corresponding sides are proportional.</p>'+
          '<div class="formula-box">Side Ratio = k &nbsp;&nbsp; Area Ratio = k&#178; &nbsp;&nbsp; Volume Ratio = k&#179;</div>'+
          '<div class="example-box"><strong>Example</strong>Triangles ABC and DEF are similar with scale factor k=3.<br>If AB=4, then DE=12. If Area ABC = 6, then Area DEF = 6&#215;9 = 54.</div>'
      }
    ]
  },
  {
    unit:'Unit 5: Circle Geometry',
    lessons:[
      {
        title:'Lesson 5.1 — Circle Theorems',
        body:'<p>Key circle theorems for Grade 9:</p>'+
          '<ul><li>A <strong>central angle</strong> = the arc it intercepts (in degrees)</li>'+
          '<li>An <strong>inscribed angle</strong> = half the central angle on the same arc</li>'+
          '<li>All inscribed angles on the same arc are equal</li>'+
          '<li>An angle inscribed in a semicircle = 90°</li>'+
          '<li>A tangent meets a radius at 90° at the point of tangency</li></ul>'+
          circlePartsSVG()+
          '<div class="example-box"><strong>Example</strong>A central angle is 80°. What is the inscribed angle on the same arc?<br>Inscribed angle = 80°/2 = 40°</div>'
      }
    ]
  }
],

math10c:[
  {
    unit:'Unit 1: Measurement',
    lessons:[
      {
        title:'Lesson 1.1 — SI and Imperial Units',
        body:'<p><strong>SI (metric) units:</strong> km, m, cm, mm; kg, g; L, mL</p>'+
          '<p><strong>Imperial units:</strong> miles, yards, feet, inches; pounds, ounces; gallons, quarts, pints</p>'+
          '<div class="formula-box">1 inch = 2.54 cm &nbsp;&nbsp; 1 foot = 30.48 cm &nbsp;&nbsp; 1 mile = 1.609 km</div>'+
          '<div class="formula-box">1 kg = 2.205 lb &nbsp;&nbsp; 1 L = 0.264 gal</div>'+
          '<div class="example-box"><strong>Example</strong>Convert 5 feet 8 inches to centimetres.<br>5 ft = 5 &#215; 30.48 = 152.4 cm &nbsp; 8 in = 8 &#215; 2.54 = 20.32 cm<br>Total = 172.72 cm</div>'
      },
      {
        title:'Lesson 1.2 — Surface Area and Volume of Composite Figures',
        body:'<p>For composite figures, break them into simpler shapes. Add volumes; for surface area, be careful only to count exposed faces.</p>'+
          '<div class="example-box"><strong>Example</strong>A cylinder (r=3, h=5) sits on top of a rectangular prism (4&#215;4&#215;6).<br>Total Volume = &#960;(3&#178;)(5) + 4&#215;4&#215;6 = 45&#960; + 96 &#8776; 237.4 cm&#179;</div>'
      }
    ]
  },
  {
    unit:'Unit 2: Trigonometry of Right Triangles',
    lessons:[
      {
        title:'Lesson 2.1 — The Primary Trig Ratios (SOHCAHTOA)',
        body:'<p>For a right triangle with an acute angle &#952;:</p>'+
          '<div class="formula-box">sin &#952; = opposite/hypotenuse &nbsp;&nbsp; cos &#952; = adjacent/hypotenuse &nbsp;&nbsp; tan &#952; = opposite/adjacent</div>'+
          rightTriangleSVG('adj','opp','hyp')+
          '<p>Memory aid: <strong>SOH-CAH-TOA</strong></p>'+
          '<div class="example-box"><strong>Example — Find a side</strong>In a right triangle, &#952;=35°, hyp=20 cm. Find the opposite side.<br>sin(35°) = opp/20 → opp = 20 &#215; sin(35°) &#8776; 20 &#215; 0.574 = 11.5 cm</div>'
      },
      {
        title:'Lesson 2.2 — Finding Angles Using Inverse Trig',
        body:'<p>Use inverse trig functions to find an unknown angle when sides are known.</p>'+
          '<div class="formula-box">&#952; = sin&#8315;&#185;(opp/hyp) &nbsp;&nbsp; &#952; = cos&#8315;&#185;(adj/hyp) &nbsp;&nbsp; &#952; = tan&#8315;&#185;(opp/adj)</div>'+
          '<div class="example-box"><strong>Example</strong>In a right triangle: opposite = 5, adjacent = 12.<br>&#952; = tan&#8315;&#185;(5/12) = tan&#8315;&#185;(0.4167) &#8776; 22.6°</div>'
      },
      {
        title:'Lesson 2.3 — Applied Trigonometry',
        body:'<p><strong>Angle of elevation:</strong> angle measured upward from horizontal.<br><strong>Angle of depression:</strong> angle measured downward from horizontal.</p>'+
          '<div class="example-box"><strong>Example 1 — Angle of Elevation</strong>A person 50 m from a building looks up at the top at 40°. Find the building\'s height.<br>tan(40°) = h/50 → h = 50 &#215; 0.839 &#8776; 41.95 m</div>'+
          '<div class="example-box"><strong>Example 2 — Angle of Depression</strong>From the top of a 30 m cliff, the angle of depression to a boat is 25°.<br>tan(25°) = 30/d → d = 30/tan(25°) &#8776; 64.3 m</div>'
      }
    ]
  },
  {
    unit:'Unit 3: Algebra — Factoring',
    lessons:[
      {
        title:'Lesson 3.1 — Factoring Methods Review',
        body:'<p><strong>Step 1 — Always try GCF first.</strong></p>'+
          '<p><strong>Step 2 — Identify the form:</strong><br>ax&#178;+bx+c (trinomial) or a&#178;&#8722;b&#178; (difference of squares) or perfect square trinomial</p>'+
          '<div class="formula-box">a&#178;&#8722;b&#178; = (a+b)(a&#8722;b) &nbsp;&nbsp; a&#178;+2ab+b&#178; = (a+b)&#178; &nbsp;&nbsp; a&#178;&#8722;2ab+b&#178; = (a&#8722;b)&#178;</div>'+
          '<div class="example-box"><strong>Factoring Checklist Examples</strong>GCF: 6x&#178;&#8722;9x = 3x(2x&#8722;3)<br>Diff. of Squares: 4x&#178;&#8722;25 = (2x+5)(2x&#8722;5)<br>PST: x&#178;+6x+9 = (x+3)&#178;<br>Trinomial: 2x&#178;+7x+3 = (2x+1)(x+3)</div>'
      },
      {
        title:'Lesson 3.2 — Factoring ax&#178; + bx + c (a &#8800; 1)',
        body:'<p>Use the <strong>decomposition method</strong> (ac-method):<br>1. Find two numbers p, q such that p&#215;q = ac and p+q = b<br>2. Rewrite bx as px+qx<br>3. Factor by grouping</p>'+
          '<div class="example-box"><strong>Example</strong>Factor 2x&#178; + 7x + 6<br>ac = 12; need p+q=7: p=3, q=4<br>= 2x&#178; + 3x + 4x + 6 = x(2x+3) + 2(2x+3) = (x+2)(2x+3)</div>'
      }
    ]
  },
  {
    unit:'Unit 4: Relations & Functions',
    lessons:[
      {
        title:'Lesson 4.1 — Relations and Functions',
        body:'<p>A <strong>relation</strong> is any set of ordered pairs (x,y).<br>A <strong>function</strong> is a special relation where each x-value maps to exactly one y-value.</p>'+
          '<p><strong>Vertical Line Test:</strong> If any vertical line crosses the graph more than once, it is NOT a function.</p>'+
          coordinateGridSVG(
            [{x:-2,y:1,color:'#1A6BB5'},{x:0,y:3,color:'#1A6BB5'},{x:1,y:4,color:'#1A6BB5'},{x:2,y:5,color:'#1A6BB5'}],
            [{m:1,b:3,color:'#1A6BB5'}]
          )+
          '<div class="example-box"><strong>Function Notation</strong>f(x) = 3x &#8722; 1<br>f(2) = 3(2)&#8722;1 = 5 &nbsp; f(&#8722;1) = 3(&#8722;1)&#8722;1 = &#8722;4</div>'
      },
      {
        title:'Lesson 4.2 — Domain and Range',
        body:'<p><strong>Domain:</strong> set of all valid x-values (inputs).<br><strong>Range:</strong> set of all resulting y-values (outputs).</p>'+
          '<div class="example-box"><strong>f(x) = &#8730;(x&#8722;2)</strong>Domain: x&#8722;2 &#8805; 0 → x &#8805; 2 → D: [2, &#8734;)<br>Range: y &#8805; 0 → R: [0, &#8734;)</div>'+
          '<div class="example-box"><strong>f(x) = 1/(x&#8722;3)</strong>Domain: x &#8800; 3 → D: all reals except x=3<br>Range: y &#8800; 0 → R: all reals except 0</div>'
      },
      {
        title:'Lesson 4.3 — Arithmetic Sequences',
        body:'<p>An <strong>arithmetic sequence</strong> has a constant difference (d) between consecutive terms.</p>'+
          '<div class="formula-box">t&#8345; = a + (n&#8722;1)d &nbsp;&nbsp; where a = first term, d = common difference</div>'+
          '<div class="example-box"><strong>Example</strong>Sequence: 5, 8, 11, 14, ... &nbsp; a=5, d=3<br>t&#8321;&#8320; = 5 + (10&#8722;1)(3) = 5 + 27 = 32</div>'+
          '<p><strong>Sum of an arithmetic series:</strong></p>'+
          '<div class="formula-box">S&#8345; = n/2 &#215; (a + t&#8345;) &nbsp; or &nbsp; S&#8345; = n/2 &#215; [2a + (n&#8722;1)d]</div>'
      }
    ]
  },
  {
    unit:'Unit 5: Systems of Equations',
    lessons:[
      {
        title:'Lesson 5.1 — Solving Systems by Substitution',
        body:'<p><strong>Steps:</strong> 1. Solve one equation for one variable. 2. Substitute into the other equation. 3. Solve. 4. Back-substitute to find the other variable. 5. Check.</p>'+
          '<div class="example-box"><strong>Example</strong>System: x + 2y = 10 and 3x &#8722; y = 5<br>From eq1: x = 10 &#8722; 2y<br>Substitute: 3(10&#8722;2y) &#8722; y = 5 → 30&#8722;6y&#8722;y=5 → &#8722;7y=&#8722;25 → y=25/7<br>x = 10&#8722;2(25/7) = 20/7</div>'
      },
      {
        title:'Lesson 5.2 — Solving Systems by Elimination',
        body:'<p><strong>Steps:</strong> Multiply equations so one variable has opposite coefficients. Add to eliminate. Solve for remaining variable.</p>'+
          '<div class="example-box"><strong>Example</strong>2x + 3y = 12 and 4x &#8722; 3y = 6<br>Add: 6x = 18 → x = 3<br>Back-sub: 2(3)+3y=12 → 3y=6 → y=2</div>'
      }
    ]
  }
],

math201:[
  {
    unit:'Unit 1: Quadratic Functions',
    lessons:[
      {
        title:'Lesson 1.1 — Vertex Form: y = a(x&#8722;h)&#178; + k',
        body:'<p>The vertex form of a quadratic makes it easy to identify the vertex (h,k) and the direction of opening (a).</p>'+
          '<div class="formula-box">y = a(x &#8722; h)&#178; + k &nbsp;&nbsp; Vertex: (h, k) &nbsp;&nbsp; Axis of symmetry: x = h</div>'+
          '<p>If a &gt; 0: opens upward (minimum). If a &lt; 0: opens downward (maximum).</p>'+
          coordinateGridSVG([{x:2,y:3,label:'V(2,3)',color:'#DC3545'}],[],[{a:1,h:2,k:3,color:'#1A6BB5'}])+
          '<div class="example-box"><strong>Example</strong>y = 2(x&#8722;3)&#178; + 1<br>Vertex: (3,1) &nbsp; Axis: x=3 &nbsp; Opens upward (a=2&gt;0) &nbsp; Min value = 1</div>'
      },
      {
        title:'Lesson 1.2 — Completing the Square',
        body:'<p>Convert y = ax&#178;+bx+c to vertex form by completing the square.</p>'+
          '<div class="example-box"><strong>Example</strong>Convert y = x&#178; + 6x + 5 to vertex form.<br>= (x&#178; + 6x + 9) + 5 &#8722; 9<br>= (x+3)&#178; &#8722; 4<br>Vertex: (&#8722;3, &#8722;4)</div>'+
          '<p>When a &#8800; 1, factor a out first:</p>'+
          '<div class="example-box"><strong>Example</strong>y = 2x&#178; &#8722; 8x + 3<br>= 2(x&#178; &#8722; 4x) + 3<br>= 2(x&#178; &#8722; 4x + 4 &#8722; 4) + 3<br>= 2(x&#8722;2)&#178; &#8722; 8 + 3 = 2(x&#8722;2)&#178; &#8722; 5<br>Vertex: (2, &#8722;5)</div>'
      },
      {
        title:'Lesson 1.3 — Standard Form and the Quadratic Formula',
        body:'<p>For y = ax&#178;+bx+c, the x-intercepts (roots) are found using the quadratic formula.</p>'+
          '<div class="formula-box">x = (&#8722;b &#177; &#8730;(b&#178;&#8722;4ac)) / (2a)</div>'+
          '<p>The <strong>discriminant</strong> D = b&#178;&#8722;4ac tells us the number of real roots:<br>D &gt; 0: two real roots &nbsp; D = 0: one root &nbsp; D &lt; 0: no real roots</div>'+
          '<div class="example-box"><strong>Example</strong>Solve 2x&#178; &#8722; 5x &#8722; 3 = 0<br>x = (5 &#177; &#8730;(25+24)) / 4 = (5 &#177; 7) / 4<br>x = 3 or x = &#8722;0.5</div>'
      }
    ]
  },
  {
    unit:'Unit 2: Radicals',
    lessons:[
      {
        title:'Lesson 2.1 — Simplifying Radical Expressions',
        body:'<p>Simplify &#8730;n by factoring out perfect squares.</p>'+
          '<div class="formula-box">&#8730;(ab) = &#8730;a &#215; &#8730;b &nbsp;&nbsp;&nbsp; &#8730;(a/b) = &#8730;a / &#8730;b</div>'+
          '<div class="example-box"><strong>Examples</strong>&#8730;72 = &#8730;(36&#215;2) = 6&#8730;2 &nbsp;&nbsp; &#8730;50 = 5&#8730;2 &nbsp;&nbsp; &#8730;48 = 4&#8730;3</div>'+
          '<p><strong>Adding/Subtracting Radicals (like radicals only):</strong></p>'+
          '<div class="example-box"><strong>Example</strong>3&#8730;5 + 2&#8730;5 = 5&#8730;5 &nbsp;&nbsp; &#8730;12 + &#8730;27 = 2&#8730;3 + 3&#8730;3 = 5&#8730;3</div>'
      },
      {
        title:'Lesson 2.2 — Multiplying and Dividing Radicals',
        body:'<div class="example-box"><strong>Multiplying</strong>(2&#8730;3)(5&#8730;6) = 10&#8730;18 = 10&#215;3&#8730;2 = 30&#8730;2<br>(&#8730;2+3)(&#8730;2&#8722;1) = 2&#8722;&#8730;2+3&#8730;2&#8722;3 = &#8722;1+2&#8730;2</div>'+
          '<p><strong>Rationalizing the denominator:</strong> Multiply numerator and denominator by the radical in the denominator.</p>'+
          '<div class="example-box"><strong>Example</strong>5/&#8730;3 = (5/&#8730;3)&#215;(&#8730;3/&#8730;3) = 5&#8730;3/3</div>'+
          '<div class="example-box"><strong>Conjugate Example</strong>3/(&#8730;5+&#8730;2) = 3(&#8730;5&#8722;&#8730;2)/((&#8730;5)&#178;&#8722;(&#8730;2)&#178;) = 3(&#8730;5&#8722;&#8730;2)/3 = &#8730;5&#8722;&#8730;2</div>'
      },
      {
        title:'Lesson 2.3 — Solving Radical Equations',
        body:'<p>Isolate the radical, then square both sides. Always check for extraneous roots!</p>'+
          '<div class="example-box"><strong>Example</strong>Solve &#8730;(2x+3) = x&#8722;1<br>Square both sides: 2x+3 = (x&#8722;1)&#178; = x&#178;&#8722;2x+1<br>Rearrange: x&#178;&#8722;4x&#8722;2 = 0... wait, let\'s try:<br>2x+3 = x&#178;&#8722;2x+1 → x&#178;&#8722;4x&#8722;2=0 → x=(4&#177;&#8730;24)/2 = 2&#177;&#8730;6<br>Check both answers! x=2+&#8730;6 &#8776; 4.45 works. x=2&#8722;&#8730;6 &#8776; &#8722;0.45 is extraneous.</div>'
      }
    ]
  },
  {
    unit:'Unit 3: Rational Expressions',
    lessons:[
      {
        title:'Lesson 3.1 — Simplifying Rational Expressions',
        body:'<p>A rational expression is a fraction with polynomials. Always state non-permissible values (denominators &#8800; 0).</p>'+
          '<div class="example-box"><strong>Example</strong>Simplify (x&#178;&#8722;9)/(x&#178;&#8722;x&#8722;6)<br>= (x+3)(x&#8722;3) / (x&#8722;3)(x+2) = (x+3)/(x+2), x &#8800; 3, x &#8800; &#8722;2</div>'
      },
      {
        title:'Lesson 3.2 — Multiplying and Dividing Rational Expressions',
        body:'<p>Multiply: Multiply numerators and denominators (factor first to cancel).<br>Divide: Multiply by the reciprocal of the divisor.</p>'+
          '<div class="example-box"><strong>Example</strong>(x&#178;&#8722;4)/(x+3) &#215; (x+3)/(x+2)<br>= (x+2)(x&#8722;2)/(x+3) &#215; (x+3)/(x+2)<br>= x&#8722;2</div>'
      },
      {
        title:'Lesson 3.3 — Adding and Subtracting Rational Expressions',
        body:'<p>Find LCD, convert fractions, then add/subtract numerators.</p>'+
          '<div class="example-box"><strong>Example</strong>3/x + 2/(x+1)<br>LCD = x(x+1)<br>= 3(x+1)/[x(x+1)] + 2x/[x(x+1)]<br>= (3x+3+2x)/[x(x+1)] = (5x+3)/[x(x+1)]</div>'
      }
    ]
  },
  {
    unit:'Unit 4: Sequences & Series',
    lessons:[
      {
        title:'Lesson 4.1 — Arithmetic Sequences and Series',
        body:'<div class="formula-box">t&#8345; = a+(n&#8722;1)d &nbsp;&nbsp; S&#8345; = n/2(2a+(n&#8722;1)d) = n/2(t&#8321;+t&#8345;)</div>'+
          '<div class="example-box"><strong>Example</strong>Find S&#8321;&#8320; of 3+8+13+... &nbsp; a=3, d=5<br>S&#8321;&#8320; = 10/2&#215;[2(3)+9(5)] = 5&#215;[6+45] = 5&#215;51 = 255</div>'
      },
      {
        title:'Lesson 4.2 — Geometric Sequences and Series',
        body:'<div class="formula-box">t&#8345; = ar&#8319;&#8315;&#185; &nbsp;&nbsp; S&#8345; = a(r&#8319;&#8722;1)/(r&#8722;1) for r&#8800;1</div>'+
          '<div class="example-box"><strong>Example</strong>Sequence: 2, 6, 18, 54, ... &nbsp; a=2, r=3<br>t&#8327; = 2&#215;3&#8310; = 2&#215;729 = 1458<br>S&#8325; = 2(3&#8309;&#8722;1)/(3&#8722;1) = 2&#215;242/2 = 242</div>'+
          '<p>Infinite geometric series (|r|&lt;1): S&#8734; = a/(1&#8722;r)</p>'+
          '<div class="example-box"><strong>Example</strong>S&#8734; of 8+4+2+1+... &nbsp; a=8, r=1/2<br>S&#8734; = 8/(1&#8722;1/2) = 8/(1/2) = 16</div>'
      }
    ]
  }
],

math301:[
  {
    unit:'Unit 1: Trigonometry',
    lessons:[
      {
        title:'Lesson 1.1 — Radians and Degrees',
        body:'<div class="formula-box">&#952;(radians) = &#952;(degrees) &#215; &#960;/180 &nbsp;&nbsp;&nbsp; &#952;(degrees) = &#952;(radians) &#215; 180/&#960;</div>'+
          '<div class="example-box"><strong>Common Angles</strong>0° = 0 &nbsp; 30° = &#960;/6 &nbsp; 45° = &#960;/4 &nbsp; 60° = &#960;/3 &nbsp; 90° = &#960;/2 &nbsp; 180° = &#960; &nbsp; 270° = 3&#960;/2 &nbsp; 360° = 2&#960;</div>'+
          '<p><strong>Arc length:</strong> a = r&#952; (&#952; in radians)<br><strong>Sector area:</strong> A = &#189;r&#178;&#952;</p>'
      },
      {
        title:'Lesson 1.2 — Unit Circle and Trig Values',
        body:'<p>The unit circle has radius 1 centered at the origin. For any angle &#952;: cos&#952; = x-coordinate, sin&#952; = y-coordinate.</p>'+
          '<div class="formula-box">sin&#178;&#952; + cos&#178;&#952; = 1 (Pythagorean Identity)</div>'+
          '<div class="example-box"><strong>Special Triangle Values</strong>sin(30°)=1/2, cos(30°)=&#8730;3/2, tan(30°)=1/&#8730;3<br>sin(45°)=&#8730;2/2, cos(45°)=&#8730;2/2, tan(45°)=1<br>sin(60°)=&#8730;3/2, cos(60°)=1/2, tan(60°)=&#8730;3</div>'+
          '<p><strong>CAST Rule</strong> (which trig ratios are positive by quadrant):<br>Q1: All &nbsp; Q2: Sin &nbsp; Q3: Tan &nbsp; Q4: Cos</p>'
      },
      {
        title:'Lesson 1.3 — Graphing Trigonometric Functions',
        body:'<p>For y = a sin(b(x&#8722;c)) + d:<br><strong>Amplitude</strong> = |a| &nbsp; <strong>Period</strong> = 2&#960;/|b| &nbsp; <strong>Phase shift</strong> = c &nbsp; <strong>Vertical shift</strong> = d</p>'+
          '<div class="example-box"><strong>y = 3sin(2x) + 1</strong>Amplitude = 3 &nbsp; Period = 2&#960;/2 = &#960; &nbsp; Vertical shift = 1 up &nbsp; Range: [&#8722;2, 4]</div>'+
          '<p><strong>Key properties of y=sinx:</strong> Period=2&#960;, Amplitude=1, passes through (0,0), (&#960;/2,1), (&#960;,0), (3&#960;/2,&#8722;1), (2&#960;,0)</p>'+
          '<p><strong>Key properties of y=cosx:</strong> Period=2&#960;, Amplitude=1, passes through (0,1), (&#960;/2,0), (&#960;,&#8722;1), (3&#960;/2,0), (2&#960;,1)</p>'
      },
      {
        title:'Lesson 1.4 — Trigonometric Identities',
        body:'<div class="formula-box">Pythagorean: sin&#178;x+cos&#178;x=1 &nbsp;&nbsp; 1+tan&#178;x=sec&#178;x &nbsp;&nbsp; 1+cot&#178;x=csc&#178;x</div>'+
          '<div class="formula-box">Reciprocal: csc x=1/sinx &nbsp;&nbsp; sec x=1/cosx &nbsp;&nbsp; cot x=1/tanx</div>'+
          '<div class="formula-box">Quotient: tanx=sinx/cosx &nbsp;&nbsp; cotx=cosx/sinx</div>'+
          '<p><strong>Sum/Difference:</strong></p>'+
          '<div class="formula-box">sin(A&#177;B)=sinAcosB&#177;cosAsinB &nbsp;&nbsp; cos(A&#177;B)=cosAcosB&#8723;sinAsinB</div>'+
          '<div class="example-box"><strong>Proving an Identity</strong>Prove: sin&#178;x/cosx = secx&#8722;cosx<br>LHS = sin&#178;x/cosx = (1&#8722;cos&#178;x)/cosx = 1/cosx&#8722;cosx = secx&#8722;cosx = RHS ✓</div>'
      }
    ]
  },
  {
    unit:'Unit 2: Exponential and Logarithmic Functions',
    lessons:[
      {
        title:'Lesson 2.1 — Exponential Functions',
        body:'<p>Form: y = ab&#215; where b &gt; 0, b &#8800; 1.<br>b &gt; 1: exponential growth &nbsp; 0 &lt; b &lt; 1: exponential decay</p>'+
          coordinateGridSVG([],[],[{a:0.08,h:-3,k:-3,color:'#1A6BB5'}])+
          '<div class="example-box"><strong>Example</strong>y = 2&#215; at x=0: y=1; x=1: y=2; x=2: y=4; x=3: y=8; x=&#8722;1: y=0.5</div>'+
          '<p><strong>Domain:</strong> all reals &nbsp; <strong>Range:</strong> y &gt; 0 &nbsp; <strong>Asymptote:</strong> y = 0</p>'
      },
      {
        title:'Lesson 2.2 — Logarithmic Functions',
        body:'<div class="formula-box">y = log&#8347;(x) ↔ b&#690; = x &nbsp;&nbsp; Inverse of y=b&#215;</div>'+
          '<div class="formula-box">log&#8347;(mn) = log&#8347;m+log&#8347;n &nbsp;&nbsp; log&#8347;(m/n) = log&#8347;m&#8722;log&#8347;n &nbsp;&nbsp; log&#8347;(m&#8319;) = n&#8901;log&#8347;m</div>'+
          '<div class="example-box"><strong>Evaluate</strong>log&#8322;(32) = 5 since 2&#8309;=32<br>log(1000) = 3 since 10&#179;=1000<br>ln(e&#178;) = 2</div>'+
          '<p>Change of base: log&#8347;(x) = log(x)/log(b)</p>'
      },
      {
        title:'Lesson 2.3 — Solving Exponential and Log Equations',
        body:'<div class="example-box"><strong>Exponential Equation</strong>Solve 3&#215;&#8315;&#185; = 27<br>3&#215;&#8315;&#185; = 3&#179; → x&#8722;1=3 → x=4</div>'+
          '<div class="example-box"><strong>Log Equation</strong>Solve log(x)+log(x&#8722;3)=1<br>log(x(x&#8722;3))=1 → x(x&#8722;3)=10 → x&#178;&#8722;3x&#8722;10=0<br>(x&#8722;5)(x+2)=0 → x=5 (reject x=&#8722;2, log undefined)</div>'
      }
    ]
  },
  {
    unit:'Unit 3: Permutations & Combinations',
    lessons:[
      {
        title:'Lesson 3.1 — Fundamental Counting Principle',
        body:'<p>If one event can occur in m ways and a second in n ways, together they can occur in m &#215; n ways.</p>'+
          '<div class="example-box"><strong>Example</strong>A menu has 4 appetizers, 6 mains, and 3 desserts. How many different meals?<br>4 &#215; 6 &#215; 3 = 72 different meals</div>'
      },
      {
        title:'Lesson 3.2 — Permutations',
        body:'<p><strong>Permutations:</strong> ordered arrangements of objects.</p>'+
          '<div class="formula-box">&#8345;P&#7523; = n!/(n&#8722;r)! &nbsp;&nbsp;&nbsp; n! = n&#215;(n&#8722;1)&#215;...&#215;2&#215;1</div>'+
          '<div class="example-box"><strong>Example</strong>How many ways to arrange 3 books from 7?<br>&#8327;P&#8323; = 7!/(7&#8722;3)! = 7!/4! = 7&#215;6&#215;5 = 210</div>'+
          '<p>Permutations with repetition: n!/(n&#8321;!n&#8322;!...n&#7503;!)</p>'+
          '<div class="example-box"><strong>Example</strong>Arrange letters in MISSISSIPPI:<br>11!/(4!4!2!) = 34650</div>'
      },
      {
        title:'Lesson 3.3 — Combinations and Binomial Theorem',
        body:'<div class="formula-box">&#8345;C&#7523; = n!/[r!(n&#8722;r)!] = C(n,r)</div>'+
          '<div class="example-box"><strong>Example</strong>Choose 3 from 10 students for a committee:<br>&#8321;&#8320;C&#8323; = 10!/(3!7!) = 720/6 = 120</div>'+
          '<p><strong>Binomial Theorem:</strong></p>'+
          '<div class="formula-box">(a+b)&#8319; = &#8721;C(n,k)&#8901;a&#8319;&#8315;&#7503;&#8901;b&#7503; for k=0 to n</div>'+
          '<div class="example-box"><strong>Find the 4th term of (x+2)&#8309;</strong>T&#8324; = C(5,3)&#8901;x&#178;&#8901;2&#179; = 10&#215;x&#178;&#215;8 = 80x&#178;</div>'
      }
    ]
  }
]

}; // end LESSONS

// ============================================================
// GRADE DATA
// ============================================================
var GRADES = {
  math7:  { id:'math7',  label:'Math 7',    tag:'Grade 7',  tagClass:'tag-jr',  cardClass:'',    desc:'Fractions, ratios, integers, geometry basics', fullDesc:'Alberta Mathematics Grade 7 — Number sense, spatial reasoning, patterns, and data.',
    topics:['Integers and operations','Fractions and mixed numbers','Ratios and proportional thinking','Percentages','Variables and expressions','Linear equations','Angles and triangles','Area and perimeter','Transformations','Data and probability'],
    outcomes:['Understand integers including operations','Apply fractions, decimals, and percents','Use variables and equations to model relationships','Apply properties of 2D shapes','Collect and interpret data using graphs'] },
  math8:  { id:'math8',  label:'Math 8',    tag:'Grade 8',  tagClass:'tag-jr',  cardClass:'',    desc:'Pythagorean theorem, percents, probability', fullDesc:'Alberta Mathematics Grade 8 — Building on number concepts, geometry, and data analysis.',
    topics:['Square roots and perfect squares','Pythagorean theorem','Rational numbers','Percents and applications','Multi-step linear equations','Graphing linear equations','Surface area of 3D objects','Volume','Probability','Histograms and scatter plots'],
    outcomes:['Apply the Pythagorean theorem','Operate with rational numbers','Solve multi-step linear equations','Determine surface area and volume','Compare experimental and theoretical probability'] },
  math9:  { id:'math9',  label:'Math 9',    tag:'Grade 9',  tagClass:'tag-jr',  cardClass:'',    desc:'Powers, polynomials, linear relations', fullDesc:'Alberta Mathematics Grade 9 — Algebraic thinking, linear relations, and statistics.',
    topics:['Powers and exponent laws','Adding/subtracting polynomials','Multiplying polynomials','Factoring polynomials','Slope and rate of change','Equation of a line','Systems of linear equations','Similarity and scale','Circle geometry','Statistics'],
    outcomes:['Apply exponent laws','Factor and expand polynomials','Interpret and graph linear relations','Apply similarity','Solve systems of linear equations'] },
  math10c:{ id:'math10c',label:'Math 10C',  tag:'Grade 10', tagClass:'tag-sr',  cardClass:'hs',  desc:'Combined: measurement, algebra, functions', fullDesc:'Mathematics 10 Combined — Gateway to the -1 and -2 pathways.',
    topics:['SI and imperial measurement','Right triangle trigonometry','SOHCAHTOA and applications','Factoring polynomials','Systems of equations','Relations and functions','Domain and range','Arithmetic sequences','Graphing linear functions','Slope and intercepts'],
    outcomes:['Convert between measurement systems','Solve problems using trig','Factor polynomials','Solve systems of equations','Use function notation; identify domain and range'] },
  math103:{ id:'math103',label:'Math 10-3', tag:'Grade 10', tagClass:'tag-sr',  cardClass:'hs',  desc:'-3 pathway: measurement, geometry, finances', fullDesc:'Mathematics 10-3 — Practical pathway emphasizing measurement and financial math.',
    topics:['Metric and imperial measurement','Composite area and perimeter','Volume and capacity','Scale diagrams','Surface area applications','Basic trigonometry','Personal finance introduction','Graphical reasoning'],
    outcomes:['Solve measurement problems','Apply geometric concepts','Interpret scale diagrams','Develop financial literacy','Use graphs to analyze relationships'] },
  math201:{ id:'math201',label:'Math 20-1', tag:'Grade 11', tagClass:'tag-sr',  cardClass:'hs',  desc:'-1 pathway: quadratics, radicals, sequences', fullDesc:'Mathematics 20-1 — Advanced algebra, quadratic functions, and sequences.',
    topics:['Vertex form of quadratics','Completing the square','Quadratic formula and discriminant','Simplifying radicals','Radical equations','Simplifying rational expressions','Operations with rational expressions','Arithmetic sequences','Geometric sequences','Geometric series'],
    outcomes:['Analyze quadratic functions in multiple forms','Operate on radical expressions','Solve radical and rational equations','Identify arithmetic and geometric sequences','Calculate series sums'] },
  math202:{ id:'math202',label:'Math 20-2', tag:'Grade 11', tagClass:'tag-sr',  cardClass:'hs',  desc:'-2 pathway: geometry, stats, quadratics applied', fullDesc:'Mathematics 20-2 — Applied reasoning, geometry, and statistics.',
    topics:['Inductive and deductive reasoning','Angle relationships in polygons','Triangle congruence','Circle properties','Proportional reasoning','Normal distribution','Quadratic functions applied','Sequences and series','Financial applications','Probability and odds'],
    outcomes:['Apply reasoning to geometric proofs','Analyze circles and polygons','Interpret normal distribution','Apply quadratics in context','Calculate probabilities'] },
  math203:{ id:'math203',label:'Math 20-3', tag:'Grade 11', tagClass:'tag-sr',  cardClass:'hs',  desc:'-3 pathway: finance, measurement, geometry', fullDesc:'Mathematics 20-3 — Practical and workplace mathematics.',
    topics:['Compound interest','Budgeting','Area surface area volume','Applied trigonometry','3D scale models','Statistics and graphs','Linear functions and modeling'],
    outcomes:['Apply financial formulas','Budget personal finances','Solve 3D measurement problems','Use trigonometry in workplace','Create and interpret statistical graphs'] },
  math301:{ id:'math301',label:'Math 30-1', tag:'Grade 12', tagClass:'tag-adv', cardClass:'adv', desc:'-1 pathway: trig, functions, permutations', fullDesc:'Mathematics 30-1 — Advanced functions, trigonometry, and pre-calculus.',
    topics:['Radian measure','Unit circle and special angles','Graphing trig functions','Trig identities','Exponential functions','Logarithmic functions','Log/exp equations','Polynomial functions','Rational functions','Permutations and combinations','Binomial theorem'],
    outcomes:['Analyze and graph trig functions','Apply trig identities','Solve exponential and logarithmic equations','Analyze polynomial and rational functions','Apply counting principles'] },
  math302:{ id:'math302',label:'Math 30-2', tag:'Grade 12', tagClass:'tag-adv', cardClass:'adv', desc:'-2 pathway: logic, statistics, probability', fullDesc:'Mathematics 30-2 — Logic, probability, and applied mathematics.',
    topics:['Set theory and Venn diagrams','Conditional probability','Binomial distribution','Permutations and combinations','Logical reasoning','Polynomial functions','Exponential functions','Financial math: annuities','Coordinate geometry','Quadratic functions'],
    outcomes:['Apply set theory and logic','Calculate conditional probabilities','Model with binomial distribution','Analyze polynomial/exponential functions','Apply financial math'] },
  math303:{ id:'math303',label:'Math 30-3', tag:'Grade 12', tagClass:'tag-adv', cardClass:'adv', desc:'-3 pathway: practical and trades math', fullDesc:'Mathematics 30-3 — Practical and trades mathematics.',
    topics:['Slope and rate of change','Linear and quadratic functions','Applied trigonometry','Unit analysis','Statistics and decision making','Financial planning and loans','3D measurement and design'],
    outcomes:['Apply linear and quadratic models','Solve trades measurement problems','Make data-informed decisions','Apply financial formulas','Use trigonometry in applied settings'] }
};

// ============================================================
// PRACTICE QUESTIONS (large bank)
// ============================================================
var QUESTIONS = {
'Math 7':{
  easy:[
    'What is -5 + 8?','Calculate 3/4 + 1/2.','What is 20% of 60?','Simplify: 3x + 2x.',
    'Area of a rectangle with length 8 cm and width 5 cm?','What is -3 x -4?','Order from least to greatest: -2, 5, -7, 0, 3.',
    'What is the perimeter of a square with side 6 cm?','Write 0.45 as a fraction in simplest form.','What is the complement of 35 degrees?'
  ],
  medium:[
    'Solve for x: 3x - 7 = 14.','A jacket costs $80, 25% off. What is the sale price?','Write 18:24 in simplest form.',
    'Find the perimeter of a triangle with sides 7, 9, and 11 cm.','Car travels 150 km in 3 hours. Average speed?',
    'Find the area of a triangle with base 10 cm and height 6 cm.','Evaluate: 4n - 7 when n = 5.','Solve: 2x + 5 = 17.',
    'What is 15% of 120?','A sequence is 4, 7, 10, 13, ... What is the 10th term?'
  ],
  hard:[
    'Store marks up 30% then discounts 20%. What is the overall percent change?','Solve: (2x+3)/5 = 4 - x/2.',
    'A rectangular prism has l=6, w=4, h=3. Find volume and surface area.','Angles A and B are supplementary. A is 40 more than B. Find both.',
    'Sequence: 2, 5, 8, 11, ... What is the 20th term?','If P(A) = 0.3 and events A and B are complementary, find P(B).',
    'A rectangle has perimeter 36 and length is twice the width. Find the dimensions.',
    'Find the mean, median, and mode of: 4, 7, 7, 9, 13, 7, 2.',
    'A store sells 3 shirts for $45. How much would 8 shirts cost?',
    'Find the missing angle in a triangle where two angles are 62 and 47 degrees.'
  ]
},
'Math 8':{
  easy:[
    'What is the square root of 49?','Hypotenuse of a right triangle with legs 3 and 4?','What is 15% of 80?',
    'What is 2/3 x 3/4?','Convert 0.75 to simplest fraction.','What is (-3) + (-5)?',
    'Solve: 4x = 32.','Find the surface area of a cube with side 3 cm.','Convert -7/2 to a mixed number.','What is 0.6 + (-1.2)?'
  ],
  medium:[
    'Right triangle with legs 5 and 12. Find hypotenuse.','Solve: 4x + 6 = 22.','Surface area of cube with side 5 cm.',
    'Probability of rolling an even number on a standard die?','Write 3.6 as a mixed number.',
    'A shirt costs $45. With 12% tax, what is the total price?','Find volume of a rectangular prism l=6, w=4, h=3.',
    'Solve: 3(x - 2) = 15.','A store buys an item for $30 and marks it up 40%. What is the selling price?','Solve: -2x + 7 = 1.'
  ],
  hard:[
    'A ladder 10 m long, base 6 m from wall. How high does it reach?','Solve and graph: 3x - 2 < 10.',
    'Volume of cylinder r=4, h=9. Use pi=3.14.','P(A)=0.4, P(B)=0.3, independent. Find P(A and B).',
    'Rectangle: area 48, perimeter 28. Find dimensions.','Solve: 2(3x - 1) - 4x = 3x + 5.',
    'A rectangle has length (2x+3) and width (x-1). If perimeter=30, find x.',
    'Find the diagonal of a rectangle 7 cm by 24 cm.','Percent decrease from 80 to 60?',
    'A school has 400 students. 45% are boys. 30% of boys play sports. How many boys play sports?'
  ]
},
'Math 9':{
  easy:[
    'Simplify: x^2 times x^3.','Add: (3x+4) + (2x-1).','Slope of y = 3x + 7?','Evaluate: 2^3.',
    'Simplify: (2x^2)^3.','Factor: x^2 - 9.','What is 5^0?','Evaluate: 3^(-2).',
    'Expand: 2(x + 5).','What is the y-intercept of y = -2x + 8?'
  ],
  medium:[
    'Factor: x^2 - 5x + 6.','Slope between (2,3) and (6,11)?','Expand: (x+3)(x-2).','Solve: 2x+5=3x-1.',
    'Two similar triangles ratio 2:3. Small area = 8 cm^2. Find large area.','Find the equation of a line with slope 4 and y-intercept -3.',
    'Simplify: (3x^2)(2x^3).','Factor: 2x^2 + 6x.','Solve the system: x+y=10 and x-y=4.',
    'Simplify using exponent laws: (x^3 y^2) / (x y^4).'
  ],
  hard:[
    'Factor fully: 2x^3 - 8x.','Equation of line through (1,4) and (3,10).','Simplify: (3x^2 y)(2xy^3) / (6x^2 y^2).',
    'Rectangle length is 3 more than twice width. Perimeter=48. Find dimensions.','Solve: 2x+y=8 and x-y=1.',
    'A circle has circumference 31.4 cm. Find the radius and area. (pi=3.14)',
    'Write the equation of a line perpendicular to y=3x-2 passing through (3,1).',
    'Prove that the square of an odd integer is always odd.',
    'Find the 15th term of the arithmetic sequence -3, 1, 5, 9, ...',
    'Expand and simplify: (2x-3)^2 - (x+4)(x-1).'
  ]
},
'Math 10C':{
  easy:[
    'Convert 5 feet to inches.','sin(30 degrees)?','Slope of 2x + 3y = 6?','Factor: x^2 - 9.','f(3) if f(x)=2x-1?',
    'Convert 100 cm to metres.','What is cos(60 degrees)?','Evaluate: 4^(1/2).','Identify: is y=x^2 a function? Why?','What is the degree of 3x^3 - 2x + 7?'
  ],
  medium:[
    'Right triangle with angle 40 and adjacent 10. Find opposite.','Solve system: y=2x+1 and y=-x+7.','Factor: 2x^2+5x+3.',
    'Domain and range of f(x)=sqrt(x-2).','Convert 3 metres to feet (1m=3.28ft).',
    'Find the 12th term of arithmetic sequence 5, 8, 11, 14, ...','Simplify: sqrt(72).',
    'Find slope and y-intercept of 3x - 4y = 12.','Solve system by elimination: 2x+3y=12 and 4x-3y=6.',
    'Factor: x^2 - 4x - 21.'
  ],
  hard:[
    '25 m ladder at 65 degrees. How high does it reach?','Solve and check: 2x/(x-1) = 3 + 2/(x-1).',
    'Factor completely: 3x^3 - 12x.','Is y=x^2 a function? State domain and range.',
    'Boat: 15 km east then 8 km north. Find direct distance and angle from east.',
    'Two cars leave at same time. One goes north at 60 km/h, other east at 80 km/h. How far apart after 2 hours?',
    'Write the equation of a line through (-2,5) perpendicular to y = (1/3)x + 4.',
    'A ladder reaches 8 m up a wall. The base is 6 m from the wall. What angle does it make with the ground?',
    'Solve the system: 3x - 2y = 11 and x + 3y = 0.',
    'A rectangle has perimeter 54 m and area 180 m^2. Find the dimensions.'
  ]
},
'Math 20-1':{
  easy:[
    'Simplify: sqrt(50).','Factor: x^2 - 4.','Vertex of y=(x-2)^2+3?','Simplify: sqrt(12)+sqrt(27).','Evaluate: 4^(3/2).',
    'Find the axis of symmetry of y = (x+4)^2 - 1.','Simplify: sqrt(18).','Expand: (x+5)^2.',
    'What is the vertex of y = -(x-1)^2 + 6?','Find the discriminant of x^2 - 4x + 4.'
  ],
  medium:[
    'Solve using quadratic formula: 2x^2-5x-3=0.','Write y=x^2+6x+5 in vertex form.','Simplify: (2sqrt3)(3sqrt6).',
    'Find 8th term of 3, 7, 11, ...','Sum of first 10 terms of 2+5+8+...',
    'Simplify: (x^2-9)/(x^2-x-6).','Find the roots of y = x^2 - 6x + 8.','Solve: sqrt(x+5) = 3.',
    'Find the common ratio of the geometric sequence: 3, 6, 12, 24, ...',
    'Simplify: (2sqrt5)^2 - sqrt(80).'
  ],
  hard:[
    'Vertex and axis of symmetry of y=-2x^2+8x-3.','Solve: sqrt(2x+3)=x-1. Check for extraneous roots.',
    'Simplify: (x^2-9)/(x^2-x-6) / (x+3)/(2x+4).','Geometric sequence: t2=6, t5=48. Find ratio and first term.',
    'Solve system: y=x^2 and y=x+6.','Find the sum of the first 8 terms of the geometric series: 2 + 6 + 18 + ...',
    'Determine the x-intercepts, vertex, and direction of opening for y = -x^2 + 4x + 5.',
    'Prove that the sum of two consecutive odd numbers is divisible by 4.',
    'Solve: x/(x-2) + 3/(x+1) = 2.',
    'The sum of an arithmetic series is 375, the first term is 5, and the last term is 45. Find the number of terms.'
  ]
},
'Math 30-1':{
  easy:[
    'Convert 180 degrees to radians.','Period of y=sin(x)?','log base 2 of 8?','Evaluate 8P3.','Simplify: log(100).',
    'Convert pi/3 to degrees.','Evaluate: cos(0).','What is log base 10 of 1?','Evaluate: 5C2.','Simplify: ln(e^3).'
  ],
  medium:[
    'Pythagorean identity: sin^2x + cos^2x = ?','Solve: 2sin(x)=1 for x in [0,360].','Evaluate 10C3.',
    'Solve: 2^(x+1)=16.','Domain and range of y=log(x+2).',
    'Expand (x+3)^4 using the Binomial Theorem (first 3 terms only).',
    'Solve: log3(x) + log3(x-2) = 3.','Find the period and amplitude of y = 4sin(2x).',
    'How many ways can 8 people sit in a row?','Solve: e^(2x) = 7.'
  ],
  hard:[
    'Prove: 1 + tan^2(x) = sec^2(x).','Solve: 2cos^2(x) - cos(x) - 1 = 0 for x in [0, 2pi].',
    'Find the 4th term in expansion of (x+2)^5.','Solve: log(x) + log(x-3) = 1.',
    'How many 5-card hands from 52-card deck?',
    'Prove: (sinx + cosx)^2 = 1 + 2sinxcosx.',
    'Solve: 3^(2x) - 4(3^x) + 3 = 0.',
    'A committee of 4 is chosen from 6 men and 5 women. How many ways if exactly 2 women are on the committee?',
    'Find all solutions to sin(2x) = cos(x) for x in [0, 2pi].',
    'The 3rd term of a geometric sequence is 12 and the 6th term is 96. Find the first term and common ratio.'
  ]
}
};

// ============================================================
// HINTS
// ============================================================
var HINTS = {
'Math 7':{
  easy:['Move 8 units right from -5 on number line.','Common denominator first: LCD of 4 and 2 is 4.',
    '20% = 0.20. Multiply by 60.','Add coefficients: 3+2=5.','Area = l x w.',
    'Negative x negative = positive.','Place on number line to compare.',
    'Perimeter of square = 4s.','45/100, simplify by GCF.','Complement adds to 90 degrees.'],
  medium:['Add 7 to both sides, then divide by 3.','Find 25% of 80, subtract from 80.',
    'Divide by GCF=6.','Add all three sides.','Speed = Distance / Time.',
    'Area = (1/2)bh.','Substitute n=5 into 4n-7.','Subtract 5, divide by 2.',
    '15/100 x 120.','a=4, d=3. Use t_n = a+(n-1)d.'],
  hard:['Mark up: 30%. Price x 1.30. Discount: 30%. Price x 0.70. Compare to original.',
    'Multiply all terms by 10 to clear fractions.','V=lwh, SA=2(lw+lh+wh).',
    'Set A = B+40, A+B=180.','a=2, d=3. t_20 = 2+19x3.','P(B)=1-0.3=0.7.',
    'Let w=width, l=2w. P=2l+2w=36.','Sort data first.','Set up proportion: 3/45 = 8/x.',
    'Angle sum of triangle = 180.']
},
'Math 8':{
  easy:['7 x 7 = 49.','a^2+b^2=c^2: 9+16=25.','15/100 x 80.','Multiply numerators, multiply denominators.',
    '75/100 = 3/4.','Add the numbers, keep the negative sign.','Divide both sides by 4.',
    'SA = 6s^2 = 6x9 = 54.','Negative fraction: -7/2 = -3.5 = -3 and 1/2.','Line up decimals.'],
  medium:['5^2+12^2 = 25+144 = 169 = 13^2.','Subtract 6, divide by 4.','SA = 6 x 25 = 150.',
    '3 even numbers out of 6 total.','3.6 = 3 + 3/5.','45 x 1.12.','V = lwh.',
    'Distribute 3, then solve.','Markup = 0.40 x 30.','Add 7 to both sides, divide by -2 (flip sign!).'],
  hard:['h^2+6^2=10^2. h^2=64.','Add 2 to both sides, divide by 3, graph on number line.',
    'V=pi x r^2 x h.','P(A and B) = P(A) x P(B) for independent events.',
    'Set up: lw=48 and 2l+2w=28.','Distribute and collect all terms to one side.',
    'Set up 2(2x+3) + 2(x-1) = 30.','Pythagorean theorem: d = sqrt(7^2+24^2).',
    '% decrease = (80-60)/80 x 100%.','0.45 x 400 = 180 boys. 0.30 x 180 = 54.']
},
'Math 9':{
  easy:['Add exponents: 2+3=5.','Combine like terms separately.',
    'm = coefficient of x.','2^3 = 2 x 2 x 2 = 8.','Power rule then cube the coefficient.',
    'Difference of squares.','Anything to power 0 = 1.','3^(-2) = 1/9.',
    'Distribute the 2.','In y=mx+b, b is the y-intercept.'],
  medium:['Find factors of 6 that add to -5.','Slope = (y2-y1)/(x2-x1).','FOIL method.',
    'Collect x terms on one side.','Area ratio = k^2.','y = mx + b with m=4, b=-3.',
    'Multiply: 3x2=6, x^2 x x^3=x^5.','Factor out 2x.','Add the equations to eliminate y.',
    'Quotient rule: subtract exponents.'],
  hard:['Factor out 2x first.','Find slope then use point-slope form.','Multiply tops and bottoms, cancel.',
    'Let w=width, l=2w+3. P=2l+2w=48.','Add equations to eliminate y.',
    'C = 2pi r = 31.4. Solve for r.','Perpendicular slope is negative reciprocal.',
    'Odd integer = 2k+1. Square it.','a=-3, d=4. t_15 = a+14d.',
    'Expand (2x-3)^2 = 4x^2-12x+9. Expand (x+4)(x-1) = x^2+3x-4. Subtract.']
},
'Math 10C':{
  easy:['1 foot = 12 inches.','sin(30) = 1/2.','Rearrange to slope-intercept form.',
    '(x+3)(x-3).','Replace x with 3.','100 cm = 1 m.','cos(60) = 1/2.','sqrt(4) = 2.',
    'Vertical line test.','Highest power of x.'],
  medium:['tan(40) = opp/adj.','Set expressions equal, solve for x.','ac-method: 2x3=6, find factors.',
    'Domain: x-2 >= 0. Range: y >= 0.','Multiply by 3.28.',
    'a=5, d=3. t_12 = 5+11x3.','sqrt(72) = sqrt(36x2) = 6sqrt(2).',
    'Rearrange to y=mx+b.','Multiply eq1 by 2, then subtract eq2.',
    'Find factors of -21 that add to -4.'],
  hard:['height = 25 x sin(65).','Multiply by (x-1). Check x=1 is restricted.',
    'Factor out 3x first.','Domain: all reals. Range: y >= 0.',
    'Distance = sqrt(15^2+8^2). Angle = arctan(8/15).',
    'Distances are 120 and 160. Total = sqrt(120^2+160^2).',
    'Perpendicular slope = -3. Use point-slope form.',
    'sin(theta) = 8/10. theta = arcsin(0.8).',
    'Multiply eq1 by 3, add to eq2.','Let w=width, l=length. Use lw=180 and 2l+2w=54.']
},
'Math 20-1':{
  easy:['sqrt(50) = sqrt(25x2) = 5sqrt(2).','(x+2)(x-2).','Read (h,k) directly from equation.',
    'sqrt(12)=2sqrt(3), sqrt(27)=3sqrt(3). Add like radicals.','4^(3/2) = (sqrt4)^3 = 8.',
    'Axis of symmetry x = h from vertex form.','sqrt(18) = 3sqrt(2).',
    '(x+5)^2 = x^2+10x+25.','Read vertex directly from equation.','b^2 - 4ac = 16-16 = 0.'],
  medium:['x = [5 +/- sqrt(49)] / 4.','Complete the square: half of 6 is 3, add and subtract 9.',
    '2x3=6, sqrt(3)xsqrt(6)=sqrt(18)=3sqrt(2).','a=3, d=4. t_8 = 3+7x4.',
    'S_10 = 10/2 x (2+29) = 155.','Factor top and bottom, then cancel.',
    'Factor: (x-4)(x-2) = 0.','Square both sides: x+5=9.','t_2/t_1 = 6/3 = 2.',
    '(2sqrt5)^2 = 20. sqrt(80) = 4sqrt(5). 20 - 4sqrt(5).'],
  hard:['h = -b/(2a). Substitute back for k.','Square both sides, check in original.',
    'Factor all numerators and denominators first.','t_5/t_2 = r^3. Find r.',
    'Substitute x^2 = x+6 to get quadratic.','S_8 = 2(3^8-1)/(3-1).',
    'Factor: -(x^2-4x-5) = -(x-5)(x+1).','Let n=2k+1 and m=2k+3. Add them.',
    'Multiply by (x-2)(x+1) to clear fractions.',
    'S_n = n/2(t_1+t_n). Set equal to 375.']
},
'Math 30-1':{
  easy:['Radians = degrees x pi/180 = pi.','sin completes one cycle every 2pi.',
    '2^3 = 8.','8x7x6 = 336.','log(10^2)=2.',
    'Multiply by 180/pi.','cos(0) = 1.','log_10(1) = 0 since 10^0=1.','5!/(2!3!) = 10.','ln(e^3)=3.'],
  medium:['It equals 1 (Pythagorean identity).','sin(x)=1/2 at 30 and 150 degrees.',
    '10!/(3!7!) = 120.','Rewrite 16 as 2^4.','Domain: x > -2. Range: all reals.',
    'C(4,k) a^(4-k) b^k for k=0,1,2.','log3(x(x-2))=3 so x(x-2)=27.',
    'Period=2pi/2=pi, amplitude=4.','8! = 40320.','Take ln of both sides: 2x = ln7.'],
  hard:['Divide sin^2+cos^2=1 by cos^2.','Let u=cos(x). Solve 2u^2-u-1=0.',
    'T4 = C(5,3) x^2 x 2^3 = 80x^2.','log(x(x-3))=1 so x(x-3)=10.',
    'C(52,5) = 2598960.','Expand left side: 1 + 2sinxcosx = 1 + sin(2x). Check.',
    'Let u=3^x. Then u^2-4u+3=0.','Choose 2 from 5 women (C(5,2)) and 2 from 6 men (C(6,2)).',
    'sin(2x)=cos(x) means 2sinxcosx-cosx=0. Factor.',
    't_3 = ar^2 = 12 and t_6 = ar^5 = 96. Divide to find r^3.']
}
};

// ============================================================
// RESOURCE DATA
// ============================================================
var RESOURCES_BY_GRADE = {
  math7:{
    formulas:[
      {title:'Math 7 Complete Formula Sheet',type:'PDF',badge:'badge-pdf',desc:'Integers, fractions, percents, ratio, area, perimeter, and data formulas.'},
      {title:'Geometry Reference Card — Math 7',type:'PDF',badge:'badge-pdf',desc:'Angle types, triangle properties, and transformation rules.'}
    ],
    notes:[
      {title:'Unit 1 Study Notes: Integers',type:'Notes',badge:'badge-notes',desc:'Complete notes on integer operations with worked examples.'},
      {title:'Unit 2 Study Notes: Fractions & Percents',type:'Notes',badge:'badge-notes',desc:'Step-by-step notes on fraction operations and percent applications.'},
      {title:'Unit 5 Study Notes: Geometry',type:'Notes',badge:'badge-notes',desc:'Angles, triangles, area, perimeter, and transformations notes.'}
    ],
    worksheets:[
      {title:'Integers Practice Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'20 questions on integer operations — all levels.'},
      {title:'Fractions & Ratios Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Adding, subtracting, multiplying, and dividing fractions.'},
      {title:'Percent Applications Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Sales tax, discounts, tips, and percent change problems.'},
      {title:'Geometry Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Angles, triangles, area, perimeter, and transformations.'}
    ],
    exams:[
      {title:'Math 7 Unit 1 Exam — Integers',type:'Exam',badge:'badge-exam',desc:'10-question unit exam with answer key.'},
      {title:'Math 7 Unit 2 Exam — Fractions & Percents',type:'Exam',badge:'badge-exam',desc:'12-question unit exam with answer key.'},
      {title:'Math 7 Mid-Year Exam',type:'Exam',badge:'badge-exam',desc:'25-question mid-year cumulative exam with answer key.'},
      {title:'Math 7 Final Exam',type:'Exam',badge:'badge-exam',desc:'40-question comprehensive final exam with answer key.'}
    ]
  },
  math8:{
    formulas:[
      {title:'Math 8 Complete Formula Sheet',type:'PDF',badge:'badge-pdf',desc:'Pythagorean theorem, surface area, volume, percent, and probability formulas.'},
      {title:'3D Geometry Reference Card',type:'PDF',badge:'badge-pdf',desc:'Formulas for surface area and volume of all common 3D shapes.'}
    ],
    notes:[
      {title:'Unit 1 Study Notes: Pythagorean Theorem',type:'Notes',badge:'badge-notes',desc:'Complete notes on square roots and the Pythagorean theorem with diagrams.'},
      {title:'Unit 3 Study Notes: Percents',type:'Notes',badge:'badge-notes',desc:'Discount, tax, commission, markup, and simple interest.'},
      {title:'Unit 5 Study Notes: 3D Geometry',type:'Notes',badge:'badge-notes',desc:'Surface area and volume of prisms, cylinders, pyramids, and cones.'}
    ],
    worksheets:[
      {title:'Pythagorean Theorem Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Find missing sides and apply theorem to word problems.'},
      {title:'Percent Applications Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Tax, discount, markup, commission, and simple interest.'},
      {title:'Surface Area & Volume Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Practice finding SA and volume of 3D shapes.'},
      {title:'Linear Equations Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Multi-step equation solving practice with 20 questions.'}
    ],
    exams:[
      {title:'Math 8 Unit 1 Exam — Pythagorean Theorem',type:'Exam',badge:'badge-exam',desc:'10-question unit exam with answer key.'},
      {title:'Math 8 Unit 4 Exam — Linear Equations',type:'Exam',badge:'badge-exam',desc:'12-question unit exam with answer key.'},
      {title:'Math 8 Mid-Year Exam',type:'Exam',badge:'badge-exam',desc:'25-question mid-year exam with answer key.'},
      {title:'Math 8 Final Exam',type:'Exam',badge:'badge-exam',desc:'40-question final exam with answer key.'}
    ]
  },
  math9:{
    formulas:[
      {title:'Math 9 Complete Formula Sheet',type:'PDF',badge:'badge-pdf',desc:'Exponent laws, polynomial operations, slope, and circle theorems.'},
      {title:'Factoring Reference Card',type:'PDF',badge:'badge-pdf',desc:'All factoring methods with step-by-step examples.'}
    ],
    notes:[
      {title:'Unit 1 Study Notes: Exponent Laws',type:'Notes',badge:'badge-notes',desc:'All exponent laws with worked examples.'},
      {title:'Unit 2 Study Notes: Polynomials',type:'Notes',badge:'badge-notes',desc:'Adding, subtracting, multiplying, and factoring polynomials.'},
      {title:'Unit 3 Study Notes: Linear Relations',type:'Notes',badge:'badge-notes',desc:'Slope, equation of a line, and systems of equations.'}
    ],
    worksheets:[
      {title:'Exponent Laws Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'All exponent law rules with 25 practice questions.'},
      {title:'Polynomial Operations Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Add, subtract, multiply, and factor polynomials.'},
      {title:'Linear Relations Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Slope, equations of lines, and graphing.'},
      {title:'Systems of Equations Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Solve by substitution, elimination, and graphing.'}
    ],
    exams:[
      {title:'Math 9 Unit 1 Exam — Powers',type:'Exam',badge:'badge-exam',desc:'Unit exam on exponent laws with answer key.'},
      {title:'Math 9 Unit 2 Exam — Polynomials',type:'Exam',badge:'badge-exam',desc:'Unit exam on polynomial operations with answer key.'},
      {title:'Math 9 Unit 3 Exam — Linear Relations',type:'Exam',badge:'badge-exam',desc:'Unit exam on slope and linear equations with answer key.'},
      {title:'Math 9 Final Exam',type:'Exam',badge:'badge-exam',desc:'Comprehensive final exam with answer key.'}
    ]
  },
  math10c:{
    formulas:[
      {title:'Math 10C Complete Formula Sheet',type:'PDF',badge:'badge-pdf',desc:'Measurement, trig, factoring, functions, and sequences formulas.'},
      {title:'Trigonometry Reference Card',type:'PDF',badge:'badge-pdf',desc:'SOHCAHTOA, special triangles, and inverse trig.'}
    ],
    notes:[
      {title:'Unit 1 Study Notes: Measurement',type:'Notes',badge:'badge-notes',desc:'SI and imperial conversions with practice examples.'},
      {title:'Unit 2 Study Notes: Trigonometry',type:'Notes',badge:'badge-notes',desc:'Right triangle trig, SOHCAHTOA, angles of elevation/depression.'},
      {title:'Unit 4 Study Notes: Functions & Sequences',type:'Notes',badge:'badge-notes',desc:'Functions, domain/range, function notation, arithmetic sequences.'}
    ],
    worksheets:[
      {title:'Right Triangle Trig Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Find missing sides and angles using SOHCAHTOA.'},
      {title:'Factoring Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'GCF, difference of squares, trinomials, and ac-method.'},
      {title:'Functions & Domain/Range Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Identify functions, find domain and range, use function notation.'},
      {title:'Systems of Equations Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Substitution and elimination with 20 practice questions.'}
    ],
    exams:[
      {title:'Math 10C Unit 2 Exam — Trigonometry',type:'Exam',badge:'badge-exam',desc:'Unit exam with answer key.'},
      {title:'Math 10C Unit 3 Exam — Factoring',type:'Exam',badge:'badge-exam',desc:'Unit exam on all factoring methods with answer key.'},
      {title:'Math 10C Unit 5 Exam — Systems',type:'Exam',badge:'badge-exam',desc:'Unit exam on solving systems with answer key.'},
      {title:'Math 10C Final Exam',type:'Exam',badge:'badge-exam',desc:'Comprehensive final exam with answer key.'}
    ]
  },
  math201:{
    formulas:[
      {title:'Math 20-1 Complete Formula Sheet',type:'PDF',badge:'badge-pdf',desc:'Quadratics, radicals, rationals, and sequences formulas.'},
      {title:'Sequences & Series Reference Card',type:'PDF',badge:'badge-pdf',desc:'Arithmetic and geometric formulas for nth term and sum.'}
    ],
    notes:[
      {title:'Unit 1 Study Notes: Quadratic Functions',type:'Notes',badge:'badge-notes',desc:'Vertex form, completing the square, quadratic formula, discriminant.'},
      {title:'Unit 2 Study Notes: Radicals',type:'Notes',badge:'badge-notes',desc:'Simplifying, operating, rationalizing, and solving radical equations.'},
      {title:'Unit 4 Study Notes: Sequences & Series',type:'Notes',badge:'badge-notes',desc:'Arithmetic and geometric sequences and series with formulas.'}
    ],
    worksheets:[
      {title:'Quadratic Functions Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Converting forms, finding vertex, and solving by various methods.'},
      {title:'Radical Expressions Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Simplifying, adding, multiplying, and rationalizing radicals.'},
      {title:'Rational Expressions Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Simplifying, multiplying, dividing, adding, and subtracting.'},
      {title:'Sequences & Series Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Arithmetic and geometric sequences and series problems.'}
    ],
    exams:[
      {title:'Math 20-1 Unit 1 Exam — Quadratics',type:'Exam',badge:'badge-exam',desc:'Unit exam with answer key.'},
      {title:'Math 20-1 Unit 2 Exam — Radicals',type:'Exam',badge:'badge-exam',desc:'Unit exam with answer key.'},
      {title:'Math 20-1 Unit 3 Exam — Rationals',type:'Exam',badge:'badge-exam',desc:'Unit exam with answer key.'},
      {title:'Math 20-1 Final Exam',type:'Exam',badge:'badge-exam',desc:'Comprehensive final exam with answer key.'},
      {title:'Math 20-1 Diploma Practice Exam',type:'Exam',badge:'badge-exam',desc:'Full diploma-style practice exam with answer key.'}
    ]
  },
  math301:{
    formulas:[
      {title:'Math 30-1 Complete Formula Sheet',type:'PDF',badge:'badge-pdf',desc:'Trig identities, log/exp rules, permutations/combinations, and binomial theorem.'},
      {title:'Trigonometry Identity Sheet',type:'PDF',badge:'badge-pdf',desc:'All Pythagorean, quotient, reciprocal, and sum/difference identities.'},
      {title:'Unit Circle Reference Card',type:'PDF',badge:'badge-pdf',desc:'Full unit circle with degree and radian measures and trig values.'}
    ],
    notes:[
      {title:'Unit 1 Study Notes: Trigonometry',type:'Notes',badge:'badge-notes',desc:'Radian measure, unit circle, graphing trig functions, and identities.'},
      {title:'Unit 2 Study Notes: Exponential & Logarithmic Functions',type:'Notes',badge:'badge-notes',desc:'Graphs, laws of logarithms, and solving equations.'},
      {title:'Unit 3 Study Notes: Permutations & Combinations',type:'Notes',badge:'badge-notes',desc:'FCP, permutations, combinations, and binomial theorem.'}
    ],
    worksheets:[
      {title:'Trig Functions Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Graphing, transformations, and solving trig equations.'},
      {title:'Trig Identity Proofs Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'15 identity proofs at varying difficulty levels.'},
      {title:'Log and Exp Equations Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Solving exponential and logarithmic equations.'},
      {title:'Permutations & Combinations Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'FCP, permutations, combinations, and counting problems.'}
    ],
    exams:[
      {title:'Math 30-1 Unit 1 Exam — Trigonometry',type:'Exam',badge:'badge-exam',desc:'Unit exam with answer key.'},
      {title:'Math 30-1 Unit 2 Exam — Log & Exp',type:'Exam',badge:'badge-exam',desc:'Unit exam with answer key.'},
      {title:'Math 30-1 Unit 3 Exam — Perms & Combs',type:'Exam',badge:'badge-exam',desc:'Unit exam with answer key.'},
      {title:'Math 30-1 Diploma Practice Exam A',type:'Exam',badge:'badge-exam',desc:'Full diploma practice exam with answer key.'},
      {title:'Math 30-1 Diploma Practice Exam B',type:'Exam',badge:'badge-exam',desc:'Second diploma practice exam with answer key.'}
    ]
  }
};

// Build default resources for grades without custom data
['math103','math202','math203','math302','math303'].forEach(function(gid){
  var g = GRADES[gid];
  RESOURCES_BY_GRADE[gid] = {
    formulas:[{title:g.label+' Formula Sheet',type:'PDF',badge:'badge-pdf',desc:'Complete formula reference for '+g.label+'.'}],
    notes:[{title:g.label+' Study Notes',type:'Notes',badge:'badge-notes',desc:'Comprehensive study notes for all units in '+g.label+'.'}],
    worksheets:[{title:g.label+' Practice Worksheet',type:'Worksheet',badge:'badge-sheet',desc:'Practice problems covering all major topics in '+g.label+'.'}],
    exams:[
      {title:g.label+' Mid-Year Exam',type:'Exam',badge:'badge-exam',desc:'Mid-year practice exam with answer key.'},
      {title:g.label+' Final Exam',type:'Exam',badge:'badge-exam',desc:'Comprehensive final exam with answer key.'}
    ]
  };
});

// ============================================================
// STATE
// ============================================================
var currentGrade  = null;
var practiceDiff  = 'easy';
var practiceGrade = 'Math 7';

// ============================================================
// NAVIGATION
// ============================================================
function showPage(id){
  var pages = document.querySelectorAll('.page');
  for(var i=0;i<pages.length;i++) pages[i].classList.remove('active');
  var t = document.getElementById('page-'+id);
  if(t) t.classList.add('active');
  var order = ['home','grades','practice','resources','about','contact'];
  var btns = document.querySelectorAll('.nav-link');
  for(var j=0;j<btns.length;j++) btns[j].classList.toggle('active', order[j]===id);
  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo(0,0);
}
function toggleNav(){ document.getElementById('navLinks').classList.toggle('open'); }

// ============================================================
// GRADE CARDS
// ============================================================
function buildGradeCard(g, fn){
  var c = document.createElement('div');
  c.className = 'grade-card '+g.cardClass;
  c.onclick = fn;
  c.innerHTML = '<span class="grade-tag '+g.tagClass+'">'+g.tag+'</span><h3>'+g.label+'</h3><p>'+g.desc+'</p><div class="grade-arrow">View Lessons &rarr;</div>';
  return c;
}
function buildAllGradeCards(){
  var homeGrid = document.getElementById('homeGradeGrid');
  var keys = Object.keys(GRADES);
  keys.forEach(function(gid){
    homeGrid.appendChild(buildGradeCard(GRADES[gid], (function(id){ return function(){ openGradeDetail(id); }; })(gid)));
  });
  var groups = [
    ['gradesJrGrid',['math7','math8','math9']],
    ['gradesSr10Grid',['math10c','math103']],
    ['gradesSr20Grid',['math201','math202','math203']],
    ['gradesSr30Grid',['math301','math302','math303']]
  ];
  groups.forEach(function(grp){
    var el = document.getElementById(grp[0]);
    grp[1].forEach(function(gid){
      el.appendChild(buildGradeCard(GRADES[gid], (function(id){ return function(){ openGradeDetail(id); }; })(gid)));
    });
  });
}

// ============================================================
// GRADE DETAIL
// ============================================================
function openGradeDetail(gid){
  var g = GRADES[gid];
  if(!g) return;
  currentGrade = g;
  document.getElementById('gradeDetailTitle').textContent = g.label;
  document.getElementById('gradeDetailDesc').textContent  = g.fullDesc;
  document.getElementById('gradeDetailBreadcrumb').textContent = g.label;
  document.getElementById('practiceGradeName').textContent = g.label;

  // Topics
  document.getElementById('detailTopics').innerHTML = g.topics.map(function(t){
    return '<li class="topic-item"><span class="topic-dot"></span>'+t+'</li>';
  }).join('');
  // Outcomes
  document.getElementById('detailOutcomes').innerHTML = g.outcomes.map(function(o){
    return '<div class="outcome-item">&#10003; '+o+'</div>';
  }).join('');

  // Lessons
  buildLessons(gid);
  // Resources
  buildGradeResources(gid);

  // Reset tabs
  var section = document.querySelector('#page-grade-detail .section');
  section.querySelectorAll('.tab-btn').forEach(function(b,i){ b.classList.toggle('active',i===0); });
  section.querySelectorAll('.tab-panel').forEach(function(p,i){ p.classList.toggle('active',i===0); });
  document.getElementById('detailQuestions').innerHTML = '';
  document.querySelectorAll('#detailDiffBtns .diff-btn').forEach(function(b){ b.classList.remove('active'); });

  showPage('grade-detail');
}

function buildLessons(gid){
  var container = document.getElementById('lessonsContainer');
  var units = LESSONS[gid];
  if(!units || units.length === 0){
    container.innerHTML = '<p class="text-muted">Lessons for this course are coming soon. Check back regularly!</p>';
    return;
  }
  container.innerHTML = units.map(function(unit, ui){
    var lhtml = unit.lessons.map(function(lesson){
      return '<div class="lesson-card"><div class="lesson-title">'+lesson.title+'</div><div class="lesson-body">'+lesson.body+'</div></div>';
    }).join('');
    return '<div class="unit-block">'+
      '<div class="unit-header" onclick="toggleUnit(this)">'+
        '<h3>'+unit.unit+'</h3>'+
        '<div style="display:flex;align-items:center;gap:12px">'+
          '<span>'+unit.lessons.length+' lessons</span>'+
          '<button class="unit-toggle" tabindex="-1">+</button>'+
        '</div>'+
      '</div>'+
      '<div class="unit-body">'+lhtml+'</div>'+
    '</div>';
  }).join('');
}

function toggleUnit(header){
  var body = header.nextElementSibling;
  var btn  = header.querySelector('.unit-toggle');
  body.classList.toggle('open');
  btn.textContent = body.classList.contains('open') ? '&#8722;' : '+';
}

function buildGradeResources(gid){
  var res = RESOURCES_BY_GRADE[gid];
  var container = document.getElementById('gradeResourcesContainer');
  if(!res){ container.innerHTML='<p class="text-muted">Resources coming soon.</p>'; return; }

  function makeCards(arr){
    return arr.map(function(r){
      return '<div class="resource-card">'+
        '<div class="res-icon-bg res-blue">&#128196;</div>'+
        '<span class="resource-badge '+r.badge+'">'+r.type+'</span>'+
        '<h3>'+r.title+'</h3><p>'+r.desc+'</p>'+
        '<button class="dl-btn" onclick="alertDl(\''+r.title.replace(/'/g,"\\'")+'\')" >Download '+r.type+'</button>'+
      '</div>';
    }).join('');
  }

  container.innerHTML =
    '<h3 style="color:var(--navy);font-weight:700;margin-bottom:1rem">Formula Sheets</h3>'+
    '<div class="resource-grid">'+makeCards(res.formulas)+'</div>'+
    '<h3 style="color:var(--navy);font-weight:700;margin:2rem 0 1rem">Study Notes</h3>'+
    '<div class="resource-grid">'+makeCards(res.notes)+'</div>'+
    '<h3 style="color:var(--navy);font-weight:700;margin:2rem 0 1rem">Worksheets</h3>'+
    '<div class="resource-grid">'+makeCards(res.worksheets)+'</div>'+
    '<h3 style="color:var(--navy);font-weight:700;margin:2rem 0 1rem">Unit Exams</h3>'+
    '<div class="resource-grid">'+makeCards(res.exams)+'</div>';
}

// ============================================================
// TABS
// ============================================================
function switchTab(btn, panelId){
  var bar = btn.closest('.tab-bar');
  bar.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  var parent = bar.parentElement;
  parent.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
  var t = document.getElementById('tab-'+panelId);
  if(t) t.classList.add('active');
}

// ============================================================
// DIFFICULTY / PRACTICE (DETAIL PAGE)
// ============================================================
function selectDiff(btn, diff){
  document.querySelectorAll('#detailDiffBtns .diff-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  var label = currentGrade ? currentGrade.label : 'Math 7';
  var qPool = QUESTIONS[label] || QUESTIONS['Math 7'];
  var qs    = qPool[diff]      || qPool.easy;
  var hPool = HINTS[label]     || HINTS['Math 7'];
  var hints = hPool[diff]      || hPool.easy;
  var html  = '';
  var count = Math.min(qs.length, 6);
  for(var i=0;i<count;i++){
    html += '<div class="question-box">'+
      '<div class="question-num">Question '+(i+1)+'</div>'+
      '<div class="question-text">'+qs[i]+'</div>'+
      '<textarea class="answer-area" placeholder="Type your answer here..."></textarea>'+
      '<div><button class="hint-btn" onclick="toggleHint(this)">Show Hint</button></div>'+
      '<div class="question-hint">'+(hints[i]||'Work through it step by step!')+'</div>'+
    '</div>';
  }
  document.getElementById('detailQuestions').innerHTML = html;
}
function toggleHint(btn){
  var hint = btn.parentElement.nextElementSibling;
  hint.classList.toggle('visible');
  btn.textContent = hint.classList.contains('visible') ? 'Hide Hint' : 'Show Hint';
}

// ============================================================
// PRACTICE PAGE
// ============================================================
function selectPracticeGrade(btn, grade){
  document.querySelectorAll('.grade-select-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  practiceGrade = grade;
}
function selectPracticeDiff(btn, diff){
  document.querySelectorAll('.practice-controls .diff-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  practiceDiff = diff;
}
function generatePracticeQuestions(){
  var qPool  = QUESTIONS[practiceGrade] || QUESTIONS['Math 7'];
  var qs     = qPool[practiceDiff]      || qPool.easy;
  var hPool  = HINTS[practiceGrade]     || HINTS['Math 7'];
  var hints  = hPool[practiceDiff]      || hPool.easy;
  var labels = {easy:'Easy',medium:'Medium',hard:'Hard'};
  var cls    = {easy:'q-easy',medium:'q-medium',hard:'q-hard'};
  var html   = '';
  for(var i=0;i<qs.length;i++){
    var safeHint = (hints[i]||'Think step by step!').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
    html += '<div class="q-card">'+
      '<span class="q-difficulty '+cls[practiceDiff]+'">'+labels[practiceDiff]+'</span>'+
      '<div class="q-text">'+(i+1)+'. '+qs[i]+'</div>'+
      '<input type="text" class="q-input" placeholder="Your answer..." />'+
      '<div class="q-actions">'+
        '<button class="q-btn q-btn-hint" onclick="showQHint(this,\''+safeHint+'\')">Hint</button>'+
        '<button class="q-btn q-btn-check" onclick="checkAnswer(this)">Check Answer</button>'+
      '</div>'+
      '<div class="q-hint-text"></div>'+
      '<div class="q-result"></div>'+
    '</div>';
  }
  document.getElementById('practiceQuestionsContainer').innerHTML = html;
}
function showQHint(btn, hint){
  var card   = btn.closest('.q-card');
  var hintEl = card.querySelector('.q-hint-text');
  var vis    = hintEl.style.display === 'block';
  hintEl.textContent = hint;
  hintEl.style.display = vis ? 'none' : 'block';
}
function checkAnswer(btn){
  var card   = btn.closest('.q-card');
  var input  = card.querySelector('.q-input');
  var result = card.querySelector('.q-result');
  if(!input.value.trim()){
    result.className = 'q-result q-incorrect';
    result.textContent = 'Please enter an answer first.';
    result.style.display = 'block';
    return;
  }
  result.className = 'q-result q-correct';
  result.textContent = 'Answer submitted! Review with your teacher or check the solution guide.';
  result.style.display = 'block';
}

// ============================================================
// GLOBAL RESOURCES PAGE
// ============================================================
function buildGlobalResources(){
  var formulaGrid = document.getElementById('globalFormulaGrid');
  var guidesGrid  = document.getElementById('globalGuidesGrid');
  var examsGrid   = document.getElementById('globalExamsGrid');
  var wsGrid      = document.getElementById('globalWorksheetGrid');

  var allRes = [];
  Object.keys(RESOURCES_BY_GRADE).forEach(function(gid){
    var r = RESOURCES_BY_GRADE[gid];
    var g = GRADES[gid];
    if(!g) return;
    r.formulas.forEach(function(item){
      allRes.push({type:'formula', item:item, grade:g.label});
    });
    r.notes.forEach(function(item){
      allRes.push({type:'notes', item:item, grade:g.label});
    });
    r.exams.forEach(function(item){
      allRes.push({type:'exam', item:item, grade:g.label});
    });
    r.worksheets.forEach(function(item){
      allRes.push({type:'ws', item:item, grade:g.label});
    });
  });

  function makeCard(item){
    return '<div class="resource-card">'+
      '<div class="res-icon-bg res-blue">&#128196;</div>'+
      '<span class="resource-badge '+item.badge+'">'+item.type+'</span>'+
      '<h3>'+item.title+'</h3><p>'+item.desc+'</p>'+
      '<button class="dl-btn" onclick="alertDl(\''+item.title.replace(/'/g,"\\'")+'\')" >Download '+item.type+'</button>'+
    '</div>';
  }

  formulaGrid.innerHTML = allRes.filter(function(x){ return x.type==='formula'; }).map(function(x){ return makeCard(x.item); }).join('');
  guidesGrid.innerHTML  = allRes.filter(function(x){ return x.type==='notes';   }).map(function(x){ return makeCard(x.item); }).join('');
  examsGrid.innerHTML   = allRes.filter(function(x){ return x.type==='exam';    }).map(function(x){ return makeCard(x.item); }).join('');
  wsGrid.innerHTML      = allRes.filter(function(x){ return x.type==='ws';      }).map(function(x){ return makeCard(x.item); }).join('');
}

// ============================================================
// CONTACT FORM
// ============================================================
function submitForm(){
  var name  = document.getElementById('cName').value.trim();
  var email = document.getElementById('cEmail').value.trim();
  var msg   = document.getElementById('cMsg').value.trim();
  if(!name||!email||!msg){ alert('Please fill in your name, email, and message.'); return; }
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!re.test(email)){ alert('Please enter a valid email address.'); return; }
  document.getElementById('formSuccess').style.display = 'block';
  document.getElementById('cName').value = '';
  document.getElementById('cEmail').value = '';
  document.getElementById('cRole').value = '';
  document.getElementById('cMsg').value = '';
}

// ============================================================
// DOWNLOAD PLACEHOLDER
// ============================================================
function alertDl(name){
  alert('Download: "'+name+'"\n\nIn a full deployment, this button downloads the actual PDF or file.\nReplace the onclick with a link to your hosted file (e.g. <a href="files/math7-formula-sheet.pdf">).');
}

// ============================================================
// INIT
// ============================================================
buildAllGradeCards();
buildGlobalResources();
