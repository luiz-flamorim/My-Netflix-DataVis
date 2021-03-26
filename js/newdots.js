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

    let m = Array.from({
        length: d.length
    }, (_, i) => {
        const radius = step * Math.sqrt(i += 0.5),
            a = theta * i;
        return [
            width / 2 + radius * Math.cos(a),
            height / 2 + radius * Math.sin(a)
        ];
    })

    console.log(m)

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
        .data(m)
        .join("circle")
        .datum(([x, y], i) => [x, y, i])
        .attr("cx", ([x]) => x)
        .attr("cy", ([, y]) => y)
        .attr("r", radius)
        .attr("fill", ([, , i]) => d3.interpolateRainbow(i / 360))
        .on("mousedown", mousedowned)
        .append("title")
        .text((d, i) => `circle ${i}`)


    svg.call(d3.zoom()
        .extent([
            [0, 0],
            [width, height]
        ])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));

    function mousedowned(event, [, , i]) {
        d3.select(this).transition()
            .attr("fill", "black")
            .attr("r", radius * 2)
            .transition()
            .attr("fill", d3.interpolateRainbow(i / 360))
            .attr("r", radius)

    }

    function zoomed({
        transform
    }) {
        g.attr("transform", transform);
    }
    return svg.node();
}


//
// d3.json('js/results.json')
//     .then(data => {
//         console.log(data)
//     })

// createChart()

// function createChart() {

//     const height = 600
//     const width = 1000
//     const radius = 6
//     const step = radius * 2
//     const theta = Math.PI * (3 - Math.sqrt(5))

//     const data = Array.from({
//         length: 1000
//     }, (_, i) => {
//         const radius = step * Math.sqrt(i += 0.5),
//             a = theta * i;
//         return [
//             width / 2 + radius * Math.cos(a),
//             height / 2 + radius * Math.sin(a)
//         ];
//     })


//     const svg = d3.select('#dots')
//         .attr("viewBox", [0, 0, width, height]);

//     const g = svg.append("g")
//         .attr("class", "circles");

//     g.append("style").text(`
//     .circles {
//         stroke: transparent;
//         stroke-width: 1.5px;
//     }
//     .circles circle:hover {
//         stroke: black;
//     }
//     `);

//     g.selectAll("circle")
//         .data(data)
//         .join("circle")
//         .datum(([x, y], i) => [x, y, i])
//         .attr("cx", ([x]) => x)
//         .attr("cy", ([, y]) => y)
//         .attr("r", radius)
//         .attr("fill", ([, , i]) => d3.interpolateRainbow(i / 360))
//         .on("mousedown", mousedowned)
//         .append("title")
//         .text((d, i) => `circle ${i}`);

//     svg.call(d3.zoom()
//         .extent([
//             [0, 0],
//             [width, height]
//         ])
//         .scaleExtent([1, 8])
//         .on("zoom", zoomed));

//         function mousedowned(event, [, , i]) {
//             d3.select(this).transition()
//                 .attr("fill", "black")
//                 .attr("r", radius * 2)
//                 .transition()
//                 .attr("fill", d3.interpolateRainbow(i / 360))
//                 .attr("r", radius);
//         }

//         function zoomed({
//             transform
//         }) {
//             g.attr("transform", transform);
//         }
//     return svg.node();
// }