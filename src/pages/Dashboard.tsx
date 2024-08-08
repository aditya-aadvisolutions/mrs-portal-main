import React, { useEffect, useState } from 'react';
import { ContentHeader } from '@components';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import APIService from '@app/services/Api.service';

// interface DashboardData {
//   pendingJobsCount: number;
//   completedJobsCount: number;
//   totalClientsCount: number;
// }

// Define types for the authentication data
interface Authentication {
  loginName: string;
  roleName: string;
}
const Dashboard: React.FC = () => {
  console.log(import.meta.env);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    pendingJobsCount: 0,
    completedJobsCount: 0,
    totalClientsCount: 0,
    totalEmployeesCount: 0,
    inProgressJobsCount: 0,
    voidJobsCount: 0,
    duplicateJobsCount: 0,
    downloadedJobsCount: 0,
  });
  const authData = localStorage.getItem('authentication');
  const username: Authentication = authData ? JSON.parse(authData) : { loginName: '' };
  const role=username.roleName
  console.log(username, "username");

  localStorage.setItem('roleName', role);
  localStorage.getItem('roleName');

  localStorage.setItem('userName', username.loginName);
  localStorage.getItem('userName');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await APIService.requests.get(`dashboard?username=${username.loginName}`);
        const { ClientsCount, CompletedJobsCount, PendingJobsCount,EmployeesCount,InProgressJobsCount,VoidJobsCount,DuplicateJobsCount, DownloadedJobsCount,} = response.data;
        setDashboardData({
          pendingJobsCount: PendingJobsCount,
          completedJobsCount: CompletedJobsCount,
          totalClientsCount: ClientsCount,
          totalEmployeesCount: EmployeesCount,
          inProgressJobsCount: InProgressJobsCount,
          voidJobsCount: VoidJobsCount,
          duplicateJobsCount: DuplicateJobsCount,
          downloadedJobsCount: DownloadedJobsCount,
        });
        
      } catch (error: any) {
        console.error('Error fetching data:', error.response ? error.response.data.message : error.message);
      }
    };
    console.log(dashboardData)
    fetchData();
  }, [username.loginName]);

  // const handlePendingJobsClick = () => {
  //   // setJobStatus('Pending');
  //   navigate('/jobslist/Pending');
  // };

  // const handleCompletedJobsClick = () => {
  //   // setJobStatus('Completed');
  //   navigate('/jobslist/Completed');
  // };

  // const handleClientsClick = () => {
  //   // setJobStatus('All');
  //   navigate('/client-list');
  // };

  // const handleEmployeesClick = () => {
  //   navigate('/employee');
  // };

    
  return (
      <div>
        <ContentHeader title="Dashboard" />
        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-3 col-6">
                <div className="small-box bg-orange">
                  <div className="inner text-white">
                    <h3>{dashboardData.pendingJobsCount}</h3>
                    <p>Pending Jobs</p>
                  </div>
                  <div className="icon">
                    <i className="ion ion-document" />
                  </div>
                  <Link to="/jobslist/Pending" className="small-box-footer">
                    <span className='text-white'>More info </span><i className="fas fa-arrow-circle-right text-white" />
                  </Link>
                </div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="small-box bg-green">
                  <div className="inner">
                    <h3>{dashboardData.completedJobsCount}</h3>
                    <p>Completed Jobs</p>
                  </div>
                  <div className="icon">
                    <i className="ion ion-document-text" />
                  </div>
                  <Link to="/jobslist/Completed" className="small-box-footer">
                    More info <i className="fas fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="small-box bg-pink">
                  <div className="inner">
                    <h3>{dashboardData.inProgressJobsCount}</h3>
                    <p>In-Progress Jobs</p>
                  </div>
                  <div className="icon">
                    <i className="ion ion-load-c" />
                  </div>
                  <Link to="/jobslist/InProgress" className="small-box-footer">
                    More info <i className="fas fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="small-box bg-purple">
                  <div className="inner">
                    <h3>{dashboardData.downloadedJobsCount}</h3>
                    <p>Downloaded Jobs</p>
                  </div>
                  <div className="icon">
                    <i className="ion ion-android-download" />
                  </div>
                  <Link to="/jobslist/Downloaded" className="small-box-footer">
                    More info <i className="fas fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
              {role === 'Admin' && (
                <>
                  <div className="col-lg-3 col-6">
                    <div className="small-box bg-info">
                      <div className="inner">
                        <h3>{dashboardData.voidJobsCount}</h3>
                        <p>Void Jobs</p>
                      </div>
                      <div className="icon">
                        <i className="ion ion-close-circled" />
                      </div>
                      <Link to="/jobslist/Void" className="small-box-footer">
                        More info <i className="fas fa-arrow-circle-right" />
                      </Link>
                    </div>
                  </div>
                  <div className="col-lg-3 col-6">
                    <div className="small-box bg-maroon">
                      <div className="inner">
                        <h3>{dashboardData.duplicateJobsCount}</h3>
                        <p>Duplicate Jobs</p>
                      </div>
                      <div className="icon">
                        <i className="ion ion-ios-copy" />
                      </div>
                      <Link to="/jobslist/Duplicate" className="small-box-footer">
                        More info <i className="fas fa-arrow-circle-right" />
                      </Link>
                    </div>
                  </div>
                  <div className="col-lg-3 col-6">
                    <div className="small-box bg-warning text-dark">
                      <div className="inner text-white">
                        <h3>{dashboardData.totalClientsCount}</h3>
                        <p>Clients</p>
                      </div>
                      <div className="icon">
                        <i className="ion ion-person-stalker" />
                      </div>
                      <Link to="/client-list" className="small-box-footer">
                      <span className='text-white'>More info </span> <i className="fas fa-arrow-circle-right text-white" />
                      </Link>
                    </div>
                  </div>
                  <div className="col-lg-3 col-6">
                    <div className="small-box bg-navy">
                      <div className="inner">
                        <h3>{dashboardData.totalEmployeesCount}</h3>
                        <p>Employees</p>
                      </div>
                      <div className="icon">
                        <i className="ion ion-person-stalker" />
                      </div>
                      <Link to="/employee" className="small-box-footer">
                        More info <i className="fas fa-arrow-circle-right" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  };
  
  export default Dashboard;