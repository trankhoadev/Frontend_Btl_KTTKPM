import { defineStore } from "pinia";
import { Dialog, Notify, Loading, QSpinnerTail } from "quasar";
import { api } from "src/boot/axios";

export const useChucDanhNhanVienStore = defineStore("storeChucDanhNhanVien", {
  state: () => ({
    listDataJobs: [],
    listDataJobsName: [],
    oneJobData: [],
    updateJobData: [],
    addData: {
      name,
    },
    isLoadingTable: true,
    isDialogUpdate: false,
    isDialogAdd: false,
    companyStructureData: [],
    companyUpdateFormSelect: "",
    selectJobAddForm: "",
    listJobData: [],
    countIndex: 1,
    lastPage: 0,
    numOfJobs: 0,
  }),
  getters: {},
  actions: {
    /**
     * Init function, just only need call it once time if wanna get data in that store.
     * @param
     * @returns Nothing, call another function for let them execute.
     */
    async getInit() {
      await this.getAllJobs();
      await this.getJobCount();
      this.lastPage = Math.floor(this.numOfJobs / 100) + 1;
    },

    /**
     * Function for get all jobs data from database
     * @param
     * @returns List data jobs
     */
    // async getAllJobs() {
    //   try {
    //     const url = "job-titles";
    //     const result = await api.get(url);
    //     console.log(result);

    //     if (result.data.status === 200) {
    //       this.listDataJobs = result.data.data;
    //       this.listDataJobsName = result.data.data.map((i) => i.name.trim());
    //     }
    //   } catch (err) {
    //     console.error("Internal Server Error: getAllJobs(): ", err);
    //   }
    // },

    /**
     * NAME: GET JOB DATA BY ID
     * DESC: use id from user send then find it in database. After that send back to user browser
     * @param {*} idJob      STRING
     * @returns this.oneJobData
     * @author Tran Anh Khoa
     */
    async getJobById(idJob) {
      try {
        const url = `job-titles/?_id=${idJob}`;

        const result = await api.get(url);

        if (result.data.message === 200) {
          this.oneJobData = result.data.data;
        } else {
          console.error("Get data job failed: ", idJob);
        }
      } catch (err) {
        console.log("Internal Server Error getJobById(): ", err);
      }
    },

    /**
     * NAME: ADD NEW JOB
     * DESC: This function can help user create new data job when in need.
     * @param {*} dataAdd     OBJECT
     * @returns
     * @author Tran Anh Khoa
     */
    async addNewJob(dataAdd) {
      Loading.show({
        spinner: QSpinnerTail,
      });
      try {
        const { name } = dataAdd;

        const data = {
          name: name.toUpperCase().trim(),
          isDisable: false,
          userCreate: "Khoa.tran",
          userUpdate: "Khoa.tran",
        };

        const url = "job-titles/";

        const result = await api.post(url, data);
        console.log(result);

        if (result.data.status === 200) {
          Loading.hide();
          await this.getAllJobs();
          this.isDialogAdd = false;
          Notify.create({
            message: "Tạo mới chức danh thành công !",
            position: "top",
            color: "green",
          });
          this.addData = [];
        } else {
          Loading.hide();
          Dialog.create({
            message: `Tạo mới chức danh thất bại: ${result.data.message}`,
            ok: true,
            cancel: false,
          });
        }
      } catch (err) {
        Loading.hide();
        console.error("Internal Server Error addNewJob(objectNewData): ", err);
      }
    },

    /**
     * NAME: UPDATE Job DATA
     * DESC: Function help user can change any property data of job data
     * @param {*} dataUpdate     OBJECT
     * @returns
     * @author Tran Anh Khoa
     */
    async updateJob(dataUpdate) {
      Loading.show({
        spinner: QSpinnerTail,
      });
      try {
        const url = `job-titles?_id=${dataUpdate._id}`;

        const { name } = dataUpdate;

        const data = {
          name: name.trim().toUpperCase(),
        };

        if (this.listDataJobsName.includes(name.trim().toUpperCase())) {
          Dialog.create({
            title: "Thông báo",
            message: "Tên chức danh đã tồn tại, vui lòng dùng tên khác !",
            ok: true,
            cancel: false,
          });
          Loading.hide();
          return;
        }

        const result = await api.patch(url, data);

        if (result.data.status === 200) {
          this.getAllJobs();
          setTimeout(() => {
            Loading.hide();
          }, 1000);
          this.isDialogUpdate = false;
          Notify.create({
            message: "Cập nhật thông tin chức danh thành công !",
            position: "top",
            color: "green",
          });
        } else {
          Loading.hide();
          Dialog.create({
            message: `Cập nhật thông tin chức danh thất bại: ${result.data.message}`,
            ok: true,
            cancel: false,
          });
        }
      } catch (err) {
        Loading.hide();
        console.error("Intenal Server Error updateJob(): ", err);
      }
    },

    /**
     * NAME: Function for get all jobs data from database
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
    async getAllJobs(value = 0) {
      this.listDataJobs = [];
      try {
        if (typeof value == "number") {
          this.countIndex += value;
        } else {
          value == "first" ? (this.countIndex = 1) : [];
          value == "last" ? (this.countIndex = this.lastPage) : [];
        }

        let url = `job-titles?page=${this.countIndex}`;

        // if (this.selectCompany._id !== "0") {
        //   url = `job-titles/?page=${this.countIndex}&companyStructId=${this.selectCompany._id}`;
        // } else {
        //   url = `job-titles/?page=${this.countIndex}`;
        // }

        const result = await api.get(url);

        console.log(result);

        if (result.data.status === 200) {
          this.listDataJobs = result.data.data;
        }
      } catch (err) {
        console.error("Internal Server Error: getAllJobs(): ", err);
      }
    },

    async getJobCount() {
      try {
        this.numOfJobs = 0;
        const url = "/job-titles/count";

        const result = await api.get(url);

        if (result.data.status === 200) {
          this.numOfJobs = result.data.count;
        }
      } catch (err) {
        console.error("Internal Server Error: ", err);
      }
    },

    /* FUNCTIONAL */

    /**
     * NAME: HANDLE SHOW DIALOG FROM
     * DESC: when user double click in any job in table, then will handle get data of this job and show in UI
     * @returns
     * @author Tran Anh Khoa
     */
    async handleOpenDialog(dataJob) {
      const data = { ...dataJob };
      /* show modal */
      this.isDialogUpdate = true;

      /* set data for modal */
      this.updateJobData = data;

      /* set select when open modal */
      this.companyUpdateFormSelect = data.companyStructId;
    },
  },
});
