import { useState, useEffect, useCallback, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useParams } from "react-router-dom"
import useStore from "../store"
import { useUserStore } from "../store"
import CancellationPrompt from "../components/CancellationPrompt"
import RideHistoryItem from "../components/RideHistoryItem"
import LeftArrow from "../components/icons/LeftArrow"
import RippleThick from "../images/ripple-thick.gif"
import PickupPin from "../images/pickup-pin.png"
import DestinationPin from "../images/destination-pin.png"
import SadFace from "../components/icons/SadFace"
import ChevronDown from "../components/icons/ChevronDown"
import PhoneIcon from "../components/icons/Phone"
import CheckIcon from "../components/icons/Check"
import mpsToKmph from "../lib/mpsToKmph"

const Ride = () => {

    const params = useParams()
    const navigate = useNavigate()
    const [ data, setData ] = useState({
        loading: false,
        error: null,
        data: null
    })
    const [ showRequestedAcceptedPrompt, setShowRequestAcceptedPrompt ] = useState(true)
    const initiated = useRef(false)
    const mapsRef = useRef(null)
    const mapsContainerRef = useRef(null)
    const scrollableArea = useRef(null)
    const pickupMarker = useRef(null)
    const destinationMarker = useRef(null)
    const driversMarker = useRef(null)
    const driversInfoWindow = useRef(null)
    const driversRippleMarker = useRef(null)
    const directionsRenderer = useRef(null)
    const directionsService = useRef(null)
    const authToken = useUserStore(state => state.authToken)
    const resetUserData = useUserStore(state => state.reset)
    const googleMapsScriptLoaded = useStore(state => state.googleMapsScriptLoaded)
    const locationQueries = useStore(state => state.locationQueries)
    const driversLiveLocation = useStore(state => state.driversLiveLocation)
    const setDriversLiveLocation = useStore(state => state.setDriversLiveLocation)
    
    const getData = useCallback(async () => {
        if (data.loading || !authToken || !params.rideId) return
        
        setData({
            loading: true,
            error: null,
            data: null
        })
        
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-ride-details?rideId=${params.rideId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            if (res.status === 200 && res.data){
                setData({
                    loading: false,
                    error: null,
                    data: res.data
                })
                if (res.data.driversLiveLocation){
                    setDriversLiveLocation(res.data.driversLiveLocation)
                }
            }
            else {
                setData({
                    loading: false,
                    error: {
                        message: "Something went wrong, please try again."
                    },
                    data: null
                })
            }
        }
        catch (err){
            if (err && err.response && err.response.data && err.response.data.code && err.response.data.code === "credential-expired"){
                // alert user that they have to reauthenticate and sign out
                alert(err.response.data.message)
                return resetUserData()
            }
            setData({
                loading: false,
                error: {
                    message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
                },
                data: null
            })
        }
    }, [data.loading, authToken, resetUserData, params.rideId, setDriversLiveLocation])

    const startTracking = () => {
        setShowRequestAcceptedPrompt(false)
    }
    
    useEffect(() => {
        if (!authToken){
            navigate("/", {replace: true})
        }
    }, [authToken, navigate])

    useEffect(() => {
        return () => {
            // cleanup function
            setDriversLiveLocation(null)
            if (driversMarker.current){
                driversMarker.current.setMap(null)
                driversMarker.current = null
            }
            if (driversRippleMarker.current){
                driversRippleMarker.current.setMap(null)
                driversRippleMarker.current = null
            }
            if (driversInfoWindow.current){
                driversInfoWindow.current.setMap(null)
                driversInfoWindow.current = null
            }
        }
    }, [setDriversLiveLocation])
    
    useEffect(() => {
        if (!initiated.current && params.rideId){
            initiated.current = true
            
            if (window.acceptedRideRequestData && window.acceptedRideRequestData._id === params.rideId){
                setDriversLiveLocation(window.acceptedRideRequestData.driversLiveLocation)
                setShowRequestAcceptedPrompt(true)
                setData({
                    loading: false,
                    error: null,
                    data: window.acceptedRideRequestData
                })
                window.acceptedRideRequestData = undefined
            }
            else {
                setShowRequestAcceptedPrompt(false)
                window.acceptedRideRequestData = undefined
                getData()
            }
        }
    }, [params.rideId, getData, setDriversLiveLocation])
    
    // load maps when data is ready and google maps script is loaded
    useEffect(() => {
        if (googleMapsScriptLoaded && data.data && data.data.status === "initiated" && !mapsRef.current && mapsContainerRef.current && !showRequestedAcceptedPrompt){
            // init maps
            const center = {
                lat: data.data.details.pickupLocation.lat,
                lng: data.data.details.pickupLocation.lng
            }
            let zoom = 18
            
            const mapOptions = {
                center,
                zoom,
                disableDefaultUI: true,
                clickableIcons: false
            }
            mapsRef.current = new window.google.maps.Map(mapsContainerRef.current, mapOptions)
            
            // calculate and display directions
            try {
                const asyncFn = async () => {
                    if (directionsRenderer.current){
                        // destroy current route
                        directionsRenderer.current.setMap(null)
                        directionsRenderer.current = null
                    }

                    const start = new window.google.maps.LatLng(data.data.details.pickupLocation.lat, data.data.details.pickupLocation.lng)
                    const end = new window.google.maps.LatLng(data.data.details.destination.lat, data.data.details.destination.lng)
    
                    directionsRenderer.current = new window.google.maps.DirectionsRenderer({
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeColor: "#000000",
                            strokeWeight: 6
                        },
                        preserveViewport: data.data.status === "initiated" ? true : false
                    })
                    directionsService.current = new window.google.maps.DirectionsService()
                    directionsRenderer.current.setMap(mapsRef.current)
                    
                    const request = {
                        origin: start,
                        destination: end,
                        travelMode: "DRIVING"
                    }
                    const result = await directionsService.current.route(request)
                    if (result.status === "OK" && window.location.pathname === `/history/${data.data._id}`){
                        directionsRenderer.current.setDirections(result)

                        // add markers
                        const pickupCoords = {
                            lat: result.routes[0].legs[0].start_location.lat(),
                            lng: result.routes[0].legs[0].start_location.lng()
                        }
                        const destinationCoords = {
                            lat: result.routes[0].legs[0].end_location.lat(),
                            lng: result.routes[0].legs[0].end_location.lng()
                        }
                        
                        pickupMarker.current = new window.google.maps.Marker({
                            position: pickupCoords,
                            map: mapsRef.current,
                            icon: PickupPin,
                            draggable: false
                        })
                        destinationMarker.current = new window.google.maps.Marker({
                            position: destinationCoords,
                            map: mapsRef.current,
                            icon: DestinationPin,
                            draggable: false
                        })
                    }
                }
                asyncFn()
            }
            catch {}
        }
    }, [googleMapsScriptLoaded, data.data, showRequestedAcceptedPrompt])

    useEffect(() => {
        if (googleMapsScriptLoaded && data.data && data.data.status === "initiated" && driversLiveLocation && mapsRef.current){
            // add or move driver's live location marker
            if (driversRippleMarker.current){
                driversRippleMarker.current.setPosition(driversLiveLocation)
            }
            else {
                driversRippleMarker.current = new window.google.maps.Marker({
                    position: driversLiveLocation,
                    map: mapsRef.current,
                    icon: {
                        url: RippleThick,
                        scaledSize: new window.google.maps.Size(200,200),
                        anchor: new window.google.maps.Point(100,100)
                    },
                    draggable: false
                })
                driversRippleMarker.current.setOpacity(0.5)
            }
            if (driversMarker.current){
                driversMarker.current.setPosition(driversLiveLocation)
            }
            else {
                driversMarker.current = new window.google.maps.Marker({
                    position: driversLiveLocation,
                    map: mapsRef.current,
                    icon: {
                        url: data.data.details.driver.photo.circle_thumbnail_url,
                        scaledSize: new window.google.maps.Size(30,30),
                        anchor: new window.google.maps.Point(15,15)
                    },
                    draggable: false
                })
                
                mapsRef.current.setCenter({
                    lat: driversLiveLocation.lat,
                    lng: driversLiveLocation.lng
                })
            }
            
            // set info window for driver's marker
            const kmph = mpsToKmph(driversLiveLocation.speed)
            const driversInfoWindowContent = `<div class="font-defaultRegular text-[#111111]">${kmph}km/h</div>`
            if (!driversInfoWindow.current){
                driversInfoWindow.current = new window.google.maps.InfoWindow({
                    content: driversInfoWindowContent
                })
                driversInfoWindow.current.open(mapsRef.current,driversMarker.current)
            }
            else {
                driversInfoWindow.current.setContent(driversInfoWindowContent)
            }
        }
    }, [googleMapsScriptLoaded, data.data, driversLiveLocation])

    useEffect(() => {
        if (locationQueries.includes("driver-details") && scrollableArea.current){
            scrollableArea.current.scrollTo(0,0)
        }
    }, [locationQueries])

    useEffect(() => {
        if (locationQueries.includes("driver-details") && data.data && data.data.status !== "initiated"){
            window.history.back()
        }
    }, [locationQueries, data.data])

    useEffect(() => {
        if (data.data){
            if (window.socket && window.socket.connected){
                window.socket.removeAllListeners("drivers-live-location")
                window.socket.removeAllListeners("ride-cancelled")

                window.socket.on("drivers-live-location", location => {
                    if (window.location.pathname.startsWith("/history/")){
                        setDriversLiveLocation(location)
                    }
                })
                window.socket.on("ride-cancelled", d => {
                    if (window.location.pathname.startsWith(`/history/${d.rideId}`)){
                        setData({
                            ...data,
                            data: {
                                ...data.data,
                                status: "cancelled",
                                cancellation: d.cancellation
                            }
                        })
                        setDriversLiveLocation(null)
                    }
                })
                window.socket.on("ride-completed", d => {
                    if (window.location.pathname.startsWith(`/history/${d.rideId}`)){
                        setData({
                            ...data,
                            data: {
                                ...data.data,
                                status: "completed",
                                completedAt: d.completedAt
                            }
                        })
                        setDriversLiveLocation(null)
                    }
                })
            }
        }
    }, [data, setDriversLiveLocation])

    useEffect(() => {
        if (!data.data && window.location.search === "?cancel"){
            window.history.back()
        }
    }, [data.data])
    
    return (
        <div className={`page`}>
            {
                (locationQueries.includes("cancel") && data.data) ?
                <CancellationPrompt
                    data={data}
                    setData={setData}
                /> : ""
            }
            <div className={`
                block
                w-full
                ${locationQueries.includes("driver-details") ? "h-full bg-[#ffffff] overflow-auto pb-[30px]" : "h-0 overflow-visible"}
                absolute
                z-[20]
                top-0
                left-0
                duration-[.2s]
                ease-in-out
            `} ref={scrollableArea}>
                {
                    data.loading ?
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
                <div className={`
                    block
                    w-[94%]
                    max-w-[1000px]
                    mx-auto
                    relative
                    ${locationQueries.includes("driver-details") ? "pt-[65px]" : "pt-[10px] pl-[50px]"}
                    duration-[.2s]
                    ease-in-out
                `}>
                    <button type="button" className={`
                        block
                        w-[45px]
                        h-[45px]
                        absolute
                        top-[10px]
                        left-0
                        p-[11px]
                        ${!locationQueries.includes("driver-details") ? "shadow-xl bg-[#ffffff] rounded-[50%] border border-solid border-[#dddddd]" : ""}
                        duration-[.2s]
                        ease-in-out
                    `} onClick={() => window.history.back()}>
                        <LeftArrow color="#111111"/>
                    </button>
                    {
                        (data.data && data.data.status === "initiated" && !showRequestedAcceptedPrompt) ?
                        <>
                            <Link to="?driver-details" className={`
                                relative
                                ${!locationQueries.includes("driver-details") ? "inline-block max-w-full h-[45px] shadow-xl rounded-[25px] pl-[46px] pr-[40px] bg-[#ffffff] border border-solid border-[#dddddd]" : "flex w-full min-h-[90px] pl-[105px]"}
                                duration-[.2s]
                                ease-in-out
                            `}>
                                <div className={`
                                    block
                                    rounded-[50%]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    ${locationQueries.includes("driver-details") ? "w-[90px] h-[90px] left-0" : "w-[36px] h-[36px] left-[4px]"}
                                    bg-no-repeat
                                    bg-center
                                    bg-cover
                                    duration-[.2s]
                                    ease-in-out
                                `} style={{
                                    backgroundImage: `url(${data.data.details.driver.photo.thumbnail_url})`,
                                    backgroundColor: "#dddddd"
                                }}></div>
                                <div className="
                                    block
                                    w-full
                                    m-auto
                                ">
                                    <div className={`
                                        block
                                        w-full
                                        font-defaultBold
                                        text-left
                                        text-[#8a2be2]
                                        ${!locationQueries.includes("driver-details") ? "overflow-hidden text-ellipsis whitespace-nowrap text-[13px] leading-[40px] pl-[14px]" : "text-[16px] 2xs:text-[18px] pl-[21px]"}
                                        relative
                                    `}>
                                        <span className={`
                                            block
                                            ${locationQueries.includes("driver-details") ? "w-[15px] h-[15px]" : "w-[10px] h-[10px]"}
                                            rounded-[50%]
                                            bg-[#bb0000]
                                            absolute
                                            top-1/2
                                            -translate-y-1/2
                                            left-0
                                            pulse-dot
                                        `}></span>
                                        <span>{data.data.details.driver.name}</span>
                                    </div>
                                    {
                                        locationQueries.includes("driver-details") ?
                                        <div className="
                                            block
                                            w-full
                                            pl-[21px]
                                        ">
                                            <div className="
                                                block
                                                w-full
                                                font-defaultRegular
                                                text-left
                                                text-[#555555]
                                                text-[12px]
                                                2xs:text-[14px]
                                                leading-[20px]
                                                capitalize
                                            ">{data.data.details.driver.age}, {data.data.details.driver.gender}</div>
                                        </div> : ""
                                    }
                                </div>
                                {
                                    !locationQueries.includes("driver-details") ?
                                    <div className="
                                        block
                                        w-[35px]
                                        h-[35px]
                                        absolute
                                        top-1/2
                                        -translate-y-1/2
                                        right-0
                                        p-[10px]
                                    ">
                                        <ChevronDown color="#111111"/>
                                    </div> : ""
                                }
                            </Link>
                            {
                                locationQueries.includes("driver-details") ?
                                <>
                                    <a href={`tel:${data.data.details.driver.phoneNumber}`} target="_blank" rel="noopener noreferrer" className={`
                                        ${locationQueries.includes("driver-details") ? "block" : "hidden"}
                                        w-full
                                        leading-[55px]
                                        font-defaultBold
                                        text-center
                                        text-[14px]
                                        2xs:text-[16px]
                                        text-[#444444]
                                        my-[30px]
                                        relative
                                        active:bg-[#dddddd]
                                        border-[2px]
                                        border-solid
                                        border-[#444444]
                                        rounded-[30px]
                                    `}>
                                        <div className="
                                            block
                                            w-[25px]
                                            h-[25px]
                                            absolute
                                            top-1/2
                                            -translate-y-1/2
                                            left-[15px]
                                        ">
                                            <PhoneIcon color="#444444"/>
                                        </div>
                                        Call Driver
                                    </a>
                                    <div className="
                                        block
                                        w-full
                                        pb-[20px]
                                        border-b
                                        border-solid
                                        border-[#cccccc]
                                    ">
                                        <div className="
                                            block
                                            w-full
                                            relative
                                            z-[10]
                                            overflow-hidden
                                            pl-[20px]
                                        ">
                                            <div className="
                                                block
                                                w-[10px]
                                                h-full
                                                absolute
                                                top-0
                                                mt-[5px]
                                                left-0
                                            ">
                                                <div className="
                                                    block
                                                    w-[10px]
                                                    h-[10px]
                                                    bg-[#111111]
                                                    rounded-[50%]
                                                "></div>
                                                <div className="
                                                    block
                                                    w-[2px]
                                                    h-full
                                                    absolute
                                                    top-[14px]
                                                    left-[4px]
                                                    bg-[#888888]
                                                "></div>
                                            </div>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultRegular
                                                text-left
                                                text-[#888888]
                                                text-[12px]
                                                2xs:text-[14px]
                                                leading-[20px]
                                                mb-[5px]
                                            ">Pickup Location</div>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultRegular
                                                text-left
                                                text-[#111111]
                                                text-[12px]
                                                2xs:text-[14px]
                                                leading-[20px]
                                            ">{data.data.details.pickupLocation.address}</div>
                                        </div>
                                        <div className="
                                            block
                                            w-[2px]
                                            h-[30px]
                                            ml-[4px]
                                            bg-[#888888]
                                        "></div>
                                        <div className="
                                            block
                                            w-full
                                            relative
                                            z-[10]
                                            overflow-hidden
                                            pl-[20px]
                                        ">
                                            <div className="
                                                block
                                                w-[10px]
                                                h-full
                                                absolute
                                                top-0
                                                mt-[5px]
                                                left-0
                                            ">
                                                <div className="
                                                    block
                                                    w-[10px]
                                                    h-[10px]
                                                    bg-[#111111]
                                                "></div>
                                                <div className="
                                                    block
                                                    w-[2px]
                                                    h-full
                                                    absolute
                                                    -top-1/2
                                                    -translate-y-1/2
                                                    -mt-[4px]
                                                    left-[4px]
                                                    bg-[#888888]
                                                "></div>
                                            </div>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultRegular
                                                text-left
                                                text-[#888888]
                                                text-[12px]
                                                2xs:text-[14px]
                                                leading-[20px]
                                                mb-[5px]
                                            ">Destination</div>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultRegular
                                                text-left
                                                text-[#111111]
                                                text-[12px]
                                                2xs:text-[14px]
                                                leading-[20px]
                                            ">{data.data.details.destination.address}</div>
                                        </div>
                                    </div>
                                    <div className="
                                        block
                                        w-full
                                        pt-[20px]
                                    ">
                                        <div className="
                                            block
                                            w-full
                                            min-h-[20px]
                                            relative
                                            pl-[100px]
                                            pr-[5px]
                                            mb-[10px]
                                        ">
                                            <div className="
                                                block
                                                w-[100px]
                                                font-defaultBold
                                                text-left
                                                text-[#111111]
                                                text-[12px]
                                                2xs:text-[14px]
                                                leading-[20px]
                                                absolute
                                                top-0
                                                left-0
                                            ">Vehicle<span className="absolute top-0 right-0">:</span></div>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultRegular
                                                text-left
                                                text-[#111111]
                                                text-[12px]
                                                2xs:text-[14px]
                                                leading-[20px]
                                                pl-[15px]
                                            ">{data.data.details.driver.vehicle.model}, {data.data.details.driver.vehicle.numberPlate}</div>
                                        </div>
                                        <div className="
                                            block
                                            w-full
                                            min-h-[20px]
                                            relative
                                            pl-[100px]
                                            pr-[5px]
                                            mb-[10px]
                                        ">
                                            <div className="
                                                block
                                                w-[100px]
                                                font-defaultBold
                                                text-left
                                                text-[#111111]
                                                text-[12px]
                                                2xs:text-[14px]
                                                leading-[20px]
                                                absolute
                                                top-0
                                                left-0
                                            ">Distance<span className="absolute top-0 right-0">:</span></div>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultRegular
                                                text-left
                                                text-[#111111]
                                                text-[12px]
                                                2xs:text-[14px]
                                                leading-[20px]
                                                pl-[15px]
                                            ">{data.data.details.distance.text}</div>
                                        </div>
                                        <div className="
                                            block
                                            w-full
                                            min-h-[20px]
                                            relative
                                            pl-[100px]
                                            pr-[5px]
                                        ">
                                            <div className="
                                                block
                                                w-[100px]
                                                font-defaultBold
                                                text-left
                                                text-[#111111]
                                                text-[12px]
                                                2xs:text-[14px]
                                                leading-[20px]
                                                absolute
                                                top-0
                                                left-0
                                            ">Price<span className="absolute top-0 right-0">:</span></div>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultRegular
                                                text-left
                                                text-[#111111]
                                                text-[12px]
                                                2xs:text-[14px]
                                                leading-[20px]
                                                pl-[15px]
                                            ">₹{data.data.details.price}</div>
                                        </div>
                                    </div>
                                </> : ""
                            }
                        </> : ""
                    }
                </div>
            </div>
            <div className="
                block
                w-full
                h-full
                overflow-auto
            ">
                {
                    data.error ?
                    <div className="
                        block
                        w-[94%]
                        max-w-[1000px]
                        mx-auto
                        py-[80px]
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
                        " onClick={getData}>Retry</button>
                    </div> : ""
                }
                {
                    data.data ?
                    <>
                        {
                            data.data.status === "initiated" ?
                            <>
                                {
                                    showRequestedAcceptedPrompt ?
                                    <div className="
                                        block
                                        w-full
                                        h-full
                                        overflow-hidden
                                        pb-[169px]
                                        md:pb-[90px]
                                        relative
                                    ">
                                        <div className="
                                            block
                                            w-full
                                            h-full
                                            overflow-auto
                                            pt-[55px]
                                        ">
                                            <div className="
                                                block
                                                w-[94%]
                                                max-w-[1000px]
                                                mx-auto
                                                py-[40px]
                                            ">
                                                <div className="
                                                    block
                                                    w-full
                                                    overflow-visible
                                                    pl-[75px]
                                                    2xs:pl-[95px]
                                                    relative
                                                    mb-[40px]
                                                ">
                                                    <div className="
                                                        block
                                                        w-[60px]
                                                        2xs:w-[80px]
                                                        h-[60px]
                                                        2xs:h-[80px]
                                                        bg-[#009900]
                                                        mx-auto
                                                        p-[14px]
                                                        2xs:p-[16px]
                                                        rounded-[50%]
                                                        absolute
                                                        top-1/2
                                                        -translate-y-1/2
                                                        left-0
                                                    ">
                                                        <CheckIcon color="#ffffff" strokeWidth={80} animate={true}/>
                                                    </div>
                                                    <h1 className="
                                                        block
                                                        w-full
                                                        font-defaultBold
                                                        text-left
                                                        text-[#111111]
                                                        text-[22px]
                                                        2xs:text-[25px]
                                                        leading-[30px]
                                                        mb-[5px]
                                                    ">Request Accepted</h1>
                                                    <div className="
                                                        block
                                                        w-full
                                                        font-defaultRegular
                                                        text-left
                                                        text-[12px]
                                                        2xs:text-[14px]
                                                        leading-[18px]
                                                        text-[#555555]
                                                    ">Please wait for your ride at the pickup location</div>
                                                </div>
                                                <div className="
                                                    block
                                                    w-full
                                                    text-left
                                                    mb-[40px]
                                                ">
                                                    <div className="
                                                        inline-block
                                                        align-middle
                                                        leading-[30px]
                                                        rounded-[20px]
                                                        px-[15px]
                                                        bg-[#ffffff]
                                                        shadow-xl
                                                        border
                                                        border-solid
                                                        border-[#dddddd]
                                                        font-defaultBold
                                                        text-center
                                                        text-[#8a2be2]
                                                        text-[12px]
                                                        2xs:text-[14px]
                                                    ">₹{data.data.details.price}</div>
                                                    <div className="
                                                        inline-block
                                                        align-middle
                                                        leading-[30px]
                                                        rounded-[20px]
                                                        px-[15px]
                                                        bg-[#ffffff]
                                                        shadow-xl
                                                        border
                                                        border-solid
                                                        border-[#dddddd]
                                                        font-defaultBold
                                                        text-center
                                                        text-[#8a2be2]
                                                        text-[12px]
                                                        2xs:text-[14px]
                                                        ml-[5px]
                                                    ">{data.data.details.distance.text}</div>
                                                </div>
                                                <div className="
                                                    block
                                                    w-full
                                                ">
                                                    <div className="
                                                        block
                                                        w-full
                                                        relative
                                                        z-[10]
                                                        overflow-hidden
                                                        pl-[20px]
                                                    ">
                                                        <div className="
                                                            block
                                                            w-[10px]
                                                            h-full
                                                            absolute
                                                            top-0
                                                            mt-[5px]
                                                            left-0
                                                        ">
                                                            <div className="
                                                                block
                                                                w-[10px]
                                                                h-[10px]
                                                                bg-[#111111]
                                                                rounded-[50%]
                                                            "></div>
                                                            <div className="
                                                                block
                                                                w-[2px]
                                                                h-full
                                                                absolute
                                                                top-[14px]
                                                                left-[4px]
                                                                bg-[#888888]
                                                            "></div>
                                                        </div>
                                                        <div className="
                                                            block
                                                            w-full
                                                            font-defaultRegular
                                                            text-left
                                                            text-[#888888]
                                                            text-[12px]
                                                            2xs:text-[14px]
                                                            leading-[20px]
                                                            mb-[5px]
                                                        ">Pickup Location</div>
                                                        <div className="
                                                            block
                                                            w-full
                                                            font-defaultRegular
                                                            text-left
                                                            text-[#111111]
                                                            text-[12px]
                                                            2xs:text-[14px]
                                                            leading-[20px]
                                                        ">{data.data.details.pickupLocation.address}</div>
                                                    </div>
                                                    <div className="
                                                        block
                                                        w-[2px]
                                                        h-[30px]
                                                        ml-[4px]
                                                        bg-[#888888]
                                                    "></div>
                                                    <div className="
                                                        block
                                                        w-full
                                                        relative
                                                        z-[10]
                                                        overflow-hidden
                                                        pl-[20px]
                                                    ">
                                                        <div className="
                                                            block
                                                            w-[10px]
                                                            h-full
                                                            absolute
                                                            top-0
                                                            mt-[5px]
                                                            left-0
                                                        ">
                                                            <div className="
                                                                block
                                                                w-[10px]
                                                                h-[10px]
                                                                bg-[#111111]
                                                            "></div>
                                                            <div className="
                                                                block
                                                                w-[2px]
                                                                h-full
                                                                absolute
                                                                -top-1/2
                                                                -translate-y-1/2
                                                                -mt-[4px]
                                                                left-[4px]
                                                                bg-[#888888]
                                                            "></div>
                                                        </div>
                                                        <div className="
                                                            block
                                                            w-full
                                                            font-defaultRegular
                                                            text-left
                                                            text-[#888888]
                                                            text-[12px]
                                                            2xs:text-[14px]
                                                            leading-[20px]
                                                            mb-[5px]
                                                        ">Destination</div>
                                                        <div className="
                                                            block
                                                            w-full
                                                            font-defaultRegular
                                                            text-left
                                                            text-[#111111]
                                                            text-[12px]
                                                            2xs:text-[14px]
                                                            leading-[20px]
                                                        ">{data.data.details.destination.address}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="
                                            block
                                            w-full
                                            h-[169px]
                                            md:h-[90px]
                                            pt-[10px]
                                            absolute
                                            bottom-0
                                            left-0
                                        ">
                                            <div className="
                                                grid
                                                grid-cols-2
                                                md:grid-cols-3
                                                gap-[10px]
                                                w-[94%]
                                                max-w-[1000px]
                                                mx-auto
                                            ">
                                                <button type="button" className="
                                                    w-full
                                                    h-[55px]
                                                    font-defaultBold
                                                    text-center
                                                    text-[#ffffff]
                                                    text-[14px]
                                                    bg-[#111111]
                                                    active:bg-[#444444]
                                                    col-span-2
                                                    md:col-span-1
                                                " onClick={startTracking}>
                                                    <span className="
                                                        inline-block
                                                        align-baseline
                                                        w-[15px]
                                                        h-[15px]
                                                        rounded-[50%]
                                                        bg-[#cd5c5c]
                                                        pulse-dot
                                                        mr-[10px]
                                                        relative
                                                        top-[4px]
                                                    "></span>
                                                    <span className="
                                                        inline-block
                                                        align-middle
                                                    ">Track Your Ride</span>
                                                </button>
                                                <a href={`tel:${data.data.details.driver.phoneNumber}`} target="_blank" rel="noopener noreferrer" className={`
                                                    w-full
                                                    leading-[53px]
                                                    font-defaultBold
                                                    text-center
                                                    text-[13px]
                                                    2xs:text-[15px]
                                                    text-[#111111]
                                                    bg-[#dddddd]
                                                    active:bg-[#cccccc]
                                                `}>Call Driver</a>
                                                <Link to="?cancel" className={`
                                                    w-full
                                                    leading-[53px]
                                                    font-defaultBold
                                                    text-center
                                                    text-[13px]
                                                    2xs:text-[15px]
                                                    text-[#111111]
                                                    bg-[#dddddd]
                                                    active:bg-[#cccccc]
                                                `}>Cancel Ride</Link>
                                            </div>
                                        </div>
                                    </div> :
                                    <div className={`
                                        block
                                        w-full
                                        h-full
                                        ${driversLiveLocation ? "pb-[100px]" : "pb-[140px]"}
                                        relative
                                        z-[10]
                                        duration-[.2]
                                        ease-in-out
                                    `}>
                                        <div className="
                                            block
                                            w-full
                                            h-0
                                            overflow-visible
                                            absolute
                                            z-[20]
                                            top-[65px]
                                            left-0
                                        ">
                                            <div className="
                                                block
                                                w-[94%]
                                                max-w-[1000px]
                                                mx-auto
                                                text-left
                                            ">
                                                <div className="
                                                    inline-block
                                                    align-middle
                                                    leading-[30px]
                                                    rounded-[20px]
                                                    px-[15px]
                                                    bg-[#ffffff]
                                                    shadow-xl
                                                    border
                                                    border-solid
                                                    border-[#dddddd]
                                                    font-defaultBold
                                                    text-center
                                                    text-[#8a2be2]
                                                    text-[12px]
                                                    2xs:text-[14px]
                                                ">₹{data.data.details.price}</div>
                                                <div className="
                                                    inline-block
                                                    align-middle
                                                    leading-[30px]
                                                    rounded-[20px]
                                                    px-[15px]
                                                    bg-[#ffffff]
                                                    shadow-xl
                                                    border
                                                    border-solid
                                                    border-[#dddddd]
                                                    font-defaultBold
                                                    text-center
                                                    text-[#8a2be2]
                                                    text-[12px]
                                                    2xs:text-[14px]
                                                    ml-[5px]
                                                ">{data.data.details.distance.text}</div>
                                            </div>
                                        </div>
                                        {
                                            !driversLiveLocation ?
                                            <div className="
                                                block
                                                w-full
                                                absolute
                                                z-[30]
                                                bottom-[98px]
                                                left-0
                                                bg-[#ffffff]
                                                overflow-hidden
                                            ">
                                                <div className="
                                                    block
                                                    w-[94%]
                                                    max-w-[1000px]
                                                    mx-auto
                                                    font-defaultRegular
                                                    text-left
                                                    text-[#111111]
                                                    text-[12px]
                                                    2xs:text-[14px]
                                                    leading-[40px]
                                                ">Waiting for driver's live location...</div>
                                                <div className="
                                                    block
                                                    w-[300%]
                                                    h-[3px]
                                                    absolute
                                                    top-0
                                                    left-0
                                                    -translate-x-[60%]
                                                    bg-no-repeat
                                                    bg-cover
                                                    bg-center
                                                " style={{backgroundImage: `url(${RippleThick})`}}></div>
                                            </div> : ""
                                        }
                                        <div className="
                                            block
                                            w-full
                                            h-full
                                            bg-[#dddddd]
                                            relative
                                            z-[10]
                                        " ref={mapsContainerRef}></div>
                                        <div className="
                                            block
                                            w-full
                                            h-[100px]
                                            overflow-hidden
                                            pt-[9px]
                                            bg-[#ffffff]
                                            absolute
                                            z-[20]
                                            bottom-0
                                            left-0
                                            border-t
                                            border-solid
                                            border-[#bbbbbb]
                                        ">
                                            <div className="
                                                grid
                                                grid-cols-2
                                                gap-[6px]
                                                w-[94%]
                                                max-w-[1000px]
                                                mx-auto
                                            ">
                                                <a href={`tel:${data.data.details.driver.phoneNumber}`} target="_blank" rel="noopener noreferrer" className={`
                                                    w-full
                                                    leading-[50px]
                                                    font-defaultBold
                                                    text-center
                                                    text-[13px]
                                                    2xs:text-[15px]
                                                    text-[#ffffff]
                                                    bg-[#111111]
                                                    active:bg-[#444444]
                                                    rounded-[25px]
                                                `}>Call Driver</a>
                                                <Link to="?cancel" className={`
                                                    w-full
                                                    leading-[50px]
                                                    font-defaultBold
                                                    text-center
                                                    text-[13px]
                                                    2xs:text-[15px]
                                                    text-[#cd5c5c]
                                                    active:bg-[#dddddd]
                                                    rounded-[25px]
                                                    border-[2px]
                                                    border-solid
                                                    border-[#cd5c5c]
                                                `}>Cancel</Link>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </> :
                            <RideHistoryItem
                                data={data}
                            />
                        }
                    </> : ""
                }
            </div>
        </div>
    )

}

export default Ride