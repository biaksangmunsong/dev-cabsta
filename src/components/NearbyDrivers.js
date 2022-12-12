import { useEffect, useRef, useCallback } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import { Haptics } from "@capacitor/haptics"
import useStore from "../store"
import { useUserStore } from "../store"
import { useInputStore } from "../store"
import NearbyDriver from "./NearbyDriver"
import LeftArrow from "./icons/LeftArrow"
import SadFace from "./icons/SadFace"
import EmptyIcon from "./icons/Empty"
import RefreshIcon from "./icons/Refresh"
import Ripple from "../images/ripple.gif"
import PickupPin from "../images/pickup-pin.png"

const NearbyDrivers = () => {

    const location = useLocation()
    const authToken = useUserStore(state => state.authToken)
    const resetUserData = useUserStore(state => state.reset)
    const pickupLocation = useInputStore(state => state.pickupLocation)
    const destination = useInputStore(state => state.destination)
    const vehicleType = useInputStore(state => state.vehicleType)
    const nearbyDrivers = useStore(state => state.nearbyDrivers)
    const resetRideRequest = useStore(state => state.resetRideRequest)
    const resetNearbyDrivers = useStore(state => state.resetNearbyDrivers)
    const setNearbyDrivers = useStore(state => state.setNearbyDrivers)
    const rideRequest = useStore(state => state.rideRequest)
    const setRideRequest = useStore(state => state.setRideRequest)
    const resetUaNearbyDrivers = useStore(state => state.resetUaNearbyDrivers)
    const setNotResponsiveDrivers = useStore(state => state.setNotResponsiveDrivers)
    const resetNotResponsiveDrivers = useStore(state => state.resetNotResponsiveDrivers)
    
    const rideRequestRef = useRef(null)
    useEffect(() => {
        rideRequestRef.current = rideRequest
    }, [rideRequest])

    const getNearbyDrivers = useCallback(async () => {
        if (!authToken || !pickupLocation || !destination || !location.pathname.startsWith("/nearby-driver") || rideRequest.loading || rideRequest.driver) return
        
        setNearbyDrivers({
            init: true,
            loading: true,
            error: null,
            data: null
        })

        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-active-drivers?pickupLocationLat=${pickupLocation.coords.lat}&pickupLocationLng=${pickupLocation.coords.lng}&destinationLat=${destination.coords.lat}&destinationLng=${destination.coords.lng}&vehicleType=${vehicleType.type}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })

            if (res.status !== 200 || !res.data){
                return setNearbyDrivers({
                    init: true,
                    loading: false,
                    error: {
                        message: "Something went wrong! Please try again."
                    },
                    data: null
                })
            }

            setNearbyDrivers({
                init: true,
                loading: false,
                error: null,
                data: res.data
            })
        }
        catch (err){
            if (err && err.response && err.response.data && err.response.data.code && err.response.data.code === "credential-expired"){
                // alert user that they have to reauthenticate and sign out
                alert(err.response.data.message)
                return resetUserData()
            }
            setNearbyDrivers({
                init: true,
                loading: false,
                error: {
                    message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong! Please try again."
                },
                data: null
            })
        }
    }, [authToken, pickupLocation, destination, resetUserData, setNearbyDrivers, location.pathname, vehicleType.type, rideRequest.loading, rideRequest.driver])

    const refresh = () => {
        resetRideRequest()
        resetUaNearbyDrivers()
        resetNotResponsiveDrivers()
        getNearbyDrivers()
    }
    
    useEffect(() => {
        if (!location.pathname.startsWith("/nearby-driver")){
            resetNearbyDrivers()
        }
        else {
            if (!nearbyDrivers.init){
                getNearbyDrivers()
            }
        }
    }, [getNearbyDrivers, nearbyDrivers.init, location.pathname, resetNearbyDrivers])

    useEffect(() => {
        if (location.pathname !== "/nearby-drivers"){
            // abort ride request
            resetRideRequest()
            if ((rideRequest.loading || rideRequest.driver) && window.socket && window.socket.connected){
                window.socket.volatile.emit(
                    "abort-a-ride-request",
                    rideRequest.loading || rideRequest.driver
                )
            }

            // reset unavailable drivers list
            resetUaNearbyDrivers()
            // reset not responsive drivers list
            resetNotResponsiveDrivers()
        }
    }, [location.pathname, resetRideRequest, resetUaNearbyDrivers, resetNotResponsiveDrivers, rideRequest.loading, rideRequest.driver])

    useEffect(() => {
        if (location.pathname === "/nearby-drivers" && rideRequest.error && rideRequest.error.code === "driver_unavailable"){
            getNearbyDrivers()
        }
    }, [location.pathname, getNearbyDrivers, rideRequest.error])
    
    useEffect(() => {
        if (rideRequest.ttl.start){
            if (rideRequest.ttl.value){
                window.requestTimeout = setTimeout(() => {
                    if (rideRequestRef.current && rideRequestRef.current.driver){
                        setRideRequest({
                            ttl: {
                                ...rideRequest.ttl,
                                value: rideRequest.ttl.value-1
                            }
                        })
                    }
                }, 1000)
            }
            else {
                if (rideRequestRef.current){
                    setNotResponsiveDrivers([rideRequestRef.current.driver])
    
                    if (window.socket && window.socket.connected){
                        window.socket.emit("broadcast-driver-unresponsive", rideRequestRef.current.driver)
                    }
                }
                resetRideRequest()
                Haptics.notification({type: "ERROR"})
            }
        }
    }, [rideRequest.ttl, setRideRequest, resetRideRequest, setNotResponsiveDrivers])
    
    return (
        <div className={`
            block
            w-full
            h-full
            overflow-hidden
            bg-[#dddddd]
            absolute
            ${location.pathname.startsWith("/nearby-driver") ? "top-0" : "top-full"}
            left-0
            z-[30]
            duration-[.2s]
            ease-in-out
        `}>
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
                        -translate-x-[15px]
                    " onClick={e => e.preventDefault()}>Drivers</div>
                    {
                        vehicleType.price ?
                        <div className="
                            inline-block
                            absolute
                            top-1/2
                            -translate-y-1/2
                            right-0
                            font-defaultBold
                            text-left
                            text-[#8a2be2]
                            text-[14px]
                            2xs:text-[16px]
                            mb-[10px]
                        ">₹{vehicleType.price}</div> : ""
                    }
                </div>
            </div>
            <div className="
                block
                w-full
                h-full
                overflow-auto
                pt-[55px]
                pb-[82px]
            ">
                {
                    (nearbyDrivers.data && nearbyDrivers.data.drivers.length && !rideRequest.loading && !rideRequest.driver) ?
                    <button type="button" className="
                        inline-block
                        px-[15px]
                        h-[32px]
                        rounded-[5px]
                        bg-[#a9effe]
                        active:bg-[#87ceeb]
                        font-defaultRegular
                        text-[center]
                        text-[11px]
                        2xs:text-[13px]
                        text-[#8a2be2]
                        absolute
                        z-[20]
                        bottom-[25px]
                        left-1/2
                        -translate-x-1/2
                        border
                        border-solid
                        border-[#8a2be2]
                    " onClick={refresh}>
                        <div className="
                            inline-block
                            align-middle
                            w-[15px]
                            h-[15px]
                            mr-[10px]
                        ">
                            <RefreshIcon color="#8a2be2"/>
                        </div>
                        Refresh
                    </button> : ""
                }
                <div className={`
                    block
                    w-full
                    max-w-[1000px]
                    mx-auto
                    relative z-[10]
                `}>
                    {
                        nearbyDrivers.loading ?
                        <div className="
                            block
                            w-full
                            py-[50px]
                        ">
                            <div className="
                                block
                                w-[80px]
                                h-[80px]
                                relative
                                mx-auto
                            ">
                                <img src={Ripple} alt="" className="
                                    block
                                    w-[80px]
                                    h-[80px]
                                    absolute
                                    top-1/2
                                    left-1/2
                                    -translate-y-1/2
                                    -translate-x-1/2
                                "/>
                                <img src={PickupPin} alt="" className="
                                    block
                                    w-[50px]
                                    h-[50px]
                                    absolute
                                    top-1/2
                                    left-1/2
                                    -translate-y-full
                                    -translate-x-1/2
                                "/>
                            </div>
                            <div className="
                                block
                                w-full
                                font-defaultRegular
                                text-center
                                text-[#444444]
                                text-[14px]
                                2xs:text-[16px]
                            ">Searching for drivers <br/>near pickup location...</div>
                        </div> : ""
                    }
                    {
                        nearbyDrivers.error ?
                        <div className="
                            block
                            w-full
                            py-[40px]
                        ">
                            <div className="
                                block
                                w-[80px]
                                h-[80px]
                                mx-auto
                                mb-[10px]
                            ">
                                <SadFace/>
                            </div>
                            <div className="
                                block
                                w-full
                                font-defaultRegular
                                text-center
                                text-[#111111]
                                text-[14px]
                                2xs:text-[16px]
                                leading-[20px]
                                mb-[20px]
                            ">{nearbyDrivers.error.message}</div>
                            <button type="button" className="
                                block
                                w-full
                                max-w-[120px]
                                h-[40px]
                                bg-[#8a2be2]
                                mx-auto
                                font-defaultRegular
                                text-center
                                text-[#ffffff]
                                text-[12px]
                                2xs:text-[14px]
                                rounded-[4px]
                                active:opacity-[.8]
                            " onClick={getNearbyDrivers}>Retry</button>
                        </div> : ""
                    }
                    {
                        nearbyDrivers.data ?
                        <div className="
                            block
                            w-full
                        ">
                            {
                                nearbyDrivers.data.drivers.length ?
                                <div className="
                                    block
                                    w-full
                                ">
                                    {
                                        rideRequest.error ?
                                        <div className={`
                                            block
                                            w-full
                                            mb-[5px]
                                            sticky
                                            top-0
                                            z-[20]
                                        `}>
                                            <div className="
                                                block
                                                w-[94%]
                                                mx-auto
                                                bg-[#cd5c5c]
                                                p-[10px]
                                                rounded-[5px]
                                                font-defaultRegular
                                                text-[12px]
                                                2xs:text-[14px]
                                                text-[#ffffff]
                                                text-left
                                            ">{rideRequest.error.message}</div>
                                        </div> : ""
                                    }
                                    {
                                        nearbyDrivers.data.drivers.map(d => {
                                            return <NearbyDriver driver={d} key={d._id}/>
                                        })
                                    }
                                </div> :
                                <div className="
                                    block
                                    w-full
                                    py-[20px]
                                ">
                                    <div className="
                                        block
                                        w-[50px]
                                        h-[50px]
                                        mx-auto
                                        mb-[10px]
                                    ">
                                        <EmptyIcon/>
                                    </div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-center
                                        text-[#111111]
                                        text-[14px]
                                        2xs:text-[16px]
                                        leading-[20px]
                                        mb-[20px]
                                    ">There are no drivers available <br/>near pickup location.</div>
                                    <button type="button" className="
                                        block
                                        w-full
                                        max-w-[120px]
                                        h-[40px]
                                        bg-[#8a2be2]
                                        mx-auto
                                        font-defaultRegular
                                        text-center
                                        text-[#ffffff]
                                        text-[12px]
                                        2xs:text-[14px]
                                        rounded-[4px]
                                        active:opacity-[.8]
                                    " onClick={refresh}>Refresh</button>
                                </div>
                            }
                        </div> : ""
                    }
                </div>
            </div>
        </div>
    )

}

export default NearbyDrivers