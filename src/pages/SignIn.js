import { useState, useEffect, useCallback, useRef } from "react"
import useStore from "../store"
import { useParams, useNavigate } from "react-router-dom"
import phone from "phone"
import { Haptics } from "@capacitor/haptics"
import { Storage } from "@capacitor/storage"
import Header from "../components/Header"
import InvalidIcon from "../components/icons/Invalid"
import SadFace from "../components/icons/SadFace"
import Ripple from "../images/ripple.gif"
import SpinnerLight from "../images/spinner-light.gif"

const SignIn = () => {

    const params = useParams()
    const navigate = useNavigate()
    const userData = useStore(state => state.userData)
    const setUserData = useStore(state => state.setUserData)
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
        
        // simulate sending sms
        setTimeout(async () => {
            setVerification({
                status: "code-sent",
                error: null,
                data: {
                    codeId: "abcdef",
                    phoneNumber: phoneNum.phoneNumber.split(phoneNum.countryCode).join("")
                }
            })
            setResendTimer(10)
            // if (window.location.pathname.startsWith("/signin/")){
            //     await Haptics.notification({type: "ERROR"})
            // }
            // setVerification({
            //     status: "error",
            //     error: {
            //         code: "server-error",
            //         message: "Internal Server Error",
            //         retry: () => {
            //             setVerification({
            //                 status: "not-init",
            //                 error: null,
            //                 data: null
            //             })
            //             setVerificationCode("")
            //             sendVerificationCode()
            //         }
            //     },
            //     data: null
            // })
        }, 1500)
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

    const verifyCode = e => {
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

        // simulate verification process
        setTimeout(async () => {
            if (verificationCode !== "1234"){
                await Haptics.notification({type: "ERROR"})
                if (scrollableArea.current){
                    scrollableArea.current.scrollTo(0,0)
                }
                return setVerification({
                    ...verification,
                    data: {
                        ...verification.data,
                        verifying: false,
                        verificationError: {
                            message: "Invalid verification code"
                        }
                    }
                })
            }
            const newUserData = {
                phoneNumber: {
                    withCountryCode: params.phone,
                    withoutCountryCode: params.phone.replace("+91", "")
                },
                name: "",
                profilePhoto: null
            }
            await Storage.set({
                key: "user-data",
                value: JSON.stringify(newUserData)
            })
            setUserData({
                init: true,
                status: "signed-in",
                data: newUserData
            })
        }, 1500)
    }
    
    useEffect(() => {
        if (userData.status === "signed-in"){
            navigate("/edit-profile", {replace: true})
        }
        else {
            sendVerificationCode()
        }
    }, [sendVerificationCode, userData, navigate])

    useEffect(() => {
        if (verification.status === "code-sent" && codeInputRef.current){
            codeInputRef.current.focus()
        }
    }, [verification])

    return (
        <div className="page pt-[50px]">
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
                    (verification.status === "code-sent" && verification.data) ?
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
                            <input type="number" name="phone" placeholder="4-digit code" className="
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