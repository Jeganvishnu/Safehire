import * as pdfjsLib from 'pdfjs-dist';

// Use CDN for the worker to avoid Vite build configuration issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedDetails {
    phone?: string;
    skills?: string;
    experience?: string;
    education?: string;
    bio?: string;
}

export const extractTextFromPdf = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const typedarray = new Uint8Array(reader.result as ArrayBuffer);
                // Configure getDocument with cMap parameters to support Overleaf/LaTeX generated PDFs
                const pdf = await pdfjsLib.getDocument({
                    data: typedarray,
                    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
                    cMapPacked: true,
                    standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`
                }).promise;
                let fullText = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(" ");
                    fullText += pageText + "\n";
                }

                resolve(fullText);
            } catch (error) {
                console.error("Error parsing PDF:", error);
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

export const parseResumeWithAI = async (text: string): Promise<ExtractedDetails> => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error("OpenRouter API Key not found.");
    }

    const prompt = `
    You are an AI resume parser. I will provide you with the raw text extracted from a resume PDF.
    Your job is to extract the following details into a strict JSON format exactly as requested:
    - phone (string)
    - skills (string, comma-separated list of top skills)
    - experience (string, brief summary like "Fresher", "2 Years", or "5+ Years")
    - education (string, highest degree and institution summarize)
    - bio (string, 1-2 sentence professional summary about the candidate)

    Return ONLY raw JSON, no markdown, no code blocks.

    Resume Text:
    ---
    ${text.substring(0, 15000)}
    ---
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            // Using a free model to avoid 402 Insufficient Quota errors
            model: "meta-llama/llama-3.3-70b-instruct:free",
            messages: [{ role: "user", content: prompt }]
        })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        console.error("OpenRouter API Error:", data.error || response.statusText);
        throw new Error(data.error?.message || "Failed to parse resume with AI");
    }

    let jsonStr = data.choices[0]?.message?.content?.trim() || "";

    // Extract JSON from potential markdown or text wrappers
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        jsonStr = jsonMatch[0];
    }

    return JSON.parse(jsonStr) as ExtractedDetails;
};
