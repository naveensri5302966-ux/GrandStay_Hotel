import { useState, useEffect, useCallback } from "react";
import hotelService from "../services/hotelService";
import { hotelData } from "../data";
import logger from "../utils/logger";

/**
 * Custom Hook: useHotels() (Experiment 1: REST API with Axios)
 * Handles asynchronous hotel data fetching, location search, date selection,
 * price filtering, star ratings, amenities filtering, and loading/error states.
 */
export function useHotels(initialHotels = hotelData) {
  const [hotels, setHotels] = useState(initialHotels);
  const [filteredHotels, setFilteredHotels] = useState(initialHotels);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter Criteria
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("2026-11-10");
  const [checkOut, setCheckOut] = useState("2026-11-13");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [minStars, setMinStars] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [availability, setAvailability] = useState("available");

  // Fetch hotels from REST API using Axios
  const fetchHotels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await hotelService.getHotels({
        location: location.trim() || undefined,
        maxPrice,
        minStars: minStars > 0 ? minStars : undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities.join(",") : undefined,
        availability
      });
      setHotels(data);
      setFilteredHotels(data);
    } catch (err) {
      setError(err.message || "Failed to retrieve hotel data from server");
      logger.error("HOTELS", "Error fetching hotels via API", err);
      // Fallback gracefully to local catalog
      setFilteredHotels(hotelData);
    } finally {
      setIsLoading(false);
    }
  }, [location, maxPrice, minStars, selectedAmenities, availability]);

  // Effect to re-fetch when search/filter criteria change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHotels();
    }, 200); // 200ms debounce for responsive filtering without spamming

    return () => clearTimeout(timer);
  }, [fetchHotels]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setLocation("");
    setMaxPrice(20000);
    setMinStars(0);
    setSelectedAmenities([]);
    setAvailability("available");
  }, []);

  return {
    hotels,
    setHotels,
    filteredHotels,
    isLoading,
    error,
    location,
    setLocation,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    maxPrice,
    setMaxPrice,
    minStars,
    setMinStars,
    selectedAmenities,
    setSelectedAmenities,
    availability,
    setAvailability,
    refetchHotels: fetchHotels,
    resetFilters
  };
}

export default useHotels;
