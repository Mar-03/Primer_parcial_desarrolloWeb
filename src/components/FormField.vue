<template>
  <label class="field">
    <span>{{ label }}</span>
    <input
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :aria-invalid="Boolean(error)"
    />
    <small v-if="error" class="field-error">{{ error }}</small>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>
