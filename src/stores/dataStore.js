import { defineStore } from "pinia";
import { api } from "src/boot/axios";
import { ref } from "vue";
import { Notify } from "quasar";

/* FUNCTIONAL FUNCTION */
function findAllAncestors(data, itemId) {
  function findAncestorsRecursive(currentData, parentId) {
    const ancestors = [];
    for (const item of currentData) {
      if (item._id === parentId) {
        ancestors.push(item);
        if (item.parentId) {
          ancestors.push(...findAncestorsRecursive(data, item.parentId));
        }
        break;
      }
    }
    return ancestors;
  }

  const item = data.find((item) => item._id === itemId);
  if (item && item.parentId) {
    return findAncestorsRecursive(data, item.parentId);
  }

  return [];
}

export const useUtilStore = defineStore("dataStore", {
  state: () => ({
    dataTableTargetView: [],
    splitterModelDynamic: ref(100),
    showTargetPanel: false,
    listTargetView: [],
    treeFilter: "",
    targetFilter: "",
    filter: "",
    companyStructIdChoose: "",
    listTermSort: [],
    termSortSelected: "",
    dataSortTemp: [],
    treeSelected: "1",
    tickedTree: [],
    isHiddenButtonSave: false,
    isMoreThanTwoItems: false,
    showCreateDialog: false,
    showTargetBulkInsertDialog: false,
    showTargetBulkCreateDialog: false,
    isParentTarget: false,
    objCreateTargetKpiByTime: {
      timeId: "",
      targetId: "",
      minTargetValue: "0",
      excuteValue: "",
      note: "",
      defaultValue: "",
    },
    arrTargetKpiByTime: [],
    parentCompanyForCreate: [],
    objCompanyCreate: {
      companyLevelStruct: "",
      techName: "",
      parentInfo: "",
      name: "",
      description: "",
      userCreate: "",
      userUpdate: "",
      isDisable: false,
    },
    arrCalSelect: ["Trung bình cộng", "Lớn nhất", "Tổng"],
    arrTargetTypeSelect: [],
    objTargetCreate: {
      name: "",
      description: "",
      techName: "",
      level: "",
      descriptionMethodCal: "",
      unit: "",
      unitDescription: "",
      frequencyMeasure: "",
      measureSourceId: "",
      parentId: "",
      cal: "",
      calDescriptionId: "",
      staticValue: "",
      defaultValue: "",
      minValue: "",
      weight: "",
      note: "",
      isDiable: false,
    },
    targetSelected: "",
    targetCreateSelected: [],
    breadcrumbsIdList: [],
    idParent: "",
    organizationalData: [],

    /* BACKEND DATA FOR HANDLE SOMETHING HERE */
    companyStructureData: [],
    companyStructLevelData: [],
    timeKpiData: [],
    arrCheckData: [],
    targetSelectedView: {},

    dataTargetView: [],
    targetGetOne: [],
    nameTargetSelected: "",
    listJobData: [],

    /* Target Data here */
    limitLength: 10000,
    targetData: [],
    oneTargetData: [],
    targetDataTree: [],
    targetTypeData: [],
    assignBetweenTargetAndCompanyData: [],
    limitTopValue: 120,
    isChangeData: false,
    arrMonthSelectBox: [],

    /* Formula */
    formulaData: [],

    /* Frequency */
    frequencyData: [],

    /* authorization */
    listRoles: [],
    listPermissions: [],
    targetDataCourseTickedData: [],
    targetDataCourse: [
      {
        label: "2021",
        id: "year_2021",
        level: 1,
        children: [
          {
            label: "Phân tích thiết kế hệ thống",
            id: "course_1",
            level: 2,
            children: [
              {
                label: "Thứ 2: 9:00 - 11:00",
                id: "time_1",
                level: 3,
              },
              {
                label: "Thứ 4: 13:00 - 15:00",
                id: "time_2",
                level: 3,
              },
            ],
          },
          {
            label: "Lập trình hướng đối tượng",
            id: "course_2",
            level: 2,
            children: [
              {
                label: "Thứ 3: 10:00 - 12:00",
                id: "time_3",
                level: 3,
              },
              {
                label: "Thứ 5: 14:00 - 16:00",
                id: "time_4",
                level: 3,
              },
            ],
          },
        ],
      },
      {
        label: "2022",
        id: "year_2022",
        level: 1,
        children: [
          {
            label: "Kỹ thuật lập trình",
            id: "course_3",
            level: 2,
            children: [
              {
                label: "Thứ 2: 8:00 - 10:00",
                id: "time_5",
                level: 3,
              },
              {
                label: "Thứ 4: 12:00 - 14:00",
                id: "time_6",
                level: 3,
              },
            ],
          },
          {
            label: "Cơ sở dữ liệu",
            id: "course_4",
            level: 2,
            children: [
              {
                label: "Thứ 3: 9:00 - 11:00",
                id: "time_7",
                level: 3,
              },
              {
                label: "Thứ 5: 13:00 - 15:00",
                id: "time_8",
                level: 3,
              },
            ],
          },
        ],
      },
      {
        label: "2023",
        id: "year_2023",
        level: 1,
        children: [
          {
            label: "Nhập môn trí tuệ nhân tạo",
            id: "course_5",
            level: 2,
            children: [
              {
                label: "Thứ 2: 10:00 - 12:00",
                id: "time_9",
                level: 3,
              },
              {
                label: "Thứ 4: 14:00 - 16:00",
                id: "time_10",
                level: 3,
              },
            ],
          },
          {
            label: "Kinh tế học",
            id: "course_6",
            level: 2,
            children: [
              {
                label: "Thứ 3: 8:00 - 10:00",
                id: "time_11",
                level: 3,
              },
              {
                label: "Thứ 5: 12:00 - 14:00",
                id: "time_12",
                level: 3,
              },
            ],
          },
        ],
      },
      {
        label: "2024",
        id: "year_2024",
        level: 1,
        children: [
          {
            label: "Quản trị dự án",
            id: "course_7",
            level: 2,
            children: [
              {
                label: "Thứ 2: 11:00 - 13:00",
                id: "time_13",
                level: 3,
              },
              {
                label: "Thứ 4: 15:00 - 17:00",
                id: "time_14",
                level: 3,
              },
            ],
          },
          {
            label: "Toán cao cấp",
            id: "course_8",
            level: 2,
            children: [
              {
                label: "Thứ 3: 11:00 - 13:00",
                id: "time_15",
                level: 3,
              },
              {
                label: "Thứ 5: 15:00 - 17:00",
                id: "time_16",
                level: 3,
              },
            ],
          },
        ],
      },
    ],
  }),
  // persist: {
  //   storage: localStorage,
  //   paths: ["targetData"],
  // },
  getters: {},
  actions: {
    async getInit() {
      await this.getCompanyTree();
      await this.getCompany();
      await this.getAllJob();
      await this.getAllTargetData();
      await this.getAllTargetType();
      await this.getAllFormula();
      await this.getAllFrequency();

      this.targetDataTree = this.buildTreeTarget(this.targetData);
      // await this.getTargetKpiTree();
      // await this.getTargetTypes();
      // await this.getTimeKpi();
      // await t                                                                                                                         his.getCompanyStructLevel();
      // await this.getTargetType();
    },
    async getCompanyTree() {
      const tree = await api.get("/company-structs/tree");

      if (tree.status === 200) {
        this.organizationalData = tree.data.data;
      }

      /* add label in every single nested node */
      function addLabel(node) {
        if (!node) return;

        node.label = node.name;

        if (node.children && node.children.length > 0) {
          for (let i = 0; i < node.children.length; i++) {
            addLabel(node.children[i]);
          }
        }
      }

      /* use for loop for traverse every node */
      for (let i = 0; i < this.organizationalData.length; i++) {
        addLabel(this.organizationalData[i]);
      }
    },
    async getCompany() {
      const companyData = await api.get("/company-structs");
      if (companyData.status === 200) {
        this.companyStructureData = companyData.data.data;
      }
    },
    /* TARGET */
    /* Get all target */
    async getAllTargetData() {
      try {
        const url = `/targets?limit=${this.limitLength}`;
        const result = await api.get(url);

        if (result.data.status === 200) {
          this.targetData = result.data.data;

          this.targetData = this.targetData.filter((i) => {
            if (!i.isDisable) return i;
          });
          this.targetDataTree = await this.buildTreeTarget(this.targetData);
        }
      } catch (err) {
        console.error("Internal Server Error: ", err);
      }
    },

    async getAllAssignOfCompany(companyId) {
      try {
        const url = `target-by-structs?structId=${companyId}`;

        const result = await api.get(url);

        if (result.data.status === 200) {
          return result.data.data;
        }
      } catch (err) {
        console.error("Internal Server Error getAllAssignOfCompany(): ", err);
      }
    },

    async getAllAssignOfCompanyInfo(companyId) {
      try {
        const url = `target-by-structs/target-info?structId=${companyId}`;

        const result = await api.get(url);

        if (result.data.status === 200) {
          return result.data.data;
        }
      } catch (err) {
        console.error("Internal Server Error getAllAssignOfCompany(): ", err);
      }
    },

    async getOneTargetById(id) {
      try {
        this.oneTargetData = [];
        switch (id) {
          case "-1":
            this.oneTargetData = {
              name: "Tài chính",
              label: "Tài chính",
              techName: "TC",
              isCorner: true,
            };
            return;

          case "-2":
            this.oneTargetData = {
              name: "Khách hàng",
              label: "Khách hàng",
              techName: "KH",
              isCorner: true,
            };
            return;

          case "-3":
            this.oneTargetData = {
              name: "Quy trình nội bộ",
              label: "Quy trình nội bộ",
              techName: "QT",
              isCorner: true,
            };
            return;

          case "-4":
            this.oneTargetData = {
              name: "Học hỏi và phát triển",
              label: "Học hỏi và phát triển",
              techName: "HH",
              isCorner: true,
            };
            return;
        }

        const url = `targets?_id=${id}`;
        const result = await api.get(url);

        if (result.data.status === 200) {
          /* Assign data to store variable */
          this.oneTargetData = result.data.data[0];

          /* Create more "targetType" property for handle q-select */
          this.targetTypeData.map((i) => {
            if (i._id === this.oneTargetData.targetTypeId) {
              this.oneTargetData.targetType = i;
            }
          });

          /* Create more "formula" property for handle q-select */
          this.formulaData.map((i) => {
            if (i._id === this.oneTargetData.formulaId) {
              this.oneTargetData.formula = i;
            }
          });

          /* Create more "frequencyMeasure" property for handle q-select */
          this.frequencyData.map((i) => {
            if (i._id === this.oneTargetData.frequencyMeasureId) {
              this.oneTargetData.frequencyMeasure = i;
            }
          });

          /* Get Parent name */
          if (this.oneTargetData.parentId) {
            let parentName = this.targetData
              .map((i) => {
                if (i._id === this.oneTargetData.parentId) {
                  return i.name;
                }
              })
              .filter((i) => i);

            this.oneTargetData.parentName = parentName;
          } else {
            switch (this.oneTargetData.beLongTo) {
              case "TC": {
                this.oneTargetData.parentName = "Tài chính";
                break;
              }

              case "KH": {
                this.oneTargetData.parentName = "Khách hàng";
                break;
              }

              case "QT": {
                this.oneTargetData.parentName = "Quy trình nội bộ";
                break;
              }

              case "HH": {
                this.oneTargetData.parentName = "Học hỏi và phát triển";
                break;
              }

              default:
            }
          }
          return true;
        } else {
          console.error(
            "Get Data Failed getOneTargetById(): ",
            result.data.message
          );
        }

        return false;
      } catch (err) {
        console.error("Internal Server Error getOneTargetById(): ", err);
        return false;
      }
    },

    /* Get Target Type */
    async getAllTargetType() {
      try {
        const url = "target-types";
        const result = await api.get(url);

        if (result.data.status === 200) {
          this.targetTypeData = result.data.data;
          this.targetTypeData = this.targetTypeData.filter((i) => {
            if (!i.isDisable) return i;
          });
        } else {
          console.error("Get error when get data in getAllTargetType()");
        }
      } catch (err) {
        console.error("Internal Server Error getAllTargetType(): ", err);
      }
    },

    /**
     * NAME: buildTreeTarget
     * DESC: function for handle create target tree based on q-tree Quasar Framework
     * @param {*} arr
     * @returns Json Nested Array data
     * @author Tran Anh Khoa
     */
    buildTreeTarget(arr, isHaveCompanyName = false) {
      function transformData(initialData) {
        const nodeMap = {};

        // Create a map for quick lookup using the '_id' property
        initialData.forEach((node) => {
          node.children = [];

          node.label = node.name;
          nodeMap[node._id] = node;

          isHaveCompanyName
            ? (node.label = `${node.techName} - ${node.name}`)
            : (node.label = node.name);
        });

        // Iterate through the arr to find and add children to their respective parents
        initialData.forEach((node) => {
          const parentId = node.parentId;

          if (parentId && nodeMap[parentId]) {
            node.label = node.name;
            nodeMap[parentId].children.push(node);
            // If parent node exists, add the current node as its child
            isHaveCompanyName
              ? (node.label = `${node.techName} - ${node.name}`)
              : (node.label = node.name);
          }
        });

        // Filter out arr that have a parentId (these are now children)
        const result = arr.filter((node) => !node.parentId);

        return result;
      }

      const dataExpect = transformData(arr);

      // const structureTarget = [
      //   {
      //     label: "Tài chính",
      //     children: [],
      //     level: 0,
      //     tech: "TC",
      //     _id: "-1",
      //     noTick: true,
      //   },

      //   {
      //     label: "Khách hàng",
      //     children: [],
      //     level: 0,
      //     tech: "KH",
      //     _id: "-2",
      //     noTick: true,
      //   },

      //   {
      //     label: "Quy trình nội bộ",
      //     children: [],
      //     level: 0,
      //     tech: "QT",
      //     _id: "-3",
      //     noTick: true,
      //   },

      //   {
      //     label: "Học hỏi và phát triển",
      //     children: [],
      //     level: 0,
      //     tech: "HH",
      //     _id: "-4",
      //     noTick: true,
      //   },
      // ];

      // structureTarget.forEach((i) => {
      //   dataExpect.map((j) => {
      //     if (i.tech === j.beLongTo) {
      //       i.children.push(j);
      //     }
      //   });
      // });

      return dataExpect;
    },

    /**
     * NAME: arrangeTargetData
     * DESC: The purpose of function for arrange target data fix in target corner: Tài chính, Khách hàng, Quy trình nội bộ, Học hỏi và phát triển
     * @param {*} arr : Array
     * @returns new Array already arranged
     * @author Tran Anh Khoa
     */
    arrangeTargetData(arr) {
      // console.log(JSON.stringify(arr, null, 2));
      try {
        let TC = [
            {
              _id: "-1",
              techName: "TC",
              name: "Tài chính",
              isCorner: true,
            },
          ],
          KH = [
            {
              _id: "-2",
              techName: "KH",
              name: "Khách hàng",
              isCorner: true,
            },
          ],
          QT = [
            {
              _id: "-3",
              techName: "QT",
              name: "Quy trình nội bộ",
              isCorner: true,
            },
          ],
          HH = [
            {
              _id: "-4",
              techName: "HH",
              name: "Học hỏi và phát triển",
              isCorner: true,
            },
          ];

        arr?.map((i, index) => {
          // i.index = index + 1;
          switch (i?.beLongTo || i?.targetBeLongTo) {
            case "TC":
              TC.push(i);
              break;

            case "KH":
              KH.push(i);
              break;

            case "QT":
              QT.push(i);
              break;

            case "HH":
              HH.push(i);
              break;
          }
        });

        !TC.length ? (TC = []) : [];
        !KH.length ? (KH = []) : [];
        !QT.length ? (QT = []) : [];
        !HH.length ? (HH = []) : [];

        let flag = 1;
        return [...TC, ...KH, ...QT, ...HH].filter((item) => {
          if (!item.isCorner) {
            const value = (item.index = flag++);
            return { ...item, value };
          }
          return item;
        });
      } catch (err) {
        console.error("Have error when arrange target data!");
      }
    },

    /**
     * NAME: calculateDisplayTargetData
     * DESC: function base on input array data for calculate some variable then show those into web browser of user
     * @param {*} arr    ARRAY
     * @param {*} item   OBJECT
     * @returns new Array after handled
     * @author Tran Anh Khoa
     */
    async calculateDisplayTargetData(arr, item) {
      try {
        let sumTC = 0,
          sumKH = 0,
          sumQT = 0,
          sumHH = 0,
          sumAll = 0;

        this.limitTopValue = await this.getLimitValue();
        /* Handle Ty Trong value */
        arr.map((i) => {
          switch (i.targetBeLongTo) {
            case "TC":
              sumTC += +i.targetImportanceLevel;
              break;

            case "KH":
              sumKH += +i.targetImportanceLevel;
              break;

            case "QT":
              sumQT += +i.targetImportanceLevel;
              break;

            case "HH":
              sumHH += +i.targetImportanceLevel;
              break;
          }

          switch (i.beLongTo) {
            case "TC":
              sumTC += +i.importanceLevel;
              break;

            case "KH":
              sumKH += +i.importanceLevel;
              break;

            case "QT":
              sumQT += +i.importanceLevel;
              break;

            case "HH":
              sumHH += +i.importanceLevel;
              break;
          }
        });

        sumAll = sumTC + sumKH + sumQT + sumHH;

        const finalArray = arr.map((i) => {
          if (arr.length > 4) {
            if (i.isCorner) {
              switch (i.techName) {
                case "TC":
                  i.tyTrong = (+(sumTC / sumAll) * 100).toFixed(2);
                  break;

                case "KH":
                  i.tyTrong = (+(sumKH / sumAll) * 100).toFixed(2);
                  break;

                case "QT":
                  i.tyTrong = (+(sumQT / sumAll) * 100).toFixed(2);
                  break;

                case "HH":
                  i.tyTrong = (+(sumHH / sumAll) * 100).toFixed(2);
                  break;
              }
            } else {
              switch (i.targetBeLongTo) {
                case "TC":
                  i.tyTrong = +(
                    (i.targetImportanceLevel / sumAll) *
                    100
                  ).toFixed(2);
                  break;

                case "KH":
                  i.tyTrong = +(
                    (i.targetImportanceLevel / sumAll) *
                    100
                  ).toFixed(2);
                  break;

                case "QT":
                  i.tyTrong = +(
                    (i.targetImportanceLevel / sumAll) *
                    100
                  ).toFixed(2);
                  break;

                case "HH":
                  i.tyTrong = +(
                    (i.targetImportanceLevel / sumAll) *
                    100
                  ).toFixed(2);
                  break;
              }

              switch (i.beLongTo) {
                case "TC":
                  i.tyTrong = +((i.importanceLevel / sumAll) * 100).toFixed(2);
                  break;

                case "KH":
                  i.tyTrong = +((i.importanceLevel / sumAll) * 100).toFixed(2);
                  break;

                case "QT":
                  i.tyTrong = +((i.importanceLevel / sumAll) * 100).toFixed(2);
                  break;

                case "HH":
                  i.tyTrong = +((i.importanceLevel / sumAll) * 100).toFixed(2);
                  break;
              }
            }
          }

          return i;
        });

        /* Handle Ty le dat thuc te and Ty le dat gioi han */
        const x = finalArray.map((i) => {
          if (i.targetTypeName) {
            switch (i?.targetTypeName.toUpperCase()) {
              case "CÀNG NHỎ CÀNG TỐT":
                if (Number(i.realizedValue) > Number(i.minValue)) {
                  i.rateDefault = Number(0).toFixed(2);
                  i.rateExecute = Number(0).toFixed(2);
                  i.rateLimit = Number(0).toFixed(2);
                } else {
                  i.rateDefault = Number(
                    ((Number(i.minValue) +
                      Number(i.defaultValue) -
                      i.realizedValue) /
                      i.minValue) *
                      100
                  ).toFixed(2);

                  i.rateLimit =
                    i.rateDefault > this.limitTopValue
                      ? this.limitTopValue
                      : i.rateDefault;

                  i.rateExecute = Number(
                    (i.tyTrong * i.rateLimit) / 100
                  ).toFixed(2);
                }
                break;

              case "CÀNG LỚN CÀNG TỐT":
                if (Number(i.realizedValue) < Number(i.minValue)) {
                  i.rateDefault = Number(0).toFixed(2);
                  i.rateExecute = Number(0).toFixed(2);
                  i.rateLimit = Number(0).toFixed(2);
                } else {
                  i.rateDefault = Number(
                    (i.realizedValue / i.defaultValue) * 100
                  ).toFixed(2);

                  i.rateLimit =
                    i.rateDefault > this.limitTopValue
                      ? this.limitTopValue
                      : i.rateDefault;

                  i.rateExecute = Number(
                    (i.tyTrong * i.rateLimit) / 100
                  ).toFixed(2);
                }

                break;

              case "ĐẠT/KHÔNG ĐẠT":
                if (
                  Number(i.realizedValue) < Number(i.defaultValue) ||
                  Number(i.realizedValue) > Number(i.minValue)
                ) {
                  i.rateDefault = Number(0).toFixed(2);
                  i.rateExecute = Number(0).toFixed(2);
                  i.rateLimit = Number(0).toFixed(2);
                } else {
                  i.rateDefault = Number(100).toFixed(2);
                  i.rateLimit = Number(100).toFixed(2);
                  i.rateExecute = Number(i.tyTrong).toFixed(2);
                }
                break;
            }
          }
          return i;
        });

        // console.log(JSON.stringify(x, null, 2));
        return x;
      } catch (err) {
        console.error("Internal Server Error: ", err);
      }
    },

    clearTickedTargetTree() {
      if (!this.showTargetPanel) {
        this.showTargetPanel = true;
      }
      this.tickedTree = [];
    },

    async handleAddMoreItemTarget() {
      let objectBlank = {
        timeId: "",
        targetId: "",
        minTargetValue: "0",
        excuteValue: "",
        note: "",
        defaultValue: "",
      };

      if (!this.isMoreThanTwoItems) {
        /* get variable for handle next step - remove data in objCreateTargetKpiByTime for function just make sure function just work once time */
        this.isMoreThanTwoItems = true;
        this.arrTargetKpiByTime.push(this.objCreateTargetKpiByTime);
        this.arrTargetKpiByTime.push(objectBlank);
        this.objCreateTargetKpiByTime = [];
      } else {
        this.arrTargetKpiByTime.push(objectBlank);
      }
    },

    async postCreateAllTargetKpiByTime() {
      try {
        const dataInsert = [];

        this.arrTargetKpiByTime.map((i) => {
          let item = {
            targetId: this.targetSelected,
            timeCompanyKpiId: i.timeId._id,
            companyId: this.treeSelected,
            defaultValue: i.defaultValue
              ? i.defaultValue
              : this.targetSelectedView.defaultValue,
            minValue: i.minTargetValue
              ? i.minTargetValue
              : this.targetSelectedView.minValue,
            excuteValue: 0,
            note: i.note,
            userCreate: "khoa.tran",
            userUpdate: "khoa.tran",
          };

          dataInsert.push(item);
        });

        const result = await api.post("/api/target-by-times", dataInsert);

        if (result.status === 201) {
          Notify.create({
            color: "green",
            position: "top",
            message: result.data.message,
          });
          this.arrTargetKpiByTime = [];
        } else {
          Notify.create({
            color: "red",
            position: "top",
            message: result.data.message,
          });
        }
      } catch (err) {
        console.error("Internal Server Error: ", err);
        Notify.create({
          color: "red",
          position: "top",
          message: "Lưu dữ liệu thất bại !",
        });
      }
    },

    async getAllJob() {
      try {
        const url = "job-titles";

        const result = await api.get(url);

        if (result.data.status === 200) {
          this.listJobData = result.data.data;
        }
      } catch (err) {
        console.error("Internal Server Error getAllJob(): ", err);
      }
    },

    /* Formula */
    async getAllFormula() {
      try {
        const url = "formula-calculations";
        const result = await api.get(url);

        if (result.data.status === 200) {
          this.formulaData = result.data.data;
          this.formulaData = this.formulaData.filter((i) => {
            if (!i.isDisable) return i;
          });
        } else {
          console.error("Get error when get data in getAllFormula()");
        }
      } catch (err) {
        console.error("Internal Server Error getAllFormula(): ", err);
      }
    },

    /* Frequency */
    async getAllFrequency() {
      try {
        const url = "frequency-measures";
        const result = await api.get(url);

        if (result.data.status === 200) {
          this.frequencyData = result.data.data;
          this.frequencyData = this.frequencyData.filter((i) => {
            if (!i.isDisable) return i;
          });
        } else {
          console.error("Get error when get data in getAllFrequency()");
        }
      } catch (err) {
        console.error("Internal Server Error getAllFrequency(): ", err);
      }
    },

    async getLimitValue() {
      try {
        const url = "/general-setup/max-value-target";

        const result = await api.get(url);

        if (result.data.status === 200) {
          // this.limitTopValue = result.data.data.value;
          return +result.data.data.value;
        } else {
          console.error("No data limit value response !");
        }
      } catch (err) {
        console.error("Internal Server Error getLimitValue(): ", err);
      }
    },

    async getListAllRole() {
      try {
        const url = "/roles";
        const result = await api.get(url);

        if (result.data.stauts === 200) {
          this.listRoles = result.data.data;
        } else {
          console.error("getListAllRole() doesn't have data !");
        }
      } catch (err) {
        console.error("Internal Server Error getListAllRole(): ", err);
      }
    },

    async getPermission() {
      try {
        const url = "/permissions";
        const result = await api.get(url);

        if (result.status.data) {
          this.listPermissions = result.data.data;
        } else {
          console.error("getPermission() doesn't have data !");
        }
      } catch (err) {
        console.error("Internal Server Error getPermission(): ", err);
      }
    },

    // async getListMonthDisplayToSelect(structId) {
    //   try {
    //     console.log(structId);
    //     let check = false;
    //     this.arrMonthSelectBox = [];
    //     for (let i = 1; i <= 12; ++i) {
    //       const url = `target-by-structs/?structId=${structId}&month=${i}&isStaff=false`;
    //       const result = await api.get(url);
    //       console.log(result);

    //       if (result.data.data?.length) {
    //         this.arrMonthSelectBox.push({ label: `Tháng ${i}`, value: i });

    //         if (i === this.selectMonth.value) {
    //           check = true;
    //         }
    //       }
    //     }

    //     this.arrMonthSelectBox = this.arrMonthSelectBox.filter(
    //       (val, index, self) =>
    //         index ===
    //         self.findIndex(
    //           (t) => t.value === val.value && t.label === val.label
    //         )
    //     );

    //     if (this.arrMonthSelectBox?.length) {
    //       if (!check) {
    //         this.selectMonth = this.arrMonthSelectBox[0];
    //       }
    //     }

    //     return this.arrMonthSelectBox;
    //   } catch (err) {
    //     console.error("Internal Server Error getListMonthDisplay(): ", err);
    //   }
    // },
  },
});
