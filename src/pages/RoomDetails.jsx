import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import StarRating from '../components/StarRating';
import { assets, facilityIcons } from '../assets/assets';
import roomImg11 from '../assets/roomImg11.png';
import { useAuth } from '../context/AuthContext';


const RoomDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(roomImg11);
  const [guests, setGuests] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Pay At Hotel');
  
  const { userData, authToken } = useAuth();
  


  const searchParams = new URLSearchParams(location.search);
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const initialGuests = searchParams.get('guests');


  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const nights = calculateNights();
  
  useEffect(() => {
    if (initialGuests) {
      setGuests(Number(initialGuests));
    }
    
    if (id) {
      fetchRoomDetails(id);
    } else {
      setError("No room ID provided");
      setLoading(false);
    }
  }, [id]);
  
  const fetchRoomDetails = async (roomId) => {
    setLoading(true);
    try {
      console.log(`Fetching room details for ID: ${roomId}`);
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch room details: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Room details raw data:", data);
      
      // Check if hotel data is populated
      if (!data.hotel || !data.hotel._id) {
        console.error("Room data is missing hotel information:", data);
        throw new Error("Room data is missing hotel information");
      }
      
      // Make sure the IDs are properly accessible
      const processedRoom = {
        ...data,
        _id: data._id || data.id, // Ensure _id is available
        hotel: {
          ...data.hotel,
          _id: data.hotel._id || data.hotel.id // Ensure hotel _id is available
        }
      };
      
      console.log("Processed room data:", processedRoom);
      setRoom(processedRoom);
      
      // Set the first image as the main image if available or use fallback
      if (data.images && data.images.length > 0) {
        setMainImage(data.images[0] || roomImg11);
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBookNow = async () => {
    // Check if user is logged in
    if (!userData || !authToken) {
      alert("Please log in to book a room");
      return;
    }

    if (!checkIn || !checkOut || nights === 0) {
      alert("Please select check-in and check-out dates");
      return;
    }

    setIsBookingLoading(true);
    setBookingError(null);

    try {
      // Calculate total price (price per night * nights * 1.18 for taxes)
      const basePrice = parseInt(room.pricePerNight.replace(/,/g, ''));
      const totalPrice = basePrice * nights * 1.18;
      
      // Get email from multiple potential sources to ensure it's available
      let userEmail = null;
      
      // First priority: userData.email
      if (userData && userData.email) {
        userEmail = userData.email;
        console.log("Using email from userData:", userEmail);
      } 
      // Second priority: localStorage
      else if (localStorage.getItem('userEmail')) {
        userEmail = localStorage.getItem('userEmail');
        console.log("Using email from localStorage:", userEmail);
      } 
      // Third option: ask user for email if all else fails
      else {
        userEmail = prompt("Please enter your email address to complete booking:");
        if (userEmail) {
          localStorage.setItem('userEmail', userEmail);
        }
      }
      
      if (!userEmail) {
        throw new Error("Email is required to complete booking");
      }
      
      // Ensure we have valid MongoDB IDs
      const userId = userData?._id || userData?.id;
      const roomId = room?._id;
      const hotelId = room?.hotel?._id;
      
      // Log details for debugging
      console.log("User data:", userData);
      console.log("Room data:", room);
      console.log("IDs for booking:", { userId, roomId, hotelId, userEmail });
      
      if (!userId || !roomId || !hotelId) {
        throw new Error("Missing required IDs for booking. Please refresh and try again.");
      }

      const bookingData = {
        userId,
        roomId,
        hotelId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice: Math.round(totalPrice),
        guests,
        paymentMethod,
        isPaid: paymentMethod !== 'Pay At Hotel',
        userEmail,
        userName: userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : 'Guest'
      };

      console.log("Sending booking data:", bookingData);

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(bookingData)
      });

      // Debug: Log the full response
      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response text:", responseText);

      // Parse JSON response if it's valid JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log("Response is not valid JSON");
        data = { error: responseText };
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to book room");
      }

      console.log("Booking successful:", data);
      setBookingSuccess(true);
      
      // Show booking success for 3 seconds then redirect
      setTimeout(() => {
        navigate('/my-bookings');
      }, 3000);

    } catch (error) {
      console.error("Error booking room:", error);
      setBookingError(error.message || "An error occurred while booking");
    } finally {
      setIsBookingLoading(false);
    }
  };
  
  // Format price with commas
  const formatPrice = (price) => {
    if (!price) return "0";
    
    // If price already has commas, return as is
    if (typeof price === 'string' && price.includes(',')) {
      return price;
    }
    
    // Otherwise format the number with commas
    return Number(price).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="bg-red-50 p-6 rounded-xl text-red-700">
          <h2 className="text-2xl font-bold mb-4">Error Loading Room Details</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen pt-28 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="bg-yellow-50 p-6 rounded-xl text-yellow-700">
          <h2 className="text-2xl font-bold mb-4">Room Not Found</h2>
          <p>We could not find the room you're looking for.</p>
          <button 
            onClick={() => navigate('/rooms')} 
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
          >
            View All Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-orange-500">Home</span>
        <span className="mx-2">/</span>
        <span onClick={() => navigate('/search-results')} className="cursor-pointer hover:text-orange-500">Search Results</span>
        <span className="mx-2">/</span>
        <span className="text-orange-500">{room.roomType}</span>
      </div>
      
      {/* Room Title and Hotel Info */}
      <div className="mb-6">
        <h1 className="font-playfair text-3xl md:text-4xl">{room.roomType}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2">
          <div className="flex items-center">
            <StarRating rating={4.5} />
            <span className="ml-2 text-gray-500">200+ reviews</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-500">{room.hotel.address}, {room.hotel.city}</span>
          </div>
        </div>
      </div>
      
      {/* Main Image and Gallery */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        {/* Main Image */}
        <div className="lg:w-2/3">
          <img 
            src={mainImage} 
            alt={room.roomType} 
            className="w-full h-96 object-cover rounded-xl shadow-md" 
          />
        </div>
        
        {/* Image Gallery */}
        <div className="lg:w-1/3 grid grid-cols-2 gap-4">
          {[roomImg11, roomImg11, roomImg11, roomImg11].map((img, index) => (
            <div 
              key={index} 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setMainImage(img)}
            >
              <img 
                src={img} 
                alt={`Room view ${index + 1}`}
                className="w-full h-44 object-cover rounded-lg shadow-sm" 
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Booking Success Message (Conditional Rendering) */}
      {bookingSuccess && (
        <div className="mb-8 bg-green-50 p-6 rounded-xl border border-green-200 text-green-700">
          <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
          <p>Your booking has been successfully processed. Thank you for choosing {room.hotel.name}.</p>
          <p className="mt-2">We'll redirect you to your bookings page shortly...</p>
        </div>
      )}

      {/* Booking Error Message (Conditional Rendering) */}
      {bookingError && (
        <div className="mb-8 bg-red-50 p-6 rounded-xl border border-red-200 text-red-700">
          <h2 className="text-2xl font-bold mb-4">Booking Failed</h2>
          <p>{bookingError}</p>
        </div>
      )}
      
      {/* Room Info and Booking Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Room Details */}
        <div className="lg:w-2/3">
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
            <h2 className="font-playfair text-2xl mb-4">About {room.roomType}</h2>
            <p className="text-gray-600 mb-6">
              Experience luxury and comfort in our {room.roomType} at {room.hotel.name}, 
              located in beautiful {room.hotel.city}. This room offers a perfect blend of elegance 
              and modern amenities to ensure a memorable stay.
            </p>
            
            {/* Room Features */}
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-3">Room Features</h3>
              <div className="flex flex-wrap gap-4">
                {room.amenities && room.amenities.length > 0 ? (
               
                  [...new Set(room.amenities)].map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70">
                      <img 
                        src={facilityIcons[amenity]} 
                        alt={amenity} 
                        className="w-5 h-5"
                        onError={(e) => {e.target.style.display = 'none'}}
                      />
                      <p className="text-sm">{amenity}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No specific amenities listed for this room.</p>
                )}
              </div>
            </div>
            
            {/* Hotel Policies */}
            <div>
              <h3 className="font-medium text-lg mb-3">Hotel Policies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Check-in Time</p>
                    <p className="text-gray-500">12:00 PM - 11:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Check-out Time</p>
                    <p className="text-gray-500">10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Cancellation Policy</p>
                    <p className="text-gray-500">Free cancellation up to 48 hours before check-in</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Payment Options</p>
                    <p className="text-gray-500">Credit/Debit cards, UPI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* About Hotel */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
            <h2 className="font-playfair text-2xl mb-4">About {room.hotel.name}</h2>
            <p className="text-gray-600 mb-6">
              {room.hotel.name} is one of the finest hotels in {room.hotel.city}, offering 
              exceptional service and world-class amenities. Located in a prime area, the hotel provides 
              easy access to major attractions, shopping centers, and business districts.
            </p>
            
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={roomImg11}
                alt={room.hotel.name}
                className="w-20 h-20 object-cover rounded-lg" 
              />
              <div>
                <p className="font-medium">{room.hotel.name}</p>
                <p className="text-gray-500 text-sm">{room.hotel.address}, {room.hotel.city}</p>
                <p className="text-gray-500 text-sm mt-1">Contact: {room.hotel.contact}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Booking Card */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 sticky top-32">
            <h2 className="font-medium text-xl mb-4 pb-4 border-b border-gray-200">Booking Details</h2>
            
            <div className="flex justify-between my-3">
              <span className="text-gray-600">Room Type:</span>
              <span className="font-medium">{room.roomType}</span>
            </div>
            
            <div className="flex justify-between my-3">
              <span className="text-gray-600">Price per Night:</span>
              <span className="font-medium">₹{formatPrice(room.pricePerNight)}</span>
            </div>
            
            <div className="flex justify-between my-3">
              <span className="text-gray-600">Stay Duration:</span>
              <span className="font-medium">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
            </div>
            
            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6 mt-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Check-in Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={checkIn || ''}
                  onChange={(e) => {
                    const params = new URLSearchParams(location.search);
                    params.set('checkIn', e.target.value);
                    navigate(`/rooms/${id}?${params.toString()}`);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Check-out Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={checkOut || ''}
                  onChange={(e) => {
                    const params = new URLSearchParams(location.search);
                    params.set('checkOut', e.target.value);
                    navigate(`/rooms/${id}?${params.toString()}`);
                  }}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            {/* Guest Selection */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">Number of Guests</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {[1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">Payment Method</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Pay At Hotel">Pay At Hotel</option>
                <option value="Credit Card">Credit Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 my-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Room Charge:</span>
                <span>₹{formatPrice(room.pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Taxes & Fees (18%):</span>
                <span>₹{formatPrice(parseInt(room.pricePerNight.replace(/,/g, '')) * nights * 0.18)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total Amount:</span>
                <span>₹{formatPrice(parseInt(room.pricePerNight.replace(/,/g, '')) * nights * 1.18)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleBookNow}
              disabled={!checkIn || !checkOut || nights === 0 || isBookingLoading}
              className={`w-full py-3 rounded-md text-white font-medium mt-2 ${
                !checkIn || !checkOut || nights === 0 || isBookingLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
             {isBookingLoading ? 'Processing...' : 'Book Now'} 
            </button>
            
            {(!checkIn || !checkOut) && (
              <p className="text-xs text-center mt-2 text-red-600">
                Please select check-in and check-out dates
              </p>
            )}

            {!userData && (
              <p className="text-xs text-center mt-2 text-red-600">
                Please log in to book this room
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;