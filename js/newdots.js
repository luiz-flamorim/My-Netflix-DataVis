const height = window.innerHeight
const width = 1000
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

    g.append("style").text(`
    .circles {
        stroke: transparent;
        stroke-width: 1.5px;
    }
    .circles circle:hover {
        stroke: black;
    }
    `);

    g.selectAll("circle")
        .data(m, d => d.id)
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", radius)
        .attr("fill", (d, i) => d3.interpolateRainbow(i / 360))
        // .attr("fill", d => //define the scale of genres and pass to d.genre)
        .on("mousedown", mousedowned)
        .append("title")
        .text(d => `${d.title}`)

    svg.call(d3.zoom()
        .extent([
            [0, 0],
            [width, height]
        ])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));

    function mousedowned(event, d) {
        console.log(d)

        d3.select(this).transition()
            .attr("fill", "black")
            .attr("r", radius * 2)
            .transition()
            .attr("fill", d3.interpolateRainbow(d.id / 360))
            .attr("r", radius)
    }

    function zoomed({
        transform
    }) {
        g.attr("transform", transform);
    }
    return svg.node();
}