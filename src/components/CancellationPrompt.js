import { useState, useEffect, useRef } from "react"
import axios from "axios"
import TextareaAutosize from "react-textarea-autosize"
import useStore from "../store"
import { useUserStore } from "../store"
import LeftArrow from "./icons/LeftArrow"
import Check from "./icons/Check"
import RippleThick from "../images/ripple-thick.gif"

const CancellationPrompt = ({data, setData}) => {
    
    const authToken = useUserStore(state => state.authToken)
    const resetUserData = useUserStore(state => state.reset)
    const setDriversLiveLocation = useStore(state => state.setDriversLiveLocation)
    const uncompletedRides = useStore(state => state.uncompletedRides)
    const uncompletedRidesRef = useRef(uncompletedRides)
    useEffect(() => {
        uncompletedRidesRef.current = uncompletedRides
    }, [uncompletedRides])
    const [ selectedReason, setSelectedReason ] = useState("")
    const [ otherReason, setOtherReason ] = useState("")
    const [ reason, setReason ] = useState("")
    const [ cancelling, setCancelling ] = useState(false)
    const [ error, setError ] = useState(null)
    const otherReasonInputRef = useRef(null)
    const scrollableArea = useRef(null)
    
    const onReasonClick = r => {
        setSelectedReason(r)
    }

    const onOtherReasonChange = e => {
        if (e.target.value.length <= 500){
            setOtherReason(e.target.value)
        }
    }

    const cancelRide = async () => {
        if (
            cancelling ||
            data.data.status !== "initiated" ||
            !authToken ||
            reason.length < 1 ||
            reason.length > 500
        ) return
        
        setCancelling(true)
        setError(null)
        
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/cancel-ride`, {
                rideId: data.data._id,
                reason
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            setCancelling(false)
            setData({
                ...data,
                data: {
                    ...data.data,
                    status: "cancelled",
                    cancellation: {
                        iat: Date.now(),
                        iby: "passenger"
                    }
                }
            })
            setDriversLiveLocation(null)
            if (window.location.search.startsWith("?cancel")){
                window.history.back()
            }
        }
        catch (err){
            setCancelling(false)
            if (err && err.response && err.response.data && err.response.data.code){
                if (err.response.data.code === "credential-expired"){
                    // alert user that they have to reauthenticate and sign out
                    alert(err.response.data.message)
                    return resetUserData()
                }
            }
            setError({
                message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
            })
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
        }
    }
    
    useEffect(() => {
        if (otherReasonInputRef.current){
            if (selectedReason === "others"){
                otherReasonInputRef.current.focus()
                setReason(otherReasonInputRef.current.value)
            }
            else {
                otherReasonInputRef.current.blur()
                setReason(selectedReason)
            }
        }
    }, [selectedReason])

    useEffect(() => {
        if (selectedReason === "others"){
            setReason(otherReason)
        }
    }, [selectedReason, otherReason])
    
    return (
        <div className="
            block
            w-full
            h-full
            overflow-hidden
            bg-[#ffffff]
            absolute
            z-[50]
            pb-[100px]
        ">
            <div className="
                block
                w-full
                h-full
                relative
                z-[10]
                overflow-auto
            " ref={scrollableArea}>
                <div className="
                    block
                    w-[94%]
                    max-w-[1000px]
                    mx-auto
                    pt-[10px]
                ">
                    <div className="
                        block
                        w-[50px]
                        h-[50px]
                        p-[12px]
                        -translate-x-[12px]
                        active:bg-[#eeeeee]
                        mb-[20px]
                    " onClick={() => window.history.back()}>
                        <LeftArrow color="#111111"/>
                    </div>
                    {
                        error ?
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[14px]
                            2xs:text-[16px]
                            text-[#ffffff]
                            bg-[#cd5c5c]
                            p-[10px]
                            mb-[10px]
                        ">{error.message}</div> : ""
                    }
                    <h1 className="
                        block
                        w-full
                        font-defaultBold
                        text-left
                        text-[#111111]
                        text-[26px]
                        2xs:text-[30px]
                    ">Cancel a ride</h1>
                    <p className="
                        block
                        w-full
                        font-defaultRegular
                        text-left
                        text-[#444444]
                        text-[12px]
                        2xs:text-[14px]
                        leading-[20px]
                    ">Please specify a reason for cancellation. <br/>(We won't let driver know why you cancel.)</p>
                    <div className="
                        block
                        w-full
                        my-[40px]
                    ">
                        {
                            data.data.reasonsForCancellation.map((r, i) => {
                                return (
                                    <div className={`
                                        block
                                        w-full
                                        border-[2px]
                                        border-solid
                                        ${r === selectedReason ? "border-[#8a2be2]" : "border-[#dddddd]"}
                                        bg-[#ffffff]
                                        rounded-[10px]
                                        py-[20px]
                                        pr-[10px]
                                        pl-[40px]
                                        relative
                                        mb-[10px]
                                        last:mb-0
                                    `} key={i} onClick={() => onReasonClick(r)}>
                                        <div className={`
                                            block
                                            w-[20px]
                                            h-[20px]
                                            border-[2px]
                                            border-solid
                                            ${r === selectedReason ? "border-[#8a2be2]" : "border-[#888888]"}
                                            rounded-[4px]
                                            absolute
                                            top-1/2
                                            -translate-y-1/2
                                            left-[10px]
                                            overflow-visible
                                        `}>
                                            {
                                                r === selectedReason ?
                                                <div className="
                                                    block
                                                    w-[120%]
                                                    h-[120%]
                                                    absolute
                                                    top-1/2
                                                    -translate-y-1/2
                                                    left-[20%]
                                                ">
                                                    <Check color="#8a2be2"/>
                                                </div> : ""
                                            }
                                        </div>
                                        <div className={`
                                            block
                                            w-full
                                            font-defaultBold
                                            text-left
                                            ${r === selectedReason ? "text-[#8a2be2]" : "text-[#111111]"}
                                            text-[14px]
                                            2xs:text-[16px]
                                        `}>{r}</div>
                                    </div>
                                )
                            })
                        }
                        <div className={`
                            block
                            w-full
                            border-[2px]
                            border-solid
                            ${selectedReason === "others" ? "border-[#8a2be2] max-h-[360px]" : "border-[#dddddd] max-h-[60px]"}
                            overflow-hidden
                            bg-[#ffffff]
                            rounded-[10px]
                            py-[20px]
                            px-[10px]
                            relative
                            mb-[10px]
                            last:mb-0
                            duration-[.4s]
                            ease-in-out
                        `} onClick={() => onReasonClick("others")}>
                            <div className={`
                                block
                                w-[20px]
                                h-[20px]
                                border-[2px]
                                border-solid
                                ${selectedReason === "others" ? "border-[#8a2be2]" : "border-[#888888]"}
                                rounded-[4px]
                                absolute
                                top-[20px]
                                left-[10px]
                                overflow-visible
                            `}>
                                {
                                    selectedReason === "others" ?
                                    <div className="
                                        block
                                        w-[120%]
                                        h-[120%]
                                        absolute
                                        top-1/2
                                        -translate-y-1/2
                                        left-[20%]
                                    ">
                                        <Check color="#8a2be2"/>
                                    </div> : ""
                                }
                            </div>
                            <div className={`
                                block
                                w-full
                                font-defaultBold
                                text-left
                                ${selectedReason === "others" ? "text-[#8a2be2]" : "text-[#111111]"}
                                text-[14px]
                                2xs:text-[16px]
                                leading-[20px]
                                pl-[30px]
                            `}>Others</div>
                            <div className="
                                block
                                w-full
                                mt-[20px]
                                relative
                            ">
                                <div className="
                                    block
                                    w-[50px]
                                    absolute
                                    z-[20]
                                    top-[15px]
                                    right-0
                                    text-center
                                    font-defaultRegular
                                    text-[12px]
                                    leading-[20px]
                                    text-[#111111]
                                ">{500-otherReason.length}</div>
                                <TextareaAutosize
                                    placeholder="Type something"
                                    name="reason-for-cancellation"
                                    value={otherReason}
                                    onChange={onOtherReasonChange}
                                    minRows={3}
                                    maxRows={10}
                                    ref={otherReasonInputRef}
                                    className="
                                        block
                                        w-full
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[14px]
                                        2xs:text-[16px]
                                        leading-[20px]
                                        py-[15px]
                                        relative
                                        z-[10]
                                        pr-[50px]
                                        pl-[10px]
                                        bg-[#dddddd]
                                        rounded-[8px]
                                        resize-none
                                    "
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="
                block
                w-full
                h-[100px]
                absolute
                z-[20]
                bottom-0
                left-0
                bg-[#ffffff]
                border-t
                border-solid
                border-[#cccccc]
                pt-[10px]
            ">
                {
                    cancelling ?
                    <div className="
                        block
                        w-[300%]
                        h-[3px]
                        overflow-hidden
                        absolute
                        top-0
                        left-0
                        -translate-x-[60%]
                        bg-no-repeat
                        bg-center
                        bg-cover
                        opacity-[.8]
                    " style={{backgroundImage: `url(${RippleThick})`}}></div> : ""
                }
                <div className="
                    block
                    w-[94%]
                    max-w-[1000px]
                    mx-auto
                ">
                    <button className={`
                        block
                        w-full
                        h-[60px]
                        ${(reason.length > 0 && reason.length <= 500 && !cancelling) ? "bg-[#111111] active:bg-[#444444]" : "bg-[#888888]"}
                        font-defaultBold
                        text-center
                        text-[15px]
                        text-[#ffffff]
                    `} onClick={cancelRide}>Cancel Now</button>
                </div>
            </div>
        </div>
    )

}

export default CancellationPrompt