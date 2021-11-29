module.exports = class InvalidParamError extends Error {
  constructor (paramName) {
    super(`Invalid parameter: ${paramName}`)
    this.name = 'InvalidParamError'
  }
}
