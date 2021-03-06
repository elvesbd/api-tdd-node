const request = require('supertest')

describe('Content-Type Middlewares', () => {
  let app

  beforeEach(() => {
    jest.resetModules()
    app = require('../config/app')
  })

  test('should return json content-type as default', async () => {
    app.get('/test_content_type', (req, res) => {
      res.send('')
    })

    await request(app)
      .get('/test_content_type')
      .expect('content-type', /json/)
  })

  test('should return xml content-type is forced', async () => {
    app.get('/test_content_type', (req, res) => {
      res.type('xml')
      res.send('')
    })

    await request(app)
      .get('/test_content_type')
      .expect('content-type', /xml/)
  })
})
