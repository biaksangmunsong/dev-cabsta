const getTimeInMinutes = (speedInKmph, distanceInMeters) => {

    // time = distance / speed
    const speedInMps = Math.round(speedInKmph/3.6)
    const seconds = distanceInMeters/speedInMps

    if (seconds < 60){
        return 1
    }
    
    return Math.floor(seconds/60)

}

export default getTimeInMinutes