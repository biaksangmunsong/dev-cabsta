import { useEffect, useCallback, useRef } from "react"
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
import Spinner from "../images/spinner.gif"

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
    const canLoadMore = useRef(true)
    
    const addPlace = async () => {
        if (!authToken || newPlaceForm.loading || !newPlaceForm.title || !newPlaceForm.address || !newPlaceForm.coords) return

        setNewPlaceForm({
            ...newPlaceForm,
            loading: true,
            error: null
        })

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/v1/add-saved-place`, {
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
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/v1/edit-saved-place`, {
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
                text-[center]
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
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/v1/get-saved-places?lastPlace=${savedPlaces.lastPlace}`, {
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
                                <SavedPlace key={place._id} data={place}/>
                            )
                        })
                    }
                </div>
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
            </div>
        </div>
    )

}

export default SavedPlaces