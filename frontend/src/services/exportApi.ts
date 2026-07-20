import axios from 'axios';

export async function exportEntity(entity: string, format: 'csv' | 'json' = 'csv') {
  const token = localStorage.getItem('mtn_token');
  const response = await axios.get(`/api/v1/exports/${entity}`, {
    params: { format },
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `export-${entity}-${Date.now()}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
