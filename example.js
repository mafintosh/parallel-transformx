const P = require('./')

const s = new P({
  transform (data, cb) {
    setTimeout(function () {
      cb(null, data.toUpperCase())
    }, 1000)
  }
})

for (let i = 0; i < 100; i++) {
  s.write('hi ' + i)
}

s.on('data', console.log)
