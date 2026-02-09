<template>
  <v-text
    :config="textConfig"
    @click="$emit('click', $event)"
    @dragend="$emit('dragend', $event)"
    @transformend="$emit('transformend', $event)"
  />
</template>

<script>
export default {
  name: 'StageText',
  
  props: {
    element: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      required: true
    }
  },
  
  computed: {
    textConfig() {
      return {
        ...this.config,
        text: this.element.content || 'Text',
        fontSize: (this.element.style?.size || 48) * (this.config.scaleX || 1) * 0.5,
        fill: this.element.style?.color || '#ffffff',
        fontFamily: this.element.style?.font || 'sans-serif',
        align: 'center',
        verticalAlign: 'middle',
        // Reset scale since we applied it to fontSize
        scaleX: 1,
        scaleY: 1
      };
    }
  }
};
</script>
