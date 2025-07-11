import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/luxor_holiday_home_stays?igsh=c3lndHU2ZG1rYjM=', '_blank');
  };

  const handleFacebookClick = () => {
    window.open('https://www.facebook.com/luxorholidayhomestays', '_blank');
  };

  const handleWhatsappClick = () => {
    window.open('https://wa.me/918015924647?text=Hi, I would like to know more about Luxor Holiday Home Stays', '_blank');
  };

  return (
    <div className='bg-[#F6F9FC] text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
                <div className='max-w-80'>
                    <img src={assets.logo} alt="logo" className='mb-4 h-8 md:h-9 ' />
                    <p className='text-sm'>
                    Discover the world's most extraordinary places to stay, from boutique hotels to Luxury villas and private villas.
                    </p>
                    <div className='flex items-center gap-3 mt-4'>

                        <img 
                          src={assets.instagramIcon} 
                          alt="instagram-icon" 
                          className='w-6 cursor-pointer hover:opacity-80'
                          onClick={handleInstagramClick}
                        />
                        <img 
                          src={assets.facebookIcon} 
                          alt="facebook-icon" 
                          className='w-6 cursor-pointer hover:opacity-80'
                          onClick={handleFacebookClick}
                        />
                        <img 
                          src={assets.whatsappIcon} 
                          alt="whatsapp-icon" 
                          className='w-6 cursor-pointer hover:opacity-80'
                          onClick={handleWhatsappClick}
                        />
                    </div>
                </div>

                <div>
                    <p className='font-playfair text-lg text-gray-800'>OUR VILLAS</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><a href="#">villa 1</a></li>
                        <li><a href="#">villa 2</a></li>

                    </ul>
                </div>

                <div>
                    <p className='font-playfair text-lg text-gray-800'>Luxorvilla</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/h">Help-Center</Link></li>
                        <li><Link to="/si">Safety Information</Link></li>
                    </ul>
                </div>

                <div className='max-w-80'>
                    <p className='font-playfair text-lg text-gray-800'>STAY UPDATED</p>
                    <p className='mt-3 text-sm'>
                        Subscribe to our newsletter for inspiration and special offers.
                    </p>
                    <div className='flex items-center mt-4'>
                        <input type="text" className='bg-white rounded-l border border-gray-300 h-9 px-3 outline-none' placeholder='Your email' />
                        <button className='flex items-center justify-center bg-black h-9 w-9 aspect-square rounded-r'>
                            {/* Arrow icon */}
                            <img src={assets.arrowIcon} alt="arrow-icon" className='w-3.5 invert' />
                        </button>
                    </div>
                </div>
            </div>
            <hr className='border-gray-300 mt-8' />
            <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
                <p>© {new Date().getFullYear()} Luxor stay. All rights reserved.</p>
                <ul className='flex items-center gap-4'>
                    <li><a href="#">Privacy</a></li>
                    <li><a href="#">Terms</a></li>
                    <li><a href="#">Sitemap</a></li>
                </ul>
            </div>
        </div>
  )
}

export default Footer