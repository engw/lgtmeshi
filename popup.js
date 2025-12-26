document.addEventListener('DOMContentLoaded', () => {
  const categorySelect = document.getElementById('category');
  const styleSelect = document.getElementById('style');
  const generateBtn = document.getElementById('generateBtn');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const generatedImage = document.getElementById('generatedImage');
  const copyImageBtn = document.getElementById('copyImageBtn');
  const errorDiv = document.getElementById('error');

  // Category prompts that avoid AI-looking results
  const categoryPrompts = {
    food: 'delicious appetizing food, gourmet cuisine, tasty dishes, beautiful food photography',
    nature: 'beautiful natural landscape, forest, mountains, or ocean scenery',
    animal: 'cute real animal, cat, dog, bird, or wildlife photography',
    space: 'stunning space scene, galaxies, nebula, or starfield',
    abstract: 'elegant abstract geometric patterns, flowing shapes',
    minimal: 'clean minimalist design, simple shapes, lots of white space',
    retro: 'vintage 80s or 90s aesthetic, retro vibes, nostalgic',
    cute: 'kawaii style, pastel colors, adorable characters',
    cool: 'sleek modern design, dark theme, professional look'
  };

  const stylePrompts = {
    photo: 'photorealistic, high quality photograph, natural lighting',
    illustration: 'beautiful hand-drawn illustration, artistic',
    watercolor: 'watercolor painting style, soft colors, artistic brush strokes',
    sketch: 'pencil sketch, hand-drawn, artistic linework',
    pixel: '16-bit pixel art style, retro game aesthetic'
  };

  generateBtn.addEventListener('click', generateImage);
  copyImageBtn.addEventListener('click', copyImage);

  async function generateImage() {
    // Get settings
    const settings = await chrome.storage.sync.get({
      provider: 'gemini',
      geminiApiKey: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llava'
    });

    if (settings.provider === 'gemini' && !settings.geminiApiKey) {
      showError('Gemini API key not set. Please configure in Settings.');
      return;
    }

    const category = categorySelect.value;
    const style = styleSelect.value;

    // Build prompt
    const prompt = buildPrompt(category, style);

    // Show loading
    generateBtn.disabled = true;
    loading.classList.remove('hidden');
    result.classList.add('hidden');
    errorDiv.classList.add('hidden');

    try {
      let imageData;
      if (settings.provider === 'gemini') {
        imageData = await generateWithGemini(settings.geminiApiKey, prompt);
      } else {
        imageData = await generateWithOllama(settings.ollamaUrl, settings.ollamaModel, prompt);
      }

      // Display result
      const imageUrl = `data:image/png;base64,${imageData}`;
      generatedImage.src = imageUrl;

      // Store the full base64 for copying
      generatedImage.dataset.fullBase64 = imageData;

      result.classList.remove('hidden');
    } catch (error) {
      showError(error.message);
    } finally {
      generateBtn.disabled = false;
      loading.classList.add('hidden');
    }
  }

  function buildPrompt(category, style) {
    const categoryPrompt = categoryPrompts[category] || categoryPrompts.nature;
    const stylePrompt = stylePrompts[style] || stylePrompts.photo;

    return `Create an image with "LGTM" text overlay. The background should be: ${categoryPrompt}. Style: ${stylePrompt}. The LGTM text should be clearly visible, elegant, and well-integrated into the design. Make it look natural, not AI-generated. No food imagery. High quality, suitable for code review approval.`;
  }

  async function generateWithGemini(apiKey, prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT']
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();

    // Extract image from response
    const candidates = data.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error('No image generated. Try again or check your API settings.');
  }

  async function generateWithOllama(baseUrl, model, prompt) {
    // For Ollama, we'll use the generate endpoint with image generation
    // Note: Ollama's image generation capabilities depend on the model
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();

    // Ollama text models don't generate images directly
    // For image generation, you'd need a model like stable-diffusion
    // This is a placeholder for when Ollama supports image generation
    if (data.images && data.images.length > 0) {
      return data.images[0];
    }

    throw new Error('Ollama image generation not supported with this model. Please use Gemini or an image-capable model.');
  }

  async function copyImage() {
    const base64 = generatedImage.dataset.fullBase64;
    if (!base64) return;

    try {
      // Convert base64 to blob
      const response = await fetch(`data:image/png;base64,${base64}`);
      const blob = await response.blob();

      // Copy image to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      copyImageBtn.textContent = 'Copied!';
      copyImageBtn.classList.add('copied');

      setTimeout(() => {
        copyImageBtn.textContent = 'Copy Image';
        copyImageBtn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      showError('Failed to copy image to clipboard');
    }
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }
});
