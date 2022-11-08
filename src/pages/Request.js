const Request = () => {

    return (
        <div className="
            block
            w-[94%]
            max-w-[1000px]
            mx-auto
            py-[50px]
        ">
            <button type="button" className={`
                block
                w-full
                h-[60px]
                bg-[#111111]
                text-[#ffffff]
                font-defaultRegular
                text-[16px]
                text-center
                active:bg-[#444444]
            `}>Request a ride</button>
        </div>
    )

}

export default Request