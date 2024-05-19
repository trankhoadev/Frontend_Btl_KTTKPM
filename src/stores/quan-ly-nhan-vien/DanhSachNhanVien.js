import { defineStore } from "pinia";
import { Dialog, Notify, Loading, QSpinnerTail } from "quasar";
import { api } from "src/boot/axios";

export const useDanhSachNhanVienStore = defineStore("storeDanhSachNhanVien", {
  state: () => ({
    listDataEmployees: [],
    oneEmployeeData: [],
    updateEmployeeData: [],
    addEmployeeData: {
      code: "",
      name: "",
      jobTitleId: "",
      companyStructId: "",
    },
    isLoadingTable: true,
    isDialogUpdate: false,
    isDialogAdd: false,
    selectJobAddForm: "",
    numOfEmployees: "",
    listJobData: [],
    countIndex: 1,
    lastPage: 0,
    companyStructureData: [],
    selectCompany: {},
    inputSearch: "",
    stateSearching: false,
  }),
  getters: {},
  actions: {
    /**
     * Init function, just only need call it once time if wanna get data in that store.
     * @param
     * @returns Nothing, call another function for let them execute.
     */
    async getInit() {
      await this.getAllEmployees(0);
      await this.getEmployeeCount();

      this.lastPage = Math.floor(this.numOfEmployees / 100) + 1;
    },

    /**
     * NAME: Function for get all employees data from database
     * DESC:
     *  - +1 for get next page
     *  - -1 get previous page
     *  - 0 get init data
     *  - "first" for get first page
     *  - "last" for get last page
     * @param value: STRING or NUMBER
     * @returns List data employees
     * @author Tran Anh Khoa
     */
    async getAllEmployees(value) {
      this.listDataEmployees = [];
      try {
        if (typeof value == "number") {
          this.countIndex += value;
        } else {
          value == "first" ? (this.countIndex = 1) : [];
          value == "last" ? (this.countIndex = this.lastPage) : [];
        }

        let url = "";

        console.log(this.selectCompany._id);

        if (this.selectCompany._id !== "0") {
          url = `staffs/?page=${this.countIndex}&companyStructId=${this.selectCompany._id}`;
        } else {
          url = `staffs/?page=${this.countIndex}`;
        }

        console.log(url);
        console.log(this.selectCompany);

        const result = await api.get(url);

        if (result.data.status === 200) {
          this.listDataEmployees = result.data.data;
        }
      } catch (err) {
        console.error("Internal Server Error: getAllEmployees(): ", err);
      }
    },

    /**
     * NAME: GET AMOUNT OF EMPLOYEES
     * DESC: get amount number of employees
     * @returns
     * @author Tran Anh Khoa
     */
    async getEmployeeCount() {
      try {
        const url = "staffs/count";

        const result = await api.get(url);

        if (result.data.status === 200) {
          this.numOfEmployees = result.data.count;
        }
      } catch (err) {
        console.log("Internal Server Error getEmployeeCount(): ", err);
      }
    },

    /**
     * NAME: GET EMPLOYEE DATA BY ID
     * DESC: use id from user send then find it in database. After that send back to user browser
     * @param {*} idEmployee      STRING
     * @returns this.oneEmployeeData
     * @author Tran Anh Khoa
     */
    async getEmployeeById(idEmployee) {
      try {
        const url = `staffs/?_id=${idEmployee}`;

        const result = await api.get(url);

        if (result.data.message === 200) {
          this.oneEmployeeData = result.data.data;
        } else {
          console.error("Get data employee failed: ", idEmployee);
        }
      } catch (err) {
        console.log("Internal Server Error getEmployeeById(): ", err);
      }
    },

    /**
     * NAME: ADD NEW EMPLOYEE
     * DESC: This function can help user create new data employee when in need.
     * @param {*} dataAdd     OBJECT
     * @returns
     * @author Tran Anh Khoa
     */
    async addNewEmployee(dataAdd) {
      Loading.show({
        spinner: QSpinnerTail,
      });
      try {
        const { code, name, jobTitle, companyStruct } = dataAdd;

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");

        const formattedDate = `${year}-${month}-${day}`;

        console.log(dataAdd);

        const data = {
          code: code.trim(),
          name: name.toUpperCase().trim(),
          jobTitleId: jobTitle._id,
          companyStructId: companyStruct._id,
          dateJoin: formattedDate,
          isOff: false,
          userCreate: "Khoa.tran",
          userUpdate: "Khoa.tran",
        };

        console.log(data);

        const url = "/staffs";

        const result = await api.post(url, data);

        console.log(result);

        if (result.data.status === 200) {
          Loading.hide();
          this.isDialogAdd = false;
          Notify.create({
            message: "Tạo mới nhân viên thành công !",
            position: "top",
            color: "green",
          });
          this.addEmployeeData = [];
        } else {
          Loading.hide();
          Dialog.create({
            message: `Tạo mới nhân viên thất bại: ${result.data.message}`,
            ok: true,
            cancel: false,
          });
        }
      } catch (err) {
        Loading.hide();
        console.error(
          "Internal Server Error addNewEmployee(objectNewData): ",
          err
        );
      }
    },

    /**
     * NAME: UPDATE EMPLOYEE DATA
     * DESC: Function help user can change any property data of employee data
     * @param {*} dataUpdate     OBJECT
     * @returns
     * @author Tran Anh Khoa
     */
    async updateEmployee(dataUpdate) {
      Loading.show({
        spinner: QSpinnerTail,
      });
      try {
        const url = `staffs?_id=${dataUpdate._id}`;

        const { name, companyStruct, isOff, dateOff, dateJoin, jobTitle } =
          dataUpdate;

        // const data = {
        //   name: name.trim(),
        //   companyStructId: companyStruct._id,
        //   isOff,
        //   dateOff,
        //   dateJoin,
        // };

        const data = {
          name: name.trim(),
          companyStructId: companyStruct._id,
          jobTitleId: jobTitle._id,
          isOff,
          dateOff,
          dateJoin,
        };

        console.log(data);

        const result = await api.patch(url, data);

        console.log(result);

        if (result.data.status === 200) {
          this.getAllEmployees();
          setTimeout(() => {
            Loading.hide();
          }, 1000);
          this.isDialogUpdate = false;
          Notify.create({
            message: "Cập nhật thông tin nhân viên thành công !",
            position: "top",
            color: "green",
          });
        } else {
          Loading.hide();
          Dialog.create({
            message: `Cập nhật thông tin nhân viên thất bại: ${result.data.message}`,
            ok: true,
            cancel: false,
          });
        }
      } catch (err) {
        Loading.hide();
        console.error("Intenal Server Error updateEmployee(): ", err);
      }
    },

    /* FUNCTIONAL */

    /**
     * NAME: HANDLE SHOW DIALOG FROM
     * DESC: when user double click in any employee in table, then will handle get data of this employee and show in UI
     * @returns
     * @author Tran Anh Khoa
     */
    async handleOpenDialog(dataEmployee) {
      /* show modal */
      this.isDialogUpdate = true;

      console.log(dataEmployee);

      const data = { ...dataEmployee };

      this.updateEmployeeData = data;

      this.updateEmployeeData.companyStruct = {
        _id: data.companyStructId,
        name: data.companyStructName,
      };

      this.updateEmployeeData.jobTitle = {
        _id: data.jobTitleId,
        name: data.jobTitleName,
      };
    },

    /**
     * NAME: TEXT SEARCH FOR EMPLOYEE
     * DESC: when user type anything like employee name or employee code in input search then will call this function and return result list Employee
     * @param {*} value     STRING
     * @param {*} isCode    BOOLEAN
     * @returns list Employee
     * @author Tran Anh Khoa
     */
    async textSearchEmployee(value, isCode = false) {
      this.listDataEmployees = [];
      try {
        let url;
        if (value.length) {
          if (this.selectCompany._id !== "0") {
            url = `/staffs/search?isCode=${isCode}&query=${value}&companyStructId=${this.selectCompany._id}`;
          } else {
            url = `/staffs/search?isCode=${isCode}&query=${value}`;
          }

          const result = await api.get(url);

          console.log(result);

          if (result.data.status === 200) {
            this.listDataEmployees = result.data.data;
            this.numOfEmployees = result.data.data.length;
            this.stateSearching = true;
          }
        } else {
          await this.getAllEmployees("first");
          await this.getEmployeeCount();
          this.stateSearching = false;
        }
      } catch (err) {
        console.error("Internal Server Error: ", err);
      }
    },
  },
});
