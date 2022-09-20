import { useState, useEffect, useRef, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import useStore from "../store"
import { useUserStore } from "../store"
import axios from "axios"
import { Haptics } from "@capacitor/haptics"
import TextareaAutosize from "react-textarea-autosize"
import Header from "../components/Header"
import ProfilePhotoPrompt from "../components/ProfilePhotoPrompt"
import Check from "../components/icons/Check"
import resizeImage from "../lib/resizeImage"
import XIcon from "../components/icons/XIcon"
import SadFace from "../components/icons/SadFace"
import CameraIcon from "../components/icons/Camera"
import SpinnerLight from "../images/spinner-light.gif"
import Spinner from "../images/spinner.gif"
import ProfilePhoto from "../images/profile-photo.jpg"

const EditProfile = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const signedIn = useUserStore(state => state.signedIn)
    const authToken = useUserStore(state => state.authToken)
    const updateUserData = useUserStore(state => state.update)
    const locationQueries = useStore(state => state.locationQueries)
    const setImageToCrop = useStore(state => state.setImageToCrop)
    const profileForm = useStore(state => state.profileForm)
    const setProfileForm = useStore(state => state.setProfileForm)
    const resetProfileForm = useStore(state => state.resetProfileForm)

    const [ expandProfilePhoto, setExpandProfilePhoto ] = useState(false)
    const [ init, setInit ] = useState(false)
    const imageInputRef = useRef()
    const scrollableArea = useRef()

    const getUserData = useCallback(async () => {
        if (!authToken){
            return
        }

        setInit(true)
        
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/get-user-data`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            if (res.status === 200 && res.data){
                setProfileForm({
                    ...profileForm,
                    error: null,
                    profilePhoto: res.data.profilePhoto ? res.data.profilePhoto.url : "",
                    name: res.data.name || "",
                    prepopulated: true
                })
                updateUserData({
                    ...res.data,
                    profilePhoto: res.data.profilePhoto ? res.data.profilePhoto.url : "",
                    profilePhotoThumbnail: res.data.profilePhoto ? res.data.profilePhoto.thumbnail_url : ""
                })
            }
            else {
                setProfileForm({
                    ...profileForm,
                    error: {
                        code: "cannot-get-user-data",
                        message: "Something went wrong, please try again."
                    },
                    prepopulated: false
                })
            }
        }
        catch (err){
            setProfileForm({
                ...profileForm,
                error: {
                    code: "cannot-get-user-data",
                    message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
                },
                prepopulated: false
            })
        }
    }, [authToken, profileForm, setProfileForm, updateUserData])

    const retryGettingUserData = () => {
        setProfileForm({
            ...profileForm,
            prepopulated: false,
            error: null
        })
        getUserData()
    }
    
    const onProfilePhotoClick = () => {
        if (!locationQueries.includes("expand-profile-photo")){
            navigate(`${location.pathname}?${locationQueries.length ? `${locationQueries.join("&")}&expand-profile-photo` : "expand-profile-photo"}`)
        }
    }
    
    const onImageSelected = async e => {
        if (!e.target.files[0] || profileForm.photoLoading){
            return
        }

        const aspect = 1/1
        setImageToCrop({
            image: "loading",
            aspect
        })
        navigate(`${location.pathname}?${locationQueries.join("&")}&image-cropper`)
        
        try {
            const resizedImage = await resizeImage(e.target.files[0], 2000, 2000)
            setImageToCrop({
                image: resizedImage,
                aspect
            })
        }
        catch {
            window.history.back()
        }
    }

    const onCameraIconClick = async () => {
        if (!locationQueries.includes("edit-profile-photo")){
            navigate(`${location.pathname}?${locationQueries.join("&")}edit-profile-photo`)
        }
    }
    
    const onChangeProfilePhotoBtnClick = () => {
        if (imageInputRef.current){
            imageInputRef.current.value = null
            imageInputRef.current.click()
            window.history.back()
        }
    }

    const onRemoveProfilePhotoBtnClick = () => {
        if (imageInputRef.current){
            setProfileForm({
                ...profileForm,
                profilePhoto: "delete"
            })
            window.history.back()
        }
    }

    const onNameInputChange = e => {
        const name = e.target.value.replace(/(\r\n|\n|\r)/gm, "")
        if (name.length <= 50){
            setProfileForm({...profileForm,name})
        }
    }
    
    const updateProfile = async () => {
        if (!authToken || !profileForm.prepopulated || profileForm.updating){
            return
        }

        setProfileForm({
            ...profileForm,
            updating: true,
            error: null
        })
        
        if (!profileForm.name){
            await Haptics.notification({type: "ERROR"})
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            return setProfileForm({
                ...profileForm,
                error: {
                    message: "Name is required"
                }
            })
        }

        if (profileForm.name.length < 4){
            await Haptics.notification({type: "ERROR"})
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            return setProfileForm({
                ...profileForm,
                error: {
                    message: "Name too short, it should be at least 4 characters."
                }
            })
        }
        if (profileForm.name.length > 50){
            await Haptics.notification({type: "ERROR"})
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            return setProfileForm({
                ...profileForm,
                error: {
                    message: "Name too long, it should not be more than 50 characters."
                }
            })
        }

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/v1/edit-profile`, {
                profilePhoto: profileForm.profilePhoto,
                name: profileForm.name
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            if (res.status === 200 && res.data){
                updateUserData({
                    name: res.data.name || "",
                    profilePhoto: res.data.profilePhoto ? res.data.profilePhoto.url : "",
                    profilePhotoThumbnail: res.data.profilePhoto ? res.data.profilePhoto.thumbnail_url : ""
                })
                setProfileForm({
                    ...profileForm,
                    profilePhoto: res.data.profilePhoto ? res.data.profilePhoto.url : "",
                    updating: false,
                    error: null
                })
                if (window.location.pathname === "/edit-profile"){
                    window.history.back()
                }
            }
            else {
                await Haptics.notification({type: "ERROR"})
                if (scrollableArea.current){
                    scrollableArea.current.scrollTo(0,0)
                }
                setProfileForm({
                    ...profileForm,
                    updating: false,
                    error: {
                        message: "Something went wrong, please try again."
                    }
                })
            }
        }
        catch (err){
            await Haptics.notification({type: "ERROR"})
            if (scrollableArea.current){
                scrollableArea.current.scrollTo(0,0)
            }
            setProfileForm({
                ...profileForm,
                updating: false,
                error: {
                    message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
                }
            })
        }
    }
    
    useEffect(() => {
        if (!init){
            if (signedIn === "no"){
                navigate("/", {replace: true})
            }
            else {
                // get up to date user data and prepopulate fields
                getUserData()
            }
        }
    }, [signedIn, getUserData, init, navigate])

    useEffect(() => {
        if (locationQueries.includes("expand-profile-photo")){
            setExpandProfilePhoto(true)
        }
        else {
            setExpandProfilePhoto(false)
        }
    }, [locationQueries])

    useEffect(() => {
        // reset profile form when this component is unmounted
        return () => {
            resetProfileForm()
        }
    }, [resetProfileForm])

    const SetProfileBtn = () => {

        return (
            <button type="button" className={`
                inline-block
                align-middle
                w-[50px]
                h-[50px]
                float-right
                p-[12px]
                ${!profileForm.updating ? "active:bg-[#eeeeee]" : ""}
                translate-x-[12px]
                active:bg-[#eeeeee]
            `} onClick={updateProfile}>
                {
                    profileForm.updating ?
                    <img src={Spinner} alt="loading" className="
                        block
                        w-full
                    "/> :
                    <Check color="#8a2be2"/>
                }
            </button>
        )
        
    }
    
    return (
        <div className={`
            page
            pt-[50px]
        `}>
            <ProfilePhotoPrompt
                onChangeProfilePhotoBtnClick={onChangeProfilePhotoBtnClick}
                onRemoveProfilePhotoBtnClick={onRemoveProfilePhotoBtnClick}
            />
            {
                signedIn === "yes" ?
                <div className={`
                    block
                    w-full
                    h-full
                    overflow-hidden
                `}>
                    <Header heading="Edit Profile" RightCTA={profileForm.prepopulated ? SetProfileBtn : null}/>
                    {
                        (profileForm.error && profileForm.error.code === "cannot-get-user-data") ?
                        <div className="
                            block
                            w-full
                            h-full
                            overflow-auto
                            py-[30px]
                        ">
                            <div className="
                                block
                                w-[90%]
                                max-w-[300px]
                                mx-auto
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
                                ">{profileForm.error.message}</div>
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
                                " onClick={retryGettingUserData}>Retry</button>
                            </div>
                        </div> : ""
                    }
                    {
                        profileForm.prepopulated ?
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
                                    profileForm.error ?
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
                                    ">{profileForm.error.message}</div> : ""
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
                                        ${!expandProfilePhoto ? "w-[150px] rounded-[50%]" : "w-full xs:w-[400px]"}
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
                                    `} style={{backgroundImage: `url(${(profileForm.profilePhoto && profileForm.profilePhoto !== "delete") ? profileForm.profilePhoto : ProfilePhoto})`}} onClick={onProfilePhotoClick}>
                                        {
                                            profileForm.photoLoading ?
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
                                        block
                                        w-full
                                        h-0
                                        overflow-visible
                                        text-center
                                        relative
                                    ">
                                        <div className={`
                                            inline-block
                                            align-middle
                                            w-[50px]
                                            h-[50px]
                                            p-[12px]
                                            rounded-[50%]
                                            relative
                                            -top-[50px]
                                            left-[50px]
                                            bg-[#888888]
                                            active:bg-[#aaaaaa]
                                            ${locationQueries.includes("expand-profile-photo") ? "scale-0" : "scale-1"}
                                            duration-[.2s]
                                            ease-in-out
                                        `} onClick={onCameraIconClick}>
                                            <CameraIcon color="#ffffff"/>
                                        </div>
                                    </div>
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
                                        value={profileForm.name}
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
                                    ">{50-profileForm.name.length}</div>
                                </div>
                            </div>
                        </div> :
                        !profileForm.error ?
                        <div className="
                            block
                            w-full
                            h-full
                            overflow-auto
                            py-[30px]
                        ">
                            <img src={Spinner} alt="" className="
                                block
                                w-[40px]
                                mb-[10px]
                                mx-auto
                            "/>
                        </div> : ""
                    }
                </div> : ""
            }
        </div>
    )

}

export default EditProfile