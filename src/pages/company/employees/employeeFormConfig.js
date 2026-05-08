export const emptyEmployeeForm = {
  email: '',
  password: '',
  role: 'employee',
  employeeCode: '',
  firstName: '',
  lastName: '',
  designation: '',
  workEmail: '',
  workPhone: '',
  personalEmail: '',
  personalPhone: '',
  emergencyName: '',
  emergencyPhone: '',
  departmentId: '',
  locationId: '',
  shiftId: '',
  managerId: '',
  employmentType: 'full_time',
  employmentStatus: 'active',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  dateHired: '',
  contractedHoursPerWeek: '40',
  fte: '1',
  monthlyCtc: '0',
  bankName: '',
  bankIfsc: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  profilePhotoUrl: '',
};

export function mapEmployeeToForm(employee) {
  return {
    ...emptyEmployeeForm,
    email: employee.user?.email || '',
    role: employee.user?.role || 'employee',
    employeeCode: employee.employeeCode || '',
    firstName: employee.firstName || '',
    lastName: employee.lastName || '',
    designation: employee.designation || '',
    workEmail: employee.workEmail || '',
    workPhone: employee.workPhone || '',
    personalEmail: employee.personalEmail || '',
    personalPhone: employee.personalPhone || '',
    emergencyName: employee.emergencyName || '',
    emergencyPhone: employee.emergencyPhone || '',
    departmentId: employee.departmentId?.toString() || '',
    locationId: employee.locationId?.toString() || '',
    shiftId: employee.shiftId?.toString() || '',
    managerId: employee.managerId?.toString() || '',
    employmentType: employee.employmentType || 'full_time',
    employmentStatus: employee.employmentStatus || 'active',
    dateOfBirth: employee.dateOfBirth ? String(employee.dateOfBirth).slice(0, 10) : '',
    gender: employee.gender || '',
    bloodGroup: employee.bloodGroup || '',
    dateHired: employee.dateHired ? String(employee.dateHired).slice(0, 10) : '',
    contractedHoursPerWeek: employee.contractedHoursPerWeek?.toString() || '40',
    fte: employee.fte?.toString() || '1',
    monthlyCtc: employee.monthlyCtc?.toString() || '0',
    bankName: employee.bankName || '',
    bankIfsc: employee.bankIfsc || '',
    addressLine1: employee.addressLine1 || '',
    city: employee.city || '',
    state: employee.state || '',
    postalCode: employee.postalCode || '',
    country: employee.country || 'India',
    profilePhotoUrl: employee.profilePhotoUrl || '',
  };
}

export function buildPayload(form, isEdit) {
  const payload = { ...form };
  if (isEdit && !payload.password) delete payload.password;
  if (isEdit) delete payload.email; // email change handled separately if ever needed
  if (!isEdit && !payload.password) {
    payload.password = `Welcome${Math.floor(Math.random() * 9000 + 1000)}!`;
  }
  for (const key of Object.keys(payload)) {
    if (payload[key] === '' || payload[key] === null) delete payload[key];
  }
  return payload;
}

export const FIELD_GROUPS = [
  {
    title: 'Account',
    fields: [
      { key: 'email', label: 'Login Email', type: 'email', requiredOnCreate: true },
      { key: 'password', label: 'Password', type: 'password', helpEdit: 'Leave blank to keep current password' },
      { key: 'role', label: 'Role', type: 'select', options: [
        { value: 'employee', label: 'Employee' },
        { value: 'team_lead', label: 'Team Lead' },
        { value: 'hr', label: 'HR' },
      ]},
    ],
  },
  {
    title: 'Identity',
    fields: [
      { key: 'firstName', label: 'First Name', requiredOnCreate: true },
      { key: 'lastName',  label: 'Last Name',  requiredOnCreate: true },
      { key: 'employeeCode', label: 'Employee Code (optional)' },
      { key: 'designation', label: 'Designation' },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { key: 'gender', label: 'Gender' },
      { key: 'bloodGroup', label: 'Blood Group' },
    ],
  },
  {
    title: 'Contact',
    fields: [
      { key: 'workEmail', label: 'Work Email' },
      { key: 'workPhone', label: 'Work Phone' },
      { key: 'personalEmail', label: 'Personal Email' },
      { key: 'personalPhone', label: 'Personal Phone' },
      { key: 'emergencyName', label: 'Emergency Contact Name' },
      { key: 'emergencyPhone', label: 'Emergency Contact Phone' },
    ],
  },
  {
    title: 'Job',
    fields: [
      { key: 'departmentId', label: 'Department', type: 'option', source: 'departments' },
      { key: 'locationId',   label: 'Location',   type: 'option', source: 'locations' },
      { key: 'shiftId',      label: 'Shift',      type: 'option', source: 'shifts' },
      { key: 'managerId',    label: 'Reports To', type: 'option', source: 'employees' },
      { key: 'employmentType',  label: 'Employment Type' },
      { key: 'employmentStatus', label: 'Status' },
      { key: 'dateHired', label: 'Date Hired', type: 'date' },
      { key: 'contractedHoursPerWeek', label: 'Hours/Week' },
      { key: 'fte', label: 'FTE' },
      { key: 'monthlyCtc', label: 'Monthly CTC', type: 'number' },
    ],
  },
  {
    title: 'Bank & Address',
    fields: [
      { key: 'bankName', label: 'Bank Name' },
      { key: 'bankIfsc', label: 'Bank IFSC' },
      { key: 'addressLine1', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'postalCode', label: 'Postal Code' },
      { key: 'country', label: 'Country' },
    ],
  },
];
