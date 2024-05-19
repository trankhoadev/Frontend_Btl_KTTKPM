<script setup>
/* Build in VueJs */
import { ref, onMounted, computed } from "vue";

/* Pinia Store */
import { useSettingStore } from "@/stores/extra/SettingStore.js";
import { useChucDanhNhanVienStore } from "@/stores/quan-ly-nhan-vien/ChucDanhNhanVien";
import { useTableColumnStore } from "@/stores/extra/TableColumnStore";
import { useUtilStore } from "@/stores/dataStore";

/* Third Library */
import { useRouter } from "vue-router";

const storeUtils = useUtilStore();
const router = useRouter();
const storeSetting = useSettingStore();
const storeChucDanhNhanVien = useChucDanhNhanVienStore();

const tableColumnStore = useTableColumnStore();

/* handle filter in select */
const options = ref(storeChucDanhNhanVien.companyStructureData);
const jobs = ref(storeChucDanhNhanVien.listJobData);

const filterData = (val, updateFunc) => {
  if (!val) {
    updateFunc(() => {
      options.value = storeChucDanhNhanVien.companyStructureData;
    });
    return;
  }
  updateFunc(() => {
    const newVal = val.toLowerCase();
    options.value = storeChucDanhNhanVien.companyStructureData.filter(
      (i) => i.name.toLowerCase().indexOf(newVal) > -1
    );
  });
};

const filterDataJobs = (val, updateFunc) => {
  if (!val) {
    updateFunc(() => {
      jobs.value = storeChucDanhNhanVien.listJobData;
    });
    return;
  }
  updateFunc(() => {
    const newVal = val.toLowerCase();
    jobs.value = storeChucDanhNhanVien.listJobData.filter(
      (i) => i.name.toLowerCase().indexOf(newVal) > -1
    );
  });
};

onMounted(async () => {
  /* config href */
  storeSetting.routerHref = router.currentRoute._rawValue.href;

  /* Init Data */
  await storeChucDanhNhanVien.getInit();
  storeChucDanhNhanVien.companyStructureData = storeUtils.companyStructureData;
  storeChucDanhNhanVien.listJobData = storeUtils.listJobData;
});
</script>

