const { Encoder, Decoder } = require("./");

const encoder = new Encoder(10, 8);
const decoder = new Decoder(10, 8);

const rawData = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];

const encodedData = encoder.encode(rawData);
const decodedData = decoder.decode(encodedData);
console.log(encodedData);
console.log(decodedData);
