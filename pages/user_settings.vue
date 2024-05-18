<script setup lang="ts">
import type { Database } from "@/supabase";
import type { Factor } from "@supabase/gotrue-js";

export interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo: string;
}

enum TwoFactorEnrollmentStep {
  ENROLL,
  PRESENT_QR,
  VERIFIED,
}

const user = useSupabaseUser();

const email = ref("");
const first_name = ref("");
const last_name = ref("");
const twoFactors = ref<Factor | undefined>(undefined);
const twoFactorEnrollmentStep = ref(TwoFactorEnrollmentStep.ENROLL);
const twoFactorQR = ref("");
const twoFactorSecret = ref("");
const twoFactorID = ref("");
const loading = ref(true);

const supabase = useSupabaseClient<Database>();

watch(
  user,
  async (newUser) => {
    if (newUser) {
      email.value = newUser.email ?? "";
    }
  },
  { immediate: true }
);

onNuxtReady(async () => {
  loading.value = true;
  await Promise.allSettled([fetchFactors(), fetchProfileData()]);
  loading.value = false;
});

const fetchProfileData = async () => {
  const { $toast } = useNuxtApp();

  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.value!.id)
    .returns<ProfileRow[]>();

  if (error) {
    return $toast.error(error.message);
  }

  if (data.length !== 0) {
    first_name.value = data[0].first_name;
    last_name.value = data[0].last_name;
  }
};

const fetchFactors = async () => {
  const { $toast } = useNuxtApp();

  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) {
    return $toast.error(error.message);
  }
  if (data.all.length > 0) {
    twoFactors.value = data.all[0];
    if (twoFactors.value?.status === "verified") {
      twoFactorEnrollmentStep.value = TwoFactorEnrollmentStep.VERIFIED;
    } else {
      if (twoFactors.value?.status === "unverified") {
        await supabase.auth.mfa.unenroll({
          factorId: twoFactors.value.id,
        });
      }
      twoFactorEnrollmentStep.value = TwoFactorEnrollmentStep.ENROLL;
    }
  }
};

const saveProfileData = async (data: ProfileRow, node: FormKitNode) => {
  const { $toast } = useNuxtApp();

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.value!.id,
      first_name: first_name.value,
      last_name: last_name.value,
    })
    .returns<ProfileRow>()
    .select();

  if (error) {
    node.setErrors([error.message]);
  }

  node.setErrors([]);
  $toast.success("Profile updated.");
};

const processChangePassword = async (
  data: { new_password: string },
  node: FormKitNode
) => {
  const { $toast } = useNuxtApp();

  const { error } = await supabase.auth.updateUser({
    password: data.new_password,
  });

  if (error) {
    return node.setErrors([error.message]);
  }

  node.setErrors([]);
  $toast.success("Password changed.");
};

const enableTwoFactor = async (formData: { factor_name: string }) => {
  const { $toast } = useNuxtApp();

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: formData.factor_name,
  });

  if (error) {
    return $toast.error(error.message);
  }

  if (data) {
    twoFactorQR.value = data.totp.qr_code;
    twoFactorSecret.value = data.totp.secret;
    twoFactorEnrollmentStep.value = TwoFactorEnrollmentStep.PRESENT_QR;
    twoFactorID.value = data.id;
  }
};

const verifyTwoFactor = async (
  formData: { verify_code: string },
  node: FormKitNode
) => {
  const { $toast } = useNuxtApp();

  const { data, error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: twoFactorID.value,
    code: formData.verify_code,
  });

  if (error) {
    return node.setErrors([error.message]);
  }

  if (data) {
    twoFactorEnrollmentStep.value = TwoFactorEnrollmentStep.VERIFIED;
  }

  await fetchFactors();
  node.setErrors([]);
  $toast.success("2FA enabled.");
};

const disableTwoFactor = async () => {
  const { $toast } = useNuxtApp();

  const { error } = await supabase.auth.mfa.unenroll({
    factorId: twoFactors.value?.id ?? "",
  });

  if (error) {
    return $toast.error(error.message);
  }

  twoFactorEnrollmentStep.value = TwoFactorEnrollmentStep.ENROLL;
  await fetchFactors();
  $toast.warning("2FA disabled.");
};
</script>

<template>
  <div class="flex flex-col w-full gap-4">
    <PageTitle>User Settings</PageTitle>
    <div v-if="!loading" class="columns-1 md:columns-2 gap-4 w-full">
      <!-- Name -->
      <Card>
        <SectionTitle>Profile</SectionTitle>
        <FormKit type="form" submit-label="Save" @submit="saveProfileData">
          <FormKit
            v-model="last_name"
            type="text"
            name="first_name"
            label="First Name"
          />
          <FormKit
            v-model="first_name"
            type="text"
            name="last_name"
            label="Last Name"
          />
          <FormKit v-model="email" type="email" name="email" label="Email" />
        </FormKit>
      </Card>
      <Card>
        <SectionTitle>Change Password</SectionTitle>
        <FormKit
          type="form"
          submit-label="Save"
          @submit="processChangePassword"
        >
          <FormKit
            type="password"
            name="new_password"
            label="New Password"
            validation="required|length:10|contains_symbol|contains_number|contains_uppercase|contains_lowercase"
          />
          <FormKit
            type="password"
            name="new_password_confirm"
            label="Confirm Password"
            validation="required|confirm"
          />
        </FormKit>
      </Card>
      <Card>
        <SectionTitle>Two Factor Authentication</SectionTitle>
        <div class="flex flex-col gap-2">
          <FormKit
            v-if="twoFactorEnrollmentStep === TwoFactorEnrollmentStep.ENROLL"
            type="form"
            submit-label="Enable 2FA"
            @submit="enableTwoFactor"
          >
            <FormKit
              type="text"
              name="factor_name"
              label="Label"
              help="Enter the name of the authenticator app"
            />
          </FormKit>
          <FormKit
            v-if="
              twoFactorEnrollmentStep === TwoFactorEnrollmentStep.PRESENT_QR
            "
            type="form"
            submit-label="Next"
            @submit="verifyTwoFactor"
          >
            <div class="flex w-full flex-col justify-center mb-4">
              <span class="text-md w-full text-left">TOTP QR Code</span>
              <img :src="twoFactorQR" alt="QR Code" class="w-32 h-32" />
            </div>
            <div class="flex flex-col justify-start mb-4">
              <span class="text-md">TOTP Secret</span>
              <span>{{ twoFactorSecret }}</span>
            </div>
            <FormKit
              type="number"
              validation="required|length:6,6"
              name="verify_code"
              label="Verification Code"
              help="Enter the number generated from your authenticator app"
            />
          </FormKit>
          <div
            v-if="twoFactorEnrollmentStep === TwoFactorEnrollmentStep.VERIFIED"
            class="flex justify-between items-center w-full pb-4"
          >
            <span class="text-md font-semibold">Enabled</span>
            <Button :destructive="true" @click="disableTwoFactor"
              >Disable</Button
            >
          </div>
        </div>
      </Card>
    </div>
    <div v-else class="w-full flex justify-center mt-8">
      <LoadingSpinner />
    </div>
  </div>
</template>
~/supabase
