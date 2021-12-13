// TO DO
// mousetip - tippy

const height = window.innerHeight
const width = window.innerWidth
const radius = 4
const step = radius * 2
const theta = Math.PI * (3 - Math.sqrt(5))

d3.json('js/results.json')
    .then(data => {
        createChart(data)
    })

function createChart(rawData) {

    let dataObject = rawData.map((item, i) => {
        const radius = step * Math.sqrt(i += 0.5);
        const a = theta * i;
        const x = width / 2 + radius * Math.cos(a);
        const y = height / 2 + radius * Math.sin(a);
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

    let colour = d3.scaleSequential()
        .domain([0, uniqueGenres.size])
        .interpolator(d3.interpolateViridis)

    // round diagram
    let allCircles = g.selectAll("circle")
        .data(dataObject, d => d.id)
        .join("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", 0)
        .attr("fill", d => colour(uniqueGenres.get(d.genre)))
        .attr('data-tippy-content', (d, i) => {
            return d.title
        })
        .on("click", cardBuilder)
        .on('mouseover', function () {
            allCircles.transition()
                .duration(100)
                .attr("opacity", 0.5)
            d3.select(this)
                .transition()
                .duration(100)
                .style("cursor", "pointer")
                .attr("opacity", 1)
                .attr("r", radius * 2)
        })
        .on('mouseout', function () {
            allCircles.transition()
                .duration(100)
                .attr("opacity", 1)
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", radius)
        })

    allCircles.transition()
        .delay((d, i) => i)
        .duration(350)
        .attr("r", radius)
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

}


// functions

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