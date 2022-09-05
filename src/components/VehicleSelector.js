import { useState, useEffect, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import useStore from "../store"
import { useInputStore } from "../store"
import LeftArrow from "./icons/LeftArrow"
import DistanceIcon from "./icons/Distance"
import ClockIcon from "./icons/Clock"
import Scooter from "./icons/Scooter"
import Car from "./icons/Car"
import LongRightArrow from "./icons/LongRightArrow"
import SadFace from "./icons/SadFace"
import Spinner from "../images/spinner.gif"

const getPrice = (pricing, distanceInMetres, vehicleType) => {
    let price = 0
    const distanceInKm = Math.round(distanceInMetres/1000)
    if (vehicleType === "two-wheeler"){
        price = pricing.twoWheeler.base
        price += pricing.twoWheeler.perKm*distanceInKm
    }
    else if (vehicleType === "four-wheeler"){
        price = pricing.fourWheeler.base
        price += pricing.fourWheeler.perKm*distanceInKm
    }
    
    return price
}

const VehicleSelector = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const viewport = useStore(state => state.viewport)
    const pickupLocation = useInputStore(state => state.pickupLocation)
    const destination = useInputStore(state => state.destination)
    const distanceMatrix = useInputStore(state => state.distanceMatrix)
    const setDistanceMatrix = useInputStore(state => state.setDistanceMatrix)
    const vehicleType = useInputStore(state => state.vehicleType)
    const setVehicleType = useInputStore(state => state.setVehicleType)
    const [ data, setData ] = useState({
        init: false,
        loading: false,
        error: null,
        data: null
    })

    const onVehicleTypeSelected = type => {
        setVehicleType(type)
    }

    const getData = useCallback(async () => {
        if (data.loading || !pickupLocation || !destination){
            return
        }
        
        setData({
            init: true,
            loading: true,
            error: null,
            data: null
        })

        try {
            const distanceMatrix = new window.google.maps.DistanceMatrixService()
            distanceMatrix.getDistanceMatrix({
                origins: [`${pickupLocation.coords.lat},${pickupLocation.coords.lng}`],
                destinations: [`${destination.coords.lat},${destination.coords.lng}`],
                travelMode: "DRIVING",
                unitSystem: window.google.maps.UnitSystem.METRIC
            }, (res, status) => {
                if (status === "OK"){
                    res.pricing = {
                        twoWheeler: {
                            base: 10,
                            perKm: 10
                        },
                        fourWheeler: {
                            base: 20,
                            perKm: 20
                        }
                    }

                    setDistanceMatrix({
                        distance: res.rows[0].elements[0].distance,
                        duration: res.rows[0].elements[0].duration
                    })

                    // set price
                    setVehicleType({
                        ...vehicleType,
                        price: getPrice(res.pricing, res.rows[0].elements[0].distance.value, vehicleType.type)
                    })

                    setData({
                        init: true,
                        loading: false,
                        error: null,
                        data: res
                    })
                }
                else {
                    setData({
                        init: true,
                        loading: false,
                        error: {
                            message: "Can't get directions, please choose different locations."
                        },
                        data: null
                    })
                }
            })
            // const res = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destination.lat},${destination.lng}&origins=${pickupLocation.lat},${pickupLocation.lng}&units=metric&key=${staticData.googleMapsApiKey}`)
        }
        catch {
            setData({
                init: true,
                loading: false,
                error: {
                    message: "Oops, something went wrong! Please try again."
                },
                data: null
            })
        }
    }, [data, pickupLocation, destination, vehicleType, setVehicleType, setDistanceMatrix])

    const retryGettingData = () => {
        getData()
    }

    const continueToCheckout = () => {
        if (!vehicleType.price || !data.data || !distanceMatrix){
            return
        }
        navigate("/checkout")
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
                            ">{data.error.message}</div>
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
                            " onClick={retryGettingData}>Retry</button>
                        </div> : ""
                    }
                    {
                        data.data ?
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
                                    ">{data.data.rows[0].elements[0].distance.text}</div>
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
                                    ">{data.data.rows[0].elements[0].duration.text}</div>
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
                            </div>
                            <div className="
                                block
                                w-full
                                font-defaultRegular
                                text-left
                                text-[#111111]
                                text-[14px]
                                2xs:text-[16px]
                                leading-[23px]
                                2xs:leading-[25px]
                                mb-[20px]
                            ">Choose Vehicle Type</div>
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
                                price: getPrice(data.data.pricing, data.data.rows[0].elements[0].distance.value, "two-wheeler")
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
                                ">Two Wheeler - ₹{getPrice(data.data.pricing, data.data.rows[0].elements[0].distance.value, "two-wheeler")}</div>
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
                                ">One passenger</div>
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
                                price: getPrice(data.data.pricing, data.data.rows[0].elements[0].distance.value, "four-wheeler")
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
                                ">Four Wheeler - ₹{getPrice(data.data.pricing, data.data.rows[0].elements[0].distance.value, "four-wheeler")}</div>
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
                                ">Upto four passenger</div>
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
                    ${(vehicleType.price && data.data && distanceMatrix) ? "bg-[#111111] active:bg-[#333333]" : "bg-[#888888]"}
                `} onClick={continueToCheckout}>
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