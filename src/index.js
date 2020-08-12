class Pasteur {

  callbacks = {}
  debug = null
  handlers = []
  window = null
  target = null

  _handleRecieve = this._handleRecieve.bind(this)
  _handleRecieveRequest = this._handleRecieveRequest.bind(this)
  _handleRecieveResponse = this._handleRecieveResponse.bind(this)
  _handleSendResponse = this._handleSendResponse.bind(this)

  constructor(config) {
    this.debug = config.debug
    this.window = config.window
    this.target = config.target
    this.name = config.name
    this.targetName = config.targetName || this.name
    this.window.addEventListener('message', this._handleRecieve, false)
  }

  close() {
    this.window.removeEventListener('message', this._handleRecieve, false)
  }

  on(event, handler) {
    this.handlers.push({ event, handler})
  }

  send(event, data, success, failure) {
    const id = this._getId()
    this.callbacks[id] = {
      success,
      failure
    }
    const message = {
      target: this.targetName,
      id,
      event,
      data
    }
    if(this.debug) console.log(`${this.name}: sending request to ${this.targetName}`, message)
    this.target.postMessage(message, '*')
  }

  _getId() {
    const lower = Math.pow(36, 9)
    const upper = Math.pow(36, 10) - 1
    const random = lower + Math.floor(Math.random() * (upper - lower + 1))
    return random.toString(36)
  }

  async _handleFailure(message) {
    const { failure } = this.callbacks[message.id]
    if(failure) await failure(message.error)
  }

  async _handleRecieve(e) {
    const message = e.data
    if(message.target !== this.name) return
    if(this.debug) console.log(`${this.name}: received from ${this.targetName}`, message)
    if(this.callbacks[message.id]) return await this._handleRecieveResponse(message)
    await this._handleRecieveRequest(message)
  }

  async _handleRecieveRequest(message) {
    const { event, data } = message
    await Promise.mapSeries(this.handlers.filter(handler => {
      return handler.event === event
    }), async () => {
      try {
        const response = await handler.handler(data)
        this._handleSendResponse(event, message.id, response)
      } catch(e) {
        this._handleSendResponse(event, message.id, null, e.toString())
      }
    })
  }

  async _handleRecieveResponse(message) {
    if(!this.callbacks[message.id]) return
    if(message.error) await this._handleFailure(message)
    if(message.data) await this._handleSuccess(message)
    delete this.callbacks[message.id]
  }

  _handleSendResponse(event, id, data, error) {
    const message = {
      target: this.targetName,
      id,
      event,
      data,
      error
    }
    if(this.debug) console.log(`${this.name}: sending response to ${this.targetName}`, message)
    this.target.postMessage(message, '*')
  }

  async _handleSuccess(message) {
    const { success } = this.callbacks[message.id]
    if(success) await success(message.data)
  }

}

export default Pasteur
