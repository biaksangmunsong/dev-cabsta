import { useState, useEffect, useCallback } from "react"
import Cropper from "react-easy-crop"
import getCroppedImg from "../lib/cropImage"
import useStore from "../store"
import resizeImage from "../lib/resizeImage"
import SpinnerLight from "../images/spinner-light.gif"

const ImageCropper = () => {

    const networkStatus = useStore(state => state.networkStatus)
    const locationQueries = useStore(state => state.locationQueries)
    const imageToCrop = useStore(state => state.imageToCrop)
    const setImageToCrop = useStore(state => state.setImageToCrop)
    const profileForm = useStore(state => state.profileForm)
    const setProfileForm = useStore(state => state.setProfileForm)
    const [ crop, setCrop ] = useState({ x: 0, y: 0 })
    const [ zoom, setZoom ] = useState(1)
    const [ croppedAreaPixels, setCroppedAreaPixels ] = useState(null)
    
    const cancelCrop = () => {
        window.history.back()
    }
    
    const cropImage = async () => {
        if (imageToCrop && imageToCrop.image !== "loading" && croppedAreaPixels){
            setProfileForm({
                ...profileForm,
                photoLoading: true
            })
            setImageToCrop(null)
            const canvas = await getCroppedImg(imageToCrop.image, croppedAreaPixels)
            canvas.toBlob(async blob => {
                try {
                    const resizedImage = await resizeImage(blob, 600, 600)
                    setProfileForm({
                        ...profileForm,
                        profilePhoto: resizedImage,
                        photoLoading: false
                    })
                }
                catch {
                    setProfileForm({
                        ...profileForm,
                        photoLoading: false
                    })
                }
            })
        }
    }
    
    const onCropComplete = useCallback(async (ca, cap) => {
        setCroppedAreaPixels(cap)
    }, [])

    useEffect(() => {
        // if image cropper is active but there is no image to crop, go back
        if (locationQueries.includes("image-cropper") && !imageToCrop){
            window.history.back()
        }
    }, [locationQueries, imageToCrop])
    
    return (
        <div className={`
            block
            w-full
            h-full
            overflow-hidden
            bg-[#000000]
            absolute
            z-[95]
            top-0
            left-0
            ${(networkStatus < 1 && networkStatus !== -1) ? "pt-[25px]" : ""}
        `}>
            <div className="
                block
                w-full
                h-full
                overflow-hidden
                relative
                pb-[50px]
            ">
                <img src={SpinnerLight} alt="" className="
                    block
                    w-[50px]
                    absolute
                    z-[10]
                    top-1/2
                    -translate-y-[100%]
                    left-1/2
                    -translate-x-1/2
                "/>
                <div className="
                    block
                    w-full
                    h-full
                    relative
                    z-[15]
                ">
                    {
                        (imageToCrop && imageToCrop.image !== "loading") ?
                        <Cropper
                            image={imageToCrop.image}
                            crop={crop}
                            zoom={zoom}
                            aspect={imageToCrop.aspect}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        /> : ""
                    }
                </div>
                <div className="
                    block
                    w-full
                    h-50px
                    bg-light-f
                    absolute
                    z-[20]
                    bottom-0
                    left-0
                    text-center
                    bg-[#ffffff]
                ">
                    <div className="
                        block
                        w-full
                        max-w-1000px
                        mx-auto
                    ">
                        <button type="button" onClick={cancelCrop} className="
                            inline-block
                            align-middle
                            w-1/2
                            h-[50px]
                            font-defaultRegular
                            text-[14px]
                            text-center
                            text-[#111111]
                            bg-light-f
                            active:bg-[#dddddd]
                        ">Cancel</button>
                        <button type="button" onClick={cropImage} className="
                            inline-block
                            align-middle
                            w-1/2
                            h-[50px]
                            font-defaultRegular
                            text-[14px]
                            text-center
                            text-[#111111]
                            bg-light-f
                            active:bg-[#dddddd]
                            border-l
                            border-solid
                            border-[#dddddd]
                        ">Done</button>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default ImageCropper