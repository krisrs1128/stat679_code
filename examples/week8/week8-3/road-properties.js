
function queries(data) {
  console.log(data) // all roads
  console.log(data.features[0]) // first road
  console.log(d3.geoBounds(data.features[0])); // bounding box of first road
  console.log(d3.geoCentroid(data.features[0])); // centerpoint of first road
}

d3.json("https://raw.githubusercontent.com/krisrs1128/stat679_code/main/examples/week7/week7-3/brasilia.geojson")
  .then(queries)
