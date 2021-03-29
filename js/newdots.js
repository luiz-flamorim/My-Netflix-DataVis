const height = window.innerHeight
const width = window.innerWidth
const radius = 5
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


    let colourRange = (['#b9506eff',
        '#E7442E',
        '#111418',
        '#3747D2',
        '#1c2478ff',
        '#4c54a9ff',
        '#523883ff',
        '#342a51ff',
        '#1c3353',
        '#332327ff',
        '#80312aff',
        '#e7442eff',
        '#fff',
        '#643259'
    ])

    let uniqueGenres = new Set(m.map(d => d.genre))
    console.log(uniqueGenres)

    let br = document.createElement("br")

    let colour = d3.scaleOrdinal()
        .domain(uniqueGenres)
        .range(colourRange)

    g.selectAll("circle")
        .data(m, d => d.id)
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", radius)
        .attr("fill", d => colour(d.genre))
        .on("mousedown", mousedowned)
        .append("title")
        .text(d => d.title + ((d.chapter == "null") ? "" : " | " + d.chapter))

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


function cardBuilder(data) {

    // let card = 


    // let wrapper = document.createElement('div');
    // wrapper.setAttribute("class", "col-sm-3 col-md-4 col-lg-2 h-100");
    // wrapper.setAttribute("style", "card");
    // wrapper.setAttribute("id", id);
    // filmsContainer.appendChild(wrapper);

    // let filmPoster = document.createElement('img');
    // filmPoster.setAttribute("src", poster);
    // filmPoster.setAttribute("class", "card-img-top img-fluid");
    // filmPoster.addEventListener('click', (event) => {
    //     filmDetail(id, title, year, overview, poster);
    // })
    // wrapper.appendChild(filmPoster);

    // let cardInfo = document.createElement('div');
    // cardInfo.setAttribute("class", "card-body flex-column");
    // wrapper.appendChild(cardInfo);
}