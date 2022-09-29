import { useEffect, useRef, useCallback } from "react"
import { Haptics, ImpactStyle } from "@capacitor/haptics"
import useStore from "../store"
import getAddress from "../lib/getAddress"
import StarPin from "../images/star-pin.png"

const AddPlace = () => {

    const newPlaceForm = useStore(state => state.newPlaceForm)
    const setNewPlaceForm = useStore(state => state.setNewPlaceForm)
    const staticData = useStore(state => state.staticData)
    const googleMapsScriptLoaded = useStore(state => state.googleMapsScriptLoaded)
    const mapsRef = useRef(null)
    const mapsContainerRef = useRef(null)
    const titleInputRef = useRef(null)
    const addressInputRef = useRef(null)
    const geocoder = useRef(null)
    const marker = useRef(null)
    const locationAutocomplete = useRef(null)
    
    const onTitleInputChange = e => {
        const title = e.target.value.replace(/(\r\n|\n|\r)/gm, "")
        if (title.length <= 100){
            setNewPlaceForm({
                ...newPlaceForm,
                title
            })
        }
    }

    const reverseGeocode = useCallback(async location => {
        try {
            // reverse geocode center of map
            if (!geocoder.current){
                geocoder.current = new window.google.maps.Geocoder()
            }
            const reverseGeocodedData = await geocoder.current.geocode({location})
            const formatted_address = getAddress(reverseGeocodedData)
            setNewPlaceForm({
                ...newPlaceForm,
                address: formatted_address
            })
            if (addressInputRef.current){
                addressInputRef.current.value = formatted_address
            }
        }
        catch {
            // empty address input
            setNewPlaceForm({
                ...newPlaceForm,
                address: ""
            })
            if (addressInputRef.current){
                addressInputRef.current.value = ""
            }
            
            // remove marker
            if (marker.current){
                marker.current.setMap(null)
                marker.current = null
            }
        }
    }, [newPlaceForm, setNewPlaceForm])
    
    const onAddressInputChange = useCallback(e => {
        const place = locationAutocomplete.current.getPlace()
        
        if (!place){
            setNewPlaceForm({
                ...newPlaceForm,
                address: e.target.value
            })
        }
        else {
            if (place.geometry && addressInputRef.current){
                const coords = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                }
                setNewPlaceForm({
                    ...newPlaceForm,
                    address: addressInputRef.current.value
                })
                if (mapsRef.current){
                    mapsRef.current.setCenter(coords)
                    mapsRef.current.setZoom(18)
                }
    
                // add/move marker
                if (!marker.current){
                    // create marker
                    marker.current = new window.google.maps.Marker({
                        position: coords,
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
                    marker.current.setPosition(coords)
                }
            }
        }
    }, [newPlaceForm, setNewPlaceForm, reverseGeocode])
    
    const blurInputs = () => {
        if (titleInputRef.current){
            titleInputRef.current.blur()
        }
        if (addressInputRef.current){
            addressInputRef.current.blur()
        }
    }

    useEffect(() => {
        if (googleMapsScriptLoaded && !mapsRef.current && mapsContainerRef.current){
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

            // listen to maps dragend
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
    }, [googleMapsScriptLoaded, reverseGeocode, staticData])

    useEffect(() => {
        if (googleMapsScriptLoaded && addressInputRef.current && !locationAutocomplete.current){
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
            
            locationAutocomplete.current = new window.google.maps.places.Autocomplete(addressInputRef.current, autocompleteOptions)
            locationAutocomplete.current.addListener("place_changed", onAddressInputChange)
        }
    }, [googleMapsScriptLoaded, onAddressInputChange, staticData])
    
    return (
        <div className="
            block
            w-full
            h-full
            overflow-hidden
        ">
            <div className="
                block
                w-[94%]
                max-w-[1000px]
                h-full
                mx-auto
                relative
                pt-[135px]
                pb-[15px]
            ">
                <div className="
                    block
                    w-full
                    min-h-[50px]
                    bg-[#ffffff]
                    border-[2px]
                    border-solid
                    border-[#dddddd]
                    rounded-[6px]
                    absolute
                    z-[10]
                    top-[10px]
                    left-0
                ">
                    <input
                        id="place-title-input"
                        placeholder="Title* - Eg. Home, Office, etc."
                        name="place-title"
                        value={newPlaceForm.title}
                        onChange={onTitleInputChange}
                        ref={titleInputRef}
                        className="
                            block
                            w-full
                            h-[50px]
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[14px]
                            2xs:text-[16px]
                            relative
                            z-[9]
                            pr-[50px]
                            pl-[10px]
                        "
                    />
                    <div className="
                        block
                        w-[50px]
                        font-defaultRegular
                        text-center
                        text-[#444444]
                        text-[11px]
                        2xs:text-[12px]
                        leading-[50px]
                        absolute
                        z-[8]
                        top-0
                        right-0
                    ">{100-newPlaceForm.title.length}</div>
                </div>
                <div className="
                    block
                    w-full
                    min-h-[50px]
                    bg-[#ffffff]
                    border-[2px]
                    border-solid
                    border-[#dddddd]
                    rounded-[6px]
                    absolute
                    z-[10]
                    top-[70px]
                    left-0
                ">
                    <input
                        id="place-title-input"
                        placeholder="Address*"
                        name="place-title"
                        ref={addressInputRef}
                        onChange={onAddressInputChange}
                        className="
                            block
                            w-full
                            h-[50px]
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[14px]
                            2xs:text-[16px]
                            relative
                            z-[9]
                            px-[10px]
                            text-ellipsis
                        "
                    />
                </div>
                <div className="
                    block
                    w-full
                    h-full
                    overflow-hidden
                    bg-[#eeeeee]
                    relative
                    z-[5]
                    border-[2px]
                    border-solid
                    border-[#dddddd]
                    rounded-[6px]
                " ref={mapsContainerRef} onTouchEnd={blurInputs}></div>
            </div>
        </div>
    )

}

export default AddPlace