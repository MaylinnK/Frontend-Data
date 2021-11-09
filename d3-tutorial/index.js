const margin = { top: 40, bottom: 10, left: 120, right: 20 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Creates sources <svg> element
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

// Group used to enforce margin
const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Global variable for all data
let data;

// Scales setup
const xscale = d3.scaleLinear().range([0, width]);
const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.1);

// Axis setup
const xaxis = d3.axisTop().scale(xscale);
const g_xaxis = g.append("g").attr("class", "x axis");
const yaxis = d3.axisLeft().scale(yscale);
const g_yaxis = g.append("g").attr("class", "y axis");

/////////////////////////

d3.json("https://pokeapi.co/api/v2/berry/").then((json) => {
  data = json;

  getUrls([], [], data.results);
});

function getUrls(berries, urls, data) {
  // Haalt alle berries op bij nummer.
  berries = Object.keys(data);
  // console.log(data)
  // Haalt per berry de url naar detail pagina op.
  berries.map(function (berry) {
    urls.push(data[berry].url);
  });
  // Geeft urls mee aan getBerryData en roept hem aan.
  update(urls);
}

function update(new_data) {
  let array = [];
  //update the scales
  new_data.map(function (url) {
    array.push(
      d3.json(url).then((json) => {
        data = json;
        return data;
      })
    );
  });
  Promise.all(array).then((allData) => {
    data = allData
    loadData(allData);
  });
}

function loadData(berries) {
  // console.log(data[1].size)
  xscale.domain([0, d3.max(berries, (d) => d.size)]);
  yscale.domain(berries.map((d) => d.name));
  //render the axis
  g_xaxis.transition().call(xaxis);
  g_yaxis.transition().call(yaxis);

  // Render the chart with new data

  // DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
  const rect = g
    .selectAll("rect")
    .data(berries, (d) => d.name)
    .join(
      // ENTER
      // new elements
      (enter) => {
        const rect_enter = enter.append("rect").attr("x", 0);
        rect_enter.append("title");
        return rect_enter;
      },
      // UPDATE
      // update existing elements
      (update) => update,
      // EXIT
      // elements that aren't associated with data
      (exit) => exit.remove()
    );

  // ENTER + UPDATE
  // both old and new elements
  rect
    .transition()
    .attr("height", yscale.bandwidth())
    .attr("width", (d) => xscale(d.size))
    .attr("y", (d) => yscale(d.name));

  rect.select("title").text((d) => d.name);

  //interactivity
  d3.select("#filter-us-only").on("change", function () {
    // This will be triggered when the user selects or unselects the checkbox
    const checked = d3.select(this).property("checked");
    if (checked === true) {
      // Checkbox was just checked

      // Keep only data element whose country is US
      const filtered_data = berries.filter((d) => d.size > 80);

      loadData(filtered_data); // Update the chart with the filtered data
    } else {
      // Checkbox was just unchecked
      loadData(data); // Update the chart with all the data we have
    }
  });
}