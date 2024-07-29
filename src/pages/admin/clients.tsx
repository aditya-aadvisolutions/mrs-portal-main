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
import { useEffect, useState } from "react";
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
  const dispatch = useDispatch();
  const [reactGrid, setGrid] = useState<SlickgridReactInstance>();
  const [dataset, setData] = useState<any[]>([]);

  let data = dataset.map((item) => {
    return {
      ...item,
      id: item.Id,
      clientName: item.ClientName,
      lastName: item.LastName,
      firstName: item.FirstName,
      email: item.Email,
      loginName: item.LoginName,
      createdDateTime: item.CreatedDateTime,
      defaultTAT: item.DefaultTAT,
    };
  });

  // Sort the data by createdDateTime in descending order
  data.sort((a, b) => new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime());

  const navigate = useNavigate();
  const MenuCommandItems: MenuCommandItem[] = Array<MenuCommandItem>();

  const columns: Column[] = [
    {
      id: "clientName",
      name: "Client Name",
      field: "clientName",
      sortable: true,
      maxWidth: 150,
    },
    {
      id: "firstName",
      name: "First Name",
      field: "firstName",
      sortable: true,
      maxWidth: 150,
    },
    {
      id: "lastName",
      name: "Last Name",
      field: "lastName",
      sortable: true,
      maxWidth: 150,
    },
    {
      id: "email",
      name: "Email",
      field: "email",
      sortable: true,
      maxWidth: 150,
      formatter: (row, cell, value) => `<div title="${value}">${value}</div>`,
    },
    {
      id: "loginName",
      name: "User Name",
      field: "loginName",
      sortable: true,
      maxWidth: 150,
    },
    {
      id: "createdDateTime",
      name: "Date",
      field: "createdDateTime",
      sortable: true,
      formatter: Formatters.dateIso,
      maxWidth: 150,
    },
    {
      id: "defaultTAT",
      name: "TAT",
      field: "defaultTAT",
      sortable: true,
      maxWidth: 150,
    },
    {
      id: "action",
      name: "",
      field: "id",
      maxWidth: 130,
      formatter: () => `<div class="btn btn-default btn-xs">Action <i class="fa fa-caret-down"></i></div>`,
      cellMenu: {
        commandItems: [
          {
            command: "Profile",
            title: "Edit Profile",
            iconCssClass: "fa fa-user text-success",
            positionOrder: 66,
            action: (_e, args) => {
              navigate("/profile", {
                state: { userId: args.dataContext.UserId, tab: "PROFILE"  },
              });
            },
          },
          {
            command: "changePassword",
            title: "Change Password",
            iconCssClass: "fa fa-key text-success",
            positionOrder: 66,
            action: (_e, args) => {
              console.log(args.dataContext);
              navigate("/profile", {
                state: {
                  userId: args.dataContext.UserId,
                  tab: "CHANGEPASSWORD",
                },
              });
            },
          },
        ],
      },
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

  return (
    <>
      {showloader && <PageLoader></PageLoader>}
      <div>
        <section className="content">
          <div className="container-fluid">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="card-title" style={{ fontSize: "1.8rem" }}><strong>Clients</strong></h3>
                <div className="ml-auto">
                  <Button
                    variant="primary"
                    onClick={() => navigate("/client-registration")}
                  >
                    Add Clients
                  </Button>
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

export default ClientsList;
