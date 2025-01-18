import seeding from '../assets/seeding.png'
import social from '../assets/social.png'
import governance from '../assets/governance.png'
import { FaArrowRight } from 'react-icons/fa'
import ProgressBar from '../components/ProgressBar'
import RecentTicketsTable from '../components/RecentTicketsTable'

const Dashboard = () => {
  return (
    <div className='mx-auto my-auto p-10 h-screen bg-slate-100'>
        <div>
            <div className='font-semibold mb-3'>My Cards</div>
            <div className=" flex justify-between">
                <div  className="w-[30%] h-[13rem] bg-gradient-to-r from-[#3d9f86] to-[#29C472] border rounded-xl text-white p-5">
                    <div className='flex justify-between items-center '>
                        <span className='text-xl font-semibold'>Enviorment</span>
                        <div>
                            <img src={seeding} alt='seeding icon'/>
                        </div>
                    </div>
                    <div className='mt-2 text-[3rem]'>
                        14.5%
                    </div>

                    <div className='flex justify-between items-center mt-[1.4rem] w-[22.25rem] rounded-[1rem] border-t bg-gradient-to-r from-[#30a36a] to-[#29C472] p-3  ml-[-1.2rem]'>
                        <span>Enter Reports</span>
                        <FaArrowRight/>
                    </div>
                </div>
                <div className="w-[30%] h-[13rem] border rounded-xl p-5 bg-white">
                    <div className='flex justify-between items-center '>
                        <span className='text-xl font-semibold text-[#718EBF]'>Social</span>
                        <div>
                            <img src={social} alt='seeding icon'/>
                        </div>
                    </div>
                    <div className='mt-2 text-[3rem]'>
                        30%
                    </div>

                    <div className='flex text-[#718EBF] justify-between items-center mt-[1.5rem] border-t-[0.15rem] rounded-bl-xl rounded-br-xl p-3 w-[22.55rem] ml-[-1.3rem]'>
                        <span>Enter Reports</span>
                        <FaArrowRight/>
                    </div>
                </div>
                <div className="w-[30%] h-[13rem] border rounded-xl p-5 bg-white">
                    <div className='flex justify-between items-center '>
                        <span className='text-xl font-semibold text-[#718EBF]'>Governance</span>
                        <div>
                            <img src={governance} alt='seeding icon'/>
                        </div>
                    </div>
                    <div className='mt-2 text-[3rem]'>
                        30%
                    </div>

                    <div className='flex text-[#718EBF] justify-between items-center mt-[1.5rem] border-t-[0.15rem] rounded-bl-xl rounded-br-xl p-3 w-[22.55rem] ml-[-1.3rem]'>
                        <span>Enter Reports</span>
                        <FaArrowRight/>
                    </div>
                </div>
            </div>
        </div>
        <div className=" flex mt-5 gap-5 justify-between items-center ">
            <div className="w-[30%]  rounded-lg ">
                <div className='mb-3 font-semibold'>Reporting</div>
                <div className='bg-white h-[15rem] w-full rounded-lg'>
                    <ProgressBar/>
                </div>  
            </div>
            <div className="w-[65%] rounded-lg">
                <div className='mb-3 font-semibold'>Recent Tickets</div>
                <div className='bg-white h-[15rem] w-full rounded-lg'>
                    <RecentTicketsTable/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Dashboard