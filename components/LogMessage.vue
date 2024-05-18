<template>
  <div v-if="spans && message.CONTAINER_NAME">
    <span class="mr-2 text-blue-300">{{
      message.CONTAINER_NAME.split("_")[0]
    }}</span>
    <span v-for="span of spans" :style="span.css" class="inline">{{
      span.text
    }}</span>
  </div>
</template>

<script setup lang="ts">
//@ts-expect-error
import { parse } from "ansicolor";

const props = defineProps<{
  message: any;
}>();

const spans = ref<any[]>([]);
try {
  spans.value = parse(props.message.MESSAGE);
} catch (e) {
  console.error(e, props.message.MESSAGE);
}
</script>
