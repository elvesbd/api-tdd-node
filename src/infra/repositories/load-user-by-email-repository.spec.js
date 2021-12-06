const { MongoClient } = require('mongodb')
let client, db

class LoadUserByEmailRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async load (email) {
    const user = await this.userModel.findOne({ email })
    return user
  }
}

const makeSut = () => {
  const userModel = db.collection('users')
  const sut = new LoadUserByEmailRepository(userModel)
  return {
    userModel,
    sut
  }
}

describe('LoadUserByEmail Repository', () => {
  beforeAll(async () => {
    client = await MongoClient.connect(process.env.MONGO_URL)
    db = client.db()
  })
  // limpa a collection users antes de cada teste
  beforeEach(async () => {
    await db.collection('users').deleteMany()
  })
  // fecha a conexão com db após cada teste
  afterAll(async () => {
    await client.close()
  })

  test('should return null if no user is found', async () => {
    const { sut } = makeSut()

    const user = await sut.load('invalid_email@gmail.com')
    expect(user).toBeNull()
  })

  test('should return an user is found', async () => {
    const { sut, userModel } = makeSut()
    await userModel.insertOne({
      email: 'valid_email@gmail.com'
    })

    const user = await sut.load('valid_email@gmail.com')
    expect(user.email).toBe('valid_email@gmail.com')
  })
})
