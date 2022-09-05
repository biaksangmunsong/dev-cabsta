import { useState, useEffect, useCallback } from "react"
import { Storage } from "@capacitor/storage"
import { useNavigate, useParams } from "react-router-dom"
import useStore from "../store"
import LeftArrow from "../components/icons/LeftArrow"
import Spinner from "../images/spinner.gif"
import ProfilePhoto from "../images/profile-photo.jpg"

const Ride = () => {

    const navigate = useNavigate()
    const params = useParams()
    const requestedRide = useStore(state => state.requestedRide)
    const setRequestedRide = useStore(state => state.setRequestedRide)
    const [ details, setDetails ] = useState({
        init: false,
        loading: false,
        data: null
    })

    const getDetails = useCallback(() => {
        if (!params.rideId){
            return navigate("/", {replace: true})
        }

        if (requestedRide && requestedRide.id === params.rideId){
            setDetails({
                init: true,
                loading: false,
                data: requestedRide
            })
        }
        else {
            setDetails({
                init: true,
                loading: true,
                data: null
            })

            setTimeout(async () => {
                const storedHistory = await Storage.get({key: "history"})
                if (storedHistory.value){
                    let history = JSON.parse(storedHistory.value)
                    history = history.filter(h => h.id === params.rideId)
                    if (history[0]){
                        setDetails({
                            init: true,
                            loading: false,
                            data: history[0]
                        })
                    }
                    else {
                        navigate("/", {replace: true})
                    }
                }
                else {
                    navigate("/", {replace: true})
                }
            }, 500)
        }
    }, [navigate, params.rideId, requestedRide])
    
    useEffect(() => {
        if (!details.init){
            getDetails()
        }
    }, [getDetails, details.init])

    useEffect(() => {
        if (details.init && details.data && requestedRide && requestedRide.id === details.data.id){
            // clear requested ride
            setRequestedRide(null)
        }
    }, [details, requestedRide, setRequestedRide])

    return (
        <div className="page pt-[50px]">
            <div className="
                block
                w-full
                h-[50px]
                bg-[#ffffff]
                border-b
                border-solid
                border-[#cccccc]
                absolute
                z-[20]
                top-0
                left-0
            ">
                <div className="
                    block
                    w-[94%]
                    max-w-[1000px]
                    mx-auto
                    relative
                ">
                    <button type="button" className="
                        block
                        w-[50px]
                        h-[50px]
                        absolute
                        top-0
                        -left-[15px]
                        p-[15px]
                    " onClick={() => window.history.back()}>
                        <LeftArrow color="#111111"/>
                    </button>
                </div>
            </div>
            <div className="
                block
                w-full
                h-full
                overflow-auto
            ">
                <div className="
                    block
                    w-[94%]
                    max-w-[1000px]
                    mx-auto
                ">
                    {
                        details.loading ?
                        <div className="
                            block
                            w-full
                            py-[50px]
                        ">
                            <img src={Spinner} alt="" className="
                                block
                                w-[30px]
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
                            ">Please wait...</div>
                        </div> : ""
                    }
                    {
                        details.data ?
                        <div className="
                            block
                            w-full
                            pt-[20px]
                            pb-[50px]
                        ">
                            {
                                (Date.now() < details.data.pickupAt) ?
                                <div className="
                                    block
                                    w-full
                                    font-defaultBold
                                    text-left
                                    text-[#111111]
                                    text-[23px]
                                    2xs:text-[25px]
                                    leading-[32px]
                                    mb-[20px]
                                    pb-[20px]
                                    border-b
                                    border-solid
                                    border-[#cccccc]
                                ">Your driver is on its way.</div> : ""
                            }
                            <div className="
                                block
                                w-full
                                mb-[20px]
                                pb-[20px]
                                border-b
                                border-solid
                                border-[#cccccc]
                            ">
                                <div className="
                                    block
                                    w-full
                                    relative
                                    z-[10]
                                    overflow-hidden
                                    pl-[20px]
                                ">
                                    <div className="
                                        block
                                        w-[10px]
                                        h-full
                                        absolute
                                        top-0
                                        mt-[5px]
                                        left-0
                                    ">
                                        <div className="
                                            block
                                            w-[10px]
                                            h-[10px]
                                            bg-[#111111]
                                            rounded-[50%]
                                        "></div>
                                        <div className="
                                            block
                                            w-[2px]
                                            h-full
                                            absolute
                                            top-[14px]
                                            left-[4px]
                                            bg-[#888888]
                                        "></div>
                                    </div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#888888]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        mb-[5px]
                                    ">Pickup Location</div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                    ">{details.data.pickupLocation.formatted_address}</div>
                                </div>
                                <div className="
                                    block
                                    w-[2px]
                                    h-[30px]
                                    ml-[4px]
                                    bg-[#888888]
                                "></div>
                                <div className="
                                    block
                                    w-full
                                    relative
                                    z-[10]
                                    overflow-hidden
                                    pl-[20px]
                                ">
                                    <div className="
                                        block
                                        w-[10px]
                                        h-full
                                        absolute
                                        top-0
                                        mt-[5px]
                                        left-0
                                    ">
                                        <div className="
                                            block
                                            w-[10px]
                                            h-[10px]
                                            bg-[#111111]
                                        "></div>
                                        <div className="
                                            block
                                            w-[2px]
                                            h-full
                                            absolute
                                            -top-1/2
                                            -translate-y-1/2
                                            -mt-[4px]
                                            left-[4px]
                                            bg-[#888888]
                                        "></div>
                                    </div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#888888]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        mb-[5px]
                                    ">Destination</div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                    ">{details.data.destination.formatted_address}</div>
                                </div>
                            </div>
                            <div className="
                                block
                                w-full
                                mb-[20px]
                                pb-[20px]
                                border-b
                                border-solid
                                border-[#cccccc]
                            ">
                                <div className="
                                    block
                                    w-full
                                    min-h-[20px]
                                    relative
                                    pl-[100px]
                                    pr-[5px]
                                    mb-[10px]
                                ">
                                    <div className="
                                        block
                                        w-[100px]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        absolute
                                        top-0
                                        left-0
                                    ">Distance<span className="absolute top-0 right-0">:</span></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        pl-[15px]
                                    ">{details.data.distance.text}</div>
                                </div>
                                <div className="
                                    block
                                    w-full
                                    min-h-[20px]
                                    relative
                                    pl-[100px]
                                    pr-[5px]
                                ">
                                    <div className="
                                        block
                                        w-[100px]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        absolute
                                        top-0
                                        left-0
                                    ">Price<span className="absolute top-0 right-0">:</span></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        pl-[15px]
                                    ">₹{details.data.price}</div>
                                </div>
                            </div>
                            <div className="
                                block
                                w-full
                                mb-[20px]
                                pb-[20px]
                                border-b
                                border-solid
                                border-[#cccccc]
                            ">
                                <div className="
                                    block
                                    w-full
                                    font-defaultBold
                                    text-left
                                    text-[#111111]
                                    text-[18px]
                                    2xs:text-[20px]
                                    leading-[25px]
                                    mb-[20px]
                                ">Driver details</div>
                                <div className="
                                    block
                                    w-[100px]
                                    h-[100px]
                                    bg-no-repeat
                                    bg-center
                                    bg-cover
                                    mb-[20px]
                                    rounded-[50%]
                                " style={{backgroundImage: `url(${details.data.driver.photo})`}}></div>
                                <div className="
                                    block
                                    w-full
                                    min-h-[20px]
                                    relative
                                    pl-[100px]
                                    pr-[5px]
                                    mb-[10px]
                                ">
                                    <div className="
                                        block
                                        w-[100px]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        absolute
                                        top-0
                                        left-0
                                    ">Name<span className="absolute top-0 right-0">:</span></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        pl-[15px]
                                    ">{details.data.driver.name}</div>
                                </div>
                                <div className="
                                    block
                                    w-full
                                    min-h-[20px]
                                    relative
                                    pl-[100px]
                                    pr-[5px]
                                    mb-[10px]
                                ">
                                    <div className="
                                        block
                                        w-[100px]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        absolute
                                        top-0
                                        left-0
                                    ">Gender<span className="absolute top-0 right-0">:</span></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        pl-[15px]
                                    ">{details.data.driver.gender}</div>
                                </div>
                                <div className="
                                    block
                                    w-full
                                    min-h-[20px]
                                    relative
                                    pl-[100px]
                                    pr-[5px]
                                    mb-[10px]
                                ">
                                    <div className="
                                        block
                                        w-[100px]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        absolute
                                        top-0
                                        left-0
                                    ">Age<span className="absolute top-0 right-0">:</span></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        pl-[15px]
                                    ">{details.data.driver.age}</div>
                                </div>
                                <div className="
                                    block
                                    w-full
                                    min-h-[20px]
                                    relative
                                    pl-[100px]
                                    pr-[5px]
                                    mb-[10px]
                                ">
                                    <div className="
                                        block
                                        w-[100px]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        absolute
                                        top-0
                                        left-0
                                    ">Phone<span className="absolute top-0 right-0">:</span></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        pl-[15px]
                                    ">
                                        {details.data.driver.phoneNumber.withoutCountryCode}
                                        <a href={`tel:${details.data.driver.phoneNumber.withCountryCode}`} target="_blank" rel="noopener noreferrer" className="
                                            inline-block
                                            align-baseline
                                            ml-[10px]
                                            text-[80%]
                                            text-[#ffffff]
                                            bg-[#8a2be2]
                                            px-[10px]
                                            active:opacity-[.8]
                                        ">Call</a>
                                    </div>
                                </div>
                                <div className="
                                    block
                                    w-full
                                    min-h-[20px]
                                    relative
                                    pl-[100px]
                                    pr-[5px]
                                ">
                                    <div className="
                                        block
                                        w-[100px]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        absolute
                                        top-0
                                        left-0
                                    ">Vehicle<span className="absolute top-0 right-0">:</span></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        pl-[15px]
                                        mb-[5px]
                                    ">{details.data.driver.vehicle.name}</div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        pl-[15px]
                                        mb-[5px]
                                    ">{details.data.driver.vehicle.numberPlate}</div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        pl-[15px]
                                    ">Upto {details.data.driver.vehicle.maxPassenger} passenger</div>
                                </div>
                            </div>
                            <div className="
                                block
                                w-full
                            ">
                                <div className="
                                    block
                                    w-full
                                    font-defaultBold
                                    text-left
                                    text-[#111111]
                                    text-[18px]
                                    2xs:text-[20px]
                                    leading-[25px]
                                    mb-[20px]
                                ">Your details</div>
                                <div className="
                                    block
                                    w-[100px]
                                    h-[100px]
                                    bg-no-repeat
                                    bg-center
                                    bg-cover
                                    mb-[20px]
                                    rounded-[50%]
                                " style={{backgroundImage: `url(${details.data.photo || ProfilePhoto})`}}></div>
                                <div className="
                                    block
                                    w-full
                                    min-h-[20px]
                                    relative
                                    pl-[100px]
                                    pr-[5px]
                                    mb-[10px]
                                ">
                                    <div className="
                                        block
                                        w-[100px]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        absolute
                                        top-0
                                        left-0
                                    ">Name<span className="absolute top-0 right-0">:</span></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        pl-[15px]
                                    ">{details.data.name}</div>
                                </div>
                                <div className="
                                    block
                                    w-full
                                    min-h-[20px]
                                    relative
                                    pl-[100px]
                                    pr-[5px]
                                ">
                                    <div className="
                                        block
                                        w-[100px]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        absolute
                                        top-0
                                        left-0
                                    ">Phone<span className="absolute top-0 right-0">:</span></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultRegular
                                        text-left
                                        text-[#111111]
                                        text-[12px]
                                        2xs:text-[14px]
                                        leading-[20px]
                                        pl-[15px]
                                    ">{details.data.phoneNumber.withoutCountryCode}</div>
                                </div>
                            </div>
                        </div> : ""
                    }
                </div>
            </div>
        </div>
    )

}

export default Ride