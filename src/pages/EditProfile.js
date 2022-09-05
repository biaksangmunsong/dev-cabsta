import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import useStore from "../store"
import { Storage } from "@capacitor/storage"
import { Haptics } from "@capacitor/haptics"
import TextareaAutosize from "react-textarea-autosize"
import Header from "../components/Header"
import Check from "../components/icons/Check"
import resizeImage from "../lib/resizeImage"
import XIcon from "../components/icons/XIcon"
import SpinnerLight from "../images/spinner-light.gif"
import Spinner from "../images/spinner.gif"
import ProfilePhoto from "../images/profile-photo.jpg"

const EditProfile = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const userData = useStore(state => state.userData)
    const setUserData = useStore(state => state.setUserData)
    const locationQueries = useStore(state => state.locationQueries)
    const [ form, setForm ] = useState({
        init: false,
        profilePhoto: "",
        name: "",
        updating: false,
        prepopulated: false,
        error: null
    })
    const [ imageResizing, setImageResizing ] = useState(false)
    const [ expandProfilePhoto, setExpandProfilePhoto ] = useState(false)
    const imageInputRef = useRef()
    const scrollableArea = useRef()
    
    const onProfilePhotoClick = () => {
        if (!locationQueries.includes("expand-profile-photo")){
            navigate(`${location.pathname}?${locationQueries.length ? `${locationQueries.join("&")}&expand-profile-photo` : "expand-profile-photo"}`)
        }
    }
    
    const onImageSelected = async e => {
        if (!e.target.files[0] || imageResizing){
            return
        }

        setImageResizing(true)
        
        try {
            const resizedImage = await resizeImage(e.target.files[0], 1000, 1000)
            setForm({
                ...form,
                profilePhoto: resizedImage
            })
            setImageResizing(false)
        }
        catch (err){
            setImageResizing(false)
        }
    }

    const onChangePhotoBtnClick = async () => {
        if (imageInputRef.current){
            imageInputRef.current.value = null
            imageInputRef.current.click()
        }
    }

    const onNameInputChange = e => {
        const name = e.target.value.replace(/(\r\n|\n|\r)/gm, "")
        if (name.length <= 50){
            setForm({...form,name})
        }
    }
    
    const updateProfile = async () => {
        if (!form.prepopulated || form.updating){
            return
        }

        setForm({
            ...form,
            updating: true,
            error: null
        })
        
        if (!form.name){
            await Haptics.notification({type: "ERROR"})
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            return setForm({
                ...form,
                error: {
                    message: "Name is required"
                }
            })
        }

        if (form.name.length < 4){
            await Haptics.notification({type: "ERROR"})
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            return setForm({
                ...form,
                error: {
                    message: "Name too short, it should be at least 4 characters."
                }
            })
        }
        if (form.name.length > 50){
            await Haptics.notification({type: "ERROR"})
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            return setForm({
                ...form,
                error: {
                    message: "Name too long, it should not be more than 50 characters."
                }
            })
        }
        
        setTimeout(async () => {
            try {
                const newUserData = {
                    ...userData.data,
                    name: form.name,
                    profilePhoto: form.profilePhoto ? {
                        url: form.profilePhoto,
                        thumbnail_url: form.profilePhoto
                    } : null
                }
                
                await Storage.set({
                    key: "user-data",
                    value: JSON.stringify(newUserData)
                })
                setUserData({
                    ...userData,
                    data: newUserData
                })
                setForm({
                    ...form,
                    updating: false,
                    error: null
                })
                if (window.location.pathname === "/edit-profile"){
                    window.history.back()
                }
            }
            catch (err){
                await Haptics.notification({type: "ERROR"})
                if (scrollableArea.current){
                    scrollableArea.current.scrollTo(0,0)
                }
                setForm({
                    ...form,
                    updating: false,
                    error: null
                })
            }
        }, 1500)
    }
    
    useEffect(() => {
        if (userData.status === "not-signed-in"){
            navigate("/", {replace: true})
        }
        else {
            if (!form.init){
                // prepopulate form
                setForm({
                    init: true,
                    profilePhoto: userData.data.profilePhoto ? userData.data.profilePhoto.url : "",
                    name: userData.data.name,
                    prepopulated: true,
                    updating: false,
                    error: null
                })
            }
        }
    }, [userData, navigate, form])

    const SetProfileBtn = () => {

        return (
            <button type="button" className={`
                inline-block
                align-middle
                w-[50px]
                h-[50px]
                float-right
                p-[12px]
                ${!form.updating ? "active:bg-[#eeeeee]" : ""}
                translate-x-[12px]
            `} onClick={updateProfile}>
                {
                    form.updating ?
                    <img src={Spinner} alt="loading" className="
                        block
                        w-full
                    "/> :
                    <Check color="#8a2be2"/>
                }
            </button>
        )
        
    }
    
    useEffect(() => {
        if (locationQueries.includes("expand-profile-photo")){
            setExpandProfilePhoto(true)
        }
        else {
            setExpandProfilePhoto(false)
        }
    }, [locationQueries])
    
    return (
        <div className="page pt-[50px]">
            {
                userData.status === "signed-in" ?
                <>
                    <Header heading="Edit Profile" RightCTA={form.prepopulated ? SetProfileBtn : null}/>
                    <div className="
                        block
                        w-full
                        h-full
                        overflow-auto
                        py-[30px]
                    " ref={scrollableArea}>
                        <div className="
                            block
                            w-[94%]
                            max-w-[1000px]
                            mx-auto
                        ">
                            {
                                form.error ?
                                <div className="
                                    block
                                    w-full
                                    p-[15px]
                                    text-left
                                    text-[14px]
                                    2xs:text-[16px]
                                    leading-[20px]
                                    text-[#ffffff]
                                    font-defaultRegular
                                    bg-[#bb0000]
                                    rounded-[6px]
                                    mb-[30px]
                                ">{form.error.message}</div> : ""
                            }
                            <div className="
                                block
                                w-full
                                text-center
                                mb-[30px]
                            ">
                                <input type="file" className="hidden" onChange={onImageSelected} ref={imageInputRef}/>
                                <div className={`
                                    block
                                    ${!expandProfilePhoto ? "w-[100px] rounded-[50%]" : "w-full xs:w-[400px]"}
                                    square
                                    overflow-hidden
                                    mx-auto
                                    bg-[#eeeeee]
                                    bg-no-repeat
                                    bg-center
                                    bg-cover
                                    relative
                                    duration-[.2s]
                                    ease-in-out
                                    border-[2px]
                                    border-solid
                                    border-[#111111]
                                `} style={{backgroundImage: `url(${form.profilePhoto || ProfilePhoto})`}} onClick={onProfilePhotoClick}>
                                    {
                                        imageResizing ?
                                        <img src={SpinnerLight} alt="loading" className="
                                            block
                                            w-[24px]
                                            absolute
                                            z-[10]
                                            top-1/2
                                            -translate-y-1/2
                                            left-1/2
                                            -translate-x-1/2
                                        "/> : ""
                                    }
                                    {
                                        expandProfilePhoto ?
                                        <div className="
                                            block
                                            w-[24px]
                                            bg-[rgba(255,255,255,.8)]
                                            rounded-[50%]
                                            absolute
                                            z-[15]
                                            top-[15px]
                                            right-[15px]
                                            p-[6px]
                                        " onClick={() => window.history.back()}>
                                            <XIcon color="#111111"/>
                                        </div> : ""
                                    }
                                </div>
                                <div className="
                                    inline-block
                                    font-defaultRegular
                                    text-[#8a2be2]
                                    text-[13px]
                                    2xs:text-[14px]
                                    leading-[20px]
                                    mt-[10px]
                                    active:bg-[#eeeeee]
                                " onClick={onChangePhotoBtnClick}>Change Photo</div>
                            </div>
                            <div className="
                                block
                                w-full
                                relative
                                overflow-hidden
                            ">
                                <label htmlFor="name-input" className="
                                    block
                                    w-full
                                    font-defaultRegular
                                    text-left
                                    text-[#444444]
                                    text-[11px]
                                    2xs:text-[12px]
                                    leading-[20px]
                                ">Full Name</label>
                                <TextareaAutosize
                                    id="name-input"
                                    placeholder="Enter Your Name"
                                    name="name"
                                    value={form.name}
                                    onChange={onNameInputChange}
                                    minRows={1}
                                    maxRows={10}
                                    className="
                                        block
                                        w-full
                                        min-h-[45px]
                                        2xs:min-h-[50px]
                                        border-b
                                        border-solid
                                        border-[#cccccc]
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[16px]
                                        2xs:text-[18px]
                                        leading-[19px]
                                        2xs:leading-[20px]
                                        pr-[30px]
                                        py-[13px]
                                        2xs:py-[15px]
                                        resize-none
                                    "
                                />
                                <div className="
                                    block
                                    w-[30px]
                                    font-defaultRegular
                                    text-right
                                    text-[#444444]
                                    text-[11px]
                                    2xs:text-[12px]
                                    leading-[45px]
                                    2xs:leading-[50px]
                                    absolute
                                    top-[20px]
                                    right-0
                                ">{50-form.name.length}</div>
                            </div>
                        </div>
                    </div>
                </> : ""
            }
        </div>
    )

}

export default EditProfile