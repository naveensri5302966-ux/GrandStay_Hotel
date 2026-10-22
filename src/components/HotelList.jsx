import { useState } from "react";
import FilterPanel from "./FilterPanel";
import HotelCard from "./HotelCard";
import Loading from "./common/Loading";
import Button from "./common/Button";
import Input from "./common/Input";
import { useBookingContext } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import hotelService from "../services/hotelService";

export function HotelList() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const {
    filteredHotels,
    selectHotel,
    maxPrice,
    setMaxPrice,
    minStars,
    setMinStars,
    selectedAmenities,
    setSelectedAmenities,
    resetFilters,
    isLoadingHotels,
    hotelsError,
    refetchHotels
  } = useBookingContext();

  // Admin CRUD Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [deletingHotel, setDeletingHotel] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add / Edit
  const [packageFormData, setPackageFormData] = useState({
    name: "",
    location: "",
    price: 8500,
    stars: 5,
    image: "",
    description: "",
    amenities: "WiFi, Breakfast, Swimming Pool, Spa"
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setPackageFormData({
      name: "The Royal Mirage Palace",
      location: "Udaipur",
      price: 13500,
      stars: 5,
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      description: "Magnificent lakeside palace with private marble courtyards and royal hospitality.",
      amenities: "WiFi, Swimming Pool, Spa, Breakfast, Lake View"
    });
    setActionError("");
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (hotel) => {
    setEditingHotel(hotel);
    setPackageFormData({
      name: hotel.name,
      location: hotel.location,
      price: hotel.price,
      stars: hotel.stars || 4,
      image: hotel.image || "",
      description: hotel.description || "",
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : "WiFi, Breakfast"
    });
    setActionError("");
  };

  // Submit Create Package (POST method)
  const handleCreatePackage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setActionError("");
    setIsSubmitting(true);

    try {
      const payload = {
        name: packageFormData.name,
        location: packageFormData.location,
        price: Number(packageFormData.price),
        stars: Number(packageFormData.stars),
        image: packageFormData.image,
        description: packageFormData.description,
        amenities: packageFormData.amenities.split(",").map((s) => s.trim()).filter(Boolean)
      };

      const created = await hotelService.createHotelPackage(payload);
      setActionSuccess(`New hotel package "${created.name}" created via POST method! Check console.`);
      setIsCreateOpen(false);
      await refetchHotels();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || "Failed to create hotel package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Package (Supports both PUT and POST methods)
  const handleSaveEditPackage = async (method = "put", e = null) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingHotel) return;
    setActionError("");
    setIsSubmitting(true);

    try {
      const payload = {
        name: packageFormData.name,
        location: packageFormData.location,
        price: Number(packageFormData.price),
        stars: Number(packageFormData.stars),
        image: packageFormData.image,
        description: packageFormData.description,
        amenities: packageFormData.amenities.split(",").map((s) => s.trim()).filter(Boolean)
      };

      if (method === "post") {
        await hotelService.updateHotelPackageWithPost(editingHotel.id, payload);
        setActionSuccess(`Hotel package #${editingHotel.id} updated via POST method! Check console.`);
      } else {
        await hotelService.updateHotelPackage(editingHotel.id, payload);
        setActionSuccess(`Hotel package #${editingHotel.id} updated via PUT method! Check console.`);
      }

      setEditingHotel(null);
      await refetchHotels();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || "Failed to update hotel package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete Package (DELETE method)
  const handleConfirmDelete = async () => {
    if (!deletingHotel) return;
    setIsSubmitting(true);
    setActionError("");

    try {
      await hotelService.deleteHotelPackage(deletingHotel.id);
      setActionSuccess(`Hotel package #${deletingHotel.id} ("${deletingHotel.name}") deleted via DELETE method! Check console.`);
      setDeletingHotel(null);
      await refetchHotels();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || "Failed to delete hotel package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run Package CRUD Lifecycle Demo
  const handleRunPackageCrudLifecycle = async () => {
    try {
      await hotelService.runPackageCrudLifecycleDemo();
      await refetchHotels();
      setActionSuccess("Complete Admin Package CRUD Lifecycle (GET -> POST -> UPDATE-POST -> UPDATE-PUT -> DELETE -> GET) executed! Check DevTools console (F12).");
    } catch (err) {
      setActionError(err.message || "Package CRUD demo failed.");
    }
  };

  return (
    <section
      id="hotels"
      className="bg-[#F8FBFF] px-5 py-16 md:px-10 lg:px-16 min-h-screen text-[#0F2942]"
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADING */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-8 border-b border-[#D7E2EA]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
                HOTEL PACKAGES • REST API
              </p>
              {isAdmin && (
                <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs">
                  👑 Admin Package Manager
                </span>
              )}
            </div>

            <h1 className="mt-2 font-serif text-3xl leading-tight text-[#0F2942] md:text-5xl">
              Hotel Packages & Resorts
            </h1>

            <p className="mt-2 text-xs leading-5 text-[#5A738E]">
              {isAdmin
                ? "As an Administrator, you can Add (POST), Edit (PUT & POST), and Delete (DELETE) hotel packages in the active catalog with instant console display."
                : "Handpicked luxury residences across India, powered by asynchronous REST API endpoints with real-time availability."}
            </p>
          </div>

          {/* Admin Header Action Controls */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRunPackageCrudLifecycle}
                className="inline-flex items-center gap-1.5 border border-purple-500 bg-purple-700 px-3 py-2 text-[9px] font-bold tracking-[1.5px] uppercase text-white hover:bg-purple-800 transition-colors rounded-xs shadow-xs"
              >
                🚀 Run Package CRUD Demo
              </button>
              <Button variant="primary" size="sm" onClick={handleOpenCreate}>
                + Add Hotel Package (POST)
              </Button>
            </div>
          )}
        </div>

        {/* ADMIN CRUD QUICK CONSOLE ACTIONS BAR */}
        {isAdmin && (
          <div className="mt-6 border border-purple-200 bg-purple-50/50 p-4 rounded-sm shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-[9px] font-bold tracking-[2px] uppercase text-purple-900 flex items-center gap-1.5">
                  <span>👑</span> Admin Package CRUD Console Actions (GET, POST, UPDATE, DELETE)
                </p>
                <p className="text-xs text-[#5A738E] mt-0.5">
                  Execute package CRUD operations directly and inspect real-time request payloads and responses in the browser console (`F12`).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-purple-200/70">
              <button
                type="button"
                onClick={async () => {
                  console.clear();
                  console.log("%c[ADMIN CRUD] TRIGGERING GET /api/hotels...", "background: #0284C7; color: white; padding: 3px 6px; font-weight: bold;");
                  await refetchHotels();
                  setActionSuccess("GET /api/hotels executed! Check DevTools console.");
                }}
                className="flex items-center justify-center gap-1.5 border border-blue-200 bg-white hover:bg-blue-50 px-2.5 py-1.5 text-[9px] font-semibold tracking-[1px] uppercase text-blue-800 transition-colors rounded-xs"
              >
                <span>📥</span> GET /hotels
              </button>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex items-center justify-center gap-1.5 border border-emerald-200 bg-white hover:bg-emerald-50 px-2.5 py-1.5 text-[9px] font-semibold tracking-[1px] uppercase text-emerald-800 transition-colors rounded-xs"
              >
                <span>📤</span> POST Add Package
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (filteredHotels.length === 0) return alert("No packages to update.");
                  const target = filteredHotels[0];
                  console.clear();
                  console.log("%c[ADMIN CRUD] TRIGGERING UPDATE VIA POST METHOD...", "background: #D97706; color: white; padding: 3px 6px; font-weight: bold;");
                  try {
                    await hotelService.updateHotelPackageWithPost(target.id, {
                      description: "Updated by Admin via POST method at " + new Date().toLocaleTimeString(),
                      price: Math.round(target.price * 1.05)
                    });
                    await refetchHotels();
                    setActionSuccess(`Package #${target.id} updated via POST method! Check console.`);
                  } catch (e) {
                    setActionError(e.message);
                  }
                }}
                className="flex items-center justify-center gap-1.5 border border-amber-200 bg-white hover:bg-amber-50 px-2.5 py-1.5 text-[9px] font-semibold tracking-[1px] uppercase text-amber-800 transition-colors rounded-xs"
              >
                <span>🔄</span> UPDATE (via POST)
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (filteredHotels.length === 0) return alert("No packages to delete.");
                  const target = filteredHotels[filteredHotels.length - 1];
                  console.clear();
                  console.log("%c[ADMIN CRUD] TRIGGERING DELETE METHOD...", "background: #DC2626; color: white; padding: 3px 6px; font-weight: bold;");
                  try {
                    await hotelService.deleteHotelPackage(target.id);
                    await refetchHotels();
                    setActionSuccess(`Package #${target.id} ("${target.name}") removed via DELETE method! Check console.`);
                  } catch (e) {
                    setActionError(e.message);
                  }
                }}
                className="flex items-center justify-center gap-1.5 border border-red-200 bg-white hover:bg-red-50 px-2.5 py-1.5 text-[9px] font-semibold tracking-[1px] uppercase text-red-800 transition-colors rounded-xs"
              >
                <span>🗑️</span> DELETE Package
              </button>
            </div>
          </div>
        )}

        {/* ACTION SUCCESS BANNER */}
        {actionSuccess && (
          <div className="mt-6 border border-emerald-300 bg-emerald-50 p-4 rounded-xs text-xs text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>✓</span> {actionSuccess}
            </span>
            <button
              type="button"
              onClick={() => setActionSuccess("")}
              className="font-bold text-emerald-900 hover:text-emerald-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* ACTION ERROR BANNER */}
        {actionError && (
          <div className="mt-6 border border-red-300 bg-red-50 p-4 rounded-xs text-xs text-red-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚠</span> {actionError}
            </span>
            <button
              type="button"
              onClick={() => setActionError("")}
              className="font-bold text-red-900 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {hotelsError && (
          <div className="mt-6 mb-8 border border-red-200 bg-red-50/70 p-6 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-red-800">
                ⚠ Failed to load hotels from server
              </p>
              <p className="text-xs text-red-600 mt-1">
                {hotelsError}
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={refetchHotels}>
              Retry API Request
            </Button>
          </div>
        )}

        {/* FILTER + CARDS */}
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* FILTER PANEL */}
          <div className="w-full lg:w-[280px] lg:shrink-0">
            <FilterPanel
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              minStars={minStars}
              setMinStars={setMinStars}
              selectedAmenities={selectedAmenities}
              setSelectedAmenities={setSelectedAmenities}
            />
          </div>

          {/* HOTELS CONTENT AREA */}
          <div className="flex-1">
            {isLoadingHotels ? (
              <div className="border border-[#D7E2EA] bg-white p-16 rounded-sm text-center shadow-xs">
                <Loading message="Fetching hotels from REST API endpoint..." />
              </div>
            ) : filteredHotels.length === 0 ? (
              /* EMPTY RESULT STATE */
              <div
                id="no-hotels-message"
                className="border border-[#D7E2EA] bg-white p-14 text-center rounded-sm shadow-xs"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#B7E3FF]/30 text-2xl text-[#2F7FC1]">
                  🏨
                </div>

                <h3 className="mt-4 font-serif text-3xl text-[#0F2942]">
                  No hotels available
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#5A738E] max-w-md mx-auto">
                  We could not find any properties matching your current filter criteria or location search.
                </p>

                <div className="mt-6">
                  <Button variant="primary" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    viewDetails={selectHotel}
                    onEdit={isAdmin ? handleOpenEdit : undefined}
                    onDelete={isAdmin ? setDeletingHotel : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: ADD NEW HOTEL PACKAGE (ADMIN POST METHOD)
         ======================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D7E2EA] pb-3">
              <div>
                <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#2F7FC1]">
                  Admin Master Control
                </span>
                <h3 className="font-serif text-2xl text-[#0F2942]">
                  Add New Hotel Package (POST)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-[#5A738E] hover:text-[#0F2942] text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="mt-4 space-y-3.5">
              <Input
                label="Hotel / Package Name"
                name="name"
                required
                value={packageFormData.name}
                onChange={(e) => setPackageFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. The Royal Mirage Palace"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Location (City)"
                  name="location"
                  required
                  value={packageFormData.location}
                  onChange={(e) => setPackageFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Udaipur"
                />

                <Input
                  label="Base Price (₹ per night)"
                  name="price"
                  type="number"
                  required
                  value={packageFormData.price}
                  onChange={(e) => setPackageFormData((prev) => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1">
                    Star Rating (1 to 5)
                  </label>
                  <select
                    value={packageFormData.stars}
                    onChange={(e) => setPackageFormData((prev) => ({ ...prev, stars: Number(e.target.value) }))}
                    className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3 py-2 text-xs text-[#0F2942] rounded-xs outline-none"
                  >
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★☆ (4 Stars)</option>
                    <option value="3">★★★☆☆ (3 Stars)</option>
                  </select>
                </div>

                <Input
                  label="Image URL"
                  name="image"
                  value={packageFormData.image}
                  onChange={(e) => setPackageFormData((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={packageFormData.amenities}
                  onChange={(e) => setPackageFormData((prev) => ({ ...prev, amenities: e.target.value }))}
                  className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3.5 py-2 text-xs text-[#0F2942] rounded-xs outline-none focus:border-[#2F7FC1]"
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={packageFormData.description}
                  onChange={(e) => setPackageFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3.5 py-2 text-xs text-[#0F2942] rounded-xs outline-none focus:border-[#2F7FC1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#D7E2EA]">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
                  Create Package (POST Method)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT HOTEL PACKAGE (ADMIN PUT & POST METHOD)
         ======================================================== */}
      {editingHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D7E2EA] pb-3">
              <div>
                <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-amber-600">
                  Admin Edit • Package #{editingHotel.id}
                </span>
                <h3 className="font-serif text-2xl text-[#0F2942]">
                  Modify Package Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingHotel(null)}
                className="text-[#5A738E] hover:text-[#0F2942] text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form className="mt-4 space-y-3.5">
              <Input
                label="Hotel / Package Name"
                name="name"
                required
                value={packageFormData.name}
                onChange={(e) => setPackageFormData((prev) => ({ ...prev, name: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Location"
                  name="location"
                  required
                  value={packageFormData.location}
                  onChange={(e) => setPackageFormData((prev) => ({ ...prev, location: e.target.value }))}
                />

                <Input
                  label="Base Price (₹ per night)"
                  name="price"
                  type="number"
                  required
                  value={packageFormData.price}
                  onChange={(e) => setPackageFormData((prev) => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1">
                    Star Rating (1 to 5)
                  </label>
                  <select
                    value={packageFormData.stars}
                    onChange={(e) => setPackageFormData((prev) => ({ ...prev, stars: Number(e.target.value) }))}
                    className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3 py-2 text-xs text-[#0F2942] rounded-xs outline-none"
                  >
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★☆ (4 Stars)</option>
                    <option value="3">★★★☆☆ (3 Stars)</option>
                  </select>
                </div>

                <Input
                  label="Image URL"
                  name="image"
                  value={packageFormData.image}
                  onChange={(e) => setPackageFormData((prev) => ({ ...prev, image: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={packageFormData.amenities}
                  onChange={(e) => setPackageFormData((prev) => ({ ...prev, amenities: e.target.value }))}
                  className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3.5 py-2 text-xs text-[#0F2942] rounded-xs outline-none focus:border-[#2F7FC1]"
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={packageFormData.description}
                  onChange={(e) => setPackageFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3.5 py-2 text-xs text-[#0F2942] rounded-xs outline-none focus:border-[#2F7FC1]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-[#D7E2EA]">
                <Button variant="outline" size="sm" type="button" onClick={() => setEditingHotel(null)}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  loading={isSubmitting}
                  onClick={(e) => handleSaveEditPackage("post", e)}
                  className="border-amber-400 text-amber-800 hover:bg-amber-50"
                >
                  Save Changes (POST Method)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  loading={isSubmitting}
                  onClick={(e) => handleSaveEditPackage("put", e)}
                >
                  Save Changes (PUT Method)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRM DELETE HOTEL PACKAGE (ADMIN DELETE METHOD)
         ======================================================== */}
      {deletingHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 text-xl font-bold">
              ✕
            </div>
            <p className="mt-4 text-[9px] font-semibold tracking-[2px] uppercase text-red-600">
              Admin Master Action: DELETE Method
            </p>
            <h3 className="mt-1 font-serif text-2xl text-[#0F2942]">
              Delete Package #{deletingHotel.id}?
            </h3>
            <p className="mt-2 text-xs text-[#5A738E]">
              Are you sure you want to permanently remove <strong>{deletingHotel.name}</strong> from the public hotel catalog?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeletingHotel(null)}>
                Keep Package
              </Button>
              <Button variant="danger" size="sm" loading={isSubmitting} onClick={handleConfirmDelete}>
                Delete Package (DELETE)
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HotelList;