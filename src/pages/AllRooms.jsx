import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { assets, facilityIcons } from '../assets/assets';
import { getImageByFilename } from '../utils/imageMapping';
import { API_BASE_URL } from '../config/api';

const CheckBox = ({label, selected = false, onChange = () => { }}) => {
    return (
        <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
            <input type="checkbox" checked={selected} onChange={(e)=>onChange(e.target.checked, label)}/>
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}

const RadioButton = ({label, selected = false, onChange = () => { }}) => {
    return (
        <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
            <input type="radio" name="sortOption" checked={selected} onChange={()=>onChange(label)}/>
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}

const AllRooms = () => {
    const navigate = useNavigate();
    const [openFilters, setOpenFilters] = useState(true); // Default to open on larger screens
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        roomType: [],
        priceRange: [],
        sortOption: ''
    });

    const roomTypes = [
        "Deluxe Room",
        "Executive Suite",
        "Family Room",
        "Premium Suite",
        "Standard Room",
        "Ocean View Room"
    ];

    const priceRanges = [
        '0 to 5000',
        '5000 to 10000',
        '10000 to 15000',
        '15000 to 20000',
    ];

    const sortOptions = [
        "Price Low to High",
        "Price High to Low",
        "Newest First",
    ];

    useEffect(() => {
        fetchRooms();
    }, [filters]);

    useEffect(() => {
        console.log("Filter changed, fetching rooms...");
        fetchRooms();
    }, [filters.roomType, filters.priceRange, filters.sortOption]);  // Explicitly list dependencies

    const fetchRooms = async () => {
        setLoading(true);
        try {
            console.log("Fetching with filters:", filters);
            // Build query params based on filters
            const params = new URLSearchParams();
            
            if (filters.roomType.length > 0) {
                // We want exact matches for room types
                const roomTypeString = filters.roomType.join(',');
                params.append('roomType', roomTypeString);
                console.log("Room type filter:", roomTypeString);
            }
            
            if (filters.priceRange.length > 0) {
                // Parse price ranges and append min/max
                let minPrices = [];
                let maxPrices = [];
                
                filters.priceRange.forEach(range => {
                    // Extract just the numbers from the range string, handling the ₹ symbol correctly
                    // The format is " ₹ 0 to 5000" so we need to remove " ₹ " and split by " to "
                    const cleanedRange = range.replace(/^\s*₹\s*/, '').trim();
                    const [min, max] = cleanedRange.split(/\s+to\s+/);
                    
                    console.log(`Cleaned range: "${cleanedRange}", min: "${min}", max: "${max}"`);
                    
                    if (min && max) {
                        minPrices.push(parseInt(min));
                        maxPrices.push(parseInt(max));
                    }
                });
                
                // Use the minimum of all min values and maximum of all max values
                if (minPrices.length) {
                    const minPrice = Math.min(...minPrices);
                    params.append('minPrice', minPrice);
                    console.log(`Setting minPrice: ${minPrice}`);
                }
                
                if (maxPrices.length) {
                    const maxPrice = Math.max(...maxPrices);
                    params.append('maxPrice', maxPrice);
                    console.log(`Setting maxPrice: ${maxPrice}`);
                }
            }
            
            if (filters.sortOption) {
                params.append('sortBy', filters.sortOption);
                console.log("Sort option:", filters.sortOption);
            }
            
            const url = `${API_BASE_URL}/api/rooms?${params}`;
            console.log("Fetching from URL:", url);
            
            const response = await fetch(url);
            const data = await response.json();
            console.log("API response:", data);
            setRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoomTypeChange = (selected, type) => {
        console.log(`Room type ${type} ${selected ? 'selected' : 'deselected'}`);
        setFilters(prev => {
            if (selected) {
                return { ...prev, roomType: [...prev.roomType, type] };
            } else {
                return { ...prev, roomType: prev.roomType.filter(t => t !== type) };
            }
        });
    };

    const handlePriceRangeChange = (selected, range) => {
        console.log(`Price range ${range} ${selected ? 'selected' : 'deselected'}`);
        
        // The range parameter already includes the "₹" symbol
        // We don't need to add it again when updating the filters
        setFilters(prev => {
            if (selected) {
                return { ...prev, priceRange: [...prev.priceRange, range] };
            } else {
                return { ...prev, priceRange: prev.priceRange.filter(r => r !== range) };
            }
        });
    };

    const handleSortOptionChange = (option) => {
        console.log(`Sort option changed to ${option}`);
        setFilters(prev => ({ ...prev, sortOption: option }));
    };

    const handleClearFilters = () => {
        console.log("Clearing all filters");
        setFilters({
            roomType: [],
            priceRange: [],
            sortOption: ''
        });
    };

    const viewRoomDetails = (roomId) => {
        navigate(`/rooms/${roomId}`);
    };

    return (
        <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
            <div className="w-full lg:w-3/4">
                <div className='flex flex-col items-start text-left'>
                    <h1 className='font-playfair text-4xl md:text-[40px]'>Hotel Rooms</h1>
                    <p className='text-sm md:text-base text-gray-500/90 mt-2 max-w-174'>Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories.</p>
                </div>
                
                {loading ? (
                    <div className="py-10 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                        </div>
                        <p className="mt-2">Loading rooms...</p>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="py-10 text-center">No rooms found matching your criteria</div>
                ) : (
                    rooms.map((room) => (
                        <div key={room._id} className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'>
                            <img 
                                onClick={() => viewRoomDetails(room._id)} 
                                src={getImageByFilename(room.images[0])} 
                                alt="hotel-img" 
                                title='view Room Details' 
                                className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer'
                            />
                            <div className='md-w-1/2 flex flex-col gap-2'>
                                <p className='text-gray-500'>{room.hotel.city}</p>
                                <p 
                                    onClick={() => viewRoomDetails(room._id)}
                                    className='text-gray-800 text-3xl font-playfair cursor-pointer'
                                >
                                    {room.hotel.name}
                                </p>
                                <div className='flex items-center'>
                                    <StarRating />
                                    <p className='ml-2'>200+ reviews</p>
                                </div>
                                <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                                    <img src={assets.locationIcon} alt="location-icon" />
                                    <span>{room.hotel.address}</span>
                                </div>
                                <div className='flex flex-wrap items-cover mt-3 mb-6 gap-4'>
                                    {room.amenities.slice(0, 5).map((item, index) => (
                                        <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70'>
                                            <img src={facilityIcons[item] || facilityIcons['default']} alt={item} className='w-5 h-5'/>
                                            <p className='text-xs'>{item}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-baseline">
                                    <p className='text-xl font-medium text-gray-700'> ₹{room.pricePerNight} </p>
                                    <span className="text-sm text-gray-500">/night</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{room.roomType}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className='bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 lg:mt-16 lg:ml-8'>
                <div className={`flex items-center justify-between px-5 py-2.5 ${openFilters ? "border-b" : "lg:border-b"} border-gray-300`}>
                    <p className='text-base font-medium text-gray-800'>FILTERS</p>
                    <div className='text-xs cursor-pointer'>
                        <span onClick={() => setOpenFilters(!openFilters)} className='lg:hidden'>
                            {openFilters ? 'HIDE' : 'SHOW'}
                        </span>
                        <span onClick={handleClearFilters} className='hidden lg:block'>CLEAR</span>
                    </div>
                </div>

                <div className={`${openFilters ? 'h-auto' : "h-0 lg:h-auto"} overflow-hidden transition-all duration-700`}>
                    <div className='px-5 pt-5'>
                        <p className='font-medium text-gray-800 pb-2'>Room Types</p>
                        {roomTypes.map((roomType, index) => (
                            <CheckBox 
                                key={index} 
                                label={roomType}
                                selected={filters.roomType.includes(roomType)}
                                onChange={(selected, type) => handleRoomTypeChange(selected, type)}
                            />
                        ))}
                    </div>

                    <div className='px-5 pt-5'>
                        <p className='font-medium text-gray-800 pb-2'>Price Range</p>
                        {priceRanges.map((range, index) => {
                            const labelWithCurrency = ` ₹ ${range}`;
                            return (
                                <CheckBox 
                                    key={index} 
                                    label={labelWithCurrency}
                                    selected={filters.priceRange.includes(labelWithCurrency)}
                                    onChange={(selected, rangeLabel) => handlePriceRangeChange(selected, rangeLabel)}
                                />
                            );
                        })}
                    </div>

                    <div className='px-5 pt-5 pb-7'>
                        <p className='font-medium text-gray-800 pb-2'>Sort By</p>
                        {sortOptions.map((option, index) => (
                            <RadioButton 
                                key={index} 
                                label={option}
                                selected={filters.sortOption === option}
                                onChange={handleSortOptionChange}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AllRooms