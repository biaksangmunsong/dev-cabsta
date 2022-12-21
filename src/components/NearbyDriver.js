import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Haptics } from "@capacitor/haptics"
import useStore from "../store"
import { useUserStore, useInputStore } from "../store"
import getTimeInMinutes from "../lib/getTimeInMinutes"
import RippleThick from "../images/ripple-thick.gif"
import Spinner from "../images/spinner.gif"
import CircularProgress from "./icons/CircularProgress"

const NearbyDriver = ({driver}) => {

    const rideRequest = useStore(state => state.rideRequest)
    const setRideRequest = useStore(state => state.setRideRequest)
    const resetRideRequest = useStore(state => state.resetRideRequest)
    const notResponsiveDrivers = useStore(state => state.notResponsiveDrivers)
    const uaNearbyDrivers = useStore(state => state.uaNearbyDrivers)
    const rejectingDrivers = useStore(state => state.rejectingDrivers)
    const nearbyDrivers = useStore(state => state.nearbyDrivers)
    const setUaNearbyDrivers = useStore(state => state.setUaNearbyDrivers)
    const authToken = useUserStore(state => state.authToken)
    const resetUserData = useUserStore(state => state.reset)
    const vehicleType = useInputStore(state => state.vehicleType)
    const pickupLocation = useInputStore(state => state.pickupLocation)
    const destination = useInputStore(state => state.destination)
    const nameInput = useInputStore(state => state.name)
    const phoneNumberInput = useInputStore(state => state.phoneNumber)
    const [ timeInMinutes, setTimeInMinutes ] = useState(0)
    const [ inactive, setInactive ] = useState(false)
    
    const rideRequestRef = useRef(rideRequest)
    useEffect(() => {
        rideRequestRef.current = rideRequest
    }, [rideRequest])
    const nearbyDriversRef = useRef(nearbyDrivers)
    useEffect(() => {
        nearbyDriversRef.current = nearbyDrivers
    }, [nearbyDrivers])

    const requestARide = async () => {
        if (
            !authToken ||
            rideRequest.loading ||
            rideRequest.driver ||
            !vehicleType.price ||
            !pickupLocation ||
            !destination ||
            !nameInput.value ||
            !phoneNumberInput.value
        ) return
        
        setRideRequest({
            loading: driver._id,
            error: null,
            driver: "",
            ttl: {
                value: 0,
                start: 0
            }
        })
        
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/request-a-ride?pickupLocationLat=${pickupLocation.coords.lat}&pickupLocationLng=${pickupLocation.coords.lng}&destinationLat=${destination.coords.lat}&destinationLng=${destination.coords.lng}&pickupLocationAddress=${pickupLocation.inputValue}&destinationAddress=${destination.inputValue}`, {
                name: nameInput.value,
                phoneNumber: phoneNumberInput.value,
                driverId: driver._id,
                vehicleType: vehicleType.type
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            if (res.status === 200 && res.data){
                setRideRequest({
                    loading: "",
                    error: null,
                    driver: res.data.driverId,
                    ttl: res.data.ttl
                })
            }
            else {
                setRideRequest({
                    loading: "",
                    error: "Something went wrong, please try again.",
                    driver: "",
                    ttl: {
                        value: 0,
                        start: 0
                    }
                })
            }
        }
        catch (err){
            await Haptics.notification({type: "ERROR"})
            
            if (err && err.response && err.response.data && err.response.data.code && err.response.data.code === "credential-expired"){
                // alert user that they have to reauthenticate and sign out
                alert(err.response.data.message)
                return resetUserData()
            }
            if (err && err.response && err.response.status && err.response.status === 409){
                if (window.location.pathname === "/nearby-drivers" && nearbyDriversRef.current && rideRequestRef.current){
                    if (nearbyDriversRef.current.data && nearbyDriversRef.current.data.drivers.length > 0){
                        const x = nearbyDriversRef.current.data.drivers.filter(d => d._id === driver._id)
                        if (x[0]){
                            if (rideRequestRef.current.loading === driver._id || rideRequestRef.current.driver === driver._id){
                                setUaNearbyDrivers([driver._id])
                                return resetRideRequest()
                            }
                        }
                    }
                }
            }
            
            setRideRequest({
                loading: "",
                error: {
                    message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
                },
                driver: "",
                ttl: {
                    value: 0,
                    start: 0
                }
            })
        }
    }
    
    const abortRideRequest = () => {
        if (!authToken || rideRequest.loading || !rideRequest.driver) return
        
        resetRideRequest()

        if (window.socket && window.socket.connected){
            window.socket.volatile.emit(
                "abort-a-ride-request",
                rideRequest.driver
            )
        }
    }
    
    useEffect(() => {
        if (driver.distance){
            setTimeInMinutes(getTimeInMinutes(15,driver.distance))
        }
        else {
            setTimeInMinutes(1)
        }
    }, [driver.distance])
    
    useEffect(() => {
        if (rideRequest.loading || rideRequest.driver){
            if (rideRequest.loading === driver._id || rideRequest.driver === driver._id){
                setInactive(false)
            }
            else {
                setInactive(true)
            }
        }
        else {
            setInactive(false)
        }
    }, [rideRequest, driver._id])
    
    return (
        <div className={`
            block
            w-full
            bg-[#ffffff]
            overflow-hidden
            relative
            mb-[5px]
            last:mb-0
            ${(rideRequest.loading === driver._id || rideRequest.driver === driver._id) ? "sticky -top-[6px] z-[20]" : "relative z-[10]"}
        `}>
            <div className={`
                block
                w-[94%]
                mx-auto
                relative
                py-[20px]
                pl-[50px]
                2xs:pl-[60px]
                pr-[90px]
                ${(inactive || uaNearbyDrivers.includes(driver._id)) ? "opacity-[.2]" : ""}
            `}>
                <div className="
                    block
                    w-[40px]
                    2xs:w-[50px]
                    h-[40px]
                    2xs:h-[50px]
                    overflow-visible
                    absolute
                    top-1/2
                    -translate-y-1/2
                    left-0
                ">
                    {
                        rideRequest.driver === driver._id ?
                        <div className="
                            block
                            w-full
                            h-full
                            relative
                        ">
                            <div className="
                                block
                                w-full
                                h-full
                                relative
                                z-[10]
                            ">
                                <div className="
                                    block
                                    w-full
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    left-0
                                    font-defaultBold
                                    text-center
                                    text-[#8a2be2]
                                    text-[12px]
                                    2xs:text-[14px]
                                ">{rideRequest.ttl.value}</div>
                            </div>
                            <div className="
                                block
                                w-full
                                h-full
                                -rotate-[90deg]
                                absolute
                                z-[20]
                                top-0
                                left-0
                            ">
                                <CircularProgress
                                    ttlStart={rideRequest.ttl.start}
                                    ttl={rideRequest.ttl.value}
                                    color="#8a2be2"
                                    bgColor="#87ceeb"
                                    dashedCount={80}
                                />
                            </div>
                        </div> :
                        rideRequest.loading === driver._id ?
                        <div className="
                            block
                            w-full
                            h-full
                            bg-no-repeat
                            bg-center
                            bg-cover
                            rounded-[50%]
                            relative
                            z-[10]
                        " style={{
                            backgroundImage: `url(${Spinner})`
                        }}></div> :
                        <div className={`
                            block
                            w-full
                            h-full
                            bg-no-repeat
                            bg-center
                            bg-cover
                            rounded-[50%]
                            relative
                            z-[10]
                        `} style={{
                            backgroundImage: `url(${driver.photo.thumbnail_url})`,
                            backgroundColor: "#dddddd"
                        }}></div>
                    }
                </div>
                {
                    (rideRequest.driver !== driver._id && rideRequest.loading !== driver._id && !uaNearbyDrivers.includes(driver._id) && !rejectingDrivers.includes(driver._id)) ?
                    <div className={`
                        block
                        w-[80px]
                        leading-[34px]
                        absolute
                        top-1/2
                        -translate-y-1/2
                        right-0
                        font-defaultRegular
                        text-[12px]
                        text-[#8a2be2]
                        border
                        border-solid
                        border-[#8a2be2]
                        rounded-[4px]
                        text-center
                        active:bg-[#dddddd]
                    `} onClick={
                        (!uaNearbyDrivers.includes(driver._id) && !rideRequest.driver && !rideRequest.loading) ?
                        requestARide : null
                    }>Request</div> : ""
                }
                {
                    uaNearbyDrivers.includes(driver._id) ?
                    <div className="
                        block
                        w-[80px]
                        leading-[35px]
                        overflow-hidden
                        absolute
                        top-1/2
                        -translate-y-1/2
                        right-0
                        rounded-[4px]
                        font-defaultBold
                        text-center
                        text-[12px]
                        text-[#111111]
                    ">U/A</div> :
                    rejectingDrivers.includes(driver._id) ?
                    <div className="
                        block
                        w-[80px]
                        leading-[16px]
                        overflow-hidden
                        absolute
                        top-1/2
                        -translate-y-1/2
                        right-0
                        rounded-[4px]
                        font-defaultRegular
                        text-center
                        text-[12px]
                        text-[#990000]
                    ">Request<br/>Rejected</div> : ""
                }
                <h2 className={`
                    block
                    w-full
                    font-defaultBold
                    text-left
                    text-[14px]
                    2xs:text-[16px]
                    text-[#111111]
                    leading-[20px]
                    mb-[5px]
                `}>{driver.name} <span className="font-defaultRegular"> | {driver.vehicle}</span></h2>
                <h3 className={`
                    block
                    w-full
                    font-defaultRegular
                    text-left
                    ${(notResponsiveDrivers.includes(driver._id) && rideRequest.loading !== driver._id && rideRequest.driver !== driver._id) ? "text-[#cc0000]" : "text-[#888888]"}
                    text-[10px]
                    2xs:text-[12px]
                    capitalize
                `}>{
                    (notResponsiveDrivers.includes(driver._id) && rideRequest.loading !== driver._id && rideRequest.driver !== driver._id) ?
                    "Not Responding" :
                    `${driver.gender} | ${driver.age} | ${timeInMinutes ? `${timeInMinutes} min${timeInMinutes > 1 ? "s" : ""} away` : "..."}`
                }</h3>
            </div>
            <div className={`
                block
                w-[94%]
                max-w-[1000px]
                mx-auto
                ${(rideRequest.driver === driver._id || rideRequest.loading === driver._id) ? "h-[100px] pb-[20px]" : "h-0"}
                overflow-hidden
                duration-[.2s]
                ease-in-out
            `}>
                <div className={`
                    block
                    w-full
                    font-defaultRegular
                    text-left
                    text-[#888888]
                    text-[11px]
                    2xs:text-[13px]
                    leading-[20px]
                    mb-[10px]
                    overflow-hidden
                    text-ellipsis
                    whitespace-nowrap
                    ${rideRequest.driver === driver._id ? "" : "opacity-0"}
                `}>Waiting for driver's response...</div>
                <button type="button" className={`
                    block
                    w-full
                    h-[50px]
                    overflow-hidden
                    font-defaultBold
                    text-center
                    text-[12px]
                    2xs:text-[14px]
                    text-[#ffffff]
                    bg-[#990000]
                    active:bg-[#bb0000]
                    uppercase
                    ${rideRequest.driver === driver._id ? "" : "opacity-0"}
                `} onClick={rideRequest.driver === driver._id ? abortRideRequest : null}>Abort</button>
            </div>
            {
                (rideRequest.driver === driver._id || rideRequest.loading === driver._id) ?
                <div className="
                    block
                    w-full
                    h-[5px]
                    relative
                    bg-[#dddddd]
                    overflow-hidden
                ">
                    <div className="
                        block
                        w-[300%]
                        h-full
                        absolute
                        z-0
                        top-0
                        left-0
                        -translate-x-[60%]
                        2xs:ml-[25px]
                        bg-no-repeat
                        bg-center
                        bg-cover
                        opacity-[.8]
                    " style={{backgroundImage: `url(${RippleThick})`}}></div>
                </div> : ""
            }
        </div>
    )

}

export default NearbyDriver