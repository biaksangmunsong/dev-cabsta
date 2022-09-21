import { useState } from "react"
import useStore from "../store"
import { phone } from "phone"
import { Haptics } from "@capacitor/haptics"
import { Link, useNavigate } from "react-router-dom"
import LongRightArrow from "../components/icons/LongRightArrow"
import Logo from "../images/logo.svg"

const NotSignedIn = () => {

    const expandMenu = useStore(state => state.expandMenu)
    const [ phoneNumber, setPhoneNumber ] = useState("")
    const [ phoneNumberError, setPhoneNumberError ] = useState("")
    const navigate = useNavigate()
    
    const onPhoneNumberChange = e => {
        const pn = e.target.value
        
        if (pn.length <= 10){
            setPhoneNumber(pn)
        }
    }

    const onSubmit = async e => {
        e.preventDefault()
        
        setPhoneNumberError("")
        if (!phoneNumber){
            return
        }
        
        const phoneNum = phone(phoneNumber, {country: "IN"})
        if (!phoneNum.isValid){
            setPhoneNumberError("Invalid Phone Number")
            await Haptics.notification({type: "WARNING"})
        }
        else {
            navigate(`/signin/${phoneNum.phoneNumber}`)
        }
    }
    
    return (
        <div className={`
            block
            w-[94%]
            max-w-[1000px]
            mx-auto
            relative
            z-[10]
            ${expandMenu ? "max-h-0 delay-[.2s]" : "max-h-[2000px] pb-[30px]"}
            overflow-hidden
        `}>
            <img src={Logo} alt="" className="
                block
                w-[69px]
                2xs:w-[80px]
                h-[69px]
                2xs:h-[80px]
                mb-[30px]
            "/>
            <h2 className="
                block
                w-full
                font-defaultRegular
                text-left
                text-[14px]
                2xs:text-[16px]
                xs:text-[18px]
                leading-[23px]
                2xs:leading-[25px]
                xs:leading-[26px]
                text-[#222222]
            ">New to Cabsta?</h2>
            <h1 className="
                block
                w-full
                font-defaultBold
                text-left
                text-[26px]
                2xs:text-[30px]
                xs:text-[35px]
                leading-[36px]
                2xs:leading-[40px]
                xs:leading-[45px]
                text-[#111111]
            ">Let's get started,<br/>Sign in.</h1>
            <form onSubmit={onSubmit} className="
                block
                w-full
                h-[55px]
                2xs:h-[60px]
                overflow-hidden
                relative
                rounded-[6px]
                bg-[#eeeeee]
                pr-[55px]
                2xs:pr-[60px]
                pl-[50px]
                mt-[20px]
            ">
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
                <input type="number" id="phone-number-input" name="phone" placeholder="Phone Number" className="
                    block
                    w-full
                    h-[55px]
                    2xs:h-[60px]
                    font-defaultBold
                    text-[14px]
                    2xs:text-[16px]
                    text-left
                    text-[#111111]
                " value={phoneNumber} onChange={onPhoneNumberChange}/>
                <button type="submit" className="
                    block
                    w-[55px]
                    2xs:w-[60px]
                    h-[55px]
                    2xs:h-[60px]
                    absolute
                    top-0
                    right-0
                    bg-[#111111]
                    active:bg-[#333333]
                    p-[16px]
                    2xs:p-[18px]
                ">
                    <LongRightArrow color="#ffffff"/>
                </button>
            </form>
            {
                phoneNumberError ?
                <div className="
                    block
                    w-full
                    p-[10px]
                    bg-[#bb0000]
                    mt-[10px]
                    rounded-[6px]
                    font-defaultRegular
                    text-left
                    text-[#ffffff]
                    text-[13px]
                    2xs:text-[14px]
                    leading-[20px]
                ">{phoneNumberError}</div> : ""
            }
            <p className="
                block
                w-full
                font-defaultRegular
                text-left
                text-[11px]
                2xs:text-[12px]
                leading-[15px]
                2xs:leading-[16px]
                text-[#999999]
                mt-[15px]
            ">By continuing, you consent to revieve SMS messages from us and agree to our <Link to="/tos" className="text-[#8a2be2] underline">terms of service</Link> and <Link to="/privacy-policy" className="text-[#8a2be2] underline">privacy policy</Link>.</p>
        </div>
    )

}

export default NotSignedIn