import { useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { Network } from "@capacitor/network"
import { Loader as GoogleMapsLoader } from "@googlemaps/js-api-loader"
import axios from "axios"

// import store
import useStore from "./store"
import { useUserStore, useInputStore } from "./store"

// import pages
import Home from "./pages/Home"
import SignIn from "./pages/SignIn"
import EditProfile from "./pages/EditProfile"
import Ride from "./pages/Ride"
import PageNotFound from "./pages/PageNotFound"
import SavedPlaces from "./pages/SavedPlaces"
import ChangePhoneNumber from "./pages/ChangePhoneNumber"

// import components
import OfflineBanner from "./components/OfflineBanner"
import ImageCropper from "./components/ImageCropper"

const App = () => {

	const location = useLocation()
	const staticData = useStore(state => state.staticData)
	const setViewport = useStore(state => state.setViewport)
	const locationQueries = useStore(state => state.locationQueries)
	const setLocationQueries = useStore(state => state.setLocationQueries)
    const networkStatus = useStore(state => state.networkStatus)
    const setNetworkStatus = useStore(state => state.setNetworkStatus)
    const googleMapsScriptLoaded = useStore(state => state.googleMapsScriptLoaded)
    const setGoogleMapsScriptLoaded = useStore(state => state.setGoogleMapsScriptLoaded)
    const userDataIsUpToDate = useStore(state => state.userDataIsUpToDate)
    const setUserDataIsUpToDate = useStore(state => state.setUserDataIsUpToDate)
    const resetProfileForm = useStore(state => state.resetProfileForm)
    const resetNewPlaceForm = useStore(state => state.resetNewPlaceForm)
    const resetSavedPlaces = useStore(state => state.resetSavedPlaces)
    const authToken = useUserStore(state => state.authToken)
    const updateUserData = useUserStore(state => state.update)
    const resetUserData = useUserStore(state => state.reset)
    const clearInputStore = useInputStore(state => state.clearInputStore)
    
    // listen to location query change
	useEffect(() => {
		const query = location.search.substring(1)
		if (query){
			const queries = query.split("&")
            const keys = []
            queries.forEach(q => {
                keys.push(q.split("=")[0])
            })
			setLocationQueries(keys)
		}
		else {
			setLocationQueries([])
		}
	}, [location.search, setLocationQueries])
	
	// handle app startup
    useEffect(() => {
        // check if user is online
        const asyncFn = async () => {
            const networkState = await Network.getStatus()
            setNetworkStatus(networkState.connected ? 1 : 0)
            
            await Network.addListener("networkStatusChange", status => {
                setNetworkStatus(status.connected ? 1 : 0)
            })
        }
        asyncFn()
    }, [setNetworkStatus])
    useEffect(() => {
        if (networkStatus === 0 || location.pathname === "/choose-vehicle" || locationQueries.includes("image-cropper") || locationQueries.includes("edit-profile-photo")){
            window.document.querySelector("meta[name='theme-color']").setAttribute("content", "#000000")
        }
        else {
            window.document.querySelector("meta[name='theme-color']").setAttribute("content", "#ffffff")
        }
    }, [location.pathname, locationQueries, networkStatus])
    useEffect(() => {
		// listen to viewport dimensions change
		window.addEventListener("resize", e => {
			setViewport({
				width: e.target.innerWidth,
				height: e.target.innerHeight
			})
		})
	}, [setViewport])

    // load google maps script
    useEffect(() => {
        if (!googleMapsScriptLoaded && networkStatus > 0){
            const loader = new GoogleMapsLoader({
                apiKey: staticData.googleMapsApiKey,
                version: "weekly",
                libraries: ["places"]
            })
            loader.loadCallback(err => {
                if (!err){
                    setGoogleMapsScriptLoaded(true)
                }
                else {
                    setGoogleMapsScriptLoaded(false)
                }
            })
        }
    }, [googleMapsScriptLoaded, setGoogleMapsScriptLoaded, networkStatus, staticData])

    // disable Tab key
    useEffect(() => {
        window.addEventListener("keydown", e => {
            if (e.key === "Tab"){
                e.preventDefault()
            }
        })
    }, [])

    // get up-to-date user data
    useEffect(() => {
        if (networkStatus === 1 && !userDataIsUpToDate && authToken){
            const getUserData = async () => {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/v1/get-user-data`, {
                        headers: {
                            Authorization: `Bearer ${authToken}`
                        }
                    })
                    if (res.status === 200 && res.data){
                        updateUserData({
                            _id: res.data._id || "",
                            phoneNumber: res.data.phoneNumber || "",
                            countryCode: res.data.countryCode || "",
                            name: res.data.name || "",
                            profilePhoto: res.data.profilePhoto ? res.data.profilePhoto.url : "",
                            profilePhotoThumbnail: res.data.profilePhoto ? res.data.profilePhoto.thumbnail_url : ""
                        })
                    }
                    else {
                        setUserDataIsUpToDate(false)
                    }
                }
                catch (err){
                    if (err && err.response && err.response.data && err.response.data.code && err.response.data.code === "credential-expired"){
                        // sign out
                        resetUserData()
                    }
                    else {
                        setUserDataIsUpToDate(false)
                    }
                }
            }
            getUserData()
        }
    }, [networkStatus, userDataIsUpToDate, setUserDataIsUpToDate, authToken, updateUserData, resetUserData])

    useEffect(() => {
        // clear all form when signed out
        if (!authToken){
            resetProfileForm()
            resetNewPlaceForm()
            clearInputStore()
            resetSavedPlaces()
        }
    }, [authToken, resetProfileForm, resetNewPlaceForm, clearInputStore, resetSavedPlaces])
    
    return (
        <div className={`
            block
            w-full
            h-full
			fixed
			top-0
			left-0
            overflow-hidden
            ${networkStatus === 0 ? "pt-[25px]" : ""}
            duration-200
            ease-in-out
        `}>
            {
                (networkStatus < 1 && networkStatus !== -1) ?
                <OfflineBanner/> : ""
            }
            {
                locationQueries.includes("image-cropper") ?
                <ImageCropper/> : ""
            }
            <Routes>
                <Route path="/" element={
                    <Home/>
                }/>
                <Route path="/set-location" element={
                    <Home/>
                }/>
                <Route path="/choose-vehicle" element={
                    <Home/>
                }/>
                <Route path="/checkout" element={
                    <Home/>
                }/>
                <Route path="/edit-profile" element={
                    <EditProfile/>
                }/>
                <Route path="/signin/:phone" element={
                    <SignIn/>
                }/>
                <Route path="/history/:rideId" element={
                    <Ride/>
                }/>
                <Route path="/saved-places" element={
                    <SavedPlaces/>
                }/>
                <Route path="/change-phone-number" element={
                    <ChangePhoneNumber/>
                }/>
                <Route path="*" element={
                    <PageNotFound/>
                }/>
            </Routes>
        </div>
    )

}

export default App