import useStore from "../store"
import EditIcon from "./icons/Edit"
import DeleteIcon from "./icons/Delete"
import XIcon from "./icons/XIcon"

const ProfilePhotoPrompt = ({
    onChangeProfilePhotoBtnClick,
    onRemoveProfilePhotoBtnClick
}) => {

    const locationQueries = useStore(state => state.locationQueries)

    return (
        <div className={`
            block
            w-full
            h-full
            absolute
            z-[95]
            ${locationQueries.includes("edit-profile-photo") ? "top-0" : "top-[120vh]"}
            left-0
            overflow-hidden
        `}>
            <div className="
                block
                w-full
                h-full
                absolute
                z-[1]
                top-0
                left-0
                bg-[rgba(0,0,0,.6)]
            " onClick={() => window.history.back()}></div>
            <div className={`
                block
                w-full
                xs:max-w-[500px]
                absolute
                z-[10]
                bottom-0
                ${locationQueries.includes("edit-profile-photo") ? "translate-y-0 duration-[.2s]" : "translate-y-[120%] duration-[.2s]"}
                xs:bottom-[50%]
                xs:translate-y-1/2
                left-[50%]
                -translate-x-1/2
                bg-[#ffffff]
                xs:rounded-[10px]
                overflow-hidden
                border-t
                xs:border-r
                xs:border-b
                xs:border-l
                border-solid
                border-[#dddddd]
                ${
                    locationQueries.includes("edit-profile-photo") ?
                    "xs:scale-1 xs:duration-[.2s]" :
                    "xs:scale-0 xs:duration-[.2s]"
                }
                ease-in-out
            `}>
                <h2 className="
                    block
                    w-full
                    font-defaultBold
                    text-left
                    text-[#111111]
                    text-[14px]
                    2xs:text-[16px]
                    leading-[50px]
                    overflow-hidden
                    text-ellipsis
                    px-[3%]
                    relative
                    z-[1]
                    border-b
                    border-solid
                    border-[#dddddd]
                ">Profile Photo</h2>
                <button type="button" className="
                    block
                    w-[50px]
                    h-[50px]
                    absolute
                    z-[10]
                    top-0
                    right-[3%]
                    active:bg-[#eeeeee]
                    p-[16px]
                " onClick={() => window.history.back()}>
                    <XIcon color="#111111"/>
                </button>
                <div className="
                    block
                    w-[94%]
                    mx-auto
                    py-[15px]
                    text-left
                ">
                    <button type="button" className="
                        inline-block
                        align-middle
                        h-[50px]
                        bg-[#eeeeee]
                        active:bg-[#dddddd]
                        px-[15px]
                        rounded-[6px]
                        mr-[10px]
                    " onClick={onChangeProfilePhotoBtnClick}>
                        <span className="inline-block align-middle w-[20px]">
                            <EditIcon color="#111111"/>
                        </span>
                        <span className="
                            inline-block
                            align-middle
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            ml-[10px]
                        ">Change</span>
                    </button>
                    <button type="button" className="
                        inline-block
                        align-middle
                        h-[50px]
                        bg-[#eeeeee]
                        active:bg-[#dddddd]
                        px-[15px]
                        rounded-[6px]
                    " onClick={onRemoveProfilePhotoBtnClick}>
                        <span className="inline-block align-middle w-[20px]">
                            <DeleteIcon color="#111111"/>
                        </span>
                        <span className="
                            inline-block
                            align-middle
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            ml-[10px]
                        ">Remove</span>
                    </button>
                </div>
            </div>
        </div>
    )

}

export default ProfilePhotoPrompt