import ApiService from '@app/services/Api.service';
import Employees from './../pages/admin/Employees';


export const getEmployees = () => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get(`employee/getemployees`)
      .then((response) => {
        if(response)
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

  const EmployeesService = {
    getEmployees
}

export default EmployeesService;