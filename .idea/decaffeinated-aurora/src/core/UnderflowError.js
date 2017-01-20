// define an error class to be thrown if an underflow occurs
class UnderflowError extends Error {
  constructor () {
    super(...arguments)
    this.name = 'UnderflowError'
    this.stack = new Error().stack
  }
}

export default UnderflowError
