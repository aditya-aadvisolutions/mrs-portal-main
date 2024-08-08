import { Column, Formatters, GridOption, OnEventArgs, SlickgridReact, SlickgridReactInstance, SlickGrid, MenuCommandItem } from 'slickgrid-react';
import { useEffect, useRef, useState } from 'react';
import JobService from '@app/services/jobService';
import LookupService from '@app/services/lookupService';
import Select from 'react-select'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ModalHeader from 'react-bootstrap/ModalHeader';
import { toast } from 'react-toastify';
import NorificationModal from '../Modals/Notification';
import PageLoader from '@app/utils/loading';
import ConfigSettings from '@app/utils/config';
import { useSelector, useDispatch } from 'react-redux';
import store from '../../store/store';
import IUser from '../../store/Models/User';
import UppyUpload from "@app/components/upload/uppyupload";
import { removeUploadedFiles } from '@store/reducers/fileupload'; import { saveAs } from 'file-saver';
import DownloadZipService from '@app/services/downloadZipService';

import ApiService from '@app/services/Api.service';
import { AxiosResponse } from 'axios';
import { faL } from '@fortawesome/free-solid-svg-icons';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'path';
import moment from 'moment';
import { useLocation, useNavigate } from "react-router-dom";
import confirm from '@app/components/confirm/confirmService';
import { Form, FormControl } from 'react-bootstrap';


interface Props { }

interface State {
  title: string;
  subTitle: string;
  gridOptions1?: GridOption;
  gridOptions2?: GridOption;
  columnDefinitions1: Column[];
  columnDefinitions2: Column[];
}
//let reactGrid!: SlickgridReactInstance;
let grid1!: SlickGrid;


