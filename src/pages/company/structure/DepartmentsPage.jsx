import OrgEntityPage from './OrgEntityPage';

const DepartmentsPage = () => (
  <OrgEntityPage
    resource="/departments"
    title="Departments"
    subtitle="Group your workforce by function or business unit."
    fields={[
      { key: 'name', label: 'Name' },
    ]}
    defaultRow={{ name: '' }}
  />
);

export default DepartmentsPage;
