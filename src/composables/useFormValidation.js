import { reactive } from 'vue'

export function useFormValidation() {
  const errors = reactive({})

  const validate = (rules) => {
    // Limpiar errores anteriores
    Object.keys(errors).forEach(k => { errors[k] = null })

    let hasError = false

    for (const [field, config] of Object.entries(rules)) {
      const value = config.value
      const label = config.label ?? field

      if (config.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field] = `${label} es requerido`
        hasError = true
        continue
      }

      if (config.onlyNumbers && value && !/^\d+$/.test(value)) {
        errors[field] = `${label} solo debe contener números`
        hasError = true
        continue
      }

      if (config.onlyLetters && value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        errors[field] = `${label} solo debe contener letras`
        hasError = true
        continue
      }

      if (config.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field] = `${label} debe ser un email válido`
        hasError = true
        continue
      }

      if (config.min && value && value.length < config.min) {
        errors[field] = `${label} debe tener al menos ${config.min} caracteres`
        hasError = true
        continue
      }
    }

    return !hasError
  }

  const clearErrors = () => {
    Object.keys(errors).forEach(k => { errors[k] = null })
  }

  return { errors, validate, clearErrors }
}
