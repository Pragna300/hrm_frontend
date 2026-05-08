import OrgEntityPage from './OrgEntityPage';

const ShiftsPage = () => (
  <OrgEntityPage
    resource="/shifts"
    title="Shifts"
    subtitle="Define work shifts (timezone-aware, comma-separated work days)."
    fields={[
      { key: 'name',      label: 'Name' },
      { key: 'startTime', label: 'Start Time (HH:MM)', type: 'time' },
      { key: 'endTime',   label: 'End Time (HH:MM)',   type: 'time' },
      { key: 'workDays',  label: 'Work Days (Mon,Tue,Wed,Thu,Fri)' },
    ]}
    defaultRow={{ name: '', startTime: '09:00', endTime: '18:00', workDays: 'Mon,Tue,Wed,Thu,Fri' }}
  />
);

export default ShiftsPage;
