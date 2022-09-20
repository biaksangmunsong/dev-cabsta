import { useState, useEffect } from "react"
import useStore from "../store"
import { useUserStore } from "../store"
import { useNavigate, useLocation } from "react-router-dom"
import LongRightArrow from "../components/icons/LongRightArrow"
import NotSignedIn from "../components/NotSignedIn"
import SignedIn from "../components/SignedIn"
import Menu from "../components/Menu"

const Home = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const signedIn = useUserStore(state => state.signedIn)
    const [ requestBtnHidden, setRequestBtnHidden ] = useState(false)
    const expandMenu = useStore(state => state.expandMenu)

    const requestARide = () => {
        if (signedIn === "yes"){
            navigate("/set-location")
        }
    }
    
    useEffect(() => {
        if (expandMenu){
            setRequestBtnHidden(true)
        }
        else {
            setRequestBtnHidden(false)
        }
    }, [expandMenu])

    useEffect(() => {
        if (signedIn === "no"){
            if (location.pathname === "/set-location" || location.pathname === "/choose-vehicle" || location.pathname === "/checkout"){
                navigate("/", {replace: true})
            }
        }
    }, [location.pathname, signedIn, navigate])
    
    return (
        <div className={`
            page
            ${(expandMenu || location.pathname !== "/" || signedIn === "no") ? "" : "pb-[100px]"}
        `}>
            <div className={`
                block
                w-full
                h-full
                relative
                ${(expandMenu || location.pathname !== "/") ? "overflow-hidden" : "overflow-auto"}
                z-[10]
                scrollbar-hidden
            `}>
                {
                    signedIn === "no" ?
                    <div className="
                        block
                        w-full
                    ">
                        <Menu/>
                        <NotSignedIn setRequestBtnHidden={setRequestBtnHidden}/>
                    </div> :
                    signedIn === "yes" ?
                    <div className="
                        block
                        w-full
                        relative
                    ">
                        <Menu/>
                        <SignedIn/>
                    </div> : ""
                }
            </div>
            <div className={`
                block
                w-full
                h-[100px]
                absolute
                z-[20]
                ${(requestBtnHidden || expandMenu || location.pathname !== "/" || signedIn === "no") ? "-bottom-[110px]" : "bottom-0"}
                left-0
                bg-[#ffffff]
                py-[5px]
                border-t
                border-solid
                border-[#dddddd]
                duration-[.2s]
                ease-in-out
            `}>
                <button type="button" className="
                    block
                    w-[94%]
                    max-w-[1000px]
                    h-[55px]
                    2xs:h-[60px]
                    mx-auto
                    bg-[#111111]
                    font-defaultBold
                    text-left
                    text-[#ffffff]
                    text-[14px]
                    2xs:text-[16px]
                    px-[20px]
                    active:bg-[#333333]
                " onClick={requestARide}>
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

export default Home