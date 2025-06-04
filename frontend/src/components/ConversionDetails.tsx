import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

interface ConversionDetailsProps {
  conversions: {
    id: string;
    date: string;
    type: 'form' | 'call';
    campaign: string;
    adGroup: string;
    keyword?: string;
    cost: number;
  }[];
}

const ConversionDetails: React.FC<ConversionDetailsProps> = ({ conversions }) => {
  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader>
        <CardTitle>Recent Conversions</CardTitle>
        <CardDescription>Detailed view of recent conversion actions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead className="hidden md:table-cell">Ad Group</TableHead>
              <TableHead className="hidden lg:table-cell">Keyword</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversions.map((conversion) => (
              <TableRow key={conversion.id}>
                <TableCell>{conversion.date}</TableCell>
                <TableCell>
                  <Badge variant={conversion.type === 'form' ? 'secondary' : 'default'}>
                    {conversion.type === 'form' ? 'Form' : 'Call'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[150px] truncate" title={conversion.campaign}>
                  {conversion.campaign}
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-[150px] truncate" title={conversion.adGroup}>
                  {conversion.adGroup}
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-[150px] truncate" title={conversion.keyword}>
                  {conversion.keyword || 'N/A'}
                </TableCell>
                <TableCell>${conversion.cost !== undefined ? conversion.cost.toFixed(2) : '0.00'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ConversionDetails;
