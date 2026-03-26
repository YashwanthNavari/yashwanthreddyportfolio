document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const statusMessage = document.getElementById('statusMessage');

    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }

    async function handleUpload(event) {
        event.preventDefault();

        // Reset status
        showStatus('Uploading...', 'info');

        const formData = new FormData(uploadForm);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showStatus(result.message, 'success');
                uploadForm.reset();
            } else {
                throw new Error(result.message || 'Upload failed');
            }

        } catch (error) {
            console.error('Upload Error:', error);
            showStatus(error.message, 'error');
        }
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.classList.remove('hidden', 'bg-blue-100', 'text-blue-700', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');

        if (type === 'success') {
            statusMessage.classList.add('bg-green-100', 'text-green-700');
        } else if (type === 'error') {
            statusMessage.classList.add('bg-red-100', 'text-red-700');
        } else {
            statusMessage.classList.add('bg-blue-100', 'text-blue-700');
        }

        statusMessage.classList.remove('hidden');

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.classList.add('hidden');
            }, 5000);
        }
    }
});
