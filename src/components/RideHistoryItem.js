import { useNavigate } from "react-router-dom"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

const RideHistoryItem = ({data}) => {

    const navigate = useNavigate()

    const repeatRide = () => {
        window.rideInputAutofill = {
            pickupLocation: data.data.details.pickupLocation,
            destination: data.data.details.destination
        }
        navigate("/set-location")
    }

    const reverseRide = () => {
        window.rideInputAutofill = {
            pickupLocation: data.data.details.destination,
            destination: data.data.details.pickupLocation
        }
        navigate("/set-location")
    }
    
    return (
        <div className="
            block
            w-full
            pt-[55px]
        ">
            <div className="
                block
                w-[94%]
                max-w-[1000px]
                mx-auto
                pt-[40px]
                pb-[30px]
            ">
                <h1 className="
                    block
                    w-full
                    font-defaultBold
                    text-left
                    text-[#111111]
                    text-[25px]
                    2xs:text-[30px]
                    leading-[30px]
                    2xs:leading-[35px]
                ">Ride {data.data.status}</h1>
                <div className="
                    block
                    w-full
                    font-defaultRegular
                    text-left
                    text-[12px]
                    2xs:text-[14px]
                    text-[#555555]
                ">
                    {
                        data.data.status === "cancelled" ?
                        `${dayjs(data.data.cancellation.iat).fromNow()}, by ${data.data.cancellation.iby === "passenger" ? "you" : "driver"}` :
                        `${dayjs(data.data.completedAt)}`
                    }
                </div>
                <div className="
                    block
                    w-full
                    text-left
                    mt-[15px]
                ">
                    <button type="button" onClick={repeatRide} className="
                        inline-block
                        align-middle
                        h-[35px]
                        px-[15px]
                        border
                        border-solid
                        border-[#8a2be2]
                        rounded-[20px]
                        font-defaultBold
                        text-left
                        text-[#8a2be2]
                        active:text-[#ffffff]
                        text-[12px]
                        mr-[6px]
                        active:bg-[#8a2be2]
                    ">Repeat Ride</button>
                    <button type="button" onClick={reverseRide} className="
                        inline-block
                        align-middle
                        h-[35px]
                        px-[15px]
                        border
                        border-solid
                        border-[#8a2be2]
                        rounded-[20px]
                        font-defaultBold
                        text-left
                        text-[#8a2be2]
                        active:text-[#ffffff]
                        text-[12px]
                        active:bg-[#8a2be2]
                    ">Reverse & Repeat Ride</button>
                </div>
                <div className="
                    block
                    w-full
                    mt-[20px]
                    py-[20px]
                    border-y
                    border-solid
                    border-[#cccccc]
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
                                w-[10px]
                                h-[10px]
                                bg-[#111111]
                                rounded-[50%]
                            "></div>
                            <div className="
                                block
                                w-[2px]
                                h-full
                                absolute
                                top-[14px]
                                left-[4px]
                                bg-[#888888]
                            "></div>
                        </div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#888888]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            mb-[5px]
                        ">Pickup Location</div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                        ">{data.data.details.pickupLocation.address}</div>
                    </div>
                    <div className="
                        block
                        w-[2px]
                        h-[30px]
                        ml-[4px]
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
                                w-[10px]
                                h-[10px]
                                bg-[#111111]
                            "></div>
                            <div className="
                                block
                                w-[2px]
                                h-full
                                absolute
                                -top-1/2
                                -translate-y-1/2
                                -mt-[4px]
                                left-[4px]
                                bg-[#888888]
                            "></div>
                        </div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#888888]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            mb-[5px]
                        ">Destination</div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                        ">{data.data.details.destination.address}</div>
                    </div>
                </div>
                <div className="
                    block
                    w-full
                    mb-[20px]
                    py-[20px]
                    border-b
                    border-solid
                    border-[#cccccc]
                ">
                    <div className="
                        block
                        w-full
                        min-h-[20px]
                        relative
                        pl-[100px]
                        pr-[5px]
                        mb-[10px]
                    ">
                        <div className="
                            block
                            w-[100px]
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            absolute
                            top-0
                            left-0
                        ">Distance<span className="absolute top-0 right-0">:</span></div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            pl-[15px]
                        ">{data.data.details.distance.text}</div>
                    </div>
                    <div className="
                        block
                        w-full
                        min-h-[20px]
                        relative
                        pl-[100px]
                        pr-[5px]
                    ">
                        <div className="
                            block
                            w-[100px]
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            absolute
                            top-0
                            left-0
                        ">Price<span className="absolute top-0 right-0">:</span></div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            pl-[15px]
                        ">₹{data.data.details.price}</div>
                    </div>
                </div>
                <div className="
                    block
                    w-full
                ">
                    <div className="
                        block
                        w-full
                        font-defaultBold
                        text-left
                        text-[#111111]
                        text-[18px]
                        2xs:text-[20px]
                        leading-[25px]
                        mb-[20px]
                    ">Driver</div>
                    <div className="
                        block
                        w-[100px]
                        h-[100px]
                        bg-no-repeat
                        bg-center
                        bg-cover
                        mb-[20px]
                        rounded-[50%]
                    " style={{backgroundImage: `url(${data.data.details.driver.photo.thumbnail_url})`}}></div>
                    <div className="
                        block
                        w-full
                        min-h-[20px]
                        relative
                        pl-[100px]
                        pr-[5px]
                        mb-[10px]
                    ">
                        <div className="
                            block
                            w-[100px]
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            absolute
                            top-0
                            left-0
                        ">Name<span className="absolute top-0 right-0">:</span></div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            pl-[15px]
                        ">{data.data.details.driver.name}</div>
                    </div>
                    <div className="
                        block
                        w-full
                        min-h-[20px]
                        relative
                        pl-[100px]
                        pr-[5px]
                        mb-[10px]
                    ">
                        <div className="
                            block
                            w-[100px]
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            absolute
                            top-0
                            left-0
                        ">Gender<span className="absolute top-0 right-0">:</span></div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            pl-[15px]
                            capitalize
                        ">{data.data.details.driver.gender}</div>
                    </div>
                    <div className="
                        block
                        w-full
                        min-h-[20px]
                        relative
                        pl-[100px]
                        pr-[5px]
                        mb-[10px]
                    ">
                        <div className="
                            block
                            w-[100px]
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            absolute
                            top-0
                            left-0
                        ">Age<span className="absolute top-0 right-0">:</span></div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            pl-[15px]
                        ">{data.data.details.driver.age}</div>
                    </div>
                    <div className="
                        block
                        w-full
                        min-h-[20px]
                        relative
                        pl-[100px]
                        pr-[5px]
                    ">
                        <div className="
                            block
                            w-[100px]
                            font-defaultBold
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            absolute
                            top-0
                            left-0
                        ">Vehicle<span className="absolute top-0 right-0">:</span></div>
                        <div className="
                            block
                            w-full
                            font-defaultRegular
                            text-left
                            text-[#111111]
                            text-[12px]
                            2xs:text-[14px]
                            leading-[20px]
                            pl-[15px]
                            mb-[5px]
                        ">{data.data.details.driver.vehicle.model}, {data.data.details.driver.vehicle.numberPlate}</div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default RideHistoryItem