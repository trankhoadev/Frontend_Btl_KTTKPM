<script setup>
/* Build In VueJS */
import { ref, onMounted, computed, onUpdated } from "vue";

/* Pinia Store */
import { useDanhSachNhanVienStore } from "@/stores/quan-ly-nhan-vien/DanhSachNhanVien";
import { useTableColumnStore } from "@/stores/extra/TableColumnStore";
import { useUtilStore } from "@/stores/dataStore";
import { useSettingStore } from "@/stores/extra/SettingStore.js";

/* Third Library */
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();

const storeSetting = useSettingStore();
const storeDanhSachNhanVien = useDanhSachNhanVienStore();
const storeUtils = useUtilStore();
const tableColumnStore = useTableColumnStore();

/* handle filter in select */
const options = ref(storeDanhSachNhanVien.companyStructureData);
const jobs = ref(storeDanhSachNhanVien.listJobData);

/* filter company struct */
const filterData = (val, updateFunc) => {
  if (!val) {
    updateFunc(() => {
      options.value = storeDanhSachNhanVien.companyStructureData;
    });
    return;
  }
  updateFunc(() => {
    const newVal = val.toLowerCase();
    options.value = storeDanhSachNhanVien.companyStructureData.filter(
      (i) => i.name.toLowerCase().indexOf(newVal) > -1
    );
  });
};

/* filter job */
const filterDataJobs = (val, updateFunc) => {
  if (!val) {
    updateFunc(() => {
      jobs.value = storeDanhSachNhanVien.listJobData;
    });
    return;
  }
  updateFunc(() => {
    const newVal = val.toLowerCase();
    jobs.value = storeDanhSachNhanVien.listJobData.filter(
      (i) => i.name.toLowerCase().indexOf(newVal) > -1
    );
  });
};

onMounted(async () => {
  /* config href */
  storeSetting.routerHref = router.currentRoute._rawValue.href;
  await storeUtils.getInit();
});
</script>

<template>
  <div style="height: 100%">
    <q-table
      flat
      bordered
      class="my-sticky-header-table q-ma-md text-uppercase"
      :rows="storeUtils.targetDataTickedArrayTree"
      :columns="tableColumnStore.columnEmployeesTable2"
      row-key="name"
      :title="t('listEmployeeTableName')"
      :rows-per-page-options="[100]"
      :filter="storeDanhSachNhanVien.inputSearch"
      style="height: 90vh"
    >
      <template v-slot:top-left>
        <span class="text-h6">{{ t("titleV6") }}</span>
      </template>

      <template v-slot:top-right>
        <div class="q-gutter-lg flex">
          <!-- <q-select
            outlined
            v-model="storeDanhSachNhanVien.selectSemester"
            :options="storeDanhSachNhanVien.semesterSelectOptions"
            input-debounce="0"
            :label="t('listEmployeeInputDepartment')"
            option-label="label"
            option-value="value"
            dense
            style="min-width: 200px"
            :rules="[(val) => !!val || 'Dữ liệu không được rỗng !']"
            @update:model-value="
              storeUtils.onChangeSelectSemester(
                storeDanhSachNhanVien.selectSemester.value
              )
            "
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ t("listEmployeeInputWarningDepartment") }}
                </q-item-section>
              </q-item>
            </template>
          </q-select> -->
          <q-input
            rounded
            outlined
            dense
            debounce="1000"
            :placeholder="t('inputSearch')"
            v-model="storeDanhSachNhanVien.inputSearch"
            v-bind:style="
              $q.screen.lt.md ? { width: '80vw' } : { width: '20vw' }
            "
            v-bind:class="{
              'q-mt-lg q-pt-lg': $q.screen.md || $q.screen.sm || $q.screen.xs,
            }"
          >
            <template v-slot:append>
              <q-btn flat round color="primary" icon="search" />
            </template>
          </q-input>
        </div>
      </template>

      <template v-slot:body="props">
        <tr
          @dblclick="storeDanhSachNhanVien.handleOpenDialog(props.row)"
          class="cursor-pointer"
          :props="props"
        >
          <td
            class="text-justify"
            key="techName"
            :props="props"
            style="width: 10%"
          >
            <span style="font-size: 1.1em"
              ><span style="white-space: pre-wrap">{{
                props.row.techName
              }}</span></span
            >
          </td>

          <td class="text-justify" key="name" :props="props" style="width: 30%">
            <span style="font-size: 1.1em"
              ><span style="white-space: pre-wrap">{{
                props.row.name
              }}</span></span
            >
          </td>

          <td class="text-justify" key="name" :props="props" style="width: 30%">
            <span style="font-size: 1.1em"
              ><span style="white-space: pre-wrap">{{
                props.row.methodAndCalDescription
              }}</span></span
            >
          </td>

          <td class="text-left" key="name" :props="props" style="width: 15%">
            <span style="font-size: 1.1em"
              ><span style="white-space: pre-wrap">
                {{ props.row.formulaName }}
              </span></span
            >
          </td>

          <td class="text-justify" key="name" :props="props" style="width: 15%">
            <span style="font-size: 1.1em"
              ><span style="white-space: pre-wrap">{{
                props.row.createdAt
              }}</span></span
            >
          </td>
        </tr>
      </template>
    </q-table>
  </div>
</template>

<style lang="scss" scoped></style>
<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 310px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #ffffff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
