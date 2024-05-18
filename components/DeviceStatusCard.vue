<template>
  <div class="flex flex-col w-full gap-4" v-if="!pending && services">
    <div class="flex w-full justify-between items-center">
      <SubSectionTitle>Status</SubSectionTitle>
      <span>{{ device.status }}</span>
    </div>

    <div class="flex w-full justify-between items-center">
      <SubSectionTitle>RWIS version:</SubSectionTitle>
      <span>{{
        // @ts-ignore
        device.is_running__release.__id
      }}</span>
    </div>

    <div class="flex w-full justify-between items-center gap-4">
      <SubSectionTitle class="flex-1">Remote Access</SubSectionTitle>
      <span>{{ device.is_web_accessible ? "Enabled" : "Disabled" }}</span>
      <Button
        @click="
          navigateTo(`https://${device.uuid}.balena-devices.com`, {
            external: true,
          })
        "
        v-if="device.is_web_accessible"
        >Open Remote HMI</Button
      >
    </div>

    <div class="h-96 w-full mb-12">
      <SubSectionTitle>Location</SubSectionTitle>
      <LMap
        ref="map"
        :zoom="zoom"
        :center="[
          parseFloat(device.latitude ?? '0'),
          parseFloat(device.longitude ?? '0'),
        ]"
      >
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          layer-type="base"
          name="OpenStreetMap"
        />
        <LMarker
          :lat-lng="[
            parseFloat(device.latitude ?? '0'),
            parseFloat(device.longitude ?? '0'),
          ]"
        ></LMarker>
      </LMap>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CurrentService, Device } from "balena-sdk";
const zoom = ref(13);

const props = defineProps<{
  device: Device;
}>();

type ServiceResp = {
  [serviceName: string]: CurrentService[];
};

const { pending, data: services } = await useLazyFetch<ServiceResp>(
  `/api/devices/${props.device.uuid}/service_status`
);
</script>
