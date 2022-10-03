import { useEffect } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import useStore from "../store"
import { useUserStore } from "../store"
import Header from "../components/Header"
import AddPlace from "../components/AddPlace"
import Check from "../components/icons/Check"
import Spinner from "../images/spinner.gif"

const SavedPlaces = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const locationQueries = useStore(state => state.locationQueries)
    const newPlaceForm = useStore(state => state.newPlaceForm)
    const setNewPlaceForm = useStore(state => state.setNewPlaceForm)
    const resetNewPlaceForm = useStore(state => state.resetNewPlaceForm)
    const signedIn = useUserStore(state => state.signedIn)
    const authToken = useUserStore(state => state.authToken)
    const resetUserData = useUserStore(state => state.reset)
    
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

    useEffect(() => {
        if (signedIn === "no"){
            navigate("/", {replace: true})
        }
    }, [signedIn, navigate])

    useEffect(() => {
        if (window.location.search.includes("select-location")){
            navigate("/saved-places?add", {replace: true})
        }
    }, [navigate])
    
    return (
        <div className={`
            page
            ${!locationQueries.includes("select-location") ? "pt-[50px]" : ""}
            duration-[.2s]
            ease-in-out
        `}>
            {
                !locationQueries.includes("select-location") ?
                <Header heading={locationQueries.includes("add") ? "Add New Place" : "Saved Places"} RightCTA={locationQueries.includes("add") ? AddPlaceBtn : AddPlaceLink}/> : ""
            }
            {
                locationQueries.includes("add") ?
                <AddPlace/> : ""
            }
        </div>
    )

}

export default SavedPlaces