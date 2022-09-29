import { useState, useEffect } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
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
    const signedIn = useUserStore(state => state.signedIn)
    const [ newPlace ] = useState({
        loading: false,
        error: null,
        data: null
    })

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
                ${!newPlace.loading ? "active:bg-[#eeeeee]" : ""}
                translate-x-[12px]
                active:bg-[#eeeeee]
            `}>
                {
                    newPlace.loading ?
                    <img src={Spinner} alt="loading" className="
                        block
                        w-full
                    "/> :
                    <Check color="#8a2be2"/>
                }
            </button>
        )
        
    }

    useEffect(() => {
        if (signedIn === "no"){
            navigate("/", {replace: true})
        }
    }, [signedIn, navigate])
    
    return (
        <div className={`
            page
            pt-[50px]
        `}>
            <Header heading={locationQueries.includes("add") ? "Add New Place" : "Saved Places"} RightCTA={locationQueries.includes("add") ? AddPlaceBtn : AddPlaceLink}/>
            {
                locationQueries.includes("add") ?
                <AddPlace/> : ""
            }
        </div>
    )

}

export default SavedPlaces