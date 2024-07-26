import React from "react";
import { useLocation } from "react-router-dom";
import { Column, GridOption, SlickgridReact } from "slickgrid-react";
import ConfigSettings from "@app/utils/config";

const EmployeeSplitJob = () => {
  const { state } = useLocation();
  const submittedValues = state?.submittedValues || [];

  const columns: Column[] = [
    { id: "splitJobId", name: "Split Job Id", field: "splitJobId", sortable: true },
    { id: "employee", name: "Employee", field: "employee", sortable: true },
    { id: "fromPageNo", name: "From Page Number", field: "fromPageNo", sortable: true },
    { id: "toPageNo", name: "To Page Number", field: "toPageNo", sortable: true }
  ];

  const gridOptions: GridOption = {
    ...ConfigSettings.gridOptions,
    enableCellMenu: true,
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Employee Split Jobs</h2>
      <div className="grid">
        <SlickgridReact
          gridId="grid2"
          columnDefinitions={columns}
          gridOptions={gridOptions}
          dataset={submittedValues}
        />
      </div>
    </div>
  );
};

export default EmployeeSplitJob;
