import { makeAutoObservable } from "mobx"
import gqlClient from "../../../graphql/client"
import { GENERATE_TOKEN_MUTATION } from "../../../graphql/users"

export default class LoginForm {
  constructor() {
    makeAutoObservable(this)
  }

  email: string = ""
  password: string = ""

  errors: {
    email: Set<string>
    password: Set<string>
    processing: Set<string>
  } = {
    email: new Set(),
    password: new Set(),
    processing: new Set(),
  }

  async logIn(callback) {
    if (!this.emailCorrect || !this.passwordCorrect) return // TODO: Add popup
    const loginResult = await gqlClient
      .mutation(GENERATE_TOKEN_MUTATION, {
        email: this.email,
        password: this.password,
      })
      .toPromise()

    if (loginResult.error) {
      this.errors.processing.clear()
      loginResult.error.graphQLErrors.forEach(error =>
        this.errors.processing.add(error.message),
      )
      return
    }

    const user = {
      token: <string>loginResult.data.generateToken.token,
      id: <string>loginResult.data.generateToken.user.id,
      email: <string>loginResult.data.generateToken.user.email,
      name: <string>loginResult.data.generateToken.user.firstName,
      lastName: <string>loginResult.data.generateToken.user.lastName,
    }
    console.log(user)

    callback(user)
  }

  setEmail(val: string) {
    const re = /^[^\s@]+@[^\s@]+$/
    const isEmail = re.test(val)
    const err = "Неверный формат"

    if (isEmail) {
      this.errors.email.delete(err)
    } else {
      this.errors.email.add(err)
    }

    this.email = val
  }

  get emailCorrect() {
    return this.email.length > 0 && this.errors.email.size === 0
  }

  setPassword(val: string) {
    const err = "Пароль слишком короткий"
    if (val.length < 6) {
      this.errors.password.add(err)
    } else {
      this.errors.password.delete(err)
    }

    this.password = val
  }

  get passwordCorrect() {
    return this.password.length > 0 && this.errors.password.size === 0
  }
}
