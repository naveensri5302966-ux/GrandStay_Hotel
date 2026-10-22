import apiClient from "./apiClient";
import logger from "../utils/logger";

/**
 * Hotel Service (Experiment 1: REST APIs with Axios)
 * Provides reusable REST operations for fetching, searching, and filtering hotels.
 */
export const hotelService = {
  /**
   * Fetch all hotels with optional query filters (location, price, stars, amenities, availability)
   */
  async getHotels(params = {}) {
    if (params.location) {
      logger.search("Location", params.location);
    }
    if (params.availability) {
      logger.filter("Availability", params.availability);
    }
    if (params.minStars) {
      logger.filter("Min Stars", `${params.minStars} Stars`);
    }
    if (params.maxPrice) {
      logger.filter("Max Price", `₹${params.maxPrice}`);
    }

    const data = await apiClient.get("/hotels", { params });
    logger.hotels(Array.isArray(data) ? data.length : 0);
    return data;
  },

  /**
   * Fetch individual hotel details by ID
   */
  async getHotelById(id) {
    return apiClient.get(`/hotels/${id}`);
  },

  /**
   * Fetch room details for a specific hotel
   */
  async getHotelRooms(hotelId) {
    return apiClient.get(`/hotels/${hotelId}/rooms`);
  },

  /**
   * Search hotels using structured criteria
   */
  async searchHotels({ location = "", maxPrice, minStars, amenities = [], availability } = {}) {
    return this.getHotels({
      location,
      maxPrice,
      minStars,
      amenities: amenities.length > 0 ? amenities.join(",") : undefined,
      availability
    });
  },

  /**
   * ADMIN CRUD: POST — Create a new hotel package
   */
  async createHotelPackage(packageData) {
    console.log(
      "%c[ADMIN CRUD: POST] Creating New Hotel Package 🏨📤",
      "background: #16A34A; color: white; padding: 3px 8px; border-radius: 2px; font-weight: bold;",
      { endpoint: "/api/hotels", method: "POST", payload: packageData }
    );
    try {
      const data = await apiClient.post("/hotels", packageData);
      console.log(
        `%c[ADMIN CRUD: POST] 201 Created Package #${data.id} (${data.name}) ✅`,
        "color: #16A34A; font-weight: bold; font-size: 11px;",
        data
      );
      return data;
    } catch (error) {
      console.error("%c[ADMIN CRUD: POST] Error creating hotel package:", "color: #DC2626; font-weight: bold;", error);
      throw error;
    }
  },

  /**
   * ADMIN CRUD: PUT — Update hotel package details
   */
  async updateHotelPackage(id, updateData) {
    console.log(
      "%c[ADMIN CRUD: UPDATE (PUT)] Updating Hotel Package 🔄",
      "background: #D97706; color: white; padding: 3px 8px; border-radius: 2px; font-weight: bold;",
      { id, endpoint: `/api/hotels/${id}`, method: "PUT", payload: updateData }
    );
    try {
      const data = await apiClient.put(`/hotels/${id}`, updateData);
      console.log(
        `%c[ADMIN CRUD: UPDATE (PUT)] 200 OK Updated Package #${id} ✅`,
        "color: #16A34A; font-weight: bold; font-size: 11px;",
        data
      );
      return data;
    } catch (error) {
      console.error("%c[ADMIN CRUD: UPDATE (PUT)] Error:", "color: #DC2626; font-weight: bold;", error);
      throw error;
    }
  },

  /**
   * ADMIN CRUD: POST (Update) — Update hotel package details via POST method
   */
  async updateHotelPackageWithPost(id, updateData) {
    console.log(
      "%c[ADMIN CRUD: UPDATE (POST)] Updating Hotel Package via POST 🔄",
      "background: #D97706; color: white; padding: 3px 8px; border-radius: 2px; font-weight: bold;",
      { id, endpoint: `/api/hotels/${id}/update`, method: "POST", payload: updateData }
    );
    try {
      const data = await apiClient.post(`/hotels/${id}/update`, updateData);
      console.log(
        `%c[ADMIN CRUD: UPDATE (POST)] 200 OK Updated Package #${id} via POST ✅`,
        "color: #16A34A; font-weight: bold; font-size: 11px;",
        data
      );
      return data;
    } catch (error) {
      console.error("%c[ADMIN CRUD: UPDATE (POST)] Error:", "color: #DC2626; font-weight: bold;", error);
      throw error;
    }
  },

  /**
   * ADMIN CRUD: DELETE — Delete / Remove hotel package
   */
  async deleteHotelPackage(id) {
    console.log(
      "%c[ADMIN CRUD: DELETE] Removing Hotel Package 🗑️",
      "background: #DC2626; color: white; padding: 3px 8px; border-radius: 2px; font-weight: bold;",
      { id, endpoint: `/api/hotels/${id}`, method: "DELETE" }
    );
    try {
      const data = await apiClient.delete(`/hotels/${id}`);
      console.log(
        `%c[ADMIN CRUD: DELETE] 200 OK Package #${id} Removed ✅`,
        "color: #16A34A; font-weight: bold; font-size: 11px;",
        data
      );
      return data;
    } catch (error) {
      console.error("%c[ADMIN CRUD: DELETE] Error removing hotel package:", "color: #DC2626; font-weight: bold;", error);
      throw error;
    }
  },

  /**
   * Run Complete Hotel Package CRUD Lifecycle Demo (Admin)
   */
  async runPackageCrudLifecycleDemo() {
    console.clear();
    console.log(
      "%c====================================================================\n👑 ADMIN HOTEL PACKAGE CRUD LIFECYCLE (GET -> POST -> UPDATE-POST -> UPDATE-PUT -> DELETE)\n====================================================================",
      "background: #4C1D95; color: #E9D5FF; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 4px;"
    );

    try {
      // 1. GET Method
      console.log("\n%c--- 1. [GET METHOD] Fetching Current Hotel Packages ---", "color: #0284C7; font-weight: bold; font-size: 12px;");
      const currentList = await this.getHotels();
      console.log("📥 GET Response (Packages in Catalog):", currentList.length, currentList);

      // 2. POST Method (Create new package)
      console.log("\n%c--- 2. [POST METHOD] Admin Adding New Hotel Package ---", "color: #16A34A; font-weight: bold; font-size: 12px;");
      const newPackage = {
        name: "Emerald Bay Luxury Resort & Spa",
        location: "Goa",
        stars: 5,
        price: 14500,
        description: "Beachfront villa resort with private infinity pool, sunset dining, and signature wellness spa.",
        amenities: ["WiFi", "Swimming Pool", "Spa", "Breakfast", "Beach Access"],
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
      };
      const created = await this.createHotelPackage(newPackage);
      console.log("📤 POST Created Hotel Package:", created);

      // 3. UPDATE via POST Method
      console.log("\n%c--- 3. [UPDATE via POST METHOD] Admin Modifying Package Price & Description ---", "color: #D97706; font-weight: bold; font-size: 12px;");
      const postUpdated = await this.updateHotelPackageWithPost(created.id, {
        price: 15500,
        description: "Updated via POST Method: Added VIP champagne welcome & complimentary airport transfers."
      });
      console.log("🔄 UPDATE (POST) Response:", postUpdated);

      // 4. UPDATE via PUT Method
      console.log("\n%c--- 4. [UPDATE via PUT METHOD] Admin Modifying Stars & Amenities ---", "color: #D97706; font-weight: bold; font-size: 12px;");
      const putUpdated = await this.updateHotelPackage(created.id, {
        stars: 5,
        amenities: ["WiFi", "Swimming Pool", "Spa", "Breakfast", "Beach Access", "Gym"]
      });
      console.log("🔄 UPDATE (PUT) Response:", putUpdated);

      // 5. DELETE Method
      console.log("\n%c--- 5. [DELETE METHOD] Admin Deleting Hotel Package ---", "color: #DC2626; font-weight: bold; font-size: 12px;");
      const deleted = await this.deleteHotelPackage(created.id);
      console.log("🗑️ DELETE Result:", deleted);

      // 6. GET Method (Verify Deletion)
      console.log("\n%c--- 6. [GET METHOD] Verifying Package Catalog After Deletion ---", "color: #0284C7; font-weight: bold; font-size: 12px;");
      const finalList = await this.getHotels();
      console.log("📥 Final Packages Count:", finalList.length);

      console.log(
        "%c====================================================================\n✅ ALL ADMIN HOTEL PACKAGE CRUD METHODS (GET, POST, UPDATE-POST, UPDATE-PUT, DELETE) COMPLETED SUCCESSFULLY!\n====================================================================",
        "background: #064E3B; color: #34D399; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 4px;"
      );
      return { success: true, created, deleted };
    } catch (err) {
      console.error("❌ Admin Package CRUD Lifecycle Error:", err);
      throw err;
    }
  }
};

export default hotelService;
