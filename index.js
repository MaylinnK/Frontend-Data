function getData() {
  // Fetch Pokemon berries dataset
  fetch("https://pokeapi.co/api/v2/berry/")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      getUrls([], [], data.results);
    });
}

getData();

function getUrls(berries, urls, data) {
  // Haalt alle berries op bij nummer.
  berries = Object.keys(data);
  // Haalt per berry de url naar detail pagina op.
  berries.map(function (berry) {
    urls.push(data[berry].url);
  });
  // Geeft urls mee aan getBerryData en roept hem aan.
  getBerryData(urls);
}

// Loopt door de detail pagina urls en haalt de data per url op.
function getBerryData(urls) {
  let berryData = [];
  urls.map(function (url) {
    berryData.push(
      fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          // Haalt de name en firmness op uit de urls.
          let berryDataLoop = {
            name: data.name,
            firmness: data.firmness.name,
          };
          const flavors = data.flavors;
          // Loopt door de verschillende flavors en pakt de flavor met de hoogste potency eruit.
          for (let i = 0; i < flavors.length; i++) {
            const potency = Math.max(
              flavors[0].potency,
              flavors[1].potency,
              flavors[2].potency,
              flavors[3].potency,
              flavors[4].potency
            );
            // Neemt de hoogste potency en voegt de bijpassende flavour aan de array toe.
            if (potency == flavors[i].potency) {
              berryDataLoop.flavour = flavors[i].flavor.name;
            }
          }
          // Geeft de berryDataLoop mee
          return berryDataLoop;
        })
    );
  });
  // Wacht tot de fetch resultaten in de array zijn gepushed en geeft vervolgens berryData mee aan showData()
  Promise.all(berryData).then((data) => {
    showData(data);
  });
}

// Loopt door alle berries, maakt per berry een nieuwe article aan met de data en insert deze in het section-element.
function showData(berryData) {
  berryData.map((berry) => {
    let newArticle = document.createElement("article");
    let addData = document.createTextNode(
      berry.name + "\n" + berry.firmness + "\n" + berry.flavour
    );
    newArticle.appendChild(addData);
    let currentArticle = document.getElementById("test");
    document.querySelector("section").insertBefore(newArticle, currentArticle);
  });
}
 // Bron: https://www.w3schools.com/jsref/met_node_insertbefore.asp