import { useState, useEffect, useRef } from "react"
import useStore from "../store"
import { useUserStore } from "../store"
import { useNavigate, useLocation } from "react-router-dom"
import phone from "phone"
import axios from "axios"
import { Haptics } from "@capacitor/haptics"
import Header from "../components/Header"
import LongRightArrow from "../components/icons/LongRightArrow"
import SpinnerLight from "../images/spinner-light.gif"

const ChangePhoneNumber = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const signedIn = useUserStore(state => state.signedIn)
    const phoneNumber = useUserStore(state => state.phoneNumber)
    const countryCode = useUserStore(state => state.countryCode)
    const authToken = useUserStore(state => state.authToken)
    const updateUserData = useUserStore(state => state.update)
    const resetUserData = useUserStore(state => state.reset)
    const locationQueries = useStore(state => state.locationQueries)
    const [ newPhoneNumber, setNewPhoneNumber ] = useState("")
    const [ submittingPhoneNumber, setSubmittingPhoneNumber ] = useState(false)
    const [ verificationCode, setVerificationCode ] = useState("")
    const [ verifyingCode, setVerifyingCode ] = useState(false)
    const [ error, setError ] = useState(null)
    const [ otpId, setOtpId ] = useState("")
    const [ resendTimer, setResendTimer ] = useState(0)
    
    const scrollableArea = useRef(null)
    const newPhoneNumberRef = useRef(null)
    const codeInputRef = useRef(null)
    
    const onNewPhoneNumberChange = e => {
        const pn = e.target.value
        
        if (pn.length <= 10){
            setNewPhoneNumber(pn)
        }
    }

    const submitNewPhoneNumber = async e => {
        if (e){
            e.preventDefault()
        }
        
        if (newPhoneNumberRef.current){
            newPhoneNumberRef.current.blur()
        }
        
        if (!authToken || submittingPhoneNumber || newPhoneNumber.length !== 10 || newPhoneNumber === phoneNumber.replace(countryCode, "")){
            return
        }
        
        setError(null)

        // validate phone number
        const newPhoneNum = phone(newPhoneNumber, {country: "IN"})
        if (!newPhoneNum.isValid){
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            return setError({
                message: "Invalid phone number"
            })
        }
        
        setSubmittingPhoneNumber(true)

        // send phone number to server
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/v1/send-phone-number-change-otp`, {
                newPhoneNumber: newPhoneNum.phoneNumber
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            setSubmittingPhoneNumber(false)
            if (res.status === 200 && res.data){
                setResendTimer(10)
                setOtpId(res.data.otpId)
                navigate(`${location.pathname}?verify-otp`)
            }
            else {
                await Haptics.notification({type: "ERROR"})
                if (scrollableArea.current){
                    scrollableArea.current.scrollTo(0,0)
                }
                setError({
                    message: "Something went wrong, please try again."
                })
            }
        }
        catch (err){
            if (err && err.response && err.response.data && err.response.data.code && err.response.data.code === "credential-expired"){
                // alert user that they have to reauthenticate and sign out
                alert(err.response.data.message)
                return resetUserData()
            }
            await Haptics.notification({type: "ERROR"})
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            setSubmittingPhoneNumber(false)
            setError({
                message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
            })
        }
    }

    const resubmitNewPhoneNumber = () => {
        if (locationQueries.includes("verify-otp")){
            if (resendTimer > 0){
                return
            }
            window.history.back()
            setSubmittingPhoneNumber(true)
            submitNewPhoneNumber()
        }
    }

    const onPhoneNumberInputFocus = () => {
        if (locationQueries.includes("verify-otp")){
            window.history.back()
            if (newPhoneNumberRef.current){
                newPhoneNumberRef.current.focus()
            }
        }
    }

    const onCodeInputChange = e => {
        const code = e.target.value
        
        if (code.length <= 4){
            setVerificationCode(code)
        }
    }

    const submitVerificationCode = async e => {
        e.preventDefault()

        if (!authToken || verifyingCode || !verificationCode || !otpId){
            return
        }

        setError(null)
        setVerifyingCode(true)

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/v1/change-phone-number`, {
                otpId,
                otp: verificationCode
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })

            setVerifyingCode(false)
            
            if (res.status === 200 && res.data){
                updateUserData({
                    phoneNumber: res.data.phoneNumber,
                    countryCode: res.data.countryCode,
                    authToken: res.data.authToken
                })
                if (window.location.search.includes("verify-otp")){
                    window.history.back()
                }
                if (window.location.pathname === "/change-phone-number"){
                    window.history.back()
                }
            }
            else {
                await Haptics.notification({type: "ERROR"})
                if (scrollableArea.current){
                    scrollableArea.current.scrollTo(0,0)
                }
                setError({
                    message: "Something went wrong, please try again."
                })
            }
        }
        catch (err){
            if (err && err.response && err.response.data && err.response.data.code && err.response.data.code === "credential-expired"){
                // alert user that they have to reauthenticate and sign out
                alert(err.response.data.message)
                return resetUserData()
            }
            await Haptics.notification({type: "ERROR"})
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            setVerifyingCode(false)
            setError({
                message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
            })
        }
    }
    
    useEffect(() => {
        if (signedIn === "no"){
            navigate("/", {replace: true})
        }
    }, [signedIn, navigate])

    useEffect(() => {
        setError(null)
        if (!locationQueries.includes("verify-otp")){
            setOtpId("")
        }
        else {
            // empty and focus otp input
            setVerificationCode("")
            if (codeInputRef.current){
                codeInputRef.current.focus()
            }
        }
    }, [locationQueries])

    useEffect(() => {
        if (locationQueries.includes("verify-otp") && !otpId){
            window.history.back()
        }
    }, [locationQueries, otpId])

    useEffect(() => {
        if (resendTimer){
            setTimeout(() => {
                if (window.location.pathname === "/change-phone-number" && window.location.search.includes("verify-otp")){
                    setResendTimer(resendTimer-1)
                }
            }, 1000)
        }
    }, [resendTimer])
    
    return (
        <div className="
            page
            pt-[50px]
        ">
            {
                signedIn === "yes" ?
                <div className="
                    block
                    w-full
                    h-full
                    overflow-hidden
                ">
                    <Header heading="Change Phone Number"/>
                    <div className="
                        block
                        w-full
                        h-full
                        overflow-auto
                        py-[30px]
                    " ref={scrollableArea}>
                        <div className="
                            block
                            w-[94%]
                            max-w-[1000px]
                            mx-auto
                        ">
                            {
                                error ?
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
                                    mb-[10px]
                                ">{error.message}</div> : ""
                            }
                            <p className="
                                block
                                w-full
                                font-defaultRegular
                                text-[#444444]
                                text-left
                                text-[11px]
                                2xs:text-[12px]
                                mb-[4px]
                            " onClick={e => e.preventDefault()}>New phone number</p>
                            <form onSubmit={submitNewPhoneNumber} className="
                                block
                                w-full
                                h-[55px]
                                2xs:h-[60px]
                                mx-auto
                                overflow-hidden
                                relative
                                rounded-[6px]
                                bg-[#eeeeee]
                                pr-[55px]
                                2xs:pr-[60px]
                                pl-[50px]
                            ">
                                {
                                    !otpId ?
                                    <button type="submit" className={`
                                        block
                                        w-[55px]
                                        2xs:w-[60px]
                                        h-[55px]
                                        2xs:h-[60px]
                                        absolute
                                        top-0
                                        right-0
                                        ${newPhoneNumber.length === 10 && newPhoneNumber !== phoneNumber.replace(countryCode, "") ? "bg-[#111111] active:bg-[#333333]" : "bg-[#888888]"}
                                        p-[16px]
                                        2xs:p-[18px]
                                    `}>
                                        {
                                            submittingPhoneNumber ?
                                            <img src={SpinnerLight} alt=""/> :
                                            <LongRightArrow color="#ffffff"/>
                                        }
                                    </button> : ""
                                }
                                <div className="
                                    block
                                    w-[50px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    left-0
                                    font-defaultBold
                                    text-[14px]
                                    2xs:text-[16px]
                                    text-center
                                    text-[#222222]
                                ">+91</div>
                                <input
                                    type="text"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    id="phone-number-input"
                                    name="phone"
                                    placeholder="10 digit number"
                                    className="
                                        block
                                        w-full
                                        h-[55px]
                                        2xs:h-[60px]
                                        font-defaultBold
                                        text-[14px]
                                        2xs:text-[16px]
                                        text-left
                                        text-[#111111]
                                    "
                                    value={newPhoneNumber}
                                    onChange={onNewPhoneNumberChange}
                                    ref={newPhoneNumberRef}
                                    onFocus={onPhoneNumberInputFocus}
                                    onSelect={e => e.preventDefault()}
                                />
                            </form>
                            <p className="
                                block
                                w-full
                                font-defaultRegular
                                text-[#444444]
                                text-left
                                text-[11px]
                                2xs:text-[12px]
                                mt-[10px]
                                mb-[4px]
                            " onClick={e => e.preventDefault()}>{otpId ? "4 digit otp" : "Current phone number"}</p>
                            {
                                (phoneNumber && countryCode) ?
                                <div className="
                                    block
                                    w-full
                                    min-h-[60px]
                                    relative
                                ">
                                    <div className="
                                        block
                                        w-full
                                        bg-[#eeeeee]
                                        rounded-[6px]
                                        p-[10px]
                                        absolute
                                        top-0
                                        left-0
                                    " style={{
                                        transform: `rotateX(${otpId ? 90 : 0}deg)`,
                                        transformOrigin: "center top",
                                        transition: ".2s ease-in-out"
                                    }} onClick={e => e.preventDefault()}>
                                        <div className="
                                            block
                                            w-full
                                            font-defaultBold
                                            text-left
                                            text-[#111111]
                                            text-[14px]
                                            2xs:text-[16px]
                                        "><span className="mr-[10px]">{countryCode}</span>{phoneNumber.replace(countryCode, "")}</div>
                                        <div className="
                                            block
                                            w-full
                                            font-Regular
                                            text-left
                                            text-[#888888]
                                            text-[11px]
                                            2xs:text-[12px]
                                        ">You will receive an otp on this number</div>
                                    </div>
                                    <form onSubmit={submitVerificationCode} className="
                                        block
                                        w-full
                                        h-[55px]
                                        2xs:h-[60px]
                                        overflow-hidden
                                        rounded-[6px]
                                        bg-[#eeeeee]
                                        pr-[80px]
                                        absolute
                                        bottom-0
                                        left-0
                                    " style={{
                                        transform: `rotateX(${otpId ? 0 : 90}deg)`,
                                        transformOrigin: "center top",
                                        transition: ".2s ease-in-out"
                                    }} autoComplete="off">
                                        <input type="text" pattern="[0-9]*" inputMode="numeric" name="phone" placeholder="Enter code" className="
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
                                        " value={verificationCode} onChange={onCodeInputChange} ref={codeInputRef} autoComplete="off"/>
                                        <button type="submit" className={`
                                            block
                                            w-[80px]
                                            h-[55px]
                                            2xs:h-[60px]
                                            absolute
                                            top-0
                                            right-0
                                            ${(verificationCode.length !== 4 || verifyingCode) ? "bg-[#999999]" : "bg-[#111111] active:bg-[#333333]"}
                                            font-defaultBold
                                            text-center
                                            text-[#ffffff]
                                            text-[13px]
                                            2xs:text-[14px]
                                        `}>{verifyingCode ? <img src={SpinnerLight} alt="loading" className="inline-block w-[20px]"/> : "Verify"}</button>
                                    </form>
                                </div> : ""
                            }
                            {
                                otpId ?
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
                                " onClick={e => e.preventDefault()}>Didn't recieve code? <span className="text-[#8a2be2]" onClick={resubmitNewPhoneNumber}>Resend code</span>{resendTimer > 0 ? ` in ${resendTimer}s` : ""}</div> : ""
                            }
                        </div>
                    </div>
                </div> : ""
            }
        </div>
    )

}

export default ChangePhoneNumber