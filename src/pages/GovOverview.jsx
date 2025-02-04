import DoughnutChart from '../components/DoughnutChart';
import LineChart from '../components/LineChart'
import MapComponent from '../components/Map'

const sampleData = [
    { year: 2001, men: 75, women: 50, others: 25 },
    { year: 2002, men: 65, women: 55, others: 35 },
    { year: 2003, men: 50, women: 60, others: 45 },
    { year: 2004, men: 55, women: 65, others: 75 },
    { year: 2005, men: 45, women: 70, others: 65 },
    { year: 2006, men: 60, women: 65, others: 50 },
    { year: 2007, men: 50, women: 55, others: 40 },
    { year: 2008, men: 55, women: 50, others: 45 },
    { year: 2009, men: 65, women: 45, others: 50 },
    { year: 2010, men: 75, women: 35, others: 55 },
  ];

  const linesConfig = [
    { dataKey: "men", color: "#1E90FF" },
    { dataKey: "women", color: "#FF4500" },
    { dataKey: "others", color: "#800080" },
      ];

    const data = {
        labels: ["Red", "Blue", "Yellow", "Green"], // Labels for the doughnut segments
        datasets: [
          {
            data: [300, 50, 100, 200], // Values for the doughnut segments
            backgroundColor: ["#FF5733", "#33AFFF", "#FFEB33", "#33FF57"], // Segment colors
            hoverBackgroundColor: ["#FF5733", "#33AFFF", "#FFEB33", "#33FF57"],
          },
        ],
      };

      const markers = [
        { position: [51.505, -0.09], color: 'red' },
        { position: [51.515, -0.1], color: 'blue' },
        { position: [51.525, -0.11], color: 'green' },
      ];

const GovOverview = () => {

  return (
    <div className='flex flex-col gap-2'>
        <div className=" flex items-center gap-2 w-ful">
            <div className="flex flex-col justify-between rounded-xl p-3 w-[23rem] h-[15.5rem] bg-white">
                <div className='font-semibold text-xl text-[#343C6A]'>ENTITY</div>
                <DoughnutChart data={data}/>
            </div>
            <div className=" bg-white rounded-xl border w-[40rem] h-[15.5rem] px-3 py-2 flex-1">
              <div className=' font-semibold mb-2 text-xl text-[#343C6A]'>MARKET PRESENCE</div>
              <MapComponent/>
            </div>
        </div>
        <div className='bg-white rounded-xl border w-full px-3 py-2 '>
            <div className='font-semibold text-xl text-[#343C6A]'>ECONOMIC PERFORMANCE</div>            
            <div className='flex justify-between mt-5'>
            <div className=' w-[30rem] '>
                <div className='flex items-center gap-2 ml-10'>
                    <div className="w-4 h-4 rounded-full bg-[#3d9f86]">
                    </div>
                    <div>Emission %</div>
                </div>
                <LineChart
                    data={sampleData}
                    lines={linesConfig}
                    xKey="year"
                    yLabel="Number of People"
                    fillVal={true}
                />
            </div>
            <div className='w-[30rem]'>
                <div className='flex items-center gap-2 ml-10'>
                    <div className="w-4 h-4 rounded-full bg-[#3d9f86]">
                    </div>
                    <div>Emission %</div>
                </div>
                <LineChart
                    data={sampleData}
                    lines={linesConfig}
                    xKey="year"
                    yLabel="Number of People"
                    fillVal={true}
                />
            </div>
            </div>
        </div>
    </div>
  )
}

export default GovOverview