const glob = require('glob');
const fs = require('fs');

const wavs = glob.globSync(`./public/dolls/**/*.wav`);

wavs.forEach(wav => {
  const data = fs.readFileSync(wav);
  const out = xor2(data, Buffer.from("2c", 'hex'));
  fs.writeFileSync(wav + '.enc', out)
})

function xor2(hex1, hex2) {
  const buf1 = Buffer.from(hex1, 'hex');
  const buf2 = Buffer.from(hex2, 'hex');
  const bufResult = buf1.map((b, i) => b ^ buf2[i % buf2.length]);
  return bufResult;
}