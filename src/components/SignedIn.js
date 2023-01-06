import { useEffect } from "react"
import useStore from "../store"
import { useLocation, Link } from "react-router-dom"
import ChevronRight from "./icons/ChevronRight"
import HistoryIcon from "./icons/History"
import StarIcon from "./icons/Star"
import Car from "./icons/Car"
import Scooter from "./icons/Scooter"
import RideEditor from "./RideEditor"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

const SignedIn = () => {

    const location = useLocation()
    const expandMenu = useStore(state => state.expandMenu)
    const uncompletedRides = useStore(state => state.uncompletedRides)

    useEffect(() => {
        if (location.pathname === "/"){
            window.document.activeElement.blur()
        }
    }, [location.pathname])
    
    return (
        <div className={`
            block
            w-full
            h-full
            relative
            z-[10]
            ${expandMenu ? "scale-0" : `${location.pathname !== "/" ? "pt-0" : "pt-[10px]"} pb-[30px]`}
            duration-[.2s]
            ease-in-out
            text-left
        `} style={{
            transformOrigin: "bottom center"
        }}>
            <div className={`
                block
                w-[94%]
                max-w-[1000px]
                mx-auto
                ${location.pathname !== "/" ? "max-h-0 mb-[0]" : "max-h-[300px] mb-[20px]"}
                overflow-hidden
                duration-[.2s]
            `}>
                <h2 className="
                    block
                    w-full
                    font-defaultRegular
                    text-left
                    text-[14px]
                    2xs:text-[16px]
                    xs:text-[18px]
                    leading-[23px]
                    2xs:leading-[25px]
                    xs:leading-[26px]
                    text-[#222222]
                    mb-[5px]
                ">Going somewhere?</h2>
                <h1 className="
                    block
                    w-full
                    font-defaultRegular
                    text-left
                    text-[26px]
                    2xs:text-[30px]
                    xs:text-[35px]
                    leading-[36px]
                    2xs:leading-[40px]
                    xs:leading-[45px]
                    text-[#111111]
                    mb-[20px]
                ">We'll find a ride for <br/>you, <span className="font-defaultBold text-[#8a2be2]">let's go.</span></h1>
            </div>
            <RideEditor/>
            <div className={`
                block
                w-[94%]
                max-w-[1000px]
                mx-auto
                ${location.pathname !== "/" ? "max-h-0 mb-[0]" : "max-h-[300px] mb-[20px]"}
                overflow-hidden
                duration-[.2s]
                mt-[30px]
            `}>
                <Link to="/history" className="
                    block
                    w-full
                    relative
                    pl-[45px]
                ">
                    <div className="
                        block
                        w-[30px]
                        h-[30px]
                        absolute
                        top-1/2
                        -translate-y-1/2
                        left-0
                        2xs:p-[2px]
                    ">
                        <HistoryIcon color="#111111"/>
                    </div>
                    <div className="
                        block
                        w-full
                        font-defaultBold
                        text-[16px]
                        2xs:text-[18px]
                        text-left
                        text-[#111111]
                        leading-[60px]
                        2xs:leading-[69px]
                        whitespace-nowrap
                        overflow-hidden
                        text-ellipsis
                        border-b
                        border-solid
                        border-[#cccccc]
                        pr-[40px]
                        active:bg-[#eeeeee]
                    ">Ride History</div>
                    <div className="
                        block
                        w-[40px]
                        h-[40px]
                        absolute
                        top-1/2
                        -translate-y-1/2
                        right-0
                        p-[11px]
                    ">
                        <ChevronRight color="#111111"/>
                    </div>
                </Link>
                <Link to="/saved-places" className="
                    block
                    w-full
                    relative
                    pl-[45px]
                ">
                    <div className="
                        block
                        w-[30px]
                        h-[30px]
                        absolute
                        top-1/2
                        -translate-y-1/2
                        left-0
                        p-[2px]
                        2xs:p-[3px]
                    ">
                        <StarIcon color="#111111"/>
                    </div>
                    <div className="
                        block
                        w-full
                        font-defaultBold
                        text-[16px]
                        2xs:text-[18px]
                        text-left
                        text-[#111111]
                        leading-[60px]
                        2xs:leading-[69px]
                        whitespace-nowrap
                        overflow-hidden
                        text-ellipsis
                        border-b
                        border-solid
                        border-[#cccccc]
                        pr-[40px]
                        active:bg-[#eeeeee]
                    ">Saved Places</div>
                    <div className="
                        block
                        w-[40px]
                        h-[40px]
                        absolute
                        top-1/2
                        -translate-y-1/2
                        right-0
                        p-[11px]
                    ">
                        <ChevronRight color="#111111"/>
                    </div>
                </Link>
            </div>
            <div className="
                block
                w-[94%]
                max-w-[1000px]
                mx-auto
            ">
                {
                    uncompletedRides.map(ride => {
                        return (
                            <Link to={`/history/${ride._id}`} key={ride._id} className="
                                block
                                w-full
                                py-[15px]
                                border
                                border-solid
                                border-[#dddddd]
                                pl-[60px]
                                pr-[40px]
                                relative
                                bg-[#ffffff]
                                shadow-xl
                                rounded-[10px]
                                overflow-hidden
                                active:bg-[#eeeeee]
                                mb-[6px]
                                last:mb-0
                            ">
                                <div className="
                                    block
                                    w-[40px]
                                    h-[40px]
                                    rounded-[50%]
                                    bg-no-repeat
                                    bg-center
                                    bg-cover
                                    overflow-visible
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    left-[10px]
                                " style={{
                                    backgroundImage: `url(${ride.driver.photo.thumbnail_url})`,
                                    backgroundColor: "#dddddd"
                                }}>
                                    <div className="
                                        block
                                        w-[15px]
                                        h-[15px]
                                        rounded-[50%]
                                        bg-[#ffffff]
                                        absolute
                                        bottom-0
                                        right-0
                                        p-[2px]
                                    ">
                                        <div className="
                                            block
                                            w-full
                                            h-full
                                            bg-[#cd5c5c]
                                            rounded-[50%]
                                        "></div>
                                    </div>
                                </div>
                                <div className="
                                    block
                                    w-full
                                    font-defaultBold
                                    text-left
                                    text-[#8a2be2]
                                    text-[14px]
                                    leading-[22px]
                                    overflow-hidden
                                    whitespace-nowrap
                                    text-ellipsis
                                ">{ride.driver.name}</div>
                                <div className="
                                    block
                                    w-full
                                    font-defaultRegular
                                    text-left
                                    text-[#888888]
                                    text-[12px]
                                    leading-[18px]
                                    overflow-hidden
                                    whitespace-nowrap
                                    text-ellipsis
                                ">Started {dayjs(ride.acceptedAt).fromNow()}</div>
                                {/* <div className="
                                    block
                                    w-full
                                    relative
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
                                                w-[8px]
                                                h-[8px]
                                                bg-[#111111]
                                                rounded-[50%]
                                            "></div>
                                            <div className="
                                                block
                                                w-[1px]
                                                h-full
                                                absolute
                                                top-[10px]
                                                left-[3px]
                                                bg-[#888888]
                                            "></div>
                                        </div>
                                        <div className="
                                            block
                                            w-full
                                            font-defaultRegular
                                            text-left
                                            text-[#8a2be2]
                                            text-[12px]
                                            2xs:text-[14px]
                                            leading-[20px]
                                            overflow-hidden
                                            whitespace-nowrap
                                            text-ellipsis
                                        ">{ride.pickupLocation.address}</div>
                                    </div>
                                    <div className="
                                        block
                                        w-[1px]
                                        h-[10px]
                                        ml-[3px]
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
                                                w-[8px]
                                                h-[8px]
                                                bg-[#111111]
                                            "></div>
                                            <div className="
                                                block
                                                w-[1px]
                                                h-full
                                                absolute
                                                -top-1/2
                                                -translate-y-1/2
                                                -mt-[4px]
                                                left-[3px]
                                                bg-[#888888]
                                            "></div>
                                        </div>
                                        <div className="
                                            block
                                            w-full
                                            font-defaultRegular
                                            text-left
                                            text-[#8a2be2]
                                            text-[12px]
                                            2xs:text-[14px]
                                            leading-[20px]
                                            overflow-hidden
                                            whitespace-nowrap
                                            text-ellipsis
                                        ">{ride.destination.address}</div>
                                    </div>
                                </div> */}
                                <div className="
                                    block
                                    w-[20px]
                                    h-[20px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    right-[35px]
                                ">
                                    {
                                        ride.vehicleType === "two_wheeler" ?
                                        <Scooter color="#111111"/> :
                                        <Car color="#111111"/>
                                    }
                                </div>
                                <div className="
                                    block
                                    w-[18px]
                                    h-[18px]
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    right-[10px]
                                ">
                                    <ChevronRight color="#111111"/>
                                </div>
                            </Link>
                        )
                    })
                }
            </div>
        </div>
    )

}

export default SignedIn