// TO DO
// size of the overall circle chart(phyllotax) to vary: if the user has more films, the bubbles needs to be smaller.
// legend: centre and make it responsive - viewbox is not working because the width/ height of the div is different from window.inner...
// what happens when the user click on a film that doens't have information? address this with a different pop up (?)
// grid diagram: reposition

const height = window.innerHeight * 0.8
const width = window.innerWidth
const radius = 4
const step = radius * 2
const theta = Math.PI * (3 - Math.sqrt(5))
let mapRadius = new Map()

d3.json('js/results.json')
    .then(data => {
        createChart(data)
    })

function createChart(rawData) {

    console.log(rawData)
    let dataObject = rawData.map((item, i) => {
        const r = (step + (i * 0.001)) * Math.sqrt(i += 0.5);
        const a = theta * i;
        const x = width / 2 + r * Math.cos(a);
        const y = height / 2 + r * Math.sin(a);
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
        if (!mapRadius.has(r)) {
            mapRadius.set(r)
        }
        return obj
    })

    const svg = d3.select('#dots')
        .attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g")
        .attr("class", "circles");

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

    // map for the unique years
    let allYears = d3.group(dataObject, d => d.date.getFullYear())
    let uniqueYears = Array.from(allYears.keys())

    // scale for years
    let scaleYears = d3.scaleLinear()
        .domain(uniqueYears)
        .range([3, 3.5]);

    // PHYLLOTAXIS DIARGRAM
    let allCircles = g.selectAll("circle")
        .data(dataObject, d => d.id)
        .join("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", 0)
        .attr("fill", 'black')
        .attr('data-tippy-content', (d, i) => {
            return d.title
        })
        .on("click", cardBuilder)
        .on('mouseover', function () {
            allCircles.attr("opacity", 1).transition()
                .duration(750)
                .attr("opacity", 0.2)
            d3.select(this)
                .transition()
                .duration(750)
                .style("cursor", "pointer")
                .attr("opacity", 1)
                .attr("r", d => scaleYears(d.date.getFullYear()) * 2)
        })
        .on('mouseout', function () {
            allCircles.transition()
                .duration(750)
                .attr("opacity", 1)
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", d => scaleYears(d.date.getFullYear()))
        })

    allCircles.attr("opacity", 1)
        .transition()
        .ease(d3.easeCircle)
        .delay((d, i) => i * 2)
        .duration(750)
        .attr("fill", d => colour(uniqueGenres.get(d.genre)))
        // the fill can vary with the index as well
        // .attr("fill", (d, i) => d3.hsl((step * Math.sqrt(i += 0.5)) % 50, 10, 255))
        .attr("r", d => scaleYears(d.date.getFullYear()))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)

    tippy(allCircles.nodes(), {
        inertia: true,
        animateFill: true,
        offset: [0, 20]
    })

    svg.call(d3.zoom()
        .extent([
            [0, 0],
            [width, height]
        ])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));

    function zoomed({
        transform
    }) {
        g.attr("transform", transform);
    }


    // Legend
    // ref: https://bl.ocks.org/jkeohan/b8a3a9510036e40d3a4e

    const legendC = d3.select('#legend')
        .append('g')
        .attr('class', 'legend')

    let dataL = 0;
    let offset = 50;

    let legend = legendC.selectAll('.legend')
        .data(uniqueGenres)
        .enter().append('g')
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            if (i === 0) {
                dataL = (d[0].length * 6) + offset
                return "translate(0,5)"
            } else {
                let newdataL = dataL
                dataL += (d[0].length * 6) + offset
                return "translate(" + (newdataL) + ",5)"
            }
        })

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
    }
}











// graph the Years from here

// let uniqueYears = new Set(m.map(d => d.date.getFullYear()))
// uniqueYears = Array.from(uniqueYears)

// let yearScale = d3.scaleBand()
//     .domain(uniqueYears)
//     .range([height, 0])

// let yearContainer = svg.append('g')
//     .attr('transform', `translate(0, 0)`)

// let yearAxis = yearContainer.append('g')
//     .call(d3.axisLeft(yearScale))
//     // .classed('yearAxis', 'true')
//     .attr('class', 'yearAxis')




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