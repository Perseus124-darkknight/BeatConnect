export const chatWithAI = async (config, question, chatContext = [], file = null, signal = null) => {
  const formData = new FormData();
  formData.append('prompt', question);
  formData.append('model', config.model);
  formData.append('stream', config.stream);
  formData.append('context', JSON.stringify(chatContext));
  
  if (file) {
    formData.append('file', file);
  }

  try {
    const fetchOptions = {
      method: 'POST',
      body: formData,
    };
    if (signal) fetchOptions.signal = signal;

    const response = await fetch(config.chatEndpoint, fetchOptions);

    if (!response.ok) {
        let msg = 'Error fetching from server';
        try {
            const errBody = await response.json();
            msg = errBody.error || msg;
        } catch(e) {}
        throw new Error(msg);
    }

    if (config.stream) {
      if (!response.body) throw new Error('No response body returned from streaming endpoint');
      return response.body.getReader();
    } else {
      return await response.json();
    }
  } catch (e) {
    console.error('Error fetching from server:', e);
    return e;
  }
}
