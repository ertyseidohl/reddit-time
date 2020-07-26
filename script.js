const DAY_WIDTH = 100
const DAY_HEIGHT = 100
const DAY_PADDING_X = 5
const DAY_PADDING_Y = 15
const OFFSET_Y = 30
const OFFSET_X = DAY_WIDTH

// This may be a bit incorrect during leap years
// But all my data is in 2019 so /shrug
const MIN_PER_DAY = 1440

moment.tz.add("America/New_York|EST EDT EWT EPT|50 40 40 40|01010101010101010101010101010101010101010101010102301010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-261t0 1nX0 11B0 1nX0 11B0 1qL0 1a10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 RB0 8x40 iv0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 s10 1Vz0 LB0 1BX0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|21e6")

async function getData() {
    const csvData = await d3.csv("./Reddit Log 2019 - All.csv")

    return csvData.map(d => {
        const date = moment.tz(d.date + "T00:00", "YYYY-MM-DDTHH:mm", "America/New_York")
        const start = moment.tz(d.date + "T" + d.start, "YYYY-MM-DDTHH:mm", "America/New_York")
        const stop =  moment.tz(d.date + "T" + d.stop, "YYYY-MM-DDTHH:mm", "America/New_York")
        return {date, start, stop}
    })
}

function indexToX(i) {
    return (i % 7) * (DAY_WIDTH + DAY_PADDING_X) + OFFSET_X
}

function indexToY(i) {
    return ((i / 7) | 0) * (DAY_HEIGHT + DAY_PADDING_Y)
}

function getSlabHeight(d) {
    const startMins = ((d.start.hour() * 60) + d.start.minute())
    const endMins = ((d.stop.hour() * 60) + d.stop.minute())

    if (endMins < startMins) {
        console.log(d.date.format("YYYY-MM-DD"))
    }

    return ((endMins - startMins) / MIN_PER_DAY) * DAY_HEIGHT
}

function getSlabX(d, firstDay) {
    return (d.date.diff(firstDay, "days") % 7) * (DAY_WIDTH + DAY_PADDING_X) + OFFSET_X
}

function getSlabY(d, firstDay) {
    const dayOffset = ((d.date.diff(firstDay, "days") / 7) | 0) * (DAY_HEIGHT + DAY_PADDING_Y)
    const timePercentage = ((d.start.hour() * 60) + d.start.minute()) / MIN_PER_DAY
    return dayOffset + (timePercentage * DAY_HEIGHT)
}

function getDayLabel(day) {
    return moment.tz(day, "YYYY-MM-DD", "America/New_York").format("MMM Do")
}

function drawSVG(data) {
    FIRST_DAY = moment.tz(data[0].date, "YYYY-MM-DD", "America/New_York").startOf("week")
    LAST_DAY = moment.tz(data[data.length - 1].date, "YYYY-MM-DD", "America/New_York").endOf("week")

    all_days = []
    curr_day = FIRST_DAY.clone()
    while (curr_day.isBefore(LAST_DAY)) {
        all_days.push(curr_day.format("YYYY-MM-DD"))
        curr_day.add(1, "day")
    }

    const svg = d3.select("#container")
        .append("svg")
        .attr("width", DAY_WIDTH * 9)
        .attr("height", (DAY_HEIGHT + DAY_PADDING_Y) * (all_days.length / 7))
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const dayBoxes = svg.selectAll("rect.day")
        .data(all_days)
            .join("rect")
            .attr("class", "day")
            .attr("width", DAY_WIDTH)
            .attr("height", DAY_HEIGHT)
            .attr("x", (_, i) => indexToX(i))
            .attr("y", (_, i) => indexToY(i) + OFFSET_Y)
            .attr("fill", (_, i) => i < 2 ? "#ccc" : "#eee")

    const dayLabels = svg.selectAll("text.daytext")
        .data(all_days)
            .join("text")
            .attr("class", "daytext")
            .text(d => getDayLabel(d))
            .attr("x", (_, i) => indexToX(i))
            .attr("y", (_, i) => indexToY(i) + OFFSET_Y - 2)

    const timeSlabs = svg.selectAll("rect.time")
        .data(data)
            .join("rect")
            .attr("class", "time")
            .attr("width", DAY_WIDTH)
            .attr("height", d => getSlabHeight(d))
            .attr("x", d => getSlabX(d, FIRST_DAY))
            .attr("y", d => getSlabY(d, FIRST_DAY) + OFFSET_Y)
}

getData().then(drawSVG)
