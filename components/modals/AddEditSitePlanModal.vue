<script setup lang="ts">
import ModalHeader from "@/components/modals/helpers/ModalHeader.vue";
import ModalTemplate from "@/components/modals/helpers/ModalTemplate.vue";
import { useModal } from "vue-final-modal";
import type { LandPurpose } from "~/shared/types";
import { landPurposeOptions } from "~/shared/types";
import MeshEditModal from "./MeshEditModal.vue";
import { string } from "three/examples/jsm/nodes/Nodes.js";
import { type Database } from "~/supabase";
import type { Device } from "balena-sdk";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created"): void;
}>();

const props = defineProps<{
  device_uuid: string;
  plan?: Database["public"]["Tables"]["site_plans"]["Row"];
}>();

const landPurpose = ref<LandPurpose>(0);
const surveyPoints = ref<{ x: number; y: number; z: number }[]>([]);
const desiredPoints = ref<{ x: number; y: number; z: number }[]>([]);

const planData = computed(() => {
  if (!props.plan) {
    return undefined;
  }

  const unrefed = props.plan.site_plan_data as any;
  return unrefed;
});

onMounted(() => {
  const value = planData.value;
  if (value) {
    console.log(value);
    landPurpose.value = value.land_purpose;
    surveyPoints.value = value.survey_points;
    desiredPoints.value = value.desired_points;
  }
});

const openMeshEditModal = async () => {
  const { open, close } = useModal({
    component: MeshEditModal,
    attrs: {
      points: surveyPoints.value,
      onClose: async () => {
        await close();
      },
      onSaved: async (value: { x: number; y: number; z: number }[]) => {
        desiredPoints.value = value;
        await close();
      },
    },
  });
  await open();
};

const processStartingGeography = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result) {
        const res = result as unknown as string;
        const lines = res.split("\n");
        surveyPoints.value = [];
        for (const line of lines) {
          const [x, y, z] = line.split(",");
          surveyPoints.value.push({
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z),
          });
          console.log(surveyPoints.value);
        }
      }
    };
    reader.readAsText(file);
  }
};

const processTargetGeography = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result) {
        const res = result as unknown as string;
        const lines = res.split("\n");
        desiredPoints.value = [];
        for (const line of lines) {
          const [x, y, z] = line.split(",");
          desiredPoints.value.push({
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z),
          });
        }
      }
    };
    reader.readAsText(file);
  }
};

const handleSubmit = async (data: any) => {
  const full = {
    ...data,
    survey_points: surveyPoints.value,
    desired_points: desiredPoints.value,
  };

  const supabase = useSupabaseClient<Database>();
  if (!props.plan) {
    const { error: insertError } = await supabase
      .from("site_plans")
      .insert({ device_uuid: props.device_uuid, site_plan_data: full });

    if (insertError) {
      return new Response("Error creating siteplan", { status: 500 });
    }
  } else {
    const { error: updateError } = await supabase
      .from("site_plans")
      .update({ site_plan_data: full })
      .eq("id", props.plan.id);

    if (updateError) {
      return new Response("Error updating siteplan", { status: 500 });
    }
  }

  emit("created");
};

const startingGeography = ref<HTMLInputElement>();
const targetGeography = ref<HTMLInputElement>();
</script>

<template>
  <ModalTemplate @close="emit('close')">
    <ModalHeader
      :title="`${plan ? 'Edit' : 'New'} Site Plan`"
      @close="emit('close')"
    />
    <FormKit
      type="form"
      :submit-label="props.plan ? 'Update' : 'Create'"
      @submit="handleSubmit"
    >
      <FormKit
        type="text"
        label="Name"
        name="name"
        help="Site plan name"
        :value="planData?.name ?? ''"
        validation="required"
      />
      <FormKit
        type="radio"
        label="Land Purpose"
        name="land_purpose"
        help="Select the purpose of the land"
        v-model="landPurpose"
        :options="landPurposeOptions"
      />
      <FormKit
        v-if="landPurpose === 0"
        type="text"
        validation="required|number"
        label="Depth of hole"
        name="hole_depth"
        :value="planData?.hole_depth ?? 0"
      />
      <FormKit
        v-if="landPurpose === 0"
        type="text"
        validation="required|number"
        label="Maximum sequestration level"
        help="Tons of CO2"
        :value="planData?.max_sequestration_level ?? 0"
        name="max_sequestration_level"
      />
      <FormKit
        v-if="landPurpose === 0"
        name="injection_schedule"
        type="repeater"
        label="Injection Schedule"
        draggable="true"
        :value="planData?.injection_schedule ?? []"
        #default="{ index }"
      >
        <FormKit
          type="time"
          name="occurrence_time"
          label="Occurrence time"
          value="23:15"
          help="What time will this event occur?"
        />
        <FormKit
          type="text"
          name="volume"
          validation="required|number"
          label="Desired deposition volume"
        />
      </FormKit>
      <Button
        v-if="landPurpose === 1"
        class="mb-4"
        @click="() => startingGeography!.click()"
        >Upload Starting Geography (.csv)</Button
      >
      <input
        type="file"
        id="startingGeography"
        ref="startingGeography"
        class="hidden"
        accept=".csv"
        @change="processStartingGeography"
      />
      <div v-if="landPurpose === 1" class="w-full flex flex-col gap-4 pb-4">
        <p class="w-full text-center">
          uploaded file grid size: {{ surveyPoints.length }} x
          {{ surveyPoints.length }}
        </p>
        <div class="w-full flex justify-between items-center gap-4">
          <div class="h-2 flex-1 rounded-full bg-gray-800"></div>
          then
          <div class="h-2 flex-1 rounded-full bg-gray-800"></div>
        </div>
      </div>

      <div class="flex w-full justify-between items-center gap-4">
        <div class="flex-1">
          <Button
            v-if="landPurpose === 1"
            :disabled="surveyPoints.length === 0"
            @click="openMeshEditModal"
            class="mb-4"
            >Use Mesh Editor</Button
          >
        </div>
        <div class="flex-1">
          <Button
            v-if="landPurpose === 1"
            :disabled="surveyPoints.length === 0"
            class="mb-4"
            @click="() => targetGeography!.click()"
            >Upload Target Geography (.csv)</Button
          >
          <input
            type="file"
            id="targetGeography"
            class="hidden"
            accept=".csv"
            @change="processTargetGeography"
          />
        </div>
      </div>

      <FormKit
        v-if="landPurpose === 1"
        type="textarea"
        name="geocore"
        :value="planData?.geocore ?? ''"
        label="GEOCore Data"
        validation="required"
      />
    </FormKit>
  </ModalTemplate>
</template>
