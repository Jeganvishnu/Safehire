export const uploadResume = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    // Using the preset name correctly from the screenshot
    formData.append("upload_preset", "Safehire-resumes_unsigned");

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.secure_url;
};
