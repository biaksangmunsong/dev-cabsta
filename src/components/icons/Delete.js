const Icon = ({color}) => {

    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M403.865 137H109.039V407.281C109.039 407.281 107.979 433.686 116.953 445.589C126.669 458.476 153.559 461.551 153.559 461.551H361.323C361.323 461.551 385.713 457.402 394.96 445.589C404.194 433.793 403.865 407.281 403.865 407.281V137Z" fill={color || "#111111"}/>
            <path d="M340.503 51V93.4403H171.463V51H340.503Z" fill={color || "#111111"}/>
            <path d="M340.503 51H355.503C355.503 42.7157 348.787 36 340.503 36V51ZM171.463 51V36C163.178 36 156.463 42.7157 156.463 51H171.463ZM340.503 108.44H430.954V78.4403H340.503V108.44ZM355.503 93.4403V51H325.503V93.4403H355.503ZM340.503 36H171.463V66H340.503V36ZM82 108.44H171.463V78.4403H82V108.44ZM171.463 108.44H340.503V78.4403H171.463V108.44ZM156.463 51V93.4403H186.463V51H156.463Z" fill={color || "#111111"}/>
        </svg>
    )

}

export default Icon