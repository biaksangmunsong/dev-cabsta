const Icon = ({color}) => {

    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M329.91 81.2099C332.776 101.988 317.729 347.034 256.826 347.034C195.923 347.035 179.443 97.6897 182.309 81.2099C185.175 64.7302 198.072 15.2912 256.826 16.0077C315.579 16.7242 327.044 60.4314 329.91 81.2099Z" fill={color || "#111111"}/>
            <circle cx="255.931" cy="440.828" r="55.1724" fill={color || "#111111"}/>
        </svg>
    )

}

export default Icon