const { Transform } = require('streamx')
const FIFO = require('fast-fifo/fixed-size')

// internals lifted from streamx

module.exports = class ParallelTransform extends Transform {
  constructor (opts = {}) {
    super(opts)
    this._queue = new FIFO(opts.highWaterMark || 16)
    this._pending = null
    this._concurrent = 0
    this._finalizing = false
  }

  _write (data, cb) {
    if (this._readableState.buffered >= this._readableState.highWaterMark) {
      this._transformState.data = data
    } else {
      this._transformMany(data, this._transformState.afterTransform)
    }
  }

  _read (cb) {
    if (this._transformState.data !== null) {
      const data = this._transformState.data
      this._transformState.data = null
      cb(null)
      this._transformMany(data, this._transformState.afterTransform)
    } else {
      cb(null)
    }
  }

  _transform (data, cb) {
    cb(null, data)
  }

  _flush (cb) {
    this._finalizing = true
    if (this._concurrent === 0) cb(null)
    else this._pending = cb
  }

  _final (cb) {
    this._transformState.afterFinal = cb
    this._flush(transformAfterFlush.bind(this))
  }

  _drain () {
    if (this._queue.buffer[this._queue.btm] === null) return
    const data = this._queue.shift()
    this.push(data)
    if (this._pending) {
      if (this._finalizing && this._concurrent) return
      const cb = this._pending
      this._pending = null
      cb(null)
    }
  }

  _transformMany (data, cb) {
    const top = this._queue.top
    this._queue.push(null)

    if (this._queue.top === this._queue.btm) this._pending = cb
    else cb(null)

    this._concurrent++
    this._transform(data, (err, res) => {
      this._concurrent--
      if (err) this.destroy(err)
      else this._queue.buffer[top] = res
      this._drain()
    })
  }
}

function transformAfterFlush (err, data) {
  const cb = this._transformState.afterFinal
  if (err) return cb(err)
  if (data !== null && data !== undefined) this.push(data)
  this.push(null)
  cb(null)
}
