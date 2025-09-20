import os
import argparse
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

def configure_api():
    """
    Loads the Google API key from a .env file and configures the genai library.
    """
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file or environment variables.")
    genai.configure(api_key=api_key)

def generate_image_from_prompt(original_image_path: str, text_prompt: str) -> bytes:
    """
    Uses the Gemini image preview model to generate a new image based on an original
    image and a text prompt, using the official Python SDK.

    Args:
        original_image_path: Path to the original image file.
        text_prompt: The text prompt to guide the image generation.

    Returns:
        The raw bytes of the generated PNG image.
    """
    print("-> Generating new image with Gemini...")
    try:
        img = Image.open(original_image_path)
        
        image_generation_model = genai.GenerativeModel(model_name="gemini-2.5-flash-image-preview")

        prompt_parts = [
            text_prompt,
            img
        ]
        
        # *** THIS IS THE CORRECTED PART ***
        # We now pass the configuration directly as a dictionary.
        response = image_generation_model.generate_content(
            contents=prompt_parts,
            generation_config={"response_modalities": ["IMAGE"]}
        )

        # Extract the raw image data from the response
        image_data = response.candidates[0].content.parts[0].inline_data.data
        if not image_data:
            raise ValueError("Could not find generated image data in the API response.")
            
        return image_data

    except Exception as e:
        print(f"An error occurred during image generation: {e}")
        exit(1)

def main():
    """
    Main function to run the image generation pipeline.
    """
    parser = argparse.ArgumentParser(description="An image-to-image generation pipeline using the Gemini Python SDK.")
    parser.add_argument("--image", type=str, required=True, help="Path to the input image file.")
    parser.add_argument("--extra_prompt", type=str, default="", help="Optional: Extra text to add to the generation prompt (e.g., 'on a marble tabletop').")
    parser.add_argument("--output", type=str, default="generated_product_image.png", help="Path to save the output image file.")
    
    args = parser.parse_args()

    try:
        # Step 0: Load and configure the API Key
        configure_api()

        # Step 1: Use a hardcoded prompt for professional product photography.
        print("--- Step 1: Using Hardcoded Product Photography Prompt ---")
        base_description = """This is an image of my product. I want to sell this on the Myntra website, so I need professional photos for it. Create a perfect, professional product photograph using this image, showing it from a slightly different angle, with clean lighting on a neutral, minimalist background suitable for an e-commerce listing."""
        print(f"\nUsing Base Prompt:\n---\n{base_description}\n---\n")

        # Step 2: Combine the hardcoded description with any user-provided extra prompt
        final_prompt = f"{base_description.strip()} {args.extra_prompt.strip()}".strip()
        print(f"Final Combined Prompt: '{final_prompt}'")

        # Step 3: Generate the new image
        print("\n--- Step 2: Generating New Image from Image + Text ---")
        generated_image_bytes = generate_image_from_prompt(args.image, final_prompt)

        # Step 4: Save the generated image
        with open(args.output, "wb") as f:
            f.write(generated_image_bytes)

        print(f"\n✅ Success! Image saved to '{args.output}'")

    except Exception as e:
        print(f"\n❌ An error occurred: {e}")

if __name__ == "__main__":
    main()

