<script setup>
/* Build in VueJs */
import { ref, onMounted, watch } from "vue";
import { Dialog, Notify } from "quasar";
import { useI18n } from "vue-i18n";

/* Pinia Store */
import { useUtilStore } from "@/stores/dataStore";
import { useSettingStore } from "@/stores/extra/SettingStore.js";
import { useStoreImportMucTieu } from "@/stores/import-du-lieu/ImportMucTieu.js";
import { useCaiDatMucTieuStore } from "src/stores/settings/CaiDatMucTieuStore";

/* Component */
import BlankComponent from "src/components/base/BlankComponent.vue";

/* Third library */
import * as XLSX from "xlsx";
import { useRouter } from "vue-router";

const storeUtils = useUtilStore();
const storeSetting = useSettingStore();
const storeImportMucTieu = useStoreImportMucTieu();
const storeCaiDatMucTieu = useCaiDatMucTieuStore();

const { t } = useI18n();
const router = useRouter();

const targetSelected = ref();
// const tab = ref("mails");
const step = ref(1);
const excelData = ref(null);
const splitterModel = ref(35);

const inputXLSX = ref(null);

let arrStructure = [];
const arrInformation = ref([]);

const textStart = ref("A");
const textEnd = ref("");
const endValue = ref(4);
const expectedTree = ref([]);
const files = ref([]);
const fileContent = ref(null);
const selectedItem = ref();
const disableContinueButton = ref(false);

const structureTarget = ref([
  {
    label: "Tài chính",
    children: [],
    level: 0,
    tech: "TC",
    id: "-1",
  },

  {
    label: "Khách hàng",
    children: [],
    level: 0,
    tech: "KH",
    id: "-2",
  },

  {
    label: "Quy trình nội bộ",
    children: [],
    level: 0,
    tech: "QT",
    id: "-3",
  },

  {
    label: "Học hỏi và phát triển",
    children: [],
    level: 0,
    tech: "HH",
    id: "-4",
  },
]);

onMounted(async () => {
  /* config href */
  storeSetting.routerHref = router.currentRoute._rawValue.href;

  /* Get data init */
  await storeImportMucTieu.getInit();
  await storeUtils.getCompany();
  await storeUtils.getAllTargetType();
  await storeUtils.getAllFormula();
  await storeUtils.getAllFrequency();
  await storeUtils.getAllTargetData();

  /* Assign data to store variable */
  storeImportMucTieu.companyData = storeUtils.companyStructureData;
  storeImportMucTieu.targetTypeData = storeUtils.targetTypeData;
  storeImportMucTieu.formulaData = storeUtils.formulaData;
  storeImportMucTieu.frequencyData = storeUtils.frequencyData;

  // endValue.value = storeImportMucTieu.listDataCompanyStructure.length - 2;
  !storeUtils.targetTypeData.length ? (disableContinueButton.value = true) : [];
  !storeUtils.formulaData.length ? (disableContinueButton.value = true) : [];
  !storeUtils.frequencyData.length ? (disableContinueButton.value = true) : [];
  storeUtils.targetData.length ? (disableContinueButton.value = true) : [];
});

