import React, { useEffect, useState } from 'react';
import { ContentHeader } from '@components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    totalEmployeesCount: 0
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
        const response = await axios.get(`http://localhost:8080/api/dashboard?username=${username.loginName}`);
        const { ClientsCount, CompletedJobsCount, PendingJobsCount,EmployeesCount } = response.data.data;
        console.log(response.data.ata)
        setDashboardData({
          pendingJobsCount: PendingJobsCount,
          completedJobsCount: CompletedJobsCount,
          totalClientsCount: ClientsCount,
          totalEmployeesCount: EmployeesCount
        });
        
      } catch (error: any) {
        console.error('Error fetching data:', error.response ? error.response.data.message : error.message);
      }
    };
    console.log(dashboardData)
    fetchData();
  }, [username.loginName]);

  const handlePendingJobsClick = () => {
    // setJobStatus('Pending');
    navigate('/jobslist/Pending');
  };

  const handleCompletedJobsClick = () => {
    // setJobStatus('Completed');
    navigate('/jobslist/Completed');
  };

  const handleClientsClick = () => {
    // setJobStatus('All');
    navigate('/client-list');
  };

  const handleEmployeesClick = () => {
    navigate('/employee');
  };

    
  return (
    <div>
      <ContentHeader title="Dashboard" />

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{dashboardData.pendingJobsCount}</h3>
                  <p>Pending Jobs</p>
                </div>
                <div className="icon">
                  <i className="ion ion-document" />
                </div>
                <a href="" className="small-box-footer" onClick={handlePendingJobsClick}>
                  More info <i className="fas fa-arrow-circle-right"  />
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{dashboardData.completedJobsCount}</h3>
                  <p>Completed Jobs</p>
                </div>
                <div className="icon">
                  <i className="ion ion-document-text" />
                </div>
                <a href="" className="small-box-footer" onClick={handleCompletedJobsClick}>
                  More info <i className="fas fa-arrow-circle-right" />
                </a>
              </div>
            </div>
            {role=="Admin" && (
              <>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{dashboardData.totalClientsCount}</h3>
                  <p>Clients</p>
                </div>
                <div className="icon">
                  <i className="ion ion-person-stalker" />
                </div>
                <a href="" className="small-box-footer" onClick={handleClientsClick}>
                  More info <i className="fas fa-arrow-circle-right" />
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-danger">
                <div className="inner">
                <h3>{dashboardData.totalEmployeesCount}</h3>
                  <p>Employees</p>
                </div>
                <div className="icon">
                  <i className="ion ion-person-stalker" />
                </div>
                <a href="" className="small-box-footer" onClick={handleEmployeesClick}>
                  More info <i className="fas fa-arrow-circle-right" />
                </a>
              </div>
            </div></>)
}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

