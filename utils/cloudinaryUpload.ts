export const uploadResume = async (file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
        throw new Error(
            "Cloudinary cloud name is not configured. Set VITE_CLOUDINARY_CLOUD_NAME in .env.local"
        );
    }

    console.log("[Cloudinary] Uploading to cloud:", cloudName);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Safehire-resumes_unsigned");

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    if (data.error) {
        // Provide actionable error for common Cloudinary issues
        if (data.error.message?.includes("cloud_name is disabled")) {
            throw new Error(
                "Your Cloudinary account is disabled or suspended. Please log in to your Cloudinary dashboard and re-activate your account, or create a new one."
            );
        }
        throw new Error(data.error.message);
    }

    return data.secure_url;
};
