d3.json("https://pokeapi.co/api/v2/berry/").then((json) => {
  data = json;

  getUrls([], [], data.results);
});

function getUrls(berries, urls, data) {
  // Haalt alle berries op bij nummer.
  berries = Object.keys(data);
  // Haalt per berry de url naar detail pagina op.
  berries.map(function (berry) {
    urls.push(data[berry].url);
  });
  // Geeft urls mee aan getBerryData en roept hem aan.
  allData(urls);
}

function allData(new_data) {
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
    data = allData;
    addButton(data);
  });
}

// Voegt een label en button toe voor elke berry.
function addButton(data, buttons) {
  data.map((berry) => {
    const radioButton = document.createElement("input");
    radioButton.type = "radio";
    radioButton.name = "berry";
    radioButton.id = berry.id - 1;
    radioButton.value = berry.name;

    const label = document.createElement("label");
    label.htmlFor = berry.id - 1;

    const description = document.createTextNode(berry.name);
    label.appendChild(description);

    const img = document.createElement("img");
    img.src = "./afbeeldingen/" + berry.name + ".png";

    const svg = document.createElement("svg");

    const parent = document.querySelector("nav");
    parent.appendChild(radioButton);
    parent.appendChild(label);
    label.appendChild(img);
  });
  RadarChart.draw("#chart", data);
}

