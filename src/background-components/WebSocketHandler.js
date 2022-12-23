import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import useStore from "../store"
import { useUserStore, useInputStore } from "../store"
import { io } from "socket.io-client"
import { Haptics } from "@capacitor/haptics"

const WebSocketHandler = () => {
	
	const navigate = useNavigate()
	const authToken = useUserStore(state => state.authToken)
	const rideRequest = useStore(state => state.rideRequest)
	const rideRequestRef = useRef(rideRequest)
	const setRideRequest = useStore(state => state.setRideRequest)
	const setRejectingDrivers = useStore(state => state.setRejectingDrivers)
	const resetRideRequest = useStore(state => state.resetRideRequest)
	const setUaNearbyDrivers = useStore(state => state.setUaNearbyDrivers)
	const removeUaNearbyDriver = useStore(state => state.removeUaNearbyDriver)
	const nearbyDrivers = useStore(state => state.nearbyDrivers)
	const setDriversLiveLocation = useStore(state => state.setDriversLiveLocation)
	const onRideRequestAccepted = useInputStore(state => state.onRideRequestAccepted)
	const nearbyDriversRef = useRef(nearbyDrivers)

	useEffect(() => {
		nearbyDriversRef.current = nearbyDrivers
	}, [nearbyDrivers])

	useEffect(() => {
		rideRequestRef.current = rideRequest
	}, [rideRequest])

	// connect to web socket
	useEffect(() => {
		if (authToken){
			if (!window.socket){
				window.socket = io.connect(process.env.REACT_APP_WEB_SOCKET_URL, {
					extraHeaders: {
						"Authorization": `Bearer ${authToken}`,
						"client": "passenger"
					}
				})

				// add listeners
				window.socket.on("driver-unavailable", driverId => {
					if (window.location.pathname === "/nearby-drivers" && nearbyDriversRef.current && rideRequestRef.current){
						if (nearbyDriversRef.current.data && nearbyDriversRef.current.data.drivers.length > 0){
							const x = nearbyDriversRef.current.data.drivers.filter(d => d._id === driverId)
							if (x[0]){
								if (rideRequestRef.current.loading !== driverId && rideRequestRef.current.driver !== driverId){
									setUaNearbyDrivers([driverId])
								}
							}
						}
					}
				})
				window.socket.on("driver-available", driverId => {
					if (window.location.pathname === "/nearby-drivers" && nearbyDriversRef.current && rideRequestRef.current){
						if (nearbyDriversRef.current.data && nearbyDriversRef.current.data.drivers.length > 0){
							const x = nearbyDriversRef.current.data.drivers.filter(d => d._id === driverId)
							if (x[0]){
								if (rideRequestRef.current.loading !== driverId && rideRequestRef.current.driver !== driverId){
									removeUaNearbyDriver(driverId)
								}
							}
						}
					}
				})
				window.socket.on("ride-request-rejected", driverId => {
					if (window.location.pathname === "/nearby-drivers" && rideRequestRef.current && rideRequestRef.current.driver === driverId){
						setRejectingDrivers([driverId])
						resetRideRequest()
						Haptics.notification({type: "ERROR"})
					}
				})
				window.socket.on("sync-request-timeout", ttl => {
					if (window.location.pathname === "/nearby-drivers" && rideRequestRef.current && rideRequestRef.current.driver){
						if (window.requestTimeout){
							clearTimeout(window.requestTimeout)
						}
						setRideRequest({ttl})
					}
				})
				window.socket.on("ride-request-accepted", ride => {
					window.acceptedRideRequestData = ride
					navigate(`/history/${ride._id}`)
				})
				window.socket.on("drivers-live-location", location => {
					setDriversLiveLocation(location)
				})
			}
		}
		else {
            if (window.socket){
				window.socket.disconnect()
				window.socket = undefined
			}
		}
	}, [authToken, setRideRequest, setRejectingDrivers, setUaNearbyDrivers, removeUaNearbyDriver, resetRideRequest, onRideRequestAccepted, navigate, setDriversLiveLocation])
	
	return (<div className="hidden"></div>)

}

export default WebSocketHandler