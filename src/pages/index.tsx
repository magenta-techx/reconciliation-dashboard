import Head from 'next/head';
import * as React from 'react';

import {
  useFilteredDataSetter,
  useInitialLoansData,
  useRemitaDataSetter,
} from '@/api';
import { DateRangePicker } from '@/components';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  DataGrid,
  GridCellParams,
  GridFilterModel,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import { Inter } from '@next/font/google';

import type {} from '@mui/x-data-grid/themeAugmentation';
const inter = Inter({ subsets: ['latin'] });

const columns = [
  {
    field: 'verdict',
    headerName: 'Verdict',
    width: 90,
    type: 'boolean',
    cellClassName: (params: GridCellParams<boolean>) => {
      const { value } = params;
      if (value === undefined) return 'bg-orange-300';
      if (!value) return 'bg-red-300';
      return 'bg-green-300';
    },
  },
  { field: 'id', headerName: 'Known ID', width: 90 },
  { field: 'customerId', headerName: 'Customer ID', width: 120 },
  { field: 'mandateReference', headerName: 'Mandate' },
  { field: 'authorisationCode', headerName: 'Authentication Code', width: 150 },
  { field: 'phoneNumber', headerName: 'Phone', width: 130 },
  { field: 'loanAmount', headerName: 'Amount' },
  { field: 'dateOfDisbursement', headerName: 'Date Disbursed', width: 115 },
  { field: 'loan_interest_rate', headerName: 'Interest' },
  { field: 'outstanding_loan_bal', headerName: 'Outstanding' },
  { field: 'numberOfRepayments', headerName: 'No of Repayment' },
  { field: 'ramount', headerName: 'RRR Amount' },
  { field: 'Rrepayment', headerName: 'RRR No of Repayment', width: 150 },
  { field: 'status', headerName: 'Status', width: 85 },
  { field: 'routstanding', headerName: 'RRR Outstanding', width: 150 },
  {
    field: 'last_repayment_date',
    headerName: 'Last Repayment Date',
    width: 150,
  },
];

