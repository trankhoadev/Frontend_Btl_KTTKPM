import { defineStore } from "pinia";
import { Loading, Notify, QSpinnerTail } from "quasar";
import { api } from "src/boot/axios";

function buildTree(data, parentId = "") {
  const result = [];
  data.forEach((item) => {
    if (item.parentId === parentId) {
      const children = buildTree(data, item._id);
      if (children.length) {
        item.children = children;
      }
      result.push(item);
    }
  });
  return result;
}

export const useStoreImportMucTieu = defineStore("storeImportMucTieu", {
  state: () => ({
    listDataCompanyStructure: [],
    organizationalData: [],
    treeFilter: "",
    treeSelected: "",
    idUpdate: "",
    newLabel: "",
    updateLabel: "",
    labelRemoveName: "",
    isShowBackToTop: false,
    isShowFormAddNewStructure: false,
    targetTreeData: [],
    objectUpdate: {},
    objectAdd: {},
    labelRemoveName: "",
    isShowBackToTop: false,
    isShowFormAddNewStructure: false,

    /* Handle import file variable */
    targetTypeData: [],
    formulaData: [],
    frequencyData: [],
    companyData: [],
  }),
  actions: {
    async getInit() {
      // await this.getAllTargetData();
      // await this.createTargetTree();
    },
    async createTargetTree() {
      try {
        await this.getAllTargetData();

        this.listDataCompanyStructure = this.listDataCompanyStructure.map(
          (item) => {
            return {
              ...item,
              label: item.name,
            };
          }
        );

        for (let a = 0; a < this.listDataCompanyStructure.length; a++) {
          if (this.listDataCompanyStructure[a].level === 1) {
          } else {
            const parentId = this.listDataCompanyStructure.find(
              (find) =>
                find.level === this.listDataCompanyStructure[a].level - 1
            )._id;
            this.listDataCompanyStructure[a].parentId = parentId;
          }
        }

        this.organizationalData = buildTree(this.listDataCompanyStructure, "");
      } catch (err) {
        console.log("Internal Server Error (createTargetTree()): ", err);
      }
    },

    async postImportTargetData() {
      Loading.show({
        spinner: QSpinnerTail,
      });
      try {
        const data = this.targetTreeData;
        const url = "import-excel/targets";

        /* Remove all base node element for example like: TC, QT... */
        const filterData = (data) => {
          return data.reduce((acc, item) => {
            if (item.level === 0) {
              acc.push(...item.children);
            } else {
              if (item.children && item.children.length > 0) {
                item.children = filterData(item.children);
              }
              acc.push(item);
            }
            return acc;
          }, []);
        };

        const dataFilter = filterData(data);
        // console.log(JSON.stringify(dataFilter, null, 2));
        // return;

        const result = await api.post(url, dataFilter);
        console.log(result);

        if (result.data.status === 200) {
          Notify.create({
            message: "Import thành công !",
            position: "top",
            color: "green",
          });

          setTimeout(() => {
            window.location.reload();
            Loading.hide();
          }, 1500);
        } else {
          Notify.create({
            message: `Import thất bại: ${result.data.message}`,
            position: "top",
            color: "red",
          });
          Loading.hide();
        }
      } catch (err) {
        console.error("Internal Server Error: ", err);
        Loading.hide();
      }
    },
  },
});
