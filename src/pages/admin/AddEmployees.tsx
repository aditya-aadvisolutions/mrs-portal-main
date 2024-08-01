import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { Form, InputGroup } from "react-bootstrap";
import { Checkbox, Select } from "@profabric/react-components";

import { CreateEmployee, RegisterUser, authLogin } from "@app/utils/oidc-providers";
import { setAuthentication } from "@app/store/reducers/auth";
import { Button } from "@app/styles/common";
import "tailwindcss/tailwind.css";
import { countryList } from "@app/constants/countries.constants";
import { statesList } from "@app/constants/states.constants";
import PhoneNumberInput from "react-phone-number-input";
import { PatternFormat } from "react-number-format";
import { managersList } from "@app/constants/manager.constants";
import { roleList } from "@app/constants/role.constants";

const AddEmployees = () => {
  const [t] = useTranslation();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isGoogleAuthLoading, setIsGoogleAuthLoading] = useState(false);
  const [isFacebookAuthLoading, setIsFacebookAuthLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let createdBy = localStorage.getItem("authentication")
    ? JSON.parse(localStorage.getItem("authentication") as string).id
    : "";
  let companyId = localStorage.getItem("authentication")
    ? JSON.parse(localStorage.getItem("authentication") as string).companyId
    : "";
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    loginName: string,
    address1: string,
    address2: string,
    city: string,
    state: string,
    country: string,
    phoneNo: string,
    // filePreference: string,
    createdBy: string,
    companyId: string,
    manager: string,
    role: string
  ) => {
    try {
      setIsAuthLoading(true);
      const numericPhoneNumber = phoneNo.replace(/^\+1|[\D]+/g, '');
      const user = {
        firstName,
        loginName,
        lastName,
        email,
        phoneNo: parseInt(numericPhoneNumber, 10),
        address1,
        address2,
        city,
        state,
        country,
        password,
        // filePreference,
        createdBy,
        companyId,
        manager,
        role
      };

      const response = await CreateEmployee(user);

      toast.success("Registration is success");
      navigate("/employee");
    } catch (error: any) {
      toast.error(error.message || "Failed");
      setIsAuthLoading(false);
    }
  };

  const { handleChange, values, handleSubmit, touched, errors, setFieldValue } =
    useFormik({
      initialValues: {
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
        password: "",
        passwordRetype: "",
        logo: null,
        manager: "",
        role: ""
      },

      validationSchema: Yup.object().shape({
        // First name is required and must be a string
        firstName: Yup.string().required("First Name is a required field"),

        // Middle name is optional and can be any string
        loginName: Yup.string().required("Login Name is a required field"),

        // Last name is required and must be a string
        lastName: Yup.string().required("Last Name is a required field"),

        // Email is required, must be a valid email address, and must be a string
        email: Yup.string()
          .email("Please enter a valid Email address.")
          .required("Email address is a required field"),

        // Phone number is required, must be a string, and must be exactly 10 characters long
        phone: Yup.string()
          .test('phone', 'Invalid phone number. Please enter a valid 10-digit phone number.',
            function (value: any) {
              const phoneRegex = /^\+1 \(\d{3}\) \d{3}-\d{4}$/;
              return phoneRegex.test(value);
            }
          )
          .required("Phone Number is a required field"),

        // Address line 1 is required and must be a string
        address1: Yup.string(),
        // Address line 2 is optional and can be any string
        address2: Yup.string(),

        // City is required and must be a string
        city: Yup.string(),

        // State is required and must be a string
        state: Yup.string(),

        // Country is required and must be a string
        country: Yup.string(),

        // Password is required, must be a string, and must be between 5 and 30 characters long
        password: Yup.string()
          .min(5, "Password must be at least 5 characters long.")
          .max(30, "Password must be at most 30 characters long.")
          .required("Password is a required field"),

        // Password retype is required, must be a string, and must match the password field
        passwordRetype: Yup.string()
          .oneOf([Yup.ref("password")], "Passwords must match.")
          .required("Password retype is a required field"),

        // File preference is required, must be an array, and must have at least one item
        // filePreference: Yup.array()
        //   .min(1, "Select at least one document type.")
        //   .required("File preference is a required field"),

        // Logo is required (commented out for now)
        // logo: Yup.mixed().required('Logo is a required field'),
      }),
      onSubmit: (values) => {
        register(
          values.email,
          values.password,
          values.firstName,
          values.lastName,
          values.loginName,
          values.address1,
          values.address2,
          values.city,
          values.state,
          values.country,
          values.phone,
          createdBy,
          companyId,
          values.manager,
          values.role
        );
      },
    });
  console.log(values);
  return (
    <div className="max-w-4xl mx-auto p-4 border rounded shadow-lg bg-white">
           <div style={{ display: "flex", justifyContent: 'space-between'}}>
        <div className="col-6 ps-0">
          <h2 className="text-2xl font-bold mb-4"><strong>Add Employee</strong></h2>
        </div>
        <div className="col-1.5 text-right">
          <Button onClick={() => navigate("/employee")}>Back</Button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className=" row container border ml-0 mb-3" style={{ width: '100%' }}>
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
              <label className="form-label">
                Role
              </label>
              <InputGroup className="mb-3">
                <Form.Control
                  as="select"
                  id="role"
                  name="role"
                  onChange={handleChange}
                  value={values.role}
                  isValid={touched.role && !errors.role}
                  isInvalid={touched.role && !!errors.role}
                  tabIndex={9}
                >
                  <option value="" label="Select Role" />
                  {roleList.map((role, index) => (
                    <option key={index} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </Form.Control>
                {touched.role && errors.role && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.role}
                  </div>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Address 1
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
                City
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
                Country
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
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  value={values.phone}
                  //isValid={touched.phone && !errors.phone}
                  // isInvalid={touched.phone && !!errors.phone}
                  tabIndex={4}
                  style={{ height: '38px', width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ced4da', borderRadius: '3px' }}
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
                Manager
              </label>
              <InputGroup className="mb-3">
                <Form.Control
                  as="select"
                  id="manager"
                  name="manager"
                  onChange={handleChange}
                  value={values.manager}
                  isValid={touched.manager && !errors.manager}
                  isInvalid={touched.manager && !!errors.manager}
                  tabIndex={9}
                >
                  <option value="" label="Select Manager" />
                  {managersList.map((manager, index) => (
                    <option key={index} value={manager.value}>
                      {manager.label}
                    </option>
                  ))}
                </Form.Control>
                {touched.manager && errors.manager && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.manager}
                  </div>
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
                State
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

        <div className="container border p-3 mb-3" style={{ width: '100%', marginLeft: '0' }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">

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

                <div className="mb-3">
                  <label className="form-label">
                    Confirm Password<span className="text-danger">*</span>
                  </label>
                  <InputGroup className="mb-3">
                    <Form.Control
                      id="passwordRetype"
                      name="passwordRetype"
                      type="password"
                      placeholder="Confirm password"
                      onChange={handleChange}
                      value={values.passwordRetype}
                      isValid={touched.passwordRetype && !errors.passwordRetype}
                      isInvalid={touched.passwordRetype && !!errors.passwordRetype}
                      tabIndex={12}
                    />
                    {touched.passwordRetype && errors.passwordRetype ? (
                      <div
                        className="position-absolute top-100 start-0 text-danger small"
                        style={{ marginTop: "2.30rem" }}
                      >
                        {errors.passwordRetype}
                      </div>
                    ) : (
                      <InputGroup.Append>
                        <InputGroup.Text>
                          <i className="fas fa-lock" />
                        </InputGroup.Text>
                      </InputGroup.Append>
                    )}
                  </InputGroup>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Password<span className="text-danger">*</span>
                  </label>
                  <InputGroup className="mb-3">
                    <Form.Control
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      onChange={handleChange}
                      value={values.password}
                      isValid={touched.password && !errors.password}
                      isInvalid={touched.password && !!errors.password}
                      tabIndex={11}
                    />
                    {touched.password && errors.password ? (
                      <div
                        className="position-absolute top-100 start-0 text-danger small"
                        style={{ marginTop: "2.30rem" }}
                      >
                        {errors.password}
                      </div>
                    ) : (
                      <InputGroup.Append>
                        <InputGroup.Text>
                          <i className="fas fa-lock" />
                        </InputGroup.Text>
                      </InputGroup.Append>
                    )}
                  </InputGroup>
                </div>


              </div>


            </div>
          </form>
        </div>


        <div className="row">
          <div className="col-3">
            <div className="mb-3">
              <Button
                loading={isAuthLoading}
                disabled={isGoogleAuthLoading || isFacebookAuthLoading}
                onClick={handleSubmit as any}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEmployees;
