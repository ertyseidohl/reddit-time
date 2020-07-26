const DAY_WIDTH = 30
const DAY_HEIGHT = 30
const DAY_PADDING_X = 5
const DAY_PADDING_Y = 5

moment.tz.add("America/New_York|EST EDT EWT EPT|50 40 40 40|01010101010101010101010101010101010101010101010102301010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-261t0 1nX0 11B0 1nX0 11B0 1qL0 1a10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 RB0 8x40 iv0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 s10 1Vz0 LB0 1BX0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|21e6")

async function getData() {
    const csvData = await d3.csv("./Reddit Log 2019 - All.csv")
    const datemap = csvData.reduce((acc, curr) => {
        if (!acc.get(curr.date)) {
            acc.set(curr.date, [])
        }
        const start = moment.tz(curr.date + "T" + curr.start, "YYYY-MM-DDTHH:mm", "America/New_York")
        const stop =  moment.tz(curr.date + "T" + curr.stop, "YYYY-MM-DDTHH:mm", "America/New_York")
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
    FIRST_DAY = moment.tz(data[0].date, "YYYY-MM-DD", "America/New_York").startOf("week")
    LAST_DAY = moment.tz(data[data.length - 1].date, "YYYY-MM-DD", "America/New_York").endOf("week")

    all_weeks = []
    curr_day = FIRST_DAY.clone()
    while (curr_day.isBefore(LAST_DAY)) {
        current_week = []
        for(let i = 0; i < 7; i++) {
            current_week.push(curr_day.format("YYYY-MM-DD"))
            curr_day.add(1, "day")
        }
        all_weeks.push(current_week)
    }

    const svg = d3.select("#container")
        .append("svg")
        .attr("width", DAY_WIDTH * 9)
        .attr("height", DAY_HEIGHT * all_weeks.length)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

    const weeks = svg.selectAll("g")
        .data(all_weeks)
        .join("g")
            .attr("class", "week")
            .attr("transform", (_, i) => "translate(" + DAY_WIDTH + "," + ((DAY_HEIGHT + DAY_PADDING_Y) * i) + ")")
            .selectAll("rect.day")
                .data(d => d)
                .join('rect')
                    .attr("class", "day")
                    .attr("fill", "#eee")
                    .attr("x", (_, i) => (DAY_WIDTH + DAY_PADDING_X) * i)
                    .attr("y", 0)
                    .attr("width", DAY_WIDTH)
                    .attr("height", DAY_HEIGHT)
                    .selectAll("rect.time")
                        .data(d => data[d])
                        .join("rect")
                            .attr("class", "time")
                            .attr("fill", "green")
                            .attr("x", )


}

getData().then(drawSVG)
