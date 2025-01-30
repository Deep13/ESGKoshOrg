import flight from "../assets/flight.png"
import road from "../assets/Road.png"
import ship from "../assets/ship.png"
import tower from "../assets/tower.png"
const EnvOverview = () => {
  return (
    <div className='flex flex-col px-3 py-2 gap-2'>

      <div className="flex items-center justify-between">
        <div className="bg-white w-[36rem] h-[15rem] p-2 border rounded-xl"> 
          scope card
        </div>
        <div className="bg-white flex flex-col w-[26rem] h-[15rem] p-2 border rounded-xl bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white">
          <div className="">
            EMISSION FROM BUISNESS TRAVEL
          </div>
          <div className=" mt-3 flex items-center justify-between">
            <div className="flex flex-col justify-center items-center">
              <div className="w-24 h-24">
                <img src={flight} alt="flight-img"></img>
              </div>
              <div>Flight</div>
              <div>Emission x%</div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="w-24 h-24">
                <img src={road} alt="flight-img"></img>
              </div>
              <div>Flight</div>
              <div>Emission x%</div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="w-24 h-24">
                <img src={ship} alt="flight-img"></img>
              </div>
              <div>Flight</div>
              <div>Emission x%</div>
            </div>
          </div>
        </div>
      </div>
      <div className=" flex justify-between items-center">
        <div className="bg-white w-[50rem] h-[19rem] p-2 border rounded-xl">
          <div className="font-semibold text-xl text-[#343C6A] mb-3">EMISSION BY CATEGORIES</div>
          <div className="flex">
            <div className=" w-[20rem]">
              <div className="flex">
                <div className="bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white flex flex-col px-5 py-10 rounded-md w-[10rem] items-center justify-center">
                  <div>Household</div>
                  <div>70%</div>
                </div>
                <div className="bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white flex flex-col px-5 py-10 rounded-md w-[10rem] items-center justify-center">
                  <div>Agriculture</div>
                  <div>70%</div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white px-5 py-[2.85rem] rounded-md">
                <div className="text-3xl font-semibod">
                  90%
                </div>
                <div>Industries</div>
              </div>
            </div>
            <div className="w-[30rem] flex flex-col gap-[0.1rem]">
              <div className="flex ">
                <div className="flex-1 flex flex-col gap-[0.1rem]">
                  <div className="flex gap-[0.1rem]">
                    <div className="rounded-md bg-[#E34444] text-white py-4 px-1">
                      <div>Agriculture</div>
                      <div>80%</div>
                    </div>
                    <div className="rounded-md bg-[#E34444] text-white py-4 px-1 ">
                      <div>Agriculture</div>
                      <div>80%</div>
                    </div>
                  </div>
                  <div className="flex gap-[0.1rem]">
                    <div className="rounded-md bg-[#E34444] text-white py-4 px-2">
                      <div>Agriculture</div>
                      <div>80%</div>
                    </div>
                    <div className="rounded-md bg-[#E34444] text-white py-4 px-2">
                      <div>Agriculture</div>
                      <div>80%</div>
                    </div>
                  </div>
                </div>
                <div className=""></div>
                <div className=""></div>
              </div>
              <div className=" flex">
                <div className=" flex-1 bg-[#4AA9DC] text-white rounded-md p-5 flex flex-col items-center justify-center">
                  <div>Household</div>
                  <div>90%</div>
                </div>
                <div className="flex-1 bg-[#4AA9DC] text-white rounded-md p-5 flex flex-col items-center justify-center">
                  <div>Household</div>
                  <div>90%</div>
                </div>
                <div className="flex-1 bg-[#4AA9DC] text-white rounded-md p-5 flex flex-col items-center justify-center">
                  <div>Household</div>
                  <div>90%</div>
                </div>
              </div>
            </div>
           
    
          </div>
        </div>
        <div className="bg-white w-[12rem] p-2 border rounded-xl flex flex-col">
            <div className="font-semibold text-xl text-[#343C6A]">
              EMISSION FROM ELECTRICITY CONSUMPTION
            </div>
            <div className="flex mt-3 items-center">
              <div className=" text-slate-600">
                <div className="">
                  EMISSION <br/> value
                </div>
                <div className="">
                  CONSUMPTION<br/> value
                </div>
              </div>
              <div className="">
                <img src={tower} alt="tower"/>
              </div>
            </div>
        </div>
      </div>
      <div className=""></div>
    </div>
  )
}

export default EnvOverview