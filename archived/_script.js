var data = [
{"hour":0, "flux":0},
{"hour":1, "flux":-2},
{"hour":2, "flux":-4},
{"hour":3, "flux":-6},
{"hour":4, "flux":-8},
{"hour":5, "flux":-10},
{"hour":6, "flux":-12},
{"hour":7, "flux":-14},
{"hour":8, "flux":-16},
{"hour":9, "flux":-18},
{"hour":10, "flux":-20},
{"hour":11, "flux":-22},
{"hour":12, "flux":-24},
{"hour":13, "flux":-26},
{"hour":14, "flux":-28},
{"hour":15, "flux":-30},
{"hour":16, "flux":-32},
{"hour":17, "flux":-34},
{"hour":18, "flux":-36},
{"hour":19, "flux":-38},
{"hour":20, "flux":-40},
{"hour":21, "flux":-42},
{"hour":22, "flux":-44},
{"hour":23, "flux":-46},
]

var ƒ = d3.f

var sel = d3.select('#theChart').html('')
var c = d3.conventions({
  parentSel: sel, 
  totalWidth: sel.node().offsetWidth, 
  height: 400, //chart height
  margin: {left: 50, right: 50, top: 30, bottom: 30} //margins
})


c.svg.append('rect').at({width: c.width, height: c.height, opacity: .40}) //general rectangle settings

c.x.domain([0, 23]) //x range
c.y.domain([-50, 0]) //y range

c.xAxis.ticks(23).tickFormat(ƒ()) //x access ticks
c.yAxis.ticks(20).tickFormat(d => d ) //y access ticks

var area = d3.area()
              .x(ƒ('hour', c.x))
              .y0(ƒ('flux', c.y))
              .y1(c.height)
              //.curve(d3.curveCatmullRom.alpha(0.5)); //curves it up but unsure this the right choice here . . . for the data that is
var line = d3.area()
              .x(ƒ('hour', c.x))
              .y(ƒ('flux', c.y))
              //.curve(d3.curveCatmullRom.alpha(0.5)); //match curve above
              

var clipRect = c.svg
  .append('clipPath#clip')
  .append('rect')
  .at({width: c.x(12), height: c.height})  //sets the clip path start ************

var correctSel = c.svg.append('g').attr('clip-path', 'url(#clip)')

correctSel.append('path.area').at({d: area(data)})
correctSel.append('path.line').at({d: line(data)})
yourDataSel = c.svg.append('path.your-line')

c.drawAxis()

yourData = data
  .map(function(d){ return {hour: d.hour, flux: d.flux, defined: 0} })
  .filter(function(d){
    if (d.hour == 12) d.defined = true //
    return d.hour >= 12 // start point for the user line -- needs to match start for clip path  **********
  })


var completed = false
var drag = d3.drag()
  .on('drag', function(){
    var pos = d3.mouse(this)
    //console.log(pos) // added to see how data is logged on the mouse change
    var hour = clamp(13, 23, c.x.invert(pos[0])) //make sure this first number is one higher than the clip number ... or not thought this was the key
    var flux = clamp(-50, c.y.domain()[1], c.y.invert(pos[1])) // limit x and y values for user created data  ***** first number should match where data clip occurs


    yourData.forEach(function(d){
      if (Math.abs(d.hour - hour) < .5){
        d.flux = flux
        d.defined = true
      }
    })

    yourDataSel.at({d: line.defined(ƒ('defined'))(yourData)})

    if (!completed && d3.mean(yourData, ƒ('defined')) == 1){
      completed = true
      clipRect.transition().duration(2000).attr('width', c.x(24))      
    }
  })

c.svg.call(drag)



function clamp(a, b, c){ return Math.max(a, Math.min(b, c)) }

//path class your-line seems to be what's holding user entered data

