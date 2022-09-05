import LeftArrow from "./icons/LeftArrow"

const Header = ({heading, RightCTA}) => {

    const goBack = () => {
        window.history.back()
    }
    
    return (
        <div className="
            block
            w-full
            h-[50px]
            bg-[#ffffff]
            border-b
            border-solid
            border-[#dddddd]
            absolute
            z-[20]
            top-0
            left-0
            overflow-hidden
        ">
            <div className="
                block
                w-[90%]
                max-w-[1000px]
                mx-auto
                text-left
                overflow-visible
            ">
                <div className="
                    inline-block
                    align-middle
                    w-[50px]
                    h-[50px]
                    p-[16px]
                    -translate-x-[16px]
                    active:bg-[#eeeeee]
                " onClick={goBack}>
                    <LeftArrow/>
                </div>
                {
                    heading ?
                    <div className="
                        hidden
                        3xs:inline-block
                        align-middle
                        font-defaultBold
                        text-[#111111]
                        text-[18px]
                        leading-[50px]
                        -translate-x-[16px]
                    ">{heading}</div> : ""
                }
                {RightCTA ? <RightCTA/> : ""}
            </div>
        </div>
    )

}

export default Header