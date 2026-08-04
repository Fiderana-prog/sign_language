const API_BASE_URL = (
  import.meta.env.VITE_API_URL
  || 'http://localhost:8000'
).replace(/\/$/, '');

async function parseResponse(response) {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail = payload?.detail;

    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(', ')
      : detail || `Erreur serveur (${response.status})`;

    throw new Error(message);
  }

  return payload;
}

export async function checkAslApi(signal) {
  const response = await fetch(
    `${API_BASE_URL}/api/health`,
    { signal },
  );

  return parseResponse(response);
}

export async function predictAslFile(
  file,
  modelType = 'words',
) {
  if (!file) {
    throw new Error('Aucun fichier sélectionné.');
  }

  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  if (modelType === 'alphabet' && !isImage) {
    throw new Error(
      "Le modèle Alphabet attend une image ou une photo.",
    );
  }

  if (
    modelType === 'words'
    && !isVideo
    && !isImage
  ) {
    throw new Error(
      'Le fichier doit être une image ou une vidéo.',
    );
  }

  let endpoint = '/api/predict/alphabet';

  if (modelType === 'words') {
    endpoint = isVideo
      ? '/api/predict/video'
      : '/api/predict/image';
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: 'POST',
      body: formData,
    },
  );

  return parseResponse(response);
}

export { API_BASE_URL };