<template>
  <div style="height: 100%">
    <q-table
      flat
      bordered
      class="my-sticky-header-table q-ma-md"
      :rows="storeChucDanhNhanVien.listDataJobs"
      :columns="tableColumnStore.columnJobsTable"
      row-key="name"
      title="BẢNG CHỨC DANH NHÂN VIÊN"
      :rows-per-page-options="[100]"
      style="height: 90vh"
    >
      <template v-slot:top-right>
        <div class="q-gutter-lg flex">
          <q-btn
            icon="person_add"
            color="green"
            label="Thêm chức danh"
            @click="storeChucDanhNhanVien.isDialogAdd = true"
          />

          <q-input
            rounded
            outlined
            dense
            debounce="1000"
            placeholder="Search"
            v-model="storeChucDanhNhanVien.filter"
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
          @dblclick="storeChucDanhNhanVien.handleOpenDialog(props.row)"
          class="cursor-pointer"
          :props="props"
          style="min-height: 4vh"
        >
          <td class="text-justify" key="name" :props="props" style="width: 10%">
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

          <td class="text-justify" key="name" :props="props" style="width: 15%">
            <span style="font-size: 1.1em"
              ><span style="white-space: pre-wrap">{{
                props.row.year
              }}</span></span
            >
          </td>

          <td class="text-justify" key="name" :props="props" style="width: 15%">
            <span style="font-size: 1.1em"
              ><span style="white-space: pre-wrap">{{
                props.row.createdAt
              }}</span></span
            >
          </td>

          <td class="text-justify" key="name" :props="props" style="width: 15%">
            <span style="font-size: 1.1em"
              ><span style="white-space: pre-wrap">{{
                props.row.updatedAt
              }}</span></span
            >
          </td>
        </tr>
      </template>

      <template v-slot:bottom>
        <div class="full-width flex justify-end">
          <div class="flex flex-center q-mr-lg">
            <span v-if="storeChucDanhNhanVien.countIndex == 1"
              >{{ storeChucDanhNhanVien.countIndex }} -
              {{
                storeChucDanhNhanVien.numOfJobs <= 100
                  ? storeChucDanhNhanVien.numOfJobs
                  : 100
              }}
              of {{ storeChucDanhNhanVien.numOfJobs }}</span
            >

            <span
              v-else-if="
                storeChucDanhNhanVien.countIndex ==
                storeChucDanhNhanVien.lastPage
              "
              >{{ +(storeChucDanhNhanVien.lastPage - 1) * 100 + 1 }} -
              {{ storeChucDanhNhanVien.numOfJobs }} of
              {{ storeChucDanhNhanVien.numOfJobs }}</span
            >

            <span v-else
              >{{ +(storeChucDanhNhanVien.countIndex - 1) * 100 + 1 }} -
              {{ +storeChucDanhNhanVien.countIndex * 100 }} of
              {{ storeChucDanhNhanVien.numOfJobs }}</span
            >
          </div>

          <q-btn
            v-if="storeChucDanhNhanVien.lastPage > 2"
            icon="first_page"
            color="grey-8"
            round
            dense
            flat
            :disable="storeChucDanhNhanVien.countIndex === 1"
            @click="storeChucDanhNhanVien.getAllJobs('first')"
          />

          <q-btn
            icon="chevron_left"
            color="grey-8"
            round
            dense
            flat
            :disable="storeChucDanhNhanVien.countIndex === 1"
            @click="storeChucDanhNhanVien.getAllJobs(-1)"
          />

          <q-btn
            icon="chevron_right"
            color="grey-8"
            round
            dense
            flat
            :disable="
              storeChucDanhNhanVien.countIndex ===
              storeChucDanhNhanVien.lastPage
            "
            @click="storeChucDanhNhanVien.getAllJobs(1)"
          />

          <q-btn
            v-if="storeChucDanhNhanVien.lastPage > 2"
            icon="last_page"
            color="grey-8"
            round
            dense
            flat
            :disable="
              storeChucDanhNhanVien.countIndex ===
              storeChucDanhNhanVien.lastPage
            "
            @click="storeChucDanhNhanVien.getAllJobs('last')"
          />
        </div>
      </template>
    </q-table>

    <!-- ADD EMPLOYEE -->
    <q-dialog v-model="storeChucDanhNhanVien.isDialogAdd">
      <q-card class="shadow-24" style="min-width: 40vw">
        <q-card-section class="row items-center full-width">
          <span class="text-h5 q-ma-md">Thêm chức danh mới</span>

          <q-form
            @submit="
              storeChucDanhNhanVien.addNewJob(storeChucDanhNhanVien.addData)
            "
            class="q-gutter-md full-width"
          >
            <div>
              <q-input
                outlined
                v-model="storeChucDanhNhanVien.addData.name"
                type="text"
                label="Tên chức danh"
                class="q-mt-sm"
                :rules="[(val) => !!val || 'Dữ liệu không được rỗng !']"
              />

              <div class="flex justify-end">
                <q-btn
                  class="q-mx-md"
                  flat
                  label="Hủy"
                  color="primary"
                  v-close-popup
                />
                <q-btn type="submit" label="Thêm" class="bg_defaultColor" />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- UPDATE EMPLOYEE -->
    <q-dialog v-model="storeChucDanhNhanVien.isDialogUpdate">
      <q-card class="shadow-24" style="min-width: 40vw">
        <q-card-section class="row items-center full-width">
          <span class="text-h5 q-ma-md">Cập nhật dữ liệu chức danh</span>

          <q-form
            @submit="
              storeChucDanhNhanVien.updateJob(
                storeChucDanhNhanVien.updateJobData
              )
            "
            class="q-gutter-md full-width"
          >
            <div>
              <q-input
                outlined
                v-model="storeChucDanhNhanVien.updateJobData.techName"
                type="text"
                label="Mã chức danh"
                disable
              />
              <q-input
                outlined
                v-model="storeChucDanhNhanVien.updateJobData.name"
                type="text"
                label="Tên chức danh"
                class="q-mt-md"
                :rules="[(val) => !!val || 'Dữ liệu không được rỗng !']"
              />

              <div class="row q-mb-md q-mt-sm">
                <q-input
                  outlined
                  v-model="storeChucDanhNhanVien.updateJobData.year"
                  type="text"
                  label="Năm"
                  disable
                  class="col"
                />
                <q-input
                  outlined
                  v-model="storeChucDanhNhanVien.updateJobData.createdAt"
                  type="text"
                  label="Ngày tạo"
                  disable
                  class="col q-mx-md"
                />
                <q-input
                  outlined
                  v-model="storeChucDanhNhanVien.updateJobData.updatedAt"
                  type="text"
                  label="Ngày cập nhật"
                  disable
                  class="col"
                />
              </div>

              <div class="flex justify-end">
                <q-btn
                  class="q-mx-md"
                  flat
                  label="Hủy"
                  color="primary"
                  v-close-popup
                />
                <q-btn type="submit" label="Lưu" class="bg_defaultColor" />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
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
