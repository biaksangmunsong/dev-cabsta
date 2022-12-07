import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Haptics } from "@capacitor/haptics"
import useStore from "../store"
import { useUserStore, useInputStore } from "../store"
import getTimeInMinutes from "../lib/getTimeInMinutes"
import RippleThick from "../images/ripple-thick.gif"

const NearbyDriver = ({driver}) => {

    const rideRequest = useStore(state => state.rideRequest)
    const setRideRequest = useStore(state => state.setRideRequest)
    const resetRideRequest = useStore(state => state.resetRideRequest)
    const notResponsiveDrivers = useStore(state => state.notResponsiveDrivers)
    const uaNearbyDrivers = useStore(state => state.uaNearbyDrivers)
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
            counter: 0,
            timeout: 0
        })
        
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/request-a-ride?pickupLocationLat=${pickupLocation.coords.lat}&pickupLocationLng=${pickupLocation.coords.lng}&destinationLat=${destination.coords.lat}&destinationLng=${destination.coords.lng}`, {
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
                    counter: 1,
                    timeout: res.data.timeout
                })
            }
            else {
                setRideRequest({
                    loading: "",
                    error: "Something went wrong, please try again.",
                    driver: "",
                    counter: 0,
                    timeout: 0
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
                counter: 0,
                timeout: 0
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
            mb-[5px]
            last:mb-0
            ${(inactive || uaNearbyDrivers.includes(driver._id)) ? "opacity-[.5]" : ""}
            ${(rideRequest.loading === driver._id || rideRequest.driver === driver._id) ? "sticky -top-[6px] z-[20]" : "relative z-[10]"}
        `}>
            <div className="
                block
                w-[94%]
                mx-auto
                relative
                py-[15px]
                pl-[50px]
                2xs:pl-[60px]
                pr-[100px]
            ">
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
                        ${rideRequest.driver === driver._id ? "scale-[.8]" : ""}
                        duration-[.2s]
                        ease-in-out
                    `} style={{
                        backgroundImage: `url(${driver.photo.thumbnail_url})`,
                        backgroundColor: "#dddddd"
                    }}></div>
                    <div className={`
                        block
                        w-full
                        h-full
                        absolute
                        z-[5]
                        top-0
                        left-0
                        bg-no-repeat
                        bg-center
                        bg-cover
                        opacity-[.5]
                        ${rideRequest.driver === driver._id ? "scale-[2]" : ""}
                        duration-[.2s]
                        ease-in-out
                    `} style={{backgroundImage: `url(${RippleThick})`}}></div>
                </div>
                {
                    (!inactive && !uaNearbyDrivers.includes(driver._id)) ?
                    <button type="button" className={`
                        block
                        w-[90px]
                        h-[35px]
                        overflow-hidden
                        bg-[rgba(100,100,200,.2)]
                        active:bg-[rgba(100,100,200,.3)]
                        absolute
                        top-1/2
                        -translate-y-1/2
                        right-0
                        rounded-[4px]
                        font-defaultBold
                        text-center
                        text-[12px]
                        text-[#111111]
                    `} onClick={
                        rideRequest.driver === driver._id ?
                        abortRideRequest :
                        rideRequest.loading === driver._id ?
                        null :
                        requestARide
                    }>
                        <span className="relative z-[20]">{rideRequest.driver === driver._id ? "Abort" : rideRequest.loading === driver._id ? "..." : "Request"}</span>
                        {
                            rideRequest.driver === driver._id ?
                            <span className={`
                                block
                                h-full
                                absolute
                                z-[10]
                                bg-[rgba(200,20,20,.5)]
                                top-0
                                left-0
                            `} style={{
                                width: `${100-(Math.round((rideRequest.counter/rideRequest.timeout)*100))}%`
                            }}></span> : ""
                        }
                    </button> : ""
                }
                {
                    uaNearbyDrivers.includes(driver._id) ?
                    <div className="
                        block
                        w-[90px]
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
                    ">U/A</div> : ""
                }
                <h2 className={`
                    block
                    w-full
                    font-defaultBold
                    text-left
                    text-[13px]
                    2xs:text-[15px]
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
                    rideRequest.driver === driver._id ?
                    "Requesting..." :
                    `${driver.gender} | ${driver.age} | ${timeInMinutes ? `${timeInMinutes} min${timeInMinutes > 1 ? "s" : ""} away` : "..."}`
                }</h3>
            </div>
        </div>
    )

}

export default NearbyDriver