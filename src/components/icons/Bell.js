const Icon = ({color}) => {

    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M384 170.667C384 136.719 370.514 104.162 346.51 80.157C322.505 56.1523 289.948 42.6667 256 42.6667C222.052 42.6667 189.495 56.1523 165.49 80.157C141.486 104.162 128 136.719 128 170.667C128 320 64 362.667 64 362.667H448C448 362.667 384 320 384 170.667Z" stroke={color || "#ffffff"} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M292.907 448C289.156 454.466 283.773 459.833 277.296 463.563C270.818 467.294 263.475 469.258 256 469.258C248.525 469.258 241.182 467.294 234.705 463.563C228.227 459.833 222.844 454.466 219.093 448" stroke={color || "#ffffff"} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )

}

export default Icon