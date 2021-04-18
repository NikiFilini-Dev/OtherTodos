import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import Input from "../../Input"
import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"

const Errors = observer(({ errors }: { errors: Iterable<string> }) => {
  const arr = [...errors]
  return (
    <div className={styles.errors}>
      {arr.map((error, i) => (
        <div className={styles.error} key={i}>
          {error}
        </div>
      ))}
    </div>
  )
})

const Auth = observer(() => {
  const { setUser, setScreen } = useMst()
  const [loginForm] = React.useState(new LoginForm())
  const [registerForm] = React.useState(new RegisterForm())

  const afterLoggingIn = user => {
    setUser(user)
    setScreen("TODAY")
  }

  const logIn = () => {
    loginForm.logIn(u => afterLoggingIn(u))
  }

  const register = () => {
    registerForm.register(u => afterLoggingIn(u))
  }

  return (
    <div className={styles.screen}>
      <div className={styles.info}>
        <span className={styles.title}>Вход/Регистрация</span>
      </div>
      <div className={styles.content}>
        <div className={styles.part}>
          <Errors errors={loginForm.errors.processing} />
          <Input
            name={"email"}
            placeholder={"Email"}
            onChange={e => loginForm.setEmail(e.target.value)}
            value={loginForm.email}
            className={styles.input}
            onSubmit={() => logIn()}
          />
          <Errors errors={loginForm.errors.email} />

          <Input
            name={"password"}
            placeholder={"Пароль"}
            onChange={e => loginForm.setPassword(e.target.value)}
            value={loginForm.password}
            type={"password"}
            className={styles.input}
            onSubmit={() => logIn()}
          />
          <Errors errors={loginForm.errors.password} />

          <button className={styles.button} onClick={() => logIn()}>
            Войти
          </button>
        </div>
        <div className={styles.part}>
          <Errors errors={registerForm.errors.processing} />

          <Input
            name={"email"}
            placeholder={"Email"}
            onChange={e => registerForm.setEmail(e.target.value)}
            value={registerForm.email}
            className={styles.input}
            onSubmit={() => register()}
          />
          <Errors errors={registerForm.errors.email} />

          <Input
            name={"password"}
            placeholder={"Пароль"}
            onChange={e => registerForm.setPassword(e.target.value)}
            value={registerForm.password}
            type={"password"}
            className={styles.input}
            onSubmit={() => register()}
          />
          <Errors errors={registerForm.errors.password} />

          <Input
            name={"password_confirm"}
            placeholder={"Подтверждение пароля"}
            onChange={e => registerForm.setPasswordConfirmation(e.target.value)}
            value={registerForm.passwordConfirmation}
            type={"password"}
            className={styles.input}
            onSubmit={() => register()}
          />
          <Errors errors={registerForm.errors.passwordConfirmation} />

          <Input
            name={"name"}
            placeholder={"Имя"}
            onChange={e => registerForm.setName(e.target.value)}
            value={registerForm.name}
            className={styles.input}
            onSubmit={() => register()}
          />
          <Errors errors={registerForm.errors.name} />

          <Input
            name={"lastname"}
            placeholder={"Фамилия"}
            onChange={e => registerForm.setLastName(e.target.value)}
            value={registerForm.lastName}
            className={styles.input}
            onSubmit={() => register()}
          />
          <Errors errors={registerForm.errors.lastName} />

          <button className={styles.button} onClick={() => register()}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  )
})

export default Auth
