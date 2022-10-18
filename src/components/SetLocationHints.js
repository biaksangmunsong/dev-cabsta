import "../styles/set-location-hints.css"
import HintOne from "../videos/hint1.mp4"
import HintTwo from "../videos/hint2.mp4"
import HintThree from "../videos/hint3.mp4"
import HintFour from "../videos/hint4.mp4"
import HintFive from "../videos/hint5.mp4"

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
                        <span>Type the address or place name on the input field and select one from the suggestions</span>
                        <video src={HintOne} autoPlay={true} muted={true} loop={true}/>
                    </p>
                    <p className="hint">
                        <span>Or tap anywhere on the map to drop a pin on a location. <i>(if a pin already exists, this will have no effect)</i></span>
                        <video src={HintTwo} autoPlay={true} muted={true} loop={true}/>
                    </p>
                    <p className="hint">
                        <span>You can drag the pin around to get a more precise location.</span>
                        <video src={HintThree} autoPlay={true} muted={true} loop={true}/>
                    </p>
                    <p className="hint">
                        <span>You can also choose one from your saved places.</span>
                        <video src={HintFour} autoPlay={true} muted={true} loop={true}/>
                    </p>
                    <p className="hint">
                        <span>You may also use your current location as <b>Pickup Location</b> by tapping the <b>Find Me</b> button.</span>
                        <video src={HintFive} autoPlay={true} muted={true} loop={true}/>
                    </p>
                </div>
            </div>
        </div>
    )

}

export default SetLocationHints