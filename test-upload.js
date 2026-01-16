const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function upload() {
  const form = new FormData();
  form.append('title', 'Rapport Audit Qualisoft');
  form.append('category', 'ISO_9001');
  // Assure-toi que ce fichier existe sur ton disque
  form.append('file', fs.createReadStream('./package.json')); 

  try {
    const response = await axios.post('https://elite.qualisoft.sn/documents/upload', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer TA_VARIABLE_TOKEN_ICI`
      },
    });
    console.log('✅ Succès :', response.data);
  } catch (error) {
    console.error('❌ Erreur :', error.response?.data || error.message);
  }
}

upload();