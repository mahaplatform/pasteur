class Pasteur {

  callbacks = {}
  debug = null
  services = null
  window = null
  target = null

  _handleRecieve = this._handleRecieve.bind(this)
  _handleRecieveRequest = this._handleRecieveRequest.bind(this)
  _handleRecieveResponse = this._handleRecieveResponse.bind(this)
  _handleSendResponse = this._handleSendResponse.bind(this)

  constructor(config) {
    this.debug = config.debug || false
    this.window = config.window
    this.target = config.target
    this.name = config.name
    this.targetName = config.targetName || this.name
    this.services = config.services || {}
    this.window.addEventListener('message', this._handleRecieve, false)
  }

  addService(name, service) {
    this.services[name] = service
  }

  close() {
    this.window.removeEventListener('message', this._handleRecieve, false)
  }

  send(service, action, data, success, failure) {
    const id = this._getId()
    this.callbacks[id] = {
      success,
      failure
    }
    const message = {
      target: this.targetName,
      id,
      service,
      action,
      data
    }
    if(debug) console.log(`${this.name}: sending request to ${this.targetName}`, message)
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
    if(debug) console.log(`${this.name}: received from ${this.targetName}`, message)
    if(this.callbacks[message.id]) return this._handleRecieveResponse(message)
    this._handleRecieveRequest(message)
  }

  _handleRecieveRequest(message) {
    try {
      const service = this.services[message.service]
      if(!service) throw new Error(`service ${message.service} unknown`)
      const action = service[message.action]
      if(!action) throw new Error(`action ${message.action} unknown`)
      const response = action()
      this._handleSendResponse(message.service, message.action, message.id, response)
    } catch(e) {
      this._handleSendResponse(message.service, message.action, message.id, null, e.toString())
    }
  }

  _handleRecieveResponse(message) {
    if(!this.callbacks[message.id]) return
    if(message.error) this._handleFailure(message)
    if(message.data) this._handleSuccess(message)
    delete this.callbacks[message.id]
  }

  _handleSendResponse(service, action, id, data, error) {
    const message = {
      target: this.targetName,
      id,
      service,
      action,
      data,
      error
    }
    if(debug) console.log(`${this.name}: sending response to ${this.targetName}`, message)
    this.target.postMessage(message, '*')
  }

  _handleSuccess(message) {
    const { success } = this.callbacks[message.id]
    if(success) success(message.data)
  }

}

export default Pasteur
