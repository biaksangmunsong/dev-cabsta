import { Link } from "react-router-dom"
import StarIcon from "./icons/Star"

const SavedPlace = ({data}) => {
    
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
        ">
            <Link to={`/saved-places?prompt=${data._id}`} className={`
                block
                w-[94%]
                mx-auto
                relative
                pr-[30px]
                ${data.deleted ? "max-h-0 py-0" : "max-h-[500px] py-[20px]"}
                overflow-hidden
                duration-[.1s]
                ease-in-out
                active:bg-[#eeeeee]
            `}>
                <button type="button" className="
                    block
                    w-[30px]
                    h-[30px]
                    absolute
                    top-[15px]
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
            </Link>
            <div className={`
                block
                w-[94%]
                max-w-[1000px]
                mx-auto
                rounded-[10px]
                font-defaultBold
                text-left
                text-[#cccccc]
                text-[14px]
                2xs:text-[16px]
                ${!data.deleted ? "max-h-0 py-0" : "max-h-[500px] py-[20px]"}
                overflow-hidden
                duration-[.1s]
                ease-in-out
            `}>Deleted</div>
        </div>
    )

}

export default SavedPlace