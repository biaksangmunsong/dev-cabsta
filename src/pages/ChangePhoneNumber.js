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
    const locationQueries = useStore(state => state.locationQueries)
    const [ newPhoneNumber, setNewPhoneNumber ] = useState("")
    const [ sendingPhoneNumber, setSendingPhoneNumber ] = useState(false)
    const [ error, setError ] = useState(null)
    const [ otpId, setOtpId ] = useState("")
    
    const scrollableArea = useRef(null)
    const newPhoneNumberRef = useRef(null)
    
    const onNewPhoneNumberChange = e => {
        const pn = e.target.value
        
        if (pn.length <= 10){
            setNewPhoneNumber(pn)
        }
    }

    const sendNewPhoneNumber = async e => {
        e.preventDefault()
        
        if (newPhoneNumberRef.current){
            newPhoneNumberRef.current.blur()
        }
        
        if (!authToken || sendingPhoneNumber || newPhoneNumber.length !== 10 || newPhoneNumber === phoneNumber.replace(countryCode, "")){
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
        
        setSendingPhoneNumber(true)

        // send phone number to server
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/v1/send-phone-number-change-otp`, {
                newPhoneNumber: newPhoneNum.phoneNumber
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            setSendingPhoneNumber(false)
            if (res.status === 200 && res.data){
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
            await Haptics.notification({type: "ERROR"})
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            setSendingPhoneNumber(false)
            setError({
                message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
            })
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
    
    useEffect(() => {
        if (signedIn === "no"){
            navigate("/", {replace: true})
        }
    }, [signedIn, navigate])

    useEffect(() => {
        if (!locationQueries.includes("verify-otp")){
            setOtpId("")
        }
    }, [locationQueries])
    
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
                            <form onSubmit={sendNewPhoneNumber} className="
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
                                            sendingPhoneNumber ?
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
                                <input type="number" id="phone-number-input" name="phone" placeholder="New Phone Number" className="
                                    block
                                    w-full
                                    h-[55px]
                                    2xs:h-[60px]
                                    font-defaultBold
                                    text-[14px]
                                    2xs:text-[16px]
                                    text-left
                                    text-[#111111]
                                " value={newPhoneNumber} onChange={onNewPhoneNumberChange} ref={newPhoneNumberRef} onFocus={onPhoneNumberInputFocus}/>
                            </form>
                            {
                                (phoneNumber && countryCode) ?
                                <div className="
                                    block
                                    w-full
                                    mt-[10px]
                                    bg-[#eeeeee]
                                    rounded-[6px]
                                    p-[10px]
                                ">
                                    <div className="
                                        block
                                        w-full
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[14px]
                                        2xs:text-[16px]
                                    "><span className="mr-[6px]">{countryCode}</span>{phoneNumber.replace(countryCode, "")}</div>
                                    <div className="
                                        block
                                        w-full
                                        font-Regular
                                        text-left
                                        text-[#888888]
                                        text-[11px]
                                        2xs:text-[12px]
                                    ">You will receive an otp on this number</div>
                                </div> : ""
                            }
                        </div>
                    </div>
                </div> : ""
            }
        </div>
    )

}

export default ChangePhoneNumber