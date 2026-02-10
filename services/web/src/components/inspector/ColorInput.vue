<template>
  <div class="color-input-wrapper flex items-center gap-2">
    <input
      type="color"
      :value="validatedValue"
      @input="handleColorPicker"
      class="color-picker w-8 h-8 rounded cursor-pointer border-0 p-0"
    />
    <input
      type="text"
      :value="displayValue"
      @input="handleTextInput"
      @blur="validateOnBlur"
      :class="['hex-input text-sm flex-1 px-2 py-1 rounded border bg-studio-bg-primary text-studio-text-primary', 
               isValid ? 'border-studio-border' : 'border-red-500']"
      placeholder="#000000"
    />
  </div>
</template>

<script>
const HEX_REGEX = /^#[0-9A-F]{6}$/i;

export default {
  name: 'ColorInput',
  props: {
    value: { type: String, default: '#000000' }
  },
  data() {
    return {
      displayValue: this.value || '#000000',
      isValid: true
    };
  },
  computed: {
    validatedValue() {
      // Ensure the color picker always gets a valid 6-digit hex
      if (HEX_REGEX.test(this.displayValue)) {
        return this.displayValue.toLowerCase();
      }
      // Default fallback
      return '#000000';
    }
  },
  watch: {
    value(newVal) {
      if (newVal && newVal !== this.displayValue) {
        this.displayValue = newVal;
        this.isValid = HEX_REGEX.test(newVal);
      }
    }
  },
  methods: {
    handleColorPicker(event) {
      const value = event.target.value;
      this.displayValue = value;
      this.isValid = true;
      this.$emit('input', value);
      this.$emit('change', value);
    },
    handleTextInput(event) {
      let value = event.target.value;
      
      // Auto-add # if missing and user types hex chars
      if (value && !value.startsWith('#') && /^[0-9A-F]/i.test(value)) {
        value = '#' + value;
      }
      
      this.displayValue = value;
      
      // Only emit if valid
      if (HEX_REGEX.test(value)) {
        this.isValid = true;
        this.$emit('input', value.toLowerCase());
        this.$emit('change', value.toLowerCase());
      } else {
        this.isValid = false;
      }
    },
    validateOnBlur() {
      if (!HEX_REGEX.test(this.displayValue)) {
        // Reset to last valid value or default
        this.displayValue = this.value || '#000000';
        this.isValid = true;
      }
    }
  }
};
</script>

<style scoped>
.color-picker {
  overflow: hidden;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.hex-input {
  font-family: monospace;
  text-transform: uppercase;
}

.hex-input:focus {
  outline: none;
  border-color: var(--studio-accent, #3b82f6);
}

.hex-input.border-red-500 {
  border-color: #ef4444;
}
</style>
