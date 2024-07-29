import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { Column, GridOption, MenuCommandItemCallbackArgs, SlickgridReact } from "slickgrid-react";
import PageLoader from "@app/utils/loading";
import ConfigSettings from "@app/utils/config";
import ClientService from "@app/services/clientservice";
import Select from 'react-select'
import { toast } from "react-toastify";

interface FormValues {
  fromPageNo: string;
  toPageNo: string;
  splitJobId: string;
  employee: string;
  empJobId: string;
  pageCount: string;
}

interface SplitJobData extends FormValues {
  id: string;
}

const SplitJob = () => {
  const { jobId } = useLocation().state;
  const { pagecount } = useLocation().state;
  const { name } = useLocation().state;

  const navigate = useNavigate();
  const selectRef = React.createRef();

  const [submittedValues, setSubmittedValues] = useState<SplitJobData[]>([]);
  const [gridElement, setGridElement] = useState<HTMLElement | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [showloader, setLoader] = useState(true);
  const [dataset, setData] = useState<any[]>([]);
  const [clientNames, setClientNames] = useState<string[]>([]);

  const { handleChange, values, touched, errors, resetForm, setFieldValue } = useFormik<FormValues>({
    initialValues: {
      fromPageNo: "",
      toPageNo: "",
      splitJobId: "",
      employee: "",
      empJobId: "",
      pageCount: "",
    },

    validationSchema: Yup.object().shape({
      fromPageNo: Yup.number()
        .required('From page number is required')
        .typeError('Must be a number')
        .moreThan(0, 'From page number must be greater than 0'),
      toPageNo: Yup.number()
        .required('To page number is required')
        .typeError('Must be a number')
        .moreThan(Yup.ref('fromPageNo'), 'To page number must be greater than From page number'),
      employee: Yup.string()
        .required('Employee Name is required')

    }),

    onSubmit: (values) => {
      if (editingRow !== null) {
        const updatedValues = submittedValues.map((item, index) =>
          index === editingRow ? { ...values, splitJobId: item.splitJobId, id: item.id } : item
        );
        setSubmittedValues(updatedValues);
        setEditingRow(null);
      } else {
        const newSplitJobId = `${jobId}_${submittedValues.length + 1}`;
        const newValues: SplitJobData = { ...values, splitJobId: newSplitJobId, id: newSplitJobId };
        setSubmittedValues([...submittedValues, newValues]);
      }
      resetForm();
    },
  });

  const handleClose = () => {
    navigate('/admin-jobs', { state: { submittedValues } });
  };

  const handleViewEmployeeSplitJob = () => {
    navigate('/employee-split-job', { state: { submittedValues } });
  };

  const loadData = (isreload: boolean) => {
    setLoader(true);
    ClientService.getClients()
      .then((response: any) => {
        if (response) {
          const sortedData = response.sort((a: { CreatedDateTime: string | number | Date; }, b: { CreatedDateTime: string | number | Date; }) =>
            new Date(b.CreatedDateTime).getTime() - new Date(a.CreatedDateTime).getTime()
          );
          setData(sortedData);
        }
      })
      .catch(() => {
        setLoader(false);
      })
      .finally(() => {
        setLoader(false);
      });
  };
  const employeeOptions = dataset.map((client) => ({
    value: client.ClientName,
    label: client.ClientName,
  }));
  useEffect(() => {
    loadData(false);
  }, []);

  const columns: Column[] = [
    { id: "splitJobId", name: "Split Job Id", field: "splitJobId", sortable: true },
    { id: "employee", name: "Employee", field: "employee", sortable: true },
    { id: "fromPageNo", name: "From Page Number", field: "fromPageNo", sortable: true },
    { id: "toPageNo", name: "To Page Number", field: "toPageNo", sortable: true },
    {
      id: "action",
      name: "",
      field: "id",
      maxWidth: 130,
      formatter: () => `<div class="btn btn-default btn-xs">Action <i class="fa fa-caret-down"></i></div>`,
      cellMenu: {
        commandItems: [
          {
            command: "editJob",
            title: "Edit Job",
            iconCssClass: "fa fa-edit text-success",
            positionOrder: 66,
            action: (_e: any, args: MenuCommandItemCallbackArgs) => {
              if (args.row !== undefined) {
                handleEdit(args.row);
              }
            },
          },
          {
            command: "delete",
            title: "Delete",
            iconCssClass: "fa fa-trash text-danger",
            positionOrder: 66,
            action: (_e: any, args: MenuCommandItemCallbackArgs) => {
              if (args.row !== undefined) {
                handleDelete(args.row);
              }
            },
          },
        ],
      },
    },
  ];

  const gridOptions: GridOption = {
    ...ConfigSettings.gridOptions,
    enableCellMenu: true,
  };

  const reactGridReady = (e: CustomEvent<any>) => {
    const element = document.querySelector(`#${e.detail.gridId}`);
    if (element) {
      setGridElement(element as HTMLElement);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fromPageNo = Number(values.fromPageNo);
    const toPageNo = Number(values.toPageNo);
    const maxPageCount = Number(pagecount);

    if (fromPageNo >= toPageNo) {
      toast.error('From page number must be less than To page number');
      return;
    }

    if (fromPageNo <= 0 || toPageNo <= 0) {
      toast.error('Page numbers must be greater than Zero');
      return;
    }

    if (fromPageNo > maxPageCount || toPageNo > maxPageCount) {
      toast.error('From or To page number exceeds Max page count');
      return;
    }

    const updatedValues = [...submittedValues];
    if (editingRow !== null) {
      updatedValues[editingRow] = {
        ...updatedValues[editingRow],
        fromPageNo: values.fromPageNo,
        toPageNo: values.toPageNo,
        employee: values.employee,
      };

      setSubmittedValues(updatedValues);
      setEditingRow(null);

    } else {
      const newSplitJobId = `${jobId}_${submittedValues.length + 1}`;
      const newValues: SplitJobData = {
        id: newSplitJobId,
        splitJobId: newSplitJobId,
        fromPageNo: values.fromPageNo,
        toPageNo: values.toPageNo,
        employee: values.employee,
        pageCount: pagecount,
        empJobId: "",
      };
      setSubmittedValues([...submittedValues, newValues]);
    }
    resetForm();
    setFieldValue('employee', ''); // Clear the Select component's value

  };

  useEffect(() => {
    if (gridElement) {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const row = target.closest(".slick-row") as HTMLElement;
        const rowIndex = row ? parseInt(row.dataset.row ?? "0") : -1;

        if (target.classList.contains("edit-btn")) {
          handleEdit(rowIndex);
        } else if (target.classList.contains("delete-btn")) {
          handleDelete(rowIndex);
        }
      };

      gridElement.addEventListener("click", handleClick);

      return () => {
        gridElement.removeEventListener("click", handleClick);
      };
    }
  }, [gridElement, submittedValues]);

  const handleEdit = (rowIndex: number) => {
    const rowData = submittedValues[rowIndex];
    setEditingRow(rowIndex);
    setFieldValue("fromPageNo", rowData.fromPageNo);
    setFieldValue("toPageNo", rowData.toPageNo);
    setFieldValue("employee", rowData.employee);
    const updatedValues = [...submittedValues];
    updatedValues[rowIndex] = rowData;
    setSubmittedValues(updatedValues);
  };

  const handleEmpChange = (selectedOption: any) => {
    setFieldValue("employee", selectedOption.value);
  };
  const handleDelete = (rowIndex: number) => {
    const updatedValues = submittedValues.filter((_, index) => index !== rowIndex);
    setSubmittedValues(updatedValues);
  };

  return (
    <>
      {showloader && <PageLoader></PageLoader>}
      <div>
        <h2 className="text-2xl font-bold mb-4">Split Jobs</h2>
        <div className="container border p-3 mb-3" style={{ width: '100%' }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Job Id
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    id="jobId"
                    name="jobId"
                    type="text"
                    value={jobId}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    File Name
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    id="fileName"
                    name="fileName"
                    type="text"
                    value={name}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    From Page Number
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    id="fromPageNo"
                    name="fromPageNo"
                    type="number"
                    placeholder="From Page Number"
                    value={values.fromPageNo}
                    onChange={handleChange}
                    className="form-control"
                  />
                  {touched.fromPageNo && errors.fromPageNo && (
                    <div className="text-danger small">{errors.fromPageNo}</div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Page Count
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    id="pageCount"
                    name="pageCount"
                    type="text"
                    value={pagecount}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Employee Name
                    <span className="text-danger">*</span>
                  </label>

                  <Select
                    id="employee"
                    name="employee"
                    options={employeeOptions}
                    // isClearable={true}
                    onChange={handleEmpChange}
                    isMulti={false}
                    closeMenuOnSelect={true}
                  /> {touched.employee && errors.employee && (
                    <div className="text-danger small">{errors.employee}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    To Page Number
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    id="toPageNo"
                    name="toPageNo"
                    type="number"
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
                {editingRow !== null ? "Update" : "Add"}
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
        </div>
      </div>
    </>
  );
};

export default SplitJob;
