// import { useState, useEffect, useCallback, useRef } from "react"
// import axios from "axios"
// import { Link } from "react-router-dom"
// import useStore from "../store"
// import { useUserStore } from "../store"
import Header from "../components/Header"
// import RideHistoryListItem from "../components/RideHistoryListItem"
// import DeleteIcon from "../components/icons/Delete"
// import XIcon from "../components/icons/XIcon"
// import SadFace from "../components/icons/SadFace"
// import EmptyIcon from "../components/icons/Empty"
// import RippleThick from "../images/ripple-thick.gif"

const History = () => {

    // const [ prompt ] = useState(null)
    // const rideHistory = useStore(state => state.rideHistory)
    // const setRideHistory = useStore(state => state.setRideHistory)
    // const authToken = useUserStore(state => state.authToken)
    // const resetUserData = useUserStore(state => state.reset)
    // const canLoadMore = useRef(true)
    
    // const getRideHistory = useCallback(async () => {
    //     if (!authToken || rideHistory.loading || !canLoadMore.current) return
        
    //     setRideHistory({
    //         init: true,
    //         error: null,
    //         loading: true
    //     })
    //     canLoadMore.current = false
        
    //     try {
    //         const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-ride-history?lastItem=${rideHistory.lastItem}`, {
    //             headers: {
    //                 Authorization: `Bearer ${authToken}`
    //             }
    //         })

    //         if (res.status === 200 && res.data){
    //             if (res.data.length >= 5){
    //                 canLoadMore.current = true
    //             }
    //             setRideHistory({
    //                 lastItem: res.data.length ? res.data[res.data.length-1].acceptedAt : rideHistory.lastItem,
    //                 loading: false,
    //                 error: null,
    //                 data: [
    //                     ...rideHistory.data,
    //                     ...res.data
    //                 ]
    //             })
    //         }
    //         else {
    //             setRideHistory({
    //                 loading: false,
    //                 error: {
    //                     message: "Something went wrong, please try again."
    //                 }
    //             })
    //         }
    //     }
    //     catch (err){
    //         if (err && err.response && err.response.data && err.response.data.code && err.response.data.code === "credential-expired"){
    //             // alert user that they have to reauthenticate and sign out
    //             alert(err.response.data.message)
    //             return resetUserData()
    //         }
    //         setRideHistory({
    //             loading: false,
    //             error: {
    //                 message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
    //             }
    //         })
    //     }
    // }, [authToken, resetUserData, rideHistory, setRideHistory])

    // const retryGettingRideHistory = () => {
    //     canLoadMore.current = true
    //     getRideHistory()
    // }

    // const onScroll = () => {
    //     return null
    // }
    
    // useEffect(() => {
    //     if (!rideHistory.init){
    //         getRideHistory()
    //     }
    // }, [rideHistory.init, getRideHistory])

    // useEffect(() => {
    //     console.log(rideHistory.data)
    // }, [rideHistory.data])
    
    return (
        <div className={`
            page
            pt-[50px]
        `}>
            <Header
                heading="History"
            />
            <div className="
                block
                w-[94%]
                max-w-[1000px]
                mx-auto
                font-defaultRegular
                text-left
                py-[30px]
            ">Hiai lak bawl man nailou :(</div>
            {/* <div className={`
                flex
                w-full
                h-full
                absolute
                z-[30]
                ${prompt ? "top-0" : "top-[120%]"}
                left-0
                bg-[rgba(0,0,0,.8)]
                overflow-auto
                py-[60px]
            `}>
                <div className={`
                    block
                    w-[40px]
                    h-[40px]
                    absolute
                    z-[10]
                    top-[10px]
                    right-[3%]
                    p-[11px]
                    active:bg-[rgba(255,255,255,.1)]
                    ${prompt ? "scale-[1]" : "scale-0"}
                    duration-[.2s]
                    ease-in-out
                `} onClick={() => window.history.back()}>
                    <XIcon color="#ffffff"/>
                </div>
                <div className={`
                    block
                    w-[94%]
                    max-w-[500px]
                    m-auto
                    bg-[#ffffff]
                    rounded-[10px]
                    overflow-hidden
                    border-[4px]
                    border-solid
                    border-[#ffffff]
                    relative
                    z-[9]
                    ${prompt ? "scale-[1]" : "scale-0"}
                    duration-[.2s]
                    ease-in-out
                `}></div>
                <div className="
                    block
                    w-full
                    h-full
                    absolute
                    z-[1]
                    top-0
                    left-0
                " onClick={() => window.history.back()}></div>
            </div> */}
            {/* <div className="
                block
                w-full
                h-full
                overflow-auto
            " onScroll={onScroll}>
                <div className="
                    block
                    w-full
                ">
                    {
                        rideHistory.data.map(rh => {
                            return <RideHistoryListItem data={rh} key={rh._id}/>
                        })
                    }
                </div>
                {
                    rideHistory.loading ?
                    <div className="
                        block
                        w-full
                        h-[3px]
                        relative
                        overflow-hidden
                    ">
                        <div className="
                            block
                            w-[300%]
                            h-[3px]
                            overflow-hidden
                            absolute
                            top-0
                            left-0
                            -translate-x-[60%]
                            bg-no-repeat
                            bg-center
                            bg-cover
                            opacity-[.8]
                        " style={{backgroundImage: `url(${RippleThick})`}}></div>
                    </div> : ""
                }
                {
                    rideHistory.error ?
                    <div className="
                        block
                        w-full
                        max-w-[300px]
                        mx-auto
                        py-[20px]
                    ">
                        <div className="
                            block
                            w-[50px]
                            h-[50px]
                            mx-auto
                            mb-[10px]
                        ">
                            <SadFace/>
                        </div>
                        <div className="
                            block
                            w-full
                            font-defaultBold
                            text-[#111111]
                            text-[14px]
                            2xs:text-[16px]
                            text-center
                            mb-[20px]
                        ">{rideHistory.error.message}</div>
                        <button type="button" className="
                            block
                            w-[120px]
                            h-[40px]
                            mx-auto
                            bg-[#8a2be2]
                            rounded-[6px]
                            font-defaultBold
                            text-center
                            text-[#ffffff]
                            text-[12px]
                            2xs:text-[14px]
                            active:opacity-[.8]
                        " onClick={retryGettingRideHistory}>Retry</button>
                    </div> : ""
                }
                {
                    (!rideHistory.loading && !rideHistory.error && rideHistory.data.length === 0) ?
                    <div className="
                        block
                        w-[94%]
                        max-w-[1000px]
                        mx-auto
                        py-[20px]
                    ">
                        <div className="
                            block
                            w-[50px]
                            h-[50px]
                            mx-auto
                            mb-[10px]
                        ">
                            <EmptyIcon color="#111111"/>
                        </div>
                        <div className="
                            block
                            w-full
                            font-defaultBold
                            text-[#111111]
                            text-[14px]
                            2xs:text-[16px]
                            text-center
                            mb-[20px]
                        ">Your ride history is empty.</div>
                        <Link to="/set-location" className="
                            block
                            w-full
                            max-w-[500px]
                            leading-[55px]
                            mx-auto
                            bg-[#111111]
                            font-defaultBold
                            text-center
                            text-[#ffffff]
                            text-[13px]
                            2xs:text-[15px]
                            active:opacity-[.8]
                        ">Request a Ride</Link>
                    </div> : ""
                }
            </div> */}
        </div>
    )

}

export default History