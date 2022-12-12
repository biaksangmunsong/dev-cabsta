import { useState } from "react"

const CircularProgress = ({ttlStart, ttl, color, bgColor}) => {

    const [ circumference ] = useState(2*Math.PI*210)
    const percentage = Math.round((ttl/ttlStart)*100)
    
    return (
        <>
            {
                (ttlStart && ttl && color && bgColor && circumference && percentage) ?
                <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <circle
                        cx="250"
                        cy="250"
                        r="210"
                        strokeWidth="80"
                        stroke={bgColor}
                        strokeposition="inside"
                        className="relative z-[10]"
                    />
                    <circle
                        cx="250"
                        cy="250"
                        r="210"
                        stroke={color}
                        strokeWidth="80"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference-(circumference*(percentage))/100}
                        strokeposition="inside"
                        className="relative z-[20] duration-[1s] ease-linear"
                    ></circle>
                </svg> : ""
            }
        </>
    )

}

export default CircularProgress