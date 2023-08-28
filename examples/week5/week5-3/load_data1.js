
d3.csv("gapminder.csv", d3.autoType)
  .then(data => console.log(data));
