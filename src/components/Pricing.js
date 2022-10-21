import { useState, useEffect, useCallback } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import useStore from "../store"
import calculatePrice from "../lib/calculatePrice"
import Scooter from "./icons/Scooter"
import Car from "./icons/Car"
import SadFace from "./icons/SadFace"
import Spinner from "../images/spinner.gif"

const Pricing = () => {
    
    const location = useLocation()
    const locationQueries = useStore(state => state.locationQueries)
    const pricing = useStore(state => state.pricing)
    const setPricing = useStore(state => state.setPricing)
    const [ twoWheelerPrice, setTwoWheelerPrice ] = useState(0)
    const [ fourWheelerPrice, setFourWheelerPrice ] = useState(0)
    const [ rangeValue, setRangeValue ] = useState(2000)
    const [ distance, setDistance ] = useState("2.0km")
    
    const getData = useCallback(async () => {
        if (pricing.loading) return
        
        setPricing({
            init: true,
            loading: true,
            error: null,
            data: null
        })
        
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-pricing-data`)
            if (res.status === 200 && res.data){
                setPricing({
                    init: true,
                    loading: false,
                    error: null,
                    data: res.data
                })
            }
            else {
                setPricing({
                    init: true,
                    loading: false,
                    error: {
                        message: "Something went wrong, please try again."
                    },
                    data: null
                })
            }
        }
        catch (err){
            setPricing({
                init: true,
                loading: false,
                error: {
                    message: (err && err.response && err.response.data && err.response.data.message) ? err.response.data.message : "Something went wrong, please try again."
                },
                data: null
            })
        }
    }, [setPricing, pricing.loading])
    
    const onRangeChange = e => {
        const rangeValue = Number(e.target.value)
        setRangeValue(rangeValue)
        
        if (rangeValue < 1000){
            setDistance(`${rangeValue}m`)
        }
        else {
            setDistance(`${(rangeValue/1000).toFixed(1)}km`)
        }
    }
    
    useEffect(() => {
        if (pricing.data){
            setTwoWheelerPrice(rangeValue ? calculatePrice(rangeValue, pricing.data.basePrice, pricing.data.perKmPrice).twoWheeler : 0)
            setFourWheelerPrice(rangeValue ? calculatePrice(rangeValue, pricing.data.basePrice, pricing.data.perKmPrice).fourWheeler : 0)
        }
    }, [pricing.data, rangeValue])
    
    useEffect(() => {
        if ((location.pathname === "/pricing" || (location.pathname === "/choose-vehicle" && locationQueries.includes("pricing-details"))) && !pricing.init){
            getData()
        }
    }, [getData, location.pathname, locationQueries, pricing.init])
    
    return (
        <div className="
            block
            w-full
        ">
            {
                pricing.loading ?
                <div className="
                    block
                    w-full
                    py-[20px]
                ">
                    <img src={Spinner} alt="" className="
                        block
                        w-[35px]
                        h-[35px]
                        mx-auto
                        mb-[5px]
                    "/>
                    <div className="
                        block
                        w-full
                        font-defaultBold
                        text-[#111111]
                        text-[14px]
                        2xs:text-[16px]
                        text-center
                    ">Loading...</div>
                </div> : ""
            }
            {
                pricing.error ?
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
                    ">{pricing.error.message}</div>
                    <button type="button" className="
                        block
                        w-[120px]
                        h-[40px]
                        mx-auto
                        bg-[#8a2be2]
                        rounded-[6px]
                        font-defaultBold
                        text-[center]
                        text-[#ffffff]
                        text-[12px]
                        2xs:text-[14px]
                        active:opacity-[.8]
                    " onClick={getData}>Retry</button>
                </div> : ""
            }
            {
                pricing.data ?
                <>
                    <h4 className="
                        block
                        w-full
                        font-defaultRegular
                        text-left
                        text-[18px]
                        2xs:text-[20px]
                        text-[#111111]
                        mb-[10px]
                    ">Price Calculator:</h4>
                    <div className="
                        block
                        w-[full]
                        p-[20px]
                        pt-[15px]
                        bg-[#eeeeee]
                        border
                        border-solid
                        border-[#aaaaaa]
                        rounded-[10px]
                        mb-[40px]
                    ">
                        <div className="
                            block
                            w-full
                            mb-[20px]
                        ">
                            <div className="
                                inline-block
                                align-middle
                            ">
                                <span className="
                                    inline-block
                                    align-middle
                                    w-[35px]
                                    -translate-x-[10px]
                                "><Scooter color="#111111"/></span>
                                <span className="
                                    inline-block
                                    align-middle
                                    -translate-x-[6px]
                                    font-defaultBold
                                    text-left
                                    text-[18px]
                                    2xs:text-[20px]
                                    text-[#8a2be2]
                                ">₹{twoWheelerPrice}</span>
                            </div>
                            <div className="
                                inline-block
                                align-middle
                                float-right
                            ">
                                <span className="
                                    inline-block
                                    align-middle
                                    font-defaultBold
                                    text-left
                                    text-[18px]
                                    2xs:text-[20px]
                                    text-[#8a2be2]
                                ">₹{fourWheelerPrice}</span>
                                <span className="
                                    inline-block
                                    align-middle
                                    w-[35px]
                                    ml-[4px]
                                    translate-x-[6px]
                                "><Car color="#111111"/></span>
                            </div>
                        </div>
                        <div className="
                            block
                            w-full
                            h-[64px]
                            relative
                        ">
                            <div className="
                                block
                                w-[40px]
                                h-full
                                absolute
                                z-[10]
                                top-0
                                -translate-x-1/2
                            " style={{
                                left: `${
                                    (rangeValue/pricing.data.perKmPrice[pricing.data.perKmPrice.length-1].to)*100
                                }%`
                            }}>
                                <div className="
                                    block
                                    w-full
                                    font-defaultBold
                                    text-center
                                    text-[10px]
                                    leading-[20px]
                                    text-[#ffffff]
                                    whitespace-nowrap
                                    overflow-visible
                                    bg-[#111111]
                                ">{distance}</div>
                                <div className="
                                    block
                                    w-[2px]
                                    h-[10px]
                                    bg-[#111111]
                                    mx-auto
                                "></div>
                                <div className="
                                    block
                                    w-[15px]
                                    h-[15px]
                                    rounded-[50%]
                                    bg-[#111111]
                                    mx-auto
                                "></div>
                            </div>
                            <div className="
                                block
                                w-full
                                h-[6px]
                                absolute
                                z-[5]
                                bottom-[24px]
                                left-0
                                bg-[#888888]
                            "></div>
                            <div className="
                                block
                                w-full
                                h-[30px]
                                absolute
                                z-[5]
                                bottom-0
                                left-0
                            ">
                                <div className="
                                    block
                                    w-[50px]
                                    h-full
                                    absolute
                                    top-0
                                    left-0
                                    -translate-x-1/2
                                ">
                                    <div className="
                                        block
                                        w-[5px]
                                        h-[6px]
                                        bg-[#111111]
                                        mx-auto
                                        mb-[5px]
                                    "></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultBold
                                        text-center
                                        text-[10px]
                                        leading-[15px]
                                        text-[#111111]
                                        whitespace-nowrap
                                        overflow-visible
                                    ">0km</div>
                                </div>
                                <div className="
                                    block
                                    w-[50px]
                                    h-full
                                    absolute
                                    top-0
                                    left-1/2
                                    -translate-x-1/2
                                ">
                                    <div className="
                                        block
                                        w-[5px]
                                        h-[6px]
                                        bg-[#111111]
                                        mx-auto
                                        mb-[5px]
                                    "></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultBold
                                        text-center
                                        text-[10px]
                                        leading-[15px]
                                        text-[#111111]
                                        whitespace-nowrap
                                        overflow-visible
                                    ">{Math.floor(pricing.data.perKmPrice[pricing.data.perKmPrice.length-1].to/1000)/2}km</div>
                                </div>
                                <div className="
                                    block
                                    w-[50px]
                                    h-full
                                    absolute
                                    top-0
                                    right-0
                                    translate-x-1/2
                                ">
                                    <div className="
                                        block
                                        w-[5px]
                                        h-[6px]
                                        bg-[#111111]
                                        mx-auto
                                        mb-[5px]
                                    "></div>
                                    <div className="
                                        block
                                        w-full
                                        font-defaultBold
                                        text-center
                                        text-[10px]
                                        leading-[15px]
                                        text-[#111111]
                                        whitespace-nowrap
                                        overflow-visible
                                    ">{Math.floor(pricing.data.perKmPrice[pricing.data.perKmPrice.length-1].to/1000)}km</div>
                                </div>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={pricing.data.perKmPrice[pricing.data.perKmPrice.length-1].to}
                                value={rangeValue}
                                onChange={onRangeChange}
                                className="
                                    block
                                    w-full
                                    h-full
                                    absolute
                                    z-[20]
                                    top-0
                                    left-0
                                    opacity-0
                                "
                            />
                        </div>
                    </div>
                    <div className="
                        block
                        w-[60px]
                        border-b-[4px]
                        border-dashed
                        border-[#cccccc]
                        mx-auto
                        mb-[30px]
                    "></div>
                    <h2 className="
                        block
                        w-full
                        font-defaultRegular
                        text-left
                        text-[26px]
                        2xs:text-[30px]
                        text-[#111111]
                        mb-[10px]
                    ">How price is calculated</h2>
                    <p className="
                        block
                        w-full
                        font-defaultRegular
                        text-left
                        text-[12px]
                        2xs:text-[14px]
                        text-[#888888]
                        mb-[30px]
                    ">Price is calculated based on distance and distance is measured in kilometers and are rounded to the closest integer. <b className="font-defaultBold">Example:</b> 0.4km = 0km, 0.5km = 1km, etc.</p>
                    <div className="
                        block
                        w-full
                        mb-[20px]
                        bg-[#eeeeee]
                    ">
                        <div className="
                            block
                            w-full
                            bg-[#111111]
                        ">
                            <div className="
                                inline-block
                                align-middle
                                w-[34%]
                            "></div>
                            <div className="
                                inline-block
                                align-middle
                                w-[33%]
                                min-h-[50px]
                                p-[10px]
                                font-defaultBold
                                text-center
                                text-[10px]
                                2xs:text-[12px]
                                leading-[16px]
                                text-[#ffffff]
                            ">Two<br/>Wheeler</div>
                            <div className="
                                inline-block
                                align-middle
                                w-[33%]
                                min-h-[50px]
                                p-[10px]
                                font-defaultBold
                                text-center
                                text-[10px]
                                2xs:text-[12px]
                                leading-[16px]
                                text-[#ffffff]
                            ">Four<br/>Wheeler</div>
                        </div>
                        <div className="
                            block
                            w-full
                            border
                            border-solid
                            border-[#111111]
                        ">
                            <div className="
                                inline-block
                                align-middle
                                w-[34%]
                                min-h-[50px]
                                px-[10px]
                                py-[15px]
                                font-defaultRegular
                                text-left
                                text-[12px]
                                2xs:text-[14px]
                                leading-[20px]
                                text-[#111111]
                                border-r
                                border-solid
                                border-[#111111]
                            ">Base Price</div>
                            <div className="
                                inline-block
                                align-middle
                                w-[33%]
                                min-h-[50px]
                                px-[10px]
                                py-[15px]
                                font-defaultBold
                                text-center
                                text-[12px]
                                2xs:text-[14px]
                                leading-[20px]
                                text-[#111111]
                                border-r
                                border-solid
                                border-[#111111]
                            ">₹{pricing.data.basePrice.twoWheeler}</div>
                            <div className="
                                inline-block
                                align-middle
                                w-[33%]
                                min-h-[50px]
                                px-[10px]
                                py-[15px]
                                font-defaultBold
                                text-center
                                text-[12px]
                                2xs:text-[14px]
                                leading-[20px]
                                text-[#111111]
                            ">₹{pricing.data.basePrice.fourWheeler}</div>
                        </div>
                    </div>
                    <h4 className="
                        block
                        w-full
                        font-defaultRegular
                        text-left
                        text-[18px]
                        2xs:text-[20px]
                        text-[#111111]
                        mb-[10px]
                    ">Price Per Kilometer:</h4>
                    <div className="
                        block
                        w-full
                        mb-[40px]
                        bg-[#eeeeee]
                    ">
                        <div className="
                            block
                            w-full
                            bg-[#111111]
                        ">
                            <div className="
                                inline-block
                                align-middle
                                w-[34%]
                            "></div>
                            <div className="
                                inline-block
                                align-middle
                                w-[33%]
                                min-h-[50px]
                                p-[10px]
                                font-defaultBold
                                text-center
                                text-[10px]
                                2xs:text-[12px]
                                leading-[16px]
                                text-[#ffffff]
                            ">Two<br/>Wheeler</div>
                            <div className="
                                inline-block
                                align-middle
                                w-[33%]
                                min-h-[50px]
                                p-[10px]
                                font-defaultBold
                                text-center
                                text-[10px]
                                2xs:text-[12px]
                                leading-[16px]
                                text-[#ffffff]
                            ">Four<br/>Wheeler</div>
                        </div>
                        {
                            pricing.data.perKmPrice.map(perKm => {
                                const from = Math.floor(perKm.from/1000)
                                const to = Math.floor(perKm.to/1000)
                                
                                return (
                                    <div className="
                                        block
                                        w-full
                                        border
                                        border-t-[0]
                                        border-solid
                                        border-[#111111]
                                    " key={`${perKm.from}-${perKm.to}`}>
                                        <div className="
                                            inline-block
                                            align-middle
                                            w-[34%]
                                            min-h-[50px]
                                            px-[10px]
                                            py-[15px]
                                            font-defaultRegular
                                            text-left
                                            text-[12px]
                                            2xs:text-[14px]
                                            leading-[20px]
                                            text-[#111111]
                                            border-r
                                            border-solid
                                            border-[#111111]
                                        ">{from}km - {to}km</div>
                                        <div className="
                                            inline-block
                                            align-middle
                                            w-[33%]
                                            min-h-[50px]
                                            px-[10px]
                                            py-[15px]
                                            font-defaultBold
                                            text-center
                                            text-[12px]
                                            2xs:text-[14px]
                                            leading-[20px]
                                            text-[#111111]
                                            border-r
                                            border-solid
                                            border-[#111111]
                                        ">₹{perKm.twoWheeler}/km</div>
                                        <div className="
                                            inline-block
                                            align-middle
                                            w-[33%]
                                            min-h-[50px]
                                            px-[10px]
                                            py-[15px]
                                            font-defaultBold
                                            text-center
                                            text-[12px]
                                            2xs:text-[14px]
                                            leading-[20px]
                                            text-[#111111]
                                        ">₹{perKm.fourWheeler}/km</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="
                        block
                        w-[60px]
                        border-b-[4px]
                        border-dashed
                        border-[#cccccc]
                        mx-auto
                        mb-[30px]
                    "></div>
                    <p className="
                        block
                        w-full
                        font-defaultBold
                        text-center
                        text-[12px]
                        2xs:text-[14px]
                        text-[#888888]
                    ">Note: Pricing may change from time to time.</p>
                </> : ""
            }
        </div>
    )

}

export default Pricing