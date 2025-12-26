document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  const providerRadios = document.querySelectorAll('input[name="provider"]');
  const geminiSettings = document.querySelector('.gemini-settings');
  const ollamaSettings = document.querySelector('.ollama-settings');
  const geminiApiKey = document.getElementById('geminiApiKey');
  const ollamaUrl = document.getElementById('ollamaUrl');
  const ollamaModel = document.getElementById('ollamaModel');
  const imgurClientId = document.getElementById('imgurClientId');
  const testBtn = document.getElementById('testBtn');
  const status = document.getElementById('status');

  // Load saved settings
  loadSettings();

  // Provider toggle
  providerRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      updateProviderUI(radio.value);
    });
  });

  // Save settings
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveSettings();
  });

  // Test connection
  testBtn.addEventListener('click', testConnection);

  async function loadSettings() {
    const settings = await chrome.storage.sync.get({
      provider: 'gemini',
      geminiApiKey: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llava',
      imgurClientId: ''
    });

    // Set provider
    const providerRadio = document.querySelector(`input[name="provider"][value="${settings.provider}"]`);
    if (providerRadio) {
      providerRadio.checked = true;
      updateProviderUI(settings.provider);
    }

    // Set values
    geminiApiKey.value = settings.geminiApiKey;
    ollamaUrl.value = settings.ollamaUrl;
    ollamaModel.value = settings.ollamaModel;
    imgurClientId.value = settings.imgurClientId;
  }

  function updateProviderUI(provider) {
    if (provider === 'gemini') {
      geminiSettings.classList.remove('hidden');
      ollamaSettings.classList.add('hidden');
    } else {
      geminiSettings.classList.add('hidden');
      ollamaSettings.classList.remove('hidden');
    }
  }

  async function saveSettings() {
    const provider = document.querySelector('input[name="provider"]:checked').value;

    await chrome.storage.sync.set({
      provider,
      geminiApiKey: geminiApiKey.value,
      ollamaUrl: ollamaUrl.value,
      ollamaModel: ollamaModel.value,
      imgurClientId: imgurClientId.value
    });

    showStatus('Settings saved successfully!', 'success');
  }

  async function testConnection() {
    const provider = document.querySelector('input[name="provider"]:checked').value;

    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';

    try {
      if (provider === 'gemini') {
        await testGemini();
      } else {
        await testOllama();
      }
      showStatus('Connection successful!', 'success');
    } catch (error) {
      showStatus(`Connection failed: ${error.message}`, 'error');
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Test Connection';
    }
  }

  async function testGemini() {
    const apiKey = geminiApiKey.value;
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Invalid API key');
    }
  }

  async function testOllama() {
    const url = ollamaUrl.value;
    if (!url) {
      throw new Error('Server URL is required');
    }

    const response = await fetch(`${url}/api/tags`);

    if (!response.ok) {
      throw new Error('Cannot connect to Ollama server');
    }

    const data = await response.json();
    const model = ollamaModel.value;

    if (model) {
      const hasModel = data.models?.some(m => m.name.startsWith(model));
      if (!hasModel) {
        throw new Error(`Model "${model}" not found. Available models: ${data.models?.map(m => m.name).join(', ') || 'none'}`);
      }
    }
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.classList.remove('hidden');

    setTimeout(() => {
      status.classList.add('hidden');
    }, 3000);
  }
});
