import create from "zustand"
import { persist } from "zustand/middleware"

const store = set => ({
    staticData: {
        googleMapsApiKey: "AIzaSyCzc9KD66M7qUOlTIOdq4TFH5u4AyVk49A",
        servicableArea: {
            southWest: {
                lat: 24.232911,
                lng: 93.578557
            },
            northEast: {
                lat: 24.404045,
                lng: 93.799313
            }
        },
        defaultMapCenter: {
            lat: 24.3427,
            lng: 93.6978
        }
    },
    
    networkStatus: -1,
    setNetworkStatus: status => set(() => ({networkStatus: status})),
    
    viewport: {
        width: window.innerWidth,
        height: window.innerHeight
    },
    setViewport: data => set(() => ({viewport: data})),
    
    locationQueries: [],
    setLocationQueries: queries => set(() => ({locationQueries: queries})),
    
    savedPlaces: {
        loading: false,
        error: null,
        data: [
            {
                id: "1",
                name: "Home sweet home",
                formatted_address: "8MM9+CR8, Pearsonmun, Churachandpur, Manipur 795128, India",
                coords: {
                    lat: 24.3335443,
                    lng: 93.6695878
                }
            },
            {
                id: "2",
                name: "Salon",
                formatted_address: "Airtel Mobile Tower Hebron Veng, Tedim Rd, Hebron Veng, New Lamka, Churachandpur, Manipur 795128, India",
                coords: {
                    lat: 24.3321116,
                    lng: 93.69412129999999
                }
            }
        ]
    },
    setSavedPlaces: places => set(() => ({savedPlaces: places})),
    
    googleMapsScriptLoaded: false,
    setGoogleMapsScriptLoaded: bool => set(() => ({googleMapsScriptLoaded: bool})),
    
    expandMenu: false,
    setExpandMenu: bool => set(() => ({expandMenu: bool})),

    requestedRide: null,
    setRequestedRide: data => set(() => ({requestedRide: data})),

    imageToCrop: null,
    setImageToCrop: image => set(() => ({imageToCrop: image})),

    profileForm: {
        profilePhoto: "",
        name: "",
        updating: false,
        error: null,
        photoLoading: false,
        prepopulated: false
    },
    setProfileForm: data => set(() => ({profileForm: data})),
    resetProfileForm: () => set(() => ({profileForm: {
        profilePhoto: "",
        name: "",
        updating: false,
        error: null,
        photoLoading: false,
        prepopulated: false
    }})),
    
    userDataIsUpToDate: false,
    setUserDataIsUpToDate: bool => set(() => ({userDataIsUpToDate: bool}))
})

const inputStore = set => ({
    pickupLocation: null,
    setPickupLocation: data => set(() => ({pickupLocation: data})),

    destination: null,
    setDestination: data => set(() => ({destination: data})),

    distanceMatrix: null,
    setDistanceMatrix: data => set(() => ({distanceMatrix: data})),

    vehicleType: {
        type: "two-wheeler",
        price: 0
    },
    setVehicleType: data => set(() => ({vehicleType: data})),

    clearInputStore: () => set(() => ({
        pickupLocation: null,
        destination: null,
        distanceMatrix: null,
        vehicleType: {
            type: "two-wheeler",
            price: 0
        }
    }))
})

const userStore = set => ({
    signedIn: "no",
    _id: "",
    phoneNumber: "",
    countryCode: "",
    name: "",
    profilePhoto: "",
    profilePhotoThumbnail: "",
    authToken: "",
    update: data => set(() => ({...data})),
    reset: () => set(() => ({
        signedIn: "no",
        _id: "",
        phoneNumber: "",
        countryCode: "",
        name: "",
        profilePhoto: "",
        profilePhotoThumbnail: "",
        authToken: ""
    }))
})

const useStore = create(store)
const useInputStore = create(persist(inputStore, {
    name: "location-input",
    getStorages: () => window.localStorage
}))
const useUserStore = create(persist(userStore, {
    name: "user-data",
    getStorages: () => window.localStorage
}))

export default useStore
export { useInputStore, useUserStore }