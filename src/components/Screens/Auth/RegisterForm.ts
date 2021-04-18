import { makeAutoObservable } from "mobx"
import gqlClient from "graphql/client"
import { CREATE_USER_MUTATION, GENERATE_TOKEN_MUTATION } from "graphql/users"

export default class RegisterForm {
  constructor() {
    makeAutoObservable(this)
  }

  email = ""
  password = ""
  passwordConfirmation = ""
  name = ""
  lastName = ""

  errors: {
    email: Set<string>
    password: Set<string>
    passwordConfirmation: Set<string>
    name: Set<string>
    lastName: Set<string>
    processing: Set<string>
  } = {
    email: new Set(),
    password: new Set(),
    passwordConfirmation: new Set(),
    name: new Set(),
    lastName: new Set(),
    processing: new Set(),
  }

  async register(
    callback: (token: {
      lastName: string
      name: string
      id: string
      email: string
      token: string
    }) => void,
  ) {
    if (
      !this.emailCorrect ||
      !this.passwordCorrect ||
      !this.nameCorrect ||
      !this.lastNameCorrect
    )
      return // TODO: Add popup

    const registerResult = await gqlClient
      .mutation(CREATE_USER_MUTATION, {
        email: this.email,
        password: this.password,
        name: this.name,
        lastName: this.lastName,
      })
      .toPromise()

    if (registerResult.error) {
      this.errors.processing.clear()
      registerResult.error.graphQLErrors.forEach(error =>
        this.errors.processing.add(error.message),
      )
      return
    }
    if (registerResult.data.createUser.id) {
      const loginResult = await gqlClient
        .mutation(GENERATE_TOKEN_MUTATION, {
          email: this.email,
          password: this.password,
        })
        .toPromise()

      const user = {
        token: <string>loginResult.data.generateToken.token,
        name: <string>registerResult.data.createUser.firstName,
        lastName: <string>registerResult.data.createUser.lastName,
        email: <string>registerResult.data.createUser.email,
        id: <string>registerResult.data.createUser.id,
      }
      callback(user)
    }
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

  setPasswordConfirmation(val: string) {
    const err = "Пароли не совпадают"
    if (this.password != val) {
      this.errors.passwordConfirmation.add(err)
    } else {
      this.errors.passwordConfirmation.delete(err)
    }

    this.passwordConfirmation = val
  }

  setName(val: string) {
    const err = "Имя должно быть указано"
    if (val.length === 0) {
      this.errors.name.add(err)
    } else {
      this.errors.name.delete(err)
    }

    this.name = val
  }

  get nameCorrect() {
    return this.name.length > 0 && this.errors.name.size === 0
  }

  setLastName(val: string) {
    const err = "Фамилия должна быть указана"
    if (val.length === 0) {
      this.errors.lastName.add(err)
    } else {
      this.errors.lastName.delete(err)
    }

    this.lastName = val
  }

  get lastNameCorrect() {
    return this.lastName.length > 0 && this.errors.lastName.size === 0
  }
}
