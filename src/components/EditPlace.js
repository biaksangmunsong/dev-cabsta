import { useState, useEffect, useRef, useCallback } from "react"
import { Haptics, ImpactStyle } from "@capacitor/haptics"
import { Link, useNavigate } from "react-router-dom"
import useStore from "../store"
import { useUserStore } from "../store"
import axios from "axios"
import TextareaAutosize from "react-textarea-autosize"
import getAddress from "../lib/getAddress"
import ChevronRight from "./icons/ChevronRight"
import LeftArrow from "./icons/LeftArrow"
import XIcon from "./icons/XIcon"
import StarIcon from "./icons/Star"
import SadFace from "./icons/SadFace"
import StarPin from "../images/star-pin.png"
import Spinner from "../images/spinner.gif"
import "../styles/places_autocomplete.css"

const EditPlace = () => {

    const navigate = useNavigate()
    const locationQueries = useStore(state => state.locationQueries)
    const newPlaceForm = useStore(state => state.newPlaceForm)
    const setNewPlaceForm = useStore(state => state.setNewPlaceForm)
    const staticData = useStore(state => state.staticData)
    const googleMapsScriptLoaded = useStore(state => state.googleMapsScriptLoaded)
    const resetNewPlaceForm = useStore(state => state.resetNewPlaceForm)
    const authToken = useUserStore(state => state.authToken)
    const resetUserData = useUserStore(state => state.reset)
    const [ prepopulation, setPrepopulation ] = useState({
        loading: false,
        error: null,
        data: null
    })
    const [ searchInput, setSearchInput ] = useState("")
    const [ reverseGeocoderLoading, setReverseGeocoderLoading ] = useState(false)
    const [ coords, setCoords ] = useState(null)
    const mapsRef = useRef(null)
    const mapsContainerRef = useRef(null)
    const titleInputRef = useRef(null)
    const searchInputRef = useRef(null)
    const geocoder = useRef(null)
    const marker = useRef(null)
    const searchAutocomplete = useRef(null)
    const scrollableArea = useRef(null)

    const getUpToDateData = useCallback(async () => {
        if (!authToken || prepopulation.loading || prepopulation.error || prepopulation.data) return
        
        setPrepopulation({
            loading: true,
            error: null,
            data: null
        })

        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/v1/get-saved-place?placeId=${newPlaceForm.placeId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            
            if (res.status === 200 && res.data){
                setPrepopulation({
                    loading: false,
                    error: null,
                    data: res.data
                })
            }
            else {
                setPrepopulation({
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
            setPrepopulation({
                loading: false,
                error: {
                    message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
                },
                data: null
            })
        }
    }, [newPlaceForm.placeId, prepopulation, authToken, resetUserData])
    
    const retryGettingUpToDateData = () => {
        setPrepopulation({
            loading: false,
            error: null,
            data: null
        })
    }

    const onTitleInputChange = e => {
        const title = e.target.value.replace(/(\r\n|\n|\r)/gm, "")
        if (title.length <= 100){
            setNewPlaceForm({
                ...newPlaceForm,
                title
            })
        }
    }

    const reverseGeocode = async location => {
        if (searchInputRef.current){
            searchInputRef.current.blur()
        }

        setSearchInput("")
        setCoords(null)
        if (searchInputRef.current){
            searchInputRef.current.value = ""
        }
        setReverseGeocoderLoading(true)
        
        try {
            // reverse geocode center of map
            if (!geocoder.current){
                geocoder.current = new window.google.maps.Geocoder()
            }

            const reverseGeocodedData = await geocoder.current.geocode({location})
            const formatted_address = getAddress(reverseGeocodedData)

            setSearchInput(formatted_address)
            setCoords(location)
            
            if (searchInputRef.current){
                searchInputRef.current.value = formatted_address
            }

            setReverseGeocoderLoading(false)
        }
        catch {
            // empty search input
            setSearchInput("")
            if (searchInputRef.current){
                searchInputRef.current.value = ""
            }

            // reset coords
            setCoords(null)
            
            // remove marker
            if (marker.current){
                marker.current.setMap(null)
                marker.current = null
            }
            
            setReverseGeocoderLoading(false)
        }
    }

    const clearSearchInput = () => {
        setSearchInput("")
        setCoords(null)
        
        if (searchInputRef.current){
            searchInputRef.current.value = ""
            searchInputRef.current.focus()
        }
        if (marker.current){
            marker.current.setMap(null)
            marker.current = null
        }
    }
    
    const onSearchInputChange = useCallback(e => {
        if (e){
            if (e.target){
                if (e.target.value === ""){
                    clearSearchInput()
                }
                else {
                    setSearchInput(e.target.value)
                }
            }
        }
        else {
            const place = searchAutocomplete.current.getPlace()
            if (place && place.geometry && searchInputRef.current){
                const newCoords = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                }

                setSearchInput(searchInputRef.current.value)
                setCoords(newCoords)
                
                if (mapsRef.current){
                    mapsRef.current.setCenter(newCoords)
                    mapsRef.current.setZoom(18)
                }
    
                // add/move marker
                if (!marker.current){
                    // create marker
                    marker.current = new window.google.maps.Marker({
                        position: newCoords,
                        map: mapsRef.current,
                        icon: StarPin,
                        draggable: true
                    })
    
                    // add dragend listener to marker
                    marker.current.addListener("dragend", async data => {
                        await Haptics.impact({style: ImpactStyle.Heavy})
                        const loc = {
                            lat: data.latLng.lat(),
                            lng: data.latLng.lng()
                        }
                        reverseGeocode(loc)
                    })
                }
                else {
                    marker.current.setPosition(newCoords)
                }
            }
        }
    }, [])
    
    const blurSearchInput = () => {
        if (searchInputRef.current){
            searchInputRef.current.blur()
        }
    }

    const doneSelectLocation = () => {
        if (!searchInput || !coords) return
        
        setNewPlaceForm({
            ...newPlaceForm,
            address: searchInput,
            coords
        })
        window.history.back()
    }
    
    useEffect(() => {
        if (googleMapsScriptLoaded && !mapsRef.current && mapsContainerRef.current && prepopulation.data){
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

            // add marker based on prepopulation data
            marker.current = new window.google.maps.Marker({
                position: prepopulation.data.coords,
                map: mapsRef.current,
                icon: StarPin,
                draggable: true
            })

            // add dragend listener to marker
            marker.current.addListener("dragend", async data => {
                await Haptics.impact({style: ImpactStyle.Heavy})
                const loc = {
                    lat: data.latLng.lat(),
                    lng: data.latLng.lng()
                }
                reverseGeocode(loc)
            })
            
            // listen to map click event
            mapsRef.current.addListener("click", async e => {
                if (marker.current) return

                await Haptics.impact({style: ImpactStyle.Heavy})

                // get location
                const location = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                }
                
                // create marker
                marker.current = new window.google.maps.Marker({
                    position: location,
                    map: mapsRef.current,
                    icon: StarPin,
                    draggable: true
                })

                // add dragend listener to marker
                marker.current.addListener("dragend", async data => {
                    await Haptics.impact({style: ImpactStyle.Heavy})
                    const loc = {
                        lat: data.latLng.lat(),
                        lng: data.latLng.lng()
                    }
                    reverseGeocode(loc)
                })
                
                reverseGeocode(location)
            })
        }
    }, [googleMapsScriptLoaded, staticData, prepopulation.data])

    useEffect(() => {
        if (googleMapsScriptLoaded && searchInputRef.current && !searchAutocomplete.current && prepopulation.data){
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
            
            searchAutocomplete.current = new window.google.maps.places.Autocomplete(searchInputRef.current, autocompleteOptions)
            searchAutocomplete.current.addListener("place_changed", onSearchInputChange)
        }
    }, [googleMapsScriptLoaded, onSearchInputChange, staticData, prepopulation.data])

    useEffect(() => {
        if (locationQueries.includes("select-location") && mapsRef.current && coords){
            mapsRef.current.setCenter(coords)
        }
    }, [locationQueries, coords])

    useEffect(() => {
        if (newPlaceForm.error && scrollableArea.current){
            scrollableArea.current.scrollTo(0,0)
        }
    }, [newPlaceForm])
    
    useEffect(() => {
        if (locationQueries.includes("edit") && !newPlaceForm.placeId){
            const queries = window.location.search.split("&")
            const query = queries.filter(q => q.replace("?", "").startsWith("edit="))
            if (query[0]){
                const id = query[0].split("=")[1]
                if (id){
                    return setNewPlaceForm({
                        ...newPlaceForm,
                        placeId: id
                    })
                }
            }
            
            navigate("/saved-places", {replace: true})
        }
    }, [navigate, locationQueries, newPlaceForm, setNewPlaceForm])

    useEffect(() => {
        if (newPlaceForm.placeId){
            getUpToDateData()
        }
    }, [newPlaceForm.placeId, getUpToDateData])

    useEffect(() => {
        if (prepopulation.data){
            // prepopulate inputs
            setNewPlaceForm({
                title: prepopulation.data.title,
                address: prepopulation.data.address,
                coords: prepopulation.data.coords,
                loading: false,
                error: null
            })
            if (searchInputRef.current){
                searchInputRef.current.value = prepopulation.data.address
            }
            setSearchInput(prepopulation.data.address)
            setCoords(prepopulation.data.coords)
        }
    }, [prepopulation.data, setNewPlaceForm])
    
    useEffect(() => {
        return () => {
            resetNewPlaceForm()
        }
    }, [resetNewPlaceForm])
    
    return (
        <div className="
            block
            w-full
            h-full
            overflow-hidden
            relative
        ">
            {
                prepopulation.data ?
                <>
                    <div className="
                        block
                        w-full
                        h-full
                        overflow-auto
                        pt-[20px]
                        pb-[40px]
                    " ref={scrollableArea}>
                        <div className="
                            block
                            w-[94%]
                            max-w-[1000px]
                            mx-auto
                            relative
                            z-[10]
                        ">
                            {
                                newPlaceForm.error ?
                                <div className="
                                    block
                                    w-full
                                    p-[10px]
                                    rounded-[6px]
                                    bg-[#dd0000]
                                    mb-[15px]
                                    font-defaultRegular
                                    text-[12px]
                                    2xs:text-[14px]
                                    text-left
                                    text-[#ffffff]
                                ">{newPlaceForm.error.message}</div> : ""
                            }
                            <div className="
                                block
                                w-full
                                bg-[#ffffff]
                                border-[1px]
                                border-solid
                                border-[#bbbbbb]
                                relative
                                z-[10]
                                overflow-hidden
                                mb-[15px]
                                2xs:mb-[10px]
                            ">
                                <TextareaAutosize
                                    id="place-title-input"
                                    placeholder="Title* - Eg. Home, Office, etc."
                                    name="place-title"
                                    value={newPlaceForm.title}
                                    onChange={onTitleInputChange}
                                    ref={titleInputRef}
                                    minRows={1}
                                    maxRows={10}
                                    className="
                                        block
                                        w-full
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[14px]
                                        2xs:text-[16px]
                                        leading-[20px]
                                        py-[15px]
                                        relative
                                        z-[5]
                                        pr-[50px]
                                        pl-[10px]
                                        focus:bg-[#eeeeee]
                                        resize-none
                                    "
                                />
                                <label htmlFor="place-title-input" className="
                                    block
                                    w-[50px]
                                    font-defaultRegular
                                    text-center
                                    text-[#444444]
                                    text-[11px]
                                    2xs:text-[12px]
                                    leading-[50px]
                                    absolute
                                    z-[10]
                                    top-0
                                    right-0
                                ">{100-newPlaceForm.title.length}</label>
                            </div>
                            <Link to={`/saved-places?edit=${newPlaceForm.placeId}&select-location`} className="
                                block
                                w-full
                                relative
                                px-[40px]
                                border-b
                                border-solid
                                border-[#dddddd]
                                py-[10px]
                                2xs:py-[15px]
                                active:bg-[#eeeeee]
                            ">
                                <div className="
                                    block
                                    w-[30px]
                                    h-[30px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    left-0
                                    bg-[#111111]
                                    p-[6px]
                                    rounded-[4px]
                                ">
                                    <StarIcon color="#ffffff"/>
                                </div>
                                <div className={`
                                    block
                                    w-full
                                    font-defaultBold
                                    text-left
                                    text-[#111111]
                                    text-[16px]
                                    2xs:text-[18px]
                                    leading-[22px]
                                    whitespace-nowrap
                                    overflow-hidden
                                    text-ellipsis
                                `}>Location*</div>
                                <div className={`
                                    block
                                    w-full
                                    font-defaultRegular
                                    text-left
                                    text-[#8a2be2]
                                    text-[12px]
                                    2xs:text-[14px]
                                    leading-[20px]
                                    whitespace-nowrap
                                    overflow-hidden
                                    text-ellipsis
                                `}>{newPlaceForm.address || "Set location on map"}</div>
                                <div className="
                                    block
                                    w-[20px]
                                    h-[20px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    right-[10px]
                                ">
                                    <ChevronRight color="#111111"/>
                                </div>
                            </Link>
                        </div>
                    </div>
                    <div className={`
                        block
                        w-full
                        h-full
                        overflow-hidden
                        absolute
                        z-[20]
                        ${locationQueries.includes("select-location") ? "top-0" : "top-[120%]"}
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
                            absolute
                            z-[10]
                            top-0
                            left-0
                        ">
                            <div className="
                                block
                                w-[94%]
                                max-w-[1000px]
                                h-full
                                mx-auto
                                relative
                                py-[5px]
                            ">
                                <button type="button" className="
                                    block
                                    w-[40px]
                                    h-[40px]
                                    absolute
                                    z-[10]
                                    top-[5px]
                                    left-0
                                    p-[11px]
                                    active:bg-[#dddddd]
                                " onClick={() => window.history.back()}>
                                    <LeftArrow color="#111111"/>
                                </button>
                                <input
                                    type="text"
                                    placeholder={reverseGeocoderLoading ? "Loading Address..." : "Search"}
                                    ref={searchInputRef}
                                    onChange={onSearchInputChange}
                                    className="
                                        block
                                        w-full
                                        h-full
                                        bg-[#eeeeee]
                                        px-[40px]
                                        text-ellipsis
                                    "
                                />
                                {
                                    searchInput ?
                                    <button type="button" className="
                                        block
                                        w-[40px]
                                        h-[40px]
                                        absolute
                                        z-[10]
                                        top-[5px]
                                        right-0
                                        p-[12px]
                                        active:bg-[#dddddd]
                                    " onClick={clearSearchInput}>
                                        <XIcon color="#888888"/>
                                    </button> : ""
                                }
                            </div>
                        </div>
                        <div className="
                            block
                            w-full
                            h-full
                            overflow-hidden
                            bg-[#eeeeee]
                            absolute
                            z-[5]
                            top-0
                            left-0
                        " ref={mapsContainerRef} onTouchEnd={blurSearchInput}></div>
                        <button type="button" className={`
                            block
                            w-[94%]
                            max-w-[500px]
                            h-[50px]
                            2xs:h-[55px]
                            absolute
                            z-[10]
                            bottom-[50px]
                            left-1/2
                            -translate-x-1/2
                            font-defaultBold
                            text-[#ffffff]
                            text-center
                            text-[14px]
                            2xs:text-[16px]
                            ${(searchInput && coords) ? "bg-[#111111] active:bg-[#444444]" : "bg-[#888888]"}
                        `} onClick={doneSelectLocation}>Done</button>
                    </div>
                </> : ""
            }
            {
                prepopulation.loading ?
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
                prepopulation.error ?
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
                    ">{prepopulation.error.message}</div>
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
                    " onClick={retryGettingUpToDateData}>Retry</button>
                </div> : ""
            }
        </div>
    )

}

export default EditPlace