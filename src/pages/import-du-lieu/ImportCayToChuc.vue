<script setup>
import { ref, onMounted, watch } from "vue";

/* Quasar */
import { useI18n } from "vue-i18n";
import { Dialog, Notify } from "quasar";

/* Pinia Store */
import { useUtilStore } from "@/stores/dataStore";
import { useSettingStore } from "@/stores/extra/SettingStore.js";
import { useImportCayToChucStore } from "@/stores/import-du-lieu/ImportCayToChuc.js";

/* Component */
import BlankComponent from "src/components/base/BlankComponent.vue";

/* Third library */
const { t } = useI18n();
import * as XLSX from "xlsx";
import { useRouter } from "vue-router";

const storeInit = useUtilStore();
const storeCayToChuc = useImportCayToChucStore();
const storeSetting = useSettingStore();
const router = useRouter();

const step = ref(1);
const excelData = ref(null);
const splitterModel = ref(35);
const radioPage = ref("unit");

const inputXLSX = ref(null);

// let arrStructure = [];
// let arrInformation = [];
const endValue = ref();
const expectedTree = ref([]);

onMounted(async () => {
  storeSetting.routerHref = router.currentRoute._rawValue.href;
  await storeCayToChuc.getInit();
  endValue.value = storeCayToChuc.listDataCompanyStructure.length - 1;
});

/**
 * NAME: BUILD TREE BY EXCEL
 * DESC: Handle get data from excel file read data based on start and end value (automatically get from company structure level)
 * @param {*} arr       ARRAY
 * @param {*} start     NUMBER
 * @param {*} end       NUMBER
 * @returns
 * @author TRAN ANH KHOA
 */
const divideArray = (arr, start, end) => {
  let arrStructure = [];
  let arrInformation = [];

  arr?.map((i) => {
    arrStructure.push(i.slice(start, end + 1));
    arrInformation.push(i.slice(end + 1, i.length));
  });

  let length = arrStructure[0]?.length;

  arrStructure.map((i, index) => {
    i[length] = arrInformation[index];
  });

  buildTree(arrStructure);
};

/**
 * NAME: BUILD TREE FROM EXCEL DATA
 * DESC: After got data from handle excel file, will have json array. Then handle get tree data.
 * @param {*} arr
 * @returns
 * @author TRAN ANH KHOA
 */
const buildTree = (arr) => {
  // console.log(JSON.stringify(arr, null, 2));
  let resultGenerate = [];
  arr.map((item, index) => {
    item.map((j, indexJ) => {
      if (j) {
        let isStaff = typeof j == "object" ? true : false;
        !isStaff
          ? resultGenerate.push({
              id:
                index + indexJ + Math.floor(Math.random() * (1000000 - 1 + 1)),
              label: isStaff ? j.join(" - ") : j,
              level: indexJ + 1,
              isStaff: isStaff,
              data: isStaff
                ? {
                    jobTitleName: j[0],
                    name: j[1],
                    code: j[2],
                  }
                : {},
            })
          : [];
      }
    });
  });

  function createTreeFromLevels(arr) {
    expectedTree.value = [];

    function createNestedArray(data) {
      console.log(data);
      const nestedArray = [];

      function buildNestedArray(startIndex) {
        const node = { ...data[startIndex], children: [] };
        let i = startIndex + 1;

        while (i < data.length) {
          if (data[i].level > node.level && !data.isStaff) {
            const [child, nextIndex] = buildNestedArray(i);
            node.children.push(child);
            i = nextIndex;
          } else {
            break;
          }
        }

        return [node, i];
      }

      let i = 0;
      while (i < data.length) {
        const [node, nextIndex] = buildNestedArray(i);
        nestedArray.push(node);
        i = nextIndex;
      }

      return nestedArray;
    }

    const nestedArray = createNestedArray(arr);
    // console.log(JSON.stringify(nestedArray, null, 2));

    return nestedArray;
  }

  expectedTree.value = createTreeFromLevels(resultGenerate);
  // console.log(JSON.stringify(expectedTree.value, null, 2));
  storeCayToChuc.companyTreeData = [...expectedTree.value];
};

