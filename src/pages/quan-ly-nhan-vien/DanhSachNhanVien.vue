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

  /* set up for select company box */
  storeDanhSachNhanVien.companyStructureData = storeUtils.companyStructureData;
  storeDanhSachNhanVien.companyStructureData.unshift({
    name: "TẤT CẢ ĐƠN VỊ",
    _id: "0",
  });

  storeDanhSachNhanVien.selectCompany =
    storeDanhSachNhanVien.companyStructureData[0];

  /* Init Data */
  await storeDanhSachNhanVien.getInit();
});

onUpdated(() => {
  storeDanhSachNhanVien.companyStructureData = storeUtils.companyStructureData;
  storeDanhSachNhanVien.listJobData = storeUtils.listJobData;
});
</script>

<template>
  <div style="height: 100%">
    <q-table
      flat
      bordered
      class="my-sticky-header-table q-ma-md text-uppercase"
      :rows="storeDanhSachNhanVien.listDataEmployees"
      :columns="tableColumnStore.columnEmployeesTable"
      row-key="name"
      :title="t('listEmployeeTableName')"
      :rows-per-page-options="[100]"
      style="height: 90vh"
    >
      <template v-slot:top-left>
        <span class="text-h6">{{ t("listEmployeeTableName") }}</span>
        <!-- <q-select
          outlined
          v-model="storeDanhSachNhanVien.selectCompany"
          use-input
          input-debounce="0"
          :label="t('listEmployeeInputDepartment')"
          :options="optionsSelect"
          @filter="filterData"
          clearable
          option-label="name"
          option-value="_id"
          class="q-ml-lg"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{ t("listEmployeeInputWarningDepartment") }}
              </q-item-section>
            </q-item>
          </template>
        </q-select> -->

        <q-select
          outlined
          v-model="storeDanhSachNhanVien.selectCompany"
          use-input
          input-debounce="0"
          :label="t('listEmployeeInputDepartment')"
          :options="options"
          @filter="filterData"
          clearable
          option-label="name"
          option-value="_id"
          class="q-ml-lg"
          :rules="[(val) => !!val || 'Dữ liệu không được rỗng !']"
          style="min-width: 30vw"
          @update:model-value="storeDanhSachNhanVien.getAllEmployees('first')"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{ t("listEmployeeInputWarningDepartment") }}
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </template>

      <template v-slot:top-right>
        <div class="q-gutter-lg flex">
          <q-btn
            icon="person_add"
            color="green"
            :label="t('listEmployeeButtonAdd')"
            @click="storeDanhSachNhanVien.isDialogAdd = true"
          />

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
            @update:model-value="storeDanhSachNhanVien.textSearchEmployee(storeDanhSachNhanVien.inputSearch)"
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
          <td class="text-justify" key="name" :props="props" style="width: 10%">
            <span style="font-size: 1.1em"
              ><span style="white-space: pre-wrap">{{
                props.row.code
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
                props.row.companyStructName
              }}</span></span
            >
          </td>

          <td class="text-justify" key="name" :props="props" style="width: 15%">
            <span style="font-size: 1.1em"
              ><span style="white-space: pre-wrap">{{
                props.row.dateJoin
              }}</span></span
            >
          </td>

          <td class="text-justify" key="name" :props="props" style="width: 15%">
            <span style="font-size: 1.1em"
              ><span style="white-space: pre-wrap">{{
                props.row.dateOff
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
            <span v-if="storeDanhSachNhanVien.countIndex == 1"
              >{{ storeDanhSachNhanVien.countIndex }} -
              {{
                storeDanhSachNhanVien.numOfEmployees <= 100
                  ? storeDanhSachNhanVien.numOfEmployees
                  : 100
              }}
              of {{ storeDanhSachNhanVien.numOfEmployees }}</span
            >

            <span
              v-else-if="
                storeDanhSachNhanVien.countIndex ==
                storeDanhSachNhanVien.lastPage
              "
              >{{ +(storeDanhSachNhanVien.lastPage - 1) * 100 + 1 }} -
              {{ storeDanhSachNhanVien.numOfEmployees }} of
              {{ storeDanhSachNhanVien.numOfEmployees }}</span
            >

            <span v-else
              >{{ +(storeDanhSachNhanVien.countIndex - 1) * 100 + 1 }} -
              {{ +storeDanhSachNhanVien.countIndex * 100 }} of
              {{ storeDanhSachNhanVien.numOfEmployees }}</span
            >
          </div>

          <q-btn
            v-if="storeDanhSachNhanVien.lastPage > 2"
            icon="first_page"
            color="grey-8"
            round
            dense
            flat
            :disable="storeDanhSachNhanVien.countIndex === 1"
            @click="storeDanhSachNhanVien.getAllEmployees('first')"
          />

          <q-btn
            icon="chevron_left"
            color="grey-8"
            round
            dense
            flat
            :disable="storeDanhSachNhanVien.countIndex === 1"
            @click="storeDanhSachNhanVien.getAllEmployees(-1)"
          />

          <q-btn
            icon="chevron_right"
            color="grey-8"
            round
            dense
            flat
            :disable="
              storeDanhSachNhanVien.countIndex ===
              storeDanhSachNhanVien.lastPage
            "
            @click="storeDanhSachNhanVien.getAllEmployees(1)"
          />

          <q-btn
            v-if="storeDanhSachNhanVien.lastPage > 2"
            icon="last_page"
            color="grey-8"
            round
            dense
            flat
            :disable="
              storeDanhSachNhanVien.countIndex ===
              storeDanhSachNhanVien.lastPage
            "
            @click="storeDanhSachNhanVien.getAllEmployees('last')"
          />
        </div>
      </template>
    </q-table>

    <!-- ADD EMPLOYEE -->
    <q-dialog v-model="storeDanhSachNhanVien.isDialogAdd">
      <q-card class="shadow-24" style="min-width: 40vw">
        <q-card-section class="row items-center full-width">
          <span class="text-h5 q-ma-md">{{ t("listEmployeeTitleAdd") }}</span>

          <q-form
            @submit="
              storeDanhSachNhanVien.addNewEmployee(
                storeDanhSachNhanVien.addEmployeeData
              )
            "
            class="q-gutter-md full-width"
          >
            <div>
              <q-input
                outlined
                v-model="storeDanhSachNhanVien.addEmployeeData.code"
                type="text"
                :label="t('listEmployeeInputId')"
                :rules="[(val) => !!val || 'Dữ liệu không được rỗng !']"
              />

              <q-input
                outlined
                v-model="storeDanhSachNhanVien.addEmployeeData.name"
                type="text"
                :label="t('listEmployeeInputName')"
                class="q-mt-sm"
                :rules="[(val) => !!val || 'Dữ liệu không được rỗng !']"
              />

              <q-select
                outlined
                v-model="storeDanhSachNhanVien.addEmployeeData.jobTitle"
                use-input
                input-debounce="0"
                :label="t('listEmployeeInputJob')"
                :options="jobs"
                @filter="filterDataJobs"
                clearable
                option-label="name"
                option-value="_id"
                class="q-mt-sm"
                :rules="[(val) => !!val || 'Dữ liệu không được rỗng !']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ t("listEmployeeInputWarningJob") }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-select
                outlined
                v-model="storeDanhSachNhanVien.addEmployeeData.companyStruct"
                use-input
                input-debounce="0"
                :label="t('listEmployeeInputDepartment')"
                :options="options"
                @filter="filterData"
                clearable
                option-label="name"
                option-value="_id"
                class="q-mt-sm"
                :rules="[(val) => !!val || 'Dữ liệu không được rỗng !']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ t("listEmployeeInputWarningDepartment") }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <div class="flex justify-end">
                <q-btn
                  class="q-mx-md"
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
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- UPDATE EMPLOYEE -->
    <q-dialog v-model="storeDanhSachNhanVien.isDialogUpdate">
      <q-card class="shadow-24" style="min-width: 40vw">
        <q-card-section class="row items-center full-width">
          <span class="text-h5 q-ma-md">{{
            t("listEmployeeTitleUpdate")
          }}</span>

          <q-form
            @submit="
              storeDanhSachNhanVien.updateEmployee(
                storeDanhSachNhanVien.updateEmployeeData
              )
            "
            class="q-gutter-md full-width"
          >
            <div>
              <q-input
                outlined
                v-model="storeDanhSachNhanVien.updateEmployeeData.code"
                type="text"
                :label="t('listEmployeeInputId')"
                disable
              />
              <q-input
                outlined
                v-model="storeDanhSachNhanVien.updateEmployeeData.name"
                type="text"
                :label="t('listEmployeeInputName')"
                class="q-mt-md"
                :rules="[(val) => !!val || 'Dữ liệu không được rỗng !']"
              />

              <q-select
                outlined
                v-model="storeDanhSachNhanVien.updateEmployeeData.jobTitle"
                use-input
                input-debounce="0"
                :label="t('listEmployeeInputJob')"
                :options="jobs"
                @filter="filterDataJobs"
                clearable
                option-label="name"
                option-value="_id"
                class="q-mt-sm"
                :rules="[(val) => !!val || 'Dữ liệu không được rỗng !']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ t("listEmployeeInputWarningJob") }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-select
                outlined
                v-model="storeDanhSachNhanVien.updateEmployeeData.companyStruct"
                use-input
                input-debounce="0"
                :label="t('listEmployeeInputDepartment')"
                :options="options"
                @filter="filterData"
                clearable
                option-label="name"
                option-value="_id"
                class="q-mt-sm"
                :rules="[(val) => !!val || 'Dữ liệu không được rỗng !']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ t("listEmployeeInputWarningDepartment") }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <div class="row q-mb-md q-mt-sm">
                <q-input
                  outlined
                  v-model="storeDanhSachNhanVien.updateEmployeeData.dateJoin"
                  type="text"
                  :label="t('listEmployeeInputDateJoin')"
                  disable
                  class="col"
                />
                <q-input
                  outlined
                  v-model="storeDanhSachNhanVien.updateEmployeeData.dateOff"
                  type="text"
                  :label="t('listEmployeeInputDateLeave')"
                  disable
                  class="col q-mx-md"
                />
                <q-input
                  outlined
                  v-model="storeDanhSachNhanVien.updateEmployeeData.updatedAt"
                  type="text"
                  :label="t('listEmployeeInputDateUpdate')"
                  disable
                  class="col"
                />
              </div>

              <div class="flex justify-end">
                <q-btn
                  class="q-mx-md"
                  flat
                  :label="t('funcCancel')"
                  color="primary"
                  v-close-popup
                />
                <q-btn
                  type="submit"
                  :label="t('funcSave')"
                  class="bg_defaultColor"
                />
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
