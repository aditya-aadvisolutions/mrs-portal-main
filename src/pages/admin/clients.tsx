import {
  Column,
  Formatters,
  GridOption,
  OnEventArgs,
  SlickgridReact,
  SlickgridReactInstance,
  SlickGrid,
  MenuCommandItem,
} from "slickgrid-react";
import { useCallback, useEffect, useState } from "react";
import PageLoader from "@app/utils/loading";
import ConfigSettings from "@app/utils/config";
import { useSelector, useDispatch } from "react-redux";
import store from "../../store/store";
import IUser from "../../store/Models/User";
import ApiService from "@app/services/Api.service";
import { AxiosResponse } from "axios";
import ClientService from "@app/services/clientservice";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Select from 'react-select'
import { formatNumber } from "@app/utils/oidc-providers";


interface State {
  title: string;
  subTitle: string;
  gridOptions2?: GridOption;
  columnDefinitions1: Column[];
}

let grid1!: SlickGrid;

const ClientsList = () => {
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
      clientName: item.FirstName + ' ' + item.LastName ,
      lastName: item.LastName,
      firstName: item.FirstName,
      phone: item.PhoneNo,
      email: item.Email,
      loginName: item.LoginName,
      company:item.CompanyName,
      createdDateTime: item.CreatedDateTime,
      defaultTAT: item.DefaultTAT,
      filePreferences: item.FilePreference,
      isActive: item.IsActive
    };
  });

  // Sort the data by createdDateTime in descending order
  data.sort((a, b) => new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime());

  const navigate = useNavigate();
  const MenuCommandItems: MenuCommandItem[] = Array<MenuCommandItem>();

  const columns: Column[] = [
    // {
    //   id: "company",
    //   name: "COMPANY NAME",
    //   field: "company",
    //   sortable: true,
      // maxWidth: 150,
      // cssClass:'text-left'
    // },
    {
      id: "clientName",
      name: "CLIENT NAME",
      field: "clientName",
      sortable: true,
      // maxWidth: 150,
    },
    {
      id: "loginName",
      name: "USER NAME",
      field: "loginName",
      sortable: true,
      // maxWidth: 150,
    },
    // {
    //   id: "firstName",
    //   name: "First Name",
    //   field: "firstName",
    //   sortable: true,
    //   maxWidth: 150,
    // },
    // {
    //   id: "lastName",
    //   name: "Last Name",
    //   field: "lastName",
    //   sortable: true,
    //   maxWidth: 150,
    // },

    {
      id: "email",
      name: "EMAIL",
      field: "email",
      sortable: true,
      // maxWidth: 150,
        // minWidth:90,
      formatter: (row, cell, value) => `<div title="${value}">${value}</div>`,
    },
    {
      id: "phone",
      name: "PHONE NO.",
      field: "phone",
      sortable: true,
      minWidth: 100,
      maxWidth:120,
      formatter: (row, cell, value) => `<div style="padding-right: 10px;">${formatNumber(value)}</div>`, // Adding padding-right for gap
    },
    {
      id: "file",
      name: "FILE PREFERENCES",
      field: "filePreferences",
      sortable: true,
       minWidth: 50,
       formatter: (row, cell, value) => `<div style="padding-left: 10px;">${value}</div>`, // Adding padding-left for gap
    },
    {
      id: "isActive",
      name: "STATUS",
      field: "isActive",
      sortable: true,
      minWidth: 50,
      maxWidth: 100,
      formatter: (row, cell, value) => `<div style = 'text-align:left'>${value ? 'ACTIVE' : 'INACTIVE'}</div>`,
    },

    // {
    //   id: "loginName",
    //   name: "User Name",
    //   field: "loginName",
    //   sortable: true,
    //   maxWidth: 150,
    // },
    // {
    //   id: "createdDateTime",
    //   name: "Date",
    //   field: "createdDateTime",
    //   sortable: true,
    //   formatter: Formatters.dateIso,
    //   maxWidth: 150,
    // },
    // {
    //   id: "defaultTAT",
    //   name: "TAT",
    //   field: "defaultTAT",
    //   sortable: true,
    //   // maxWidth: 150,
    // },
 {
      id: 'edit',
      field: 'edit',
      name:'EDIT',
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
      maxWidth: 40,
      onCellClick: (e: Event, args: OnEventArgs) => {
        navigate("/profile", {
          state: {
            userId: args.dataContext.UserId,
            loginName: args.dataContext.loginName
          }
        });
      }
    },

  ];

  const gridOptions: GridOption = {
    ...ConfigSettings.gridOptions,
    ...{
      datasetIdPropertyName: "id",
      enableCellMenu: true,
      cellMenu: {
        onCommand: (_e, args) => function () {},
        onOptionSelected: (_e, args) => {},
      },
    },
  };

  function reactGridReady(reactGridInstance: SlickgridReactInstance) {
    setGrid(reactGridInstance);
  }

  const loadData = (isreload: boolean) => {
    setLoader(true);
    ClientService.getClients()
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

  useEffect(() => {
    loadData(false);
  }, []);


  const search = () => {
    if (initialLoad) {
      setInitialLoad(false);
    } else {
      let filteredData = dataset;
  
      if (selectedEmail.length || selectedClient.length || selectedPhone.length) {
        filteredData = dataset.filter((item) => {
          const matchesEmail = selectedEmail.length ? selectedEmail.includes(item.Email) : true;
          const matchesClient = selectedClient.length ? selectedClient.includes(item.FirstName + ' ' + item.LastName) : true;
          const matchesPhone = selectedPhone.length ? selectedPhone.includes(item.PhoneNo) : true;
          return matchesEmail && matchesClient && matchesPhone;
        });
      }
  
      setFilteredData(filteredData);
      setData(filteredData);
    }
  };

  useEffect(() => {
    search();
  }, [selectedEmail, selectedClient, selectedPhone]);

  // useEffect(() => {
  //   search();
  // }, [search]);

  
  const emailList = data.map((item) => ({
    value: item.Email,
    label: item.Email,
  }));
  const clientNames = data.map((item) => ({
    value: item.FirstName + ' ' +  item.LastName,
    label: item.FirstName + ' ' +  item.LastName,
  }));
  const phoneList = data.map((item) => ({
    value: item.PhoneNo,
    label: item.PhoneNo
  }))

  const emailChange = (selectedOptions: any) => {
    setEmailFilter(selectedOptions ? selectedOptions.map((val: any) => val.value).join(' ') : []);
  };
  
  const clientChange = (selectedOptions: any) => {
    const selectedClients = selectedOptions ? selectedOptions.map((val: any) => val.value).join(' ') : '';
    setClientFilter(selectedClients);
  };

  const phoneChange = (selectedOptions: any) => {
    const selectedPhones = selectedOptions ? selectedOptions.map((val: any) => val.value) : [];
    setPhoneFilter(selectedPhones);
  };
  const reset = () => {
    setEmailFilter([]);
    setClientFilter('');
    setPhoneFilter([]);
      loadData(false);
  };

  return (
    <>
      {showloader && <PageLoader></PageLoader>}
      <div>
        <section className="content">
          <div className="container-fluid">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="card-title" style={{ fontSize: "1.8rem" }}><i className="fa fa-arrow-left pointer ml-1 mr-2" style={{fontSize:"26px"}} onClick={() => navigate("/admin-jobs")} aria-hidden="true"></i><strong>Clients</strong></h3>
                <div className="ml-auto">
                  <Button
                    variant="primary"
                    onClick={() => navigate("/client-registration")}
                  >
                    <strong>Add Clients </strong>
                  </Button>
                </div>
              </div>
              <div className="card-body">
                <div className='row'>


                <div className="col-md-3">
                    <div className="form-group">
                      <label>Search by Client Name</label>
                      <Select
                        options={clientNames}
                        value={clientNames.filter(option => selectedClient.includes(option.value))}
                        isClearable={true}
                        onChange={clientChange}
                        isMulti={true}
                        closeMenuOnSelect={true} 
                        />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Search by Email</label>
                      <Select
                        options={emailList}
                        value={emailList.filter(option => selectedEmail.includes(option.value))}
                        isClearable={true}
                        onChange={emailChange}
                        isMulti={true}
                        closeMenuOnSelect={true} 
                        />
                    </div>
                  </div>
         
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Search by Phone Number</label>
                      <Select
                        options={phoneList}
                        value={phoneList.filter(option => selectedPhone.includes(option.value))}
                        isClearable={true}
                        onChange={phoneChange}
                        isMulti={true}
                        closeMenuOnSelect={true} 
                        />
                    </div>
                  </div>

                  <div className="col-md-1">
                  <div className="form-group">
                      <label>&nbsp; </label><br></br>
                      <Button variant="secondary" onClick={(e) => reset()}><strong>Reset</strong></Button>
                  </div>
                </div>  
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12" style={{ zIndex: "0" , width:'100%'}}>
                    <SlickgridReact
                      gridId="grid1"
                      columnDefinitions={columns}
                      gridOptions={gridOptions!}
                      dataset={data}
                      onReactGridCreated={(e) => {
                        reactGridReady(e.detail);
                      }
                    }
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

export default ClientsList;
