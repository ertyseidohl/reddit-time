document.getElementById("warning").style.display = "none";

const DAY_WIDTH = 100
const DAY_HEIGHT = 100
const DAY_PADDING_X = 5
const DAY_PADDING_Y = 15
const OFFSET_Y = 30
const OFFSET_X = DAY_WIDTH
const EXTRA_PADDING = 100

const MIN_PER_DAY = 1440

const SKIP_DAYS = {
    "2019": [2, 4],
    "2021": [4, 1],
    "2022": [6, 0],
    "2023": [0, 6],
    "2024": [1, 4],
}

moment.tz.add("America/New_York|EST EDT|50 40|010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|K70 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 s10 1Vz0 LB0 1BX0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|21e6")

async function getData() {
    const csvData_2019 = await d3.csv("./Reddit Log 2019.csv")

    const csvData_2021_2024 = await d3.csv("./Reddit Log 2021-2024.csv")

    const csvData = csvData_2019.concat(csvData_2021_2024)

    return csvData.map(d => {
        try {
            const date = moment.tz(d.date + "T00:00", "YYYY-MM-DDTHH:mm", "America/New_York")
            const start = moment.tz(d.date + "T" + d.start, "YYYY-MM-DDTHH:mm", "America/New_York")
            const stop =  moment.tz(d.date + "T" + d.stop, "YYYY-MM-DDTHH:mm", "America/New_York")

            if (isNaN(date.valueOf())) {
                console.log("Invalid date: " + d.date)
            }

            if (isNaN(parseInt(d.start[0]))) {
                // Not valid if we don't start with a number
                return {date: date, start: 0, stop: 0, isValid: false};
            }

            if (stop.isBefore(start)) {
                throw new Error(`Invalid time range on ${date.format('YYYY-MM-DD')}: ${d.start} to ${d.stop}`);
            }
            return {date, start, stop, isValid: true}
        } catch (err) {
            console.log(d, err)
        }
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

function drawSVG(data, year) {
    if (year == "2021") {
        FIRST_DAY = moment.tz(year + "-06-20", "YYYY-MM-DD", "America/New_York").startOf("week")
        document.getElementById("2021").style.display = "block";
    } else {
        FIRST_DAY = moment.tz(year + "-01-01", "YYYY-MM-DD", "America/New_York").startOf("week")
        document.getElementById("2021").style.display = "none";
    }

    LAST_DAY = moment.tz(year + "-12-31", "YYYY-MM-DD", "America/New_York").endOf("week")

    all_days = []
    curr_day = FIRST_DAY.clone()
    while (curr_day.isSameOrBefore(LAST_DAY)) {
        all_days.push(curr_day.format("YYYY-MM-DD"))
        curr_day.add(1, "day")
    }

    const invalid_days = new Set(data.filter(d => !d.isValid).map(d => d.date.format("YYYY-MM-DD")))

    const svg = d3.select("#container")
        .append("svg")
        .attr("width", DAY_WIDTH * 9)
        .attr("height", (DAY_HEIGHT + DAY_PADDING_Y) * (all_days.length / 7) + EXTRA_PADDING)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

    d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("rect.day")
        .data(all_days)
            .join("rect")
            .attr("class", "day")
            .attr("width", DAY_WIDTH)
            .attr("height", DAY_HEIGHT)
            .attr("x", (_, i) => indexToX(i))
            .attr("y", (_, i) => indexToY(i) + OFFSET_Y)
            .attr("fill", (_, i) => {
                if (invalid_days.has(all_days[i])) {
                    return "#ccc"
                }
                // SKIP_DAYS is [start of year, end of year]
                if (i < SKIP_DAYS[year][0] || all_days.length - i <= SKIP_DAYS[year][1]) {
                    return "#ccc"
                }
                return "#eee"
            })

    svg.selectAll("text.daytext")
        .data(all_days)
            .join("text")
            .attr("class", "daytext")
            .text(d => getDayLabel(d))
            .attr("x", (_, i) => indexToX(i))
            .attr("y", (_, i) => indexToY(i) + OFFSET_Y - 2)

    const dateFilter = d => {
        return (d.isValid &&
        d.date.year().toString() === year &&
        d.date.isBetween(FIRST_DAY, LAST_DAY))
    }

    svg.selectAll("rect.time")
        .data(data.filter(dateFilter))
            .join("rect")
            .attr("class", "time")
            .attr("width", DAY_WIDTH)
            .attr("height", d => getSlabHeight(d))
            .attr("x", d => getSlabX(d, FIRST_DAY))
            .attr("y", d => getSlabY(d, FIRST_DAY) + OFFSET_Y)

    const total_min = data
        .filter(dateFilter)
        .reduce((acc, d) => acc + d.stop.diff(d.start, 'minutes'), 0);
    const total_days = (total_min / MIN_PER_DAY).toFixed(1);
    const percent = ((total_min / (MIN_PER_DAY * 365)) * 100).toFixed(1);

    document.getElementById("stats-text").innerText = `In ${year}, I spent ${total_min.toLocaleString()} minutes consuming content on the internet, or ${total_days} days. That's ${percent}% of the year.`
}

function draw(year) {
    d3.select('#container svg').remove();
    getData().then(d => drawSVG(d, year));
}

draw("2019");

document.getElementById('selector').addEventListener('change', (event) => {
    draw(event.target.value);
});