import { useEffect } from "react"
import useStore from "../store"
import { useLocation, Link } from "react-router-dom"
import ChevronRight from "./icons/ChevronRight"
import HistoryIcon from "./icons/History"
import StarIcon from "./icons/Star"
import RideEditor from "./RideEditor"

const SignedIn = () => {

    const location = useLocation()
    const expandMenu = useStore(state => state.expandMenu)

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
                ">Going somewhere?</h2>
                <h1 className="
                    block
                    w-full
                    font-defaultBold
                    text-left
                    text-[26px]
                    2xs:text-[30px]
                    xs:text-[35px]
                    leading-[36px]
                    2xs:leading-[40px]
                    xs:leading-[45px]
                    text-[#111111]
                ">We'll get you there,<br/>Let's go.</h1>
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
        </div>
    )

}

export default SignedIn