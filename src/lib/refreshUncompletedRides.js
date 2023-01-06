import axios from "axios"

const refreshUncompletedRides = async (authToken, setUncompletedRides) => {
    
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-uncompleted-rides`, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        })
        if (res.status === 200 || res.data){
            setUncompletedRides(res.data)
        }
    }
    catch {}

}

export default refreshUncompletedRides