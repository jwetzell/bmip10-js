const { PNG } = require("pngjs");
const {Encoder, Decoder} = require('./')

const fs = require("node:fs");

const pngFile = fs.readFileSync("raw.png");

const pngData = PNG.sync.read(pngFile);


const sampleBits = pngData.depth
const codeBits = sampleBits - 2

const encoders = {
    red: new Encoder(sampleBits,codeBits),
    green: new Encoder(sampleBits,codeBits),
    blue: new Encoder(sampleBits,codeBits)
}

const decoders = {
    red: new Decoder(sampleBits, codeBits),
    green: new Decoder(sampleBits, codeBits),
    blue: new Decoder(sampleBits, codeBits)
}

for (var y = 0; y < pngData.height; y++) {
  for (var x = 0; x < pngData.width; x++) {
    var idx = (pngData.width * y + x) << 2;

    // invert color
    const rawRed = pngData.data[idx] 
    const rawGreen = pngData.data[idx + 1]
    const rawBlue = pngData.data[idx + 2]

    pngData.data[idx] = decoders.red.decode(encoders.red.encode(rawRed))
    pngData.data[idx+1] = decoders.green.decode(encoders.green.encode(rawGreen))
    pngData.data[idx+2] = decoders.blue.decode(encoders.blue.encode(rawBlue))

  }
}

const out = PNG.sync.write(pngData)
fs.writeFileSync('./out.png', out)
