import ApiService from '@app/services/Api.service';

export const getJobs = (
  userId: string,
  jobStatus: string,
  createdBy: string,
  filename: string | null = null,
  jobId: string | null = null,
  fromDate: string | null = null,
  toDate: string | null = null,
  initialLoad: boolean = false
) => {
  return new Promise(async (res, rej) => {
    // Construct query parameters
    const params = new URLSearchParams();
    params.append('userId', userId);
    if (jobStatus) params.append('jobStatus', jobStatus);
    if (createdBy) params.append('createdBy', createdBy);
    if (filename) params.append('filename', filename);
    if (jobId) params.append('jobId', jobId);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    params.append('initialLoad', initialLoad.toString());

    // Send request
    ApiService.requests.get(`Job/getjobs?${params.toString()}`)
      .then((response) => {
        if (response.isSuccess) {
          return res(response);
        } else {
          return rej({ message: response.message });
        }
      })
      .catch((error) => {
        return rej({ message: error.message });
      });
  });
};

  export const deleteJob = (jobId:string, userId:string, status: string) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get(`Job/deletejob?jobId=${jobId}&userId=${userId}&status=${status}`)
      .then((response) => {
        if(response.isSuccess)
        {
          return res(response);
        }
        else
        {
          return rej({ message: response.message });
        }
      })
    });
  };

  export const updateJobStatus = (jobId:string, userId:string, status: string) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get(`Job/updateJobStatus?jobId=${jobId}&userId=${userId}&status=${status}`)
      .then((response) => {
        if(response.isSuccess)
        {
          return res(response);
        }
        else
        {
          return rej({ message: response.message });
        }
      })
    });
  };

  export const mergeJobs = (jobIds:any[], userId:string, createdBy:string, companyId:string) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.post(`Job/mergejobs`, { jobIds: jobIds, userId: userId, createdBy: createdBy, companyId: companyId })
      .then((response) => {
        if(response.isSuccess)
        {
          return res(response);
        }
        else
        {
          return rej({ message: response.message });
        }
      })
    });
  };

  const JobService = {
    getJobs,
    deleteJob,
    updateJobStatus,
    mergeJobs
}

export default JobService;