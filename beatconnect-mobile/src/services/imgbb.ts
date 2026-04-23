// ⚠️ REPLACE THIS WITH YOUR IMGBB API KEY
// You can get one for free at https://api.imgbb.com/
export const IMGBB_API_KEY = "c53b6cf61984e45554096f21c910b8ba";

export const uploadToImgBB = async (base64Image: string): Promise<string | null> => {
  if (IMGBB_API_KEY === "c53b6cf61984e45554096f21c910b8ba") {
    throw new Error("You must paste your ImgBB API Key in src/services/imgbb.ts first!");
  }

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
  
  const formData = new FormData();
  formData.append('key', IMGBB_API_KEY);
  formData.append('image', cleanBase64);

  try {
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      return result.data.url;
    } else {
      throw new Error(result.error?.message || "ImgBB Upload Failed");
    }
  } catch (error) {
    console.error("ImgBB Error:", error);
    throw error;
  }
};
