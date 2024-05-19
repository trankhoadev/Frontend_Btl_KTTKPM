<script setup>
/* Build In VueJs */
import { onMounted, ref } from "vue";

/* Pinia Store */
import { useSettingStore } from "@/stores/extra/SettingStore.js";
import { useLoaiMucTieuStore } from "@/stores/quan-ly-muc-tieu/LoaiMucTieuStore";

/* Quasar */
import { useI18n } from "vue-i18n";

/* Third Library */
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const storeSetting = useSettingStore();
const storeLoaiMucTieu = useLoaiMucTieuStore();

/* for scrollbar */
const firstRef = ref(null);
const thumbStyle = {
  right: "4px",
  borderRadius: "7px",
  backgroundColor: "#027be3",
  width: "4px",
  opacity: 0.75,
};

const barStyle = {
  right: "2px",
  borderRadius: "9px",
  backgroundColor: "#027be3",
  width: "8px",
  opacity: 0.2,
};

onMounted(async () => {
  /* config href */
  storeSetting.routerHref = router.currentRoute._rawValue.href;

  await storeLoaiMucTieu.getInit();
});
</script>

<template>
  <div class="q-pa-lg flex flex-center" style="height: 90vh">
    <q-card
      class="my-card q-pa-lg"
      style="width: 50%; height: 90%; border-radius: 12px; margin-bottom: 20%"
    >
      <q-card-section>
        <div class="text-h5 text-bold q-mb-lg">{{ t("targetTitle") }}</div>
      </q-card-section>

      <q-card-section
        style="border: 3px solid #f3f3f3; border-radius: 8px; height: 90%"
      >
        <div class="btn-wrap full-width flex flex-center q-py-md">
          <q-btn
            icon="add"
            :label="t('funcAdd')"
            style="width: 100%; font-size: 1.4em"
            class="q-py-sm text-capitalize bg_defaultColor text-bold"
            @click="storeLoaiMucTieu.dialogAddTargetType = true"
          />
        </div>

        <q-scroll-area
          visible
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
          style="height: 87%"
          class="col q-pr-md"
          ref="firstRef"
        >
          <div>
            <div
              v-for="(item, index) in storeLoaiMucTieu.listTargetType"
              :key="index"
              class="card-item full-width q-py-sm q-pb-md q-pl-md flex"
              @dblclick="
                storeLoaiMucTieu.dialogUpdateTargetType = true;
                storeLoaiMucTieu.objectUpdateTarget = Object.assign({}, item);
              "
            >
              <div style="width: 90%; font-weight: 600">
                {{ item.name }}
              </div>
              <div class="flex flex-center z-max" style="width: 10%">
                <q-icon
                  @click="storeLoaiMucTieu.deleteTargetType(item)"
                  class="close-hover"
                  name="close"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </q-scroll-area>
      </q-card-section>
    </q-card>
  </div>

  <!-- Dialog add target type -->
  <q-dialog v-model="storeLoaiMucTieu.dialogAddTargetType" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-form
          @submit="
            storeLoaiMucTieu.addTargetType(storeLoaiMucTieu.objectAddTarget)
          "
          class="q-gutter-md"
          style="min-width: 500px"
        >
          <div>
            <span class="text-h5 text-bold q-py-md">{{
              $t("targetAddBoxTitle")
            }}</span>
            <q-input
              outlined
              autofocus
              v-model="storeLoaiMucTieu.objectAddTarget.name"
              type="text"
              :label="$t('targetAddInputName')"
              class="full-width q-py-md"
              :rules="[(val) => !!val || t('funcInputWarningFillData')]"
            />
          </div>

          <div class="flex justify-end">
            <q-btn
              flat
              :label="t('funcCancel')"
              color="primary"
              v-close-popup
            />
            <q-btn
              type="submit"
              :label="t('funcAdd')"
              class="bg_defaultColor"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Dialog update target type -->
  <q-dialog v-model="storeLoaiMucTieu.dialogUpdateTargetType" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-form
          @submit="
            storeLoaiMucTieu.updateTargetType(storeLoaiMucTieu.objectUpdateTarget)
          "
          class="q-gutter-md"
          style="min-width: 500px"
        >
          <div>
            <span class="text-h5 text-bold q-py-md">{{
              $t("targetUpdateBoxTitle")
            }}</span>
            <q-input
              outlined
              autofocus
              v-model="storeLoaiMucTieu.objectUpdateTarget.name"
              type="text"
              :label="$t('targetAddInputName')"
              class="full-width q-py-md"
              :rules="[(val) => !!val || t('funcInputWarningFillData')]"
            />
          </div>

          <div class="flex justify-end">
            <q-btn
              flat
              :label="t('funcCancel')"
              color="primary"
              v-close-popup
            />
            <q-btn
              type="submit"
              :label="t('funcUpdate')"
              class="bg_defaultColor"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.card-item {
  border-bottom: 2px solid #f5f5f5;
  cursor: pointer;
  &:hover {
    background-color: #fafafa;
    border-radius: 15px;
    transition: all ease 0.2s;
  }
}

.close-hover {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  &:hover {
    background-color: #e2e2e2;
    transition: all ease 0.3s;
  }
}
</style>
