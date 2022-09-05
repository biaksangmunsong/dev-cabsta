import { useState, useEffect, useCallback, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import useStore from "../store"
import { useInputStore } from "../store"
import TextareaAutosize from "react-textarea-autosize"
import { Storage } from "@capacitor/storage"
import LongRightArrow from "./icons/LongRightArrow"
import LeftArrow from "./icons/LeftArrow"
import SadFace from "./icons/SadFace"
import Ripple from "../images/ripple.gif"
import genUuid from "../lib/genUuid"

const twoWheelerDrivers = [
    {
        id: "1",
        name: "Biaksang Munsong",
        photo: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1660085669/cabsta/profilepic_amgays.jpg",
        gender: "Male",
        phoneNumber: {
            withCountryCode: "+917085259566",
            withoutCountryCode: "7085259566"
        },
        age: 22,
        distance: "0.3 km",
        vehicle: {
            name: "Activa 4G",
            maxPassenger: 1,
            numberPlate: "XX XX XX 1234"
        }
    },
    {
        id: "2",
        name: "Pumsonthang Singson",
        photo: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1660086226/cabsta/image_2_d4aeks.jpg",
        gender: "Male",
        phoneNumber: {
            withCountryCode: "+918119050477",
            withoutCountryCode: "8119050477"
        },
        age: 23,
        distance: "0.5 km",
        vehicle: {
            name: "Activa 3G",
            maxPassenger: 1,
            numberPlate: "XX XX XX 1234"
        }
    },
    {
        id: "3",
        name: "Jason Lalremrout",
        photo: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1660086226/cabsta/image_1_pvbqua.jpg",
        gender: "Male",
        phoneNumber: {
            withCountryCode: "+918974838076",
            withoutCountryCode: "8974838076"
        },
        age: 23,
        distance: "0.6 km",
        vehicle: {
            name: "Yanama XSR155",
            maxPassenger: 1,
            numberPlate: "XX XX XX 1234"
        }
    }
]

const fourWheelerDrivers = [
    {
        id: "1",
        name: "Pumsonthang Singson",
        photo: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1660086226/cabsta/image_2_d4aeks.jpg",
        gender: "Male",
        phoneNumber: {
            withCountryCode: "+918119050477",
            withoutCountryCode: "8119050477"
        },
        age: 23,
        distance: "0.2 km",
        vehicle: {
            name: "Honda Amaze",
            maxPassenger: 4,
            numberPlate: "XX XX XX 1234"
        }
    },
    {
        id: "2",
        name: "Jason Lalremrout",
        photo: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1660086226/cabsta/image_1_pvbqua.jpg",
        gender: "Male",
        phoneNumber: {
            withCountryCode: "+918974838076",
            withoutCountryCode: "8974838076"
        },
        age: 23,
        distance: "0.4 km",
        vehicle: {
            name: "Tata Altroz",
            maxPassenger: 4,
            numberPlate: "XX XX XX 1234"
        }
    },
    {
        id: "3",
        name: "Biaksang Munsong",
        photo: "https://res.cloudinary.com/biaksangmunsong/image/upload/v1660085669/cabsta/profilepic_amgays.jpg",
        gender: "Male",
        phoneNumber: {
            withCountryCode: "+917085259566",
            withoutCountryCode: "7085259566"
        },
        age: 22,
        distance: "0.5 km",
        vehicle: {
            name: "Maruti Suzuki Swift",
            maxPassenger: 4,
            numberPlate: "XX XX XX 1234"
        }
    }
]

const Checkout = ({checkOut, setCheckOut}) => {

    const location = useLocation()
    const navigate = useNavigate()
    const pickupLocation = useInputStore(state => state.pickupLocation)
    const destination = useInputStore(state => state.destination)
    const distanceMatrix = useInputStore(state => state.distanceMatrix)
    const setDistanceMatrix = useInputStore(state => state.setDistanceMatrix)
    const vehicleType = useInputStore(state => state.vehicleType)
    const setVehicleType = useInputStore(state => state.setVehicleType)
    const userData = useStore(state => state.userData)
    const setRequestedRide = useStore(state => state.setRequestedRide)
    const [ name, setName ] = useState({
        prefilled: false,
        value: ""
    })
    const [ driver, setDriver ] = useState(null)
    const [ drivers, setDrivers ] = useState({
        init: false,
        loading: false,
        error: null,
        data: null
    })
    const scrollableArea = useRef(null)
    
    const onNameInputChange = e => {
        const name = e.target.value.replace(/(\r\n|\n|\r)/gm, "")
        if (name.length <= 50){
            setName({
                prefilled: true,
                value: name
            })
        }
    }

    const onDriverSelected = d => {
        setDriver(d)
    }
    
    const getDrivers = useCallback(() => {
        if (drivers.loading){
            return
        }
        
        setDrivers({
            init: true,
            loading: true,
            error: null,
            data: null
        })

        // simulate api call
        setTimeout(() => {
            setDrivers({
                init: true,
                loading: false,
                error: null,
                data: vehicleType.type === "two-wheeler" ? twoWheelerDrivers : fourWheelerDrivers
            })
            
            // setDrivers({
            //     init: true,
            //     loading: false,
            //     error: {
            //         message: "Oops! Something went wrong. Please try again."
            //     },
            //     data: null
            // })
        }, 400)
    }, [drivers, vehicleType])

    const retryGettingDrivers = () => {
        getDrivers()
    }

    const requestARide = () => {
        if (
            checkOut.loading ||
            name.value.length < 4 ||
            name.value.length > 50 ||
            !userData.data ||
            !userData.data.phoneNumber ||
            !vehicleType.price ||
            !driver ||
            !pickupLocation ||
            !destination
        ){
            return
        }

        setCheckOut({
            loading: true,
            error: null
        })

        // simulate api request
        setTimeout(async () => {
            const now = Date.now()
            const rideId = genUuid(20)
            const newHistoryItem = {
                id: rideId,
                name: name.value,
                photo: userData.data.profilePhoto,
                phoneNumber: userData.data.phoneNumber,
                pickupLocation,
                destination,
                driver,
                vehicleType: vehicleType.type,
                price: vehicleType.price,
                distance: distanceMatrix.distance,
                duration: distanceMatrix.duration,
                requestedAt: now,
                pickupAt: now+(distanceMatrix.duration.value*1000)
            }

            setRequestedRide(newHistoryItem)
            
            let history = []
            const storedHistory = await Storage.get({key: "history"})
            if (storedHistory.value){
                history = JSON.parse(storedHistory.value)
                history = history.filter((h, i) => i < 9)
            }
            history.unshift(newHistoryItem)
            await Storage.set({key: "history", value: JSON.stringify(history)})
            
            setVehicleType({
                type: vehicleType.type,
                price: 0
            })

            const goToSuccessPage = () => {
                setCheckOut({
                    loading: false,
                    error: null
                })
                setDistanceMatrix(null)
                navigate(`/history/${rideId}`, {replace: true})
            }
            
            if (window.location.pathname === "/checkout"){
                window.history.back()
                window.history.back()
                setTimeout(goToSuccessPage, 100)
            }
            else if (window.location.pathname === "/choose-vehicle"){
                window.history.back()
                setTimeout(goToSuccessPage, 100)
            }
            else if (window.location.pathname === "/set-location"){
                goToSuccessPage()
            }
            else {
                setCheckOut({
                    loading: false,
                    error: null
                })
                setDistanceMatrix(null)
            }
            
            // setCheckOut({
            //     loading: false,
            //     error: {
            //         message: "Oops, something went wrong! Please try again."
            //     }
            // })
            // if (scrollableArea.current){
            //     scrollableArea.current.scrollTo(0,0)
            // }
        }, 500)
    }
    
    useEffect(() => {
        if (userData.data && userData.data.name && !name.prefilled && location.pathname === "/checkout"){
            setName({
                prefilled: true,
                value: userData.data.name
            })
        }
    }, [userData, location.pathname, name.prefilled])

    useEffect(() => {
        if (location.pathname === "/checkout"){
            if (!drivers.init){
                getDrivers()
            }
        }
        else {
            if (drivers.init){
                setDrivers({
                    init: false,
                    loading: false,
                    error: null,
                    data: null
                })
            }
        }
    }, [location.pathname, getDrivers, drivers.init])

    useEffect(() => {
        if (location.pathname === "/checkout"){
            setDriver(null)
            setCheckOut({
                loading: false,
                error: null
            })
        }
    }, [location.pathname, setCheckOut])
    
    return (
        <div className={`
            block
            w-full
            h-full
            bg-[#ffffff]
            absolute
            ${location.pathname === "/checkout" ? "top-0" : "top-full"}
            left-0
            z-[30]
            pb-[100px]
            duration-[.2s]
            ease-in-out
        `}>
            <div className="
                block
                w-full
                h-full
                overflow-auto
                relative
                z-[10]
            " ref={scrollableArea}>
                <div className="
                    block
                    w-[94%]
                    max-w-[1000px]
                    mx-auto
                    pb-[30px]
                ">
                    <button type="button" className="
                        block
                        w-[50px]
                        h-[50px]
                        p-[15px]
                        -ml-[15px]
                        active:bg-[#eeeeee]
                        mb-[15px]
                    " onClick={() => window.history.back()}>
                        <LeftArrow color="#111111"/>
                    </button>
                    {
                        checkOut.error ?
                        <div className="
                            block
                            w-full
                            p-[15px]
                            bg-[#dd0000]
                            mb-[30px]
                            rounded-[6px]
                            font-defaultRegular
                            text-left
                            text-[13px]
                            2xs:text-[15px]
                            leading-[20px]
                            2xs:leading-[22px]
                            text-[#ffffff]
                        ">{checkOut.error.message}</div> : ""
                    }
                    <div className="
                        block
                        w-full
                        relative
                        mb-[15px]
                    ">
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#888888]
                            text-[11px]
                            2xs:text-[12px]
                            leading-[16px]
                            mb-[4px]
                        ">Name</div>
                        <TextareaAutosize
                            placeholder="Enter Your Name"
                            name="name"
                            value={name.value}
                            onChange={onNameInputChange}
                            minRows={1}
                            maxRows={10}
                            className="
                                block
                                w-full
                                min-h-[55px]
                                2xs:min-h-[60px]
                                bg-[#eeeeee]
                                border
                                border-solid
                                border-[#cccccc]
                                font-defaultBold
                                text-left
                                text-[#111111]
                                text-[14px]
                                2xs:text-[16px]
                                leading-[23px]
                                2xs:leading-[24px]
                                pr-[30px]
                                pl-[10px]
                                py-[16px]
                                2xs:py-[18px]
                                rounded-[4px]
                                resize-none
                            "
                        />
                        <div className="
                            block
                            w-[30px]
                            font-defaultRegular
                            text-center
                            text-[#444444]
                            text-[11px]
                            2xs:text-[12px]
                            leading-[55px]
                            2xs:leading-[60px]
                            absolute
                            top-[20px]
                            right-0
                        ">{50-name.value.length}</div>
                    </div>
                    {
                        (userData.data && userData.data.phoneNumber) ?
                        <div className="
                            block
                            w-full
                            mb-[15px]
                        ">
                            <div className="
                                block
                                w-full
                                font-defaultRegular
                                text-left
                                text-[#888888]
                                text-[11px]
                                2xs:text-[12px]
                                leading-[16px]
                                mb-[4px]
                            ">Phone Number</div>
                            <div className="
                                block
                                w-full
                                font-defaultBold
                                text-left
                                text-[#111111]
                                text-[14px]
                                2xs:text-[16px]
                                leading-[20px]
                            ">{userData.data.phoneNumber.withoutCountryCode}</div>
                        </div> : ""
                    }
                    <div className="
                        block
                        w-full
                        mb-[15px]
                        border-y
                        border-solid
                        border-[#cccccc]
                        py-[15px]
                    ">
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#888888]
                            text-[11px]
                            2xs:text-[12px]
                            leading-[16px]
                            mb-[4px]
                        ">Price</div>
                        <div className="
                            block
                            w-full
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[23px]
                            2xs:text-[25px]
                            leading-[30px]
                        ">₹{vehicleType.price}</div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#888888]
                            text-[11px]
                            2xs:text-[12px]
                            leading-[16px]
                        ">Pay with cash or GPay, on pickup.</div>
                    </div>
                    <div className="
                        block
                        w-full
                        font-defaultRegular
                        text-left
                        text-[#111111]
                        text-[14px]
                        2xs:text-[16px]
                        leading-[23px]
                        2xs:leading-[25px]
                        mb-[15px]
                    ">Select a Driver</div>
                    {
                        drivers.loading ?
                        <div className="
                            block
                            w-[94%]
                            max-w-[300px]
                            mx-auto
                            text-center
                            py-[50px]
                        ">
                            <img src={Ripple} alt="" className="
                                block
                                w-[80px]
                                mx-auto
                                mb-[6px]
                            "/>
                            <div className="
                                block
                                w-full
                                font-defaultRegular
                                text-center
                                text-[#111111]
                                text-[14px]
                                2xs:text-[16px]
                                leading-[20px]
                            ">Searching drivers near you...</div>
                        </div> : ""
                    }
                    {
                        drivers.error ?
                        <div className="
                            block
                            w-[94%]
                            max-w-[300px]
                            mx-auto
                            text-center
                            py-[50px]
                        ">
                            <div className="
                                block
                                w-[60px]
                                mx-auto
                                mb-[10px]
                            ">
                                <SadFace/>
                            </div>
                            <div className="
                                block
                                w-full
                                font-defaultRegular
                                text-center
                                text-[#111111]
                                text-[14px]
                                2xs:text-[16px]
                                leading-[20px]
                                mb-[20px]
                            ">{drivers.error.message}</div>
                            <button type="button" className="
                                block
                                w-full
                                max-w-[120px]
                                h-[40px]
                                bg-[#8a2be2]
                                mx-auto
                                font-defaultRegular
                                text-center
                                text-[#ffffff]
                                text-[12px]
                                2xs:text-[14px]
                                rounded-[4px]
                                active:opacity-[.8]
                            " onClick={retryGettingDrivers}>Retry</button>
                        </div> : ""
                    }
                    {
                        drivers.data ?
                        <div className="
                            block
                            w-full
                        ">
                            {
                                drivers.data.map(d => {
                                    return (
                                        <div key={d.id} className={`
                                            block
                                            w-full
                                            rounded-[6px]
                                            overflow-hidden
                                            border-[2px]
                                            border-solid
                                            ${(driver && driver.id === d.id) ? "border-[#8a2be2] bg-[#eeeeee]" : "border-[#cccccc] bg-[#ffffff]"}
                                            relative
                                            px-[10px]
                                            py-[15px]
                                            pl-[60px]
                                            mb-[10px]
                                            last:mb-0
                                        `} onClick={() => onDriverSelected(d)}>
                                            <div className="
                                                block
                                                w-[40px]
                                                h-[40px]
                                                absolute
                                                top-1/2
                                                -translate-y-1/2
                                                left-[10px]
                                                bg-[#eeeeee]
                                                rounded-[50%]
                                                bg-no-repeat
                                                bg-center
                                                bg-cover
                                            " style={{backgroundImage: `url(${d.photo})`}}></div>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultBold
                                                text-left
                                                text-[#111111]
                                                text-[13px]
                                                2xs:text-[15px]
                                                leading-[20px]
                                                mb-[5px]
                                            ">{d.name}, {d.gender}, {d.age}</div>
                                            <div className="
                                                block
                                                w-full
                                                font-defaultRegular
                                                text-left
                                                text-[#111111]
                                                text-[11px]
                                                2xs:text-[12px]
                                                leading-[15px]
                                            ">
                                                <div className="inline-block">{d.distance}<span className="inline-dot bg-[#8a2be2]"></span></div>
                                                <div className="inline-block">{d.vehicle.name}<span className="inline-dot bg-[#8a2be2]"></span></div>
                                                <div className="inline-block">{d.vehicle.maxPassenger} passenger</div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div> : ""
                    }
                </div>
            </div>
            <div className={`
                block
                w-full
                h-[100px]
                absolute
                z-[20]
                bottom-0
                left-0
                bg-[#ffffff]
                py-[5px]
                border-t
                border-solid
                border-[#dddddd]
                duration-[.2s]
                ease-in-out
            `}>
                <button type="button" className={`
                    block
                    w-[94%]
                    max-w-[1000px]
                    h-[55px]
                    2xs:h-[60px]
                    mx-auto
                    font-defaultBold
                    text-left
                    text-[#ffffff]
                    text-[14px]
                    2xs:text-[16px]
                    px-[20px]
                    ${(
                        name.value.length > 3 &&
                        name.value.length < 51 &&
                        userData.data &&
                        userData.data.phoneNumber &&
                        vehicleType.price &&
                        driver &&
                        pickupLocation &&
                        destination
                    ) ? "bg-[#111111] active:bg-[#333333]" : "bg-[#888888]"}
                `} onClick={requestARide}>
                    Request a Ride
                    <div className="
                        inline-block
                        align-middle
                        float-right
                        w-[24px]
                    ">
                        <LongRightArrow color="#ffffff"/>
                    </div>
                </button>
            </div>
        </div>
    )

}

export default Checkout