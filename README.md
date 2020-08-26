# parallel-transformx

Parallel transform for [streamx](https://github.com/mafintosh/streamx)

```
npm install parallel-transformx
```

## Usage

``` js
const ParallelTransform = require('parallel-transformx')

const s = new ParallelTransform({
  // will run the transform in parallel.
  // at max highWaterMark parallel transforms will happen
  transform (data, cb) {
    doStuff(data, function (err, res) {
      cb(err, res)
    })
  }
})
```

## License

MIT
