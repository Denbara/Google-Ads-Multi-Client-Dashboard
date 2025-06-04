import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowUp, ArrowDown, Phone, FileText, DollarSign } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: number;
  icon?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  description, 
  trend, 
  icon 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend !== undefined && (
          <div className="flex items-center pt-1">
            {trend > 0 ? (
              <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(trend)}% from previous period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface MetricsOverviewProps {
  totalConversions?: number;
  formConversions?: number;
  callConversions?: number;
  costPerLead?: number;
  totalSpend?: number;
  trends?: {
    totalConversions?: number;
    formConversions?: number;
    callConversions?: number;
    costPerLead?: number;
    totalSpend?: number;
  };
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  totalConversions,
  formConversions,
  callConversions,
  costPerLead,
  totalSpend,
  trends
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        title="Total Conversions"
        value={totalConversions !== undefined ? totalConversions : 0}
        description="All conversion types"
        trend={trends?.totalConversions !== undefined ? trends.totalConversions : 0}
      />
      <MetricCard
        title="Form Submissions"
        value={formConversions !== undefined ? formConversions : 0}
        description="Form conversion actions"
        trend={trends?.formConversions !== undefined ? trends.formConversions : 0}
        icon={<FileText className="h-4 w-4" />}
      />
      <MetricCard
        title="Phone Calls"
        value={callConversions !== undefined ? callConversions : 0}
        description="Call conversion actions"
        trend={trends?.callConversions !== undefined ? trends.callConversions : 0}
        icon={<Phone className="h-4 w-4" />}
      />
      <MetricCard
        title="Cost Per Lead"
        value={costPerLead !== undefined ? `$${costPerLead.toFixed(2)}` : '$0.00'}
        description="Average cost per conversion"
        trend={trends?.costPerLead !== undefined ? trends.costPerLead * -1 : 0} // Invert trend since lower CPL is better
        icon={<DollarSign className="h-4 w-4" />}
      />
      <MetricCard
        title="Total Spend"
        value={totalSpend !== undefined ? `$${totalSpend.toFixed(2)}` : '$0.00'}
        description="Total advertising cost"
        trend={trends?.totalSpend !== undefined ? trends.totalSpend : 0}
        icon={<DollarSign className="h-4 w-4" />}
      />
    </div>
  );
};

export default MetricsOverview;
