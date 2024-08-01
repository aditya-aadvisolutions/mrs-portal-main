import {
    Column,
    GridOption,
    SlickgridReact,
    SlickgridReactInstance,
    MenuCommandItem,
    Formatters,
  } from "slickgrid-react";
  import { useEffect, useState } from "react";
  import PageLoader from "@app/utils/loading";
  import ConfigSettings from "@app/utils/config";
  import { useSelector } from "react-redux";
  import store from "../../store/store";
  import IUser from "../../store/Models/User";
  import EmployeesService from "@app/services/employeeservice";
  import { useNavigate } from "react-router-dom";
  import { Button } from "react-bootstrap";
  import Select from 'react-select'
import { formatNumber } from './../../utils/oidc-providers';

  const Employees = () => {
    const user = useSelector((state: IUser) => store.getState().auth);
    const [showloader, setLoader] = useState(true);
    const [reactGrid, setGrid] = useState<SlickgridReactInstance>();
    const [dataset, setData] = useState<any[]>([]);
    const [selectedClient, setClientFilter] = useState('');
    const [initialLoad, setInitialLoad] = useState(true);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedEmail, setEmailFilter] = useState<any[]>([]);
  const [selectedPhone, setPhoneFilter] = useState<any[]>([]);  
    let data = dataset.map((item) => {
      return {
        ...item,
        id: item.Id,
        clientName: item.ClientName,
        lastName: item.LastName,
        firstName: item.FirstName,
        email: item.Email,
        employeeName:item.FirstName + ' ' + item.LastName,
        loginName: item.LoginName,
        createdDateTime: item.CreatedDateTime,
        defaultTAT: item.DefaultTAT,
        manager:item.Manager,
        role:item.Role
      };
    });
  
    // Sort the data by createdDateTime in descending order
    data.sort((a, b) => new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime());
  
    const navigate = useNavigate();
    const MenuCommandItems: MenuCommandItem[] = Array<MenuCommandItem>();
  
    const columns: Column[] = [
      {
        id: "EmployeeName",
        name: "Employee Name",
        field: "employeeName",
        sortable: true,
        maxWidth: 150,
      },
      {
        id: "Email",
        name: "Email",
        field: "Email",
        sortable: true,
        maxWidth: 150,
        minWidth:100
      },
      {
        id: "phone",
        name: "Phone No.",
        field: "PhoneNo",
        sortable: true,
        maxWidth: 150,
        formatter: (row, cell, value) => `<div ">${formatNumber(value)}</div>`,
      },
      {
        id: "Manager",
        name: "Manager",
        field: "manager",
        sortable: true,
        maxWidth: 150,
      },
      {
        id: "Role",
        name: "Role",
        field: "role",
        sortable: true,
        maxWidth: 150,
      },
   
      // {
      //   id: "FirstName",
      //   name: "First Name",
      //   field: "FirstName",
      //   sortable: true,
      //   maxWidth: 150,
      // },
      // {
      //   id: "LastName",
      //   name: "Last Name",
      //   field: "LastName",
      //   sortable: true,
      //   maxWidth: 150,
      //   formatter: (row, cell, value) => `<div title="${value}">${value}</div>`,
      // },
     
     
      // {
      //   id: "createdDateTime",
      //   name: "Date",
      //   field: "CreatedDateTime",
      //   sortable: true,
      //   formatter: Formatters.dateIso,
      //   maxWidth: 150,
      // },
      // {
      //   id: "action",
      //   name: "",
      //   field: "id",
      //   maxWidth: 130,
      //   formatter: () => `<div class="btn btn-default btn-xs">Action <i class="fa fa-caret-down"></i></div>`,
      //   cellMenu: {
      //     commandItems: [
      //       {
      //         command: "Profile",
      //         title: "Edit Profile",
      //         iconCssClass: "fa fa-user text-success",
      //         positionOrder: 66,
      //         action: (_e, args) => {
      //           navigate("/profile", {
      //             state: { userId: args.dataContext.UserId, tab: "PROFILE"  },
      //           });
      //         },
      //       },
      //     ],
      //   },
      // },
      {
        id: 'edit',
        field: 'edit',
        name:'Edit',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        
        formatter: (row, cell, value, colDef, dataContext) => {
          // const isExpanded = dataContext.isExpanded;
          const iconClass = 'fa-edit';
      
          return `<div>
                    <i class="fa ${iconClass} pointer" data-row="${row}"></i>
                  </div>`;
        },
        minWidth: 30,
        onCellClick: (_e, args) => {
          navigate("/employee-profile", {
            state: {userId: args.dataContext.UserId}
          });
        }
      },
    ];
  
    const gridOptions: GridOption = {
      ...ConfigSettings.gridOptions,
      ...{
        datasetIdPropertyName: "UserId", // Ensure this matches the unique identifier in your data
        enableCellMenu: true,
        cellMenu: {
          onCommand: (_e, args) => function () { },
          onOptionSelected: (_e, args) => { },
        },
      },
    };
  
    function reactGridReady(reactGridInstance: SlickgridReactInstance) {
      setGrid(reactGridInstance);
    }
  
    const loadData = (isreload: boolean) => {
      setLoader(true);
      EmployeesService.getEmployees()
        .then((response: any) => {
          if (response) {
            let data = response;
            // Sort data by createdDateTime in descending order
            data.sort((a: { CreatedDateTime: string | number | Date; }, b: { CreatedDateTime: string | number | Date; }) => new Date(b.CreatedDateTime).getTime() - new Date(a.CreatedDateTime).getTime());
            setData(data);
          }
        })
        .catch(() => {
          setLoader(false);
        })
        .finally(() => {
          setLoader(false);
        });
    };
    const search = () => {
      if (initialLoad) {
        setInitialLoad(false);
      } else {
        const filteredData = dataset.filter((item) => {
          const matchesEmail = selectedEmail.length ? selectedEmail.includes(item.Email) : true;
          const matchesClient = selectedClient.length ? selectedClient.includes(item.FirstName + ' ' + item.LastName) : true;
          const matchesPhone = selectedPhone.length ? selectedPhone.includes(item.PhoneNo) : true;
          return matchesEmail && matchesClient && matchesPhone;
        });
        setFilteredData(filteredData);
        setData(filteredData)
      }
    };

    const emailList = data.map((item) => ({
      value: item.Email,
      label: item.Email,
    }));
    const roleList = data.map((item) => ({
      value: item.FirstName + ' ' + item.LastName,
      label: item.FirstName + ' ' + item.LastName
    }))
    const phoneList = data.map((item) => ({
      value: item.PhoneNo,
      label: item.PhoneNo
    }))

    const emailChange = (selectedOptions: any) => {
      const selectedEmails = selectedOptions ? selectedOptions.map((val: any) => val.value) : [];
      setEmailFilter(selectedEmails);
    };

    const phoneChange = (selectedOptions: any) => {
      const selectedPhones = selectedOptions ? selectedOptions.map((val: any) => val.value) : [];
      setPhoneFilter(selectedPhones);
    };

    const roleChange = (selectedOptions: any) => {
      const selectedClients = selectedOptions ? selectedOptions.map((val: any) => val.value).join(' ') : '';
      setClientFilter(selectedClients);
    };

    useEffect(() => {
      loadData(false);
    }, []);
  
    return (
      <>
        {showloader && <PageLoader />}
        <div>
          <section className="content">
            <div className="container-fluid">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title" style={{ fontSize: "1.8rem" }}> <strong>Employees</strong></h3>
                  <div className="ml-auto">
                    <Button
                      variant="primary"
                      onClick={() => navigate("/add-employees")}
                    >
                      Add Employees
                    </Button>
                  </div>
                </div>
  
                <div className="card-body">
                <div className='row'>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Search by Email</label>
                      <Select
                        options={emailList}
                        // isClearable={true}
                        onChange={emailChange}
                        
                        isMulti={true}
                        // closeMenuOnSelect={false} 
                        />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Search by Role</label>
                      <Select
                        options={roleList}
                        // isClearable={true}
                        onChange={roleChange}
                        isMulti={true}
                        // closeMenuOnSelect={false} 
                        />
                    </div>
                  </div>

                  
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Search by Phone Number</label>
                      <Select
                        options={phoneList}
                        // isClearable={true}
                        onChange={phoneChange}
                        isMulti={true}
                        // closeMenuOnSelect={false} 
                        />
                    </div>
                  </div>

                  <div className="col-md-1">
                  <div className="form-group">
                      <label>&nbsp; </label><br></br>
                      <Button variant="primary" onClick={(e) => search()}>Search</Button>
                  </div>
                </div> 
                  </div>
                  </div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12" style={{ zIndex: "0" }}>
                      <SlickgridReact
                        gridId="grid1"
                        columnDefinitions={columns}
                        gridOptions={gridOptions!}
                        dataset={data}
                        onReactGridCreated={(e) => {
                          reactGridReady(e.detail);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  };
  
  export default Employees;
  