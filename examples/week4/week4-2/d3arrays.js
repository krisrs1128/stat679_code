
// create a sequence
let ix = d3.range(25)
console.log(ix)

// generate random normals
let generator = d3.randomNormal()
let z = ix.map(generator)
console.log(z)

// some operations
console.log(d3.mean(z))
console.log(d3.max(z))
