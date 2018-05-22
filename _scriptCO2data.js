var data = [
  {"time":0,	"flux":-23.3996752027434},
  {"time":1,	"flux":-22.133597901746},
  {"time":2,	"flux":-13.9906601041925},
  {"time":3,	"flux":-13.2878624141977},
  {"time":4,	"flux":-7.20410970987129},
  {"time":5,	"flux":-5.16412653118642},
  {"time":6,	"flux":-4.6036598948483},
  {"time":7,	"flux":-1.41257029958085},
  {"time":8,	"flux":2.40236852292693},
  {"time":9,	"flux":11.0787549360931},
  {"time":10,	"flux":14.4552851272645},
  {"time":11,	"flux":21.8518670170143},
  {"time":12,	"flux":19.428215888354},
  {"time":13,	"flux":21.0637474812946},
  {"time":14,	"flux":21.7236332961269},
  {"time":15,	"flux":17.3985394436796},
  {"time":16,	"flux":19.342640153626},
  {"time":17,	"flux":16.4787185481136},
  {"time":18,	"flux":9.45765787203744},
  {"time":19,	"flux":-5.8218797982969},
  {"time":20,	"flux":-12.0669556425967},
  {"time":21,	"flux":-23.544542013952},
  {"time":22,	"flux":-29.8990116709085},
  {"time":23,	"flux":-31.6781767418159},
]



var firebaseScienceDataStore = firebase.database().ref('/science/c02')

firebaseScienceDataStore.once('value', function(snapshot){
    data = snapshot.val()
    const finalResult = []
    const combinedArray = []
    for (entry in data){
      data[entry].forEach(list => combinedArray.push(list))
    }

    if (combinedArray.length >=1){

    for (var i = 6; i < 24; i++ ){
      let filteredResults =
      combinedArray
      .filter(datum => datum.time === i)
      .map(datum => datum.flux)

      let sum = filteredResults.reduce((acc, value) => acc + value, 0)
      let average = sum / filteredResults.length

      let result = {
        flux: average,
        time: i
      }

      finalResult.push(result)
    }
      correctSel.append('path.mean-line').at({d: line(finalResult)})

  }

})

var ƒ = d3.f

var sel = d3.select('#theChartCO2').html('')
var c = d3.conventions({
  parentSel: sel,
  totalWidth: sel.node().offsetWidth,
  height: 400, //chart height
  width: 500, //chart width
  margin: {left: 50, right: 50, top: 0, bottom: 30} //margins
})


c.svg.append('rect').at({width: c.width, height: c.height, fill: "#f9e37f", opacity: .20}) //general rectangle settings

c.x.domain([0, 24]) //x range
c.y.domain([-40, 40]) //y range

c.xAxis.tickValues([0, 6, 12, 18, 24]).tickFormat(ƒ(d => d + ':00 hr')) //x access ticks
c.yAxis.ticks(10).tickFormat(d => d ) //y access ticks

var area = d3.area()
              .x(ƒ('time', c.x))
              .y0(ƒ('flux', c.y))
              .y1(c.height)
              //.curve(d3.curveCatmullRom.alpha(.5)); //curves it up but unsure this the right choice here . . . for the data that is
var line = d3.area()
              .x(ƒ('time', c.x))
              .y(ƒ('flux', c.y))
              //.curve(d3.curveCatmullRom.alpha(.5)); //match curve above

var clipRect = c.svg
  .append('clipPath#clip')
  .append('rect')
  .at({width: c.x(6), height: c.height})  //sets the clip path start ************

var correctSel = c.svg.append('g').attr('clip-path', 'url(#clip)')

correctSel.append('path.area').at({d: area(data)})
correctSel.append('path.line').at({d: line(data)})
yourDataSel = c.svg.append('path.your-line')

c.drawAxis()

yourData = data
  .map(function(d){ return {time: d.time, flux: d.flux, defined: 0} })
  .filter(function(d){
    if (d.time == 6) d.defined = true //
    return d.time >= 6 // start point for the user line -- needs to match start for clip path  **********
  })


var completed = false
var drag = d3.drag()
  .on('drag', function(){
    var pos = d3.mouse(this)
    //console.log(pos) // added to see how data is logged on the mouse change
    var time = clamp(7, 24, c.x.invert(pos[0])) //make sure this first number is one higher than the clip number ... or not thought this was the key
    var flux = clamp(-40, c.y.domain()[1], c.y.invert(pos[1])) // limit x and y values for user created data  ***** first number should match where data clip occurs


    yourData.forEach(function(d){
      if (Math.abs(d.time - time) < .5){
        d.flux = flux
        d.defined = true
      }
    })

    yourDataSel.at({d: line.defined(ƒ('defined'))(yourData)})

    if (!completed && d3.mean(yourData, ƒ('defined')) == 1){
      console.log(yourData)
      completed = true
      clipRect.transition().duration(2000).attr('width', c.x(24))
      firebaseScienceDataStore.push(yourData)

      // upload complete stuff to firebase here

    }
  })

c.svg.call(drag)



function clamp(a, b, c){ return Math.max(a, Math.min(b, c)) }

//path class your-line seems to be what's holding user entered data
