import Header from "@/features/adminPanel/common/Header";
import { ChartBarDefault } from "@/features/adminPanel/dashboard/components/BarChart";
import StatsCards from "@/features/adminPanel/dashboard/components/StatsCards";
import TopProducts from "@/features/adminPanel/dashboard/components/TopProducts";

const Dashboard = () => {
  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <Header heading="Dashboard" subheading="Welcome back! Here's what's happening with your business today." />

        {/* Stats Cards */}
        <StatsCards/>

        {/* Additional Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartBarDefault/>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <TopProducts/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard