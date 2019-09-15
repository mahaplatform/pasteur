class Pasteur {

  callbacks = {}
  services = null
  window = null
  target = null

  _handleRecieve = this._handleRecieve.bind(this)
  _handleRecieveRequest = this._handleRecieveRequest.bind(this)
  _handleRecieveResponse = this._handleRecieveResponse.bind(this)
  _handleSendResponse = this._handleSendResponse.bind(this)

  constructor(config) {
    this.window = config.window
    this.target = config.target
    this.targetName = config.targetName
    this.name = config.name
    this.services = config.services
    this.window.addEventListener('message', this._handleRecieve, false)
  }

  send(service, action, data, success, failure) {
    const id = this._getId()
    this.callbacks[id] = {
      success,
      failure
    }
    this.target.postMessage({
      target: this.targetName,
      id,
      service,
      action,
      data
    }, '*')
  }

  _getId() {
    const lower = Math.pow(36, 9)
    const upper = Math.pow(36, 10) - 1
    const random = lower + Math.floor(Math.random() * (upper - lower + 1))
    return random.toString(36)
  }

  _handleRecieve(e) {
    const message = e.data
    if(message.target !== this.name) return
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
    const { success, failure } = this.callbacks[message.id]
    if(message.error) failure(message.error)
    if(message.data) success(message.data)
    delete this.callbacks[message.id]
  }

  _handleSendResponse(service, action, id, data, error) {
    this.target.postMessage({
      target: this.targetName,
      id,
      service,
      action,
      data,
      error
    }, '*')
  }

}

export default Pasteur