/**
 * NAME: READ FILE EXCEL
 * DESC: Read excel file user gave and then figure out tree data.
 * @returns
 * @author TRAN ANH KHOA
 */
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

/**
 * NAME: GENERA TEMPLATE EXCEL
 * DESC: Depends on Company structure then function will generate corresponding excel file.
 * @returns
 */
const generateTemplateExcel = () => {
  const companyTreeStructure = storeCayToChuc.listDataCompanyStructure.map(
    (item) => item.name
  );
  // .slice(0, -1); // TODO: sau này, khi xóa "Chức danh" đi, thì không cần slice nữa!!!

  // const otherColumns = ["Chức danh", "Nhân viên", "MSNV"];

  // const templateHeader = companyTreeStructure.concat(otherColumns)
  const templateHeader = [...companyTreeStructure];

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

/**
 * NAME: FIND NODE BY ID
 * DESC: Use
 * @param {*} tree
 * @param {*} label
 * @returns
 * @author TRAN ANH KHOA
 */
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

/**
 * NAME: CREATE TREE NODE
 * DESC: The mechanism of this function is create new Node in tree UI, interact real time with tree data.
 * @param {*} inputData             ARRAY
 * @param {*} id                    STRING
 * @param {*} newLabel              STRING or OBJECT
 * @returns new Array with value already added.
 * @author TRAN ANH KHOA
 */
const createNodeById = (inputData, id, newLabel) => {
  function updateNode(node) {
    if (node.id === id) {
      const newId = Math.floor(Math.random() * (1000000 - 1 + 1));

      const newNode =
        typeof newLabel == "string"
          ? {
              label: newLabel,
              id: newId,
              children: [],
              data: {},
              isStaff: false,
              level: +(node.level + 1),
            }
          : {
              label: `${storeCayToChuc.newObject.jobName} - ${storeCayToChuc.newObject.employeeName} - ${storeCayToChuc.newObject.employeeId}`,
              id: newId,
              children: [],
              data: {
                jobTitleName: storeCayToChuc.newObject.jobName,
                name: storeCayToChuc.newObject.employeeName,
                code: storeCayToChuc.newObject.employeeId,
              },
              isStaff: true,
              level: +(node.level + 1),
            };

      /* Remove input data after add successfully */
      storeCayToChuc.newObject = [];

      node.children.push(newNode);

      return node;
    }

    if (node.children && node.children.length > 0) {
      node.children = node.children.map(updateNode);
    }

    return node;
  }

  const updatedData = JSON.parse(JSON.stringify(inputData));

  const result = updateNode(updatedData[0]);

  expectedTree.value = [result];

  Notify.create({
    message: "Thêm thành công !",
    position: "top",
    color: "green",
  });

  storeCayToChuc.newLabel = "";
};

/**
 * NAME: UPDATE NODE BY ID
 * DESC: The mechanism of this function is find node in tree by id. After that update node with new value.
 * @param {*} inputData             ARRAY
 * @param {*} id                    STRING
 * @param {*} newLabel              STRING or OBJECT
 * @returns new Array with value already updated.
 * @author TRAN ANH KHOA
 */
const updateNodeById = (inputData, id, newLabel) => {
  if (typeof newLabel == "string") {
    function findAndReplace(item) {
      if (item.id === id) {
        item.label = newLabel;
      } else if (item.children) {
        item.children.forEach(findAndReplace);
      }
    }

    inputData.forEach(findAndReplace);
  } else {
    function findAndReplace(item) {
      if (item.id === id) {
        let nameLabel = `${item.data.jobTitleName} - ${item.data.name} - ${item.data.code}`;
        item.label = nameLabel;
      } else if (item.children) {
        item.children.forEach(findAndReplace);
      }
    }
    inputData.forEach(findAndReplace);
  }
};

/**
 * NAME: REMOVE NODE BY ID
 * DESC: The mechanism of this function is find node in tree by id. After that remove node with new value.
 * @param {*} inputData           ARRAY
 * @param {*} id                  STRING
 * @returns new Array with value already removed.
 */
function removeNodeById(inputData, id) {
  Dialog.create({
    message: `Xác nhận xóa dữ liệu tổ chức: <b>${storeCayToChuc.labelRemoveName}</b> ?`,
    html: true,
    ok: true,
    cancel: true,
  })
    .onOk(() => {
      removeFromData(inputData, id);
      storeCayToChuc.updateLabel = "";
      Notify.create({
        message: "Xóa thành công !",
        position: "top",
        color: "green",
      });
    })
    .onCancel(() => {});
}

function removeFromData(data, id) {
  for (let i = 0; i < data.length; i++) {
    const currentNode = data[i];

    if (currentNode.id === id) {
      // Remove the node if the id matches
      data.splice(i, 1);
      return;
    }

    if (currentNode.children && currentNode.children.length > 0) {
      // Recursively search in children
      removeFromData(currentNode.children, id);

      // Remove the parent node if it has no children after removal
      if (currentNode.children.length === 0) {
        delete currentNode.children;
      }
    }
  }
}

watch(
  () => storeCayToChuc.treeSelectedId,
  (val) => {
    const selectedItem = findNodeById(expectedTree.value, val);
    storeCayToChuc.treeSelectedData = selectedItem;
    storeCayToChuc.isShowFormAddNewStructure = false;

    if (selectedItem) {
      storeCayToChuc.updateLabel = selectedItem.label;
      storeCayToChuc.labelRemoveName = selectedItem.label;
      if (selectedItem.id) {
        storeCayToChuc.idUpdate = selectedItem.id;
      }
    }
  }
);
</script>

<template>
  <div class="q-pa-md wrapper" style="height: 90vh">
    <q-banner
      v-if="!storeCayToChuc.organizationalData.length"
      inline-actions
      rounded
      class="bg-orange text-white q-mb-lg"
    >
      <span style="font-size: 15px">{{
        t("importStructWarningNotHaveDataStruct")
      }}</span>

      <template v-slot:action>
        <router-link to="/structure/level">
          <q-btn class="bg_defaultColor" push :label="t('funcGoToPage')"
        /></router-link>
        <!-- <q-btn flat label="Bỏ qua" /> -->
      </template>
    </q-banner>

    <q-banner
      v-if="storeInit.companyStructureData.length"
      inline-actions
      rounded
      class="bg-orange text-white q-mb-lg"
    >
      <span style="font-size: 15px">{{
        t("importStructWarningFinishedImport")
      }}</span>

      <template v-slot:action>
        <div
          class="cursor-pointer text-bold"
          @click="
            storeCayToChuc.generateExcelFileWithCompanyTechName(
              storeInit.organizationalData
            )
          "
        >
          <q-icon name="download" size="md" /> {{ t("funcDownload") }}
        </div>
      </template>
    </q-banner>

    <div class="q-gutter-y-md q-mt-lg" style="max-width: 100vw">
      <q-stepper v-model="step" ref="stepper" color="primary" animated>
        <q-step
          :name="1"
          :title="t('importStructTitleStep1')"
          caption="Optional"
          icon="create_new_folder"
          :done="step > 1"
        >
          <div class="text-h4 text-bold q-mb-lg">
            {{ t("importStructTitleH1") }}
          </div>
          <q-tree
            v-if="storeCayToChuc.organizationalData.length"
            class="full-height"
            full-height
            :nodes="storeCayToChuc.organizationalData"
            node-key="_id"
            selected-color="primary"
            v-model:selected="storeCayToChuc.treeSelectedId"
            default-expand-all
          >
          </q-tree>

          <q-banner inline-actions rounded class="q-mt-lg bg-grey-3 text-white">
            <p
              class="text-primary cursor-pointer text-subtitle1"
              @click="generateTemplateExcel"
            >
              {{ t("importStructDownloadText") }}
            </p>
            <span class="text-black text-subtitle1">{{
              t("importStructDownloadDescription")
            }}</span>
          </q-banner>
        </q-step>

        <q-step
          :name="2"
          :title="t('importStructTitleStep2')"
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
          :title="t('importStructTitleStep3')"
          icon="assignment"
          :done="step > 3"
        >
          <q-layout
            view="lhh LpR lff"
            container
            style="
              min-height: 60vh;
              flex-direction: column;
              justify-content: flex-start;
            "
            class="q-py-none flex column justify-between"
            v-if="expectedTree.length > 0"
          >
            <div
              class="fixed z-max q-px-sm"
              style="width: 100%; opacity: 1; background-color: #fff; top: 0"
            >
              <q-input
                ref="filterRef"
                outlined
                clearable
                v-model="storeCayToChuc.treeFilter"
                :placeholder="t('funcTreeInputStruct')"
              >
              </q-input>
            </div>

            <div class="q-pa-md" style="margin-top: 5vh">
              <q-splitter v-model="splitterModel" style="min-height: 100vh">
                <template v-slot:before>
                  <q-tree
                    v-if="expectedTree.length"
                    default-expand-all
                    :filter="storeCayToChuc.treeFilter"
                    no-transition
                    node-key="id"
                    selected-color="primary"
                    debounce="300"
                    :nodes="expectedTree"
                    v-model:selected="storeCayToChuc.treeSelectedId"
                    style="overflow-y: scroll; height: 55vh"
                  >
                  </q-tree>

                  <q-page-sticky position="bottom" :offset="[18, 18]">
                    <q-btn
                      @click="storeCayToChuc.isShowFormAddNewStructure = true"
                      fab
                      style="margin-right: 35vw"
                      icon="add"
                      color="green"
                    />
                  </q-page-sticky>
                </template>

                <template v-slot:after>
                  <div
                    class="fixed-content fixed z-max q-px-sm full-height"
                    style="width: 63%"
                    v-if="!storeCayToChuc.isShowFormAddNewStructure"
                  >
                    <div
                      v-if="!storeCayToChuc.treeSelectedData.isStaff"
                      class="flex column col full-width"
                    >
                      <span class="text-h4 q-py-md"
                        >{{ t("importStructTitleShowDefault") }}
                      </span>

                      <q-input
                        type="text"
                        :label="t('importStructStructName')"
                        v-model="storeCayToChuc.updateLabel"
                        class="q-mt-md"
                        outlined
                      />
                    </div>

                    <div v-else class="flex column col full-width">
                      <span class="text-h4 q-py-md"
                        >{{ t("importStructTitleShowDefault") }}
                      </span>

                      <q-input
                        type="text"
                        :label="t('importStructJobName')"
                        v-model="
                          storeCayToChuc.treeSelectedData.data.jobTitleName
                        "
                        class="q-mt-md"
                        outlined
                      />

                      <q-input
                        type="text"
                        :label="t('importStructEmployeeName')"
                        v-model="storeCayToChuc.treeSelectedData.data.name"
                        class="q-mt-md"
                        outlined
                      />

                      <q-input
                        type="text"
                        :label="t('importStructEmployeeCode')"
                        v-model="storeCayToChuc.treeSelectedData.data.code"
                        class="q-mt-md"
                        outlined
                      />
                    </div>

                    <div class="action flex flex-center" style="height: 20vh">
                      <q-btn
                        class="q-mx-sm"
                        color="primary"
                        icon="update"
                        :label="t('funcUpdate')"
                        @click="
                          !storeCayToChuc.treeSelectedData.isStaff
                            ? updateNodeById(
                                expectedTree,
                                storeCayToChuc.idUpdate,
                                storeCayToChuc.updateLabel
                              )
                            : updateNodeById(
                                expectedTree,
                                storeCayToChuc.idUpdate,
                                storeCayToChuc.treeSelectedData
                              )
                        "
                      />
                      <q-btn
                        class="q-mx-sm"
                        color="red"
                        icon="delete"
                        :label="t('funcRemove')"
                        @click="
                          removeNodeById(expectedTree, storeCayToChuc.idUpdate)
                        "
                      />
                    </div>
                  </div>

                  <div
                    v-else
                    class="fixed-content fixed z-max q-px-sm full-height"
                    style="width: 63%"
                  >
                    <q-icon
                      name="arrow_back_ios"
                      color="black"
                      size="md"
                      class="q-my-md cursor-pointer"
                      @click="storeCayToChuc.isShowFormAddNewStructure = false"
                    />

                    <div class="flex column">
                      <div class="flex">
                        <q-radio
                          v-model="radioPage"
                          val="unit"
                          :label="t('importStructCheckboxUnit')"
                          class="text-subtitle1"
                        />
                        <q-radio
                          v-model="radioPage"
                          val="job"
                          :label="t('importStructCheckboxJob')"
                          class="text-subtitle1 q-ml-md"
                        />
                      </div>
                    </div>

                    <div v-if="radioPage === 'unit'">
                      <p class="text-h5 q-mt-sm">
                        {{ t("importStructTextTitleAdd") }}:
                        {{ storeCayToChuc.updateLabel }}
                      </p>

                      <q-input
                        type="text"
                        :label="t('importStructInput')"
                        v-model="storeCayToChuc.newLabel"
                        outlined
                      />
                      <div class="action flex flex-center" style="height: 20vh">
                        <q-btn
                          class="q-mx-sm"
                          color="green"
                          :label="t('funcAdd')"
                          :disable="storeCayToChuc.treeSelectedData.isStaff"
                          @click="
                            createNodeById(
                              expectedTree,
                              storeCayToChuc.idUpdate,
                              storeCayToChuc.newLabel
                            )
                          "
                        />
                      </div>
                    </div>

                    <div v-else>
                      <p class="text-h5 q-mt-sm">
                        {{ t("importStructTextJobTitleAdd") }}:
                        {{ storeCayToChuc.updateLabel }}
                      </p>

                      <div class="row flex">
                        <q-input
                          type="text"
                          :label="t('importStructJobName')"
                          v-model="storeCayToChuc.newObject.jobName"
                          outlined
                          class="col"
                        />

                        <q-input
                          type="text"
                          :label="t('importStructEmployeeName')"
                          v-model="storeCayToChuc.newObject.employeeName"
                          class="q-mx-sm col"
                          outlined
                        />

                        <q-input
                          type="text"
                          :label="t('importStructEmployeeCode')"
                          v-model="storeCayToChuc.newObject.employeeId"
                          outlined
                          class="col"
                        />
                      </div>
                      <div class="action flex flex-center" style="height: 20vh">
                        <q-btn
                          class="q-mx-sm"
                          color="green"
                          :label="t('funcAdd')"
                          :disable="storeCayToChuc.treeSelectedData.isStaff"
                          @click="
                            createNodeById(
                              expectedTree,
                              storeCayToChuc.idUpdate,
                              storeCayToChuc.newObject
                            )
                          "
                        />
                      </div>
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

        <template v-slot:navigation>
          <hr
            class="q-mt-md"
            style="background-color: #f5f5f5 !important; height: 1px"
          />
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
            <!-- :disable="storeInit.companyStructureData.length ? true : false" -->

            <q-btn
              v-if="step === 3"
              @click="storeCayToChuc.postImportCompanyData()"
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
// * {
//   overflow-y: hidden !important;
// }

body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  // overflow-y: hidden;
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

.q-stepper .q-stepper__step-inner {
  padding-bottom: 15px !important;
  overflow-y: hidden;
}
</style>
