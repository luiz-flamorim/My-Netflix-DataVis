// Add figures to the bar chart

const h = 900
const w = 1000
const m = {
    top: 30,
    bottom: 30,
    left: 30,
    right: 30,
}

const width = w - (m.left + m.right)
const height = h - (m.top + m.bottom)

let gridRows = 6
let gridLines = 74
let tDuration = 750

let chartContainer = d3.select('#svg-container')
    .style('width', '1000px')
    .style('height', '900px')

d3.json('js/results.json')
    .then(data => {
        createChart(data)
    })

function createChart(rawData) {

    let dataObject = buildDataObject(rawData)

    // map for the unique years
    let allYears = d3.group(dataObject, d => d.date.getFullYear())
    let uniqueYears = Array.from(allYears.keys())

    let yearCount = d3.rollup(dataObject, v => v.length, d => d.date.getFullYear())

    // scale for years
    let scaleYears = d3.scaleLinear()
        .domain(uniqueYears)
        .range([2, 2.5]);

    // scaleBand - for the bar chart
    let yearBand = d3.scaleBand()
        .domain(uniqueYears)
        .range([m.top, height])
        .padding(0.2)

    // Map for the unique genres: needs value and key for colour scale
    let uniqueGenres = new Map()
    let valueKey = 1
    dataObject.map(item => {
        if (!uniqueGenres.has(item.genre)) {
            uniqueGenres.set(item.genre, valueKey)
            valueKey++
        }
    })

    // making the x scale for the grid diagram
    let yearScales = {};
    uniqueYears.forEach(year => {
        let gridXScale = d3.scaleBand()
            .domain(d3.range(gridLines))
            .range([m.left, width - m.right])

        let gridYScale = d3.scaleBand()
            .domain(d3.range(gridRows))
            .range([yearBand(year) + 10, yearBand(year) + yearBand.bandwidth()])

        // saves all the scales inside of the object
        yearScales[year] = {
            x: gridXScale,
            y: gridYScale
        }
    })

    // Scale for the Horizontal figures on bar chart
    let barHscale = d3.scaleLinear()
        .domain([0, 444])
        .range([m.left, width - m.right])


    // Set the main SVG
    const svg = d3.select('#dots')
        .attr("viewBox", [0, 0, w, h]);

    // Container for the grid diagram
    let diagramContainer = svg.append("g")
        .attr("class", "diagram-container")
        .attr("transform", `translate(${m.left},${m.top})`)

    // axis for the grid diagram
    let yearAxis = svg.append('g')
        .classed("year-axis", true)
        .call(d3.axisLeft(yearBand)
            .tickPadding(5)
            .tickSize(0)
        )
        .style('opacity', 0)
        .attr("transform", `translate(${m.left * 1.5},${m.top})`)

    // Scale for the colours
    // interpolators: https://github.com/d3/d3-scale-chromatic
    let colour = d3.scaleSequential()
        .domain([0, uniqueGenres.size])
        .interpolator(d3.interpolateCool)

    // setup the containers
    let chartContainer = diagramContainer.append('g')
        .attr("class", "chartContainer")

    let barsFigures = svg.append('g')
        .attr('class', 'bar-figure')

    let chartType = 'phillo'

    update(chartType)

    let phillo = document.querySelector('#phillo')
    phillo.addEventListener('click', function () {
        if (chartType != 'phillo') {
            chartType = 'phillo'
            yearAxis.transition()
                .duration(tDuration)
                .style('opacity', 0)
                .attr("transform", `translate(0,${m.top})`)

            phillo.classList.toggle('btn')
            phillo.classList.toggle('btn-selected')
            bars.classList.toggle('btn')
            bars.classList.toggle('btn-selected')

            update(chartType)
            updateBarFigures(chartType)
        }
    })

    let bars = document.querySelector('#bar')
    bars.addEventListener('click', function () {
        if (chartType != 'bars') {
            chartType = 'bars'
            yearAxis.transition()
                .duration(tDuration)
                .style('opacity', 1)
                .attr("transform", `translate(${m.left * 1.5},${m.top})`)

            phillo.classList.toggle('btn')
            phillo.classList.toggle('btn-selected')
            bars.classList.toggle('btn')
            bars.classList.toggle('btn-selected')

            update(chartType)
            updateBarFigures(chartType)
        }
    })


    function update(chartType) {

        for (const year of allYears) {
            let yearData = year[1]
            let xScale = yearScales[year[0]].x
            let yScale = yearScales[year[0]].y

            chartContainer.selectAll(`.circles-${year[0]}`)
                .data(yearData, d => d.id)
                .join(
                    enter => enter.append('circle')
                    .classed(`circles-${year[0]}`, true)
                    .style('opacity', 0)
                    .attr('fill', d => colour(uniqueGenres.get(d.genre)))
                    .attr("cx", width / 2)
                    .attr("cy", height / 2)
                    .attr('data-tippy-content', d => d.title)
                    .on("click", cardBuilder)
                    .on('mouseover', mouseOver)
                    .on('mouseout', mouseOut)
                    .call(chartTransition),

                    update => update.on("click", cardBuilder)
                    .on('mouseover', mouseOver)
                    .on('mouseout', mouseOut)
                    .call(chartTransition),

                    exit => exit.remove()
                )

            function mouseOver() {
                d3.select(this)
                    .transition()
                    .duration(tDuration / 5)
                    .style("cursor", "pointer")
                    .attr("r", d => chartType == "bars" ? 8 : scaleYears(d.date.getFullYear()) * 2)
            }

            function mouseOut() {
                d3.select(this)
                    .transition()
                    .duration(tDuration / 5)
                    .attr("r", d => chartType == "bars" ? 4 : scaleYears(d.date.getFullYear()))
            }

            function chartTransition(event) {
                event.transition()
                    .ease(d3.easeCircle)
                    .delay((d, i) => i * 3)
                    .duration(tDuration)
                    .attr("cx", (d, i) => chartType == "bars" ? xScale(Math.floor(i / gridRows)) : d.x)
                    .attr("cy", (d, i) => chartType == "bars" ? yScale(i % gridRows) : d.y)
                    .attr("r", d => chartType == "bars" ? 4 : scaleYears(d.date.getFullYear()))
                    .style('opacity', 1)
            }
        }

        tippy('[data-tippy-content]', {
            content: 'Global content',
            animateFill: true,
        })
    }

    function updateBarFigures(chartType) {

        barsFigures.selectAll(`text`)
            .data(yearCount, d => d.id)
            .join(enter =>
                enter.append('text')
                .attr('class', `year-figure`)
                .attr('id', d => `year-figure-${d[0]}`)
                .attr('x', d => barHscale(d[1]))
                .attr('y', d => yearBand(d[0]) + 75)
                .text(d => d[1])
                .style('font-size', 20)
                .style('fill', 'white')
                .style('opacity', 0)
                .call(barFigureTransition),

                update => update.call(barFigureTransition),

                exit => exit.remove()
            )
    }

    function barFigureTransition(event) {
        event.transition()
            .duration(tDuration)
            .ease(d3.easeCircle)
            .delay(tDuration * 1.8)
            .attr('x', d => chartType == "bars" ? barHscale(d[1]) + 35 : barHscale(d[1]))
            .style('opacity', chartType == "bars" ? 1 : 0)
    }


    // Legend
    // ref: https://bl.ocks.org/jkeohan/b8a3a9510036e40d3a4e

    let legendC = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate (${m.left}, ${m.top/2})`)

    let dataL = 0;
    let offset = 30;

    let legend = legendC.selectAll('.legend')
        .data(uniqueGenres)
        .enter().append('g')
        .attr("class", "legend")

    let legendCircle = legend.append('circle')
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 5)
        .attr("fill", d => colour(d[1]))

    let legendText = legend.append('text')
        .attr("x", 20)
        .attr("y", 10)
        .text(function (d, i) {
            return d[0]
        })
        .attr("class", "textselected")
        .style("text-anchor", "start")
        .style("font-size", 13)
        .style("font-weigth", 200)
        .style('fill', 'white')

    legend.attr("transform", function (d, i) {
        let bBoxWidth = d3.select(this)
            .select('text')
            .node()
            .getBBox().width
        if (i === 0) {

            dataL = bBoxWidth + offset
            return "translate(0,5)"
        } else {
            let newdataL = dataL
            dataL += bBoxWidth + offset
            return "translate(" + (newdataL) + ",5)"
        }
    })

    legendCircle.on('mouseover', function (d, i) {

            let clicked = d3.select(this)
                .data()[0][0]

            legendCircle.attr("opacity", 1)
                .transition()
                .duration(tDuration / 5)
                .attr("opacity", 0.2)

            legendText.attr("opacity", 1)
                .transition()
                .duration(tDuration / 5)
                .attr("opacity", y => y[0] == clicked ? 1 : 0.2)

            d3.select(this)
                .transition()
                .duration(tDuration / 5)
                .style("cursor", "pointer")
                .attr("opacity", 1)
                .attr("r", 10)


        })
        .on('mouseout', function () {
            legendCircle.transition()
                .duration(tDuration / 5)
                .attr("opacity", 1)

            legendText.transition()
                .duration(tDuration / 5)
                .attr("opacity", 1)

            d3.select(this)
                .transition()
                .duration(tDuration / 5)
                .attr("r", 5)
        })
        .on('click', function (d, i) {

            let clicked = d3.select(this)
                .data()[0][0]

            d3.selectAll(`[class*="circles"]`)
                .call(update => update.transition()
                    .duration(tDuration)
                    .style("opacity", y => y.genre == clicked ? 1 : 0.2))

            legendClick(clicked)
        })

    function legendClick(catName) {

        let statsDiv = document.querySelector('#legend-stats')
        statsDiv.setAttribute('data-tippy-content', 'close')
        statsDiv.innerHTML = ''
        statsDiv.style.display = 'block'

        let figure = d3.map(dataObject, d => d.genre).filter(d => d == catName).length

        let category = document.createElement('p')
        category.setAttribute('class', 'legend-category')
        category.style.color = colour(uniqueGenres.get(catName))
        category.innerHTML = `<a class="legend-number">${figure}</a> ${catName} films and series watched`
        statsDiv.appendChild(category)

        statsDiv.addEventListener('click', function () {
            this.style.display = 'none'

            d3.selectAll(`[class*="circles"]`)
                .call(update => update.transition()
                    .duration(tDuration)
                    .style("opacity", 1)
                )
        })

        tippy(statsDiv, {
            inertia: true,
            animateFill: true,
            followCursor: true,
        })

        let closeLegend = d3.selectAll('#legend-stats')
            .append('span')
            .attr('class', 'close material-icons')
            .html('cancel')
    }


}

function buildDataObject(rawData) {
    // this function get the raw data parsed and returns a data object
    // this includes x and y position for the phillotax diagram

    let builtData = rawData.map((item, i) => {
        const theta = Math.PI * (3 - Math.sqrt(5))
        const spacing = (5 + (i * 0.0015)) * Math.sqrt(i += 0.5);
        const a = theta * i;
        const x = width / 2 + spacing * Math.cos(a);
        const y = height / 2 + spacing * Math.sin(a);
        const parsedDate = new Date(item.date)

        let obj = {
            id: Math.floor(i),
            title: item.title,
            chapter: item.chapter,
            date: parsedDate,
            type: item.type,
            overview: item.overview,
            poster: item.poster,
            genre: item.genre[0],
            language: item.language,
            x: x,
            y: y
        }
        return obj
    })
    return builtData
}

function cardBuilder(event, d) {
    // function to build the modal with the films and series information

    let window = document.querySelector('#modal')
    let bg = document.querySelector('.modal-bg')

    bg.classList.add('bg-active')

    let card = document.createElement('div')
    card.setAttribute('id', 'card' + '-' + d.id)
    card.setAttribute('class', 'modal-content')
    window.appendChild(card)

    let imageDiv = document.createElement('div')
    imageDiv.className = 'image-div'
    card.appendChild(imageDiv)

    let contentDiv = document.createElement('div')
    contentDiv.className = 'content-div'
    card.appendChild(contentDiv)

    let xClose = document.createElement('span')
    xClose.innerHTML = 'cancel'
    xClose.setAttribute('class', 'close material-icons')
    card.appendChild(xClose)
    xClose.addEventListener('click', function () {
        window.innerHTML = ''
        bg.classList.remove('bg-active')
    })

    let filmTitle = document.createElement('h1')
    filmTitle.innerHTML = d.title
    filmTitle.setAttribute('class', 'film-title')
    contentDiv.appendChild(filmTitle)

    let episode = document.createElement('h2');
    episode.innerHTML = d.chapter
    episode.setAttribute('class', 'film-episode')
    contentDiv.appendChild(episode);

    let filmOverview = document.createElement('p');
    filmOverview.setAttribute('class', 'film-overview')
    filmOverview.innerHTML = d.overview
    contentDiv.appendChild(filmOverview);

    let poster = document.createElement('img');
    poster.setAttribute("src", d.poster);
    poster.setAttribute('class', 'poster')
    imageDiv.appendChild(poster);
}