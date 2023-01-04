import { Link } from "react-router-dom"

const RideHistoryListItem = ({data}) => {

    return (
        <Link to={`/history/${data._id}`} className="
            block
            w-full
            mb-[20px]
        ">{data.details.pickupLocation.address}</Link>
    )

}

export default RideHistoryListItem