let RadarChart = {
  draw: function (id, d, options) {
    // Maakt een lijst van eigenschappen aan voor de chart om later gemakkelijk aanpassingen te maken.
    let cfg = {
      radius: 5,
      w: 250,
      h: 250,
      factor: 1,
      factorLegend: 0.85,
      levels: 4,
      maxValue: 20,
      radians: 2 * Math.PI,
      opacityArea: 0.3,
      ToRight: 5,
      TranslateX: 80,
      TranslateY: 30,
      ExtraWidthX: 165,
      ExtraWidthY: 70,
      color: d3.scaleOrdinal().range(["#87de16"]),
    };

    // Wat letiabelen voor de aankomende functies.
    allAxis = ["spicy", "dry", "sweet", "bitter", "sour"];
    let total = allAxis.length;
    let radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
    d3.select(id).select("svg").remove();

    let g = d3
      .select(id)
      .append("svg")
      .attr("width", cfg.w + cfg.ExtraWidthX)
      .attr("height", cfg.h + cfg.ExtraWidthY)
      .append("g")
      .attr(
        "transform",
        "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")"
      );
        
    // Maakt de vijfhoeken aan en positioneert ze in elkaar.
    for (let j = 0; j < cfg.levels; j++) {
      let levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
      g.selectAll(".levels")
        .data(allAxis)
        .enter()
        .append("svg:line")
        // maakt 1 voor 1 de lijnen van de zeshoeken aan.
        .attr("x1", function (d, i) {
          return (
            levelFactor * (1 - cfg.factor * Math.sin((i * cfg.radians) / total))
          );
        })
        .attr("y1", function (d, i) {
          return (
            levelFactor * (1 - cfg.factor * Math.cos((i * cfg.radians) / total))
          );
        })
        .attr("x2", function (d, i) {
          return (
            levelFactor *
            (1 - cfg.factor * Math.sin(((i + 1) * cfg.radians) / total))
          );
        })
        .attr("y2", function (d, i) {
          return (
            levelFactor *
            (1 - cfg.factor * Math.cos(((i + 1) * cfg.radians) / total))
          );
        })
        .attr("class", "line")
        .style("stroke", "#5f8e0c")
        .style("stroke-opacity", "0.7")
        .style("stroke-width", "1.5px")
        .attr(
          "transform",
          "translate(" +
            (cfg.w / 2 - levelFactor) +
            ", " +
            (cfg.h / 2 - levelFactor) +
            ")"
        );
    }
    series = 0;

    // Maakt groepen aan voor de axis lijnen
    let axis = g
      .selectAll(".axis")
      .data(allAxis)
      .enter()
      .append("g")
      .attr("class", "axis");

    //Maakt de axis lijnen aan.
    axis
      .append("line")
      .attr("x1", cfg.w / 2)
      .attr("y1", cfg.h / 2)
      .attr("x2", function (d, i) {
        return (
          (cfg.w / 2) * (1 - cfg.factor * Math.sin((i * cfg.radians) / total))
        );
      })
      .attr("y2", function (d, i) {
        return (
          (cfg.h / 2) * (1 - cfg.factor * Math.cos((i * cfg.radians) / total))
        );
      })
      .attr("class", "line")
      .style("stroke", "#5f8e0c")
      .style("stroke-width", "2px");

    // Voegt de labels toe aan de chart.
    axis
      .append("text")
      .attr("class", "legend")
      .text(function (d) {
        return d;
      })
      .style("font-family", "sans-serif")
      .style("font-size", "18px")
      .style("text-transform", "capitalize")
      .style("fill", "#5f8e0c")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("transform", function (d, i) {
        return "translate(0, -10)";
      })
      // Positioneert de labels op de hoeken.
      .attr("x", function (d, i) {
        return (
          (cfg.w / 2) *
            (1 - cfg.factorLegend * Math.sin((i * cfg.radians) / total)) -
          65 * Math.sin((i * cfg.radians) / total)
        );
      })
      .attr("y", function (d, i) {
        return (
          (cfg.h / 2) * (1 - Math.cos((i * cfg.radians) / total)) -
          25 * Math.cos((i * cfg.radians) / total)
        );
      });

    // Laadt alle data in de chart.
    function loadData(berry, tooltip) {
      // Delete huidige data in de chart.
      d3.selectAll(".poly").remove();
      // Haalt de id op van de geselecteerde radiobutton.
      berry = document.querySelector('input[type="radio"]:checked').id;
      dataValues = [];
      potencyData = [];
      potencyData.push(d[berry].flavors);
      // Loopt door de potencies heen en zet deze om naar coordinaten op de chart.
      potencyData.forEach(function (y, x) {
        g.selectAll(".nodes").data(y, (j, i) => {
          dataValues.push([
            (cfg.w / 2) *
              (1 -
                (parseFloat(Math.max(j.potency + 5, 0)) / cfg.maxValue) *
                  cfg.factor *
                  Math.sin((i * cfg.radians) / total)),
            (cfg.h / 2) *
              (1 -
                (parseFloat(Math.max(j.potency + 5, 0)) / cfg.maxValue) *
                  cfg.factor *
                  Math.cos((i * cfg.radians) / total)),
          ]);
        });
      });

      // Gebruikt de coordinaten om de radar op de chart te zetten.
      g.selectAll(".area")
        .data([dataValues])
        .join(function (enter) {
          return (
            enter
              .append("polygon")
              .attr("class", "radar-chart-serie" + series + " poly")
              .style("stroke-width", "1.5px")
              .style("stroke", cfg.color(series))
              .attr("points", function (d) {
                let str = "";
                for (let pti = 0; pti < d.length; pti++) {
                  str = str + d[pti] + "," + d[pti] + " ";
                }
                return str;
              })
              .style("fill", function (_, _) {
                return cfg.color(series);
              })
              .style("fill-opacity", cfg.opacityArea)

              // Animatie als je over de radar hovert.
              .on("mouseover", function (d) {
                z = "polygon." + d3.select(this).attr("class");
                g.selectAll("polygon")
                  .transition(200)
                  .style("fill-opacity", 0.1);
                g.selectAll(z).transition(200).style("fill-opacity", 0.7);
              })
              .on("mouseout", function () {
                g.selectAll("polygon")
                  .transition(200)
                  .style("fill-opacity", cfg.opacityArea);
              })
          );
        });

      series = 0;

      // Maakt cirkels aan per hoek om de potency te kunnen zien.
      tooltip = d3.select("body").append("div").attr("class", "toolTip");
      potencyData = [potencyData];
      // Haalt weer de potency data op en en zet deze om naar coordinaten.
      potencyData[0].forEach(function (y, x) {
        g.selectAll(".nodes")
          .data(y)
          .enter()
          .append("svg:circle")
          .attr("class", "radar-chart-serie" + series + " poly")
          .attr("r", cfg.radius)
          .attr("alt", function (j) {
            return Math.max(j.value, 0);
          })
          .attr("cx", function (j, i) {
            dataValues.push([
              (cfg.w / 2) *
                (1 -
                  (parseFloat(Math.max(j.potency + 5, 0)) / cfg.maxValue) *
                    cfg.factor *
                    Math.sin((i * cfg.radians) / total)),
              (cfg.h / 2) *
                (1 -
                  (parseFloat(Math.max(j.potency + 5, 0)) / cfg.maxValue) *
                    cfg.factor *
                    Math.cos((i * cfg.radians) / total)),
            ]);
            return (
              (cfg.w / 2) *
              (1 -
                (Math.max(j.potency + 5, 0) / cfg.maxValue) *
                  cfg.factor *
                  Math.sin((i * cfg.radians) / total))
            );
          })
          .attr("cy", function (j, i) {
            return (
              (cfg.h / 2) *
              (1 -
                (Math.max(j.potency + 5, 0) / cfg.maxValue) *
                  cfg.factor *
                  Math.cos((i * cfg.radians) / total))
            );
          })
          .style("fill", "#fff")
          .style("stroke-width", "1px")
          .style("stroke", cfg.color(series))
          .style("fill-opacity", 0)

          // Hover reactie om de tooltip te kunnen zien.
          .on("mouseover", function (event, j) {
            tooltip
              .style("left", event.pageX - 40 + "px")
              .style("top", event.pageY - 80 + "px")
              .style("display", "inline-block")
              .html("Potency" + "<br><span>" + j.potency + "</span>");
            g.style("fill-opacity", 1);
          })
          .on("mouseout", function (d) {
            tooltip.style("display", "none");
          });
        series++;
      });
    }

    // Laadt overige data in in de browser.
    function textData(berry) {
      berry = document.querySelector('input[type="radio"]:checked').id;
      document.querySelector("h1").innerHTML = d[berry].name;
      document.getElementById("firmness").innerHTML = d[berry].firmness.name;
      document.getElementById("growth").innerHTML = d[berry].growth_time;
      document.getElementById("harvest").innerHTML = d[berry].max_harvest;
      document.getElementById("size").innerHTML = d[berry].size;
      document.getElementById("smoothness").innerHTML = d[berry].smoothness;
      document.getElementById("dryness").innerHTML = d[berry].soil_dryness;
    }
    // Voegt event listeners toe aan de radiobuttons.
    const buttons = document.querySelectorAll("input");
    for (const button of buttons) {
      button.addEventListener("click", loadData);
      button.addEventListener("click", textData);
    }
  },
};
