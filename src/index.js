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

  _handleFailure(message) {
    const { failure } = this.callbacks[message.id]
    if(failure) failure(message.error)
  }

  _handleRecieve(e) {
    const message = e.data
    if(message.target !== this.name) return
    if(this.debug) console.log(`${this.name}: received from ${this.targetName}`, message)
    if(this.callbacks[message.id]) return this._handleRecieveResponse(message)
    this._handleRecieveRequest(message)
  }

  _handleRecieveRequest(message) {
    const { event, data } = message
    this.handlers.filter(handler => {
      return handler.event === event
    }).map(handler => {
      try {
        const response = handler.handler(data)
        this._handleSendResponse(event, message.id, response)
      } catch(e) {
        this._handleSendResponse(event, message.id, null, e.toString())
      }
    })
  }

  _handleRecieveResponse(message) {
    if(!this.callbacks[message.id]) return
    if(message.error) this._handleFailure(message)
    if(message.data) this._handleSuccess(message)
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

  _handleSuccess(message) {
    const { success } = this.callbacks[message.id]
    if(success) success(message.data)
  }

}

export default Pasteur
