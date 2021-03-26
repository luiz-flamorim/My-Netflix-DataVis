buildDots()

function buildDots() {

    const phi = (1 + Math.sqrt(5)) / 2
    const pi = Math.PI
    const size = 300
    const max = size * 2 ** .5

    let distance = 10
    let radius = 2
    let increment = 2

    const svg = d3.select('#dots')
        .attr('width', size * phi)
        .attr('height', size)

    svg.append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .style('fill', '#eeeeef')

    const cx = (size * phi) / 2;
    const cy = size / 2;
    let dots = [
        svg.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', radius)
    ]

    let iDistance = distance;
    let iIncrement = increment;

    while (iDistance < max) {
        let c = 2 * pi * iDistance;
        let step = c / iIncrement;

        svg.append('circle')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', iDistance)
            .style('fill', 'none')
            .style('stroke', '#000')
            .style('stroke-width', radius * 2)
            .style('stroke-dasharray', `0 ${step/3}`)
            .style('stroke-linecap', 'round')

        iDistance += distance
        iIncrement += increment
    }
    return dots;
}