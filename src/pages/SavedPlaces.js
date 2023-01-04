import { useState, useEffect, useCallback, useRef } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import useStore from "../store"
import { useUserStore } from "../store"
import Header from "../components/Header"
import AddPlace from "../components/AddPlace"
import EditPlace from "../components/EditPlace"
import SavedPlace from "../components/SavedPlace"
import Check from "../components/icons/Check"
import SadFace from "../components/icons/SadFace"
import EditIcon from "../components/icons/Edit"
import EmptyIcon from "../components/icons/Empty"
import DeleteIcon from "../components/icons/Delete"
import XIcon from "../components/icons/XIcon"
import StarIcon from "../components/icons/Star"
import Spinner from "../images/spinner.gif"
import RippleThick from "../images/ripple-thick.gif"

const SavedPlaces = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const locationQueries = useStore(state => state.locationQueries)
    const newPlaceForm = useStore(state => state.newPlaceForm)
    const setNewPlaceForm = useStore(state => state.setNewPlaceForm)
    const resetNewPlaceForm = useStore(state => state.resetNewPlaceForm)
    const savedPlaces = useStore(state => state.savedPlaces)
    const setSavedPlaces = useStore(state => state.setSavedPlaces)
    const signedIn = useUserStore(state => state.signedIn)
    const authToken = useUserStore(state => state.authToken)
    const resetUserData = useUserStore(state => state.reset)
    const [ prompt, setPrompt ] = useState(null)
    const canLoadMore = useRef(true)
    
    const addPlace = async () => {
        if (!authToken || newPlaceForm.loading || !newPlaceForm.title || !newPlaceForm.address || !newPlaceForm.coords) return

        setNewPlaceForm({
            ...newPlaceForm,
            loading: true,
            error: null
        })

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/add-saved-place`, {
                title: newPlaceForm.title,
                address: newPlaceForm.address,
                coords: newPlaceForm.coords
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })

            if (res.status === 200 && res.data){
                setNewPlaceForm({
                    ...newPlaceForm,
                    loading: false,
                    error: null
                })
                resetNewPlaceForm()

                // add saved place to list
                setSavedPlaces({
                    data: [
                        res.data,
                        ...savedPlaces.data
                    ]
                })
                
                if (window.location.pathname === "/saved-places" && window.location.search.includes("add")){
                    window.history.back()
                }
            }
            else {
                setNewPlaceForm({
                    ...newPlaceForm,
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
            setNewPlaceForm({
                ...newPlaceForm,
                loading: false,
                error: {
                    message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
                }
            })
        }
    }

    const editPlace = async () => {
        if (!authToken || newPlaceForm.loading || !newPlaceForm.title || !newPlaceForm.address || !newPlaceForm.coords || !newPlaceForm.placeId) return

        setNewPlaceForm({
            ...newPlaceForm,
            loading: true,
            error: null
        })

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/edit-saved-place`, {
                placeId: newPlaceForm.placeId,
                title: newPlaceForm.title,
                address: newPlaceForm.address,
                coords: newPlaceForm.coords
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })

            if (res.status === 200 && res.data){
                setNewPlaceForm({
                    ...newPlaceForm,
                    loading: false,
                    error: null
                })
                resetNewPlaceForm()
                
                // delete old saved place from list add updated data
                const newList = savedPlaces.data.filter(sp => sp._id !== res.data._id)
                setSavedPlaces({
                    data: [
                        res.data,
                        ...newList
                    ]
                })
                
                if (window.location.pathname === "/saved-places" && window.location.search.includes("edit")){
                    window.history.back()
                }
            }
            else {
                setNewPlaceForm({
                    ...newPlaceForm,
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
            setNewPlaceForm({
                ...newPlaceForm,
                loading: false,
                error: {
                    message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
                }
            })
        }
    }
    
    const AddPlaceLink = () => {
        
        return (
            <Link to={`${location.pathname}?add`} className={`
                inline-block
                align-middle
                float-right
                font-defaultRegular
                text-center
                text-[#8a2be2]
                text-[12px]
                2xs:text-[14px]
                leading-[50px]
                active:bg-[#eeeeee]
            `}>+ Add Place</Link>
        )
        
    }

    const AddPlaceBtn = () => {

        return (
            <button type="button" className={`
                inline-block
                align-middle
                w-[50px]
                h-[50px]
                float-right
                p-[12px]
                ${(!newPlaceForm.loading && newPlaceForm.title && newPlaceForm.address && newPlaceForm.coords) ? "active:bg-[#eeeeee]" : ""}
                translate-x-[12px]
            `} onClick={addPlace}>
                {
                    newPlaceForm.loading ?
                    <img src={Spinner} alt="loading" className="
                        block
                        w-full
                    "/> :
                    <Check color={(newPlaceForm.title && newPlaceForm.address && newPlaceForm.coords) ? "#8a2be2" : "#dddddd"}/>
                }
            </button>
        )
        
    }

    const EditPlaceBtn = () => {

        return (
            <button type="button" className={`
                inline-block
                align-middle
                w-[50px]
                h-[50px]
                float-right
                p-[12px]
                ${(!newPlaceForm.loading && newPlaceForm.title && newPlaceForm.address && newPlaceForm.coords) ? "active:bg-[#eeeeee]" : ""}
                translate-x-[12px]
            `} onClick={editPlace}>
                {
                    newPlaceForm.loading ?
                    <img src={Spinner} alt="loading" className="
                        block
                        w-full
                    "/> :
                    <Check color={(newPlaceForm.title && newPlaceForm.address && newPlaceForm.coords) ? "#8a2be2" : "#dddddd"}/>
                }
            </button>
        )

    }
    
    const getPlaces = useCallback(async () => {
        if (!authToken || !canLoadMore.current || savedPlaces.loading) return
        
        if (!savedPlaces.init){
            setSavedPlaces({
                init: true
            })
        }

        setSavedPlaces({
            loading: true,
            error: null
        })
        canLoadMore.current = false
        
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-saved-places?lastPlace=${savedPlaces.lastPlace}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })

            if (res.status === 200 && res.data){
                if (res.data.length >= 50){
                    canLoadMore.current = true
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
        canLoadMore.current = true
        getPlaces()
    }
    
    const onScroll = e => {
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

    const deletePlace = async placeData => {
        if (!authToken || placeData.deleted) return
        
        if (!window.confirm("Are you sure you want to delete this place?")) return
        
        window.history.back()
        
        // mark place as deleted
        const newList = []
        savedPlaces.data.forEach(place => {
            if (place._id === placeData._id){
                newList.push({
                    ...place,
                    deleted: true
                })
            }
            else {
                newList.push(place)
            }
        })
        setSavedPlaces({
            data: newList
        })
        
        try {
            await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/delete-saved-place`, {
                data: {
                    placeId: placeData._id
                },
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
        }
        catch (err){
            if (err && err.response && err.response.data && err.response.data.code && err.response.data.code === "credential-expired"){
                // alert user that they have to reauthenticate and sign out
                alert(err.response.data.message)
                return resetUserData()
            }
        }
    }
    
    const onPromptBtnClick = to => {
        navigate(to, {replace: true})
    }
    
    useEffect(() => {
        if (signedIn === "no"){
            navigate("/", {replace: true})
        }
    }, [signedIn, navigate])

    useEffect(() => {
        if (window.location.search.includes("select-location")){
            if (window.location.search.includes("add")){
                navigate("/saved-places?add", {replace: true})
            }
            if (window.location.search.includes("edit")){
                navigate("/saved-places", {replace: true})
            }
        }
    }, [navigate])

    useEffect(() => {
        if (!savedPlaces.init){
            getPlaces()
        }
    }, [getPlaces, savedPlaces.init])

    useEffect(() => {
        if (savedPlaces.data.length < 1) return

        if (location.pathname === "/saved-places" && locationQueries.includes("prompt")){
            const placeId = window.location.search.split("?").join("").split("=")[1]
            if (!placeId) return
            
            // set prompt data
            const place = savedPlaces.data.filter(sp => sp._id === placeId)
            if (!place[0]) return
            setPrompt(place[0])
        }
        else {
            setPrompt(null)
        }
    }, [location, locationQueries, savedPlaces.data])
    
    return (
        <div className={`
            page
            ${!locationQueries.includes("select-location") ? "pt-[50px]" : ""}
            duration-[.2s]
            ease-in-out
        `}>
            {
                !locationQueries.includes("select-location") ?
                <Header
                    heading={
                        locationQueries.includes("add") ?
                        "Add New Place" :
                        locationQueries.includes("edit") ?
                        "Edit Place" :
                        "Saved Places"
                    }
                    RightCTA={
                        locationQueries.includes("add") ?
                        AddPlaceBtn :
                        locationQueries.includes("edit") ?
                        EditPlaceBtn :
                        AddPlaceLink
                    }
                /> : ""
            }
            {
                (locationQueries.includes("add") && !locationQueries.includes("edit")) ?
                <AddPlace/> : ""
            }
            {
                (locationQueries.includes("edit") && !locationQueries.includes("add")) ?
                <EditPlace/> : ""
            }
            <div className={`
                flex
                w-full
                h-full
                absolute
                z-[30]
                ${prompt ? "top-0" : "top-[120%]"}
                left-0
                bg-[rgba(0,0,0,.8)]
                overflow-auto
                py-[60px]
            `}>
                <div className={`
                    block
                    w-[40px]
                    h-[40px]
                    absolute
                    z-[10]
                    top-[10px]
                    right-[3%]
                    p-[11px]
                    active:bg-[rgba(255,255,255,.1)]
                    ${prompt ? "scale-[1]" : "scale-0"}
                    duration-[.2s]
                    ease-in-out
                `} onClick={() => window.history.back()}>
                    <XIcon color="#ffffff"/>
                </div>
                <div className={`
                    block
                    w-[94%]
                    max-w-[500px]
                    m-auto
                    bg-[#ffffff]
                    rounded-[10px]
                    overflow-hidden
                    border-[4px]
                    border-solid
                    border-[#ffffff]
                    relative
                    z-[9]
                    ${prompt ? "scale-[1]" : "scale-0"}
                    duration-[.2s]
                    ease-in-out
                `}>
                    <div className="
                        block
                        w-full
                        p-[15px]
                        pb-[30px]
                    ">
                        <h2 className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#111111]
                            text-[14px]
                            2xs:text-[16px]
                            leading-[20px]
                            mb-[8px]
                        ">
                            <span className="
                                inline-block
                                align-middle
                                w-[20px]
                                h-[20px]
                                mr-[6px]
                                bg-[#111111]
                                rounded-[2px]
                                p-[3px]
                            ">
                                <StarIcon color="#ffffff"/>
                            </span>
                            <span className="inline-block align-middle">{prompt ? prompt.title : ""}</span>
                        </h2>
                        <h3 className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#8a2be2]
                            text-[11px]
                            2xs:text-[13px]
                            leading-[18px]
                        ">{prompt ? prompt.address : ""}</h3>
                    </div>
                    <div className="
                        block
                        w-full
                        bg-[#dddddd]
                        rounded-t-[10px]
                        rounded-b-[8px]
                    ">
                        <div onClick={() => onPromptBtnClick(prompt ? `/set-location?pickup&lat=${prompt.coords.lat}&lng=${prompt.coords.lng}&address=${encodeURI(prompt.address)}` : "/set-location")} className="
                            block
                            w-full
                            font-defaultBold
                            text-left
                            text-[#444444]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[50px]
                            px-[15px]
                            border-[8px]
                            border-b-[4px]
                            border-solid
                            border-[#dddddd]
                            rounded-[16px]
                            bg-[#ffffff]
                            active:bg-[#eeeeee]
                            capitalize
                            whitespace-nowrap
                            overflow-hidden
                            text-ellipsis
                        ">
                            <span className="
                                inline-block
                                align-middle
                                w-[10px]
                                h-[10px]
                                mr-[10px]
                                bg-[#111111]
                                p-[6px]
                                rounded-[50%]
                            "></span>
                            <span className="
                                inline-block
                                align-middle
                            ">Set as pickup location</span>
                        </div>
                        <div onClick={() => onPromptBtnClick(prompt ? `/set-location?destination&lat=${prompt.coords.lat}&lng=${prompt.coords.lng}&address=${encodeURI(prompt.address)}` : "/set-location")} className="
                            block
                            w-full
                            font-defaultBold
                            text-left
                            text-[#444444]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[50px]
                            px-[15px]
                            border-[8px]
                            border-t-[4px]
                            border-b-[4px]
                            border-solid
                            border-[#dddddd]
                            rounded-[16px]
                            bg-[#ffffff]
                            active:bg-[#eeeeee]
                            capitalize
                            whitespace-nowrap
                            overflow-hidden
                            text-ellipsis
                        ">
                            <span className="
                                inline-block
                                align-middle
                                w-[10px]
                                h-[10px]
                                mr-[10px]
                                bg-[#111111]
                                p-[6px]
                            "></span>
                            <span className="
                                inline-block
                                align-middle
                            ">Set as destination</span>
                        </div>
                        <div onClick={() => onPromptBtnClick(`/saved-places?edit=${prompt ? prompt._id : ""}`)} className="
                            inline-block
                            align-middle
                            w-1/2
                            font-defaultBold
                            text-left
                            text-[#444444]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[50px]
                            px-[15px]
                            border-[8px]
                            border-t-[4px]
                            border-r-[4px]
                            border-solid
                            border-[#dddddd]
                            rounded-[16px]
                            bg-[#ffffff]
                            active:bg-[#eeeeee]
                            capitalize
                            whitespace-nowrap
                            overflow-hidden
                            text-ellipsis
                        ">
                            <span className="
                                inline-block
                                align-middle
                                w-[20px]
                                h-[20px]
                                mr-[10px]
                            ">
                                <EditIcon color="#111111"/>
                            </span>
                            <span className="
                                inline-block
                                align-middle
                            ">Edit</span>
                        </div>
                        <div onClick={prompt ? () => deletePlace(prompt) : null} className="
                            inline-block
                            align-middle
                            w-1/2
                            font-defaultBold
                            text-left
                            text-[#444444]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[50px]
                            px-[15px]
                            border-[8px]
                            border-t-[4px]
                            border-l-[4px]
                            border-solid
                            border-[#dddddd]
                            rounded-[16px]
                            bg-[#ffffff]
                            active:bg-[#eeeeee]
                            capitalize
                            whitespace-nowrap
                            overflow-hidden
                            text-ellipsis
                        ">
                            <span className="
                                inline-block
                                align-middle
                                w-[20px]
                                h-[20px]
                                mr-[10px]
                            ">
                                <DeleteIcon color="#111111"/>
                            </span>
                            <span className="
                                inline-block
                                align-middle
                            ">Delete</span>
                        </div>
                    </div>
                </div>
                <div className="
                    block
                    w-full
                    h-full
                    absolute
                    z-[1]
                    top-0
                    left-0
                " onClick={() => window.history.back()}></div>
            </div>
            <div className="
                block
                w-full
                h-full
                overflow-auto
            " onScroll={onScroll}>
                <div className="
                    block
                    w-full
                ">
                    {
                        savedPlaces.data.map(place => {
                            return (
                                <SavedPlace
                                    key={place._id}
                                    data={place}
                                    setPrompt={setPrompt}
                                />
                            )
                        })
                    }
                </div>
                {
                    savedPlaces.loading ?
                    <div className="
                        block
                        w-full
                        h-[3px]
                        relative
                        overflow-hidden
                    ">
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
                        " style={{backgroundImage: `url(${RippleThick})`}}></div>
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
                            text-center
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
    )

}

export default SavedPlaces