const WIDTH = 100
const HEIGHT = 100
const DAY_WIDTH = 30
const WEEK_HEIGHT = 30

async function getData() {
    const csvData = await d3.csv("./Reddit Log 2019 - All.csv")
    const datemap = csvData.reduce((acc, curr) => {
        if (!acc.get(curr.date)) {
            acc.set(curr.date, [])
        }
        const start = d3.timeParse(curr.date + "T" + curr.start)
        const stop =  d3.timeParse(curr.date + "T" + curr.stop)
        acc.get(curr.date).push({start, stop})
        return acc
    }, new Map())

    const datearr = []
    datemap.forEach((v, k) => {
        datearr.push({date: k, times: v})
    })
    return datearr
}

function drawSVG(data) {
    console.log(data)

    FIRST_DAY = moment(data[0].date, "YYYY-MM-DD").startOf("week")
    LAST_DAY = moment(data[data.length - 1].date, "YYYY-MM-DD").endOf("week")

    console.log(FIRST_DAY, LAST_DAY)

    const svg = d3.select("#container")
        .append("svg")
        .attr("viewBox", [0, 0, WIDTH, HEIGHT])
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

    const days = svg.selectAll("g")
        .data(data)
        .join("g")
            .attr("fill", "black")
            .attr("x", d => DAY_WIDTH + 0.5)
            .attr("y", d => WEEK_HEIGHT + 0.5)



}

getData().then(drawSVG)
