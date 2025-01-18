import { useSidebar } from "../context/SidebarContext"

const Header = () => {
    const {page} = useSidebar()

    const values={
        "admin":"Admin Settings",
        "home":"Dashboard",
        "support":"Support",
        "analytics":"Branch Wise Progress",
        "fuels":"Fuels"
    }
  return (
    <div className='w-full h-16 bg-white text-[#343C6A] flex items-center justify-between px-5'>
        <div className=" font-bold ">
            {values[page]}
        </div>
        <div className="flex gap-2">
            <div>
                Current reporting Cycle:
            </div>
            
            <div className="font-semibold">
                01-2025
            </div>
        </div>
        <div className="flex gap-2">
            <div className="font-semibold">
                Welcome,
            </div>
            <div>
                user@gmail.com
            </div>
        </div>
    </div>
  )
}

export default Header