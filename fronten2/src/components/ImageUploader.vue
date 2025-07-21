<template>
  <div class="image-uploader">
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'uploading': uploading }"
      @drop="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div v-if="!uploading && !previewUrl" class="upload-content">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <p class="upload-text">
          Arrastra una imagen aquí o <span class="upload-link">haz clic para seleccionar</span>
        </p>
        <p class="upload-hint">PNG, JPG, GIF hasta 5MB</p>
      </div>
      
      <div v-if="uploading" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="progress-text">Subiendo... {{ uploadProgress }}%</p>
      </div>
      
      <div v-if="previewUrl && !uploading" class="image-preview">
        <img :src="getImageUrl(previewUrl)" :alt="fileName" class="preview-image" />
        <div class="image-overlay">
          <button @click.stop="removeImage" class="remove-btn" title="Eliminar imagen">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
          <button @click.stop="triggerFileInput" class="change-btn" title="Cambiar imagen">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useImageUpload } from '@/composables/useImageUpload'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  storageKey: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'uploaded', 'error'])

const { uploading, uploadProgress, handleImageUpload } = useImageUpload()

const fileInput = ref(null)
const isDragOver = ref(false)
const previewUrl = ref(props.modelValue)
const fileName = ref('')
const error = ref('')

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  previewUrl.value = newValue
})

const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (url.startsWith('/uploads/')) return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`
  return url
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const processFile = async (file) => {
  try {
    error.value = ''
    
    // Validar archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('Solo se permiten archivos de imagen')
    }
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('El archivo es demasiado grande. Máximo 5MB')
    }
    
    fileName.value = file.name
    
    // Subir archivo directamente
    const result = await handleImageUpload(file, props.storageKey)
    
    // Actualizar con la URL del servidor
    previewUrl.value = result.url
    
    // Emitir eventos
    emit('update:modelValue', result.url)
    emit('uploaded', result)
    
  } catch (err) {
    error.value = err.message
    emit('error', err.message)
    previewUrl.value = ''
    fileName.value = ''
  }
}

const removeImage = () => {
  previewUrl.value = ''
  fileName.value = ''
  error.value = ''
  emit('update:modelValue', '')
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9fafb;
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #dbeafe;
}

.upload-area.uploading {
  cursor: not-allowed;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: #6b7280;
}

.upload-text {
  font-size: 1rem;
  color: #374151;
  margin: 0;
}

.upload-link {
  color: #3b82f6;
  font-weight: 500;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.upload-progress {
  width: 100%;
  max-width: 300px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #374151;
  margin: 0;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 6px;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.remove-btn,
.change-btn {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.change-btn:hover {
  background-color: #dbeafe;
  color: #3b82f6;
}

.remove-btn svg,
.change-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.error-message {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 0.875rem;
}

.hidden {
  display: none;
}
</style>
