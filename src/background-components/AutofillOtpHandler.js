import { useEffect } from "react"

const AutofillOtpHander = () => {

    useEffect(() => {
        if (window.OTPCredential){
            const ac = new AbortController()
            window.navigator.credentials.get({
                otp: {
                    transport: ["sms"],
                    signal: ac.signal
                }
            }).then(otp => {
                console.log(otp)
                ac.abort()
            }).catch(err => {
                console.log(err)
                ac.abort()
            })
        }
    }, [])

    return (<div className="hidden"></div>)

}

export default AutofillOtpHander