import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Form, InputGroup, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { countryList } from "@app/constants/countries.constants";
import { statesList } from "@app/constants/states.constants";
import { PatternFormat } from "react-number-format";

import ApiService from "@app/services/Api.service";

import { formatNumber, Updateemployee, updateUserDetails } from "@app/utils/oidc-providers"; // Adjust the import according to your API setup
import { useNavigate } from "react-router-dom";
import { managersList } from "@app/constants/manager.constants";
import { roleList } from "@app/constants/role.constants";


const EmployeeProfileTab = ({
  isActive,
  userId,
}: {
  isActive: boolean;
  userId: string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    loginName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    logo: null,
    manager: "",
    role: "",
    isActive:'',
  });

  const modifyedBy = localStorage.getItem("authentication")
    ? JSON.parse(localStorage.getItem("authentication") as string).id
    : "";

  const userprofileId = localStorage.getItem("authentication")
    ? JSON.parse(localStorage.getItem("authentication") as string).id
    : "";

  const Role = localStorage.getItem("authentication")
    ? JSON.parse(localStorage.getItem("authentication") as string).roleName
    : "";
  const validationSchema = Yup.object().shape({
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
    phoneNo: Yup.string()
      .test(
        "phoneNo",
        "Invalid phoneNo number. Please enter a valid 10-digit phoneNo number.",
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
  });
  
  const { handleChange, values, handleSubmit, touched, errors, setFieldValue } =
    useFormik({
      initialValues,
      validationSchema,
      enableReinitialize: true,
      onSubmit: async (values) => {
        try {
          setIsAuthLoading(true);
          const numericPhoneNumber = values.phoneNo.replace(/^\+1|[\D]+/g, "");
          if (Role === "Admin") {
            const updatedUser = {
              ...values,
              modifyedBy: modifyedBy,
              userId: userId,
              phoneNo: parseInt(numericPhoneNumber, 10),
            };
            await Updateemployee(updatedUser);
          } else if(Role === "Employee") {
            const updatedUser = {
              ...values,
              modifyedBy: modifyedBy,
              userId: userprofileId,
              phoneNo: parseInt(numericPhoneNumber, 10),
            };
            await Updateemployee(updatedUser);
          }
          // Adjust according to your API call
          toast.success("Profile updated successfully.");
          navigate("/employee");
        } catch (error: any) {
          toast.error(error.message || "Failed to update profile.");
        } finally {
          setIsAuthLoading(false);
        }
      },
    });
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await ApiService.requests.get(
          `employee/employeedata?userId=${userId}`
        );
        if (response) {
          setInitialValues({
            firstName: response.User.FirstName,
            loginName: response.User.LoginName, // Set this if applicable
            lastName: response.User.LastName,
            email: response.User.Email,
            phoneNo: formatNumber(response.User.PhoneNo),
            address1: response.Address1,
            address2: response.Address2,
            city: response.City,
            state: response.State || "", // Adjust if necessary
            country: response.Country || "", // Adjust if necessary
            logo: null, // Handle file uploads if necessary
            manager: response.Manager,
            role: response.Role,
            isActive:response.IsActive
          });
        }
      } catch (error) {
        toast.error("Failed to fetch user details.");
      }
    };
    const fetchDetails = async () => {
      try {
        const response = await ApiService.requests.get(
          `employee/employeedata?userId=${userprofileId}`
        );
        if (response) {
          setInitialValues({
            firstName: response.User.FirstName,
            loginName: response.User.LoginName, // Set this if applicable
            lastName: response.User.LastName,
            email: response.User.Email,
            phoneNo: formatNumber(response.User.PhoneNo),
            address1: response.Address1,
            address2: response.Address2,
            city: response.City,
            state: response.State || "", // Adjust if necessary
            country: response.Country || "", // Adjust if necessary
            logo: null, // Handle file uploads if necessary
            manager: response.Manager,
            role: response.Role,
            isActive:response.IsActive
          });
        }
      } catch (error) {
        toast.error("Failed to fetch user details.");
      }
    };

    if (userId && Role === "Admin") {
      fetchUserDetails();
    } else if (Role === "Employee") {
      fetchDetails();
    }
  }, [userId]);

  const handleIsActive = [
    {
      label: "Active",
      value: true,
    },
    {
      label: "Inactive",
      value: false,
    },
  ];
  console.log(values, "values");
  return (
    <div className="">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="col-6 ps-0">
          <h2 className="text-2xl font-bold mb-4"><i className="fa fa-arrow-left pointer ml-1 mr-2" style={{fontSize:"26px"}} onClick={() => navigate("/employee")} aria-hidden="true"></i><strong> Employee Profile</strong></h2>
        </div>
        <InputGroup className="mb-3" style={{ width: "30%" }}>
        <Form.Control
          as="select"
          id="isActive"
          name="isActive"
          onChange={handleChange}
          value={values.isActive}
          isValid={touched.isActive && !errors.isActive}
          isInvalid={touched.isActive && !!errors.isActive}
          tabIndex={9}
        >
          {handleIsActive.map((status, index) => (
            <option key={index} value={status.value as any}>
              {status.label}
            </option>
          ))}
        </Form.Control>
      </InputGroup>
      </div>
      <form onSubmit={handleSubmit}>
        <div className=" row container mb-3" style={{ width: "100%" }}>
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
                Login Name<span className="text-danger">*</span>
              </label>
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
                  disabled
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
              <label className="form-label">Role</label>
              <InputGroup className="mb-3">
                <Form.Control
                  as="select"
                  id="role"
                  name="role"
                  onChange={handleChange}
                  value={values.role}
                  isValid={touched.role && !errors.role}
                  isInvalid={touched.role && !!errors.role}
                  tabIndex={7}
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
                  tabIndex={9}
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
              <label className="form-label">State</label>
              <InputGroup className="mb-3">
                <Form.Control
                  as="select"
                  id="state"
                  name="state"
                  onChange={handleChange}
                  value={values.state}
                  isValid={touched.state && !errors.state}
                  isInvalid={touched.state && !!errors.state}
                  tabIndex={11}
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
                  tabIndex={13}
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
                  id="phoneNo"
                  name="phoneNo"
                  type="tel"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  value={values.phoneNo}
                  disabled
                  //isValid={touched.phoneNo && !errors.phoneNo}
                  // isInvalid={touched.phoneNo && !!errors.phoneNo}
                  tabIndex={4}
                  style={{
                    height: "38px",
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    border: "1px solid #ced4da",
                    borderRadius: "3px",
                  }}
                />
                {touched.phoneNo && errors.phoneNo && (
                  <div
                    className="position-absolute top-100 start-0 text-danger small"
                    style={{ marginTop: "2.30rem" }}
                  >
                    {errors.phoneNo}
                  </div>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
              <label className="form-label">Manager</label>
              <InputGroup className="mb-3">
                <Form.Control
                  as="select"
                  id="manager"
                  name="manager"
                  onChange={handleChange}
                  value={values.manager}
                  isValid={touched.manager && !errors.manager}
                  isInvalid={touched.manager && !!errors.manager}
                  tabIndex={6}
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
              <label className="form-label">Address 1</label>
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
                  tabIndex={8}
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
              <label className="form-label">City</label>
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
                  tabIndex={10}
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
              <label className="form-label">Country</label>
              <InputGroup className="mb-3">
                <Form.Control
                  as="select"
                  id="country"
                  name="country"
                  onChange={handleChange}
                  value={values.country}
                  isValid={touched.country && !errors.country}
                  isInvalid={touched.country && !!errors.country}
                  tabIndex={12}
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
        </div>

        <div className="d-flex justify-content-end">
          <Button type="submit" variant="primary" disabled={isAuthLoading} tabIndex={14}>
           <strong> {isAuthLoading ? "Updating..." : "Update"}</strong>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeProfileTab;
