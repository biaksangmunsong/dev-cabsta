import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import useStore from "../store"
import { useInputStore } from "../store"
import { Geolocation } from "@capacitor/geolocation"
import XIcon from "./icons/XIcon"
import "../styles/places_autocomplete.css"
import PickupPin from "../images/pickup-pin.png"
import Spinner from "../images/spinner.gif"
import DestinationPin from "../images/destination-pin.png"
import { Haptics } from "@capacitor/haptics"
import getAddress from "../lib/getAddress"
import LongRightArrow from "./icons/LongRightArrow"
import CrossHair from "./icons/CrossHair"
import StarIcon from "./icons/Star"
import VehicleSelector from "./VehicleSelector"
import Checkout from "./Checkout"
import Ripple from "../images/ripple.gif"

const Editor = () => {

    const navigate = useNavigate()
    const location = useLocation()

    const staticData = useStore(state => state.staticData)
    const googleMapsScriptLoaded = useStore(state => state.googleMapsScriptLoaded)
    const setPickupLocation = useInputStore(state => state.setPickupLocation)
    const pickupLocation = useInputStore(state => state.pickupLocation)
    const setDestination = useInputStore(state => state.setDestination)
    const destination = useInputStore(state => state.destination)
    const distanceMatrix = useInputStore(state => state.distanceMatrix)
    const viewport = useStore(state => state.viewport)
    const locationQueries = useStore(state => state.locationQueries)
    const savedPlaces = useStore(state => state.savedPlaces)
    const [ pickupLocationInput, setPickupLocationInput ] = useState("")
    const [ destinationInput, setDestinationInput ] = useState("")
    const [ activeInput, setActiveInput ] = useState("pickup")
    const [ locationPermission, setLocationPermission ] = useState(null)
    const [ expandSavedPlaces, setExpandSavedPlaces ] = useState(false)
    const [ usersLocation, setUsersLocation ] = useState(null)
    const [ checkOut, setCheckOut ] = useState({
        loading: false,
        error: null
    })
    const pickupInputRef = useRef(null)
    const pickupAutocomplete = useRef(null)
    const destinationInputRef = useRef(null)
    const destinationAutocomplete = useRef(null)
    const mapsContainerRef = useRef(null)
    const mapsRef = useRef(null)
    const pickupMarker = useRef(null)
    const destinationMarker = useRef(null)
    const pickupLocationRef = useRef(pickupLocation)
    const destinationRef = useRef(destination)
    const geocoder = useRef(null)
    const scrollableArea = useRef(null)
    const locationWatchId = useRef(null)
    const directionsRenderer = useRef(null)
    const directionsService = useRef(null)

    const startLocationWatch = useCallback(async () => {
        if (!locationWatchId.current && locationPermission === "granted"){
            const watchId = await Geolocation.watchPosition({enableHighAccuracy: true}, data => {
                setUsersLocation({
                    lat: data.coords.latitude,
                    lng: data.coords.longitude
                })
            })
            locationWatchId.current = watchId
        }
    }, [locationPermission])
    
    const onInputFocus = e => {
        setActiveInput(e.target.name)
        if (location.pathname !== "/set-location"){
            navigate("/set-location")
        }
        
        if (mapsRef.current){
            if (e.target.name === "pickup" && pickupLocation){
                mapsRef.current.setCenter(pickupLocation.coords)
                mapsRef.current.setZoom(18)
            }
            if (e.target.name === "destination" && destination){
                mapsRef.current.setCenter(destination.coords)
                mapsRef.current.setZoom(18)
            }
        }
    }
    
    const clearPickupLocationInput = () => {
        if (pickupInputRef.current){
            pickupInputRef.current.blur()
            pickupInputRef.current.value = ""
            setPickupLocationInput("")
            setPickupLocation(null)

            // remove marker if it exists
            if (pickupMarker.current){
                pickupMarker.current.setMap(null)
                pickupMarker.current = null
            }

            setTimeout(() => {
                if (pickupInputRef.current){
                    pickupInputRef.current.focus()
                }
            }, 10)
        }
    }

    const clearDestinationInput = () => {
        if (destinationInputRef.current){
            destinationInputRef.current.blur()
            destinationInputRef.current.value = ""
            setDestinationInput("")
            setDestination(null)

            // remove marker if it exists
            if (destinationMarker.current){
                destinationMarker.current.setMap(null)
                destinationMarker.current = null
            }

            setTimeout(() => {
                if (destinationInputRef.current){
                    destinationInputRef.current.focus()
                }
            }, 10)
        }
    }
    
    const onPickupInputChange = useCallback(() => {
        const place = pickupAutocomplete.current.getPlace()

        if (place.geometry && pickupInputRef.current){
            const coords = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            }
            setPickupLocation({
                inputValue: pickupInputRef.current.value,
                coords,
                formatted_address: place.formatted_address
            })
            if (mapsRef.current){
                mapsRef.current.setCenter(coords)
                mapsRef.current.setZoom(18)
            }
        }
    }, [setPickupLocation])
    
    const onDestinationInputChange = useCallback(() => {
        const place = destinationAutocomplete.current.getPlace()

        if (place.geometry && destinationInputRef.current){
            const coords = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            }
            setDestination({
                inputValue: destinationInputRef.current.value,
                coords,
                formatted_address: place.formatted_address
            })
            if (mapsRef.current){
                mapsRef.current.setCenter(coords)
                mapsRef.current.setZoom(18)
            }
        }
    }, [setDestination])

    const onSavedPlacesBtnClick = () => {
        navigate(`${location.pathname}?${locationQueries.join("&")}${locationQueries.length ? "&" : ""}expand-saved-places`)
    }

    const findMe = async () => {
        if (activeInput === "pickup"){
            let coords = null
            if (usersLocation){
                coords = usersLocation
            }
            else {
                const location = await Geolocation.getCurrentPosition({enableHighAccuracy: true})
                setLocationPermission("granted")
                if (location && location.coords){
                    coords = {
                        lat: location.coords.latitude,
                        lng: location.coords.longitude
                    }
                }
                if (!coords){
                    return
                }
            }

            // update pickup location input
            setPickupLocation(undefined)
            //empty input and set placeholder to loading
            if (pickupInputRef.current){
                pickupInputRef.current.value = ""
                pickupInputRef.current.placeholder = "Loading..."
                setPickupLocationInput("")
            }
            try {
                if (!geocoder.current){
                    geocoder.current = new window.google.maps.Geocoder()
                }
                const reverseGeocodedData = await geocoder.current.geocode({location: coords})
                const formatted_address = getAddress(reverseGeocodedData)
                setPickupLocation({
                    inputValue: formatted_address,
                    coords,
                    formatted_address
                })
                pickupInputRef.current.placeholder = "Enter Pickup Location"
                // set input value
                if (pickupInputRef.current){
                    pickupInputRef.current.value = formatted_address
                    setPickupLocationInput(formatted_address)
                }
                // set map center
                if (mapsRef.current){
                    mapsRef.current.setCenter(coords)
                    mapsRef.current.setZoom(18)
                }
            }
            catch {
                setPickupLocation(null)
                pickupInputRef.current.placeholder = "Enter Pickup Location"
                
                // remove marker
                if (pickupMarker.current){
                    pickupMarker.current.setMap(null)
                    pickupMarker.current = null
                }
            }
        }
    }

    const selectSavedPlace = place => {
        if (activeInput === "pickup"){
            if (pickupInputRef.current){
                pickupInputRef.current.value = place.formatted_address
                setPickupLocationInput(place.formatted_address)
            }
            setPickupLocation({
                inputValue: place.formatted_address,
                coords: place.coords,
                formatted_address: place.formatted_address
            })
            if (mapsRef.current){
                mapsRef.current.setCenter(place.coords)
                mapsRef.current.setZoom(18)
            }
            window.history.back()
        }
        else if (activeInput === "destination"){
            if (destinationInputRef.current){
                destinationInputRef.current.value = place.formatted_address
                setDestinationInput(place.formatted_address)
            }
            setDestination({
                inputValue: place.formatted_address,
                coords: place.coords,
                formatted_address: place.formatted_address
            })
            if (mapsRef.current){
                mapsRef.current.setCenter(place.coords)
                mapsRef.current.setZoom(18)
            }
            window.history.back()
        }
    }

    const chooseVehicle = async () => {
        if (pickupLocation && destination && mapsRef.current){
            if (locationQueries.includes("expand-saved-places")){
                window.history.back()
                setTimeout(() => {
                    navigate("/choose-vehicle")
                }, 200)
            }
            else {
                navigate("/choose-vehicle")
            }
            // calculate and display directions
            try {
                if (directionsRenderer.current){
                    // destroy current route
                    directionsRenderer.current.setMap(null)
                    directionsRenderer.current = null
                }

                const start = new window.google.maps.LatLng(pickupLocation.coords.lat, pickupLocation.coords.lng)
                const end = new window.google.maps.LatLng(destination.coords.lat, destination.coords.lng)

                directionsRenderer.current = new window.google.maps.DirectionsRenderer({
                    suppressMarkers: true,
                    polylineOptions: {
                        strokeColor: "#000000",
                        strokeWeight: 6
                    }
                })
                directionsService.current = new window.google.maps.DirectionsService()

                directionsRenderer.current.setMap(mapsRef.current)
                
                const request = {
                    origin: start,
                    destination: end,
                    travelMode: "DRIVING"
                }
                const result = await directionsService.current.route(request)
                if (result.status === "OK" && window.location.pathname.includes("/choose-vehicle")){
                    directionsRenderer.current.setDirections(result)

                    // move markers
                    const directionsData = {
                        start: {
                            lat: result.routes[0].legs[0].start_location.lat(),
                            lng: result.routes[0].legs[0].start_location.lng()
                        },
                        end: {
                            lat: result.routes[0].legs[0].end_location.lat(),
                            lng: result.routes[0].legs[0].end_location.lng()
                        },
                        distance: result.routes[0].legs[0].distance,
                        duration: result.routes[0].legs[0].duration
                    }
                    if (pickupMarker.current && destinationMarker.current){
                        pickupMarker.current.setPosition(directionsData.start)
                        destinationMarker.current.setPosition(directionsData.end)
                    }
                }
            }
            catch {}
        }
    }

    const createPickupMarker = useCallback(() => {
        if (pickupLocation){
            pickupMarker.current = new window.google.maps.Marker({
                position: pickupLocation.coords,
                map: mapsRef.current,
                icon: PickupPin,
                draggable: true
            })

            // add marker dragend listener
            pickupMarker.current.addListener("dragend", async data => {
                const location = {
                    lat: data.latLng.lat(),
                    lng: data.latLng.lng()
                }
                setPickupLocation(undefined)
                //empty input and set placeholder to loading
                if (pickupInputRef.current){
                    pickupInputRef.current.value = ""
                    pickupInputRef.current.placeholder = "Loading..."
                    setPickupLocationInput("")
                }
                try {
                    await Haptics.impact({style: "HEAVY"})
                    if (!geocoder.current){
                        geocoder.current = new window.google.maps.Geocoder()
                    }
                    const reverseGeocodedData = await geocoder.current.geocode({location})
                    const formatted_address = getAddress(reverseGeocodedData)
                    setPickupLocation({
                        inputValue: formatted_address,
                        coords: location,
                        formatted_address
                    })
                    pickupInputRef.current.placeholder = "Enter Pickup Location"
                    // set input value
                    if (pickupInputRef.current){
                        pickupInputRef.current.value = formatted_address
                        setPickupLocationInput(formatted_address)
                    }
                }
                catch {
                    setPickupLocation(null)
                    pickupInputRef.current.placeholder = "Enter Pickup Location"
                    
                    // remove marker
                    if (pickupMarker.current){
                        pickupMarker.current.setMap(null)
                        pickupMarker.current = null
                    }
                }
            })
        }
    }, [pickupLocation, setPickupLocation])

    const createDestinationMarker = useCallback(() => {
        if (destination){
            destinationMarker.current = new window.google.maps.Marker({
                position: destination.coords,
                map: mapsRef.current,
                icon: DestinationPin,
                draggable: true
            })
            
            // add marker dragend listener
            destinationMarker.current.addListener("dragend", async data => {
                const location = {
                    lat: data.latLng.lat(),
                    lng: data.latLng.lng()
                }
                setDestination(undefined)
                //empty input and set placeholder to loading
                if (destinationInputRef.current){
                    destinationInputRef.current.value = ""
                    destinationInputRef.current.placeholder = "Loading..."
                    setDestinationInput("")
                }
                try {
                    await Haptics.impact({style: "HEAVY"})
                    if (!geocoder.current){
                        geocoder.current = new window.google.maps.Geocoder()
                    }
                    const reverseGeocodedData = await geocoder.current.geocode({location})
                    const formatted_address = getAddress(reverseGeocodedData)
                    setDestination({
                        inputValue: formatted_address,
                        coords: location,
                        formatted_address
                    })
                    destinationInputRef.current.placeholder = "Enter Destination"
                    // set input value
                    if (destinationInputRef.current){
                        destinationInputRef.current.value = formatted_address
                        setDestinationInput(formatted_address)
                    }
                }
                catch {
                    setDestination(null)
                    destinationInputRef.current.placeholder = "Enter Destination"
                    
                    // remove marker
                    if (destinationMarker.current){
                        destinationMarker.current.setMap(null)
                        destinationMarker.current = null
                    }
                }
            })
        }
    }, [destination, setDestination])
    
    useEffect(() => {
        if (locationQueries.includes("expand-saved-places")){
            setExpandSavedPlaces(true)
        }
        else {
            setExpandSavedPlaces(false)
        }
    }, [locationQueries])
    
    useEffect(() => {
        if (googleMapsScriptLoaded && pickupInputRef.current && destinationInputRef.current){
            // init places autocomplete
            const autocompleteOptions = {
                componentRestrictions: {
                    country: ["IN"]
                },
                fields: ["geometry", "formatted_address"],
                bounds: new window.google.maps.LatLngBounds(
                    new window.google.maps.LatLng(staticData.servicableArea.southWest.lat, staticData.servicableArea.southWest.lng),
                    new window.google.maps.LatLng(staticData.servicableArea.northEast.lat, staticData.servicableArea.northEast.lng)
                ),
                strictBounds: true
            }

            pickupAutocomplete.current = new window.google.maps.places.Autocomplete(pickupInputRef.current, autocompleteOptions)
            pickupAutocomplete.current.addListener("place_changed", onPickupInputChange)

            destinationAutocomplete.current = new window.google.maps.places.Autocomplete(destinationInputRef.current, autocompleteOptions)
            destinationAutocomplete.current.addListener("place_changed", onDestinationInputChange)
        }
    }, [googleMapsScriptLoaded, onPickupInputChange, onDestinationInputChange, staticData])

    useEffect(() => {
        if (googleMapsScriptLoaded && pickupInputRef.current && destinationInputRef.current && location.pathname === "/set-location"){
            if (!mapsRef.current){
                // init maps
                const center = staticData.defaultMapCenter
                let zoom = 16

                const mapOptions = {
                    center,
                    zoom,
                    disableDefaultUI: true,
                    clickableIcons: false
                }
                mapsRef.current = new window.google.maps.Map(mapsContainerRef.current, mapOptions)
            }

            if (pickupLocation && !pickupMarker.current && mapsRef.current){
                createPickupMarker()
                if (activeInput === "pickup"){
                    mapsRef.current.setCenter(pickupLocation.coords)
                }
            }
            if (destination && !destinationMarker.current && mapsRef.current){
                createDestinationMarker()
                if (activeInput === "destination"){
                    mapsRef.current.setCenter(destination.coords)
                }
            }
        }
    }, [
        googleMapsScriptLoaded,
        onPickupInputChange,
        onDestinationInputChange,
        staticData,
        location.pathname,
        pickupLocation,
        createPickupMarker,
        destination,
        createDestinationMarker,
        activeInput
    ])
    
    useEffect(() => {
        if (activeInput === "pickup" && pickupLocation && mapsRef.current){
            // put marker at location
            if (!pickupMarker.current){
                createPickupMarker()
            }
            else {
                pickupMarker.current.setPosition(pickupLocation.coords)
            }
        }
    }, [pickupLocation, activeInput, setPickupLocation, createPickupMarker])
    
    useEffect(() => {
        if (activeInput === "destination" && destination && mapsRef.current){
            // put marker at location
            if (!destinationMarker.current){
                createDestinationMarker()
            }
            else {
                destinationMarker.current.setPosition(destination.coords)
            }
        }
    }, [destination, activeInput, setDestination, createDestinationMarker])

    useEffect(() => {
        // set input value when history changes
        if (pickupLocationRef.current && pickupInputRef.current){
            pickupInputRef.current.value = pickupLocationRef.current.inputValue
            setPickupLocationInput(pickupLocationRef.current.inputValue)
        }
        if (destinationRef.current && destinationInputRef.current){
            destinationInputRef.current.value = destinationRef.current.inputValue
            setDestinationInput(destinationRef.current.inputValue)
        }

        // set scroll position of scrollable area to top
        if (scrollableArea.current){
            scrollableArea.current.scrollTo(0,0)
        }

        // clear location watch when page changes
        const asyncFn = async () => {
            if (location.pathname !== "/set-location"){
                if (locationWatchId.current){
                    await Geolocation.clearWatch({id: locationWatchId.current})
                    locationWatchId.current = null
                }
            }
        }
        asyncFn()
    }, [location.pathname])

    useEffect(() => {
        if (location.pathname === "/checkout"){
            if (!pickupLocation || !destination || !mapsRef.current || !directionsRenderer.current || !distanceMatrix){
                window.history.back()
            }
        }
        else if (location.pathname === "/choose-vehicle"){
            if (!pickupLocation || !destination || !mapsRef.current || !directionsRenderer.current){
                window.history.back()
            }
        }
        else if (location.pathname === "/set-location"){
            // destroy directions route and reset markers position
            if (directionsRenderer.current){
                // destroy current route
                directionsRenderer.current.setMap(null)
                directionsRenderer.current = null
            }
            if (pickupLocation && destination && mapsRef.current){
                // put markers back to original position
                if (pickupMarker.current && destinationMarker.current){
                    pickupMarker.current.setPosition(pickupLocation.coords)
                    destinationMarker.current.setPosition(destination.coords)
                }
            }
        }
    }, [location.pathname, pickupLocation, destination, distanceMatrix])
    
    useEffect(() => {
        // create reference of pickup location whenever it changes
        pickupLocationRef.current = pickupLocation
    }, [pickupLocation])

    useEffect(() => {
        // create reference of destination whenever it changes
        destinationRef.current = destination
    }, [destination])

    useEffect(() => {
        // check location permission
        const asyncFn = async () => {
            const permission = await Geolocation.checkPermissions()
            setLocationPermission(permission.location)
        }
        asyncFn()
    }, [])

    useEffect(() => {
        // watch location if location permission is granted
        if (location.pathname === "/set-location"){
            startLocationWatch()
        }
    }, [startLocationWatch, location.pathname])

    useEffect(() => {
        // clear location watch when component unmounts
        return async () => {
            if (locationWatchId.current){
                await Geolocation.clearWatch({id: locationWatchId.current})
                locationWatchId.current = null
            }
        }
    }, [])
    
    return (
        <div className={`
            block
            w-full
            bg-[#ffffff]
            relative
            overflow-hidden
        `} style={location.pathname !== "/" ? {height: `${viewport.height}px`} : {}}>
            {
                (checkOut.loading && location.pathname !== "/") ?
                <div className="
                    flex
                    w-full
                    h-full
                    absolute
                    z-[50]
                    top-0
                    left-0
                    bg-[#ffffff]
                    py-[50px]
                    overflow-auto
                ">
                    <div className="
                        block
                        w-[94%]
                        max-w-[300px]
                        m-auto
                    ">
                        <img src={Ripple} alt="" className="
                            block
                            w-[100px]
                            mx-auto
                        "/>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-[14px]
                            2xs:text-[16px]
                            text-center
                            text-[#111111]
                            leading-[20px]
                        ">Requesting a Ride...</div>
                    </div>
                </div> : ""
            }
            <div className={`
                ${location.pathname === "/choose-vehicle" ? "hidden" : "block"}
                w-[94%]
                max-w-[1000px]
                mx-auto
                ${location.pathname === "/set-location" ? "py-[5px]" : "py-0"}
                relative
                z-[20]
                bg-[#ffffff]
                duration-[.2s]
                ease-in-out
            `}>
                <div className={`
                    block
                    w-full
                    ${location.pathname === "/set-location" ? "h-[50px]" : "h-[55px] 2xs:h-[60px]"}
                    overflow-hidden
                    relative
                    z-[10]
                    border-solid
                    ${(activeInput === "pickup" && location.pathname === "/set-location") ? "border-[2px] border-[#111111]" : "border-[1px] border-[#bbbbbb]"}
                    ${location.pathname !== "/set-location" ? "bg-[#eeeeee]" : ""}
                    duration-[.2s]
                    ease-in-out
                `}>
                    <div className="
                        block
                        w-[10px]
                        h-[10px]
                        rounded-[50%]
                        bg-[#111111]
                        absolute
                        z-[5]
                        top-[50%]
                        left-[10px]
                        -translate-y-1/2
                    "></div>
                    <input
                        type="text"
                        ref={pickupInputRef}
                        placeholder="Enter Pickup Location"
                        onChange={e => setPickupLocationInput(e.target.value)}
                        onFocus={onInputFocus}
                        name="pickup"
                        className={`
                            block
                            w-full
                            h-full
                            font-defaultRegular
                            ${location.pathname === "/set-location" ? "text-[14px]" : "text-[14px] 2xs:text-[16px]"}
                            text-left
                            text-[#111111]
                            pr-[45px]
                            pl-[30px]
                            relative
                            z-[10]
                            whitespace-nowrap
                            overflow-hidden
                            text-ellipsis
                        `}
                    />
                    {
                        (pickupLocationInput.length > 0 && pickupLocation !== undefined) ?
                        <button type="button" className="
                            block
                            w-[45px]
                            h-full
                            absolute
                            z-[20]
                            top-0
                            right-0
                            px-[15px]
                            active:bg-[#dddddd]
                        " onClick={clearPickupLocationInput}>
                            <XIcon color="#999999"/>
                        </button> : ""
                    }
                    <button type="button" className={`
                        block
                        w-[45px]
                        h-full
                        absolute
                        z-[19]
                        top-0
                        ${pickupLocation === undefined ? "right-0" : "-right-[100px]"}
                        px-[12px]
                    `}>
                        <img src={Spinner} alt="" className="w-full"/>
                    </button>
                </div>
                <div className={`
                    block
                    w-[2px]
                    ${location.pathname === "/set-location" ? "h-[5px]" : "h-[10px]"}
                    overflow-visible
                    relative
                    z-[20]
                    ml-[14px]
                `}>
                    <div className={`
                        block
                        w-full
                        absolute
                        ${location.pathname === "/set-location" ? "h-[36px] -top-[15px]" : "h-[50px] -top-[20px]"}
                        left-[1px]
                        bg-[#999999]
                        duration-[.2s]
                        ease-in-out
                    `}></div>
                </div>
                <div className={`
                    block
                    w-full
                    ${location.pathname === "/set-location" ? "h-[50px]" : "h-[55px] 2xs:h-[60px]"}
                    overflow-hidden
                    relative
                    z-[10]
                    bg-[#ffffff]
                    border-[2px]
                    border-solid
                    ${(activeInput === "destination" && location.pathname === "/set-location") ? "border-[2px] border-[#111111]" : "border-[1px] border-[#bbbbbb]"}
                    ${location.pathname !== "/set-location" ? "bg-[#eeeeee]" : ""}
                    duration-[.2s]
                    ease-in-out
                `}>
                    <div className="
                        block
                        w-[10px]
                        h-[10px]
                        bg-[#111111]
                        absolute
                        z-[5]
                        top-[50%]
                        left-[10px]
                        -translate-y-1/2
                    "></div>
                    <input
                        type="text"
                        ref={destinationInputRef}
                        placeholder="Enter Destination"
                        onChange={e => setDestinationInput(e.target.value)}
                        onFocus={onInputFocus}
                        name="destination"
                        className={`
                            block
                            w-full
                            h-full
                            font-defaultRegular
                            ${location.pathname === "/set-location" ? "text-[14px]" : "text-[14px] 2xs:text-[16px]"}
                            text-left
                            text-[#111111]
                            pr-[45px]
                            pl-[30px]
                            relative
                            z-[10]
                            whitespace-nowrap
                            overflow-hidden
                            text-ellipsis
                        `}
                    />
                    {
                        (destinationInput.length > 0 && destination !== undefined) ?
                        <button type="button" className="
                            block
                            w-[45px]
                            h-full
                            absolute
                            z-[20]
                            top-0
                            right-0
                            px-[15px]
                            active:bg-[#dddddd]
                        " onClick={clearDestinationInput}>
                            <XIcon color="#999999"/>
                        </button> : ""
                    }
                    <button type="button" className={`
                        block
                        w-[45px]
                        h-full
                        absolute
                        z-[19]
                        top-0
                        ${destination === undefined ? "right-0" : "-right-[100px]"}
                        px-[12px]
                    `}>
                        <img src={Spinner} alt="" className="w-full"/>
                    </button>
                </div>
            </div>
            <div className={`
                block
                w-full
                ${location.pathname === "/set-location" ? "h-full" : "h-[40%]"}
                absolute
                z-[10]
                top-0
                left-0
                ${location.pathname === "/set-location" ? "pt-[115px]" : location.pathname === "/choose-vehicle" ? "pt-0" : "pt-[200px]"}
                overflow-hidden
                duration-[.2s]
                ease-in-out
            `} onTouchStart={() => window.document.activeElement.blur()}>
                {
                    location.pathname === "/set-location" ?
                    <div className={`
                        block
                        w-full
                        ${expandSavedPlaces ? "h-full overflow-auto pb-[100px] bg-[#ffffff]" : "h-[150px] 2xs:h-[155px]"}
                        absolute
                        z-[20]
                        top-0
                        left-0
                        text-left
                        pt-[120px]
                        duration-[.2s]
                    `} ref={scrollableArea}>
                        {
                            !expandSavedPlaces ?
                            <div className="
                                block
                                w-[94%]
                                max-w-[1000px]
                                mx-auto
                            ">
                                <button type="button" className="
                                    inline-block
                                    align-middle
                                    pr-[13px]
                                    2xs:pr-[15px]
                                    pl-[8px]
                                    h-[30px]
                                    2xs:h-[35px]
                                    rounded-[25px]
                                    bg-[#ffffff]
                                    font-defaultRegular
                                    text-[11px]
                                    2xs:text-[13px]
                                    text-center
                                    text-[#8a2be2]
                                    border
                                    border-solid
                                    border-[#dddddd]
                                    shadow-lg
                                    active:bg-[#eeeeee]
                                " onClick={onSavedPlacesBtnClick}>
                                    <div className="
                                        inline-block
                                        align-middle
                                        w-[20px]
                                        h-[20px]
                                        mr-[8px]
                                    ">
                                        <StarIcon color="#8a2be2"/>
                                    </div>
                                    <span className="inline-block align-middle">Saved Places</span>
                                </button>
                                {
                                    activeInput === "pickup" && (locationPermission === "prompt" || locationPermission === "granted") ?
                                    <button type="button" className="
                                        inline-block
                                        align-middle
                                        pr-[13px]
                                        2xs:pr-[15px]
                                        pl-[8px]
                                        h-[30px]
                                        2xs:h-[35px]
                                        rounded-[25px]
                                        bg-[#ffffff]
                                        font-defaultRegular
                                        text-[11px]
                                        2xs:text-[13px]
                                        text-center
                                        text-[#8a2be2]
                                        border
                                        border-solid
                                        border-[#dddddd]
                                        shadow-lg
                                        active:bg-[#eeeeee]
                                        ml-[6px]
                                    " onClick={findMe}>
                                        <div className="
                                            inline-block
                                            align-middle
                                            w-[20px]
                                            h-[20px]
                                            mr-[8px]
                                        ">
                                            <CrossHair color="#8a2be2"/>
                                        </div>
                                        <span className="inline-block align-middle">Find Me</span>
                                    </button> : ""
                                }
                            </div> :
                            <div className="
                                block
                                w-[94%]
                                max-w-[1000px]
                                mx-auto
                            ">
                                <div className="
                                    block
                                    w-full
                                    pl-[35px]
                                    2xs:pl-[40px]
                                    pr-[80px]
                                    relative
                                    py-[15px]
                                ">
                                    <button type="button" className="
                                        block
                                        w-[32px]
                                        2xs:w-[35px]
                                        h-[32px]
                                        2xs:h-[35px]
                                        p-[9px]
                                        active:bg-[#eeeeee]
                                        absolute
                                        top-1/2
                                        -translate-y-1/2
                                        left-0
                                    " onClick={() => window.history.back()}>
                                        <XIcon color="#111111"/>
                                    </button>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[16px]
                                        2xs:text-[18px]
                                        leading-[20px]
                                        2xs:leading-[23px]
                                    ">Saved Places</div>
                                    <Link to="/saved-places?add" className="
                                        inline-block
                                        font-defaultRegular
                                        text-left
                                        text-[#8a2be2]
                                        text-[12px]
                                        2xs:text-[13px]
                                        leading-[18px]
                                        absolute
                                        top-1/2
                                        -translate-y-1/2
                                        right-0
                                    ">+ Add Place</Link>
                                </div>
                                <div className="
                                    block
                                    w-full
                                    border-t
                                    border-solid
                                    border-[#dddddd]
                                    pt-[10px]
                                ">
                                    {
                                        (savedPlaces.data && !savedPlaces.loading) ?
                                        <>
                                            {
                                                savedPlaces.data.map(place => {
                                                    return <div key={place.id} className="
                                                        block
                                                        w-full
                                                        py-[15px]
                                                        active:bg-[#eeeeee]
                                                    " onClick={() => selectSavedPlace(place)}>
                                                        <div className="
                                                            block
                                                            w-full
                                                            font-defaultRegular
                                                            text-left
                                                            text-[16px]
                                                            2xs:text-[18px]
                                                            text-[#8a2be2]
                                                            leading-[20px]
                                                            mb-[6px]
                                                        ">{place.name}</div>
                                                        <div className="
                                                            block
                                                            w-full
                                                            font-defaultRegular
                                                            text-left
                                                            text-[12px]
                                                            2xs:text-[14px]
                                                            text-[#aaaaaa]
                                                            leading-[18px]
                                                        ">{place.formatted_address}</div>
                                                    </div>
                                                })
                                            }
                                        </> : ""
                                    }
                                </div>
                            </div>
                        }
                    </div> : ""
                }
                <div className="
                    block
                    w-full
                    h-full
                    bg-[#eeeeee]
                    relative
                    z-[10]
                " ref={mapsContainerRef}></div>
                <div className={`
                    block
                    w-full
                    h-[100px]
                    absolute
                    z-[20]
                    ${location.pathname === "/set-location" ? "bottom-0" : "-bottom-[110px]"}
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
                        ${(pickupLocation && destination) ? "bg-[#111111] active:bg-[#333333]" : "bg-[#aaaaaa]"}
                    `} onClick={chooseVehicle}>Continue
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
            <VehicleSelector/>
            <Checkout
                checkOut={checkOut}
                setCheckOut={setCheckOut}
            />
        </div>
    )

}

export default Editor