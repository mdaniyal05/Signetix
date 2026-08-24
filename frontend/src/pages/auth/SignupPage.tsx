/* eslint-disable react-refresh/only-export-components */
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useCreateUserMutation } from "../../api/user/create-user-mutation"
import { useAppContext } from "../../context/AppContext"
import { setStorageValue } from "../../context/storage"
import { sanitizePhoneNumber } from "../../constants/Utils"
import styles from "./Auth.module.css"

const PHONE_REGEX = /^\+(?:[0-9] ?){6,14}[0-9]$/

export const validatePasswordStrength = (pwd: string): string => {
  const ok =
    /.{8,}/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[A-Z]/.test(pwd) &&
    /\d/.test(pwd) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(pwd)

  return ok
    ? ""
    : "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
}

export const validatePasswordsMatch = (pwd: string, repeat: string): string =>
  pwd !== repeat ? "Passwords do not match" : ""

const SignupPage = () => {
  const navigate = useNavigate()
  const { setPhoneNumber, setUser } = useAppContext()

  const [name, setName] = useState("")
  const [nameError, setNameError] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeat, setShowRepeat] = useState(false)
  const [touched, setTouched] = useState({
    phone: false,
    password: false,
    repeat: false,
  })

  const { mutate, isPending } = useCreateUserMutation()

  const validatePhone = (v: string) =>
    !PHONE_REGEX.test(v) ? "Invalid phone number. Use format +491234567890" : ""

  const handleSignup = () => {
    const pe = validatePhone(phone)
    const se = validatePasswordStrength(password)
    const me = validatePasswordsMatch(password, repeatPassword)
    const ne = name.length > 30 ? "Name must be at most 30 characters." : ""

    setPhoneError(pe)
    setPasswordError(se || me)
    setNameError(ne)

    if (pe || se || me || ne) return

    const sanitized = sanitizePhoneNumber(phone)
    mutate(
      { name, phoneNumber: sanitized, password },
      {
        onSuccess: async (data) => {
          setUser(data)
          setPhoneNumber(sanitized)
          setStorageValue("user", JSON.stringify(data))
          navigate(`/verify/${sanitized}`)
        },
        onError: (err) => alert("Signup failed: " + (err as Error).message),
      }
    )
  }

  const isFormValid =
    name &&
    phone &&
    password &&
    repeatPassword &&
    !nameError &&
    !validatePhone(phone) &&
    !validatePasswordStrength(password) &&
    !validatePasswordsMatch(password, repeatPassword)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoPlaceholder}>S+</div>
        </div>
        <h1 className={styles.heading}>Sign Up for Signetix</h1>

        {/* Name */}
        <div className={styles.fieldGroup}>
          <input
            className={`${styles.input} ${nameError ? styles.inputError : ""}`}
            placeholder="Name"
            value={name}
            maxLength={30}
            onChange={(e) => {
              setName(e.target.value)
              setNameError(
                e.target.value.length > 30
                  ? "Name must be at most 30 characters."
                  : ""
              )
            }}
          />
          {nameError && <p className={styles.errorText}>{nameError}</p>}
        </div>

        {/* Phone */}
        <div className={styles.fieldGroup}>
          <input
            type="tel"
            className={`${styles.input} ${touched.phone && phoneError ? styles.inputError : ""}`}
            placeholder="+49123456789"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (touched.phone) setPhoneError(validatePhone(e.target.value))
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, phone: true }))
              setPhoneError(validatePhone(phone))
            }}
          />
          {touched.phone && phoneError && (
            <p className={styles.errorText}>{phoneError}</p>
          )}
        </div>

        {/* Password */}
        <div className={styles.fieldGroup}>
          <div
            className={`${styles.passwordRow} ${touched.password && passwordError ? styles.inputError : ""}`}
          >
            <input
              type={showPassword ? "text" : "password"}
              className={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => {
                setTouched((t) => ({ ...t, password: true }))
                setPasswordError(
                  validatePasswordStrength(password) ||
                    validatePasswordsMatch(password, repeatPassword)
                )
              }}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((p) => !p)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Repeat Password */}
        <div className={styles.fieldGroup}>
          <div
            className={`${styles.passwordRow} ${touched.repeat && passwordError ? styles.inputError : ""}`}
          >
            <input
              type={showRepeat ? "text" : "password"}
              className={styles.passwordInput}
              placeholder="Repeat Password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              onBlur={() => {
                setTouched((t) => ({ ...t, repeat: true }))
                setPasswordError(
                  validatePasswordStrength(password) ||
                    validatePasswordsMatch(password, repeatPassword)
                )
              }}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowRepeat((p) => !p)}
            >
              {showRepeat ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {(touched.password || touched.repeat) && passwordError && (
            <p className={styles.errorText}>{passwordError}</p>
          )}
        </div>

        <button
          className={`${styles.btn} ${!isFormValid || isPending ? styles.btnDisabled : ""}`}
          onClick={handleSignup}
          disabled={!isFormValid || isPending}
        >
          {isPending ? "Creating account…" : "Sign Up"}
        </button>

        <p className={styles.switchText}>
          Already have an account?{" "}
          <Link to="/" className={styles.linkText}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
