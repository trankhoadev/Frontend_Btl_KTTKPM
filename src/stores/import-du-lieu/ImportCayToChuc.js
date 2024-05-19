import { defineStore } from "pinia";
import { Loading, Notify, QSpinnerTail } from "quasar";
import { api } from "src/boot/axios";
import * as XLSX from "xlsx";

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

export const useImportCayToChucStore = defineStore("importCayToChucStore", {
  state: () => ({
    listDataCompanyStructure: [],
    organizationalData: [],
    treeFilter: "",
    treeSelected: "",
    treeSelectedId: "",
    treeSelectedData: [],
    companyTreeData: "",
    idUpdate: "",
    newLabel: "",
    newObject: {
      jobName: "",
      employeeName: "",
      employeeId: "",
    },
    objectUpdate: {},
    objectAdd: {},
    labelRemoveName: "",
    isShowBackToTop: false,
    isShowFormAddNewStructure: false,
  }),
  actions: {
    async getInit() {
      await this.getAllDataCompanyStructure();
      await this.createCompanyTree();
    },

    async getAllDataCompanyStructure() {
      try {
        const url = "struct-levels/";
        const result = await api.get(url);

        if (result.status === 200) {
          this.listDataCompanyStructure = result.data.data;
        }
      } catch (err) {
        console.log(
          "Internal Server Error (getAllDataCompanyStructure()): ",
          err
        );
      }
    },

    async createCompanyTree() {
      try {
        await this.getAllDataCompanyStructure();

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
        console.log("Internal Server Error (createCompanyTree()): ", err);
      }
    },

    async postImportCompanyData() {
      Loading.show({
        spinner: QSpinnerTail,
      });
      try {
        const data = this.companyTreeData;
        const url = "import-excel/company-structs";

        const result = await api.post(url, data[0]);
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
            message: result.data.message,
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

    async generateExcelFileWithCompanyTechName(arr) {
      function flattenStructure(data, parentArr = []) {
        let result = [];

        for (let item of data) {
          let nestedArr = [...parentArr, item.name];

          result.push({
            techName: item.techName,
            name: item.name,
            nestedArr,
          });

          if (item.children && item.children.length > 0) {
            result = result.concat(flattenStructure(item.children, nestedArr));
          }
        }

        return result;
      }

      const arrResult = flattenStructure(arr);

      function createExcelFile(data) {
        const workbook = XLSX.utils.book_new();
        const allData = [];

        // Iterate over each node in the data
        for (const node of data) {
          allData.push([node.techName, ...node.nestedArr]);
        }

        const worksheetData = allData;
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths based on content length
        const colWidths = worksheetData[0].map((col, index) => {
          const maxLen = Math.max(
            ...worksheetData.map((row) => String(row[index] || "").length)
          );
          return { wch: maxLen };
        });

        // Set column widths
        worksheet["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachMaPhongBan");

        // Write the workbook to a file
        XLSX.writeFile(workbook, "MaPhongBan.xlsx");
      }
      createExcelFile(arrResult);
    },
  },
});
