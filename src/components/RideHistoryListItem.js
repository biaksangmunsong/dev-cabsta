const RideHistoryListItem = ({data}) => {

    return (
        <div className="
            block
            w-full
        ">{data.details.pickupLocation.address}</div>
    )

}

export default RideHistoryListItem