export default function Home() {
  const [isRemitaButtonDisabled, setIsRemitaButtonDisabled] =
    React.useState(false);
  const [mergedData, setMergedData] = React.useState<any[] | undefined>();
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [
      {
        columnField: 'dateOfDisbursement',
        operatorValue: '',
        value: '',
      },
    ],
  });
  const [limit, setLimit] = React.useState('100');

  const handleSelectChange = (event: SelectChangeEvent) => {
    setLimit(event.target.value as string);
  };

  const { isLoading, data: initialLoansData } = useInitialLoansData();

  const {
    filteredData,
    getAndSetFilteredData,
    areBothDatesValid,
    startDate,
    endDate,
    isFilteredDataLoading,
  } = useFilteredDataSetter(dateRange);

  const {
    isRemitaLoading,
    obtainAllRemitaDataResults,
    obtainSingleRemitaDataResult,
  } = useRemitaDataSetter(initialLoansData, setMergedData, mergedData);

  let sum = 0;
  let pay = 0;

  initialLoansData?.forEach((total) => {
    sum += total.loanAmount;
    pay += total.numberOfRepayments;
  });

  const totalAmount = sum.toLocaleString();
  const totalRepay = pay.toLocaleString();

  const tableColumns = [
    {
      field: 'load-remita-data',
      headerName: 'Load Remita Data',
      width: 160,
      renderCell: (params: GridRenderCellParams<undefined>) => {
        const {
          row: { authorisationCode, mandateReference, customerId },
        } = params;

        const fetchRowRemitaData = () => {
          obtainSingleRemitaDataResult(
            authorisationCode,
            mandateReference,
            customerId
          );
        };

        return (
          <button
            onClick={fetchRowRemitaData}
            className="bg-amber-200 w-max mx-auto py-1 px-3 duration-500 ease-in-out transition hover:bg-amber-300 rounded-md"
          >
            Load Remita Data
          </button>
        );
      },
    },
    ...columns,
  ];

  if (isLoading || isRemitaLoading || isFilteredDataLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p>Loading</p>
      </div>
    );
  }

  const handleFilterClick = () => {
    // Type coersion used as areBothDatesValid has done typechecks already
    getAndSetFilteredData(startDate as string, endDate as string, limit);
  };

  return (
    <>
      <Head>
        <title>Reconciliation Dashboard</title>
        <meta
          name="description"
          content="Reconciliation Dashboard for Liberty Assured"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="" />
      </Head>

      <div style={inter.style}>
        <main className=" w-full flex flex-col text-cyan-900 justify-center items-center">
          <h1 className="text-3xl md:text-7xl w-[90%] text-center md:text-left font-bold text-cyan-900 mt-8 md:my-8 xs:mt-24">
            Reconciliation Dashboard
          </h1>

          <div className="w-[90%] flex flex-row flex-wrap gap-4 justify-between items-center my-8">
            <div className="flex justify-center md:justify-start flex-wrap gap-4 w-full md:w-max items-center">
              <p className="bg-gray-200 px-4 py-2.5 rounded-lg font-semibold flex items-center gap-1">
                <span>Total Amount:</span>

                <span className="py-1 px-2 rounded-md bg-cyan-600 text-white">
                  {totalAmount}
                </span>
              </p>

              <p className="bg-gray-200 px-4 py-2.5 rounded-lg font-semibold flex items-center gap-1">
                <span>Total Repayment:</span>

                <span className="py-1 px-2 rounded-md bg-cyan-600 text-white">
                  {totalRepay}
                </span>
              </p>
            </div>

            <div className="flex w-full md:w-max justify-center md:justify-start flex-wrap items-center gap-4">
              <DateRangePicker
                dateRange={dateRange}
                setDateRange={setDateRange}
              />

              <FormControl sx={{ minWidth: 80 }}>
                <InputLabel id="demo-simple-select-label">Limit</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={limit}
                  label="Limit"
                  onChange={handleSelectChange}
                  defaultValue={'100'}
                >
                  <MenuItem value={'100'}>100</MenuItem>
                  <MenuItem value={'200'}>200</MenuItem>
                  <MenuItem value={'500'}>500</MenuItem>
                  <MenuItem value={'1000'}>1000</MenuItem>
                  <MenuItem value={'1500'}>1500</MenuItem>
                  <MenuItem value={'2000'}>2000</MenuItem>
                  {/* <MenuItem value={'all'}>All</MenuItem> */}
                </Select>
              </FormControl>

              <button
                className="transition font-semibold md:w-max ease-in-out duration-500 py-4 px-5 disabled:cursor-not-allowed disabled:opacity-50 bg-cyan-600 text-white text-lg 
            rounded-md hover:bg-cyan-700"
                disabled={!areBothDatesValid}
                onClick={handleFilterClick}
              >
                Apply filter
              </button>

              <button
                className="transition font-semibold md:w-max ease-in-out duration-500 py-4 px-5 disabled:cursor-not-allowed disabled:opacity-50 bg-orange-600 text-white text-lg 
            rounded-md hover:bg-orange-700"
                disabled={isRemitaButtonDisabled}
                onClick={() => {
                  obtainAllRemitaDataResults();
                  setIsRemitaButtonDisabled(true);
                }}
              >
                Load all Remita Data
              </button>
            </div>
          </div>

          <div className="min-h-screen h-screen w-[90%] flex-shrink">
            <DataGrid
              rows={mergedData || filteredData || initialLoansData || []}
              columns={tableColumns}
              components={{ Toolbar: GridToolbar }}
              filterModel={filterModel}
              onFilterModelChange={(newFilterModel) =>
                setFilterModel(newFilterModel)
              }
            />
          </div>
        </main>
      </div>
    </>
  );
}
