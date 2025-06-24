import { Card, CardContent,  CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, TrendingDown, Users, Database, Shield, Activity } from "lucide-react";

function StatCard({ title, value, trend, trendValue, icon, iconClass, description }) {
  const IconComponent = icon;
  
  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${iconClass}`}>
          <IconComponent className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-[#4CAF50]" />
            ) : (
              <TrendingDown className="h-3 w-3 text-[#F44336]" />
            )}
            {trendValue} from last month
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function StatisticsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Sources"
        value="12"
        trend="up"
        trendValue="+2"
        icon={Database}
        iconClass="bg-[#FF9800]"
        description="Active data sources"
      />
      <StatCard
        title="Active Users"
        value="48"
        trend="up"
        trendValue="+5"
        icon={Users}
        iconClass="bg-[#2196F3]"
        description="Users this month"
      />
      <StatCard
        title="Data Processed"
        value="2.4TB"
        trend="up"
        trendValue="+12%"
        icon={Activity}
        iconClass="bg-[#4CAF50]"
        description="Successfully processed"
      />
      <StatCard
        title="Security Events"
        value="0"
        trend="down"
        trendValue="-3"
        icon={Shield}
        iconClass="bg-[#F44336]"
        description="All secure"
      />
    </div>
  );
}

export function AdvancedStatisticsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Pipeline Success Rate"
        value="98.5%"
        trend="up"
        trendValue="+1.2%"
        icon={Activity}
        description="Last 30 days"
      />
      <StatCard
        title="Average Processing Time"
        value="4.2min"
        trend="down"
        trendValue="-15%"
        icon={Database}
        iconClass="text-green-600"
        description="Performance improved"
      />
      <StatCard
        title="Data Compliance Score"
        value="100%"
        icon={Shield}
        iconClass="text-green-600"
        description="Fully compliant"
      />
    </div>
  );
}