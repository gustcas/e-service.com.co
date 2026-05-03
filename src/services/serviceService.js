import api from "./api";

export default {

    async store(data) {

        return await api.post("/admin/services", data);

    },

    async update(id, data) {

        return await api.put(`/admin/services/${id}`, data);

    },

    async delete(id) {

        return await api.delete(`/admin/services/${id}`);

    }

}