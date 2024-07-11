import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { Form, InputGroup } from "react-bootstrap";
import { Checkbox, Select } from "@profabric/react-components";

import { RegisterUser, authLogin } from "@app/utils/oidc-providers";
import { setAuthentication } from "@app/store/reducers/auth";
import { Button } from "@app/styles/common";
import "tailwindcss/tailwind.css";
import { countryList } from "@app/constants/countries.constants";
import { statesList } from "@app/constants/states.constants";
import PhoneNumberInput from 'react-phone-number-input';

const RegistrationForm = () => {
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
    middleName: string,
    address1: string,
    address2: string,
    city: string,
    state: string,
    country: string,
    phoneNo: number,
    filePreference: string,
    createdBy: string,
    companyId: string
  ) => {
    try {
      setIsAuthLoading(true);

      const user = {
        firstName,
        middleName,
        lastName,
        email,
        phoneNo,
        address1,
        address2,
        city,
        state,
        country,
        password,
        filePreference,
        createdBy,
        companyId,
      };

      const response = await RegisterUser(user);

      toast.success("Registration is success");
      navigate("/client-list");
    } catch (error: any) {
      toast.error(error.message || "Failed");
      setIsAuthLoading(false);
    }
  };

  const { handleChange, values, handleSubmit, touched, errors, setFieldValue } =
    useFormik({
      initialValues: {
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: 0,
        address1: "",
        address2: "",
        city: "",
        state: "",
        country: "",
        password: "",
        passwordRetype: "",
        filePreference: "",
        logo: null,
      },

      validationSchema: Yup.object({
        firstName: Yup.string().required("Please enter first name"),
        middleName: Yup.string(),
        lastName: Yup.string().required("Please enter last name"),
        email: Yup.string()
          .email("Invalid email address")
          .required("plaese enter valid email"),
        phone: Yup.string()
          .length(10, "Invalid Number")
          .required("Please enter your phone number"),
        address1: Yup.string().required("please enter address"),
        address2: Yup.string(),
        city: Yup.string().required("please enter city"),
        state: Yup.string().required("please enter state"),
        country: Yup.string().required("please enter country"),
        password: Yup.string()
          .min(5, "Must be 5 characters or more")
          .max(30, "Must be 30 characters or less")
          .required("Required"),
        passwordRetype: Yup.string()
          .oneOf([Yup.ref("password")], "Passwords must match")
          .required("Required"),
        filePreference: Yup.array()
          .min(1, "Select at least one document type")
          .required("Select at least one document type"),
        // logo: Yup.mixed().required("Required"),
      }),
      onSubmit: (values) => {
        register(
          values.email,
          values.password,
          values.firstName,
          values.lastName,
          values.middleName,
          values.address1,
          values.address2,
          values.city,
          values.country,
          values.state,
          values.phone,
          values.filePreference,
          createdBy,
          companyId
        );
      },
    });
  console.log(values);
  return (
    <div className="max-w-4xl mx-auto p-4 border rounded shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Add Client</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
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
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName}
                  </Form.Control.Feedback>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
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
                  tabIndex={3}
                />
                {touched.lastName && errors.lastName && (
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName}
                  </Form.Control.Feedback>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
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
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
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
              <InputGroup className="mb-3">
                <Form.Control
                  as="select"
                  id="state"
                  name="state"
                  onChange={handleChange}
                  value={values.state}
                  isValid={touched.state && !errors.state}
                  isInvalid={touched.state && !!errors.state}
                  tabIndex={7}
                >
                  <option value="" label="Select state" />
                  {statesList.map((state, index) => (
                    <option key={index} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </Form.Control>
                {touched.state && errors.state && (
                  <Form.Control.Feedback type="invalid">
                    {errors.state}
                  </Form.Control.Feedback>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
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
                  tabIndex={9}
                />
                {touched.address1 && errors.address1 && (
                  <Form.Control.Feedback type="invalid">
                    {errors.address1}
                  </Form.Control.Feedback>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
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
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-lock" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
              <label>Select document type:</label>
              <div>
                {["pdf", "doc", "link"].map((type) => (
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
              <InputGroup className="mb-3">
                <Form.Control
                  id="middleName"
                  name="middleName"
                  type="text"
                  placeholder="Middle Name"
                  onChange={handleChange}
                  value={values.middleName}
                  isValid={touched.middleName && !errors.middleName}
                  isInvalid={touched.middleName && !!errors.middleName}
                  tabIndex={2}
                />
                {touched.middleName && errors.middleName && (
                  <Form.Control.Feedback type="invalid">
                    {errors.middleName}
                  </Form.Control.Feedback>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="Phone"
                  onChange={handleChange}
                  value={values.phone}
                  isValid={touched.phone && !errors.phone}
                  isInvalid={touched.phone && !!errors.phone}
                  tabIndex={4}
                />
                {touched.phone && errors.phone && (
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
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
                  tabIndex={6}
                />
                {touched.city && errors.city && (
                  <Form.Control.Feedback type="invalid">
                    {errors.city}
                  </Form.Control.Feedback>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  as="select"
                  id="country"
                  name="country"
                  onChange={handleChange}
                  value={values.country}
                  isValid={touched.country && !errors.country}
                  isInvalid={touched.country && !!errors.country}
                  tabIndex={7}
                >
                  <option value="" label="Select country" />
                  {countryList.map((state, index) => (
                    <option key={index} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </Form.Control>
                {touched.country && errors.country && (
                  <Form.Control.Feedback type="invalid">
                    {errors.country}
                  </Form.Control.Feedback>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
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
                  tabIndex={10}
                />
                {touched.address2 && errors.address2 && (
                  <Form.Control.Feedback type="invalid">
                    {errors.address2}
                  </Form.Control.Feedback>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="passwordRetype"
                  name="passwordRetype"
                  type="password"
                  placeholder="Retype password"
                  onChange={handleChange}
                  value={values.passwordRetype}
                  isValid={touched.passwordRetype && !errors.passwordRetype}
                  isInvalid={touched.passwordRetype && !!errors.passwordRetype}
                  tabIndex={12}
                />
                {touched.passwordRetype && errors.passwordRetype ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.passwordRetype}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-lock" />
                    </InputGroup.Text>
                  </InputGroup.Append>
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
                  <Form.Control.Feedback type="invalid">
                    {errors.logo}
                  </Form.Control.Feedback>
                )}
              </InputGroup>
            </div>
          </div>
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

export default RegistrationForm;
