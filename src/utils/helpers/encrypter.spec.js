const bcrypt = require('bcrypt')

class Encrypter {
  async compare (value, hash) {
    const isValid = await bcrypt.compare(value, hash)
    return isValid
  }
}

describe('Encrypter', () => {
  test('should return true if bcrypt returns true', async () => {
    const sut = new Encrypter()
    const isValid = await sut.compare('any_value', 'any_hash')
    expect(isValid).toBe(true)
  })

  test('should return false if bcrypt returns false', async () => {
    const sut = new Encrypter()
    bcrypt.isValid = false
    const isValid = await sut.compare('any_value', 'any_hash')
    expect(isValid).toBe(false)
  })
})
