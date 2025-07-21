import { ref } from "vue"
import api from "@/services/api"

export function useImageUpload() {
  const uploading = ref(false)
  const uploadProgress = ref(0)

  const handleImageUpload = async (file, storageKey = null) => {
    try {
      uploading.value = true
      uploadProgress.value = 0

      const formData = new FormData()
      formData.append("image", file)

      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          uploadProgress.value = progress
        },
      })

      if (response.data.success) {
        const result = response.data.data

        // Guardar en localStorage si se proporciona una clave
        if (storageKey) {
          saveImageToLocalStorage(storageKey, {
            url: result.url,
            filename: result.filename,
            originalName: result.originalName,
            size: result.size,
            uploadedAt: new Date().toISOString(),
          })
        }

        return result
      } else {
        throw new Error(response.data.message || "Error al subir la imagen")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    } finally {
      uploading.value = false
      uploadProgress.value = 0
    }
  }

  const saveImageToLocalStorage = (key, imageData) => {
    try {
      const existingImages = getImagesFromLocalStorage()
      existingImages[key] = imageData
      localStorage.setItem("uploadedImages", JSON.stringify(existingImages))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  const getImageFromLocalStorage = (key) => {
    try {
      const images = getImagesFromLocalStorage()
      return images[key] || null
    } catch (error) {
      console.error("Error getting from localStorage:", error)
      return null
    }
  }

  const getImagesFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("uploadedImages")
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("Error parsing localStorage:", error)
      return {}
    }
  }

  const removeImageFromLocalStorage = (key) => {
    try {
      const images = getImagesFromLocalStorage()
      delete images[key]
      localStorage.setItem("uploadedImages", JSON.stringify(images))
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
  }

  const clearLocalStorageImages = () => {
    try {
      localStorage.removeItem("uploadedImages")
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }

  return {
    uploading,
    uploadProgress,
    handleImageUpload,
    saveImageToLocalStorage,
    getImageFromLocalStorage,
    getImagesFromLocalStorage,
    removeImageFromLocalStorage,
    clearLocalStorageImages,
  }
}
