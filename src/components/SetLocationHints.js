import "../styles/set-location-hints.css"
import HintOne from "../images/hint1.gif"
import HintTwo from "../images/hint2.gif"
import HintThree from "../images/hint3.gif"
import HintFour from "../images/hint4.gif"
import HintFive from "../images/hint5.gif"

const SetLocationHints = () => {
    
    return (
        <div className="
            block
            w-full
            h-full
            overflow-auto
            pt-[60px]
            absolute
            z-[10]
            top-0
            left-0
        ">
            <div className="
                block
                w-[94%]
                max-w-[1000px]
                mx-auto
                pb-[40px]
            ">
                <h2 className="
                    block
                    w-full
                    font-defaultBold
                    text-left
                    text-[#111111]
                    text-[22px]
                    2xs:text-[24px]
                    mt-[30px]
                    mb-[40px]
                ">How to set location.</h2>
                <div className="
                    hints
                    block
                    w-full
                ">
                    <p className="hint">
                        <span>Type the address or place name on the input field and select one from the suggestions.</span>
                        <img src={HintOne} alt=""/>
                    </p>
                    <p className="hint">
                        <span>Or tap anywhere on the map to drop a pin on a location. <i>(if a pin already exists, this will have no effect)</i></span>
                        <img src={HintTwo} alt=""/>
                    </p>
                    <p className="hint">
                        <span>You can drag the pin around to get a more precise location.</span>
                        <img src={HintThree} alt=""/>
                    </p>
                    <p className="hint">
                        <span>You can also choose one from your saved places.</span>
                        <img src={HintFour} alt=""/>
                    </p>
                    <p className="hint">
                        <span>You may also use your current location as <b>Pickup Location</b> by tapping the <b>Find Me</b> button.</span>
                        <img src={HintFive} alt=""/>
                    </p>
                </div>
            </div>
        </div>
    )

}

export default SetLocationHints