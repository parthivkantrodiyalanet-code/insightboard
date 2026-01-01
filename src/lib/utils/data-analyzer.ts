import { parseDate, isDateColumn } from "@/lib/utils/date-helpers";

export interface DataSummary {
  datasetName: string;
  totalRows: number;
  columns: string[];
  kpis: Record<string, number>;
  trends: Record<string, string | number>;
}

export function generateDataSummary(name: string, data: Record<string, unknown>[]): DataSummary {
  if (!data || data.length === 0) {
    return {
      datasetName: name,
      totalRows: 0,
      columns: [],
      kpis: {},
      trends: {},
    };
  }

  const columns = Object.keys(data[0]);
  const totalRows = data.length;

  // Identify numeric columns
  const numericColumns = columns.filter(col => 
    data.every(row => typeof row[col] === 'number' || !isNaN(Number(row[col])))
  );

  // Identify date columns using robust helper
  const dateColumns = columns.filter(col => isDateColumn(data, col));

  const kpis: Record<string, number> = {};
  numericColumns.forEach(col => {
    const values = data.map(row => Number(row[col])).filter(v => !isNaN(v));
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    kpis[`total${col.charAt(0).toUpperCase() + col.slice(1)}`] = Number(sum.toFixed(2));
    kpis[`average${col.charAt(0).toUpperCase() + col.slice(1)}`] = Number(avg.toFixed(2));
  });

  const trends: Record<string, string | number> = {};
  
  // Basic trend detection if we have a sequence
  if (numericColumns.length > 0) {
    const mainCol = numericColumns[0];
    const dateCol = dateColumns[0] || columns.find(c => /month|year/i.test(c)) || columns[0];

    // Sort by date if available
    let sortedData = [...data];
    if (dateColumns.length > 0) {
        sortedData.sort((a, b) => {
            const dateA = parseDate(a[dateColumns[0]]) || new Date(0);
            const dateB = parseDate(b[dateColumns[0]]) || new Date(0);
            return dateA.getTime() - dateB.getTime();
        });
    }

    const firstVal = Number(sortedData[0][mainCol]);
    const lastVal = Number(sortedData[sortedData.length - 1][mainCol]);
    
    if (firstVal !== 0) {
      const change = ((lastVal - firstVal) / firstVal) * 100;
      trends['overallChange'] = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    }

    // Find best and worst periods
    // Re-sort by value to find max/min
    const sortedByVal = [...data].sort((a, b) => Number(b[mainCol]) - Number(a[mainCol]));
    const bestVal = sortedByVal[0][dateCol];
    const worstVal = sortedByVal[sortedByVal.length - 1][dateCol];
    
    // Format best/worst values if they are dates
    const formatVal = (val: any) => {
        const d = parseDate(val);
        return d ? d.toLocaleDateString() : (val as string | number);
    };

    trends['bestPeriod'] = formatVal(bestVal) || '';
    trends['worstPeriod'] = formatVal(worstVal) || '';
  }

  return {
    datasetName: name,
    totalRows,
    columns,
    kpis,
    trends,
  };
}
