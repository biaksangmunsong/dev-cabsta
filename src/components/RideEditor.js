import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import useStore from "../store"
import { useUserStore, useInputStore } from "../store"
import { Geolocation } from "@capacitor/geolocation"
import SetLocationHints from "./SetLocationHints"
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
import RideDetails from "./RideDetails"
import NearbyDrivers from "./NearbyDrivers"
import SadFace from "./icons/SadFace"
import EmptyIcon from "./icons/Empty"
import QuestionIcon from "./icons/Question"
import Exclamation from "./icons/Exclamation"

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
    const passengersName = useInputStore(state => state.name)
    const passengersPhoneNumber = useInputStore(state => state.phoneNumber)

    const viewport = useStore(state => state.viewport)
    const locationQueries = useStore(state => state.locationQueries)
    const savedPlaces = useStore(state => state.savedPlaces)
    const setSavedPlaces = useStore(state => state.setSavedPlaces)

    const authToken = useUserStore(state => state.authToken)
    const resetUserData = useUserStore(state => state.reset)
    const [ pickupLocationInput, setPickupLocationInput ] = useState("")
    const [ destinationInput, setDestinationInput ] = useState("")
    const [ activeInput, setActiveInput ] = useState("pickup")
    const [ locationPermission, setLocationPermission ] = useState(null)
    const [ expandSavedPlaces, setExpandSavedPlaces ] = useState(false)
    const [ usersLocation, setUsersLocation ] = useState(null)
    const [ locationPointsError, setLocationPointsError ] = useState("")
    const activeInputRef = useRef(activeInput)
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
    const directionsData = useRef(null)
    const canLoadMoreSavedPlaces = useRef(true)
    const shouldAutoSetMapCenter = useRef(true)
    
    const onHintBtnClick = () => {
        if (window.location.search.includes("show-hints")){
            window.history.back()
        }
        else {
            navigate("/set-location?show-hints")
        }
    }
    
    const startLocationWatch = useCallback(async () => {
        if (!locationWatchId.current && locationPermission === "granted"){
            const watchId = await Geolocation.watchPosition({enableHighAccuracy: true}, data => {
                if (data && data.coords){
                    setUsersLocation({
                        lat: data.coords.latitude,
                        lng: data.coords.longitude
                    })
                }
            })
            locationWatchId.current = watchId
        }
    }, [locationPermission])

    const getPlaces = useCallback(async () => {
        if (!authToken || !canLoadMoreSavedPlaces.current || savedPlaces.loading) return
        
        if (!savedPlaces.init){
            setSavedPlaces({
                init: true
            })
        }

        setSavedPlaces({
            loading: true,
            error: null
        })
        canLoadMoreSavedPlaces.current = false
        
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-saved-places?lastPlace=${savedPlaces.lastPlace}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })

            if (res.status === 200 && res.data){
                if (res.data.length >= 50){
                    canLoadMoreSavedPlaces.current = true
                }
                setSavedPlaces({
                    lastPlace: res.data.length ? res.data[res.data.length-1].lastModified : savedPlaces.lastPlace,
                    loading: false,
                    error: null,
                    data: [
                        ...savedPlaces.data,
                        ...res.data
                    ]
                })
            }
            else {
                setSavedPlaces({
                    loading: false,
                    error: {
                        message: "Something went wrong, please try again."
                    }
                })
            }
        }
        catch (err){
            if (err && err.response && err.response.data && err.response.data.code && err.response.data.code === "credential-expired"){
                // alert user that they have to reauthenticate and sign out
                alert(err.response.data.message)
                return resetUserData()
            }
            setSavedPlaces({
                loading: false,
                error: {
                    message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
                }
            })
        }
    }, [
        authToken,
        resetUserData,
        savedPlaces.init,
        savedPlaces.data,
        savedPlaces.lastPlace,
        savedPlaces.loading,
        setSavedPlaces
    ])
    
    const retryGettingPlaces = () => {
        canLoadMoreSavedPlaces.current = true
        getPlaces()
    }

    const onSavedPlacesScroll = e => {
        const sh = e.target.scrollHeight
        const ch = e.target.clientHeight
        const st = e.target.scrollTop
        const trigger = ch/3
        const x = sh-(ch+trigger)
        
        if (sh > ch){
            if (x <= st){
                getPlaces()
            }
        }
    }
    
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

        if (place && place.geometry && pickupInputRef.current){
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

        if (place && place.geometry && destinationInputRef.current){
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

    const onAddPlaceBtnClick = () => {
        if (window.location.search.includes("expand-saved-places")){
            window.history.back()
        }
        setTimeout(() => {
            navigate("/saved-places?add")
        }, 10)
    }
    
    const selectSavedPlace = place => {
        if (activeInput === "pickup"){
            if (pickupInputRef.current){
                pickupInputRef.current.value = place.address
                setPickupLocationInput(place.address)
            }
            setPickupLocation({
                inputValue: place.address,
                coords: place.coords,
                formatted_address: place.address
            })
            if (mapsRef.current){
                mapsRef.current.setCenter(place.coords)
                mapsRef.current.setZoom(18)
            }
            window.history.back()
        }
        else if (activeInput === "destination"){
            if (destinationInputRef.current){
                destinationInputRef.current.value = place.address
                setDestinationInput(place.address)
            }
            setDestination({
                inputValue: place.address,
                coords: place.coords,
                formatted_address: place.address
            })
            if (mapsRef.current){
                mapsRef.current.setCenter(place.coords)
                mapsRef.current.setZoom(18)
            }
            window.history.back()
        }
    }

    const chooseVehicle = async () => {
        if (pickupLocation && destination && mapsRef.current && !locationPointsError){
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
                    directionsData.current = {
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
                        pickupMarker.current.setPosition(directionsData.current.start)
                        destinationMarker.current.setPosition(directionsData.current.end)
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
        activeInputRef.current = activeInput
    }, [activeInput])
    
    useEffect(() => {
        if (!savedPlaces.init && locationQueries.includes("expand-saved-places")){
            getPlaces()
        }
    }, [getPlaces, savedPlaces.init, locationQueries])
    
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

                // listen to map click event
                mapsRef.current.addListener("click", async e => {
                    const location = {
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng()
                    }
                    
                    // reverse geocode location and set pickup location and destination
                    if (activeInputRef.current === "pickup"){
                        if (!pickupMarker.current){
                            //empty input and set placeholder to loading
                            if (pickupInputRef.current){
                                pickupInputRef.current.value = ""
                                pickupInputRef.current.placeholder = "Loading..."
                                setPickupLocationInput("")
                            }

                            shouldAutoSetMapCenter.current = false
                            
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
                                
                                setTimeout(() => {
                                    shouldAutoSetMapCenter.current = true
                                }, 100)
                            }
                            catch {
                                setPickupLocation(null)
                                pickupInputRef.current.placeholder = "Enter Pickup Location"
                                
                                // remove marker
                                if (pickupMarker.current){
                                    pickupMarker.current.setMap(null)
                                    pickupMarker.current = null
                                }
                                
                                shouldAutoSetMapCenter.current = true
                            }
                        }
                    }
                    if (activeInputRef.current === "destination"){
                        if (!destinationMarker.current){
                            //empty input and set placeholder to loading
                            if (destinationInputRef.current){
                                destinationInputRef.current.value = ""
                                destinationInputRef.current.placeholder = "Loading..."
                                setDestinationInput("")
                            }

                            shouldAutoSetMapCenter.current = false

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

                                setTimeout(() => {
                                    shouldAutoSetMapCenter.current = true
                                }, 100)
                            }
                            catch {
                                setDestination(null)
                                destinationInputRef.current.placeholder = "Enter Destination"
                                
                                // remove marker
                                if (destinationMarker.current){
                                    destinationMarker.current.setMap(null)
                                    destinationMarker.current = null
                                }

                                shouldAutoSetMapCenter.current = true
                            }
                        }
                    }
                })
            }

            const query = window.location.search
            const queries = query.split("&")
            navigate("/set-location", {replace: true})

            if (
                query.startsWith("?pickup&lat=") &&
                query.includes("&lat=") &&
                query.includes("&lng=") &&
                query.includes("&address=")
            ){
                // get data from query
                let lat, lng, address
                queries.forEach(q => {
                    if (q.startsWith("lat=") && !lat){
                        lat = Number(q.split("=")[1]) || 0
                    }
                    if (q.startsWith("lng=") && !lng){
                        lng = Number(q.split("=")[1]) || 0
                    }
                    if (q.startsWith("address=") && !address){
                        address = decodeURI(q.split("=")[1])
                    }
                })
                
                if (pickupInputRef.current){
                    pickupInputRef.current.value = address
                    setPickupLocationInput(address)
                    const pl = {
                        inputValue: address,
                        coords: {lat,lng},
                        formatted_address: address
                    }
                    setPickupLocation(pl)
                    pickupLocationRef.current = pl
                    setActiveInput("pickup")
                }
            }
            else {
                if (pickupLocation && !pickupMarker.current && mapsRef.current){
                    createPickupMarker()
                    if (activeInput === "pickup" && shouldAutoSetMapCenter.current){
                        mapsRef.current.setCenter(pickupLocation.coords)
                    }
                }
            }

            if (
                query.startsWith("?destination&lat=") &&
                query.includes("&lat=") &&
                query.includes("&lng=") &&
                query.includes("&address=")
            ){
                // get data from query
                let lat, lng, address
                queries.forEach(q => {
                    if (q.startsWith("lat=") && !lat){
                        lat = Number(q.split("=")[1]) || 0
                    }
                    if (q.startsWith("lng=") && !lng){
                        lng = Number(q.split("=")[1]) || 0
                    }
                    if (q.startsWith("address=") && !address){
                        address = decodeURI(q.split("=")[1])
                    }
                })
                
                if (destinationInputRef.current){
                    destinationInputRef.current.value = address
                    setDestinationInput(address)
                    const ds = {
                        inputValue: address,
                        coords: {lat,lng},
                        formatted_address: address
                    }
                    setDestination(ds)
                    destinationRef.current = ds
                    setActiveInput("destination")
                }
            }
            else {
                if (destination && !destinationMarker.current && mapsRef.current && !window.location.search.includes("destination=")){
                    createDestinationMarker()
                    if (activeInput === "destination" && shouldAutoSetMapCenter.current){
                        mapsRef.current.setCenter(destination.coords)
                    }
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
        activeInput,
        setPickupLocation,
        setDestination,
        navigate
    ])
    
    useEffect(() => {
        if (activeInput === "pickup" && pickupLocationRef.current){
            if (mapsRef.current){
                mapsRef.current.setCenter(pickupLocationRef.current.coords)
            }
        }
        else if (activeInput === "destination" && destinationRef.current){
            if (mapsRef.current){
                mapsRef.current.setCenter(destinationRef.current.coords)
            }
        }
    }, [activeInput])
    
    useEffect(() => {
        // set input value when history changes
        const query = window.location.search
        if (!(
            query.startsWith("?pickup&lat=") &&
            query.includes("&lat=") &&
            query.includes("&lng=") &&
            query.includes("&address=")
        )){
            if (query && !query.includes("expand-menu") && !query.includes("show-hints")){
                navigate("/set-location", {replace: true})
            }
            if (pickupLocationRef.current && pickupInputRef.current){
                pickupInputRef.current.value = pickupLocationRef.current.inputValue
                setPickupLocationInput(pickupLocationRef.current.inputValue)
            }
        }

        if (!(
            query.startsWith("?destination&lat=") &&
            query.includes("&lat=") &&
            query.includes("&lng=") &&
            query.includes("&address=")
        )){
            if (query && !query.includes("expand-menu") && !query.includes("show-hints")){
                navigate("/set-location", {replace: true})
            }
            if (destinationRef.current && destinationInputRef.current){
                destinationInputRef.current.value = destinationRef.current.inputValue
                setDestinationInput(destinationRef.current.inputValue)
            }
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
    }, [location.pathname, navigate])

    useEffect(() => {
        if (location.pathname === "/nearby-drivers"){
            if (!pickupLocation || !destination || !mapsRef.current || !directionsRenderer.current || !distanceMatrix || passengersName.value.length < 4 || passengersName.value.length > 50 || passengersPhoneNumber.value.length !== 10){
                window.history.back()
            }
        }
        else if (location.pathname === "/ride-details"){
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
    }, [location.pathname, pickupLocation, destination, distanceMatrix, passengersName, passengersPhoneNumber])
    
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

    useEffect(() => {
        if (pickupLocation && destination){
            if (
                pickupLocation.coords.lat === destination.coords.lat &&
                pickupLocation.coords.lng === destination.coords.lng
            ){
                return setLocationPointsError("Pickup Location and Destination should not be the same.")
            }
            
            setLocationPointsError("")
        }
        else {
            setLocationPointsError("")
        }
    }, [pickupLocation, destination])
    
    return (
        <div className={`
            block
            w-full
            bg-[#ffffff]
            relative
            overflow-hidden
        `} style={location.pathname !== "/" ? {height: `${viewport.height}px`} : {}}>
            <div className={`
                ${location.pathname === "/set-location" ? "block" : "hidden"}
                ${
                    locationQueries.includes("show-hints") ?
                    "w-full h-full bottom-0 right-0 bg-[#ffffff]" :
                    "w-[40px] h-[40px] bottom-[130px] right-[3%] bg-transparent"
                }
                max-h-full
                overflow-hidden
                absolute
                z-[30]
                duration-[.2s]
                ease-in-out
            `}>
                <div className={`
                    block
                    w-full
                    ${locationQueries.includes("show-hints") ? "bg-[#ffffff] h-[60px] border-b" : "h-[40px]"}
                    overflow-hidden
                    relative
                    z-[20]
                    border-solid
                    border-[#cccccc]
                `}>
                    <div className={`
                        block
                        ${locationQueries.includes("show-hints") ? "w-[94%]" : "w-full"}
                        max-w-[1000px]
                        mx-auto
                        relative
                    `}>
                        <button type="button" className={`
                            block
                            w-[40px]
                            h-[40px]
                            ${locationQueries.includes("show-hints") ? "bg-transparent top-[10px] -left-[10px]" : "bg-[#111111] top-0 left-0"}
                            rounded-[50%]
                            p-[12px]
                            absolute
                            z-[20]
                            duration-[.2s]
                            ease-in-out
                        `} onClick={onHintBtnClick}>
                            {
                                locationQueries.includes("show-hints") ?
                                <XIcon color="#111111"/> :
                                <QuestionIcon color="#ffffff"/>
                            }
                        </button>
                    </div>
                </div>
                {
                    locationQueries.includes("show-hints") ?
                    <SetLocationHints/> : ""
                }
            </div>
            <div className={`
                ${(location.pathname === "/choose-vehicle" || location.pathname === "/nearby-drivers") ? "hidden" : "block"}
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
                ${location.pathname === "/nearby-drivers" ? "pt-[50px]" : "pt-0"}
                top-0
                left-0
                ${location.pathname === "/set-location" ? "pt-[115px]" : (location.pathname === "/choose-vehicle" || location.pathname === "/nearby-drivers") ? "pt-0" : "pt-[200px]"}
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
                    `} ref={scrollableArea} onScroll={onSavedPlacesScroll}>
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
                                    <button type="button" className="
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
                                    " onClick={onAddPlaceBtnClick}>+ Add Place</button>
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
                                        savedPlaces.data ?
                                        <>
                                            {
                                                savedPlaces.data.map(place => {
                                                    if (place.deleted){
                                                        return <div key={place._id} className="
                                                            block
                                                            w-full
                                                            mx-auto
                                                            font-defaultBold
                                                            text-left
                                                            text-[#cccccc]
                                                            text-[14px]
                                                            2xs:text-[16px]
                                                            py-[15px]
                                                            overflow-hidden
                                                            border-b
                                                            border-solid
                                                            border-[#dddddd]
                                                            last:border-none
                                                        ">Deleted</div>
                                                    }
                                                    
                                                    return <div key={place._id} className="
                                                        block
                                                        w-full
                                                        py-[15px]
                                                        active:bg-[#eeeeee]
                                                        border-b
                                                        border-solid
                                                        border-[#dddddd]
                                                        last:border-none
                                                    " onClick={() => selectSavedPlace(place)}>
                                                        <div className="
                                                            block
                                                            w-full
                                                            font-defaultRegular
                                                            text-left
                                                            text-[14px]
                                                            2xs:text-[16px]
                                                            text-[#8a2be2]
                                                            leading-[20px]
                                                            mb-[3px]
                                                        ">{place.title}</div>
                                                        <div className="
                                                            block
                                                            w-full
                                                            font-defaultRegular
                                                            text-left
                                                            text-[12px]
                                                            text-[#aaaaaa]
                                                            leading-[18px]
                                                            whitespace-nowrap
                                                            overflow-hidden
                                                            text-ellipsis
                                                        ">{place.address}</div>
                                                    </div>
                                                })
                                            }
                                        </> : ""
                                    }
                                    {
                                        savedPlaces.loading ?
                                        <div className="
                                            block
                                            w-full
                                            py-[20px]
                                        ">
                                            <img src={Spinner} alt="" className="
                                                block
                                                w-[35px]
                                                h-[35px]
                                                mx-auto
                                                mb-[5px]
                                            "/>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultBold
                                                text-[#111111]
                                                text-[14px]
                                                2xs:text-[16px]
                                                text-center
                                            ">Loading...</div>
                                        </div> : ""
                                    }
                                    {
                                        savedPlaces.error ?
                                        <div className="
                                            block
                                            w-full
                                            max-w-[300px]
                                            mx-auto
                                            py-[20px]
                                        ">
                                            <div className="
                                                block
                                                w-[50px]
                                                h-[50px]
                                                mx-auto
                                                mb-[10px]
                                            ">
                                                <SadFace/>
                                            </div>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultBold
                                                text-[#111111]
                                                text-[14px]
                                                2xs:text-[16px]
                                                text-center
                                                mb-[20px]
                                            ">{savedPlaces.error.message}</div>
                                            <button type="button" className="
                                                block
                                                w-[120px]
                                                h-[40px]
                                                mx-auto
                                                bg-[#8a2be2]
                                                rounded-[6px]
                                                font-defaultBold
                                                text-[center]
                                                text-[#ffffff]
                                                text-[12px]
                                                2xs:text-[14px]
                                                active:opacity-[.8]
                                            " onClick={retryGettingPlaces}>Retry</button>
                                        </div> : ""
                                    }
                                    {
                                        (!savedPlaces.loading && !savedPlaces.error && savedPlaces.data.length === 0) ?
                                        <div className="
                                            block
                                            w-[94%]
                                            max-w-[1000px]
                                            mx-auto
                                            py-[20px]
                                        ">
                                            <div className="
                                                block
                                                w-[50px]
                                                h-[50px]
                                                mx-auto
                                                mb-[10px]
                                            ">
                                                <EmptyIcon color="#111111"/>
                                            </div>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultBold
                                                text-[#111111]
                                                text-[14px]
                                                2xs:text-[16px]
                                                text-center
                                            ">You don't have any saved place yet.</div>
                                        </div> : ""
                                    }
                                </div>
                            </div>
                        }
                    </div> : ""
                }
                <div className={`
                    block
                    w-full
                    h-full
                    bg-[#eeeeee]
                    relative
                    z-[10]
                    ${location.pathname === "/set-location" ? "pb-[100px]" : "pb-0"}
                    ${location.pathname === "/nearby-drivers" ? "border border-solid border-[#cccccc] rounded-[10px]" : ""}
                    overflow-hidden
                `}>
                    <div className="
                        block
                        w-full
                        h-full
                        relative
                        z-[10]
                    " ref={mapsContainerRef}></div>
                </div>
                <div className={`
                    block
                    w-full
                    absolute
                    z-[19]
                    ${(location.pathname === "/set-location" && locationPointsError) ? "bottom-[99px]" : "-bottom-[110px]"}
                    left-0
                    bg-[#ffffff]
                    py-[5px]
                    border-t
                    border-solid
                    border-[#dddddd]
                    duration-[.2s]
                    ease-in-out
                `}>
                    <div className="
                        block
                        w-[94%]
                        max-w-[1000px]
                        mx-auto
                        font-defaultRegular
                        text-left
                        text-[#111111]
                        text-[12px]
                        2xs:text-[12px]
                    ">
                        <span className="
                            inline-block
                            align-middle
                            w-[18px]
                            h-[18px]
                            rounded-[50%]
                            mr-[6px]
                            bg-[#cc0000]
                            p-[4px]
                        ">
                            <Exclamation color="#ffffff"/>
                        </span>
                        <span className="inline align-middle">{locationPointsError}</span>
                    </div>
                </div>
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
                        ${(pickupLocation && destination && !locationPointsError) ? "bg-[#111111] active:bg-[#333333]" : "bg-[#aaaaaa]"}
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
            <RideDetails/>
            <NearbyDrivers/>
        </div>
    )

}

export default Editor