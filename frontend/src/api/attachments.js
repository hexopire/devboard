import { apiFetch, API_BASE_URL } from './client';

// Plain JSON GET — apiFetch works fine here, same as every other list call.
function listAttachments(token, taskId) {
  return apiFetch(`/tasks/${taskId}/attachments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// NOT built on apiFetch. apiFetch always sets Content-Type: application/json
// (client.js) — sending a multipart body through it would be wrong on two
// counts: the header would lie about the body format, and more importantly
// you CANNOT set the multipart boundary parameter by hand, the
// browser/XHR generates one and must be the thing setting this header.
// Using XMLHttpRequest (not fetch) specifically because it exposes
// xhr.upload.onprogress — fetch has no equivalent for tracking bytes sent
// as a request body streams out, which is the actual reason to reach for
// XHR here instead of just using fetch with FormData.
function uploadAttachment(token, taskId, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/tasks/${taskId}/attachments`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let body;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error('Unexpected response from server'));
        return;
      }
      if (!body.success) {
        reject(new Error(body.error || 'Upload failed'));
        return;
      }
      resolve(body.data);
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));

    const formData = new FormData();
    // 'file' must match upload.single('file') on the backend
    // (middleware/upload.js) — multer reads this exact field name out of
    // the multipart body to know which part is the file.
    formData.append('file', file);
    xhr.send(formData);
  });
}

// The download route is membership-gated (Task 10.2) — it needs the same
// Authorization header as everything else, which a plain <a href> can't
// attach on its own. Fetching as a blob and triggering a synthetic click
// is what lets an authenticated download still feel like clicking a link.
async function downloadAttachment(token, attachmentId, filename) {
  const response = await fetch(`${API_BASE_URL}/attachments/${attachmentId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Download failed');
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  // Revoke once the browser's had a moment to start the download — holding
  // the object URL open longer than that just leaks memory.
  URL.revokeObjectURL(objectUrl);
}

export { listAttachments, uploadAttachment, downloadAttachment };