const JobsList = () => {

  const user = useSelector((state: IUser) => store.getState().auth);
  const dispatch = useDispatch();
  const [reactGrid, setGrid] = useState<SlickgridReactInstance>();
  const [dataset, setData] = useState<any[]>([]);
  const [usersList, setUsers] = useState([]);
  const [statusList, setStatus] = useState([]);
  const [fileList, setFiles] = useState([]);
  const [mergeFileName, setMergeFileName] = useState('');
  const [showloader, setLoader] = useState(true);
  const [uploadTypes, setUploadTypes] = useState([]);
  const [selectedStatus, setStatusFilter] = useState('');
  const [selectedClient, setClientFilter] = useState('');
  const [filename, setFilename] = useState('');
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [initialLoad, setInitialLoad] = useState(true);
  const [showNotification, setShowNotification] = useState();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [id, setId] = useState(null);
  const [progress, setProgress] = useState<any>(0);
  const [showProgressBar, setShowProgressBar] = useState(false);


  const location = useLocation();

  const MenuCommandItems: MenuCommandItem[] = Array<MenuCommandItem>();
  // Files Modal 
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // upload modal
  const [jobId, setJobId] = useState('');
  const [clientJobId, setclientJobId] = useState('');
  const [fileType, setFileType] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showPageCount, setShowPageCount] = useState(false)
  const [pageCount, setPageCount] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const handleUploadClose = () => { setShowUpload(false); setJobId(''); dispatch(removeUploadedFiles()); }
  const handleUploadShow = () => setShowUpload(true);
  const navigate = useNavigate();
  const handlePageCountSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ApiService.requests.patch('Upload/UpdatePageCount', { jobId: jobId, pageCount: pageCount })
    .then((response) => {
      if (response.status === 200) {
        toast.success("Page Count Updated Successfully");
        setShowPageCount(false);
        setJobId('');
        setPageCount('');
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
  const handlePageCount = (pageCount: any) => {
    setShowPageCount(false);
    handlePageCountSubmit(pageCount);
  };
  const handlePageCountClose = () => {
    setShowPageCount(false);

  }

  const handlePageCountShow = (id:any, pageCount:any) => {
    setShowPageCount(true);
    setId(id);
    setPageCount(pageCount);
  };

  const { submittedValues } = location.state || { submittedValues: [] };

  sessionStorage.setItem('roleName', user.roleName);
  sessionStorage.setItem('username', user.lastName);

  sessionStorage.getItem('roleName');

  function formatPageCount(files: any[]) {
    let pageCount = 0;
    files.forEach((item: any) => {
      pageCount += item.PageCount ? item.PageCount : 0;
    });
    return pageCount.toString();
  }
  const uploadFiles = () => {
    const files = {
      jobId: jobId,
      UploadFiles: store.getState().uploadfile,
      createdBy: user.id,
    }
    ApiService.requests.post('Upload/AdminFileUpload', files)
      .then((response) => {
        if (response.isSuccess) {
          toast.success('File uploaded successfully');
          handleUploadClose();
          reloadGridData();
        }
        else {
          toast.error((response as AxiosResponse).data);
        }
      });
  }
  const columns: Column[] = [
    {
      id: 'select', name: '', field: 'select', sortable: true, maxWidth: 20,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (dataContext.statusName == 'Pending' || dataContext.statusName == 'In Progress')
          return '<input type="checkbox">'
        else
          return '';
      },
      onCellClick: (e: any, args: OnEventArgs) => {
        if (e.target && e.target.type == 'checkbox')
          args.dataContext.selected = e.target.checked;
      }
    },
    // { id: 'jobId', name: 'ID', field: 'jobId', sortable: true, maxWidth:50 },
    { id: 'createdDateTime', name: 'DATE', field: 'createdDateTime', sortable: true, formatter: Formatters.dateUs, minWidth: 85 },

    // {
    //   id: 'expandCollapse',
    //   field: 'expandCollapse',
    //   excludeFromColumnPicker: true,
    //   excludeFromGridMenu: true,
    //   excludeFromHeaderMenu: true,
    //   formatter: (row, cell, value, colDef, dataContext) => {
    //     const isExpanded = dataContext.isExpanded;
    //     const iconClass = isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';

    //     return `<div>
    //               <i class="fa ${iconClass} pointer" data-row="${row}"></i>
    //             </div>`;
    //   },
    //   minWidth: 30,
    //   onCellClick: (e: Event, args: OnEventArgs) => {
    //     navigate("/employeeSplitJob", {
    //       state: { submittedValues: submittedValues ,
    //         emp : args.dataContext.jobId
    //       },
    //     });
    //   }
    // },

    {
      id: 'userName', name: 'CLIENT', field: 'userName', minWidth: 80,
      formatter: (row, cell, value, colDef, dataContext) => {
        return `<span class="pointer" title=" ${value}">${value}</span>`;
      }
    },
    {
      id: 'files', name: 'FILE NAME <i class="fa fa-download text-success ml-1" aria-hidden="true"></i>', field: 'files', minWidth: 150, sortable: true,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (dataContext.isSingleJob) {
          let title = dataContext.name ? dataContext.name : dataContext.jobId;
          let fileName = dataContext.name ? dataContext.name : dataContext.jobId + '.zip';
          return value.length > 0 ? `<i class="fa fa-file-archive-o text-info" aria-hidden="true"></i> <a href="#" class="pointer" title=${title}>${fileName}</a>` : '';
        }
        else {
          let icon = getFileIcon(value[0].FileExtension);
          return value.length > 0 ? `<i class="fa ${icon}" aria-hidden="true"></i> <a href="#" class="pointer" title="${dataContext.name}">${dataContext.name}</a>` : '';
        }
      },
      onCellClick: (e: Event, args: OnEventArgs) => {
        if (args.dataContext.isSingleJob) {
          let fileName = args.dataContext.name ? args.dataContext.name : args.dataContext.jobId;
          downloadZip(args.dataContext.files, fileName);
          //handleShow();
        }
        else {
          let fileInfo: any = args.dataContext.files[0];
          //window.open(fileInfo.SourceFilePath,'_blank');

          downloadFile(fileInfo);
        }
        updateJobStatus(args.dataContext.id, 'In Progress');
      }
    },
    // { id: 'name', name: 'Name', field: 'name', sortable: true },
    // { id: 'notes', name: 'Notes', field: 'notes', sortable: true },
    {
      id: 'isSingleJob', name: 'JOB TYPE  ', field: 'isSingleJob', sortable: true, maxWidth: 120,
      formatter: (row, cell, value, colDef, dataContext) => {
        return value ? `<div title='Merge Upload'>M(${dataContext.files.length})</div>` : `<div title='Single Upload'>S(${dataContext.files.length})</div>`;
      },
      cssClass: 'text-right px-4'
    },
    { id: 'AssignTo', name: 'ASSIGN TO', field: 'AssignTo', sortable: true, maxWidth: 120 },
    // { id: 'l1User', name: 'L1 User', field: 'l1User', sortable: true, maxWidth: 100 },
    // { id: 'l2User', name: 'L2 User', field: 'l2User', sortable: true, maxWidth: 100 },
    // { id: 'l3User', name: 'L3 User', field: 'l3User', sortable: true, maxWidth: 100 },


    // {
    //   id: 'uploadFiles', name: 'FILES <i class="fa fa-upload text-success ml-1" aria-hidden="true"></i>', field: 'uploadFiles', sortable: true, minWidth:100,
    //   formatter: (row, cell, value, colDef, dataContext) => {
    //     if (value.length == 0)
    //       return '';
    //     else if(value.length == 1)
    //     {
    //       let icon =  getFileIcon(value[0].FileExtension);
    //       return value.length > 0 ? `<i class="fa ${icon}" aria-hidden="true"></i> <a href="#" class="pointer">${value[0].FileName}</a>` : '';
    //     }
    //     else
    //     return '<a  target="_blank" href="#">View Files</a>';

    //   },
    //   onCellClick: (e: Event, args: OnEventArgs) => {
    //     console.log(args.dataContext);
    //     if (args.dataContext.uploadFiles.length > 1) {
    //       setFiles(args.dataContext.uploadFiles);
    //       setMergeFileName('uploadfiles');
    //       handleShow();
    //     }
    //     else {
    //       let fileInfo: any = args.dataContext.uploadFiles[0];
    //       //window.open(fileInfo.SourceFilePath,'_blank');
    //       downloadFile(fileInfo);
    //     }
    //     updateJobStatus(args.dataContext.id,'In Progress');
    //   }
    // },
    {
      id: 'uploadFiles', name: 'FILES <i class="fa fa-upload text-success ml-1" aria-hidden="true"></i>', field: 'uploadFiles', sortable: true, maxWidth: 100,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (value.length == 0)
          return '';
        else {

          let content = '';
          if (value)
            value.forEach((file: any) => {
              let fileicon = getFileIcon(file.FileExtension);
              content += `<i class="fa ${fileicon} fa-2 pointer" aria-hidden="true" title="${file.FileName}" data-id="${file.Id}"></i>&nbsp;`;
            });

          return content;
        }

      },
      onCellClick: (e: any, args: OnEventArgs) => {
        let fileid = e.target.attributes['data-id'];
        if (fileid.value) {
          let fileinfo = args.dataContext.uploadFiles.find((item: any) => item.Id == fileid.value);

          downloadFile(fileinfo);
        }
        //updateJobStatus(args.dataContext.id,'Downloaded');
      }
    },
    {
      id: 'statusName', name: 'STATUS', field: 'statusName', maxWidth: 100,
      formatter: (row, cell, value, colDef, dataContext) => {
        return `<span class = "pointer" title=" ${value}">${value}</span>`;
      }
    },
    {
      id: 'pagecount', name: 'PAGES', field: 'files', sortable: true, minWidth: 70,
      formatter: (row, cell, value, colDef, dataContext) => {
        let pageCount = 0;
        value.forEach((item: any) => {
          pageCount += item.PageCount ? item.PageCount : 0;
        });
        return pageCount.toString();
      },
      cssClass: 'text-right px-4'
    },
    {
      id: 'tat', name: 'TAT', field: 'tat', maxWidth: 100
      , formatter: (row, cell, value, colDef, dataContext) => {
        if (typeof value === 'string' && value.endsWith("Hours")) {
          return value.replace("Hours", "Hrs");
        } else {
          return value.toString();
        }
      }
    },
    {
      id: 'notification',
      field: 'unReadMessages',
      name: ` <a href="#" class="pointer" title="comments"><i class="fa fa-commenting pointer"></i></a>`,
      excludeFromColumnPicker: true,
      excludeFromGridMenu: true,
      excludeFromHeaderMenu: true,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (value == 0) {
          return '<div><i class="fa fa-commenting pointer"></i></div>';
        }
        else {
          return '<div>' +
            '<i class="fa fa-commenting pointer"></i>' +
            '<span class="badge rounded-pill badge-notification bg-danger" style="position: absolute;top: 3px;left: 15px;font-size:9px">' + value + '</span>' +
            '</div>';
        }
      },
      // minWidth: 30,
      maxWidth: 30,
      cssClass: 'text-primary',
      onCellClick: (_e: any, args: OnEventArgs) => {
        setShowNotification(args.dataContext)
        getNotifications(args.dataContext.id);
        // reactGrid.gridService.highlightRow(args.row, 1500);
        // reactGrid.gridService.setSelectedRow(args.row);
      },
    },
    {
      id: 'action',
      name: 'ACTIONS',
      field: 'id',
      maxWidth: 100,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (dataContext.statusName !== 'Pending')
          return `<div class="btn btn-default btn-xs" >Action <i class="fa fa-caret-down"></i></div>`;
        else
          return '';
      },
      cellMenu: {
        //commandTitle: 'Commands',
        // width: 200,
        menuUsabilityOverride: function (args) {
          return (args.dataContext.statusName !== 'Pending');
        },
        commandItems: [
          {
            command: 'Edit Page Count',
            title: 'Edit Page Count',
            iconCssClass: 'fa fa-pen text-info',
            positionOrder: 66,

            action: (_e, args) => {
              handlePageCountShow(args.dataContext.id, formatPageCount(args.dataContext.files));
              setJobId(args.dataContext.id);
            },
          },
          {
            command: 'upload',
            title: 'Upload Word File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.doc' || x == '.docx') > -1
              if (args.dataContext.uploadFiles.length == 0)
                return isShow
              else {
                let fileexits = args.dataContext.uploadFiles.find((file: any) => file.FileExtension == '.doc' || file.FileExtension == '.docx');
                return isShow && !fileexits;
              }
            },
            action: (_e, args) => {
              setJobId(args.dataContext.id);
              setFileType('.docx');
              handleUploadShow();
            },
          },
          {
            command: 'upload',
            title: 'Reupload Word File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.doc' || x == '.docx') > -1
              if (args.dataContext.uploadFiles.length > 0) {
                let fileexits = args.dataContext.uploadFiles.find((file: any) => file.FileExtension == '.doc' || file.FileExtension == '.docx');
                return isShow && fileexits;
              }
              else
                return false;

            },
            action: (_e, args) => {
              setJobId(args.dataContext.id);
              setFileType('.docx');
              handleUploadShow();
            },
          },
          {
            command: 'upload',
            title: 'Upload PDF File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.pdf') > -1;
              if (args.dataContext.uploadFiles.length == 0)
                return isShow
              else {
                let fileexits = args.dataContext.uploadFiles.find((file: any) => file.FileExtension == '.pdf');
                return isShow && !fileexits;
              }
            },
            action: (_e, args) => {
              setJobId(args.dataContext.id);
              setFileType('.pdf');
              handleUploadShow();
            },
          },
          {
            command: 'upload',
            title: 'Reupload PDF File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.pdf') > -1;
              if (args.dataContext.uploadFiles.length > 0) {
                let fileexits = args.dataContext.uploadFiles.find((file: any) => file.FileExtension == '.pdf');
                return isShow && fileexits;
              }
              else
                return false;
            },
            action: (_e, args) => {
              setJobId(args.dataContext.id);
              setFileType('.pdf');
              handleUploadShow();
            },
          },
          {
            command: 'upload',
            title: 'Upload PDF Link File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.pdflnk') > -1;
              if (args.dataContext.uploadFiles.length == 0)
                return isShow
              else {
                let fileexits = args.dataContext.uploadFiles.find((file: any) => file.FileExtension == '.pdflnk');
                return isShow && !fileexits;
              }
            },
            action: (_e, args) => {
              setJobId(args.dataContext.id);
              setFileType('.pdflnk');
              handleUploadShow();
            },
          },
          {
            command: 'upload',
            title: 'Reupload PDF Link File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.pdflnk') > -1;
              if (args.dataContext.uploadFiles.length > 0) {
                let fileexits = args.dataContext.uploadFiles.find((file: any) => file.FileExtension == '.pdflnk');
                return isShow && fileexits;
              }
              else
                return false;
            },
            action: (_e, args) => {
              setJobId(args.dataContext.id);
              setFileType('.pdflnk');
              handleUploadShow();
            },
          },
          {
            command: 'Duplicate',
            title: 'Duplicate',
            iconCssClass: 'fa fa-files-o text-info',
            positionOrder: 66,
            action: (_e, args) => {
              confirm('Are you sure you want to Duplicate this record?', { title: 'Confirm', cancelLabel: 'No', okLabel: 'Yes' }).then((res: boolean) => {
                if (res)
                  deleteJob(args.dataContext.id, 'Duplicate');
              });
            },
          },
          // {
          // command: 'split',
          // title: 'Split Job',
          // iconCssClass: 'fa fa-clone text-info',
          // positionOrder: 66,
          // itemVisibilityOverride: (args) => true,
          // action: (_e, args) => {
          //   let arr = JSON.parse(args.dataContext.jobFiles);
          //   navigate("/split-job", {
          //     state: { jobId : args.dataContext.jobId,
          //       pagecount: arr.JobFiles[0].PageCount || '',
          //       name:args.dataContext.name
          //     },
          //   });
          // }
          // },
          {
            command: 'merge', title: 'Merge Job', positionOrder: 64,
            iconCssClass: 'fa fa-compress text-info', cssClass: 'red', textCssClass: 'text-italic color-danger-light',
            itemVisibilityOverride(args) {
              return false; //(args.dataContext.statusName == 'Pending' || args.dataContext.statusName == 'In Progress');
            },
            action: (_e, args) => {
              console.log(args.dataContext, args.column);
              alert('Merge');
            },
          },
        ]
      }
    }
  ];

  // this._darkModeGrid1 = this.isBrowserDarkModeEnabled();
  const gridOptions: GridOption = {
    ...ConfigSettings.gridOptions,
    ...{
      enableCellNavigation: true,
      enableExcelCopyBuffer: false,
      enableFiltering: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      checkboxSelector: {
        // you can toggle these 2 properties to show the "select all" checkbox in different location
        hideInFilterHeaderRow: false,
        hideInColumnTitleRow: false,
        columnIndexPosition: 1,
        onExtensionRegistered: (instance) => { }
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      datasetIdPropertyName: 'uid',
      enableCellMenu: true,
      cellMenu: {
        onCommand: (_e, args) => function () { },
        onOptionSelected: (_e, args) => {
          const dataContext = args && args.dataContext;
          if (dataContext && dataContext.hasOwnProperty('completed')) {
            dataContext.completed = args.item.option;
          }
        },
      },

    }
  };

  function reactGridReady(reactGridInstance: SlickgridReactInstance) {
    setGrid(reactGridInstance);
  }

  const deleteJob = (jobId: string, status: string) => {
    JobService.deleteJob(jobId, user.id, status).then((response: any) => {
      if (response.isSuccess) {
        toast.success(`Job ${status} successfully.`);

        reloadGridData();
      }
    }).finally(() => {

    });
  }

  const getFileIcon = (fileExt: string) => {
    switch (fileExt) {
      case 'pdf':
      case '.pdf':
      case 'pdflink':
      case '.pdflink':
        return 'fa-file-pdf-o text-danger'; break;
      case 'doc':
      case '.doc':
      case 'docx':
      case '.docx':
        return 'fa-file-word-o text-primary'; break;
      default: return 'fa-file text-info';
    }

  };

  const loadData = (isreload: boolean) => {
    setLoader(true);
    let fDate = fromDate ? moment(fromDate).format('MM-DD-YYYY') : null;
    let tDate = toDate ? moment(toDate).format('MM-DD-YYYY') : null;
    JobService.getJobs(user.id, selectedStatus, selectedClient, filename, fDate, tDate, initialLoad).then((response: any) => {
      if (response.isSuccess) {
        let data = response.data.map((item: any) => {
          item.files = item.jobFiles ? JSON.parse(item.jobFiles).JobFiles.filter((item: any) => !item.IsUploadFile) : [];
          item.uploadFiles = item.jobFiles ? JSON.parse(item.jobFiles).JobFiles.filter((item: any) => item.IsUploadFile) : [];
          item.uid = crypto.randomUUID();
          return item;
        });
        // const fiveMinutesAgo = moment().subtract(5, 'minutes');
        // if (!selectedStatus.includes('Completed')) {
        //   data = data.filter((item: any) => {
        //     if (item.statusName === 'Completed') {
        //       const modifiedTime = moment(item.modifiedDateTime);
        //       return modifiedTime.isAfter(fiveMinutesAgo);
        //     }
        //     return true;
        //   });
        // }
        data.sort((a: any, b: any) => b.jobId - a.jobId);
        if (isreload && reactGrid) {
          reactGrid.dataView.setItems(data);
        }
        else
          setData(data);
      }
    }).catch(() => {
      setLoader(false);
    }).finally(() => {
      setLoader(false);
    });
  }

  const mergeJobs = () => {
    let rows = reactGrid?.dataView.getItems().filter((item: any) => item.selected) || [];
    if (rows && rows.length <= 1) {
      toast.info(`Select atleast two jobs.`);
      return false;
    }

    setLoader(true);
    let userid = rows[0].createdBy;
    let selectedIds = rows.map((sel: any) => sel.id) || [];
    JobService.mergeJobs(selectedIds, userid, user.id, user.companyId).then((response: any) => {
      if (response.isSuccess) {
        toast.success(`Jobs Merged successfully.`);
        search();
      }
    }).catch(() => {
      setLoader(false);
    }).finally(() => {
      setLoader(false);
    });
  }

  let getUsers = async () => {
    const response: any = await LookupService.getUsers('client');
    if (response.isSuccess) {
      setUsers(response.data.map((item: any) => {
        return { 'value': item.id, 'label': item.value };
      })
      );
      console.log(response.data);
    }
  }

  let getStatus = async () => {
    const response: any = await LookupService.getStatus('status');
    if (response.isSuccess) {
      let status = response.data.map((item: any) => {
        return { 'value': item.id, 'label': item.value };
      });
      setStatus(status)
    }
  }

  const onStatusChange = (selectedOptions: any, actionMeta: any) => {
    let selStatus = selectedOptions ? selectedOptions.map((val: any, index: number) => val.value).join(',') : '';
    setStatusFilter(selStatus);
    // setSelectedStatus(selValues);

    // loadData(false)
  };

  const onClientChange = (newValue: any, actionMeta: any) => {
    let selClients = newValue ? newValue.map((val: any, index: number) => val.value).join(',') : '';
    setClientFilter(selClients);
  };

  // function downloadFile(fileInfo: any){
  //   setLoader(true);
  //   DownloadZipService.downlodFile(fileInfo, function() {
  //     setLoader(false);
  //   });
  // };
  // const downloadFile = (fileInfo: any) => {
  //   setShowProgress(true);
  //   setLoader(true);

  //   DownloadZipService.downlodFile(fileInfo, setProgress, () => {
  //     setShowProgress(false); // Hide progress bar once download is complete
  //     setProgress(0); // Reset progress bar
  //     setLoader(false);

  //   });
  // };

  const downloadFile = (fileInfo: any) => {
    setShowProgressBar(true);
    DownloadZipService.downlodFile(fileInfo, setProgress, () => {
      setShowProgressBar(false);
      setProgress(0);
    });
  };

  function downloadZip(files: any, fileName: string) {
    setShowProgressBar(true);
    DownloadZipService.createZip(files, fileName, setProgress, function () {
      setShowProgressBar(false);
      setProgress(0);
    });
  }
  useEffect(() => {
    loadData(false);
  }, [initialLoad]);

  useEffect(() => {
    if (location.state) {
      setclientJobId(location.state?.jobId)
    }
  }, []);

  const updateJobStatus = (jobId: string, status: string) => {
    JobService.updateJobStatus(jobId, user.id, status).then((response: any) => {
      if (response.isSuccess) {
        //toast.success(`Job ${status} successfully.`);
        reloadGridData();
      }
    }).finally(() => {

    });
  }


  function search() {
    if (initialLoad) {
      setInitialLoad(false);
    } else {
      // if (jobId.trim() !== '') {
      //   const filteredData = dataset.filter(item => item.jobId.toString().includes(jobId.trim()));
      //   setFilteredData(filteredData);
      //   setData(filteredData);
      // } else if (selectedStatus === '') {
      //   setData(dataset);
      // } else {
      //   const filteredData = dataset.filter(item => selectedStatus.split(',').includes(item.statusId));
      //   setFilteredData(filteredData);
      //   setData(filteredData);
      // }
      loadData(false)
    }
  }

  // useEffect(() => {
  //   loadData(false);
  // }, [initialLoad]);

  useEffect(() => {
    getUsers();
    getStatus();
    loadData(false);
  }, []);

  const FileBody = () => {
    let files = fileList.map((item: any) => <tr key={item.FileName}><td><i className={"fa " + getFileIcon(item.FileExtension)} aria-hidden="true"></i> {item.FileName}</td><td width={30} className='text-center'> <a href={item.SourceFilePath} target='_blank'> <i className="fa fa-download" aria-hidden="true"></i></a></td></tr>);

    return (
      <table border={0} width={'100%'} className="table table-sm">
        <thead>
          <tr>
            <th className='table-primary'>File Name</th>
            <th className='table-primary'>Action</th>
          </tr>
        </thead>
        <tbody>
          {files}
        </tbody>
      </table>
    );
  }

  // Notifications

  function reloadGridData() {
    loadData(true);
  };
  const childRef: any = useRef();

  // trigger child method to load notifications
  let getNotifications = async (jobId: string) => {
    childRef.current.getNotifications(jobId)
  }

  function loadshow() {
    setLoader(true)
  }

  return (

    <>
      {showloader}


      <div>
        <section className="content">
          <div className="container-fluid">
            <div className="card">
              <div className="card-header d-flex">
                <div className='col-md-4'>
                <h3 className="card-title" style={{ fontSize: "1.8rem" }}><i className="fa fa-arrow-left pointer ml-1 mr-2" style={{fontSize:"26px"}} onClick={() => navigate("/client-list")} aria-hidden="true"></i><strong>Jobs</strong></h3>
                </div>
                <div className='col-md-8 d-flex flex-row-reverse'>
                  {/* <Button className='btn-sm btn-success'>
                    Merge Selected Jobs
                  </Button> */}
                </div>
              </div>
              <div className="card-body">
                <div className='row'>

                  <div className="col-md-2">
                    <div className="form-group">
                      <label>Select Status</label>
                      <Select options={statusList} isClearable={true} onChange={onStatusChange} isMulti={true} closeMenuOnSelect={false} />
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div className="form-group">
                      <label>Select Client </label>
                      <Select options={usersList} isClearable={true} onChange={onClientChange} isMulti={true} closeMenuOnSelect={true} />
                    </div>
                  </div>


                  <div className="col-md-2">
                    <div className="form-group">
                      <label>File Name </label>
                      <input className="form-control" type='text' name='txtFilename' onChange={(e) => setFilename(e.target.value)} value={filename} />
                    </div>
                  </div>

                  {/* <div className="col-md-1">
                    <div className="form-group">
                      <label>Job Id</label>
                      <input
                        className="form-control"
                        type='text'
                        name='jobId' 
                        onChange={(e) => setJobId(e.target.value)}
                        value={jobId} 
                      />
                    </div>
                  </div> */}


                  <div className="col-md-2">
                    <div className="form-group">
                      <label>From Date </label><br></br>
                      <DatePicker id="txtFromDate" name='txtFromDate' onChange={(date: any) => setFromDate(date)} selected={fromDate} className="form-control" dateFormat="MM/dd/yyyy" />
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div className="form-group">
                      <label>To Date </label>
                      <DatePicker id="txtToDate" name='txtToDate' onChange={(date: any) => setToDate(date)} selected={toDate} className="form-control" dateFormat="MM/dd/yyyy" />
                    </div>
                  </div>

                  <div className="col-md-1">
                    <div className="form-group">
                      <label>&nbsp; </label><br></br>
                      <Button variant="primary" onClick={(e) => search()}><strong>Search</strong></Button>
                    </div>
                  </div>
                </div>
               <div className='row'>
                <div className='col-md-12'>
                <Button className='btn-sm btn-success' onClick={mergeJobs}>
                    Merge Selected Jobs
                  </Button>
                </div>
               
               </div>
                <div className='row pt-4'>
                  <div className='col-md-12' style={{ zIndex: '0' }}>
                    <SlickgridReact gridId="grid1"
                      columnDefinitions={columns}
                      gridOptions={gridOptions!}
                      dataset={dataset}
                      onReactGridCreated={e => { reactGridReady(e.detail); }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </div>
      {showProgressBar && (
        <div id="progressBar"></div>
      )}
      <div className={`progress ${showProgressBar ? 'progress-center' : ''}`}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >{progress}%</div>
      </div>

      <Modal show={show} onHide={handleClose} centered={false}>
        <Modal.Body className='p-1'>
          <FileBody></FileBody>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} className='btn-sm'>
            Close
          </Button>
          <Button variant="primary" className='btn-sm'>
            Download Zip
          </Button>
        </Modal.Footer>
      </Modal>


      <Modal show={showUpload} onHide={handleUploadClose} centered={false}>
        <ModalHeader placeholder={undefined}>
          Upload File
        </ModalHeader>
        <Modal.Body className='p-1'>
          <UppyUpload admin={true} onCompleteCallback={uploadFiles} filePreference={fileType} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleUploadClose} className='btn-sm'>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <NorificationModal title='alert' okBottonText='OK' cancelBottonText='Close' details={showNotification} ref={childRef} reloadGridData={reloadGridData}></NorificationModal>

      <Modal show={showPageCount} onHide={handleClose}>
        <ModalHeader placeholder={undefined}>
          <Modal.Title>Update Page Count</Modal.Title>
        </ModalHeader>
        <Modal.Body>
          <Form onSubmit={handlePageCountSubmit}>
            <FormControl
              type="text"
              value={pageCount}
              onChange={(event) => setPageCount(event.target.value)}
            // placeholder="Enter some text"
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handlePageCountClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePageCount}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>


    </>



  );

};

export default JobsList;
