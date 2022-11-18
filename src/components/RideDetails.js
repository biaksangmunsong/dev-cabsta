import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import phone from "phone"
import { useUserStore } from "../store"
import { useInputStore } from "../store"
import TextareaAutosize from "react-textarea-autosize"
import LongRightArrow from "./icons/LongRightArrow"
import LeftArrow from "./icons/LeftArrow"

const Checkout = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const [ error, setError ] = useState("")
    const pickupLocation = useInputStore(state => state.pickupLocation)
    const destination = useInputStore(state => state.destination)
    const vehicleType = useInputStore(state => state.vehicleType)
    const signedIn = useUserStore(state => state.signedIn)
    const usersPhoneNumber = useUserStore(state => state.phoneNumber)
    const usersCountryCode = useUserStore(state => state.countryCode)
    const usersName = useUserStore(state => state.name)
    const name = useInputStore(state => state.name)
    const setName = useInputStore(state => state.setName)
    const phoneNumber = useInputStore(state => state.phoneNumber)
    const setPhoneNumber = useInputStore(state => state.setPhoneNumber)
    const scrollableArea = useRef(null)
    
    const onNameInputChange = e => {
        const value = e.target.value.replace(/(\r\n|\n|\r)/gm, "")
        if (value.length <= 50){
            setName({
                prefilled: true,
                value
            })
        }
    }

    const onPhoneNumberInputChange = e => {
        const value = e.target.value
        if (value.length <= 10){
            setPhoneNumber({
                prefilled: true,
                value
            })
        }
    }

    const proceedToCheckout = () => {
        setError("")

        if (name.value.length <= 3 || name.value.length > 50){
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            return setError("Name too short, it should be at least 4 characters long.")
        }
        const phoneNum = phone(phoneNumber.value, {country: "IN"})
        if (!phoneNum.isValid){
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            return setError("Please enter a valid phone number.")
        }
        
        navigate("/checkout")
    }
    
    useEffect(() => {
        if (usersName && !name.prefilled && location.pathname === "/ride-details"){
            setName({
                prefilled: true,
                value: usersName
            })
        }
    }, [usersName, location.pathname, name.prefilled, setName])

    useEffect(() => {
        if (usersPhoneNumber && usersCountryCode && !phoneNumber.prefilled && location.pathname === "/ride-details"){
            setPhoneNumber({
                prefilled: true,
                value: usersPhoneNumber.replace(usersCountryCode, "")
            })
        }
    }, [usersPhoneNumber, usersCountryCode, location.pathname, phoneNumber.prefilled, setPhoneNumber])
    
    return (
        <div className={`
            block
            w-full
            h-full
            bg-[#ffffff]
            absolute
            ${location.pathname === "/ride-details" ? "top-0" : "top-full"}
            left-0
            z-[30]
            duration-[.2s]
            ease-in-out
        `}>
            <div className="
                block
                w-full
                h-full
                overflow-hidden
                relative
                z-[10]
                pb-[100px]
            ">
                <div className="
                    block
                    w-full
                    h-[50px]
                    absolute
                    z-[20]
                    top-0
                    left-1/2
                    -translate-x-1/2
                    bg-[#ffffff]
                    border-b
                    border-solid
                    border-[#dddddd]
                ">
                    <div className="
                        block
                        w-[94%]
                        max-w-[1000px]
                        h-full
                        mx-auto
                        relative
                    ">
                        <button type="button" className="
                            inline-block
                            align-middle
                            w-[50px]
                            h-[50px]
                            p-[15px]
                            active:bg-[#eeeeee]
                            -translate-x-[15px]
                        " onClick={() => window.history.back()}>
                            <LeftArrow color="#111111"/>
                        </button>
                        <div className="
                            hidden
                            3xs:inline-block
                            align-middle
                            font-defaultBold
                            text-[#111111]
                            text-[18px]
                            leading-[50px]
                            -translate-x-[16px]
                        " onClick={e => e.preventDefault()}>Details</div>
                    </div>
                </div>
                <div className="
                    block
                    w-full
                    h-full
                    overflow-auto
                    pt-[65px]
                    pb-[30px]
                " ref={scrollableArea}>
                    <div className="
                        block
                        w-[94%]
                        max-w-[1000px]
                        mx-auto
                        relative
                        z-[10]
                    ">
                        {
                            error ?
                            <div className="
                                block
                                w-full
                                p-[15px]
                                bg-[#dd0000]
                                mb-[15px]
                                rounded-[6px]
                                font-defaultRegular
                                text-left
                                text-[13px]
                                2xs:text-[15px]
                                leading-[20px]
                                2xs:leading-[22px]
                                text-[#ffffff]
                            ">{error}</div> : ""
                        }
                        <div className="
                            block
                            w-full
                            relative
                            mb-[10px]
                        ">
                            <div className="
                                block
                                w-[69px]
                                font-defaultRegular
                                text-left
                                text-[#111111]
                                text-[11px]
                                2xs:text-[12px]
                                leading-[16px]
                                absolute
                                top-1/2
                                -translate-y-1/2
                                left-0
                                pl-[10px]
                            ">Name*<span className="float-right">:</span></div>
                            {
                                location.pathname === "/ride-details" ?
                                <TextareaAutosize
                                    placeholder="Enter Your Name"
                                    name="name"
                                    value={name.value}
                                    onChange={onNameInputChange}
                                    className="
                                        block
                                        w-full
                                        min-h-[55px]
                                        2xs:min-h-[60px]
                                        bg-[#eeeeee]
                                        border
                                        border-solid
                                        border-[#cccccc]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[14px]
                                        2xs:text-[16px]
                                        leading-[23px]
                                        2xs:leading-[24px]
                                        pr-[30px]
                                        pl-[80px]
                                        py-[16px]
                                        2xs:py-[18px]
                                        rounded-[4px]
                                        resize-none
                                    "
                                /> : ""
                            }
                            <div className="
                                block
                                w-[30px]
                                font-defaultRegular
                                text-center
                                text-[#444444]
                                text-[11px]
                                2xs:text-[12px]
                                leading-[55px]
                                2xs:leading-[60px]
                                absolute
                                top-1/2
                                -translate-y-1/2
                                right-0
                            ">{50-name.value.length}</div>
                        </div>
                        <div className="
                            block
                            w-full
                            relative
                            mb-[10px]
                        ">
                            <div className="
                                block
                                w-[69px]
                                font-defaultRegular
                                text-left
                                text-[#111111]
                                text-[11px]
                                2xs:text-[12px]
                                leading-[16px]
                                absolute
                                top-1/2
                                -translate-y-1/2
                                left-0
                                pl-[10px]
                            ">Phone*<span className="float-right">:</span></div>
                            <div className="
                                inline-block
                                font-defaultBold
                                text-left
                                text-[#111111]
                                text-[14px]
                                2xs:text-[16px]
                                absolute
                                top-1/2
                                -translate-y-1/2
                                left-[80px]
                            ">+91</div>
                            {
                                location.pathname === "/ride-details" ?
                                <input
                                    type="text"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    placeholder="10 Dight Phone Number"
                                    name="phone"
                                    value={phoneNumber.value}
                                    onChange={onPhoneNumberInputChange}
                                    className="
                                        block
                                        w-full
                                        h-[55px]
                                        2xs:h-[60px]
                                        bg-[#eeeeee]
                                        border
                                        border-solid
                                        border-[#cccccc]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[14px]
                                        2xs:text-[16px]
                                        pl-[110px]
                                        2xs:pl-[115px]
                                        py-[16px]
                                        2xs:py-[18px]
                                        rounded-[4px]
                                    "
                                /> : ""
                            }
                        </div>
                        <div className="
                            block
                            w-full
                            mt-[30px]
                            pt-[20px]
                            border-t
                            border-dashed
                            border-[#cccccc]
                        ">
                            <div className="
                                block
                                w-full
                                font-defaultBold
                                text-left
                                text-[#8a2be2]
                                text-[18px]
                                2xs:text-[20px]
                                mb-[10px]
                            "><span className="text-[80%] font-defaultRegular text-[#111111]">Total Price:</span> ₹{vehicleType.price}</div>
                            <div className="
                                block
                                w-full
                                font-defaultRegular
                                text-left
                                text-[#111111]
                                text-[12px]
                                2xs:text-[14px]
                                mb-[10px]
                                bg-[#dddddd]
                                py-[15px]
                                px-[10px]
                                border-l-[4px]
                                border-solid
                                border-[#111111]
                            ">Pay with cash/upi on pickup</div>
                            <div className="
                                block
                                w-full
                                font-defaultRegular
                                text-left
                                text-[#444444]
                                text-[10px]
                                2xs:text-[12px]
                            "><b className="font-defaultBold">Please note:</b> Drivers are not allowed to charge more than this amount. But feel free to tip your driver if you are satisfied with their service.</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`
                block
                w-full
                h-[100px]
                absolute
                z-[20]
                bottom-0
                left-0
                bg-[#ffffff]
                py-[5px]
                border-t
                border-solid
                border-[#dddddd]
                duration-[.2s]
                ease-in-out
            `}>
                <button type="button" className={`
                    block
                    w-[94%]
                    max-w-[1000px]
                    h-[55px]
                    2xs:h-[60px]
                    mx-auto
                    font-defaultBold
                    text-left
                    text-[#ffffff]
                    text-[14px]
                    2xs:text-[16px]
                    px-[20px]
                    ${(
                        name.value &&
                        name.value.length < 51 &&
                        signedIn === "yes" &&
                        phoneNumber.value.length === 10 &&
                        vehicleType.price &&
                        pickupLocation &&
                        destination
                    ) ? "bg-[#111111] active:bg-[#333333]" : "bg-[#888888]"}
                `} onClick={proceedToCheckout}>
                    Continue
                    <div className="
                        inline-block
                        align-middle
                        float-right
                        w-[24px]
                    ">
                        <LongRightArrow color="#ffffff"/>
                    </div>
                </button>
            </div>
        </div>
    )

}

export default Checkout