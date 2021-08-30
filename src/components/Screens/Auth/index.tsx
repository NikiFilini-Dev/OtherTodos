import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import Input from "../../Input"
import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"
import Logo from "assets/logo.svg"

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
  const { setUser, setScreen, user } = useMst()
  const [loginForm] = React.useState(new LoginForm())
  const [registerForm] = React.useState(new RegisterForm())

  if (user?.id) setScreen("TODAY")

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

  const [currentForm, setCurrentForm] = React.useState<"login" | "register">(
    "login",
  )

  const RegistrationFormComponent = observer(() => {
    return (
      <React.Fragment>
        <div className={styles.title}>Регистрация</div>
        <Errors errors={registerForm.errors.processing} />

        <div className={styles.inputName}>Имя:</div>
        <Input
          name={"name"}
          placeholder={"Введите имя"}
          onChange={e => registerForm.setName(e.target.value)}
          value={registerForm.name}
          onSubmit={() => register()}
        />
        <Errors errors={registerForm.errors.name} />

        <div className={styles.inputName}>Фамилия:</div>
        <Input
          name={"lastname"}
          placeholder={"Введите фамилию"}
          onChange={e => registerForm.setLastName(e.target.value)}
          value={registerForm.lastName}
          onSubmit={() => register()}
        />
        <Errors errors={registerForm.errors.lastName} />

        <div className={styles.inputName}>E-mail:</div>
        <Input
          name={"email"}
          placeholder={"Введите e-mail"}
          onChange={e => registerForm.setEmail(e.target.value)}
          value={registerForm.email}
          onSubmit={() => register()}
        />
        <Errors errors={registerForm.errors.email} />

        <div className={styles.inputName}>Пароль:</div>
        <Input
          name={"password"}
          placeholder={"Введите пароль"}
          onChange={e => registerForm.setPassword(e.target.value)}
          value={registerForm.password}
          type={"password"}
          onSubmit={() => register()}
        />
        <Errors errors={registerForm.errors.password} />

        <div className={styles.inputName}>Подтверждение пароля:</div>
        <Input
          name={"password_confirm"}
          placeholder={"Повторите пароль"}
          onChange={e => registerForm.setPasswordConfirmation(e.target.value)}
          value={registerForm.passwordConfirmation}
          type={"password"}
          onSubmit={() => register()}
        />
        <Errors errors={registerForm.errors.passwordConfirmation} />

        <button className={styles.button} onClick={() => register()}>
          Зарегистрироваться
        </button>
      </React.Fragment>
    )
  })

  const LoginFormComponent = observer(() => {
    return (
      <React.Fragment>
        <div className={styles.title}>Вход по email</div>
        <Errors errors={loginForm.errors.processing} />
        <div className={styles.inputName}>E-mail:</div>
        <Input
          name={"email"}
          placeholder={"Введите email"}
          onChange={e => loginForm.setEmail(e.target.value)}
          value={loginForm.email}
          onSubmit={() => logIn()}
        />
        <Errors errors={loginForm.errors.email} />

        <div className={styles.inputName}>Пароль:</div>
        <Input
          name={"password"}
          placeholder={"Введите пароль"}
          onChange={e => loginForm.setPassword(e.target.value)}
          value={loginForm.password}
          type={"password"}
          onSubmit={() => logIn()}
        />
        <Errors errors={loginForm.errors.password} />

        <button className={styles.button} onClick={() => logIn()}>
          Вход
        </button>
      </React.Fragment>
    )
  })

  return (
    <div className={styles.screen}>
      <div className={styles.bluePart}>
        <div className={styles.logo}>
          <Logo /> Task
        </div>
        <div className={styles.text}>
          Доброе утро!
          <br />С возвращением
        </div>
        {currentForm === "login" && (
          <div
            className={styles.switch}
            onClick={() => setCurrentForm("register")}
          >
            У меня еще нет аккаунта
          </div>
        )}
        {currentForm === "register" && (
          <div
            className={styles.switch}
            onClick={() => setCurrentForm("login")}
          >
            У меня уже есть аккаунт
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.form}>
          {currentForm === "login" && <LoginFormComponent />}
          {currentForm === "register" && <RegistrationFormComponent />}
        </div>
        <div className={styles.services}>Тут будет вход с помощью сервисов</div>
      </div>
    </div>
  )
})

export default Auth
