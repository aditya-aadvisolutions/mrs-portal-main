import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { Column, GridOption, SlickgridReact, SlickgridReactInstance } from "slickgrid-react";
import PageLoader from "@app/utils/loading";
import ConfigSettings from "@app/utils/config";

interface FormValues {
  fromPageNo: string;
  toPageNo: string;
  splitJobId: string;
  employee: string;
}

interface SplitJobData extends FormValues {
  id: string;
}

const SplitJob = () => {
  const { jobId } = useLocation().state;
  const navigate = useNavigate();

  const [submittedValues, setSubmittedValues] = useState<SplitJobData[]>([]);
  const [reactGrid, setGrid] = useState<SlickgridReactInstance | undefined>(undefined);

  const { handleChange, values, handleSubmit, touched, errors, resetForm } = useFormik<FormValues>({
    initialValues: {
      fromPageNo: "",
      toPageNo: "",
      splitJobId: "",
      employee: "",
    },
    validationSchema: Yup.object().shape({
      fromPageNo: Yup.number().required('From page number is required').typeError('Must be a number'),
      toPageNo: Yup.number().required('To page number is required').typeError('Must be a number'),
    }),
    onSubmit: (values) => {
      const newSplitJobId = `${jobId}_${submittedValues.length + 1}`;
      const newValues: SplitJobData = { ...values, splitJobId: newSplitJobId, id: newSplitJobId };
      setSubmittedValues([...submittedValues, newValues]);
      resetForm();
    },
  });

  const handleClose = () => {
    navigate('/admin-jobs', { state: { submittedValues } });
  };

  const handleViewEmployeeSplitJob = () => {
    navigate('/employee-split-job', { state: { submittedValues } });
  };

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

  const reactGridReady = (e: CustomEvent<any>) => {
    setGrid(e.detail);
  };

  return (
    <>
      {false && <PageLoader></PageLoader>} 
      <div>
        <h2 className="text-2xl font-bold mb-4">Split Jobs</h2>
        <div className="container border p-3 mb-3" style={{ width: '100%' }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    From
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    id="fromPageNo"
                    name="fromPageNo"
                    type="text"
                    placeholder="From Page Number"
                    value={values.fromPageNo}
                    onChange={handleChange}
                    className="form-control"
                  />
                  {touched.fromPageNo && errors.fromPageNo && (
                    <div className="text-danger small">{errors.fromPageNo}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Employee Name</label>
                  <select
                    id="employee"
                    name="employee"
                    value={values.employee}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Employee List</option>
                    <option value="Employee 1">Employee 1</option>
                    <option value="Employee 2">Employee 2</option>
                    <option value="Employee 3">Employee 3</option>
                    <option value="Employee 4">Employee 4</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    To
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    id="toPageNo"
                    name="toPageNo"
                    type="text"
                    placeholder="To Page Number"
                    value={values.toPageNo}
                    onChange={handleChange}
                    className="form-control"
                  />
                  {touched.toPageNo && errors.toPageNo && (
                    <div className="text-danger small">{errors.toPageNo}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleClose} className="ms-2">
                Close
              </Button>
              <Button variant="primary" type="submit" className="ms-2 ml-2">
                Add
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-4 grid-container">
          <h3 className="mt-4">Details</h3>
          <div className="grid">
            <SlickgridReact
              gridId="grid1"
              columnDefinitions={columns}
              gridOptions={gridOptions}
              dataset={submittedValues}
              onReactGridCreated={(e) => {
                reactGridReady(e.detail);
              }}
            />
          </div>
          <Button variant="info" onClick={handleViewEmployeeSplitJob} className="mt-3">
            View Employee Split Jobs
          </Button>
        </div>
      </div>
    </>
  );
};

export default SplitJob;