const divideArray = (arr, start, end) => {
  var check = true;

  if (!arr || !arr.length) {
    check = false;
  }

  arr?.map((i) => {
    arrStructure.push(i.slice(start, end));
    arrInformation.value.push(i.slice(end, i.length));
  });

  /* Get structure level */
  var arrLevel = [];
  arrLevel = arrStructure
    .map((i) => {
      let numOfLevel = 0;
      numOfLevel = i
        .map((value, index) => {
          if (value) {
            return index + 1;
          }
        })
        .filter((i) => i);

      return numOfLevel;
    })
    .flat();

  /**
   * Change from:
   *   [
        "Đảm bảo kế hoạch doanh thu",
        "%",
        "(Thực hiện/Kế hoạch)*100%",
        "Năm",
        "Trung bình cộng",
        "Càng lớn càng tốt",
        4,
        100,
        80
      ],
   *
   * To this one:
   *   {
        "name": "Đảm bảo kế hoạch doanh thu",
        "unit": "%",
        "methodAndCalDescription": "(Thực hiện/Kế hoạch)*100%",
        "frequencyMeasure": "Năm",
        "formulaName": "Trung bình cộng",
        "targetTypeName": "Càng lớn càng tốt",
        "importanceLevel": 4,
        "defaultValue": 100,
        "minValue": 80
      },
   *
   */
  const propertyNames = [
    "name",
    "unit",
    "methodAndCalDescription",
    "frequencyMeasure",
    // "measureName",
    // "documentSource",
    "formulaName",
    "targetTypeName",
    // "importanceLevel",
    // "defaultValue",
    // "minValue",
    "idAssign",
  ];

  arrInformation.value = arrInformation.value.filter((i) => {
    if (i.length > 0) {
      return i;
    }
  });

  // console.log(JSON.stringify(arrInformation.value, null, 2));
  arrInformation.value = arrInformation.value.map((i, indexFirstArr) => {
    const dataObject = {};

    dataObject.id = indexFirstArr + 1;
    i.forEach((value, index) => {
      const property = propertyNames[index];
      dataObject[property] = value;
    });

    /* let user data from localStorage */
    const userData = JSON.parse(localStorage.getItem("userData"));

    /* give structure level for target data */
    dataObject.label = dataObject.name;
    dataObject.level = arrLevel[indexFirstArr];
    dataObject.documentSource = dataObject.documentSource
      ? dataObject.documentSource
      : "";
    dataObject.isDisable = false;
    dataObject.children = [];

    /* add them */
    dataObject.measureName = "";
    dataObject.documentSource = "";
    dataObject.importanceLevel = "";
    dataObject.defaultValue = "";
    dataObject.minValue = "";
    dataObject.beLongTo = "TC";

    try {
      dataObject.formulaName = dataObject.formulaName.toUpperCase();
    } catch (err) {
      Dialog.create({
        title: "Thông báo",
        message: `Không có dữ phương pháp tính: <b>${dataObject.formulaName}</b> trong cơ sở dữ liệu, bạn có muốn đi đến trang thiết lập không ?`,
        onOk: true,
        cancel: true,
        html: true,
      }).onOk(() => {
        router.push("/target/setup");
        storeCaiDatMucTieu.tabSelected = "tab2";
      });
      check = false;
    }

    try {
      dataObject.targetTypeName = dataObject.targetTypeName.toUpperCase();
    } catch (err) {
      Dialog.create({
        title: "Thông báo",
        message: `Không có dữ phương pháp tính: <b>${dataObject.targetTypeName}</b> trong cơ sở dữ liệu, bạn có muốn đi đến trang thiết lập không ?`,
        onOk: true,
        cancel: true,
        html: true,
      }).onOk(() => {
        router.push("/target/setup");
        storeCaiDatMucTieu.tabSelected = "tab1";
      });
      check = false;
    }

    try {
      dataObject.frequencyMeasure = dataObject.frequencyMeasure.toString();
    } catch (err) {
      Dialog.create({
        title: "Thông báo",
        message: `Không có dữ phương pháp tính: <b>${dataObject.frequencyMeasure}</b> trong cơ sở dữ liệu, bạn có muốn đi đến trang thiết lập không ?`,
        onOk: true,
        cancel: true,
        html: true,
      }).onOk(() => {
        router.push("/target/setup");
        storeCaiDatMucTieu.tabSelected = "tab3";
      });
      check = false;
    }

    console.log(expectedTree.value.length);

    if (dataObject.level === 1) {
      dataObject.idAssign = "";
    }

    return dataObject;
  });

  if (check) {
    buildTree(arrInformation.value);
  } else {
    expectedTree.value = [];
  }
};

const buildTree = (arr) => {
  function transformData(initialData) {
    const result = [];

    initialData.forEach((node) => {
      let currentLevel = result;
      let parentNode = null;

      for (let i = 1; i < node.level; i++) {
        parentNode = currentLevel[currentLevel.length - 1]?.children;
        if (!parentNode) {
          parentNode = [];
          currentLevel[currentLevel.length - 1].children = parentNode;
        }
        currentLevel = parentNode;
      }

      const newNode = { ...node, children: [] };
      currentLevel.push(newNode);
    });

    return result;
  }

  const dataExpect = transformData(arr);

  // Output the result
  // console.log(JSON.stringify(Object.values(dataExpect), null, 2));
  /* handle add target into 4 base of target (TC, KH, QTNB, HHPT) */
  structureTarget.value.forEach((i) => {
    dataExpect.map((j) => {
      if (i.tech === j.beLongTo) {
        i.children.push(j);
      }
    });
  });

  expectedTree.value = dataExpect;

  console.log(JSON.stringify(dataExpect, null, 2));
  storeImportMucTieu.targetTreeData = dataExpect;
};

