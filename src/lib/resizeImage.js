import Resizer from "react-image-file-resizer"

const resizeFile = (file, maxWidth, maxHeight) =>
    new Promise(resolve => {
        Resizer.imageFileResizer(
            file,
            maxWidth,
            maxHeight,
            "JPEG",
            100,
            0,
            (uri) => {
                resolve(uri);
            },
            "base64"
        )
    }
)

export default resizeFile