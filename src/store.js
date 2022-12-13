import create from "zustand"
import { persist } from "zustand/middleware"

const store = set => ({
    staticData: {
        googleMapsApiKey: "AIzaSyBdsoUPPn8JFTz0fWm7MmnkeZA014yeukI",
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

    savedPlaces: {
        init: false,
        lastPlace: Date.now(),
        error: null,
        loading: false,
        data: []
    },
    setSavedPlaces: data => set(storeData => ({
        savedPlaces: {
            ...storeData.savedPlaces,
            ...data
        }
    })),
    resetSavedPlaces: () => set(() => ({
        savedPlaces: {
            init: false,
            lastPlace: Date.now(),
            error: null,
            loading: false,
            data: []
        }
    })),
    
    newPlaceForm: {
        placeId: "",
        title: "",
        address: "",
        coords: null,
        loading: false,
        error: null
    },
    setNewPlaceForm: data => set(() => ({newPlaceForm: data})),
    resetNewPlaceForm: () => set(() => ({newPlaceForm: {
        placeId: "",
        title: "",
        address: "",
        coords: null,
        loading: false,
        error: null
    }})),
    
    userDataIsUpToDate: false,
    setUserDataIsUpToDate: bool => set(() => ({userDataIsUpToDate: bool})),

    pricing: {
        init: false,
        loading: false,
        error: null,
        data: null
    },
    setPricing: data => set(() => ({pricing: data})),
    resetPricing: () => set(() => ({pricing: {
        init: false,
        loading: false,
        error: null,
        data: null
    }})),

    nearbyDrivers: {
        init: false,
        loading: false,
        error: null,
        data: null
    },
    setNearbyDrivers: data => set(storeData => ({
        nearbyDrivers: {
            ...storeData.nearbyDrivers,
            ...data
        }
    })),
    resetNearbyDrivers: () => set(() => ({
        nearbyDrivers: {
            init: false,
            loading: false,
            error: null,
            data: null
        }
    })),
    
    uaNearbyDrivers: [],
    setUaNearbyDrivers: data => set(storeData => ({
        uaNearbyDrivers: [
            ...storeData.uaNearbyDrivers,
            ...data
        ]
    })),
    removeUaNearbyDriver: driverId => set(storeData => {
        const newList = storeData.uaNearbyDrivers.filter(und => und !== driverId)
        return ({
            uaNearbyDrivers: newList
        })
    }),
    resetUaNearbyDrivers: () => set(() => ({
        uaNearbyDrivers: []
    })),

    notResponsiveDrivers: [],
    setNotResponsiveDrivers: data => set(storeData => ({
        notResponsiveDrivers: [
            ...storeData.notResponsiveDrivers,
            ...data
        ]
    })),
    resetNotResponsiveDrivers: () => set(() => ({
        notResponsiveDrivers: []
    })),
    
    rejectingDrivers: [],
    setRejectingDrivers: data => set(storeData => ({
        rejectingDrivers: [
            ...storeData.rejectingDrivers,
            ...data
        ]
    })),
    resetRejectingDrivers: () => set(() => ({
        rejectingDrivers: []
    })),
    
    rideRequest: {
        loading: "",
        error: null,
        driver: "",
        ttl: {
            value: 0,
            start: 0
        }
    },
    setRideRequest: data => set(storeData => ({
        rideRequest: {
            ...storeData.rideRequest,
            ...data
        }
    })),
    resetRideRequest: () => set(() => {
        if (window.requestTimeout){
            clearTimeout(window.requestTimeout)
        }
        
        return ({
            rideRequest: {
                loading: "",
                error: null,
                driver: "",
                ttl: {
                    value: 0,
                    start: 0
                }
            }
        })
    })
})

const hints = set => ({
    newPlaceLocationSelector: "show",
    hideNewPlaceLocationSelector: () => set(() => ({newPlaceLocationSelector: "hide"}))
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

    name: {
        prefilled: false,
        value: ""
    },
    setName: data => set(() => ({name: data})),

    phoneNumber: {
        prefilled: false,
        value: ""
    },
    setPhoneNumber: data => set(() => ({phoneNumber: data})),

    clearInputStore: () => set(() => ({
        pickupLocation: null,
        destination: null,
        distanceMatrix: null,
        vehicleType: {
            type: "two-wheeler",
            price: 0
        },
        name: {
            prefilled: false,
            value: ""
        },
        phoneNumber: {
            prefilled: false,
            value: ""
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
const useHints = create(persist(hints, {
    name: "hints",
    getStorages: () => window.localStorage
}))
const useInputStore = create(persist(inputStore, {
    name: "ride-input",
    getStorages: () => window.localStorage
}))
const useUserStore = create(persist(userStore, {
    name: "user-data",
    getStorages: () => window.localStorage
}))

export default useStore
export { useHints, useInputStore, useUserStore }