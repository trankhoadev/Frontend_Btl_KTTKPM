<script setup>
/* Build in VueJs */
import { onBeforeMount, onMounted, ref, watch } from "vue";

/* Pinia Store */
import { useTargetDetailStore } from "@/stores/quan-ly-muc-tieu/DieuChinhMucTieu";
import { useUtilStore } from "@/stores/dataStore";
import { useSettingStore } from "@/stores/extra/SettingStore.js";

/* Component */
import BlankComponent from "src/components/base/BlankComponent.vue";
import PageNotFound from "@/pages/ErrorNotFound.vue";

/* Third Library */
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();

const storeUtil = useUtilStore();
const storeSetting = useSettingStore();

let splitterModel = ref(25);
const targetDetailStore = useTargetDetailStore();
var fab2 = ref(false);
var hideLabels = ref(false);
const noData = ref(false);

onMounted(async () => {
  /* config href */
  let arr = router.currentRoute._rawValue.href.split("/");

  storeSetting.routerHref =
    arr.length === 3
      ? router.currentRoute._rawValue.href
      : `/${arr[1]}/${arr[2]}`;

  await storeUtil.getAllTargetData();
  await storeUtil.getAllFormula();
  await storeUtil.getAllFrequency();
  await storeUtil.getAllTargetType();

  // console.log(JSON.stringify(storeUtil.targetData, null, 2));

  /* Assign Variable */
  targetDetailStore.frequencyData = storeUtil.frequencyData;
  targetDetailStore.formulaData = storeUtil.formulaData;
  targetDetailStore.targetTypeData = storeUtil.targetTypeData;

  if (router.currentRoute._value.params.id) {
    await storeUtil.getOneTargetById(router.currentRoute._value.params.id);

    targetDetailStore.oneTargetData = storeUtil.oneTargetData;

    /* handle situation that the url id not correct will appear blank project */
    if (targetDetailStore.oneTargetData._id) {
      targetDetailStore.isShowFormAddNewTarget = false;
      targetDetailStore.noDataSelectTree = false;
      targetDetailStore.targetSelected = targetDetailStore.oneTargetData._id;
    } else {
      targetDetailStore.isShowFormAddNewTarget = false;
      targetDetailStore.noDataSelectTree = true;
    }
  }
});

