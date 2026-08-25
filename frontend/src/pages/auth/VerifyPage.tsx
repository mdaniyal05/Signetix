/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useGetOtpMutation } from "../../api/user/get-otp-mutation"
import { useVerifyOtpMutation } from "../../api/user/verify-otp-mutation"
import { useUserVerificationQuery } from "../../api/user/user-verification-query"
import styles from "./Auth.module.css"

const CELL_COUNT = 6

const VerifyPage = () => {
  const { phone = "" } = useParams<{ phone: string }>()
  const navigate = useNavigate()

  const [code, setCode] = useState<string[]>(Array(CELL_COUNT).fill(""))
  const [timer, setTimer] = useState(30)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    data: verification,
    isPending,
    isLoading,
  } = useUserVerificationQuery({ phoneNumber: phone })

  const { mutate: getOtp } = useGetOtpMutation()
  const { mutate: verifyOtp } = useVerifyOtpMutation()

  const startTimer = () => {
    setTimer(30)

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }

        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (phone && verification?.isVerified === false) {
      getOtp(phone)
      startTimer()
    }

    if (verification?.isVerified) {
      navigate("/app/chats", { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, verification])

  const joinedCode = code.join("")

  useEffect(() => {
    if (joinedCode.length !== CELL_COUNT) return

    verifyOtp(
      { phoneNumber: phone, otpCode: joinedCode },
      {
        onSuccess: (data) => {
          if (data.valid || data.status === "success")
            navigate("/app/chats", { replace: true })
        },
        onError: (err) => alert("Invalid code. " + (err as Error).message),
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinedCode])

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...code]

    next[index] = digit

    setCode(next)

    if (digit && index < CELL_COUNT - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CELL_COUNT)

    if (pasted.length === CELL_COUNT) {
      setCode(pasted.split(""))
      inputRefs.current[CELL_COUNT - 1]?.focus()
    }
  }

  if (isPending || isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Verify Your Number</h1>
        <p className={styles.stepHint}>
          We sent a 6-digit code to <strong>{phone}</strong>.<br />
          Enter it below to verify your account.
        </p>

        <div className={styles.otpRow} onPaste={handlePaste}>
          {Array.from({ length: CELL_COUNT }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={styles.otpCell}
              value={code[i] ?? ""}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button
          className={`${styles.btn} ${timer > 0 ? styles.btnDisabled : ""}`}
          disabled={timer > 0}
          onClick={() => {
            getOtp(phone, {
              onSuccess: () => {
                alert("New code sent!")
                startTimer()
              },
              onError: () => alert("Failed to resend. Try again."),
            })
          }}
        >
          {timer > 0 ? `Resend in ${timer}s` : "Didn't receive a code? Resend"}
        </button>
      </div>
    </div>
  )
}

export default VerifyPage
