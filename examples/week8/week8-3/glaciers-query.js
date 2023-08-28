
function query(data) {
  console.log(data)

  let centroids = data.features.map(d3.geoCentroid),
    bounds = data.features.map(d3.geoBounds),
    areas = data.features.map(d3.geoArea);

  console.log(centroids, bounds, areas)
}

d3.json("https://raw.githubusercontent.com/krisrs1128/stat679_code/main/examples/week7/week7-3/glaciers.geojson")
  .then(query)
