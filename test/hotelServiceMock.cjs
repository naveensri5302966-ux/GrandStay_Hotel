const { hotelData } = require('../src/data.js');

const serviceMock = {
  getHotels: jest.fn().mockResolvedValue(hotelData),
  getHotelById: jest.fn().mockImplementation((id) => Promise.resolve(hotelData.find((h) => h.id === Number(id)))),
  getHotelRooms: jest.fn().mockImplementation((id) => {
    const h = hotelData.find((h) => h.id === Number(id));
    return Promise.resolve(h ? h.rooms : []);
  }),
  searchHotels: jest.fn().mockResolvedValue(hotelData),
  createHotelPackage: jest.fn().mockResolvedValue({ id: 109, name: "New Hotel" }),
  updateHotelPackage: jest.fn().mockResolvedValue({ id: 101, name: "Updated Hotel" }),
  deleteHotelPackage: jest.fn().mockResolvedValue({ success: true })
};

module.exports = {
  __esModule: true,
  default: serviceMock,
  hotelService: serviceMock
};