/* read excel file and output json data */
const handleInputXLSX = () => {
  if (inputXLSX.value) {
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Assuming the first sheet is the one you want to read
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Extract data from the worksheet
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const [header, ...body] = jsonData;
      excelData.value = body;
    };

    reader.readAsArrayBuffer(inputXLSX.value);
  }
};

/* Generate excel template file */
const generateTemplateExcel = () => {
  const companyTreeStructure = storeImportMucTieu.listDataCompanyStructure
    .map((item) => item.name)
    .slice(0, -1); // TODO: sau này, khi xóa "Chức danh" đi, thì không cần slice nữa!!!

  const otherColumns = ["Chức danh", "Nhân viên", "MSNV"];

  // const templateHeader = companyTreeStructure.concat(otherColumns)
  const templateHeader = [...companyTreeStructure, ...otherColumns];

  // Sample data
  const data = [
    // Your data goes here
    ["Company"].concat(Array(templateHeader.length - 1).fill("")),
    Array(templateHeader.length).fill(""),
  ];

  // Create a worksheet
  const ws = XLSX.utils.aoa_to_sheet([templateHeader, ...data]);

  // Create a workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Save the workbook to a file
  XLSX.writeFile(wb, "Template Excel File.xlsx");
};

/* handle crud with tree excel */
function findNodeById(tree, label) {
  for (const item of tree) {
    if (item.id === label) {
      return item;
    }

    if (item.children) {
      const foundInChildren = findNodeById(item.children, label);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }

  return null;
}

function createNodeById(inputArr, id, objectAdd) {
  // console.log(JSON.stringify(inputArr, null, 2));

  for (let i = 0; i < inputArr.length; i++) {
    const node = inputArr[i];

    if (node.id === id) {
      if (!node.children) {
        node.children = []; // Initialize 'children' array if it doesn't exist
      }

      objectAdd.label = objectAdd.name;
      objectAdd.id = id + Math.floor(Math.random() * (1000000 - 1 + 1));
      objectAdd.level = +(node.level + 1);
      objectAdd.children = [];

      objectAdd.idAssign = objectAdd.idAssign?.techName;
      objectAdd.targetTypeName = objectAdd.targetTypeName.name;
      objectAdd.formulaName = objectAdd.formulaName.name;
      objectAdd.frequencyMeasure = objectAdd.frequencyMeasure.name;

      node.children.push(objectAdd); // Add the new object to the 'children' array
      storeImportMucTieu.objectAdd = {};
      Notify.create({
        message: "Thêm thành công !",
        position: "top",
        color: "green",
      });
      return true; // Indicate that the object has been added
    }

    if (node.children && node.children.length > 0) {
      const childAdded = createNodeById(node.children, id, objectAdd);

      if (childAdded) {
        return true; // Propagate the addition status upward
      }
    }
  }

  return false; // Indicate that the node with the specified id was not found
}

/* Function find node by id and replace label */
function updateItemById(inputArr, id, objectUpdate) {
  const typeOfAssign = typeof objectUpdate.idAssign;
  const typeOfTargetType = typeof objectUpdate.targetTypeName;
  const typeOfFormula = typeof objectUpdate.formulaName;
  const typeOfFrequency = typeof objectUpdate.frequencyMeasure;

  for (let i = 0; i < inputArr.length; i++) {
    const node = inputArr[i];

    if (node?.id === id) {
      inputArr[i] = objectUpdate; // Replace the node with objectUpdate
      inputArr[i].label = objectUpdate.name;

      typeOfAssign === "object"
        ? (inputArr[i].idAssign = inputArr[i].idAssign.techName)
        : [];

      typeOfTargetType === "object"
        ? (inputArr[i].targetTypeName = inputArr[i].targetTypeName.name)
        : [];

      typeOfFormula === "object"
        ? (inputArr[i].formulaName = inputArr[i].formulaName.name)
        : [];

      typeOfFrequency === "object"
        ? (inputArr[i].frequencyMeasure = inputArr[i].frequencyMeasure.name)
        : [];

      storeImportMucTieu.objectUpdate = {};
      // const x = storeImportMucTieu.companyData.filter((i) => {
      //   if (i.techName === selectedItem.value.idAssign) {
      //     return i;
      //   }
      // })[0]?.name;

      // selectedItem.value.idAssign = x ? x : selectedItem.value.idAssign;

      Notify.create({
        message: "Cập nhật thành công !",
        position: "top",
        color: "green",
      });
      console.log(JSON.stringify(storeImportMucTieu.targetTreeData, null, 2));
      return true; // Indicate that the node has been updated
    }

    if (node.children && node.children.length > 0) {
      const childUpdated = updateItemById(node.children, id, objectUpdate);

      if (childUpdated) {
        Notify.create({
          message: "Cập nhật thành công !",
          position: "top",
          color: "green",
        });
        return true; // Propagate the update status upward
      }
    }
  }

  return false; // Indicate that the node with the specified id was not found
}

/* Function find node by id and remove node */
function removeNodeById(inputData, id) {
  Dialog.create({
    message: `Xác nhận xóa dữ liệu môn học: <b>${storeImportMucTieu.labelRemoveName}</b> ?`,
    html: true,
    ok: true,
    cancel: true,
  })
    .onOk(() => {
      deleteItemById(inputData, id);
      storeImportMucTieu.updateLabel = "";
      Notify.create({
        message: "Xóa thành công !",
        position: "top",
        color: "green",
      });
    })
    .onCancel(() => {});
}

function deleteItemById(inputArr, id) {
  for (let i = 0; i < inputArr.length; i++) {
    const node = inputArr[i];

    if (node.id === id) {
      inputArr.splice(i, 1); // Remove the node if the id matches
      return true; // Indicate that the node has been deleted
    }

    if (node.children && node.children.length > 0) {
      const childDeleted = deleteItemById(node.children, id);

      if (childDeleted && node.children.length === 0) {
        delete node.children; // Remove 'children' property if it becomes empty after deletion
      }

      if (childDeleted) {
        return true; // Propagate the deletion status upward
      }
    }
  }

  return false; // Indicate that the node with the specified id was not found
}

watch(
  () => storeImportMucTieu.treeSelected,
  (val, preVal) => {
    if (val) {
      selectedItem.value = findNodeById(expectedTree.value, val);

      const x = storeImportMucTieu.companyData.filter((i) => {
        if (i.techName === selectedItem.value.idAssign) {
          return i;
        }
      })[0]?.name;

      selectedItem.value.idAssign = x ? x : selectedItem.value.idAssign;

      storeImportMucTieu.isShowFormAddNewStructure = false;
      storeImportMucTieu.objectUpdate = selectedItem.value;

      if (selectedItem.value) {
        storeImportMucTieu.updateLabel = selectedItem.value.label;
        storeImportMucTieu.labelRemoveName = selectedItem.value.label;
        if (selectedItem.value.id) {
          storeImportMucTieu.idUpdate = selectedItem.value.id;
        }
      }
    }
    // else {
    //   storeImportMucTieu.treeSelected = preVal;
    // }
  }
);
</script>

<template>
  <div class="q-pa-md" style="height: 92vh; overflow-y: hidden">
    <!-- Notice user still not config "target type" -->
    <q-banner
      v-if="!storeUtils.targetTypeData.length"
      inline-actions
      rounded
      class="bg-orange text-white q-mb-lg"
    >
      <span class="text-subtitle1">
        {{ t("importTargetWarningNotSetTargetType") }}
      </span>

      <template v-slot:action>
        <router-link to="/target/setup">
          <q-btn
            class="bg_defaultColor"
            @click="storeCaiDatMucTieu.tabSelected = 'tab1'"
            push
            :label="t('funcGoToPage')"
        /></router-link>
      </template>
    </q-banner>

    <!-- Notice user still not config "formula type" -->
    <q-banner
      v-if="!storeUtils.formulaData.length"
      inline-actions
      rounded
      class="bg-orange text-white q-mb-lg"
    >
      <span class="text-subtitle1">
        {{ t("importTargetWarningNotSetFormula") }}
      </span>

      <template v-slot:action>
        <router-link to="/target/setup">
          <q-btn
            class="bg_defaultColor"
            @click="storeCaiDatMucTieu.tabSelected = 'tab2'"
            push
            :label="t('funcGoToPage')"
        /></router-link>
      </template>
    </q-banner>

    <!-- Notice user still not config "frequencyData data" -->
    <q-banner
      v-if="!storeUtils.frequencyData.length"
      inline-actions
      rounded
      class="bg-orange text-white q-mb-lg"
    >
      <span class="text-subtitle1">
        {{ t("importTargetWarningNotSetFrequency") }}
      </span>

      <template v-slot:action>
        <router-link to="/target/setup">
          <q-btn
            class="bg_defaultColor"
            @click="storeCaiDatMucTieu.tabSelected = 'tab3'"
            push
            :label="t('funcGoToPage')"
        /></router-link>
      </template>
    </q-banner>

    <!-- Notice user when already have target data -->
    <q-banner
      v-if="storeUtils.targetData.length"
      inline-actions
      rounded
      class="bg-orange text-white q-mb-lg"
    >
      <span class="text-subtitle1">
        {{ t("importTargetWarningNotAlreadyHaveTargetData") }}
      </span>

      <template v-slot:action>
        <router-link to="/target/list">
          <q-btn class="bg_defaultColor" push :label="t('funcGoToPage')"
        /></router-link>
      </template>
    </q-banner>

    <div class="q-gutter-y-md" style="max-width: 100vw; height: 100%">
      <q-stepper v-model="step" ref="stepper" color="primary" animated>
        <q-step
          :name="1"
          :title="t('importTargetTitleStep1')"
          icon="create_new_folder"
          :done="step > 1"
        >
          <div class="text-h4 text-bold q-mb-lg">
            {{ t("importTargetTitleH1") }}
          </div>
          <!-- <q-tree
            v-if="storeImportMucTieu.organizationalData.length"
            class="full-height"
            full-height
            :nodes="storeImportMucTieu.organizationalData"
            node-key="_id"
            selected-color="primary"
            v-model:selected="storeImportMucTieu.treeSelected"
            default-expand-all
          >
          </q-tree> -->

          <q-banner inline-actions rounded class="q-mt-lg bg-grey-3 text-white">
            <p
              class="text-primary cursor-pointer text-subtitle1"
              @click="generateTemplateExcel"
            >
              {{ t("importTargetDownloadText") }}
            </p>
            <span class="text-black text-subtitle1">{{
              t("importStructDownloadDescription")
            }}</span>
          </q-banner>
        </q-step>

        <q-step
          :name="2"
          :title="t('importTargetTitleStep2')"
          icon="settings"
          :done="step > 2"
        >
          <q-file
            v-model="inputXLSX"
            square
            flat
            counter
            outlined
            use-chips
            clearable
            accept=".csv,.xlsx"
            max-files="1"
            max-file-size="5120000"
            @update:model-value="handleInputXLSX()"
            input-style="height: 300px"
            class="full-width"
          >
            <template v-slot:default>
              <div
                v-if="!inputXLSX"
                style="
                  height: 100%;
                  width: 15000vw;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  text-align: center; /* Add this line */
                "
              >
                <q-icon name="backup" size="md" class="q-mr-md" />
                <span class="text-black text-subtitle1">{{
                  t("importSelectBox")
                }}</span>
              </div>
            </template>
          </q-file>
        </q-step>

        <q-step
          :name="3"
          :title="t('importTargetTitleStep3')"
          icon="assignment"
          :done="step > 3"
        >
          <q-layout
            view="lhh LpR lff"
            container
            style="
              min-height: 71vh;
              flex-direction: column;
              justify-content: flex-start;
            "
            class="q-py-none flex column justify-between"
            v-if="expectedTree.length > 0"
          >
            <div
              class="fixed z-max q-pa-sm"
              style="width: 100%; opacity: 1; background-color: #fff; top: 0"
            >
              <q-input
                ref="filterRef"
                outlined
                clearable
                v-model="storeImportMucTieu.treeFilter"
                :placeholder="t('funcTreeInputTarget')"
              >
              </q-input>
            </div>

            <div class="q-pa-md" style="margin-top: 6vh">
              <q-splitter v-model="splitterModel" style="min-height: 100vh">
                <template v-slot:before>
                  <q-tree
                    full-height
                    default-expand-all
                    :filter="storeImportMucTieu.treeFilter"
                    no-transition
                    node-key="id"
                    selected-color="primary"
                    debounce="300"
                    :nodes="expectedTree"
                    v-model:selected="storeImportMucTieu.treeSelected"
                    style="overflow-y: scroll; height: 65vh"
                    class="q-pa-none"
                  >
                  </q-tree>

                  <q-page-sticky position="bottom" :offset="[18, 18]">
                    <q-btn
                      @click="
                        storeImportMucTieu.isShowFormAddNewStructure = true
                      "
                      fab
                      style="margin-right: 35vw"
                      icon="add"
                      color="green"
                    />
                  </q-page-sticky>
                </template>

                <template v-slot:after>
                  <div
                    class="fixed-content fixed z-max q-px-sm q-mt-sm full-height"
                    style="width: 63%"
                    v-if="!storeImportMucTieu.isShowFormAddNewStructure"
                  >
                    <span class="text-h4">{{ t("importTargetTitleH1") }}</span>
                    <q-input
                      type="text"
                      :label="t('importTargetInputTargetName')"
                      v-model="storeImportMucTieu.objectUpdate.name"
                      outlined
                      class="q-mt-md"
                    />

                    <q-input
                      type="text"
                      :label="t('importTargetInputDesc')"
                      v-model="
                        storeImportMucTieu.objectUpdate.methodAndCalDescription
                      "
                      outlined
                      class="q-mt-md"
                    />

                    <q-select
                      v-model="storeImportMucTieu.objectUpdate.idAssign"
                      outlined
                      :options="storeImportMucTieu.companyData"
                      option-value="techName"
                      option-label="name"
                      :label="t('importTargetInputAssign')"
                      class="q-mt-md"
                    />

                    <div class="row">
                      <q-select
                        v-model="storeImportMucTieu.objectUpdate.targetTypeName"
                        :options="storeImportMucTieu.targetTypeData"
                        :label="t('importTargetInputType')"
                        option-label="name"
                        option-value="_id"
                        outlined
                        class="q-mt-md col"
                      />

                      <q-select
                        v-model="storeImportMucTieu.objectUpdate.formulaName"
                        :options="storeImportMucTieu.formulaData"
                        :label="t('importTargetInputFormula')"
                        option-label="name"
                        option-value="_id"
                        outlined
                        class="q-mt-md col q-px-sm"
                      />

                      <q-select
                        v-model="
                          storeImportMucTieu.objectUpdate.frequencyMeasure
                        "
                        :options="storeImportMucTieu.frequencyData"
                        :label="t('importTargetInputFrequency')"
                        option-label="name"
                        option-value="_id"
                        outlined
                        class="q-mt-md col"
                      />
                    </div>

                    <div class="row">
                      <q-input
                        type="text"
                        :label="t('importTargetInputDepartment')"
                        v-model="storeImportMucTieu.objectUpdate.measureName"
                        outlined
                        class="q-mt-md col"
                      />

                      <q-input
                        type="text"
                        :label="t('importTargetInputUnit')"
                        v-model="storeImportMucTieu.objectUpdate.unit"
                        outlined
                        class="q-mt-md col q-px-sm"
                      />
                      <q-input
                        type="number"
                        :label="t('importTargetInputImportance')"
                        v-model="
                          storeImportMucTieu.objectUpdate.importanceLevel
                        "
                        outlined
                        class="q-mt-md col"
                      />
                    </div>

                    <div class="row">
                      <q-input
                        type="number"
                        :label="t('importTargetInputDefaultValue')"
                        v-model="storeImportMucTieu.objectUpdate.defaultValue"
                        outlined
                        class="q-mt-md col"
                      />

                      <q-input
                        type="number"
                        :label="t('importTargetInputMinValue')"
                        v-model="storeImportMucTieu.objectUpdate.minValue"
                        outlined
                        class="q-mt-md col q-px-sm"
                      />

                      <q-input
                        v-model="storeImportMucTieu.objectUpdate.documentSource"
                        outlined
                        type="text"
                        class="q-mt-md col"
                        :label="t('importTargetInputSourceDepartment')"
                      />
                    </div>

                    <div class="action flex flex-center q-mt-md" style="">
                      <q-btn
                        class="q-mx-sm"
                        color="primary"
                        icon="update"
                        :label="t('funcUpdate')"
                        @click="
                          updateItemById(
                            expectedTree,
                            storeImportMucTieu.idUpdate,
                            storeImportMucTieu.objectUpdate
                          )
                        "
                      />
                      <q-btn
                        class="q-mx-sm"
                        color="red"
                        icon="delete"
                        :label="t('funcRemove')"
                        @click="
                          removeNodeById(
                            expectedTree,
                            storeImportMucTieu.idUpdate
                          )
                        "
                      />
                    </div>
                  </div>

                  <div
                    v-else
                    class="fixed-content fixed z-max q-px-sm full-height q-mt-sm"
                    style="
                      width: 64%;
                      overflow-y: scroll;
                      overflow-x: hidden;
                      max-height: 65vh;
                    "
                  >
                    <div
                      class="flex full-width q-my-none q-py-none"
                      style="align-items: center"
                    >
                      <q-icon
                        name="arrow_back_ios"
                        color="black"
                        size="md"
                        class="cursor-pointer"
                        @click="
                          storeImportMucTieu.isShowFormAddNewStructure = false
                        "
                        style="width: 5%"
                      />

                      <div
                        class="flex"
                        style="
                          width: 80%;
                          align-items: center;
                          white-space: nowrap;
                        "
                      >
                        <span class="text-h6 q-py-none q-my-none">
                          {{ t("importTargetTitleAdd") }}:
                        </span>
                        <q-badge
                          color="primary"
                          class="text-subtitle1"
                          outline
                          :label="storeImportMucTieu.updateLabel"
                        />
                      </div>

                      <q-form
                        @submit="
                          createNodeById(
                            expectedTree,
                            storeImportMucTieu.idUpdate,
                            storeImportMucTieu.objectAdd
                          )
                        "
                        style="width: 100%"
                      >
                        <q-input
                          type="text"
                          :label="t('importTargetInputTargetName')"
                          v-model="storeImportMucTieu.objectAdd.name"
                          outlined
                          class="q-mt-md"
                          :rules="[
                            (val) => !!val || $t('funcInputWarningFillData'),
                          ]"
                        />

                        <q-input
                          type="text"
                          :label="t('importTargetInputDesc')"
                          v-model="
                            storeImportMucTieu.objectAdd.methodAndCalDescription
                          "
                          outlined
                          :rules="[
                            (val) => !!val || $t('funcInputWarningFillData'),
                          ]"
                        />

                        <q-select
                          v-model="storeImportMucTieu.objectAdd.idAssign"
                          outlined
                          :options="storeImportMucTieu.companyData"
                          option-value="techName"
                          option-label="name"
                          :label="t('importTargetInputAssign')"
                          :rules="[
                            (val) => !!val || $t('funcInputWarningFillData'),
                          ]"
                        />

                        <div class="row">
                          <q-select
                            v-model="
                              storeImportMucTieu.objectAdd.targetTypeName
                            "
                            :options="storeImportMucTieu.targetTypeData"
                            :label="t('importTargetInputType')"
                            option-label="name"
                            option-value="_id"
                            outlined
                            :rules="[
                              (val) => !!val || $t('funcInputWarningFillData'),
                            ]"
                            class="col"
                          />

                          <q-select
                            v-model="storeImportMucTieu.objectAdd.formulaName"
                            :options="storeImportMucTieu.formulaData"
                            :label="t('importTargetInputFormula')"
                            option-label="name"
                            option-value="_id"
                            outlined
                            :rules="[
                              (val) => !!val || $t('funcInputWarningFillData'),
                            ]"
                            class="col q-px-sm"
                          />

                          <q-select
                            v-model="
                              storeImportMucTieu.objectAdd.frequencyMeasure
                            "
                            :options="storeImportMucTieu.frequencyData"
                            :label="t('importTargetInputFrequency')"
                            option-label="name"
                            option-value="_id"
                            outlined
                            :rules="[
                              (val) => !!val || $t('funcInputWarningFillData'),
                            ]"
                            class="col"
                          />
                        </div>

                        <div class="row">
                          <q-input
                            type="text"
                            :label="t('importTargetInputDepartment')"
                            v-model="storeImportMucTieu.objectAdd.measureName"
                            outlined
                            class="col"
                            :rules="[
                              (val) => !!val || $t('funcInputWarningFillData'),
                            ]"
                          />

                          <q-input
                            type="text"
                            :label="t('importTargetInputUnit')"
                            v-model="storeImportMucTieu.objectAdd.unit"
                            outlined
                            class="col q-px-sm"
                            :rules="[
                              (val) => !!val || $t('funcInputWarningFillData'),
                            ]"
                          />
                          <q-input
                            type="number"
                            :label="t('importTargetInputImportance')"
                            v-model="
                              storeImportMucTieu.objectAdd.importanceLevel
                            "
                            outlined
                            class="col"
                            :rules="[
                              (val) => !!val || $t('funcInputWarningFillData'),
                            ]"
                          />
                        </div>

                        <div class="row">
                          <q-input
                            type="number"
                            :label="t('importTargetInputDefaultValue')"
                            v-model="storeImportMucTieu.objectAdd.defaultValue"
                            outlined
                            class="col"
                            :rules="[
                              (val) => !!val || $t('funcInputWarningFillData'),
                            ]"
                          />

                          <q-input
                            type="number"
                            :label="t('importTargetInputMinValue')"
                            v-model="storeImportMucTieu.objectAdd.minValue"
                            outlined
                            class="col q-px-sm"
                            :rules="[
                              (val) => !!val || $t('funcInputWarningFillData'),
                            ]"
                          />

                          <q-input
                            v-model="
                              storeImportMucTieu.objectAdd.documentSource
                            "
                            outlined
                            type="text"
                            class="col"
                            :label="t('importTargetInputSourceDepartment')"
                          />
                        </div>

                        <div class="action flex flex-center">
                          <q-btn
                            class="q-mx-sm q-mt-sm z-max"
                            color="green"
                            :label="t('funcAdd')"
                            type="submit"
                          />
                        </div>
                      </q-form>
                    </div>
                  </div>
                </template>
              </q-splitter>
            </div>
          </q-layout>

          <q-layout
            view="lhh LpR lff"
            container
            style="
              min-height: 67vh;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            "
            class="flex flex-center justify-center center full-height"
            v-else
          >
            <BlankComponent dataContent="Chưa có dữ liệu !"></BlankComponent>
          </q-layout>
        </q-step>

        <!-- <template v-slot:navigation>
          <q-stepper-navigation
            style="display: flex; justify-content: flex-end"
          >
            <q-btn
              @click="
                $refs.stepper.next(),
                  step === 3 ? divideArray(excelData, 0, endValue) : ''
              "
              class="bg_defaultColor"
              :label="step === 3 ? 'Import' : 'Tiếp tục'"
            />
            <q-btn
              v-if="step > 1"
              flat
              color="primary"
              @click="$refs.stepper.previous()"
              label="Trở về"
              class="q-ml-sm"
            />
          </q-stepper-navigation>
        </template> -->

        <template v-slot:navigation>
          <hr style="background-color: #f5f5f5 !important; height: 1px" />
          <q-stepper-navigation
            class="q-mt-md"
            style="display: flex; justify-content: flex-end"
          >
            <q-btn
              v-if="step !== 3"
              @click="$refs.stepper.next(), divideArray(excelData, 0, endValue)"
              class="bg_defaultColor"
              :label="t('funcContinue')"
            />
            <!-- :disable="disableContinueButton" -->

            <q-btn
              v-if="step === 3"
              @click="storeImportMucTieu.postImportTargetData()"
              class="bg_defaultColor"
              label="Import"
              :disable="!expectedTree.length"
            />

            <q-btn
              v-if="step > 1"
              flat
              color="primary"
              @click="$refs.stepper.previous()"
              :label="t('funcBack')"
              class="q-ml-sm"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </div>
  </div>
</template>

<style lang="scss" scoped>
body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

#drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}

#drop-zone.highlight {
  border-color: #2196f3;
}

input[type="file"] {
  display: none;
}

.fixed-content {
  position: fixed;
  top: 8%; /* Adjust as needed */
  right: 0; /* Adjust as needed */
  width: 300px; /* Adjust as needed */
  padding: 16px;
  background-color: white;
  /* Add any other styles as needed */
}
</style>

<style>
.q-stepper .q-stepper__step-inner {
  padding-bottom: 15px !important;
}

.q-layout-container > div > div {
  max-height: none;
}
</style>
