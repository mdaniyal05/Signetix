import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import {
  useLoginUserMutation,
  type User,
} from "../../api/user/login-user-mutation"
import { useUserVerificationMutation } from "../../api/user/user-verification-mutation"
import { useAppContext } from "../../context/AppContext"
import { getStorageValue, setStorageValue } from "../../context/storage"
import { sanitizePhoneNumber } from "../../constants/Utils"
import styles from "./Auth.module.css"

const PHONE_REGEX = /^\+(?:[0-9] ?){6,14}[0-9]$/

const LoginPage = () => {
  const navigate = useNavigate()
  const { setPhoneNumber, setUser } = useAppContext()

  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [loginError, setLoginError] = useState("")
  const [checking, setChecking] = useState(true)

  const { mutate, isPending } = useLoginUserMutation()
  const { mutateAsync: verifyMutation } = useUserVerificationMutation()

  useEffect(() => {
    ;(async () => {
      const raw = getStorageValue("user")

      if (raw) {
        try {
          const parsed = JSON.parse(raw) as User
          const result = await verifyMutation({
            phoneNumber: parsed.phoneNumber,
          })

          if (result.isVerified) {
            setPhoneNumber(parsed.phoneNumber)
            setUser(parsed)
            navigate("/app/chats", { replace: true })
          } else {
            navigate(`/verify/${parsed.phoneNumber}`, { replace: true })
          }
        } catch {
          setChecking(false)
        }
      } else {
        setChecking(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validatePhone = (value: string) => {
    if (!value.trim()) return "Phone number is required"

    if (!PHONE_REGEX.test(value))
      return "Invalid phone number. Use format +491234567890"

    return ""
  }

  const validatePassword = (value: string) => {
    if (!value) return "Password is required"

    if (value.length < 8) return "Password must be at least 8 characters"

    return ""
  }

  const handleLogin = () => {
    setLoginError("")

    const pe = validatePhone(phone)
    const pw = validatePassword(password)

    setPhoneError(pe)
    setPasswordError(pw)

    if (pe || pw) return

    const sanitized = sanitizePhoneNumber(phone)

    mutate(
      { phoneNumber: sanitized, password },
      {
        onSuccess: async (data) => {
          setUser(data)
          setPhoneNumber(sanitized)
          setStorageValue("user", JSON.stringify(data))

          if (data.userAuthenticationRecord?.isVerified) {
            navigate("/app/chats", { replace: true })
          } else {
            navigate(`/verify/${phone}`)
          }
        },
        onError: () =>
          setLoginError("Login failed. Please check your credentials."),
      }
    )
  }

  const isInvalid = !phone || !password || !!phoneError || !!passwordError

  if (checking) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoPlaceholder}>S+</div>
        </div>
        <h1 className={styles.heading}>Login to Signetix</h1>

        <div className={styles.fieldGroup}>
          <input
            type="tel"
            className={`${styles.input} ${phoneError ? styles.inputError : ""}`}
            placeholder="+49123456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setPhoneError(validatePhone(phone))}
          />
          {phoneError && <p className={styles.errorText}>{phoneError}</p>}
        </div>

        <div className={styles.fieldGroup}>
          <div
            className={`${styles.passwordRow} ${passwordError ? styles.inputError : ""}`}
          >
            <input
              type={showPassword ? "text" : "password"}
              className={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordError(validatePassword(password))}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordError && <p className={styles.errorText}>{passwordError}</p>}
        </div>

        <div className={styles.forgotRow}>
          <Link to="/forgot-password" className={styles.linkText}>
            Forgot Password?
          </Link>
        </div>

        {loginError && <p className={styles.errorText}>{loginError}</p>}

        <button
          className={`${styles.btn} ${isInvalid || isPending ? styles.btnDisabled : ""}`}
          onClick={handleLogin}
          disabled={isInvalid || isPending}
        >
          {isPending ? "Logging in…" : "Login"}
        </button>

        <p className={styles.switchText}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className={styles.linkText}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
