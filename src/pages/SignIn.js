import { useState, useEffect, useCallback, useRef } from "react"
import useStore from "../store"
import { useUserStore } from "../store"
import { useParams, useNavigate } from "react-router-dom"
import phone from "phone"
import axios from "axios"
import { Haptics } from "@capacitor/haptics"
import Header from "../components/Header"
import InvalidIcon from "../components/icons/Invalid"
import Slash from "../components/icons/Slash"
import SadFace from "../components/icons/SadFace"
import Ripple from "../images/ripple.gif"
import SpinnerLight from "../images/spinner-light.gif"

const SignIn = () => {

    const params = useParams()
    const navigate = useNavigate()
    const signedIn = useUserStore(state => state.signedIn)
    const usersName = useUserStore(state => state.name)
    const updateUser = useUserStore(state => state.update)
    const setUserDataIsUpToDate = useStore(state => state.setUserDataIsUpToDate)
    const [ verification, setVerification ] = useState({
        status: "not-init",
        error: null,
        data: null
    })
    const [ verificationCode, setVerificationCode ] = useState("")
    const codeInputRef = useRef()
    const scrollableArea = useRef()
    
    const [ resendTimer, setResendTimer ] = useState(0)
    useEffect(() => {
        if (resendTimer){
            setTimeout(() => {
                if (window.location.pathname.startsWith("/signin/")){
                    setResendTimer(resendTimer-1)
                }
            }, 1000)
        }
    }, [resendTimer])
    
    const sendVerificationCode = useCallback(async () => {
        if (verification.status !== "not-init"){
            return
        }
        
        setVerification({
            status: "sending-code",
            error: null,
            data: null
        })
        
        const phoneNum = phone(params.phone, {country: "IN"})
        if (!phoneNum.isValid){
            await Haptics.notification({type: "ERROR"})
            return setVerification({
                status: "error",
                error: {
                    code: "invalid-phone-number",
                    message: "Invalid Phone Number",
                    verifying: false,
                    verificationError: null
                },
                data: null
            })
        }

        // send request
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/v1/send-signin-otp`, {
                phoneNumber: phoneNum.phoneNumber
            })
            if (res.status === 200 && res.data && res.data.otpId){
                setResendTimer(10)
                setVerification({
                    status: "otp-sent",
                    error: null,
                    data: {
                        otpId: res.data.otpId,
                        phoneNumber: phoneNum.phoneNumber.replace(phoneNum.countryCode, "")
                    }
                })
            }
            else {
                setVerification({
                    status: "error",
                    error: {
                        message: "Something went wrong, please try again.",
                        retry: () => {
                            setVerification({
                                status: "not-init",
                                error: null,
                                data: null
                            })
                            setVerificationCode("")
                            sendVerificationCode()
                        }
                    },
                    data: null
                })
            }
        }
        catch (err){
            if (err && err.response && err.response.data){
                if (err.response.data.code){
                    setVerification({
                        status: "error",
                        error: {
                            code: err.response.data.code,
                            message: err.response.data.message || "Something went wrong, please try again.",
                            verifying: false,
                            verificationError: null
                        },
                        data: null
                    })
                }
                else {
                    setVerification({
                        status: "error",
                        error: {
                            message: err.response.data.message || "Something went wrong, please try again.",
                            retry: () => {
                                setVerification({
                                    status: "not-init",
                                    error: null,
                                    data: null
                                })
                                setVerificationCode("")
                                sendVerificationCode()
                            }
                        },
                        data: null
                    })
                }
            }
            else {
                setVerification({
                    status: "error",
                    error: {
                        message: "Something went wrong, please try again.",
                        retry: () => {
                            setVerification({
                                status: "not-init",
                                error: null,
                                data: null
                            })
                            setVerificationCode("")
                            sendVerificationCode()
                        }
                    },
                    data: null
                })
            }
        }
    }, [params.phone, verification])

    const resendCode = () => {
        if (resendTimer > 0){
            return
        }
        setVerification({
            status: "not-init",
            error: null,
            data: null
        })
        setVerificationCode("")
        sendVerificationCode()
    }

    const onCodeInputChange = e => {
        const code = e.target.value
        
        if (code.length <= 4){
            setVerificationCode(code)
        }
    }

    const verifyCode = async e => {
        e.preventDefault()
        if (!verification.data || verification.data.verifying || verificationCode.length !== 4){
            return
        }
        
        setVerification({
            ...verification,
            data: {
                ...verification.data,
                verifying: true,
                verificationError: null
            }
        })

        // send request
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/v1/signin`, {
                otpId: verification.data.otpId,
                otp: verificationCode
            })
            if (res.status === 200 && res.data){
                setUserDataIsUpToDate(true)
                updateUser({
                    signedIn: "yes",
                    _id: res.data._id || "",
                    phoneNumber: res.data.phoneNumber || "",
                    countryCode: res.data.countryCode || "",
                    name: res.data.name || "",
                    profilePhoto: res.data.profilePhoto ? res.data.profilePhoto.url : "",
                    profilePhotoThumbnail: res.data.profilePhoto ? res.data.profilePhoto.thumbnail_url : "",
                    authToken: res.data.authToken || ""
                })
            }
            else {
                setVerification({
                    ...verification,
                    data: {
                        ...verification.data,
                        verifying: false,
                        verificationError: {
                            message: "Something went wrong, please try again."
                        }
                    }
                })
            }
        }
        catch (err){
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            if (err && err.status === 403){
                await Haptics.notification({type: "ERROR"})
                return setVerification({
                    ...verification,
                    data: {
                        ...verification.data,
                        verifying: false,
                        verificationError: {
                            message: (err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
                        }
                    }
                })
            }
            setVerification({
                ...verification,
                data: {
                    ...verification.data,
                    verifying: false,
                    verificationError: {
                        message: (err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
                    }
                }
            })
        }
    }
    
    useEffect(() => {
        if (signedIn === "yes"){
            if (!usersName){
                navigate("/edit-profile", {replace: true})
            }
            else {
                window.history.back()
            }
        }
        else {
            sendVerificationCode()
        }
    }, [sendVerificationCode, signedIn, usersName, navigate])

    useEffect(() => {
        if (verification.status === "otp-sent" && codeInputRef.current){
            codeInputRef.current.focus()
        }
    }, [verification])

    return (
        <div className={`
            page
            pt-[50px]
        `}>
            <Header heading="Sign In"/>
            <div className={`
                ${(verification.status === "sending-code" || verification.status === "error") ? "flex" : "block"}
                w-full
                h-full
                overflow-auto
                py-[30px]
            `} ref={scrollableArea}>
                {
                    verification.status === "sending-code" ?
                    <div className="
                        block
                        w-[94%]
                        max-w-[500px]
                        m-auto
                        pb-[50px]
                    ">
                        <img src={Ripple} alt="loading" className="
                            block
                            w-[80px]
                            2xs:w-[100px]
                            mx-auto
                            mb-[10px]
                        "/>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-center
                            text-[#111111]
                            text-[14px]
                            2xs:text-[16px]
                            leading-[20px]
                            2xs:leading-[23px]
                        ">Sending verification code, <br/>please wait...</div>
                    </div> : ""
                }
                {
                    (verification.status === "error" && verification.error) ?
                    <div className={`
                        block
                        w-[80%]
                        max-w-[500px]
                        m-auto
                        pt-[40px]
                        ${verification.error.retry ? "pb-[80px]" : "pb-[40px]"}
                        px-[20px]
                        relative
                        overflow-hidden
                        rounded-[15px]
                        border
                        border-solid
                        border-[#dddddd]
                        bg-[#ffffff]
                        shadow-xl
                    `}>
                        <div className="
                            block
                            w-[60px]
                            2xs:w-[80px]
                            mx-auto
                            mb-[15px]
                        ">
                            {
                                verification.error.code === "invalid-phone-number" ?
                                <InvalidIcon color="#bb0000"/> :
                                verification.error.code === "otp-temporarily-not-allowed" ?
                                <Slash color="#dd0000"/> :
                                <SadFace/>
                            }
                        </div>
                        <div className="
                            block
                            w-full
                            font-defaultBold
                            text-center
                            text-[#111111]
                            text-[16px]
                            2xs:text-[18px]
                            leading-[24px]
                            2xs:leading-[26px]
                        ">{verification.error.message}</div>
                        {
                            verification.error.retry ?
                            <button type="button" className="
                                block
                                w-full
                                h-[50px]
                                font-defaultBold
                                text-center
                                text-[#8a2be2]
                                text-[16px]
                                absolute
                                bottom-0
                                left-0
                                border-t
                                border-solid
                                border-[#dddddd]
                                bg-[#ffffff]
                                active:bg-[#eeeeee]
                            " onClick={verification.error.retry}>Retry</button> : ""
                        }
                    </div> : ""
                }
                {
                    (verification.status === "otp-sent" && verification.data) ?
                    <form autoComplete="off" onSubmit={verifyCode} className="
                        block
                        w-[94%]
                        max-w-[1000px]
                        mx-auto
                    ">
                        {
                            verification.data.verificationError ?
                            <div className="
                                block
                                w-full
                                p-[15px]
                                text-left
                                text-[14px]
                                2xs:text-[16px]
                                leading-[20px]
                                text-[#ffffff]
                                font-defaultRegular
                                bg-[#bb0000]
                                rounded-[6px]
                                mb-[20px]
                            ">{verification.data.verificationError.message}</div> : ""
                        }
                        <div className="
                            block
                            w-full
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[22px]
                            2xs:text-[24px]
                            leading-[30px]
                            2xs:leading-[32px]
                            mb-[6px]
                        ">Verify Phone Number</div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#555555]
                            text-[11px]
                            2xs:text-[12px]
                            leading-[18px]
                        ">We sent a 4-digit verification code to {verification.data.phoneNumber} via SMS.</div>
                        <div className="
                            block
                            w-full
                            h-[55px]
                            2xs:h-[60px]
                            overflow-hidden
                            relative
                            rounded-[6px]
                            bg-[#eeeeee]
                            pr-[80px]
                            mt-[20px]
                        ">
                            <input type="text" pattern="[0-9]*" inputMode="numeric" name="phone" placeholder="4-digit code" className="
                                block
                                w-full
                                h-[55px]
                                2xs:h-[60px]
                                font-defaultBold
                                text-[14px]
                                2xs:text-[16px]
                                text-left
                                text-[#111111]
                                px-[15px]
                            " value={verificationCode} onChange={onCodeInputChange} ref={codeInputRef}/>
                            <button type="submit" className={`
                                block
                                w-[80px]
                                h-[55px]
                                2xs:h-[60px]
                                absolute
                                top-0
                                right-0
                                ${(verificationCode.length !== 4 || verification.data.verifying) ? "bg-[#999999]" : "bg-[#111111] active:bg-[#333333]"}
                                font-defaultBold
                                text-center
                                text-[#ffffff]
                                text-[13px]
                                2xs:text-[14px]
                            `}>{verification.data.verifying ? <img src={SpinnerLight} alt="loading" className="inline-block w-[20px]"/> : "Verify"}</button>
                        </div>
                        <div className="
                            block
                            w-full
                            font-defaultBold
                            text-left
                            text-[#555555]
                            text-[11px]
                            2xs:text-[12px]
                            leading-[18px]
                            mt-[10px]
                        ">Didn't recieve code? <span className="text-[#8a2be2]" onClick={resendCode}>Resend code</span>{resendTimer > 0 ? ` in ${resendTimer}s` : ""}</div>
                    </form> : ""
                }
            </div>
        </div>
    )

}

export default SignIn