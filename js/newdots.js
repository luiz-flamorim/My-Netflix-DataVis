// TO DO
// size of the overall circle chart(phyllotax) to vary: if the user has more films, the bubbles needs to be smaller.
// legend: centre and make it responsive - viewbox is not working because the width/ height of the div is different from window.inner...
// what happens when the user click on a film that doens't have information? address this with a different pop up (?)
// grid diagram: reposition
// put some legend about the size of the bubbles - size = date
// zoom - fix it
// phillotaxix to bar chart

const h = 1000
const w = 1000
const m = {
    top: 30,
    bottom: 30,
    left: 30,
    right: 30,
}

const width = w - (m.left + m.right)
const height = h - (m.top + m.bottom)

let chartContainer = d3.select('#diagram-container')
    .style('width', '1000px')
    .style('height', '1000px')

const radius = 4
const step = radius * 2
const theta = Math.PI * (3 - Math.sqrt(5))

d3.json('js/results.json')
    .then(data => {
        createChart(data)
    })

function createChart(rawData) {

    let dataObject = rawData.map((item, i) => {
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

    let maxX = d3.max(dataObject.map(d => d.x))
    let maxY = d3.max(dataObject.map(d => d.y))


    // map for the unique years
    let allYears = d3.group(dataObject, d => d.date.getFullYear())
    let uniqueYears = Array.from(allYears.keys())

    // scale for years
    let scaleYears = d3.scaleLinear()
        .domain(uniqueYears)
        .range([2, 2.5]);

    // scaleBand - for the bar chart
    let yearBand = d3.scaleBand()
        .domain(uniqueYears)
        .range([m.top, height])
        .padding(0.2)

    // finding the year I watched more films
    let mostWatchedList = []
    for (const element of allYears) {
        mostWatchedList.push(element[1].length)
    }
    let theMostWatched = d3.max(mostWatchedList)

    // find a factor
    // think about a prime number
    // how to decide which factor to get?
    // let testArray = [5,6,7,8,9,10]
    // for(let i = 1; i <= theMostWatched; i++) {
    //     if(theMostWatched % i == 0) {
    //         console.log(i);
    //     }
    // }

    let gridRows = 6
    let gridLines = 74

    // making the x scale for the grid
    let yearScales = {};
    uniqueYears.forEach(year => {
        let gridXScale = d3.scaleBand()
            .domain(d3.range(gridLines))
            .range([m.left, width - m.right])

        let gridYScale = d3.scaleBand()
            .domain(d3.range(gridRows))
            .range([yearBand(year), yearBand(year) + yearBand.bandwidth()])


            // saves all the scales inside of the object
        yearScales[year] = {
            x: gridXScale,
            y: gridYScale
        }
    })

    // console.log(yearScales)


    // set the main SVG
    const svg = d3.select('#dots')
        .attr("viewBox", [0, 0, w, h]);

    // circles for the Phillotax
    let g = svg.append("g")
        .attr("class", "circles")
        .attr("transform", `translate(${m.left},${m.top})`)

    let yearContainer = svg.append("g")
        .attr("class", "yearContainer")
        .attr("transform", `translate(${m.left},${m.top})`)

    let yearAxis = yearContainer.append('g')
        .classed("yearAxis", true)
        .call(d3.axisLeft(yearBand))
        .style('opacity', 1)


    // Map for the unique genres: needs value and key for colour scale
    let uniqueGenres = new Map()
    let valueKey = 1
    dataObject.map(item => {
        if (!uniqueGenres.has(item.genre)) {
            uniqueGenres.set(item.genre, valueKey)
            valueKey++
        }
    })

    // Scale for the colours
    // interpolators: https://github.com/d3/d3-scale-chromatic
    let colour = d3.scaleSequential()
        .domain([0, uniqueGenres.size])
        .interpolator(d3.interpolateCool)

        update('bars')


    function update(chartType) {

        for(const year of allYears){
            let yearData = year[1]

            let xScale = yearScales[year[0]].x
            let yScale = yearScales[year[0]].y

            yearContainer.selectAll(`.circles-${year[0]}`)
                .data(yearData, d => d.id)
                .join(
                    enter => enter.append('circle')
                    .classed(`.circles-${year[0]}`, true)
                    .style('opacity', 1)
                    .attr('fill', d => colour(uniqueGenres.get(d.genre)))
                    // .transition()
                    // .ease(d3.easeCircle)
                    // .delay((d, i) => i * 2)
                    // .duration(750)
                    .attr("cx", (d,i) => chartType == "bars" ? xScale(Math.floor(i/gridRows)) : d.x)
                    .attr("cy", (d,i) => chartType == "bars" ? yScale(i%gridRows) : d.y)
                    
                    .attr('r', 4),
                    // update => update
                )


        }

    }

    // PHYLLOTAXIS DIARGRAM
    // let allCircles = g.selectAll("circle")
    //     .data(dataObject, d => d.id)
    //     .join("circle")
    //     .attr("cx", width / 2)
    //     .attr("cy", height / 2)
    //     .attr("r", 0)
    //     .attr("fill", 'black')
    //     .attr('data-tippy-content', (d, i) => {
    //         return d.title
    //     })
    //     .on("click", cardBuilder)
    //     .on('mouseover', function () {
    //         allCircles.attr("opacity", 1).transition()
    //             .duration(750)
    //             .attr("opacity", 0.2)
    //         d3.select(this)
    //             .transition()
    //             .duration(750)
    //             .style("cursor", "pointer")
    //             .attr("opacity", 1)
    //             .attr("r", d => scaleYears(d.date.getFullYear()) * 2)
    //     })
    //     .on('mouseout', function () {
    //         allCircles.transition()
    //             .duration(750)
    //             .attr("opacity", 1)
    //         d3.select(this)
    //             .transition()
    //             .duration(100)
    //             .attr("r", d => scaleYears(d.date.getFullYear()))
    //     })

    // allCircles.attr("opacity", 1)
    //     .transition()
    //     .ease(d3.easeCircle)
    //     .delay((d, i) => i * 2)
    //     .duration(750)
    //     .attr("fill", d => colour(uniqueGenres.get(d.genre)))
    //     // the fill can vary with the index as well
    //     // .attr("fill", (d, i) => d3.hsl((step * Math.sqrt(i += 0.5)) % 50, 10, 255))
    //     .attr("r", d => scaleYears(d.date.getFullYear()))
    //     // .attr("cx", d => d.x)
    //     // .attr("cy", d => d.y)
    //     .attr("cx", d => {
    //         // let thisYear = d.date.getFullYear()
    //         // yearScales[thisYear].x(allYears[thisYear])
    //     })
    //     .attr("cy", d => d.y)

    // // console.log(allYears)

    // tippy(allCircles.nodes(), {
    //     inertia: true,
    //     animateFill: true,
    //     offset: [0, 20]
    // })

    // svg.call(d3.zoom()
    //     .extent([
    //         [0, 0],
    //         [width, height]
    //     ])
    //     .scaleExtent([1, 8])
    //     .on("zoom", zoomed));

    // function zoomed({
    //     transform
    // }) {
    //     g.attr("transform", transform);
    // }







    // Legend
    // ref: https://bl.ocks.org/jkeohan/b8a3a9510036e40d3a4e

    const legendC = svg.append('g')
        .attr('class', 'legend')


    let dataL = 0;
    let offset = 40;

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
                .duration(750)
                .attr("opacity", 0.2)

            legendText.attr("opacity", 1)
                .transition()
                .duration(750)
                .attr("opacity", y => y[0] == clicked ? 1 : 0.2)

            d3.select(this)
                .transition()
                .duration(750)
                .style("cursor", "pointer")
                .attr("opacity", 1)
                .attr("r", d => 8)
        })
        .on('mouseout', function () {
            legendCircle.transition()
                .duration(750)
                .attr("opacity", 1)

            legendText.transition()
                .duration(750)
                .attr("opacity", 1)

            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", d => 5)
        })
        .on('click', function (d, i) {

            let clicked = d3.select(this)
                .data()[0][0]

            legendClick(clicked)

            allCircles.attr("opacity", 1)
                .transition()
                .duration(1000)
                .attr("opacity", y => y.genre == clicked ? 1 : 0.2)
        })

    function legendClick(catName) {
        let statsDiv = document.querySelector('#stats')
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
            allCircles.attr("opacity", 1)
                .transition()
                .duration(1000)
                .attr("opacity", 1)
        })

        tippy(statsDiv, {
            inertia: true,
            animateFill: true,
            followCursor: true,
        })
    }
}














function cardBuilder(event, d) {

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