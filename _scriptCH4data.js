var data = [
{"temp":0, "flux":0.00124056924514092},
{"temp":5, "flux":0.00527223407910936},
{"temp":10, "flux":0.0137108780408455},
{"temp":15, "flux":0.0252135966309739},
{"temp":20, "flux":0.0345555588547321},
{"temp":25, "flux":0.108775020510442},
{"temp":30, "flux":0.283957955301404},
{"temp":35, "flux":0.329228501058131},
]


var firebaseScienceDataStore = firebase.database().ref('/science/ch4')

firebaseScienceDataStore.once('value', function(snapshot){
    data = snapshot.val()
    const finalResult = []
    const combinedArray = []
    for (entry in data){
      data[entry].forEach(list => combinedArray.push(list))
    }

    if (combinedArray.length >= 1){
    const temps =[10, 15, 20, 25, 30, 35]
    temps.forEach(temp => {
      let filteredResults =
      combinedArray
      .filter(datum => datum.temp === temp)
      .map(datum => datum.flux)

      let sum = filteredResults.reduce((acc, value) => acc + value, 0)
      let average = sum / filteredResults.length

      let result = {
        flux: average,
        temp: temp
      }

      finalResult.push(result)
    })
      correctSel.append('path.mean-line').at({d: line(finalResult)})

  }

})

var ƒ = d3.f

var sel = d3.select('#theChartCH4').html('')
var c = d3.conventions({
  parentSel: sel,
  totalWidth: sel.node().offsetWidth,
  height: 400, //chart height
  width: 500, //chart width
  margin: {left: 50, right: 50, top: 0, bottom: 30} //margins
})


c.svg.append('rect').at({width: c.width, height: c.height, fill: "#f9e37f", opacity: .20}) //general rectangle settings

c.x.domain([0, 35]) //x range
c.y.domain([0, 0.4]) //y range

c.xAxis.ticks(10).tickFormat(ƒ(d => d + 'ºC')) //x access ticks
c.yAxis.ticks(2).tickFormat(d => d ) //y access ticks

var area = d3.area()
              .x(ƒ('temp', c.x))
              .y0(ƒ('flux', c.y))
              .y1(c.height)
              //.curve(d3.curveCatmullRom.alpha(0.5)); //curves it up but unsure this the right choice here . . . for the data that is
var line = d3.area()
              .x(ƒ('temp', c.x))
              .y(ƒ('flux', c.y))
              //.curve(d3.curveCatmullRom.alpha(0.5)); //match curve above


var clipRect = c.svg
  .append('clipPath#clip')
  .append('rect')
  .at({width: c.x(10), height: c.height})  //sets the clip path start ************

var correctSel = c.svg.append('g').attr('clip-path', 'url(#clip)')

correctSel.append('path.area').at({d: area(data)})
correctSel.append('path.line').at({d: line(data)})
yourDataSel = c.svg.append('path.your-line')

c.drawAxis()

yourData = data
  .map(function(d){ return {temp: d.temp, flux: d.flux, defined: 0} })
  .filter(function(d){
    if (d.temp == 10) d.defined = true //
    return d.temp >= 10 // start point for the user line -- needs to match start for clip path  **********
  })


var completed = false
var drag = d3.drag()
  .on('drag', function(){
    var pos = d3.mouse(this)
    //console.log(pos) // added to see how data is logged on the mouse change
    var temp = clamp(11, 35, c.x.invert(pos[0])) //make sure this first number is one higher than the clip number ... or not thought this was the key
    var flux = clamp(0, c.y.domain()[1], c.y.invert(pos[1])) // limit x and y values for user created data  ***** first number should match where data clip occurs


    yourData.forEach(function(d){
      if (Math.abs(d.temp - temp) < .5){
        d.flux = flux
        d.defined = true
      }
    })

    yourDataSel.at({d: line.defined(ƒ('defined'))(yourData)})

    if (!completed && d3.mean(yourData, ƒ('defined')) == 1){
      console.log(yourData)
      completed = true
      clipRect.transition().duration(2000).attr('width', c.x(35))
      firebaseScienceDataStore.push(yourData)
    }
  })

c.svg.call(drag)



function clamp(a, b, c){ return Math.max(a, Math.min(b, c)) }

//path class your-line seems to be what's holding user entered data
