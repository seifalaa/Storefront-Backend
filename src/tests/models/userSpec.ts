import { User, UsersModel } from '../../models/users'

const userModel = new UsersModel()

const testUser: User = {
  first_name: 'seif',
  last_name: 'alaa',
  password: '123456',
}

let user: User
describe('Users Model', () => {
  it('should have a create method', () => {
    expect(userModel.create).toBeDefined()
  })
  it('create method should return the user object once created', async () => {
    user = await userModel.create(testUser)
    const { id, ...userData } = user
    expect({ ...userData }).toEqual({ ...testUser })
  })
  it('should have an index method', () => {
    expect(userModel.index).toBeDefined()
  })
  it('index method should return a list of users', async () => {
    const results = await userModel.index()
    expect(results).toContain(user)
  })
  it('should have a show method', () => {
    expect(userModel.create).toBeDefined()
  })
  it('show method should return a user if the given id exist', async () => {
    const existingUser = await userModel.show(Number(user.id))
    const { id, ...userData } = existingUser
    expect({ ...userData }).toEqual({ ...testUser })
  })
  it("show method should throw an error if the given id doesn't exist", async () => {
    const existingUser = await userModel.show(5)
    expect(existingUser).toThrowError
  })
  it('should have a getUserByFullName method', () => {
    expect(userModel.getUserByFullName).toBeDefined()
  })
  it('show method should return a user if the given full name exists', async () => {
    const existingUser = await userModel.getUserByFullName(
      testUser.first_name,
      testUser.last_name
    )
    const { id, ...userData } = existingUser
    expect({ ...userData }).toEqual({ ...testUser })
  })
  it("show method should throw an error if the given full name doesn't exist", async () => {
    const existingUser = await userModel.getUserByFullName('john', 'doe')
    expect(existingUser).toThrowError
  })
})