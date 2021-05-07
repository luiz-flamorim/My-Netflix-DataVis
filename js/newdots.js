const height = window.innerHeight
const width = window.innerWidth
const radius = 4
const step = radius * 2
const theta = Math.PI * (3 - Math.sqrt(5))

d3.json('js/results.json')
    .then(data => {
        createChart(data, width, height, radius, step, theta)
    })

function createChart(d, width, height, radius, step, theta) {

    let m = d.map((item, i) => {
        const radius = step * Math.sqrt(i += 0.5);
        const a = theta * i;
        const x = width / 2 + radius * Math.cos(a);
        const y = height / 2 + radius * Math.sin(a);

        let obj = {
            id: Math.floor(i),
            title: item.title,
            chapter: item.chapter,
            date: item.date,
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

        const l = svg.append("l")
        .attr("class", "legend");


    let colourRange = ([
        '#E7442E',
        '#ff8e80',
        '#e61b00',
        '#8f1100',
        '#3e0300'
    ])

    let uniqueGenres = new Set(m.map(d => d.genre))
    // console.log(uniqueGenres)

    let br = document.createElement("br")

    let colour = d3.scaleOrdinal()
        .domain(uniqueGenres)
        .range(colourRange)

    l.selectAll('dots')
        .data(uniqueGenres)
        .enter()
        .append("circle")
        .attr("cx", 100)
        .attr("cy", function (d, i) {
            return 100 + i * 25
        })
        .attr("r", 7)
        .style("fill", d => colour(d.genre))

    l.selectAll("mylabels")
        .data(uniqueGenres)
        .enter()
        .append("text")
        .attr("x", 120)
        .attr("y", function (d, i) {
            return 100 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", d => colour(d.genre))
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")


    g.selectAll("circle")
        .data(m, d => d.id)
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", radius)
        .attr("fill", d => colour(d.genre))
        .on("mousedown", mousedowned)
        .on("click", cardBuilder)
        .append("title")
        .text(d => `${d.title}: watched on ${d.date}`)

    svg.call(d3.zoom()
        .extent([
            [0, 0],
            [width, height]
        ])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));

    function mousedowned(event, d) {
        d3.select(this).transition()
            .attr("fill", "white")
            .attr("r", radius * 3)
            .transition()
            .attr("fill", d => colour(d.genre))
            .attr("r", radius)
    }

    function zoomed({
        transform
    }) {
        g.attr("transform", transform);
    }
    return svg.node();
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