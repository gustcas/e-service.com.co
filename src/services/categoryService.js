import api from "./api";

export default {

  async getAllProfesional() {

    return await api.get("/categories");

  },

  async getAll() {

    return await api.get("/admin/categories");

  },

  async store(data) {

    return await api.post("/admin/categories", data);

  },

  async update(id, data) {

    return await api.put(`/admin/categories/${id}`, data);

  },

  async delete(id) {

    return await api.delete(`/admin/categories/${id}`);

  }

}