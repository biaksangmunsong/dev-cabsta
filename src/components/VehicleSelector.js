import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import useStore from "../store"
import { useInputStore, useUserStore } from "../store"
import Pricing from "./Pricing"
import LeftArrow from "./icons/LeftArrow"
import DistanceIcon from "./icons/Distance"
import ClockIcon from "./icons/Clock"
import Scooter from "./icons/Scooter"
import Car from "./icons/Car"
import LongRightArrow from "./icons/LongRightArrow"
import Exclamation from "./icons/Exclamation"
import Spinner from "../images/spinner.gif"

const VehicleSelector = () => {
    
    const location = useLocation()
    const navigate = useNavigate()
    const viewport = useStore(state => state.viewport)
    const locationQueries = useStore(state => state.locationQueries)
    const pickupLocation = useInputStore(state => state.pickupLocation)
    const destination = useInputStore(state => state.destination)
    const distanceMatrix = useInputStore(state => state.distanceMatrix)
    const setDistanceMatrix = useInputStore(state => state.setDistanceMatrix)
    const vehicleType = useInputStore(state => state.vehicleType)
    const setVehicleType = useInputStore(state => state.setVehicleType)
    const authToken = useUserStore(state => state.authToken)
    const resetUserData = useUserStore(state => state.reset)
    const [ data, setData ] = useState({
        init: false,
        loading: false,
        error: null,
        data: null
    })
    const pricingScrollableArea = useRef(null)

    const onVehicleTypeSelected = type => {
        setVehicleType(type)
    }

    const getData = useCallback(async () => {
        if (!authToken || data.loading || !pickupLocation || !destination) return
        
        setData({
            init: true,
            loading: true,
            error: null,
            data: null
        })

        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-vehicle-selector-page-data?pickupLocationLat=${pickupLocation.coords.lat}&pickupLocationLng=${pickupLocation.coords.lng}&destinationLat=${destination.coords.lat}&destinationLng=${destination.coords.lng}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            
            if (res.status !== 200 || !res.data){
                return setData({
                    init: true,
                    loading: false,
                    error: {
                        message: "Something went wrong! Please try again."
                    },
                    data: null
                })
            }
            
            setDistanceMatrix({
                distance: res.data.distance,
                duration: res.data.duration
            })
            
            // set price
            setVehicleType({
                ...vehicleType,
                price: vehicleType.type === "two-wheeler" ? res.data.price.twoWheeler : res.data.price.fourWheeler
            })
            
            setData({
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
            setData({
                init: true,
                loading: false,
                error: {
                    status: (err && err.response && err.response.status) ? err.response.status : 0,
                    message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong! Please try again."
                },
                data: null
            })
        }
    }, [data, pickupLocation, destination, vehicleType, setVehicleType, setDistanceMatrix, authToken, resetUserData])
    
    const retryGettingData = () => {
        getData()
    }

    const continueToRideDetails = () => {
        if (!vehicleType.price || !data.data || !data.data.price || !distanceMatrix) return
        navigate("/ride-details")
    }
    
    useEffect(() => {
        if (location.pathname === "/choose-vehicle"){
            if (!data.init){
                setTimeout(() => {
                    if (window.location.pathname.includes("/choose-vehicle")){
                        getData()
                    }
                }, 200)
            }
        }
        else if (location.pathname === "/set-location"){
            if (data.init){
                setData({
                    init: false,
                    loading: false,
                    error: null,
                    data: null
                })
            }
        }
    }, [getData, location.pathname, data.init])

    useEffect(() => {
        if (locationQueries.includes("pricing-details") && pricingScrollableArea.current){
            pricingScrollableArea.current.scrollTo(0,0)
        }
    }, [locationQueries])
    
    return (
        <div className={`
            block
            w-full
            h-full
            overflow-hidden
            pb-[100px]
            absolute
            z-[20]
            ${location.pathname === "/choose-vehicle" ? "top-0" : "top-full"}
            left-0
            duration-[.2s]
            ease-in-out
        `}>
            <div className={`
                block
                w-full
                h-full
                pt-[50px]
                overflow-hidden
                absolute
                z-[30]
                ${locationQueries.includes("pricing-details") ? "scale-[1] top-0" : "scale-[0] top-full"}
                left-0
                bg-[#ffffff]
                duration-[.2s]
                ease-in-out
            `}>
                <div className="
                    block
                    w-full
                    h-[50px]
                    bg-[#ffffff]
                    border-b
                    border-solid
                    border-[#dddddd]
                    absolute
                    z-[20]
                    top-0
                    left-0
                ">
                    <div className="
                        block
                        w-[94%]
                        max-w-[1000px]
                        mx-auto
                        relative
                    ">
                        <button type="button" className="
                            inline-block
                            align-middle
                            w-[50px]
                            h-[50px]
                            p-[16px]
                            -translate-x-[16px]
                            active:bg-[#eeeeee]
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
                        ">Pricing</div>
                    </div>
                </div>
                <div className="
                    block
                    w-full
                    h-full
                    overflow-auto
                    relative
                    z-[10]
                    py-[30px]
                " ref={pricingScrollableArea}>
                    <div className="
                        block
                        w-[94%]
                        max-w-[1000px]
                        mx-auto
                    ">
                        <Pricing/>
                    </div>
                </div>
            </div>
            <div className="
                block
                w-full
                h-full
                overflow-auto
            ">
                <div className={`
                    block
                    w-full
                    p-[10px]
                `} style={{height: `${(viewport.height/10)*4}px`}}>
                    <button type="button" className="
                        block
                        w-[40px]
                        h-[40px]
                        bg-[#ffffff]
                        rounded-[50%]
                        shadow-lg
                        p-[10px]
                        active:bg-[#eeeeee]
                    " onClick={() => window.history.back()}>
                        <LeftArrow color="#111111"/>
                    </button>
                </div>
                <div className="
                    block
                    w-full
                    mx-auto
                    border-t
                    border-solid
                    border-[#cccccc]
                    bg-[#ffffff]
                ">
                    {
                        data.loading ?
                        <div className="
                            block
                            w-[94%]
                            max-w-[300px]
                            mx-auto
                            text-center
                            py-[50px]
                        ">
                            <img src={Spinner} alt="" className="
                                block
                                w-[30px]
                                mx-auto
                                mb-[6px]
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
                            ">Please wait...</div>
                        </div> : ""
                    }
                    {
                        data.error ?
                        <div className="
                            block
                            w-[94%]
                            max-w-[300px]
                            mx-auto
                            text-center
                            py-[50px]
                        ">
                            <div className="
                                block
                                w-[60px]
                                mx-auto
                                mb-[10px]
                                bg-[#888888]
                                rounded-[50%]
                                p-[12px]
                            ">
                                <Exclamation color="#ffffff"/>
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
                            ">{data.error.message}</div>
                            {
                                data.error.status !== 406 ?
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
                                    mt-[20px]
                                    active:opacity-[.8]
                                " onClick={retryGettingData}>Retry</button> : ""
                            }
                        </div> : ""
                    }
                    {
                        (data.data && data.data.price) ?
                        <div className="
                            block
                            w-[94%]
                            max-w-[1000px]
                            mx-auto
                            py-[20px]
                        ">
                            <div className="
                                block
                                w-full
                                mb-[20px]
                                pb-[20px]
                                border-b
                                border-solid
                                border-[#cccccc]
                            ">
                                <div className="
                                    inline-block
                                    align-middle
                                    pl-[40px]
                                    2xs:pl-[50px]
                                    relative
                                    mr-[22px]
                                ">
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#888888]
                                        text-[11px]
                                        2xs:text-[12px]
                                        leading-[16px]
                                    ">Distance</div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[18px]
                                        2xs:text-[20px]
                                        leading-[23px]
                                        2xs:leading-[25px]
                                    ">{data.data.distance.text}</div>
                                    <div className="
                                        block
                                        w-[35px]
                                        2xs:w-[40px]
                                        absolute
                                        top-1/2
                                        -translate-y-1/2
                                        left-0
                                    ">
                                        <DistanceIcon color="#8a2be2"/>
                                    </div>
                                </div>
                                <div className="
                                    inline-block
                                    align-middle
                                    pl-[55px]
                                    2xs:pl-[65px]
                                    relative
                                    border-l
                                    border-solid
                                    border-[#cccccc]
                                ">
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#888888]
                                        text-[11px]
                                        2xs:text-[12px]
                                        leading-[16px]
                                    ">Estimated Time</div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[18px]
                                        2xs:text-[20px]
                                        leading-[23px]
                                        2xs:leading-[25px]
                                    ">{data.data.duration.text}</div>
                                    <div className="
                                        block
                                        w-[35px]
                                        2xs:w-[40px]
                                        absolute
                                        top-1/2
                                        -translate-y-1/2
                                        left-[15px]
                                    ">
                                        <ClockIcon color="#8a2be2"/>
                                    </div>
                                </div>
                                {
                                    (data.data && data.data.note) ?
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#888888]
                                        text-[10px]
                                        2xs:text-[12px]
                                        mt-[20px]
                                    "><strong className="font-defaultBold">Note:</strong> {data.data.note}</div> : ""
                                }
                            </div>
                            <div className="
                                block
                                w-full
                                font-defaultRegular
                                text-left
                                text-[#111111]
                                text-[14px]
                                2xs:text-[16px]
                                leading-[20px]
                                2xs:leading-[22px]
                                mb-[20px]
                            ">
                                <span>Choose Vehicle Type</span>
                                <Link to="/choose-vehicle?pricing-details" className="
                                    inline-block
                                    float-right
                                    text-[75%]
                                    text-[#8a2be2]
                                    active:underline
                                ">See Pricing Details</Link>
                            </div>
                            <div className={`
                                block
                                w-full
                                px-[15px]
                                py-[20px]
                                pr-[15px]
                                3xs:pr-[60px]
                                rounded-[6px]
                                border-[2px]
                                border-solid
                                ${vehicleType.type === "two-wheeler" ? "border-[#8a2be2] bg-[#eeeeee]" : "border-[#cccccc] bg-[#ffffff]"}
                                relative
                                mb-[10px]
                            `} onClick={() => onVehicleTypeSelected({
                                type: "two-wheeler",
                                price: data.data.price.twoWheeler
                            })}>
                                <div className="
                                    block
                                    w-full
                                    font-defaultBold
                                    text-left
                                    text-[#111111]
                                    text-[18px]
                                    2xs:text-[20px]
                                    leading-[23px]
                                    2xs:leading-[25px]
                                ">Two Wheeler - ₹{data.data.price.twoWheeler}</div>
                                <div className="
                                    block
                                    w-full
                                    font-defaultRegular
                                    text-left
                                    text-[#888888]
                                    text-[12px]
                                    2xs:text-[14px]
                                    leading-[18px]
                                    2xs:leading-[20px]
                                ">Single Pillion</div>
                                <div className="
                                    hidden
                                    3xs:block
                                    w-[50px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    right-[10px]
                                ">
                                    <Scooter color="#111111"/>
                                </div>
                            </div>
                            <div className={`
                                block
                                w-full
                                px-[15px]
                                py-[20px]
                                pr-[15px]
                                3xs:pr-[60px]
                                rounded-[6px]
                                border-[2px]
                                border-solid
                                ${vehicleType.type === "four-wheeler" ? "border-[#8a2be2] bg-[#eeeeee]" : "border-[#cccccc] bg-[#ffffff]"}
                                relative
                            `} onClick={() => onVehicleTypeSelected({
                                type: "four-wheeler",
                                price: data.data.price.fourWheeler
                            })}>
                                <div className="
                                    block
                                    w-full
                                    font-defaultBold
                                    text-left
                                    text-[#111111]
                                    text-[18px]
                                    2xs:text-[20px]
                                    leading-[23px]
                                    2xs:leading-[25px]
                                ">Four Wheeler - ₹{data.data.price.fourWheeler}</div>
                                <div className="
                                    block
                                    w-full
                                    font-defaultRegular
                                    text-left
                                    text-[#888888]
                                    text-[12px]
                                    2xs:text-[14px]
                                    leading-[18px]
                                    2xs:leading-[20px]
                                ">Multiple Seats</div>
                                <div className="
                                    hidden
                                    3xs:block
                                    w-[50px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    right-[10px]
                                ">
                                    <Car color="#111111"/>
                                </div>
                            </div>
                        </div> : ""
                    }
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
                    ${(vehicleType.price && (data.data && data.data.price) && distanceMatrix) ? "bg-[#111111] active:bg-[#333333]" : "bg-[#888888]"}
                `} onClick={continueToRideDetails}>
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

export default VehicleSelector