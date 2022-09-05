import { useEffect } from "react"
import useStore from "../store"
import { useInputStore } from "../store"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Storage } from "@capacitor/storage"
import ProfilePhoto from "../images/profile-photo.jpg"

const Menu = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const viewport = useStore(state => state.viewport)
    const locationQueries = useStore(state => state.locationQueries)
    const expand = useStore(state => state.expandMenu)
    const setExpand = useStore(state => state.setExpandMenu)
    const userData = useStore(state => state.userData)
    const setUserData = useStore(state => state.setUserData)
    const clearInputStore = useInputStore(state => state.clearInputStore)
    
    const items = [
        {
            pathname: "/about",
            text: "About Us"
        },
        {
            pathname: "/contact",
            text: "Contact Us"
        },
        {
            pathname: "/become-a-driver",
            text: "Become a Driver"
        },
        {
            pathname: "/tos",
            text: "Terms of Service"
        },
        {
            pathname: "/privacy-policy",
            text: "Privacy Policy"
        }
    ]
    
    const onBtnClick = e => {
        if (!locationQueries.includes("expand-menu")){
            navigate(`${location.pathname}?${locationQueries.length ? `${locationQueries.join("&")}&expand-menu` : "expand-menu"}`)
        }
        else {
            window.history.back()
        }
    }

    const signOut = async () => {
        await Storage.remove({key: "user-data"})
        setUserData({
            ...userData,
            init: true,
            status: "not-signed-in",
            data: null
        })
        clearInputStore()
        await Storage.remove({key: "history"})
        if (locationQueries.includes("expand-menu")){
            window.history.back()
        }
    }
    
    useEffect(() => {
        if (locationQueries.includes("expand-menu")){
            setExpand(true)
        }
        else {
            setExpand(false)
        }
    }, [locationQueries, setExpand])
    
    return (
        <div className={`
            block
            w-full
            ${expand ? "bg-[#ffffff]" : ""}
            overflow-hidden
            ${location.pathname === "/" ? "pt-[61px]" : "pt-0"}
            relative
            z-[20]
            duration-[.2s]
            ease-in-out
        `} style={{height: expand ? `${viewport.height}px` : location.pathname === "/" ? "60px" : "0"}}>
            <div className="
                block
                w-full
                h-[60px]
                absolute
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
                    <button type="button" className={`
                        inline-block
                        w-[40px]
                        h-[40px]
                        active:bg-[#eeeeee]
                        absolute
                        z-[20]
                        top-[10px]
                        right-0
                    `} onClick={onBtnClick}>
                        <div className={`block w-[20px] h-[2px] bg-[#555555] mx-auto my-[5px] origin-left ${expand ? "rotate-45" : ""} duration-[.4s] ease-in-out`}></div>
                        <div className={`block w-[20px] h-[2px] bg-[#555555] mx-auto my-[5px] ${expand ? "opacity-0" : ""} duration-[.4s] ease-in-out`}></div>
                        <div className={`block w-[20px] h-[2px] bg-[#555555] mx-auto my-[5px] origin-left ${expand ? "-rotate-45" : ""} duration-[.4s] ease-in-out`}></div>
                    </button>
                </div>
            </div>
            <div className="
                block
                w-full
                h-full
                overflow-auto
                pb-[30px]
            ">
                <div className="
                    block
                    w-[94%]
                    max-w-[1000px]
                    mx-auto
                ">
                    {
                        userData.status === "signed-in" ?
                        <div className={`
                            block
                            w-full
                            border-b
                            border-solid
                            border-[#dddddd]
                            pb-[30px]
                            duration-[.2s]
                            ease-in-out
                        `}>
                            <div className={`
                                inline-block
                                align-middle
                                w-[100px]
                                h-[100px]
                                overflow-hidden
                                bg-[#eeeeee]
                                bg-no-repeat
                                bg-center
                                bg-cover
                                rounded-[50%]
                                mb-[15px]
                            `} style={{backgroundImage: `url(${userData.data.profilePhoto ? userData.data.profilePhoto.thumbnail_url : ProfilePhoto})`}}></div>
                            <div className="
                                block
                                w-full
                                font-defaultBold
                                text-left
                                text-[18px]
                                2xs:text-[20px]
                                leading-[23px]
                                2xs:leading-[25px]
                                text-[#111111]
                            ">{userData.data.name || "Anonymous"}</div>
                            <div className="
                                block
                                w-full
                                font-defaultRegular
                                text-left
                                text-[12px]
                                2xs:text-[14px]
                                leading-[18px]
                                2xs:leading-[20px]
                                text-[#999999]
                            ">{userData.data.phoneNumber.withoutCountryCode}</div>
                            <Link to="/edit-profile" className="
                                block
                                max-w-[100%]
                                xs:max-w-[50%]
                                font-defaultBold
                                text-center
                                text-[12px]
                                2xs:text-[14px]
                                leading-[40px]
                                text-[#8a2be2]
                                rounded-[6px]
                                border
                                border-solid
                                border-[#8a2be2]
                                active:bg-[#eeeeee]
                                mt-[15px]
                            ">Edit Profile</Link>
                        </div> : ""
                    }
                    {
                        expand ?
                        <div className="
                            block
                            w-full
                            h-full
                            py-[10px]
                            overflow-auto
                            scrollbar-hidden
                        ">
                            {
                                items.map((item, i) => {
                                    return (
                                        <Link to={item.pathname} key={i} className="
                                            block
                                            w-full
                                            text-left
                                            font-defaultBold
                                            text-[16px]
                                            2xs:text-[18px]
                                            leading-[45px]
                                            2xs:leading-[50px]
                                            whitespace-nowrap
                                            overflow-hidden
                                            text-ellipsis
                                            text-[#111111]
                                            active:bg-[#eeeeee]
                                        ">{item.text}</Link>
                                    )
                                })
                            }
                            {
                                userData.status === "signed-in" ?
                                <div className={`
                                    block
                                    w-full
                                    text-left
                                    font-defaultBold
                                    text-[16px]
                                    2xs:text-[18px]
                                    leading-[45px]
                                    2xs:leading-[50px]
                                    whitespace-nowrap
                                    overflow-hidden
                                    text-ellipsis
                                    text-[#bb0000]
                                    active:bg-[#eeeeee]
                                `} onClick={signOut}>Sign Out</div> : ""
                            }
                        </div> : ""
                    }
                </div>
            </div>
        </div>
    )

}

export default Menu