import { useState, useRef } from "react"
import TextareaAutosize from "react-textarea-autosize"
import LeftArrow from "./icons/LeftArrow"
import Check from "./icons/Check"
import axios from "axios"

const CancellationPrompt = ({data}) => {

    const [ selectedReason, setSelectedReason ] = useState("")
    const [ otherReason, setOtherReason ] = useState("")
    // const [ reason, setReason ] = useState("")
    const otherReasonInputRef = useRef(null)
    
    const onReasonClick = r => {
        setSelectedReason(r)
    }

    const onOtherReasonChange = e => {
        if (e.target.value.length <= 500){
            setOtherReason(e.target.value)
        }
    }

    const test = async () => {
        axios.get("https://dev.api.biaksang.in/v1")
        axios.get("http://home-server.biaksang.in/v1")
    }
    
    return (
        <div className="
            block
            w-full
            h-full
            overflow-hidden
            bg-[#ffffff]
            absolute
            z-[50]
        ">
            <div className="
                block
                w-full
                h-full
                overflow-auto
            ">
                <div className="
                    block
                    w-[94%]
                    max-w-[1000px]
                    mx-auto
                    pt-[10px]
                    pb-[100px]
                ">
                    <div className="
                        block
                        w-[50px]
                        h-[50px]
                        p-[12px]
                        -translate-x-[12px]
                        active:bg-[#eeeeee]
                        mb-[20px]
                    " onClick={() => window.history.back()}>
                        <LeftArrow color="#111111"/>
                    </div>
                    <h1 className="
                        block
                        w-full
                        font-defaultBold
                        text-left
                        text-[#111111]
                        text-[26px]
                        2xs:text-[30px]
                    " onClick={test}>Cancel a ride</h1>
                    <p className="
                        block
                        w-full
                        font-defaultRegular
                        text-left
                        text-[#444444]
                        text-[14px]
                        2xs:text-[16px]
                    ">Please specify a reason for cancellation</p>
                    <div className="
                        block
                        w-full
                        my-[40px]
                    ">
                        {
                            data.reasonsForCancellation.map((r, i) => {
                                return (
                                    <div className={`
                                        block
                                        w-full
                                        border-[2px]
                                        border-solid
                                        ${r === selectedReason ? "border-[#8a2be2]" : "border-[#dddddd]"}
                                        bg-[#ffffff]
                                        rounded-[10px]
                                        py-[20px]
                                        pr-[10px]
                                        pl-[40px]
                                        relative
                                        mb-[10px]
                                        last:mb-0
                                    `} key={i} onClick={() => onReasonClick(r)}>
                                        <div className={`
                                            block
                                            w-[20px]
                                            h-[20px]
                                            border-[2px]
                                            border-solid
                                            ${r === selectedReason ? "border-[#8a2be2]" : "border-[#888888]"}
                                            rounded-[4px]
                                            absolute
                                            top-1/2
                                            -translate-y-1/2
                                            left-[10px]
                                            overflow-visible
                                        `}>
                                            {
                                                r === selectedReason ?
                                                <div className="
                                                    block
                                                    w-[120%]
                                                    h-[120%]
                                                    absolute
                                                    top-1/2
                                                    -translate-y-1/2
                                                    left-[20%]
                                                ">
                                                    <Check color="#8a2be2"/>
                                                </div> : ""
                                            }
                                        </div>
                                        <div className={`
                                            block
                                            w-full
                                            font-defaultBold
                                            text-left
                                            ${r === selectedReason ? "text-[#8a2be2]" : "text-[#111111]"}
                                            text-[14px]
                                            2xs:text-[16px]
                                        `}>{r}</div>
                                    </div>
                                )
                            })
                        }
                        <div className={`
                            block
                            w-full
                            border-[2px]
                            border-solid
                            ${selectedReason === "others" ? "border-[#8a2be2] max-h-[360px]" : "border-[#dddddd] max-h-[60px]"}
                            overflow-hidden
                            bg-[#ffffff]
                            rounded-[10px]
                            py-[20px]
                            px-[10px]
                            relative
                            mb-[10px]
                            last:mb-0
                            duration-[.4s]
                            ease-in-out
                        `} onClick={() => onReasonClick("others")}>
                            <div className={`
                                block
                                w-[20px]
                                h-[20px]
                                border-[2px]
                                border-solid
                                ${selectedReason === "others" ? "border-[#8a2be2]" : "border-[#888888]"}
                                rounded-[4px]
                                absolute
                                top-[20px]
                                left-[10px]
                                overflow-visible
                            `}>
                                {
                                    selectedReason === "others" ?
                                    <div className="
                                        block
                                        w-[120%]
                                        h-[120%]
                                        absolute
                                        top-1/2
                                        -translate-y-1/2
                                        left-[20%]
                                    ">
                                        <Check color="#8a2be2"/>
                                    </div> : ""
                                }
                            </div>
                            <div className={`
                                block
                                w-full
                                font-defaultBold
                                text-left
                                ${selectedReason === "others" ? "text-[#8a2be2]" : "text-[#111111]"}
                                text-[14px]
                                2xs:text-[16px]
                                leading-[20px]
                                pl-[30px]
                            `}>Others</div>
                            <div className="
                                block
                                w-full
                                mt-[20px]
                                relative
                            ">
                                <div className="
                                    block
                                    w-[50px]
                                    absolute
                                    z-[20]
                                    top-[15px]
                                    right-0
                                    text-center
                                    font-defaultRegular
                                    text-[12px]
                                    leading-[20px]
                                    text-[#111111]
                                ">{500-otherReason.length}</div>
                                <TextareaAutosize
                                    placeholder="Type something"
                                    name="reason-for-cancellation"
                                    value={otherReason}
                                    onChange={onOtherReasonChange}
                                    minRows={3}
                                    maxRows={10}
                                    ref={otherReasonInputRef}
                                    className="
                                        block
                                        w-full
                                        font-defaultBold
                                        text-left
                                        text-[#111111]
                                        text-[14px]
                                        2xs:text-[16px]
                                        leading-[20px]
                                        py-[15px]
                                        relative
                                        z-[10]
                                        pr-[50px]
                                        pl-[10px]
                                        bg-[#dddddd]
                                        rounded-[8px]
                                        resize-none
                                    "
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default CancellationPrompt