import { useState, useEffect, useCallback, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useParams } from "react-router-dom"
import useStore from "../store"
import { useUserStore } from "../store"
import getDisplacementFromLatLonInMetres from "../lib/getDisplacementFromLatLonInMetres"
import getTimeInMinutes from "../lib/getTimeInMinutes"
import LeftArrow from "../components/icons/LeftArrow"
import RippleThick from "../images/ripple-thick.gif"
import PickupPin from "../images/pickup-pin.png"
import DestinationPin from "../images/destination-pin.png"
// import TwoWheelerPin from "../images/two-wheeler-pin.png"
// import FourWheelerPin from "../images/four-wheeler-pin.png"
import SadFace from "../components/icons/SadFace"
import ChevronDown from "../components/icons/ChevronDown"
import PhoneIcon from "../components/icons/Phone"

const Ride = () => {

    const params = useParams()
    const navigate = useNavigate()
    const [ data, setData ] = useState({
        loading: false,
        error: null,
        data: null
    })
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
    const mapsOverlay = useRef(null)
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
    
    useEffect(() => {
        if (!authToken){
            navigate("/", {replace: true})
        }
    }, [authToken, navigate])

    useEffect(() => {
        return () => {
            // cleanup function
            setDriversLiveLocation(null)
        }
    }, [setDriversLiveLocation])
    
    useEffect(() => {
        if (!initiated.current && params.rideId){
            initiated.current = true
            
            if (window.acceptedRideRequestData && window.acceptedRideRequestData._id === params.rideId){
                setDriversLiveLocation(window.acceptedRideRequestData.driversLiveLocation)
                return setData({
                    loading: false,
                    error: null,
                    data: window.acceptedRideRequestData
                })
            }
            window.acceptedRideRequestData = undefined
            getData()
        }
    }, [params.rideId, getData, setDriversLiveLocation])
    
    // load maps when data is ready and google maps script is loaded
    useEffect(() => {
        if (googleMapsScriptLoaded && data.data && !mapsRef.current && mapsContainerRef.current){
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

            mapsRef.current.addListener("projection_changed", () => {
                mapsOverlay.current = new window.google.maps.OverlayView()
                mapsOverlay.current.draw = () => {}
                mapsOverlay.current.setMap(mapsRef.current)
            })
            
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
    }, [googleMapsScriptLoaded, data.data])

    useEffect(() => {
        if (googleMapsScriptLoaded && data.data && driversLiveLocation && mapsRef.current){
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
            }

            // set info window for driver's marker
            const displacementInMetres = getDisplacementFromLatLonInMetres(
                driversLiveLocation.lat,
                driversLiveLocation.lng,
                data.data.details.pickupLocation.lat,
                data.data.details.pickupLocation.lng
            )
            const timeInMinutes = getTimeInMinutes(15,displacementInMetres)
            const infoWindowContent = `<div class="font-defaultRegular text-[#111111]">${timeInMinutes} Minute${timeInMinutes > 1 ? "s" : ""} Away</div>`
            if (!driversInfoWindow.current){
                driversInfoWindow.current = new window.google.maps.InfoWindow({
                    content: infoWindowContent
                })
                driversInfoWindow.current.open(mapsRef.current,driversMarker.current)
            }
            else {
                driversInfoWindow.current.setContent(infoWindowContent)
            }
            
            // make sure driver's marker is always visible on the screen even when it changes position
            if (mapsOverlay.current){
                const proj = mapsOverlay.current.getProjection()
                const pos = driversMarker.current.getPosition()
                if (proj && pos){
                    const p = proj.fromLatLngToContainerPixel(pos)

                    if (
                        p.x < 50 ||
                        p.x > (window.innerWidth-50) ||
                        p.y < 50 ||
                        p.y > (window.innerHeight-50)
                    ){
                        mapsRef.current.setCenter({
                            lat: driversLiveLocation.lat,
                            lng: driversLiveLocation.lng
                        })
                    }
                }
            }
            else {
                mapsRef.current.setCenter({
                    lat: driversLiveLocation.lat,
                    lng: driversLiveLocation.lng
                })
            }
        }
    }, [googleMapsScriptLoaded, data.data, driversLiveLocation])

    useEffect(() => {
        if (locationQueries.includes("driver-details") && scrollableArea.current){
            scrollableArea.current.scrollTo(0,0)
        }
    }, [locationQueries])
    
    return (
        <div className={`page`}>
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
                        data.data ?
                        <>
                            <Link to="?driver-details" className={`
                                relative
                                ${!locationQueries.includes("driver-details") ? "inline-block max-w-full h-[45px] shadow-xl rounded-[25px] pl-[46px] pr-[40px] bg-[#ffffff] pt-[6px] border border-solid border-[#dddddd]" : "flex w-full min-h-[90px] pl-[105px]"}
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
                                        ${!locationQueries.includes("driver-details") ? "overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-[16px]" : "text-[16px] 2xs:text-[18px]"}
                                    `}>{data.data.details.driver.name}</div>
                                    <div className={`
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#888888]
                                        text-[10px]
                                        leading-[14px]
                                        ${!locationQueries.includes("driver-details") ? "overflow-hidden text-ellipsis whitespace-nowrap text-[10px] leading-[14px]" : "text-[12px] 2xs:text-[14px]"}
                                    `}>
                                        {
                                            data.data.status === "initiated" ?
                                            <>
                                                <span className={`
                                                    inline-block
                                                    align-middle
                                                    ${locationQueries.includes("driver-details") ? "w-[15px] h-[15px] mr-[5px]" : "w-[10px] h-[10px] mr-[3px]"}
                                                    rounded-[50%]
                                                    bg-[#bb0000]
                                                    pulse-dot
                                                `}></span>
                                                <span className="
                                                    inline-block
                                                    align-middle
                                                ">On {data.data.details.driver.gender === "male" ? "his" : "her"} way</span>
                                            </> : ""
                                        }
                                    </div>
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
                            <div className={`
                                ${locationQueries.includes("driver-details") ? "block" : "hidden"}
                                w-full
                                overflow-hidden
                                relative
                                pl-[130px]
                            `}>
                                <div className="
                                    block
                                    w-[115px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    left-0
                                    font-defaultRegular
                                    text-left
                                    text-[#444444]
                                    text-[12px]
                                    2xs:text-[14px]
                                ">Gender<span className="float-right">:</span></div>
                                <div className="
                                    block
                                    w-full
                                    capitalize
                                    font-defaultRegular
                                    text-left
                                    text-[#444444]
                                    text-[12px]
                                    2xs:text-[14px]
                                ">{data.data.details.driver.gender}</div>
                            </div>
                            <div className={`
                                ${locationQueries.includes("driver-details") ? "block" : "hidden"}
                                w-full
                                overflow-hidden
                                mt-[5px]
                                relative
                                pl-[130px]
                            `}>
                                <div className="
                                    block
                                    w-[115px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    left-0
                                    font-defaultRegular
                                    text-left
                                    text-[#444444]
                                    text-[12px]
                                    2xs:text-[14px]
                                ">Age<span className="float-right">:</span></div>
                                <div className="
                                    block
                                    w-full
                                    capitalize
                                    font-defaultRegular
                                    text-left
                                    text-[#444444]
                                    text-[12px]
                                    2xs:text-[14px]
                                ">{data.data.details.driver.age}</div>
                            </div>
                            <div className={`
                                ${locationQueries.includes("driver-details") ? "block" : "hidden"}
                                w-full
                                overflow-hidden
                                mt-[5px]
                                relative
                                pl-[130px]
                            `}>
                                <div className="
                                    block
                                    w-[115px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    left-0
                                    font-defaultRegular
                                    text-left
                                    text-[#444444]
                                    text-[12px]
                                    2xs:text-[14px]
                                ">Phone<span className="float-right">:</span></div>
                                <div className="
                                    block
                                    w-full
                                    capitalize
                                    font-defaultRegular
                                    text-left
                                    text-[#444444]
                                    text-[12px]
                                    2xs:text-[14px]
                                ">{data.data.details.driver.phoneNumber.replace(data.data.details.driver.countryCode, "")}</div>
                            </div>
                            <div className={`
                                ${locationQueries.includes("driver-details") ? "block" : "hidden"}
                                w-full
                                overflow-hidden
                                mt-[5px]
                                relative
                                pl-[130px]
                            `}>
                                <div className="
                                    block
                                    w-[115px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    left-0
                                    font-defaultRegular
                                    text-left
                                    text-[#444444]
                                    text-[12px]
                                    2xs:text-[14px]
                                ">Vehicle<span className="float-right">:</span></div>
                                <div className="
                                    block
                                    w-full
                                    capitalize
                                    font-defaultRegular
                                    text-left
                                    text-[#444444]
                                    text-[12px]
                                    2xs:text-[14px]
                                ">{data.data.details.driver.vehicle.model}</div>
                            </div>
                            <div className={`
                                ${locationQueries.includes("driver-details") ? "block" : "hidden"}
                                w-full
                                overflow-hidden
                                mt-[5px]
                                relative
                                pl-[130px]
                            `}>
                                <div className="
                                    block
                                    w-[115px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    left-0
                                    font-defaultRegular
                                    text-left
                                    text-[#444444]
                                    text-[12px]
                                    2xs:text-[14px]
                                ">No. Plate<span className="float-right">:</span></div>
                                <div className="
                                    block
                                    w-full
                                    capitalize
                                    font-defaultRegular
                                    text-left
                                    text-[#444444]
                                    text-[12px]
                                    2xs:text-[14px]
                                ">{data.data.details.driver.vehicle.numberPlate}</div>
                            </div>
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
                            h-[45px]
                            bg-[red]
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
                                    leading-[45px]
                                    rounded-[25px]
                                    px-[15px]
                                    bg-[#ffffff]
                                    shadow-xl
                                    border
                                    border-solid
                                    border-[#dddddd]
                                ">{data.data.details.price}</div>
                            </div>
                        </div>
                        {
                            !driversLiveLocation ?
                            <div className="
                                block
                                w-full
                                absolute
                                z-[30]
                                bottom-[99px]
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
                            pt-[6px]
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
                                <button type="button" className={`
                                    w-full
                                    h-[50px]
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
                                `}>Cancel</button>
                            </div>
                        </div>
                    </div> : ""
                }
            </div>
        </div>
    )

}

export default Ride