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

  // Identify date columns (simple check)
  const dateColumns = columns.filter(col => {
    const val = data[0][col];
    if (typeof val === 'string') {
      const date = new Date(val);
      return !isNaN(date.getTime()) && (val.includes('-') || val.includes('/') || ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].some(m => val.toLowerCase().includes(m)));
    }
    return false;
  });

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
    const firstVal = Number(data[0][mainCol]);
    const lastVal = Number(data[data.length - 1][mainCol]);
    
    if (firstVal !== 0) {
      const change = ((lastVal - firstVal) / firstVal) * 100;
      trends['overallChange'] = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    }

    // Find best and worst periods if date/sequence exists
    const sortedByVal = [...data].sort((a, b) => Number(b[mainCol]) - Number(a[mainCol]));
    const bestVal = sortedByVal[0][dateColumns[0] || columns[0]];
    const worstVal = sortedByVal[sortedByVal.length - 1][dateColumns[0] || columns[0]];
    trends['bestPeriod'] = (bestVal as string | number) || '';
    trends['worstPeriod'] = (worstVal as string | number) || '';
  }

  return {
    datasetName: name,
    totalRows,
    columns,
    kpis,
    trends,
  };
}
