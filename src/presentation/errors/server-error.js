module.exports = class ServerError extends Error {
  constructor (param) {
    super('Internal Error')
    this.name = 'ServerError'
  }
}
