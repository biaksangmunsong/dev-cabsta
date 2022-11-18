import { useEffect, useCallback } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import useStore from "../store"
import { useUserStore } from "../store"
import { useInputStore } from "../store"
// import { Storage } from "@capacitor/storage"
// import LongRightArrow from "./icons/LongRightArrow"
import LeftArrow from "./icons/LeftArrow"
import SadFace from "./icons/SadFace"
import Ripple from "../images/ripple.gif"
import PickupPin from "../images/pickup-pin.png"

const Checkout = () => {

    const location = useLocation()
    const authToken = useUserStore(state => state.authToken)
    const resetUserData = useUserStore(state => state.reset)
    const pickupLocation = useInputStore(state => state.pickupLocation)
    const destination = useInputStore(state => state.destination)
    const vehicleType = useInputStore(state => state.vehicleType)
    const nearbyDrivers = useStore(state => state.nearbyDrivers)
    const resetNearbyDrivers = useStore(state => state.resetNearbyDrivers)
    const setNearbyDrivers = useStore(state => state.setNearbyDrivers)

    const getNearbyDrivers = useCallback(async () => {
        if (!authToken || !pickupLocation || !destination || location.pathname !== "/checkout") return
        
        setNearbyDrivers({
            init: true,
            loading: true,
            error: null,
            data: null
        })

        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-active-drivers?pickupLocationLat=${pickupLocation.coords.lat}&pickupLocationLng=${pickupLocation.coords.lng}&destinationLat=${destination.coords.lat}&destinationLng=${destination.coords.lng}`, {
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
    }, [authToken, pickupLocation, destination, resetUserData, setNearbyDrivers, location.pathname])

    useEffect(() => {
        if (location.pathname !== "/checkout"){
            resetNearbyDrivers()
        }
        else {
            if (!nearbyDrivers.init){
                getNearbyDrivers()
            }
        }
    }, [getNearbyDrivers, nearbyDrivers.init, location.pathname, resetNearbyDrivers])
    
    return (
        <div className={`
            block
            w-full
            h-full
            overflow-hidden
            bg-[#ffffff]
            absolute
            ${location.pathname === "/checkout" ? "top-0" : "top-full"}
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
                    " onClick={e => e.preventDefault()}>Select a Driver</div>
                    <div className="
                        hidden
                        3xs:inline-block
                        align-middle
                        font-defaultBold
                        text-[#8a2be2]
                        text-[18px]
                        leading-[50px]
                        float-right
                    " onClick={e => e.preventDefault()}>₹{vehicleType.price}</div>
                </div>
            </div>
            <div className="
                block
                w-full
                h-full
                overflow-auto
                pt-[50px]
                absolute
                z-[10]
                top-0
                left-0
            ">
                <div className="
                    block
                    w-[94%]
                    max-w-[1000px]
                    mx-auto
                    py-[30px]
                ">
                    {
                        nearbyDrivers.loading ?
                        <div className="
                            block
                            w-full
                            py-[30px]
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
                            py-[10px]
                        ">
                            <div className="
                                block
                                w-[60px]
                                h-[60px]
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
                </div>
            </div>
        </div>
    )

}

export default Checkout