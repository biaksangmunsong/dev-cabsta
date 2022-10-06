// import { Link } from "react-router-dom"
// import axios from "axios"
// import useStore from "../store"
// import { useUserStore } from "../store"
import StarIcon from "./icons/Star"

const SavedPlace = ({data}) => {
    
    // const savedPlaces = useStore(state => state.savedPlaces)
    // const setSavedPlaces = useStore(state => state.setSavedPlaces)
    // const authToken = useUserStore(state => state.authToken)
    // const resetUserData = useUserStore(state => state.reset)
    
    // const deletePlace = async () => {
    //     if (!authToken || data.deleted) return
        
    //     if (!window.confirm("Are you sure you want to delete this place?")) return

    //     // mark place as deleted
    //     const newList = []
    //     savedPlaces.data.forEach(place => {
    //         if (place._id === data._id){
    //             newList.push({
    //                 ...place,
    //                 deleted: true
    //             })
    //         }
    //         else {
    //             newList.push(place)
    //         }
    //     })
    //     setSavedPlaces({
    //         data: newList
    //     })
        
    //     try {
    //         await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/v1/delete-saved-place`, {
    //             data: {
    //                 placeId: data._id
    //             },
    //             headers: {
    //                 Authorization: `Bearer ${authToken}`
    //             }
    //         })
    //     }
    //     catch (err){
    //         if (err && err.response && err.response.data && err.response.data.code && err.response.data.code === "credential-expired"){
    //             // alert user that they have to reauthenticate and sign out
    //             alert(err.response.data.message)
    //             return resetUserData()
    //         }
    //     }
    // }
    
    return (
        <div className="
            block
            w-full
            max-w-[1000px]
            mx-auto
            overflow-hidden
            border-b
            last:border-none
            border-solid
            border-[#dddddd]
            py-[20px]
            active:bg-[#eeeeee]
        ">
            <div className={`
                block
                w-[94%]
                mx-auto
                relative
                pr-[30px]
                overflow-visible
            `}>
                <button type="button" className="
                    block
                    w-[30px]
                    h-[30px]
                    absolute
                    top-0
                    right-0
                    active:bg-[#dddddd]
                ">
                    <span className="
                        block
                        w-[3px]
                        h-[3px]
                        my-[3px]
                        mx-auto
                        bg-[#444444]
                        rounded-[50%]
                    "></span>
                    <span className="
                        block
                        w-[3px]
                        h-[3px]
                        my-[3px]
                        mx-auto
                        bg-[#444444]
                        rounded-[50%]
                    "></span>
                    <span className="
                        block
                        w-[3px]
                        h-[3px]
                        my-[3px]
                        mx-auto
                        bg-[#444444]
                        rounded-[50%]
                    "></span>
                </button>
                <h2 className="
                    block
                    w-full
                    font-defaultRegular
                    text-left
                    text-[#111111]
                    text-[14px]
                    2xs:text-[16px]
                    leading-[20px]
                    mb-[8px]
                ">
                    <span className="
                        inline-block
                        align-middle
                        w-[20px]
                        h-[20px]
                        mr-[6px]
                        bg-[#111111]
                        rounded-[2px]
                        p-[3px]
                    ">
                        <StarIcon color="#ffffff"/>
                    </span>
                    <span className="inline-block align-middle">{data.title}</span>
                </h2>
                <h3 className="
                    block
                    w-full
                    font-defaultRegular
                    text-left
                    text-[#8a2be2]
                    text-[11px]
                    2xs:text-[13px]
                    leading-[18px]
                ">{data.address}</h3>
                {/* <Link to={`/saved-places?edit=${data._id}`} className="
                    inline-block
                    align-middle
                    bg-[#eeeeee]
                    font-defaultBold
                    text-left
                    text-[#444444]
                    text-[10px]
                    2xs:text-[12px]
                    leading-[25px]
                    px-[10px]
                    mr-[5px]
                ">Set as pickup location</Link>
                <Link to={`/saved-places?edit=${data._id}`} className="
                    inline-block
                    align-middle
                    bg-[#eeeeee]
                    font-defaultBold
                    text-left
                    text-[#444444]
                    text-[10px]
                    2xs:text-[12px]
                    leading-[25px]
                    px-[10px]
                    mr-[5px]
                ">Edit</Link>
                <button type="button" onClick={deletePlace} className="
                    inline-block
                    align-middle
                    h-[25px]
                    bg-[#cc0000]
                    font-defaultBold
                    text-left
                    text-[#ffffff]
                    text-[10px]
                    2xs:text-[12px]
                    px-[10px]
                ">Delete</button> */}
            </div>
        </div>
    )

}

export default SavedPlace