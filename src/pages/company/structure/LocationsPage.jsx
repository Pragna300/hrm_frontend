import OrgEntityPage from './OrgEntityPage';

const LocationsPage = () => (
  <OrgEntityPage
    resource="/locations"
    title="Locations"
    subtitle="Office, branch and remote work locations."
    fields={[
      { key: 'name',    label: 'Name' },
      { key: 'address', label: 'Address' },
    ]}
    defaultRow={{ name: '', address: '' }}
  />
);

export default LocationsPage;
