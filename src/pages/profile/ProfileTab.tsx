import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Form, InputGroup, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { countryList } from "@app/constants/countries.constants";
import { statesList } from "@app/constants/states.constants";
import { PatternFormat } from "react-number-format";
import { useNavigate } from 'react-router-dom';


import ApiService from '@app/services/Api.service';

import { updateUserDetails } from "@app/utils/oidc-providers"; // Adjust the import according to your API setup

const ProfileTab = ({ isActive, userId }: { isActive: boolean, userId: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    loginName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    filePreference: [''],
    logo: null,
  });

  const modifyedBy = localStorage.getItem("authentication")
  ? JSON.parse(localStorage.getItem("authentication") as string).id
  : "";

  const userprofileId = localStorage.getItem("authentication")
  ? JSON.parse(localStorage.getItem("authentication") as string).id
  : "";

  const Role = localStorage.getItem("authentication") ? JSON.parse(localStorage.getItem("authentication") as string).roleName : "";
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is a required field"),
    loginName: Yup.string().required("Login name is a required field"),
    lastName: Yup.string().required("Last name is a required field"),
    email: Yup.string()
      .email("Invalid email address. Please enter a valid email address.")
      .required("Email address is a required field"),
    phone: Yup.string()
    //   .test("phone", "Invalid phone number. Please enter a valid 10-digit phone number.", function (value) {
    //     const phoneRegex = /^\+1 \(\d{3}\) \d{3}-\d{4}$/;
    //     return phoneRegex.test(value);
    //   })
      .required("Phone number is a required field"),
    address1: Yup.string().required("Address line 1 is a required field"),
    address2: Yup.string(),
    city: Yup.string().required("City is a required field"),
    state: Yup.string().required("State is a required field"),
    country: Yup.string().required("Country is a required field"),
    filePreference: Yup.array().min(1, "Select at least one document type."),
  });

  const { handleChange, values, handleSubmit, touched, errors, setFieldValue } = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsAuthLoading(true);
        const numericPhoneNumber = values.phone.replace(/^\+1|[\D]+/g, "");
        if(Role === "Admin") {
          const updatedUser = {
            ...values,
            modifyedBy:modifyedBy,
            userId: userId,
            phone: parseInt(numericPhoneNumber, 10),
          };
           await updateUserDetails(updatedUser);
          
        }else if(Role === "Client") {
          const updatedUser = {
            ...values,
            modifyedBy:modifyedBy,
            userId: userprofileId,
            phone: parseInt(numericPhoneNumber, 10),
          };
           await updateUserDetails(updatedUser);
        }
         // Adjust according to your API call
        toast.success("Profile updated successfully.");
        navigate('/client-list')
      } catch (error : any) {
        toast.error(error.message || "Failed to update profile.");
      } finally {
        setIsAuthLoading(false);
      }
    },
  });
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await ApiService.requests.get(`client/clientdata?userId=${userId}`);
        if (response) {
          setInitialValues({
            firstName: response.User.FirstName,
            loginName: response.User.LoginName, // Set this if applicable
            lastName: response.User.LastName,
            email: response.User.Email,
            phone: response.User.PhoneNo,
            address1: response.Address1,
            address2: response.Address2,
            city: response.City,
            state: response.State || "", // Adjust if necessary
            country: response.Country || "", // Adjust if necessary
            filePreference: response.FilePreference.split(','), // Convert string to array
            logo: null, // Handle file uploads if necessary
          });
        }
      } catch (error) {
        toast.error("Failed to fetch user details.");
      }
    };
    const fetchDetails = async () => {
      try {
        const response = await ApiService.requests.get(`client/clientdata?userId=${userprofileId}`);
        if (response) {
          setInitialValues({
            firstName: response.User.FirstName,
            loginName: response.User.LoginName, // Set this if applicable
            lastName: response.User.LastName,
            email: response.User.Email,
            phone: response.User.PhoneNo,
            address1: response.Address1,
            address2: response.Address2,
            city: response.City,
            state: response.State || "", // Adjust if necessary
            country: response.Country || "", // Adjust if necessary
            filePreference: response.FilePreference.split(','), // Convert string to array
            logo: null, // Handle file uploads if necessary
          });
        }
      } catch (error) {
        toast.error("Failed to fetch user details.");
      }
    };
  
    if (userId && Role === "Admin") {
      fetchUserDetails();
    }else if(Role === "Client"){
      fetchDetails();
    }
  }, [userId]);



  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <form onSubmit={handleSubmit}>
      <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">
                First Name<span className="text-danger">*</span>
              </label>
              <InputGroup className="mb-3">
                <Form.Control
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  onChange={handleChange}
                  value={values.firstName}
                  isValid={touched.firstName && !errors.firstName}
                  isInvalid={touched.firstName && !!errors.firstName}
                  tabIndex={1}
                />
                {touched.firstName && errors.firstName && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.firstName}
                  </div>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <label className="form-label">Login Name<span className="text-danger">*</span></label>
              <InputGroup className="mb-3">
                <Form.Control
                  id="loginName"
                  name="loginName"
                  type="text"
                  placeholder="Login Name"
                  onChange={handleChange}
                  value={values.loginName}
                  isValid={touched.loginName && !errors.loginName}
                  isInvalid={touched.loginName && !!errors.loginName}
                  tabIndex={3}
                />
                {touched.loginName && errors.loginName && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.loginName}
                  </div>
                )}
              </InputGroup>
            </div>
           {/* loginName */}
            <div className="mb-3">
              <label className="form-label">
                Email<span className="text-danger">*</span>
              </label>
              <InputGroup className="mb-3">
                <Form.Control
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  onChange={handleChange}
                  value={values.email}
                  isValid={touched.email && !errors.email}
                  isInvalid={touched.email && !!errors.email}
                  disabled
                  tabIndex={5}
                />
                {touched.email && errors.email ? (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.email}
                  </div>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-envelope" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <label className="form-label">Address 2</label>
              <InputGroup className="mb-3">
                <Form.Control
                  id="address2"
                  name="address2"
                  type="text"
                  placeholder="Address 2"
                  onChange={handleChange}
                  value={values.address2}
                  isValid={touched.address2 && !errors.address2}
                  isInvalid={touched.address2 && !!errors.address2}
                  tabIndex={7}
                />
                {touched.address2 && errors.address2 && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.address2}
                  </div>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <label className="form-label">
                State<span className="text-danger">*</span>
              </label>
              <InputGroup className="mb-3">
                <Form.Control
                  as="select"
                  id="state"
                  name="state"
                  onChange={handleChange}
                  value={values.state}
                  isValid={touched.state && !errors.state}
                  isInvalid={touched.state && !!errors.state}
                  tabIndex={9}
                >
                  <option value="" label="Select state" />
                  {statesList.map((state, index) => (
                    <option key={index} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </Form.Control>
                {touched.state && errors.state && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.state}
                  </div>
                )}
              </InputGroup>
            </div>


            <div className="mb-3">
              <label>
                Select Document Type<span className="text-danger">*</span>
              </label>
              <div>
                {[".pdf", ".docx", ".pdflnk"].map((type) => (
                  <div key={type} className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="filePreference"
                      value={type}
                      onChange={handleChange}
                      checked={values.filePreference.includes(type)}
                    />
                    <label className="form-check-label" htmlFor={type}>
                      {type.toUpperCase()}
                    </label>
                  </div>
                ))}
              </div>
              {touched.filePreference && errors.filePreference && (
                <div className="text-danger">{errors.filePreference}</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
           
            <div className="mb-3">
              <label className="form-label">
                Last Name<span className="text-danger">*</span>
              </label>
              <InputGroup className="mb-3">
                <Form.Control
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  onChange={handleChange}
                  value={values.lastName}
                  isValid={touched.lastName && !errors.lastName}
                  isInvalid={touched.lastName && !!errors.lastName}
                  tabIndex={2}
                />
                {touched.lastName && errors.lastName && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.lastName}
                  </div>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Phone<span className="text-danger">*</span>
              </label>
              <InputGroup className="mb-3">
                <PatternFormat
                  format="+1 (###) ###-####"
                  id="phone"
                  disabled
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  value={values.phone}
                  //isValid={touched.phone && !errors.phone}
                 // isInvalid={touched.phone && !!errors.phone}
                  tabIndex={4}
                  style={{ height: '38px', width: '100%', padding: '10px', fontSize: '16px' }}
                />
                {touched.phone && errors.phone && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.phone}
                  </div>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Address 1<span className="text-danger">*</span>
              </label>
              <InputGroup className="mb-3">
                <Form.Control
                  id="address1"
                  name="address1"
                  type="text"
                  placeholder="Address 1"
                  onChange={handleChange}
                  value={values.address1}
                  isValid={touched.address1 && !errors.address1}
                  isInvalid={touched.address1 && !!errors.address1}
                  tabIndex={6}
                />
                {touched.address1 && errors.address1 && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.address1}
                  </div>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <label className="form-label">
                City<span className="text-danger">*</span>
              </label>
              <InputGroup className="mb-3">
                <Form.Control
                  id="city"
                  name="city"
                  type="text"
                  placeholder="City"
                  onChange={handleChange}
                  value={values.city}
                  isValid={touched.city && !errors.city}
                  isInvalid={touched.city && !!errors.city}
                  tabIndex={8}
                />
                {touched.city && errors.city && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.city}
                  </div>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Country<span className="text-danger">*</span>
              </label>
              <InputGroup className="mb-3">
                <Form.Control
                  as="select"
                  id="country"
                  name="country"
                  onChange={handleChange}
                  value={values.country}
                  isValid={touched.country && !errors.country}
                  isInvalid={touched.country && !!errors.country}
                  tabIndex={10}
                >
                  <option value="" label="Select country" />
                  {countryList.map((state, index) => (
                    <option key={index} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </Form.Control>
                {touched.country && errors.country && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.country}
                  </div>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
              <label htmlFor="logo">Logo</label>
              <InputGroup className="mb-3">
                <Form.Control
                  id="logo"
                  name="logo"
                  type="file"
                  placeholder="Upload Logo"
                  onChange={(event: any) =>
                    setFieldValue("logo", event.currentTarget.files[0])
                  }
                  isInvalid={touched.logo && !!errors.logo}
                />
                {touched.logo && errors.logo && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.logo}
                  </div>
                )}
              </InputGroup>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <Button type="submit" variant="primary" disabled={isAuthLoading}>
            {isAuthLoading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
