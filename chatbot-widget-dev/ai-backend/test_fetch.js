import fetch, { FormData } from 'node-fetch';

const formData = new FormData();
formData.append('prompt', 'Who are the beatles?');
formData.append('stream', 'true');
formData.append('model', 'llama3.2');

fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  body: formData
}).then(async (res) => {
  console.log("STATUS:", res.status);
  const text = await res.text();
  console.log("RESPONSE:", text.substring(0, 100));
}).catch(console.error);
