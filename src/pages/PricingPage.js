import Header from "../components/Header"
import Pricing from "../components/Pricing"

const PricingPage = () => {
    
    return (
        <div className={`
            page
            pt-[50px]
        `}>
            <Header heading="Pricing"/>
            <div className="
                block
                w-full
                h-full
                overflow-auto
                py-[30px]
                relative
                z-[10]
            ">
                <div className="
                    block
                    w-[94%]
                    max-w-[1000px]
                    mx-auto
                ">
                    <Pricing/>
                </div>
            </div>
        </div>
    )

}

export default PricingPage