import api from "./api";

export default {

  async getUsers() {
    return await api.get("/admin/users");
  },

  async createCategory(data) {
    return await api.post("/admin/categories", data);
  }

};