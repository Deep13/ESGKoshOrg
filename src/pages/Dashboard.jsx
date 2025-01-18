import seeding from '../assets/seeding.png'
import social from '../assets/social.png'
import governance from '../assets/governance.png'
import { FaArrowRight } from 'react-icons/fa'
import ProgressBar from '../components/ProgressBar'
import RecentTicketsTable from '../components/RecentTicketsTable'
import { useSidebar } from '../context/SidebarContext'

const Dashboard = () => {
    const { expanded } = useSidebar()

    return (
        <div className='p-5 w-full h-screen bg-slate-100'>
            <div>
                <div className='font-semibold mb-3'>My Cards</div>
                <div className={`flex justify-between flex-wrap ${expanded?"gap-1":"gap-4"}`}>
                    <div className={`${expanded ? "w-[15rem]" : "w-[19rem]"} h-[10rem] bg-gradient-to-r from-[#3d9f86] to-[#29C472] border rounded-t-xl text-white p-5`}>
                        <div className='flex justify-between items-center'>
                            <span className='text-xl font-semibold'>Enviorment</span>
                            <div>
                                <img src={seeding} alt='seeding icon' />
                            </div>
                        </div>
                        <div className='mt-2 text-[2.5rem]'>
                            14.5%
                        </div>
                        <div className={`flex justify-between items-center ${expanded?"w-[15rem]":"w-[19rem]"} rounded-b-[1rem] border-t bg-gradient-to-r from-[#30a36a] to-[#29C472] p-3 ml-[-1.25rem]`}>
                            <span>Enter Reports</span>
                            <FaArrowRight />
                        </div>
                    </div>
                    <div className={`${expanded ? "w-[15rem]" : "w-[19rem]"} h-[11rem] border rounded-xl p-5 bg-white`}>
                        <div className='flex justify-between items-center'>
                            <span className='text-xl font-semibold text-[#718EBF]'>Social</span>
                            <div>
                                <img src={social} alt='social icon' />
                            </div>
                        </div>
                        <div className='mt-2 text-[2.5rem]'>
                            30%
                        </div>
                        <div className={`flex justify-between items-center ${expanded?"w-[15rem]":"w-[19rem]"} rounded-b-[1rem] border-t text-[#718EBF] p-3 ml-[-1.25rem]`}>
                            <span className=''>Enter Reports</span>
                            <FaArrowRight />
                        </div>
                    </div>
                    <div className={`${expanded ? "w-[15rem]" : "w-[19rem]"} h-[11rem] border rounded-xl p-5 bg-white`}>
                        <div className='flex justify-between items-center'>
                            <span className='text-xl font-semibold text-[#718EBF]'>Governance</span>
                            <div>
                                <img src={governance} alt='governance icon' />
                            </div>
                        </div>
                        <div className='mt-2 text-[2.5rem]'>
                            30%
                        </div>
                        <div className={`flex justify-between items-center ${expanded?"w-[15rem]":"w-[19rem]"} rounded-b-[1rem] border-t text-[#718EBF] p-3 ml-[-1.25rem]`}>
                            <span>Enter Reports</span>
                            <FaArrowRight />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex mt-5 gap-5 justify-between flex-wrap">
                <div className="w-[40%] sm:w-[45%] lg:w-[35%] rounded-lg">
                    <div className='mb-3 font-semibold'>Reporting</div>
                    <div className='bg-white h-[20rem] w-full rounded-lg mb-5'>
                        <ProgressBar />
                    </div>
                </div>
                <div className={`${expanded ? "w-[35%]" : "w-[55%]"} sm:w-[80%] lg:w-[60%] rounded-lg`}>
                    <div className='mb-3 font-semibold'>Recent Tickets</div>
                    <div className='bg-white h-[20rem] w-full rounded-lg'>
                        <RecentTicketsTable />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
