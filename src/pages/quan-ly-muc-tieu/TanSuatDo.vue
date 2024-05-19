<script setup>
/* Build In VueJS */
import { onMounted, ref } from "vue";

/* Quasar */
import { useI18n } from "vue-i18n";

/* Pinia Store */
import { useSettingStore } from "@/stores/extra/SettingStore.js";
import { useTanSuatDo } from "@/stores/quan-ly-muc-tieu/TanSuatDoStore";

/* Third Library */
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const storeSetting = useSettingStore();
const storeTanSuatDo = useTanSuatDo();

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

  await storeTanSuatDo.getInit();
});
</script>

<template>
  <div class="q-pa-lg flex flex-center" style="height: 90vh">
    <q-card
      class="my-card q-pa-lg"
      style="width: 50%; height: 90%; border-radius: 12px; margin-bottom: 20%"
    >
      <q-card-section>
        <div class="text-h5 text-bold q-mb-lg">
          {{ t("frequencyTitle") }}
        </div>
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
            @click="storeTanSuatDo.dialogAddFrequency = true"
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
              v-for="(item, index) in storeTanSuatDo.listFrequency"
              :key="index"
              class="card-item full-width q-py-sm q-pb-md q-pl-md flex"
              @dblclick="
                storeTanSuatDo.dialogUpdateFrequency = true;
                storeTanSuatDo.objectUpdateFormula = Object.assign({}, item);
              "
            >
              <div style="width: 90%">
                <b class="text-uppercase"> {{ item.name }}</b>
                <br />
                <span class="text-subtitle1">{{ item.description }}</span>
              </div>
              <div class="flex flex-center z-max" style="width: 10%">
                <q-icon
                  @click="storeTanSuatDo.deleteFrequency(item)"
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

  <!-- Dialog add -->
  <q-dialog v-model="storeTanSuatDo.dialogAddFrequency" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-form
          @submit="storeTanSuatDo.addFrequency(storeTanSuatDo.objectAddFormula)"
          class="q-gutter-md"
          style="min-width: 500px"
        >
          <div>
            <span class="text-h5 text-bold q-py-md">{{
              $t("frequencyAddBoxTitle")
            }}</span>
            <q-input
              outlined
              autofocus
              v-model="storeTanSuatDo.objectAddFormula.name"
              type="text"
              :label="$t('frequencyAddInputName')"
              class="full-width q-py-md"
              :rules="[(val) => !!val || t('funcInputWarningFillData')]"
            />

            <q-input
              outlined
              autofocus
              v-model="storeTanSuatDo.objectAddFormula.desc"
              type="text"
              :label="$t('frequencyDescInputName')"
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

  <!-- Dialog update -->
  <q-dialog v-model="storeTanSuatDo.dialogUpdateFrequency" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-form
          @submit="
            storeTanSuatDo.updateFormulaType(storeTanSuatDo.objectUpdateFormula)
          "
          class="q-gutter-md"
          style="min-width: 500px"
        >
          <div>
            <span class="text-h5 text-bold q-py-md">{{
              $t("frequencyUpdateBoxTitle")
            }}</span>
            <q-input
              outlined
              autofocus
              v-model="storeTanSuatDo.objectUpdateFormula.name"
              type="text"
              :label="$t('frequencyAddInputName')"
              class="full-width q-py-md"
              :rules="[(val) => !!val || t('funcInputWarningFillData')]"
            />

            <q-input
              outlined
              autofocus
              v-model="storeTanSuatDo.objectUpdateFormula.description"
              type="text"
              :label="$t('frequencyDescInputName')"
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
