import { UserManager, UserManagerSettings } from 'oidc-client-ts';
import { sleep } from './helpers';
import ApiService from '@app/services/Api.service';
import User, { IUserDTO } from '@app/store/Models/User';

declare const FB: any;

const GOOGLE_CONFIG: UserManagerSettings = {
  authority: 'https://accounts.google.com',
  client_id: '',
  client_secret: '',
  redirect_uri: `${window.location.protocol}//${window.location.host}/callback`,
  scope: 'openid email profile',
  loadUserInfo: true,
};

export const GoogleProvider = new UserManager(GOOGLE_CONFIG);

export const facebookLogin = () => {
  return new Promise((res, rej) => {
    let authResponse: any;
    FB.login(
      (r: any) => {
        if (r.authResponse) {
          authResponse = r.authResponse;
          FB.api(
            '/me?fields=id,name,email,picture.width(640).height(640)',
            (profileResponse: any) => {
              authResponse.profile = profileResponse;
              authResponse.profile.picture = profileResponse.picture.data.url;
              res(authResponse);
            }
          );
        } else {
          console.log('User cancelled login or did not fully authorize.');
          rej(undefined);
        }
      },
      { scope: 'public_profile,email' }
    );
  });
};

export const getFacebookLoginStatus = () => {
  return new Promise((res, rej) => {
    let authResponse: any = {};
    FB.getLoginStatus((r: any) => {
      if (r.authResponse) {
        authResponse = r.authResponse;
        FB.api(
          '/me?fields=id,name,email,picture.width(640).height(640)',
          (profileResponse: any) => {
            authResponse.profile = profileResponse;
            authResponse.profile.picture = profileResponse.picture.data.url;
            res(authResponse);
          }
        );
      } else {
        res(undefined);
      }
    });
  });
};

export const authLogin = (user: IUserDTO) => {
  return new Promise(async (res, rej) => {
    ApiService.requests.post('Login/verifylogin', user)
    .then((response) => {
      if(response.isSuccess)
      {
        response.data.isAuthenticated = true;
        localStorage.setItem(
          'authentication',
          JSON.stringify(response.data)
        );
        return res(response);
      }
      else
      {
        return rej({ message: response.message });
      }
    })
  });
};

export const getAuthStatus = () => {
  return new Promise(async (res, rej) => {
    await sleep(500);
    try {
      let authentication = localStorage.getItem('authentication');
      if (authentication) {
        authentication = JSON.parse(authentication);
        return res(authentication);
      }
      return res(undefined);
    } catch (error) {
      return res(undefined);
    }
  });
};

export const RegisterUser = (user: any) => {
  return new Promise(async (res, rej) => {
    ApiService.requests.post('client/register', user)
    .then((response) => {
      console.log(response,'response');
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
export const updateUserDetails = (user: any) => {
  return new Promise(async (res, rej) => {
    ApiService.requests.patch('client/update', user)
    .then((response) => {
      console.log(response,'response');
      if(response)
      {
        return res(response);
      }
      else
      {
        return rej({ message: response });
      }
    })
  })
}

export const CreateEmployee = (user: any) => {
  return new Promise(async (res, rej) => {
    ApiService.requests.post('employee/register', user)
    .then((response) => {
      console.log(response,'response');
      if(response)
      {
        return res(response);
      }
      else
      {
        return rej({ message: response.message });
      }
    })
  })
}

export const Updateemployee = (user: any) => {
  return new Promise(async (res, rej) => {
    ApiService.requests.patch('employee/update', user)
    .then((response) => {
      console.log(response,'response');
      if(response)
      {
        return res(response);
      }
      else
      {
        return rej({ message: response });
      }
    })
  })
}

export const refreshToken = (user: User) => {
  
  return new Promise(async (res, rej) => {
    ApiService.requests.post('Login/refresh-token', user)
    .then((response) => {
      if(response.isSuccess)
      {
        response.data.isAuthenticated = true;
        localStorage.removeItem('authentication')
        localStorage.setItem(
          'authentication',
          JSON.stringify(response.data)
        );
        return res(response);
      }
      else
      {
        return rej({ message: response.message });
      }
    })
  });
};

export const formatNumber = (phone:any) => {
  // Assuming the phone number is a 10-digit string
  const phoneNumber = phone.replace(/\D/g, ''); // Remove non-digit characters
  const country = "+1";
  const area = phoneNumber.substring(0, 3);
  const middle = phoneNumber.substring(3, 6);
  const last = phoneNumber.substring(6, 10);

  return `${country} (${area}) ${middle}-${last}`;
};