watch(
  () => targetDetailStore.targetSelected,
  async (val, oldVal) => {
    // router.replace(`/target/list/${val}`);

    if (val) {
      await storeUtil.getOneTargetById(val);
      targetDetailStore.oneTargetData = storeUtil.oneTargetData;

      targetDetailStore.isShowFormAddNewTarget = false;
      targetDetailStore.noDataSelectTree = false;
    } else {
      await storeUtil.getOneTargetById(oldVal);
      targetDetailStore.oneTargetData = storeUtil.oneTargetData;

      /* make sure that tree select always have data even user uncheck that tree */
      targetDetailStore.targetSelected = oldVal;
    }
  }
);
</script>
<template>
  <q-splitter v-model="splitterModel" style="height: 100%">
    <template v-slot:before>
      <div class="q-pa-sm">
        <q-layout
          view="lhh LpR lff"
          container
          style="
            height: 90vh;
            flex-direction: column;
            justify-content: flex-start;
          "
          class="q-py-none flex column justify-between"
        >
          <div
            class="fixed z-max q-px-sm"
            style="width: 100%; opacity: 1; background-color: #f5f5f5; top: 0"
          >
            <q-input
              ref="filterRef"
              outlined
              clearable
              v-model="targetDetailStore.targetFilter"
              :placeholder="t('funcTreeInputTarget')"
            >
            </q-input>
          </div>

          <div class="q-pa-md" style="margin-top: 5vh">
            <q-tree
              v-if="storeUtil.targetDataTree.length"
              class="full-height"
              full-height
              :filter="targetDetailStore.targetFilter"
              :nodes="storeUtil.targetDataTree"
              node-key="_id"
              selected-color="primary"
              tick-strategy="leaf"
              v-model:selected="targetDetailStore.targetSelected"
              v-model:ticked="storeUtil.targetDataCourseTickedData"
              default-expand-all
            >
            </q-tree>

            <!-- <q-page-sticky position="bottom-right" :offset="[30, 100]">
              <q-btn fab icon="add" color="green" />
            </q-page-sticky> -->
          </div>
        </q-layout>
      </div>
    </template>

    <template v-slot:after>
      <!-- Have Data When user click in tree -->
      <div v-if="!targetDetailStore.noDataSelectTree">
        <!-- View and Update Target -->
        <div v-if="!targetDetailStore.isShowFormAddNewTarget">
          <q-form
            @submit="
              storeUtil.postRegisterCourse(storeUtil.targetDataCourseTickedData)
            "
            class="q-gutter-md"
          >
            <div>
              <div class="q-gutter-md q-pa-md">
                <div class="flex justify-between full-width q-py-md">
                  <div class="text-h4 q-px-md text-justify" style="width: 70%">
                    {{ t("adjustTargetTitle") }}
                  </div>
                </div>

                <div class="col q-mr-md">
                  <q-input
                    :label="t('adjustTargetInputTechName')"
                    v-model="targetDetailStore.oneTargetData.techName"
                    filled
                    disable
                  />
                </div>
                <q-input
                  :label="t('adjustTargetInputTargetName')"
                  v-model="targetDetailStore.oneTargetData.name"
                  outlined
                  class="q-pb-sm"
                  :rules="[(val) => !!val || t('funcInputWarningFillData')]"
                  :disable="targetDetailStore.oneTargetData.isCorner"
                />
                <q-input
                  :label="t('adjustTargetInputTargetParent')"
                  v-model="targetDetailStore.oneTargetData.parentName"
                  outlined
                  class="q-pb-sm"
                  disable
                />
                <div class="row">
                  <div class="col q-mr-md">
                    <q-select
                      :label="t('adjustTargetInputTargetType')"
                      :options="targetDetailStore.targetTypeData"
                      option-label="name"
                      option-value="_id"
                      use-input
                      v-model="targetDetailStore.oneTargetData.targetType"
                      outlined
                      class="q-pb-sm"
                      :rules="[(val) => !!val || t('funcInputWarningFillData')]"
                      :disable="targetDetailStore.oneTargetData.isCorner"
                    >
                      <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.name }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>

                  <div class="col q-mr-sm">
                    <q-select
                      :label="t('adjustTargetInputFormula')"
                      :options="targetDetailStore.formulaData"
                      option-label="name"
                      option-value="_id"
                      use-input
                      v-model="targetDetailStore.oneTargetData.formula"
                      outlined
                      class="q-pb-sm"
                      :rules="[(val) => !!val || t('funcInputWarningFillData')]"
                      :disable="targetDetailStore.oneTargetData.isCorner"
                    >
                      <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.name }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                </div>

                <div class="row">
                  <div class="col q-mr-md">
                    <q-input
                      :label="t('adjustTargetInputUnit')"
                      v-model="targetDetailStore.oneTargetData.unit"
                      outlined
                      class="q-pb-sm"
                      :rules="[(val) => !!val || t('funcInputWarningFillData')]"
                      :disable="targetDetailStore.oneTargetData.isCorner"
                    >
                      <template v-slot:hint>
                        Học phí:
                        {{
                          (
                            targetDetailStore.oneTargetData.unit * 600000
                          ).toLocaleString("de-DE")
                        }}
                        đồng
                      </template>
                    </q-input>
                  </div>

                  <div class="col">
                    <q-select
                      :label="t('adjustTargetInputFrequency')"
                      :options="targetDetailStore.frequencyData"
                      option-label="name"
                      option-value="_id"
                      use-input
                      v-model="targetDetailStore.oneTargetData.frequencyMeasure"
                      outlined
                      class="q-pb-sm"
                      :rules="[(val) => !!val || t('funcInputWarningFillData')]"
                      :disable="targetDetailStore.oneTargetData.isCorner"
                    >
                      <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.name }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                </div>

                <q-input
                  :label="t('adjustTargetInputDesc')"
                  v-model="
                    targetDetailStore.oneTargetData.methodAndCalDescription
                  "
                  outlined
                  class="q-mt-lg"
                  :rules="[(val) => !!val || t('funcInputWarningFillData')]"
                  :disable="targetDetailStore.oneTargetData.isCorner"
                />
              </div>
              <div class="q-pa-md q-gutter-md flex justify-end">
                <q-btn
                  :label="t('button1')"
                  class="q-px-lg q-py-sm bg_defaultColor"
                  type="submit"
                />
              </div>
            </div>
          </q-form>
        </div>

        <!-- Add Target -->
        <div v-else></div>
      </div>

      <!-- No data user click -->
      <div v-else class="full-height" style="height: 90vh !important">
        <BlankComponent
          :dataContent="t('funcWarningSelectTargetData')"
        ></BlankComponent>
      </div>
    </template>
  </q-splitter>
</template>

<style scoped></style>
