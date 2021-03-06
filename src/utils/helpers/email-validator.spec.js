const EmailValidator = require('./email.validator')
const MissingParamError = require('../errors/missing-param-error')
const validator = require('validator')

const makeSut = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  test('should return true if validator return true', () => {
    const sut = makeSut()
    const isEmailValid = sut.isValid('valid_email@gmail.com')
    expect(isEmailValid).toBe(true)
  })

  test('should return false if validator return false', () => {
    validator.isEmailValid = false
    const sut = makeSut()
    const isEmailValid = sut.isValid('invalid_email@gmail.com')
    expect(isEmailValid).toBe(false)
  })

  test('should call validator with correct email', () => {
    const sut = makeSut()
    sut.isValid('any_email@gmail.com')
    expect(validator.email).toBe('any_email@gmail.com')
  })

  test('should throw if no email is provided', async () => {
    const sut = makeSut()
    expect(() => { sut.isValid() }).toThrow(new MissingParamError('email'))
  })
})
